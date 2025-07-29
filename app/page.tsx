import { headers } from 'next/headers';
import { Metadata } from 'next';
import PageClient from './page-client';

// Metadata للصفحة الرئيسية
export const metadata: Metadata = {
  title: 'صحيفة سبق الالكترونية AI - الصفحة الرئيسية',
  description: 'موقع صحيفة سبق الإلكترونية الرسمي - آخر الأخبار والمقالات من المملكة العربية السعودية والعالم بتقنية الذكاء الاصطناعي',
  keywords: 'سبق, صحيفة سبق, أخبار السعودية, أخبار عربية, ذكاء اصطناعي',
  authors: [{ name: 'صحيفة سبق الإلكترونية' }],
  openGraph: {
    title: 'صحيفة سبق الالكترونية AI',
    description: 'موقع صحيفة سبق الإلكترونية الرسمي - آخر الأخبار والمقالات',
    siteName: 'صحيفة سبق الالكترونية AI',
    type: 'website',
    locale: 'ar_SA',
  },
  twitter: {
    card: 'summary_large_image',
    site: '@sabqorg',
    creator: '@sabqorg',
  },
};

// Server Component لجلب البيانات مع معالجة محسنة للأخطاء
async function getArticles(limit = 16) {
  try {
    const headersList = await headers();
    const host = headersList.get('host') || 'localhost:3002';
    const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
    const baseUrl = `${protocol}://${host}`;
    
    // إضافة timeout للطلب
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 ثواني
    
    try {
      const res = await fetch(
        `${baseUrl}/api/articles?status=published&limit=${limit}&sortBy=published_at&order=desc`,
        {
          next: { revalidate: 60 },
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120'
          },
          signal: controller.signal
        }
      );
      
      clearTimeout(timeoutId);
      
      if (!res.ok) {
        console.warn(`⚠️ API returned ${res.status}: ${res.statusText}`);
        return [];
      }
      
      const contentType = res.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        console.warn('⚠️ استجابة غير صالحة من API المقالات');
        return [];
      }
      
      const json = await res.json();
      const articles = Array.isArray(json) ? json : (json.data ?? json.articles ?? []);
      
      if (!Array.isArray(articles)) {
        console.warn('⚠️ البيانات المستلمة ليست مصفوفة');
        return [];
      }
      
      return articles;
    } catch (fetchError) {
      clearTimeout(timeoutId);
      
      if (fetchError instanceof Error && fetchError.name === 'AbortError') {
        console.warn('⚠️ انتهت مهلة الطلب');
      } else {
        console.warn('⚠️ خطأ في جلب المقالات:', fetchError);
      }
      return [];
    }
  } catch (error) {
    console.warn('⚠️ خطأ في إعداد طلب المقالات:', error);
    return [];
  }
}

async function getCategories() {
  try {
    const headersList = await headers();
    const host = headersList.get('host') || 'localhost:3002';
    const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
    const baseUrl = `${protocol}://${host}`;
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    
    try {
      const res = await fetch(`${baseUrl}/api/categories?is_active=true`, {
        next: { revalidate: 600 },
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'public, s-maxage=600, stale-while-revalidate=900'
        },
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!res.ok) {
        console.warn(`⚠️ فشل جلب التصنيفات: ${res.status}`);
        return [];
      }
      
      const data = await res.json();
      const categories = data.categories || data.data || [];
      console.log('✅ التصنيفات المُستلمة:', categories.length);
      return categories;
    } catch (fetchError) {
      clearTimeout(timeoutId);
      console.warn('⚠️ خطأ في جلب التصنيفات:', fetchError);
      return [];
    }
  } catch (error) {
    console.warn('⚠️ خطأ في إعداد طلب التصنيفات:', error);
    return [];
  }
}

async function getNewsStats() {
  try {
    const headersList = await headers();
    const host = headersList.get('host') || 'localhost:3002';
    const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
    const baseUrl = `${protocol}://${host}`;
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    
    try {
      const res = await fetch(`${baseUrl}/api/news/stats`, {
        next: { revalidate: 300 },
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600'
        },
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!res.ok) {
        console.warn(`⚠️ فشل جلب إحصائيات الأخبار: ${res.status}`);
        return null;
      }
      
      return await res.json();
    } catch (fetchError) {
      clearTimeout(timeoutId);
      console.warn('⚠️ خطأ في جلب إحصائيات الأخبار:', fetchError);
      return null;
    }
  } catch (error) {
    console.warn('⚠️ خطأ في إعداد طلب الإحصائيات:', error);
    return null;
  }
}

async function getDeepAnalyses() {
  try {
    const headersList = await headers();
    const host = headersList.get('host') || 'localhost:3002';
    const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
    const baseUrl = `${protocol}://${host}`;
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    
    try {
      const res = await fetch(`${baseUrl}/api/deep-analyses?limit=5&sortBy=analyzed_at&sortOrder=desc`, {
        next: { revalidate: 600 },
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'public, s-maxage=600, stale-while-revalidate=900'
        },
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!res.ok) {
        console.warn(`⚠️ فشل جلب التحليلات العميقة: ${res.status}`);
        return [];
      }
      
      const data = await res.json();
      return data.analyses || [];
    } catch (fetchError) {
      clearTimeout(timeoutId);
      console.warn('⚠️ خطأ في جلب التحليلات العميقة:', fetchError);
      return [];
    }
  } catch (error) {
    console.warn('⚠️ خطأ في إعداد طلب التحليلات:', error);
    return [];
  }
}

// Force dynamic for server-side features
export const dynamic = 'force-dynamic';

export default async function HomePage() {
  try {
    console.log('🚀 بدء تحميل الصفحة الرئيسية...');
    
    // جلب جميع البيانات بالتوازي
    const [articles = [], categories = [], newsStats = null, deepAnalyses = []] = await Promise.all([
      getArticles(16).catch((err) => {
        console.warn('⚠️ فشل جلب المقالات:', err);
        return [];
      }),
      getCategories().catch((err) => {
        console.warn('⚠️ فشل جلب التصنيفات:', err);
        return [];
      }),
      getNewsStats().catch((err) => {
        console.warn('⚠️ فشل جلب الإحصائيات:', err);
        return null;
      }),
      getDeepAnalyses().catch((err) => {
        console.warn('⚠️ فشل جلب التحليلات:', err);
        return [];
      })
    ]);

    console.log('✅ تم جلب البيانات بنجاح:', {
      articles: articles.length,
      categories: categories.length,
      stats: !!newsStats,
      deepAnalyses: deepAnalyses.length
    });

    return (
      <PageClient 
        initialArticles={articles}
        initialCategories={categories}
        initialStats={newsStats}
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