import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { encode as base64Encode } from "https://deno.land/std@0.168.0/encoding/base64.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Map from OpenAI-style voice names to ElevenLabs voice IDs
const voiceMapping: Record<string, string> = {
  alloy: "JBFqnCBsd6RMkjVDRZzb",   // George
  echo: "TX3LPaxmHKxFdv7VOQHJ",    // Liam
  fable: "onwK4e9ZLuTAKqWW03F9",   // Daniel
  onyx: "N2lVS1w4EtoT3dr4eOWO",    // Callum
  nova: "XrExE9yKIg1WjnnlVkGX",    // Matilda
  shimmer: "EXAVITQu4vr4xnSDxMaL", // Sarah
};

type GenerateBody = {
  action?: "generate";
  text?: string;
  voice?: string;
  speed?: number;
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = (await req.json()) as GenerateBody;
    const ELEVENLABS_API_KEY = Deno.env.get("ELEVENLABS_API_KEY");

    if (!ELEVENLABS_API_KEY) {
      throw new Error("ELEVENLABS_API_KEY is not configured");
    }

    const { text, voice, speed } = body;

    if (!text || text.trim().length === 0) {
      return new Response(JSON.stringify({ error: "النص مطلوب" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const voiceId = voiceMapping[voice || "alloy"] || voiceMapping.alloy;

    console.log("Generating TTS via ElevenLabs for text:", text.substring(0, 50) + "...");

    const ttsResp = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?output_format=mp3_44100_128`,
      {
        method: "POST",
        headers: {
          "xi-api-key": ELEVENLABS_API_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: text.trim(),
          model_id: "eleven_turbo_v2_5",
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
            speed: typeof speed === "number" ? Math.min(Math.max(speed, 0.7), 1.2) : 1.0,
          },
        }),
      }
    );

    if (!ttsResp.ok) {
      const errorText = await ttsResp.text().catch(() => "");
      console.error("ElevenLabs TTS error:", ttsResp.status, errorText);

      if (ttsResp.status === 429) {
        return new Response(JSON.stringify({ error: "تم تجاوز حد الاستخدام، حاول لاحقاً" }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      if (ttsResp.status === 401) {
        return new Response(
          JSON.stringify({ error: "غير مصرح (401) — تحقق من مفتاح ElevenLabs" }),
          { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({ error: "خطأ في تحويل النص إلى صوت", details: errorText.slice(0, 600) }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ElevenLabs returns audio binary directly
    const audioBuffer = await ttsResp.arrayBuffer();
    const base64Audio = base64Encode(new Uint8Array(audioBuffer));

    return new Response(
      JSON.stringify({
        success: true,
        status: "completed",
        audioData: base64Audio,
        format: "mp3",
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("TTS error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "خطأ غير معروف" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
