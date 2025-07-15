'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Bookmark, Clock, ExternalLink, Loader2, Trash2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ar } from 'date-fns/locale';

interface SavedArticle {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  featured_image?: string;
  published_at: string;
  saved_at: string;
  categories?: {
    id: string;
    name: string;
    color?: string;
    icon?: string;
  };
}

interface SavedArticlesTabProps {
  userId: string;
  darkMode?: boolean;
}

export default function SavedArticlesTab({ userId, darkMode = false }: SavedArticlesTabProps) {
  const [articles, setArticles] = useState<SavedArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [total, setTotal] = useState(0);
  const [removing, setRemoving] = useState<string | null>(null);

  useEffect(() => {
    fetchSavedArticles();
  }, [userId]);

  const fetchSavedArticles = async (pageNum = 1) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/interactions/saved-articles?userId=${userId}&page=${pageNum}&limit=12`);
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

  const handleRemoveBookmark = async (articleId: string) => {
    setRemoving(articleId);
    try {
      const response = await fetch('/api/bookmarks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          itemId: articleId,
          itemType: 'article'
        })
      });

      if (response.ok) {
        setArticles(prev => prev.filter(article => article.id !== articleId));
        setTotal(prev => prev - 1);
      }
    } catch (error) {
      console.error('Error removing bookmark:', error);
    } finally {
      setRemoving(null);
    }
  };

  const loadMore = () => {
    if (!loading && hasMore) {
      fetchSavedArticles(page + 1);
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
            جاري تحميل المقالات المحفوظة...
          </span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`rounded-xl p-8 ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
        <div className="text-center">
          <Bookmark className={`w-12 h-12 mx-auto mb-3 ${darkMode ? 'text-gray-600' : 'text-gray-400'}`} />
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
          <Bookmark className={`w-12 h-12 mx-auto mb-3 ${darkMode ? 'text-gray-600' : 'text-gray-400'}`} />
          <h3 className={`text-lg font-semibold mb-2 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
            لم تحفظ أي مقال بعد
          </h3>
          <p className={`mb-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            احفظ المقالات المهمة لقراءتها لاحقاً
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
    <div className="space-y-6">
      {/* Header */}
      <div className={`rounded-xl p-6 ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
        <div className="flex items-center justify-between">
          <div>
            <h2 className={`text-2xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
              مقالاتك المحفوظة
            </h2>
            <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              لديك {total} مقال محفوظ للقراءة لاحقاً
            </p>
          </div>
          <Bookmark className="w-12 h-12 text-blue-500" />
        </div>
      </div>

      {/* Articles Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {articles.map((article) => (
          <div
            key={article.id}
            className={`rounded-xl p-6 shadow-sm transition-all hover:shadow-md ${
              darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
            }`}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1 min-w-0">
                {article.categories && (
                  <span 
                    className="inline-block px-2 py-1 rounded-full text-white text-xs mb-2"
                    style={{ backgroundColor: article.categories.color || '#3B82F6' }}
                  >
                    {article.categories.icon} {article.categories.name}
                  </span>
                )}
                
                <Link
                  href={`/article/${article.id}`}
                  className={`block font-semibold hover:text-blue-600 dark:hover:text-blue-400 line-clamp-2 ${
                    darkMode ? 'text-white' : 'text-gray-800'
                  }`}
                >
                  {article.title}
                </Link>
              </div>
              
              <button
                onClick={() => handleRemoveBookmark(article.id)}
                disabled={removing === article.id}
                className={`p-2 rounded-lg transition-colors ${
                  removing === article.id
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'hover:bg-red-50 hover:text-red-600 text-gray-400'
                }`}
                title="إزالة من المحفوظات"
              >
                {removing === article.id ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
              </button>
            </div>

            {article.excerpt && (
              <p className={`text-sm line-clamp-3 mb-4 ${
                darkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>
                {article.excerpt}
              </p>
            )}

            <div className="flex items-center justify-between text-xs">
              <span className={`flex items-center gap-1 ${
                darkMode ? 'text-gray-400' : 'text-gray-500'
              }`}>
                <Bookmark className="w-3 h-3 text-blue-500" />
                {formatDate(article.saved_at)}
              </span>
              
              <span className={`flex items-center gap-1 ${
                darkMode ? 'text-gray-400' : 'text-gray-500'
              }`}>
                <Clock className="w-3 h-3" />
                {formatDate(article.published_at)}
              </span>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <Link
                href={`/article/${article.id}`}
                className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm font-medium"
              >
                قراءة المقال
                <ExternalLink className="w-3 h-3" />
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Load More */}
      {hasMore && (
        <div className="text-center">
          <button
            onClick={loadMore}
            disabled={loading}
            className={`px-8 py-3 rounded-lg font-medium transition-colors ${
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
  );
} 