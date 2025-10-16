import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { unstable_cache } from "next/cache";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// تخزين مؤقت ذكي للمقالات مع مدة صلاحية 5 دقائق
const getCachedArticle = unstable_cache(
  async (id: string) => {
    console.log(`🔍 جلب المقال من قاعدة البيانات: ${id}`);
    
    // استعلام محسّن مع select محدد بدلاً من include الكامل
    const article = await prisma.articles.findFirst({
      where: {
        OR: [{ id }, { slug: id }],
        status: "published",
      },
      select: {
        id: true,
        title: true,
        slug: true,
        content: true,
        excerpt: true,
        featured_image: true,
        featured_image_alt: true,
        featured_image_caption: true,
        status: true,
        views: true,
        likes: true,
        shares: true,
        reading_time: true,
        article_type: true,
        is_breaking: true,
        is_featured: true,
        published_at: true,
        created_at: true,
        updated_at: true,
        category_id: true,
        author_id: true,
        seo_keywords: true,
        tags: true,
        metadata: true,
        // جلب العلاقات بشكل انتقائي
        categories: {
          select: {
            id: true,
            name: true,
            slug: true,
            color: true,
            icon: true,
          },
        },
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
        article_author: {
          select: {
            id: true,
            full_name: true,
            slug: true,
            title: true,
            avatar_url: true,
            specializations: true,
          },
        },
      },
    });

    return article;
  },
  ["article-detail"],
  {
    revalidate: 300, // 5 دقائق
    tags: ["articles"],
  }
);

// تحديث المشاهدات بشكل غير متزامن (fire and forget)
async function incrementViewsAsync(articleId: string) {
  try {
    await prisma.articles.update({
      where: { id: articleId },
      data: { views: { increment: 1 } },
    });
  } catch (error) {
    console.error("⚠️ فشل تحديث المشاهدات:", error);
  }
}

// معالجة الكلمات المفتاحية بشكل محسّن
function processKeywords(article: any): string[] {
  try {
    // محاولة استخراج من seo_keywords أولاً
    if (article.seo_keywords) {
      if (Array.isArray(article.seo_keywords)) {
        return article.seo_keywords;
      }
      if (typeof article.seo_keywords === "string") {
        try {
          const parsed = JSON.parse(article.seo_keywords);
          return Array.isArray(parsed) ? parsed : [article.seo_keywords];
        } catch {
          return article.seo_keywords
            .split(",")
            .map((k) => k.trim())
            .filter(Boolean);
        }
      }
    }

    // محاولة استخراج من metadata
    if (article.metadata) {
      const metadata =
        typeof article.metadata === "string"
          ? JSON.parse(article.metadata)
          : article.metadata;
      const metaKeywords = metadata.seo_keywords || metadata.keywords;
      if (metaKeywords) {
        if (Array.isArray(metaKeywords)) return metaKeywords;
        if (typeof metaKeywords === "string") {
          return metaKeywords
            .split(",")
            .map((k) => k.trim())
            .filter(Boolean);
        }
      }
    }

    // محاولة استخراج من tags
    if (article.tags) {
      if (Array.isArray(article.tags)) return article.tags;
      if (typeof article.tags === "string") {
        try {
          const parsed = JSON.parse(article.tags);
          return Array.isArray(parsed) ? parsed : [article.tags];
        } catch {
          return article.tags
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean);
        }
      }
    }

    return [];
  } catch (error) {
    console.error("❌ خطأ في معالجة الكلمات المفتاحية:", error);
    return [];
  }
}

export async function GET(
  request: Request,
  context: { params: Promise<{ slug: string }> }
) {
  const startTime = Date.now();
  
  try {
    const { slug } = await context.params;
    const id = slug;

    if (!id) {
      return NextResponse.json(
        {
          ok: false,
          message: "معرّف المقال مطلوب",
          code: "MISSING_ID",
        },
        { status: 400 }
      );
    }

    console.log(`⚡ بدء جلب المقال المحسّن: ${id}`);

    // جلب المقال من الكاش أو قاعدة البيانات
    const article = await getCachedArticle(id);

    if (!article) {
      return NextResponse.json(
        {
          ok: false,
          message: "المقال غير موجود",
          code: "ARTICLE_NOT_FOUND",
        },
        { status: 404 }
      );
    }

    // تحديث المشاهدات بشكل غير متزامن (لا ننتظر)
    setImmediate(() => incrementViewsAsync(article.id));

    // معالجة الكلمات المفتاحية
    const keywords = processKeywords(article);

    // تنسيق بيانات الكاتب
    const authorName =
      article.article_author?.full_name || article.author?.name || null;
    const authorAvatar =
      article.article_author?.avatar_url || article.author?.avatar || null;

    // تنسيق الاستجابة المحسّنة
    const formattedArticle = {
      ok: true,
      message: "تم الحصول على المقال بنجاح",
      data: {
        ...article,
        image: article.featured_image,
        image_url: article.featured_image,
        category: article.categories,
        author: {
          id: article.author?.id || article.article_author?.id,
          name: authorName,
          email: article.author?.email,
          avatar: authorAvatar,
          slug: article.article_author?.slug,
          title: article.article_author?.title,
          specializations: article.article_author?.specializations,
        },
        keywords,
        tags: keywords,
      },
      performance: {
        responseTime: Date.now() - startTime,
        cached: true,
      },
    };

    const response = NextResponse.json(formattedArticle, {
      status: 200,
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
        "CDN-Cache-Control": "public, s-maxage=300",
        "Vercel-CDN-Cache-Control": "public, s-maxage=300",
      },
    });

    console.log(`✅ تم جلب المقال بنجاح في ${Date.now() - startTime}ms`);

    return response;
  } catch (error: any) {
    console.error("❌ خطأ في جلب المقال:", error);
    return NextResponse.json(
      {
        ok: false,
        message: "حدث خطأ أثناء جلب المقال",
        code: "INTERNAL_ERROR",
        error: error.message,
      },
      { status: 500 }
    );
  }
}

