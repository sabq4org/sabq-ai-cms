"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { ar } from "date-fns/locale";

interface Recommendation {
  id: string;
  title: string;
  slug: string;
  featured_image: string | null;
  published_at: string | null;
  views: number;
  excerpt: string | null;
  relevance_score: number;
}

interface OptimizedRecommendationsProps {
  articleId: string;
  limit?: number;
  className?: string;
  showPerformance?: boolean;
}

export default function OptimizedRecommendations({
  articleId,
  limit = 5,
  className = "",
  showPerformance = false
}: OptimizedRecommendationsProps) {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [performance, setPerformance] = useState<any>(null);
  
  const abortControllerRef = useRef<AbortController | null>(null);
  const hasLoadedRef = useRef(false);

  useEffect(() => {
    // تجنب التحميل المتكرر
    if (hasLoadedRef.current && recommendations.length > 0) return;
    
    const fetchRecommendations = async () => {
      // إلغاء الطلب السابق
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      
      const controller = new AbortController();
      abortControllerRef.current = controller;
      
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch(
          `/api/ai-recommendations/optimized?articleId=${articleId}&limit=${limit}`,
          {
            signal: controller.signal,
            headers: {
              'Cache-Control': 'max-age=300',
              'Accept': 'application/json'
            }
          }
        );
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: فشل في جلب التوصيات`);
        }
        
        const data = await response.json();
        
        if (data.success) {
          setRecommendations(data.recommendations || []);
          setPerformance(data.performance);
          hasLoadedRef.current = true;
        } else {
          throw new Error(data.error || "فشل في جلب التوصيات");
        }
        
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          console.error("خطأ في جلب التوصيات:", err);
          setError(err.message || "حدث خطأ في تحميل التوصيات");
        }
      } finally {
        setLoading(false);
      }
    };

    if (articleId) {
      fetchRecommendations();
    }
    
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [articleId, limit]);

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

  // عرض حالة التحميل
  if (loading) {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="flex items-center gap-2 text-gray-600">
          <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-sm">جاري تحميل التوصيات...</span>
        </div>
        
        {/* Skeleton loading */}
        <div className="space-y-3">
          {Array.from({ length: 3 }, (_, i) => (
            <div key={i} className="flex gap-3 p-3 border rounded-lg animate-pulse">
              <div className="w-16 h-16 bg-gray-200 rounded-lg flex-shrink-0"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // عرض الخطأ
  if (error) {
    return (
      <div className={`p-4 bg-red-50 border border-red-200 rounded-lg ${className}`}>
        <div className="flex items-center gap-2 text-red-600 text-sm">
          <span>⚠️</span>
          <span>{error}</span>
        </div>
      </div>
    );
  }

  // عدم وجود توصيات
  if (recommendations.length === 0) {
    return (
      <div className={`p-4 bg-gray-50 border border-gray-200 rounded-lg text-center ${className}`}>
        <div className="text-gray-500 text-sm">
          <span className="block mb-2">🔍</span>
          لا توجد توصيات متاحة حالياً
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* معلومات الأداء للمطورين */}
      {showPerformance && performance && (
        <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
          ⚡ تحميل التوصيات: {performance.duration}ms
          {performance.cached && " (من الكاش)"}
          • {recommendations.length} توصية
        </div>
      )}

      {/* قائمة التوصيات */}
      <div className="space-y-3">
        {recommendations.map((recommendation, index) => (
          <Link
            key={recommendation.id}
            href={`/news/${recommendation.slug}`}
            className="group flex gap-3 p-3 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50/50 transition-all duration-200"
          >
            {/* صورة المقال */}
            <div className="relative w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
              {recommendation.featured_image ? (
                <Image
                  src={recommendation.featured_image}
                  alt={recommendation.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-200"
                  sizes="64px"
                  loading={index < 2 ? "eager" : "lazy"}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  📰
                </div>
              )}
            </div>

            {/* محتوى التوصية */}
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-gray-900 text-sm leading-tight mb-1 group-hover:text-blue-600 transition-colors line-clamp-2">
                {recommendation.title}
              </h4>
              
              {recommendation.excerpt && (
                <p className="text-gray-600 text-xs mb-2 line-clamp-1">
                  {recommendation.excerpt}
                </p>
              )}
              
              <div className="flex justify-between items-center text-xs text-gray-500">
                <span>{formatDate(recommendation.published_at)}</span>
                {recommendation.views > 0 && (
                  <span className="flex items-center gap-1">
                    👁️ {recommendation.views.toLocaleString('ar')}
                  </span>
                )}
              </div>
            </div>

            {/* نقاط الصلة (للمطورين فقط) */}
            {showPerformance && (
              <div className="text-xs text-gray-400 self-start">
                {Math.round(recommendation.relevance_score)}
              </div>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}
