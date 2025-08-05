"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Calendar,
  Clock,
  Eye,
  RefreshCw,
  Sparkles,
  Star,
  TrendingUp,
  User,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

// تعريف الواجهات
interface AngleArticle {
  id: string;
  title: string;
  excerpt: string;
  slug: string;
  coverImage?: string;
  readingTime: number;
  publishDate: string;
  views: number;
  tags: string[];
  sentiment?: string;
  createdAt: string;
  isFeatured: boolean;
  isRecent: boolean;
  link: string;

  angle: {
    id: string;
    title: string;
    slug: string;
    icon?: string;
    themeColor?: string;
    description?: string;
  };

  author: {
    id: string;
    name: string;
    avatar?: string;
    email?: string;
  };
}

interface ApiResponse {
  success: boolean;
  articles: AngleArticle[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    limit: number;
    offset: number;
  };
  stats: {
    totalArticles: number;
    angleStats: Record<string, any>;
    featuredCount: number;
    recentCount: number;
  };
  filters: {
    sortBy: string;
    category?: string;
    featured: boolean;
  };
}

interface EnhancedMuqtarabBlockProps {
  className?: string;
  showHeader?: boolean;
  limit?: number;
  showPagination?: boolean;
  showFilters?: boolean;
  viewMode?: "grid" | "list";
}

