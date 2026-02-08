import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const formData = await req.formData();
    const audioFile = formData.get("audio") as File | null;
    const language = formData.get("language") as string || "ar";

    const AIML_API_KEY = Deno.env.get("AIML_API_KEY");

    if (!AIML_API_KEY) {
      throw new Error("AIML_API_KEY is not configured");
    }

    if (!audioFile) {
      return new Response(JSON.stringify({ error: "الملف الصوتي مطلوب" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log("Transcribing audio file:", audioFile.name, audioFile.size, "bytes");

    // Use AIML Whisper API for speech-to-text
    const apiFormData = new FormData();
    apiFormData.append("file", audioFile);
    apiFormData.append("model", "whisper-large-v3");
    apiFormData.append("language", language);

    const response = await fetch("https://api.aimlapi.com/v1/audio/transcriptions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${AIML_API_KEY}`,
      },
      body: apiFormData,
    });

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
    console.log("Transcription result:", result);

    return new Response(
      JSON.stringify({
        success: true,
        text: result.text || "",
        language: result.language || language,
      }),
      {
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
