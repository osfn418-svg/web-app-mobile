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

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

// Retry fetching audio from CDN for up to 20 seconds inside the edge function
async function waitForAudio(audioUrl: string, maxMs = 20000): Promise<
  | { status: "completed"; audioData: string }
  | { status: "failed"; message: string }
> {
  const startTime = Date.now();
  const retryDelays = [0, 500, 1000, 1500, 2000, 2500, 3000, 4000, 5000];
  let delayIdx = 0;

  while (Date.now() - startTime < maxMs) {
    if (retryDelays[delayIdx]) await sleep(retryDelays[delayIdx]);
    delayIdx = Math.min(delayIdx + 1, retryDelays.length - 1);

    try {
      const resp = await fetch(audioUrl, {
        redirect: "follow",
        headers: {
          "User-Agent": "Mozilla/5.0 (compatible; LovableCloud/1.0)",
          Accept: "audio/mpeg,audio/*;q=0.9,*/*;q=0.8",
          "Cache-Control": "no-cache",
          Pragma: "no-cache",
        },
      });

      if (resp.ok) {
        const audioBuffer = await resp.arrayBuffer();
        const base64Audio = base64Encode(new Uint8Array(audioBuffer));
        return { status: "completed", audioData: base64Audio };
      }

      // Keep polling on 404
      if (resp.status === 404) {
        await resp.text().catch(() => {});
        continue;
      }

      // Other errors: fail
      const errBody = await resp.text().catch(() => "");
      return { status: "failed", message: `HTTP ${resp.status}: ${errBody.slice(0, 300)}` };
    } catch (e) {
      return { status: "failed", message: e instanceof Error ? e.message : String(e) };
    }
  }

  return { status: "failed", message: "انتهى وقت الانتظار — الملف لم يصل للخادم" };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = (await req.json()) as GenerateBody;
    const AIML_API_KEY = Deno.env.get("AIML_API_KEY");

    if (!AIML_API_KEY) {
      throw new Error("AIML_API_KEY is not configured");
    }

    const { text, voice, speed } = body;

    if (!text || text.trim().length === 0) {
      return new Response(JSON.stringify({ error: "النص مطلوب" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log("Generating TTS for text:", text.substring(0, 50) + "...");

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
        speed: typeof speed === "number" ? speed : 1,
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

      if (ttsResp.status === 402) {
        return new Response(JSON.stringify({ error: "يرجى إضافة رصيد لحسابك" }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      if (ttsResp.status === 403) {
        return new Response(
          JSON.stringify({ error: "حد المفتاح (403) — تحديث المفتاح أو زيادة الحصة", details: errorText.slice(0, 600) }),
          { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({ error: "خطأ في تحويل النص إلى صوت", details: errorText.slice(0, 600) }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const ttsJson = await ttsResp.json();
    const audioUrl =
      (ttsJson?.audio?.url as string | undefined) ||
      (ttsJson?.audioUrl as string | undefined) ||
      (ttsJson?.url as string | undefined);

    if (!audioUrl) {
      console.error("No audio URL in response:", JSON.stringify(ttsJson));
      return new Response(JSON.stringify({ error: "لم يتم استلام رابط الصوت" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Wait inside edge function for up to 20s for CDN
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

    // If still not ready after 20s, return failure so the UI doesn't hang
    return new Response(
      JSON.stringify({
        success: false,
        status: "failed",
        error: result.message,
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
