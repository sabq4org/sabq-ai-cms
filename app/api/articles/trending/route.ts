import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { retryWithConnection, ensureDbConnected } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get("limit") || "5", 10), 20);
    const timeframe = (searchParams.get("timeframe") || "24h").toLowerCase();
    const exclude = searchParams.get("exclude");
    const strategy = (searchParams.get("strategy") || "views").toLowerCase();

    const now = new Date();
    let since: Date | null = null;
    if (timeframe === "24h" || timeframe === "day") {
      since = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    } else if (timeframe === "week") {
      since = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    } else if (timeframe === "month") {
      since = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    } else {
      since = null; // all time
    }

    const where: any = {
      status: "published",
      NOT: { status: "deleted" },
      // استبعاد مقالات الرأي إذا رغبت لاحقاً عبر strategy
    };
    if (since) {
      where.published_at = { gte: since };
    }
    if (exclude) {
      where.id = { not: exclude };
    }

    const orderBy: any = {};
    if (strategy === "views" || !strategy) {
      orderBy.views = "desc";
    } else {
      // fallback للترتيب بالمشاهدات حالياً
      orderBy.views = "desc";
    }

    await ensureDbConnected();
    const articles = await retryWithConnection(async () => await prisma.articles.findMany({
      where,
      take: limit,
      orderBy,
      select: {
        id: true,
        title: true,
        slug: true,
        featured_image: true,
        published_at: true,
        views: true,
        reading_time: true,
        categories: {
          select: { id: true, name: true, slug: true, color: true },
        },
      },
    }));

    const formatted = articles.map((a: any) => ({
      id: String(a.id),
      title: a.title,
      featured_image: a.featured_image,
      image_url: a.featured_image,
      published_at: a.published_at,
      views: a.views || 0,
      reading_time: a.reading_time || null,
      category: a.categories
        ? { name: a.categories.name, color: a.categories.color }
        : null,
    }));

    const response = NextResponse.json({ success: true, articles: formatted });
    response.headers.set("Cache-Control", "public, s-maxage=60, stale-while-revalidate=120");
    return response;
  } catch (error: any) {
    console.error("❌ [Trending API] خطأ:", error);
    return NextResponse.json(
      { success: false, error: "حدث خطأ في جلب المقالات الرائجة" },
      { status: 500 }
    );
  }
}


