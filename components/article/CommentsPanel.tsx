"use client";

import CommentsSection from "@/components/article/CommentsSection";
import { cn } from "@/lib/utils";
import { MessageCircle } from "lucide-react";
import { useState } from "react";

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
  const [count] = useState<number>(initialCount);

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
          {/* إظهار قسم التعليقات عند الفتح (Lazy داخل CommentsSection) */}
          <CommentsSection articleId={articleId} />
        </div>
      )}
    </div>
  );
}
