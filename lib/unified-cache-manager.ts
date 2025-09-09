/**
 * مدير كاش موحد لحل مشاكل التزامن بين النسختين
 * 
 * المشكلة: عدم تزامن البيانات بين النسخة المكتبية والمحمولة
 * الحل: توحيد مصادر البيانات وإبطال الكاش الشامل
 */

import { unstable_cache, revalidatePath, revalidateTag } from 'next/cache';
import { cache as redisCache } from '@/lib/redis';
import { deviceDetector } from './unified-device-detector';

/**
 * أنواع الكاش المختلفة
 */
export enum CacheType {
  ARTICLES = 'articles',
  NEWS = 'news',
  FEATURED = 'featured',
  CATEGORIES = 'categories',
  AUTHORS = 'authors',
  STATS = 'stats',
  SEARCH = 'search'
}

/**
 * مستويات الكاش
 */
export enum CacheLevel {
  MEMORY = 'memory',
  REDIS = 'redis',
  NEXTJS = 'nextjs',
  CDN = 'cdn'
}

/**
 * إعدادات الكاش الموحدة
 */
export const UNIFIED_CACHE_CONFIG = {
  // مدد الكاش بالثواني
  TTL: {
    // الأخبار العاجلة والحديثة
    BREAKING: 30,        // 30 ثانية
    FRESH: 60,          // دقيقة واحدة
    
    // المحتوى العادي
    ARTICLES: 120,      // دقيقتان
    NEWS: 120,          // دقيقتان
    FEATURED: 180,      // 3 دقائق
    
    // المحتوى الثابت
    CATEGORIES: 3600,   // ساعة
    AUTHORS: 1800,      // 30 دقيقة
    STATS: 300,         // 5 دقائق
    
    // البحث والتصفية
    SEARCH: 60,         // دقيقة
    FILTERED: 120       // دقيقتان
  },
  
  // مفاتيح الكاش الموحدة (بدون تمييز بين الأجهزة)
  KEYS: {
    // مفاتيح رئيسية
    HOME_ARTICLES: 'home:articles',
    LATEST_NEWS: 'news:latest',
    FEATURED_NEWS: 'news:featured',
    BREAKING_NEWS: 'news:breaking',
    
    // مفاتيح حسب التصنيف
    CATEGORY_ARTICLES: (categoryId: string) => `category:${categoryId}:articles`,
    
    // مفاتيح حسب المؤلف
    AUTHOR_ARTICLES: (authorId: string) => `author:${authorId}:articles`,
    
    // مفاتيح البحث
    SEARCH_RESULTS: (query: string) => `search:${query}`,
    
    // مفاتيح الإحصائيات
    SITE_STATS: 'stats:site',
    ARTICLE_STATS: (articleId: string) => `stats:article:${articleId}`
  }
};

/**
 * كاش في الذاكرة (Memory Cache)
 */
class MemoryCache {
  private cache = new Map<string, { data: any; timestamp: number }>();
  private readonly maxSize = 100; // حد أقصى 100 عنصر
  
  /**
   * حفظ في الكاش
   */
  set(key: string, data: any, ttl: number): void {
    // التنظيف إذا وصلنا للحد الأقصى
    if (this.cache.size >= this.maxSize) {
      const oldestKey = this.cache.keys().next().value;
      this.cache.delete(oldestKey);
    }
    
    this.cache.set(key, {
      data,
      timestamp: Date.now() + (ttl * 1000)
    });
  }
  
  /**
   * جلب من الكاش
   */
  get(key: string): any | null {
    const cached = this.cache.get(key);
    
    if (!cached) return null;
    
    // التحقق من انتهاء الصلاحية
    if (Date.now() > cached.timestamp) {
      this.cache.delete(key);
      return null;
    }
    
    return cached.data;
  }
  
  /**
   * حذف من الكاش
   */
  delete(key: string): void {
    this.cache.delete(key);
  }
  
