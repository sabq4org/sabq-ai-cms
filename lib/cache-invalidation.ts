import { cache, CACHE_KEYS } from './redis';
import { revalidatePath, revalidateTag } from 'next/cache';

/**
 * نظام إدارة مسح الكاش الذكي
 * يقوم بمسح جميع أنواع الكاش عند نشر مقال جديد
 */

export class CacheInvalidation {
  
  /**
   * مسح كاش الأخبار فوراً عند نشر مقال جديد
   */
  static async invalidateNewsCache(articleData?: {
    categoryId?: string;
    isFeatured?: boolean;
    isBreaking?: boolean;
    status?: string;
  }) {
    console.log('🧹 بدء مسح كاش الأخبار...');
    
    try {
      // 1. مسح Redis Cache
      await this.clearRedisCache(articleData);
      
      // 2. مسح Next.js Cache
      await this.clearNextJSCache();
      
      // 3. مسح Memory Cache في API endpoints
      await this.clearMemoryCache();
      
      console.log('✅ تم مسح جميع أنواع الكاش بنجاح');
      
    } catch (error) {
      console.error('❌ خطأ في مسح الكاش:', error);
      // لا نرمي خطأ لتجنب كسر عملية النشر
    }
  }

  /**
   * مسح Redis Cache بناءً على أنماط مختلفة
   */
  private static async clearRedisCache(articleData?: any) {
    console.log('🗑️ مسح Redis cache...');
    
    const patterns = [
      // مسح كاش الأخبار العام
      'articles:*',
      'news:fast:*',
      
      // مسح كاش الإحصائيات
      'stats:*',
      
      // مسح كاش الأخبار المميزة
      'featured:*',
      'unified:featured:*',
      
      // مسح كاش البحث
      'search:*',
      
      // مسح كاش التصنيفات (قد تتأثر الإحصائيات)
      'categories:*'
    ];
    
    // إضافة أنماط خاصة بالتصنيف المحدد
    if (articleData?.categoryId) {
      patterns.push(`*category:${articleData.categoryId}*`);
      patterns.push(`*category_id:${articleData.categoryId}*`);
    }
    
    // مسح جميع الأنماط
    for (const pattern of patterns) {
      try {
        await cache.clearPattern(pattern);
        console.log(`✅ تم مسح pattern: ${pattern}`);
      } catch (error) {
        console.warn(`⚠️ فشل مسح pattern ${pattern}:`, error);
      }
    }
  }

  /**
   * مسح Next.js built-in cache
   */
  private static async clearNextJSCache() {
    console.log('🔄 مسح Next.js cache...');
    
    try {
      // مسح صفحات مهمة
      const pathsToRevalidate = [
        '/',              // الصفحة الرئيسية
        '/news',          // صفحة الأخبار
        '/featured',      // الأخبار المميزة
        '/breaking',      // الأخبار العاجلة
      ];
      
      for (const path of pathsToRevalidate) {
        revalidatePath(path);
        console.log(`✅ تم إعادة تحقق المسار: ${path}`);
      }
      
      // مسح tags مهمة
      const tagsToRevalidate = [
        'news-list',
        'articles',
        'featured-articles',
        'news-stats',
        'homepage-news'
      ];
      
      for (const tag of tagsToRevalidate) {
        revalidateTag(tag);
        console.log(`✅ تم إعادة تحقق العلامة: ${tag}`);
      }
      
    } catch (error) {
      console.warn('⚠️ خطأ في مسح Next.js cache:', error);
    }
  }

