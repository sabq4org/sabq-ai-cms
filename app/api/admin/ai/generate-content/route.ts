import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/require-admin";

export async function POST(request: NextRequest) {
  try {
    // التحقق من صلاحيات المستخدم
    const adminCheck = await requireAdmin(request);
    if (!adminCheck.authorized) {
      return NextResponse.json(
        { error: adminCheck.error || "غير مصرح لك بالوصول" },
        { status: 401 }
      );
    }

    const { content } = await request.json();

    if (!content || content.length < 50) {
      return NextResponse.json(
        { error: "المحتوى قصير جداً. يجب أن يكون 50 حرف على الأقل" },
        { status: 400 }
      );
    }

    const openaiApiKey = process.env.OPENAI_API_KEY;
    if (!openaiApiKey) {
      return NextResponse.json(
        { error: "مفتاح OpenAI API غير مضبوط" },
        { status: 500 }
      );
    }

    // استدعاء OpenAI API
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${openaiApiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `أنت محرر أخبار محترف باللغة العربية. مهمتك هي:
1. إنشاء عنوان رئيسي جذاب ومختصر (60-80 حرف)
2. إنشاء عنوان فرعي يوضح تفاصيل إضافية (اختياري، 80-120 حرف)
3. كتابة موجز ذكي شامل للخبر (300-500 حرف)
4. استخراج 5-8 كلمات مفتاحية ذات صلة

يجب أن تكون جميع النصوص باللغة العربية الفصحى، واضحة، ومناسبة للنشر الإخباري.`
          },
          {
            role: "user",
            content: `بناءً على محتوى الخبر التالي، أنشئ العناصر المطلوبة:

${content}`
          }
        ],
        temperature: 0.7,
        max_tokens: 1000,
        response_format: { type: "json_object" }
      }),
    });

    if (!response.ok) {
      console.error("OpenAI API error:", await response.text());
      return NextResponse.json(
        { error: "حدث خطأ في التوليد التلقائي" },
        { status: 500 }
      );
    }

    const data = await response.json();
    const result = JSON.parse(data.choices[0].message.content);

    return NextResponse.json({
      title: result.title || "",
      subtitle: result.subtitle || "",
      excerpt: result.excerpt || "",
      keywords: result.keywords || [],
    });

  } catch (error) {
    console.error("خطأ في توليد المحتوى:", error);
    return NextResponse.json(
      { error: "حدث خطأ أثناء معالجة الطلب" },
      { status: 500 }
    );
  }
}
