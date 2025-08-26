"use client";

import CommentsClient from "@/components/article/CommentsClient";
import { cn } from "@/lib/utils";
import { MessageCircle } from "lucide-react";
import { useEffect, useState } from "react";

interface CommentsPanelProps {
  articleId: string;
  initialCount?: number;
  className?: string;
}

export default function CommentsPanel({
  articleId,
  initialCount = 0,
  className,
}: CommentsPanelProps) {
  const [open, setOpen] = useState(false);
  const [count, setCount] = useState<number>(initialCount);

  // استماع لتحديث العداد من CommentsClient
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (typeof detail === "number") setCount(detail);
    };
    if (typeof window !== "undefined") {
      window.addEventListener("comments:count", handler as any);
    }
    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("comments:count", handler as any);
      }
    };
  }, []);

  return (
    <div className={cn("w-full", className)} dir="rtl">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "comments-panel-button inline-flex items-center gap-2 rounded-full px-3 py-1.5",
          "hover:bg-gray-50 dark:hover:bg-gray-800",
          "shadow-sm transition-all duration-200"
        )}
      >
        <span className="inline-flex items-center gap-2 font-medium text-sm">
          <MessageCircle className="w-4 h-4" style={{ color: 'var(--theme-primary, #6b7280)' }} />
          <span>التعليقات</span>
        </span>
        <span 
          className="comments-count-badge text-xs px-2 py-0.5 rounded-full"
        >
          {count}
        </span>
        <span className="text-sm" style={{ color: 'var(--theme-primary, #6b7280)' }}>
          {open ? "▴" : "▾"}
        </span>
      </button>

      <div
        className={cn(
          "transition-all duration-200 ease-out overflow-hidden",
          open ? "max-h-[9999px] mt-4" : "max-h-0"
        )}
      >
        <div 
          className="comments-panel-content rounded-xl shadow-sm"
        >
          <section id="comments" dir="rtl" className="p-3 sm:p-4 lg:p-6">
            <CommentsClient articleId={articleId} />
          </section>
        </div>
      </div>
    </div>
  );
}
