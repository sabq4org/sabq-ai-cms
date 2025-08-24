'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Newspaper, Tag, Calendar, TrendingUp, TrendingDown, Minus } from 'lucide-react';

type Trend = 'up' | 'down' | 'stable';

interface StatsData {
  totalArticles: number;
  totalCategories: number;
  todayArticles: number;
  dailyChangePercentage?: number;
  trend?: Trend;
}

export default function LiteStatsBar() {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);

  // بيانات افتراضية لضمان الظهور حتى قبل وصول API
  const defaultStats: StatsData = {
    totalArticles: 0,
    totalCategories: 0,
    todayArticles: 0,
    trend: 'stable'
  };

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch('/api/stats/summary', { cache: 'no-store' });
        if (!res.ok) throw new Error('failed');
        const data = await res.json();
        setStats({
          totalArticles: data.totalArticles ?? 0,
          totalCategories: data.totalCategories ?? 0,
          todayArticles: data.todayArticles ?? 0,
          dailyChangePercentage: data.dailyChangePercentage,
          trend: (data.trend as Trend) ?? 'stable',
        });
      } catch {
        setStats(defaultStats);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const getTrendIcon = (trend?: Trend) => {
    if (trend === 'up') return <TrendingUp className="w-3 h-3 text-green-600" />;
    if (trend === 'down') return <TrendingDown className="w-3 h-3 text-red-600" />;
    return <Minus className="w-3 h-3 text-gray-500" />;
  };

  const s = stats ?? defaultStats;

  return (
    <div className="compact-stats-bar enhanced-mobile-stats py-1.5 px-0 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 w-full">
      <div className="w-full flex items-center justify-between gap-3 text-sm leading-none px-4">
        {/* الأخبار */}
        <Link href="/news" className="flex items-center gap-2 flex-1 justify-center hover:bg-gray-100/50 dark:hover:bg-gray-800/50 rounded-lg p-2 transition-colors">
          <span className="stats-icon-container p-1 rounded-lg bg-blue-100 dark:bg-blue-900/30">
            <Newspaper className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          </span>
          <div>
            <div className="text-xs text-gray-600 dark:text-gray-400">الأخبار</div>
            <div className="stats-number font-bold text-gray-900 dark:text-white">
              {Number(s.totalArticles || 0).toLocaleString('en-US')}
            </div>
          </div>
        </Link>

        {/* الأقسام */}
        <Link href="/categories" className="flex items-center gap-2 flex-1 justify-center hover:bg-gray-100/50 dark:hover:bg-gray-800/50 rounded-lg p-2 transition-colors">
          <span className="stats-icon-container p-1 rounded-lg bg-blue-100 dark:bg-blue-900/30">
            <Tag className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          </span>
          <div>
            <div className="text-xs text-gray-600 dark:text-gray-400">الأقسام</div>
            <div className="stats-number font-bold text-gray-900 dark:text-white">
              {Number(s.totalCategories || 0).toLocaleString('en-US')}
            </div>
          </div>
        </Link>

        {/* أخبار اليوم */}
        <div className="flex items-center gap-2 flex-1 justify-center p-2">
          <span className="stats-icon-container p-1 rounded-lg bg-blue-100 dark:bg-blue-900/30">
            <Calendar className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          </span>
          <div>
            <div className="text-xs text-gray-600 dark:text-gray-400">أخبار اليوم</div>
            <div className="flex items-center gap-1">
              <span className="stats-number font-bold text-gray-900 dark:text-white">
                {Number(s.todayArticles || 0).toLocaleString('en-US')}
              </span>
              <span className="trend-indicator flex items-center gap-0.5">
                {getTrendIcon(s.trend)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


