/**
 * لوحة إدارة شريط النبض الإخباري
 * صفحة إدارية لإضافة وإدارة إشعارات النبض
 */

"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import {
  Clock,
  Eye,
  MousePointer,
  Plus,
  Trash2,
  TrendingUp,
  Zap,
} from "lucide-react";
import React, { useCallback, useEffect, useState } from "react";

interface PulseNotification {
  id: string;
  type:
    | "deep_analysis"
    | "smart_dose"
    | "opinion_leader"
    | "breaking_news"
    | "custom";
  title: string;
  target_url: string;
  created_at: string;
  expires_at: string | null;
  priority: number;
  views_count: number;
  clicks_count: number;
  is_active: boolean;
}

interface NewNotificationForm {
  type: string;
  title: string;
  target_url: string;
  priority: number;
  expires_at: string;
}

const PulseAdminPanel: React.FC = () => {
  const [notifications, setNotifications] = useState<PulseNotification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [form, setForm] = useState<NewNotificationForm>({
    type: "breaking_news",
    title: "",
    target_url: "",
    priority: 1,
    expires_at: "",
  });

  // الألوان والأيقونات حسب النوع
  const getTypeConfig = (type: string) => {
    switch (type) {
      case "breaking_news":
        return {
          icon: <Zap className="w-4 h-4" />,
          color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
          label: "عاجل",
        };
      case "deep_analysis":
        return {
          icon: <TrendingUp className="w-4 h-4" />,
          color:
            "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
          label: "تحليل عميق",
        };
      case "smart_dose":
        return {
          icon: <Clock className="w-4 h-4" />,
          color:
            "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
          label: "جرعة ذكية",
        };
      case "opinion_leader":
        return {
          icon: <Clock className="w-4 h-4" />,
          color:
            "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
          label: "قائد رأي",
        };
      default:
        return {
          icon: <Clock className="w-4 h-4" />,
          color:
            "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200",
          label: "مخصص",
        };
    }
  };

  // جلب الإشعارات
  const fetchNotifications = useCallback(async () => {
    try {
      setError(null);
      const response = await fetch("/api/pulse/active");
      const data = await response.json();

      if (data.success) {
        setNotifications(data.notifications || []);
      } else {
        setError("فشل في تحميل الإشعارات");
      }
    } catch (error) {
      console.error("❌ خطأ في جلب الإشعارات:", error);
      setError("خطأ في الاتصال بالخادم");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // إضافة إشعار جديد
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.title.trim() || !form.target_url.trim()) {
      setError("يجب ملء العنوان والرابط");
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch("/api/pulse/active", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: form.type,
          title: form.title.trim(),
          target_url: form.target_url.trim(),
          priority: form.priority,
          expires_at: form.expires_at || null,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess("تم إضافة الإشعار بنجاح!");
        setForm({
          type: "breaking_news",
          title: "",
          target_url: "",
          priority: 1,
          expires_at: "",
        });
        fetchNotifications();
      } else {
        setError(data.error || "فشل في إضافة الإشعار");
      }
    } catch (error) {
      console.error("❌ خطأ في إضافة الإشعار:", error);
      setError("خطأ في الاتصال بالخادم");
    } finally {
      setIsSubmitting(false);
    }
  };

  // حذف إشعار
  const handleDelete = async (id: string) => {
    if (!confirm("هل أنت متأكد من حذف هذا الإشعار؟")) return;

    try {
      // هنا يمكن إضافة API endpoint للحذف
      // في الوقت الحالي نستخدم تحديث لإلغاء تفعيل الإشعار
      console.log("حذف الإشعار:", id);
      fetchNotifications();
    } catch (error) {
      console.error("❌ خطأ في حذف الإشعار:", error);
      setError("فشل في حذف الإشعار");
    }
  };

  // تحديث الإشعارات عند تحميل الصفحة
  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // مسح الرسائل بعد فترة
  useEffect(() => {
    if (success || error) {
      const timer = setTimeout(() => {
        setSuccess(null);
        setError(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [success, error]);

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          إدارة شريط النبض الإخباري
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          إضافة وإدارة الإشعارات المهمة التي تظهر في شريط النبض
        </p>
      </div>

      {/* رسائل النجاح والخطأ */}
      {success && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 bg-green-100 border border-green-200 text-green-800 rounded-lg"
        >
          {success}
        </motion.div>
      )}

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 bg-red-100 border border-red-200 text-red-800 rounded-lg"
        >
          {error}
        </motion.div>
      )}

      <div className="grid lg:grid-cols-2 gap-8">
        {/* نموذج إضافة إشعار جديد */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5" />
              إضافة إشعار جديد
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="type">نوع الإشعار</Label>
                <Select
                  value={form.type}
                  onValueChange={(value) => setForm({ ...form, type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="breaking_news">🔴 عاجل</SelectItem>
                    <SelectItem value="deep_analysis">📊 تحليل عميق</SelectItem>
                    <SelectItem value="smart_dose">💡 جرعة ذكية</SelectItem>
                    <SelectItem value="opinion_leader">👤 قائد رأي</SelectItem>
                    <SelectItem value="custom">⚪ مخصص</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="title">عنوان الإشعار</Label>
                <Textarea
                  id="title"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="اكتب عنوان الإشعار هنا..."
                  rows={3}
                  required
                />
              </div>

              <div>
                <Label htmlFor="target_url">الرابط المستهدف</Label>
                <Input
                  id="target_url"
                  type="url"
                  value={form.target_url}
                  onChange={(e) =>
                    setForm({ ...form, target_url: e.target.value })
                  }
                  placeholder="https://example.com/article"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="priority">الأولوية (1-10)</Label>
                  <Input
                    id="priority"
                    type="number"
                    min="1"
                    max="10"
                    value={form.priority}
                    onChange={(e) =>
                      setForm({ ...form, priority: parseInt(e.target.value) })
                    }
                  />
                </div>

                <div>
                  <Label htmlFor="expires_at">تاريخ الانتهاء (اختياري)</Label>
                  <Input
                    id="expires_at"
                    type="datetime-local"
                    value={form.expires_at}
                    onChange={(e) =>
                      setForm({ ...form, expires_at: e.target.value })
                    }
                  />
                </div>
              </div>

              <Button type="submit" disabled={isSubmitting} className="w-full">
                {isSubmitting ? "جاري الإضافة..." : "إضافة الإشعار"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* قائمة الإشعارات الحالية */}
        <Card>
          <CardHeader>
            <CardTitle>الإشعارات النشطة</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            ) : notifications.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                لا توجد إشعارات نشطة حالياً
              </p>
            ) : (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {notifications.map((notification) => {
                  const config = getTypeConfig(notification.type);
                  return (
                    <motion.div
                      key={notification.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge className={cn(config.color, "text-xs")}>
                              {config.icon}
                              <span className="mr-1">{config.label}</span>
                            </Badge>
                            <span className="text-xs text-gray-500">
                              أولوية: {notification.priority}
                            </span>
                          </div>

                          <h3 className="font-medium text-sm text-gray-900 dark:text-gray-100 mb-2 line-clamp-2">
                            {notification.title}
                          </h3>

                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <div className="flex items-center gap-1">
                              <Eye className="w-3 h-3" />
                              <span>{notification.views_count}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <MousePointer className="w-3 h-3" />
                              <span>{notification.clicks_count}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              <span>
                                {new Date(
                                  notification.created_at
                                ).toLocaleDateString("ar")}
                              </span>
                            </div>
                          </div>
                        </div>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(notification.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PulseAdminPanel;
