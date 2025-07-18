import { headers } from 'next/headers';
import PageClient from './page-client';

// Server Component لجلب البيانات
async function getArticles() {
  try {
    const headersList = await headers();
    const host = headersList.get('host') || 'localhost:3000';
    const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
    const baseUrl = `${protocol}://${host}`;
    
    const res = await fetch(`${baseUrl}/api/articles?status=published&limit=12&sortBy=published_at&order=desc`, {
      cache: 'no-store' // لضمان جلب أحدث البيانات
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
    
    const res = await fetch(`${baseUrl}/api/categories`, {
      cache: 'no-store'
    });
    
    if (!res.ok) {
      console.error('فشل جلب التصنيفات:', res.status);
      return [];
    }
    
    const data = await res.json();
    return Array.isArray(data) ? data : [];
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
    
    const res = await fetch(`${baseUrl}/api/news/stats`, { cache: 'no-store' });
    if (res.ok) {
      return await res.json();
    }
  } catch (error) {
    console.error('خطأ في جلب الإحصائيات:', error);
  }
  return null;
}

export default async function Page() {
  try {
    // جلب جميع البيانات في الخادم
    const [articles, categories, stats] = await Promise.all([
      getArticles(),
      getCategories(),
      getStats()
    ]);

    return (
      <PageClient 
        initialArticles={articles}
        initialCategories={categories}
        initialStats={stats}
      />
    );
  } catch (error) {
    console.error('خطأ في تحميل الصفحة الرئيسية:', error);
    
    // صفحة خطأ بسيطة
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h1 style={{ fontSize: '48px', marginBottom: '20px' }}>صحيفة سبق الإلكترونية</h1>
        <p style={{ fontSize: '24px', color: '#666' }}>عذراً، حدث خطأ في تحميل الصفحة</p>
        <p style={{ marginTop: '20px' }}>
          <a href="/news" style={{ color: '#1e40af', textDecoration: 'underline' }}>
            انتقل إلى صفحة الأخبار
          </a>
        </p>

      </div>
    );
  }
} 