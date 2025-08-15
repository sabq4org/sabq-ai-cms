import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/app/lib/auth";
import getRedisClient from "@/lib/redis-client";

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

    const [interests, liked, saved] = await Promise.all([
      prisma.user_interests.findMany({ where: { user_id: user.id }, select: { category_id: true } }),
      prisma.UserInteractions.findMany({ where: { user_id: user.id, interaction_type: "like" }, select: { article_id: true } }),
      prisma.UserInteractions.findMany({ where: { user_id: user.id, interaction_type: "save" }, select: { article_id: true } })
    ]);

    const interestSet = new Set(interests.filter(i => !!i.category_id).map(i => String(i.category_id)));
    const likedSet = new Set(liked.map(l => l.article_id));
    const savedSet = new Set(saved.map(s => s.article_id));

    const recentArticles = await prisma.articles.findMany({
      where: { status: "published", published_at: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } },
      select: { id: true, category_id: true, published_at: true, views: true, likes: true, shares: true }
    });

    const items = recentArticles.map((a) => {
      const inInterest = a.category_id && interestSet.has(String(a.category_id)) ? 1 : 0;
      const liked = likedSet.has(a.id) ? 1 : 0;
      const saved = savedSet.has(a.id) ? 1 : 0;
      const trending = Math.log1p((a.views || 0) + (a.likes || 0) * 3 + (a.shares || 0) * 2);
      const recency = a.published_at ? decayByHours(a.published_at) : 0;
      const score = 3 * inInterest + 2 * liked + 1.5 * saved + 1.2 * trending + 1.0 * recency;
      return { articleId: a.id, score, categoryId: a.category_id };
    });

    // تنويع بسيط: منع أكثر من 3 متتالية من نفس التصنيف
    const sorted = items.sort((x, y) => y.score - x.score);
    const diversified: typeof sorted = [] as any;
    const catStreak = new Map<string, number>();
    for (const it of sorted) {
      const key = String(it.categoryId ?? "");
      const current = catStreak.get(key) || 0;
      if (current >= 3) continue;
      diversified.push(it);
      catStreak.set(key, current + 1);
    }

    const page = diversified.slice(offset, offset + limit);
    if (redis) {
      await redis.set(cacheKey, JSON.stringify(page), "EX", 300);
    }

    await prisma.$disconnect();
    return NextResponse.json({ items: page, nextOffset: diversified.length > offset + limit ? offset + limit : null, meta: { source: "fresh", generatedAt: new Date().toISOString() } }, { headers: { "Cache-Control": "no-store" } });
  } catch (e: any) {
    if (String(e?.message || e).includes("Unauthorized")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}


