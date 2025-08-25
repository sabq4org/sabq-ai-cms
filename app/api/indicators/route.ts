import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { ensureDbConnected, retryWithConnection } from "@/lib/prisma";
import { cache as redis } from "@/lib/redis";

export const runtime = "nodejs";

const CACHE_KEY = "site:indicators:v1";
const CACHE_TTL = 120; // ثانيتان دقيقتان

export async function GET(_req: NextRequest) {
  try {
    // جرّب من الكاش أولاً
    const cached = await redis.get(CACHE_KEY);
    if (cached) {
      return NextResponse.json({ success: true, cached: true, ...cached });
    }

    await ensureDbConnected();

    const now = new Date();
    const since24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const since7d = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const since2h = new Date(now.getTime() - 2 * 60 * 60 * 1000);
    const prev2hStart = new Date(now.getTime() - 4 * 60 * 60 * 1000);
    const prev2hEnd = since2h;

    // 1) الأكثر نقاشاً (تعليقات خلال 24 ساعة)
    const commentsGrouped = await retryWithConnection(async () =>
      prisma.comments.groupBy({
        by: ["article_id"],
        where: { created_at: { gte: since24h } },
        _count: { article_id: true },
        orderBy: { _count: { article_id: "desc" } },
        take: 5,
      })
    );
    const discussedIds = commentsGrouped.map((c: any) => c.article_id).filter(Boolean);
    const discussedArticles = discussedIds.length
      ? await retryWithConnection(async () =>
          prisma.articles.findMany({
            where: { id: { in: discussedIds } },
            select: {
              id: true,
              title: true,
              slug: true,
              categories: { select: { id: true, name: true, slug: true } },
            },
          })
        )
      : [];
    const discussedMap = new Map(discussedArticles.map((a) => [a.id, a]));
    const topDiscussed = commentsGrouped.map((g: any) => ({
      articleId: g.article_id,
      commentsCount: g._count.article_id,
      title: discussedMap.get(g.article_id)?.title || "",
      slug: discussedMap.get(g.article_id)?.slug || String(g.article_id),
      category: discussedMap.get(g.article_id)?.categories || null,
    }));

    // 2) الأكثر مشاهدة (آخر 7 أيام حسب الحقل التراكمي views)
    const topViewedRaw = await retryWithConnection(async () =>
      prisma.articles.findMany({
        where: { status: "published", published_at: { gte: since7d } },
        orderBy: [{ views: "desc" }, { published_at: "desc" }],
        take: 5,
        select: {
          id: true,
          title: true,
          slug: true,
          views: true,
          categories: { select: { id: true, name: true, slug: true } },
        },
      })
    );
    const topViewed = topViewedRaw.map((a) => ({
      articleId: a.id,
      title: a.title,
      slug: a.slug || String(a.id),
      views: a.views || 0,
      category: a.categories || null,
    }));

    // 3) الأكثر إعجاباً (اعتماداً على حقل likes التراكمي)
    const topLikedRaw = await retryWithConnection(async () =>
      prisma.articles.findMany({
        where: { status: "published", published_at: { gte: since7d } },
        orderBy: [{ likes: "desc" }, { published_at: "desc" }],
        take: 5,
        select: {
          id: true,
          title: true,
          slug: true,
          likes: true,
          categories: { select: { id: true, name: true, slug: true } },
        },
      })
    );
    const topLiked = topLikedRaw.map((a) => ({
      articleId: a.id,
      title: a.title,
      slug: a.slug || String(a.id),
      likes: (a as any).likes || 0,
      category: a.categories || null,
    }));

    // 4) الصاعد (نمو التفاعل القريب: تفاعلات آخر ساعتين مقارنة بالساعتين السابقتين)
    // نستخدم جدول interactions (like/save) كمؤشر تفاعل في حال عدم تسجيل المشاهدة كـ interaction
    const recentEngagement = await retryWithConnection(async () =>
      prisma.interactions.groupBy({
        by: ["article_id"],
        where: {
          created_at: { gte: since2h },
          type: { in: ["like", "save", "share"] as any },
        },
        _count: { article_id: true },
        orderBy: { _count: { article_id: "desc" } },
        take: 10,
      })
    );
    const prevEngagement = await retryWithConnection(async () =>
      prisma.interactions.groupBy({
        by: ["article_id"],
        where: {
          created_at: { gte: prev2hStart, lt: prev2hEnd },
          type: { in: ["like", "save", "share"] as any },
        },
        _count: { article_id: true },
      })
    );
    const prevMap = new Map(prevEngagement.map((x: any) => [x.article_id, x._count.article_id]));
    const trendingIds = recentEngagement.map((x: any) => x.article_id);
    const trendingArticles = trendingIds.length
      ? await retryWithConnection(async () =>
          prisma.articles.findMany({
            where: { id: { in: trendingIds } },
            select: {
              id: true,
              title: true,
              slug: true,
              categories: { select: { id: true, name: true, slug: true } },
            },
          })
        )
      : [];
    const trendingMap = new Map(trendingArticles.map((a) => [a.id, a]));
    const trendingUp = recentEngagement
      .map((r: any) => {
        const prev = prevMap.get(r.article_id) || 0;
        const ratio = prev > 0 ? Number((r._count.article_id / prev).toFixed(2)) : r._count.article_id > 0 ? 999 : 0;
        const info = trendingMap.get(r.article_id);
        return {
          articleId: r.article_id,
          title: info?.title || "",
          slug: info?.slug || String(r.article_id),
          recentEngagement: r._count.article_id,
          changeRatio: ratio,
          category: info?.categories || null,
        };
      })
      .sort((a, b) => (b.changeRatio || 0) - (a.changeRatio || 0))
      .slice(0, 5);

    // 5) مؤشرات حسب القسم (عدد المقالات المنشورة لكل قسم خلال 24 ساعة)
    const byCategoryCounts = await retryWithConnection(async () =>
      prisma.articles.groupBy({
        by: ["category_id"],
        where: {
          status: "published",
          published_at: { gte: since24h },
        },
        _count: { category_id: true },
        orderBy: { _count: { category_id: "desc" } },
        take: 8,
      })
    );
    const categoryIds = byCategoryCounts.map((x: any) => x.category_id).filter(Boolean);
    const categories = categoryIds.length
      ? await retryWithConnection(async () =>
          prisma.categories.findMany({
            where: { id: { in: categoryIds as any } },
            select: { id: true, name: true, slug: true },
          })
        )
      : [];
    const catMap = new Map(categories.map((c) => [c.id, c]));
    const byCategory = byCategoryCounts.map((c: any) => ({
      categoryId: c.category_id,
      name: catMap.get(c.category_id)?.name || "",
      slug: catMap.get(c.category_id)?.slug || "",
      count: c._count.category_id,
    }));

    // Totals سريعة (للاستخدام إن لزم في الواجهات)
    const [articlesToday, interactions24h, activeUsers30m] = await Promise.all([
      retryWithConnection(async () =>
        prisma.articles.count({
          where: { status: "published", published_at: { gte: since24h } },
        })
      ),
      retryWithConnection(async () =>
        prisma.interactions.count({ where: { created_at: { gte: since24h } } })
      ),
      retryWithConnection(async () =>
        prisma.users.count({
          where: { updated_at: { gte: new Date(Date.now() - 30 * 60 * 1000) } },
        })
      ),
    ]);

    const payload = {
      success: true,
      cached: false,
      updatedAt: now.toISOString(),
      topDiscussed,
      topViewed,
      topLiked,
      trendingUp,
      byCategory,
      totals: { articlesToday, interactions24h, activeUsers30m },
    };

    await redis.set(CACHE_KEY, payload, CACHE_TTL);
    return NextResponse.json(payload);
  } catch (error: any) {
    console.error("❌ [indicators] Error:", error);
    return NextResponse.json({ success: false, error: "server_error" }, { status: 500 });
  }
}


