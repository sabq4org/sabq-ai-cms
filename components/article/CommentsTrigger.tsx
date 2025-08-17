"use client";

import { MessageSquare } from "lucide-react";
import React from "react";

interface CommentsTriggerProps {
  count?: number | null;
  onClick?: () => void;
  className?: string;
}

export default function CommentsTrigger({ count, onClick, className }: CommentsTriggerProps) {
  const formatted = typeof count === "number" ? new Intl.NumberFormat("ar").format(count) : "—";

  return (
    <button
      type="button"
      dir="rtl"
      onClick={onClick}
      className={`w-full text-right flex items-center justify-between gap-3 rounded-xl border px-4 py-3 bg-gray-50 hover:bg-gray-100 text-gray-800 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-100 transition-colors ${
        className || ""
      }`}
      aria-label="فتح قسم التعليقات"
    >
      <div className="flex items-center gap-2">
        <MessageSquare size={20} className="text-gray-600 dark:text-gray-300" />
        <span className="font-medium text-sm sm:text-base">التعليقات</span>
      </div>
      <span className="text-sm sm:text-base text-gray-600 dark:text-gray-300">({formatted})</span>
    </button>
  );
}


