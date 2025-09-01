import prisma from "@/lib/prisma";

// Utility cache لتقليل الاستعلامات المتكررة
const articleCache = new Map<string, any>();
const CACHE_TTL = 60 * 1000; // دقيقة واحدة

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
        article_author_id: true, // للاستعلام المنفصل عن المؤلف
        // تحميل العلاقات الضرورية فقط
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

    if (!article) return null;

    // جلب معلومات المؤلف إذا كان موجوداً
    let articleAuthor = null;
    if ((article as any).article_author_id) {
      try {
        articleAuthor = await prisma.article_authors.findUnique({
          where: { id: (article as any).article_author_id },
          select: { 
            id: true, 
            full_name: true, 
            slug: true, 
            title: true, 
            avatar_url: true,
            specializations: true,
            bio: true
          } 
        });
      } catch (authorError) {
        console.warn('خطأ في جلب معلومات المؤلف:', authorError);
      }
    }

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
      author: null, // تم حذف author من الـ schema
      article_author: articleAuthor, // من الاستعلام المنفصل
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
if (typeof global !== 'undefined' && !(global as any).articleCacheCleanupInterval) {
  (global as any).articleCacheCleanupInterval = setInterval(() => {
    const now = Date.now();
    for (const [key, value] of articleCache.entries()) {
      if (value.timestamp < now - CACHE_TTL) {
        articleCache.delete(key);
      }
    }
  }, 5 * 60 * 1000);
}
