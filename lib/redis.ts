import { getRedisClient, isRedisReady } from "./redis-client";

// دوال مساعدة للتخزين المؤقت باستخدام العميل المركزي
export const cache = {
  async get<T>(key: string): Promise<T | null> {
    const redis = getRedisClient();
    if (!isRedisReady() || !redis) return null;
    try {
      const data = await redis.get(key);
      return data ? JSON.parse(data) : null;
    } catch (error: any) {
      console.error(`خطأ في جلب ${key} من Redis:`, error.message);
      return null;
    }
  },

  async set(key: string, value: any, ttl?: number): Promise<void> {
    const redis = getRedisClient();
    if (!isRedisReady() || !redis) return;
    try {
      const data = JSON.stringify(value);
      if (ttl) {
        await redis.setex(key, ttl, data);
      } else {
        await redis.set(key, data);
      }
    } catch (error: any) {
      console.error(`خطأ في حفظ ${key} في Redis:`, error.message);
    }
  },

  async del(key: string | string[]): Promise<void> {
    const redis = getRedisClient();
    if (!isRedisReady() || !redis) return;
    try {
      if (Array.isArray(key)) {
        await redis.del(...key);
      } else {
        await redis.del(key);
      }
    } catch (error: any) {
      console.error(`خطأ في حذف ${key} من Redis:`, error.message);
    }
  },

  async clearPattern(pattern: string): Promise<void> {
    const redis = getRedisClient();
    if (!isRedisReady() || !redis) return;
    try {
      const keys = await redis.keys(pattern);
      if (keys.length > 0) {
        await redis.del(...keys);
      }
    } catch (error: any) {
      console.error(`خطأ في مسح النمط ${pattern} من Redis:`, error.message);
    }
  },

  async exists(key: string): Promise<boolean> {
    const redis = getRedisClient();
    if (!isRedisReady() || !redis) return false;
    try {
      return (await redis.exists(key)) === 1;
    } catch (error: any) {
      console.error(`خطأ في التحقق من ${key} في Redis:`, error.message);
      return false;
    }
  },

  async expire(key: string, seconds: number): Promise<void> {
    const redis = getRedisClient();
    if (!isRedisReady() || !redis) return;
    try {
      await redis.expire(key, seconds);
    } catch (error: any) {
      console.error(`خطأ في تعيين TTL لـ ${key}:`, error.message);
    }
  },
};

// أوقات التخزين المؤقت الافتراضية (بالثواني)
export const CACHE_TTL = {
  ARTICLES: 60,
  CATEGORIES: 60 * 60 * 24,
  USERS: 60 * 60 * 12,
  STATS: 60,
  SEARCH: 60 * 2,
  DEFAULT: 60,
};

// مفاتيح التخزين المؤقت
export const CACHE_KEYS = {
  articles: (params?: any) => `articles:${JSON.stringify(params || {})}`,
  article: (id: string) => `article:${id}`,
  categories: () => "categories:all",
  category: (id: string) => `category:${id}`,
  user: (id: string) => `user:${id}`,
  stats: () => "stats:dashboard",
  search: (query: string) => `search:${query}`,
};

// تصدير العميل المركزي كدالة بدلاً من استدعاء مباشر
export { getRedisClient as getRedis };
