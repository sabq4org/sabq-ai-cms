'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { 
  Newspaper, Loader2, Grid3X3, List, Calendar, Clock, Eye, Home,
  ArrowLeft, AlertTriangle, Filter, TrendingUp, Heart, Bookmark, 
  Share2, MessageSquare, Layers
} from 'lucide-react';
import ArticleCard from '@/components/ArticleCard';
import UnifiedMobileNewsCard from '@/components/mobile/UnifiedMobileNewsCard';
import Footer from '@/components/Footer';
import { useDarkModeContext } from '@/contexts/DarkModeContext';
import '@/components/mobile/mobile-news.css';
import '@/styles/unified-mobile-news.css';
import './news-styles.css';
import '../categories/categories-fixes.css';

interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  summary?: string;
  content?: string;
  featured_image?: string;
  author?: {
    id: string;
    name: string;
    email: string;
  } | null;
  author_name?: string;
  author_id?: string;
  category?: {
    id: string;
    name: string;
    slug: string;
    color: string | null;
    icon: string | null;
  } | null;
  category_id: number;
  category_name?: string;
  views?: number;
  views_count?: number;
  reading_time?: number;
  published_at?: string;
  created_at: string;
  featured?: boolean;
  is_featured?: boolean;
  breaking?: boolean;
  is_breaking?: boolean;
  metadata?: any;
  keywords?: string[];
}

interface Category {
  id: number;
  name: string;
  name_ar: string;
  slug: string;
  color: string | null;
  color_hex: string | null;
  icon: string | null;
}

interface NewsStats {
  totalArticles: number;
  totalViews: number;
  totalLikes: number;
  totalSaves: number;
}

// كاش بسيط للبيانات
const categoriesCache = new Map();
const statsCache = new Map();

