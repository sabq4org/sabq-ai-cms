import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // استخراج المعاملات
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const status = searchParams.get("status") || "published";
    const categoryId = searchParams.get("category");
    const categorySlug = searchParams.get("category_slug");
    const authorId = searchParams.get("author");
    const search = searchParams.get("search");
    const articleType = searchParams.get("article_type") || "news";
    const sort = searchParams.get("sort") || "published_at";
    const order = searchParams.get("order") || "desc";
    const featured = searchParams.get("featured");
    const breaking = searchParams.get("breaking");
    const includeCategories = searchParams.get("include_categories") === "true";

    const skip = (page - 1) * limit;

    console.log("📰 [News API] جلب الأخبار مع المعاملات:", {
      page,
      limit,
      status,
      categoryId,
      categorySlug,
      articleType,
    });

    // بناء شروط البحث
    const where: any = {
      article_type: articleType,
    };

    // تصفية الحالة
    if (status !== "all") {
      where.status = status;
    }

    // تصفية حسب التصنيف
    if (categoryId) {
      where.category_id = categoryId;
    }

    if (categorySlug) {
      where.categories = {
        slug: categorySlug,
      };
    }

    // تصفية حسب المؤلف (نظام مزدوج)
    if (authorId) {
      where.OR = [{ author_id: authorId }, { article_author_id: authorId }];
    }

    // البحث النصي
    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { content: { contains: search, mode: "insensitive" } },
        { summary: { contains: search, mode: "insensitive" } },
      ];
    }

    // تصفية المقالات المميزة
    if (featured === "true") {
      where.featured = true;
    }

    // تصفية الأخبار العاجلة
    if (breaking === "true") {
      where.breaking = true;
    }

    // إعداد الترتيب
    const orderBy: any = {};
    orderBy[sort] = order;

    console.log("🔍 [News API] شروط البحث:", where);

    // جلب المقالات مع العلاقات
    const articles = await prisma.articles.findMany({
      where,
      include: {
        categories: true,
        author: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        article_author: {
          select: {
            id: true,
            full_name: true,
            email: true,
            bio: true,
          },
        },
      },
      orderBy,
      skip,
      take: limit,
    });

    console.log(`✅ [News API] تم جلب ${articles.length} مقال`);

    // تحويل البيانات للتنسيق المطلوب
    const formattedArticles = articles.map((article) => {
      // منطق اختيار المؤلف (النظام الجديد له الأولوية)
      const selectedAuthor = article.article_author || article.author;
      const authorName =
        article.article_author?.full_name || article.author?.name || "غير محدد";

      return {
        id: article.id,
        title: article.title,
        content: article.content,
        summary: article.summary,
        image: article.featured_image,
        image_url: article.featured_image,
        status: article.status,
        article_type: article.article_type,
        is_featured: article.featured,
        is_breaking: article.breaking,
        published_at: article.published_at,
        created_at: article.created_at,
        updated_at: article.updated_at,
        view_count: article.views,
        reading_time: article.reading_time,

        // معلومات التصنيف
        category: article.categories
          ? {
              id: article.categories.id,
              name: article.categories.name,
              slug: article.categories.slug,
              color: article.categories.color,
            }
          : null,

        // معلومات المؤلف مع الأولوية للنظام الجديد
        author: selectedAuthor
          ? {
              id: selectedAuthor.id,
              name: authorName,
              email: selectedAuthor.email,
              bio: article.article_author?.bio,
              avatar_url: null,
            }
          : null,

        // معرفات للمراجع
        category_id: article.category_id,
        author_id: article.author_id,
        article_author_id: article.article_author_id,
      };
    });

    // جلب العدد الإجمالي للصفحات
    const totalCount = await prisma.articles.count({ where });
    const totalPages = Math.ceil(totalCount / limit);

    const response = {
      success: true,
      articles: formattedArticles,
      pagination: {
        current_page: page,
        total_pages: totalPages,
        total_count: totalCount,
        per_page: limit,
        has_next: page < totalPages,
        has_prev: page > 1,
      },
      filters: {
        status,
        category_id: categoryId,
        category_slug: categorySlug,
        author_id: authorId,
        search,
        article_type: articleType,
        sort,
        order,
      },
    };

    console.log("📊 [News API] استجابة تحتوي على:", {
      articlesCount: formattedArticles.length,
      totalCount,
      currentPage: page,
      totalPages,
    });

    return NextResponse.json(response);
  } catch (error) {
    console.error("❌ [News API] خطأ في جلب الأخبار:", error);

    return NextResponse.json(
      {
        success: false,
        error: "فشل في جلب الأخبار",
        details: error instanceof Error ? error.message : "خطأ غير معروف",
      },
      { status: 500 }
    );
  }
}
