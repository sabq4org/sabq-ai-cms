/**
 * نظام إبطال الكاش الشامل
 * 
 * يضمن إبطال جميع أنواع الكاش عند نشر/تعديل/حذف المقالات
 * لحل مشكلة عدم ظهور الأخبار الجديدة إلا بعد حذف كاش المتصفح
 */

import { revalidatePath, revalidateTag } from 'next/cache';
import { cache as redisCache } from '@/lib/redis';
import { unifiedCache, CacheType } from './unified-cache-manager';

/**
 * أنواع العمليات
 */
export enum OperationType {
  PUBLISH = 'publish',
  UPDATE = 'update',
  DELETE = 'delete',
  SCHEDULE = 'schedule',
  BREAKING = 'breaking'
}

/**
 * نطاق الإبطال
 */
export enum InvalidationScope {
  MINIMAL = 'minimal',     // الحد الأدنى
  STANDARD = 'standard',   // القياسي
  COMPREHENSIVE = 'comprehensive', // الشامل
  EMERGENCY = 'emergency'  // الطوارئ
}

/**
 * إعدادات الإبطال
 */
interface InvalidationConfig {
  articleId?: string;
  categoryId?: string;
  authorId?: string;
  operation: OperationType;
  scope: InvalidationScope;
  metadata?: Record<string, any>;
}

/**
 * نتيجة الإبطال
 */
interface InvalidationResult {
  success: boolean;
  duration: number;
  clearedItems: {
    memory: number;
    redis: number;
    paths: string[];
    tags: string[];
  };
  errors: string[];
  timestamp: Date;
}

/**
 * مدير إبطال الكاش الشامل
 */
export class ComprehensiveCacheInvalidator {
  private static instance: ComprehensiveCacheInvalidator;
  private invalidationHistory: InvalidationResult[] = [];
  private isInvalidating = false;
  
  private constructor() {}
  
  public static getInstance(): ComprehensiveCacheInvalidator {
    if (!ComprehensiveCacheInvalidator.instance) {
      ComprehensiveCacheInvalidator.instance = new ComprehensiveCacheInvalidator();
    }
    return ComprehensiveCacheInvalidator.instance;
  }
  
  /**
   * إبطال الكاش الشامل
   */
  public async invalidate(config: InvalidationConfig): Promise<InvalidationResult> {
    // منع الإبطال المتزامن
    if (this.isInvalidating) {
      console.warn('⚠️ عملية إبطال أخرى قيد التنفيذ');
      return this.createResult(false, 0, [], 'عملية إبطال أخرى قيد التنفيذ');
    }
    
    this.isInvalidating = true;
    const startTime = Date.now();
    const errors: string[] = [];
    const clearedItems = {
      memory: 0,
      redis: 0,
      paths: [] as string[],
      tags: [] as string[]
    };
    
    console.log(`🧹 بدء إبطال الكاش (${config.operation} - ${config.scope})`);
    
    try {
      // 1. تحديد نطاق الإبطال
      const invalidationTasks = this.getInvalidationTasks(config);
      
      // 2. مسح كاش الذاكرة
      const memoryResult = await this.clearMemoryCache(invalidationTasks.memoryPatterns);
      clearedItems.memory = memoryResult.cleared;
      if (memoryResult.error) errors.push(memoryResult.error);
      
      // 3. مسح كاش Redis
      const redisResult = await this.clearRedisCache(invalidationTasks.redisPatterns);
      clearedItems.redis = redisResult.cleared;
      if (redisResult.error) errors.push(redisResult.error);
      
      // 4. إبطال مسارات Next.js
      const pathsResult = await this.invalidatePaths(invalidationTasks.paths);
      clearedItems.paths = pathsResult.cleared;
      if (pathsResult.errors.length > 0) errors.push(...pathsResult.errors);
      
      // 5. إبطال tags Next.js
      const tagsResult = await this.invalidateTags(invalidationTasks.tags);
      clearedItems.tags = tagsResult.cleared;
      if (tagsResult.errors.length > 0) errors.push(...tagsResult.errors);
      
      // 6. إبطال كاش CDN (إذا لزم)
      if (config.scope === InvalidationScope.COMPREHENSIVE || config.scope === InvalidationScope.EMERGENCY) {
        await this.invalidateCDN(config);
      }
      
      // 7. إشعار الخدمات الخارجية
      if (config.scope === InvalidationScope.EMERGENCY) {
        await this.notifyExternalServices(config);
      }
      
      const duration = Date.now() - startTime;
      const result = this.createResult(true, duration, clearedItems, ...errors);
      
      console.log(`✅ اكتمل إبطال الكاش في ${duration}ms`);
      console.log(`📊 تم مسح: ${clearedItems.memory} عنصر من الذاكرة، ${clearedItems.redis} من Redis`);
      console.log(`📊 تم إبطال: ${clearedItems.paths.length} مسار، ${clearedItems.tags.length} tag`);
      
      this.invalidationHistory.push(result);
      return result;
      
    } catch (error) {
      const duration = Date.now() - startTime;
      console.error('❌ خطأ في إبطال الكاش:', error);
      return this.createResult(false, duration, clearedItems, String(error));
    } finally {
      this.isInvalidating = false;
    }
  }
  