  /**
   * مسح Memory Cache في المتغيرات المحلية
   */
  private static async clearMemoryCache() {
    console.log('💾 إرسال إشارة لمسح Memory cache...');
    
    try {
      // إرسال طلب لـ endpoints للمسح الداخلي
      const endpoints = [
        '/api/news/fast',
        '/api/articles/featured-fast',
        '/api/articles',
      ];
      
      for (const endpoint of endpoints) {
        try {
          // إرسال طلب خاص لتنظيف الكاش الداخلي
          await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}${endpoint}?_clear_cache=1`, {
            method: 'HEAD', // طلب خفيف
            headers: {
              'X-Cache-Clear': 'true',
              'User-Agent': 'Cache-Invalidation-System'
            }
          }).catch(() => {}); // نتجاهل الأخطاء
          
        } catch (error) {
          // نتجاهل أخطاء الـ fetch لأنها ليست حرجة
        }
      }
      
    } catch (error) {
      console.warn('⚠️ خطأ في مسح Memory cache:', error);
    }
  }

  /**
   * مسح كاش مقال محدد
   */
  static async invalidateArticleCache(articleId: string, articleSlug?: string) {
    console.log(`🎯 مسح كاش المقال: ${articleId}`);
    
    try {
      // مسح كاش المقال المحدد
      await cache.del([
        CACHE_KEYS.article(articleId),
        ...(articleSlug ? [`article:slug:${articleSlug}`] : [])
      ]);
      
      // إعادة تحقق صفحة المقال
      if (articleSlug) {
        revalidatePath(`/article/${articleSlug}`);
        revalidatePath(`/news/${articleSlug}`);
      }
      
      console.log(`✅ تم مسح كاش المقال: ${articleId}`);
      
    } catch (error) {
      console.warn(`⚠️ فشل مسح كاش المقال ${articleId}:`, error);
    }
  }

  /**
   * مسح كاش التصنيف المحدد
   */
  static async invalidateCategoryCache(categoryId: string) {
    console.log(`📂 مسح كاش التصنيف: ${categoryId}`);
    
    try {
      await cache.clearPattern(`*category:${categoryId}*`);
      await cache.clearPattern(`*category_id:${categoryId}*`);
      
      // إعادة تحقق صفحة التصنيف
      revalidatePath(`/category/${categoryId}`);
      revalidateTag(`category-${categoryId}`);
      
      console.log(`✅ تم مسح كاش التصنيف: ${categoryId}`);
      
    } catch (error) {
      console.warn(`⚠️ فشل مسح كاش التصنيف ${categoryId}:`, error);
    }
  }

  /**
   * مسح كاش شامل - للحالات الطارئة
   */
  static async clearAllCache() {
    console.log('🧹💥 مسح كاش شامل...');
    
    try {
      // مسح جميع أنماط Redis
      await cache.clearPattern('*');
      
      // إعادة تحقق جميع المسارات المهمة
      const allPaths = ['/', '/news', '/featured', '/breaking', '/categories'];
      for (const path of allPaths) {
        revalidatePath(path);
      }
      
      // إعادة تحقق جميع العلامات
      const allTags = ['articles', 'news-list', 'featured-articles', 'categories', 'stats'];
      for (const tag of allTags) {
        revalidateTag(tag);
      }
      
      console.log('✅ تم المسح الشامل بنجاح');
      
    } catch (error) {
      console.error('❌ خطأ في المسح الشامل:', error);
    }
  }

  /**
   * مسح كاش بناءً على نوع المقال
   */
  static async invalidateByArticleType(type: 'featured' | 'breaking' | 'regular') {
    console.log(`🎭 مسح كاش نوع المقال: ${type}`);
    
    const patterns: Record<string, string[]> = {
      featured: ['featured:*', 'unified:featured:*', '*featured*'],
      breaking: ['breaking:*', '*breaking*', 'news:fast:*'],
      regular: ['news:fast:*', 'articles:*']
    };
    
    const typePatterns = patterns[type] || patterns.regular;
    
    for (const pattern of typePatterns) {
      try {
        await cache.clearPattern(pattern);
      } catch (error) {
        console.warn(`⚠️ فشل مسح ${pattern}:`, error);
      }
    }
    
    console.log(`✅ تم مسح كاش نوع ${type}`);
  }
}

/**
 * دالة مساعدة سريعة لمسح الكاش عند نشر مقال
 */
export async function invalidateCacheOnPublish(articleData: {
  id: string;
  slug?: string;
  categoryId?: string;
  status: string;
  featured?: boolean;
  breaking?: boolean;
}) {
  // فقط إذا كان المقال منشوراً
  if (articleData.status !== 'published') {
    console.log('📝 المقال غير منشور، تخطي مسح الكاش');
    return;
  }
  
  console.log('🚀 مسح الكاش للمقال المنشور:', articleData.id);
  
  // مسح كاش عام
  await CacheInvalidation.invalidateNewsCache({
    categoryId: articleData.categoryId,
    isFeatured: articleData.featured,
    isBreaking: articleData.breaking,
    status: articleData.status
  });
  
  // مسح كاش المقال المحدد
  await CacheInvalidation.invalidateArticleCache(articleData.id, articleData.slug);
  
  // مسح كاش التصنيف إذا كان محدداً
  if (articleData.categoryId) {
    await CacheInvalidation.invalidateCategoryCache(articleData.categoryId);
  }
  
  // مسح كاش حسب نوع المقال
  if (articleData.featured) {
    await CacheInvalidation.invalidateByArticleType('featured');
  }
  
  if (articleData.breaking) {
    await CacheInvalidation.invalidateByArticleType('breaking');
  }
  
  console.log('✅ اكتمل مسح الكاش للمقال المنشور');
}

/**
 * دالة لمسح الكاش عبر API خارجي
 */
export async function triggerCacheInvalidation(articleId?: string) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    const secret = process.env.REVALIDATION_SECRET || 'sabq-revalidation-secret';
    
    const response = await fetch(`${baseUrl}/api/revalidate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        secret,
        path: '/news',
        tag: 'news-list'
      })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    console.log('✅ تم تشغيل مسح الكاش عبر API');
    
  } catch (error) {
    console.warn('⚠️ فشل تشغيل مسح الكاش عبر API:', error);
  }
}
