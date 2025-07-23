// تحقق من وجود ioredis وإذا لم تكن متوفرة، استخدم null
let Redis: any = null;
try {
  const ioredis = require('ioredis');
  Redis = ioredis.Redis || ioredis.default || ioredis;
} catch (error) {
  console.warn('⚠️ ioredis غير متوفر، سيتم تشغيل النظام بدون Redis');
  Redis = null;
}

// إنشاء اتصال Redis محسن
let redis: any = null;

function createRedisConnection() {
  const isDevelopment = process.env.NODE_ENV === 'development' || !process.env.NODE_ENV;
  
  // تحقق من تفعيل Redis
  if (process.env.REDIS_ENABLED === 'false' || process.env.ENABLE_REDIS === 'false') {
    console.log('🔧 Redis معطل في الإعدادات - العمل في وضع التطوير بدون Redis');
    return null;
  }
  
  // إذا لم تكن ioredis متوفرة، لا تحاول الاتصال
  if (!Redis) {
    console.log('🔧 تم تعطيل Redis - العمل في وضع التطوير بدون Redis');
    return null;
  }
  
  // في بيئة الإنتاج على DigitalOcean
  if (process.env.REDIS_URL && process.env.REDIS_URL.includes('redis-')) {
    console.log('☁️ استخدام Redis Cloud من DigitalOcean');
    redis = new Redis(process.env.REDIS_URL, {
      tls: {
        rejectUnauthorized: false
      },
      retryStrategy: (times: number) => {
        if (times > 2) {
          console.log('⚠️ تجاوز عدد محاولات الاتصال بـ Redis Cloud');
          return null; // إيقاف المحاولات
        }
        const delay = Math.min(times * 30, 1000);
        return delay;
      },
      maxRetriesPerRequest: 2,
      connectTimeout: 5000,
      commandTimeout: 2000,
      enableOfflineQueue: false,
      // تحسينات إضافية للأداء
      lazyConnect: true,
      keepAlive: 10000,
      noDelay: true,
    });
  } else if (process.env.REDIS_URL && isDevelopment) {
    // في بيئة التطوير - تحقق من وجود Redis محلي
    console.log('🔧 محاولة استخدام Redis المحلي للتطوير');
    try {
      const host = process.env.REDIS_HOST || 'localhost';
      const port = parseInt(process.env.REDIS_PORT || '6379');
      
      redis = new Redis({
        host,
        port,
        password: process.env.REDIS_PASSWORD,
        db: parseInt(process.env.REDIS_DB || '0'),
        retryStrategy: (times: number) => {
          if (times > 2) {
            console.log('⚠️ Redis المحلي غير متاح، سيتم العمل بدون cache');
            return null; // إيقاف المحاولات
          }
          const delay = Math.min(times * 30, 500);
          return delay;
        },
        maxRetriesPerRequest: 2,
        connectTimeout: 2000,
        commandTimeout: 1000,
        enableOfflineQueue: false,
        lazyConnect: true
      });
    } catch (error) {
      console.log('⚠️ فشل في إنشاء اتصال Redis المحلي، العمل بدون cache');
      redis = null;
    }
  } else {
    console.log('🔧 Redis غير مُكوَّن، العمل بدون cache');
    redis = null;
  }

  // معالج الأخطاء فقط إذا كان Redis متصلاً
  if (redis) {
    redis.on('error', (err: any) => {
      console.error('❌ خطأ في Redis:', err);
      // لا نوقف التطبيق، نعمل بدون cache
    });

    redis.on('connect', () => {
      console.log('✅ تم الاتصال بـ Redis بنجاح');
    });

    redis.on('ready', () => {
      console.log('🟢 Redis جاهز للاستخدام');
    });
  }

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
  ARTICLES: 60 * 2, // دقيقتين للمقالات العادية
  ARTICLES_POPULAR: 60 * 10, // 10 دقائق للمقالات الشائعة
  CATEGORIES: 60 * 60 * 24, // يوم واحد للتصنيفات (لا تتغير كثيراً)
  USERS: 60 * 60 * 12, // 12 ساعة للمستخدمين
  STATS: 60 * 2, // دقيقتين للإحصائيات
  SEARCH: 60 * 5, // 5 دقائق للبحث
  DEFAULT: 60 * 2, // دقيقتين افتراضياً
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