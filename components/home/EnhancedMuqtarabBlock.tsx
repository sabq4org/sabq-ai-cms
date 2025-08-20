"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import {
  ArrowLeft,
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
import React, { useCallback, useEffect, useState } from "react";
import ArticleViews from "@/components/ui/ArticleViews";

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

  // التحقق من صلاحية مسار الصورة
  const isValidImageSrc = (src?: string) => {
    if (!src) return false;
    return /^(https?:\/\/|\/|data:)/.test(src);
  };

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
        params.set("limit", Math.min(limit * 2, 50).toString()); // زيادة عدد المقالات المجلوبة
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
          `/api/muqtarab/all-articles?${params.toString()}`
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

            // إزالة التكرارات حسب slug أو id أو العنوان
            const seenKeys = new Set<string>();
            const seenTitles = new Set<string>();
            const deduped = data.articles.filter((article) => {
              // التحقق بناءً على المعرف
              const baseKey = (article.slug || article.id || "").toString();
              const key = baseKey.trim().toLowerCase();

              // التحقق بناءً على العنوان
              const titleKey = (article.title || "").trim().toLowerCase();

              // إذا كان المعرف أو العنوان موجود بالفعل
              if (
                (key && seenKeys.has(key)) ||
                (titleKey && seenTitles.has(titleKey))
              ) {
                return false;
              }

              // إضافة المعرف والعنوان للمجموعة
              if (key) seenKeys.add(key);
              if (titleKey) seenTitles.add(titleKey);

              return true;
            });

            setArticles(deduped);
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

  // مكون البطاقة المميزة - مع نظام الألوان المتغيرة الاحترافي
  const FeaturedArticleCard = ({ article }: { article: AngleArticle }) => {
    const displaySrc = isValidImageSrc(article.coverImage)
      ? (article.coverImage as string)
      : "/images/default-article.jpg";

    // إعداد CSS variables للألوان الديناميكية
    const customStyles = React.useMemo(() => {
      if (article.angle?.themeColor) {
        const hex = article.angle.themeColor.replace('#', '');
        const rgb = hex.match(/.{2}/g)?.map(h => parseInt(h, 16)).join(' ') || '59 130 246';
        
        return {
          '--theme-primary': article.angle.themeColor,
          '--theme-primary-rgb': rgb,
        } as React.CSSProperties;
      }
      return {};
    }, [article.angle?.themeColor]);

    return (
      <Card 
        className="group overflow-hidden transition-all duration-300 border-0 dark:bg-gray-800/50 relative"
        style={customStyles}
      >
        {/* خط ملامس بلون الزاوية في الأسفل - يستخدم CSS variables */}
        <div
          className="absolute bottom-0 left-0 right-0 h-1 transition-all duration-300 group-hover:h-1.5"
          style={{ 
            backgroundColor: article.angle?.themeColor 
              ? 'var(--theme-primary)' 
              : 'var(--theme-primary, #6366f1)' 
          }}
        ></div>

        {/* تصميم الديسكتوب - نصف صورة ونصف محتوى */}
        <div className="hidden md:grid md:grid-cols-2 gap-0">
          {/* صورة المقال */}
          <div className="relative h-64 md:h-80 overflow-hidden">
            <Image
              src={displaySrc}
              alt={article.title}
              fill={true}
              className="object-cover transition-transform duration-500 group-hover:scale-110"
              sizes="50vw"
              priority={false}
            />

            {/* تدرج للنص */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

            {/* شارة مميز كبيرة - يسار */}
            <div className="absolute top-4 left-4">
              <Badge className="bg-gradient-to-r from-yellow-500 to-amber-600 text-white px-3 py-1.5 text-sm font-bold">
                <Star className="w-4 h-4 mr-1.5" />
                مقال مميز
              </Badge>
            </div>

            {/* ليبل الزاوية بلونها - فوق يمين - مع CSS variables */}
            <div
              className="absolute top-4 right-4 px-3 py-1.5 rounded-full text-white font-bold text-sm transition-all duration-300"
              style={{
                backgroundColor: article.angle?.themeColor 
                  ? 'var(--theme-primary)' 
                  : 'var(--theme-primary, #6366f1)',
                boxShadow: article.angle?.themeColor 
                  ? 'none'
                  : 'none',
              }}
            >
              {article.angle.icon && (
                <span className="mr-1.5">{article.angle.icon}</span>
              )}
              {article.angle.title}
            </div>
          </div>

          {/* محتوى البطاقة للديسكتوب */}
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
          </div>
        </div>

        {/* تصميم الهواتف - تصميم موحد مع البطاقات العادية */}
        <div className="block md:hidden">
          {/* صورة المقال */}
          <div className="relative h-36 sm:h-48 overflow-hidden rounded-xl">
            <Image
              src={displaySrc}
              alt={article.title}
              fill={true}
              className="object-cover object-center transition-transform duration-300 group-hover:scale-105"
              sizes="100vw"
              priority={false}
            />

            {/* شارات الحالة */}
            <div className="absolute top-3 left-3 flex gap-2">
              <Badge className="bg-yellow-500/90 text-white text-xs px-2 py-1">
                <Star className="w-3 h-3 mr-1" />
                مميز
              </Badge>
              {article.isRecent && (
                <Badge className="bg-green-500/90 text-white text-xs px-2 py-1">
                  جديد
                </Badge>
              )}
            </div>

            {/* ليبل الزاوية بلونها - مع CSS variables */}
            <div
              className="absolute top-3 right-3 px-2 py-1 rounded-full text-white text-xs font-medium transition-all duration-300"
              style={{
                backgroundColor: article.angle?.themeColor 
                  ? 'var(--theme-primary)' 
                  : 'var(--theme-primary, #6366f1)',
                boxShadow: article.angle?.themeColor 
                  ? 'none'
                  : 'none',
              }}
            >
              {article.angle.icon && (
                <span className="mr-1">{article.angle.icon}</span>
              )}
              {article.angle.title}
            </div>
          </div>

          {/* محتوى البطاقة للهواتف */}
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
          </CardContent>
        </div>
      </Card>
    );
  };

  // مكون بطاقة المقال العادية - نسخة مطابقة تماماً لبطاقات الأخبار
  const ArticleCard = ({ article }: { article: AngleArticle }) => {
    const displaySrc = isValidImageSrc(article.coverImage)
      ? (article.coverImage as string)
      : "/images/default-article.jpg";

    const isNew = (): boolean => {
      if (article.isRecent) return true;
      try {
        const d = new Date(article.publishDate);
        return Date.now() - d.getTime() <= 24 * 60 * 60 * 1000;
      } catch {
        return false;
      }
    };

    const formatGregorianDate = (dateString: string) => {
      const d = new Date(dateString);
      try {
        return d.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
      } catch {
        const dd = String(d.getDate()).padStart(2, '0');
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const yy = d.getFullYear();
        return `${dd}/${mm}/${yy}`;
      }
    };

    return (
      <Link href={article.link} className="group block">
        <article
          dir="rtl"
          className="h-full rounded-2xl overflow-hidden shadow-sm transition-all duration-300 flex flex-col bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
        >
          {/* صورة المقال */}
          <div className="relative h-40 sm:h-48 overflow-hidden">
            <Image
              src={displaySrc}
              alt={article.title}
              fill={true}
              className="w-full h-full object-cover transition-transform duration-500"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              priority={false}
            />
            
            {/* شارة مميز */}
            {article.isFeatured && (
              <div className="absolute top-3 left-3">
                <span className="flex items-center gap-1 px-3 py-1 bg-yellow-600 text-white text-xs font-bold rounded-full shadow-lg">
                  <Star className="w-3 h-3" />
                  مميز
                </span>
              </div>
            )}
          </div>

          {/* محتوى البطاقة */}
          <div className="p-4 flex-1 flex flex-col">
            {/* الشريط العلوي: جديد + اسم الزاوية بجوار بعض */
            <div className="mb-2 flex items-center gap-2">
              {isNew() && (
                <div className="old-style-news-new-badge">
                  <span className="old-style-fire-emoji" aria-hidden>🔥</span>
                  <span>جديد</span>
                  <span className="old-style-news-date-inline">{formatGregorianDate(article.publishDate)}</span>
                </div>
              )}
              <div
                className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-md"
                style={{
                  backgroundColor: (article.angle?.themeColor || '#6366f1'),
                  color: '#ffffff',
                  border: `1px solid ${article.angle?.themeColor || '#6366f1'}`,
                }}
              >
                {article.angle?.icon && <span className="mr-0.5">{article.angle.icon}</span>}
                <span>{article.angle?.title}</span>
              </div>
            </div>

            {/* العنوان */}
            <h4 className="font-semibold text-lg mb-3 line-clamp-4 leading-snug flex-1">
              {article.title}
            </h4>

            {/* سطر واحد: التاريخ + المشاهدات */}
            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mt-auto">
              <time
                dateTime={article.publishDate}
                className="inline-flex items-center gap-1"
              >
                <Calendar className="w-4 h-4" />
                {new Date(article.publishDate).toLocaleDateString("ar-SA", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </time>
              <span className="mx-1">•</span>
              <ArticleViews 
                count={article.views ?? 0} 
                variant="minimal" 
                size="sm" 
                showLabel={false}
              />
            </div>
          </div>
        </article>
      </Link>
    );
  };

  // عرض التحميل
  if (loading && !refreshing) {
    return (
      <div className={cn("muqtarab-card-container", className)}>
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
    <div className={cn("muqtarab-card-container", className)}>
      {/* رأس القسم */}
      {showHeader && (
        <div className="flex flex-col items-center text-center gap-4 mb-8">
          {/* رأس موحد بأسلوب بلك الأخبار مع نظام الألوان المتغيرة */}
          <div className="w-full">
            <div className="flex flex-col items-center text-center">
              <div className="flex items-center justify-center mb-2">
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '36px',
                    height: '36px',
                    background: 'linear-gradient(135deg, hsl(var(--accent) / 0.15) 0%, hsl(var(--accent) / 0.05) 100%)',
                    borderRadius: '10px',
                    color: 'hsl(var(--accent))',
                    fontSize: '18px',
                    border: '1px solid hsl(var(--accent) / 0.25)'
                  }}
                >
                  <Sparkles className="w-5 h-5" />
                </span>
              </div>
              <h2
                className="font-bold"
                style={{ fontSize: '20px', color: 'hsl(var(--fg))', marginBottom: '6px' }}
              >
                مُقترب
              </h2>
              <p
                style={{ fontSize: '14px', fontWeight: 600, color: 'hsl(var(--accent))' }}
              >
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
          {/* 4 بطاقات عادية فقط */}
          {articles.length > 0 && (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {articles.slice(0, 4).map((article) => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
