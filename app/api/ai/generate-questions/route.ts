import { NextRequest } from "next/server";
import OpenAI from "openai";

const CACHE_TTL = 60 * 60 * 1000; // 1 ساعة بالميلي ثانية

type CacheEntry = { value: string; expiresAt: number };

declare global {
  // eslint-disable-next-line no-var
  var __SMART_Q_CACHE__: Map<string, CacheEntry> | undefined;
}

function getMemoryCache(): Map<string, CacheEntry> {
  if (!globalThis.__SMART_Q_CACHE__) {
    globalThis.__SMART_Q_CACHE__ = new Map<string, CacheEntry>();
  }
  return globalThis.__SMART_Q_CACHE__ as Map<string, CacheEntry>;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { articleId, title, content } = body || {};
    if (!articleId || (!title && !content)) {
      return new Response(JSON.stringify({ error: "missing articleId or content/title" }), { status: 400 });
    }

    const cacheKey = `smart_q:${articleId}`;
    const mem = getMemoryCache();
    const cached = mem.get(cacheKey);
    if (cached && cached.expiresAt > Date.now()) {
      return new Response(cached.value, { status: 200, headers: { "Content-Type": "application/json", "X-Cache": "HIT" } });
    }

    const hasKey = !!process.env.OPENAI_API_KEY;
    let questions: any[] = [];

    if (hasKey) {
      try {
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
        try {
          const parsed = JSON.parse(text);
          if (Array.isArray(parsed)) questions = parsed;
        } catch {}
      } catch {}
    }

    if (!questions || questions.length === 0) {
      // بديل محلي غير عام قدر الإمكان باستخدام العنوان
      const base = String(title || '').split(' ').slice(0, 6).join(' ');
      questions = [
        { question: `ما الخلفية والسياق المرتبط بـ: ${base}?`, type: 'context', icon: '🧩' },
        { question: `لماذا يعد هذا الخبر مهمًا الآن؟`, type: 'why', icon: '🧭' },
        { question: `ما التأثير المحتمل على المجتمع أو السوق؟`, type: 'impact', icon: '📈' },
        { question: `ما العوامل التاريخية/السياسية المؤثرة في الموضوع؟`, type: 'analysis', icon: '❓' },
        { question: `ما السيناريوهات التالية المتوقعة؟`, type: 'what_next', icon: '➡️' }
      ];
    }

    const payload = JSON.stringify({ questions });
    mem.set(cacheKey, { value: payload, expiresAt: Date.now() + CACHE_TTL });
    return new Response(payload, { status: 200, headers: { "Content-Type": "application/json", "X-Cache": cached ? "HIT" : "MISS" } });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e?.message || "failed" }), { status: 500 });
  }
}


