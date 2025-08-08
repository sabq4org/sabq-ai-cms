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
          "inline-flex items-center gap-2 rounded-full px-3 py-1.5",
          "bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700",
          "border border-slate-200 dark:border-slate-700 shadow-sm"
        )}
      >
        <span className="inline-flex items-center gap-2 font-medium text-sm">
          <MessageCircle className="w-4 h-4" />
          <span>التعليقات</span>
        </span>
        <span className="text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-2 py-0.5 rounded-full">
          {count}
        </span>
        <span className="text-sm">{open ? "▴" : "▾"}</span>
      </button>

      <div
        className={cn(
          "transition-all duration-200 ease-out overflow-hidden",
          open ? "max-h-[9999px] mt-4" : "max-h-0"
        )}
      >
        <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-gray-800 shadow-lg">
          <section id="comments" dir="rtl" className="p-3 sm:p-4 lg:p-6">
            <CommentsClient articleId={articleId} />
          </section>
        </div>
      </div>
    </div>
  );
}
