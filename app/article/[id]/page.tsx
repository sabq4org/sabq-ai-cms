import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getArticleData, getFullImageUrl, getFullArticleUrl, prepareKeywords } from '@/lib/article-api';
import ArticleClientComponent from './ArticleClientComponent';

// إنشاء Metadata ديناميكي للمقال
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const resolvedParams = await params;
  const article = await getArticleData(resolvedParams.id);

  if (!article) {
    return {
      title: 'المقال غير متوفر | صحيفة سبق الالكترونية AI',
      description: 'عذراً، المقال المطلوب غير متاح أو غير موجود.',
    };
  }

  const title = `${article.title} | صحيفة سبق الالكترونية AI`;
  const description = article.excerpt || article.summary || article.ai_summary || 'اقرأ آخر الأخبار والتحليلات على صحيفة سبق الالكترونية AI';
  const imageUrl = getFullImageUrl(article.featured_image);
  const articleUrl = getFullArticleUrl(resolvedParams.id);
  const keywords = prepareKeywords(article.seo_keywords || article.keywords);

  return {
    title,
    description,
    keywords: keywords.join(', '),
    authors: [{ name: article.author?.name || 'صحيفة سبق' }],
    category: article.category?.name,
    
    // Open Graph
    openGraph: {
      title,
      description,
      url: articleUrl,
      siteName: 'صحيفة سبق الالكترونية AI',
      images: imageUrl
        ? [
            {
              url: imageUrl,
              width: 1200,
              height: 630,
              alt: article.title,
            },
          ]
        : [],
      locale: 'ar_SA',
      type: 'article',
      publishedTime: article.published_at,
      modifiedTime: article.updated_at,
      section: article.category?.name,
      authors: [article.author?.name || 'صحيفة سبق'],
    },

    // Twitter Card
    twitter: {
      card: 'summary_large_image',
      site: '@sabqorg',
      creator: '@sabqorg',
      title,
      description,
      images: imageUrl ? [imageUrl] : [],
    },

    // إضافات أخرى
    robots: {
      index: article.status === 'published',
      follow: true,
    },
    alternates: {
      canonical: articleUrl,
    },
  };
}

// الصفحة الرئيسية - Server Component
export default async function ArticlePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // جلب البيانات في السيرفر
  const resolvedParams = await params;
  const article = await getArticleData(resolvedParams.id);

  if (!article) {
    notFound();
  }

  // تمرير البيانات للـ Client Component
  return <ArticleClientComponent initialArticle={article} articleId={resolvedParams.id} />;
}

// تحسين الأداء - إنشاء صفحات ثابتة للمقالات الشائعة
export async function generateStaticParams() {
  // يمكن تحسين هذا بجلب المقالات الأكثر شعبية
  return [];
}
