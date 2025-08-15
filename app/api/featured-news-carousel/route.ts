import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { getProductionImageUrl } from "@/lib/production-image-fix";
import { cache as redis } from "@/lib/redis";
export const runtime = "nodejs";

// سياسة الكاش: تحديث كل 60 ثانية مع SWR 5 دقائق
export const revalidate = 60;
export const dynamic = "force-static";
export const fetchCache = "default-cache";

export async function GET(request: NextRequest) {
  try {
    const cacheKey = "featured-news:carousel:v1";

    // محاولة الجلب من Redis أولاً
    const cached = await redis.get<any>(cacheKey);
    if (cached) {
      return NextResponse.json(cached, {
        headers: {
          "Cache-Control": "public, max-age=60, stale-while-revalidate=300",
          "Content-Type": "application/json",
        },
      });
    }
    // جلب آخر 3 مقالات مميزة منشورة (أخبار فقط، بدون مقالات الرأي)
    const featuredArticles = await prisma.articles.findMany({
      where: {
        featured: true,
        status: "published",
        article_type: {
          notIn: ["opinion", "analysis", "interview"],
        },
      },
      orderBy: {
        published_at: "desc",
      },
      take: 3,
      include: {
        categories: true,
        author: {
          include: {
            reporter_profile: true,
          },
        },
      },
    });

    // إذا لم توجد مقالات مميزة، جلب آخر المقالات المنشورة
    let articlesToReturn = featuredArticles;
    
    if (!featuredArticles || featuredArticles.length === 0) {
      // جلب آخر 3 مقالات منشورة كـ fallback
      articlesToReturn = await prisma.articles.findMany({
        where: {
          status: "published",
          article_type: {
            notIn: ["opinion", "analysis", "interview"],
          },
        },
        orderBy: {
          published_at: "desc",
        },
        take: 3,
        include: {
          categories: true,
          author: {
            include: {
              reporter_profile: true,
            },
          },
        },
      });
      
      if (!articlesToReturn || articlesToReturn.length === 0) {
        return NextResponse.json({
          success: true,
          articles: [],
          message: "لا توجد أخبار حالياً",
        });
      }
    }

    // تسجيل للتشخيص (في التطوير فقط)
    if (process.env.NODE_ENV !== "production") {
      console.log('🔍 [Featured API] Articles found:', articlesToReturn.length);
      if (articlesToReturn.length > 0) {
        console.log('🔍 [Featured API] First article image fields:', {
          featured_image: articlesToReturn[0]?.featured_image,
          social_image: articlesToReturn[0]?.social_image,
          metadata: articlesToReturn[0]?.metadata,
          all_keys: Object.keys(articlesToReturn[0])
        });
      }
    }
    
    // تنسيق البيانات
    const formattedArticles = articlesToReturn.map((article) => {
      // 1. تجميع رابط الصورة الخام من مصادر متعددة
      const rawImageUrl = article.featured_image ||
                          article.social_image ||
                          (article.metadata as any)?.featured_image ||
                          (article.metadata as any)?.image ||
                          null;

      // 2. معالجة الرابط الخام للحصول على رابط صالح للإنتاج
      const finalImageUrl = getProductionImageUrl(rawImageUrl, {
        width: 800,
        height: 600,
        quality: 85,
        fallbackType: "article"
      });

      return {
        id: article.id,
        title: article.title,
        slug: article.slug,
        excerpt: article.excerpt,
        content: article.content,
        featured_image: finalImageUrl, // 3. استخدام الحقل الموحد والنهائي
        published_at: article.published_at,
        reading_time: article.reading_time,
        views: article.views || 0,
        likes: article.likes || 0,
        shares: article.shares || 0,
        category: article.categories
        ? {
            id: article.categories.id,
            name: article.categories.name,
            icon: article.categories.icon || "",
            color: article.categories.color || "",
          }
        : null,
      author: article.author
        ? {
            id: article.author.id,
            name: article.author.name,
            reporter: article.author.reporter_profile
              ? {
                  id: article.author.reporter_profile.id,
                  full_name: article.author.reporter_profile.full_name,
                  slug: article.author.reporter_profile.slug,
                  title: article.author.reporter_profile.title,
                  is_verified: article.author.reporter_profile.is_verified,
                  verification_badge:
                    article.author.reporter_profile.verification_badge ||
                    "verified",
                }
              : null,
          }
        : null,
        metadata: article.metadata,
        created_at: article.created_at,
        updated_at: article.updated_at,
      };
    });

    const responseData = {
      success: true,
      articles: formattedArticles,
      count: formattedArticles.length,
      timestamp: new Date().toISOString(),
    };

    // حفظ في Redis لمدة 60 ثانية
    await redis.set(cacheKey, responseData, 60);

    return NextResponse.json(responseData, {
      headers: {
        "Cache-Control": "public, max-age=60, stale-while-revalidate=300",
        "Content-Type": "application/json",
      },
    });
  } catch (error: any) {
    console.error("❌ خطأ في جلب الأخبار المميزة:", error);
    return NextResponse.json(
      {
        success: false,
        error: "حدث خطأ في جلب الأخبار المميزة",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
