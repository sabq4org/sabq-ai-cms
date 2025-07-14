'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import ArticleCard from '@/components/ArticleCard';
import { TrendingUp, Calendar, User, Eye, Clock, Filter, Search } from 'lucide-react';

interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featured_image: string;
  published_at: string;
  created_at: string;
  views: number;
  reading_time: number;
  category_id: number;
  category: {
    id: string;
    name: string;
    slug: string;
    color: string | null;
    icon: string | null;
  };
  author: {
    id: string;
    name: string;
    email: string;
  };
}

export default function DeepAnalysisPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sortBy, setSortBy] = useState('latest');
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredArticles, setFilteredArticles] = useState<Article[]>([]);

  const searchParams = useSearchParams();

  useEffect(() => {
    fetchDeepAnalysisArticles();
  }, [currentPage, sortBy]);

  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = articles.filter(article =>
        article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.excerpt.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredArticles(filtered);
    } else {
      setFilteredArticles(articles);
    }
  }, [searchQuery, articles]);

  const fetchDeepAnalysisArticles = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/deep-analyses?page=${currentPage}&sortBy=${sortBy}&limit=10`);
      
      if (!response.ok) {
        throw new Error('فشل في جلب المقالات');
      }

      const data = await response.json();
      
      // تحويل البيانات للتطابق مع واجهة Article
      const transformedArticles = (data.data || []).map((analysis: any) => ({
        id: analysis.id,
        title: analysis.title,
        slug: analysis.slug,
        excerpt: analysis.summary,
        content: analysis.rawContent,
        featured_image: analysis.featuredImage || '/placeholder.jpg',
        published_at: analysis.publishedAt || analysis.createdAt,
        created_at: analysis.createdAt,
        views: analysis.views || 0,
        reading_time: analysis.readingTime || 5,
        category_id: 1, // افتراضي للتحليل العميق
        category: {
          id: 'deep-analysis',
          name: 'تحليل عميق',
          slug: 'deep-analysis',
          color: '#3B82F6',
          icon: 'TrendingUp'
        },
        author: {
          id: 'deep-analysis-author',
          name: analysis.authorName || 'محرر سبق',
          email: 'editor@sabq.ai'
        }
      }));
      
      setArticles(transformedArticles);
      setTotalPages(data.pagination?.totalPages || 1);
    } catch (error) {
      console.error('خطأ في جلب مقالات التحليل العميق:', error);
      setError('حدث خطأ في تحميل المقالات');
    } finally {
      setLoading(false);
    }
  };

  const handleSortChange = (newSortBy: string) => {
    setSortBy(newSortBy);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white dark:bg-gray-800 rounded-lg p-6">
                  <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="text-red-500 text-xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              حدث خطأ
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              إعادة المحاولة
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="flex items-center justify-center mb-4">
              <TrendingUp className="w-8 h-8 text-blue-600 ml-3" />
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
                عمق
              </h1>
            </div>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              تحليلات معمقة وتقارير شاملة حول أهم الأحداث والقضايا المحلية والعالمية
            </p>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between mb-8">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="البحث في التحليلات..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pr-10 pl-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Sort */}
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={sortBy}
              onChange={(e) => handleSortChange(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="latest">الأحدث</option>
              <option value="popular">الأكثر قراءة</option>
              <option value="trending">الأكثر تفاعلاً</option>
            </select>
          </div>
        </div>

        {/* Articles Grid */}
        {filteredArticles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {filteredArticles.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <TrendingUp className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
              لا توجد تحليلات متاحة
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {searchQuery ? 'لم يتم العثور على نتائج للبحث المحدد' : 'لم يتم نشر أي تحليلات بعد'}
            </p>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-8">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-4 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-800 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700"
            >
              السابق
            </button>
            
            {[...Array(totalPages)].map((_, index) => {
              const page = index + 1;
              return (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`px-4 py-2 text-sm font-medium rounded-lg ${
                    currentPage === page
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700'
                  }`}
                >
                  {page}
                </button>
              );
            })}
            
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-4 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-800 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700"
            >
              التالي
            </button>
          </div>
        )}
      </div>
    </div>
  );
} 