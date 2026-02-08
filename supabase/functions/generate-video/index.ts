import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prompt, duration, action, generationId } = await req.json();
    const AIML_API_KEY = Deno.env.get("AIML_API_KEY");
    
    if (!AIML_API_KEY) {
      throw new Error("AIML_API_KEY is not configured");
    }

    // Check video generation status
    if (action === "check") {
      console.log("Checking video status for:", generationId);

      if (!generationId) {
        return new Response(JSON.stringify({ error: "generationId مطلوب" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const response = await fetch(
        `https://api.aimlapi.com/v2/generate/video/kling/generation?generation_id=${generationId}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${AIML_API_KEY}`,
          },
        }
      );

      const rawText = await response.text().catch(() => "");
      let data: any = {};
      try {
        data = rawText ? JSON.parse(rawText) : {};
      } catch {
        data = { raw: rawText };
      }

      if (!response.ok) {
        console.error("AIML status error:", response.status, rawText);

        if (response.status === 429) {
          return new Response(JSON.stringify({ error: "تم تجاوز حد الاستخدام" }), {
            status: 429,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        if (response.status === 402) {
          return new Response(JSON.stringify({ error: "يرجى إضافة رصيد لحسابك" }), {
            status: 402,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        if (response.status === 403) {
          return new Response(
            JSON.stringify({
              error: "تم الوصول لحد استخدام المفتاح (403) — يرجى تحديث مفتاح الخدمة أو زيادة الحصة",
              details: rawText.slice(0, 800),
            }),
            {
              status: 403,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
          );
        }

        if (response.status === 401) {
          return new Response(
            JSON.stringify({
              error: "غير مصرح (401) — تحقق من صلاحية مفتاح الخدمة",
              details: rawText.slice(0, 800),
            }),
            {
              status: 401,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
          );
        }

        return new Response(
          JSON.stringify({
            error: "خطأ في التحقق من حالة الفيديو",
            httpStatus: response.status,
            details: rawText.slice(0, 800),
          }),
          {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      console.log("Video status response:", JSON.stringify(data));

      // Parse AIML response format
      let status = data.status || "queued";
      let videoUrl: string | null = null;

      // Check if video is ready
      if (data.video?.url) {
        videoUrl = data.video.url;
        status = "completed";
      } else if (data.videos && data.videos.length > 0 && data.videos[0].url) {
        videoUrl = data.videos[0].url;
        status = "completed";
      } else if (status === "completed" && !videoUrl) {
        // API says completed but no URL - check nested structures
        videoUrl = data.output?.url || data.result?.url || null;
      }

      return new Response(
        JSON.stringify({
          id: generationId,
          status: status,
          video_url: videoUrl,
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Start video generation using Kling AI model
    const response = await fetch("https://api.aimlapi.com/v2/video/generations", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${AIML_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "kling-video/v1/standard/text-to-video",
        prompt: prompt,
        duration: duration || "5",
        aspect_ratio: "16:9",
      }),
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => "");
      console.error("AIML API error:", response.status, errorText);

      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "تم تجاوز حد الاستخدام" }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "يرجى إضافة رصيد لحسابك" }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      if (response.status === 403) {
        return new Response(
          JSON.stringify({
            error: "تم الوصول لحد استخدام المفتاح (403) — يرجى تحديث مفتاح الخدمة أو زيادة الحصة",
            details: errorText.slice(0, 800),
          }),
          {
            status: 403,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      if (response.status === 401) {
        return new Response(
          JSON.stringify({
            error: "غير مصرح (401) — تحقق من صلاحية مفتاح الخدمة",
            details: errorText.slice(0, 800),
          }),
          {
            status: 401,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      return new Response(
        JSON.stringify({
          error: "خطأ في توليد الفيديو",
          details: errorText.slice(0, 800),
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const data = await response.json();
    
    return new Response(JSON.stringify({ 
      success: true,
      generationId: data.id,
      status: data.status,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("Video generation error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "خطأ غير معروف" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
