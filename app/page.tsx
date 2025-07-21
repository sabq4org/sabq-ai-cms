import { headers } from 'next/headers';
import PageClient from './page-client';

// Server Component لجلب البيانات
async function getArticles() {
  try {
    const headersList = await headers();
    const host = headersList.get('host') || 'localhost:3000';
    const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
    const baseUrl = `${protocol}://${host}`;
    
    const res = await fetch(`${baseUrl}/api/articles?status=published&limit=16&sortBy=published_at&order=desc`, {
      next: { revalidate: 180 }, // cache لـ 3 دقائق
      headers: {
        'Cache-Control': 'public, s-maxage=180, stale-while-revalidate=300'
      }
    });
    
    if (!res.ok) {
      console.error('فشل جلب المقالات:', res.status);
      return [];
    }
    
    const json = await res.json();
    const articles = Array.isArray(json) ? json : (json.data ?? json.articles ?? []);
    return articles;
  } catch (error) {
    console.error('خطأ في جلب المقالات من الخادم:', error);
    return [];
  }
}

async function getCategories() {
  try {
    const headersList = await headers();
    const host = headersList.get('host') || 'localhost:3000';
    const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
    const baseUrl = `${protocol}://${host}`;
    
    console.log('🔍 جلب التصنيفات من:', `${baseUrl}/api/categories?is_active=true`);
    
    const res = await fetch(`${baseUrl}/api/categories?is_active=true`, {
      next: { revalidate: 600 }, // cache لـ 10 دقائق
      headers: {
        'Cache-Control': 'public, s-maxage=600, stale-while-revalidate=900'
      }
    });
    
    if (!res.ok) {
      console.error('فشل جلب التصنيفات:', res.status);
      return [];
    }
    
    const data = await res.json();
    const categories = Array.isArray(data) ? data : (data.data || data.categories || []);
    console.log('✅ التصنيفات المُستلمة:', categories.length);
    
    return categories;
  } catch (error) {
    console.error('خطأ في جلب التصنيفات من الخادم:', error);
    return [];
  }
}

async function getStats() {
  try {
    const headersList = await headers();
    const host = headersList.get('host') || 'localhost:3000';
    const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
    const baseUrl = `${protocol}://${host}`;
    
    const res = await fetch(`${baseUrl}/api/news/stats`, {
      next: { revalidate: 300 },
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600'
      }
    });
    
    if (!res.ok) return null;
    return await res.json();
  } catch (error) {
    console.error('خطأ في جلب الإحصائيات:', error);
    return null;
  }
}

async function getDeepAnalyses() {
  try {
    const headersList = await headers();
    const host = headersList.get('host') || 'localhost:3000';
    const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
    const baseUrl = `${protocol}://${host}`;
    
    const res = await fetch(`${baseUrl}/api/deep-analyses?limit=5&sortBy=analyzed_at&sortOrder=desc`, {
      next: { revalidate: 300 }, // cache لـ 5 دقائق
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600'
      }
    });
    
    if (!res.ok) {
      console.error('فشل جلب التحليلات العميقة:', res.status);
      return [];
    }
    
    const json = await res.json();
    const analyses = Array.isArray(json) ? json : (json.data ?? json.analyses ?? []);
    return analyses;
  } catch (error) {
    console.error('خطأ في جلب التحليلات العميقة من الخادم:', error);
    return [];
  }
}

// Force dynamic for server-side features
export const dynamic = 'force-dynamic';

export default async function HomePage() {
  try {
    console.log('🚀 بدء تحميل الصفحة الرئيسية...');
    
    // جلب جميع البيانات بالتوازي
    const [articles, categories, stats, deepAnalyses] = await Promise.all([
      getArticles(),
      getCategories(),
      getStats(),
      getDeepAnalyses()
    ]);

    console.log('✅ تم جلب البيانات بنجاح:', {
      articles: articles.length,
      categories: categories.length,
      stats: !!stats,
      deepAnalyses: deepAnalyses.length
    });

    return (
      <PageClient 
        initialArticles={articles}
        initialCategories={categories}
        initialStats={stats}
        initialDeepAnalyses={deepAnalyses}
      />
    );
  } catch (error) {
    console.error('خطأ في تحميل الصفحة الرئيسية:', error);
    
    // صفحة خطأ بسيطة
    return (
      <div className="min-h-screen bg-red-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-800 mb-4">خطأ في تحميل الصفحة</h1>
          <p className="text-red-600 mb-4">حدث خطأ غير متوقع، يرجى المحاولة مرة أخرى</p>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            إعادة المحاولة
          </button>
        </div>
      </div>
    );
  }
} 