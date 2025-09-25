/**
 * صفحة التحليلات المتقدمة - التصميم الاحترافي المحسن
 * Modern Advanced Analytics Page - Enhanced Professional Design
 */

"use client";

import { DesignComponents } from "@/components/design-system/DesignSystemGuide";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  Clock,
  Download,
  Eye,
  Filter,
  Globe,
  LineChart,
  Monitor,
  Share2,
  Smartphone,
  Sparkles,
  Tablet,
  Target,
  Users,
} from "lucide-react";
import { useState } from "react";

interface AnalyticsData {
  pageViews: number;
  uniqueVisitors: number;
  avgSessionDuration: string;
  bounceRate: number;
  topPages: Array<{ page: string; views: number; change: number }>;
  deviceStats: Array<{ device: string; percentage: number; count: number }>;
  trafficSources: Array<{
    source: string;
    percentage: number;
    visitors: number;
  }>;
  geographicData: Array<{
    country: string;
    visitors: number;
    percentage: number;
  }>;
  realtimeStats: {
    activeUsers: number;
    pageViewsLastHour: number;
    topActivePages: string[];
  };
}

const analyticsData: AnalyticsData = {
  pageViews: 128459,
  uniqueVisitors: 45231,
  avgSessionDuration: "4:23",
  bounceRate: 42.3,
  topPages: [
    { page: "/news/economy/saudi-vision-2030", views: 15420, change: 12.5 },
    { page: "/news/tech/ai-middle-east", views: 12890, change: 8.2 },
    { page: "/news/politics/g20-summit", views: 9760, change: -2.1 },
    { page: "/news/sports/world-cup", views: 8430, change: 15.3 },
    { page: "/news/business/startup-funding", views: 7250, change: 5.7 },
  ],
  deviceStats: [
    { device: "desktop", percentage: 45.2, count: 20454 },
    { device: "mobile", percentage: 41.8, count: 18906 },
    { device: "tablet", percentage: 13.0, count: 5871 },
  ],
  trafficSources: [
    { source: "Organic Search", percentage: 52.3, visitors: 23656 },
    { source: "Direct", percentage: 28.7, visitors: 12981 },
    { source: "Social Media", percentage: 12.4, visitors: 5609 },
    { source: "Email", percentage: 4.2, visitors: 1900 },
    { source: "Referral", percentage: 2.4, visitors: 1085 },
  ],
  geographicData: [
    { country: "السعودية", visitors: 25120, percentage: 55.5 },
    { country: "الإمارات", visitors: 8940, percentage: 19.8 },
    { country: "قطر", visitors: 4230, percentage: 9.4 },
    { country: "الكويت", visitors: 3850, percentage: 8.5 },
    { country: "البحرين", visitors: 3091, percentage: 6.8 },
  ],
  realtimeStats: {
    activeUsers: 1247,
    pageViewsLastHour: 3456,
    topActivePages: [
      "/news/breaking/oil-prices",
      "/news/tech/metaverse-summit",
      "/news/economy/inflation-report",
    ],
  },
};

