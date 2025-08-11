"use client";

import React, { useState, useEffect } from 'react';
import TrendsWidget from './TrendsWidget';
import TimePeriodComparison from './TimePeriodComparison';
import AlertsNotifications from './AlertsNotifications';
import WordCloud from './WordCloud';
import { ChartsGrid, MiniChart } from './MiniCharts';
import { format, subDays } from 'date-fns';
import { ar } from 'date-fns/locale';

interface AnalyticsDashboardProps {
  className?: string;
  showTrends?: boolean;
  showComparison?: boolean;
  showAlerts?: boolean;
  showWordCloud?: boolean;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

interface DashboardStats {
  totalKeywords: number;
  totalUsage: number;
  totalViews: number;
  averagePopularity: number;
  activeAlerts: number;
  topKeywords: Array<{
    keyword: string;
    usage: number;
    trend: 'up' | 'down' | 'stable';
    change: number;
  }>;
  recentActivity: Array<{
    type: 'keyword_spike' | 'new_trend' | 'alert_triggered';
    message: string;
    timestamp: string;
    severity: 'low' | 'medium' | 'high';
  }>;
}

const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({
  className = '',
  showTrends = true,
  showComparison = true,
  showAlerts = true,
  showWordCloud = true,
  autoRefresh = true,
  refreshInterval = 300000 // 5 دقائق
}) => {
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTab, setSelectedTab] = useState<'overview' | 'trends' | 'comparison' | 'alerts' | 'wordcloud'>('overview');
  const [dateRange, setDateRange] = useState({
    startDate: subDays(new Date(), 7),
    endDate: new Date()
  });

