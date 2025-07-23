// pages/api/ai/news-copilot.ts
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const { articleId, messages } = req.body;
  // استدعاء OpenAI API أو أي خدمة ذكاء اصطناعي
  try {
    // مثال: استدعاء OpenAI Chat API (GPT-4)
    const apiRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: messages.map((m: any) => ({ role: m.role, content: m.content })),
        max_tokens: 400,
        temperature: 0.7
      })
    });
    const data = await apiRes.json();
    const reply = data.choices?.[0]?.message?.content || 'لم أتمكن من توليد إجابة.';
    res.status(200).json({ reply });
  } catch (e) {
    res.status(500).json({ reply: 'حدث خطأ أثناء الاتصال بخدمة الذكاء الاصطناعي.' });
  }
}
