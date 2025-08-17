"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Activity, 
  TrendingUp, 
  Eye, 
  Clock, 
  Users, 
  BarChart3,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  XCircle
} from 'lucide-react';

interface SystemHealth {
  database: string;
  analytics: string;
  cronJob: string;
  coverage: string;
}

interface MonitorData {
  timestamp: string;
  responseTime: string;
  systemHealth: SystemHealth;
  overview: {
    totalTags: number;
    activeTags: number;
    tagsWithAnalytics: number;
    coveragePercentage: string;
    recentAnalyticsCount: number;
  };
  performance: {
    last24Hours: {
      totalUsage: number;
      totalViews: number;
      totalClicks: number;
      totalInteractions: number;
      averagePopularity: number;
    };
    last7Days: {
      totalUsage: number;
      totalViews: number;
      totalClicks: number;
      totalInteractions: number;
      averagePopularity: number;
    };
    last30Days: {
      totalUsage: number;
      totalViews: number;
      totalClicks: number;
      totalInteractions: number;
      averagePopularity: number;
    };
  };
  trends: {
    averageGrowthRate: number;
    averagePopularity: number;
    maxGrowthRate: number;
    maxPopularity: number;
    minGrowthRate: number;
  };
  topPerformers: Array<{
    name: string;
    popularity: number;
    growth: number;
    usage: number;
    views: number;
    lastUsed: string;
  }>;
  lastUpdate: {
    cronJob: string | null;
    analyticsDate: string | null;
  };
}

