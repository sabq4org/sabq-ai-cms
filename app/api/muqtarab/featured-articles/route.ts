import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    // جلب مقالات مختارة من زوايا مختلفة (بما في ذلك فكر رقمي)
    const featuredArticles = await prisma.$queryRaw`
      SELECT DISTINCT ON (aa.angle_id)
        aa.id,
        aa.title,
        aa.excerpt,
        aa.cover_image,
        aa.reading_time,
        aa.publish_date,
        aa.views,
        aa.tags,
        aa.created_at,
        a.id as angle_id,
        a.title as angle_title,
        a.slug as angle_slug,
        a.icon as angle_icon,
        a.theme_color as angle_theme_color,
        u.name as author_name,
        u.avatar as author_avatar
      FROM angle_articles aa
      LEFT JOIN angles a ON aa.angle_id = a.id
      LEFT JOIN users u ON aa.author_id = u.id
      WHERE aa.is_published = true
        AND a.is_published = true
      ORDER BY aa.angle_id, aa.publish_date DESC, aa.created_at DESC
      LIMIT 6
    ` as any[];

    // تنسيق البيانات
    const formattedArticles = featuredArticles.map((article) => ({
      id: article.id,
      title: article.title,
      excerpt: article.excerpt,
      slug: article.id, // استخدام ID كـ slug
      coverImage: article.cover_image,
      readingTime: Number(article.reading_time) || 3,
      publishDate: article.publish_date,
      views: Number(article.views) || 0,
      tags: Array.isArray(article.tags) ? article.tags : [],
      angle: {
        id: article.angle_id,
        title: article.angle_title,
        slug: article.angle_slug,
        icon: article.angle_icon,
        themeColor: article.angle_theme_color,
      },
      author: {
        name: article.author_name || "كاتب مجهول",
        avatar: article.author_avatar,
      },
      createdAt: article.created_at,
    }));

    console.log("✅ تم جلب المقالات المختارة:", formattedArticles.length);

    return NextResponse.json({
      success: true,
      articles: formattedArticles,
    });
  } catch (error) {
    console.error("❌ خطأ في جلب المقالات المختارة:", error);
    return NextResponse.json(
      {
        success: false,
        error: "حدث خطأ في جلب المقالات المختارة",
        details: error instanceof Error ? error.message : "خطأ غير معروف",
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}