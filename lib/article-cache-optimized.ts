/**
 * نظام Caching محسّن للمقالات
 * يستخدم Redis بشكل كامل لتقليل الضغط على قاعدة البيانات
 */

import { cache as redis } from '@/lib/redis';
import prisma from '@/lib/prisma';

// مفاتيح Cache محسّنة
export const CACHE_KEYS = {
  ARTICLE_META: (slug: string) => `article:meta:${slug}:v2`,
  ARTICLE_CONTENT: (id: string) => `article:content:${id}:v2`,
  RELATED_ARTICLES: (id: string, categoryId: string) => 
    `article:related:${id}:cat:${categoryId}:v2`,
  AUTHOR_INFO: (id: string) => `author:${id}:v1`,
  COMMENTS_COUNT: (articleId: string) => `article:comments:count:${articleId}:v1`,
  RECENT_COMMENTS: (articleId: string, page: number) => 
    `article:comments:recent:${articleId}:p:${page}:v1`,
};

// أزمنة انتهاء Cache (بالثواني)
export const CACHE_TTL = {
  ARTICLE_META: 60,           // 1 دقيقة
  ARTICLE_CONTENT: 300,       // 5 دقائق
  RELATED_ARTICLES: 120,      // 2 دقيقة
  AUTHOR_INFO: 600,           // 10 دقائق
  COMMENTS_COUNT: 30,         // 30 ثانية
  RECENT_COMMENTS: 60,        // 1 دقيقة
};

/**
 * جلب بيانات المقال مع Cache ذكي
 * يستخدم استراتيجية Cache-Aside Pattern
 */
export async function getArticleWithCache(slug: string) {
  const cacheKey = CACHE_KEYS.ARTICLE_META(slug);
  
  // 1. محاولة جلب من Redis أولاً
  try {
    const cached = await redis.get<any>(cacheKey);
    if (cached) {
      console.log(`✅ [Cache HIT] ${cacheKey}`);
      return cached;
    }
  } catch (error) {
    console.warn(`⚠️ [Cache Error] ${cacheKey}:`, error);
    // المتابعة للـ DB إذا فشل Redis
  }
  
  console.log(`❌ [Cache MISS] ${cacheKey}`);
  
  // 2. جلب من قاعدة البيانات
  const t0 = performance.now();
  
  // ✅ استعلام محسّن: استخدام findFirst مع index محسّن
  let article = await prisma.articles.findFirst({
    where: { 
      slug,
      status: 'published',
    },
    select: {
      id: true,
      title: true,
      slug: true,
      excerpt: true,
      summary: true,
      featured_image: true,
      social_image: true,
      published_at: true,
      updated_at: true,
      views: true,
      likes: true,
      shares: true,
      saves: true,
      reading_time: true,
      tags: true,
      seo_keywords: true,
      metadata: true,
      status: true,
      featured: true,
      breaking: true,
      // لا نجلب content هنا - سيتم جلبه بشكل منفصل إذا لزم
      article_author: {
        select: {
          id: true,
          full_name: true,
          slug: true,
          title: true,
          avatar_url: true,
          specializations: true,
          bio: true,
        }
      },
      author: {
        select: {
          id: true,
          name: true,
          email: true,
          avatar: true,
          role: true,
        }
      },
      categories: {
        select: {
          id: true,
          name: true,
          slug: true,
          color: true,
          icon: true,
        }
      }
    }
  });
  
  const dbTime = performance.now() - t0;
  console.log(`📊 [DB Query Time] ${dbTime.toFixed(1)}ms`);
  
  // فحص وجود المقال
  if (!article) {
    // حتى الـ null نخزنه لتجنب استعلامات متكررة للمقالات غير الموجودة
    await redis.set(cacheKey, null, 30).catch(() => {});
    return null;
  }
  
  // 3. تخزين في Redis
  try {
    await redis.set(cacheKey, article, CACHE_TTL.ARTICLE_META);
    console.log(`💾 [Cache SET] ${cacheKey} (TTL: ${CACHE_TTL.ARTICLE_META}s)`);
  } catch (error) {
    console.warn(`⚠️ [Cache Set Error]:`, error);
  }
  
  return article;
}

/**
 * جلب محتوى المقال (معالج) بشكل منفصل
 * هذا يسمح بـ lazy loading للمحتوى الثقيل
 */
