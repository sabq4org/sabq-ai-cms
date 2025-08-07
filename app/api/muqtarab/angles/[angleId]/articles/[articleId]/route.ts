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

    // جلب المقال مع تفاصيل المؤلف (البحث بالـ id أو slug)
    let articles = [];
    
    try {
      // أولاً: محاولة البحث بـ UUID
      articles = (await prisma.$queryRaw`
        SELECT
          aa.*,
          u.name as author_name,
          u.avatar as author_avatar
        FROM angle_articles aa
        LEFT JOIN users u ON aa.author_id = u.id
        WHERE aa.angle_id = ${angleId}::uuid
          AND aa.id = ${articleId}::uuid
      `) as any[];
    } catch (uuidError) {
      console.log("🔍 [GET Article] البحث بـ UUID فشل، محاولة البحث بـ slug...");
      
      // ثانياً: محاولة البحث بـ slug (إذا فشل البحث بـ UUID)
      try {
        articles = (await prisma.$queryRaw`
          SELECT
            aa.*,
            u.name as author_name,
            u.avatar as author_avatar
          FROM angle_articles aa
          LEFT JOIN users u ON aa.author_id = u.id
          WHERE aa.angle_id = ${angleId}::uuid
            AND (aa.slug = ${articleId} OR aa.id::text = ${articleId})
        `) as any[];
      } catch (slugError) {
        console.error("❌ [GET Article] فشل البحث بـ slug أيضاً:", slugError);
        articles = [];
      }
    }

    if (!articles || articles.length === 0) {
      return NextResponse.json(
        { success: false, error: "المقال غير موجود" },
        { status: 404 }
      );
    }

    const article = articles[0];

    // تنسيق البيانات
    const formattedArticle = {
      id: article.id,
      angleId: article.angle_id,
      title: article.title,
      slug: article.id, // استخدام ID كـ slug لأن العمود slug غير موجود
      content: article.content,
      excerpt: article.excerpt,
      authorId: article.author_id,
      author: {
        id: article.author_id,
        name: article.author_name,
        avatar: article.author_avatar,
      },
      sentiment: article.sentiment,
      tags: Array.isArray(article.tags) ? article.tags : [],
      coverImage: article.cover_image,
      isPublished: article.is_published,
      publishDate: article.publish_date,
      readingTime: Number(article.reading_time) || 0,
      views: Number(article.views) || 0,
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
  } catch (error) {
    console.error("❌ [GET Article] خطأ في جلب المقال:", error);
    return NextResponse.json(
      {
        success: false,
        error: "حدث خطأ في جلب المقال",
        details:
          process.env.NODE_ENV === "development" ? (error as Error)?.message : undefined,
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
          process.env.NODE_ENV === "development" ? (error as Error)?.message : undefined,
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
          process.env.NODE_ENV === "development" ? (error as Error)?.message : undefined,
      },
      { status: 500 }
    );
  }
}
