'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { 
  Newspaper, 
  Tag, 
  Calendar, 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  Users, 
  Eye,
  BarChart3,
  RefreshCw,
  Zap
} from 'lucide-react';

interface DailyChange {
  count: number;
  percentage: number;
  direction: 'up' | 'down' | 'same';
  icon: string;
  text: string;
}

interface StatsDisplay {
  articles_today_text: string;
  total_articles_text: string;
  categories_text: string;
  authors_text: string;
  views_text: string;
}

interface StatsData {
  total_articles: number;
  total_categories: number;
  articles_today: number;
  active_authors: number;
  total_views: number;
  trending_articles: number;
  articles_yesterday: number;
  daily_change: DailyChange;
  display: StatsDisplay;
}

interface MobileStatsResponse {
  success: boolean;
  stats: StatsData;
  timestamp: string;
  cache_duration?: number;
}

interface EnhancedMobileStatsBarProps {
  darkMode?: boolean;
  className?: string;
}

export default function EnhancedMobileStatsBar({ 
  darkMode = false, 
  className = '' 
}: EnhancedMobileStatsBarProps) {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchStats = useCallback(async (showRefreshing = false) => {
    if (showRefreshing) setRefreshing(true);
    
    try {
      const response = await fetch('/api/stats/mobile-header', {
        headers: {
          'Cache-Control': 'no-cache'
        }
      });
      
      const data: MobileStatsResponse = await response.json();
      
      if (data.success && data.stats) {
        setStats(data.stats);
        setLastUpdated(new Date());
      } else {
        console.warn('فشل في جلب الإحصائيات:', data);
      }
    } catch (error) {
      console.error('خطأ في جلب إحصائيات الهيدر:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
    
    // تحديث كل 5 دقائق
    const interval = setInterval(() => fetchStats(), 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [fetchStats]);

  const handleRefresh = () => {
    fetchStats(true);
  };

  const getTrendIcon = (direction: string) => {
    switch (direction) {
      case 'up':
        return <TrendingUp className="w-3 h-3 text-green-500" />;
      case 'down':
        return <TrendingDown className="w-3 h-3 text-red-500" />;
      default:
        return <Minus className="w-3 h-3 text-gray-400" />;
    }
  };

  const getTrendColor = (direction: string) => {
    switch (direction) {
      case 'up':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'down':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className={`${className} ${darkMode ? 'bg-gray-900' : 'bg-white'} 
        border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'} p-3`}>
        <div className="flex justify-center items-center space-x-4 rtl:space-x-reverse">
          <RefreshCw className="w-4 h-4 animate-spin text-blue-500" />
          <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            جاري تحديث الإحصائيات...
          </span>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className={`${className} ${darkMode ? 'bg-gray-900' : 'bg-white'} 
        border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'} p-3`}>
        <div className="text-center">
          <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            غير متاح حالياً
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className={`${className} ${darkMode ? 'bg-gray-900' : 'bg-white'} 
      border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'} 
      transition-all duration-300`}>
      
      {/* شريط الإحصائيات الرئيسي */}
      <div className="px-4 py-3">
        <div className="grid grid-cols-2 gap-3 mb-3">
          
          {/* مقالات اليوم مع المؤشر */}
          <div className={`relative rounded-lg p-3 border ${
            darkMode ? 'bg-gray-800 border-gray-700' : 'bg-blue-50 border-blue-200'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 rtl:space-x-reverse">
                <Calendar className={`w-4 h-4 ${
                  darkMode ? 'text-blue-400' : 'text-blue-600'
                }`} />
                <span className={`text-xs font-medium ${
                  darkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  اليوم
                </span>
              </div>
              {stats.daily_change && (
                <div className={`flex items-center space-x-1 rtl:space-x-reverse px-2 py-1 
                  rounded-full text-xs font-medium border ${getTrendColor(stats.daily_change.direction)}`}>
                  {getTrendIcon(stats.daily_change.direction)}
                  <span>{stats.daily_change.text}</span>
                </div>
              )}
            </div>
            <div className={`text-lg font-bold mt-1 ${
              darkMode ? 'text-white' : 'text-gray-900'
            }`}>
              {stats.articles_today}
            </div>
            <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              مقال جديد
            </div>
          </div>

          {/* إجمالي المقالات */}
          <div className={`rounded-lg p-3 border ${
            darkMode ? 'bg-gray-800 border-gray-700' : 'bg-green-50 border-green-200'
          }`}>
            <div className="flex items-center space-x-2 rtl:space-x-reverse mb-2">
              <Newspaper className={`w-4 h-4 ${
                darkMode ? 'text-green-400' : 'text-green-600'
              }`} />
              <span className={`text-xs font-medium ${
                darkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                الإجمالي
              </span>
            </div>
            <div className={`text-lg font-bold ${
              darkMode ? 'text-white' : 'text-gray-900'
            }`}>
              {stats.total_articles.toLocaleString('ar-SA')}
            </div>
            <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              مقال منشور
            </div>
          </div>
        </div>

        {/* الإحصائيات الثانوية */}
        <div className="grid grid-cols-3 gap-2">
          
          {/* التصنيفات */}
          <div className={`text-center p-2 rounded-lg ${
            darkMode ? 'bg-gray-800' : 'bg-gray-50'
          }`}>
            <Tag className={`w-3 h-3 mx-auto mb-1 ${
              darkMode ? 'text-purple-400' : 'text-purple-600'
            }`} />
            <div className={`text-sm font-semibold ${
              darkMode ? 'text-white' : 'text-gray-900'
            }`}>
              {stats.total_categories}
            </div>
            <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              تصنيف
            </div>
          </div>

          {/* الكتاب النشطين */}
          <div className={`text-center p-2 rounded-lg ${
            darkMode ? 'bg-gray-800' : 'bg-gray-50'
          }`}>
            <Users className={`w-3 h-3 mx-auto mb-1 ${
              darkMode ? 'text-orange-400' : 'text-orange-600'
            }`} />
            <div className={`text-sm font-semibold ${
              darkMode ? 'text-white' : 'text-gray-900'
            }`}>
              {stats.active_authors}
            </div>
            <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              كاتب
            </div>
          </div>

          {/* المشاهدات */}
          <div className={`text-center p-2 rounded-lg ${
            darkMode ? 'bg-gray-800' : 'bg-gray-50'
          }`}>
            <Eye className={`w-3 h-3 mx-auto mb-1 ${
              darkMode ? 'text-blue-400' : 'text-blue-600'
            }`} />
            <div className={`text-sm font-semibold ${
              darkMode ? 'text-white' : 'text-gray-900'
            }`}>
              {(stats.total_views / 1000).toFixed(0)}k
            </div>
            <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              مشاهدة
            </div>
          </div>
        </div>

        {/* شريط آخر تحديث مع زر التحديث */}
        <div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-200 dark:border-gray-700">
          <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            آخر تحديث: {lastUpdated ? lastUpdated.toLocaleTimeString('ar-SA', { 
              hour: '2-digit', 
              minute: '2-digit' 
            }) : 'غير محدد'}
          </div>
          
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className={`flex items-center space-x-1 rtl:space-x-reverse px-2 py-1 rounded-md 
              text-xs font-medium transition-colors ${
              darkMode ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-100 text-gray-600'
            } ${refreshing ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          >
            <RefreshCw className={`w-3 h-3 ${refreshing ? 'animate-spin' : ''}`} />
            <span>تحديث</span>
          </button>
        </div>
      </div>
    </div>
  );
} 