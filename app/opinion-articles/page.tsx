'use client';

import { useState, useEffect, useCallback } from 'react';
import { useDarkModeContext } from '@/contexts/DarkModeContext';
import Link from 'next/link';
import Image from 'next/image';
import { Eye, Clock, Calendar, User, Filter, Search, ChevronDown, MessageCircle, Heart, Bookmark, Share2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Article {
  id: string;
  title: string;
  excerpt: string;
  featured_image: string | null;
  published_at: string;
  views: number;
  reading_time: number;
  article_type: string;
  author_name: string;
  author_specialty: string;
  category: {
    id: string;
    name: string;
    color: string;
  } | null;
  likes: number;
  comments_count: number;
  saves: number;
}

interface Category {
  id: string;
  name: string;
  color: string;
  icon: string;
}

const ITEMS_PER_PAGE = 12;

export default function OpinionArticlesPage() {
  const { darkMode } = useDarkModeContext();
  const [articles, setArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'published_at' | 'views' | 'likes'>('published_at');
  const [searchQuery, setSearchQuery] = useState('');
  const [statsLoading, setStatsLoading] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    thisWeek: 0,
    thisMonth: 0
  });

  // جلب التصنيفات
  const fetchCategories = useCallback(async () => {
    try {
      const response = await fetch('/api/categories');
      if (response.ok) {
        const data = await response.json();
        setCategories(data.categories || []);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  }, []);

  // جلب الإحصائيات
  const fetchStats = useCallback(async () => {
    try {
      setStatsLoading(true);
      const params = new URLSearchParams({
        status: 'published'
      });

      if (selectedCategory) {
        params.append('category_id', selectedCategory);
      }

      const response = await fetch(`/api/opinion-articles?${params}&limit=1000`);
      if (response.ok) {
        const data = await response.json();
        const allArticles = data.articles || [];
        
        const now = new Date();
        const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

        const thisWeek = allArticles.filter((article: Article) => 
          new Date(article.published_at) >= oneWeekAgo
        ).length;

        const thisMonth = allArticles.filter((article: Article) => 
          new Date(article.published_at) >= oneMonthAgo
        ).length;

        setStats({
          total: allArticles.length,
          thisWeek,
          thisMonth
        });
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setStatsLoading(false);
    }
  }, [selectedCategory]);

  // جلب مقالات الرأي
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
        sortBy: sortBy,
        order: 'desc'
      });

      if (selectedCategory) {
        params.append('category_id', selectedCategory);
      }

      if (searchQuery.trim()) {
        params.append('search', searchQuery.trim());
      }

      const response = await fetch(`/api/opinion-articles?${params}`);
      if (!response.ok) throw new Error('Failed to fetch opinion articles');
      
      const data = await response.json();
      const fetchedArticles = data.articles || [];
      
      if (reset) {
        setArticles(fetchedArticles);
        setPage(1);
      } else {
        setArticles(prev => [...prev, ...fetchedArticles]);
      }
      
      setHasMore(fetchedArticles.length === ITEMS_PER_PAGE);
    } catch (error) {
      console.error('Error fetching opinion articles:', error);
      setError('فشل في تحميل مقالات الرأي');
    } finally {
      setLoading(false);
      setIsLoadingMore(false);
    }
  }, [page, selectedCategory, sortBy, searchQuery]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    fetchArticles(true);
  }, [selectedCategory, sortBy, searchQuery]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const loadMore = () => {
    if (!loading && !isLoadingMore && hasMore) {
      setPage(prev => prev + 1);
      fetchArticles(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchArticles(true);
  };

  const getCategoryName = (categoryId: string) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category?.name || 'غير مصنف';
  };

  const getCategoryColor = (categoryId: string) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category?.color || '#3B82F6';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <>
      <div className={cn(
        "min-h-screen transition-colors duration-300",
        darkMode ? "bg-gray-900" : "bg-gray-50"
      )}>
        {/* Header */}
        <div className={cn(
          "border-b transition-colors duration-300",
          darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
        )}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="text-center">
              <h1 className={cn(
                "text-4xl font-bold mb-4",
                darkMode ? "text-white" : "text-gray-900"
              )}>
                مقالات الرأي
              </h1>
              <p className={cn(
                "text-xl max-w-2xl mx-auto",
                darkMode ? "text-gray-300" : "text-gray-600"
              )}>
                آراء وتحليلات من كتاب وخبراء مختصين في مختلف المجالات
              </p>
            </div>

            {/* الإحصائيات */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className={cn(
                "text-center p-6 rounded-lg",
                darkMode ? "bg-gray-700" : "bg-blue-50"
              )}>
                <div className={cn(
                  "text-3xl font-bold",
                  darkMode ? "text-blue-400" : "text-blue-600"
                )}>
                  {statsLoading ? '...' : stats.total}
                </div>
                <div className={cn(
                  "text-sm",
                  darkMode ? "text-gray-300" : "text-gray-600"
                )}>
                  إجمالي المقالات
                </div>
              </div>
              
              <div className={cn(
                "text-center p-6 rounded-lg",
                darkMode ? "bg-gray-700" : "bg-green-50"
              )}>
                <div className={cn(
                  "text-3xl font-bold",
                  darkMode ? "text-green-400" : "text-green-600"
                )}>
                  {statsLoading ? '...' : stats.thisWeek}
                </div>
                <div className={cn(
                  "text-sm",
                  darkMode ? "text-gray-300" : "text-gray-600"
                )}>
                  هذا الأسبوع
                </div>
              </div>
              
              <div className={cn(
                "text-center p-6 rounded-lg",
                darkMode ? "bg-gray-700" : "bg-purple-50"
              )}>
                <div className={cn(
                  "text-3xl font-bold",
                  darkMode ? "text-purple-400" : "text-purple-600"
                )}>
                  {statsLoading ? '...' : stats.thisMonth}
                </div>
                <div className={cn(
                  "text-sm",
                  darkMode ? "text-gray-300" : "text-gray-600"
                )}>
                  هذا الشهر
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* الفلاتر والبحث */}
        <div className={cn(
          "border-b transition-colors duration-300",
          darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
        )}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
              {/* البحث */}
              <form onSubmit={handleSearch} className="flex-1 max-w-md">
                <div className="relative">
                  <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="البحث في مقالات الرأي..."
                    className={cn(
                      "w-full pr-10 pl-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent",
                      darkMode 
                        ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400" 
                        : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                    )}
                  />
                </div>
              </form>

              <div className="flex gap-4 items-center">
                {/* فلتر التصنيفات */}
                <div className="relative">
                  <select
                    value={selectedCategory || ''}
                    onChange={(e) => setSelectedCategory(e.target.value || null)}
                    className={cn(
                      "appearance-none pr-10 pl-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent",
                      darkMode 
                        ? "bg-gray-700 border-gray-600 text-white" 
                        : "bg-white border-gray-300 text-gray-900"
                    )}
                  >
                    <option value="">جميع التصنيفات</option>
                    {categories.map(category => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>

                {/* ترتيب */}
                <div className="relative">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as 'published_at' | 'views' | 'likes')}
                    className={cn(
                      "appearance-none pr-10 pl-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent",
                      darkMode 
                        ? "bg-gray-700 border-gray-600 text-white" 
                        : "bg-white border-gray-300 text-gray-900"
                    )}
                  >
                    <option value="published_at">الأحدث</option>
                    <option value="views">الأكثر مشاهدة</option>
                    <option value="likes">الأكثر إعجاباً</option>
                  </select>
                  <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* المحتوى */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {error && (
            <div className="mb-8 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className={cn(
                  "animate-pulse rounded-lg overflow-hidden",
                  darkMode ? "bg-gray-800" : "bg-white"
                )}>
                  <div className="h-48 bg-gray-300"></div>
                  <div className="p-6 space-y-4">
                    <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                    <div className="h-4 bg-gray-300 rounded w-2/3"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <>
              {articles.length === 0 ? (
                <div className="text-center py-12">
                  <p className={cn(
                    "text-xl",
                    darkMode ? "text-gray-400" : "text-gray-600"
                  )}>
                    لا توجد مقالات رأي متاحة حالياً
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {articles.map((article) => (
                    <Link 
                      key={article.id} 
                      href={`/article/${article.id}`}
                      className={cn(
                        "group block rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300",
                        darkMode ? "bg-gray-800 hover:bg-gray-750" : "bg-white hover:shadow-xl"
                      )}
                    >
                      {/* صورة المقال */}
                      <div className="relative h-48 overflow-hidden">
                        {article.featured_image ? (
                          <Image
                            src={article.featured_image}
                            alt={article.title}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className={cn(
                            "w-full h-full flex items-center justify-center",
                            darkMode ? "bg-gray-700" : "bg-gray-200"
                          )}>
                            <User className="w-12 h-12 text-gray-400" />
                          </div>
                        )}
                        
                        {/* نوع المقال */}
                        <div className="absolute top-4 right-4">
                          <span className={cn(
                            "px-3 py-1 rounded-full text-xs font-medium",
                            article.article_type === 'opinion' 
                              ? "bg-purple-600 text-white"
                              : article.article_type === 'analysis'
                              ? "bg-blue-600 text-white"
                              : "bg-green-600 text-white"
                          )}>
                            {article.article_type === 'opinion' ? 'رأي' :
                             article.article_type === 'analysis' ? 'تحليل' : 'مقابلة'}
                          </span>
                        </div>

                        {/* التصنيف */}
                        {article.category && (
                          <div className="absolute bottom-4 right-4">
                            <span 
                              className="px-2 py-1 rounded text-xs font-medium text-white"
                              style={{ backgroundColor: article.category.color }}
                            >
                              {article.category.name}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* محتوى المقال */}
                      <div className="p-6">
                        <h3 className={cn(
                          "text-lg font-bold mb-3 line-clamp-2 group-hover:text-blue-600 transition-colors",
                          darkMode ? "text-white" : "text-gray-900"
                        )}>
                          {article.title}
                        </h3>

                        <p className={cn(
                          "text-sm mb-4 line-clamp-3",
                          darkMode ? "text-gray-300" : "text-gray-600"
                        )}>
                          {article.excerpt}
                        </p>

                        {/* معلومات الكاتب */}
                        <div className="flex items-center gap-2 mb-4">
                          <User className="w-4 h-4 text-gray-400" />
                          <div className="flex-1">
                            <div className={cn(
                              "text-sm font-medium",
                              darkMode ? "text-gray-200" : "text-gray-800"
                            )}>
                              {article.author_name}
                            </div>
                            {article.author_specialty && (
                              <div className="text-xs text-gray-400">
                                {article.author_specialty}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* إحصائيات */}
                        <div className="flex items-center justify-between text-xs text-gray-400">
                          <div className="flex items-center gap-4">
                            <span className="flex items-center gap-1">
                              <Eye className="w-3 h-3" />
                              {article.views.toLocaleString()}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {article.reading_time} دقائق
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {formatDate(article.published_at)}
                          </div>
                        </div>

                        {/* تفاعل */}
                        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                          <div className="flex items-center gap-4 text-xs text-gray-400">
                            <span className="flex items-center gap-1">
                              <Heart className="w-3 h-3" />
                              {article.likes}
                            </span>
                            <span className="flex items-center gap-1">
                              <MessageCircle className="w-3 h-3" />
                              {article.comments_count}
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <button className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700">
                              <Bookmark className="w-3 h-3" />
                            </button>
                            <button className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700">
                              <Share2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}

              {/* زر تحميل المزيد */}
              {hasMore && !loading && articles.length > 0 && (
                <div className="text-center mt-8">
                  <button
                    onClick={loadMore}
                    disabled={isLoadingMore}
                    className={cn(
                      "px-8 py-3 rounded-lg font-medium transition-colors",
                      darkMode 
                        ? "bg-blue-600 hover:bg-blue-700 text-white" 
                        : "bg-blue-600 hover:bg-blue-700 text-white",
                      isLoadingMore && "opacity-50 cursor-not-allowed"
                    )}
                  >
                    {isLoadingMore ? 'جاري التحميل...' : 'تحميل المزيد'}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}