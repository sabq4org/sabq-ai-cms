"use client";

import Footer from "@/components/Footer";
import OpinionArticleCard from "@/components/mobile/OpinionArticleCard";
import { useDarkModeContext } from "@/contexts/DarkModeContext";
import { cn } from "@/lib/utils";
import {
  Calendar,
  ChevronDown,
  Eye,
  Grid3X3,
  Loader2,
  PenTool,
  Search,
  TrendingUp,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";

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
  author_id?: string;
  author_avatar?: string;
  author_specialty?: string;
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
  const [sortBy, setSortBy] = useState<"published_at" | "views" | "likes">(
    "published_at"
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [statsLoading, setStatsLoading] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    thisWeek: 0,
    thisMonth: 0,
    totalViews: 0,
  });

  // جلب التصنيفات
  const fetchCategories = useCallback(async () => {
    try {
      const response = await fetch("/api/categories");
      if (response.ok) {
        const data = await response.json();
        setCategories(data.categories || []);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  }, []);

  // جلب الإحصائيات
  const fetchStats = useCallback(async () => {
    try {
      setStatsLoading(true);
      const params = new URLSearchParams({
        status: "published",
      });

      if (selectedCategory) {
        params.append("category_id", selectedCategory);
      }

      const response = await fetch(
        `/api/opinion-articles?${params}&limit=1000`
      );
      if (response.ok) {
        const data = await response.json();
        const allArticles = data.articles || [];
        
        const now = new Date();
        const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

        const thisWeek = allArticles.filter(
          (article: Article) => new Date(article.published_at) >= oneWeekAgo
        ).length;

        const thisMonth = allArticles.filter(
          (article: Article) => new Date(article.published_at) >= oneMonthAgo
        ).length;

        const totalViews = allArticles.reduce(
          (sum: number, article: Article) => sum + (article.views || 0), 
          0
        );

        setStats({
          total: allArticles.length,
          thisWeek,
          thisMonth,
          totalViews,
        });
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setStatsLoading(false);
    }
  }, [selectedCategory]);

  // جلب مقالات الرأي
  const fetchArticles = useCallback(
    async (reset = false) => {
    try {
      if (reset) {
        setLoading(true);
      } else {
        setIsLoadingMore(true);
      }
      setError(null);
      
      const currentPage = reset ? 1 : page;
      const params = new URLSearchParams({
          status: "published",
        limit: ITEMS_PER_PAGE.toString(),
        page: currentPage.toString(),
        sortBy: sortBy,
          order: "desc",
      });

      if (selectedCategory) {
          params.append("category_id", selectedCategory);
      }

      if (searchQuery.trim()) {
          params.append("search", searchQuery.trim());
      }

      const response = await fetch(`/api/opinion-articles?${params}`);
        if (!response.ok) throw new Error("Failed to fetch opinion articles");
      
      const data = await response.json();
      const fetchedArticles = data.articles || [];
      
      if (reset) {
        setArticles(fetchedArticles);
        setPage(1);
      } else {
          setArticles((prev) => [...prev, ...fetchedArticles]);
      }
      
      setHasMore(fetchedArticles.length === ITEMS_PER_PAGE);
    } catch (error) {
        console.error("Error fetching opinion articles:", error);
        setError("فشل في تحميل مقالات الرأي");
    } finally {
      setLoading(false);
      setIsLoadingMore(false);
    }
    },
    [page, selectedCategory, sortBy, searchQuery]
  );

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
      setPage((prev) => prev + 1);
      fetchArticles(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchArticles(true);
  };

  const getCategoryName = (categoryId: string) => {
    const category = categories.find((cat) => cat.id === categoryId);
    return category?.name || "غير مصنف";
  };

  const getCategoryColor = (categoryId: string) => {
    const category = categories.find((cat) => cat.id === categoryId);
    return category?.color || "#3B82F6";
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("ar-SA", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Hero Section */}
        <section className="relative py-16 bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full blur-3xl bg-purple-200/30 dark:bg-purple-900/20" />
            <div className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full blur-3xl bg-blue-200/30 dark:bg-blue-900/20" />
          </div>

          <div className="relative max-w-7xl mx-auto px-4 md:px-6">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 mb-6 rounded-2xl bg-gradient-to-br from-purple-500 to-blue-600 shadow-2xl">
                <PenTool className="w-10 h-10 text-white" />
              </div>

              <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900 dark:text-white">
                مقالات الرأي
              </h1>

              <p className="text-xl text-gray-600 dark:text-gray-300 mb-2">
                آراء وتحليلات من كتاب وخبراء مختصين في مختلف المجالات
              </p>

              {/* إحصائيات مقالات الرأي - نفس تصميم قسم الأخبار */}
              {stats && !statsLoading && (
                <div className="mt-6 inline-flex flex-wrap justify-center items-center gap-4 md:gap-6 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl px-4 md:px-6 py-3 shadow-lg">
                  <div className="text-center px-2">
                    <div className="flex items-center gap-2">
                      <PenTool className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total || 0}</div>
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">مقال</div>
            </div>

                  <div className="w-px h-10 bg-gray-300 dark:bg-gray-600 hidden md:block"></div>
                  
                  <div className="text-center px-2">
                    <div className="flex items-center gap-2">
                      <Eye className="w-5 h-5 text-green-600 dark:text-green-400" />
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">
                        {stats.totalViews > 999 ? `${(stats.totalViews / 1000).toFixed(1)}k` : (stats.totalViews || 0)}
                </div>
              </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">مشاهدة</div>
                  </div>
                  
                  <div className="w-px h-10 bg-gray-300 dark:bg-gray-600 hidden md:block"></div>
                  
                  <div className="text-center px-2">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.thisWeek || 0}</div>
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">هذا الأسبوع</div>
                  </div>
                  
                  <div className="w-px h-10 bg-gray-300 dark:bg-gray-600 hidden md:block"></div>
                  
                  <div className="text-center px-2">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.thisMonth || 0}</div>
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">هذا الشهر</div>
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

        {/* الفلاتر والبحث */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-lg rounded-2xl border border-gray-200/50 dark:border-gray-700/50 p-6 shadow-lg">
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
                    className="w-full pr-10 pl-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200"
                  />
                </div>
              </form>

              <div className="flex gap-4 items-center">
                {/* فلتر التصنيفات */}
                <div className="relative">
                  <select
                    value={selectedCategory || ""}
                    onChange={(e) =>
                      setSelectedCategory(e.target.value || null)
                    }
                    className="appearance-none pr-10 pl-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900 dark:text-white transition-all duration-200"
                  >
                    <option value="">جميع التصنيفات</option>
                    {categories.map((category) => (
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
                    onChange={(e) =>
                      setSortBy(
                        e.target.value as "published_at" | "views" | "likes"
                      )
                    }
                    className="appearance-none pr-10 pl-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900 dark:text-white transition-all duration-200"
                  >
                    <option value="published_at">الأحدث</option>
                    <option value="views">الأكثر مشاهدة</option>
                    <option value="likes">الأكثر إعجاباً</option>
                  </select>
                  <TrendingUp className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
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
                <div
                  key={i}
                  className={cn(
                  "animate-pulse rounded-lg overflow-hidden",
                  darkMode ? "bg-gray-800" : "bg-white"
                  )}
                >
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
                  <p
                    className={cn(
                    "text-xl",
                    darkMode ? "text-gray-400" : "text-gray-600"
                    )}
                  >
                    لا توجد مقالات رأي متاحة حالياً
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {articles.map((article) => (
                    <OpinionArticleCard
                      key={article.id} 
                      article={{
                        id: article.id,
                        title: article.title,
                        excerpt: article.excerpt,
                        featured_image: article.featured_image,
                        published_at: article.published_at,
                        views: article.views,
                        reading_time: article.reading_time,
                        article_type: article.article_type,
                        author_name: article.author_name,
                        author: article.author_name
                          ? {
                              id: article.author_id || "",
                              name: article.author_name,
                              avatar: article.author_avatar,
                              specialty: article.author_specialty,
                            }
                          : null,
                        category: article.category
                          ? {
                              id: article.category.id,
                              name: article.category.name,
                              color: article.category.color,
                            }
                          : null,
                        likes: article.likes,
                        comments_count: article.comments_count,
                        saves: article.saves,
                      }}
                    />
                  ))}
                </div>
              )}

              {/* زر تحميل المزيد */}
              {hasMore && !loading && articles.length > 0 && (
                <div className="text-center mt-12">
                  <button
                    onClick={loadMore}
                    disabled={isLoadingMore}
                    className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-xl font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                  >
                    {isLoadingMore ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        جاري التحميل...
                      </>
                    ) : (
                      <>
                        عرض المزيد
                        <Grid3X3 className="w-5 h-5" />
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
