import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

const prisma = new PrismaClient();

// جلب مقال محدد
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ angleId: string; articleId: string }> }
) {
  try {
    const { angleId, articleId } = await params;

    console.log("🔍 [GET Article] angleId:", angleId, "articleId:", articleId);

    // جلب المقال مع التحقق من انتمائه للزاوية
    const article = await prisma.muqtarabArticle.findFirst({
      where: {
        id: articleId,
        corner_id: angleId,
      },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
        corner: {
          select: {
            id: true,
            name: true,
            slug: true,
            theme_color: true,
            author_name: true,
            description: true,
          },
        },
      },
    });

    if (!article) {
      return NextResponse.json(
        { success: false, error: "المقال غير موجود" },
        { status: 404 }
      );
    }

    // تحديث عدد المشاهدات
    await prisma.muqtarabArticle.update({
      where: { id: articleId },
      data: { view_count: { increment: 1 } },
    });

    // تنسيق البيانات
    const formattedArticle = {
      id: article.id,
      angleId: article.corner_id,
      title: article.title,
      slug: article.slug,
      content: article.content,
      excerpt: article.excerpt,
      coverImage: article.cover_image,
      authorId: article.created_by,
      author: article.creator
        ? {
            id: article.creator.id,
            name: article.creator.name,
            email: article.creator.email,
            avatar: article.creator.avatar,
          }
        : null,
      corner: {
        id: article.corner.id,
        title: article.corner.name,
        slug: article.corner.slug,
        themeColor: article.corner.theme_color,
        author: {
          name: article.corner.author_name,
        },
        description: article.corner.description,
      },
      tags: article.tags,
      sentiment: article.ai_sentiment,
      isPublished: article.status === "published",
      publishDate: article.publish_at,
      readingTime: article.read_time,
      views: article.view_count,
      likes: article.like_count,
      comments: article.comment_count,
      createdAt: article.created_at,
      updatedAt: article.updated_at,
    };

    console.log(
      "✅ [GET Article] تم جلب المقال بنجاح:",
      formattedArticle.title
    );

    return NextResponse.json({
      success: true,
      article: formattedArticle,
    });
  } catch (error: any) {
    console.error("❌ [GET Article] خطأ في جلب المقال:", error);
    return NextResponse.json(
      {
        success: false,
        error: "حدث خطأ في جلب المقال",
        details:
          process.env.NODE_ENV === "development" ? error?.message : undefined,
      },
      { status: 500 }
    );
  }
}

// تحديث مقال
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ angleId: string; articleId: string }> }
) {
  try {
    const { angleId, articleId } = await params;
    const body = await request.json();

    console.log("📝 [PUT Article] تحديث المقال:", articleId);
    console.log("📝 [PUT Article] البيانات المُستلمة:", body);

    // التحقق من الحقول المطلوبة
    if (!body.title?.trim() || !body.content?.trim()) {
      return NextResponse.json(
        { success: false, error: "العنوان والمحتوى مطلوبان" },
        { status: 400 }
      );
    }

    // التحقق من وجود الزاوية
    const angleExists = await prisma.$queryRaw`
      SELECT id FROM angles WHERE id = ${angleId}::uuid
    `;

    if (!Array.isArray(angleExists) || angleExists.length === 0) {
      return NextResponse.json(
        { success: false, error: "الزاوية غير موجودة" },
        { status: 404 }
      );
    }

    // التحقق من وجود المقال
    const articleExists = await prisma.$queryRaw`
      SELECT id FROM angle_articles
      WHERE id = ${articleId}::uuid AND angle_id = ${angleId}::uuid
    `;

    if (!Array.isArray(articleExists) || articleExists.length === 0) {
      return NextResponse.json(
        { success: false, error: "المقال غير موجود" },
        { status: 404 }
      );
    }

    // تحديث المقال
    const updateResult = (await prisma.$queryRaw`
      UPDATE angle_articles SET
        title = ${body.title},
        content = ${body.content},
        excerpt = ${body.excerpt || null},
        sentiment = ${body.sentiment || "neutral"},
        tags = ${body.tags || []},
        cover_image = ${body.coverImage || null},
        is_published = ${body.isPublished || false},
        publish_date = ${body.publishDate ? new Date(body.publishDate) : null},
        reading_time = ${body.readingTime || 0},
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${articleId}::uuid AND angle_id = ${angleId}::uuid
      RETURNING *
    `) as any[];

    if (!updateResult || updateResult.length === 0) {
      return NextResponse.json(
        { success: false, error: "فشل في تحديث المقال" },
        { status: 500 }
      );
    }

    const updatedArticle = updateResult[0];

    // تنسيق البيانات المُحدثة
    const formattedArticle = {
      id: updatedArticle.id,
      angleId: updatedArticle.angle_id,
      title: updatedArticle.title,
      content: updatedArticle.content,
      excerpt: updatedArticle.excerpt,
      authorId: updatedArticle.author_id,
      sentiment: updatedArticle.sentiment,
      tags: Array.isArray(updatedArticle.tags) ? updatedArticle.tags : [],
      coverImage: updatedArticle.cover_image,
      isPublished: updatedArticle.is_published,
      publishDate: updatedArticle.publish_date,
      readingTime: Number(updatedArticle.reading_time) || 0,
      views: Number(updatedArticle.views) || 0,
      createdAt: updatedArticle.created_at,
      updatedAt: updatedArticle.updated_at,
    };

    console.log(
      "✅ [PUT Article] تم تحديث المقال بنجاح:",
      formattedArticle.title
    );

    return NextResponse.json({
      success: true,
      message: body.isPublished
        ? "تم نشر المقال بنجاح"
        : "تم حفظ التعديلات بنجاح",
      article: formattedArticle,
    });
  } catch (error) {
    console.error("❌ [PUT Article] خطأ في تحديث المقال:", error);
    return NextResponse.json(
      {
        success: false,
        error: "حدث خطأ في تحديث المقال",
        details:
          process.env.NODE_ENV === "development"
            ? (error as Error)?.message
            : undefined,
      },
      { status: 500 }
    );
  }
}

// حذف مقال
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ angleId: string; articleId: string }> }
) {
  try {
    const { angleId, articleId } = await params;

    console.log("🗑️ [DELETE Article] حذف المقال:", articleId);

    // التحقق من وجود المقال
    const articleExists = (await prisma.$queryRaw`
      SELECT id, title FROM angle_articles
      WHERE id = ${articleId}::uuid AND angle_id = ${angleId}::uuid
    `) as any[];

    if (!articleExists || articleExists.length === 0) {
      return NextResponse.json(
        { success: false, error: "المقال غير موجود" },
        { status: 404 }
      );
    }

    const articleTitle = articleExists[0].title;

    // حذف المقال
    await prisma.$queryRaw`
      DELETE FROM angle_articles
      WHERE id = ${articleId}::uuid AND angle_id = ${angleId}::uuid
    `;

    console.log("✅ [DELETE Article] تم حذف المقال بنجاح:", articleTitle);

    return NextResponse.json({
      success: true,
      message: "تم حذف المقال بنجاح",
    });
  } catch (error) {
    console.error("❌ [DELETE Article] خطأ في حذف المقال:", error);
    return NextResponse.json(
      {
        success: false,
        error: "حدث خطأ في حذف المقال",
        details:
          process.env.NODE_ENV === "development"
            ? (error as Error)?.message
            : undefined,
      },
      { status: 500 }
    );
  }
}
