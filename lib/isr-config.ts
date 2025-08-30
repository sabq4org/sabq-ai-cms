/**
 * تكوين ISR (Incremental Static Regeneration) لتحسين الأداء
 * تطبيق استراتيجية تجديد المحتوى التدريجي للصفحات الثابتة/شبه الثابتة
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// تكوين ISR للصفحات المختلفة
export const ISR_CONFIG = {
  // الصفحة الرئيسية - تجديد سريع للمحتوى الحديث
  homepage: {
    revalidate: 60,           // تجديد كل 60 ثانية
    fallback: 'blocking',     // عرض محتوى محدث مع انتظار
    generateStaticParams: true // إنتاج معاملات ثابتة
  },

  // صفحات المقالات - تجديد متوسط مع تخزين دائم
  articles: {
    revalidate: 300,          // تجديد كل 5 دقائق
    fallback: 'blocking',     
    generateStaticParams: true,
    dynamicParams: true       // السماح بمعاملات ديناميكية
  },

  // صفحات التصنيفات - تجديد بطيء لأنها أقل تغييراً
  categories: {
    revalidate: 600,          // تجديد كل 10 دقائق
    fallback: 'blocking',
    generateStaticParams: true
  },

  // صفحات الكتّاب - تجديد بطيء
  authors: {
    revalidate: 1800,         // تجديد كل 30 دقيقة
    fallback: 'blocking',
    generateStaticParams: true
  },

  // صفحات البحث - ديناميكية بالكامل (لا ISR)
  search: {
    revalidate: false,        // بدون تخزين مؤقت ثابت
    fallback: false,          // ديناميكية بالكامل
    generateStaticParams: false
  },

  // الصفحات الثابتة - تجديد بطيء جداً
  staticPages: {
    revalidate: 86400,        // تجديد كل 24 ساعة
    fallback: 'blocking',
    generateStaticParams: true
  }
};

// استراتيجيات التخزين المؤقت المتقدمة
export const CACHE_STRATEGIES = {
  // استراتيجية المحتوى الحديث (الأخبار العاجلة)
  breaking_news: {
    ttl: 30,                  // 30 ثانية
    staleWhileRevalidate: 60, // تحديث في الخلفية لمدة دقيقة
    cacheKeyPrefix: 'breaking',
    tags: ['news', 'breaking', 'realtime']
  },

  // استراتيجية المحتوى العادي
  regular_content: {
    ttl: 300,                 // 5 دقائق
    staleWhileRevalidate: 600,// تحديث في الخلفية لمدة 10 دقائق
    cacheKeyPrefix: 'content',
    tags: ['articles', 'content']
  },

  // استراتيجية المحتوى الأرشيفي
  archived_content: {
    ttl: 3600,                // ساعة واحدة
    staleWhileRevalidate: 7200,// تحديث في الخلفية لمدة ساعتين
    cacheKeyPrefix: 'archive',
    tags: ['archive', 'static']
  },

  // استراتيجية البيانات الوصفية
  metadata: {
    ttl: 1800,                // 30 دقيقة
    staleWhileRevalidate: 3600,// تحديث في الخلفية لمدة ساعة
    cacheKeyPrefix: 'meta',
    tags: ['metadata', 'seo']
  }
};

// مساعدات ISR
export class ISRHelpers {
  /**
   * إنتاج معاملات ثابتة للمقالات
   * يُستخدم في generateStaticParams
   */
  static async generateArticleStaticParams(limit = 100) {
    try {
      // إحضار أحدث المقالات المنشورة
      const articles = await prisma.articles.findMany({
        where: {
          published_at: {
            not: null
          },
          status: 'published'
        },
        select: {
          slug: true,
          updated_at: true
        },
        orderBy: {
          published_at: 'desc'
        },
        take: limit
      });

      return articles.map(article => ({
        slug: article.slug,
        lastModified: article.updated_at
      }));

    } catch (error) {
      console.error('خطأ في إنتاج معاملات المقالات الثابتة:', error);
      return [];
    }
  }

  /**
   * إنتاج معاملات ثابتة للتصنيفات
   */
  static async generateCategoryStaticParams() {
    try {
      const categories = await prisma.categories.findMany({
        where: {
          is_active: true
        },
        select: {
          slug: true,
          updated_at: true
        }
      });

      return categories.map(category => ({
        slug: category.slug,
        lastModified: category.updated_at
      }));

    } catch (error) {
      console.error('خطأ في إنتاج معاملات التصنيفات الثابتة:', error);
      return [];
    }
  }

  /**
   * إنتاج معاملات ثابتة للكتّاب
   */
  static async generateAuthorStaticParams() {
    try {
      const authors = await prisma.article_authors.findMany({
        where: {
          is_active: true
        },
        select: {
          slug: true,
          updated_at: true
        }
      });

      return authors.map(author => ({
        slug: author.slug,
        lastModified: author.updated_at
      }));

    } catch (error) {
      console.error('خطأ في إنتاج معاملات الكتّاب الثابتة:', error);
      return [];
    }
  }

  /**
   * تحديد استراتيجية ISR المناسبة للمحتوى
   */
  static getISRStrategy(contentType: string, isBreaking = false, lastModified: Date | null = null) {
    // الأخبار العاجلة
    if (isBreaking) {
      return {
        revalidate: 30,
        strategy: CACHE_STRATEGIES.breaking_news
      };
    }

    // المحتوى الحديث (أقل من 24 ساعة)
    if (lastModified && isRecent(lastModified, 24)) {
      return {
        revalidate: 300,
        strategy: CACHE_STRATEGIES.regular_content
      };
    }

    // المحتوى الأرشيفي (أكثر من أسبوع)
    if (lastModified && !isRecent(lastModified, 168)) {
      return {
        revalidate: 3600,
        strategy: CACHE_STRATEGIES.archived_content
      };
    }

    // الافتراضي
    return {
      revalidate: 600,
      strategy: CACHE_STRATEGIES.regular_content
    };
  }

  /**
   * إعادة التحقق من صحة المحتوى بناءً على التحديثات
   */
  static async revalidateOnDemand(tags = [], paths = []) {
    try {
      if (typeof window === 'undefined') {
        const { revalidateTag, revalidatePath } = await import('next/cache');
        
        // إعادة التحقق بالوسوم
        for (const tag of tags) {
          revalidateTag(tag);
        }

        // إعادة التحقق بالمسارات
        for (const path of paths) {
          revalidatePath(path);
        }

        return { success: true, revalidated: { tags, paths } };
      }

      return { success: false, error: 'Client-side revalidation not supported' };
      
    } catch (error) {
      console.error('خطأ في إعادة التحقق:', error);
      return { success: false, error: (error as Error).message };
    }
  }

  /**
   * إنشاء مفتاح تخزين مؤقت محسن
   */
  static generateOptimizedCacheKey(baseKey: string, params: Record<string, any> = {}) {
    const sortedParams = Object.keys(params)
      .sort()
      .map(key => `${key}=${params[key]}`)
      .join('&');
    
    return sortedParams ? `${baseKey}?${sortedParams}` : baseKey;
  }

  /**
   * تحليل أداء ISR
   */
  static async analyzeISRPerformance(pages: string[] = []) {
    try {
      const performance: Record<string, any> = {};
      
      for (const page of pages) {
        const startTime = Date.now();
        
        // محاكاة طلب الصفحة
        const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}${page}`, {
          next: { revalidate: 0 } // إجبار التحديث لقياس الأداء
        });
        
        const endTime = Date.now();
        const responseTime = endTime - startTime;
        
        performance[page] = {
          responseTime,
          status: response.status,
          cached: response.headers.get('x-nextjs-cache') === 'HIT',
          size: response.headers.get('content-length'),
          timestamp: new Date().toISOString()
        };
      }

      return performance;
      
    } catch (error) {
      console.error('خطأ في تحليل أداء ISR:', error);
      return {};
    }
  }
}

/**
 * فحص ما إذا كان التاريخ حديثاً
 */
function isRecent(date: Date | string, hoursThreshold: number): boolean {
  const now = new Date();
  const targetDate = new Date(date);
  const diffInHours = (now.getTime() - targetDate.getTime()) / (1000 * 60 * 60);
  return diffInHours <= hoursThreshold;
}

/**
 * تكوين متقدم للصفحات المختلفة
 */
export const PAGE_CONFIGS = {
  '/': {
    ...ISR_CONFIG.homepage,
    fetchPriority: 'high',
    preload: true
  },
  
  '/articles/[slug]': {
    ...ISR_CONFIG.articles,
    fetchPriority: 'high',
    preload: false
  },
  
  '/categories/[slug]': {
    ...ISR_CONFIG.categories,
    fetchPriority: 'normal',
    preload: false
  },
  
  '/authors/[slug]': {
    ...ISR_CONFIG.authors,
    fetchPriority: 'low',
    preload: false
  }
};

const ISRConfiguration = {
  ISR_CONFIG,
  CACHE_STRATEGIES,
  ISRHelpers,
  PAGE_CONFIGS
};

export default ISRConfiguration;
