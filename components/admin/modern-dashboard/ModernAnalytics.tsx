/**
 * صفحة التحليلات المتقدمة الحديثة
 * Modern Advanced Analytics Page
 */

'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import DashboardLayout from '@/components/admin/modern-dashboard/DashboardLayout';
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
  AlertCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';

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
  const [selectedPeriod, setSelectedPeriod] = useState('7d');

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
    return change >= 0 ? 'text-green-600' : 'text-red-600';
  };

  const getChangeIcon = (change: number) => {
    return change >= 0 ? ArrowUpRight : ArrowDownRight;
  };

  return (
    <DashboardLayout 
      pageTitle="التحليلات المتقدمة"
      pageDescription="تحليل شامل لأداء الموقع وسلوك الزوار"
    >
      <div className="space-y-6">
        {/* شريط الأدوات العلوي */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <div className="flex gap-2">
            <Button variant="outline">
              <Calendar className="h-4 w-4 mr-2" />
              الفترة الزمنية
            </Button>
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              تصفية
            </Button>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              تصدير
            </Button>
          </div>
          <div className="flex gap-2">
            <select 
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="px-3 py-2 border rounded-lg text-sm"
            >
              <option value="1d">اليوم</option>
              <option value="7d">آخر 7 أيام</option>
              <option value="30d">آخر 30 يوم</option>
              <option value="90d">آخر 3 أشهر</option>
            </select>
            <Button variant="outline" size="icon">
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* الإحصائيات الرئيسية */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              title: 'مشاهدات الصفحة',
              value: formatNumber(analyticsData.pageViews),
              change: 15.3,
              icon: Eye,
              color: 'blue'
            },
            {
              title: 'الزوار الفريدون',
              value: formatNumber(analyticsData.uniqueVisitors),
              change: 8.2,
              icon: Users,
              color: 'green'
            },
            {
              title: 'متوسط مدة الجلسة',
              value: analyticsData.avgSessionDuration,
              change: 5.1,
              icon: Clock,
              color: 'purple'
            },
            {
              title: 'معدل الارتداد',
              value: `${analyticsData.bounceRate}%`,
              change: -2.3,
              icon: TrendingDown,
              color: 'red'
            }
          ].map((stat) => {
            const ChangeIcon = getChangeIcon(stat.change);
            return (
              <Card key={stat.title}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <stat.icon className={cn(
                        "h-5 w-5",
                        stat.color === 'blue' && "text-blue-500",
                        stat.color === 'green' && "text-green-500",
                        stat.color === 'purple' && "text-purple-500",
                        stat.color === 'red' && "text-red-500"
                      )} />
                      <span className="text-sm font-medium">{stat.title}</span>
                    </div>
                    <div className={cn("flex items-center gap-1 text-xs", getChangeColor(stat.change))}>
                      <ChangeIcon className="h-3 w-3" />
                      <span>{Math.abs(stat.change)}%</span>
                    </div>
                  </div>
                  <div className="text-2xl font-bold">{stat.value}</div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* إحصائيات المباشرة */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-green-500" />
                الإحصائيات المباشرة
              </CardTitle>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-sm text-gray-600">مباشر</span>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 mb-1">
                  {analyticsData.realtimeStats.activeUsers.toLocaleString()}
                </div>
                <div className="text-sm text-gray-600">مستخدم نشط الآن</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-1">
                  {analyticsData.realtimeStats.pageViewsLastHour.toLocaleString()}
                </div>
                <div className="text-sm text-gray-600">مشاهدة في الساعة الماضية</div>
              </div>
              <div className="space-y-2">
                <div className="text-sm font-medium">الصفحات الأكثر نشاطاً</div>
                {analyticsData.realtimeStats.topActivePages.map((page, index) => (
                  <div key={index} className="text-xs text-gray-600 truncate">
                    {page}
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* التبويبات والمحتوى */}
        <Tabs defaultValue="overview">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">نظرة عامة</TabsTrigger>
            <TabsTrigger value="content">المحتوى</TabsTrigger>
            <TabsTrigger value="audience">الجمهور</TabsTrigger>
            <TabsTrigger value="performance">الأداء</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* أفضل الصفحات */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    أفضل الصفحات
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {analyticsData.topPages.map((page, index) => {
                      const ChangeIcon = getChangeIcon(page.change);
                      return (
                        <div key={index} className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">
                          <div className="flex-1">
                            <div className="text-sm font-medium truncate">{page.page}</div>
                            <div className="text-xs text-gray-500">{formatNumber(page.views)} مشاهدة</div>
                          </div>
                          <div className={cn("flex items-center gap-1 text-xs", getChangeColor(page.change))}>
                            <ChangeIcon className="h-3 w-3" />
                            <span>{Math.abs(page.change)}%</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* إحصائيات الأجهزة */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Monitor className="h-5 w-5" />
                    توزيع الأجهزة
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {analyticsData.deviceStats.map((device) => {
                      const DeviceIcon = getDeviceIcon(device.device);
                      return (
                        <div key={device.device} className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <DeviceIcon className="h-5 w-5 text-gray-500" />
                            <span className="text-sm">{getDeviceName(device.device)}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="w-24 bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-blue-600 h-2 rounded-full" 
                                style={{ width: `${device.percentage}%` }}
                              />
                            </div>
                            <span className="text-sm font-medium w-12 text-right">
                              {device.percentage}%
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* مصادر الزيارات */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="h-5 w-5" />
                    مصادر الزيارات
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {analyticsData.trafficSources.map((source, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="text-sm font-medium">{source.source}</div>
                          <div className="text-xs text-gray-500">{formatNumber(source.visitors)} زائر</div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-20 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-green-600 h-2 rounded-full" 
                              style={{ width: `${source.percentage}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium w-10 text-right">
                            {source.percentage}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* التوزيع الجغرافي */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    التوزيع الجغرافي
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {analyticsData.geographicData.map((country, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="text-sm font-medium">{country.country}</div>
                          <div className="text-xs text-gray-500">{formatNumber(country.visitors)} زائر</div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-20 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-purple-600 h-2 rounded-full" 
                              style={{ width: `${country.percentage}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium w-10 text-right">
                            {country.percentage}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="content" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { title: 'المقالات المنشورة', value: '2,847', icon: BookOpen, color: 'blue' },
                { title: 'متوسط وقت القراءة', value: '4:23', icon: Timer, color: 'green' },
                { title: 'معدل التفاعل', value: '12.5%', icon: Heart, color: 'red' }
              ].map((stat) => (
                <Card key={stat.title}>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <stat.icon className={cn(
                        "h-8 w-8",
                        stat.color === 'blue' && "text-blue-500",
                        stat.color === 'green' && "text-green-500",
                        stat.color === 'red' && "text-red-500"
                      )} />
                      <div>
                        <div className="text-sm text-gray-600">{stat.title}</div>
                        <div className="text-2xl font-bold">{stat.value}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card>
              <CardHeader>
                <CardTitle>أداء المحتوى</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { category: 'اقتصاد', articles: 45, views: 234567, engagement: 8.2 },
                    { category: 'تقنية', articles: 32, views: 189432, engagement: 12.5 },
                    { category: 'سياسة', articles: 28, views: 167890, engagement: 6.8 },
                    { category: 'رياضة', articles: 41, views: 156723, engagement: 15.3 }
                  ].map((item) => (
                    <div key={item.category} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <Badge variant="outline">{item.category}</Badge>
                        <div className="text-sm">
                          <span className="font-medium">{item.articles}</span> مقال
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-sm">
                        <div className="text-gray-600">
                          {formatNumber(item.views)} مشاهدة
                        </div>
                        <div className="flex items-center gap-1">
                          <TrendingUp className="h-4 w-4 text-green-500" />
                          <span className="text-green-600">{item.engagement}%</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="audience" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>تحليل الجمهور</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">الزوار الجدد</span>
                      <span className="font-semibold">67.3%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">الزوار العائدون</span>
                      <span className="font-semibold">32.7%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">متوسط الصفحات/جلسة</span>
                      <span className="font-semibold">2.4</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">المشتركون في النشرة</span>
                      <span className="font-semibold">15,429</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>أوقات الذروة</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { time: '08:00 - 10:00', percentage: 23.5 },
                      { time: '12:00 - 14:00', percentage: 34.7 },
                      { time: '18:00 - 20:00', percentage: 41.8 },
                      { time: '20:00 - 22:00', percentage: 28.3 }
                    ].map((slot) => (
                      <div key={slot.time} className="flex items-center justify-between">
                        <span className="text-sm">{slot.time}</span>
                        <div className="flex items-center gap-3">
                          <div className="w-24 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full" 
                              style={{ width: `${(slot.percentage / 50) * 100}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium w-10 text-right">
                            {slot.percentage}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="performance" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[
                { title: 'سرعة التحميل', value: '2.3s', icon: Zap, status: 'good' },
                { title: 'معدل التحويل', value: '3.2%', icon: Target, status: 'average' },
                { title: 'نقاط الأداء', value: '94/100', icon: Star, status: 'excellent' },
                { title: 'الأخطاء', value: '0.02%', icon: AlertCircle, status: 'good' }
              ].map((metric) => (
                <Card key={metric.title}>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <metric.icon className={cn(
                        "h-6 w-6",
                        metric.status === 'excellent' && "text-green-500",
                        metric.status === 'good' && "text-blue-500",
                        metric.status === 'average' && "text-yellow-500"
                      )} />
                      <div>
                        <div className="text-xs text-gray-600">{metric.title}</div>
                        <div className="text-lg font-bold">{metric.value}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card>
              <CardHeader>
                <CardTitle>تقرير الأداء التفصيلي</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="font-semibold">أداء الصفحات</h3>
                    {[
                      { page: 'الصفحة الرئيسية', score: 95, time: '1.2s' },
                      { page: 'صفحة المقالات', score: 87, time: '2.1s' },
                      { page: 'صفحة التصنيفات', score: 92, time: '1.8s' },
                      { page: 'صفحة البحث', score: 89, time: '1.9s' }
                    ].map((page) => (
                      <div key={page.page} className="flex items-center justify-between p-2 border rounded-lg">
                        <span className="text-sm">{page.page}</span>
                        <div className="flex items-center gap-3 text-sm">
                          <Badge variant={page.score >= 90 ? 'default' : 'secondary'}>
                            {page.score}/100
                          </Badge>
                          <span className="text-gray-600">{page.time}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="font-semibold">مؤشرات الجودة</h3>
                    {[
                      { metric: 'First Contentful Paint', value: '1.2s', status: 'good' },
                      { metric: 'Largest Contentful Paint', value: '2.3s', status: 'good' },
                      { metric: 'Cumulative Layout Shift', value: '0.05', status: 'excellent' },
                      { metric: 'Time to Interactive', value: '3.1s', status: 'average' }
                    ].map((metric) => (
                      <div key={metric.metric} className="flex items-center justify-between p-2">
                        <span className="text-sm">{metric.metric}</span>
                        <Badge variant={
                          metric.status === 'excellent' ? 'default' : 
                          metric.status === 'good' ? 'secondary' : 'outline'
                        }>
                          {metric.value}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