export default function EnhancedMuqtarabBlock({
  className,
  showHeader = true,
  limit = 8,
  showPagination = true,
  showFilters = true,
  viewMode: initialViewMode = "grid",
}: EnhancedMuqtarabBlockProps) {
  // State management
  const [articles, setArticles] = useState<AngleArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [apiData, setApiData] = useState<ApiResponse | null>(null);

  // Filter and pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState<"newest" | "popular" | "featured">(
    "newest"
  );
  const [selectedAngle, setSelectedAngle] = useState<string | null>(null);
  const [showFeaturedOnly, setShowFeaturedOnly] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">(initialViewMode);

  // خيارات الترتيب
  const sortOptions = [
    { value: "newest", label: "الأحدث", icon: Calendar },
    { value: "popular", label: "الأكثر مشاهدة", icon: TrendingUp },
    { value: "featured", label: "المميز", icon: Star },
  ];

  // جلب البيانات
  const fetchArticles = useCallback(
    async (refresh = false) => {
      if (refresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      try {
        const params = new URLSearchParams();
        params.set("page", currentPage.toString());
        params.set("limit", limit.toString());
        params.set("sortBy", sortBy);

        if (selectedAngle) {
          params.set("category", selectedAngle);
        }

        if (showFeaturedOnly) {
          params.set("featured", "true");
        }

        console.log("🔍 [Enhanced Muqtarab] جاري جلب المقالات...", {
          page: currentPage,
          limit,
          sortBy,
          selectedAngle,
          showFeaturedOnly,
        });

        const response = await fetch(
          `/api/muqtarab/all-articles?${params.toString()}`,
          {
            cache: "no-store",
            headers: {
              "Cache-Control": "no-cache",
            },
          }
        );

        if (response.ok) {
          const data: ApiResponse = await response.json();
          if (data.success) {
            console.log("✅ [Enhanced Muqtarab] تم جلب المقالات:", {
              count: data.articles.length,
              total: data.stats.totalArticles,
              featured: data.stats.featuredCount,
              recent: data.stats.recentCount,
            });

            setArticles(data.articles);
            setApiData(data);
          } else {
            console.warn("❌ [Enhanced Muqtarab] فشل في جلب المقالات");
            setArticles([]);
          }
        } else {
          console.error(
            "❌ [Enhanced Muqtarab] خطأ في الخادم:",
            response.status
          );
          setArticles([]);
        }
      } catch (error) {
        console.error("❌ [Enhanced Muqtarab] خطأ في الشبكة:", error);
        setArticles([]);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [currentPage, limit, sortBy, selectedAngle, showFeaturedOnly]
  );

  // تأثيرات جانبية
  useEffect(() => {
    fetchArticles();
  }, [fetchArticles]);

  // إعادة تعيين الصفحة عند تغيير الفلاتر
  useEffect(() => {
    if (currentPage !== 1) {
      setCurrentPage(1);
    }
  }, [sortBy, selectedAngle, showFeaturedOnly]);

  // معالجات الأحداث
  const handleRefresh = () => {
    fetchArticles(true);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleSortChange = (newSortBy: "newest" | "popular" | "featured") => {
    setSortBy(newSortBy);
  };

  const handleAngleFilter = (angleSlug: string | null) => {
    setSelectedAngle(angleSlug);
  };

  const handleFeaturedToggle = () => {
    setShowFeaturedOnly(!showFeaturedOnly);
  };

  // مكون تحميل
  const LoadingSkeleton = () => (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: limit }).map((_, i) => (
        <Card key={i} className="overflow-hidden">
          <Skeleton className="h-48 w-full" />
          <CardContent className="p-4 space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <div className="flex items-center justify-between">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-3 w-16" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  // مكون البطاقة المميزة الكبيرة
  const FeaturedArticleCard = ({ article }: { article: AngleArticle }) => {
    const themeColor = article.angle.themeColor || "#6366f1";

    return (
      <Card className="group overflow-hidden hover:shadow-2xl transition-all duration-500 border-0 shadow-lg bg-white dark:bg-gray-800/80 backdrop-blur-sm">
        <div className="grid md:grid-cols-2 gap-0">
          {/* صورة المقال */}
          <div className="relative h-64 md:h-80 overflow-hidden">
            <Image
              src={article.coverImage || "/images/default-article.jpg"}
              alt={article.title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-110"
              sizes="(max-width: 768px) 100vw, 50vw"
            />

            {/* تدرج للنص */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

            {/* شارة مميز كبيرة - يسار */}
            <div className="absolute top-4 left-4">
              <Badge className="bg-gradient-to-r from-yellow-500 to-amber-600 text-white px-3 py-1.5 text-sm font-bold shadow-lg">
                <Star className="w-4 h-4 mr-1.5" />
                مقال مميز
              </Badge>
            </div>

            {/* ليبل الزاوية بلونها - فوق يمين */}
            <div
              className="absolute top-4 right-4 px-3 py-1.5 rounded-full text-white font-bold text-sm shadow-lg"
              style={{
                backgroundColor: themeColor,
                boxShadow: `0 4px 15px ${themeColor}40`,
              }}
            >
              {article.angle.icon && (
                <span className="mr-1.5">{article.angle.icon}</span>
              )}
              {article.angle.title}
            </div>
          </div>

          {/* محتوى البطاقة */}
          <div className="p-6 md:p-8 flex flex-col justify-center">
            {/* عنوان المقال */}
            <Link
              href={article.link}
              className="block group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors"
            >
              <h2 className="text-2xl md:text-3xl font-bold leading-tight mb-4 line-clamp-3">
                {article.title}
              </h2>
            </Link>

            {/* مقتطف المقال */}
            <p className="text-gray-600 dark:text-gray-300 text-lg leading-relaxed mb-6 line-clamp-3">
              {article.excerpt}
            </p>

            {/* معلومات شاملة في سطر واحد */}
            <div className="flex items-center justify-between flex-wrap gap-4 mb-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
              {/* معلومات المؤلف */}
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                  {article.author.avatar ? (
                    <Image
                      src={article.author.avatar}
                      alt={article.author.name}
                      width={32}
                      height={32}
                      className="rounded-full"
                    />
                  ) : (
                    <User className="w-4 h-4 text-gray-500" />
                  )}
                </div>
                <span className="font-medium text-gray-900 dark:text-white text-sm">
                  {article.author.name}
                </span>
              </div>

              {/* تاريخ النشر */}
              <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                <Calendar className="w-4 h-4" />
                <time className="text-sm">
                  {new Date(article.publishDate).toLocaleDateString("ar-SA", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </time>
              </div>

              {/* المشاهدات */}
              <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                <Eye className="w-4 h-4" />
                <span className="text-sm font-medium">
                  {article.views.toLocaleString()} مشاهدة
                </span>
              </div>

              {/* وقت القراءة */}
              <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                <Clock className="w-4 h-4" />
                <span className="text-sm">{article.readingTime} دقائق</span>
              </div>
            </div>

            {/* التصنيفات */}
            {article.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {article.tags.slice(0, 4).map((tag) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="px-3 py-1 text-sm"
                    style={{
                      backgroundColor: `${themeColor}15`,
                      color: themeColor,
                      borderColor: `${themeColor}30`,
                    }}
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>
      </Card>
    );
  };

  // مكون بطاقة المقال العادية
  const ArticleCard = ({ article }: { article: AngleArticle }) => {
    const themeColor = article.angle.themeColor || "#6366f1";

    return (
      <Card className="group overflow-hidden hover:shadow-lg transition-all duration-300 border-0 shadow-sm hover:shadow-xl dark:bg-gray-800/50 dark:hover:bg-gray-800/80">
        {/* صورة المقال */}
        <div className="relative h-48 overflow-hidden">
          <Image
            src={article.coverImage || "/images/default-article.jpg"}
            alt={article.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />

          {/* شارات الحالة */}
          <div className="absolute top-3 left-3 flex gap-2">
            {article.isFeatured && (
              <Badge className="bg-yellow-500/90 text-white text-xs px-2 py-1">
                <Star className="w-3 h-3 mr-1" />
                مميز
              </Badge>
            )}
            {article.isRecent && (
              <Badge className="bg-green-500/90 text-white text-xs px-2 py-1">
                جديد
              </Badge>
            )}
          </div>

          {/* ليبل الزاوية بلونها */}
          <div
            className="absolute top-3 right-3 px-2 py-1 rounded-full text-white text-xs font-medium shadow-md"
            style={{
              backgroundColor: themeColor,
              boxShadow: `0 2px 8px ${themeColor}40`,
            }}
          >
            {article.angle.icon && (
              <span className="mr-1">{article.angle.icon}</span>
            )}
            {article.angle.title}
          </div>
        </div>

        {/* محتوى البطاقة */}
        <CardContent className="p-4 space-y-3">
          {/* عنوان المقال */}
          <Link
            href={article.link}
            className="block group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors"
          >
            <h3 className="font-bold text-lg leading-tight line-clamp-2 mb-2">
              {article.title}
            </h3>
          </Link>

          {/* مقتطف المقال */}
          <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-2 leading-relaxed">
            {article.excerpt}
          </p>

          {/* معلومات إضافية */}
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {article.readingTime} دقائق
              </span>
              <span className="flex items-center gap-1">
                <Eye className="w-3 h-3" />
                {article.views.toLocaleString()}
              </span>
            </div>

            <time className="text-xs">
              {new Date(article.publishDate).toLocaleDateString("ar-SA", {
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            </time>
          </div>

          {/* معلومات المؤلف */}
          <div className="flex items-center gap-2 pt-2 border-t border-gray-100 dark:border-gray-700">
            <div className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
              {article.author.avatar ? (
                <Image
                  src={article.author.avatar}
                  alt={article.author.name}
                  width={24}
                  height={24}
                  className="rounded-full"
                />
              ) : (
                <User className="w-3 h-3 text-gray-500" />
              )}
            </div>
            <span className="text-xs font-medium">{article.author.name}</span>
          </div>

          {/* التصنيفات */}
          {article.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {article.tags.slice(0, 3).map((tag) => (
                <Badge
                  key={tag}
                  variant="secondary"
                  className="text-xs px-2 py-0.5"
                  style={{
                    backgroundColor: `${themeColor}10`,
                    color: themeColor,
                  }}
                >
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  // عرض التحميل
  if (loading && !refreshing) {
    return (
      <div
        className={cn(
          "bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/10 dark:to-indigo-900/10 rounded-2xl p-8",
          className
        )}
      >
        {showHeader && (
          <div className="flex items-center justify-between mb-6">
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-10 w-24" />
          </div>
        )}
        <LoadingSkeleton />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/10 dark:to-indigo-900/10 rounded-2xl p-8",
        className
      )}
    >
      {/* رأس القسم */}
      {showHeader && (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                مُقترب
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                مقالات إبداعية من جميع الزوايا
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={refreshing}
              className="h-10"
            >
              <RefreshCw
                className={cn("w-4 h-4 ml-2", refreshing && "animate-spin")}
              />
              تحديث
            </Button>

            <Link href="/muqtarab">
              <Button variant="default" size="sm" className="h-10">
                عرض الكل
                <ArrowLeft className="w-4 h-4 mr-2" />
              </Button>
            </Link>
          </div>
        </div>
      )}

      {/* شريط الفلاتر */}
      {showFilters && (
        <div className="flex flex-wrap items-center gap-4 mb-6 p-4 bg-white/50 dark:bg-gray-800/30 rounded-xl">
          {/* خيارات الترتيب */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              ترتيب:
            </span>
            {sortOptions.map((option) => (
              <Button
                key={option.value}
                variant={sortBy === option.value ? "default" : "outline"}
                size="sm"
                onClick={() => handleSortChange(option.value as any)}
                className="h-8 text-xs"
              >
                <option.icon className="w-3 h-3 ml-1" />
                {option.label}
              </Button>
            ))}
          </div>

          {/* فلتر المميز */}
          <Button
            variant={showFeaturedOnly ? "default" : "outline"}
            size="sm"
            onClick={handleFeaturedToggle}
            className="h-8 text-xs"
          >
            <Star className="w-3 h-3 ml-1" />
            المميز فقط
          </Button>

          {/* عرض الإحصائيات */}
          {apiData && (
            <div className="flex items-center gap-4 text-xs text-gray-600 dark:text-gray-400 mr-auto">
              <span>المجموع: {apiData.stats.totalArticles}</span>
              <span>المميز: {apiData.stats.featuredCount}</span>
              <span>الحديث: {apiData.stats.recentCount}</span>
            </div>
          )}
        </div>
      )}

      {/* المحتوى */}
      {refreshing ? (
        <LoadingSkeleton />
      ) : articles.length === 0 ? (
        <div className="text-center py-12">
          <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-300 mb-2">
            لا توجد مقالات حالياً
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            نعمل على إنتاج محتوى إبداعي مخصص لك
          </p>
          <Button onClick={handleRefresh} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 ml-2" />
            إعادة المحاولة
          </Button>
        </div>
      ) : (
        <>
          {/* البطاقة المميزة */}
          {articles.length > 0 && articles[0].isFeatured && (
            <div className="mb-8">
              <FeaturedArticleCard article={articles[0]} />
            </div>
          )}

          {/* باقي المقالات */}
          {articles.length > 1 && (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {articles
                .slice(articles[0]?.isFeatured ? 1 : 0)
                .map((article) => (
                  <ArticleCard key={article.id} article={article} />
                ))}
            </div>
          )}

          {/* إذا لم توجد مقالات مميزة، اعرض جميع المقالات عادية */}
          {articles.length > 0 && !articles[0]?.isFeatured && (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {articles.map((article) => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>
          )}

          {/* التنقل بين الصفحات */}
          {showPagination && apiData && apiData.pagination.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={!apiData.pagination.hasPreviousPage}
              >
                <ArrowRight className="w-4 h-4" />
              </Button>

              <span className="text-sm text-gray-600 dark:text-gray-300 px-4">
                الصفحة {apiData.pagination.currentPage} من{" "}
                {apiData.pagination.totalPages}
              </span>

              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={!apiData.pagination.hasNextPage}
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
