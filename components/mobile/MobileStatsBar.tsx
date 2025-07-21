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

export default function MobileStatsBar({ darkMode }: MobileStatsBarProps) {
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

  return (
    <div className={`w-full py-2 px-3 ${
      darkMode 
        ? 'bg-gradient-to-r from-gray-800 to-gray-900 border-b border-gray-700' 
        : 'bg-gradient-to-r from-blue-50 to-purple-50 border-b border-gray-200'
    }`}>
      <div className="flex items-center justify-around">
        {/* عدد الأخبار */}
        <a href="/news" className="flex items-center gap-1.5 hover:scale-105 transition-transform">
          <div className={`p-1 rounded-lg ${
            darkMode ? 'bg-blue-900/30' : 'bg-blue-100'
          }`}>
            <Newspaper className={`w-3.5 h-3.5 ${
              darkMode ? 'text-blue-400' : 'text-blue-600'
            }`} />
          </div>
          <div>
            <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              الأخبار
            </p>
            <p className={`text-sm font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {loading ? (
                <span className="inline-block w-12 h-3 bg-gray-300 dark:bg-gray-600 rounded animate-pulse"></span>
              ) : (
                stats?.totalArticles.toLocaleString()
              )}
            </p>
          </div>
        </a>

        {/* عدد الأقسام */}
        <a href="/categories" className="flex items-center gap-1.5 hover:scale-105 transition-transform">
          <div className={`p-1 rounded-lg ${
            darkMode ? 'bg-purple-900/30' : 'bg-purple-100'
          }`}>
            <Tag className={`w-3.5 h-3.5 ${
              darkMode ? 'text-purple-400' : 'text-purple-600'
            }`} />
          </div>
          <div>
            <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              الأقسام
            </p>
            <p className={`text-sm font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {loading ? (
                <span className="inline-block w-8 h-3 bg-gray-300 dark:bg-gray-600 rounded animate-pulse"></span>
              ) : (
                stats?.totalCategories
              )}
            </p>
          </div>
        </a>

        {/* أخبار اليوم مع مؤشر التغيير */}
        <a href="/moment-by-moment" className="flex items-center gap-1.5 hover:scale-105 transition-transform">
          <div className={`p-1 rounded-lg ${
            darkMode ? 'bg-green-900/30' : 'bg-green-100'
          }`}>
            <Calendar className={`w-3.5 h-3.5 ${
              darkMode ? 'text-green-400' : 'text-green-600'
            }`} />
          </div>
          <div>
            <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              أخبار اليوم
            </p>
            <div className="flex items-center gap-1">
              <p className={`text-sm font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {loading ? (
                  <span className="inline-block w-8 h-3 bg-gray-300 dark:bg-gray-600 rounded animate-pulse"></span>
                ) : (
                  stats?.todayArticles || 0
                )}
              </p>
              {!loading && stats && stats.trend !== 'stable' && (
                <div className="flex items-center gap-0.5">
                  {getTrendIcon(stats.trend)}
                  <span className={`text-xs ${
                    stats.trend === 'up' ? 'text-green-500' : 'text-red-500'
                  }`}>
                    {Math.abs(stats.dailyChangePercentage)}%
                  </span>
                </div>
              )}
            </div>
          </div>
        </a>
      </div>
    </div>
  );
}