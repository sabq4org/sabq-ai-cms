/**
 * صفحة التحليلات المتقدمة - التصميم الاحترافي المحسن
 * Modern Advanced Analytics Page - Enhanced Professional Design
 */

'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import DashboardLayout from '@/components/admin/modern-dashboard/DashboardLayout';
import { useDarkModeContext } from '@/contexts/DarkModeContext';
import {
  TrendingUp,
  TrendingDown,
  Eye,
  Users,
  Clock,
  Globe,
  Smartphone,
  Monitor,
  Tablet,
  BarChart3,
  PieChart,
  Activity,
  Target,
  Calendar,
  Download,
  Filter,
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight,
  Zap,
  Heart,
  MessageSquare,
  Share2,
  BookOpen,
  Timer,
  MapPin,
  Star,
  AlertCircle,
  SortDesc,
  CheckCircle,
  Sparkles,
  Award,
  Lightbulb,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  FileText,
  Newspaper,
  DollarSign,
  UserCheck,
  Layers,
  MousePointer,
  LineChart,
  Hash,
  Gauge
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import toast from 'react-hot-toast';

interface AnalyticsData {
  pageViews: number;
  uniqueVisitors: number;
  avgSessionDuration: string;
  bounceRate: number;
  topPages: Array<{ page: string; views: number; change: number }>;
  deviceStats: Array<{ device: string; percentage: number; count: number }>;
  trafficSources: Array<{ source: string; percentage: number; visitors: number }>;
  geographicData: Array<{ country: string; visitors: number; percentage: number }>;
  realtimeStats: {
    activeUsers: number;
    pageViewsLastHour: number;
    topActivePages: string[];
  };
}

const analyticsData: AnalyticsData = {
  pageViews: 128459,
  uniqueVisitors: 45231,
  avgSessionDuration: '4:23',
  bounceRate: 42.3,
  topPages: [
    { page: '/news/economy/saudi-vision-2030', views: 15420, change: 12.5 },
    { page: '/news/tech/ai-middle-east', views: 12890, change: 8.2 },
    { page: '/news/politics/g20-summit', views: 9760, change: -2.1 },
    { page: '/news/sports/world-cup', views: 8430, change: 15.3 },
    { page: '/news/business/startup-funding', views: 7250, change: 5.7 }
  ],
  deviceStats: [
    { device: 'desktop', percentage: 45.2, count: 20454 },
    { device: 'mobile', percentage: 41.8, count: 18906 },
    { device: 'tablet', percentage: 13.0, count: 5871 }
  ],
  trafficSources: [
    { source: 'Organic Search', percentage: 52.3, visitors: 23656 },
    { source: 'Direct', percentage: 28.7, visitors: 12981 },
    { source: 'Social Media', percentage: 12.4, visitors: 5609 },
    { source: 'Email', percentage: 4.2, visitors: 1900 },
    { source: 'Referral', percentage: 2.4, visitors: 1085 }
  ],
  geographicData: [
    { country: 'السعودية', visitors: 25120, percentage: 55.5 },
    { country: 'الإمارات', visitors: 8940, percentage: 19.8 },
    { country: 'قطر', visitors: 4230, percentage: 9.4 },
    { country: 'الكويت', visitors: 3850, percentage: 8.5 },
    { country: 'البحرين', visitors: 3091, percentage: 6.8 }
  ],
  realtimeStats: {
    activeUsers: 1247,
    pageViewsLastHour: 3456,
    topActivePages: [
      '/news/breaking/oil-prices',
      '/news/tech/metaverse-summit',
      '/news/economy/inflation-report'
    ]
  }
};

export default function ModernAnalytics() {
  const { darkMode } = useDarkModeContext();
  const [selectedPeriod, setSelectedPeriod] = useState('7d');
  const [activeTab, setActiveTab] = useState('overview');

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}م`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}ك`;
    return num.toString();
  };

  const getDeviceIcon = (device: string) => {
    switch (device) {
      case 'desktop': return Monitor;
      case 'mobile': return Smartphone;
      case 'tablet': return Tablet;
      default: return Monitor;
    }
  };

  const getDeviceName = (device: string) => {
    switch (device) {
      case 'desktop': return 'سطح المكتب';
      case 'mobile': return 'الجوال';
      case 'tablet': return 'الجهاز اللوحي';
      default: return device;
    }
  };

  const getChangeColor = (change: number) => {
    return change >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400';
  };

  const getChangeIcon = (change: number) => {
    return change >= 0 ? ArrowUpRight : ArrowDownRight;
  };

  // حساب إحصائيات إضافية
  const stats = {
    totalEngagement: analyticsData.pageViews + analyticsData.uniqueVisitors * 2,
    avgPagesPerSession: Math.round(analyticsData.pageViews / analyticsData.uniqueVisitors * 10) / 10,
    conversionRate: 3.2,
    revenue: 125430,
    returningVisitors: Math.round(analyticsData.uniqueVisitors * 0.45),
    newVisitors: Math.round(analyticsData.uniqueVisitors * 0.55),
    mobilePercentage: analyticsData.deviceStats.find(d => d.device === 'mobile')?.percentage || 0,
    socialMediaGrowth: 23.5
  };

  // مكون بطاقة الإحصائية
  const StatsCard = ({ 
    title, 
    value, 
    subtitle, 
    icon: Icon, 
    bgColor,
    iconColor,
    change,
    prefix = '',
    suffix = ''
  }: {
    title: string;
    value: string | number;
    subtitle?: string;
    icon: any;
    bgColor: string;
    iconColor: string;
    change?: number;
    prefix?: string;
    suffix?: string;
  }) => (
    <div className={`rounded-2xl p-4 sm:p-6 shadow-sm border transition-all duration-300 hover:shadow-md hover:scale-[1.02] ${
      darkMode 
        ? 'bg-gray-800 border-gray-700' 
        : 'bg-white border-gray-100'
    }`}>
      <div className="flex items-center gap-3 sm:gap-4">
        <div className={`w-10 h-10 sm:w-12 sm:h-12 ${bgColor} rounded-full flex items-center justify-center`}>
          <Icon className={`w-5 h-5 sm:w-6 sm:h-6 ${iconColor}`} />
        </div>
        <div className="flex-1">
          <p className={`text-xs sm:text-sm mb-1 transition-colors duration-300 ${
            darkMode ? 'text-gray-400' : 'text-gray-500'
          }`}>{title}</p>
          <div className="flex items-baseline gap-1 sm:gap-2">
            <span className={`text-lg sm:text-2xl font-bold transition-colors duration-300 ${
              darkMode ? 'text-white' : 'text-gray-800'
            }`}>{prefix}{value}{suffix}</span>
            {subtitle && (
              <span className={`text-xs sm:text-sm transition-colors duration-300 ${
                darkMode ? 'text-gray-400' : 'text-gray-500'
              }`}>{subtitle}</span>
            )}
          </div>
          {change !== undefined && (
            <div className={`flex items-center gap-1 mt-1 text-xs font-medium ${getChangeColor(change)}`}>
              {React.createElement(getChangeIcon(change), { className: 'w-3 h-3' })}
              <span>{Math.abs(change)}%</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <DashboardLayout 
      pageTitle="التحليلات المتقدمة"
      pageDescription="تحليل شامل لأداء الموقع وسلوك الزوار"
    >
      <div className={`transition-colors duration-300 ${
        darkMode ? 'bg-gray-900' : ''
      }`}>
        {/* عنوان وتعريف الصفحة المحسن */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            <div>
              <h1 className={`text-2xl sm:text-3xl font-bold mb-2 transition-colors duration-300 ${
                darkMode ? 'text-white' : 'text-gray-800'
              }`}>
                📊 التحليلات المتقدمة
              </h1>
              <p className={`text-sm sm:text-base transition-colors duration-300 ${
                darkMode ? 'text-gray-300' : 'text-gray-600'
              }`}>
                رؤى عميقة وتحليلات ذكية لأداء الموقع
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-gradient-to-r from-purple-100 to-indigo-100 text-purple-700">
                <Activity className="w-3 h-3 mr-1" />
                {analyticsData.realtimeStats.activeUsers} مستخدم نشط
              </Badge>
              <Badge variant="outline" className={darkMode ? 'border-gray-600' : ''}>
                <Zap className="w-3 h-3 mr-1" />
                في الوقت الفعلي
              </Badge>
            </div>
          </div>
          
          {/* شريط المؤشرات السريعة */}
          <div className={`rounded-xl p-3 border ${
            darkMode 
              ? 'bg-gray-800/50 border-gray-700' 
              : 'bg-gray-50 border-gray-200'
          }`}>
            <div className="flex items-center justify-between text-xs sm:text-sm">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <Eye className={`w-4 h-4 text-blue-500`} />
                  <span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>
                    {formatNumber(analyticsData.realtimeStats.pageViewsLastHour)} في الساعة الأخيرة
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <UserCheck className={`w-4 h-4 text-green-500`} />
                  <span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>
                    {stats.conversionRate}% معدل التحويل
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Smartphone className={`w-4 h-4 text-orange-500`} />
                  <span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>
                    {stats.mobilePercentage}% من الجوال
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => toast.success('تم تحديث البيانات')}
                  className={`${darkMode ? 'border-gray-600 hover:bg-gray-700' : ''}`}
                >
                  <RefreshCw className="h-4 w-4 ml-2" />
                  تحديث
                </Button>
                <Button
                  onClick={() => toast('قريباً: تصدير التقرير', { icon: '📊' })}
                  className="bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white shadow-lg"
                >
                  <Download className="h-4 w-4 ml-2" />
                  تصدير
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* قسم النظام الذكي المحسن */}
        <div className="mb-6 sm:mb-8">
          <div className={`rounded-2xl p-4 sm:p-6 border transition-colors duration-300 ${
            darkMode 
              ? 'bg-gradient-to-br from-purple-900/40 to-indigo-900/40 border-purple-700/50' 
              : 'bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-100'
          }`}>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                  <BarChart3 className="text-white w-6 h-6" />
                </div>
                <div>
                  <h2 className={`text-lg sm:text-xl font-bold transition-colors duration-300 ${
                    darkMode ? 'text-white' : 'text-gray-800'
                  }`}>
                    🎯 مركز التحليلات الذكي
                  </h2>
                  <p className={`text-xs sm:text-sm transition-colors duration-300 ${
                    darkMode ? 'text-gray-300' : 'text-gray-600'
                  }`}>
                    تحليل متقدم بالذكاء الاصطناعي لفهم سلوك الزوار
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <select 
                  value={selectedPeriod}
                  onChange={(e) => setSelectedPeriod(e.target.value)}
                  className={`px-3 py-1 text-sm rounded-md border ${
                    darkMode 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300'
                  }`}
                >
                  <option value="1d">اليوم</option>
                  <option value="7d">آخر 7 أيام</option>
                  <option value="30d">آخر 30 يوم</option>
                  <option value="90d">آخر 3 أشهر</option>
                </select>
              </div>
            </div>
            
            {/* مؤشرات الأداء الذكية */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4">
              <div className={`rounded-xl p-3 sm:p-4 border transition-all duration-300 hover:scale-105 ${
                darkMode 
                  ? 'bg-gray-800/70 border-green-600/50 hover:bg-gray-800' 
                  : 'bg-white/80 border-green-100 hover:bg-white'
              }`}>
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className={`text-xs sm:text-sm font-medium ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                      نمو الزيارات
                    </p>
                    <p className="text-xs font-bold text-green-600">
                      +23.5%
                    </p>
                  </div>
                </div>
              </div>
              
              <div className={`rounded-xl p-3 sm:p-4 border transition-all duration-300 hover:scale-105 ${
                darkMode 
                  ? 'bg-gray-800/70 border-blue-600/50 hover:bg-gray-800' 
                  : 'bg-white/80 border-blue-100 hover:bg-white'
              }`}>
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                    <Target className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className={`text-xs sm:text-sm font-medium ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                      هدف الشهر
                    </p>
                    <p className={`text-xs font-bold ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                      87% مكتمل
                    </p>
                  </div>
                </div>
              </div>
              
              <div className={`rounded-xl p-3 sm:p-4 border transition-all duration-300 hover:scale-105 ${
                darkMode 
                  ? 'bg-gray-800/70 border-purple-600/50 hover:bg-gray-800' 
                  : 'bg-white/80 border-purple-100 hover:bg-white'
              }`}>
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                    <Award className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className={`text-xs sm:text-sm font-medium ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                      تقييم الأداء
                    </p>
                    <p className={`text-xs font-bold ${darkMode ? 'text-purple-400' : 'text-purple-600'}`}>
                      ممتاز
                    </p>
                  </div>
                </div>
              </div>
              
              <div className={`rounded-xl p-3 sm:p-4 border transition-all duration-300 hover:scale-105 ${
                darkMode 
                  ? 'bg-gray-800/70 border-orange-600/50 hover:bg-gray-800' 
                  : 'bg-white/80 border-orange-100 hover:bg-white'
              }`}>
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className={`text-xs sm:text-sm font-medium ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                      توصيات AI
                    </p>
                    <p className={`text-xs font-bold ${darkMode ? 'text-orange-400' : 'text-orange-600'}`}>
                      5 جديدة
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* بطاقات الإحصائيات المحسنة */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8">
          <StatsCard
            title="مشاهدات الصفحة"
            value={formatNumber(analyticsData.pageViews)}
            subtitle="مشاهدة"
            icon={Eye}
            bgColor="bg-gradient-to-br from-blue-100 to-blue-200"
            iconColor="text-blue-600"
            change={15.3}
          />
          <StatsCard
            title="الزوار الفريدون"
            value={formatNumber(analyticsData.uniqueVisitors)}
            subtitle="زائر"
            icon={Users}
            bgColor="bg-gradient-to-br from-green-100 to-green-200"
            iconColor="text-green-600"
            change={8.2}
          />
          <StatsCard
            title="متوسط الجلسة"
            value={analyticsData.avgSessionDuration}
            subtitle="دقيقة"
            icon={Clock}
            bgColor="bg-gradient-to-br from-purple-100 to-purple-200"
            iconColor="text-purple-600"
            change={5.1}
          />
          <StatsCard
            title="معدل الارتداد"
            value={analyticsData.bounceRate}
            suffix="%"
            icon={MousePointer}
            bgColor="bg-gradient-to-br from-orange-100 to-orange-200"
            iconColor="text-orange-600"
            change={-2.3}
          />
          <StatsCard
            title="الإيرادات"
            value={formatNumber(stats.revenue)}
            prefix="$"
            icon={DollarSign}
            bgColor="bg-gradient-to-br from-emerald-100 to-emerald-200"
            iconColor="text-emerald-600"
            change={12.7}
          />
          <StatsCard
            title="معدل التحويل"
            value={stats.conversionRate}
            suffix="%"
            icon={Target}
            bgColor="bg-gradient-to-br from-indigo-100 to-indigo-200"
            iconColor="text-indigo-600"
            change={3.2}
          />
        </div>

        {/* التبويبات */}
        <Tabs defaultValue="overview" className="mb-6">
          <TabsList className={`grid w-full grid-cols-5 ${
            darkMode ? 'bg-gray-800' : 'bg-gray-100'
          }`}>
            <TabsTrigger value="overview">نظرة عامة</TabsTrigger>
            <TabsTrigger value="audience">الجمهور</TabsTrigger>
            <TabsTrigger value="content">المحتوى</TabsTrigger>
            <TabsTrigger value="traffic">المصادر</TabsTrigger>
            <TabsTrigger value="realtime">الوقت الفعلي</TabsTrigger>
          </TabsList>

          {/* محتوى التبويبات */}
          <TabsContent value="overview" className="space-y-6">
            {/* أفضل الصفحات */}
            <div className={`rounded-2xl shadow-lg border overflow-hidden transition-colors duration-300 ${
              darkMode 
                ? 'bg-gray-800 border-gray-700' 
                : 'bg-white border-gray-100'
            }`}>
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                  🏆 أفضل الصفحات أداءً
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className={`border-b ${darkMode ? 'border-gray-700 bg-gray-900/50' : 'border-gray-200 bg-gray-50'}`}>
                      <th className={`px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider ${
                        darkMode ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        الصفحة
                      </th>
                      <th className={`px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider ${
                        darkMode ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        المشاهدات
                      </th>
                      <th className={`px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider ${
                        darkMode ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        التغيير
                      </th>
                      <th className={`px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider ${
                        darkMode ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        الأداء
                      </th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${darkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
                    {analyticsData.topPages.map((page, index) => (
                      <tr key={index} className={`transition-all duration-200 hover:scale-[1.01] ${
                        darkMode ? 'hover:bg-gray-700/50' : 'hover:bg-blue-50/50'
                      }`}>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                              index === 0 ? 'bg-yellow-100 text-yellow-600' :
                              index === 1 ? 'bg-gray-100 text-gray-600' :
                              index === 2 ? 'bg-orange-100 text-orange-600' :
                              'bg-blue-100 text-blue-600'
                            }`}>
                              {index + 1}
                            </div>
                            <span className={`text-sm ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                              {page.page}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            {formatNumber(page.views)}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className={`flex items-center gap-1 text-sm font-medium ${getChangeColor(page.change)}`}>
                            {React.createElement(getChangeIcon(page.change), { className: 'w-4 h-4' })}
                            <span>{Math.abs(page.change)}%</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className={`w-20 h-2 rounded-full overflow-hidden ${
                            darkMode ? 'bg-gray-700' : 'bg-gray-200'
                          }`}>
                            <div
                              className="h-full bg-gradient-to-r from-blue-500 to-indigo-600"
                              style={{ width: `${(page.views / analyticsData.topPages[0].views) * 100}%` }}
                            />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* إحصائيات الأجهزة */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className={`rounded-2xl p-6 shadow-sm border transition-colors duration-300 ${
                darkMode 
                  ? 'bg-gray-800 border-gray-700' 
                  : 'bg-white border-gray-100'
              }`}>
                <h3 className={`text-lg font-semibold mb-6 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                  📱 توزيع الأجهزة
                </h3>
                <div className="space-y-4">
                  {analyticsData.deviceStats.map((device, index) => {
                    const Icon = getDeviceIcon(device.device);
                    return (
                      <div key={index} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                              device.device === 'desktop' ? 'bg-blue-100' :
                              device.device === 'mobile' ? 'bg-green-100' : 'bg-purple-100'
                            }`}>
                              <Icon className={`w-5 h-5 ${
                                device.device === 'desktop' ? 'text-blue-600' :
                                device.device === 'mobile' ? 'text-green-600' : 'text-purple-600'
                              }`} />
                            </div>
                            <div>
                              <p className={`font-medium ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                                {getDeviceName(device.device)}
                              </p>
                              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                {formatNumber(device.count)} مستخدم
                              </p>
                            </div>
                          </div>
                          <span className={`text-lg font-bold ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                            {device.percentage}%
                          </span>
                        </div>
                        <div className={`w-full h-3 rounded-full overflow-hidden ${
                          darkMode ? 'bg-gray-700' : 'bg-gray-200'
                        }`}>
                          <div
                            className={`h-full transition-all duration-1000 ${
                              device.device === 'desktop' ? 'bg-gradient-to-r from-blue-500 to-blue-600' :
                              device.device === 'mobile' ? 'bg-gradient-to-r from-green-500 to-green-600' :
                              'bg-gradient-to-r from-purple-500 to-purple-600'
                            }`}
                            style={{ width: `${device.percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* مصادر الزيارات */}
              <div className={`rounded-2xl p-6 shadow-sm border transition-colors duration-300 ${
                darkMode 
                  ? 'bg-gray-800 border-gray-700' 
                  : 'bg-white border-gray-100'
              }`}>
                <h3 className={`text-lg font-semibold mb-6 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                  🌐 مصادر الزيارات
                </h3>
                <div className="space-y-4">
                  {analyticsData.trafficSources.map((source, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${
                          index === 0 ? 'bg-blue-500' :
                          index === 1 ? 'bg-green-500' :
                          index === 2 ? 'bg-purple-500' :
                          index === 3 ? 'bg-orange-500' : 'bg-gray-500'
                        }`} />
                        <div>
                          <p className={`font-medium ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                            {source.source}
                          </p>
                          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            {formatNumber(source.visitors)} زائر
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-bold ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                          {source.percentage}%
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>

          {/* التبويبات الأخرى */}
          <TabsContent value="audience" className="space-y-6">
            <div className={`rounded-2xl p-8 text-center border ${
              darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'
            }`}>
              <Globe className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <h3 className={`text-lg font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                تحليلات الجمهور
              </h3>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                قريباً: تحليلات مفصلة عن جمهورك
              </p>
            </div>
          </TabsContent>

          <TabsContent value="content" className="space-y-6">
            <div className={`rounded-2xl p-8 text-center border ${
              darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'
            }`}>
              <FileText className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <h3 className={`text-lg font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                تحليلات المحتوى
              </h3>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                قريباً: تحليلات أداء المحتوى
              </p>
            </div>
          </TabsContent>

          <TabsContent value="traffic" className="space-y-6">
            <div className={`rounded-2xl p-8 text-center border ${
              darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'
            }`}>
              <Globe className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <h3 className={`text-lg font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                مصادر الزيارات المفصلة
              </h3>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                قريباً: تحليلات مفصلة لمصادر الزيارات
              </p>
            </div>
          </TabsContent>

          <TabsContent value="realtime" className="space-y-6">
            {/* إحصائيات الوقت الفعلي */}
            <div className={`rounded-2xl p-6 shadow-sm border transition-colors duration-300 ${
              darkMode 
                ? 'bg-gradient-to-br from-blue-900/40 to-indigo-900/40 border-blue-700/50' 
                : 'bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-100'
            }`}>
              <div className="flex items-center justify-between mb-6">
                <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                  ⚡ نشاط الوقت الفعلي
                </h3>
                <Badge variant="secondary" className="bg-green-100 text-green-700">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-2" />
                  مباشر
                </Badge>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className={`text-4xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                    {analyticsData.realtimeStats.activeUsers}
                  </div>
                  <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    مستخدم نشط الآن
                  </p>
                </div>
                <div className="text-center">
                  <div className={`text-4xl font-bold mb-2 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                    {formatNumber(analyticsData.realtimeStats.pageViewsLastHour)}
                  </div>
                  <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    مشاهدة في الساعة الأخيرة
                  </p>
                </div>
                <div className="text-center">
                  <div className={`text-4xl font-bold mb-2 ${darkMode ? 'text-green-400' : 'text-green-600'}`}>
                    {analyticsData.realtimeStats.topActivePages.length}
                  </div>
                  <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    صفحة نشطة
                  </p>
                </div>
              </div>
              
              <div className="mt-6">
                <h4 className={`text-sm font-medium mb-3 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  الصفحات الأكثر نشاطاً الآن:
                </h4>
                <div className="space-y-2">
                  {analyticsData.realtimeStats.topActivePages.map((page, index) => (
                    <div key={index} className={`px-3 py-2 rounded-lg ${
                      darkMode ? 'bg-gray-800/70' : 'bg-white/70'
                    }`}>
                      <span className={`text-sm ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                        {page}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
