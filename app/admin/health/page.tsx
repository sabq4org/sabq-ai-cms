"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useEffect, useState } from "react";

interface HealthData {
  timestamp: string;
  status: "healthy" | "degraded" | "error";
  services: {
    database: {
      status: string;
      query_time: string;
      pool_info: {
        total_connections: number;
        active_connections: number;
        idle_connections: number;
        idle_in_transaction: number;
      };
      connection_stats: {
        total_requests: number;
        successful: number;
        failed: number;
        success_rate: number;
        avg_response_time: number;
        last_success: string | null;
        last_error: string | null;
        slow_queries: number;
        recent_slow_queries: any[];
      };
    };
    api: {
      status: string;
      version: string;
    };
  };
  system: {
    memory: {
      used: string;
      total: string;
    };
    uptime: string;
    environment: string;
  };
  recommendations: string[];
  response_time: string;
}

export default function HealthDashboard() {
  const [healthData, setHealthData] = useState<HealthData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const fetchHealthData = async () => {
    try {
      const response = await fetch("/api/health");
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      const data = await response.json();
      setHealthData(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "خطأ غير معروف");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealthData();
  }, []);

  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(fetchHealthData, 10000); // كل 10 ثواني
    return () => clearInterval(interval);
  }, [autoRefresh]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "healthy":
        return "bg-green-500";
      case "degraded":
        return "bg-yellow-500";
      case "error":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "healthy":
        return "سليم";
      case "degraded":
        return "متدهور";
      case "error":
        return "خطأ";
      default:
        return "غير معروف";
    }
  };

  if (loading) {
    return (
      <>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4">جاري تحميل بيانات النظام...</p>
          </div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <div className="space-y-6">
          <Alert className="border-red-200 bg-red-50">
            <AlertDescription className="text-red-800">
              خطأ في تحميل بيانات النظام: {error}
            </AlertDescription>
          </Alert>
          <Button onClick={fetchHealthData} className="mt-4">
            إعادة المحاولة
          </Button>
        </div>
      </>
    );
  }

  if (!healthData) return null;

  return (
    <>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-gray-600">
              آخر تحديث:{" "}
              {new Date(healthData.timestamp).toLocaleString("ar-SA")}
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant={autoRefresh ? "default" : "outline"}
              onClick={() => setAutoRefresh(!autoRefresh)}
            >
              {autoRefresh ? "إيقاف" : "تفعيل"} التحديث التلقائي
            </Button>
            <Button onClick={fetchHealthData} variant="outline">
              تحديث
            </Button>
          </div>
        </div>

        {/* حالة النظام العامة */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div
                className={`w-3 h-3 rounded-full ${getStatusColor(
                  healthData.status
                )}`}
              ></div>
              حالة النظام: {getStatusText(healthData.status)}
            </CardTitle>
            <CardDescription>
              وقت الاستجابة: {healthData.response_time}
            </CardDescription>
          </CardHeader>
        </Card>

        {/* التوصيات */}
        {healthData.recommendations.length > 0 && (
          <Alert className="border-yellow-200 bg-yellow-50">
            <AlertDescription>
              <strong>توصيات التحسين:</strong>
              <ul className="mt-2 list-disc list-inside">
                {healthData.recommendations.map((rec, index) => (
                  <li key={index} className="text-yellow-800">
                    {rec}
                  </li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* قاعدة البيانات */}
          <Card>
            <CardHeader>
              <CardTitle>قاعدة البيانات</CardTitle>
              <CardDescription>
                <Badge
                  variant={
                    healthData.services.database.status === "connected"
                      ? "default"
                      : "destructive"
                  }
                >
                  {healthData.services.database.status === "connected"
                    ? "متصلة"
                    : "منقطعة"}
                </Badge>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span>وقت الاستعلام:</span>
                <span className="font-mono">
                  {healthData.services.database.query_time}
                </span>
              </div>
              <div className="flex justify-between">
                <span>إجمالي الاتصالات:</span>
                <span>
                  {healthData.services.database.pool_info.total_connections}
                </span>
              </div>
              <div className="flex justify-between">
                <span>الاتصالات النشطة:</span>
                <span>
                  {healthData.services.database.pool_info.active_connections}
                </span>
              </div>
              <div className="flex justify-between">
                <span>الاتصالات الخاملة:</span>
                <span>
                  {healthData.services.database.pool_info.idle_connections}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* إحصائيات الأداء */}
          <Card>
            <CardHeader>
              <CardTitle>إحصائيات الأداء</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span>إجمالي الطلبات:</span>
                <span>
                  {healthData.services.database.connection_stats.total_requests}
                </span>
              </div>
              <div className="flex justify-between">
                <span>الطلبات الناجحة:</span>
                <span className="text-green-600">
                  {healthData.services.database.connection_stats.successful}
                </span>
              </div>
              <div className="flex justify-between">
                <span>الطلبات الفاشلة:</span>
                <span className="text-red-600">
                  {healthData.services.database.connection_stats.failed}
                </span>
              </div>
              <div className="flex justify-between">
                <span>معدل النجاح:</span>
                <span className="font-mono">
                  {healthData.services.database.connection_stats.success_rate}%
                </span>
              </div>
              <div className="flex justify-between">
                <span>متوسط وقت الاستجابة:</span>
                <span className="font-mono">
                  {
                    healthData.services.database.connection_stats
                      .avg_response_time
                  }
                  ms
                </span>
              </div>
              <div className="flex justify-between">
                <span>الاستعلامات البطيئة:</span>
                <span className="text-yellow-600">
                  {healthData.services.database.connection_stats.slow_queries}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* معلومات النظام */}
          <Card>
            <CardHeader>
              <CardTitle>النظام</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span>الذاكرة المستخدمة:</span>
                <span className="font-mono">
                  {healthData.system.memory.used}
                </span>
              </div>
              <div className="flex justify-between">
                <span>إجمالي الذاكرة:</span>
                <span className="font-mono">
                  {healthData.system.memory.total}
                </span>
              </div>
              <div className="flex justify-between">
                <span>وقت التشغيل:</span>
                <span>{healthData.system.uptime}</span>
              </div>
              <div className="flex justify-between">
                <span>البيئة:</span>
                <Badge variant="outline">{healthData.system.environment}</Badge>
              </div>
              <div className="flex justify-between">
                <span>إصدار API:</span>
                <span className="font-mono">
                  {healthData.services.api.version}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* الاستعلامات البطيئة الأخيرة */}
        {healthData.services.database.connection_stats.recent_slow_queries
          .length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>الاستعلامات البطيئة الأخيرة</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {healthData.services.database.connection_stats.recent_slow_queries.map(
                  (query: any, index: number) => (
                    <div key={index} className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex justify-between mb-1">
                        <span className="text-sm text-gray-600">
                          {new Date(query.timestamp).toLocaleTimeString(
                            "ar-SA"
                          )}
                        </span>
                        <span className="text-sm font-mono text-red-600">
                          {query.time}ms
                        </span>
                      </div>
                      <code className="text-xs text-gray-800 break-all">
                        {query.query.substring(0, 100)}...
                      </code>
                    </div>
                  )
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
}
