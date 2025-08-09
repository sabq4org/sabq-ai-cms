import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const preferredRegion = "auto";

// تحويل مبسط للمقالات مع select محدد
const transformArticle = (article: any) => {
  if (!article) return null;
  return {
    id: article.id,
    title: article.title,
    slug: article.slug,
    excerpt: article.excerpt,
    coverImage: article.cover_image,
    readingTime: article.read_time || 5,
    publishDate: article.publish_at,
    views: article.view_count || 0,
    angle: {
      id: article.corner.id,
      title: article.corner.name,
      slug: article.corner.slug,
      themeColor: article.corner.theme_color || "#3B82F6",
    },
    author: {
      name: article.author_name || article.creator?.name || "مؤلف",
      avatar: article.author_avatar || article.creator?.avatar,
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
    articlesCount: corner._count?.articles || 0,
  };
};

export async function GET(request: NextRequest) {
  try {
    // استخدام Promise.all مع select محدد لتقليل البيانات المنقولة
    const [corners, heroArticle, featuredArticles, stats] = await Promise.all([
      // جلب الزوايا النشطة مع عدد المقالات فقط
      prisma.muqtarabCorner.findMany({
        where: { is_active: true },
        select: {
          id: true,
          name: true,
          slug: true,
          description: true,
          cover_image: true,
          theme_color: true,
          is_featured: true,
          _count: { select: { articles: true } },
        },
        orderBy: { created_at: "desc" },
        take: 12, // حد أقصى للزوايا
      }),

      // جلب المقال المميز
      prisma.muqtarabArticle.findFirst({
        where: { is_featured: true, status: "published" },
        orderBy: { publish_at: "desc" },
        select: {
          id: true,
          title: true,
          slug: true,
          excerpt: true,
          cover_image: true,
          read_time: true,
          publish_at: true,
          view_count: true,
          author_name: true,
          author_avatar: true,
          corner: {
            select: {
              id: true,
              name: true,
              slug: true,
              theme_color: true,
            },
          },
          creator: {
            select: {
              name: true,
              avatar: true,
            },
          },
        },
      }),

      // جلب المقالات الحديثة
      prisma.muqtarabArticle.findMany({
        where: { status: "published" },
        take: 6,
        orderBy: { publish_at: "desc" },
        select: {
          id: true,
          title: true,
          slug: true,
          excerpt: true,
          cover_image: true,
          read_time: true,
          publish_at: true,
          view_count: true,
          author_name: true,
          author_avatar: true,
          corner: {
            select: {
              id: true,
              name: true,
              slug: true,
              theme_color: true,
            },
          },
          creator: {
            select: {
              name: true,
              avatar: true,
            },
          },
        },
      }),

      // إحصائيات مبسطة - تم تحسينها
      prisma.muqtarabArticle
        .count({
          where: { status: "published" },
        })
        .then((totalCount) => ({
          totalArticles: totalCount,
          totalViews: 0, // سيتم حسابها بشكل منفصل في background job
        })),
    ]);

    const res = NextResponse.json({
      success: true,
      angles: corners.map(transformCorner),
      heroArticle: transformArticle(heroArticle),
      featuredArticles: featuredArticles.map(transformArticle),
      stats: stats,
      cached: true,
    });

    // كاش محسن مع أوقات أطول
    res.headers.set("Cache-Control", "public, max-age=300"); // 5 دقائق
    res.headers.set("CDN-Cache-Control", "public, s-maxage=21600"); // 6 ساعات
    res.headers.set(
      "Vercel-CDN-Cache-Control",
      "s-maxage=86400, stale-while-revalidate=21600" // يوم كامل مع إعادة التحقق بعد 6 ساعات
    );
    res.headers.set("X-Optimized", "true");

    return res;
  } catch (error: any) {
    console.error("❌ [Optimized Muqtarab Page V2] Error:", error);

    // إرجاع بيانات افتراضية عند الخطأ
    return NextResponse.json(
      {
        success: false,
        angles: [],
        heroArticle: null,
        featuredArticles: [],
        stats: { totalArticles: 0, totalViews: 0 },
        error: "حدث خطأ في جلب البيانات",
      },
      {
        status: 500,
        headers: {
          "Cache-Control": "no-cache",
        },
      }
    );
  }
}
