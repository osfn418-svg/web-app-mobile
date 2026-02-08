import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, documentText, question, messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // System prompt for document analysis
    const systemPrompt = `أنت محلل مستندات خبير باللغة العربية. مهمتك:
1. تحليل المستندات والنصوص بدقة
2. استخراج المعلومات المهمة والنقاط الرئيسية
3. الإجابة على أسئلة المستخدم حول المحتوى
4. تقديم ملخصات واضحة ومنظمة

عند تحليل مستند جديد:
- قدم ملخصاً شاملاً
- حدد الموضوعات الرئيسية
- استخرج الأرقام والإحصائيات المهمة إن وجدت
- أشر إلى أي نقاط تحتاج انتباه

عند الإجابة على أسئلة:
- ارجع للمحتوى المحدد
- قدم إجابات دقيقة ومختصرة
- اقتبس من النص عند الضرورة`;

    // Prepare messages based on action
    let chatMessages: { role: string; content: string }[] = [];

    if (action === "analyze") {
      // Initial document analysis
      chatMessages = [
        { role: "system", content: systemPrompt },
        {
          role: "user",
          content: `قم بتحليل المستند التالي وقدم ملخصاً شاملاً:\n\n---\n${documentText}\n---\n\nقدم:\n1. ملخص عام (2-3 جمل)\n2. النقاط الرئيسية\n3. أي معلومات مهمة أخرى`,
        },
      ];
    } else if (action === "chat") {
      // Chat with document
      chatMessages = [
        { role: "system", content: systemPrompt },
        {
          role: "user",
          content: `المستند للرجوع إليه:\n\n---\n${documentText}\n---`,
        },
        { role: "assistant", content: "فهمت المستند. يمكنك سؤالي عن أي شيء فيه." },
        ...(messages || []),
        { role: "user", content: question },
      ];
    } else {
      return new Response(JSON.stringify({ error: "action غير صالح" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: chatMessages,
        stream: true,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => "");
      console.error("Lovable AI error:", response.status, errorText);

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

      return new Response(JSON.stringify({ error: "خطأ في خدمة تحليل المستندات" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("Document analysis error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "خطأ غير معروف" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
