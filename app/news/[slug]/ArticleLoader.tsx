import prisma from "@/lib/prisma";

// Utility cache لتقليل الاستعلامات المتكررة
const articleCache = new Map<string, any>();
const CACHE_TTL = 5 * 60 * 1000; // 5 دقائق

// استخدام API السريع للجلب
async function fetchArticleFromAPI(slug: string): Promise<any> {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL || ''}/api/articles/${encodeURIComponent(slug)}/fast?related=true&comments=true`,
      {
        cache: 'force-cache',
        next: { revalidate: 300 }, // 5 دقائق
      }
    );
    
    if (!response.ok) return null;
    const data = await response.json();
    return data.article;
  } catch (error) {
    console.error('Failed to fetch from API:', error);
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
  // تحقق من الـ cache أولاً
  const cacheKey = `article:${slug}`;
  const cached = articleCache.get(cacheKey);
  if (cached && cached.timestamp > Date.now() - CACHE_TTL) {
    return cached.data;
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
    // استعلام محسّن مع select محددة لتقليل حجم البيانات
    const article = await prisma.articles.findFirst({
      where: { 
        OR: [{ slug }, { id: slug }], 
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
        // تحميل العلاقات الضرورية فقط
        author: { 
          select: { 
            id: true, 
            name: true, 
            email: true, 
            avatar: true, 
            role: true 
          } 
        },
        article_author: { 
          select: { 
            id: true, 
            full_name: true, 
            slug: true, 
            title: true, 
            avatar_url: true,
            specializations: true,
            bio: true
          } 
        },
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
        },
        // تحميل الصور مباشرة
        NewsArticleAssets: {
          select: {
            media_assets: {
              select: {
                cloudinaryUrl: true,
                width: true,
                height: true
              }
            }
          }
        }
      },
    });

    if (!article) return null;

    // معالجة الصور
    const images: Article["images"] = [];
    
    // الصورة البارزة
    if (article.featured_image) {
      images.push({ 
        url: article.featured_image, 
        alt: article.title || undefined, 
        width: 1600, 
        height: 900 
      });
    }
    
    // صور إضافية من MediaAssets
    if (article.NewsArticleAssets) {
      article.NewsArticleAssets.forEach((relation) => {
        const asset = relation.media_assets;
        if (asset.cloudinaryUrl && !images.some(img => img.url === asset.cloudinaryUrl)) {
          images.push({ 
            url: asset.cloudinaryUrl, 
            alt: article.title || undefined,
            width: asset.width || 1600,
            height: asset.height || 900
          });
        }
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
      author: article.author,
      article_author: (article as any).article_author,
      categories: article.categories,
      tags: (article as any).article_tags?.map((at: any) => at.tags) || [],
    };

    // حفظ في الـ cache
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
if (typeof global !== 'undefined' && !global.articleCacheCleanupInterval) {
  global.articleCacheCleanupInterval = setInterval(() => {
    const now = Date.now();
    for (const [key, value] of articleCache.entries()) {
      if (value.timestamp < now - CACHE_TTL) {
        articleCache.delete(key);
      }
    }
  }, 5 * 60 * 1000);
}
