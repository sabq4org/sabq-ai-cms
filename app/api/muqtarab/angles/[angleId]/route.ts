import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

const prisma = new PrismaClient();

// جلب بيانات زاوية واحدة
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ angleId: string }> }
) {
  try {
    const { angleId } = await params;

    // Get corner with detailed analytics and article count
    const cornerData = await prisma.$queryRaw<any[]>`
      SELECT
        mc.*,
        COUNT(ma.id) as article_count,
        AVG(ma.view_count) as avg_views,
        SUM(ma.like_count) as total_likes,
        SUM(ma.comment_count) as total_comments,
        MAX(ma.created_at) as last_article_date
      FROM muqtarab_corners mc
      LEFT JOIN muqtarab_articles ma ON mc.id = ma.corner_id AND ma.status = 'published'
      WHERE mc.id = ${angleId}
      GROUP BY mc.id
    `;

    if (cornerData.length === 0) {
      return NextResponse.json(
        { error: "الزاوية غير موجودة" },
        { status: 404 }
      );
    }

    const corner = cornerData[0];

    // جلب أحدث المقالات (آخر 5)
    const recentArticles = await prisma.muqtarabArticle.findMany({
      where: {
        corner_id: angleId,
        status: "published",
      },
      select: {
        id: true,
        title: true,
        excerpt: true,
        view_count: true,
        created_at: true,
        author_name: true,
      },
      orderBy: {
        created_at: "desc",
      },
      take: 5,
    });

    // تنسيق البيانات
    const formattedAngle = {
      id: corner.id,
      title: corner.name,
      slug: corner.slug,
      description: corner.description,
      icon: null, // Not in schema
      themeColor: corner.theme_color,
      authorId: corner.created_by,
      author: {
        id: corner.created_by,
        name: corner.author_name,
        avatar: null, // Not in schema
      },
      coverImage: corner.cover_image,
      isFeatured: corner.is_featured,
      isPublished: corner.is_active,
      articlesCount: Number(corner.article_count) || 0,
      totalViews: Number(corner.avg_views) || 0,
      totalLikes: Number(corner.total_likes) || 0,
      totalComments: Number(corner.total_comments) || 0,
      createdAt: corner.created_at,
      updatedAt: corner.updated_at,
      recentArticles: recentArticles.map((article) => ({
        id: article.id,
        title: article.title,
        excerpt: article.excerpt,
        views: Number(article.view_count) || 0,
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
  }
}

// تحديث بيانات الزاوية
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ angleId: string }> }
) {
  try {
    const { angleId } = await params;
    const body = await request.json();

    // التحقق من وجود الزاوية وتحديثها
    const updatedCorner = await prisma.muqtarabCorner.update({
      where: {
        id: angleId,
      },
      data: {
        name: body.title,
        slug: body.slug,
        description: body.description,
        theme_color: body.themeColor,
        cover_image: body.coverImage || null,
        is_featured: body.isFeatured,
        is_active: body.isPublished,
        updated_at: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      message: "تم تحديث الزاوية بنجاح",
      angle: {
        id: updatedCorner.id,
        title: updatedCorner.name,
        slug: updatedCorner.slug,
        description: updatedCorner.description,
        themeColor: updatedCorner.theme_color,
        authorId: updatedCorner.created_by,
        coverImage: updatedCorner.cover_image,
        isFeatured: updatedCorner.is_featured,
        isPublished: updatedCorner.is_active,
        createdAt: updatedCorner.created_at,
        updatedAt: updatedCorner.updated_at,
      },
    });
  } catch (error: any) {
    console.error("خطأ في تحديث الزاوية:", error);
    if (error.code === "P2025") {
      return NextResponse.json(
        { error: "الزاوية غير موجودة" },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { error: "حدث خطأ في تحديث الزاوية" },
      { status: 500 }
    );
  }
}

// حذف الزاوية
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ angleId: string }> }
) {
  try {
    const { angleId } = await params;

    // حذف الزاوية (المقالات ستحذف تلقائياً بسبب onDelete: Cascade)
    await prisma.muqtarabCorner.delete({
      where: {
        id: angleId,
      },
    });

    return NextResponse.json({
      success: true,
      message: "تم حذف الزاوية بنجاح",
    });
  } catch (error: any) {
    console.error("خطأ في حذف الزاوية:", error);
    if (error.code === "P2025") {
      return NextResponse.json(
        { error: "الزاوية غير موجودة" },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { error: "حدث خطأ في حذف الزاوية" },
      { status: 500 }
    );
  }
}
