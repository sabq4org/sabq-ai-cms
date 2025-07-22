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
  Zap,
  Activity,
  Clock,
  Star,
  Award
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
        return <TrendingUp className="w-3 h-3" />;
      case 'down':
        return <TrendingDown className="w-3 h-3" />;
      default:
        return <Minus className="w-3 h-3" />;
    }
  };

  const getTrendColor = (direction: string) => {
    switch (direction) {
      case 'up':
        return darkMode 
          ? 'bg-green-500/20 text-green-300 border-green-500/30' 
          : 'bg-green-100 text-green-700 border-green-300';
      case 'down':
        return darkMode 
          ? 'bg-red-500/20 text-red-300 border-red-500/30' 
          : 'bg-red-100 text-red-700 border-red-300';
      default:
        return darkMode 
          ? 'bg-gray-500/20 text-gray-300 border-gray-500/30' 
          : 'bg-gray-100 text-gray-700 border-gray-300';
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
    <div className={`enhanced-mobile-stats ${className} ${darkMode ? 'bg-gray-900' : 'bg-white'} 
      border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'} 
      transition-all duration-300 shadow-sm`}>
      
      {/* شريط الإحصائيات الرئيسي المحسن */}
      <div className="px-3 py-3">
        
        {/* عنوان القسم مع التحديث التلقائي */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2 rtl:space-x-reverse">
            <div className={`stats-icon-container p-1.5 rounded-full ${
              darkMode ? 'bg-blue-500/10' : 'bg-blue-50'
            }`}>
              <Activity className={`w-4 h-4 ${
                darkMode ? 'text-blue-400' : 'text-blue-600'
              }`} />
            </div>
            <span className={`stats-text text-sm font-bold ${
              darkMode ? 'text-white' : 'text-gray-900'
            }`}>
              إحصائيات حية
            </span>
            <div className={`live-indicator w-2 h-2 rounded-full ${
              refreshing ? 'bg-green-400' : 'bg-gray-400'
            }`}></div>
          </div>
          
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className={`refresh-button flex items-center space-x-1 rtl:space-x-reverse px-3 py-1.5 rounded-full 
              text-xs font-medium transition-all duration-200 ${
              darkMode 
                ? 'bg-gray-800 hover:bg-gray-700 text-gray-300 border border-gray-600' 
                : 'bg-gray-100 hover:bg-gray-200 text-gray-600 border border-gray-300'
            } ${refreshing ? 'opacity-60 cursor-not-allowed' : 'hover:scale-105 active:scale-95'}`}
          >
            <RefreshCw className={`w-3 h-3 ${refreshing ? 'animate-spin' : ''}`} />
            <span>{refreshing ? 'يُحدث...' : 'تحديث'}</span>
          </button>
        </div>
        
        {/* البطاقات الرئيسية - تخطيط محسن */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          
          {/* مقالات اليوم - بطاقة مميزة */}
          <div className={`stats-card-enhanced relative overflow-hidden rounded-xl p-4 
            bg-gradient-to-br ${
              darkMode 
                ? 'from-blue-600/20 to-blue-800/10 border-blue-500/20' 
                : 'from-blue-50 to-blue-100/50 border-blue-200'
            } border backdrop-blur-sm`}>
            
            {/* أيقونة وتسمية */}
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2 rtl:space-x-reverse">
                <div className={`stats-icon-container p-2 rounded-lg ${
                  darkMode ? 'bg-blue-500/20' : 'bg-blue-200/50'
                }`}>
                  <Calendar className={`w-4 h-4 ${
                    darkMode ? 'text-blue-300' : 'text-blue-700'
                  }`} />
                </div>
                <div>
                  <span className={`stats-text text-xs font-medium ${
                    darkMode ? 'text-blue-300' : 'text-blue-700'
                  }`}>
                    أخبار اليوم
                  </span>
                  <div className={`text-xs ${
                    darkMode ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    {new Date().toLocaleDateString('ar-SA')}
                  </div>
                </div>
              </div>
              
              {/* مؤشر التغيير */}
              {stats.daily_change && (
                <div className={`trend-indicator flex items-center space-x-1 rtl:space-x-reverse px-2 py-1 
                  rounded-full text-xs font-bold border-2 ${getTrendColor(stats.daily_change.direction)}`}>
                  {getTrendIcon(stats.daily_change.direction)}
                  <span>{stats.daily_change.text}</span>
                </div>
              )}
            </div>
            
            {/* الرقم الرئيسي */}
            <div className={`stats-number text-2xl font-black mb-1 ${
              darkMode ? 'text-white' : 'text-gray-900'
            }`}>
              {stats.articles_today}
            </div>
            <div className={`text-xs ${darkMode ? 'text-blue-300' : 'text-blue-600'}`}>
              مقال جديد
            </div>
            
            {/* تأثير بصري */}
            <div className={`absolute -top-2 -right-2 w-8 h-8 rounded-full opacity-20 ${
              darkMode ? 'bg-blue-400' : 'bg-blue-500'
            } animate-ping`}></div>
          </div>

          {/* إجمالي المقالات - بطاقة احترافية */}
          <div className={`stats-card-enhanced relative overflow-hidden rounded-xl p-4 
            bg-gradient-to-br ${
              darkMode 
                ? 'from-emerald-600/20 to-emerald-800/10 border-emerald-500/20' 
                : 'from-emerald-50 to-emerald-100/50 border-emerald-200'
            } border backdrop-blur-sm`}>
            
            <div className="flex items-center space-x-2 rtl:space-x-reverse mb-2">
              <div className={`stats-icon-container p-2 rounded-lg ${
                darkMode ? 'bg-emerald-500/20' : 'bg-emerald-200/50'
              }`}>
                <Newspaper className={`w-4 h-4 ${
                  darkMode ? 'text-emerald-300' : 'text-emerald-700'
                }`} />
              </div>
              <div>
                <span className={`stats-text text-xs font-medium ${
                  darkMode ? 'text-emerald-300' : 'text-emerald-700'
                }`}>
                  المكتبة الإجمالية
                </span>
                <div className={`text-xs ${
                  darkMode ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  جميع المقالات
                </div>
              </div>
            </div>
            
            <div className={`stats-number text-2xl font-black mb-1 ${
              darkMode ? 'text-white' : 'text-gray-900'
            }`}>
              {stats.total_articles.toLocaleString('ar-SA')}
            </div>
            <div className={`text-xs ${darkMode ? 'text-emerald-300' : 'text-emerald-600'}`}>
              مقال منشور
            </div>
            
            <div className={`absolute -bottom-2 -left-2 w-8 h-8 rounded-full opacity-20 ${
              darkMode ? 'bg-emerald-400' : 'bg-emerald-500'
            } animate-pulse`}></div>
          </div>
        </div>

        {/* الإحصائيات التفصيلية - تخطيط أنيق */}
        <div className="grid grid-cols-4 gap-2">
          
          {/* التصنيفات */}
          <div className={`stats-card-enhanced text-center p-3 rounded-lg ${
            darkMode ? 'bg-gray-800/50 hover:bg-gray-800' : 'bg-purple-50/50 hover:bg-purple-50'
          }`}>
            <div className={`stats-icon-container p-2 rounded-full mx-auto mb-2 w-fit ${
              darkMode ? 'bg-purple-500/20' : 'bg-purple-100'
            }`}>
              <Tag className={`w-4 h-4 ${
                darkMode ? 'text-purple-400' : 'text-purple-600'
              }`} />
            </div>
            <div className={`stats-number text-sm font-bold ${
              darkMode ? 'text-white' : 'text-gray-900'
            }`}>
              {stats.total_categories}
            </div>
            <div className={`stats-text text-xs ${darkMode ? 'text-purple-300' : 'text-purple-600'}`}>
              قسم
            </div>
          </div>

          {/* الكتاب النشطين */}
          <div className={`stats-card-enhanced text-center p-3 rounded-lg ${
            darkMode ? 'bg-gray-800/50 hover:bg-gray-800' : 'bg-orange-50/50 hover:bg-orange-50'
          }`}>
            <div className={`stats-icon-container p-2 rounded-full mx-auto mb-2 w-fit ${
              darkMode ? 'bg-orange-500/20' : 'bg-orange-100'
            }`}>
              <Users className={`w-4 h-4 ${
                darkMode ? 'text-orange-400' : 'text-orange-600'
              }`} />
            </div>
            <div className={`stats-number text-sm font-bold ${
              darkMode ? 'text-white' : 'text-gray-900'
            }`}>
              {stats.active_authors}
            </div>
            <div className={`stats-text text-xs ${darkMode ? 'text-orange-300' : 'text-orange-600'}`}>
              كاتب
            </div>
          </div>

          {/* المشاهدات */}
          <div className={`stats-card-enhanced text-center p-3 rounded-lg ${
            darkMode ? 'bg-gray-800/50 hover:bg-gray-800' : 'bg-blue-50/50 hover:bg-blue-50'
          }`}>
            <div className={`stats-icon-container p-2 rounded-full mx-auto mb-2 w-fit ${
              darkMode ? 'bg-blue-500/20' : 'bg-blue-100'
            }`}>
              <Eye className={`w-4 h-4 ${
                darkMode ? 'text-blue-400' : 'text-blue-600'
              }`} />
            </div>
            <div className={`stats-number text-sm font-bold ${
              darkMode ? 'text-white' : 'text-gray-900'
            }`}>
              {(stats.total_views / 1000).toFixed(0)}k
            </div>
            <div className={`stats-text text-xs ${darkMode ? 'text-blue-300' : 'text-blue-600'}`}>
              مشاهدة
            </div>
          </div>
          
          {/* المقالات الشائعة */}
          <div className={`stats-card-enhanced text-center p-3 rounded-lg ${
            darkMode ? 'bg-gray-800/50 hover:bg-gray-800' : 'bg-yellow-50/50 hover:bg-yellow-50'
          }`}>
            <div className={`stats-icon-container p-2 rounded-full mx-auto mb-2 w-fit ${
              darkMode ? 'bg-yellow-500/20' : 'bg-yellow-100'
            }`}>
              <Star className={`w-4 h-4 ${
                darkMode ? 'text-yellow-400' : 'text-yellow-600'
              }`} />
            </div>
            <div className={`stats-number text-sm font-bold ${
              darkMode ? 'text-white' : 'text-gray-900'
            }`}>
              {stats.trending_articles}
            </div>
            <div className={`stats-text text-xs ${darkMode ? 'text-yellow-300' : 'text-yellow-600'}`}>
              شائع
            </div>
          </div>
        </div>

        {/* شريط المعلومات السفلي المحسن */}
        <div className={`flex items-center justify-between mt-4 pt-3 border-t ${
          darkMode ? 'border-gray-700' : 'border-gray-200'
        }`}>
          <div className="flex items-center space-x-2 rtl:space-x-reverse">
            <Clock className={`w-3 h-3 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
            <span className={`stats-text text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              آخر تحديث: {lastUpdated ? lastUpdated.toLocaleTimeString('ar-SA', { 
                hour: '2-digit', 
                minute: '2-digit' 
              }) : 'الآن'}
            </span>
          </div>
          
          <div className="flex items-center space-x-2 rtl:space-x-reverse">
            <div className={`live-indicator w-2 h-2 rounded-full ${
              refreshing ? 'bg-green-400' : 'bg-gray-400'
            }`}></div>
            <span className={`stats-text text-xs font-medium ${
              darkMode ? 'text-gray-300' : 'text-gray-600'
            }`}>
              {refreshing ? 'تحديث مباشر' : 'متصل'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
} 