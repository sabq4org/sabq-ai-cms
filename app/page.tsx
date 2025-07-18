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
    
    const res = await fetch(`${baseUrl}/api/categories?is_active=true`, {
      cache: 'no-store'
    });
    
    if (!res.ok) {
      console.error('فشل جلب التصنيفات:', res.status);
      return [];
    }
    
    const json = await res.json();
    return Array.isArray(json) ? json : (json.data ?? []);
  } catch (error) {
    console.error('خطأ في جلب التصنيفات من الخادم:', error);
    return [];
  }
}

async function getStats() {
  try {
    return {
      activeReaders: 1234567,
      dailyArticles: 52341,
      loading: false
    };
  } catch (error) {
    console.error('خطأ في جلب الإحصائيات:', error);
    return {
      activeReaders: null,
      dailyArticles: null,
      loading: false
    };
  }
}

export default async function Page() {
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
} 