  /**
   * تحديد مهام الإبطال حسب النطاق
   */
  private getInvalidationTasks(config: InvalidationConfig): {
    memoryPatterns: string[];
    redisPatterns: string[];
    paths: string[];
    tags: string[];
  } {
    const tasks = {
      memoryPatterns: [] as string[],
      redisPatterns: [] as string[],
      paths: [] as string[],
      tags: [] as string[]
    };
    
    switch (config.scope) {
      case InvalidationScope.MINIMAL:
        // الحد الأدنى - فقط المتعلق بالمقال المحدد
        if (config.articleId) {
          tasks.memoryPatterns = [`article:${config.articleId}:*`];
          tasks.redisPatterns = [`article:${config.articleId}:*`];
          tasks.paths = [`/article/${config.articleId}`];
          tasks.tags = [`article-${config.articleId}`];
        }
        break;
        
      case InvalidationScope.STANDARD:
        // القياسي - المقال والصفحات الرئيسية
        tasks.memoryPatterns = [
          'articles:*',
          'news:*',
          'home:*'
        ];
        tasks.redisPatterns = [
          'articles:*',
          'news:*',
          'home:*',
          'featured:*'
        ];
        tasks.paths = [
          '/',
          '/news',
          '/articles',
          '/home',
          '/home-v2'
        ];
        tasks.tags = [
          'articles',
          'news',
          'featured-news',
          'latest-news'
        ];
        
        if (config.categoryId) {
          tasks.memoryPatterns.push(`category:${config.categoryId}:*`);
          tasks.redisPatterns.push(`category:${config.categoryId}:*`);
          tasks.paths.push(`/category/${config.categoryId}`);
          tasks.tags.push(`category-${config.categoryId}`);
        }
        
        if (config.articleId) {
          tasks.paths.push(`/article/${config.articleId}`);
          tasks.tags.push(`article-${config.articleId}`);
        }
        break;
        
      case InvalidationScope.COMPREHENSIVE:
        // الشامل - كل شيء متعلق بالمحتوى
        tasks.memoryPatterns = ['*'];
        tasks.redisPatterns = [
          'articles:*',
          'news:*',
          'featured:*',
          'home:*',
          'category:*',
          'author:*',
          'search:*',
          'stats:*',
          'recommendations:*',
          'related:*'
        ];
        tasks.paths = [
          '/',
          '/news',
          '/articles',
          '/featured',
          '/categories',
          '/home',
          '/home-v2',
          '/light',
          '/search',
          '/trending'
        ];
        tasks.tags = [
          'articles',
          'news',
          'featured-news',
          'latest-news',
          'breaking-news',
          'categories',
          'authors',
          'stats',
          'search',
          'recommendations'
        ];
        
        // إضافة جميع التصنيفات
        if (config.categoryId) {
          tasks.paths.push(`/category/${config.categoryId}`);
        }
        break;
        
      case InvalidationScope.EMERGENCY:
        // الطوارئ - مسح كل شيء
        tasks.memoryPatterns = ['*'];
        tasks.redisPatterns = ['*'];
        tasks.paths = ['/*']; // كل المسارات
        tasks.tags = ['*']; // كل الـ tags
        break;
    }
    
    // إضافات خاصة حسب نوع العملية
    if (config.operation === OperationType.BREAKING) {
      tasks.tags.push('breaking-news', 'urgent', 'alert');
      tasks.paths.unshift('/'); // الصفحة الرئيسية أولوية
    }
    
    if (config.operation === OperationType.SCHEDULE) {
      tasks.tags.push('scheduled', 'upcoming');
    }
    
    return tasks;
  }
  
