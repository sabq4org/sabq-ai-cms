'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Radio, Loader2, Grid3X3, List, Calendar, Clock, Eye, Home,
  ArrowLeft, AlertTriangle, Filter, TrendingUp, Activity, Zap,
  Newspaper, FileText, FolderOpen, Hash
} from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { formatDistanceToNow } from 'date-fns';
import { ar } from 'date-fns/locale';

interface TimelineItem {
  id: string;
  type: 'news' | 'article' | 'category';
  title: string;
  slug?: string;
  excerpt?: string | null;
  image?: string | null;
  category?: {
    id: string;
    name: string;
    slug: string;
    color: string | null;
  } | null;
  author?: {
    id: string;
    name: string;
  } | null;
  timestamp: string;
  tag: string;
  label: string;
  color: string;
  categoryData?: {
    color: string | null;
    icon: string | null;
  };
}

export default function MomentByMomentPage() {
  const [timelineItems, setTimelineItems] = useState<TimelineItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [viewMode, setViewMode] = useState<'timeline' | 'grid'>('timeline');
  const [error, setError] = useState<string | null>(null);
  const [isLive, setIsLive] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [filter, setFilter] = useState<'all' | 'news' | 'articles' | 'categories'>('all');

  const ITEMS_PER_PAGE = 20;

  // Ensure component is mounted before showing dynamic content
  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch timeline items
  const fetchTimeline = async (reset = false) => {
    try {
      setLoading(true);
      setError(null);
      
      const currentPage = reset ? 1 : page;
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: ITEMS_PER_PAGE.toString()
      });

      const response = await fetch(`/api/timeline?${params}`);
      if (!response.ok) throw new Error('Failed to fetch timeline');
      
      const data = await response.json();
      
      if (reset) {
        setTimelineItems(data.items || []);
        setPage(1);
      } else {
        setTimelineItems(prev => [...prev, ...(data.items || [])]);
      }
      
      setHasMore(data.pagination?.hasMore || false);
    } catch (error) {
      console.error('Error fetching timeline:', error);
      setError('فشل في تحميل الخط الزمني');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTimeline(true);
  }, []);

  // Auto-refresh for live updates
  useEffect(() => {
    if (isLive) {
      const interval = setInterval(() => {
        fetchTimeline(true);
      }, 30000); // Refresh every 30 seconds

      return () => clearInterval(interval);
    }
  }, [isLive]);

  const loadMore = () => {
    if (!loading && hasMore) {
      setPage(prev => prev + 1);
      fetchTimeline(false);
    }
  };

  // Filter timeline items
  const filteredItems = timelineItems.filter(item => {
    if (filter === 'all') return true;
    if (filter === 'news') return item.type === 'news';
    if (filter === 'articles') return item.type === 'article';
    if (filter === 'categories') return item.type === 'category';
    return true;
  });

  // Get icon for timeline item
  const getItemIcon = (type: string) => {
    switch (type) {
      case 'news':
        return <Newspaper className="w-5 h-5" />;
      case 'article':
        return <FileText className="w-5 h-5" />;
      case 'category':
        return <FolderOpen className="w-5 h-5" />;
      default:
        return <Hash className="w-5 h-5" />;
    }
  };

  // Get color classes for timeline item
  const getItemColorClasses = (color: string) => {
    switch (color) {
      case 'green':
        return {
          bg: 'bg-green-100 dark:bg-green-900/30',
          border: 'border-green-500',
          text: 'text-green-700 dark:text-green-300',
          badge: 'bg-green-500'
        };
      case 'orange':
        return {
          bg: 'bg-orange-100 dark:bg-orange-900/30',
          border: 'border-orange-500',
          text: 'text-orange-700 dark:text-orange-300',
          badge: 'bg-orange-500'
        };
      case 'blue':
        return {
          bg: 'bg-blue-100 dark:bg-blue-900/30',
          border: 'border-blue-500',
          text: 'text-blue-700 dark:text-blue-300',
          badge: 'bg-blue-500'
        };
      default:
        return {
          bg: 'bg-gray-100 dark:bg-gray-800',
          border: 'border-gray-400',
          text: 'text-gray-700 dark:text-gray-300',
          badge: 'bg-gray-500'
        };
    }
  };

  return (
    <>
      <Header />
      
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800" suppressHydrationWarning>
        {/* Hero Section */}
        <section className="relative py-16 bg-gradient-to-br from-red-50 via-white to-red-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full blur-3xl bg-red-200/30 dark:bg-red-900/20" />
            <div className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full blur-3xl bg-orange-200/30 dark:bg-orange-900/20" />
          </div>
          
          <div className="relative max-w-7xl mx-auto px-4 md:px-6">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 mb-6 rounded-2xl bg-gradient-to-br from-red-500 to-red-600 shadow-2xl animate-pulse">
                <Radio className="w-10 h-10 text-white" />
              </div>
              
              <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900 dark:text-white" suppressHydrationWarning>
                لحظة بلحظة
              </h1>
              
              <p className="text-xl text-gray-600 dark:text-gray-300 mb-2" suppressHydrationWarning>
                تابع جميع الأحداث والتحديثات في مكان واحد
              </p>
              
              {mounted && !loading && filteredItems.length > 0 && (
                <p className="text-sm text-gray-500 dark:text-gray-400" suppressHydrationWarning>
                  {filteredItems.length} حدث
                </p>
              )}

              {/* Live Indicator */}
              {mounted && (
                <div className="mt-4 inline-flex items-center gap-2">
                  <div className="relative">
                    <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                    <div className="absolute inset-0 w-3 h-3 bg-red-500 rounded-full animate-ping"></div>
                  </div>
                  <span className="text-sm font-medium text-red-600 dark:text-red-400">
                    متابعة مباشرة
                  </span>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Controls Bar */}
        <div className="sticky top-0 z-40 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700" suppressHydrationWarning>
          <div className="max-w-7xl mx-auto px-4 md:px-6">
            <div className="flex items-center justify-between py-4">
              <div className="flex items-center gap-4">
                {/* Live Toggle */}
                <button
                  onClick={() => setIsLive(!isLive)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    isLive
                      ? 'bg-red-600 text-white shadow-lg'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  <Activity className="w-4 h-4" />
                  {isLive ? 'التحديث التلقائي مفعّل' : 'التحديث التلقائي معطّل'}
                </button>

                {/* Filter Buttons */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setFilter('all')}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      filter === 'all'
                        ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200'
                    }`}
                  >
                    الكل
                  </button>
                  <button
                    onClick={() => setFilter('news')}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      filter === 'news'
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200'
                    }`}
                  >
                    أخبار
                  </button>
                  <button
                    onClick={() => setFilter('articles')}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      filter === 'articles'
                        ? 'bg-orange-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200'
                    }`}
                  >
                    مقالات
                  </button>
                  <button
                    onClick={() => setFilter('categories')}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      filter === 'categories'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200'
                    }`}
                  >
                    تصنيفات
                  </button>
                </div>
              </div>

              {/* View Mode Toggle */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setViewMode('timeline')}
                  className={`p-2 rounded transition-colors ${
                    viewMode === 'timeline' 
                      ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900' 
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
                  }`}
                  title="عرض خط زمني"
                >
                  <List className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded transition-colors ${
                    viewMode === 'grid' 
                      ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900' 
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
                  }`}
                  title="عرض شبكي"
                >
                  <Grid3X3 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
          {/* Error State */}
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6 mb-6">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
                <p className="text-red-700 dark:text-red-300">{error}</p>
              </div>
            </div>
          )}

          {/* Loading State */}
          {loading && page === 1 ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="w-12 h-12 text-red-600 dark:text-red-400 animate-spin mb-4" />
              <p className="text-gray-600 dark:text-gray-400">جاري تحميل الخط الزمني...</p>
            </div>
          ) : filteredItems.length === 0 ? (
            // Empty State
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-12 text-center">
              <Radio className="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
                لا توجد أحداث
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                لا توجد أحداث مطابقة للفلتر المحدد
              </p>
            </div>
          ) : (
            <>
              {/* Timeline/Grid View */}
              {viewMode === 'timeline' ? (
                // Timeline View
                <div className="relative">
                  {/* Timeline Line */}
                  <div className="absolute right-6 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700 hidden md:block" />
                  
                  <div className="space-y-8">
                    {filteredItems.map((item, index) => {
                      const colors = getItemColorClasses(item.color);
                      const timeAgo = formatDistanceToNow(new Date(item.timestamp), {
                        locale: ar,
                        addSuffix: true
                      });
                      
                      return (
                        <div key={item.id} className="relative flex items-start gap-4">
                          {/* Timeline Dot */}
                          <div className="hidden md:flex items-center justify-center w-12 h-12 rounded-full bg-white dark:bg-gray-800 border-4 border-gray-200 dark:border-gray-700 z-10">
                            <div className={`w-6 h-6 rounded-full ${colors.badge}`} />
                          </div>
                          
                          {/* Content Card */}
                          <div className={`flex-1 ${colors.bg} rounded-xl p-6 border-r-4 ${colors.border}`}>
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex items-center gap-3">
                                <span className="text-2xl">{item.tag}</span>
                                <span className={`font-semibold ${colors.text}`}>
                                  {item.label}
                                </span>
                              </div>
                              <span className="text-sm text-gray-500 dark:text-gray-400">
                                {timeAgo}
                              </span>
                            </div>
                            
                            {/* عنوان قابل للنقر */}
                            {(item.type === 'news' || item.type === 'article') && item.slug ? (
                              <Link href={`/article/${item.slug}`}>
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 hover:text-red-600 dark:hover:text-red-400 cursor-pointer transition-colors">
                                  {item.title}
                                </h3>
                              </Link>
                            ) : item.type === 'category' && item.slug ? (
                              <Link href={`/categories/${item.slug}`}>
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 hover:text-red-600 dark:hover:text-red-400 cursor-pointer transition-colors">
                                  {item.title}
                                </h3>
                              </Link>
                            ) : (
                              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                                {item.title}
                              </h3>
                            )}
                            
                            {item.excerpt && (
                              <p className="text-gray-600 dark:text-gray-300 mb-3 line-clamp-2">
                                {item.excerpt}
                              </p>
                            )}
                            
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4 text-sm">
                                {item.category && (
                                  <span className="text-gray-500 dark:text-gray-400">
                                    {item.category.name}
                                  </span>
                                )}
                                {item.author && (
                                  <span className="text-gray-500 dark:text-gray-400">
                                    {item.author.name}
                                  </span>
                                )}
                              </div>
                              
                              {(item.type === 'news' || item.type === 'article') && item.slug && (
                                <Link 
                                  href={`/article/${item.slug}`}
                                  className={`text-sm font-medium ${colors.text} hover:underline`}
                                >
                                  اقرأ المزيد ←
                                </Link>
                              )}
                              
                              {item.type === 'category' && item.slug && (
                                <Link 
                                  href={`/categories/${item.slug}`}
                                  className={`text-sm font-medium ${colors.text} hover:underline`}
                                >
                                  استكشف التصنيف ←
                                </Link>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                // Grid View
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredItems.map(item => {
                    const colors = getItemColorClasses(item.color);
                    const timeAgo = formatDistanceToNow(new Date(item.timestamp), {
                      locale: ar,
                      addSuffix: true
                    });
                    
                    return (
                      <div key={item.id}>
                        {(item.type === 'news' || item.type === 'article') && item.slug ? (
                          <Link href={`/article/${item.slug}`}>
                            <div className={`${colors.bg} rounded-xl p-6 border-t-4 ${colors.border} hover:shadow-lg transition-all duration-200 hover:scale-[1.02] cursor-pointer`}>
                              <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2">
                                  <span className="text-xl">{item.tag}</span>
                                  <span className={`text-sm font-semibold ${colors.text}`}>
                                    {item.label}
                                  </span>
                                </div>
                                {getItemIcon(item.type)}
                              </div>
                              
                              <h3 className="font-bold text-gray-900 dark:text-white mb-2 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">
                                {item.title}
                              </h3>
                              
                              {item.excerpt && (
                                <p className="text-sm text-gray-600 dark:text-gray-300 mb-3 line-clamp-3">
                                  {item.excerpt}
                                </p>
                              )}
                              
                              <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                                <span>{timeAgo}</span>
                                <div className="flex items-center gap-2">
                                  {item.category && <span>{item.category.name}</span>}
                                  <span className={`text-xs font-medium ${colors.text}`}>
                                    ←
                                  </span>
                                </div>
                              </div>
                            </div>
                          </Link>
                        ) : item.type === 'category' && item.slug ? (
                          <Link href={`/categories/${item.slug}`}>
                            <div className={`${colors.bg} rounded-xl p-6 border-t-4 ${colors.border} hover:shadow-lg transition-all duration-200 hover:scale-[1.02] cursor-pointer`}>
                              <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2">
                                  <span className="text-xl">{item.tag}</span>
                                  <span className={`text-sm font-semibold ${colors.text}`}>
                                    {item.label}
                                  </span>
                                </div>
                                {getItemIcon(item.type)}
                              </div>
                              
                              <h3 className="font-bold text-gray-900 dark:text-white mb-2 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">
                                {item.title}
                              </h3>
                              
                              {item.excerpt && (
                                <p className="text-sm text-gray-600 dark:text-gray-300 mb-3 line-clamp-3">
                                  {item.excerpt}
                                </p>
                              )}
                              
                              <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                                <span>{timeAgo}</span>
                                <div className="flex items-center gap-2">
                                  {item.category && <span>{item.category.name}</span>}
                                  <span className={`text-xs font-medium ${colors.text}`}>
                                    ←
                                  </span>
                                </div>
                              </div>
                            </div>
                          </Link>
                        ) : (
                          <div className={`${colors.bg} rounded-xl p-6 border-t-4 ${colors.border} hover:shadow-lg transition-shadow`}>
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-2">
                                <span className="text-xl">{item.tag}</span>
                                <span className={`text-sm font-semibold ${colors.text}`}>
                                  {item.label}
                                </span>
                              </div>
                              {getItemIcon(item.type)}
                            </div>
                            
                            <h3 className="font-bold text-gray-900 dark:text-white mb-2">
                              {item.title}
                            </h3>
                            
                            {item.excerpt && (
                              <p className="text-sm text-gray-600 dark:text-gray-300 mb-3 line-clamp-3">
                                {item.excerpt}
                              </p>
                            )}
                            
                            <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                              <span>{timeAgo}</span>
                              {item.category && <span>{item.category.name}</span>}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Load More */}
              {hasMore && (
                <div className="mt-12 text-center">
                  <button
                    onClick={loadMore}
                    disabled={loading}
                    className="inline-flex items-center gap-2 px-8 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        جاري التحميل...
                      </>
                    ) : (
                      <>
                        عرض المزيد
                        <ArrowLeft className="w-5 h-5" />
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