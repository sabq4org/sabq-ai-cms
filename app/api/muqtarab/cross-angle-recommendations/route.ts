import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

const prisma = new PrismaClient();

// جلب مقالات مقترحة من زوايا مختلفة
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const currentAngleId = searchParams.get("currentAngleId");
    const currentArticleId = searchParams.get("currentArticleId");
    const limit = parseInt(searchParams.get("limit") || "3");

    if (!currentAngleId) {
      return NextResponse.json(
        { success: false, error: "معرف الزاوية الحالية مطلوب" },
        { status: 400 }
      );
    }

    console.log(
      "🔍 [Cross-Angle Recommendations] الزاوية الحالية:",
      currentAngleId
    );

    // جلب مقالات من زوايا أخرى (مستثنياً الزاوية الحالية)
    const articlesQuery = `
      SELECT
        ma.*,
        mc.name as angle_title,
        mc.slug as angle_slug,
        null as angle_icon,
        mc.theme_color as angle_theme_color,
        u.name as author_name,
        u.avatar as author_avatar
      FROM muqtarab_articles ma
      JOIN muqtarab_corners mc ON ma.corner_id = mc.id
      LEFT JOIN users u ON ma.created_by = u.id
      WHERE mc.is_active = true
        AND ma.status = 'published'
        AND mc.id != $1
        ${currentArticleId ? "AND ma.id != $2" : ""}
      ORDER BY
        ma.view_count DESC,
        ma.created_at DESC
      LIMIT $${currentArticleId ? "3" : "2"}
    `;

    const queryParams = currentArticleId
      ? [currentAngleId, currentArticleId, limit]
      : [currentAngleId, limit];

    console.log("📊 [Cross-Angle Recommendations] SQL Query:", articlesQuery);
    console.log("📊 [Cross-Angle Recommendations] Params:", queryParams);

    const articles = (await prisma.$queryRawUnsafe(
      articlesQuery,
      ...queryParams
    )) as any[];

    console.log(
      "✅ [Cross-Angle Recommendations] عثر على",
      articles.length,
      "مقال من زوايا مختلفة"
    );

    // تنسيق البيانات
    const formattedArticles = articles.map((article) => ({
      id: article.id,
      angleId: article.corner_id,
      title: article.title,
      slug: article.slug,
      content: article.content,
      excerpt: article.excerpt,
      authorId: article.created_by,
      author: {
        id: article.created_by,
        name: article.author_name,
        avatar: article.author_avatar,
      },
      angle: {
        id: article.corner_id,
        title: article.angle_title,
        slug: article.angle_slug,
        icon: article.angle_icon,
        themeColor: article.angle_theme_color,
      },
      sentiment: article.ai_sentiment,
      tags: article.tags || [],
      coverImage: article.cover_image,
      isPublished: article.status === "published",
      publishDate: article.publish_at,
      readingTime: Number(article.read_time) || 0,
      views: Number(article.view_count) || 0,
      createdAt: article.created_at,
      updatedAt: article.updated_at,
    }));

    return NextResponse.json({
      success: true,
      articles: formattedArticles,
      totalFound: formattedArticles.length,
    });
  } catch (error: any) {
    console.error(
      "❌ [Cross-Angle Recommendations] خطأ في جلب المقالات:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error: "حدث خطأ في جلب المقالات المقترحة",
        details:
          process.env.NODE_ENV === "development" ? error?.message : undefined,
      },
      { status: 500 }
    );
  } finally {
    // تجنب إغلاق اتصال Prisma لمنع مشاكل Concurrent Requests
  }
}
