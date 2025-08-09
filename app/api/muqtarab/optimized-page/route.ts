import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  try {
    const [corners, heroArticle, featuredArticles, stats] = await Promise.all([
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
      // Fetch recent articles (can be adjusted)
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

    const formattedStats = {
      totalAngles,
      publishedAngles: corners.length,
      totalArticles: stats._count.id,
      publishedArticles: stats._count.id,
      totalViews: stats._sum.view_count || 0,
      displayViews: {
        raw: stats._sum.view_count || 0,
        formatted: `${((stats._sum.view_count || 0) / 1000).toFixed(1)}k`,
      },
    };

    return NextResponse.json({
      success: true,
      angles: corners.map((c) => ({ ...c, articlesCount: c._count.articles })),
      heroArticle,
      featuredArticles,
      stats: formattedStats,
      cached: false,
    });
  } catch (error: any) {
    console.error("❌ [Optimized Muqtarab Page] Error fetching data:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch data" },
      { status: 500 }
    );
  }
}
