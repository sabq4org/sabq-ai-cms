import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { runProofread } from '@/lib/ai/proofreader';
import { ProofreadResultSchema } from '@/lib/ai/proofreaderSchema';

// TODO: replace with real auth / rbac utilities
async function getUser(req: NextRequest) {
  // placeholder: integrate with existing auth
  return { id: 'demo-user', role: 'editor' };
}
function enforceRole(role: string) {
  if (!['editor','admin'].includes(role)) throw new Error('forbidden');
}

const Body = z.object({
  articleId: z.string().optional(),
  text: z.string().min(20),
  meta: z.record(z.any()).optional()
});

export async function POST(req: NextRequest) {
  try {
    const user = await getUser(req);
    if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
    enforceRole(user.role);

    const json = await req.json();
    const { text, articleId, meta } = Body.parse(json);

    const started = Date.now();
    let result;
    try {
      result = await runProofread(text);
    } catch (e: any) {
      await prisma.aiProofreadJob.create({
        data: {
          articleId,
            userId: user.id,
            inputChars: text.length,
            quality: {},
            result: { error: e?.message || 'error' },
            durationMs: Date.now() - started,
            status: 'failed',
            errorMessage: e?.message?.toString().slice(0,300)
        }
      });
      return NextResponse.json({ error: 'ai_failed', detail: e?.message }, { status: 500 });
    }

    // strict validation (already via runProofread but double-check)
    const validated = ProofreadResultSchema.parse(result);

    await prisma.aiProofreadJob.create({
      data: {
        articleId,
        userId: user.id,
        inputChars: text.length,
        quality: validated.quality_score,
        result: validated,
        durationMs: Date.now() - started,
        status: 'success'
      }
    });

    if (articleId) {
      try {
        await prisma.contentQualityScore.upsert({
          where: { articleId },
          update: {
            spelling: validated.quality_score.spelling,
            grammar: validated.quality_score.grammar,
            style: validated.quality_score.style,
            consistency: validated.quality_score.consistency,
            overall: validated.quality_score.overall,
            updatedAt: new Date()
          },
          create: {
            articleId,
            spelling: validated.quality_score.spelling,
            grammar: validated.quality_score.grammar,
            style: validated.quality_score.style,
            consistency: validated.quality_score.consistency,
            overall: validated.quality_score.overall
          }
        });
      } catch {}
    }

    return NextResponse.json(validated);
  } catch (error: any) {
    return NextResponse.json({ error: 'bad_request', detail: error.message }, { status: 400 });
  }
}
