"use client";

import { useCallback, useEffect, useState, useMemo } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { 
  Newspaper, Grid3X3, List, Loader2, Eye, Clock, 
  AlertTriangle, ArrowLeft, Heart, Bookmark 
} from "lucide-react";
import CloudImage from "@/components/ui/CloudImage";
import ArticleViews from "@/components/ui/ArticleViews";
import { formatDateNumeric } from "@/lib/date-utils";
import { getArticleLink } from "@/lib/utils";
import { useDarkModeContext } from "@/contexts/DarkModeContext";

// Dynamic imports للمكونات الثقيلة
const OldStyleNewsBlock = dynamic(() => import("@/components/old-style/OldStyleNewsBlock"), {
  loading: () => <div className="animate-pulse h-96 bg-gray-200 dark:bg-gray-700 rounded-xl" />
});

const SmartContentNewsCard = dynamic(() => import("@/components/mobile/SmartContentNewsCard"), {
  loading: () => <div className="animate-pulse h-80 bg-gray-200 dark:bg-gray-700 rounded-xl" />
});

interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  featured_image?: string;
  image?: string;
  author_name?: string;
  category?: any;
  category_name?: string;
  views?: number;
  views_count?: number;
  published_at?: string;
  created_at: string;
  is_breaking?: boolean;
  breaking?: boolean;
}

interface Category {
  id: number;
  name: string;
  name_ar: string;
  slug: string;
  color?: string | null;
}

interface NewsStats {
  totalArticles: number;
  totalViews: number;
  totalLikes: number;
  totalSaves: number;
}

