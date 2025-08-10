import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// استخدام Node.js Runtime لدعم Prisma
export const runtime = "nodejs";

// Cache لمدة 5 دقائق
export const revalidate = 300;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const articleId = searchParams.get("articleId");
    const category = searchParams.get("category");
    const tags = searchParams.get("tags");
    const limit = parseInt(searchParams.get("limit") || "6");

    if (!articleId) {
      return NextResponse.json(
        { error: "Article ID is required" },
        { status: 400 }
      );
    }

    // بناء query للتوصيات
    const whereClause: any = {
      id: { not: articleId }, // استبعاد المقال الحالي
      status: "published",
    };

    // إضافة فلتر الفئة إذا كان موجوداً
    if (category) {
      whereClause.categories = {
        name: category,
      };
    }

    // جلب المقالات المشابهة
    const recommendations = await prisma.articles.findMany({
      where: whereClause,
      select: {
        id: true,
        title: true,
        slug: true,
        excerpt: true,
        featured_image: true,
        published_at: true,
        views: true,
        article_type: true,
        content_type: true,
        categories: {
          select: {
            name: true,
            slug: true,
          },
        },
      },
      orderBy: [
        { views: "desc" }, // الأكثر مشاهدة
        { published_at: "desc" }, // الأحدث
      ],
      take: limit,
    });

    // تحويل البيانات للشكل المطلوب
    const formattedRecommendations = recommendations.map((article) => ({
      id: article.id,
      title: article.title,
      slug: article.slug,
      excerpt: article.excerpt || "",
      image: article.featured_image,
      publishedAt: article.published_at,
      views: article.views || 0,
      category: article.categories?.name || "",
      categorySlug: article.categories?.slug || "",
      type: article.content_type || article.article_type || "news",
      score: Math.floor(Math.random() * 30 + 70), // نقاط توافق عشوائية للعرض
    }));

    // إضافة headers للـ caching
    const response = NextResponse.json({
      success: true,
      recommendations: formattedRecommendations,
      count: formattedRecommendations.length,
    });

    // تعيين Cache headers
    response.headers.set(
      "Cache-Control",
      "public, s-maxage=300, stale-while-revalidate=600"
    );

    return response;
  } catch (error) {
    console.error("Error fetching recommendations:", error);
    
    // في حالة الخطأ، نرجع مقالات افتراضية
    return NextResponse.json({
      success: false,
      recommendations: [],
      error: "Failed to fetch recommendations",
    });
  }
}
