'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Heart, Clock, ExternalLink, Loader2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ar } from 'date-fns/locale';

interface LikedArticle {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  featured_image?: string;
  published_at: string;
  liked_at: string;
  categories?: {
    id: string;
    name: string;
    color?: string;
    icon?: string;
  };
}

interface LikedArticlesProps {
  userId: string;
  darkMode?: boolean;
}

export default function LikedArticles({ userId, darkMode = false }: LikedArticlesProps) {
  const [articles, setArticles] = useState<LikedArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    fetchLikedArticles();
  }, [userId]);

  const fetchLikedArticles = async (pageNum = 1) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/interactions/liked-articles?userId=${userId}&page=${pageNum}&limit=6`);
      const data = await response.json();

      if (data.success) {
        if (pageNum === 1) {
          setArticles(data.data.articles);
        } else {
          setArticles(prev => [...prev, ...data.data.articles]);
        }
        setTotal(data.data.total);
        setHasMore(data.data.hasMore);
        setPage(pageNum);
      } else {
        setError(data.error || 'حدث خطأ في جلب المقالات');
      }
    } catch (err) {
      setError('حدث خطأ في الاتصال بالخادم');
    } finally {
      setLoading(false);
    }
  };

  const loadMore = () => {
    if (!loading && hasMore) {
      fetchLikedArticles(page + 1);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { 
        addSuffix: true,
        locale: ar 
      });
    } catch {
      return 'منذ فترة';
    }
  };

  if (loading && articles.length === 0) {
    return (
      <div className={`rounded-xl p-8 ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
        <div className="flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
          <span className={`mr-2 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            جاري تحميل المقالات المعجب بها...
          </span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`rounded-xl p-8 ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
        <div className="text-center">
          <Heart className={`w-12 h-12 mx-auto mb-3 ${darkMode ? 'text-gray-600' : 'text-gray-400'}`} />
          <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            {error}
          </p>
        </div>
      </div>
    );
  }

  if (articles.length === 0) {
    return (
      <div className={`rounded-xl p-8 ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
        <div className="text-center">
          <Heart className={`w-12 h-12 mx-auto mb-3 ${darkMode ? 'text-gray-600' : 'text-gray-400'}`} />
          <h3 className={`text-lg font-semibold mb-2 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
            لم تعجب بأي مقال بعد
          </h3>
          <p className={`mb-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            ابدأ بقراءة المقالات وأعجب بما يعجبك
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            استكشف المقالات
            <ExternalLink className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={`rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <h3 className={`text-lg font-bold flex items-center gap-2 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
            <Heart className="w-5 h-5 text-red-500" />
            المقالات المعجب بها
            <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              ({total})
            </span>
          </h3>
          <Link
            href="/profile?tab=likes"
            className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm font-medium"
          >
            عرض الكل
          </Link>
        </div>
      </div>

      <div className="p-6">
        <div className="grid gap-4 md:grid-cols-2">
          {articles.map((article) => (
            <div
              key={article.id}
              className={`p-4 rounded-lg border transition-colors hover:shadow-md ${
                darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  <Link
                    href={`/news/${article.id}`}
                    className={`font-medium hover:text-blue-600 dark:hover:text-blue-400 line-clamp-2 ${
                      darkMode ? 'text-white' : 'text-gray-800'
                    }`}
                  >
                    {article.title}
                  </Link>
                  
                  {article.excerpt && (
                    <p className={`text-sm mt-1 line-clamp-2 ${
                      darkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      {article.excerpt}
                    </p>
                  )}

                  <div className="flex items-center gap-3 mt-3 text-xs">
                    {article.categories && (
                      <span 
                        className="px-2 py-1 rounded-full text-white text-xs"
                        style={{ backgroundColor: article.categories.color || '#3B82F6' }}
                      >
                        {article.categories.icon} {article.categories.name}
                      </span>
                    )}
                    
                    <span className={`flex items-center gap-1 ${
                      darkMode ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      <Heart className="w-3 h-3 text-red-500" />
                      {formatDate(article.liked_at)}
                    </span>
                    
                    <span className={`flex items-center gap-1 ${
                      darkMode ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      <Clock className="w-3 h-3" />
                      {formatDate(article.published_at)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {hasMore && (
          <div className="text-center mt-6">
            <button
              onClick={loadMore}
              disabled={loading}
              className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                loading
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  جاري التحميل...
                </div>
              ) : (
                'عرض المزيد'
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
} 