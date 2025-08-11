"use client";

import React, { useState, useEffect } from 'react';
import { MiniChart, TrendMiniChart, ChartsGrid, TimeSeriesData, TrendData } from './MiniCharts';
import TimePeriodComparison, { ComparisonPeriod } from './TimePeriodComparison';
import AlertsNotifications, { TrendAlert, AlertRule } from './AlertsNotifications';
import { format, subDays } from 'date-fns';
import { ar } from 'date-fns/locale';

interface TrendsWidgetData {
  temporalAnalysis: {
    keywordTrends: Array<{
      keyword: string;
      timeSeriesData: TimeSeriesData[];
      trend: TrendData;
      currentUsage: number;
      currentViews: number;
      currentPopularity: number;
    }>;
    overallTrend: TrendData;
    periodComparison: {
      current: number;
      previous: number;
      change: number;
    };
  };
  topKeywords: Array<{
    keyword: string;
    usage: number;
    views: number;
    popularity: number;
    trend: TrendData;
  }>;
  alerts: TrendAlert[];
  summary: {
    totalKeywords: number;
    totalUsage: number;
    totalViews: number;
    averagePopularity: number;
    activeAlerts: number;
  };
}

interface TrendsWidgetProps {
  className?: string;
  dateRange?: {
    startDate: Date;
    endDate: Date;
  };
  autoRefresh?: boolean;
  refreshInterval?: number;
}

