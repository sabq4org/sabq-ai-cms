import { ProofreadResultSchema, ProofreadResult } from './proofreaderSchema';
import { createOpenAIClient } from '@/lib/openai-config';

const SYSTEM_PROMPT = `أنت "وكيل التدقيق السريع" ... (مقتطع للاختصار، استبدل بالنص الكامل عند الدمج)`;
const DEVELOPER_PROMPT = `- الإدخال: نص خام + ميتاداتا ... (مقتطع)`;

function buildUserPrompt(raw: string) {
  return `[المهمة] دقّق النص التالي لغويًا وأسلوبياً، واكشف الدلالات غير الدقيقة دون اختلاق:\n[النص الخام]\n<<<\n${raw}\n>>>\n[المعطيات]\nlang=ar; country=SA; style=newsroom; insist_no_hallucination=true; keep_quotes_intact=true\n[المطلوب]\nأعد مخرجاتك وفق الـ JSON schema أعلاه حرفيًا.`;
}

export async function runProofread(raw: string): Promise<ProofreadResult> {
  const user = buildUserPrompt(raw);
  const start = Date.now();
  const client = await createOpenAIClient();
  if (!client) throw new Error('NO_OPENAI_CLIENT');
  const completion = await client.chat.completions.create({
    model: process.env.AI_MODEL || 'gpt-4o-mini',
    temperature: 0.2,
    response_format: { type: 'json_object' } as any,
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'developer', content: DEVELOPER_PROMPT },
      { role: 'user', content: user }
    ],
    max_tokens: 4000
  });
  const aiContent = completion.choices?.[0]?.message?.content || '{}';
  const duration = Date.now() - start;
  let parsed: any;
  try { parsed = JSON.parse(aiContent); } catch { throw new Error('INVALID_JSON'); }
  const validated = ProofreadResultSchema.parse(parsed);
  return validated;
}
