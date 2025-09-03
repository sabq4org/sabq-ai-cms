import prisma from "@/lib/prisma";
import { unstable_cache } from 'next/cache';

export type OptimizedArticle = {
  id: string;
  title: string;
  subtitle?: string | null;
  summary?: string | null;
  content: string | null;
  featured_image: string | null;
  published_at: Date | null;
  updated_at?: Date | null;
  reading_time?: number | null;
  views?: number;
  author?: {
    id: string;
    name: string | null;
    avatar?: string | null;
    role?: string | null;
  } | null;
  article_author?: {
    id: string;
    full_name: string | null;
    slug: string | null;
    title?: string | null;
    avatar_url?: string | null;
    bio?: string | null;
  } | null;
  categories?: {
    id: string;
    name: string;
    slug: string;
    color?: string | null;
  } | null;
};

export type ArticleExtras = {
  tags: { id: string; name: string; slug: string }[];
  images: { url: string; alt?: string; width?: number; height?: number }[];
  relatedArticles: {
    id: string;
    title: string;
    slug: string;
    featured_image?: string;
    published_at: Date;
  }[];
};

// استعلام أساسي محسن للمقال
async function getArticleBasicData(slug: string): Promise<OptimizedArticle | null> {
  try {
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
        featured_image: true,
        published_at: true,
        updated_at: true,
        reading_time: true,
        views: true,
        metadata: true,
        // المؤلف الأساسي
        author: {
          select: {
            id: true,
            name: true,
            avatar: true,
            role: true
          }
        },
        // مؤلف المقال المخصص
        article_author: {
          select: {
            id: true,
            full_name: true,
            slug: true,
            title: true,
            avatar_url: true,
            bio: true
          }
        },
        // الفئة
        categories: {
          select: {
            id: true,
            name: true,
            slug: true,
            color: true
          }
        }
      }
    });

    if (!article) return null;

    return {
      id: article.id,
      title: article.title || "",
      subtitle: (article.metadata as any)?.subtitle || null,
      summary: article.summary || article.excerpt || null,
      content: article.content,
      featured_image: article.featured_image,
      published_at: article.published_at,
      updated_at: article.updated_at,
      reading_time: article.reading_time,
      views: article.views || 0,
      author: article.author,
      article_author: article.article_author,
      categories: article.categories
    };
  } catch (error) {
    console.error('Error loading basic article data:', error);
    return null;
  }
}

// استعلام البيانات الإضافية
async function getArticleExtrasData(articleId: string): Promise<ArticleExtras> {
  try {
    const [tags, images, relatedArticles] = await Promise.all([
      // العلامات
      prisma.article_tags.findMany({
        where: { article_id: articleId },
        select: {
          tags: {
            select: {
              id: true,
              name: true,
              slug: true
            }
          }
        },
        take: 10 // حد أقصى 10 علامات
      }),

      // الصور الإضافية
      prisma.newsArticleAssets.findMany({
        where: { article_id: articleId },
        select: {
          media_assets: {
            select: {
              cloudinaryUrl: true,
              width: true,
              height: true,
              alt_text: true
            }
          }
        },
        take: 20 // حد أقصى 20 صورة
      }),

      // المقالات المرتبطة (نفس الفئة)
      prisma.$queryRaw<any[]>`
        SELECT id, title, slug, featured_image, published_at
        FROM articles 
        WHERE category_id = (
          SELECT category_id FROM articles WHERE id = ${articleId}
        )
        AND id != ${articleId}
        AND status = 'published'
        AND published_at IS NOT NULL
        ORDER BY published_at DESC
        LIMIT 6
      `
    ]);

    return {
      tags: tags.map(t => t.tags),
      images: images.map(img => ({
        url: img.media_assets.cloudinaryUrl || '',
        alt: img.media_assets.alt_text || undefined,
        width: img.media_assets.width || undefined,
        height: img.media_assets.height || undefined
      })).filter(img => img.url),
      relatedArticles: relatedArticles.map(article => ({
        id: article.id,
        title: article.title,
        slug: article.slug || article.id,
        featured_image: article.featured_image,
        published_at: article.published_at
      }))
    };
  } catch (error) {
    console.error('Error loading article extras:', error);
    return {
      tags: [],
      images: [],
      relatedArticles: []
    };
  }
}

