import { NextRequest, NextResponse } from "next/server";
import { requireAuthFromRequest } from "@/app/lib/auth";
import prisma from "@/lib/prisma";
import getRedisClient from "@/lib/redis-client";

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuthFromRequest(req);
    const body = await req.json();
    let { articleId, saved, itemId, itemType, action } = body || {};

    if (!articleId && itemType === 'article' && itemId) {
      articleId = itemId;
    }

    if (!articleId) {
      return NextResponse.json({ error: "Missing articleId" }, { status: 400 });
    }

    // التحقق من وجود المقال
    const article = await prisma.articles.findUnique({ where: { id: articleId }, select: { id: true } });
    if (!article) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 });
    }

    // Idempotency عبر Redis
    const redis = getRedisClient();
    const requestId = (body?.requestId ? String(body.requestId) : null) || undefined;
    const idemKey = requestId ? `idem:save:${user.id}:${articleId}:${requestId}` : undefined;
    const respKey = requestId ? `idem:save:resp:${user.id}:${articleId}:${requestId}` : undefined;
    if (redis && idemKey && respKey) {
      const setRes = await (redis as any).set(idemKey, "1", "EX", 300, "NX");
      if (!setRes) {
        const cached = await (redis as any).get(respKey);
        if (cached) return NextResponse.json(JSON.parse(cached));
      }
    }

    // الحالة الحالية (interactions fallback)
    const existing = await prisma.interactions.findUnique({
      where: {
        user_id_article_id_type: { user_id: user.id, article_id: articleId, type: 'save' }
      }
    });

    // تحديد الحالة المطلوبة
    let desiredSaved: boolean;
    if (typeof saved === 'boolean') desiredSaved = saved;
    else if (action === 'add') desiredSaved = true;
    else if (action === 'remove') desiredSaved = false;
    else desiredSaved = !existing; // toggle

    if (desiredSaved && !existing) {
      // حاول الكتابة في bookmarks مباشرة؛ عند الفشل استخدم interactions
      try {
        await prisma.$transaction(async (tx) => {
          await tx.$executeRawUnsafe(
            `INSERT INTO bookmarks (id, user_id, article_id, created_at) VALUES ($1, $2, $3, NOW()) ON CONFLICT (user_id, article_id) DO NOTHING`,
            `bm_${user.id}_${articleId}_${Date.now()}`,
            user.id,
            articleId
          );
          await tx.articles.update({ where: { id: articleId }, data: { saves: { increment: 1 } } });
        });
      } catch {
        await prisma.$transaction([
          prisma.interactions.create({
            data: {
              id: `save_${user.id}_${articleId}_${Date.now()}`,
              user_id: user.id,
              article_id: articleId,
              type: 'save'
            }
          }),
          prisma.articles.update({ where: { id: articleId }, data: { saves: { increment: 1 } } })
        ]);
      }
    } else if (!desiredSaved && existing) {
      try {
        await prisma.$transaction(async (tx) => {
          await tx.$executeRawUnsafe(
            `DELETE FROM bookmarks WHERE user_id = $1 AND article_id = $2`,
            user.id,
            articleId
          );
          await tx.articles.update({ where: { id: articleId }, data: { saves: { decrement: 1 } } });
          await tx.articles.updateMany({ where: { id: articleId, saves: { lt: 0 } as any }, data: { saves: 0 } });
        });
      } catch {
        await prisma.$transaction([
          prisma.interactions.delete({ where: { id: existing.id } }),
          prisma.articles.update({ where: { id: articleId }, data: { saves: { decrement: 1 } } })
        ]);
        await prisma.articles.updateMany({ where: { id: articleId, saves: { lt: 0 } as any }, data: { saves: 0 } });
      }
    }

    const updated = await prisma.articles.findUnique({ where: { id: articleId }, select: { likes: true, saves: true } });

    const payload = { saved: desiredSaved, likes: updated?.likes || 0, saves: updated?.saves || 0 };
    if (redis && respKey) {
      try { await (redis as any).set(respKey, JSON.stringify(payload), "EX", 300); } catch {}
    }
    return NextResponse.json(payload);
  } catch (e: any) {
    if (String(e?.message || e).includes("Unauthorized")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
