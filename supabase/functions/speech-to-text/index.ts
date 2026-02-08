import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { validateAuth, unauthorizedResponse, corsHeaders } from "../_shared/auth.ts";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Validate authentication
  const { user, error: authError } = await validateAuth(req);
  if (authError || !user) {
    return unauthorizedResponse(authError || "غير مصرح");
  }

  try {
    const AIML_API_KEY = Deno.env.get("AIML_API_KEY");

    if (!AIML_API_KEY) {
      throw new Error("AIML_API_KEY is not configured");
    }

    const contentType = req.headers.get("content-type") || "";
    
    // Handle check action (JSON body)
    if (contentType.includes("application/json")) {
      const body = await req.json();
      
      if (body.action === "check" && body.generationId) {
        console.log("Checking STT status for user:", user.id, "generationId:", body.generationId);
        
        const response = await fetch(`https://api.aimlapi.com/v1/stt/${body.generationId}`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${AIML_API_KEY}`,
          },
        });

        const data = await response.json();
        console.log("STT status response:", JSON.stringify(data));

        // Parse response
        if (data.status === "completed" && data.text) {
          return new Response(
            JSON.stringify({
              success: true,
              status: "completed",
              text: data.text,
              language: data.language || "unknown",
            }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        if (data.status === "failed" || data.status === "error") {
          return new Response(
            JSON.stringify({
              success: true,
              status: "failed",
              error: data.error || "فشل في تحويل الصوت",
            }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        return new Response(
          JSON.stringify({
            success: true,
            status: data.status || "processing",
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // Handle file upload (FormData)
    const formData = await req.formData();
    const audioFile = formData.get("audio") as File | null;
    const language = (formData.get("language") as string) || "ar";

    if (!audioFile) {
      return new Response(JSON.stringify({ error: "الملف الصوتي مطلوب" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log("Transcribing audio for user:", user.id, "file:", audioFile.name, audioFile.size, "bytes");

    // Step 1: Upload file and get a URL (we'll use base64 data URL approach)
    // First, let's try with the file directly
    const audioBytes = await audioFile.arrayBuffer();
    const audioBase64 = btoa(
      new Uint8Array(audioBytes).reduce((data, byte) => data + String.fromCharCode(byte), "")
    );
    
    // Create a data URL
    const mimeType = audioFile.type || "audio/webm";
    const dataUrl = `data:${mimeType};base64,${audioBase64}`;

    // AIML API requires a URL, so we need to use their create endpoint with URL
    // Since we can't host the file, let's try with the newer Whisper endpoint format
    
    // Try using the synchronous endpoint first
    const apiFormData = new FormData();
    apiFormData.append("file", audioFile);
    apiFormData.append("model", "#g1_whisper-large");
    
    // Try v2 endpoint which might support file upload
    let response = await fetch("https://api.aimlapi.com/v2/audio/transcriptions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${AIML_API_KEY}`,
      },
      body: apiFormData,
    });

    // If v2 fails, try v1/stt with URL approach (need external hosting)
    if (!response.ok) {
      console.log("v2 endpoint failed, trying stt/create with base64...");
      
      // Try the stt/create endpoint - it requires a URL
      // Since we don't have external hosting, let's try another approach
      response = await fetch("https://api.aimlapi.com/stt", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${AIML_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "#g1_whisper-large",
          audio: audioBase64,
          language: language,
        }),
      });
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AIML STT error:", response.status, errorText);

      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "تم تجاوز حد الاستخدام" }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      return new Response(JSON.stringify({ error: "خطأ في تحويل الصوت إلى نص" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const result = await response.json();
    console.log("STT result:", JSON.stringify(result));

    // Check if we got immediate result or generation_id for polling
    if (result.text) {
      return new Response(
        JSON.stringify({
          success: true,
          status: "completed",
          text: result.text,
          language: result.language || language,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (result.generation_id || result.id) {
      return new Response(
        JSON.stringify({
          success: true,
          status: "processing",
          generationId: result.generation_id || result.id,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ error: "لم يتم استلام نتيجة من الخادم" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (e) {
    console.error("STT error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "خطأ غير معروف" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
