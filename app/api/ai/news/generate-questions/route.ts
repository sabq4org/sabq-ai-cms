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

    const prompt = `اقرأ النص العربي التالي بتمعّن واستخرج 5 أسئلة ذكية ومفيدة ومتنوعة تغطي الجوانب المهمة في الخبر. أعد إجابة بصيغة JSON مصفوفة نصوص فقط.

النص:
${content}

المطلوب (JSON فقط): ["سؤال 1","سؤال 2","سؤال 3","سؤال 4","سؤال 5"]`;

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
    const raw = data.choices?.[0]?.message?.content || "[]";
    let questions: string[] = [];
    try {
      // قد يأتي كائن، نتوقع مصفوفة ضمنه
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) questions = parsed;
      else if (Array.isArray(parsed.questions)) questions = parsed.questions;
    } catch {
      // fallback بسيط: اقتطاع أسطر
      questions = String(raw)
        .replace(/[\[\]\"\n]/g, " ")
        .split("?")
        .map((s) => (s.trim() ? s.trim() + "؟" : ""))
        .filter(Boolean)
        .slice(0, 5);
    }

    return NextResponse.json({ success: true, questions, count: questions.length });
  } catch (e: any) {
    return NextResponse.json(
      { success: false, error: e?.message || "خطأ في التوليد" },
      { status: 500 }
    );
  }
}