export function NewsPageContent({ 
  initialCategories, 
  initialArticles,
  initialTotalCount 
}: {
  initialCategories: Category[];
  initialArticles: Article[];
  initialTotalCount: number;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { darkMode } = useDarkModeContext();
  
  const [articles, setArticles] = useState<Article[]>(initialArticles);
  const [categories] = useState<Category[]>(initialCategories);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(
    searchParams.get('category') ? parseInt(searchParams.get('category')!) : null
  );
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(initialArticles.length === 20);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState<"newest" | "views">("newest");
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<NewsStats>({
    totalArticles: initialTotalCount,
    totalViews: initialArticles.reduce((sum, a) => sum + (a.views || a.views_count || 0), 0),
    totalLikes: 0,
    totalSaves: 0
  });
  const [isMobile, setIsMobile] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const ITEMS_PER_PAGE = 20;

  // Fetch articles helper with optional override to prevent stale closures
  const fetchArticles = useCallback(async (options?: { reset?: boolean; pageOverride?: number }) => {
    const reset = options?.reset === true;
    const effectivePage = typeof options?.pageOverride === 'number' ? options!.pageOverride : (reset ? 1 : page);
    try {
      if (reset) {
        setLoading(true);
        setPage(1);
      } else {
        setIsLoadingMore(true);
      }

      const params = new URLSearchParams({
        status: "published",
        limit: ITEMS_PER_PAGE.toString(),
        page: effectivePage.toString(),
        sort: sortBy === "views" ? "views" : "published_at",
        order: "desc",
      });
      // اكسر الكاش عند الجلب الأول لضمان ظهور الأخبار الجديدة
      if (reset || effectivePage === 1) params.append("_", Date.now().toString());

      // تقليل الحقول المسترجعة
      params.append("compact", "true");
      params.append(
        "fields",
        [
          "id",
          "title",
          "slug",
          "featured_image",
          "views",
          "published_at",
          "created_at",
          "breaking",
        ].join(",")
      );

      if (selectedCategory) {
        params.append("category_id", selectedCategory.toString());
      }

      const response = await fetch(`/api/news/optimized?${params}`, {
        cache: "no-store",
      });

      if (!response.ok) throw new Error("Failed to fetch articles");

      const data = await response.json();
      const newArticles: Article[] = data.articles || data.data || [];

      if (reset) {
        setArticles(newArticles);
        // تحديث الإحصائيات بالعدد الإجمالي من الـ API إن توفر
        if (typeof data.total === "number") {
          setStats(prev => ({
            ...prev,
            totalArticles: data.total,
            totalViews: newArticles.reduce((sum: number, a: Article) => sum + (a.views || a.views_count || 0), 0)
          }));
        }
      } else {
        setArticles(prev => [...prev, ...newArticles]);
      }

      // استخدم الإجمالي من الـ API لتحديد وجود المزيد بدقة
      const totalFromApi = typeof data.total === 'number' ? data.total : undefined;
      if (totalFromApi !== undefined) {
        setHasMore(effectivePage * ITEMS_PER_PAGE < totalFromApi);
      } else {
        setHasMore(newArticles.length === ITEMS_PER_PAGE);
      }
    } catch (error) {
      console.error("Error fetching articles:", error);
      setError("فشل في تحميل المقالات");
    } finally {
      setLoading(false);
      setIsLoadingMore(false);
    }
  }, [page, selectedCategory, sortBy]);

  // تحديث URL عند تغيير التصنيف
  useEffect(() => {
    const params = new URLSearchParams(searchParams);
    if (selectedCategory) {
      params.set('category', selectedCategory.toString());
    } else {
      params.delete('category');
    }
    router.replace(`/news?${params.toString()}`);
  }, [selectedCategory, router, searchParams]);

  // كشف الموبايل
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // إعادة جلب الصفحة الأولى مباشرة بعد التحميل لضمان ظهور الأخبار الجديدة فوراً
  useEffect(() => {
    fetchArticles({ reset: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // إعادة جلب المقالات عند تغيير التصنيف أو الترتيب
  useEffect(() => {
    if (selectedCategory !== null || sortBy !== "newest") {
      fetchArticles({ reset: true });
    }
  }, [selectedCategory, sortBy, fetchArticles]);

  const loadMore = useCallback(() => {
    if (!loading && !isLoadingMore && hasMore) {
      const next = page + 1;
      setPage(next);
      fetchArticles({ reset: false, pageOverride: next });
    }
  }, [loading, isLoadingMore, hasMore, page, fetchArticles]);

  const getCategoryName = useMemo(() => 
    (categoryId: number) => {
      const category = categories.find(cat => cat.id === categoryId);
      return category?.name || category?.name_ar || "غير مصنف";
    }, [categories]
  );

  // NewsCard مبسط
  const NewsCard = ({ news }: { news: Article }) => {
    const isBreaking = Boolean(news.breaking || news.is_breaking);
    
    return (
      <Link href={getArticleLink(news)} className="block group">
        <article className="h-full bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 border border-gray-200 dark:border-gray-700">
          <div className="relative aspect-[16/9] overflow-hidden">
            <CloudImage
              src={news.featured_image || news.image || null}
              alt={news.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            />
            {isBreaking && (
              <div className="absolute top-3 right-3 bg-red-600 text-white px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1">
                <span className="animate-pulse">⚡</span>
                عاجل
              </div>
            )}
          </div>
          
          <div className="p-4">
            <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-3 mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              {news.title}
            </h3>
            
            <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {formatDateNumeric(news.published_at || news.created_at)}
              </span>
              <ArticleViews count={news.views || news.views_count || 0} />
            </div>
          </div>
        </article>
      </Link>
    );
  };

  return (
    <>
      {/* إحصائيات الأخبار */}
      {stats && (
        <div className="max-w-7xl mx-auto px-4 md:px-6 mb-8">
          <div className="flex justify-center">
            <div className="inline-flex flex-wrap justify-center items-center gap-4 md:gap-6 rounded-2xl px-6 py-3 bg-white dark:bg-gray-800 shadow-sm">
              <div className="text-center px-2">
                <div className="flex items-center gap-2">
                  <Newspaper className="w-5 h-5 text-blue-600" />
                  <div className="text-2xl font-bold">{stats.totalArticles}</div>
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">خبر</div>
              </div>
              
              <div className="w-px h-10 bg-gray-300 dark:bg-gray-600 hidden md:block" />
              
              <div className="text-center px-2">
                <div className="flex items-center gap-2">
                  <Eye className="w-5 h-5 text-blue-600" />
                  <div className="text-2xl font-bold">
                    {stats.totalViews > 999 ? `${(stats.totalViews / 1000).toFixed(1)}k` : stats.totalViews}
                  </div>
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">مشاهدة</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Categories Filter */}
      <div className="sticky top-0 z-40 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="flex items-center gap-2 py-4 overflow-x-auto scrollbar-hide">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
                selectedCategory === null
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
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
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                }`}
              >
                {category.name || category.name_ar}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
        {/* Controls */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-2">
              <Newspaper className="w-5 h-5 text-blue-600" />
              <span className="text-gray-700 dark:text-gray-300 font-medium">
                {loading && page === 1 ? "جاري التحميل..." : `${articles.length} خبر`}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as "newest" | "views")}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm"
              >
                <option value="newest">الأحدث</option>
                <option value="views">الأكثر مشاهدة</option>
              </select>

              {!isMobile && (
                <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`p-2 rounded ${viewMode === "grid" ? "bg-white dark:bg-gray-600 shadow-sm" : ""}`}
                  >
                    <Grid3X3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={`p-2 rounded ${viewMode === "list" ? "bg-white dark:bg-gray-600 shadow-sm" : ""}`}
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
              <AlertTriangle className="w-6 h-6 text-red-600" />
              <p className="text-red-700 dark:text-red-300">{error}</p>
            </div>
          </div>
        )}

        {/* Articles */}
        {loading && page === 1 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
            <p className="text-gray-600 dark:text-gray-400">جاري تحميل الأخبار...</p>
          </div>
        ) : articles.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-12 text-center">
            <Newspaper className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
              لا توجد أخبار
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              {selectedCategory ? `لا توجد أخبار في قسم ${getCategoryName(selectedCategory)}` : "لا توجد أخبار متاحة حالياً"}
            </p>
          </div>
        ) : (
          <>
            {isMobile ? (
              <OldStyleNewsBlock
                articles={articles as any}
                showTitle={false}
                columns={1}
                showExcerpt={false}
              />
            ) : (
              <div className={viewMode === "grid" 
                ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" 
                : "space-y-4"
              }>
                {articles.map(article => (
                  <NewsCard key={article.id} news={article} />
                ))}
              </div>
            )}

            {/* Load More */}
            {hasMore && (
              <div className="mt-12 text-center">
                <button
                  onClick={loadMore}
                  disabled={loading || isLoadingMore}
                  className="inline-flex items-center gap-2 px-8 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {isLoadingMore ? (
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
    </>
  );
}
