'use client';

import React, { useEffect, useState } from 'react';
import { Newspaper, Tag, Calendar } from 'lucide-react';

interface StatsData {
  totalArticles: number;
  totalCategories: number;
  todayArticles: number;
  dailyChange: number;
  dailyChangePercentage: number;
  trend: 'up' | 'down' | 'stable';
  activeUsers: number;
  lastUpdated: string;
}

interface MobileStatsBarProps {
  darkMode: boolean;
}

export default function CompactStatsBar({ darkMode }: MobileStatsBarProps) {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
    // تحديث كل 5 دقائق
    const interval = setInterval(fetchStats, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/stats/summary');
      const data = await response.json();
      
      if (data.success) {
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!stats && !loading) {
    return null;
  }

  // تحقق من صحة البيانات
  const safeStats = {
    totalArticles: stats?.totalArticles || 0,
    totalCategories: stats?.totalCategories || 0,
    todayArticles: stats?.todayArticles || 0,
  };

  return (
    <div className={`w-full py-1.5 px-3 ${
      darkMode 
        ? 'bg-gray-800/30 border-b border-gray-700/20' 
        : 'bg-white border-b border-gray-200/40'
    }`}>
      {/* خلية واحدة متناسقة */}
      <div className={`flex items-center justify-around py-2 px-4 rounded-lg ${
        darkMode 
          ? 'bg-gray-900/20' 
          : 'bg-[#f5f5f5]'
      } shadow-sm`}>
        
        {/* عدد الأقسام */}
        <a href="/categories" className="flex items-center gap-1.5 hover:opacity-70 transition-opacity">
          <Tag className={`w-3.5 h-3.5 ${
            darkMode ? 'text-gray-500' : 'text-gray-500'
          }`} />
          <div className="flex flex-col">
            <span className={`text-[10px] leading-tight ${
              darkMode ? 'text-gray-500' : 'text-gray-500'
            }`}>
              الأقسام
            </span>
            <span className={`text-base font-semibold leading-tight ${
              darkMode ? 'text-gray-100' : 'text-gray-800'
            }`}>
              {loading ? (
                <span className="inline-block w-4 h-3.5 bg-gray-300 dark:bg-gray-600 rounded animate-pulse"></span>
              ) : (
                safeStats.totalCategories
              )}
            </span>
          </div>
        </a>

        {/* فاصل */}
        <div className={`h-6 w-[1px] ${
          darkMode ? 'bg-gray-700/50' : 'bg-gray-300/50'
        }`}></div>

        {/* عدد الأخبار */}
        <a href="/news" className="flex items-center gap-1.5 hover:opacity-70 transition-opacity">
          <Newspaper className={`w-3.5 h-3.5 ${
            darkMode ? 'text-gray-500' : 'text-gray-500'
          }`} />
          <div className="flex flex-col">
            <span className={`text-[10px] leading-tight ${
              darkMode ? 'text-gray-500' : 'text-gray-500'
            }`}>
              الأخبار
            </span>
            <span className={`text-base font-semibold leading-tight ${
              darkMode ? 'text-gray-100' : 'text-gray-800'
            }`}>
              {loading ? (
                <span className="inline-block w-8 h-3.5 bg-gray-300 dark:bg-gray-600 rounded animate-pulse"></span>
              ) : (
                safeStats.totalArticles.toLocaleString('ar')
              )}
            </span>
          </div>
        </a>

        {/* فاصل */}
        <div className={`h-6 w-[1px] ${
          darkMode ? 'bg-gray-700/50' : 'bg-gray-300/50'
        }`}></div>

        {/* أخبار اليوم */}
        <a href="/moment-by-moment" className="flex items-center gap-1.5 hover:opacity-70 transition-opacity">
          <Calendar className={`w-3.5 h-3.5 ${
            darkMode ? 'text-gray-500' : 'text-gray-500'
          }`} />
          <div className="flex flex-col">
            <span className={`text-[10px] leading-tight ${
              darkMode ? 'text-gray-500' : 'text-gray-500'
            }`}>
              أخبار اليوم
            </span>
            <span className={`text-base font-semibold leading-tight ${
              darkMode ? 'text-gray-100' : 'text-gray-800'
            }`}>
              {loading ? (
                <span className="inline-block w-4 h-3.5 bg-gray-300 dark:bg-gray-600 rounded animate-pulse"></span>
              ) : (
                safeStats.todayArticles
              )}
            </span>
          </div>
        </a>
      </div>
    </div>
  );
}