export default function NewsPage() {
  const { darkMode } = useDarkModeContext();
  const [articles, setArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'newest' | 'views'>('newest');
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<NewsStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const ITEMS_PER_PAGE = 20;

  // تحسين جلب التصنيفات مع معالجة أفضل للأخطاء والكاش
  const fetchCategories = useCallback(async () => {
    // تحقق من الكاش أولاً
    const cacheKey = 'categories';
    const cached = categoriesCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < 5 * 60 * 1000) { // 5 دقائق
      setCategories(cached.data);
      return;
    }

    try {
      console.log('🔍 جلب التصنيفات من:', '/api/categories?is_active=true');
      
      // استخدام timeout لتجنب انتظار الطلب إلى ما لا نهاية
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 ثواني كحد أقصى

      // محاولة جلب البيانات
      const response = await fetch('/api/categories?is_active=true', { 
        signal: controller.signal,
        cache: 'no-store' // تجنب مشكلات التخزين المؤقت
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch categories: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // التعامل مع مختلف أشكال البيانات المُرجعة
      const categoriesData = data.categories || data.data || [];
      console.log(`✅ التصنيفات المُستلمة: ${categoriesData.length}`);
      
      if (categoriesData.length === 0 && data.error) {
        throw new Error(`API error: ${data.error}`);
      }
      
      // حفظ في الكاش
      categoriesCache.set(cacheKey, {
        data: categoriesData,
        timestamp: Date.now()
      });
      
      setCategories(categoriesData);
      
      // إزالة رسالة الخطأ إذا كانت موجودة
      if (error) setError(null);
    } catch (err: any) {
      console.error('Error fetching categories:', err);
      
      // رسالة خطأ أكثر تفصيلاً
      const errorMessage = err.name === 'AbortError' 
        ? 'استغرق تحميل التصنيفات وقتاً طويلاً، يرجى المحاولة مرة أخرى.' 
        : `فشل في تحميل التصنيفات: ${err.message}`;
      
      setError(errorMessage);
      
      // استخدام بيانات احتياطية إذا كان لدينا
      if (categories.length === 0) {
        const fallbackCategories: Category[] = [
          { id: 1, name: 'عام', name_ar: 'عام', slug: 'general', color: '#1a73e8', color_hex: '#1a73e8', icon: '📰' },
          { id: 2, name: 'رياضة', name_ar: 'رياضة', slug: 'sports', color: '#34a853', color_hex: '#34a853', icon: '⚽' },
        ];
        setCategories(fallbackCategories);
      }
    }
  }, [error, categories.length]);

  // Fetch stats with caching
  const fetchStats = useCallback(async () => {
    const cacheKey = `stats-${selectedCategory || 'all'}`;
    const cached = statsCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < 5 * 60 * 1000) { // 5 دقائق
      setStats(cached.data);
      return;
    }

    try {
      setStatsLoading(true);
      const params = selectedCategory ? `?category_id=${selectedCategory}` : '';
      const response = await fetch(`/api/news/stats${params}`);
      if (!response.ok) throw new Error('Failed to fetch stats');
      const data = await response.json();
      if (data.success) {
        statsCache.set(cacheKey, {
          data: data.stats,
          timestamp: Date.now()
        });
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
      // في حالة الفشل، نستخدم إحصائيات بديلة
      setStats({
        totalArticles: articles.length,
        totalLikes: 0,
        totalViews: articles.reduce((sum, article) => sum + (article.views || article.views_count || 0), 0),
        totalSaves: 0
      });
    } finally {
      setStatsLoading(false);
    }
  }, [selectedCategory, articles]);

  // Fetch articles - محسن للأداء
  const fetchArticles = useCallback(async (reset = false) => {
    try {
      if (reset) {
        setLoading(true);
      } else {
        setIsLoadingMore(true);
      }
      setError(null);
      
      const currentPage = reset ? 1 : page;
      const params = new URLSearchParams({
        status: 'published',
        limit: ITEMS_PER_PAGE.toString(),
        page: currentPage.toString(),
        sortBy: sortBy === 'views' ? 'views' : 'published_at',
        order: 'desc'
      });

      if (selectedCategory) {
        params.append('category_id', selectedCategory.toString());
      }

      // دعم timeout لتجنب مشاكل انتهاء المهلة
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 ثواني

      try {
        const response = await fetch(`/api/articles?${params}`, {
          signal: controller.signal
        });
        clearTimeout(timeoutId);
        
        if (!response.ok) throw new Error('Failed to fetch articles');
        
        const data = await response.json();
        
        // إصلاح مشكلة عدم ظهور الأخبار - API يعيد البيانات في data.data
        const articles = data.data || data.articles || [];
        
        if (reset) {
          setArticles(articles);
          setPage(1);
        } else {
          setArticles(prev => [...prev, ...articles]);
        }
        
        setHasMore(articles.length === ITEMS_PER_PAGE);
      } catch (fetchError: any) {
        clearTimeout(timeoutId);
        if (fetchError.name === 'AbortError') {
          throw new Error('انتهت مهلة تحميل الأخبار. يرجى المحاولة مرة أخرى.');
        }
        throw fetchError;
      }
    } catch (error) {
      console.error('Error fetching articles:', error);
      setError(error instanceof Error ? error.message : 'فشل في تحميل المقالات');
    } finally {
      setLoading(false);
      setIsLoadingMore(false);
    }
  }, [page, selectedCategory, sortBy]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // كشف الموبايل
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    // فحص أولي
    checkMobile();

    // مراقبة تغيير حجم الشاشة
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    fetchArticles(true);
  }, [selectedCategory, sortBy]);

  useEffect(() => {
    if (articles.length > 0) {
      fetchStats();
    }
  }, [articles, fetchStats]);

  const loadMore = useCallback(() => {
    if (!loading && !isLoadingMore && hasMore) {
      setPage(prev => prev + 1);
      fetchArticles(false);
    }
  }, [loading, isLoadingMore, hasMore, fetchArticles]);

  // محسنة مع useMemo
  const getCategoryName = useMemo(() => (categoryId: number) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category?.name || category?.name_ar || 'غير مصنف';
  }, [categories]);

  const getCategoryColor = useMemo(() => (categoryId: number) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category?.color || category?.color_hex || '#3B82F6';
  }, [categories]);

  return (
    <>
      
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Hero Section */}
        <section className="relative py-16 bg-gradient-to-br from-blue-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full blur-3xl bg-blue-200/30 dark:bg-blue-900/20" />
            <div className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full blur-3xl bg-purple-200/30 dark:bg-purple-900/20" />
          </div>
          
          <div className="relative max-w-7xl mx-auto px-4 md:px-6">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 mb-6 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-2xl">
                <Newspaper className="w-10 h-10 text-white" />
              </div>
              
              <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900 dark:text-white">
                آخر الأخبار
              </h1>
              
              <p className="text-xl text-gray-600 dark:text-gray-300 mb-2">
                تابع أحدث الأخبار والتطورات
              </p>
              
              {/* إحصائيات الأخبار */}
              {stats && !statsLoading && (
                <div className="mt-6 inline-flex flex-wrap justify-center items-center gap-4 md:gap-6 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl px-4 md:px-6 py-3 shadow-lg">
                  <div className="text-center px-2">
                    <div className="flex items-center gap-2">
                      <Newspaper className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalArticles}</div>
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">خبر</div>
                  </div>
                  
                  <div className="w-px h-10 bg-gray-300 dark:bg-gray-600 hidden md:block"></div>
                  
                  <div className="text-center px-2">
                    <div className="flex items-center gap-2">
                      <Eye className="w-5 h-5 text-green-600 dark:text-green-400" />
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">
                        {stats.totalViews > 999 ? `${(stats.totalViews / 1000).toFixed(1)}k` : stats.totalViews}
                      </div>
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">مشاهدة</div>
                  </div>
                  
                  <div className="w-px h-10 bg-gray-300 dark:bg-gray-600 hidden md:block"></div>
                  
                  <div className="text-center px-2">
                    <div className="flex items-center gap-2">
                      <Heart className="w-5 h-5 text-red-600 dark:text-red-400" />
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalLikes}</div>
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">إعجاب</div>
                  </div>
                  
                  <div className="w-px h-10 bg-gray-300 dark:bg-gray-600 hidden md:block"></div>
                  
                  <div className="text-center px-2">
                    <div className="flex items-center gap-2">
                      <Bookmark className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalSaves}</div>
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">حفظ</div>
                  </div>
                </div>
              )}
              
              {/* Loading indicator for stats */}
              {statsLoading && (
                <div className="mt-6 inline-flex items-center gap-2 text-gray-500 dark:text-gray-400">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm">جاري تحميل الإحصائيات...</span>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Categories Filter */}
        <div className="sticky top-0 z-40 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700">
          <div className="max-w-7xl mx-auto px-4 md:px-6">
            <div className="flex items-center gap-2 py-4 overflow-x-auto scrollbar-hide">
              <button
                onClick={() => setSelectedCategory(null)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
                  selectedCategory === null
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                جميع الأخبار
              </button>
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
                    selectedCategory === category.id
                      ? 'text-white shadow-lg'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                  style={{
                    backgroundColor: selectedCategory === category.id ? getCategoryColor(category.id) : undefined
                  }}
                >
                  {category.name || category.name_ar}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
          {/* Results Count & Controls */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 mb-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex items-center gap-2">
                <Newspaper className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <span className="text-gray-700 dark:text-gray-300 font-medium">
                  {loading && page === 1 ? (
                    'جاري التحميل...'
                  ) : articles.length > 0 ? (
                    `${articles.length} خبر`
                  ) : (
                    'لا توجد أخبار'
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

                {/* View Mode Toggle - مخفي في الموبايل */}
                {!isMobile && (
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
                )}
              </div>
            </div>
          </div>

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
              <Loader2 className="w-12 h-12 text-blue-600 dark:text-blue-400 animate-spin mb-4" />
              <p className="text-gray-600 dark:text-gray-400">جاري تحميل الأخبار...</p>
            </div>
          ) : articles.length === 0 ? (
            // Empty State
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-12 text-center">
              <Newspaper className="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
                لا توجد أخبار
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                {selectedCategory ? 
                  `لا توجد أخبار في قسم ${getCategoryName(selectedCategory)}` :
                  'لا توجد أخبار متاحة حالياً'
                }
              </p>
            </div>
          ) : (
            <>
              {/* Articles Grid/List - محسن للموبايل */}
              {isMobile ? (
                // عرض الموبايل - قائمة كاملة العرض بتنسيق بلوك المحتوى الذكي
                <div className="mobile-news-container space-y-4">
                  {articles.map((article) => (
                    <UnifiedMobileNewsCard
                      key={article.id}
                      article={article}
                      darkMode={darkMode}
                      variant="smart-block"
                      onBookmark={(id) => {
                        // إضافة منطق الحفظ
                        console.log('Bookmark article:', id);
                      }}
                      onShare={(article) => {
                        // إضافة منطق المشاركة
                        if (navigator.share) {
                          navigator.share({
                            title: article.title,
                            url: window.location.origin + `/article/${article.slug || article.id}`
                          });
                        }
                      }}
                    />
                  ))}
                </div>
              ) : (
                // عرض سطح المكتب - الشبكة العادية
                <div className={viewMode === 'grid' 
                  ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6' 
                  : 'space-y-4'
                }>
                  {articles.map((article) => (
                    <ArticleCard
                      key={article.id}
                      article={{
                        ...article,
                        category: article.category || (article.category_id ? {
                          id: article.category_id.toString(),
                          name: article.category_name || getCategoryName(article.category_id),
                          slug: '',
                          color: getCategoryColor(article.category_id),
                          icon: null
                        } : null),
                        author: article.author || (article.author_name ? {
                          id: article.author_id || '',
                          name: article.author_name,
                          email: ''
                        } : null),
                        views: article.views || article.views_count || 0,
                        featured: article.featured || article.is_featured || false,
                        breaking: article.breaking || article.is_breaking || false
                      }}
                      viewMode={viewMode}
                    />
                  ))}
                </div>
              )}

              {/* Load More */}
              {hasMore && (
                <div className="mt-12 text-center">
                  <button
                    onClick={loadMore}
                    disabled={loading || isLoadingMore}
                    className="inline-flex items-center gap-2 px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading || isLoadingMore ? (
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