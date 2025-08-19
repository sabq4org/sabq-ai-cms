"use client";

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { Eye, MessageCircle, Clock, Sparkles, Brain, TrendingUp, Share2, AlertTriangle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

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

export default function AIInsightsBlock() {
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
      <div className="w-full">
        <Card className="rounded-2xl border border-gray-200 dark:border-gray-800 p-4 shadow-sm bg-white/70 dark:bg-gray-900/60">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600">
                <Brain className="w-4 h-4 text-white" />
              </div>
              <span className="text-sm font-bold text-gray-900 dark:text-gray-100">مؤشرات ذكية</span>
            </div>
            <Skeleton className="h-3 w-24" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-[85%]" />
            <Skeleton className="h-6 w-[70%]" />
          </div>
          <div className="mt-3 flex justify-end">
            <Skeleton className="h-7 w-20" />
          </div>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="p-8 bg-red-50 dark:bg-red-900/20 rounded-xl">
            <p className="text-red-600 dark:text-red-400">
              {error}
            </p>
          </div>
        </div>
      </section>
    );
  }

  // عرض رسالة عندما لا توجد مؤشرات
  if (insights.length === 0) {
    return (
      <div className="w-full">
        <Card className="rounded-2xl border border-gray-200 dark:border-gray-800 p-4 shadow-sm bg-white/70 dark:bg-gray-900/60">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600">
                <Brain className="w-4 h-4 text-white" />
              </div>
              <span className="text-sm font-bold text-gray-900 dark:text-gray-100">مؤشرات ذكية</span>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-gray-500">
              <Clock className="w-3 h-3" />
              <span>يتم التحديث كل 15 دقيقة</span>
            </div>
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400 py-6 text-center">لا توجد مؤشرات حالياً</div>
          <div className="mt-3 flex justify-end">
            <Link href="/trends-demo" className="text-[11px] px-2.5 py-1.5 rounded-md border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300">عرض الكل</Link>
          </div>
        </Card>
      </div>
    );
  }

  // تحضير أفضل 3 عناصر فقط
  const topThree = useMemo(() => insights.slice(0, 3), [insights]);

  // تحديد المؤشر الذكي لكل عنصر (ألوان: أحمر/أزرق/أخضر)
  function getIndicator(i: ArticleInsight): { label: string; colorClass: string; icon: JSX.Element; tooltip: string } {
    // الأكثر جدلاً (تعليقات عالية)
    if (i.commentCount >= 30) {
      return {
        label: 'الأكثر جدلاً',
        colorClass: 'text-red-600 bg-red-50 dark:text-red-300 dark:bg-red-900/20',
        icon: <AlertTriangle className="w-3.5 h-3.5" />,
        tooltip: `تعليقات مرتفعة (${i.commentCount}) خلال فترة وجيزة`,
      };
    }
    // صاعد الآن (نمو قوي خلال الساعة)
    if (i.growthRate > 50) {
      return {
        label: 'صاعد الآن',
        colorClass: 'text-blue-600 bg-blue-50 dark:text-blue-300 dark:bg-blue-900/20',
        icon: <TrendingUp className="w-3.5 h-3.5" />,
        tooltip: `نمو سريع في القراءات (+${Math.round(i.growthRate)}% ساعة)`,
      };
    }
    // الأكثر تداولاً (مشاركات عالية)
    if (i.shareCount >= 50) {
      return {
        label: 'الأكثر تداولاً',
        colorClass: 'text-green-600 bg-green-50 dark:text-green-300 dark:bg-green-900/20',
        icon: <Share2 className="w-3.5 h-3.5" />,
        tooltip: `تمت مشاركة الخبر ${i.shareCount} مرة`,
      };
    }
    // افتراضي
    return {
      label: i.insightTag || 'مميز',
      colorClass: 'text-gray-600 bg-gray-50 dark:text-gray-300 dark:bg-gray-800/60',
      icon: <Sparkles className="w-3.5 h-3.5" />,
      tooltip: 'خبر بارز وفق خوارزمية الترند',
    };
  }

  return (
    <div className="w-full">
      <TooltipProvider>
        <Card className="rounded-2xl border border-gray-200 dark:border-gray-800 p-4 shadow-sm bg-white/70 dark:bg-gray-900/60">
          {/* العنوان وأخر تحديث */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600">
                <Brain className="w-4 h-4 text-white" />
              </div>
              <span className="text-sm font-bold text-gray-900 dark:text-gray-100">مؤشرات ذكية</span>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-gray-500">
              <Clock className="w-3 h-3" />
              <span>آخر تحديث {getTimeAgo(lastUpdate.toISOString())}</span>
            </div>
          </div>

          {/* العناصر (3 أسطر فقط) */}
          <ul className="space-y-2">
            {topThree.map((item) => {
              const ind = getIndicator(item);
              return (
                <li key={item.id} className="flex items-center justify-between gap-3 text-[13px]">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex items-center gap-2 min-w-0">
                        <span className={cn('inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-semibold', ind.colorClass)}>
                          {ind.icon}
                          {ind.label}
                        </span>
                        <Link
                          href={`/news/${item.slug}`}
                          className="truncate text-gray-800 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400"
                        >
                          {item.title}
                        </Link>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <span className="text-xs">{ind.tooltip}</span>
                    </TooltipContent>
                  </Tooltip>
                  <div className="flex items-center gap-3 shrink-0 text-[12px] text-gray-500 dark:text-gray-400">
                    <span className="inline-flex items-center gap-1"><Eye className="w-3.5 h-3.5" /> {formatNumber(item.viewCount)}</span>
                    <span className="inline-flex items-center gap-1"><MessageCircle className="w-3.5 h-3.5" /> {formatNumber(item.commentCount)}</span>
                  </div>
                </li>
              );
            })}
          </ul>

          {/* زر عرض الكل */}
          <div className="mt-3 flex justify-end">
            <Link href="/trends-demo" className="text-[11px] px-2.5 py-1.5 rounded-md border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300">
              عرض الكل
            </Link>
          </div>
        </Card>
      </TooltipProvider>
    </div>
  );
}
