import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

const transformArticle = (article: any) => {
  if (!article) return null;
  const { corner, creator, ...rest } = article;
  return {
    id: rest.id,
    title: rest.title,
    slug: rest.slug,
    excerpt: rest.excerpt,
    content: rest.content,
    coverImage: rest.cover_image,
    readingTime: rest.read_time || 5,
    publishDate: rest.publish_at,
    views: rest.view_count || 0,
    tags: rest.tags || [],
    aiScore: rest.ai_compatibility_score || 70,
    isPublished: rest.status === "published",
    createdAt: rest.created_at,
    angle: corner
      ? {
          id: corner.id,
          title: corner.name,
          slug: corner.slug,
          themeColor: corner.theme_color || "#3B82F6",
        }
      : null,
    author: creator
      ? {
          id: creator.id,
          name: creator.name,
          avatar: creator.avatar,
        }
      : {
          name: rest.author_name || "مؤلف",
          avatar: rest.author_avatar,
        },
  };
};

const transformCorner = (corner: any) => {
  if (!corner) return null;
  return {
    id: corner.id,
    title: corner.name,
    slug: corner.slug,
    description: corner.description,
    coverImage: corner.cover_image,
    themeColor: corner.theme_color || "#3B82F6",
    isFeatured: corner.is_featured || false,
    isPublished: corner.is_active || false,
    articlesCount: corner._count?.articles || 0,
    createdAt: corner.created_at,
    author: {
      name: corner.author_name || "مؤلف",
      bio: corner.author_bio,
    },
  };
};

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

    const res = NextResponse.json({
      success: true,
      angles: corners.map(transformCorner),
      heroArticle: transformArticle(heroArticle),
      featuredArticles: featuredArticles.map(transformArticle),
      stats: stats,
      cached: true,
    });
    // تمكين الكاش على مستوى CDN والمتصفح (يمكن ضبط القيم لاحقاً)
    res.headers.set("Cache-Control", "public, max-age=30");
    res.headers.set("CDN-Cache-Control", "public, s-maxage=180");
    res.headers.set(
      "Vercel-CDN-Cache-Control",
      "s-maxage=300, stale-while-revalidate=600"
    );
    return res;
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
