'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, LineChart, Activity, Shield, Users, AlertCircle } from 'lucide-react';

interface SystemMetrics {
  auth: {
    totalLogins: number;
    failedLogins: number;
    activeSeesions: number;
    silentRefreshes: number;
    avgRefreshTime: number;
  };
  security: {
    csrfAttempts: number;
    blockedIPs: number;
    rateLimitHits: number;
  };
  performance: {
    avgResponseTime: number;
    errorRate: number;
    uptime: number;
  };
}

export default function MonitoringDashboard() {
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMetrics();
    const interval = setInterval(fetchMetrics, 30000); // تحديث كل 30 ثانية
    return () => clearInterval(interval);
  }, []);

  const fetchMetrics = async () => {
    try {
      const response = await fetch('/api/admin/metrics');
      const data = await response.json();
      setMetrics(data);
    } catch (error) {
      console.error('Failed to fetch metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8">لوحة مراقبة النظام</h1>

      {/* إحصائيات المصادقة */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">تسجيلات الدخول</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.auth.totalLogins || 0}</div>
            <p className="text-xs text-muted-foreground">
              {metrics?.auth.failedLogins || 0} محاولة فاشلة
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">الجلسات النشطة</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.auth.activeSeesions || 0}</div>
            <p className="text-xs text-muted-foreground">
              مستخدم نشط حالياً
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Silent Refresh</CardTitle>
            <BarChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.auth.silentRefreshes || 0}</div>
            <p className="text-xs text-muted-foreground">
              متوسط {metrics?.auth.avgRefreshTime || 0}ms
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">الأمان</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">آمن</div>
            <p className="text-xs text-muted-foreground">
              {metrics?.security.csrfAttempts || 0} محاولة CSRF محظورة
            </p>
          </CardContent>
        </Card>
      </div>

      {/* الرسوم البيانية */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>أداء النظام</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm">زمن الاستجابة</span>
                  <span className="text-sm font-bold">{metrics?.performance.avgResponseTime || 0}ms</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-600 h-2 rounded-full"
                    style={{ width: `${Math.min((200 - (metrics?.performance.avgResponseTime || 0)) / 2, 100)}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm">معدل الخطأ</span>
                  <span className="text-sm font-bold">{metrics?.performance.errorRate || 0}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${(metrics?.performance.errorRate || 0) > 5 ? 'bg-red-600' : 'bg-green-600'}`}
                    style={{ width: `${100 - (metrics?.performance.errorRate || 0)}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm">وقت التشغيل</span>
                  <span className="text-sm font-bold">{metrics?.performance.uptime || 100}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full"
                    style={{ width: `${metrics?.performance.uptime || 100}%` }}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>تنبيهات الأمان</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {metrics?.security.rateLimitHits && metrics.security.rateLimitHits > 100 && (
                <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg">
                  <AlertCircle className="h-5 w-5 text-yellow-600" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Rate Limit مرتفع</p>
                    <p className="text-xs text-muted-foreground">
                      {metrics.security.rateLimitHits} محاولة محظورة
                    </p>
                  </div>
                </div>
              )}

              {metrics?.security.blockedIPs && metrics.security.blockedIPs > 0 && (
                <div className="flex items-center gap-3 p-3 bg-red-50 rounded-lg">
                  <Shield className="h-5 w-5 text-red-600" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">عناوين IP محظورة</p>
                    <p className="text-xs text-muted-foreground">
                      {metrics.security.blockedIPs} عنوان محظور
                    </p>
                  </div>
                </div>
              )}

              {(!metrics?.security.rateLimitHits || metrics.security.rateLimitHits < 100) && 
               (!metrics?.security.blockedIPs || metrics.security.blockedIPs === 0) && (
                <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                  <Shield className="h-5 w-5 text-green-600" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">النظام آمن</p>
                    <p className="text-xs text-muted-foreground">
                      لا توجد تهديدات نشطة
                    </p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* سجل الأحداث المباشر */}
      <Card>
        <CardHeader>
          <CardTitle>سجل الأحداث المباشر</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground py-8">
            سيتم إضافة سجل الأحداث المباشر قريباً
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
