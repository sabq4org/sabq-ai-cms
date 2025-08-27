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
  const [success, setSuccess] = useState(false);
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

      // مسح الحقل وإظهار رسالة النجاح
      setComment("");
      setSuccess(true);
      
      // تحديث الصفحة بعد 3 ثواني
      setTimeout(() => {
        router.refresh();
        setSuccess(false);
      }, 3000);
    } catch (err: any) {
      setError(err.message || "حدث خطأ في إضافة التعليق");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* رسائل الحالة */}
      {(error || success) && (
        <div className="mb-4 animate-in fade-in slide-in-from-top-2 duration-300">
          {error && (
            <div className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800/30 rounded-xl">
              <span className="text-red-500 mt-0.5">⚠️</span>
              <div className="flex-1">
                <p className="text-sm font-medium text-red-800 dark:text-red-200">حدث خطأ</p>
                <p className="text-sm text-red-600 dark:text-red-300 mt-0.5">{error}</p>
              </div>
            </div>
          )}
          
          {success && (
            <div className="flex items-start gap-3 p-4 bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800/30 rounded-xl">
              <span className="text-green-500 mt-0.5">✨</span>
              <div className="flex-1">
                <p className="text-sm font-medium text-green-800 dark:text-green-200">تم إرسال تعليقك بنجاح!</p>
                <p className="text-sm text-green-600 dark:text-green-300 mt-0.5">
                  سيظهر تعليقك بعد مراجعته من قبل فريق التحرير. شكراً لمشاركتك 🤖
                </p>
              </div>
            </div>
          )}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-3">
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="شاركنا رأيك..."
          className="w-full min-h-[80px] p-3 border border-neutral-200 dark:border-neutral-700 rounded-xl bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 dark:placeholder-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-300 dark:focus:ring-neutral-600 focus:border-neutral-300 dark:focus:border-neutral-600 resize-none transition-colors text-sm"
          rows={3}
          disabled={isSubmitting || success}
        />
        
        <div className="flex items-center justify-between">
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            {comment.length > 0 && `${comment.length} حرف`}
          </p>
          <button
            type="submit"
            disabled={isSubmitting || success || !comment.trim()}
            className="px-4 py-1.5 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 font-medium rounded-lg transition-all duration-200 text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isSubmitting ? (
              <>
                <span className="animate-spin">⏳</span>
                جاري الإرسال...
              </>
            ) : (
              <>إرسال</>
            )}
          </button>
        </div>
      </form>
    </>
  );
}
