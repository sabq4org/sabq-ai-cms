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

  if (!stats && !loading) {
    return null;
  }

  // تحقق من صحة البيانات وتجنب NaN
  const isCompactMobileStats = true;
  const safeStats = {
    totalArticles: stats?.totalArticles || 0,
    totalCategories: stats?.totalCategories || 0,
    todayArticles: stats?.todayArticles || 0,
    trend: stats?.trend || 'stable',
    dailyChangePercentage: typeof stats?.dailyChangePercentage === 'number' && !isNaN(stats.dailyChangePercentage) ? stats.dailyChangePercentage : 0
  };

  return (
    <div className={`w-full py-2 px-3 ${
      darkMode 
        ? 'bg-gradient-to-r from-gray-800/95 to-gray-900/95 border-b border-gray-700/50' 
        : 'bg-gradient-to-r from-blue-50/80 to-purple-50/80 border-b border-gray-200/50'
    } backdrop-blur-sm`}>
      {/* Grid Layout متوازن للموبايل */}
      <div className="grid grid-cols-3 gap-2 max-w-md mx-auto">
        
        {/* عدد الأخبار */}
        <a href="/news" className="group block text-center hover:scale-[1.02] transition-all duration-200">
          <div className={`px-2 py-1.5 rounded-lg ${
            darkMode ? 'bg-blue-900/20 group-hover:bg-blue-900/30' : 'bg-blue-100/70 group-hover:bg-blue-100'
          } transition-colors`}>
            {/* الأيقونة أعلى */}
            <div className="flex justify-center mb-1">
              <Newspaper className={`w-4 h-4 ${
                darkMode ? 'text-blue-400' : 'text-blue-600'
              }`} />
            </div>
            {/* الرقم بخط عريض */}
            <div className={`text-lg font-bold leading-none ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {loading ? (
                <div className="w-8 h-4 bg-gray-300 dark:bg-gray-600 rounded mx-auto animate-pulse"></div>
              ) : (
                safeStats.totalArticles.toLocaleString('ar')
              )}
            </div>
            {/* التسمية أسفل الرقم */}
            <div className={`text-xs mt-0.5 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              الأخبار
            </div>
          </div>
        </a>

        {/* عدد الأقسام */}
        <a href="/categories" className="group block text-center hover:scale-[1.02] transition-all duration-200">
          <div className={`px-2 py-1.5 rounded-lg ${
            darkMode ? 'bg-purple-900/20 group-hover:bg-purple-900/30' : 'bg-purple-100/70 group-hover:bg-purple-100'
          } transition-colors`}>
            {/* الأيقونة أعلى */}
            <div className="flex justify-center mb-1">
              <Tag className={`w-4 h-4 ${
                darkMode ? 'text-purple-400' : 'text-purple-600'
              }`} />
            </div>
            {/* الرقم بخط عريض */}
            <div className={`text-lg font-bold leading-none ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {loading ? (
                <div className="w-6 h-4 bg-gray-300 dark:bg-gray-600 rounded mx-auto animate-pulse"></div>
              ) : (
                safeStats.totalCategories.toLocaleString('ar')
              )}
            </div>
            {/* التسمية أسفل الرقم */}
            <div className={`text-xs mt-0.5 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              الأقسام
            </div>
          </div>
        </a>

        {/* أخبار اليوم مع مؤشر التغيير */}
        <a href="/moment-by-moment" className="group block text-center hover:scale-[1.02] transition-all duration-200">
          <div className={`px-2 py-1.5 rounded-lg ${
            darkMode ? 'bg-green-900/20 group-hover:bg-green-900/30' : 'bg-green-100/70 group-hover:bg-green-100'
          } transition-colors`}>
            {/* الأيقونة أعلى */}
            <div className="flex justify-center mb-1">
              <Calendar className={`w-4 h-4 ${
                darkMode ? 'text-green-400' : 'text-green-600'
              }`} />
            </div>
            {/* الرقم مع المؤشر */}
            <div className="flex items-center justify-center gap-1">
              <span className={`text-lg font-bold leading-none ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {loading ? (
                  <div className="w-6 h-4 bg-gray-300 dark:bg-gray-600 rounded animate-pulse"></div>
                ) : (
                  safeStats.todayArticles.toLocaleString('ar')
                )}
              </span>
              {/* مؤشر التغيير - يظهر فقط إذا كان صالح */}
              {!loading && safeStats.trend !== 'stable' && safeStats.dailyChangePercentage > 0 && (
                <div className="flex items-center">
                  {getTrendIcon(safeStats.trend)}
                  <span className={`text-xs ${
                    safeStats.trend === 'up' ? 'text-green-500' : 'text-red-500'
                  }`}>
                    {Math.abs(safeStats.dailyChangePercentage).toFixed(0)}%
                  </span>
                </div>
              )}
            </div>
            {/* التسمية أسفل الرقم */}
            <div className={`text-xs mt-0.5 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              اليوم
            </div>
          </div>
        </a>
      </div>
    </div>
  );
}