  /**
   * مسح كاش الذاكرة
   */
  private async clearMemoryCache(patterns: string[]): Promise<{ cleared: number; error?: string }> {
    try {
      let cleared = 0;
      
      if (patterns.includes('*')) {
        // مسح كامل
        const stats = unifiedCache.getStats();
        cleared = stats.memoryCacheSize;
        await unifiedCache.clearAllCache();
      } else {
        // مسح بالأنماط
        for (const pattern of patterns) {
          const cacheType = pattern.split(':')[0] as CacheType;
          if (Object.values(CacheType).includes(cacheType)) {
            await unifiedCache.invalidateCacheType(cacheType);
            cleared++;
          }
        }
      }
      
      return { cleared };
    } catch (error) {
      return { cleared: 0, error: `Memory cache error: ${error}` };
    }
  }
  
  /**
   * مسح كاش Redis
   */
  private async clearRedisCache(patterns: string[]): Promise<{ cleared: number; error?: string }> {
    try {
      let cleared = 0;
      
      if (patterns.includes('*')) {
        // مسح كامل
        await redisCache.flushAll();
        cleared = -1; // عدد غير محدد
      } else {
        // مسح بالأنماط
        for (const pattern of patterns) {
          try {
            await redisCache.clearPattern(pattern);
            cleared++;
          } catch (err) {
            console.warn(`⚠️ Failed to clear Redis pattern ${pattern}:`, err);
          }
        }
      }
      
      return { cleared };
    } catch (error) {
      return { cleared: 0, error: `Redis error: ${error}` };
    }
  }
  
  /**
   * إبطال مسارات Next.js
   */
  private async invalidatePaths(paths: string[]): Promise<{ cleared: string[]; errors: string[] }> {
    const cleared: string[] = [];
    const errors: string[] = [];
    
    for (const path of paths) {
      try {
        if (path === '/*') {
          // إبطال كل المسارات الرئيسية
          const allPaths = ['/', '/news', '/articles', '/categories', '/search'];
          for (const p of allPaths) {
            revalidatePath(p);
            cleared.push(p);
          }
        } else {
          revalidatePath(path);
          cleared.push(path);
        }
      } catch (error) {
        errors.push(`Path ${path}: ${error}`);
      }
    }
    
    return { cleared, errors };
  }
  
  /**
   * إبطال tags Next.js
   */
  private async invalidateTags(tags: string[]): Promise<{ cleared: string[]; errors: string[] }> {
    const cleared: string[] = [];
    const errors: string[] = [];
    
    for (const tag of tags) {
      try {
        if (tag === '*') {
          // إبطال كل الـ tags المعروفة
          const allTags = Object.values(CacheType);
          for (const t of allTags) {
            revalidateTag(t);
            cleared.push(t);
          }
        } else {
          revalidateTag(tag);
          cleared.push(tag);
        }
      } catch (error) {
        errors.push(`Tag ${tag}: ${error}`);
      }
    }
    
    return { cleared, errors };
  }
  
  /**
   * إبطال كاش CDN
   */
  private async invalidateCDN(config: InvalidationConfig): Promise<void> {
    try {
      // إذا كان هناك Cloudflare أو CDN آخر
      const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://sabq.io';
      
      // قائمة URLs للإبطال
      const urls = [
        `${baseUrl}/`,
        `${baseUrl}/api/articles`,
        `${baseUrl}/api/news/latest`,
        `${baseUrl}/api/news/featured`
      ];
      
      if (config.articleId) {
        urls.push(`${baseUrl}/article/${config.articleId}`);
        urls.push(`${baseUrl}/api/articles/${config.articleId}`);
      }
      
      if (config.categoryId) {
        urls.push(`${baseUrl}/category/${config.categoryId}`);
      }
      
      // إرسال طلب إبطال CDN (يعتمد على CDN المستخدم)
      if (process.env.CLOUDFLARE_ZONE_ID && process.env.CLOUDFLARE_API_TOKEN) {
        await this.purgeCloudflareCache(urls);
      }
      
      console.log(`🌐 تم إرسال طلب إبطال CDN لـ ${urls.length} رابط`);
    } catch (error) {
      console.warn('⚠️ خطأ في إبطال CDN:', error);
    }
  }
  
