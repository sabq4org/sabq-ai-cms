import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const { content } = await req.json();
    if (!content || typeof content !== "string" || content.length < 30) {
      return NextResponse.json(
        { success: false, error: "المحتوى مطلوب بطول كافٍ" },
        { status: 400 }
      );
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: "OpenAI API Key غير مضبوط" },
        { status: 500 }
      );
    }

    const prompt = `اقرأ الخبر أدناه وولّد 5 أسئلة إبداعية ومتنوعة تغطي الأنواع التالية:
1) prediction 🔮  2) poll 📊  3) analysis 🔍  4) comparison 🌍  5) solutions 🎯

أعد النتيجة كـ JSON فقط بالتنسيق التالي (دون نص زائد):
{
  "questions": [
    {"type":"prediction","icon":"🔮","question":"نص السؤال"},
    {"type":"poll","icon":"📊","question":"سؤال استطلاع","options":["خيار 1","خيار 2","خيار 3"]},
    {"type":"analysis","icon":"🔍","question":"..."},
    {"type":"comparison","icon":"🌍","question":"..."},
    {"type":"solutions","icon":"🎯","question":"..."}
  ]
}

النص:
${content}`;

    const resp = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "أنت مساعد عربي موجز ومحترف" },
          { role: "user", content: prompt },
        ],
        temperature: 0.5,
        max_tokens: 500,
        response_format: { type: "json_object" },
      }),
    });

    if (!resp.ok) {
      const text = await resp.text();
      return NextResponse.json(
        { success: false, error: `OpenAI error: ${text.slice(0, 200)}` },
        { status: 500 }
      );
    }

    const data = await resp.json();
    const raw = data.choices?.[0]?.message?.content || "{}";
    let questions: any[] = [];
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed?.questions)) questions = parsed.questions;
    } catch {
      // fallback بسيط (مصفوفة أسئلة كنصوص)
      const arr = String(raw)
        .replace(/[\[\]\"\n]/g, " ")
        .split("?")
        .map((s) => (s.trim() ? s.trim() + "؟" : ""))
        .filter(Boolean)
        .slice(0, 5);
      questions = arr.map((q: string) => ({ type: "analysis", icon: "🔍", question: q }));
    }

    // تطبيع البنية
    const normalized = questions
      .filter((q: any) => typeof q === "object" ? q.question : q)
      .map((q: any) => (
        typeof q === "object"
          ? { type: q.type || "analysis", icon: q.icon || "🔍", question: q.question, options: q.options || undefined }
          : { type: "analysis", icon: "🔍", question: String(q) }
      ));

    return NextResponse.json({ success: true, questions: normalized, count: normalized.length });
  } catch (e: any) {
    return NextResponse.json(
      { success: false, error: e?.message || "خطأ في التوليد" },
      { status: 500 }
    );
  }
}


