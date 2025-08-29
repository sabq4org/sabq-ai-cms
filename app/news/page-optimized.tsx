import { Suspense } from 'react';
import { NewsPageContent } from './NewsPageContent';
import { Newspaper } from 'lucide-react';

export const runtime = 'nodejs';
export const revalidate = 300; // 5 دقائق

async function getInitialData() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    
    // جلب التصنيفات والمقالات بشكل متوازي
    const [categoriesRes, articlesRes] = await Promise.all([
      fetch(`${baseUrl}/api/categories?is_active=true`, {
        cache: 'force-cache',
        next: { revalidate: 3600 } // ساعة واحدة للتصنيفات
      }),
      fetch(`${baseUrl}/api/news?status=published&limit=20&page=1&sort=published_at&order=desc`, {
        cache: 'force-cache',
        next: { revalidate: 300 } // 5 دقائق للأخبار
      })
    ]);

    const [categoriesData, articlesData] = await Promise.all([
      categoriesRes.ok ? categoriesRes.json() : { categories: [] },
      articlesRes.ok ? articlesRes.json() : { articles: [] }
    ]);

    return {
      categories: categoriesData.categories || categoriesData.data || [],
      articles: articlesData.articles || articlesData.data || [],
      totalCount: articlesData.total || articlesData.articles?.length || 0
    };
  } catch (error) {
    console.error('Error fetching initial data:', error);
    return {
      categories: [],
      articles: [],
      totalCount: 0
    };
  }
}

export default async function NewsPage() {
  const { categories, articles, totalCount } = await getInitialData();

  return (
    <div className="min-h-screen" data-page="news" data-news="true" style={{ 
      backgroundColor: '#f8f8f7',
      minHeight: '100vh',
      position: 'relative',
      zIndex: 0
    }}>
      {/* Hero Section */}
      <section className="relative py-16 md:py-20">
        <div className="relative max-w-7xl mx-auto px-4 md:px-6">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 mb-6 rounded-2xl shadow-2xl header-main-icon themed-gradient-bg">
              <Newspaper className="w-10 h-10 text-white header-icon" />
            </div>

            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900 dark:text-white">
              آخر الأخبار
            </h1>

            <p className="text-xl text-gray-600 dark:text-gray-300 mb-2">
              تابع أحدث الأخبار والتطورات
            </p>
          </div>
        </div>
      </section>

      {/* Suspense للمحتوى التفاعلي */}
      <Suspense 
        fallback={
          <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
            <div className="animate-pulse">
              <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded-lg mb-6"></div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="bg-gray-200 dark:bg-gray-700 rounded-xl h-80"></div>
                ))}
              </div>
            </div>
          </div>
        }
      >
        <NewsPageContent 
          initialCategories={categories}
          initialArticles={articles}
          initialTotalCount={totalCount}
        />
      </Suspense>
    </div>
  );
}
