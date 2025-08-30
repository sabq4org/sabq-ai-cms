/**
 * مثال على تطبيق ISR في صفحة المقال
 * app/articles/[slug]/page.tsx
 */

import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { PrismaClient } from '@prisma/client';
import { ISRHelpers } from '@/lib/isr-config';
import { getCachedData } from '@/lib/redis-cache-optimized';

const prisma = new PrismaClient();

interface ArticlePageProps {
  params: {
    slug: string;
  };
}

interface ArticleData {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  published_at: Date | null;
  updated_at: Date;
  featured_image: string | null;
  author: {
    id: string;
    name: string | null;
  } | null;
  categories: {
    id: string;
    name: string;
    slug: string;
  } | null;
  views: number;
  likes: number;
  shares: number;
}

// تطبيق generateStaticParams لـ ISR
export async function generateStaticParams() {
  const articles = await ISRHelpers.generateArticleStaticParams(50);
  
  return articles.map((article) => ({
    slug: article.slug,
  }));
}

// تكوين ISR - تجديد كل 5 دقائق
export const revalidate = 300;

// إنشاء البيانات الوصفية مع تحسين SEO
export async function generateMetadata(
  { params }: ArticlePageProps
): Promise<Metadata> {
  const article = await getArticleData(params.slug);

  if (!article) {
    return {
      title: 'المقال غير موجود',
      description: 'لم يتم العثور على المقال المطلوب'
    };
  }

  return {
    title: `${article.title} | موقع سبق`,
    description: article.excerpt || `اقرأ ${article.title} على موقع سبق`,
    openGraph: {
      title: article.title,
      description: article.excerpt || '',
      images: article.featured_image ? [article.featured_image] : [],
      type: 'article',
      publishedTime: article.published_at?.toISOString(),
      modifiedTime: article.updated_at.toISOString(),
      authors: article.author?.name ? [article.author.name] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: article.title,
      description: article.excerpt || '',
      images: article.featured_image ? [article.featured_image] : [],
    },
    alternates: {
      canonical: `/articles/${article.slug}`,
    },
    other: {
      'article:author': article.author?.name || '',
      'article:section': article.categories?.name || '',
      'article:published_time': article.published_at?.toISOString() || '',
      'article:modified_time': article.updated_at.toISOString(),
    }
  };
}

// مكون الصفحة الرئيسي
export default async function ArticlePage({ params }: ArticlePageProps) {
  const article = await getArticleData(params.slug);

  if (!article) {
    notFound();
  }

  // تحديد استراتيجية ISR بناءً على حداثة المحتوى
  const isBreaking = article.title.includes('عاجل') || article.title.includes('BREAKING');
  const isRecent = article.published_at && 
    (new Date().getTime() - new Date(article.published_at).getTime()) < (24 * 60 * 60 * 1000);

  // تسجيل مشاهدة المقال (في الخلفية)
  incrementArticleViews(article.id).catch(console.error);

  return (
    <article className="max-w-4xl mx-auto px-4 py-8">
      {/* رأس المقال */}
      <header className="mb-8">
        {article.categories && (
          <div className="mb-4">
            <span className="inline-block bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full">
              {article.categories.name}
            </span>
          </div>
        )}
        
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 leading-tight">
          {article.title}
        </h1>

        {article.excerpt && (
          <p className="text-xl text-gray-600 mb-6 leading-relaxed">
            {article.excerpt}
          </p>
        )}

        <div className="flex items-center justify-between text-sm text-gray-500 mb-6">
          <div className="flex items-center space-x-4 rtl:space-x-reverse">
            {article.author && (
              <span>بواسطة: {article.author.name}</span>
            )}
            {article.published_at && (
              <time dateTime={article.published_at.toISOString()}>
                {new Intl.DateTimeFormat('ar-SA', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                }).format(new Date(article.published_at))}
              </time>
            )}
          </div>

          <div className="flex items-center space-x-4 rtl:space-x-reverse">
            <span>{article.views.toLocaleString()} مشاهدة</span>
            <span>{article.likes.toLocaleString()} إعجاب</span>
            <span>{article.shares.toLocaleString()} مشاركة</span>
          </div>
        </div>
      </header>

      {/* الصورة المميزة */}
      {article.featured_image && (
        <div className="mb-8">
          <img
            src={article.featured_image}
            alt={article.title}
            className="w-full h-auto rounded-lg shadow-lg"
            loading="lazy"
          />
        </div>
      )}

      {/* محتوى المقال */}
      <div 
        className="prose prose-lg max-w-none"
        dangerouslySetInnerHTML={{ __html: article.content }}
      />

      {/* إشارة ISR للتطوير */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-8 p-4 bg-gray-100 rounded-lg">
          <h3 className="text-sm font-medium text-gray-700 mb-2">معلومات ISR:</h3>
          <ul className="text-xs text-gray-600 space-y-1">
            <li>النوع: {isBreaking ? 'عاجل' : isRecent ? 'حديث' : 'أرشيفي'}</li>
            <li>آخر تحديث: {article.updated_at.toLocaleString('ar-SA')}</li>
            <li>تجديد: {isBreaking ? '30 ثانية' : isRecent ? '5 دقائق' : '10 دقائق'}</li>
          </ul>
        </div>
      )}
    </article>
  );
}

// دالة إحضار بيانات المقال مع تخزين مؤقت
async function getArticleData(slug: string): Promise<ArticleData | null> {
  const cacheKey = `article:${slug}`;
  
  // محاولة الحصول على البيانات من Cache
  const cached = await getCachedData(cacheKey);
  if (cached) {
    return cached;
  }

  try {
    const article = await prisma.articles.findUnique({
      where: { 
        slug,
        published_at: {
          not: null
        },
        status: 'published'
      },
      include: {
        author: {
          select: {
            id: true,
            name: true
          }
        },
        categories: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        }
      }
    });

    if (!article) return null;

    // حفظ في Cache لمدة 5 دقائق
    await setCachedData(cacheKey, article, 300);
    
    return article;
    
  } catch (error) {
    console.error('خطأ في إحضار بيانات المقال:', error);
    return null;
  }
}

// دالة تحديث عدد المشاهدات (في الخلفية)
async function incrementArticleViews(articleId: string) {
  try {
    await prisma.articles.update({
      where: { id: articleId },
      data: {
        views: {
          increment: 1
        }
      }
    });
  } catch (error) {
    console.error('خطأ في تحديث المشاهدات:', error);
  }
}

// دالة مساعدة لحفظ البيانات في Cache
async function setCachedData(key: string, data: any, ttl: number) {
  try {
    // استخدام نفس نظام Cache المحسن
    const { setCachedData: setCached } = await import('@/lib/redis-cache-optimized');
    await setCached(key, data, ttl);
  } catch (error) {
    console.error('خطأ في حفظ Cache:', error);
  }
}
