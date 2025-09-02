"use client";

import SmartContentNewsCard from "@/components/mobile/SmartContentNewsCard";
import OldStyleNewsBlock from "@/components/old-style/OldStyleNewsBlock";
import "@/components/mobile/mobile-news.css";
import type { RecommendedArticle } from "@/lib/ai-recommendations";
import { generatePersonalizedRecommendations } from "@/lib/ai-recommendations";
import CloudImage from "@/components/ui/CloudImage";
import ArticleViews from "@/components/ui/ArticleViews";
import { formatDateNumeric } from "@/lib/date-utils";
import { getArticleLink } from "@/lib/utils";
import "@/styles/smart-content-cards.css";
import "@/styles/unified-mobile-news.css";
import {
  AlertTriangle,
  ArrowLeft,
  Bookmark,
  Clock,
  Eye,
  Grid3X3,
  Heart,
  List,
  Loader2,
  MessageSquare,
  Newspaper,
} from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useDarkMode } from "@/hooks/useDarkMode";
import "../categories/categories-fixes.css";
import "./news-styles.css";

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
  const { darkMode } = useDarkMode();
  const [articles, setArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState<"newest" | "views">("newest");
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<NewsStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [smartRecommendations, setSmartRecommendations] = useState<
    RecommendedArticle[]
  >([]);

  const ITEMS_PER_PAGE = 20;

  // تحسين جلب التصنيفات مع معالجة أفضل للأخطاء والكاش
  const fetchCategories = useCallback(async () => {
    // تحقق من الكاش أولاً
    const cacheKey = "categories";
    const cached = categoriesCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < 5 * 60 * 1000) {
      // 5 دقائق
      setCategories(cached.data);
      return;
    }

    try {
      console.log("🔍 جلب التصنيفات من:", "/api/categories?is_active=true");

      // استخدام timeout لتجنب انتظار الطلب إلى ما لا نهاية
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 ثواني كحد أقصى

      // محاولة جلب البيانات
      const response = await fetch("/api/categories?is_active=true", {
        signal: controller.signal,
        cache: "force-cache",
        next: { revalidate: 300 },
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(
          `Failed to fetch categories: ${response.status} ${response.statusText}`
        );
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
        timestamp: Date.now(),
      });

      setCategories(categoriesData);

      // إزالة رسالة الخطأ إذا كانت موجودة
      if (error) setError(null);
    } catch (err: any) {
      console.error("Error fetching categories:", err);

      // رسالة خطأ أكثر تفصيلاً
      const errorMessage =
        err.name === "AbortError"
          ? "استغرق تحميل التصنيفات وقتاً طويلاً، يرجى المحاولة مرة أخرى."
          : `فشل في تحميل التصنيفات: ${err.message}`;

      setError(errorMessage);

      // استخدام بيانات احتياطية إذا كان لدينا
      if (categories.length === 0) {
        const fallbackCategories: Category[] = [
          {
            id: 1,
            name: "عام",
            name_ar: "عام",
            slug: "general",
            color: "#1a73e8",
            color_hex: "#1a73e8",
            icon: "📰",
          },
          {
            id: 2,
            name: "رياضة",
            name_ar: "رياضة",
            slug: "sports",
            color: "#34a853",
            color_hex: "#34a853",
            icon: "⚽",
          },
        ];
        setCategories(fallbackCategories);
      }
    }
  }, []);

  // Fetch stats with caching
  const fetchStats = useCallback(async () => {
    const cacheKey = `stats-${selectedCategory || "all"}`;
    const cached = statsCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < 5 * 60 * 1000) {
      // 5 دقائق
      setStats(cached.data);
      return;
    }

    try {
      setStatsLoading(true);
      const params = selectedCategory ? `?category_id=${selectedCategory}` : "";
      const response = await fetch(`/api/news/stats${params}`, { cache: "force-cache", next: { revalidate: 120 } });
      if (!response.ok) throw new Error("Failed to fetch stats");
      const data = await response.json();
      if (data.success) {
        statsCache.set(cacheKey, {
          data: data.stats,
          timestamp: Date.now(),
        });
        setStats(data.stats);
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
      // في حالة الفشل، نستخدم إحصائيات بديلة
      setStats({
        totalArticles: articles.length,
        totalLikes: 0,
        totalViews: articles.reduce(
          (sum, article) => sum + (article.views || article.views_count || 0),
          0
        ),
        totalSaves: 0,
      });
    } finally {
      setStatsLoading(false);
    }
  }, [selectedCategory, articles]);

  // Fetch articles - محسن للأداء
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
          sort: sortBy === "views" ? "views" : "published_at",
          order: "desc",
        });

        if (selectedCategory) {
          params.append("category_id", selectedCategory.toString());
        }

        // دعم timeout لتجنب مشاكل انتهاء المهلة
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 ثواني

        try {
          const response = await fetch(`/api/news?${params}`, {
            signal: controller.signal,
            cache: "no-store",
          });
          clearTimeout(timeoutId);

          if (!response.ok) throw new Error("Failed to fetch articles");

          const data = await response.json();

          console.log("📊 بيانات الاستجابة:", data);

          // إصلاح مشكلة عدم ظهور الأخبار - API يعيد البيانات في articles مباشرة
          const articles = data.articles || data.data || [];

          console.log(`✅ تم جلب ${articles.length} مقال`);

          if (reset) {
            setArticles(articles);
            setPage(1);
          } else {
            setArticles((prev) => [...prev, ...articles]);
          }

          setHasMore(articles.length === ITEMS_PER_PAGE);
        } catch (fetchError: any) {
          clearTimeout(timeoutId);
          if (fetchError.name === "AbortError") {
            throw new Error(
              "انتهت مهلة تحميل الأخبار. يرجى المحاولة مرة أخرى."
            );
          }
          throw fetchError;
        }
      } catch (error) {
        console.error("Error fetching articles:", error);
        setError(
          error instanceof Error ? error.message : "فشل في تحميل المقالات"
        );
      } finally {
        setLoading(false);
        setIsLoadingMore(false);
      }
    },
    [page, selectedCategory, sortBy, ITEMS_PER_PAGE]
  );

  // جلب التوصيات الذكية
  const fetchSmartRecommendations = useCallback(async () => {
    try {
      // جلب سلوك المستخدم من localStorage أو استخدام قيم افتراضية
      const userBehavior = {
        recentArticles: JSON.parse(
          localStorage.getItem("recentArticles") || "[]"
        ).slice(0, 10),
        favoriteCategories: JSON.parse(
          localStorage.getItem("favoriteCategories") || "[]"
        ),
        readingPatterns: {
          timeOfDay: [new Date().getHours().toString()],
          daysOfWeek: [new Date().getDay().toString()],
          averageReadingTime: 5,
        },
        interactions: {
          liked: JSON.parse(localStorage.getItem("likedArticles") || "[]"),
          shared: JSON.parse(localStorage.getItem("sharedArticles") || "[]"),
          saved: JSON.parse(localStorage.getItem("savedArticles") || "[]"),
          commented: [],
        },
        searchHistory: JSON.parse(
          localStorage.getItem("searchHistory") || "[]"
        ),
        deviceType: isMobile ? "mobile" : ("desktop" as "mobile" | "desktop"),
      };

      const recommendations = await generatePersonalizedRecommendations({
        userBehavior,
        currentCategory: selectedCategory
          ? getCategoryName(selectedCategory)
          : "",
        currentArticleId: "",
        limit: 10, // نحتاج 10 توصيات للتوزيع المتوازن
      });

      setSmartRecommendations(recommendations);
    } catch (error) {
      console.error("Error fetching smart recommendations:", error);
      // استخدام توصيات احتياطية إذا فشل الجلب
      setSmartRecommendations([]);
    }
  }, [selectedCategory, isMobile]);

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
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    fetchArticles(true);
  }, [selectedCategory, sortBy]);

  useEffect(() => {
    if (articles.length > 0) {
      fetchStats();
      fetchSmartRecommendations();
    }
  }, [articles, fetchStats, fetchSmartRecommendations]);

  const loadMore = useCallback(() => {
    if (!loading && !isLoadingMore && hasMore) {
      setPage((prev) => prev + 1);
      fetchArticles(false);
    }
  }, [loading, isLoadingMore, hasMore, fetchArticles]);

  // محسنة مع useMemo
  const getCategoryName = useMemo(
    () => (categoryId: number) => {
      const category = categories.find((cat) => cat.id === categoryId);
      return category?.name || category?.name_ar || "غير مصنف";
    },
    [categories]
  );

  const getCategoryColor = useMemo(
    () => (categoryId: number) => {
      const category = categories.find((cat) => cat.id === categoryId);
      return category?.color || category?.color_hex || "#3B82F6";
    },
    [categories]
  );



  // NewsCard component - من الصفحة الرئيسية
  const NewsCard = ({ news }: { news: any }) => {
    const [imageLoading, setImageLoading] = useState(true);
    const isBreaking = Boolean(news.breaking || news.is_breaking || news?.metadata?.breaking);
    const baseBg = isBreaking ? 'hsla(0, 78%, 55%, 0.14)' : 'hsl(var(--bg-elevated))';
    const hoverBg = isBreaking ? 'hsla(0, 78%, 55%, 0.22)' : 'hsl(var(--accent) / 0.06)';
    const baseBorder = isBreaking ? '1px solid hsl(0 72% 45% / 0.45)' : '1px solid hsl(var(--line))';

    // Category mapping for consistent styling
    const categoryMap: Record<string, string> = {
      // إنجليزية أساسية
      world: "world",
      sports: "sports",
      tech: "tech",
      technology: "tech",
      business: "business",
      economy: "business",
      local: "local",
      news: "local",
      politics: "world",
      travel: "world",
      cars: "tech",
      media: "tech",
      opinion: "opinions",
      // تطابقات عربية
      العالم: "world",
      "أخبار-العالم": "world",
      "أخبار العالم": "world",
      رياضة: "sports",
      الرياضة: "sports",
      رياضي: "sports",
      تقنية: "tech",
      التقنية: "tech",
      تكنولوجيا: "tech",
      التكنولوجيا: "tech",
      اقتصاد: "business",
      الاقتصاد: "business",
      أعمال: "business",
      الأعمال: "business",
      محليات: "local",
      المحليات: "local",
      محلي: "local",
      محطات: "local",
      المحطات: "local",
      حياتنا: "local",
      حياة: "local",
      سياحة: "world",
      السياحة: "world",
      سيارات: "tech",
      السيارات: "tech",
      ميديا: "tech",
      الميديا: "tech",
      عام: "local",
      عامة: "local",
    };

    // معالجة التصنيف من مصادر مختلفة
    let categoryName = null;
    
    if (news.category?.name) {
      categoryName = news.category.name;
    } else if (news.categories?.name) {
      categoryName = news.categories.name;
    } else if (news.category_name) {
      categoryName = news.category_name;
    } else if (typeof news.category === 'string') {
      categoryName = news.category;
    } else if (typeof news.categories === 'string') {
      categoryName = news.categories;
    }
    
    // Debug
    if (isBreaking) {
      console.log("Breaking news - no category shown");
    } else if (!categoryName) {
      console.log("No category found for:", news.title, {
        category: news.category,
        categories: news.categories,
        category_name: news.category_name
      });
    }
    const rawCategorySlug =
      categoryName?.toLowerCase?.() || categoryName || "";
    const mappedCategory = categoryMap[rawCategorySlug] || rawCategorySlug;

    return (
      <Link href={getArticleLink(news)} style={{ textDecoration: 'none' }}>
        <div style={{
          background: baseBg,
          border: baseBorder,
          borderRadius: '16px',
          overflow: 'hidden',
          transition: 'all 0.3s ease',
          cursor: 'pointer',
          height: '100%',
          display: 'flex',
          flexDirection: 'column'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-4px)';
          e.currentTarget.style.background = hoverBg;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.background = baseBg;
        }}>
          {/* صورة المقال */}
          <div style={{
            position: 'relative',
            height: '180px',
            width: '100%',
            background: 'hsl(var(--bg))',
            overflow: 'hidden'
          }}>
            <CloudImage
              src={news?.image || news?.featured_image || news?.image_url || null}
              alt={news?.title || "صورة المقال"}
              fill
              className="w-full h-full object-cover transition-transform duration-500"
              fallbackType="article"
              priority={false}
            />
            {/* ليبل عاجل يحل محل التصنيف عند العاجل */}
            {isBreaking ? (
              <div style={{
                position: 'absolute',
                top: '12px',
                right: '12px',
                background: 'hsl(0 72% 45%)',
                color: 'white',
                padding: '6px 14px',
                borderRadius: '20px',
                fontSize: '13px',
                fontWeight: 'bold',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 2px 8px rgba(220, 38, 38, 0.3)',
                zIndex: 10
              }}>
                <span style={{ animation: 'pulse 2s infinite' }}>⚡</span>
                عاجل
              </div>
            ) : (
              categoryName && (
                <div style={{
                  position: 'absolute',
                  top: '12px',
                  right: '12px',
                  background: 'hsl(var(--accent))',
                  color: 'white',
                  padding: '4px 12px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: 600,
                  zIndex: 10
                }}>
                  {categoryName}
                </div>
              )
            )}
          </div>

          {/* محتوى البطاقة */}
          <div style={{
            padding: '16px',
            flex: 1,
            display: 'flex',
            flexDirection: 'column'
          }}>
            {/* العنوان */}
            <h3 style={{
              fontSize: '16px',
              fontWeight: '600',
              color: isBreaking ? 'hsl(0 72% 45%)' : 'hsl(var(--fg))',
              marginBottom: '12px',
              lineHeight: '1.5',
              overflow: 'hidden',
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical'
            }}>
              {news.title}
            </h3>

            {/* البيانات الوصفية */}
            <div style={{
              marginTop: 'auto',
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              fontSize: '12px',
              color: 'hsl(var(--muted))'
            }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Clock className="w-3 h-3" />
                {formatDateNumeric(news.published_at || news.created_at)}
              </span>
              <ArticleViews
                count={news.views || news.views_count || 0}
              />
            </div>
          </div>
        </div>
      </Link>
    );
  };

  // دمج البطاقات المخصصة مع بطاقات الأخبار
  const renderMixedContent = useCallback(() => {
    const mixedContent: JSX.Element[] = [];
    let smartCardIndex = 0;

    articles.forEach((article, index) => {
      // إضافة بطاقة الخبر
      if (isMobile) {
        // سيتم استخدام OldStyleNewsBlock لعرض البطاقات بشكل مجمع
      } else {
        // استخدام NewsCard للديسكتوب
        mixedContent.push(<NewsCard key={article.id} news={article} />);
      }

      // إضافة البطاقات المخصصة بتوزيع متوازن
      const smartCardPositions = [3, 6, 9, 13, 17];
      const currentPosition = index + 1;

      if (smartCardPositions.includes(currentPosition)) {
        // إضافة 1-2 بطاقة مخصصة في كل موضع
        const cardsToAdd = currentPosition === 9 ? 2 : 1;

        for (
          let i = 0;
          i < cardsToAdd && smartCardIndex < smartRecommendations.length;
          i++
        ) {
          const recommendation = smartRecommendations[smartCardIndex];
          if (recommendation) {
            // تنويع العبارات التحفيزية
            const excerpts = [
              "اكتشف هذا المحتوى المميز الذي اخترناه لك بعناية بناءً على اهتماماتك",
              "محتوى مختار خصيصاً لك لإثراء تجربتك القرائية",
              "قد يعجبك هذا المحتوى المميز المختار بذكاء",
              "محتوى يتماشى مع ذوقك واهتماماتك",
              "اقتراح ذكي يناسب قراءاتك السابقة",
            ];

            mixedContent.push(
              <SmartContentNewsCard
                key={`smart-${recommendation.id}`}
                article={{
                  ...recommendation,
                  slug: recommendation.url.replace("/article/", ""),
                  featured_image: recommendation.thumbnail,
                  category_name: recommendation.category,
                  // إزالة excerpt لإخفاء النبذة
                  image_caption: `محتوى ${
                    recommendation.type === "تحليل"
                      ? "تحليلي عميق"
                      : recommendation.type === "رأي"
                      ? "رأي متخصص"
                      : recommendation.type === "تقرير"
                      ? "تقرير شامل"
                      : "مميز"
                  } - ${recommendation.readingTime} دقائق قراءة`,
                }}
                darkMode={darkMode}
                variant={isMobile ? "compact" : "desktop"}
                position={smartCardIndex}
              />
            );
            smartCardIndex++;
          }
        }
      }
    });

    return mixedContent;
  }, [
    articles,
    smartRecommendations,
    darkMode,
    isMobile,
    viewMode,
    getCategoryName,
    getCategoryColor,
  ]);

  return (
    <>
      <div className="min-h-screen" data-page="news" data-news="true" style={{ 
        backgroundColor: '#f8f8f7',
        minHeight: '100vh',
        position: 'relative',
        zIndex: 0
      }}>

        
        {/* Hero Section */}
        <section className="relative py-16 md:py-20">
          <div className="relative max-w-7xl mx-auto px-4 md:px-6">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 mb-6 rounded-2xl shadow-2xl header-main-icon themed-gradient-bg">
                <Newspaper className="w-10 h-10 text-white header-icon" />
              </div>

              <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900 dark:text-white">
                آخر الأخبار
              </h1>

              <p className="text-xl text-gray-600 dark:text-gray-300 mb-2">
                تابع أحدث الأخبار والتطورات
              </p>

              {/* إحصائيات الأخبار */}
              {stats && !statsLoading && (
                <div className="mt-6 inline-flex flex-wrap justify-center items-center gap-4 md:gap-6 rounded-2xl px-4 md:px-6 py-3 border border-[#f0f0ef] shadow-sm stats-container" style={{ backgroundColor: 'transparent' }}>
                  <div className="text-center px-2">
                    <div className="flex items-center gap-2">
                      <Newspaper className="w-5 h-5 text-blue-600 dark:text-blue-400 stats-icon" />
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">
                        {stats.totalArticles}
                      </div>
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      خبر
                    </div>
                  </div>

                  <div className="w-px h-10 bg-gray-300 dark:bg-gray-600 hidden md:block"></div>

                  <div className="text-center px-2">
                    <div className="flex items-center gap-2">
                      <Eye className="w-5 h-5 text-blue-600 dark:text-blue-400 stats-icon" />
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">
                        {stats.totalViews > 999
                          ? `${(stats.totalViews / 1000).toFixed(1)}k`
                          : stats.totalViews}
                      </div>
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      مشاهدة
                    </div>
                  </div>

                  <div className="w-px h-10 bg-gray-300 dark:bg-gray-600 hidden md:block"></div>

                  <div className="text-center px-2">
                    <div className="flex items-center gap-2">
                      <Heart className="w-5 h-5 text-blue-600 dark:text-blue-400 stats-icon" />
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">
                        {stats.totalLikes}
                      </div>
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      إعجاب
                    </div>
                  </div>

                  <div className="w-px h-10 bg-gray-300 dark:bg-gray-600 hidden md:block"></div>

                  <div className="text-center px-2">
                    <div className="flex items-center gap-2">
                      <Bookmark className="w-5 h-5 text-blue-600 dark:text-blue-400 stats-icon" />
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">
                        {stats.totalSaves}
                      </div>
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      حفظ
                    </div>
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
        <div className="sticky top-0 z-40 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700">
          <div className="max-w-7xl mx-auto px-4 md:px-6">
            <div className="flex items-center gap-2 py-4 overflow-x-auto scrollbar-hide">
              <button
                onClick={() => setSelectedCategory(null)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
                  selectedCategory === null
                    ? "text-white"
                    : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                }`}
                style={{
                  backgroundColor: selectedCategory === null ? 'var(--theme-primary)' : undefined,
                }}

              >
                جميع الأخبار
              </button>
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
                    selectedCategory === category.id
                      ? "text-white"
                      : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                  }`}
                  style={{
                    backgroundColor: selectedCategory === category.id ? 'var(--theme-primary)' : undefined,
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
          <div className="border border-[#f0f0ef] dark:bg-gray-800 rounded-xl shadow-sm p-4 mb-6" style={{ backgroundColor: 'transparent' }}>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex items-center gap-2">
                <Newspaper className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <span className="text-gray-700 dark:text-gray-300 font-medium">
                  {loading && page === 1
                    ? "جاري التحميل..."
                    : articles.length > 0
                    ? `${articles.length} خبر`
                    : "لا توجد أخبار"}
                </span>
              </div>

              <div className="flex items-center gap-3">
                {/* Sort Options */}
                <select
                  value={sortBy}
                  onChange={(e) => {
                    setSortBy(e.target.value as "newest" | "views");
                    setPage(1);
                  }}
                  className="px-4 py-2 border border-[#f0f0ef] dark:border-gray-600 rounded-lg dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  style={{ backgroundColor: 'transparent' }}
                >
                  <option value="newest">الأحدث</option>
                  <option value="views">الأكثر مشاهدة</option>
                </select>

                {/* View Mode Toggle - مخفي في الموبايل */}
                {!isMobile && (
                  <div className="flex items-center border border-[#f0f0ef] dark:bg-gray-700 rounded-lg p-1" style={{ backgroundColor: 'transparent' }}>
                    <button
                      onClick={() => setViewMode("grid")}
                      className={`p-2 rounded transition-colors ${
                        viewMode === "grid"
                          ? "border border-[#f0f0ef] dark:bg-gray-600 shadow-sm text-blue-600 dark:text-blue-400"
                          : "text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                      }`}
                      style={{ backgroundColor: viewMode === "grid" ? 'transparent' : 'transparent' }}
                      title="عرض شبكي"
                    >
                      <Grid3X3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setViewMode("list")}
                      className={`p-2 rounded transition-colors ${
                        viewMode === "list"
                          ? "border border-[#f0f0ef] dark:bg-gray-600 shadow-sm text-blue-600 dark:text-blue-400"
                          : "text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                      }`}
                      style={{ backgroundColor: viewMode === "list" ? 'transparent' : 'transparent' }}
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
              <p className="text-gray-600 dark:text-gray-400">
                جاري تحميل الأخبار...
              </p>
            </div>
          ) : articles.length === 0 ? (
            // Empty State
            <div className="border border-[#f0f0ef] dark:bg-gray-800 rounded-xl shadow-sm p-12 text-center" style={{ backgroundColor: 'transparent' }}>
              <Newspaper className="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
                لا توجد أخبار
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                {selectedCategory
                  ? `لا توجد أخبار في قسم ${getCategoryName(selectedCategory)}`
                  : "لا توجد أخبار متاحة حالياً"}
              </p>
            </div>
          ) : (
            <>
              {/* Articles Grid with NewsCard */}
              {isMobile ? (
                // عرض الموبايل - استخدام OldStyleNewsBlock
                <div className="mobile-news-container">
                  <OldStyleNewsBlock
                    articles={articles as any}
                    showTitle={false}
                    columns={1}
                    showExcerpt={false}
                  />
                  
                  {/* إضافة البطاقات المخصصة بنفس تنسيق البطاقات العادية */}
                  {smartRecommendations.length > 0 && (
                    <div className="mt-4">
                      <OldStyleNewsBlock
                        articles={smartRecommendations.map((recommendation) => ({
                          id: recommendation.id,
                          title: recommendation.title,
                          slug: recommendation.url.replace("/article/", ""),
                          featured_image: recommendation.thumbnail,
                          image: recommendation.thumbnail,
                          published_at: new Date().toISOString(),
                          views: 0,
                          is_custom: true,
                          category: recommendation.category ? {
                            id: 0,
                            name: recommendation.category,
                            slug: recommendation.category.toLowerCase()
                          } : undefined
                        }))}
                        showTitle={false}
                        columns={1}
                        showExcerpt={false}
                      />
                    </div>
                  )}
                </div>
              ) : (
                // عرض سطح المكتب - الشبكة
                <div
                  className={
                    viewMode === "grid"
                      ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 content-start"
                      : "space-y-4"
                  }
                >
                  {renderMixedContent()}
                </div>
              )}

              {/* Load More */}
              {hasMore && (
                <div className="mt-12 text-center">
                  <button
                    onClick={loadMore}
                    disabled={loading || isLoadingMore}
                    className="inline-flex items-center gap-2 px-8 py-3 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{
                      backgroundColor: 'var(--theme-primary)',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.filter = 'brightness(0.9)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.filter = 'brightness(1)';
                    }}
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

    </>
  );
}
