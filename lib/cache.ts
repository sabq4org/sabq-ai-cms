import { cache as redis } from "@/lib/redis";

export async function cached<T>(
  key: string,
  ttlSec: number,
  fetcher: () => Promise<T>
): Promise<T> {
  const hit = await redis.get<T>(key);
  if (hit) return hit as T;
  const data = await fetcher();
  await redis.set(key, data, ttlSec);
  return data;
}

export async function bust(keys: string[]): Promise<void> {
  if (!keys || keys.length === 0) return;
  const deletions: Array<Promise<void>> = [];
  for (const k of keys) {
    if (k.includes("*")) {
      deletions.push(redis.clearPattern(k));
    } else {
      deletions.push(redis.del(k));
    }
  }
  await Promise.all(deletions);
}

export const CACHE_KEYS = {
  home: () => "news:home:v1",
  category: (slug: string) => `news:category:${slug}:v1`,
  article: (id: string) => `article:${id}:v1`,
  trending: () => "trending:global:v1",
};

// نظام Cache محسن للأداء العالي

// Cache في الذاكرة (Memory Cache) مع TTL
interface CacheItem {
  data: any;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
}

class MemoryCache {
  private cache = new Map<string, CacheItem>();
  private cleanupInterval: NodeJS.Timeout;

  constructor() {
    // تنظيف الـ cache كل 5 دقائق
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 5 * 60 * 1000);
  }

  set(key: string, data: any, ttlMinutes: number = 5): void {
    const ttl = ttlMinutes * 60 * 1000; // تحويل إلى milliseconds
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });
  }

  get(key: string): any | null {
    const item = this.cache.get(key);

    if (!item) {
      return null;
    }

    // التحقق من انتهاء صلاحية الـ cache
    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key);
      return null;
    }

    return item.data;
  }

  has(key: string): boolean {
    return this.get(key) !== null;
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  // تنظيف العناصر المنتهية الصلاحية
  private cleanup(): void {
    const now = Date.now();
    for (const [key, item] of this.cache.entries()) {
      if (now - item.timestamp > item.ttl) {
        this.cache.delete(key);
      }
    }
  }

  // إحصائيات الـ cache
  getStats() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
    };
  }
}

// إنشاء instance واحدة من الـ cache
export const cache = new MemoryCache();

// دالة helper لـ cache مع NextResponse headers
export function withCache<T>(
  key: string,
  ttlMinutes: number = 5,
  publicCache: boolean = true
) {
  return {
    get: (): T | null => cache.get(key),
    set: (data: T) => cache.set(key, data, ttlMinutes),
    has: () => cache.has(key),
    getCacheHeaders: () => ({
      "Cache-Control": publicCache
        ? `public, s-maxage=${ttlMinutes * 60}, stale-while-revalidate=${
            ttlMinutes * 60 * 2
          }`
        : `private, max-age=${ttlMinutes * 60}`,
      "X-Cache-Status": cache.has(key) ? "HIT" : "MISS",
      "X-Cache-TTL": `${ttlMinutes}m`,
    }),
  };
}

// دالة لإنشاء cache key ديناميكي
export function createCacheKey(
  prefix: string,
  params: Record<string, any>
): string {
  const sortedParams = Object.keys(params)
    .sort()
    .map((key) => `${key}:${params[key]}`)
    .join(",");

  return `${prefix}:${sortedParams}`;
}

// دوال تنظيف خاصة بالمحتوى
export const cacheInvalidation = {
  // مسح cache المقالات عند إضافة/تعديل مقال
  invalidateArticles: () => {
    const keys = Array.from(cache["cache"].keys());
    keys.forEach((key) => {
      if (
        key.includes("muqtarab:") ||
        key.includes("articles:") ||
        key.includes("featured:")
      ) {
        cache.delete(key);
      }
    });
  },

  // مسح cache الزوايا عند تعديل زاوية
  invalidateAngles: () => {
    const keys = Array.from(cache["cache"].keys());
    keys.forEach((key) => {
      if (key.includes("angles:") || key.includes("muqtarab:")) {
        cache.delete(key);
      }
    });
  },

  // مسح كل شيء
  invalidateAll: () => {
    cache.clear();
  },
};

// Middleware للأداء
export function performanceLogger(apiName: string) {
  const start = Date.now();

  return {
    end: (itemCount?: number) => {
      const duration = Date.now() - start;
      console.log(
        `⚡ [${apiName}] Duration: ${duration}ms${
          itemCount ? `, Items: ${itemCount}` : ""
        }`
      );

      // تحذير عند البطء
      if (duration > 1000) {
        console.warn(
          `🐌 [${apiName}] SLOW QUERY: ${duration}ms - Consider optimization`
        );
      }

      return duration;
    },
  };
}

// Database query optimization helpers
export const queryOptimizer = {
  // تحسين select للحقول المطلوبة فقط
  getArticleFields: () => ({
    id: true,
    title: true,
    excerpt: true,
    cover_image: true,
    is_published: true,
    created_at: true,
    updated_at: true,
    publish_date: true,
    reading_time: true,
    views: true,
    tags: true,
    sentiment: true,
    angle_id: true,
    author_id: true,
  }),

  // تحسين include للعلاقات
  getAngleInclude: () => ({
    id: true,
    title: true,
    slug: true,
    icon: true,
    theme_color: true,
    description: true,
    is_published: true,
  }),

  // تحسين include للمؤلف
  getAuthorInclude: () => ({
    id: true,
    name: true,
    avatar: true,
    email: true,
  }),
};

export default cache;
