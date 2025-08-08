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
          "w-full rounded-xl border border-border/60 bg-background/60 hover:bg-background/80 px-4 py-3",
          "flex items-center justify-between shadow-sm transition-colors"
        )}
      >
        <span className="inline-flex items-center gap-2 font-medium">
          <MessageCircle className="w-5 h-5" />
          التعليقات
        </span>
        <span className="text-muted-foreground text-sm">({count})</span>
      </button>

      {open && (
        <div className="mt-3 space-y-4">
          {/* ترتيب: قائمة التعليقات أولاً ثم نموذج الإضافة */}
          <section id="comments" dir="rtl">
            <CommentsClient articleId={articleId} />
          </section>
        </div>
      )}
    </div>
  );
}
