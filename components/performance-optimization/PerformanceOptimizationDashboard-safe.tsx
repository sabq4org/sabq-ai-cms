/**
 * نظام تحسين الأداء - واجهة لوحة المراقبة (نسخة محمية)
 * Performance Optimization Dashboard Component (Safe Version)
 */

"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Activity,
  AlertTriangle,
  BarChart3,
  CheckCircle,
  Clock,
  Cpu,
  HardDrive,
  Pause,
  Play,
  RefreshCw,
} from "lucide-react";
import React, { useCallback, useEffect, useState } from "react";

interface SafePerformanceData {
  overall_score?: number;
  metrics?: Array<{
    id: string;
    name: string;
    value: number;
    unit: string;
    type: string;
  }>;
  system_info?: {
    memory_used: number;
    memory_total: number;
    cpu_usage: number;
    disk_space_used: number;
    disk_space_total: number;
  };
}

interface SafeAlert {
  id: string;
  title: string;
  description: string;
  severity: "info" | "warning" | "critical";
  timestamp: Date;
}

interface SafeRecommendation {
  id: string;
  title: string;
  description: string;
  priority: number;
  effort_level: string;
  expected_improvement: number;
  auto_implementable: boolean;
}

const PerformanceOptimizationDashboard = React.memo(() => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [currentPerformance, setCurrentPerformance] =
    useState<SafePerformanceData | null>(null);
  const [alerts, setAlerts] = useState<SafeAlert[]>([]);
  const [recommendations, setRecommendations] = useState<SafeRecommendation[]>(
    []
  );
  const [refreshing, setRefreshing] = useState(false);

  // Safe data loading
  const loadDashboardData = useCallback(async () => {
    try {
      setRefreshing(true);

      // Mock data for safe testing
      setTimeout(() => {
        setCurrentPerformance({
          overall_score: 85.5,
          metrics: [
            {
              id: "1",
              name: "Response Time",
              value: 120,
              unit: "ms",
              type: "response_time",
            },
            {
              id: "2",
              name: "Memory Usage",
              value: 65,
              unit: "%",
              type: "memory_usage",
            },
            {
              id: "3",
              name: "CPU Usage",
              value: 45,
              unit: "%",
              type: "cpu_usage",
            },
          ],
          system_info: {
            memory_used: 6.5,
            memory_total: 10,
            cpu_usage: 45,
            disk_space_used: 250,
            disk_space_total: 500,
          },
        });

        setAlerts([
          {
            id: "1",
            title: "استخدام ذاكرة عالي",
            description: "استخدام الذاكرة تجاوز 65%",
            severity: "warning",
            timestamp: new Date(),
          },
        ]);

        setRecommendations([
          {
            id: "1",
            title: "تحسين استعلامات قاعدة البيانات",
            description: "يمكن تحسين أداء الاستعلامات بإضافة فهارس",
            priority: 1,
            effort_level: "متوسط",
            expected_improvement: 15,
            auto_implementable: true,
          },
        ]);

        setLoading(false);
        setRefreshing(false);
        setError(null);
      }, 1000);
    } catch (err) {
      console.error("Error loading dashboard data:", err);
      setError(
        err instanceof Error ? err.message : "حدث خطأ في تحميل البيانات"
      );
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadDashboardData();
    const interval = setInterval(loadDashboardData, 30000);
    return () => clearInterval(interval);
  }, [loadDashboardData]);

  const toggleMonitoring = async () => {
    setIsMonitoring(!isMonitoring);
  };

  const formatMetricValue = (value: number, unit: string) => {
    return `${value.toFixed(1)}${unit}`;
  };

  const getMetricColor = (value: number, type: string) => {
    switch (type) {
      case "response_time":
        return value > 200
          ? "text-red-600"
          : value > 100
          ? "text-yellow-600"
          : "text-green-600";
      case "memory_usage":
      case "cpu_usage":
        return value > 80
          ? "text-red-600"
          : value > 60
          ? "text-yellow-600"
          : "text-green-600";
      default:
        return "text-blue-600";
    }
  };

  const getMetricIcon = (type: string) => {
    switch (type) {
      case "response_time":
        return <Clock className="h-8 w-8 text-blue-600" />;
      case "memory_usage":
        return <HardDrive className="h-8 w-8 text-purple-600" />;
      case "cpu_usage":
        return <Cpu className="h-8 w-8 text-orange-600" />;
      default:
        return <Activity className="h-8 w-8 text-gray-600" />;
    }
  };

  if (loading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-red-700 mb-2">
            خطأ في تحميل البيانات
          </h2>
          <p className="text-red-600 mb-4">{error}</p>
          <Button
            onClick={() => {
              setError(null);
              loadDashboardData();
            }}
            variant="outline"
          >
            إعادة المحاولة
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">نظام تحسين الأداء</h1>
          <p className="text-gray-600 mt-1">
            مراقبة وتحسين أداء النظام في الوقت الفعلي
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Button
            onClick={loadDashboardData}
            disabled={refreshing}
            variant="outline"
            size="sm"
          >
            {refreshing ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            تحديث
          </Button>
          <div className="flex items-center gap-2">
            <span className="text-sm">المراقبة:</span>
            <Switch checked={isMonitoring} onCheckedChange={toggleMonitoring} />
            {isMonitoring ? (
              <Play className="h-4 w-4 text-green-600" />
            ) : (
              <Pause className="h-4 w-4 text-gray-400" />
            )}
          </div>
        </div>
      </div>

      {/* Performance Overview */}
      {currentPerformance && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">النتيجة الإجمالية</p>
                  <p className="text-2xl font-bold">
                    {currentPerformance.overall_score?.toFixed(1) || "0.0"}
                  </p>
                </div>
                <BarChart3 className="h-8 w-8 text-blue-600" />
              </div>
              <Progress
                value={currentPerformance.overall_score || 0}
                className="mt-2"
              />
            </CardContent>
          </Card>

          {(currentPerformance.metrics || []).map((metric) => (
            <Card key={metric.id}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">{metric.name}</p>
                    <p
                      className={`text-2xl font-bold ${getMetricColor(
                        metric.value,
                        metric.type
                      )}`}
                    >
                      {formatMetricValue(metric.value, metric.unit)}
                    </p>
                  </div>
                  {getMetricIcon(metric.type)}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* System Info */}
      {currentPerformance?.system_info && (
        <Card>
          <CardHeader>
            <CardTitle>معلومات النظام</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">استخدام الذاكرة</span>
                  <span>
                    {(
                      (currentPerformance.system_info.memory_used /
                        currentPerformance.system_info.memory_total) *
                      100
                    ).toFixed(1)}
                    %
                  </span>
                </div>
                <Progress
                  value={
                    (currentPerformance.system_info.memory_used /
                      currentPerformance.system_info.memory_total) *
                    100
                  }
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">استخدام المعالج</span>
                  <span>
                    {currentPerformance.system_info.cpu_usage?.toFixed(1) ||
                      "0.0"}
                    %
                  </span>
                </div>
                <Progress
                  value={currentPerformance.system_info.cpu_usage || 0}
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">مساحة القرص</span>
                  <span>
                    {(
                      (currentPerformance.system_info.disk_space_used /
                        currentPerformance.system_info.disk_space_total) *
                      100
                    ).toFixed(1)}
                    %
                  </span>
                </div>
                <Progress
                  value={
                    (currentPerformance.system_info.disk_space_used /
                      currentPerformance.system_info.disk_space_total) *
                    100
                  }
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabs */}
      <Tabs defaultValue="alerts" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="alerts">
            التنبيهات ({alerts?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="recommendations">
            التوصيات ({recommendations?.length || 0})
          </TabsTrigger>
        </TabsList>

        {/* Alerts Tab */}
        <TabsContent value="alerts" className="space-y-4">
          {!alerts || alerts.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center">
                <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
                <p className="text-lg font-medium">لا توجد تنبيهات نشطة</p>
                <p className="text-gray-600">النظام يعمل بكفاءة عالية</p>
              </CardContent>
            </Card>
          ) : (
            alerts.map((alert) => (
              <Alert
                key={alert.id}
                className={
                  alert.severity === "critical"
                    ? "border-red-500"
                    : "border-yellow-500"
                }
              >
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{alert.title}</p>
                      <p className="text-sm text-gray-600">
                        {alert.description}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {alert.timestamp?.toLocaleString?.("ar-SA") ||
                          "تاريخ غير محدد"}
                      </p>
                    </div>
                    <Button variant="outline" size="sm">
                      تم الاطلاع
                    </Button>
                  </div>
                </AlertDescription>
              </Alert>
            ))
          )}
        </TabsContent>

        {/* Recommendations Tab */}
        <TabsContent value="recommendations" className="space-y-4">
          {!recommendations || recommendations.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center">
                <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
                <p className="text-lg font-medium">لا توجد توصيات حالياً</p>
                <p className="text-gray-600">النظام محسّن بشكل جيد</p>
              </CardContent>
            </Card>
          ) : (
            recommendations.map((rec) => (
              <Card key={rec.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-medium">{rec.title}</h3>
                        <Badge
                          variant={
                            rec.priority === 1
                              ? "destructive"
                              : rec.priority === 2
                              ? "secondary"
                              : "outline"
                          }
                        >
                          أولوية{" "}
                          {rec.priority === 1
                            ? "عالية"
                            : rec.priority === 2
                            ? "متوسطة"
                            : "منخفضة"}
                        </Badge>
                        <Badge variant="outline">{rec.effort_level}</Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">
                        {rec.description}
                      </p>
                      <p className="text-xs text-green-600">
                        تحسين متوقع: {rec.expected_improvement}%
                      </p>
                    </div>
                    <div className="flex gap-2">
                      {rec.auto_implementable && (
                        <Button size="sm">تطبيق تلقائي</Button>
                      )}
                      <Button variant="outline" size="sm">
                        عرض التفاصيل
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
});

PerformanceOptimizationDashboard.displayName =
  "PerformanceOptimizationDashboard";

export default PerformanceOptimizationDashboard;
