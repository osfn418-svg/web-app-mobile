import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { prompt, duration } = await req.json();
    const AIML_API_KEY = Deno.env.get("AIML_API_KEY");
    if (!AIML_API_KEY) throw new Error("AIML_API_KEY not configured");

    // Start generation
    const startRes = await fetch("https://api.aimlapi.com/v2/generate/audio", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${AIML_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "minimax/music-01",
        prompt: prompt || "Calm ambient electronic music",
        duration: duration || 60,
      }),
    });

    const rawText = await startRes.text();
    console.log("Start response:", startRes.status, rawText);

    if (!startRes.ok) {
      return new Response(JSON.stringify({ error: "Generation failed", details: rawText.slice(0, 500) }), {
        status: startRes.status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = JSON.parse(rawText);
    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
