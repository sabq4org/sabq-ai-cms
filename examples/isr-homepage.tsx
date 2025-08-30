/**
 * مثال بسيط على تطبيق ISR - الصفحة الرئيسية
 * app/page.tsx مع تحسينات الأداء
 */

import { Metadata } from 'next';
import { PrismaClient } from '@prisma/client';
import Image from 'next/image';
import Link from 'next/link';

const prisma = new PrismaClient();

// تكوين ISR - تجديد الصفحة الرئيسية كل دقيقة واحدة
export const revalidate = 60;

// البيانات الوصفية المحسنة
export const metadata: Metadata = {
  title: 'سبق - أخبار السعودية والعالم',
  description: 'موقع سبق الإخباري، آخر الأخبار المحلية والعالمية، تقارير حصرية ومتابعة مستمرة للأحداث',
  keywords: ['سبق', 'أخبار', 'السعودية', 'العالم', 'أخبار عاجلة'],
  openGraph: {
    title: 'سبق - أخبار السعودية والعالم',
    description: 'موقع سبق الإخباري، آخر الأخبار المحلية والعالمية',
    type: 'website',
    locale: 'ar_SA',
  },
  alternates: {
    canonical: '/',
  }
};

interface HomePageData {
  featuredArticles: Array<{
    id: string;
    title: string;
    slug: string;
    excerpt: string | null;
    featured_image: string | null;
    published_at: Date | null;
    views: number;
    author: {
      name: string | null;
    } | null;
    categories: {
      name: string;
      slug: string;
    } | null;
  }>;
  recentArticles: Array<{
    id: string;
    title: string;
    slug: string;
    published_at: Date | null;
    views: number;
  }>;
  breakingNews: Array<{
    id: string;
    title: string;
    slug: string;
    published_at: Date | null;
  }>;
}

