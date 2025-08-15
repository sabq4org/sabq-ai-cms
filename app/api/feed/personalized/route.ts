import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/app/lib/auth";
import getRedisClient from "@/lib/redis-client";
import { deleteKeysByPattern } from "@/lib/redis-helpers";

function decayByHours(date: Date): number {
  const hours = Math.max(1, (Date.now() - date.getTime()) / 3_600_000);
  return 1 / hours;
}

export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth();
    const { searchParams } = new URL(req.url);
    const limit = Math.min(50, parseInt(searchParams.get("limit") || "20", 10));
    const offset = Math.max(0, parseInt(searchParams.get("offset") || "0", 10));

    const redis = getRedisClient();
    const cacheKey = `user:feed:${user.id}:${limit}:${offset}`;
    if (redis) {
      const cached = await redis.get(cacheKey);
      if (cached) {
        return NextResponse.json({ items: JSON.parse(cached), nextOffset: offset + limit, meta: { source: "cache", generatedAt: new Date().toISOString() } }, { headers: { "Cache-Control": "no-store" } });
      }
    }

    const { PrismaClient } = await import("@prisma/client");
    const prisma = new PrismaClient();

    // تحقق من موافقة التخصيص
    const consent = await prisma.UserSettings.findFirst({
      where: { user_id: user.id, module: "personalization", key: "enabled" },
      select: { value: true }
    }).catch(() => null);
    const personalizationEnabled = consent?.value?.enabled !== false; // افتراضي مفعّل إن لم يوجد إعداد

    // جلب مقالات حديثة مع الحقول المطلوبة
    const recentArticles = await prisma.articles.findMany({
      where: { status: "published", published_at: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } },
      select: {
        id: true,
        title: true,
        excerpt: true,
        featured_image: true,
        category_id: true,
        published_at: true,
        views: true,
        likes: true,
        shares: true,
        reading_time: true,
      }
    });

    let pageItems: any[] = [];
    let meta: any = { source: "fresh", generatedAt: new Date().toISOString() };

    if (!personalizationEnabled) {
      // خلاصة عامة (بدون تخصيص)
      const generalized = recentArticles
        .map(a => ({
          ...a,
          score: Math.log1p((a.views || 0) + (a.likes || 0) * 2) + (a.published_at ? decayByHours(a.published_at) : 0)
        }))
        .sort((x, y) => y.score - x.score);
      pageItems = generalized.slice(offset, offset + limit);
      meta.reason = "personalization_disabled";
    } else {
      // تخصيص بالاعتماد على الاهتمامات + التفاعلات
      const [interests, liked, saved] = await Promise.all([
        prisma.user_interests.findMany({ where: { user_id: user.id }, select: { category_id: true } }),
        prisma.UserInteractions.findMany({ where: { user_id: user.id, interaction_type: "like" }, select: { article_id: true } }),
        prisma.UserInteractions.findMany({ where: { user_id: user.id, interaction_type: "save" }, select: { article_id: true } })
      ]);
      const interestSet = new Set(interests.filter(i => !!i.category_id).map(i => String(i.category_id)));
      const likedSet = new Set(liked.map(l => l.article_id));
      const savedSet = new Set(saved.map(s => s.article_id));

      const scored = recentArticles.map((a) => {
        const inInterest = a.category_id && interestSet.has(String(a.category_id)) ? 1 : 0;
        const isLiked = likedSet.has(a.id) ? 1 : 0;
        const isSaved = savedSet.has(a.id) ? 1 : 0;
        const trending = Math.log1p((a.views || 0) + (a.likes || 0) * 3 + (a.shares || 0) * 2);
        const recency = a.published_at ? decayByHours(a.published_at) : 0;
        const score = 3 * inInterest + 2 * isLiked + 1.5 * isSaved + 1.2 * trending + 1.0 * recency;
        return { ...a, score };
      });

      // تنويع بسيط: منع أكثر من 3 متتالية من نفس التصنيف
      const sorted = scored.sort((x, y) => y.score - x.score);
      const diversified: typeof sorted = [] as any;
      const catStreak = new Map<string, number>();
      for (const it of sorted) {
        const key = String(it.category_id ?? "");
        const current = catStreak.get(key) || 0;
        if (current >= 3) continue;
        diversified.push(it);
        catStreak.set(key, current + 1);
      }
      pageItems = diversified.slice(offset, offset + limit);
    }

    if (redis && personalizationEnabled) {
      await redis.set(cacheKey, JSON.stringify(pageItems), "EX", 300);
    }

    await prisma.$disconnect();
    return NextResponse.json({ items: pageItems, nextOffset: pageItems.length === limit ? offset + limit : null, meta }, { headers: { "Cache-Control": "no-store" } });
  } catch (e: any) {
    if (String(e?.message || e).includes("Unauthorized")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}