  // تحميل إحصائيات اللوحة
  const fetchDashboardStats = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/analytics/dashboard', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          startDate: dateRange.startDate.toISOString(),
          endDate: dateRange.endDate.toISOString(),
        }),
      });

      if (!response.ok) {
        throw new Error('فشل في تحميل بيانات اللوحة');
      }

      const data = await response.json();
      setDashboardStats(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'خطأ غير معروف');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardStats();

    if (autoRefresh) {
      const interval = setInterval(fetchDashboardStats, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [dateRange, autoRefresh, refreshInterval]);

  // بطاقات الإحصائيات السريعة
  const renderStatsCards = () => {
    if (!dashboardStats) return null;

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">إجمالي الكلمات</p>
              <p className="text-3xl font-bold">
                {dashboardStats.totalKeywords.toLocaleString('ar-SA')}
              </p>
            </div>
            <div className="bg-blue-400 bg-opacity-30 rounded-full p-3">
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">إجمالي الاستخدام</p>
              <p className="text-3xl font-bold">
                {dashboardStats.totalUsage.toLocaleString('ar-SA')}
              </p>
            </div>
            <div className="bg-green-400 bg-opacity-30 rounded-full p-3">
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11 4a1 1 0 10-2 0v4a1 1 0 102 0V7zm-3 1a1 1 0 10-2 0v3a1 1 0 102 0V8zM8 9a1 1 0 00-2 0v2a1 1 0 102 0V9z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm">إجمالي المشاهدات</p>
              <p className="text-3xl font-bold">
                {dashboardStats.totalViews.toLocaleString('ar-SA')}
              </p>
            </div>
            <div className="bg-purple-400 bg-opacity-30 rounded-full p-3">
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-100 text-sm">متوسط الشعبية</p>
              <p className="text-3xl font-bold">
                {dashboardStats.averagePopularity.toFixed(1)}
              </p>
            </div>
            <div className="bg-yellow-400 bg-opacity-30 rounded-full p-3">
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-100 text-sm">تنبيهات نشطة</p>
              <p className="text-3xl font-bold">
                {dashboardStats.activeAlerts}
              </p>
            </div>
            <div className="bg-red-400 bg-opacity-30 rounded-full p-3">
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // أهم الكلمات المفتاحية
  const renderTopKeywords = () => {
    if (!dashboardStats?.topKeywords.length) return null;

    return (
      <div className="bg-white rounded-lg border p-6 mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">أهم الكلمات المفتاحية</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {dashboardStats.topKeywords.map((keyword, index) => (
            <div key={keyword.keyword} className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-900">
                  #{index + 1} {keyword.keyword}
                </span>
                <div className={`flex items-center text-sm ${
                  keyword.trend === 'up' ? 'text-green-600' :
                  keyword.trend === 'down' ? 'text-red-600' : 'text-gray-600'
                }`}>
                  {keyword.trend === 'up' ? '↗' : keyword.trend === 'down' ? '↘' : '→'}
                  <span className="mr-1">{Math.abs(keyword.change).toFixed(1)}%</span>
                </div>
              </div>
              <div className="text-lg font-bold text-gray-900">
                {keyword.usage.toLocaleString('ar-SA')}
              </div>
              <div className="text-sm text-gray-600">استخدام</div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // النشاط الأخير
  const renderRecentActivity = () => {
    if (!dashboardStats?.recentActivity.length) return null;

    return (
      <div className="bg-white rounded-lg border p-6 mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">النشاط الأخير</h3>
        <div className="space-y-3">
          {dashboardStats.recentActivity.map((activity, index) => (
            <div key={index} className="flex items-start space-x-3 rtl:space-x-reverse">
              <div className={`flex-shrink-0 w-2 h-2 rounded-full mt-2 ${
                activity.severity === 'high' ? 'bg-red-500' :
                activity.severity === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
              }`} />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-900">{activity.message}</p>
                <p className="text-xs text-gray-500">
                  {format(new Date(activity.timestamp), 'dd/MM/yyyy HH:mm', { locale: ar })}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="animate-pulse">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="bg-gray-200 rounded-lg h-32"></div>
            ))}
          </div>
          <div className="bg-gray-200 rounded-lg h-64"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-white rounded-lg border p-6 ${className}`}>
        <div className="text-center text-red-600">
          <p className="mb-4">خطأ في تحميل بيانات اللوحة</p>
          <p className="text-sm text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchDashboardStats}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            إعادة المحاولة
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* رأس اللوحة */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">لوحة تحليلات الأخبار</h1>
          <p className="text-gray-600">
            {format(dateRange.startDate, 'dd/MM/yyyy', { locale: ar })} - {format(dateRange.endDate, 'dd/MM/yyyy', { locale: ar })}
          </p>
        </div>

        <div className="flex items-center space-x-4 rtl:space-x-reverse">
          {autoRefresh && (
            <div className="flex items-center text-green-600 text-sm">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-2"></div>
              تحديث تلقائي
            </div>
          )}

          <button
            onClick={fetchDashboardStats}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            تحديث البيانات
          </button>
        </div>
      </div>

      {/* بطاقات الإحصائيات */}
      {renderStatsCards()}

      {/* التنقل */}
      <div className="bg-white rounded-lg border">
        <div className="flex border-b flex-wrap">
          <button
            onClick={() => setSelectedTab('overview')}
            className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
              selectedTab === 'overview'
                ? 'border-blue-500 text-blue-600 bg-blue-50'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            نظرة عامة
          </button>
          
          {showWordCloud && (
            <button
              onClick={() => setSelectedTab('wordcloud')}
              className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                selectedTab === 'wordcloud'
                  ? 'border-blue-500 text-blue-600 bg-blue-50'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              سحابة الكلمات
              <span className="mr-2 bg-green-500 text-white text-xs px-2 py-0.5 rounded-full">
                جديد
              </span>
            </button>
          )}
          
          {showTrends && (
            <button
              onClick={() => setSelectedTab('trends')}
              className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                selectedTab === 'trends'
                  ? 'border-blue-500 text-blue-600 bg-blue-50'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              الاتجاهات
            </button>
          )}
          
          {showComparison && (
            <button
              onClick={() => setSelectedTab('comparison')}
              className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                selectedTab === 'comparison'
                  ? 'border-blue-500 text-blue-600 bg-blue-50'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              المقارنات
            </button>
          )}
          
          {showAlerts && (
            <button
              onClick={() => setSelectedTab('alerts')}
              className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                selectedTab === 'alerts'
                  ? 'border-blue-500 text-blue-600 bg-blue-50'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              التنبيهات
              {dashboardStats && dashboardStats.activeAlerts > 0 && (
                <span className="mr-1 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                  {dashboardStats.activeAlerts}
                </span>
              )}
            </button>
          )}
        </div>

        {/* محتوى التبويبات */}
        <div className="p-6">
          {selectedTab === 'overview' && (
            <div className="space-y-6">
              {renderTopKeywords()}
              {renderRecentActivity()}
            </div>
          )}

          {selectedTab === 'wordcloud' && showWordCloud && (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  🔍 سحابة الكلمات التفاعلية
                </h3>
                <p className="text-gray-600 mb-4">
                  اكتشف الاتجاهات السائدة والكلمات الأكثر شيوعاً في المحتوى الإخباري
                </p>
              </div>
              <WordCloud 
                autoRefresh={autoRefresh}
                refreshInterval={refreshInterval}
                maxKeywords={25}
              />
            </div>
          )}

          {selectedTab === 'trends' && showTrends && (
            <TrendsWidget
              dateRange={dateRange}
              autoRefresh={autoRefresh}
              refreshInterval={refreshInterval}
            />
          )}

          {selectedTab === 'comparison' && showComparison && (
            <TimePeriodComparison />
          )}

          {selectedTab === 'alerts' && showAlerts && (
            <AlertsNotifications />
          )}
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
export type { AnalyticsDashboardProps, DashboardStats };
