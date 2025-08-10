import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "12");
    const sortBy = searchParams.get("sortBy") || "newest";

    const skip = (page - 1) * limit;

    let orderBy: any = { publish_at: "desc" };
    if (sortBy === "popular") {
      orderBy = { view_count: "desc" };
    }

    const where: any = {
      status: "published",
      publish_at: {
        lte: new Date(),
      },
    };

    const [articles, totalCount, featuredCount, totalViews] =
      await prisma.$transaction([
        prisma.muqtarabArticle.findMany({
          where,
          skip,
          take: limit,
          orderBy,
          distinct: ["slug"], // إضافة distinct للتأكد من عدم التكرار
          include: {
            corner: true,
            creator: {
              select: {
                id: true,
                name: true,
                avatar: true,
              },
            },
          },
        }),
        prisma.muqtarabArticle.count({ where }),
        prisma.muqtarabArticle.count({
          where: { ...where, is_featured: true },
        }),
        prisma.muqtarabArticle.aggregate({
          where,
          _sum: { view_count: true },
        }),
      ]);

    const formattedArticles = articles.map((article) => ({
      id: article.id,
      title: article.title,
      excerpt: article.excerpt || "",
      slug: article.slug,
      coverImage: article.cover_image,
      readingTime: article.read_time,
      publishDate: article.publish_at,
      views: article.view_count,
      tags: article.tags,
      angle: {
        id: article.corner.id,
        title: article.corner.name,
        slug: article.corner.slug,
        themeColor: article.corner.theme_color,
      },
      author: {
        id: article.creator?.id,
        name: article.creator?.name || "فريق التحرير",
        avatar: article.creator?.avatar,
      },
      link: `/muqtarab/articles/${article.slug}`,
      isFeatured: article.is_featured,
      isRecent: article.publish_at > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // نشر في آخر 7 أيام
    }));

    const res = NextResponse.json({
      success: true,
      articles: formattedArticles,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalCount / limit),
        totalCount,
        limit,
      },
      stats: {
        totalArticles: totalCount,
        featuredCount: featuredCount,
        recentCount: articles.length,
        totalViews: totalViews._sum.view_count || 0,
      },
    });
    // تمكين كاش CDN قصير للمحتوى العام
    // رفع أوقات الكاش للمقالات لتقليل الطلبات المتكررة
    res.headers.set("Cache-Control", "public, max-age=120"); // دقيقتين
    res.headers.set("CDN-Cache-Control", "public, s-maxage=7200"); // ساعتين
    res.headers.set(
      "Vercel-CDN-Cache-Control",
      "s-maxage=43200, stale-while-revalidate=7200" // 12 ساعة مع إعادة التحقق بعد ساعتين
    );
    return res;
  } catch (error: any) {
    console.error("❌ [All Muqtarab Articles] خطأ في جلب المقالات:", error);
    return NextResponse.json(
      { success: false, error: "حدث خطأ في جلب مقالات الزوايا" },
      { status: 500 }
    );
  }
}
