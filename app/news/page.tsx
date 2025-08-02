/**
 * صفحة فهرس الأخبار - /news
 * تصميم بسيط ونظيف لعرض الأخبار
 */

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Search, ArrowRight, Loader2, AlertTriangle, Calendar, User, Eye } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useDarkModeContext } from '@/contexts/DarkModeContext';
import '../news/news-styles.css';

interface NewsArticle {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  status: string;
  published_at?: string;
  breaking: boolean;
  featured: boolean;
  featured_image?: string;
  views: number;
  likes: number;
  shares: number;
  reading_time?: number;
  allow_comments: boolean;
  created_at: string;
  categories?: {
    id: string;
    name: string;
    slug: string;
    color?: string;
  };
  author: {
    id: string;
    name: string;
    email: string;
  };
}

export default function NewsPage() {
  const { darkMode } = useDarkModeContext();
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // جلب الأخبار
  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/news?status=published&limit=50&sort=published_at&order=desc');
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'فشل في جلب الأخبار');
      }
      
      setArticles(data.data || []);
    } catch (err) {
      console.error('خطأ في جلب الأخبار:', err);
      setError(err instanceof Error ? err.message : 'حدث خطأ غير متوقع');
    } finally {
      setLoading(false);
    }
  };

  // فلترة الأخبار حسب البحث
  const filteredArticles = articles.filter(article =>
    article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (article.excerpt && article.excerpt.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getImageUrl = (imagePath?: string) => {
    if (!imagePath) return '/images/default-news.jpg';
    if (imagePath.startsWith('http')) return imagePath;
    return imagePath;
  };

  if (loading) {
    return (
      <div className={cn('min-h-screen flex items-center justify-center', darkMode ? 'bg-gray-900' : 'bg-gray-50')}>
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          <p className={cn('text-lg', darkMode ? 'text-gray-300' : 'text-gray-600')}>
            جاري تحميل الأخبار...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={cn('min-h-screen flex items-center justify-center', darkMode ? 'bg-gray-900' : 'bg-gray-50')}>
        <div className="flex flex-col items-center gap-4 text-center max-w-md">
          <AlertTriangle className="w-12 h-12 text-red-500" />
          <h2 className={cn('text-xl font-semibold', darkMode ? 'text-white' : 'text-gray-900')}>
            خطأ في تحميل الأخبار
          </h2>
          <p className={cn('text-sm', darkMode ? 'text-gray-300' : 'text-gray-600')}>
            {error}
          </p>
          <button
            onClick={fetchNews}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            إعادة المحاولة
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('min-h-screen', darkMode ? 'bg-gray-900' : 'bg-gray-50')}>
      <div className="news-container">
        {/* العنوان والتنقل */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-4 text-sm">
            <Link href="/" className={cn('hover:underline', darkMode ? 'text-gray-400' : 'text-gray-600')}>
              الرئيسية
            </Link>
            <ArrowRight className="w-4 h-4" />
            <span className={cn('font-semibold', darkMode ? 'text-white' : 'text-gray-900')}>
              الأخبار
            </span>
          </div>
        </div>

        {/* رأس الصفحة */}
        <div className={cn('news-header', darkMode ? 'bg-gray-800' : '')}>
          <h1 className="news-title">جميع الأخبار</h1>
          <p className="news-subtitle">
            تابع آخر الأخبار والتطورات من مصادر موثوقة
          </p>
        </div>

        {/* شريط البحث */}
        <div className="mb-8">
          <div className="relative max-w-md">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="ابحث في الأخبار..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={cn(
                'w-full pl-4 pr-12 py-3 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-transparent',
                darkMode 
                  ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-400' 
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
              )}
            />
          </div>
        </div>

        {/* عرض النتائج */}
        {filteredArticles.length === 0 ? (
          <div className="text-center py-12">
            <p className={cn('text-lg', darkMode ? 'text-gray-300' : 'text-gray-600')}>
              {searchTerm ? 'لا توجد أخبار تطابق بحثك' : 'لا توجد أخبار متاحة'}
            </p>
          </div>
        ) : (
          <>
            {/* عدد النتائج */}
            <div className="mb-6">
              <p className={cn('text-sm', darkMode ? 'text-gray-400' : 'text-gray-600')}>
                {searchTerm ? 
                  `تم العثور على ${filteredArticles.length} خبر` :
                  `جميع الأخبار - ${filteredArticles.length} خبر`
                }
              </p>
            </div>

            {/* شبكة الأخبار */}
            <div className="news-grid">
              {filteredArticles.map((article) => (
                <article key={article.id} className={cn('news-card', darkMode ? 'bg-gray-800' : 'bg-white')}>
                  {/* صورة الخبر */}
                  <div className="relative">
                    <Image
                      src={getImageUrl(article.featured_image)}
                      alt={article.title}
                      width={400}
                      height={200}
                      className="news-image"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = '/images/default-news.jpg';
                      }}
                    />
                    {article.breaking && (
                      <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-bold">
                        عاجل
                      </div>
                    )}
                    {article.featured && (
                      <div className="absolute top-2 left-2 bg-yellow-500 text-white px-2 py-1 rounded text-xs font-bold">
                        مميز
                      </div>
                    )}
                  </div>

                  {/* محتوى البطاقة */}
                  <div className="news-content">
                    {/* التصنيف */}
                    {article.categories && (
                      <span 
                        className="news-category"
                        style={{ backgroundColor: article.categories.color || '#3B82F6' }}
                      >
                        {article.categories.name}
                      </span>
                    )}

                    {/* العنوان */}
                    <Link href={`/news/${article.slug}`}>
                      <h2 className={cn('news-item-title', darkMode ? 'text-white hover:text-blue-400' : 'text-gray-900 hover:text-blue-600')}>
                        {article.title}
                      </h2>
                    </Link>

                    {/* الملخص */}
                    {article.excerpt && (
                      <p className={cn('news-summary', darkMode ? 'text-gray-300' : 'text-gray-600')}>
                        {article.excerpt}
                      </p>
                    )}

                    {/* المعلومات الإضافية */}
                    <div className="news-meta">
                      <div className="flex items-center gap-4">
                        <span className={cn('news-author', darkMode ? 'text-blue-400' : 'text-blue-600')}>
                          <User className="w-4 h-4 inline ml-1" />
                          {article.author.name}
                        </span>
                        <span className={cn('news-date flex items-center gap-1', darkMode ? 'text-gray-400' : 'text-gray-500')}>
                          <Calendar className="w-4 h-4" />
                          {formatDate(article.published_at || article.created_at)}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs">
                        <span className={cn('flex items-center gap-1', darkMode ? 'text-gray-400' : 'text-gray-500')}>
                          <Eye className="w-4 h-4" />
                          {article.views.toLocaleString()}
                        </span>
                        {article.reading_time && (
                          <span className={cn(darkMode ? 'text-gray-400' : 'text-gray-500')}>
                            {article.reading_time} دقيقة
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}