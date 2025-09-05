"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { ar } from "date-fns/locale";

interface Article {
  id: string;
  title: string;
  slug: string;
  featured_image: string | null;
  published_at: string | null;
  views: number;
  excerpt: string | null;
  featured: boolean;
  category_id: string | null;
}

interface NewsStats {
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
  type: string;
}

interface OptimizedNewsProps {
  type?: "latest" | "featured" | "trending";
  limit?: number;
  category?: string;
  showStats?: boolean;
  className?: string;
  excludeIds?: string[];
}

export default function OptimizedNews({
  type = "latest",
  limit = 12,
  category,
  showStats = true,
  className = "",
  excludeIds = []
}: OptimizedNewsProps) {
  const [articles, setArticles] = useState<Article[]>([]);
  const [stats, setStats] = useState<NewsStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [performance, setPerformance] = useState<any>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  
  const abortControllerRef = useRef<AbortController | null>(null);
  const lastRequestRef = useRef<string>("");

  const fetchNews = useCallback(async (pageNum: number = 1, append: boolean = false) => {
    // إلغاء الطلب السابق إذا كان جارياً
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    const controller = new AbortController();
    abortControllerRef.current = controller;
    
    const queryParams = new URLSearchParams({
      limit: limit.toString(),
      page: pageNum.toString(),
      type,
      noCount: pageNum > 1 ? "1" : "0" // تجنب count في الصفحات التالية
    });
    
    if (category) queryParams.set("category", category);
    if (excludeIds.length > 0) queryParams.set("exclude", excludeIds.join(","));
    
    const requestKey = queryParams.toString();
    
    // تجنب الطلبات المكررة
    if (lastRequestRef.current === requestKey && !append) {
      return;
    }
    lastRequestRef.current = requestKey;
    
    try {
      if (!append) setLoading(true);
      else setLoadingMore(true);
      
      setError(null);
      
      const response = await fetch(`/api/news/optimized?${queryParams}`, {
        signal: controller.signal,
        headers: {
          'Cache-Control': 'max-age=60',
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        if (append) {
          setArticles(prev => [...prev, ...data.articles]);
        } else {
          setArticles(data.articles);
        }
        setStats(data.stats);
        setHasMore(data.stats?.hasMore || false);
        setPerformance(data.performance);
      } else {
        throw new Error(data.error || "فشل في جلب الأخبار");
      }
      
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        console.error("خطأ في جلب الأخبار:", err);
        setError(err.message || "حدث خطأ في تحميل الأخبار");
      }
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [type, limit, category, excludeIds]);

  // تحميل البيانات الأولية
  useEffect(() => {
    setPage(1);
    fetchNews(1, false);
    
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchNews]);

  // تحميل المزيد
  const loadMore = useCallback(() => {
    if (!hasMore || loadingMore) return;
    const nextPage = page + 1;
    setPage(nextPage);
    fetchNews(nextPage, true);
  }, [hasMore, loadingMore, page, fetchNews]);

  // تنسيق التاريخ
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "منذ قليل";
    try {
      return formatDistanceToNow(new Date(dateString), { 
        addSuffix: true, 
        locale: ar 
      });
    } catch {
      return "منذ قليل";
    }
  };

  // عرض الخطأ
  if (error) {
    return (
      <div className={`p-6 text-center bg-red-50 rounded-lg border border-red-200 ${className}`}>
        <div className="text-red-600 mb-3">⚠️ خطأ في تحميل الأخبار</div>
        <p className="text-red-700 text-sm mb-4">{error}</p>
        <button 
          onClick={() => fetchNews(1, false)}
          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
        >
          إعادة المحاولة
        </button>
      </div>
    );
  }

  return (
    <div className={`w-full ${className}`}>
      {/* إحصائيات الأداء للمطورين */}
      {showStats && performance && (
        <div className="mb-4 p-3 bg-gray-50 rounded-lg text-xs text-gray-600">
          ⚡ تم التحميل في {performance.duration}ms 
          {performance.cached && " (من الكاش)"}
          {stats && ` • ${stats.total} خبر • صفحة ${stats.page}`}
        </div>
      )}

      {/* عرض التحميل */}
      {loading && articles.length === 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: limit }, (_, i) => (
            <div key={i} className="bg-white rounded-lg shadow-sm border animate-pulse">
              <div className="w-full h-48 bg-gray-200 rounded-t-lg"></div>
              <div className="p-4">
                <div className="h-4 bg-gray-200 rounded mb-3"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* قائمة الأخبار */}
      {articles.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map((article, index) => (
            <Link 
              key={`${article.id}-${index}`} 
              href={`/news/${article.slug}`}
              className="group block bg-white rounded-lg shadow-sm border hover:shadow-md transition-all duration-200"
            >
              {/* صورة المقال */}
              <div className="relative w-full h-48 rounded-t-lg overflow-hidden">
                {article.featured_image ? (
                  <Image
                    src={article.featured_image}
                    alt={article.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-200"
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    loading={index < 6 ? "eager" : "lazy"}
                  />
                ) : (
                  <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                    <span className="text-gray-400 text-2xl">📰</span>
                  </div>
                )}
                
                {/* شارة المقال المميز */}
                {article.featured && (
                  <div className="absolute top-3 right-3 bg-red-600 text-white text-xs px-2 py-1 rounded-full">
                    مميز
                  </div>
                )}
              </div>

              {/* محتوى المقال */}
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 text-lg leading-tight mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
                  {article.title}
                </h3>
                
                {article.excerpt && (
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                    {article.excerpt}
                  </p>
                )}
                
                {/* معلومات إضافية */}
                <div className="flex justify-between items-center text-xs text-gray-500">
                  <span>{formatDate(article.published_at)}</span>
                  {article.views > 0 && (
                    <span className="flex items-center gap-1">
                      👁️ {article.views.toLocaleString('ar')}
                    </span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* زر تحميل المزيد */}
      {hasMore && !loading && (
        <div className="text-center mt-8">
          <button
            onClick={loadMore}
            disabled={loadingMore}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loadingMore ? (
              <span className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                جاري التحميل...
              </span>
            ) : (
              "تحميل المزيد"
            )}
          </button>
        </div>
      )}

      {/* رسالة عند عدم وجود أخبار */}
      {!loading && articles.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">📰</div>
          <h3 className="text-gray-600 text-lg mb-2">لا توجد أخبار متاحة</h3>
          <p className="text-gray-500 text-sm">تحقق مرة أخرى لاحقاً للحصول على آخر الأخبار</p>
        </div>
      )}
    </div>
  );
}
