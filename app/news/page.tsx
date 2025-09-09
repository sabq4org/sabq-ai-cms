"use client";

import OldStyleNewsBlock from "@/components/old-style/OldStyleNewsBlock";
import "@/components/mobile/mobile-news.css";
import { useDarkModeContext } from "@/contexts/DarkModeContext";
import CloudImage from "@/components/ui/CloudImage";
import ArticleViews from "@/components/ui/ArticleViews";
import { formatDateNumeric } from "@/lib/date-utils";
import { getArticleLink } from "@/lib/utils";
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
  const { darkMode } = useDarkModeContext();
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
  const [lastFetch, setLastFetch] = useState(Date.now());

  const ITEMS_PER_PAGE = 20;
  const REFRESH_INTERVAL = 20000; // تحديث كل 20 ثانية (أسرع لضمان ظهور الأخبار الجديدة)

  // تحسين جلب التصنيفات مع معالجة أفضل للأخطاء والكاش
  const fetchCategories = useCallback(async () => {
    // تحقق من الكاش أولاً - تقليل وقت الكاش
    const cacheKey = "categories";
    const cached = categoriesCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < 2 * 60 * 1000) {
      // تقليل من 5 دقائق إلى دقيقتين
      setCategories(cached.data);
      return;
    }

    try {
      console.log("🔍 جلب التصنيفات من:", "/api/categories?is_active=true");

      // استخدام timeout لتجنب انتظار الطلب إلى ما لا نهاية
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 ثواني كحد أقصى

      // محاولة جلب البيانات - تقليل الكاش للحصول على بيانات جديدة
      const response = await fetch("/api/categories?is_active=true", {
        signal: controller.signal,
        cache: "no-store", // إزالة الكاش للحصول على أحدث التصنيفات
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
    if (cached && Date.now() - cached.timestamp < 1 * 60 * 1000) {
      // تقليل من 5 دقائق إلى دقيقة واحدة
      setStats(cached.data);
      return;
    }

    try {
      setStatsLoading(true);
      const params = selectedCategory ? `?category_id=${selectedCategory}` : "";
      const response = await fetch(`/api/news/stats${params}`, { cache: "no-store" }); // إزالة الكاش للإحصائيات
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

  // Fetch articles - محسن للأداء مع دمج الأخبار المميزة
  const fetchArticles = useCallback(
    async (reset = false, customLimit?: number) => {
      try {
        if (reset) {
          setLoading(true);
        } else {
          setIsLoadingMore(true);
        }
        setError(null);

        // مسح كاش قوي جداً - إجباري
        const timestamp = Date.now();
        const randomId = Math.random().toString(36).substr(2, 15);
        
        try {
          // مسح جميع أنواع الكاش بقوة
          await Promise.all([
            // مسح كاش الخادم
            fetch('/api/cache/clear?force=1', { 
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Cache-Control': 'no-cache, no-store, must-revalidate, proxy-revalidate',
                'Pragma': 'no-cache',
                'Expires': '0',
                'X-Cache-Bust': timestamp.toString(),
                'X-Random': randomId
              },
              body: JSON.stringify({ type: 'all', force: true })
            }).catch(() => null),
            
            // إعادة تعيين كاش الأخبار
            fetch(`/api/news/fast?_force_refresh=${timestamp}&_rid=${randomId}`, { 
              method: 'HEAD',
              cache: "no-store",
              headers: {
                'Cache-Control': 'no-cache, no-store, must-revalidate, proxy-revalidate',
                'Pragma': 'no-cache',
                'Expires': '0',
                'X-Cache-Bust': timestamp.toString(),
                'X-Random': randomId
              }
            }).catch(() => null),
            
      // مسح شامل لكاش المتصفح - قاتل الكاش المطلق!
      Promise.resolve().then(() => {
        try {
          if (typeof window !== 'undefined') {
            // مسح جميع cache storage
            if (window.caches) {
              window.caches.keys().then(names => {
                names.forEach(name => {
                  window.caches.delete(name);
                });
              });
            }
            
            // مسح localStorage و sessionStorage
            if (window.localStorage) {
              Object.keys(window.localStorage).forEach(key => {
                if (key.includes('news') || key.includes('article') || key.includes('cache')) {
                  window.localStorage.removeItem(key);
                }
              });
            }
            
            if (window.sessionStorage) {
              Object.keys(window.sessionStorage).forEach(key => {
                if (key.includes('news') || key.includes('article') || key.includes('cache')) {
                  window.sessionStorage.removeItem(key);
                }
              });
            }
            
            // إجبار إعادة تحميل service worker إذا موجود
            if ('serviceWorker' in navigator) {
              navigator.serviceWorker.getRegistrations().then(registrations => {
                registrations.forEach(registration => {
                  registration.unregister();
                });
              });
            }
            
            // مسح أي متغيرات عامة في الذاكرة
            const globalKeys = ['__newsCache', '__articlesCache', '__dashboardCache', '__pageCache'];
            globalKeys.forEach(key => {
              try {
                delete (window as any)[key];
              } catch (e) {}
            });
          }
        } catch (e) {
          console.log('Browser cache clear error:', e);
        }
      }),            // تأخير قصير لضمان المسح
            new Promise(resolve => setTimeout(resolve, 100))
          ]);
          
          console.log('🧹 تم مسح جميع أنواع الكاش بقوة');
        } catch (cacheError) {
          console.warn('Cache clearing failed:', cacheError);
        }

        const currentPage = reset ? 1 : page;
        const effectiveLimit = customLimit ?? ITEMS_PER_PAGE;
        const params = new URLSearchParams({
          status: "published",
          limit: effectiveLimit.toString(),
          page: currentPage.toString(),
          sort: sortBy === "views" ? "views" : "published_at",
          order: "desc",
          noCount: "1",
        });

        if (selectedCategory) {
          params.append("category_id", selectedCategory.toString());
        }

        // دعم timeout لتجنب مشاكل انتهاء المهلة
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 ثواني

        try {
          // جلب الأخبار مع كسر كاش قوي جداً
    // جلب البيانات مع إجبار المتصفح على التحديث
    const fetchTimestamp = Date.now();
    const fetchRandomId = Math.random().toString(36).substr(2, 15);
    const sessionId = Math.random().toString(36).substr(2, 20);
    const forceId = `${Date.now()}_${Math.random()}_${performance.now()}`;
    
    // معاملات قوية لكسر أي نوع من الكاش
    const ultraCacheBreaker = `&_force=${fetchTimestamp}&_rid=${fetchRandomId}&_bypass=${Date.now()}&_refresh=${Math.random()}&_session=${sessionId}&_nocache=${forceId}&_t=${performance.now()}`;

    const superStrongHeaders = {
      'Cache-Control': 'no-cache, no-store, must-revalidate, max-age=0, proxy-revalidate, no-transform',
      'Pragma': 'no-cache',
      'Expires': '0',
      'If-Modified-Since': 'Thu, 01 Jan 1970 00:00:00 GMT',
      'If-None-Match': '*',
      'X-Requested-With': 'XMLHttpRequest',
      'X-Cache-Bust': fetchTimestamp.toString(),
      'X-Random': fetchRandomId,
      'X-Force-Refresh': 'true',
      'X-Session-ID': sessionId,
      'X-Force-ID': forceId,
      'Accept': 'application/json, text/plain, */*'
    };          const regularResponse = await fetch(`/api/news/fast?${params}${ultraCacheBreaker}`, {
            signal: controller.signal,
            cache: "no-store",
            headers: superStrongHeaders
          });
          
          clearTimeout(timeoutId);

          if (!regularResponse.ok) throw new Error("Failed to fetch articles");

          const regularData = await regularResponse.json();
          // لا ندمج أخباراً مميزة في صفحة قسم الأخبار لتفادي إزاحة أحدث العناصر

          console.log("📊 بيانات الأخبار العادية:", regularData);

          // دمج الأخبار مع التأكد من عدم التكرار
          const regularArticles = regularData.articles || regularData.data || [];

          console.log(`✅ تم جلب ${regularArticles.length} مقال إجمالي`);

          // فحص إضافي: التحقق من البيانات الجديدة لمنع مشكلة كاش المتصفح
          if (reset && regularArticles && regularArticles.length > 0) {
            const latestArticleTime = new Date(regularArticles[0].published_at).getTime();
            const tenMinutesAgo = Date.now() - (10 * 60 * 1000); // آخر 10 دقائق
            
            // إذا كان آخر خبر أقدم من 10 دقائق، أجبر إعادة التحميل القوي
            if (latestArticleTime < tenMinutesAgo && !window.location.search.includes('_forced_reload')) {
              console.warn('🔄 [News Page] البيانات قديمة جداً - إجبار إعادة التحميل القوي...');
              
              // مسح شامل أولاً
              try {
                if (typeof window !== 'undefined') {
                  // مسح localStorage
                  window.localStorage.clear();
                  // مسح sessionStorage
                  window.sessionStorage.clear();
                  // مسح جميع cookies للدومين
                  document.cookie.split(";").forEach(c => {
                    const eqPos = c.indexOf("=");
                    const name = eqPos > -1 ? c.substr(0, eqPos) : c;
                    document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
                  });
                }
              } catch (e) {}
              
              setTimeout(() => {
                window.location.href = window.location.pathname + '?_forced_reload=' + Date.now() + '&_clear_all=1';
              }, 500);
              return;
            }
          }

          if (reset) {
            setArticles(regularArticles);
            setPage(1);
          } else {
            setArticles((prev) => [...prev, ...regularArticles]);
          }

          setHasMore(regularArticles.length === effectiveLimit);
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

  // قاتل الكاش المطلق - يعمل عند فتح الصفحة
  useEffect(() => {
    const destroyAllCache = async () => {
      try {
        console.log('🚨 [Cache Killer] تدمير شامل للكاش...');
        
        // 1. مسح جميع أنواع Web Storage
        if (typeof window !== 'undefined') {
          // localStorage
          try {
            window.localStorage.clear();
          } catch (e) {}
          
          // sessionStorage  
          try {
            window.sessionStorage.clear();
          } catch (e) {}
          
          // IndexedDB
          try {
            if (window.indexedDB) {
              const dbs = ['news', 'articles', 'cache', 'keyval-store'];
              for (const dbName of dbs) {
                window.indexedDB.deleteDatabase(dbName);
              }
            }
          } catch (e) {}
          
          // Service Workers
          if ('serviceWorker' in navigator) {
            const registrations = await navigator.serviceWorker.getRegistrations();
            for (const registration of registrations) {
              await registration.unregister();
            }
          }
          
          // Cache Storage
          if ('caches' in window) {
            const cacheNames = await window.caches.keys();
            for (const cacheName of cacheNames) {
              await window.caches.delete(cacheName);
            }
          }
          
          // إجبار المتصفح على عدم الكاش بتعيين headers
          const metaElements = document.querySelectorAll('meta[http-equiv]');
          metaElements.forEach(el => el.remove());
          
          const noCacheHeaders = [
            ['Cache-Control', 'no-cache, no-store, must-revalidate, max-age=0'],
            ['Pragma', 'no-cache'], 
            ['Expires', '0']
          ];
          
          noCacheHeaders.forEach(([name, content]) => {
            const meta = document.createElement('meta');
            meta.setAttribute('http-equiv', name);
            meta.setAttribute('content', content);
            document.head.appendChild(meta);
          });
          
          console.log('✅ [Cache Killer] تم تدمير جميع أنواع الكاش!');
        }
      } catch (error) {
        console.error('❌ [Cache Killer] خطأ في تدمير الكاش:', error);
      }
    };
    
    destroyAllCache();
  }, []); // يعمل مرة واحدة عند تحميل الصفحة

  // جلب التوصيات الذكية
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
    // جلب سريع أولي لـ 8 عناصر لظهور فوري، ثم يمكن للمستخدم تحميل المزيد
    fetchArticles(true, 8);
  }, [selectedCategory, sortBy]);

  useEffect(() => {
    if (articles.length > 0) {
      fetchStats();
    }
  }, [articles, fetchStats]);

  // تحديث تلقائي للأخبار كل دقيقة + آلية كشف المحتوى الجديد
  useEffect(() => {
    const interval = setInterval(() => {
      // تحديث صامت للأخبار الجديدة فقط إذا لم يكن هناك تحميل جاري
      if (!loading && !isLoadingMore && page === 1) {
        console.log('🔄 تحديث تلقائي للأخبار...');
        
        // محاولة مسح الكاش قبل جلب الأخبار الجديدة
        try {
          // إرسال إشارة لمسح الكاش المحلي
          fetch('/api/news/fast?_clear_cache=1', { method: 'HEAD' }).catch(() => {});
          fetch('/api/articles/featured-fast?_clear_cache=1', { method: 'HEAD' }).catch(() => {});
        } catch (error) {
          console.warn('⚠️ فشل مسح الكاش المحلي:', error);
        }
        
        // تأخير بسيط ثم جلب الأخبار الجديدة
        setTimeout(() => {
          fetchArticles(true, 8);
          setLastFetch(Date.now());
        }, 500); // نصف ثانية لضمان مسح الكاش
      }
    }, REFRESH_INTERVAL);

    return () => clearInterval(interval);
  }, [loading, isLoadingMore, page, fetchArticles]);

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



  // NewsCard component - محسن للأخبار المميزة
  const NewsCard = ({ news }: { news: any }) => {
    const [imageLoading, setImageLoading] = useState(true);
    const isBreaking = Boolean(news.breaking || news.is_breaking || news?.metadata?.breaking);
    const isFeatured = Boolean(news.featured || news.is_featured);
    const baseBg = isBreaking ? 'hsla(0, 78%, 55%, 0.14)' : 'hsl(var(--bg-elevated))';
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
    
    const rawCategorySlug =
      categoryName?.toLowerCase?.() || categoryName || "";
    const mappedCategory = categoryMap[rawCategorySlug] || rawCategorySlug;

    return (
      <div style={{
        background: baseBg,
        border: baseBorder,
        borderRadius: '16px',
        overflow: 'hidden',
        cursor: 'pointer',
        height: '100%',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* صورة المقال */}
        <div style={{
          position: 'relative',
          height: '180px',
          width: '100%',
          background: '#f3f4f6',
          overflow: 'hidden'
        }}>
          <CloudImage
            src={news?.image || news?.featured_image || news?.image_url || null}
            alt={news?.title || "صورة المقال"}
            fill
            className="w-full h-full"
            fit="cover"
            objectPosition="center"
            bgColor="#f3f4f6"
            fallbackType="article"
            priority={false}
          />
        </div>

        {/* محتوى البطاقة */}
        <div style={{
          padding: '16px',
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}>
          {/* ليبل التصنيف فوق العنوان */}
          {categoryName && (
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <span className="featured-label category">
                {categoryName}
              </span>
            </div>
          )}

          {/* العنوان */}
          <h3 style={{
            fontSize: '16px',
            fontWeight: '600',
            color: isBreaking ? 'hsl(0 72% 45%)' : 'hsl(var(--fg))',
            lineHeight: '1.5',
            overflow: 'hidden',
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
            margin: 0
          }}>
            {news.title}
          </h3>

          {/* ليبل مميز/عاجل بعد العنوان */}
          {(isBreaking || isFeatured) && (
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {isBreaking && (
                <span className="featured-label breaking">
                  <span className="icon">⚡</span>
                  عاجل
                </span>
              )}
              {isFeatured && !isBreaking && (
                <span className="featured-label featured">
                  <span className="icon">⭐</span>
                  مميز
                </span>
              )}
            </div>
          )}

          {/* البيانات الوصفية وزر اقرأ المزيد */}
          <div style={{
            marginTop: 'auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px'
          }}>
            {/* معلومات التاريخ والمشاهدات */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              fontSize: '12px',
              color: 'hsl(var(--muted))',
              flex: 1
            }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Clock className="w-3 h-3" />
                {formatDateNumeric(news.published_at || news.created_at)}
              </span>
              <ArticleViews
                count={news.views || news.views_count || 0}
              />
            </div>

            {/* زر اقرأ المزيد */}
            <Link 
              href={getArticleLink(news)} 
              className="read-more-btn"
            >
              اقرأ المزيد
              <ArrowLeft className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>
    );
  };  // عرض الأخبار العادية فقط بدون البطاقات المخصصة
  const renderRegularContent = useCallback(() => {
    if (isMobile) {
      // للموبايل: استخدام OldStyleNewsBlock للأخبار العادية فقط
      return null; // سيتم عرضه في القسم المخصص للموبايل
    } else {
      // للديسكتوب: استخدام NewsCard للأخبار العادية فقط
      return articles.map((article) => (
        <NewsCard key={article.id} news={article} />
      ));
    }
  }, [articles, isMobile]);

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
                    : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
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
                      : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
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
                {articles.length > 0 && (
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    • آخر تحديث: {new Date(lastFetch).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                )}
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
                          : "text-gray-600 dark:text-gray-400"
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
                          : "text-gray-600 dark:text-gray-400"
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
                  {renderRegularContent()}
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
                    // تم إزالة تأثيرات hover
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
