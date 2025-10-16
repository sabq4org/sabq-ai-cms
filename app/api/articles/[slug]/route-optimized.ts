import prisma, { ensureDbConnected, retryWithConnection } from "@/lib/prisma";
import { NextResponse } from "next/server";
import {
  getArticleFromCache,
  setArticleInCache,
  incrementViewsInCache,
} from "@/lib/cache/article-cache";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// معالجة الكلمات المفتاحية بشكل محسّن
function processKeywords(article: any): string[] {
  try {
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

// تنسيق بيانات المقال
function formatArticleData(article: any) {
  const keywords = processKeywords(article);
  
  const authorName =
    article.article_author?.full_name || article.author?.name || null;
  const authorAvatar =
    article.article_author?.avatar_url || article.author?.avatar || null;

  return {
    ...article,
    image: article.featured_image,
    image_url: article.featured_image,
    featured_image_alt: article.featured_image_alt,
    featured_image_caption: article.featured_image_caption,
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
  };
}

export async function GET(
  request: Request,
  context: { params: Promise<{ slug: string }> }
) {
  const startTime = Date.now();
  let fromCache = false;

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

    console.log(`⚡ بدء جلب المقال: ${id}`);

    // محاولة جلب المقال من Redis Cache أولاً
    let cachedArticle = await getArticleFromCache(id);

    if (cachedArticle) {
      console.log(`✅ تم جلب المقال من الكاش في ${Date.now() - startTime}ms`);
      fromCache = true;

      // تحديث المشاهدات في الكاش والخلفية
      incrementViewsInCache(id);
      setImmediate(() => {
        retryWithConnection(async () => {
          await prisma.articles.update({
            where: { id: cachedArticle.id },
            data: { views: { increment: 1 } },
          });
        }).catch((error) => {
          console.error("⚠️ فشل تحديث المشاهدات في قاعدة البيانات:", error);
        });
      });

      return NextResponse.json(
        {
          ok: true,
          message: "تم الحصول على المقال بنجاح",
          data: cachedArticle,
          performance: {
            responseTime: Date.now() - startTime,
            cached: true,
          },
        },
        {
          status: 200,
          headers: {
            "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
            "X-Cache": "HIT",
          },
        }
      );
    }

    // إذا لم يكن في الكاش، جلب من قاعدة البيانات
    console.log(`🔍 جلب المقال من قاعدة البيانات: ${id}`);
    
    await ensureDbConnected();

    const article = await retryWithConnection(async () => {
      return await prisma.articles.findFirst({
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
    });

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

    // تنسيق البيانات
    const formattedArticle = formatArticleData(article);

    // حفظ في الكاش
    await setArticleInCache(id, formattedArticle, { ttl: 300 });

    // تحديث المشاهدات بشكل غير متزامن
    setImmediate(() => {
      retryWithConnection(async () => {
        await prisma.articles.update({
          where: { id: article.id },
          data: { views: { increment: 1 } },
        });
      }).catch((error) => {
        console.error("⚠️ فشل تحديث المشاهدات:", error);
      });
    });

    console.log(`✅ تم جلب المقال من قاعدة البيانات في ${Date.now() - startTime}ms`);

    return NextResponse.json(
      {
        ok: true,
        message: "تم الحصول على المقال بنجاح",
        data: formattedArticle,
        performance: {
          responseTime: Date.now() - startTime,
          cached: false,
        },
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
          "X-Cache": "MISS",
        },
      }
    );
  } catch (error: any) {
    console.error("❌ خطأ في جلب المقال:", error);
    return NextResponse.json(
      {
        ok: false,
        message: "حدث خطأ أثناء جلب المقال",
        code: "INTERNAL_ERROR",
        error: error.message,
        performance: {
          responseTime: Date.now() - startTime,
          cached: fromCache,
        },
      },
      { status: 500 }
    );
  }
}

