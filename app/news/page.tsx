import { Suspense } from 'react';
import { NewsPageContent } from './NewsPageContent';
import { Newspaper } from 'lucide-react';

export const runtime = 'nodejs';
export const revalidate = 300; // 5 دقائق

async function getInitialData() {
  console.log('🚀 [NewsPage] Starting getInitialData');
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    
    const categoriesUrl = `${baseUrl}/api/categories?is_active=true`;
    const articlesUrl = `${baseUrl}/api/news/optimized?status=published&limit=20&page=1&sort=published_at&order=desc&compact=true&fields=id,title,slug,featured_image,views,published_at,created_at,breaking`;
    
    console.log(`🔗 [NewsPage] Fetching categories from: ${categoriesUrl}`);
    console.log(`🔗 [NewsPage] Fetching articles from: ${articlesUrl}`);

    // جلب التصنيفات والمقالات بشكل متوازي
    const [categoriesRes, articlesRes] = await Promise.all([
      fetch(categoriesUrl, {
        cache: 'force-cache',
        next: { revalidate: 3600 } // ساعة واحدة للتصنيفات
      }),
      fetch(articlesUrl, {
        cache: 'no-store', // عدم تخزين الأخبار لضمان الحصول على أحدث المحتوى
        next: { revalidate: 0 } // تحديث فوري للأخبار
      })
    ]);

    console.log(`📊 [NewsPage] Categories response status: ${categoriesRes.status}`);
    console.log(`📊 [NewsPage] Articles response status: ${articlesRes.status}`);

    const [categoriesData, articlesData] = await Promise.all([
      categoriesRes.ok ? categoriesRes.json() : { categories: [] },
      articlesRes.ok ? articlesRes.json() : { articles: [] }
    ]);

    const finalCategories = categoriesData.categories || categoriesData.data || [];
    const finalArticles = articlesData.articles || articlesData.data || [];
    const finalTotalCount = articlesData.total || finalArticles.length || 0;

    console.log(`✅ [NewsPage] Fetched ${finalCategories.length} categories.`);
    console.log(`✅ [NewsPage] Fetched ${finalArticles.length} articles.`);
    console.log(`🔢 [NewsPage] Total articles count: ${finalTotalCount}`);

    return {
      categories: finalCategories,
      articles: finalArticles,
      totalCount: finalTotalCount
    };
  } catch (error) {
    console.error('❌ [NewsPage] Error fetching initial data:', error);
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