export default async function HomePage() {
  // إحضار البيانات مع تحسينات الأداء
  const data = await getHomePageData();

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* الأخبار العاجلة */}
      {data.breakingNews.length > 0 && (
        <section className="mb-8">
          <div className="bg-red-600 text-white p-4 rounded-lg">
            <h2 className="text-lg font-bold mb-3 flex items-center">
              <span className="animate-pulse">🔴</span>
              <span className="mr-2">أخبار عاجلة</span>
            </h2>
            <div className="space-y-2">
              {data.breakingNews.map((news) => (
                <div key={news.id}>
                  <Link 
                    href={`/articles/${news.slug}`}
                    className="hover:underline font-medium"
                  >
                    {news.title}
                  </Link>
                  {news.published_at && (
                    <span className="text-red-200 text-sm mr-3">
                      {new Intl.DateTimeFormat('ar-SA', {
                        hour: '2-digit',
                        minute: '2-digit'
                      }).format(new Date(news.published_at))}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* المقالات المميزة */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6 text-gray-900">المقالات المميزة</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data.featuredArticles.map((article) => (
            <article key={article.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              {article.featured_image && (
                <div className="aspect-video relative">
                  <Image
                    src={article.featured_image}
                    alt={article.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    priority={data.featuredArticles.indexOf(article) < 3}
                  />
                </div>
              )}
              
              <div className="p-4">
                {article.categories && (
                  <span className="inline-block bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full mb-2">
                    {article.categories.name}
                  </span>
                )}
                
                <h3 className="font-bold text-lg mb-2 line-clamp-2">
                  <Link 
                    href={`/articles/${article.slug}`}
                    className="hover:text-blue-600 transition-colors"
                  >
                    {article.title}
                  </Link>
                </h3>
                
                {article.excerpt && (
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                    {article.excerpt}
                  </p>
                )}
                
                <div className="flex justify-between items-center text-xs text-gray-500">
                  <div>
                    {article.author?.name && (
                      <span>بواسطة: {article.author.name}</span>
                    )}
                  </div>
                  <div className="flex items-center space-x-2 rtl:space-x-reverse">
                    <span>{article.views.toLocaleString()} مشاهدة</span>
                    {article.published_at && (
                      <time dateTime={article.published_at.toISOString()}>
                        {new Intl.RelativeTimeFormat('ar', { numeric: 'auto' }).format(
                          Math.round((new Date(article.published_at).getTime() - Date.now()) / (1000 * 60 * 60)), 
                          'hour'
                        )}
                      </time>
                    )}
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* أحدث الأخبار */}
      <section>
        <h2 className="text-2xl font-bold mb-6 text-gray-900">أحدث الأخبار</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {data.recentArticles.map((article) => (
            <article key={article.id} className="border-b border-gray-200 pb-4 mb-4">
              <h3 className="font-medium mb-2">
                <Link 
                  href={`/articles/${article.slug}`}
                  className="hover:text-blue-600 transition-colors"
                >
                  {article.title}
                </Link>
              </h3>
              
              <div className="flex justify-between items-center text-xs text-gray-500">
                <span>{article.views.toLocaleString()} مشاهدة</span>
                {article.published_at && (
                  <time dateTime={article.published_at.toISOString()}>
                    {new Intl.DateTimeFormat('ar-SA', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    }).format(new Date(article.published_at))}
                  </time>
                )}
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* معلومات ISR للتطوير */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-8 p-4 bg-gray-100 rounded-lg">
          <h3 className="text-sm font-medium text-gray-700 mb-2">معلومات ISR:</h3>
          <ul className="text-xs text-gray-600 space-y-1">
            <li>تجديد الصفحة: كل 60 ثانية</li>
            <li>وقت التحديث: {new Date().toLocaleString('ar-SA')}</li>
            <li>عدد المقالات المميزة: {data.featuredArticles.length}</li>
            <li>عدد الأخبار الحديثة: {data.recentArticles.length}</li>
            <li>عدد الأخبار العاجلة: {data.breakingNews.length}</li>
          </ul>
        </div>
      )}
    </div>
  );
}

// دالة إحضار البيانات المحسنة
async function getHomePageData(): Promise<HomePageData> {
  try {
    // تشغيل الاستعلامات بشكل متوازي لتحسين الأداء
    const [featuredArticles, recentArticles, breakingNews] = await Promise.all([
      // المقالات المميزة
      prisma.articles.findMany({
        where: {
          featured: true,
          published_at: {
            not: null,
          },
          status: 'published',
        },
        select: {
          id: true,
          title: true,
          slug: true,
          excerpt: true,
          featured_image: true,
          published_at: true,
          views: true,
          author: {
            select: {
              name: true,
            },
          },
          categories: {
            select: {
              name: true,
              slug: true,
            },
          },
        },
        orderBy: {
          published_at: 'desc',
        },
        take: 6,
      }),

      // أحدث المقالات
      prisma.articles.findMany({
        where: {
          published_at: {
            not: null,
          },
          status: 'published',
        },
        select: {
          id: true,
          title: true,
          slug: true,
          published_at: true,
          views: true,
        },
        orderBy: {
          published_at: 'desc',
        },
        take: 10,
      }),

      // الأخبار العاجلة
      prisma.articles.findMany({
        where: {
          breaking: true,
          published_at: {
            not: null,
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // آخر 24 ساعة فقط
          },
          status: 'published',
        },
        select: {
          id: true,
          title: true,
          slug: true,
          published_at: true,
        },
        orderBy: {
          published_at: 'desc',
        },
        take: 3,
      }),
    ]);

    return {
      featuredArticles,
      recentArticles,
      breakingNews,
    };
  } catch (error) {
    console.error('خطأ في إحضار بيانات الصفحة الرئيسية:', error);
    
    // إرجاع بيانات فارغة في حالة الخطأ
    return {
      featuredArticles: [],
      recentArticles: [],
      breakingNews: [],
    };
  }
}
