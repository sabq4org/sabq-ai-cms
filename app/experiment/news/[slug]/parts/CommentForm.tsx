"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface CommentFormProps {
  articleId: string;
  articleSlug: string;
}

export default function CommentForm({ articleId, articleSlug }: CommentFormProps) {
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!comment.trim()) {
      setError("يرجى كتابة تعليق");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const response = await fetch("/api/comments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          article_id: articleId,
          content: comment.trim(),
          article_slug: articleSlug,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "حدث خطأ في إضافة التعليق");
      }

      // مسح الحقل وتحديث الصفحة
      setComment("");
      router.refresh();
      
      // يمكن إضافة رسالة نجاح هنا
    } catch (err: any) {
      setError(err.message || "حدث خطأ في إضافة التعليق");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-lg">
          {error}
        </div>
      )}
      
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="اكتب تعليقك هنا..."
        className="w-full min-h-[120px] p-4 border border-neutral-200 dark:border-neutral-700 rounded-xl bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 dark:placeholder-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-300 dark:focus:ring-neutral-600 focus:border-neutral-300 dark:focus:border-neutral-600 resize-none transition-colors"
        rows={4}
        disabled={isSubmitting}
      />
      
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-5 py-2 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 font-medium rounded-lg transition-all duration-200 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? "جاري النشر..." : "نشر التعليق"}
        </button>
      </div>
    </form>
  );
}
