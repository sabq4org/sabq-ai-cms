'use client';

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Search, Loader2, AlertTriangle, Hash, Calendar, ArrowLeft, Grid, List, TrendingUp, Eye, Clock } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ArticleCard from "@/components/ArticleCard";
interface Article {
  id: string;
  title: string;
  summary?: string;
  excerpt?: string;
  slug?: string;
  featured_image?: string;
  published_at?: string;
  created_at: string;
  category_name?: string;
  category_id: number;
  author_name?: string;
  reading_time?: number;
  views_count?: number;
  views?: number;
  is_breaking?: boolean;
  is_featured?: boolean;
  breaking?: boolean;
  featured?: boolean;
  metadata?: {
    is_breaking?: boolean;
    is_featured?: boolean;
    [key: string]: any;
  };
}

function SearchContent() {
  const params = useSearchParams();
  const query = params?.get("q") ?? "";
  
  // استخدام الوضع الليلي من CSS
  const darkMode = false;
  
  const [loading, setLoading] = useState(false);
  const [articles, setArticles] = useState<Article[]>([]);
  const [filteredArticles, setFilteredArticles] = useState<Article[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'newest' | 'views' | 'relevance'>('relevance');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [totalResults, setTotalResults] = useState(0);

  useEffect(() => {
    const fetchResults = async () => {
      if (!query) return;
      setLoading(true);
      setError(null);
      
      try {
        const res = await fetch(`/api/articles?search=${encodeURIComponent(query)}&page=${page}&limit=20`);
        const data = await res.json();
        
        if (data.success) {
          const newArticles = data.data || data.articles || [];
          if (page === 1) {
            setArticles(newArticles);
          } else {
            setArticles(prev => [...prev, ...newArticles]);
          }
          setTotalResults(data.pagination?.total || data.total || newArticles.length);
          setHasMore(newArticles.length === 20);
        } else {
          setError(data.error || "فشل البحث");
        }
      } catch (e: any) {
        setError("خطأ في الشبكة");
      } finally {
        setLoading(false);
      }
    };
    
    fetchResults();
  }, [query, page]);

  // فلترة وترتيب المقالات
  useEffect(() => {
    let sorted = [...articles];
    
    switch (sortBy) {
      case 'views':
        sorted.sort((a, b) => ((b.views_count || b.views || 0) - (a.views_count || a.views || 0)));
        break;
      case 'newest':
        sorted.sort((a, b) => new Date(b.published_at || b.created_at || 0).getTime() - new Date(a.published_at || a.created_at || 0).getTime());
        break;
      case 'relevance':
      default:
        // الترتيب الافتراضي من API
        break;
    }
    
    setFilteredArticles(sorted);
  }, [articles, sortBy]);

  const loadMore = () => {
    if (!loading && hasMore) {
      setPage(prev => prev + 1);
    }
  };

  return (
    <>
      <Header />
      
      {/* Hero Section */}
      <section className={`relative py-16 ${
        darkMode 
          ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' 
          : 'bg-gradient-to-br from-blue-50 via-white to-blue-50'
      }`}>
        <div className="absolute inset-0 overflow-hidden">
          <div className={`absolute -top-24 -right-24 w-96 h-96 rounded-full blur-3xl ${
            darkMode ? 'bg-blue-900/20' : 'bg-blue-200/30'
          }`} />
          <div className={`absolute -bottom-24 -left-24 w-96 h-96 rounded-full blur-3xl ${
            darkMode ? 'bg-purple-900/20' : 'bg-purple-200/30'
          }`} />
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 md:px-6">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 mb-6 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-2xl">
              <Hash className="w-10 h-10 text-white" />
            </div>
            
            <h1 className={`text-4xl md:text-5xl font-bold mb-4 ${
              darkMode ? 'text-white' : 'text-gray-900'
            }`}>
              نتائج البحث
            </h1>
            
            <p className={`text-xl ${darkMode ? 'text-gray-300' : 'text-gray-600'} mb-2`}>
              الكلمة المفتاحية: <span className="font-bold text-blue-600 dark:text-blue-400">{query}</span>
            </p>
            
            {totalResults > 0 && !loading && (
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                تم العثور على {totalResults.toLocaleString('ar-SA')} نتيجة
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Filters and Sort Section */}
      <section className={`sticky top-16 z-10 ${
        darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      } shadow-sm border-b`}>
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-4">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Back Link */}
            <Link 
              href="/" 
              className={`flex items-center gap-2 text-sm ${
                darkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-600 hover:text-gray-800'
              } transition-colors`}
            >
              <ArrowLeft className="w-4 h-4" />
              العودة للرئيسية
            </Link>
            
            {/* Sort and View Options */}
            <div className="flex items-center gap-4">
              {/* Sort */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className={`px-4 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  darkMode 
                    ? 'bg-gray-700 border-gray-600 text-gray-300' 
                    : 'bg-gray-50 border-gray-200 text-gray-700'
                } border`}
              >
                <option value="relevance">الأكثر صلة</option>
                <option value="newest">الأحدث</option>
                <option value="views">الأكثر مشاهدة</option>
              </select>
              
              {/* View Mode */}
              <div className={`flex items-center gap-2 p-1 rounded-lg ${
                darkMode ? 'bg-gray-700' : 'bg-gray-100'
              }`}>
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-md transition-colors ${
                    viewMode === 'grid'
                      ? `${darkMode ? 'bg-gray-600 text-blue-400' : 'bg-white text-blue-600'} shadow-sm`
                      : `${darkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'}`
                  }`}
                  title="عرض شبكة"
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-md transition-colors ${
                    viewMode === 'list'
                      ? `${darkMode ? 'bg-gray-600 text-blue-400' : 'bg-white text-blue-600'} shadow-sm`
                      : `${darkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'}`
                  }`}
                  title="عرض قائمة"
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 md:px-6 py-8 min-h-screen">
        {loading && page === 1 && (
          <div className="text-center py-20">
            <Loader2 className="w-8 h-8 mx-auto animate-spin text-blue-500" />
            <p className={`mt-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              جارٍ البحث عن المقالات...
            </p>
          </div>
        )}
        
        {error && (
          <div className={`text-center py-20 p-6 rounded-xl ${
            darkMode ? 'bg-red-900/20' : 'bg-red-50'
          }`}>
            <AlertTriangle className="w-8 h-8 mx-auto text-red-500" />
            <p className={`mt-4 font-semibold ${
              darkMode ? 'text-red-400' : 'text-red-700'
            }`}>{error}</p>
          </div>
        )}
        
        {!loading && !error && filteredArticles.length === 0 && (
          <div className={`text-center py-20 p-6 rounded-xl ${
            darkMode ? 'bg-gray-800' : 'bg-gray-50'
          }`}>
            <Search className={`w-16 h-16 mx-auto ${
              darkMode ? 'text-gray-600' : 'text-gray-400'
            }`} />
            <p className={`mt-4 text-lg ${
              darkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>
              لم يتم العثور على مقالات تحتوي على الكلمة المفتاحية "{query}"
            </p>
            <p className={`mt-2 text-sm ${
              darkMode ? 'text-gray-500' : 'text-gray-500'
            }`}>
              جرب البحث بكلمات مختلفة أو أكثر عمومية
            </p>
          </div>
        )}
        
        {!loading && filteredArticles.length > 0 && (
          <>
            {/* Articles Grid/List */}
            <div className={
              viewMode === 'grid' 
                ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6' 
                : 'space-y-4'
            }>
              {filteredArticles.map((article) => (
                <ArticleCard 
                  key={article.id} 
                  article={article} 
                  viewMode={viewMode}
                />
              ))}
            </div>
            
            {/* Load More Button */}
            {hasMore && (
              <div className="text-center mt-12">
                <button
                  onClick={loadMore}
                  disabled={loading}
                  className={`px-8 py-3 rounded-full font-medium transition-all ${
                    loading
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 transform hover:scale-105'
                  }`}
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      جارٍ التحميل...
                    </span>
                  ) : (
                    'عرض المزيد'
                  )}
                </button>
              </div>
            )}
          </>
        )}
      </main>
      
      <Footer />
    </>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 mx-auto animate-spin text-blue-500" />
          <p className="mt-4 text-gray-600">جارٍ التحميل...</p>
        </div>
      </div>
    }>
      <SearchContent />
    </Suspense>
  );
}