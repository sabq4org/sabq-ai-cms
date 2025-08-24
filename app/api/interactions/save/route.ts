import { NextRequest, NextResponse } from 'next/server';
import { requireAuthFromRequest } from '@/app/lib/auth';
import prisma from '@/lib/prisma';

async function awardLoyaltyPoints(userId: string, articleId: string, points: number, action: string) {
  if (points <= 0) return 0;
  await prisma.loyalty_points.create({
    data: {
      id: `lp_${Date.now()}_${Math.random().toString(36).slice(2)}`,
      user_id: userId,
      points,
      action,
      reference_id: articleId,
      reference_type: 'article',
      metadata: { source: 'interactions/save', timestamp: new Date().toISOString() },
      created_at: new Date(),
    },
  });
  return points;
}

async function getTotalPoints(userId: string) {
  const agg = await prisma.loyalty_points.aggregate({ where: { user_id: userId }, _sum: { points: true } });
  return agg._sum.points || 0;
}

function getLevel(totalPoints: number) {
  if (totalPoints >= 2000) return 'بلاتيني';
  if (totalPoints >= 500) return 'ذهبي';
  if (totalPoints >= 100) return 'فضي';
  return 'برونزي';
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuthFromRequest(req);
    const { articleId, save } = await req.json();

    if (!articleId) {
      return NextResponse.json({ error: 'Missing articleId' }, { status: 400 });
    }

    // تحقق من المقال
    const article = await prisma.articles.findUnique({ where: { id: articleId }, select: { id: true, saves: true } });
    if (!article) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 });
    }

    // نفّذ العملية داخل معاملة
    const result = await prisma.$transaction(async (tx) => {
      const uniqueKey = { user_id: user.id, article_id: articleId, type: 'save' as const };
      const existing = await tx.interactions.findUnique({ where: { user_id_article_id_type: uniqueKey } });

      if (save) {
        if (!existing) {
          await tx.interactions.create({
            data: { id: `save_${user.id}_${articleId}_${Date.now()}`, user_id: user.id, article_id: articleId, type: 'save' },
          });
          await tx.articles.update({ where: { id: articleId }, data: { saves: { increment: 1 } } });
        }
      } else {
        if (existing) {
          await tx.interactions.delete({ where: { id: existing.id } });
          await tx.articles.update({ where: { id: articleId }, data: { saves: { decrement: 1 } } });
          await tx.articles.updateMany({ where: { id: articleId, saves: { lt: 0 } as any }, data: { saves: 0 } });
        }
      }

      const updated = await tx.articles.findUnique({ where: { id: articleId }, select: { saves: true } });
      return { saves: updated?.saves || 0 };
    });

    // منح نقاط عند إضافة حفظ فقط
    let pointsAwarded = 0;
    if (save) {
      pointsAwarded = await awardLoyaltyPoints(user.id, articleId, 2, 'save');
    }
    const totalPoints = await getTotalPoints(user.id);
    const level = getLevel(totalPoints);

    return NextResponse.json({ saved: !!save, ...result, pointsAwarded, totalPoints, level, success: true });
  } catch (e: any) {
    const message = String(e?.message || e || '');
    if (message.includes('Unauthorized')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('/api/interactions/save error:', e);
    return NextResponse.json({ error: 'Failed to toggle save' }, { status: 500 });
  }
}


