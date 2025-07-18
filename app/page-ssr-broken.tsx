import { Suspense } from 'react';
import { unstable_cache } from 'next/cache';
import { prisma } from '@/lib/prisma';
import ClientHomePage from './page-client';

// Cache البيانات لمدة 5 دقائق
const getCachedArticles = unstable_cache(
  async () => {
    try {
      const articles = await prisma.articles.findMany({
        where: { status: 'published' },
        select: {
          id: true,
          title: true,
          slug: true,
          excerpt: true,
          featured_image: true,
          created_at: true,
          published_at: true,
          views: true,
          reading_time: true,
          breaking: true,
          category: {
            select: {
              name: true,
              slug: true
            }
          },
          author: {
            select: {
              name: true
            }
          }
        },
        orderBy: { published_at: 'desc' },
        take: 25,
      });
      
      // تحويل البيانات للشكل المتوقع
      return articles.map(article => ({
        ...article,
        views_count: article.views,
        category_name: article.category?.name || null,
        author_name: article.author?.name || null
      }));
    } catch (error) {
      console.error('Error fetching articles:', error);
      return [];
    }
  },
  ['homepage-articles'],
  { revalidate: 300 } // 5 دقائق
);

const getCachedCategories = unstable_cache(
  async () => {
    try {
      const categories = await prisma.categories.findMany({
        where: { is_active: true },
        select: {
          id: true,
          name: true,
          name_en: true,
          slug: true,
          icon: true,
          articles: {
            where: { status: 'published' },
            select: { id: true }
          }
        },
        orderBy: { display_order: 'asc' },
      });
      
      return categories.map(cat => ({
        id: cat.id,
        name: cat.name,
        name_ar: cat.name, // استخدام name كـ name_ar
        name_en: cat.name_en,
        slug: cat.slug,
        icon: cat.icon,
        articles_count: cat.articles.length
      }));
    } catch (error) {
      console.error('Error fetching categories:', error);
      return [];
    }
  },
  ['homepage-categories'],
  { revalidate: 600 } // 10 دقائق
);

const getCachedStats = unstable_cache(
  async () => {
    try {
      const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);
      const todayStart = new Date(new Date().setHours(0, 0, 0, 0));
      
      const [activeReaders, dailyArticles] = await Promise.all([
        // عد المستخدمين النشطين
        prisma.users.count({
          where: {
            updated_at: {
              gte: thirtyMinutesAgo
            }
          }
        }),
        // عد مقالات اليوم
        prisma.articles.count({
          where: {
            published_at: {
              gte: todayStart
            },
            status: 'published'
          }
        })
      ]);
      
      return {
        activeReaders,
        dailyArticles,
        loading: false
      };
    } catch (error) {
      console.error('Error fetching stats:', error);
      return {
        activeReaders: null,
        dailyArticles: null,
        loading: false
      };
    }
  },
  ['homepage-stats'],
  { revalidate: 60 } // دقيقة واحدة
);

// Loading fallback component
function LoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-lg text-gray-600 dark:text-gray-300">
          جارٍ تحميل المحتوى...
        </p>
      </div>
    </div>
  );
}

// Server Component
export default async function HomePage() {
  // جلب البيانات على الخادم مع caching
  const [articles, categories, stats] = await Promise.all([
    getCachedArticles(),
    getCachedCategories(),
    getCachedStats()
  ]);

  // تمرير البيانات للـ client component
  return (
    <Suspense fallback={<LoadingFallback />}>
      <ClientHomePage
        initialArticles={articles}
        initialCategories={categories}
        initialStats={stats}
      />
    </Suspense>
  );
} 