export async function getArticleContentWithCache(articleId: string) {
  const cacheKey = CACHE_KEYS.ARTICLE_CONTENT(articleId);
  
  // 1. محاولة Redis
  try {
    const cached = await redis.get<string>(cacheKey);
    if (cached) {
      console.log(`✅ [Cache HIT] ${cacheKey}`);
      return cached;
    }
  } catch (error) {
    console.warn(`⚠️ [Cache Error] ${cacheKey}:`, error);
  }
  
  console.log(`❌ [Cache MISS] ${cacheKey}`);
  
  // 2. جلب من DB
  const result = await prisma.articles.findUnique({
    where: { id: articleId },
    select: {
      content: true,
      content_processed: true,
    }
  });
  
  if (!result) return null;
  
  // إعطاء الأولوية للمحتوى المعالج مسبقاً
  const content = result.content_processed || result.content;
  
  // 3. تخزين (TTL أطول لأن المحتوى نادر التغيير)
  try {
    await redis.set(cacheKey, content, CACHE_TTL.ARTICLE_CONTENT);
    console.log(`💾 [Cache SET] ${cacheKey} (TTL: ${CACHE_TTL.ARTICLE_CONTENT}s)`);
  } catch (error) {
    console.warn(`⚠️ [Cache Set Error]:`, error);
  }
  
  return content;
}

/**
 * جلب الأخبار ذات الصلة مع Cache
 */
export async function getRelatedArticlesWithCache(
  articleId: string,
  categoryId: string,
  limit: number = 6
) {
  const cacheKey = CACHE_KEYS.RELATED_ARTICLES(articleId, categoryId);
  
  // 1. محاولة Redis
  try {
    const cached = await redis.get<any[]>(cacheKey);
    if (cached) {
      console.log(`✅ [Cache HIT] ${cacheKey}`);
      return cached;
    }
  } catch (error) {
    console.warn(`⚠️ [Cache Error] ${cacheKey}:`, error);
  }
  
  console.log(`❌ [Cache MISS] ${cacheKey}`);
  
  // 2. استعلام محسّن من DB
  const t0 = performance.now();
  
  const relatedArticles = await prisma.articles.findMany({
    where: {
      id: { not: articleId },
      status: 'published',
      category_id: categoryId,
      // يمكن إضافة فلاتر إضافية
    },
    select: {
      id: true,
      title: true,
      slug: true,
      excerpt: true,
      featured_image: true,
      published_at: true,
      views: true,
      reading_time: true,
      categories: {
        select: {
          id: true,
          name: true,
          slug: true,
          color: true,
        }
      }
    },
    orderBy: [
      { published_at: 'desc' },
    ],
    take: limit,
  });
  
  const dbTime = performance.now() - t0;
  console.log(`📊 [Related Query Time] ${dbTime.toFixed(1)}ms`);
  
  // 3. تخزين في Redis
  try {
    await redis.set(cacheKey, relatedArticles, CACHE_TTL.RELATED_ARTICLES);
    console.log(`💾 [Cache SET] ${cacheKey} (TTL: ${CACHE_TTL.RELATED_ARTICLES}s)`);
  } catch (error) {
    console.warn(`⚠️ [Cache Set Error]:`, error);
  }
  
  return relatedArticles;
}

/**
 * مسح جميع الكاشات المرتبطة بمقال
 * يُستدعى عند تحديث أو حذف المقال
 */
export async function invalidateArticleCache(articleId: string, slug: string, categoryId?: string) {
  const keysToDelete = [
    CACHE_KEYS.ARTICLE_META(slug),
    CACHE_KEYS.ARTICLE_CONTENT(articleId),
  ];
  
  // مسح Related للمقالات في نفس التصنيف
  if (categoryId) {
    // ملاحظة: هذا مسح تقريبي، للدقة نحتاج pattern matching
    keysToDelete.push(CACHE_KEYS.RELATED_ARTICLES(articleId, categoryId));
  }
  
  console.log(`🗑️ [Cache Invalidation] Clearing ${keysToDelete.length} keys for article ${articleId}`);
  
  for (const key of keysToDelete) {
    try {
      await redis.delete(key);
      console.log(`✅ [Cache Deleted] ${key}`);
    } catch (error) {
      console.warn(`⚠️ [Cache Delete Error] ${key}:`, error);
    }
  }
}

/**
 * Warm up cache للمقالات الشائعة
 * يُستدعى دورياً (cron job)
 */
export async function warmUpPopularArticlesCache() {
  console.log('🔥 [Cache Warmup] Starting...');
  
  // جلب أشهر 20 مقال
  const popularArticles = await prisma.articles.findMany({
    where: { status: 'published' },
    select: {
      id: true,
      slug: true,
      category_id: true,
    },
    orderBy: [
      { views: 'desc' },
      { published_at: 'desc' },
    ],
    take: 20,
  });
  
  console.log(`📦 [Cache Warmup] Found ${popularArticles.length} popular articles`);
  
  // Pre-load في Cache
  let warmed = 0;
  for (const article of popularArticles) {
    try {
      // جلب البيانات (سيتم تخزينها تلقائياً)
      await getArticleWithCache(article.slug);
      await getRelatedArticlesWithCache(article.id, article.category_id || '', 6);
      warmed++;
    } catch (error) {
      console.error(`❌ [Cache Warmup Error] Article ${article.slug}:`, error);
    }
  }
  
  console.log(`✅ [Cache Warmup] Completed: ${warmed}/${popularArticles.length} articles`);
  
  return { total: popularArticles.length, warmed };
}

