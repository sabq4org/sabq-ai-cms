"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatNumber } from "@/lib/config/localization";
import {
  Activity,
  AlertTriangle,
  BarChart3,
  Clock,
  Eye,
  Target,
  Users,
  Zap,
} from "lucide-react";
import { useEffect, useState } from "react";

interface AnalyticsData {
  current_visitors: number;
  active_sessions: number;
  page_views_last_hour: number;
  top_pages: Array<{ path: string; visitors: number }>;
  traffic_sources: {
    direct: number;
    search: number;
    social: number;
    referral: number;
  };
  performance_metrics: {
    avg_load_time: string;
    bounce_rate: string;
    conversion_rate: string;
  };
  anomalies: Array<{
    type: string;
    metric: string;
    severity: string;
    description: string;
    timestamp: Date;
  }>;
  last_updated: string;
}

export default function AdvancedAnalyticsDashboard() {
  const [realTimeData, setRealTimeData] = useState<AnalyticsData | null>(null);
  const [selectedMetric, setSelectedMetric] = useState("page_views");
  const [timeRange, setTimeRange] = useState("24h");
  const [loading, setLoading] = useState(false);

  // جلب البيانات في الوقت الفعلي
  useEffect(() => {
    const fetchRealTimeData = async () => {
      try {
        const response = await fetch("/api/analytics/realtime");
        const result = await response.json();
        if (result.success) {
          setRealTimeData(result.data);
        }
      } catch (error) {
        console.error("Error fetching real-time data:", error);
      }
    };

    fetchRealTimeData();
    const interval = setInterval(fetchRealTimeData, 30000); // تحديث كل 30 ثانية

    return () => clearInterval(interval);
  }, []);

  const executeAnalyticsQuery = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/analytics/query", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          metric: selectedMetric,
          time_range: timeRange,
          dimensions: ["date"],
          filters: [],
        }),
      });

      const result = await response.json();
      if (result.success) {
        console.log("Analytics result:", result.data);
        // هنا يمكن إضافة منطق لعرض النتائج
      }
    } catch (error) {
      console.error("Analytics query error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">التحليلات المتقدمة</h1>
          <p className="text-muted-foreground">
            مراقبة وتحليل أداء المنصة في الوقت الفعلي
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-green-50 text-green-700">
            <Activity className="w-3 h-3 mr-1" />
            مباشر
          </Badge>
          {realTimeData?.last_updated && (
            <span className="text-sm text-muted-foreground">
              آخر تحديث:{" "}
              {new Date(realTimeData.last_updated).toLocaleTimeString("ar-SA")}
            </span>
          )}
        </div>
      </div>

      {/* Real-time Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              الزوار الحاليون
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {realTimeData
                ? formatNumber(realTimeData.current_visitors)
                : "..."}
            </div>
            <p className="text-xs text-muted-foreground">نشط الآن</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              الجلسات النشطة
            </CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {realTimeData
                ? formatNumber(realTimeData.active_sessions)
                : "..."}
            </div>
            <p className="text-xs text-muted-foreground">جلسة نشطة</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              مشاهدات الساعة الماضية
            </CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {realTimeData
                ? formatNumber(realTimeData.page_views_last_hour)
                : "..."}
            </div>
            <p className="text-xs text-muted-foreground">آخر 60 دقيقة</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">معدل التحويل</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {realTimeData?.performance_metrics.conversion_rate || "..."}
            </div>
            <p className="text-xs text-muted-foreground">معدل الأداء</p>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Query Interface */}
      <Card>
        <CardHeader>
          <CardTitle>استعلام التحليلات المخصص</CardTitle>
          <CardDescription>
            اختر المقياس والفترة الزمنية لتحليل مخصص
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium">المقياس</label>
              <select
                value={selectedMetric}
                onChange={(e) => setSelectedMetric(e.target.value)}
                className="w-full p-2 border rounded-md"
              >
                <option value="page_views">مشاهدات الصفحات</option>
                <option value="unique_visitors">الزوار الفريدون</option>
                <option value="bounce_rate">معدل الارتداد</option>
                <option value="session_duration">مدة الجلسة</option>
                <option value="conversion_rate">معدل التحويل</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-medium">الفترة الزمنية</label>
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="w-full p-2 border rounded-md"
              >
                <option value="1h">آخر ساعة</option>
                <option value="24h">آخر 24 ساعة</option>
                <option value="7d">آخر 7 أيام</option>
                <option value="30d">آخر 30 يوم</option>
                <option value="90d">آخر 90 يوم</option>
              </select>
            </div>

            <div className="flex items-end">
              <Button
                onClick={executeAnalyticsQuery}
                disabled={loading}
                className="w-full"
              >
                {loading ? (
                  <>
                    <Clock className="w-4 h-4 mr-2 animate-spin" />
                    جارٍ التحليل...
                  </>
                ) : (
                  <>
                    <BarChart3 className="w-4 h-4 mr-2" />
                    تشغيل التحليل
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs for different views */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">نظرة عامة</TabsTrigger>
          <TabsTrigger value="traffic">مصادر الزيارات</TabsTrigger>
          <TabsTrigger value="performance">الأداء</TabsTrigger>
          <TabsTrigger value="anomalies">الشذوذات</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Top Pages */}
            <Card>
              <CardHeader>
                <CardTitle>أهم الصفحات</CardTitle>
                <CardDescription>الصفحات الأكثر زيارة</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {realTimeData?.top_pages.map((page, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between"
                    >
                      <span className="text-sm">{page.path}</span>
                      <Badge variant="secondary">
                        {formatNumber(page.visitors)}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Performance Metrics */}
            <Card>
              <CardHeader>
                <CardTitle>مقاييس الأداء</CardTitle>
                <CardDescription>مؤشرات الأداء الرئيسية</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">متوسط وقت التحميل</span>
                  <span className="font-medium">
                    {realTimeData?.performance_metrics.avg_load_time}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">معدل الارتداد</span>
                  <span className="font-medium">
                    {realTimeData?.performance_metrics.bounce_rate}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">معدل التحويل</span>
                  <span className="font-medium">
                    {realTimeData?.performance_metrics.conversion_rate}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="traffic" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>مصادر الزيارات</CardTitle>
              <CardDescription>توزيع الزيارات حسب المصدر</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                {realTimeData &&
                  Object.entries(realTimeData.traffic_sources).map(
                    ([source, value]) => (
                      <div
                        key={source}
                        className="flex items-center justify-between p-3 border rounded"
                      >
                        <span className="capitalize">{source}</span>
                        <span className="font-bold">{value}%</span>
                      </div>
                    )
                  )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>تحليل الأداء</CardTitle>
              <CardDescription>مراقبة أداء المنصة</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Zap className="w-12 h-12 mx-auto text-yellow-500 mb-4" />
                <p className="text-muted-foreground">
                  سيتم إضافة مخططات الأداء التفصيلية قريباً
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="anomalies" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>كشف الشذوذات</CardTitle>
              <CardDescription>الأنماط غير العادية في البيانات</CardDescription>
            </CardHeader>
            <CardContent>
              {realTimeData?.anomalies && realTimeData.anomalies.length > 0 ? (
                <div className="space-y-3">
                  {realTimeData.anomalies.map((anomaly, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-3 p-3 border rounded-lg bg-orange-50"
                    >
                      <AlertTriangle className="w-5 h-5 text-orange-500 mt-0.5" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium">{anomaly.metric}</span>
                          <Badge variant="outline" className="text-xs">
                            {anomaly.severity}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {anomaly.description}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(anomaly.timestamp).toLocaleString("ar-SA")}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="w-12 h-12 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-4">
                    <Activity className="w-6 h-6 text-green-600" />
                  </div>
                  <p className="text-muted-foreground">
                    لا توجد شذوذات في البيانات حالياً
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
