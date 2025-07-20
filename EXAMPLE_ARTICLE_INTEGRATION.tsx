// مثال لكيفية دمج نظام التفاعل الجديد في صفحة المقال

import { NextPage } from 'next';
import { notFound } from 'next/navigation';
import { PrismaClient } from '@prisma/client';
import ShareYourThoughts from '@/components/ShareYourThoughts';

const prisma = new PrismaClient();

interface ArticlePageProps {
  params: { slug: string };
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  // جلب المقال
  const article = await prisma.articles.findFirst({
    where: { slug: params.slug },
    include: {
      categories: true,
      _count: {
        select: {
          interactions: {
            where: { type: 'like' }
          },
          comments: {
            where: { status: 'approved' }
          }
        }
      }
    }
  });

  if (!article) {
    notFound();
  }

  // حساب الإحصائيات الأولية
  const initialStats = {
    likes: article._count.interactions,
    comments: article._count.comments,
    shares: await prisma.interactions.count({
      where: { 
        article_id: article.id,
        type: 'share'
      }
    }),
    views: article.views || 0,
    bookmarks: await prisma.interactions.count({
      where: { 
        article_id: article.id,
        type: 'save'
      }
    })
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* محتوى المقال */}
      <article className="mb-12">
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            {article.title}
          </h1>
          
          {article.lead && (
            <p className="text-xl text-gray-600 dark:text-gray-400 leading-relaxed">
              {article.lead}
            </p>
          )}
          
          <div className="flex items-center gap-4 mt-6 text-sm text-gray-500">
            <time dateTime={article.published_at?.toISOString()}>
              {article.published_at?.toLocaleDateString('ar-SA')}
            </time>
            {article.categories && (
              <span className="px-3 py-1 bg-blue-100 text-blue-600 rounded-full">
                {article.categories.name}
              </span>
            )}
          </div>
        </header>

        <div 
          className="prose prose-lg max-w-none dark:prose-invert"
          dangerouslySetInnerHTML={{ __html: article.content }}
        />
      </article>

      {/* نظام التفاعل الجديد */}
      <ShareYourThoughts
        articleId={article.id}
        articleTitle={article.title}
        articleSlug={article.slug}
        articleCategory={article.categories?.name}
        initialStats={initialStats}
      />
    </div>
  );
}

// تحسين SEO والبيانات الوصفية
export async function generateMetadata({ params }: ArticlePageProps) {
  const article = await prisma.articles.findFirst({
    where: { slug: params.slug },
    select: {
      title: true,
      lead: true,
      featured_image: true,
      published_at: true,
      categories: {
        select: { name: true }
      }
    }
  });

  if (!article) {
    return {
      title: 'المقال غير موجود'
    };
  }

  return {
    title: article.title,
    description: article.lead,
    openGraph: {
      title: article.title,
      description: article.lead,
      images: article.featured_image ? [article.featured_image] : [],
      type: 'article',
      publishedTime: article.published_at?.toISOString(),
    },
    twitter: {
      card: 'summary_large_image',
      title: article.title,
      description: article.lead,
      images: article.featured_image ? [article.featured_image] : [],
    }
  };
}