// محمل المقال الأساسي مع cache
export const getOptimizedArticle = unstable_cache(
  async (slug: string) => {
    return await getArticleBasicData(slug);
  },
  ['article-basic'],
  {
    revalidate: 3600, // cache لمدة ساعة
    tags: ['articles']
  }
);

// محمل البيانات الإضافية مع cache
export const getOptimizedArticleExtras = unstable_cache(
  async (articleId: string) => {
    return await getArticleExtrasData(articleId);
  },
  ['article-extras'],
  {
    revalidate: 1800, // cache لمدة 30 دقيقة
    tags: ['article-extras']
  }
);

// دالة مساعدة لتحديث الـ cache عند تحديث المقال
export async function revalidateArticleCache(slug: string) {
  try {
    const { revalidateTag } = await import('next/cache');
    revalidateTag('articles');
    revalidateTag('article-extras');
  } catch (error) {
    console.error('Error revalidating cache:', error);
  }
}

// دالة لزيادة عدد المشاهدات بشكل غير متزامن
export async function incrementArticleViews(articleId: string) {
  try {
    // تشغيل في الخلفية دون انتظار
    prisma.articles.update({
      where: { id: articleId },
      data: {
        views: {
          increment: 1
        }
      }
    }).catch(error => {
      console.error('Error incrementing views:', error);
    });
  } catch (error) {
    // تجاهل الأخطاء لعدم تأثيرها على تجربة المستخدم
  }
}

// دالة للحصول على إحصائيات المقال
export const getArticleStats = unstable_cache(
  async (articleId: string) => {
    try {
      const stats = await prisma.articles.findUnique({
        where: { id: articleId },
        select: {
          views: true,
          likes: true,
          shares: true,
          saves: true,
          _count: {
            select: {
              comments: {
                where: {
                  status: 'approved'
                }
              }
            }
          }
        }
      });

      return {
        views: stats?.views || 0,
        likes: stats?.likes || 0,
        shares: stats?.shares || 0,
        saves: stats?.saves || 0,
        comments: stats?._count.comments || 0
      };
    } catch (error) {
      console.error('Error loading article stats:', error);
      return {
        views: 0,
        likes: 0,
        shares: 0,
        saves: 0,
        comments: 0
      };
    }
  },
  ['article-stats'],
  {
    revalidate: 300, // cache لمدة 5 دقائق
    tags: ['article-stats']
  }
);

// دالة للحصول على تعليقات المقال مع pagination
export async function getArticleComments(
  articleId: string, 
  page: number = 0, 
  limit: number = 10
) {
  try {
    const offset = page * limit;
    
    const [comments, totalCount] = await Promise.all([
      prisma.comments.findMany({
        where: {
          article_id: articleId,
          status: 'approved'
        },
        select: {
          id: true,
          content: true,
          created_at: true,
          author_name: true,
          author_email: true,
          likes: true,
          parent_id: true,
          // الردود (مستوى واحد فقط)
          replies: {
            select: {
              id: true,
              content: true,
              created_at: true,
              author_name: true,
              likes: true
            },
            where: {
              status: 'approved'
            },
            take: 5, // حد أقصى 5 ردود لكل تعليق
            orderBy: {
              created_at: 'asc'
            }
          }
        },
        where: {
          parent_id: null // التعليقات الرئيسية فقط
        },
        orderBy: {
          created_at: 'desc'
        },
        skip: offset,
        take: limit
      }),

      prisma.comments.count({
        where: {
          article_id: articleId,
          status: 'approved',
          parent_id: null
        }
      })
    ]);

    return {
      comments,
      totalCount,
      hasMore: offset + limit < totalCount,
      nextPage: offset + limit < totalCount ? page + 1 : null
    };
  } catch (error) {
    console.error('Error loading comments:', error);
    return {
      comments: [],
      totalCount: 0,
      hasMore: false,
      nextPage: null
    };
  }
}

