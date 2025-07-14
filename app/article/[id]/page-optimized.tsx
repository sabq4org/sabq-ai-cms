import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { cache } from 'react';
import prisma from '@/lib/prisma';
import { cache as redisCache, CACHE_TTL } from '@/lib/redis-improved';
import ArticleContent from './article-content';
import { unstable_cache } from 'next/cache';

// تمكين ISR مع revalidate كل 60 ثانية
export const revalidate = 60;
export const dynamic = 'force-static';
export const dynamicParams = true;

// Cache للاستعلامات المتكررة
const getArticleData = cache(async (id: string) => {
  // محاولة جلب من Redis أولاً
  const cacheKey = `article:${id}`;
  const cachedArticle = await redisCache.get(cacheKey);
  
  if (cachedArticle) {
    console.log(`✅ Cache hit for article ${id}`);
    return cachedArticle;
  }
  
  console.log(`❌ Cache miss for article ${id}, fetching from DB`);
  
  // جلب من قاعدة البيانات
  const article = await prisma.articles.findFirst({
    where: {
      OR: [
        { id },
        { slug: id }
      ]
    },
    include: {
      categories: {
        select: {
          id: true,
          name: true,
          name_en: true,
          slug: true,
          color: true,
          icon: true
        }
      },
      users: {
        select: {
          id: true,
          name: true,
          email: true,
          avatar: true
        }
      }
    }
  });
  
  if (!article) {
    return null;
  }
  
  // تحضير البيانات
  const formattedArticle = {
    ...article,
    category: article.categories || null,
    author: article.users || null,
    stats: {
      views: article.views || 0,
      likes: article.likes || 0,
      shares: article.shares || 0,
      comments: article.comments_count || 0,
      saves: article.saves || 0
    },
    views_count: article.views || 0,
    likes_count: article.likes || 0,
    shares_count: article.shares || 0
  };
  
  // حفظ في Redis مع TTL أطول (30 دقيقة بدلاً من 5)
  await redisCache.set(cacheKey, formattedArticle, 60 * 30);
  
  return formattedArticle;
});

// توليد metadata للمقال
export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const article = await getArticleData(params.id);
  
  if (!article) {
    return {
      title: 'المقال غير موجود',
      description: 'عذراً، المقال الذي تبحث عنه غير موجود'
    };
  }
  
  return {
    title: article.title,
    description: article.excerpt || article.summary || article.ai_summary,
    keywords: article.seo_keywords,
    openGraph: {
      title: article.title,
      description: article.excerpt || article.summary,
      images: article.featured_image ? [article.featured_image] : [],
      type: 'article',
      publishedTime: article.published_at || article.created_at
    },
    twitter: {
      card: 'summary_large_image',
      title: article.title,
      description: article.excerpt || article.summary,
      images: article.featured_image ? [article.featured_image] : []
    }
  };
}

// Pre-generate static params للمقالات الشائعة
export async function generateStaticParams() {
  // جلب أشهر 100 مقال لتوليدها مسبقاً
  const popularArticles = await prisma.articles.findMany({
    where: { status: 'published' },
    orderBy: { views: 'desc' },
    take: 100,
    select: { id: true, slug: true }
  });
  
  return popularArticles.map((article) => ({
    id: article.slug || article.id
  }));
}

// Server Component الرئيسي
export default async function ArticlePage({ params }: { params: { id: string } }) {
  const articleData = await getArticleData(params.id);
  
  if (!articleData) {
    notFound();
  }
  
  // زيادة عدد المشاهدات بشكل غير متزامن
  prisma.articles.updateMany({
    where: { id: articleData.id },
    data: { views: { increment: 1 } }
  }).catch(console.error);
  
  // جلب المقالات ذات الصلة بشكل متوازي
  const relatedArticlesPromise = prisma.articles.findMany({
    where: {
      category_id: articleData.category_id,
      id: { not: articleData.id },
      status: 'published'
    },
    take: 5,
    orderBy: { published_at: 'desc' },
    select: {
      id: true,
      title: true,
      featured_image: true,
      reading_time: true,
      published_at: true,
      created_at: true
    }
  });
  
  const [relatedArticles] = await Promise.all([relatedArticlesPromise]);
  
  return (
    <ArticleContent 
      article={articleData} 
      relatedArticles={relatedArticles}
    />
  );
} 