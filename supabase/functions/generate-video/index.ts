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
      const response = await fetch(`https://api.aimlapi.com/v2/video/generations?generation_id=${generationId}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${AIML_API_KEY}`,
        },
      });

      const data = await response.json();
      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
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
      const errorText = await response.text();
      console.error("AIML API error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "تم تجاوز حد الاستخدام" }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      
      return new Response(JSON.stringify({ error: "خطأ في توليد الفيديو" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
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
