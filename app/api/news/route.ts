export { GET, runtime } from '@/app/api/articles/route';
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

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
    const minimal = searchParams.get("minimal") === "true";
    const includeCommentCounts = searchParams.get("include_comment_counts") === "true";

    const skip = (page - 1) * limit;

    if (process.env.NODE_ENV !== 'production') {
      console.log("📰 [News API] جلب الأخبار مع المعاملات:", {
        page,
        limit,
        status,
        categoryId,
        categorySlug,
        articleType,
        minimal,
      });
    }

    // بناء فلتر نوع المحتوى: الأخبار = استبعاد الرأي والتحليل والمقابلات
    const typeFilter =
      articleType === "news"
        ? { article_type: { notIn: ["opinion", "analysis", "interview"] } }
        : articleType === "opinion"
        ? { article_type: { in: ["opinion", "analysis", "interview"] } }
        : { article_type: articleType };

    // بناء شروط البحث الأساسية
    const where: any = {
      ...typeFilter,
    };

    // تصفية الحالة
    if (status !== "all") {
      where.status = status;
    }
    // استبعاد المجدولة من الواجهات العامة افتراضياً عند status=published
    // استبعاد العناصر المجدولة من أي استعلامات عامة بشكل افتراضي
    where.status = status === "all" ? { in: ["published", "draft", "archived", "deleted", "scheduled"] } : status;

    // تصفية حسب التصنيف
    if (categoryId) {
      where.category_id = categoryId;
    }

    if (categorySlug) {
      where.categories = {
        is: { slug: categorySlug },
      } as any;
    }

    // تصفية حسب المؤلف (نظام مزدوج)
    if (authorId) {
      where.OR = [{ author_id: authorId }, { article_author_id: authorId }];
    }

    // البحث النصي
    if (search) {
      // إضافة البحث كنقطة AND مع الحفاظ على جميع الفلاتر السابقة
      where.AND = [
        ...(where.AND || []),
        {
          OR: [
            { title: { contains: search, mode: "insensitive" } },
            { content: { contains: search, mode: "insensitive" } },
            { summary: { contains: search, mode: "insensitive" } },
          ],
        },
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

    if (process.env.NODE_ENV !== 'production') {
      console.log("🔍 [News API] شروط البحث:", where);
    }

    // جلب المقالات مع العلاقات/الحقول المطلوبة فقط
    const articlesQuery = {
      where,
      orderBy,
      skip,
      take: limit,
    };

    if (minimal) {
      (articlesQuery as any).select = {
        id: true,
        slug: true,
        title: true,
        featured_image: true,
        status: true,
        article_type: true,
        content_type: true,
        published_at: true,
        created_at: true,
        updated_at: true,
        views: true,
        reading_time: true,
        featured: true,
        breaking: true,
        category_id: true,
        author_id: true,
        article_author_id: true,
        ...(includeCategories
          ? {
              categories: {
                select: { id: true, name: true, slug: true, color: true },
              },
            }
          : {}),
        author: { select: { id: true, name: true } },
        article_author: { select: { id: true, full_name: true } },
      };
    } else {
      (articlesQuery as any).include = {
        categories: includeCategories,
        author: {
          select: { id: true, name: true, email: true },
        },
        article_author: {
          select: { id: true, full_name: true, email: true, bio: true },
        },
      };
    }

    const articles = await prisma.articles.findMany(articlesQuery);

    if (process.env.NODE_ENV !== 'production') {
      console.log(`✅ [News API] تم جلب ${articles.length} مقال`);
    }

    // جلب عدد التعليقات الموافق عليها بشكل مجمّع (اختياري)
    let commentsCountsMap = new Map<string, number>();
    if (includeCommentCounts) {
      const articleIds = (articles as any[]).map((a) => a.id).filter(Boolean) as string[];
      if (articleIds.length > 0) {
        try {
          const grouped = await prisma.comments.groupBy({
            by: ["article_id"],
            where: { article_id: { in: articleIds }, status: "approved" },
            _count: { _all: true },
          });
          commentsCountsMap = new Map(
            grouped.map((g: any) => [g.article_id, g._count?._all || 0])
          );
        } catch (e) {
          console.error("⚠️ فشل جلب عدد التعليقات المجمّع:", e);
        }
      }
    }

    // تحويل البيانات للتنسيق المطلوب
    const formattedArticles = articles.map((article: any) => {
      // منطق اختيار المؤلف (النظام الجديد له الأولوية)
      const selectedAuthor = article.article_author || article.author;
      const authorName =
        article.article_author?.full_name || article.author?.name || "غير محدد";

      return {
        slug: article.slug,
        id: article.id,
        title: article.title,
        ...(minimal ? {} : { content: (article as any).content, summary: (article as any).summary }),
        image: article.featured_image,
        image_url: article.featured_image,
        status: article.status,
        article_type: article.article_type,
        content_type: article.content_type, // Ensure content_type is always returned
        is_featured: article.featured,
        is_breaking: article.breaking,
        published_at: article.published_at,
        created_at: article.created_at,
        updated_at: article.updated_at,
        // توحيد التسمية للمشاهدات
        views: article.views || 0,
        views_count: article.views || 0,
        comments_count: commentsCountsMap.get(article.id) || 0,
        reading_time: article.reading_time,

        // معلومات التصنيف
        category: (article as any).categories
          ? {
              id: (article as any).categories.id,
              name: (article as any).categories.name,
              slug: (article as any).categories.slug,
              color: (article as any).categories.color,
            }
          : null,

        // معلومات المؤلف مع الأولوية للنظام الجديد
        author: selectedAuthor
          ? {
              id: selectedAuthor.id,
              name: authorName,
              ...(minimal ? {} : { email: (selectedAuthor as any).email, bio: (article as any).article_author?.bio }),
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
      data: formattedArticles, // إضافة data للتوافق
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

    return NextResponse.json(response, {
      headers: {
        "Cache-Control": "public, s-maxage=15, stale-while-revalidate=120",
        "CDN-Cache-Control": "max-age=15",
        "Vercel-CDN-Cache-Control": "max-age=15",
      },
    });
  } catch (error) {
    console.error("❌ [News API] خطأ في جلب الأخبار:", error);

    // عدم كسر الواجهة الأمامية: نعيد 200 مع success=false وقائمة فارغة
    return NextResponse.json({
      success: false,
      error: "فشل في جلب الأخبار",
      details: error instanceof Error ? error.message : "خطأ غير معروف",
      articles: [],
      pagination: {
        current_page: 1,
        total_pages: 0,
        total_count: 0,
        per_page: 0,
        has_next: false,
        has_prev: false,
      },
    });
  }
}
