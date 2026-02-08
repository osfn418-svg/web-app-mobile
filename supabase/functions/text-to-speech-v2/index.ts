import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { encode as base64Encode } from "https://deno.land/std@0.168.0/encoding/base64.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { text, voice, speed } = await req.json();
    const AIML_API_KEY = Deno.env.get("AIML_API_KEY");

    if (!AIML_API_KEY) {
      throw new Error("AIML_API_KEY is not configured");
    }

    if (!text || text.trim().length === 0) {
      return new Response(JSON.stringify({ error: "النص مطلوب" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 1) Ask AIML to generate TTS and return a URL
    const ttsResp = await fetch("https://api.aimlapi.com/v1/tts", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${AIML_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "openai/tts-1",
        text: text,
        voice: voice || "alloy",
        // AIML follows OpenAI-compatible params; keep it optional
        speed: typeof speed === "number" ? speed : undefined,
      }),
    });

    if (!ttsResp.ok) {
      const errorText = await ttsResp.text();
      console.error("AIML TTS error:", ttsResp.status, errorText);

      if (ttsResp.status === 429) {
        return new Response(JSON.stringify({ error: "تم تجاوز حد الاستخدام" }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      return new Response(JSON.stringify({ error: "خطأ في تحويل النص إلى صوت" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const ttsJson = await ttsResp.json();
    const audioUrl = ttsJson.audio?.url;

    if (!audioUrl) {
      console.error("No audio URL in response:", JSON.stringify(ttsJson));
      return new Response(JSON.stringify({ error: "لم يتم استلام رابط الصوت" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 2) Fetch the audio bytes server-side and return base64 so browser playback always works
    const audioResp = await fetch(audioUrl);
    if (!audioResp.ok) {
      const t = await audioResp.text();
      console.error("Failed to fetch audio bytes:", audioResp.status, t);
      return new Response(JSON.stringify({ error: "تعذر تحميل ملف الصوت" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const audioBuffer = await audioResp.arrayBuffer();
    const base64Audio = base64Encode(audioBuffer);

    return new Response(
      JSON.stringify({
        success: true,
        audioData: base64Audio,
        format: "mp3",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (e) {
    console.error("TTS v2 error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "خطأ غير معروف" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
