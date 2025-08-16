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

  const getTimeAgo = (date: string): string => {
    const minutes = Math.floor((Date.now() - new Date(date).getTime()) / 60000);
    if (minutes < 60) return `منذ ${minutes} دقيقة`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `منذ ${hours} ساعة`;
    return `منذ ${Math.floor(hours / 24)} يوم`;
  };

  if (loading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 rounded-3xl shadow-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200/50 dark:border-blue-800/30">
        <div className="animate-pulse">
          <div className="h-6 w-48 bg-gray-300 dark:bg-gray-700 rounded mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded"></div>
            <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded"></div>
            <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 rounded-3xl shadow-lg bg-red-50 dark:bg-red-900/20 border border-red-200/50 dark:border-red-800/30 text-center">
        <p className="text-red-600 dark:text-red-400">
          {error}
        </p>
      </div>
    );
  }

  if (insights.length === 0) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 rounded-3xl shadow-lg bg-gray-50 dark:bg-gray-800/50 border border-gray-200/50 dark:border-gray-700/30 text-center">
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
          مؤشرات ذكية ✨
        </h2>
        <p className="text-gray-500 dark:text-gray-400">
          جاري تحليل البيانات... يرجى المحاولة لاحقاً
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 rounded-3xl shadow-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200/50 dark:border-blue-800/30">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-yellow-500">✨</span>
          <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">
            مؤشرات ذكية
          </h2>
        </div>
        <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
          <Clock className="w-3 h-3" />
          <span>آخر تحديث {getTimeAgo(lastUpdate.toISOString())}</span>
        </div>
      </div>

      {/* Insights List */}
      <div className="space-y-3">
        {insights.slice(0, 3).map((insight) => (
          <Link 
            key={insight.id} 
            href={`/article/${insight.slug}`} 
            className="block group"
          >
            <div className="flex items-center gap-2 text-sm font-medium text-gray-800 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
              <span className="text-xl">{insight.icon}</span>
              <span className="flex-1 line-clamp-1">{insight.title}</span>
              <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                {insight.insightTag === 'الأكثر جدلاً' && (
                  <span>{formatNumber(insight.commentCount)}</span>
                )}
                {insight.insightTag === 'صاعد الآن' && (
                  <span>{insight.growthRate.toFixed(0)}%</span>
                )}
                {insight.insightTag === 'الأكثر تداولاً' && (
                  <span>{formatNumber(insight.shareCount)}</span>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* View All Button */}
      <div className="mt-6 text-center">
        <Link 
          href="/ai-insights" 
          className="inline-flex items-center justify-center px-4 py-2 rounded-full text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white transition-colors shadow-md"
        >
          عرض الكل
        </Link>
      </div>
    </div>
  );
}
