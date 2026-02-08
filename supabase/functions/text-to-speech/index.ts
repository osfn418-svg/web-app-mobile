import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { encode as base64Encode } from "https://deno.land/std@0.168.0/encoding/base64.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

type GenerateBody = {
  action?: "generate";
  text?: string;
  voice?: string;
  speed?: number;
};

type CheckBody = {
  action: "check";
  audioUrl: string;
};

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

// Retry fetching audio from CDN with internal polling (up to 15s only)
async function waitForAudio(audioUrl: string, maxMs = 15000): Promise<
  | { status: "completed"; audioData: string }
  | { status: "pending" }
  | { status: "failed"; error: string }
> {
  const startTime = Date.now();
  // Retry every 1.5 seconds for up to 15 seconds
  const retryIntervalMs = 1500;
  const maxRetries = Math.floor(maxMs / retryIntervalMs);
  for (let i = 0; i < maxRetries && Date.now() - startTime < maxMs; i++) {
    if (i > 0) await sleep(retryIntervalMs);
    
    try {
      const resp = await fetch(audioUrl, {
        redirect: "follow",
        headers: {
          "User-Agent": "Mozilla/5.0 (compatible; LovableCloud/1.0)",
          "Cache-Control": "no-cache",
        },
      });

      if (resp.ok) {
        const audioBuffer = await resp.arrayBuffer();
        const base64Audio = base64Encode(new Uint8Array(audioBuffer));
        return { status: "completed", audioData: base64Audio };
      }

      if (resp.status !== 404) {
        const errorText = await resp.text().catch(() => "");
        return { status: "failed", error: `HTTP ${resp.status}: ${errorText.slice(0, 200)}` };
      }
      // 404 means still propagating, continue polling
    } catch (e) {
      console.error("Fetch error:", e);
    }
  }
  
  return { status: "pending" };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = (await req.json()) as GenerateBody | CheckBody;

    // --- CHECK action: poll for audio readiness ---
    if ((body as CheckBody).action === "check") {
      const { audioUrl } = body as CheckBody;
      if (!audioUrl) {
        return new Response(JSON.stringify({ error: "audioUrl مطلوب" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const fetched = await waitForAudio(audioUrl, 10000); // 10s internal check

      if (fetched.status === "completed") {
        return new Response(
          JSON.stringify({
            success: true,
            status: "completed",
            audioData: fetched.audioData,
            format: "mp3",
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      if (fetched.status === "failed") {
        return new Response(
          JSON.stringify({
            success: true,
            status: "failed",
            error: fetched.error,
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({
          success: true,
          status: "pending",
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // --- GENERATE action ---
    const AIML_API_KEY = Deno.env.get("AIML_API_KEY");

    if (!AIML_API_KEY) {
      throw new Error("AIML_API_KEY is not configured");
    }

    const { text, voice, speed } = body as GenerateBody;

    if (!text || text.trim().length === 0) {
      return new Response(JSON.stringify({ error: "النص مطلوب" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log("Generating TTS via AIML API for text:", text.substring(0, 50) + "...");

    const ttsResp = await fetch("https://api.aimlapi.com/v1/tts", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${AIML_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "openai/tts-1",
        text: text.trim(),
        voice: voice || "alloy",
        speed: typeof speed === "number" ? speed : 1.0,
        response_format: "mp3",
      }),
    });

    if (!ttsResp.ok) {
      const errorText = await ttsResp.text().catch(() => "");
      console.error("AIML TTS error:", ttsResp.status, errorText);

      if (ttsResp.status === 429) {
        return new Response(JSON.stringify({ error: "تم تجاوز حد الاستخدام، حاول لاحقاً" }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      return new Response(
        JSON.stringify({ error: "خطأ في تحويل النص إلى صوت", details: errorText.slice(0, 600) }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const ttsJson = await ttsResp.json();
    const audioUrl = ttsJson.audio?.url as string | undefined;

    if (!audioUrl) {
      console.error("No audio URL in response:", JSON.stringify(ttsJson));
      return new Response(JSON.stringify({ error: "لم يتم استلام رابط الصوت" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Wait for audio to be ready (internal polling)
    const result = await waitForAudio(audioUrl);

    if (result.status === "completed") {
      return new Response(
        JSON.stringify({
          success: true,
          status: "completed",
          audioData: result.audioData,
          format: "mp3",
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (result.status === "failed") {
      return new Response(
        JSON.stringify({ error: result.error }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Still pending - return URL for client to poll
    return new Response(
      JSON.stringify({
        success: true,
        status: "pending",
        audioUrl,
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