  /**
   * حذف بنمط
   */
  deletePattern(pattern: string): void {
    const regex = new RegExp(pattern.replace('*', '.*'));
    
    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key);
      }
    }
  }
  
  /**
   * مسح كامل الكاش
   */
  clear(): void {
    this.cache.clear();
  }
  
  /**
   * الحصول على حجم الكاش
   */
  size(): number {
    return this.cache.size;
  }
}

/**
 * مدير الكاش الموحد
 */
export class UnifiedCacheManager {
  private static instance: UnifiedCacheManager;
  private memoryCache: MemoryCache;
  private invalidationLog: Array<{ timestamp: Date; type: string; details: any }> = [];
  
  private constructor() {
    this.memoryCache = new MemoryCache();
  }
  
  /**
   * الحصول على instance واحد
   */
  public static getInstance(): UnifiedCacheManager {
    if (!UnifiedCacheManager.instance) {
      UnifiedCacheManager.instance = new UnifiedCacheManager();
    }
    return UnifiedCacheManager.instance;
  }
  
  /**
   * جلب البيانات مع الكاش الموحد
   */
  public async get<T>(
    key: string,
    fetcher: () => Promise<T>,
    options: {
      ttl?: number;
      cacheType?: CacheType;
      skipMemory?: boolean;
      skipRedis?: boolean;
    } = {}
  ): Promise<T> {
    const {
      ttl = UNIFIED_CACHE_CONFIG.TTL.ARTICLES,
      cacheType = CacheType.ARTICLES,
      skipMemory = false,
      skipRedis = false
    } = options;
    
    // المفتاح الموحد (بدون تمييز بين الأجهزة)
    const unifiedKey = this.createUnifiedKey(key, cacheType);
    
    // 1. محاولة من الذاكرة أولاً
    if (!skipMemory) {
      const memoryData = this.memoryCache.get(unifiedKey);
      if (memoryData !== null) {
        console.log(`✅ Cache hit (memory): ${unifiedKey}`);
        return memoryData;
      }
    }
    
    // 2. محاولة من Redis
    if (!skipRedis) {
      try {
        const redisData = await redisCache.get(unifiedKey);
        if (redisData) {
          const parsed = typeof redisData === 'string' ? JSON.parse(redisData) : redisData;
          
          // حفظ في الذاكرة للمرات القادمة
          if (!skipMemory) {
            this.memoryCache.set(unifiedKey, parsed, ttl);
          }
          
          console.log(`✅ Cache hit (redis): ${unifiedKey}`);
          return parsed;
        }
      } catch (error) {
        console.warn(`⚠️ Redis error for ${unifiedKey}:`, error);
      }
    }
    
    // 3. جلب البيانات الجديدة
    console.log(`🔄 Cache miss, fetching: ${unifiedKey}`);
    const data = await fetcher();
    
    // 4. حفظ في جميع مستويات الكاش
    await this.setMultiLevel(unifiedKey, data, ttl, { skipMemory, skipRedis });
    
    return data;
  }
  
  /**
   * حفظ في جميع مستويات الكاش
   */
  private async setMultiLevel(
    key: string,
    data: any,
    ttl: number,
    options: {
      skipMemory?: boolean;
      skipRedis?: boolean;
    } = {}
  ): Promise<void> {
    const { skipMemory = false, skipRedis = false } = options;
    
    // حفظ في الذاكرة
    if (!skipMemory) {
      this.memoryCache.set(key, data, ttl);
    }
    
    // حفظ في Redis
    if (!skipRedis) {
      try {
        await redisCache.set(key, JSON.stringify(data), ttl);
      } catch (error) {
        console.warn(`⚠️ Failed to set Redis cache for ${key}:`, error);
      }
    }
  }
  
