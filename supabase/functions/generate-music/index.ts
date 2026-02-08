import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

function pickAudioUrl(raw: any): string | null {
  return (
    raw?.audio_url ??
    raw?.audioUrl ??
    raw?.audio_file?.url ??
    raw?.audio_file?.audio_url ??
    raw?.output?.url ??
    raw?.result?.url ??
    raw?.data?.audio_file?.url ??
    null
  );
}

function normalizeStatus(raw: any): { status: "generating" | "completed" | "failed"; audioUrl: string | null } {
  const statusRaw = String(raw?.status ?? raw?.state ?? "").toLowerCase();
  const audioUrl = pickAudioUrl(raw);

  if (audioUrl) return { status: "completed", audioUrl };
  if (["failed", "error", "canceled", "cancelled"].includes(statusRaw)) return { status: "failed", audioUrl: null };
  return { status: "generating", audioUrl: null };
}

async function readJsonOrText(resp: Response): Promise<{ json: any; rawText: string }> {
  const rawText = await resp.text().catch(() => "");
  try {
    return { json: rawText ? JSON.parse(rawText) : {}, rawText };
  } catch {
    return { json: { raw: rawText }, rawText };
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { prompt, genre, duration, action, generationId } = await req.json();
    const AIML_API_KEY = Deno.env.get("AIML_API_KEY");

    if (!AIML_API_KEY) throw new Error("AIML_API_KEY is not configured");

    // --- CHECK ---
    if (action === "check") {
      if (!generationId) {
        return new Response(JSON.stringify({ error: "generationId مطلوب" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const resp = await fetch(
        `https://api.aimlapi.com/v2/generate/audio?generation_id=${encodeURIComponent(generationId)}`,
        { method: "GET", headers: { Authorization: `Bearer ${AIML_API_KEY}` } }
      );

      const { json, rawText } = await readJsonOrText(resp);

      if (!resp.ok) {
        console.error("AIML music status error:", resp.status, rawText);

        if (resp.status === 429) {
          return new Response(JSON.stringify({ error: "تم تجاوز حد الاستخدام" }), {
            status: 429,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        if (resp.status === 402) {
          return new Response(JSON.stringify({ error: "يرجى إضافة رصيد لحسابك" }), {
            status: 402,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        if (resp.status === 403) {
          return new Response(
            JSON.stringify({
              error: "تم الوصول لحد استخدام المفتاح (403) — يرجى تحديث مفتاح الخدمة أو زيادة الحصة",
              details: rawText.slice(0, 800),
            }),
            { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        if (resp.status === 401) {
          return new Response(
            JSON.stringify({
              error: "غير مصرح (401) — تحقق من صلاحية مفتاح الخدمة",
              details: rawText.slice(0, 800),
            }),
            { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        return new Response(
          JSON.stringify({
            error: "خطأ في التحقق من حالة الموسيقى",
            httpStatus: resp.status,
            details: rawText.slice(0, 800),
          }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const normalized = normalizeStatus(json);

      return new Response(
        JSON.stringify({
          id: generationId,
          success: true,
          status: normalized.status,
          audio_url: normalized.audioUrl,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // --- GENERATE ---
    if (!prompt || String(prompt).trim().length === 0) {
      return new Response(JSON.stringify({ error: "الوصف (prompt) مطلوب" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const genreStyles: Record<string, string> = {
      ambient: "ambient, atmospheric, relaxing, peaceful",
      electronic: "electronic, EDM, synth, bass",
      classical: "classical, orchestral, piano, strings",
      pop: "pop, catchy, upbeat, modern",
    };

    const enhancedPrompt = `${prompt}, ${genreStyles[genre] || genreStyles.ambient}`;

    const resp = await fetch("https://api.aimlapi.com/v2/generate/audio", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${AIML_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "minimax-music",
        prompt: enhancedPrompt,
        duration_seconds: Number(duration) || 30,
      }),
    });

    const { json, rawText } = await readJsonOrText(resp);

    if (!resp.ok) {
      console.error("AIML Music error:", resp.status, rawText);

      if (resp.status === 429) {
        return new Response(JSON.stringify({ error: "تم تجاوز حد الاستخدام" }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      if (resp.status === 402) {
        return new Response(JSON.stringify({ error: "يرجى إضافة رصيد لحسابك" }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      if (resp.status === 403) {
        return new Response(
          JSON.stringify({
            error: "تم الوصول لحد استخدام المفتاح (403) — يرجى تحديث مفتاح الخدمة أو زيادة الحصة",
            details: rawText.slice(0, 800),
          }),
          { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      if (resp.status === 401) {
        return new Response(
          JSON.stringify({
            error: "غير مصرح (401) — تحقق من صلاحية مفتاح الخدمة",
            details: rawText.slice(0, 800),
          }),
          { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({
          error: "خطأ في توليد الموسيقى",
          details: rawText.slice(0, 800),
        }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        generationId: json?.id,
        status: String(json?.status ?? "generating"),
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("Music generation error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "خطأ غير معروف" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
