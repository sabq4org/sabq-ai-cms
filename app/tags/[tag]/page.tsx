'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Hash, Home, Loader2, Grid3X3, List, Calendar, Clock, TrendingUp, Eye, ArrowLeft, AlertTriangle } from 'lucide-react';
import ArticleCard from '@/components/ArticleCard';
import Footer from '@/components/Footer';

interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featured_image?: string;
  author: {
    id: string;
    name: string;
    email: string;
  } | null;
  category: {
    id: string;
    name: string;
    slug: string;
    color: string | null;
    icon: string | null;
  } | null;
  category_id: number;
  views: number;
  reading_time?: number;
  published_at?: string;
  created_at: string;
  featured: boolean;
  breaking: boolean;
  keywords?: string[];
}

export default function TagPage() {
  const params = useParams();
  const tag = decodeURIComponent(params.tag as string);
  
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'newest' | 'views'>('newest');
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    fetchArticles();
  }, [tag, page, sortBy]);

  const fetchArticles = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`/api/tags/${encodeURIComponent(tag)}?page=${page}&limit=20`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("الخادم لم يرجع بيانات JSON صحيحة");
      }
      
      const data = await response.json();
      
      if (data.articles) {
        let sortedArticles = [...data.articles];
        
        // ترتيب المقالات حسب الاختيار
        if (sortBy === 'views') {
          sortedArticles.sort((a, b) => b.views - a.views);
        }
        
        if (page === 1) {
          setArticles(sortedArticles);
        } else {
          setArticles(prev => [...prev, ...sortedArticles]);
        }
        
        setTotalPages(data.pagination?.totalPages || 1);
        setHasMore(page < (data.pagination?.totalPages || 1));
      } else {
        throw new Error(data.error || 'فشل في جلب المقالات');
      }
    } catch (error) {
      console.error('خطأ في جلب المقالات:', error);
      setError(error instanceof Error ? error.message : 'حدث خطأ غير متوقع');
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  };

  const loadMore = () => {
    if (page < totalPages && !loading) {
      setPage(prev => prev + 1);
    }
  };

  return (
    <>
      
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Hero Section - مطابق لصفحة البحث */}
        <section className="relative py-16 bg-gradient-to-br from-blue-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full blur-3xl bg-blue-200/30 dark:bg-blue-900/20" />
            <div className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full blur-3xl bg-purple-200/30 dark:bg-purple-900/20" />
          </div>
          
          <div className="relative max-w-7xl mx-auto px-4 md:px-6">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 mb-6 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-2xl">
                <Hash className="w-10 h-10 text-white" />
              </div>
              
              <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900 dark:text-white">
                نتائج البحث
              </h1>
              
              <p className="text-xl text-gray-600 dark:text-gray-300 mb-2">
                الكلمة المفتاحية: <span className="font-bold text-blue-600 dark:text-blue-400">{tag}</span>
              </p>
              
              {!loading && articles.length > 0 && (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  تم العثور على {articles.length} نتيجة
                </p>
              )}
            </div>
          </div>
        </section>

        {/* Content Section */}
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
          {/* Results Count & Controls */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 mb-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex items-center gap-2">
                <Hash className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <span className="text-gray-700 dark:text-gray-300 font-medium">
                  {loading && page === 1 ? (
                    'جاري البحث...'
                  ) : articles.length > 0 ? (
                    `تم العثور على ${articles.length} مقال`
                  ) : (
                    'لا توجد نتائج'
                  )}
                </span>
              </div>

              <div className="flex items-center gap-3">
                {/* Sort Options */}
                <select
                  value={sortBy}
                  onChange={(e) => {
                    setSortBy(e.target.value as 'newest' | 'views');
                    setPage(1);
                  }}
                  className="px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="newest">الأحدث</option>
                  <option value="views">الأكثر مشاهدة</option>
                </select>

                {/* View Mode Toggle */}
                <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded transition-colors ${
                      viewMode === 'grid' 
                        ? 'bg-white dark:bg-gray-600 shadow-sm text-blue-600 dark:text-blue-400' 
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
                    }`}
                    title="عرض شبكي"
                  >
                    <Grid3X3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded transition-colors ${
                      viewMode === 'list' 
                        ? 'bg-white dark:bg-gray-600 shadow-sm text-blue-600 dark:text-blue-400' 
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
                    }`}
                    title="عرض قائمة"
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Error State */}
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6 mb-6">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
                <div>
                  <h3 className="font-semibold text-red-800 dark:text-red-200">حدث خطأ</h3>
                  <p className="text-red-600 dark:text-red-300 text-sm mt-1">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Loading State */}
          {loading && page === 1 ? (
            <div className="flex justify-center items-center py-20">
              <div className="text-center">
                <Loader2 className="w-12 h-12 animate-spin text-blue-600 dark:text-blue-400 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400">جاري البحث عن المقالات...</p>
              </div>
            </div>
          ) : articles.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-12 text-center">
              <Hash className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
                لا توجد مقالات
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6">
                لم يتم العثور على مقالات مرتبطة بالكلمة المفتاحية "{tag}"
              </p>
              <Link
                href="/"
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                العودة للرئيسية
              </Link>
            </div>
          ) : (
            <>
              {/* Articles Grid/List */}
              <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6' : 'space-y-4'}>
                {articles.map((article) => (
                  <ArticleCard
                    key={article.id}
                    article={article}
                    viewMode={viewMode}
                  />
                ))}
              </div>

              {/* Load More Button */}
              {hasMore && (
                <div className="flex justify-center mt-12">
                  <button
                    onClick={loadMore}
                    disabled={loading}
                    className="group px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg hover:shadow-xl"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        جاري التحميل...
                      </>
                    ) : (
                      <>
                        عرض المزيد
                        <span className="group-hover:translate-y-0.5 transition-transform">↓</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <Footer />
    </>
  );
} 