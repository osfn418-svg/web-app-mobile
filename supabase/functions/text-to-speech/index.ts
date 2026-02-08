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
    const { text, voice } = await req.json();
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

    // Use OpenAI TTS model via AIML API
    const response = await fetch("https://api.aimlapi.com/v1/tts", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${AIML_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "openai/tts-1",
        text: text,
        voice: voice || "alloy",
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AIML TTS error:", response.status, errorText);
      
      if (response.status === 429) {
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

    // API returns JSON with audio URL
    const data = await response.json();
    const audioUrl = data.audio?.url;
    
    if (!audioUrl) {
      console.error("No audio URL in response:", JSON.stringify(data));
      return new Response(JSON.stringify({ error: "لم يتم استلام رابط الصوت" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    
    return new Response(JSON.stringify({ 
      success: true,
      audioUrl: audioUrl,
      format: "mp3"
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("TTS error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "خطأ غير معروف" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
