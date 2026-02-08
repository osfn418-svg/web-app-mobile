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
    const { prompt, genre, duration, action, generationId } = await req.json();
    const AIML_API_KEY = Deno.env.get("AIML_API_KEY");
    
    if (!AIML_API_KEY) {
      throw new Error("AIML_API_KEY is not configured");
    }

    // Check generation status
    if (action === "check" && generationId) {
      const response = await fetch(`https://api.aimlapi.com/v2/generate/audio/suno/clip?clip_id=${generationId}`, {
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

    // Genre style modifiers
    const genreStyles: Record<string, string> = {
      ambient: "ambient, atmospheric, relaxing, peaceful",
      electronic: "electronic, EDM, synth, bass",
      classical: "classical, orchestral, piano, strings",
      pop: "pop, catchy, upbeat, modern",
    };

    const enhancedPrompt = `${prompt}, ${genreStyles[genre] || genreStyles.ambient}`;

    // Use Suno AI for music generation
    const response = await fetch("https://api.aimlapi.com/v2/generate/audio/suno/clip", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${AIML_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt: enhancedPrompt,
        duration: parseInt(duration) || 30,
        make_instrumental: false,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AIML Music error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "تم تجاوز حد الاستخدام" }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      
      return new Response(JSON.stringify({ error: "خطأ في توليد الموسيقى" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    
    return new Response(JSON.stringify({ 
      success: true,
      generationId: data.clip_id || data.id,
      status: data.status,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("Music generation error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "خطأ غير معروف" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