export default function ModernAnalyticsContent() {
  const [selectedPeriod, setSelectedPeriod] = useState("7d");

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}م`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}ك`;
    return num.toString();
  };

  const getDeviceIcon = (device: string) => {
    switch (device) {
      case "desktop":
        return Monitor;
      case "mobile":
        return Smartphone;
      case "tablet":
        return Tablet;
      default:
        return Monitor;
    }
  };

  const getDeviceName = (device: string) => {
    switch (device) {
      case "desktop":
        return "سطح المكتب";
      case "mobile":
        return "الجوال";
      case "tablet":
        return "الجهاز اللوحي";
      default:
        return device;
    }
  };

  const statsCards = [
    {
      title: "مشاهدات الصفحة",
      value: formatNumber(analyticsData.pageViews),
      icon: Eye,
      change: "+12.5%",
      changeType: "increase" as const,
      color: "blue",
    },
    {
      title: "الزوار الفريدون",
      value: formatNumber(analyticsData.uniqueVisitors),
      icon: Users,
      change: "+8.2%",
      changeType: "increase" as const,
      color: "green",
    },
    {
      title: "متوسط مدة الجلسة",
      value: analyticsData.avgSessionDuration,
      icon: Clock,
      change: "+5.1%",
      changeType: "increase" as const,
      color: "purple",
    },
    {
      title: "معدل الارتداد",
      value: `${analyticsData.bounceRate}%`,
      icon: Target,
      change: "-2.3%",
      changeType: "decrease" as const,
      color: "orange",
    },
  ];

  return (
    <div className="space-y-8">
        {/* رسالة الترحيب الاحترافية */}
        <DesignComponents.StandardCard className="p-6 bg-gradient-to-l from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-800">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-12 h-12 bg-blue-100 dark:bg-blue-900/50 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                التحليلات المتقدمة
              </h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                رؤى عميقة وتحليلات ذكية لأداء الموقع وسلوك الزوار
              </p>
              <div className="flex gap-3">
                <DesignComponents.StatusIndicator
                  status="success"
                  text={`${analyticsData.realtimeStats.activeUsers} مستخدم نشط`}
                />
                <DesignComponents.StatusIndicator
                  status="info"
                  text="في الوقت الفعلي"
                />
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                آخر تحديث
              </div>
              <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {new Date().toLocaleTimeString("ar-SA", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>
            </div>
          </div>
        </DesignComponents.StandardCard>

        {/* الإحصائيات الرئيسية */}
        <div>
          <DesignComponents.SectionHeader
            title="الإحصائيات الرئيسية"
            description="أهم المؤشرات والبيانات لأداء الموقع"
            action={
              <DesignComponents.ActionBar>
                <Button variant="outline" size="sm">
                  <Filter className="w-4 h-4 ml-2" />
                  تصفية
                </Button>
                <Button size="sm">
                  <Download className="w-4 h-4 ml-2" />
                  تصدير
                </Button>
              </DesignComponents.ActionBar>
            }
          />

          <DesignComponents.DynamicGrid minItemWidth="280px" className="mb-8">
            {statsCards.map((stat, index) => {
              const Icon = stat.icon;
              const ChangeIcon =
                stat.changeType === "increase" ? ArrowUpRight : ArrowDownRight;
              return (
                <DesignComponents.StandardCard
                  key={index}
                  className="p-6 hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        {stat.title}
                      </p>
                      <div className="flex items-center gap-3 mt-2">
                        <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                          {stat.value}
                        </p>
                        <div
                          className={cn(
                            "flex items-center gap-1 text-sm font-medium px-2 py-1 rounded-full",
                            stat.changeType === "increase"
                              ? "text-green-700 bg-green-100 dark:bg-green-900/30 dark:text-green-400"
                              : "text-red-700 bg-red-100 dark:bg-red-900/30 dark:text-red-400"
                          )}
                        >
                          <ChangeIcon className="w-3 h-3" />
                          {stat.change}
                        </div>
                      </div>
                    </div>
                    <div
                      className={cn(
                        "w-12 h-12 rounded-lg flex items-center justify-center",
                        stat.color === "blue" &&
                          "bg-blue-100 dark:bg-blue-900/30",
                        stat.color === "green" &&
                          "bg-green-100 dark:bg-green-900/30",
                        stat.color === "purple" &&
                          "bg-purple-100 dark:bg-purple-900/30",
                        stat.color === "orange" &&
                          "bg-orange-100 dark:bg-orange-900/30"
                      )}
                    >
                      <Icon
                        className={cn(
                          "w-6 h-6",
                          stat.color === "blue" &&
                            "text-blue-600 dark:text-blue-400",
                          stat.color === "green" &&
                            "text-green-600 dark:text-green-400",
                          stat.color === "purple" &&
                            "text-purple-600 dark:text-purple-400",
                          stat.color === "orange" &&
                            "text-orange-600 dark:text-orange-400"
                        )}
                      />
                    </div>
                  </div>
                </DesignComponents.StandardCard>
              );
            })}
          </DesignComponents.DynamicGrid>
        </div>

        {/* التبويبات المتقدمة */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">نظرة عامة</TabsTrigger>
            <TabsTrigger value="traffic">مصادر الزيارات</TabsTrigger>
            <TabsTrigger value="devices">الأجهزة</TabsTrigger>
            <TabsTrigger value="geography">الجغرافيا</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <DesignComponents.DynamicGrid minItemWidth="400px">
              <DesignComponents.StandardCard className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <LineChart className="h-5 w-5 text-blue-500" />
                    <h3 className="font-semibold">الصفحات الأكثر زيارة</h3>
                  </div>
                </div>
                <div className="space-y-3">
                  {analyticsData.topPages.map((page, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {page.page}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatNumber(page.views)} مشاهدة
                        </p>
                      </div>
                      <div
                        className={cn(
                          "flex items-center gap-1 text-sm px-2 py-1 rounded-full",
                          page.change > 0
                            ? "text-green-700 bg-green-100 dark:bg-green-900/30"
                            : "text-red-700 bg-red-100 dark:bg-red-900/30"
                        )}
                      >
                        {page.change > 0 ? (
                          <ArrowUpRight className="w-3 h-3" />
                        ) : (
                          <ArrowDownRight className="w-3 h-3" />
                        )}
                        {Math.abs(page.change)}%
                      </div>
                    </div>
                  ))}
                </div>
              </DesignComponents.StandardCard>

              <DesignComponents.StandardCard className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Activity className="h-5 w-5 text-green-500" />
                    <h3 className="font-semibold">الإحصائيات المباشرة</h3>
                  </div>
                  <DesignComponents.StatusIndicator
                    status="success"
                    text="مباشر"
                  />
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">
                      المستخدمون النشطون
                    </span>
                    <span className="text-lg font-bold">
                      {analyticsData.realtimeStats.activeUsers}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">
                      المشاهدات في الساعة الأخيرة
                    </span>
                    <span className="text-lg font-bold">
                      {formatNumber(
                        analyticsData.realtimeStats.pageViewsLastHour
                      )}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-2">
                      الصفحات النشطة:
                    </p>
                    <div className="space-y-1">
                      {analyticsData.realtimeStats.topActivePages.map(
                        (page, index) => (
                          <div
                            key={index}
                            className="text-xs text-gray-500 bg-gray-50 dark:bg-gray-800 px-2 py-1 rounded"
                          >
                            {page}
                          </div>
                        )
                      )}
                    </div>
                  </div>
                </div>
              </DesignComponents.StandardCard>
            </DesignComponents.DynamicGrid>
          </TabsContent>

          <TabsContent value="traffic" className="space-y-6">
            <DesignComponents.StandardCard className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Share2 className="h-5 w-5 text-purple-500" />
                  <h3 className="font-semibold">مصادر الزيارات</h3>
                </div>
              </div>
              <div className="space-y-3">
                {analyticsData.trafficSources.map((source, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between"
                  >
                    <span className="text-sm">{source.source}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-gray-600">
                        {formatNumber(source.visitors)}
                      </span>
                      <div className="w-16 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-purple-500 h-2 rounded-full"
                          style={{ width: `${source.percentage}%` }}
                        />
                      </div>
                      <span className="text-xs font-medium w-8 text-right">
                        {source.percentage}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </DesignComponents.StandardCard>
          </TabsContent>

          <TabsContent value="devices" className="space-y-6">
            <DesignComponents.DynamicGrid minItemWidth="300px">
              {analyticsData.deviceStats.map((device, index) => {
                const DeviceIcon = getDeviceIcon(device.device);
                return (
                  <DesignComponents.StandardCard key={index} className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                        <DeviceIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <h3 className="font-semibold">
                          {getDeviceName(device.device)}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {formatNumber(device.count)} جهاز
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex-1 bg-gray-200 rounded-full h-2 mr-3">
                        <div
                          className="bg-blue-500 h-2 rounded-full"
                          style={{ width: `${device.percentage}%` }}
                        />
                      </div>
                      <span className="text-lg font-bold">
                        {device.percentage}%
                      </span>
                    </div>
                  </DesignComponents.StandardCard>
                );
              })}
            </DesignComponents.DynamicGrid>
          </TabsContent>

          <TabsContent value="geography" className="space-y-6">
            <DesignComponents.StandardCard className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Globe className="h-5 w-5 text-blue-500" />
                  <h3 className="font-semibold">الزوار حسب المنطقة</h3>
                </div>
              </div>
              <div className="space-y-3">
                {analyticsData.geographicData.map((country, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between"
                  >
                    <span className="text-sm">{country.country}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-gray-600">
                        {formatNumber(country.visitors)}
                      </span>
                      <div className="w-16 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-500 h-2 rounded-full"
                          style={{
                            width: `${(country.percentage / 60) * 100}%`,
                          }}
                        />
                      </div>
                      <span className="text-xs font-medium w-8 text-right">
                        {country.percentage}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </DesignComponents.StandardCard>
          </TabsContent>
        </Tabs>

        {/* رسالة النجاح والتفوق */}
        <DesignComponents.StandardCard className="p-6 bg-gradient-to-l from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-800">
          <div className="flex items-center gap-4">
            <div className="flex-shrink-0 w-12 h-12 bg-blue-100 dark:bg-blue-900/50 rounded-lg flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">
                أداء ممتاز!
              </h3>
              <p className="text-gray-700 dark:text-gray-300">
                موقعك يحقق نمواً مستمراً مع زيادة في المشاهدات والزوار الفريدين
              </p>
            </div>
            <DesignComponents.StatusIndicator
              status="success"
              text="نمو إيجابي"
            />
          </div>
        </DesignComponents.StandardCard>
      </div>
  );
}