const WordCloudMonitor: React.FC = () => {
  const [data, setData] = useState<MonitorData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(false);

  const fetchMonitorData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/word-cloud/monitor');
      const result = await response.json();
      
      if (result.success) {
        setData(result.data);
        setError(null);
      } else {
        setError(result.error || 'فشل في جلب البيانات');
      }
    } catch (err: any) {
      setError(err.message || 'خطأ في الاتصال');
    } finally {
      setLoading(false);
    }
  };

  const triggerCronJob = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/cron/update-word-popularity', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_CRON_SECRET || 'test-key'}`
        }
      });
      
      const result = await response.json();
      if (result.success) {
        await fetchMonitorData(); // تحديث البيانات
      } else {
        setError(result.error || 'فشل في تشغيل المهمة');
      }
    } catch (err: any) {
      setError(err.message || 'خطأ في تشغيل المهمة');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMonitorData();
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (autoRefresh) {
      interval = setInterval(fetchMonitorData, 30000); // كل 30 ثانية
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh]);

  const getHealthIcon = (status: string) => {
    switch (status) {
      case 'صحي':
      case 'نشط':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'متأخر':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'متوقف':
      case 'لم يبدأ':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Activity className="w-4 h-4 text-gray-500" />;
    }
  };

  if (loading && !data) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="w-8 h-8 animate-spin" />
          <span className="mr-2">جاري التحميل...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <Card className="border-red-200">
          <CardContent className="p-6">
            <div className="flex items-center text-red-600">
              <XCircle className="w-5 h-5 ml-2" />
              <span>{error}</span>
            </div>
            <Button onClick={fetchMonitorData} className="mt-4">
              إعادة المحاولة
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="p-6 space-y-6" dir="rtl">
      {/* العنوان والتحكم */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">مراقبة سحابة الكلمات</h1>
          <p className="text-gray-600">
            آخر تحديث: {new Date(data.timestamp).toLocaleString('ar-SA')}
            <span className="text-sm text-gray-500 mr-2">
              ({data.responseTime})
            </span>
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={autoRefresh ? "destructive" : "outline"}
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
          >
            <RefreshCw className={`w-4 h-4 ml-1 ${autoRefresh ? 'animate-spin' : ''}`} />
            {autoRefresh ? 'إيقاف التحديث التلقائي' : 'تحديث تلقائي'}
          </Button>
          <Button
            onClick={fetchMonitorData}
            disabled={loading}
            size="sm"
          >
            <RefreshCw className={`w-4 h-4 ml-1 ${loading ? 'animate-spin' : ''}`} />
            تحديث
          </Button>
          <Button
            onClick={triggerCronJob}
            disabled={loading}
            size="sm"
          >
            <Activity className="w-4 h-4 ml-1" />
            تشغيل المهمة
          </Button>
        </div>
      </div>

      {/* حالة النظام */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Activity className="w-5 h-5 ml-2" />
            حالة النظام
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-2">
              {getHealthIcon(data.systemHealth.database)}
              <span className="text-sm">قاعدة البيانات: {data.systemHealth.database}</span>
            </div>
            <div className="flex items-center gap-2">
              {getHealthIcon(data.systemHealth.analytics)}
              <span className="text-sm">التحليلات: {data.systemHealth.analytics}</span>
            </div>
            <div className="flex items-center gap-2">
              {getHealthIcon(data.systemHealth.cronJob)}
              <span className="text-sm">المهمة المجدولة: {data.systemHealth.cronJob}</span>
            </div>
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-blue-500" />
              <span className="text-sm">التغطية: {data.systemHealth.coverage}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* الإحصائيات العامة */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="w-8 h-8 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{data.overview.totalTags.toLocaleString()}</p>
                <p className="text-sm text-gray-600">إجمالي العلامات</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-8 h-8 text-green-500" />
              <div>
                <p className="text-2xl font-bold">{data.overview.activeTags.toLocaleString()}</p>
                <p className="text-sm text-gray-600">العلامات النشطة</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-8 h-8 text-purple-500" />
              <div>
                <p className="text-2xl font-bold">{data.overview.tagsWithAnalytics.toLocaleString()}</p>
                <p className="text-sm text-gray-600">لديها تحليلات</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-8 h-8 text-orange-500" />
              <div>
                <p className="text-2xl font-bold">{data.overview.coveragePercentage}%</p>
                <p className="text-sm text-gray-600">نسبة التغطية</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="w-8 h-8 text-indigo-500" />
              <div>
                <p className="text-2xl font-bold">{data.overview.recentAnalyticsCount.toLocaleString()}</p>
                <p className="text-sm text-gray-600">تحليلات حديثة</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* الأداء خلال الفترات */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <TrendingUp className="w-5 h-5 ml-2" />
            الأداء خلال الفترات
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { label: 'آخر 24 ساعة', data: data.performance.last24Hours },
              { label: 'آخر 7 أيام', data: data.performance.last7Days },
              { label: 'آخر 30 يوم', data: data.performance.last30Days }
            ].map((period, index) => (
              <div key={index} className="space-y-3">
                <h4 className="font-semibold text-center">{period.label}</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">الاستخدام:</span>
                    <span className="font-semibold">{period.data.totalUsage.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">المشاهدات:</span>
                    <span className="font-semibold">{period.data.totalViews.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">النقرات:</span>
                    <span className="font-semibold">{period.data.totalClicks.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">التفاعلات:</span>
                    <span className="font-semibold">{period.data.totalInteractions.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">متوسط الشعبية:</span>
                    <span className="font-semibold">{period.data.averagePopularity}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* الاتجاهات العامة */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <BarChart3 className="w-5 h-5 ml-2" />
            اتجاهات النمو
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">{data.trends.averageGrowthRate}%</p>
              <p className="text-sm text-gray-600">متوسط النمو</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{data.trends.maxGrowthRate}%</p>
              <p className="text-sm text-gray-600">أعلى نمو</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-red-600">{data.trends.minGrowthRate}%</p>
              <p className="text-sm text-gray-600">أقل نمو</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-600">{data.trends.averagePopularity}</p>
              <p className="text-sm text-gray-600">متوسط الشعبية</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-orange-600">{data.trends.maxPopularity}</p>
              <p className="text-sm text-gray-600">أعلى شعبية</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* أفضل العلامات أداءً */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Eye className="w-5 h-5 ml-2" />
            أفضل العلامات أداءً
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {data.topPerformers.map((tag, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="min-w-6 justify-center">
                    {index + 1}
                  </Badge>
                  <span className="font-semibold">{tag.name}</span>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <span className="text-blue-600">الشعبية: {tag.popularity}</span>
                  <span className="text-green-600">النمو: {tag.growth}%</span>
                  <span className="text-purple-600">الاستخدام: {tag.usage}</span>
                  <span className="text-orange-600">المشاهدات: {tag.views.toLocaleString()}</span>
                  <span className="text-gray-500">آخر استخدام: {tag.lastUsed}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* معلومات آخر تحديث */}
      {data.lastUpdate.cronJob && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Clock className="w-5 h-5 ml-2" />
              آخر تحديث
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <span className="text-sm text-gray-600">تاريخ المهمة المجدولة:</span>
                <p className="font-semibold">
                  {new Date(data.lastUpdate.cronJob).toLocaleString('ar-SA')}
                </p>
              </div>
              <div>
                <span className="text-sm text-gray-600">يوم التحليلات:</span>
                <p className="font-semibold">{data.lastUpdate.analyticsDate}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default WordCloudMonitor;
