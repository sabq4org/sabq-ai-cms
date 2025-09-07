/**
 * مدير موحد للأخبار المميزة يضمن التزامن 100% بين النسختين الكاملة والخفيفة
 * 
 * هذا النظام يلغي التفاوت ويضمن:
 * - نفس المصدر للبيانات
 * - نفس منطق Fallback
 * - نفس معالجة الصور
 * - نفس طبقة Cache
 */

import prisma from "@/lib/prisma";
import { getProductionImageUrl } from "@/lib/production-image-fix";
import { cache as redis, CACHE_TTL } from "@/lib/redis";

// Types موحدة
export interface UnifiedFeaturedArticle {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  featured_image: string;
  published_at: string;
  views: number;
  breaking: boolean;
  featured: boolean;
  category?: {
    id: string;
    name: string;
    slug?: string;
    color?: string;
    icon?: string;
  } | null;
  author?: {
    id: string;
    name: string;
  } | null;
  metadata?: any;
}

export interface FeaturedResponse {
  success: true;
  articles: UnifiedFeaturedArticle[];
  count: number;
  timestamp: string;
  source: 'featured' | 'latest';
  cached: boolean;
}

class UnifiedFeaturedManager {
  private static instance: UnifiedFeaturedManager;
  private memoryCache = new Map<string, { data: FeaturedResponse; timestamp: number }>();
  private readonly MEMORY_TTL = 5 * 1000; // 5 ثواني في الذاكرة
  private readonly REDIS_TTL = 30; // 30 ثانية في Redis

  static getInstance(): UnifiedFeaturedManager {
    if (!this.instance) {
      this.instance = new UnifiedFeaturedManager();
    }
    return this.instance;
  }

  /**
   * منطق موحد لجلب الأخبار المميزة مع fallback ذكي
   */
  async getFeaturedArticles(limit: number = 3): Promise<FeaturedResponse> {
    const cacheKey = `unified-featured:v1:${limit}`;
    
    // 1. فحص memory cache
    const memCached = this.memoryCache.get(cacheKey);
    if (memCached && Date.now() - memCached.timestamp < this.MEMORY_TTL) {
      return { ...memCached.data, cached: true };
    }

    // 2. فحص Redis cache
    try {
      const redisCached = await redis.get<FeaturedResponse>(cacheKey);
      if (redisCached) {
        this.memoryCache.set(cacheKey, { data: redisCached, timestamp: Date.now() });
        return { ...redisCached, cached: true };
      }
    } catch (error) {
      console.warn('Redis cache error in UnifiedFeaturedManager:', error);
    }

    // 3. جلب البيانات من قاعدة البيانات
    console.log('🔄 [UnifiedFeaturedManager] Fetching fresh data from database');
    
    const baseSelect = {
      id: true,
      title: true,
      slug: true,
      excerpt: true,
      featured_image: true,
      published_at: true,
      views: true,
      breaking: true,
      featured: true,
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
        },
      },
    };

    const baseWhere = {
      status: "published" as const,
      article_type: {
        notIn: ["opinion", "analysis", "interview"],
      },
    };

    // جلب المقالات المميزة أولاً
    const featuredArticles = await prisma.articles.findMany({
      where: {
        ...baseWhere,
        featured: true,
      },
      select: baseSelect,
      orderBy: {
        published_at: "desc",
      },
      take: limit * 2, // جلب أكثر للتصفية
    });

    // فحص إذا كانت المقالات المميزة حديثة (آخر 24 ساعة)
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const hasRecentFeatured = featuredArticles.some(article => 
      article.published_at && new Date(article.published_at) > oneDayAgo
    );

    let articlesToReturn = featuredArticles;
    let source: 'featured' | 'latest' = 'featured';

    // إذا لم توجد مقالات مميزة حديثة، استخدم آخر المقالات
    if (!featuredArticles.length || !hasRecentFeatured) {
      console.log('🔄 [UnifiedFeaturedManager] No recent featured articles, using latest articles');
      
      articlesToReturn = await prisma.articles.findMany({
        where: baseWhere,
        select: baseSelect,
        orderBy: {
          published_at: "desc",
        },
        take: limit * 2,
      });
      source = 'latest';
    }

    // تصفية وتنسيق البيانات
    const processedArticles = await this.processArticles(articlesToReturn, limit);

    const responseData: FeaturedResponse = {
      success: true,
      articles: processedArticles,
      count: processedArticles.length,
      timestamp: new Date().toISOString(),
      source,
      cached: false,
    };

    // حفظ في Cache
    try {
      await redis.set(cacheKey, responseData, this.REDIS_TTL);
    } catch (error) {
      console.warn('Failed to save to Redis cache:', error);
    }
    
    this.memoryCache.set(cacheKey, { data: responseData, timestamp: Date.now() });

    return responseData;
  }

  /**
   * معالجة وتنسيق المقالات بشكل موحد
   */
  private async processArticles(articles: any[], limit: number): Promise<UnifiedFeaturedArticle[]> {
    // تصفية المقالات التجريبية
    const TEST_PATTERNS = [
      /\btest\b/i,
      /\bdemo\b/i,
      /\bdummy\b/i,
      /\bsample\b/i,
      /تجريبي/i,
      /تجريبية/i,
      /اختبار/i,
    ];

    const isTestArticle = (article: any): boolean => {
      try {
        const title = article?.title || "";
        const slug = article?.slug || "";
        const meta = JSON.stringify(article?.metadata || {});
        const haystack = `${title}\n${slug}\n${meta}`;
        return TEST_PATTERNS.some((re) => re.test(haystack));
      } catch {
        return false;
      }
    };

    const filtered = articles.filter(article => !isTestArticle(article));
    const limited = filtered.slice(0, limit);

    return limited.map(article => ({
      id: article.id,
      title: article.title,
      slug: article.slug,
      excerpt: article.excerpt,
      featured_image: this.processImage(article),
      published_at: article.published_at,
      views: article.views || 0,
      breaking: article.breaking || false,
      featured: article.featured || false,
      category: article.categories ? {
        id: article.categories.id,
        name: article.categories.name,
        slug: article.categories.slug,
        color: article.categories.color,
        icon: article.categories.icon,
      } : null,
      author: article.author ? {
        id: article.author.id,
        name: article.author.name,
      } : null,
      metadata: article.metadata,
    }));
  }

  /**
   * معالجة موحدة للصور
   */
  private processImage(article: any): string {
    const rawImageUrl = article.featured_image ||
                        (article.metadata as any)?.featured_image ||
                        (article.metadata as any)?.image ||
                        null;

    return getProductionImageUrl(rawImageUrl, {
      width: 800,
      height: 600,
      quality: 85,
      fallbackType: "article"
    });
  }

  /**
   * مسح Cache عند الحاجة
   */
  async clearCache(): Promise<void> {
    this.memoryCache.clear();
    try {
      const keys = ['unified-featured:v1:3', 'unified-featured:v1:6', 'unified-featured:v1:9'];
      for (const key of keys) {
        await redis.del(key);
      }
    } catch (error) {
      console.warn('Failed to clear Redis cache:', error);
    }
  }
}

export default UnifiedFeaturedManager.getInstance();
