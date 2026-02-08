import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { encode as base64Encode } from "https://deno.land/std@0.168.0/encoding/base64.ts";
import { validateAuth, unauthorizedResponse, corsHeaders } from "../_shared/auth.ts";

type GenerateBody = {
  action?: "generate";
  text: string;
  voice?: string;
  speed?: number;
};

type CheckBody = {
  action: "check";
  audioUrl: string;
};

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function tryFetchAudioBase64(audioUrl: string): Promise<
  | { status: "completed"; audioData: string }
  | { status: "pending"; lastHttpStatus?: number }
  | { status: "failed"; httpStatus?: number; message: string; details?: string }
> {
  // The CDN object may not exist yet right after generation.
  // Keep this short; client can poll if still pending.
  const retryDelaysMs = [0, 700, 1500, 2500];
  let lastStatus = 0;
  let lastBody = "";

  for (const d of retryDelaysMs) {
    if (d) await sleep(d);

    let resp: Response;
    try {
      resp = await fetch(audioUrl, {
        redirect: "follow",
        headers: {
          // بعض CDN تحجب الـ default user-agent الخاص بـ Deno
          "User-Agent": "Mozilla/5.0 (compatible; LovableCloud/1.0)",
          Accept: "audio/mpeg,audio/*;q=0.9,*/*;q=0.8",
          "Cache-Control": "no-cache",
          Pragma: "no-cache",
        },
      });
    } catch (e) {
      return {
        status: "failed",
        message: "تعذر الاتصال بمصدر ملف الصوت",
        details: e instanceof Error ? e.message : String(e),
      };
    }

    lastStatus = resp.status;

    if (resp.ok) {
      const audioBuffer = await resp.arrayBuffer();
      const base64Audio = base64Encode(new Uint8Array(audioBuffer));
      return { status: "completed", audioData: base64Audio };
    }

    // Not ready yet
    if (resp.status === 404) {
      lastBody = await resp.text().catch(() => "");
      continue;
    }

    // Any other failure: return a real failure so the UI doesn't spin forever.
    lastBody = await resp.text().catch(() => "");
    console.error("Audio fetch failed:", resp.status, lastBody);
    return {
      status: "failed",
      httpStatus: resp.status,
      message: "تعذر تحميل ملف الصوت",
      details: lastBody.slice(0, 600),
    };
  }

  // If we repeatedly got 404, treat as pending.
  if (lastStatus === 404) return { status: "pending", lastHttpStatus: lastStatus };

  // Fallback: treat as pending (safe) but provide last status.
  return { status: "pending", lastHttpStatus: lastStatus || undefined };
}

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
    const body = (await req.json()) as GenerateBody | CheckBody;
    const AIML_API_KEY = Deno.env.get("AIML_API_KEY");

    if (!AIML_API_KEY) {
      throw new Error("AIML_API_KEY is not configured");
    }

    // --- CHECK ---
    if ((body as CheckBody).action === "check") {
      const { audioUrl } = body as CheckBody;
      if (!audioUrl) {
        return new Response(JSON.stringify({ error: "audioUrl مطلوب" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      console.log("Checking TTS v2 status for user:", user.id);

      const fetched = await tryFetchAudioBase64(audioUrl);
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
            error: fetched.message,
            httpStatus: fetched.httpStatus,
            details: fetched.details,
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({
          success: true,
          status: "pending",
          lastHttpStatus: fetched.lastHttpStatus,
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // --- GENERATE ---
    const { text, voice, speed } = body as GenerateBody;

    if (!text || text.trim().length === 0) {
      return new Response(JSON.stringify({ error: "النص مطلوب" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log("Starting TTS v2 for user:", user.id);

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
        speed: typeof speed === "number" ? speed : undefined,
        response_format: "mp3",
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
    const audioUrl = ttsJson.audio?.url as string | undefined;

    if (!audioUrl) {
      console.error("No audio URL in response:", JSON.stringify(ttsJson));
      return new Response(JSON.stringify({ error: "لم يتم استلام رابط الصوت" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const fetched = await tryFetchAudioBase64(audioUrl);
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
          error: fetched.message,
          httpStatus: fetched.httpStatus,
          details: fetched.details,
          format: "mp3",
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Not ready yet — return URL so client can poll.
    return new Response(
      JSON.stringify({
        success: true,
        status: "pending",
        audioUrl,
        lastHttpStatus: fetched.lastHttpStatus,
        format: "mp3",
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("TTS v2 error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "خطأ غير معروف" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
