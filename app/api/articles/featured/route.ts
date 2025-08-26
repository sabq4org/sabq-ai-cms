import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { retryWithConnection, ensureDbConnected } from "@/lib/prisma";

export const runtime = "nodejs";

// ذاكرة تخزين مؤقت بسيطة
const CACHE_KEY = 'featured_articles';
const CACHE_TTL = 60 * 1000; // 60 ثانية
let cache: { data: any; timestamp: number } | null = null;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get("limit") || "6", 10), 24);
    const withCategories = searchParams.get("withCategories") === "true";

    // التحقق من الذاكرة المؤقتة
    if (cache && cache.timestamp > Date.now() - CACHE_TTL) {
      const cachedData = cache.data.slice(0, limit);
      const res = NextResponse.json({ ok: true, data: cachedData, count: cachedData.length, cached: true });
      res.headers.set("Cache-Control", "public, max-age=0, s-maxage=60, stale-while-revalidate=300");
      res.headers.set("CDN-Cache-Control", "max-age=60");
      res.headers.set("Vercel-CDN-Cache-Control", "max-age=60");
      return res;
    }

    const now = new Date();

    await ensureDbConnected();

    // بناء الحقول ديناميكياً لتجنّب join ثقيل عند عدم الحاجة
    const selectFields: any = {
      id: true,
      title: true,
      slug: true,
      excerpt: true,
      featured_image: true,
      social_image: true,
      metadata: true,
      published_at: true,
      views: true,
      breaking: true,
    };
    if (withCategories) {
      selectFields.categories = { select: { id: true, name: true, slug: true, color: true } };
    }

    const featured = await retryWithConnection(async () =>
      await prisma.articles.findMany({
        where: {
          status: "published",
          OR: [
            { featured: true },
            { breaking: true },
          ],
          AND: [
            {
              OR: [
                { published_at: { lte: now } },
                { published_at: null },
              ],
            },
          ],
        },
        orderBy: [
          { breaking: "desc" },
          { featured: "desc" },
          { published_at: "desc" },
          { views: "desc" }
        ],
        take: limit,
        select: selectFields,
      })
    );

    // حفظ في الذاكرة المؤقتة
    cache = { data: featured, timestamp: Date.now() };

    const res = NextResponse.json({ ok: true, data: featured, count: featured.length });
    res.headers.set("Cache-Control", "public, max-age=0, s-maxage=60, stale-while-revalidate=300");
    res.headers.set("CDN-Cache-Control", "max-age=60");
    res.headers.set("Vercel-CDN-Cache-Control", "max-age=60");
    return res;
  } catch (error: any) {
    console.error("❌ [featured] خطأ في جلب المقالات المميزة:", error);
    return NextResponse.json({ ok: true, data: [], fallback: true }, { status: 200 });
  }
}


