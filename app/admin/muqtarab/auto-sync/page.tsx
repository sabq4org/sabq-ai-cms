"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  Eye,
  EyeOff,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

interface AngleStatus {
  id: string;
  name: string;
  is_active: boolean;
  _count: {
    articles: number;
  };
}

export default function MuqtarabAutoSync() {
  const [syncing, setSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const [angleStatuses, setAngleStatuses] = useState<AngleStatus[]>([]);
  const [loading, setLoading] = useState(true);

  // جلب حالة الزوايا
  const fetchAngleStatuses = async () => {
    try {
      const response = await fetch("/api/muqtarab/auto-sync");
      if (response.ok) {
        const data = await response.json();
        setAngleStatuses(data.stats || []);
        setLastSync(new Date());
      }
    } catch (error) {
      console.error("خطأ في جلب حالة الزوايا:", error);
    } finally {
      setLoading(false);
    }
  };

  // تشغيل المزامنة التلقائية
  const runAutoSync = async () => {
    setSyncing(true);
    try {
      const response = await fetch("/api/muqtarab/auto-sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "sync_angle_visibility" }),
      });

      if (response.ok) {
        toast.success("تم تحديث محتوى مقترب بنجاح");
        await fetchAngleStatuses();
      } else {
        toast.error("حدث خطأ في التحديث");
      }
    } catch (error) {
      console.error("خطأ في المزامنة:", error);
      toast.error("حدث خطأ في الاتصال");
    } finally {
      setSyncing(false);
    }
  };

  // تحديث تلقائي كل 5 دقائق
  useEffect(() => {
    fetchAngleStatuses();
    const interval = setInterval(fetchAngleStatuses, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* رأس الصفحة */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            مزامنة مقترب التلقائية
          </h1>
          <p className="text-gray-600">إدارة ظهور الزوايا والمحتوى تلقائياً</p>
        </div>
        <div className="flex items-center gap-3">
          {lastSync && (
            <div className="text-sm text-gray-500">
              آخر تحديث: {lastSync.toLocaleTimeString("ar-SA")}
            </div>
          )}
          <Button
            onClick={runAutoSync}
            disabled={syncing}
            className="flex items-center gap-2"
          >
            {syncing ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4" />
            )}
            تحديث الآن
          </Button>
        </div>
      </div>

      {/* بطاقات المعلومات */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-xl">
                <Eye className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">الزوايا النشطة</p>
                <p className="text-2xl font-bold">
                  {angleStatuses.filter((a) => a.is_active).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-xl">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">لها محتوى منشور</p>
                <p className="text-2xl font-bold">
                  {angleStatuses.filter((a) => a._count.articles > 0).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-red-100 rounded-xl">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">تحتاج مراجعة</p>
                <p className="text-2xl font-bold">
                  {
                    angleStatuses.filter(
                      (a) => !a.is_active && a._count.articles > 0
                    ).length
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* قائمة الزوايا */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            حالة الزوايا
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin" />
            </div>
          ) : (
            <div className="space-y-4">
              {angleStatuses.map((angle) => (
                <div
                  key={angle.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-2 rounded-lg ${
                        angle.is_active ? "bg-green-100" : "bg-gray-100"
                      }`}
                    >
                      {angle.is_active ? (
                        <Eye className="w-4 h-4 text-green-600" />
                      ) : (
                        <EyeOff className="w-4 h-4 text-gray-600" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-medium">{angle.name}</h3>
                      <p className="text-sm text-gray-600">
                        {angle._count.articles} مقال منشور
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge variant={angle.is_active ? "default" : "secondary"}>
                      {angle.is_active ? "نشطة" : "مخفية"}
                    </Badge>

                    {!angle.is_active && angle._count.articles > 0 && (
                      <Badge variant="destructive">تحتاج تفعيل</Badge>
                    )}

                    {angle.is_active && angle._count.articles === 0 && (
                      <Badge variant="outline">بدون محتوى</Badge>
                    )}
                  </div>
                </div>
              ))}

              {angleStatuses.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  لا توجد زوايا للعرض
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* معلومات التحديث التلقائي */}
      <Card>
        <CardHeader>
          <CardTitle>معلومات المزامنة التلقائية</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-medium mb-2">ما يحدث تلقائياً:</h4>
              <ul className="space-y-1 text-gray-600">
                <li>• تفعيل الزوايا التي لها مقالات منشورة</li>
                <li>• تحديث عدادات المقالات</li>
                <li>• مزامنة ظهور المحتوى في الواجهة</li>
                <li>• تحديث الإحصائيات العامة</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">التحديث يحدث:</h4>
              <ul className="space-y-1 text-gray-600">
                <li>• كل 5 دقائق تلقائياً</li>
                <li>• عند نشر مقال جديد</li>
                <li>• عند الضغط على "تحديث الآن"</li>
                <li>• عند تحديث حالة الزاوية</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
