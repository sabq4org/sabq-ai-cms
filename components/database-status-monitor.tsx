"use client";

import { useEffect, useState } from "react";

interface DbMonitorProps {
  checkIntervalSeconds?: number;
  onStatusChange?: (isConnected: boolean) => void;
  showIndicator?: boolean;
  className?: string;
}

/**
 * مكون لمراقبة حالة قاعدة البيانات بشكل مستمر
 */
export default function DatabaseStatusMonitor({
  checkIntervalSeconds = 60,
  onStatusChange,
  showIndicator = true,
  className = "",
}: DbMonitorProps) {
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);
  const [isChecking, setIsChecking] = useState(false);

  // وظيفة للتحقق من حالة قاعدة البيانات
  const checkDbStatus = async () => {
    if (isChecking) return;

    try {
      setIsChecking(true);
      const response = await fetch("/api/db-status", {
        cache: "no-store",
        headers: { pragma: "no-cache" },
      });

      const data = await response.json();
      const newStatus = data.success === true;

      // استدعاء callback فقط عند تغيير الحالة
      if (isConnected !== null && newStatus !== isConnected) {
        onStatusChange?.(newStatus);
      }

      setIsConnected(newStatus);
      setLastChecked(new Date());
    } catch (error) {
      console.error("خطأ أثناء التحقق من حالة قاعدة البيانات:", error);

      // في حالة الخطأ، نفترض أن قاعدة البيانات غير متصلة
      if (isConnected !== false) {
        setIsConnected(false);
        onStatusChange?.(false);
      }
    } finally {
      setIsChecking(false);
    }
  };

  // التحقق من حالة قاعدة البيانات عند تحميل المكون وبشكل دوري
  useEffect(() => {
    // التحقق المبدئي
    checkDbStatus();

    // إعداد فاصل زمني للتحقق الدوري
    const intervalId = setInterval(checkDbStatus, checkIntervalSeconds * 1000);

    // تنظيف الفاصل الزمني عند إزالة المكون
    return () => clearInterval(intervalId);
  }, [checkIntervalSeconds]);

  // إذا لم نرد عرض المؤشر، نرجع null
  if (!showIndicator) {
    return null;
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div
        className={`w-2 h-2 rounded-full ${
          isConnected === null
            ? "bg-gray-400"
            : isConnected
            ? "bg-green-500"
            : "bg-red-500"
        } ${isChecking ? "animate-pulse" : ""}`}
      />
      <span className="text-xs">
        {isConnected === null
          ? "جاري التحقق..."
          : isConnected
          ? "متصل بقاعدة البيانات"
          : "غير متصل بقاعدة البيانات"}
      </span>
    </div>
  );
}
