import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { validateAuth, unauthorizedResponse, corsHeaders } from "../_shared/auth.ts";

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
    const { messages, toolType, model } = await req.json();
    const AIML_API_KEY = Deno.env.get("AIML_API_KEY");
    
    if (!AIML_API_KEY) {
      throw new Error("AIML_API_KEY is not configured");
    }

    // Different system prompts based on tool type
    const systemPrompts: Record<string, string> = {
      assistant: `أنت مساعد ذكي باللغة العربية. تساعد المستخدمين في الإجابة على أسئلتهم بطريقة واضحة ومفيدة. كن ودوداً ومهنياً.`,
      code: `أنت مبرمج خبير. ساعد المستخدمين في كتابة وتصحيح الأكواد البرمجية. قدم الأكواد بتنسيق markdown مع شرح واضح بالعربية.`,
      document: `أنت محلل مستندات متخصص. ساعد المستخدمين في تحليل وفهم المستندات والنصوص. قدم ملخصات واضحة واستخرج المعلومات المهمة.`,
      prompt: `أنت خبير في صياغة الأوامر (Prompts) للذكاء الاصطناعي. ساعد المستخدمين في إنشاء prompts احترافية ومفصلة للحصول على أفضل النتائج.`,
      image: `أنت خبير في توليد وصف الصور. ساعد المستخدمين في إنشاء prompts دقيقة لتوليد صور احترافية.`,
      video: `أنت خبير في إنتاج الفيديو. ساعد المستخدمين في إنشاء أفكار ووصف للفيديوهات.`,
      audio: `أنت خبير في إنتاج الصوت والموسيقى. ساعد المستخدمين في إنشاء نصوص وأوصاف صوتية.`,
      default: `أنت مساعد ذكي متعدد المهام. ساعد المستخدمين في أي مهمة يحتاجونها بطريقة احترافية وودودة بالعربية.`
    };

    const systemPrompt = systemPrompts[toolType] || systemPrompts.default;
    
    // Model mapping - support multiple providers (using correct AIML API model IDs)
    const modelMapping: Record<string, string> = {
      "gemini-3": "google/gemini-3-flash-preview",
      "gemini-pro": "google/gemini-2.5-pro",
      "gpt-5": "gpt-5-chat-latest",
      "gpt-4": "gpt-4o",
      "claude": "anthropic/claude-3.7-sonnet",
      "deepseek": "deepseek-chat",
    };
    
    // Use provided model or default to a fast model
    const selectedModel = modelMapping[model] || model || "deepseek-chat";

    const response = await fetch("https://api.aimlapi.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${AIML_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: selectedModel,
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
      console.error("AIML API error:", response.status, errorText);
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
