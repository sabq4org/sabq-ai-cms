import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { cache } from 'react';
import prisma from '@/lib/prisma';
import { cache as redisCache, CACHE_TTL } from '@/lib/redis-improved';
import ArticleContent from './article-content';
import { unstable_cache } from 'next/cache';

// النوع النهائي للمقال بعد التنسيق
interface FormattedArticle {
  id: string;
  title: string;
  excerpt?: string | null;
  summary?: string | null;
  seo_title?: string | null;
  seo_description?: string | null;
  featured_image?: string | null;
  published_at?: Date | string | null;
  created_at: Date | string;
  category_id?: string | null;
  [key: string]: any; // السماح لحقول إضافية
}

// تمكين ISR مع revalidate كل 60 ثانية
export const revalidate = 60;
export const dynamic = 'force-static';
export const dynamicParams = true;

// Cache للاستعلامات المتكررة
const getArticleData = cache(async (id: string): Promise<FormattedArticle | null> => {
  // محاولة جلب من Redis أولاً
  const cacheKey = `article:${id}`;
  const cachedArticle = await redisCache.get(cacheKey);
  
  if (cachedArticle) {
    console.log(`✅ Cache hit for article ${id}`);
    return cachedArticle as FormattedArticle;
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
      category: {
        select: {
          id: true,
          name: true,
          name_en: true,
          slug: true,
          color: true,
          icon: true
        }
      },
      // سيتم جلب بيانات المؤلف في استعلام منفصل لأن العلاقة غير معرفة مباشرة
    }
  });
  
  if (!article) {
    return null;
  }
  
  // جلب بيانات المؤلف
  let author = null;
  if (article?.author_id) {
    author = await prisma.users.findUnique({
      where: { id: article.author_id },
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true
      }
    });
  }
  
  // تحضير البيانات
  const formattedArticle: FormattedArticle = {
    ...article,
    category: article.category || null,
    author: author,
    stats: {
      views: article.views || 0,
      likes: article.likes || 0,
      shares: article.shares || 0,
      // comments count سيتم جلبه لاحقاً عند الحاجة
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
  const art = await getArticleData(params.id);

  if (!art) {
    return {
      title: 'المقال غير موجود',
      description: 'عذراً، المقال الذي تبحث عنه غير موجود'
    };
  }

  return {
    title: art.title,
    description: art.excerpt ?? art.summary ?? '',
    keywords: art.seo_title ? [art.seo_title] : [],
    openGraph: {
      title: art.title,
      description: art.excerpt ?? art.summary ?? '',
      images: art.featured_image ? [art.featured_image] : [],
      type: 'article',
      publishedTime: String(art.published_at ?? art.created_at)
    },
    twitter: {
      card: 'summary_large_image',
      title: art.title,
      description: art.excerpt ?? art.summary ?? '',
      images: art.featured_image ? [art.featured_image] : []
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