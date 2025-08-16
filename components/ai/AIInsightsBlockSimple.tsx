"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Clock } from 'lucide-react';

interface ArticleInsight {
  id: string;
  title: string;
  slug: string;
  category: string;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  shareCount: number;
  growthRate: number;
  trendingScore: number;
  insightTag: string;
  insightColor: string;
  icon: string;
  publishedAt: string;
}

export default function AIInsightsBlockSimple() {
  const [insights, setInsights] = useState<ArticleInsight[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const fetchInsights = async () => {
    try {
      const response = await fetch('/api/ai-insights', {
        cache: 'no-store'
      });
      
      if (!response.ok) throw new Error('Failed to fetch insights');
      
      const data = await response.json();
      if (data.success && data.data) {
        setInsights(data.data);
        setLastUpdate(new Date());
        setError(null);
      } else {
        setError(data.error || 'فشل في تحميل المؤشرات الذكية');
      }
    } catch (err) {
      console.error('Error fetching insights:', err);
      setError('فشل في تحميل المؤشرات الذكية');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInsights();
    
    // تحديث كل 15 دقيقة
    const interval = setInterval(fetchInsights, 15 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}م`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}ك`;
    return num.toString();
  };

  const getTimeAgo = (date: Date): string => {
    const minutes = Math.floor((Date.now() - date.getTime()) / 60000);
    if (minutes < 60) return `منذ ${minutes} دقيقة`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `منذ ${hours} ساعة`;
    return `منذ ${Math.floor(hours / 24)} يوم`;
  };

  const getTooltipText = (insight: ArticleInsight): string => {
    if (insight.insightTag === 'الأكثر جدلاً') {
      return `${insight.commentCount} تعليق مع تباين في الآراء`;
    }
    if (insight.insightTag === 'صاعد الآن') {
      return `ارتفاع ${insight.growthRate.toFixed(0)}% في القراءات خلال الساعة الماضية`;
    }
    if (insight.insightTag === 'الأكثر تداولاً') {
      return `تمت مشاركة الخبر ${insight.shareCount} مرة خارج الموقع`;
    }
    return `${insight.viewCount} مشاهدة`;
  };

  const getInsightStyles = (tag: string) => {
    switch (tag) {
      case 'الأكثر جدلاً':
        return 'text-red-600';
      case 'صاعد الآن':
        return 'text-blue-600';
      case 'الأكثر تداولاً':
        return 'text-green-600';
      default:
        return 'text-gray-600';
    }
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-5 max-h-64">
        <div className="animate-pulse">
          <div className="flex items-center justify-between mb-4">
            <div className="h-5 w-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-3 w-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
          <div className="space-y-3">
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 rounded-2xl shadow-sm p-5 text-center max-h-64">
        <p className="text-red-600 dark:text-red-400 text-sm">
          {error}
        </p>
      </div>
    );
  }

  if (insights.length === 0) {
    return (
      <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl shadow-sm p-5 text-center max-h-64">
        <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-2">
          ✨ مؤشرات ذكية
        </h2>
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          جاري تحليل البيانات...
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-5 relative max-h-64">
      {/* Header - مضغوط */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-1">
          <span className="text-sm">✨</span>
          مؤشرات ذكية
        </h2>
        <div className="flex items-center gap-1 text-[10px] text-gray-400">
          <Clock className="w-2.5 h-2.5" />
          <span>{getTimeAgo(lastUpdate)}</span>
        </div>
      </div>

      {/* قائمة الأخبار - 3 فقط */}
      <div className="space-y-2.5">
        {insights.slice(0, 3).map((insight) => (
          <div key={insight.id} className="relative">
            <Link 
              href={`/article/${insight.slug}`} 
              className="block group"
              onMouseEnter={() => setHoveredId(insight.id)}
              onMouseLeave={() => setHoveredId(null)}
            >
              <div className="flex items-center gap-2 text-[13px]">
                <span className={`text-base ${getInsightStyles(insight.insightTag)}`}>
                  {insight.icon}
                </span>
                <span className="flex-1 text-gray-700 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200 line-clamp-1">
                  {insight.title}
                </span>
                <span className={`text-[11px] font-medium ${getInsightStyles(insight.insightTag)}`}>
                  {insight.insightTag === 'الأكثر جدلاً' && formatNumber(insight.commentCount)}
                  {insight.insightTag === 'صاعد الآن' && `+${insight.growthRate.toFixed(0)}%`}
                  {insight.insightTag === 'الأكثر تداولاً' && formatNumber(insight.shareCount)}
                </span>
              </div>
            </Link>
            
            {/* Tooltip بسيط */}
            {hoveredId === insight.id && (
              <div className="absolute z-10 bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1.5 bg-gray-900 dark:bg-gray-700 text-white text-[11px] rounded-lg whitespace-nowrap shadow-lg">
                <div className="absolute bottom-[-4px] left-1/2 transform -translate-x-1/2 w-2 h-2 bg-gray-900 dark:bg-gray-700 rotate-45"></div>
                {getTooltipText(insight)}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* زر عرض الكل - صغير */}
      <div className="mt-4 text-center">
        <Link 
          href="/ai-insights" 
          className="inline-flex items-center justify-center px-3 py-1.5 rounded-full text-xs font-medium bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 transition-colors"
        >
          عرض الكل
        </Link>
      </div>
    </div>
  );
}
