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

    return () => clearInterval(interval);
  }, [notifications, displayDuration, recordView]);

  // تسجيل مشاهدة الإشعار الحالي (منفصل عن timer)
  useEffect(() => {
    if (notifications[currentIndex]) {
      recordView(notifications[currentIndex].id);
    }
  }, [currentIndex, notifications, recordView]);

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
    // عرض بيانات تجريبية بدلاً من إخفاء الشريط
    const fallbackData: PulseNotification[] = [
      {
        id: "demo-1",
        type: "breaking_news",
        title: "🔴 مرحباً بك في موقع سبق - آخر الأخبار",
        target_url: "/",
        created_at: new Date().toISOString(),
        priority: 5,
        views_count: 0,
        clicks_count: 0
      },
      {
        id: "demo-2", 
        type: "smart_dose",
        title: "📰 تابع أحدث الأخبار والتحليلات",
        target_url: "/",
        created_at: new Date().toISOString(),
        priority: 3,
        views_count: 0,
        clicks_count: 0
      }
    ];
    
    // استخدام البيانات التجريبية لضمان ظهور الشريط
    if (notifications.length === 0) {
      setNotifications(fallbackData);
      setCurrentIndex(0);
    }
    
    // إذا كان هناك خطأ، اعرض رسالة خطأ مع إبقاء الشريط مرئياً
    if (error && notifications.length === 0) {
      return (
        <div className={cn(
          "w-full relative overflow-hidden flex items-center justify-center",
          isMobile
            ? "py-3 pulse-ticker-mobile min-h-[44px] bg-gradient-to-r from-red-100 to-orange-100 dark:from-red-950/30 dark:to-orange-950/30"
            : "py-5 pulse-ticker-desktop min-h-[64px] bg-gradient-to-r from-red-500 via-orange-500 to-red-500 dark:from-red-800 dark:via-orange-800 dark:to-red-800 shadow-lg",
          className
        )}>
          <div className="text-center text-white">
            <span className="text-sm font-medium">⚠️ جاري تحميل الأخبار...</span>
          </div>
        </div>
      );
    }
  }

  const currentNotification = notifications[currentIndex];

  return (
    <div
      className={cn(
        "w-full relative overflow-hidden flex items-center justify-center",
        isMobile
          ? "py-3 pulse-ticker-mobile min-h-[44px] bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20"
          : "py-5 pulse-ticker-desktop min-h-[64px] bg-gradient-to-r from-indigo-600 via-blue-600 to-purple-600 dark:from-indigo-900 dark:via-blue-900 dark:to-purple-900 shadow-lg",
        className
      )}
    >
      {/* خلفية متحركة للديسكتوب */}
      {!isMobile && (
        <>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-pulse"></div>
          <div className="absolute inset-0 opacity-20">
            <div
              className="w-full h-full bg-repeat bg-[length:40px_40px]"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M0 40L40 0H0v40zm40 0V0H0l40 40z'/%3E%3C/g%3E%3C/svg%3E")`,
              }}
            ></div>
          </div>
        </>
      )}

      <div
        className={cn(
          "flex items-center gap-2 w-full relative z-10",
          isMobile
            ? "gap-2 px-4"
            : "gap-4 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
        )}
      >
        {/* عبارة "نبض الأخبار" المحسنة للديسكتوب */}
        {!isMobile && (
          <div className="flex-shrink-0 mr-4 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 border border-white/30">
            <span className="text-sm font-bold text-white flex items-center gap-2">
              <div className="relative">
                <Zap className="w-5 h-5 animate-pulse" />
                <div className="absolute inset-0 bg-yellow-400 rounded-full blur-sm opacity-60 animate-ping"></div>
              </div>
              <span className="tracking-wide">نبض الأخبار</span>
            </span>
          </div>
        )}

        {/* محتوى الإشعار المتحرك المحسن */}
        <div className="flex-1 min-w-0 flex items-center h-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentNotification.id}
              initial={{ opacity: 0, x: isMobile ? 0 : 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: isMobile ? 0 : -50 }}
              transition={{ duration: 0.6, ease: "easeInOut" }}
              className="flex items-center justify-start gap-3 min-h-[32px] h-full w-full"
            >
              {/* أيقونة النوع المحسنة للديسكتوب */}
              {!isMobile && (
                <div className="flex-shrink-0 bg-white/20 p-2 rounded-full backdrop-blur-sm border border-white/30">
                  {getTypeIcon(currentNotification.type)}
                </div>
              )}

              {/* النص المحسن */}
              <Link
                href={currentNotification.target_url}
                onClick={() => recordClick(currentNotification.id)}
                className={
                  isMobile
                    ? "text-xs sm:text-sm font-medium text-blue-700 dark:text-blue-300 hover:text-blue-800 dark:hover:text-blue-200 hover:underline transition-all duration-300 flex items-center justify-center min-h-[24px]"
                    : "text-base font-medium text-white hover:text-yellow-200 hover:scale-[1.02] drop-shadow-sm hover:underline transition-all duration-300 flex items-center justify-center min-h-[24px] group"
                }
              >
                <span
                  className={cn(
                    "flex items-center justify-center h-full py-1 transition-all duration-300",
                    !isMobile && "group-hover:drop-shadow-lg"
                  )}
                >
                  {currentNotification.title}
                </span>
              </Link>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* مؤشر التقدم المحسن */}
        {notifications.length > 1 && (
          <div
            className={cn(
              "flex items-center gap-2 flex-shrink-0",
              isMobile && "hidden xs:flex"
            )}
          >
            {notifications.map((_, index) => (
              <div
                key={index}
                className={cn(
                  "rounded-full transition-all duration-500 cursor-pointer hover:scale-125",
                  isMobile ? "w-1.5 h-1.5" : "w-3 h-3 border border-white/50",
                  index === currentIndex
                    ? isMobile
                      ? "bg-blue-500 scale-110"
                      : "bg-white scale-125 shadow-lg shadow-white/30"
                    : isMobile
                    ? "bg-blue-200 dark:bg-blue-700"
                    : "bg-white/40 hover:bg-white/60"
                )}
                onClick={() => setCurrentIndex(index)}
              />
            ))}
          </div>
        )}

        {/* عداد الوقت المتبقي للديسكتوب */}
        {!isMobile && notifications.length > 1 && (
          <div className="flex-shrink-0 bg-white/20 backdrop-blur-sm rounded-full px-3 py-1 border border-white/30">
            <span className="text-xs font-medium text-white/90 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {Math.ceil(
                (displayDuration - (Date.now() % displayDuration)) / 1000
              )}
              s
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default NewsPulseTicker;
