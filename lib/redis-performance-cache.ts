/**
 * نظام Redis Cache محسن للأداء العالي
 * خاص بتحسين استعلامات قاعدة البيانات المكثفة
 */

import { getRedisClient, isRedisReady } from './redis-client';
import prisma from './prisma';

// إعدادات TTL محسنة للأداء
const PERFORMANCE_TTL = {
  // البيانات الثابتة - مدة طويلة
  STATIC: {
    CATEGORIES: 60 * 60 * 2, // ساعتان
    AUTHORS: 60 * 30, // 30 دقيقة
    SETTINGS: 60 * 60, // ساعة
  },
  
  // البيانات الديناميكية - مدة متوسطة  
  DYNAMIC: {
    ARTICLES_LIST: 60 * 5, // 5 دقائق
    FEATURED_NEWS: 60 * 3, // 3 دقائق
    USER_PREFERENCES: 60 * 10, // 10 دقائق
  },
  
  // البيانات عالية التفاعل - مدة قصيرة
  INTERACTIVE: {
    ARTICLE_INTERACTIONS: 60 * 2, // دقيقتان
    COMMENTS: 60 * 1, // دقيقة واحدة
    REAL_TIME_STATS: 30, // 30 ثانية
  }
};

// مفاتيح Cache محسنة
const CACHE_KEYS = {
  // التصنيفات
  categories: {
    active: () => 'perf:categories:active:v3',
    withStats: () => 'perf:categories:stats:v3',
    bySlug: (slug: string) => `perf:category:${slug}:v3`,
  },
  
  // المقالات
  articles: {
    homepage: (page: number) => `perf:articles:homepage:${page}:v3`,
    featured: () => 'perf:articles:featured:v3',
    byCategory: (categoryId: string, page: number) => `perf:articles:cat:${categoryId}:${page}:v3`,
    trending: () => 'perf:articles:trending:v3',
    search: (query: string, page: number) => `perf:search:${Buffer.from(query).toString('base64')}:${page}:v3`,
  },
  
  // البيانات الشخصية
  user: {
    preferences: (userId: string) => `perf:user:${userId}:prefs:v3`,
    interactions: (userId: string, articleId: string) => `perf:user:${userId}:article:${articleId}:v3`,
    savedArticles: (userId: string) => `perf:user:${userId}:saved:v3`,
  },
  
  // الإحصائيات
  stats: {
    summary: () => 'perf:stats:summary:v3',
    categoryStats: (categoryId: string) => `perf:stats:category:${categoryId}:v3`,
    articleViews: (articleId: string) => `perf:stats:views:${articleId}:v3`,
  }
};

/**
 * دالة عامة للحصول على البيانات مع Cache
 */
async function getCachedData<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl: number
): Promise<T> {
  // إذا Redis غير متاح، تشغيل المباشر
  const redis = getRedisClient();
  if (!isRedisReady() || !redis) {
    return fetcher();
  }

  try {
    // محاولة جلب من Cache
    const cached = await redis.get(key);
    if (cached) {
      const data = JSON.parse(cached);
      console.log(`✅ Cache Hit: ${key}`);
      return data;
    }

    // Cache Miss - جلب من قاعدة البيانات
    console.log(`⚡ Cache Miss: ${key} - جلب من DB`);
    const data = await fetcher();
    
    // حفظ في Cache
    await redis.setex(key, ttl, JSON.stringify(data));
    
    return data;
  } catch (error) {
    console.error(`❌ Redis Cache Error for ${key}:`, error);
    // في حالة خطأ Redis، تشغيل مباشر
    return fetcher();
  }
}

/**
 * التصنيفات النشطة مع إحصائيات
 */
export const getCachedActiveCategories = () => 
  getCachedData(
    CACHE_KEYS.categories.withStats(),
    async () => {
      return prisma.categories.findMany({
        where: { is_active: true },
        orderBy: { display_order: 'asc' },
        include: {
          _count: {
            select: {
              articles: {
                where: { status: 'published' }
              }
            }
          }
        }
      });
    },
    PERFORMANCE_TTL.STATIC.CATEGORIES
  );

/**
 * المقالات المميزة للصفحة الرئيسية
 */
export const getCachedFeaturedArticles = () =>
  getCachedData(
    CACHE_KEYS.articles.featured(),
    async () => {
      return prisma.articles.findMany({
        where: {
          status: 'published',
          featured: true,
          published_at: { lte: new Date() }
        },
        include: {
          categories: {
            select: { id: true, name: true, slug: true, color: true }
          },
          author: {
            select: { id: true, name: true, avatar: true }
          },
          _count: {
            select: { interactions: true }
          }
        },
        orderBy: { published_at: 'desc' },
        take: 10
      });
    },
    PERFORMANCE_TTL.DYNAMIC.FEATURED_NEWS
  );

/**
 * مقالات الصفحة الرئيسية مع Pagination
 */
export const getCachedHomepageArticles = (page: number = 1, limit: number = 20) =>
  getCachedData(
    CACHE_KEYS.articles.homepage(page),
    async () => {
      const skip = (page - 1) * limit;
      
      return prisma.articles.findMany({
        where: {
          status: 'published',
          published_at: { lte: new Date() }
        },
        include: {
          categories: {
            select: { id: true, name: true, slug: true, color: true }
          },
          author: {
            select: { id: true, name: true, avatar: true }
          },
          _count: {
            select: { interactions: true }
          }
        },
        orderBy: [
          { featured: 'desc' },
          { published_at: 'desc' }
        ],
        skip,
        take: limit
      });
    },
    PERFORMANCE_TTL.DYNAMIC.ARTICLES_LIST
  );

