"use client";

import { useEffect, useState } from "react";
import { formatFullDate, formatRelativeDate } from "@/lib/date-utils";

interface SafeDateDisplayProps {
  date: string;
  format?: "full" | "relative";
  className?: string;
}

/**
 * مكون آمن لعرض التواريخ يمنع مشاكل hydration
 * Safe date display component that prevents hydration mismatches
 */
export default function SafeDateDisplay({
  date,
  format = "relative",
  className = "",
}: SafeDateDisplayProps) {
  const [mounted, setMounted] = useState(false);
  const [formattedDate, setFormattedDate] = useState<string>("");

  useEffect(() => {
    setMounted(true);
    // تنسيق التاريخ فقط بعد التحميل على العميل
    if (date) {
      const formatted = format === "full" 
        ? formatFullDate(date)
        : formatRelativeDate(date);
      setFormattedDate(formatted);
    }
  }, [date, format]);

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