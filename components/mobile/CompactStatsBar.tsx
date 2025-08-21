'use client';

import React, { useEffect, useState } from 'react';
import { Newspaper, Tag, Calendar, TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface StatsData {
  totalArticles: number;
  totalCategories: number;
  todayArticles: number;
  dailyChange: number;
  dailyChangePercentage: number;
  trend: 'up' | 'down' | 'stable';
}

interface CompactStatsBarProps {
  darkMode?: boolean;
}

export default function CompactStatsBar({ darkMode = false }: CompactStatsBarProps) {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  
  console.log('🔍 CompactStatsBar تم تحميله');

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 60000); // تحديث كل دقيقة
    return () => clearInterval(interval);
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/stats/summary');
      if (response.ok) {
        const data = await response.json();
        setStats({
          totalArticles: data.totalArticles || 0,
          totalCategories: data.totalCategories || 12,
          todayArticles: data.todayArticles || 0,
          dailyChange: data.dailyChange || 0,
          dailyChangePercentage: data.dailyChangePercentage || 0,
          trend: data.trend || 'stable'
        });
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-3 h-3 text-green-500" />;
      case 'down':
        return <TrendingDown className="w-3 h-3 text-red-500" />;
      default:
        return <Minus className="w-3 h-3 text-gray-500" />;
    }
  };

  if (loading) {
    return (
      <div className={`${darkMode ? 'bg-gray-800' : 'bg-gradient-to-r from-blue-50 to-purple-50'} py-2 px-4`}>
        <div className="flex justify-around items-center">
          {[1, 2, 3].map(i => (
            <div key={i} className="animate-pulse">
              <div className="h-4 w-16 bg-gray-300 dark:bg-gray-600 rounded mb-1"></div>
              <div className="h-6 w-12 bg-gray-300 dark:bg-gray-600 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`${
      darkMode 
        ? 'bg-gradient-to-r from-gray-800 to-gray-700' 
        : 'bg-gradient-to-r from-blue-50 to-purple-50'
    } py-3 px-4 border-b border-gray-200 dark:border-gray-700`}>
      <div className="flex justify-around items-center text-sm">
        {/* الأخبار */}
        <div className="flex items-center gap-2 hover:scale-105 transition-transform">
          <div className="p-1.5 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
            <Newspaper className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <div className="text-xs text-gray-600 dark:text-gray-400">الأخبار</div>
            <div className="font-bold text-gray-900 dark:text-white">
              {stats?.totalArticles.toLocaleString('ar-SA') || '0'}
            </div>
          </div>
        </div>

        {/* الأقسام */}
        <div className="flex items-center gap-2 hover:scale-105 transition-transform">
          <div className="p-1.5 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
            <Tag className="w-4 h-4 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <div className="text-xs text-gray-600 dark:text-gray-400">الأقسام</div>
            <div className="font-bold text-gray-900 dark:text-white">
              {stats?.totalCategories || '12'}
            </div>
          </div>
        </div>

        {/* أخبار اليوم */}
        <div className="flex items-center gap-2 hover:scale-105 transition-transform">
          <div className="p-1.5 bg-green-100 dark:bg-green-900/30 rounded-lg">
            <Calendar className="w-4 h-4 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <div className="text-xs text-gray-600 dark:text-gray-400">أخبار اليوم</div>
            <div className="flex items-center gap-1">
              <span className="font-bold text-gray-900 dark:text-white">
                {stats?.todayArticles || '0'}
              </span>
              {stats?.trend && (
                <span className="flex items-center gap-0.5">
                  {getTrendIcon(stats.trend)}
                  {stats.dailyChangePercentage !== 0 && (
                    <span className={`text-xs ${
                      stats.trend === 'up' ? 'text-green-600' : 
                      stats.trend === 'down' ? 'text-red-600' : 
                      'text-gray-600'
                    }`}>
                      {stats.dailyChangePercentage > 0 ? '+' : ''}{stats.dailyChangePercentage}%
                    </span>
                  )}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
