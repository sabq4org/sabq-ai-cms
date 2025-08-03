/**
 * شريط النبض الإخباري - News Pulse Ticker
 * مكون تفاعلي لعرض آخر الأخبار والتحديثات المهمة
 */

"use client";

import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { Clock, TrendingUp, Zap } from "lucide-react";
import Link from "next/link";
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
  priority: number;
  views_count: number;
  clicks_count: number;
}

interface NewsPulseTickerProps {
  className?: string;
  autoRefresh?: boolean;
  refreshInterval?: number; // بالميلي ثانية
  displayDuration?: number; // مدة عرض كل إشعار بالميلي ثانية
  isMobile?: boolean; // للتحكم في التصميم حسب الجهاز
}

const NewsPulseTicker: React.FC<NewsPulseTickerProps> = ({
  className,
  autoRefresh = true,
  refreshInterval = 30000, // 30 ثانية
  displayDuration = 5000, // 5 ثوانٍ
  isMobile = false,
}) => {
  const [notifications, setNotifications] = useState<PulseNotification[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // أيقونات الأنواع
  const getTypeIcon = (type: string) => {
    switch (type) {
      case "breaking_news":
        return <Zap className="w-4 h-4 text-red-500" />;
      case "deep_analysis":
        return <TrendingUp className="w-4 h-4 text-blue-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  // ألوان الأنواع
  const getTypeColor = (type: string) => {
    switch (type) {
      case "breaking_news":
        return "text-red-600 dark:text-red-400";
      case "deep_analysis":
        return "text-blue-600 dark:text-blue-400";
      case "smart_dose":
        return "text-green-600 dark:text-green-400";
      case "opinion_leader":
        return "text-purple-600 dark:text-purple-400";
      default:
        return "text-gray-600 dark:text-gray-400";
    }
  };

  // جلب الإشعارات
  const fetchNotifications = useCallback(async () => {
    try {
      setError(null);
      console.log("🔔 جلب إشعارات النبض...");

      const response = await fetch("/api/pulse/active", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        cache: "no-cache",
      });

      console.log("📡 استجابة API:", response.status, response.statusText);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const text = await response.text();
      console.log("📝 نص الاستجابة:", text.substring(0, 200));

      let data;
      try {
        data = JSON.parse(text);
      } catch (parseError) {
        console.error("❌ خطأ في تحليل JSON:", parseError);
        console.error("📄 النص الكامل:", text);
        throw new Error("استجابة غير صالحة من الخادم");
      }

      if (data.success && data.notifications && data.notifications.length > 0) {
        console.log(`✅ تم جلب ${data.notifications.length} إشعار`);
        setNotifications(data.notifications);
        setCurrentIndex(0);
      } else {
        console.log("📭 لا توجد إشعارات نشطة");
        setNotifications([]);
      }
    } catch (error) {
      console.error("❌ خطأ في جلب إشعارات النبض:", error);
      setError("فشل في تحميل الإشعارات");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // تسجيل مشاهدة الإشعار
  const recordView = useCallback(async (notificationId: string) => {
    try {
      await fetch("/api/pulse/active", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: notificationId, action: "view" }),
      });
    } catch (error) {
      console.error("❌ خطأ في تسجيل المشاهدة:", error);
    }
  }, []);

  // تسجيل النقر على الإشعار
  const recordClick = useCallback(async (notificationId: string) => {
    try {
      await fetch("/api/pulse/active", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: notificationId, action: "click" }),
      });
    } catch (error) {
      console.error("❌ خطأ في تسجيل النقر:", error);
    }
  }, []);

  // التحديث التلقائي
  useEffect(() => {
    fetchNotifications();

    if (autoRefresh) {
      const interval = setInterval(fetchNotifications, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [fetchNotifications, autoRefresh, refreshInterval]);

  // تبديل الإشعارات
  useEffect(() => {
    if (notifications.length === 0) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => {
        const newIndex = (prev + 1) % notifications.length;

        // تسجيل مشاهدة الإشعار الجديد
        if (notifications[newIndex]) {
          recordView(notifications[newIndex].id);
        }

        return newIndex;
      });
    }, displayDuration);

    // تسجيل مشاهدة الإشعار الأول
    if (notifications[currentIndex]) {
      recordView(notifications[currentIndex].id);
    }

    return () => clearInterval(interval);
  }, [notifications, displayDuration, recordView, currentIndex]);

  // إذا كان يحمل أو لا توجد إشعارات
  if (isLoading) {
    return (
      <div className={cn("w-full py-3 px-4", className)}>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
        </div>
      </div>
    );
  }

  if (error || notifications.length === 0) {
    return null; // لا نعرض شيئاً إذا لم تكن هناك إشعارات
  }

  const currentNotification = notifications[currentIndex];

  return (
    <div
      className={cn(
        "w-full bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20",
        "border-b border-blue-100 dark:border-blue-800",
        isMobile ? "py-3 px-3 min-h-[44px]" : "py-4 px-4 min-h-[48px]",
        "overflow-hidden relative flex items-center",
        className
      )}
    >
      <div
        className={cn(
          "flex items-center gap-2 max-w-7xl mx-auto w-full",
          isMobile ? "gap-2" : "gap-3"
        )}
      >
        {/* مؤشر النبض */}
        <div
          className={cn(
            "flex items-center gap-1 flex-shrink-0",
            isMobile ? "gap-1" : "gap-2"
          )}
        >
          <div className="relative">
            <div
              className={cn(
                "bg-blue-500 rounded-full animate-pulse",
                isMobile ? "w-2.5 h-2.5" : "w-3 h-3"
              )}
            ></div>
            <div
              className={cn(
                "absolute inset-0 bg-blue-500 rounded-full animate-ping opacity-25",
                isMobile ? "w-2.5 h-2.5" : "w-3 h-3"
              )}
            ></div>
          </div>
          <span
            className={cn(
              "font-medium text-blue-600 dark:text-blue-400 uppercase tracking-wide",
              isMobile ? "text-xs hidden sm:inline" : "text-xs"
            )}
          >
            {isMobile ? "نبض" : "نبض الأخبار"}
          </span>
        </div>

        {/* فاصل */}
        <div
          className={cn(
            "bg-blue-200 dark:bg-blue-700 flex-shrink-0",
            isMobile ? "w-px h-3" : "w-px h-4"
          )}
        ></div>

        {/* محتوى الإشعار المتحرك */}
        <div className="flex-1 min-w-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentNotification.id}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
              className="flex items-center gap-2"
            >
              {/* أيقونة النوع - مخفية في الموبايل الصغير */}
              {!isMobile && (
                <div className="flex-shrink-0">
                  {getTypeIcon(currentNotification.type)}
                </div>
              )}

              {/* النص */}
              <Link
                href={currentNotification.target_url}
                onClick={() => recordClick(currentNotification.id)}
                className={cn(
                  "font-medium truncate hover:underline transition-colors duration-200 flex items-center",
                  isMobile ? "text-xs sm:text-sm" : "text-sm",
                  getTypeColor(currentNotification.type)
                )}
              >
                {currentNotification.title}
              </Link>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* مؤشر التقدم */}
        {notifications.length > 1 && (
          <div
            className={cn(
              "flex items-center gap-1 flex-shrink-0",
              isMobile && "hidden xs:flex"
            )}
          >
            {notifications.map((_, index) => (
              <div
                key={index}
                className={cn(
                  "rounded-full transition-all duration-300",
                  isMobile ? "w-1.5 h-1.5" : "w-2 h-2",
                  index === currentIndex
                    ? "bg-blue-500 scale-110"
                    : "bg-blue-200 dark:bg-blue-700"
                )}
              />
            ))}
          </div>
        )}
      </div>

      {/* شريط التقدم المتحرك */}
      <motion.div
        key={currentNotification.id}
        className="absolute bottom-0 left-0 h-0.5 bg-blue-500"
        initial={{ width: "0%" }}
        animate={{ width: "100%" }}
        transition={{ duration: displayDuration / 1000, ease: "linear" }}
      />
    </div>
  );
};

export default NewsPulseTicker;
