import { cache } from "@/lib/redis";
import { NextRequest, NextResponse } from "next/server";
import { CacheInvalidation } from '@/lib/cache-invalidation';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const { 
      type = 'all', 
      categoryId, 
      articleId, 
      secret,
      articleData,
      immediate = true,
      force = false,
      auto = false
    } = body;

    // التحقق من السر الاختياري - السماح بالمسح القوي والتلقائي بدون سر
    const expectedSecret = process.env.CACHE_INVALIDATION_SECRET || process.env.REVALIDATION_SECRET;
    if (expectedSecret && secret !== expectedSecret && !force && !auto) {
      return NextResponse.json(
        { success: false, message: 'غير مخول' },
        { status: 401 }
      );
    }

    console.log(`🧹 طلب مسح كاش نوع: ${type}`);
    let clearedKeys = [];

    switch (type) {
      case "news":
        // استخدام النظام المطور
        await CacheInvalidation.invalidateNewsCache(articleData);
        clearedKeys.push("كاش الأخبار الشامل");
        break;

      case "memory":
        // مسح الذاكرة المحلية فقط
        try {
          const { clearMemoryCache } = await import('@/app/api/news/fast/route');
          clearMemoryCache();
          clearedKeys.push("ذاكرة الأخبار المحلية");
        } catch (e) {
          clearedKeys.push("ذاكرة الأخبار (فشل المسح)");
        }
        break;

      case "all":
        // مسح شامل متطور
        await CacheInvalidation.clearAllCache();
        
        if (force || auto) {
          // مسح إضافي قوي لجميع الكاش المحلي
          try {
            // مسح memory cache في جميع APIs
            const { clearMemoryCache: clearNewsCache } = await import('@/app/api/news/fast/route');
            clearNewsCache();
            
            // مسح أي كاش global
            if (typeof global !== 'undefined') {
              ['__newsCache', '__articlesCache', '__dashboardCache'].forEach(key => {
                if ((global as any)[key]) {
                  delete (global as any)[key];
                }
              });
            }
            
            clearedKeys.push("جميع أنواع الكاش + مسح قوي");
          } catch (e) {
            clearedKeys.push("جميع أنواع الكاش (مسح عادي)");
          }
        } else {
          clearedKeys.push("جميع أنواع الكاش");
        }
        break;

      case "category":
        // مسح كاش تصنيف معين
        if (categoryId) {
          await CacheInvalidation.invalidateCategoryCache(categoryId);
          clearedKeys.push(`كاش التصنيف ${categoryId}`);
        } else {
          return NextResponse.json({
            success: false,
            message: "معرف التصنيف مطلوب"
          }, { status: 400 });
        }
        break;

      case "article":
        // مسح كاش مقال معين
        if (articleId) {
          await CacheInvalidation.invalidateArticleCache(articleId, articleData?.slug);
          clearedKeys.push(`كاش المقال ${articleId}`);
        } else {
          return NextResponse.json({
            success: false,
            message: "معرف المقال مطلوب"
          }, { status: 400 });
        }
        break;

      case "featured":
        // مسح كاش الأخبار المميزة
        await CacheInvalidation.invalidateByArticleType('featured');
        clearedKeys.push("كاش الأخبار المميزة");
        break;

      case "breaking":
        // مسح كاش الأخبار العاجلة
        await CacheInvalidation.invalidateByArticleType('breaking');
        clearedKeys.push("كاش الأخبار العاجلة");
        break;

      case "publish":
        // مسح خاص بالنشر الجديد
        if (articleData && articleData.status === 'published') {
          const { invalidateCacheOnPublish } = await import('@/lib/cache-invalidation');
          await invalidateCacheOnPublish(articleData);
          clearedKeys.push("كاش النشر الجديد");
        } else {
          await CacheInvalidation.invalidateNewsCache();
          clearedKeys.push("كاش الأخبار العام");
        }
        break;

      case "memory":
        // مسح الذاكرة المحلية فقط
        try {
          const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
          await Promise.allSettled([
            fetch(`${baseUrl}/api/news/fast?_clear_cache=1`, { method: 'HEAD' }),
            fetch(`${baseUrl}/api/articles?_clear_cache=1`, { method: 'HEAD' })
          ]);
          clearedKeys.push("ذاكرة التخزين المحلية");
        } catch (error) {
          console.warn('⚠️ فشل مسح الذاكرة المحلية:', error);
        }
        break;

      default:
        // مسح الكاش الافتراضي (النظام القديم للتوافق)
        await cache.clearPattern("articles:*");
        await cache.clearPattern("news:*");
        clearedKeys.push("كاش المقالات الافتراضي");
    }

    // مسح إضافي للذاكرة المحلية دائماً
    if (immediate && type !== 'memory') {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
        fetch(`${baseUrl}/api/cache/clear`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type: 'memory' })
        }).catch(() => {}); // تشغيل في الخلفية
      } catch (error) {
        console.warn('⚠️ فشل مسح الذاكرة التكميلية:', error);
      }
    }

    console.log("✅ تم مسح الكاش:", clearedKeys);

    return NextResponse.json({
      success: true,
      message: "تم مسح الكاش بنجاح",
      cleared: clearedKeys,
      type,
      timestamp: new Date().toISOString(),
      operations: clearedKeys.length
    }, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate, max-age=0, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
        'X-Cache-Cleared': type,
        'X-Force-Cleared': force ? 'true' : 'false',
        'X-Auto-Refresh': auto ? 'true' : 'false',
        'X-Timestamp': Date.now().toString()
      }
    });
  } catch (error: any) {
    console.error("❌ خطأ في مسح الكاش:", error);
    return NextResponse.json(
      {
        success: false,
        error: "فشل مسح الكاش",
        message: error.message || 'خطأ غير معروف',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  // عرض حالة الكاش ومعلومات النظام
  try {
    // اختبار بسيط لـ Redis
    let cacheReady = false;
    try {
      await cache.set('test-connection', 'ok', 5);
      cacheReady = await cache.exists('test-connection');
      await cache.del('test-connection');
    } catch (error) {
      cacheReady = false;
    }

    return NextResponse.json({
      success: true,
      cacheReady,
      message: cacheReady ? "Redis متصل وجاهز" : "Redis غير متصل",
      availableTypes: [
        'all', 'news', 'article', 'category', 
        'featured', 'breaking', 'publish', 'memory'
      ],
      system: 'Enhanced Cache Invalidation v2.0',
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: "خطأ في التحقق من حالة الكاش",
        message: error.message || 'خطأ غير معروف'
      },
      { status: 500 }
    );
  }
}