  /**
   * إبطال كاش Cloudflare
   */
  private async purgeCloudflareCache(urls: string[]): Promise<void> {
    const zoneId = process.env.CLOUDFLARE_ZONE_ID;
    const apiToken = process.env.CLOUDFLARE_API_TOKEN;
    
    if (!zoneId || !apiToken) return;
    
    try {
      const response = await fetch(
        `https://api.cloudflare.com/client/v4/zones/${zoneId}/purge_cache`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ files: urls })
        }
      );
      
      if (!response.ok) {
        throw new Error(`Cloudflare purge failed: ${response.statusText}`);
      }
      
      console.log('✅ تم إبطال كاش Cloudflare');
    } catch (error) {
      console.warn('⚠️ خطأ في إبطال Cloudflare:', error);
    }
  }
  
  /**
   * إشعار الخدمات الخارجية
   */
  private async notifyExternalServices(config: InvalidationConfig): Promise<void> {
    try {
      // إشعار خدمات WebSocket للتحديث الفوري
      if (typeof window !== 'undefined' && window.io) {
        const socket = window.io();
        socket.emit('cache-invalidated', {
          operation: config.operation,
          scope: config.scope,
          articleId: config.articleId,
          timestamp: new Date()
        });
      }
      
      // إشعار API الخارجية إذا وجدت
      if (process.env.EXTERNAL_CACHE_WEBHOOK) {
        await fetch(process.env.EXTERNAL_CACHE_WEBHOOK, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            event: 'cache_invalidated',
            config,
            timestamp: new Date()
          })
        });
      }
      
      console.log('📢 تم إشعار الخدمات الخارجية');
    } catch (error) {
      console.warn('⚠️ خطأ في إشعار الخدمات الخارجية:', error);
    }
  }
  
  /**
   * إنشاء نتيجة الإبطال
   */
  private createResult(
    success: boolean,
    duration: number,
    clearedItems: any,
    ...errors: string[]
  ): InvalidationResult {
    return {
      success,
      duration,
      clearedItems,
      errors: errors.filter(e => e),
      timestamp: new Date()
    };
  }
  
  /**
   * الحصول على سجل الإبطال
   */
  public getHistory(): InvalidationResult[] {
    return this.invalidationHistory;
  }
  
  /**
   * الحصول على آخر إبطال
   */
  public getLastInvalidation(): InvalidationResult | null {
    return this.invalidationHistory[this.invalidationHistory.length - 1] || null;
  }
  
  /**
   * فحص حالة الإبطال
   */
  public isCurrentlyInvalidating(): boolean {
    return this.isInvalidating;
  }
  
  /**
   * إحصائيات الإبطال
   */
  public getStats(): {
    totalInvalidations: number;
    successfulInvalidations: number;
    failedInvalidations: number;
    averageDuration: number;
    lastInvalidation: Date | null;
  } {
    const successful = this.invalidationHistory.filter(r => r.success).length;
    const failed = this.invalidationHistory.filter(r => !r.success).length;
    const totalDuration = this.invalidationHistory.reduce((sum, r) => sum + r.duration, 0);
    const avgDuration = this.invalidationHistory.length > 0 
      ? totalDuration / this.invalidationHistory.length 
      : 0;
    
    return {
      totalInvalidations: this.invalidationHistory.length,
      successfulInvalidations: successful,
      failedInvalidations: failed,
      averageDuration: Math.round(avgDuration),
      lastInvalidation: this.getLastInvalidation()?.timestamp || null
    };
  }
}

// تصدير instance للاستخدام المباشر
export const cacheInvalidator = ComprehensiveCacheInvalidator.getInstance();

/**
 * دالة مساعدة لإبطال الكاش عند نشر مقال
 */
export async function invalidateOnArticlePublish(
  articleId: string,
  categoryId?: string,
  isBreaking?: boolean
): Promise<InvalidationResult> {
  return cacheInvalidator.invalidate({
    articleId,
    categoryId,
    operation: isBreaking ? OperationType.BREAKING : OperationType.PUBLISH,
    scope: isBreaking ? InvalidationScope.COMPREHENSIVE : InvalidationScope.STANDARD
  });
}

/**
 * دالة مساعدة لإبطال الكاش عند تحديث مقال
 */
export async function invalidateOnArticleUpdate(
  articleId: string,
  categoryId?: string
): Promise<InvalidationResult> {
  return cacheInvalidator.invalidate({
    articleId,
    categoryId,
    operation: OperationType.UPDATE,
    scope: InvalidationScope.STANDARD
  });
}

/**
 * دالة مساعدة لإبطال الكاش عند حذف مقال
 */
export async function invalidateOnArticleDelete(
  articleId: string,
  categoryId?: string
): Promise<InvalidationResult> {
  return cacheInvalidator.invalidate({
    articleId,
    categoryId,
    operation: OperationType.DELETE,
    scope: InvalidationScope.COMPREHENSIVE
  });
}

/**
 * دالة مساعدة لإبطال الكاش في حالة الطوارئ
 */
export async function emergencyCacheInvalidation(): Promise<InvalidationResult> {
  return cacheInvalidator.invalidate({
    operation: OperationType.BREAKING,
    scope: InvalidationScope.EMERGENCY
  });
}
