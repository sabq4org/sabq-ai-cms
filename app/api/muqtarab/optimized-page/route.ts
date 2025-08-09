import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  try {
    const [corners, heroArticle, featuredArticles, statsAggregation] =
      await Promise.all([
        // Fetch active corners with article counts
        prisma.muqtarabCorner.findMany({
          where: { is_active: true },
          include: { _count: { select: { articles: true } } },
          orderBy: { created_at: "desc" },
        }),
        // Fetch the latest featured article
        prisma.muqtarabArticle.findFirst({
          where: { is_featured: true, status: "published" },
          orderBy: { publish_at: "desc" },
          include: { corner: true, creator: true },
        }),
        // Fetch recent articles
        prisma.muqtarabArticle.findMany({
          where: { status: "published" },
          take: 6,
          orderBy: { publish_at: "desc" },
          include: { corner: true, creator: true },
        }),
        // Fetch overall stats
        prisma.muqtarabArticle.aggregate({
          _sum: { view_count: true },
          _count: { id: true },
        }),
      ]);

    const totalAngles = await prisma.muqtarabCorner.count();
    const totalViews = statsAggregation._sum.view_count || 0;

    const stats = {
      totalAngles,
      publishedAngles: corners.length,
      totalArticles: statsAggregation._count.id || 0,
      publishedArticles: statsAggregation._count.id || 0,
      totalViews: totalViews,
      displayViews: {
        raw: totalViews,
        formatted:
          totalViews > 1000
            ? `${(totalViews / 1000).toFixed(1)}k`
            : totalViews.toString(),
      },
    };

    return NextResponse.json({
      success: true,
      angles: corners.map((c) => ({ ...c, articlesCount: c._count.articles })),
      heroArticle,
      featuredArticles,
      stats: stats,
      cached: false,
    });
  } catch (error: any) {
    console.error("❌ [Optimized Muqtarab Page] Error fetching data:", error);
    // Return a default structure on error to prevent client-side crashes
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch data",
        angles: [],
        heroArticle: null,
        featuredArticles: [],
        stats: {
          totalAngles: 0,
          publishedAngles: 0,
          totalArticles: 0,
          publishedArticles: 0,
          totalViews: 0,
          displayViews: { raw: 0, formatted: "0" },
        },
      },
      { status: 500 }
    );
  }
}