const TrendsWidget: React.FC<TrendsWidgetProps> = ({
  className = '',
  dateRange,
  autoRefresh = true,
  refreshInterval = 300000 // 5 دقائق
}) => {
  const [data, setData] = useState<TrendsWidgetData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'comparison' | 'alerts'>('overview');
  const [selectedKeyword, setSelectedKeyword] = useState<string | null>(null);
  const [selectedPeriods, setSelectedPeriods] = useState<ComparisonPeriod[]>([]);

  // تحديد نطاق التاريخ الافتراضي
  const defaultDateRange = dateRange || {
    startDate: subDays(new Date(), 7),
    endDate: new Date()
  };

  // تحميل بيانات ويدجت الاتجاهات
  const fetchTrendsData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const params = new URLSearchParams({
        period: Math.ceil((defaultDateRange.endDate.getTime() - defaultDateRange.startDate.getTime()) / (1000 * 60 * 60 * 24)).toString(),
        includeTimeSeries: 'true',
        includeComparison: 'true',
        includeAlerts: 'true'
      });

      const response = await fetch(`/api/analytics/trends-widget?${params}`);

      if (!response.ok) {
        throw new Error('فشل في تحميل بيانات الاتجاهات');
      }

      const trendsData = await response.json();
      setData(trendsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'خطأ غير معروف');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrendsData();
    
    if (autoRefresh) {
      const interval = setInterval(fetchTrendsData, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [dateRange, autoRefresh, refreshInterval]);

  // معالجة إجراءات التنبيهات
  const handleAlertAction = (alertId: string, action: string) => {
    if (action === 'investigate' && data) {
      const alert = data.alerts.find(a => a.id === alertId);
      if (alert) {
        setSelectedKeyword(alert.keyword);
        setActiveTab('comparison');
      }
    }
  };

  // إعداد بيانات الرسوم البيانية الصغيرة
  const getChartsGridData = () => {
    if (!data?.temporalAnalysis.keywordTrends) return [];

    return data.temporalAnalysis.keywordTrends.slice(0, 6).map(trend => ({
      id: trend.keyword,
      title: trend.keyword,
      timeSeriesData: trend.timeSeriesData,
      trend: trend.trend,
      currentValue: trend.currentUsage,
      metric: 'usage' as const
    }));
  };

  if (loading) {
    return (
      <div className={`bg-white rounded-lg border p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-white rounded-lg border p-6 ${className}`}>
        <div className="text-center text-red-600">
          <p className="mb-4">خطأ في تحميل بيانات الاتجاهات</p>
          <p className="text-sm text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchTrendsData}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            إعادة المحاولة
          </button>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className={`bg-white rounded-lg border p-6 ${className}`}>
        <div className="text-center text-gray-500">
          لا توجد بيانات متاحة
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg border ${className}`}>
      {/* رأس الويدجت */}
      <div className="flex items-center justify-between p-6 border-b">
        <div className="flex items-center space-x-4 rtl:space-x-reverse">
          <h2 className="text-xl font-bold text-gray-900">ويدجت اتجاهات الأخبار</h2>
          <span className="text-sm text-gray-500">
            {format(defaultDateRange.startDate, 'dd/MM', { locale: ar })} - {format(defaultDateRange.endDate, 'dd/MM', { locale: ar })}
          </span>
        </div>

        <div className="flex items-center space-x-3 rtl:space-x-reverse">
          {/* مؤشر التحديث */}
          {autoRefresh && (
            <div className="flex items-center text-green-600 text-sm">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-2"></div>
              تحديث تلقائي
            </div>
          )}

          {/* إعادة تحميل */}
          <button
            onClick={fetchTrendsData}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            title="إعادة تحميل"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>

      {/* إحصائيات سريعة */}
      <div className="p-6 border-b">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">
              {data.summary.totalKeywords.toLocaleString('ar-SA')}
            </div>
            <div className="text-sm text-gray-600">إجمالي الكلمات</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {data.summary.totalUsage.toLocaleString('ar-SA')}
            </div>
            <div className="text-sm text-gray-600">إجمالي الاستخدام</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {data.summary.totalViews.toLocaleString('ar-SA')}
            </div>
            <div className="text-sm text-gray-600">إجمالي المشاهدات</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {data.summary.averagePopularity.toFixed(1)}
            </div>
            <div className="text-sm text-gray-600">متوسط الشعبية</div>
          </div>
          
          <div className="text-center">
            <div className={`text-2xl font-bold ${data.summary.activeAlerts > 0 ? 'text-red-600' : 'text-gray-400'}`}>
              {data.summary.activeAlerts}
            </div>
            <div className="text-sm text-gray-600">تنبيهات نشطة</div>
          </div>
        </div>
      </div>

      {/* التنقل */}
      <div className="flex border-b">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'overview'
              ? 'border-blue-500 text-blue-600 bg-blue-50'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          نظرة عامة
        </button>
        
        <button
          onClick={() => setActiveTab('comparison')}
          className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'comparison'
              ? 'border-blue-500 text-blue-600 bg-blue-50'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          مقارنة الفترات
        </button>
        
        <button
          onClick={() => setActiveTab('alerts')}
          className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'alerts'
              ? 'border-blue-500 text-blue-600 bg-blue-50'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          التنبيهات والإشعارات
          {data.summary.activeAlerts > 0 && (
            <span className="mr-1 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">
              {data.summary.activeAlerts}
            </span>
          )}
        </button>
      </div>

      {/* محتوى التبويبات */}
      <div className="p-6">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* الاتجاه الإجمالي */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">الاتجاه الإجمالي</h3>
              <div className="flex items-center space-x-4 rtl:space-x-reverse">
                <div className={`flex items-center ${
                  data.temporalAnalysis.overallTrend.direction === 'rising' ? 'text-green-600' :
                  data.temporalAnalysis.overallTrend.direction === 'falling' ? 'text-red-600' :
                  'text-gray-600'
                }`}>
                  {data.temporalAnalysis.overallTrend.direction === 'rising' ? '↗' :
                   data.temporalAnalysis.overallTrend.direction === 'falling' ? '↘' : '→'}
                  <span className="mr-2 font-medium">
                    {data.temporalAnalysis.overallTrend.direction === 'rising' ? 'ارتفاع' :
                     data.temporalAnalysis.overallTrend.direction === 'falling' ? 'انخفاض' : 'استقرار'}
                  </span>
                </div>
                <span className="text-gray-600">
                  بقوة {data.temporalAnalysis.overallTrend.strength === 'strong' ? 'عالية' :
                         data.temporalAnalysis.overallTrend.strength === 'moderate' ? 'متوسطة' : 'ضعيفة'}
                </span>
                <span className="font-medium">
                  {Math.abs(data.temporalAnalysis.overallTrend.growth_rate).toFixed(1)}%
                </span>
              </div>
            </div>

            {/* الرسوم البيانية الصغيرة */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">الكلمات المفتاحية الرائجة</h3>
              <ChartsGrid
                data={getChartsGridData()}
                columns={3}
                compact={false}
              />
            </div>

            {/* أهم الكلمات المفتاحية */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">أهم الكلمات المفتاحية</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {data.topKeywords.slice(0, 6).map((keyword, index) => (
                  <div
                    key={keyword.keyword}
                    className="bg-white border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => {
                      setSelectedKeyword(keyword.keyword);
                      setActiveTab('comparison');
                    }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-900 truncate">
                        #{index + 1} {keyword.keyword}
                      </h4>
                      <div className={`text-sm ${
                        keyword.trend.direction === 'rising' ? 'text-green-600' :
                        keyword.trend.direction === 'falling' ? 'text-red-600' :
                        'text-gray-600'
                      }`}>
                        {keyword.trend.direction === 'rising' ? '↗' :
                         keyword.trend.direction === 'falling' ? '↘' : '→'}
                      </div>
                    </div>
                    
                    <div className="space-y-1 text-sm text-gray-600">
                      <div>الاستخدام: {keyword.usage.toLocaleString('ar-SA')}</div>
                      <div>المشاهدات: {keyword.views.toLocaleString('ar-SA')}</div>
                      <div>الشعبية: {keyword.popularity.toFixed(1)}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'comparison' && (
          <TimePeriodComparison
            keyword={selectedKeyword || undefined}
            onPeriodChange={setSelectedPeriods}
          />
        )}

        {activeTab === 'alerts' && (
          <AlertsNotifications
            keyword={selectedKeyword || undefined}
            onAlertAction={handleAlertAction}
          />
        )}
      </div>
    </div>
  );
};

export default TrendsWidget;
export type { TrendsWidgetData, TrendsWidgetProps };
