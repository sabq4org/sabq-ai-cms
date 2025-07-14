import { Redis } from 'ioredis';

// إنشاء اتصال Redis - يدعم كل من الإنتاج والتطوير
let redis: Redis;

if (process.env.REDIS_URL) {
  // استخدام Redis Cloud في الإنتاج
  redis = new Redis(process.env.REDIS_URL, {
    tls: {}, // مطلوب لـ rediss://
    retryStrategy: (times) => {
      const delay = Math.min(times * 50, 2000);
      return delay;
    },
    maxRetriesPerRequest: 3,
  });
} else {
  // استخدام Redis المحلي في التطوير
  redis = new Redis({
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD,
    db: parseInt(process.env.REDIS_DB || '0'),
    retryStrategy: (times) => {
      const delay = Math.min(times * 50, 2000);
      return delay;
    },
    maxRetriesPerRequest: 3,
  });
}

// معالج الأخطاء
redis.on('error', (err) => {
  console.error('❌ خطأ في Redis:', err);
});

redis.on('connect', () => {
  console.log('✅ تم الاتصال بـ Redis');
  if (process.env.REDIS_URL) {
    console.log('📡 متصل بـ Redis Cloud');
  } else {
    console.log('💻 متصل بـ Redis المحلي');
  }
});

// دوال مساعدة للتخزين المؤقت
export const cache = {
  // جلب من التخزين المؤقت
  async get<T>(key: string): Promise<T | null> {
    try {
      const data = await redis.get(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error(`خطأ في جلب ${key} من Redis:`, error);
      return null;
    }
  },

  // حفظ في التخزين المؤقت
  async set(key: string, value: any, ttl?: number): Promise<void> {
    try {
      const data = JSON.stringify(value);
      if (ttl) {
        await redis.setex(key, ttl, data);
      } else {
        await redis.set(key, data);
      }
    } catch (error) {
      console.error(`خطأ في حفظ ${key} في Redis:`, error);
    }
  },

  // حذف من التخزين المؤقت
  async del(key: string | string[]): Promise<void> {
    try {
      if (Array.isArray(key)) {
        await redis.del(...key);
      } else {
        await redis.del(key);
      }
    } catch (error) {
      console.error(`خطأ في حذف ${key} من Redis:`, error);
    }
  },

  // مسح التخزين المؤقت بنمط معين
  async clearPattern(pattern: string): Promise<void> {
    try {
      const keys = await redis.keys(pattern);
      if (keys.length > 0) {
        await redis.del(...keys);
      }
    } catch (error) {
      console.error(`خطأ في مسح النمط ${pattern} من Redis:`, error);
    }
  },

  // التحقق من وجود مفتاح
  async exists(key: string): Promise<boolean> {
    try {
      return (await redis.exists(key)) === 1;
    } catch (error) {
      console.error(`خطأ في التحقق من ${key} في Redis:`, error);
      return false;
    }
  },

  // تعيين TTL
  async expire(key: string, seconds: number): Promise<void> {
    try {
      await redis.expire(key, seconds);
    } catch (error) {
      console.error(`خطأ في تعيين TTL لـ ${key}:`, error);
    }
  },
};

// أوقات التخزين المؤقت الافتراضية (بالثواني)
export const CACHE_TTL = {
  ARTICLES: 60 * 60, // ساعة واحدة
  CATEGORIES: 60 * 60 * 24, // يوم واحد
  USERS: 60 * 60 * 12, // 12 ساعة
  STATS: 60 * 5, // 5 دقائق
  SEARCH: 60 * 30, // 30 دقيقة
  DEFAULT: 60 * 60, // ساعة واحدة
};

// مفاتيح التخزين المؤقت
export const CACHE_KEYS = {
  articles: (params?: any) => `articles:${JSON.stringify(params || {})}`,
  article: (id: string) => `article:${id}`,
  categories: () => 'categories:all',
  category: (id: string) => `category:${id}`,
  user: (id: string) => `user:${id}`,
  stats: () => 'stats:dashboard',
  search: (query: string) => `search:${query}`,
};

export default redis; 