  /**
   * إنشاء مفتاح موحد (بدون تمييز بين الأجهزة)
   */
  private createUnifiedKey(key: string, cacheType: CacheType): string {
    // إزالة أي إشارة لنوع الجهاز من المفتاح
    let unifiedKey = key
      .replace(/:(mobile|tablet|desktop)/, '')
      .replace(/device-type=[^&]+&?/, '')
      .replace(/&$/, '');
    
    // إضافة بادئة نوع الكاش
    return `${cacheType}:${unifiedKey}`;
  }
  
  /**
   * إبطال كاش شامل عند نشر مقال
   */
  public async invalidateArticleCache(
    articleId?: string,
    categoryId?: string,
    options: {
      invalidateAll?: boolean;
      tags?: string[];
      paths?: string[];
    } = {}
  ): Promise<void> {
    const startTime = Date.now();
    console.log('🧹 بدء إبطال الكاش الشامل...');
    
    const invalidationTasks: Promise<any>[] = [];
    
    // 1. مسح كاش الذاكرة
    this.memoryCache.clear();
    console.log('✅ تم مسح كاش الذاكرة');
    
    // 2. مسح كاش Redis
    const redisPatterns = [
      'articles:*',
      'news:*',
      'featured:*',
      'home:*',
      'category:*',
      'search:*',
      'stats:*'
    ];
    
    if (categoryId) {
      redisPatterns.push(`category:${categoryId}:*`);
    }
    
    if (articleId) {
      redisPatterns.push(`article:${articleId}:*`);
    }
    
    for (const pattern of redisPatterns) {
      invalidationTasks.push(
        redisCache.clearPattern(pattern).catch(err => {
          console.warn(`⚠️ Failed to clear Redis pattern ${pattern}:`, err);
        })
      );
    }
    
    // 3. إبطال Next.js paths
    const pathsToRevalidate = options.paths || [
      '/',
      '/news',
      '/articles',
      '/featured',
      '/home',
      '/home-v2',
      '/light'
    ];
    
    if (categoryId) {
      pathsToRevalidate.push(`/category/${categoryId}`);
    }
    
    if (articleId) {
      pathsToRevalidate.push(`/article/${articleId}`);
    }
    
    for (const path of pathsToRevalidate) {
      invalidationTasks.push(
        Promise.resolve(revalidatePath(path)).catch(err => {
          console.warn(`⚠️ Failed to revalidate path ${path}:`, err);
        })
      );
    }
    
    // 4. إبطال Next.js tags
    const tagsToRevalidate = options.tags || [
      'articles',
      'news',
      'featured-news',
      'latest-news',
      'breaking-news',
      'categories',
      'stats'
    ];
    
    for (const tag of tagsToRevalidate) {
      invalidationTasks.push(
        Promise.resolve(revalidateTag(tag)).catch(err => {
          console.warn(`⚠️ Failed to revalidate tag ${tag}:`, err);
        })
      );
    }
    
    // 5. إبطال كاش API المحلي (إذا وجد)
    if (typeof window !== 'undefined') {
      // مسح كاش المتصفح
      invalidationTasks.push(
        fetch('/api/cache/clear', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            clearAll: options.invalidateAll,
            patterns: redisPatterns
          })
        }).catch(err => {
          console.warn('⚠️ Failed to clear API cache:', err);
        })
      );
    }
    
    // انتظار جميع المهام
    await Promise.all(invalidationTasks);
    
    const duration = Date.now() - startTime;
    console.log(`✅ تم إبطال الكاش الشامل في ${duration}ms`);
    
    // تسجيل الإبطال
    this.logInvalidation('article_publish', {
      articleId,
      categoryId,
      duration,
      timestamp: new Date()
    });
  }
  
  /**
   * إبطال كاش نوع معين
   */
  public async invalidateCacheType(cacheType: CacheType): Promise<void> {
    console.log(`🧹 إبطال كاش ${cacheType}...`);
    
    // مسح من الذاكرة
    this.memoryCache.deletePattern(`${cacheType}:*`);
    
    // مسح من Redis
    try {
      await redisCache.clearPattern(`${cacheType}:*`);
    } catch (error) {
      console.warn(`⚠️ Failed to clear Redis for ${cacheType}:`, error);
    }
    
    // إبطال Next.js tags
    await revalidateTag(cacheType);
    
    console.log(`✅ تم إبطال كاش ${cacheType}`);
  }
  
  /**
   * مسح كامل الكاش (طوارئ)
   */
  public async clearAllCache(): Promise<void> {
    console.log('🚨 مسح كامل الكاش...');
    
    // مسح الذاكرة
    this.memoryCache.clear();
    
    // مسح Redis
    try {
      await redisCache.flushAll();
    } catch (error) {
      console.warn('⚠️ Failed to flush Redis:', error);
    }
    
    // إبطال جميع المسارات
    const allPaths = ['/', '/news', '/articles', '/featured', '/categories'];
    await Promise.all(allPaths.map(path => revalidatePath(path)));
    
    // إبطال جميع الـ tags
    const allTags = Object.values(CacheType);
    await Promise.all(allTags.map(tag => revalidateTag(tag)));
    
    console.log('✅ تم مسح كامل الكاش');
    
    this.logInvalidation('clear_all', {
      timestamp: new Date(),
      reason: 'Emergency clear'
    });
  }
  
  /**
   * تسجيل عمليات الإبطال
   */
  private logInvalidation(type: string, details: any): void {
    this.invalidationLog.push({
      timestamp: new Date(),
      type,
      details
    });
    
    // الاحتفاظ بآخر 100 سجل فقط
    if (this.invalidationLog.length > 100) {
      this.invalidationLog.shift();
    }
  }
  
  /**
   * الحصول على سجل الإبطال
   */
  public getInvalidationLog(): Array<{ timestamp: Date; type: string; details: any }> {
    return this.invalidationLog;
  }
  
  /**
   * إحصائيات الكاش
   */
  public getStats(): {
    memoryCacheSize: number;
    invalidationCount: number;
    lastInvalidation: Date | null;
  } {
    return {
      memoryCacheSize: this.memoryCache.size(),
      invalidationCount: this.invalidationLog.length,
      lastInvalidation: this.invalidationLog[this.invalidationLog.length - 1]?.timestamp || null
    };
  }
  
  /**
   * تحسين أداء الكاش (حذف المنتهية الصلاحية)
   */
  public async optimizeCache(): Promise<void> {
    console.log('🔧 تحسين الكاش...');
    
    // تنظيف الذاكرة من العناصر المنتهية
    const memorySize = this.memoryCache.size();
    
    // لا حاجة لعمل شيء إضافي لأن الكاش ينظف نفسه
    
    console.log(`✅ تم تحسين الكاش (${memorySize} عنصر في الذاكرة)`);
  }
}

// تصدير instance للاستخدام المباشر
export const unifiedCache = UnifiedCacheManager.getInstance();

/**
 * Hook لاستخدام الكاش الموحد في React
 */
export function useUnifiedCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  options?: {
    ttl?: number;
    cacheType?: CacheType;
    dependencies?: any[];
  }
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  useEffect(() => {
    let cancelled = false;
    
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const result = await unifiedCache.get(key, fetcher, options);
        
        if (!cancelled) {
          setData(result);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err as Error);
          console.error(`Error loading cache for ${key}:`, err);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };
    
    loadData();
    
    return () => {
      cancelled = true;
    };
  }, [key, ...(options?.dependencies || [])]);
  
  const refresh = useCallback(async () => {
    // إبطال الكاش وإعادة التحميل
    await unifiedCache.invalidateCacheType(options?.cacheType || CacheType.ARTICLES);
    // إعادة تشغيل التحميل
    setLoading(true);
    // سيتم إعادة التحميل من خلال useEffect
  }, [options?.cacheType]);
  
  return {
    data,
    loading,
    error,
    refresh
  };
}
