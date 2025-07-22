'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { 
  Newspaper, 
  Calendar, 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  RefreshCw,
  Activity
} from 'lucide-react';

interface DailyChange {
  count: number;
  percentage: number;
  direction: 'up' | 'down' | 'same';
  icon: string;
  text: string;
}

interface StatsData {
  total_articles: number;
  articles_today: number;
  daily_change: DailyChange;
}

interface MobileStatsResponse {
  success: boolean;
  stats: StatsData;
  timestamp: string;
}

interface CompactStatsBarProps {
  darkMode?: boolean;
  className?: string;
}

export default function CompactStatsBar({ 
  darkMode = false, 
  className = '' 
}: CompactStatsBarProps) {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchStats = useCallback(async (showRefreshing = false) => {
    if (showRefreshing) setRefreshing(true);
    
    try {
      const response = await fetch('/api/stats/mobile-header', {
        headers: { 'Cache-Control': 'no-cache' }
      });
      
      const data: MobileStatsResponse = await response.json();
      
      if (data.success && data.stats) {
        setStats(data.stats);
      }
    } catch (error) {
      console.error('خطأ في جلب الإحصائيات:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
    const interval = setInterval(() => fetchStats(), 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchStats]);

  const handleRefresh = () => {
    fetchStats(true);
  };

  const getTrendIcon = (direction: string) => {
    switch (direction) {
      case 'up': return <TrendingUp className="w-3 h-3" />;
      case 'down': return <TrendingDown className="w-3 h-3" />;
      default: return <Minus className="w-3 h-3" />;
    }
  };

  const getTrendColor = (direction: string) => {
    switch (direction) {
      case 'up':
        return darkMode 
          ? 'text-green-400' 
          : 'text-green-600';
      case 'down':
        return darkMode 
          ? 'text-red-400' 
          : 'text-red-600';
      default:
        return darkMode 
          ? 'text-gray-400' 
          : 'text-gray-600';
    }
  };

  if (loading) {
    return (
      <div className={`${className} ${darkMode ? 'bg-gray-900/50' : 'bg-white/80'} 
        backdrop-blur-sm border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'} 
        py-2 px-4 flex justify-center`}>
        <div className="flex items-center space-x-2 rtl:space-x-reverse">
          <RefreshCw className="w-3 h-3 animate-spin text-blue-500" />
          <span className={`text-xs ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            تحديث...
          </span>
        </div>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className={`compact-stats-bar ${className} ${darkMode ? 'bg-gray-900/80' : 'bg-white/90'} 
      backdrop-blur-md border-b ${darkMode ? 'border-gray-700/50' : 'border-gray-200/50'} 
      transition-all duration-300 shadow-sm`}>
      
      <div className="px-4 py-2.5">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          
          {/* الجانب الأيسر - الإحصائيات */}
          <div className="flex items-center space-x-6 rtl:space-x-reverse">
            
            {/* أخبار اليوم */}
            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              <div className={`p-1.5 rounded-lg ${
                darkMode ? 'bg-blue-500/10' : 'bg-blue-50'
              }`}>
                <Calendar className={`w-3.5 h-3.5 ${
                  darkMode ? 'text-blue-400' : 'text-blue-600'
                }`} />
              </div>
              <div className="flex items-center space-x-1 rtl:space-x-reverse">
                <span className={`text-sm font-bold ${
                  darkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  {stats.articles_today}
                </span>
                <span className={`text-xs ${
                  darkMode ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  اليوم
                </span>
                <div className={`${getTrendColor(stats.daily_change.direction)}`}>
                  {getTrendIcon(stats.daily_change.direction)}
                </div>
              </div>
            </div>

            {/* إجمالي المقالات */}
            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              <div className={`p-1.5 rounded-lg ${
                darkMode ? 'bg-green-500/10' : 'bg-green-50'
              }`}>
                <Newspaper className={`w-3.5 h-3.5 ${
                  darkMode ? 'text-green-400' : 'text-green-600'
                }`} />
              </div>
              <div className="flex items-center space-x-1 rtl:space-x-reverse">
                <span className={`text-sm font-bold ${
                  darkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  {stats.total_articles.toLocaleString('ar')}
                </span>
                <span className={`text-xs ${
                  darkMode ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  مقال
                </span>
              </div>
            </div>
          </div>

          {/* الجانب الأيمن - حالة التحديث */}
          <div className="flex items-center space-x-2 rtl:space-x-reverse">
            <div className={`flex items-center space-x-1.5 rtl:space-x-reverse ${
              darkMode ? 'text-gray-400' : 'text-gray-500'
            }`}>
              <div className={`w-1.5 h-1.5 rounded-full ${
                refreshing ? 'bg-green-400 animate-pulse' : 'bg-gray-400'
              }`}></div>
              <span className="text-xs">حية</span>
            </div>
            
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className={`p-1.5 rounded-lg transition-all duration-200 ${
                darkMode 
                  ? 'hover:bg-gray-800 text-gray-400 hover:text-gray-300' 
                  : 'hover:bg-gray-100 text-gray-500 hover:text-gray-700'
              } ${refreshing ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              title="تحديث الإحصائيات"
            >
              <RefreshCw className={`w-3 h-3 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
