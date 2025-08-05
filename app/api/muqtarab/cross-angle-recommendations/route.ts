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
        aa.*,
        a.title as angle_title,
        a.slug as angle_slug,
        a.icon as angle_icon,
        a.theme_color as angle_theme_color,
        u.name as author_name,
        u.avatar as author_avatar
      FROM angle_articles aa
      JOIN angles a ON aa.angle_id = a.id
      LEFT JOIN users u ON aa.author_id = u.id
      WHERE a.is_published = true
        AND aa.is_published = true
        AND a.id != $1::uuid
        ${currentArticleId ? "AND aa.id != $2::uuid" : ""}
      ORDER BY
        aa.views DESC,
        aa.created_at DESC
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
      angleId: article.angle_id,
      title: article.title,
      slug: article.id, // استخدام ID كـ slug
      content: article.content,
      excerpt: article.excerpt,
      authorId: article.author_id,
      author: {
        id: article.author_id,
        name: article.author_name,
        avatar: article.author_avatar,
      },
      angle: {
        id: article.angle_id,
        title: article.angle_title,
        slug: article.angle_slug,
        icon: article.angle_icon,
        themeColor: article.angle_theme_color,
      },
      sentiment: article.sentiment,
      tags: Array.isArray(article.tags)
        ? article.tags
        : typeof article.tags === "string"
        ? JSON.parse(article.tags || "[]")
        : [],
      coverImage: article.cover_image,
      isPublished: article.is_published,
      publishDate: article.publish_date,
      readingTime: Number(article.reading_time) || 0,
      views: Number(article.views) || 0,
      createdAt: article.created_at,
      updatedAt: article.updated_at,
    }));

    return NextResponse.json({
      success: true,
      articles: formattedArticles,
      totalFound: formattedArticles.length,
    });
  } catch (error) {
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
