import prisma from "@/lib/prisma";

// تحسين الـ cache - استخدام Redis مع fallback للذاكرة
import { cache as redisCache, CACHE_TTL } from "@/lib/redis";

const articleCache = new Map<string, any>();
const MEM_TTL = 30 * 1000; // 30 ثانية للذاكرة المحلية
const REDIS_TTL = 10 * 60 * 1000; // 10 دقائق للـ Redis

// تحسين API call مع timeout وإعادة محاولة
async function fetchArticleFromAPI(slug: string): Promise<any> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 ثواني timeout
  
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL || ''}/api/articles/${encodeURIComponent(slug)}/fast?related=false&comments=false`,
      {
        signal: controller.signal,
        cache: 'force-cache',
        next: { revalidate: 600 }, // 10 دقائق
      }
    );
    
    clearTimeout(timeoutId);
    
    if (!response.ok) return null;
    const data = await response.json();
    return data.article;
  } catch (error: any) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      console.warn('API request timeout for article:', slug);
    } else {
      console.error('Failed to fetch from API:', error);
    }
    return null;
  }
}

export type Article = {
  id: string;
  title: string;
  subtitle?: string | null;
  summary?: string | null;
  content: string | null;
  featured_image: string | null;
  published_at: Date | null;
  updated_at?: Date | null;
  readMinutes?: number | null;
  views?: number;
  images?: { url: string; alt?: string | null; width?: number | null; height?: number | null }[];
  author?: { id: string; name: string | null; email?: string | null; avatar?: string | null; role?: string | null } | null;
  article_author?: { 
    id: string; 
    full_name: string | null; 
    slug: string | null; 
    title?: string | null; 
    avatar_url?: string | null;
    specializations?: any;
    bio?: string | null;
  } | null;
  categories?: { id: string; name: string; slug: string; color?: string | null; icon?: string | null } | null;
  tags?: { id: string; name: string; slug: string }[];
};

export async function getArticleOptimized(slug: string): Promise<Article | null> {
  const cacheKey = `article:optimized:${slug}`;
  
  // 1. تحقق من الذاكرة المحلية
  const memCached = articleCache.get(cacheKey);
  if (memCached && memCached.timestamp > Date.now() - MEM_TTL) {
    return memCached.data;
  }
  
  // 2. تحقق من Redis
  try {
    const redisCached = await redisCache.get<Article>(cacheKey);
    if (redisCached) {
      // حفظ في الذاكرة المحلية للوصول السريع
      articleCache.set(cacheKey, {
        data: redisCached,
        timestamp: Date.now(),
      });
      return redisCached;
    }
  } catch (redisError) {
    console.warn('Redis error in getArticleOptimized:', redisError);
  }
  
  // محاولة الجلب من API السريع أولاً
  if (typeof window === 'undefined') {
    const apiArticle = await fetchArticleFromAPI(slug);
    if (apiArticle) {
      const formattedArticle = {
        ...apiArticle,
        readMinutes: apiArticle.reading_time,
      };
      articleCache.set(cacheKey, {
        data: formattedArticle,
        timestamp: Date.now(),
      });
      return formattedArticle;
    }
  }

  try {
    // تحسين الاستعلام - البحث بالـ slug أولاً (أسرع) ثم ID
    let article = await prisma.articles.findFirst({
      where: { 
        slug: slug,
        status: "published" 
      },
      select: {
        id: true,
        title: true,
        content: true,
        excerpt: true,
        summary: true,
        metadata: true,
        featured_image: true,
        published_at: true,
        updated_at: true,
        reading_time: true,
        views: true,
        likes: true,
        shares: true,
        saves: true,
        categories: { 
          select: { 
            id: true, 
            name: true, 
            slug: true, 
            color: true, 
            icon: true 
          } 
        },
        article_tags: {
          select: {
            tags: {
              select: { 
                id: true, 
                name: true, 
                slug: true 
              }
            }
          }
        }
      },
    });
    
    // إذا لم نجد بالـ slug، نبحث بالـ ID
    if (!article) {
      article = await prisma.articles.findFirst({
        where: { 
          id: slug,
          status: "published" 
        },
        select: {
          id: true,
          title: true,
          content: true,
          excerpt: true,
          summary: true,
          metadata: true,
          featured_image: true,
          published_at: true,
          updated_at: true,
          reading_time: true,
          views: true,
          likes: true,
          shares: true,
          saves: true,
          categories: { 
            select: { 
              id: true, 
              name: true, 
              slug: true, 
              color: true, 
              icon: true 
            } 
          },
          article_tags: {
            select: {
              tags: {
                select: { 
                  id: true, 
                  name: true, 
                  slug: true 
                }
              }
            }
          }
        },
      });
    }

    if (!article) return null;

    // معالجة الصور - تبسيط لتحسين الأداء
    const images: Article["images"] = [];
    
    // الصورة البارزة فقط لتحسين الأداء
    if (article.featured_image) {
      images.push({ 
        url: article.featured_image, 
        alt: article.title || undefined, 
        width: 1600, 
        height: 900 
      });
    }

    // تحويل البيانات للشكل المطلوب
    const mapped: Article = {
      id: article.id,
      title: article.title || "",
      subtitle: (article as any)?.metadata?.subtitle || null,
      summary: (article as any).summary || (article as any).excerpt || null,
      content: article.content || null,
      featured_image: article.featured_image,
      published_at: article.published_at,
      updated_at: article.updated_at,
      readMinutes: (article as any).reading_time || null,
      views: article.views || 0,
      images,
      author: null, // تبسيط البيانات لتحسين الأداء
      article_author: null,
      categories: article.categories,
      tags: (article as any).article_tags?.map((at: any) => at.tags) || [],
    };

    // حفظ في Redis والذاكرة المحلية
    try {
      await redisCache.set(cacheKey, mapped, CACHE_TTL.ARTICLES);
    } catch (redisError) {
      console.warn('Failed to save to Redis:', redisError);
    }
    
    articleCache.set(cacheKey, {
      data: mapped,
      timestamp: Date.now()
    });

    return mapped;
  } catch (error) {
    console.error('Error loading article:', error);
    return null;
  }
}

// تنظيف الـ cache القديم كل 5 دقائق
if (typeof global !== 'undefined') {
  const globalAny = global as any;
  if (!globalAny.articleCacheCleanupInterval) {
    globalAny.articleCacheCleanupInterval = setInterval(() => {
      const now = Date.now();
      for (const [key, value] of articleCache.entries()) {
        if (value.timestamp < now - MEM_TTL * 10) { // احتفظ لـ 10x TTL
          articleCache.delete(key);
        }
      }
    }, 5 * 60 * 1000);
  }
}
