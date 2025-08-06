import { executeQuery } from "@/lib/prisma-fixed";
import { NextRequest, NextResponse } from "next/server";

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

    console.log("📰 [News API] جلب الأخبار مع المعاملات:", {
      page,
      limit,
      status,
      categoryId,
      categorySlug,
      articleType,
    });

    const skip = (page - 1) * limit;

    // بناء شروط البحث
    const where: any = {
      status,
      article_type: articleType,
    };

    // فلترة حسب التصنيف
    if (categoryId) {
      where.category_id = categoryId;
    }

    if (categorySlug) {
      where.categories = {
        slug: categorySlug,
      };
    }

    // فلترة حسب المؤلف
    if (authorId) {
      where.author_id = authorId;
    }

    // البحث النصي
    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { content: { contains: search, mode: "insensitive" } },
      ];
    }

    // ترتيب النتائج
    const orderBy: any = {};
    orderBy[sort] = order;

    console.log("🔍 [News API] شروط البحث:", where);

    // جلب المقالات مع العلاقات باستخدام النظام الآمن
    const result = await executeQuery(async (prisma) => {
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
              bio: true,
            },
          },
        },
        orderBy,
        skip,
        take: limit,
      });

      const totalCount = await prisma.articles.count({ where });

      return { articles, totalCount };
    });

    // تنسيق البيانات
    const formattedArticles = result.articles.map((article: any) => {
      // تحديد المؤلف المناسب
      let authorInfo = null;
      if (article.article_author) {
        authorInfo = {
          id: article.article_author.id,
          name: article.article_author.full_name,
          bio: article.article_author.bio,
        };
      } else if (article.author) {
        authorInfo = {
          id: article.author.id,
          name: article.author.name,
          email: article.author.email,
        };
      }

      return {
        id: article.id,
        title: article.title,
        slug: article.slug,
        content: article.content,
        excerpt: article.excerpt,
        published_at: article.published_at,
        updated_at: article.updated_at,
        status: article.status,
        featured: article.featured,
        image_url: article.image_url,
        reading_time: article.reading_time,
        views: article.views,
        likes: article.likes,
        breaking: article.breaking,
        article_type: article.article_type,
        seo_title: article.seo_title,
        seo_description: article.seo_description,
        categories: article.categories,
        author: authorInfo,
      };
    });

    // حساب صفحات الترقيم
    const totalPages = Math.ceil(result.totalCount / limit);

    const response = {
      articles: formattedArticles,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount: result.totalCount,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
      articlesCount: formattedArticles.length,
      totalCount: result.totalCount,
    };

    console.log(
      `📊 [News API] استجابة تحتوي على: { articlesCount: ${formattedArticles.length}, totalCount: ${result.totalCount}, currentPage: ${page}, totalPages: ${totalPages} }`
    );

    return NextResponse.json(response);
  } catch (error) {
    console.error("❌ [News API] خطأ في جلب الأخبار:", error);
    return NextResponse.json(
      {
        error: "فشل في جلب الأخبار",
        details: error instanceof Error ? error.message : "خطأ غير معروف",
      },
      { status: 500 }
    );
  }
}
