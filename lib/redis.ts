import { Redis } from 'ioredis';

// فحص إذا كنا في بيئة بناء Vercel
const isVercelBuild = process.env.VERCEL === '1' || 
                     process.env.VERCEL_ENV !== undefined ||
                     process.env.DISABLE_REDIS === 'true';

// إنشاء اتصال Redis - يدعم كل من الإنتاج والتطوير
let redis: Redis;

// إذا كنا في بيئة بناء، استخدم dummy Redis
if (isVercelBuild) {
  console.log('🏗️  Vercel build detected - using dummy Redis');
  redis = {
    get: async () => null,
    set: async () => 'OK',
    del: async () => 1,
    exists: async () => 0,
    expire: async () => 1,
    ttl: async () => -1,
    keys: async () => [],
    flushdb: async () => 'OK',
    on: () => {},
    disconnect: async () => {},
  } as any;
} else {
  // في بيئة التطوير، تجاهل REDIS_URL واستخدم الإعدادات المحلية
  const isDevelopment = process.env.NODE_ENV === 'development' || !process.env.NODE_ENV;

// التحقق من أن REDIS_URL يشير إلى cloud
const isCloudRedis = process.env.REDIS_URL && 
  (process.env.REDIS_URL.includes('cloud') || 
   process.env.REDIS_URL.includes('rediss://') || 
   process.env.REDIS_URL.includes('redis-') ||
   !process.env.REDIS_URL.includes('localhost'));

if (isDevelopment || (!isCloudRedis && process.env.REDIS_HOST)) {
  // استخدام Redis المحلي في التطوير أو عندما يكون REDIS_URL محلي
  console.log('🔧 استخدام Redis المحلي');
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
    connectTimeout: 5000,
    commandTimeout: 5000,
    enableOfflineQueue: false,
    lazyConnect: true // تأخير الاتصال حتى أول استخدام
  });
} else if (isCloudRedis) {
  // استخدام Redis Cloud في الإنتاج
  console.log('☁️ استخدام Redis Cloud في الإنتاج');
  redis = new Redis(process.env.REDIS_URL!, {
    tls: process.env.REDIS_URL.startsWith('rediss://') ? {} : undefined, // تفعيل TLS فقط إذا كان البروتوكول rediss://
    retryStrategy: (times) => {
      const delay = Math.min(times * 50, 2000);
      return delay;
    },
    maxRetriesPerRequest: 3,
    connectTimeout: 10000,
    commandTimeout: 5000,
  });
} else {
  // خيار احتياطي
  console.log('⚠️ لا توجد إعدادات Redis، استخدام الإعدادات الافتراضية');
  redis = new Redis({
    host: 'localhost',
    port: 6379,
    retryStrategy: (times) => {
      const delay = Math.min(times * 50, 2000);
      return delay;
    },
    maxRetriesPerRequest: 3,
    lazyConnect: true
  });
}

// متغير لتتبع حالة Redis
let redisAvailable = !isVercelBuild;

// معالج الأخطاء
if (!isVercelBuild) {
  redis.on('error', (err) => {
    console.error('❌ خطأ في Redis:', err);
    // تعطيل Redis في حالة الأخطاء الحرجة
    if (err.code === 'ERR_SSL_WRONG_VERSION_NUMBER' || err.code === 'ECONNREFUSED') {
      redisAvailable = false;
      console.warn('⚠️ تم تعطيل Redis بسبب مشكلة في الاتصال');
    }
  });

  redis.on('connect', () => {
    console.log('✅ تم الاتصال بـ Redis');
    if (isDevelopment) {
      console.log('💻 متصل بـ Redis المحلي على', redis.options.host + ':' + redis.options.port);
    } else if (process.env.REDIS_URL) {
      console.log('📡 متصل بـ Redis Cloud');
    }
  });
}

// دوال مساعدة للتخزين المؤقت
export const cache = {
  // جلب من التخزين المؤقت
  async get<T>(key: string): Promise<T | null> {
    if (!redisAvailable) return null;
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
    if (!redisAvailable) return;
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
    if (!redisAvailable) return;
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
    if (!redisAvailable) return;
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
  ARTICLES: 60, // دقيقة واحدة فقط للأخبار العاجلة
  CATEGORIES: 60 * 60 * 24, // يوم واحد للتصنيفات
  USERS: 60 * 60 * 12, // 12 ساعة للمستخدمين
  STATS: 60, // دقيقة واحدة للإحصائيات
  SEARCH: 60 * 2, // دقيقتين للبحث
  DEFAULT: 60, // دقيقة واحدة افتراضياً
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