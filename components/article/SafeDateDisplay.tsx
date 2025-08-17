"use client";

import { formatFullDate, formatRelativeDate, formatTime } from "@/lib/date-utils";
import { useEffect, useState } from "react";

interface SafeDateDisplayProps {
  date: string;
  format?: "full" | "relative";
  className?: string;
  showTime?: boolean; // إظهار الوقت HH:mm
}

/**
 * مكون آمن لعرض التواريخ يمنع مشاكل hydration
 * Safe date display component that prevents hydration mismatches
 */
export default function SafeDateDisplay({
  date,
  format = "relative",
  className = "",
  showTime = false,
}: SafeDateDisplayProps) {
  const [mounted, setMounted] = useState(false);
  const [formattedDate, setFormattedDate] = useState<string>("");

  useEffect(() => {
    setMounted(true);
    // تنسيق التاريخ فقط بعد التحميل على العميل
    if (date) {
      const base = format === "full" ? formatFullDate(date) : formatRelativeDate(date);
      const time = showTime ? ` — ${formatTime(date, true)} بتوقيت الرياض` : "";
      setFormattedDate(`${base}${time}`);
    }
  }, [date, format, showTime]);

  // عرض نص ثابت أثناء SSR لتجنب hydration mismatch
  if (!mounted) {
    // استخدام تاريخ ثابت أثناء SSR
    return (
      <span className={className} suppressHydrationWarning>
        {format === "full" ? "التاريخ" : "مؤخراً"}
      </span>
    );
  }

  // عرض التاريخ المنسق بعد التحميل على العميل
  return (
    <span className={className} suppressHydrationWarning>
      {formattedDate || (format === "full" ? "التاريخ" : "مؤخراً")}
    </span>
  );
}
