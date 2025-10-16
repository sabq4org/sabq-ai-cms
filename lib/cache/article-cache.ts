/**
 * نظام تخزين مؤقت متقدم للمقالات باستخدام Redis
 * يوفر أداءً عالياً وتقليل الحمل على قاعدة البيانات
 */

import Redis from "ioredis";

// إنشاء اتصال Redis
let redis: Redis | null = null;

function getRedisClient(): Redis | null {
  if (!redis && process.env.REDIS_URL) {
    try {
      redis = new Redis(process.env.REDIS_URL, {
        maxRetriesPerRequest: 3,
        retryStrategy: (times) => {
          if (times > 3) return null;
          return Math.min(times * 200, 1000);
        },
        lazyConnect: true,
      });

      redis.on("error", (err) => {
        console.error("❌ خطأ في اتصال Redis:", err);
      });

      redis.on("connect", () => {
        console.log("✅ تم الاتصال بـ Redis بنجاح");
      });
    } catch (error) {
      console.error("❌ فشل إنشاء اتصال Redis:", error);
      return null;
    }
  }
  return redis;
}

interface CacheOptions {
  ttl?: number; // مدة الصلاحية بالثواني (افتراضي: 5 دقائق)
  prefix?: string; // بادئة المفتاح (افتراضي: 'article:')
}

const DEFAULT_TTL = 300; // 5 دقائق
const DEFAULT_PREFIX = "article:";

/**
 * جلب مقال من الكاش
 */
export async function getArticleFromCache(
  articleId: string,
  options: CacheOptions = {}
): Promise<any | null> {
  const client = getRedisClient();
  if (!client) return null;

  const { prefix = DEFAULT_PREFIX } = options;
  const key = `${prefix}${articleId}`;

  try {
    await client.connect();
    const cached = await client.get(key);
    
    if (cached) {
      console.log(`✅ تم جلب المقال من الكاش: ${articleId}`);
      return JSON.parse(cached);
    }
    
    return null;
  } catch (error) {
    console.error("❌ خطأ في جلب المقال من الكاش:", error);
    return null;
  }
}

/**
 * حفظ مقال في الكاش
 */
export async function setArticleInCache(
  articleId: string,
  data: any,
  options: CacheOptions = {}
): Promise<boolean> {
  const client = getRedisClient();
  if (!client) return false;

  const { ttl = DEFAULT_TTL, prefix = DEFAULT_PREFIX } = options;
  const key = `${prefix}${articleId}`;

  try {
    await client.connect();
    await client.setex(key, ttl, JSON.stringify(data));
    console.log(`✅ تم حفظ المقال في الكاش: ${articleId} (TTL: ${ttl}s)`);
    return true;
  } catch (error) {
    console.error("❌ خطأ في حفظ المقال في الكاش:", error);
    return false;
  }
}

/**
 * حذف مقال من الكاش
 */
export async function deleteArticleFromCache(
  articleId: string,
  options: CacheOptions = {}
): Promise<boolean> {
  const client = getRedisClient();
  if (!client) return false;

  const { prefix = DEFAULT_PREFIX } = options;
  const key = `${prefix}${articleId}`;

  try {
    await client.connect();
    await client.del(key);
    console.log(`✅ تم حذف المقال من الكاش: ${articleId}`);
    return true;
  } catch (error) {
    console.error("❌ خطأ في حذف المقال من الكاش:", error);
    return false;
  }
}

/**
 * حذف جميع المقالات من الكاش
 */
export async function clearArticleCache(
  options: CacheOptions = {}
): Promise<boolean> {
  const client = getRedisClient();
  if (!client) return false;

  const { prefix = DEFAULT_PREFIX } = options;

  try {
    await client.connect();
    const keys = await client.keys(`${prefix}*`);
    
    if (keys.length > 0) {
      await client.del(...keys);
      console.log(`✅ تم حذف ${keys.length} مقال من الكاش`);
    }
    
    return true;
  } catch (error) {
    console.error("❌ خطأ في حذف الكاش:", error);
    return false;
  }
}

/**
 * جلب إحصائيات الكاش
 */
export async function getCacheStats(
  options: CacheOptions = {}
): Promise<{
  totalKeys: number;
  memoryUsed: string;
  hitRate: number;
} | null> {
  const client = getRedisClient();
  if (!client) return null;

  const { prefix = DEFAULT_PREFIX } = options;

  try {
    await client.connect();
    const keys = await client.keys(`${prefix}*`);
    const info = await client.info("memory");
    
    // استخراج استخدام الذاكرة
    const memoryMatch = info.match(/used_memory_human:(.+)/);
    const memoryUsed = memoryMatch ? memoryMatch[1].trim() : "غير متاح";

    return {
      totalKeys: keys.length,
      memoryUsed,
      hitRate: 0, // يمكن حسابه بناءً على إحصائيات Redis
    };
  } catch (error) {
    console.error("❌ خطأ في جلب إحصائيات الكاش:", error);
    return null;
  }
}

/**
 * تحديث عدد المشاهدات في الكاش
 */
export async function incrementViewsInCache(
  articleId: string,
  options: CacheOptions = {}
): Promise<boolean> {
  const client = getRedisClient();
  if (!client) return false;

  const { prefix = DEFAULT_PREFIX } = options;
  const key = `${prefix}${articleId}`;

  try {
    await client.connect();
    const cached = await client.get(key);
    
    if (cached) {
      const article = JSON.parse(cached);
      article.views = (article.views || 0) + 1;
      
      const ttl = await client.ttl(key);
      await client.setex(key, ttl > 0 ? ttl : DEFAULT_TTL, JSON.stringify(article));
      
      console.log(`✅ تم تحديث المشاهدات في الكاش: ${articleId}`);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error("❌ خطأ في تحديث المشاهدات في الكاش:", error);
    return false;
  }
}

/**
 * جلب مقالات متعددة من الكاش
 */
export async function getMultipleArticlesFromCache(
  articleIds: string[],
  options: CacheOptions = {}
): Promise<Map<string, any>> {
  const client = getRedisClient();
  const results = new Map<string, any>();
  
  if (!client) return results;

  const { prefix = DEFAULT_PREFIX } = options;

  try {
    await client.connect();
    const keys = articleIds.map((id) => `${prefix}${id}`);
    const values = await client.mget(...keys);

    values.forEach((value, index) => {
      if (value) {
        try {
          results.set(articleIds[index], JSON.parse(value));
        } catch (error) {
          console.error(`❌ خطأ في تحليل المقال من الكاش: ${articleIds[index]}`);
        }
      }
    });

    console.log(`✅ تم جلب ${results.size} مقال من ${articleIds.length} من الكاش`);
    return results;
  } catch (error) {
    console.error("❌ خطأ في جلب المقالات المتعددة من الكاش:", error);
    return results;
  }
}

/**
 * إغلاق اتصال Redis
 */
export async function closeRedisConnection(): Promise<void> {
  if (redis) {
    try {
      await redis.quit();
      redis = null;
      console.log("✅ تم إغلاق اتصال Redis");
    } catch (error) {
      console.error("❌ خطأ في إغلاق اتصال Redis:", error);
    }
  }
}

