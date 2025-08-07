/**
 * مكون اختبار الشريط الإخباري
 * لإضافة بيانات تجريبية سريعة للاختبار
 */

"use client";

import { Button } from "@/components/ui/button";
import { AlertCircle, CheckCircle, Zap } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";

interface NewsBarTestProps {
  className?: string;
}

export default function NewsBarTest({ className = "" }: NewsBarTestProps) {
  const [isAdding, setIsAdding] = useState(false);

  const addTestNotification = async () => {
    try {
      setIsAdding(true);

      const testNotifications = [
        {
          type: "breaking_news",
          title: "🔴 عاجل: إعلان تجريبي للاختبار",
          target_url: "/",
          priority: 5,
        },
        {
          type: "smart_dose",
          title: "📰 محتوى تجريبي لاختبار الشريط الإخباري",
          target_url: "/",
          priority: 3,
        },
        {
          type: "deep_analysis",
          title: "📊 تحليل تجريبي لضمان عمل النظام",
          target_url: "/",
          priority: 4,
        },
      ];

      for (const notification of testNotifications) {
        const response = await fetch("/api/pulse/active", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(notification),
        });

        if (!response.ok) {
          throw new Error(`فشل في إضافة: ${notification.title}`);
        }
      }

      toast.success("تم إضافة بيانات تجريبية للشريط الإخباري");

      // إعادة تحميل الصفحة لإظهار الشريط
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      console.error("خطأ في إضافة البيانات التجريبية:", error);
      toast.error("فشل في إضافة البيانات التجريبية");
    } finally {
      setIsAdding(false);
    }
  };

  const testAPIConnection = async () => {
    try {
      const response = await fetch("/api/pulse/active");
      const data = await response.json();

      if (data.success) {
        toast.success(
          `الشريط الإخباري يعمل - ${data.notifications?.length || 0} إشعار`
        );
      } else {
        toast.error("مشكلة في API الشريط الإخباري");
      }
    } catch (error) {
      toast.error("خطأ في الاتصال بـ API");
    }
  };

  return (
    <div
      className={`bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 ${className}`}
    >
      <div className="flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
        <div className="flex-1">
          <h3 className="font-medium text-yellow-800 dark:text-yellow-200 mb-2">
            اختبار الشريط الإخباري
          </h3>
          <p className="text-sm text-yellow-700 dark:text-yellow-300 mb-4">
            إذا لم يظهر الشريط الإخباري، يمكنك إضافة بيانات تجريبية للاختبار
          </p>
          <div className="flex gap-2">
            <Button
              onClick={testAPIConnection}
              variant="outline"
              size="sm"
              className="text-yellow-700 border-yellow-300 hover:bg-yellow-100"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              اختبار الاتصال
            </Button>
            <Button
              onClick={addTestNotification}
              disabled={isAdding}
              size="sm"
              className="bg-yellow-600 hover:bg-yellow-700 text-white"
            >
              <Zap className="w-4 h-4 mr-2" />
              {isAdding ? "جاري الإضافة..." : "إضافة بيانات تجريبية"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
