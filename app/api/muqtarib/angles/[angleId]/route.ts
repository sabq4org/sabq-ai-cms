import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

const prisma = new PrismaClient();

// جلب بيانات زاوية واحدة
export async function GET(
  request: NextRequest,
  { params }: { params: { angleId: string } }
) {
  try {
    const { angleId } = params;

    // جلب بيانات الزاوية مع إحصائيات
    const angleQuery = `
      SELECT
        a.*,
        u.name as author_name,
        u.avatar as author_avatar,
        COUNT(CASE WHEN aa.is_published = true THEN 1 END) as published_articles_count,
        COUNT(aa.id) as total_articles_count,
        SUM(CASE WHEN aa.is_published = true THEN aa.views ELSE 0 END) as total_views,
        AVG(CASE WHEN aa.is_published = true THEN aa.reading_time ELSE NULL END) as avg_reading_time
      FROM angles a
      LEFT JOIN users u ON a.author_id = u.id
      LEFT JOIN angle_articles aa ON a.id = aa.angle_id
      WHERE a.id = $1::uuid
      GROUP BY a.id, u.name, u.avatar
    `;

    const angleResult = (await prisma.$queryRawUnsafe(
      angleQuery,
      angleId
    )) as any[];

    if (angleResult.length === 0) {
      return NextResponse.json(
        { error: "الزاوية غير موجودة" },
        { status: 404 }
      );
    }

    const angle = angleResult[0];

    // جلب أحدث المقالات (آخر 5)
    const recentArticlesQuery = `
      SELECT
        aa.id,
        aa.title,
        aa.excerpt,
        aa.is_published,
        aa.views,
        aa.created_at,
        u.name as author_name
      FROM angle_articles aa
      LEFT JOIN users u ON aa.author_id = u.id
      WHERE aa.angle_id = $1::uuid
      ORDER BY aa.created_at DESC
      LIMIT 5
    `;

    const recentArticles = (await prisma.$queryRawUnsafe(
      recentArticlesQuery,
      angleId
    )) as any[];

    // تنسيق البيانات
    const formattedAngle = {
      id: angle.id,
      title: angle.title,
      slug: angle.slug,
      description: angle.description,
      icon: angle.icon,
      themeColor: angle.theme_color,
      authorId: angle.author_id,
      author: {
        id: angle.author_id,
        name: angle.author_name,
        avatar: angle.author_avatar,
      },
      coverImage: angle.cover_image,
      isFeatured: angle.is_featured,
      isPublished: angle.is_published,
      articlesCount: Number(angle.published_articles_count) || 0,
      totalViews: Number(angle.total_views) || 0,
      avgReadingTime: Number(angle.avg_reading_time) || 0,
      createdAt: angle.created_at,
      updatedAt: angle.updated_at,
      recentArticles: recentArticles.map((article) => ({
        id: article.id,
        title: article.title,
        excerpt: article.excerpt,
        isPublished: article.is_published,
        views: Number(article.views) || 0,
        authorName: article.author_name,
        createdAt: article.created_at,
      })),
    };

    return NextResponse.json({
      success: true,
      angle: formattedAngle,
    });
  } catch (error) {
    console.error("خطأ في جلب بيانات الزاوية:", error);
    return NextResponse.json(
      { error: "حدث خطأ في جلب بيانات الزاوية" },
      { status: 500 }
    );
  } finally {
    // إزالة $disconnect لتجنب مشاكل Concurrent Requests
  }
}

// تحديث بيانات الزاوية
export async function PUT(
  request: NextRequest,
  { params }: { params: { angleId: string } }
) {
  try {
    const { angleId } = params;
    const body = await request.json();

    // التحقق من وجود الزاوية
    const existingAngle = (await prisma.$queryRaw`
      SELECT id FROM angles WHERE id = ${angleId}::uuid
    `) as { id: string }[];

    if (existingAngle.length === 0) {
      return NextResponse.json(
        { error: "الزاوية غير موجودة" },
        { status: 404 }
      );
    }

    // تحديث الزاوية
    const updateQuery = `
      UPDATE angles SET
        title = $1,
        slug = $2,
        description = $3,
        icon = $4,
        theme_color = $5,
        cover_image = $6,
        is_featured = $7,
        is_published = $8,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $9::uuid
      RETURNING *
    `;

    const result = (await prisma.$queryRawUnsafe(
      updateQuery,
      body.title,
      body.slug,
      body.description,
      body.icon || null,
      body.themeColor,
      body.coverImage || null,
      body.isFeatured,
      body.isPublished,
      angleId
    )) as any[];

    const updatedAngle = result[0];

    return NextResponse.json({
      success: true,
      message: "تم تحديث الزاوية بنجاح",
      angle: {
        id: updatedAngle.id,
        title: updatedAngle.title,
        slug: updatedAngle.slug,
        description: updatedAngle.description,
        icon: updatedAngle.icon,
        themeColor: updatedAngle.theme_color,
        authorId: updatedAngle.author_id,
        coverImage: updatedAngle.cover_image,
        isFeatured: updatedAngle.is_featured,
        isPublished: updatedAngle.is_published,
        createdAt: updatedAngle.created_at,
        updatedAt: updatedAngle.updated_at,
      },
    });
  } catch (error) {
    console.error("خطأ في تحديث الزاوية:", error);
    return NextResponse.json(
      { error: "حدث خطأ في تحديث الزاوية" },
      { status: 500 }
    );
  } finally {
    // إزالة $disconnect لتجنب مشاكل Concurrent Requests
  }
}

// حذف الزاوية
export async function DELETE(
  request: NextRequest,
  { params }: { params: { angleId: string } }
) {
  try {
    const { angleId } = params;

    // التحقق من وجود الزاوية
    const existingAngle = (await prisma.$queryRaw`
      SELECT id FROM angles WHERE id = ${angleId}::uuid
    `) as { id: string }[];

    if (existingAngle.length === 0) {
      return NextResponse.json(
        { error: "الزاوية غير موجودة" },
        { status: 404 }
      );
    }

    // حذف الزاوية (سيتم حذف المقالات تلقائياً بسبب CASCADE)
    await prisma.$queryRaw`
      DELETE FROM angles WHERE id = ${angleId}::uuid
    `;

    return NextResponse.json({
      success: true,
      message: "تم حذف الزاوية بنجاح",
    });
  } catch (error) {
    console.error("خطأ في حذف الزاوية:", error);
    return NextResponse.json(
      { error: "حدث خطأ في حذف الزاوية" },
      { status: 500 }
    );
  } finally {
    // إزالة $disconnect لتجنب مشاكل Concurrent Requests
  }
}
