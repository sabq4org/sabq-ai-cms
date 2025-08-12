import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const { question, content } = await req.json();
    if (!question || !content) {
      return NextResponse.json(
        { success: false, error: "السؤال والمحتوى مطلوبان" },
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

    const prompt = `أجب بإيجاز ودقة وبالعربية على السؤال التالي اعتماداً فقط على المعلومات المذكورة في النص المرفق. إن لم تتوفر الإجابة في النص قل: لا تتوفر معلومات كافية.

النص:
${content}

السؤال: ${question}

المطلوب (JSON): {"answer":"نص الإجابة"}`;

    const resp = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "أنت مساعد عربي دقيق وموجز" },
          { role: "user", content: prompt },
        ],
        temperature: 0.3,
        max_tokens: 600,
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
    let answer = "";
    try {
      const parsed = JSON.parse(raw);
      answer = parsed.answer || raw;
    } catch {
      answer = raw;
    }

    return NextResponse.json({ success: true, answer, question });
  } catch (e: any) {
    return NextResponse.json(
      { success: false, error: e?.message || "خطأ في التوليد" },
      { status: 500 }
    );
  }
}


