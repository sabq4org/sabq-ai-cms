import { Redis } from 'ioredis';

// إنشاء اتصال Redis محسن
let redis: Redis | null = null;

function createRedisConnection() {
  const isDevelopment = process.env.NODE_ENV === 'development' || !process.env.NODE_ENV;
  
  // في بيئة الإنتاج على DigitalOcean
  if (process.env.REDIS_URL && process.env.REDIS_URL.includes('redis-')) {
    console.log('☁️ استخدام Redis Cloud من DigitalOcean');
    redis = new Redis(process.env.REDIS_URL, {
      tls: {
        rejectUnauthorized: false
      },
      retryStrategy: (times) => {
        if (times > 3) {
          console.log('⚠️ تجاوز عدد محاولات الاتصال بـ Redis Cloud');
          return null; // إيقاف المحاولات
        }
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
      maxRetriesPerRequest: 3,
      connectTimeout: 10000,
      commandTimeout: 5000,
      enableOfflineQueue: false,
    });
  } else {
    // في بيئة التطوير - استخدام Redis المحلي
    console.log('🔧 استخدام Redis المحلي للتطوير');
    const host = process.env.REDIS_HOST || 'localhost';
    const port = parseInt(process.env.REDIS_PORT || '6379');
    
    redis = new Redis({
      host,
      port,
      password: process.env.REDIS_PASSWORD,
      db: parseInt(process.env.REDIS_DB || '0'),
      retryStrategy: (times) => {
        if (times > 3) {
          console.log('⚠️ Redis المحلي غير متاح، سيتم العمل بدون cache');
          return null; // إيقاف المحاولات
        }
        const delay = Math.min(times * 50, 1000);
        return delay;
      },
      maxRetriesPerRequest: 3,
      connectTimeout: 3000,
      commandTimeout: 3000,
      enableOfflineQueue: false,
      lazyConnect: true
    });
  }

  // معالج الأخطاء
  redis.on('error', (err) => {
    console.error('❌ خطأ في Redis:', err.message);
    // لا نوقف التطبيق، نعمل بدون cache
  });

  redis.on('connect', () => {
    console.log('✅ تم الاتصال بـ Redis بنجاح');
  });

  redis.on('ready', () => {
    console.log('🟢 Redis جاهز للاستخدام');
  });

  return redis;
}

// الحصول على اتصال Redis (singleton)
function getRedis() {
  if (!redis) {
    redis = createRedisConnection();
  }
  return redis;
}

// دوال مساعدة محسنة مع fallback
export const cache = {
  // جلب من التخزين المؤقت مع fallback
  async get<T>(key: string): Promise<T | null> {
    try {
      const redisClient = getRedis();
      if (!redisClient || redisClient.status !== 'ready') {
        return null; // عمل بدون cache
      }
      
      const data = await redisClient.get(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.warn(`⚠️ تجاوز Redis، جلب ${key} مباشرة من DB`);
      return null;
    }
  },

  // حفظ في التخزين المؤقت مع معالجة الأخطاء
  async set(key: string, value: any, ttl?: number): Promise<void> {
    try {
      const redisClient = getRedis();
      if (!redisClient || redisClient.status !== 'ready') {
        return; // عمل بدون cache
      }
      
      const data = JSON.stringify(value);
      if (ttl) {
        await redisClient.setex(key, ttl, data);
      } else {
        await redisClient.set(key, data);
      }
      console.log(`💾 تم حفظ ${key} في Redis`);
    } catch (error) {
      console.warn(`⚠️ فشل حفظ ${key} في Redis، المتابعة بدون cache`);
    }
  },

  // حذف من التخزين المؤقت
  async del(key: string | string[]): Promise<void> {
    try {
      const redisClient = getRedis();
      if (!redisClient || redisClient.status !== 'ready') {
        return;
      }
      
      if (Array.isArray(key)) {
        await redisClient.del(...key);
      } else {
        await redisClient.del(key);
      }
    } catch (error) {
      console.warn(`⚠️ فشل حذف ${key} من Redis`);
    }
  },

  // مسح التخزين المؤقت بنمط معين
  async clearPattern(pattern: string): Promise<void> {
    try {
      const redisClient = getRedis();
      if (!redisClient || redisClient.status !== 'ready') {
        return;
      }
      
      const keys = await redisClient.keys(pattern);
      if (keys.length > 0) {
        await redisClient.del(...keys);
        console.log(`🧹 تم مسح ${keys.length} مفتاح من Redis`);
      }
    } catch (error) {
      console.warn(`⚠️ فشل مسح النمط ${pattern} من Redis`);
    }
  },

  // التحقق من وجود مفتاح
  async exists(key: string): Promise<boolean> {
    try {
      const redisClient = getRedis();
      if (!redisClient || redisClient.status !== 'ready') {
        return false;
      }
      
      return (await redisClient.exists(key)) === 1;
    } catch (error) {
      return false;
    }
  },

  // التحقق من حالة Redis
  isReady(): boolean {
    const redisClient = getRedis();
    return redisClient ? redisClient.status === 'ready' : false;
  }
};

// أوقات التخزين المؤقت (بالثواني)
export const CACHE_TTL = {
  ARTICLES: 60 * 5, // 5 دقائق بدلاً من ساعة للمقالات
  CATEGORIES: 60 * 60 * 24, // يوم واحد
  USERS: 60 * 60 * 12, // 12 ساعة
  STATS: 60 * 2, // دقيقتين للإحصائيات
  SEARCH: 60 * 15, // 15 دقيقة للبحث
  DEFAULT: 60 * 10, // 10 دقائق افتراضي
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

export default getRedis(); 