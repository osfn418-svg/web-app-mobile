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
    const { messages, toolType } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Different system prompts based on tool type
    const systemPrompts: Record<string, string> = {
      assistant: `أنت مساعد ذكي باللغة العربية. تساعد المستخدمين في الإجابة على أسئلتهم بطريقة واضحة ومفيدة. كن ودوداً ومهنياً.`,
      code: `أنت مبرمج خبير. ساعد المستخدمين في كتابة وتصحيح الأكواد البرمجية. قدم الأكواد بتنسيق markdown مع شرح واضح بالعربية.`,
      document: `أنت محلل مستندات متخصص. ساعد المستخدمين في تحليل وفهم المستندات والنصوص. قدم ملخصات واضحة واستخرج المعلومات المهمة.`,
      prompt: `أنت خبير في صياغة الأوامر (Prompts) للذكاء الاصطناعي. ساعد المستخدمين في إنشاء prompts احترافية ومفصلة للحصول على أفضل النتائج.`,
      default: `أنت مساعد ذكي متعدد المهام. ساعد المستخدمين في أي مهمة يحتاجونها بطريقة احترافية وودودة بالعربية.`
    };

    const systemPrompt = systemPrompts[toolType] || systemPrompts.default;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "تم تجاوز حد الاستخدام، يرجى المحاولة لاحقاً" }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "يرجى إضافة رصيد للحساب للاستمرار" }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(JSON.stringify({ error: "خطأ في خدمة الذكاء الاصطناعي" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("Chat error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "خطأ غير معروف" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