/**
 * مقالات حسب التصنيف
 */
export const getCachedCategoryArticles = (categoryId: string, page: number = 1, limit: number = 20) =>
  getCachedData(
    CACHE_KEYS.articles.byCategory(categoryId, page),
    async () => {
      const skip = (page - 1) * limit;
      
      return prisma.articles.findMany({
        where: {
          category_id: categoryId,
          status: 'published',
          published_at: { lte: new Date() }
        },
        include: {
          categories: {
            select: { id: true, name: true, slug: true, color: true }
          },
          author: {
            select: { id: true, name: true, avatar: true }
          },
          _count: {
            select: { interactions: true }
          }
        },
        orderBy: { published_at: 'desc' },
        skip,
        take: limit
      });
    },
    PERFORMANCE_TTL.DYNAMIC.ARTICLES_LIST
  );

/**
 * المقالات الأكثر قراءة
 */
export const getCachedTrendingArticles = () =>
  getCachedData(
    CACHE_KEYS.articles.trending(),
    async () => {
      // استعلام محسن للمقالات الرائجة
      const articles = await prisma.$queryRaw`
        SELECT 
          a.id, a.title, a.slug, a.excerpt, a.featured_image, a.views, a.published_at,
          c.name as category_name, c.slug as category_slug, c.color as category_color,
          u.name as author_name, u.avatar as author_avatar,
          COUNT(i.id) as interactions_count
        FROM articles a
        LEFT JOIN categories c ON a.category_id = c.id
        LEFT JOIN users u ON a.author_id = u.id
        LEFT JOIN interactions i ON a.id = i.article_id
        WHERE a.status = 'published' 
        AND a.published_at <= NOW()
        AND a.published_at >= NOW() - INTERVAL '7 days'
        GROUP BY a.id, c.id, u.id
        ORDER BY 
          (a.views * 0.7 + COUNT(i.id) * 0.3) DESC,
          a.published_at DESC
        LIMIT 15
      `;
      
      return articles;
    },
    PERFORMANCE_TTL.DYNAMIC.ARTICLES_LIST
  );

/**
 * تفضيلات المستخدم
 */
export const getCachedUserPreferences = (userId: string) =>
  getCachedData(
    CACHE_KEYS.user.preferences(userId),
    async () => {
      return prisma.user_preferences.findMany({
        where: { user_id: userId },
        select: {
          key: true,
          value: true,
          updated_at: true
        }
      });
    },
    PERFORMANCE_TTL.DYNAMIC.USER_PREFERENCES
  );

/**
 * إحصائيات الموقع المجمعة
 */
export const getCachedSiteStats = () =>
  getCachedData(
    CACHE_KEYS.stats.summary(),
    async () => {
      // استعلام محسن واحد للإحصائيات
      const stats = await prisma.$queryRaw`
        SELECT 
          (SELECT COUNT(*) FROM articles WHERE status = 'published') as total_articles,
          (SELECT COUNT(*) FROM categories WHERE is_active = true) as total_categories,
          (SELECT COUNT(*) FROM users WHERE status = 'active') as total_users,
          (SELECT COUNT(*) FROM interactions WHERE created_at >= CURRENT_DATE) as today_interactions,
          (SELECT SUM(views) FROM articles WHERE status = 'published') as total_views
      ` as any[];
      
      return stats[0] || {};
    },
    PERFORMANCE_TTL.INTERACTIVE.REAL_TIME_STATS
  );

/**
 * مسح Cache معين
 */
export async function clearCachePattern(pattern: string): Promise<void> {
  const redis = getRedisClient();
  if (!isRedisReady() || !redis) return;

  try {
    const keys = await redis.keys(pattern);
    if (keys.length > 0) {
      await redis.del(...keys);
      console.log(`🧹 تم مسح ${keys.length} مفتاح Cache: ${pattern}`);
    }
  } catch (error) {
    console.error('❌ خطأ في مسح Cache:', error);
  }
}

/**
 * مسح Cache المقالات عند التحديث
 */
export async function invalidateArticleCache(): Promise<void> {
  await Promise.all([
    clearCachePattern('perf:articles:*'),
    clearCachePattern('perf:stats:*'),
  ]);
}

/**
 * مسح Cache التصنيفات عند التحديث
 */
export async function invalidateCategoryCache(): Promise<void> {
  await Promise.all([
    clearCachePattern('perf:categories:*'),
    clearCachePattern('perf:articles:cat:*'),
  ]);
}

/**
 * تسخين Cache للبيانات الأساسية
 */
export async function warmupCache(): Promise<void> {
  console.log('🔥 بدء تسخين Cache...');
  
  try {
    await Promise.all([
      getCachedActiveCategories(),
      getCachedFeaturedArticles(),
      getCachedHomepageArticles(1),
      getCachedTrendingArticles(),
      getCachedSiteStats(),
    ]);
    
    console.log('✅ تم تسخين Cache بنجاح');
  } catch (error) {
    console.error('❌ خطأ في تسخين Cache:', error);
  }
}

export {
  CACHE_KEYS,
  PERFORMANCE_TTL,
  getCachedData
};
