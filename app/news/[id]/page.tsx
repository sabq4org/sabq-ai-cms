'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Clock, Eye, Share2, Calendar, User, ArrowLeft, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useDarkModeContext } from '@/contexts/DarkModeContext';
import Link from 'next/link';
import Head from 'next/head';

interface NewsArticle {
  id: string;
  title: string;
  content: string;
  excerpt?: string;
  featured_image?: string;
  published_at: string;
  created_at: string;
  updated_at: string;
  views: number;
  reading_time?: number;
  author?: {
    id: string;
    name: string;
    avatar?: string;
  };
  category?: {
    id: string;
    name: string;
    color?: string;
  };
  status: string;
}

export default function NewsDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { darkMode } = useDarkModeContext();
  const newsId = params?.id as string;
  
  const [article, setArticle] = useState<NewsArticle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (newsId) {
      fetchNewsArticle();
    }
  }, [newsId]);

  const fetchNewsArticle = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/news/${newsId}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          setError('الخبر المطلوب غير موجود');
        } else {
          setError('حدث خطأ في تحميل الخبر');
        }
        return;
      }
      
      const data = await response.json();
      
      if (data.success && data.article) {
        setArticle(data.article);
        
        // تسجيل مشاهدة
        fetch(`/api/news/${newsId}/view`, {
          method: 'POST'
        }).catch(console.error);
      } else {
        setError('فشل في تحميل بيانات الخبر');
      }
    } catch (error) {
      console.error('خطأ في جلب الخبر:', error);
      setError('حدث خطأ في الاتصال بالخادم');
    } finally {
      setLoading(false);
    }
  };

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

  const handleShare = async () => {
    if (navigator.share && article) {
      try {
        await navigator.share({
          title: article.title,
          text: article.excerpt || article.title,
          url: window.location.href
        });
      } catch (error) {
        console.log('مشاركة ملغاة');
      }
    } else {
      // fallback to copying URL
      navigator.clipboard.writeText(window.location.href);
      alert('تم نسخ رابط الخبر');
    }
  };

  if (loading) {
    return (
      <div className={cn('min-h-screen', darkMode ? 'bg-gray-900' : 'bg-gray-50')}>
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="animate-pulse space-y-6">
              <div className={cn('h-8 rounded-lg', darkMode ? 'bg-gray-800' : 'bg-gray-200')}></div>
              <div className={cn('h-64 rounded-xl', darkMode ? 'bg-gray-800' : 'bg-gray-200')}></div>
              <div className="space-y-3">
                <div className={cn('h-4 rounded', darkMode ? 'bg-gray-800' : 'bg-gray-200')}></div>
                <div className={cn('h-4 rounded w-3/4', darkMode ? 'bg-gray-800' : 'bg-gray-200')}></div>
                <div className={cn('h-4 rounded w-1/2', darkMode ? 'bg-gray-800' : 'bg-gray-200')}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className={cn('min-h-screen flex items-center justify-center', darkMode ? 'bg-gray-900' : 'bg-gray-50')}>
        <div className="text-center">
          <h1 className={cn('text-2xl font-bold mb-4', darkMode ? 'text-white' : 'text-gray-900')}>
            {error || 'الخبر غير موجود'}
          </h1>
          <Link
            href="/news"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            العودة للأخبار
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>{article.title} - أخبار سبق</title>
        <meta name="description" content={article.excerpt || article.title} />
        <meta property="og:title" content={article.title} />
        <meta property="og:description" content={article.excerpt || article.title} />
        <meta property="og:type" content="article" />
        {article.featured_image && (
          <meta property="og:image" content={article.featured_image} />
        )}
      </Head>

      <div className={cn('min-h-screen', darkMode ? 'bg-gray-900' : 'bg-gray-50')}>
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <Link
                href="/news"
                className={cn(
                  'inline-flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors mb-6',
                  darkMode 
                    ? 'border-gray-700 hover:bg-gray-800 text-gray-300' 
                    : 'border-gray-300 hover:bg-gray-100 text-gray-700'
                )}
              >
                <ArrowLeft className="h-4 w-4" />
                العودة للأخبار
              </Link>

              {/* Category */}
              {article.category && (
                <div className="mb-4">
                  <span 
                    className="inline-block px-3 py-1 rounded-full text-sm font-medium text-white"
                    style={{ backgroundColor: article.category.color || '#3B82F6' }}
                  >
                    {article.category.name}
                  </span>
                </div>
              )}

              {/* Title */}
              <h1 className={cn('text-3xl md:text-4xl font-bold leading-tight mb-6', darkMode ? 'text-white' : 'text-gray-900')}>
                {article.title}
              </h1>

              {/* Meta Info */}
              <div className={cn('flex flex-wrap items-center gap-6 text-sm', darkMode ? 'text-gray-400' : 'text-gray-600')}>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>{formatDate(article.published_at || article.created_at)}</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <Eye className="h-4 w-4" />
                  <span>{article.views.toLocaleString()} مشاهدة</span>
                </div>

                {article.reading_time && (
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span>{article.reading_time} دقائق قراءة</span>
                  </div>
                )}

                <button
                  onClick={handleShare}
                  className={cn(
                    'flex items-center gap-2 px-3 py-1 rounded-lg border transition-colors',
                    darkMode 
                      ? 'border-gray-700 hover:bg-gray-800 text-gray-300' 
                      : 'border-gray-300 hover:bg-gray-100 text-gray-700'
                  )}
                >
                  <Share2 className="h-4 w-4" />
                  مشاركة
                </button>
              </div>
            </div>

            {/* Featured Image */}
            {article.featured_image && (
              <div className="mb-8">
                <img
                  src={article.featured_image}
                  alt={article.title}
                  className="w-full h-64 md:h-96 object-cover rounded-xl"
                />
              </div>
            )}

            {/* Excerpt */}
            {article.excerpt && (
              <div className={cn(
                'p-6 rounded-xl border-r-4 border-blue-500 mb-8',
                darkMode ? 'bg-gray-800 border-gray-700' : 'bg-blue-50 border-gray-200'
              )}>
                <p className={cn('text-lg leading-relaxed', darkMode ? 'text-gray-300' : 'text-gray-700')}>
                  {article.excerpt}
                </p>
              </div>
            )}

            {/* Content */}
            <div className={cn(
              'prose prose-lg max-w-none',
              darkMode ? 'prose-invert' : ''
            )}>
              <div
                className={cn('leading-relaxed', darkMode ? 'text-gray-300' : 'text-gray-800')}
                dangerouslySetInnerHTML={{ __html: article.content }}
              />
            </div>

            {/* Author Info */}
            {article.author && (
              <div className={cn(
                'mt-12 p-6 rounded-xl border',
                darkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'
              )}>
                <div className="flex items-center gap-4">
                  {article.author.avatar && (
                    <img
                      src={article.author.avatar}
                      alt={article.author.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  )}
                  <div>
                    <h3 className={cn('font-semibold', darkMode ? 'text-white' : 'text-gray-900')}>
                      {article.author.name}
                    </h3>
                    <p className={cn('text-sm', darkMode ? 'text-gray-400' : 'text-gray-600')}>
                      محرر الأخبار
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Related News (placeholder) */}
            <div className="mt-12">
              <h2 className={cn('text-2xl font-bold mb-6', darkMode ? 'text-white' : 'text-gray-900')}>
                أخبار ذات صلة
              </h2>
              <div className={cn(
                'p-8 rounded-xl border text-center',
                darkMode ? 'bg-gray-800 border-gray-700 text-gray-400' : 'bg-gray-50 border-gray-200 text-gray-600'
              )}>
                <p>سيتم عرض الأخبار ذات الصلة هنا قريباً</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}