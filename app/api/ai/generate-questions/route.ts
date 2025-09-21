import { NextRequest } from "next/server";
import { kv } from "@vercel/kv";
import OpenAI from "openai";

const CACHE_TTL = 60 * 60; // 1 ساعة

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { articleId, title, content } = body || {};
    if (!articleId || (!title && !content)) {
      return new Response(JSON.stringify({ error: "missing articleId or content/title" }), { status: 400 });
    }

    const cacheKey = `smart_q:${articleId}`;
    try {
      const cached = await kv.get<string>(cacheKey);
      if (cached) {
        return new Response(cached, { status: 200, headers: { "Content-Type": "application/json", "X-Cache": "HIT" } });
      }
    } catch {}

    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const prompt = `
أنت مساعد توليد أسئلة عميقة لخبر صحفي. أنشئ 5 أسئلة تحليلية موجهة للقارئ تساعد على فهم الخلفيات والسياقات والتبعات، وتجنّب الأسئلة العامة المكررة. استخدم اللغة العربية الفصيحة المختصرة. أعد النتيجة بصيغة JSON بالمخطط التالي:
[{"question":"...","type":"analysis","icon":"❓"}, {"question":"...","type":"why","icon":"🧭"}, {"question":"...","type":"impact","icon":"📈"}, {"question":"...","type":"context","icon":"🧩"}, {"question":"...","type":"what_next","icon":"➡️"}]

العنوان: ${title || ""}
المحتوى المختصر (اقتطع أهم 800-1200 حرف): ${content ? String(content).slice(0, 1200) : ""}
    `.trim();

    const completion = await client.chat.completions.create({
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
      messages: [
        { role: "system", content: "أنت مساعد يكتب أسئلة عميقة مخصصة لكل خبر بناءً على المحتوى." },
        { role: "user", content: prompt }
      ],
      temperature: 0.4,
      max_tokens: 600
    });

    const text = completion.choices?.[0]?.message?.content?.trim() || "[]";
    let questions: any[] = [];
    try {
      questions = JSON.parse(text);
      if (!Array.isArray(questions)) questions = [];
    } catch {
      questions = [];
    }

    const payload = JSON.stringify({ questions });
    try { await kv.set(cacheKey, payload, { ex: CACHE_TTL }); } catch {}
    return new Response(payload, { status: 200, headers: { "Content-Type": "application/json", "X-Cache": "MISS" } });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e?.message || "failed" }), { status: 500 });
  }
}


