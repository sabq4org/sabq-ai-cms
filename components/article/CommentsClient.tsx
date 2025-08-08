"use client";

import { useEffect, useMemo, useState } from "react";

interface CommentItem {
  id: string;
  content: string;
  status: string;
  createdAt: string;
  user?: { name: string; avatar?: string | null } | null;
}

interface CommentsClientProps {
  articleId: string;
}

export default function CommentsClient({ articleId }: CommentsClientProps) {
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const fetchComments = async (pageNum = 1, append = false) => {
    try {
      if (!append) setLoading(true);
      setError(null);
      const res = await fetch(
        `/api/comments?article_id=${encodeURIComponent(
          articleId
        )}&page=${pageNum}&limit=10`,
        { cache: "no-store" }
      );
      const data = await res.json();
      if (!res.ok || data.success === false) {
        throw new Error(data?.error || "فشل في جلب التعليقات");
      }
      const items: CommentItem[] = (data.comments || []).map((c: any) => ({
        id: c.id,
        content: c.content,
        status: c.status,
        createdAt: c.createdAt || c.created_at,
        user: c.user || null,
      }));
      setComments((prev) => (append ? [...prev, ...items] : items));
      setHasMore(pageNum < (data.pagination?.totalPages || 1));
      // تحديث العداد بالعدد الإجمالي من الاستجابة حال توفره
      if (typeof data.pagination?.total === "number") {
        const evt = new CustomEvent("comments:count", {
          detail: data.pagination.total,
        });
        window.dispatchEvent(evt);
      } else {
        const evt = new CustomEvent("comments:count", {
          detail: append ? comments.length + items.length : items.length,
        });
        window.dispatchEvent(evt);
      }
      // تحديث العداد في اللوحة (إن وجد مستمع أعلى)
      const evt = new CustomEvent("comments:count", { detail: items.length });
      window.dispatchEvent(evt);
    } catch (e: any) {
      setError(e.message || "خطأ غير معروف");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComments(1, false);
  }, [articleId]);

  const canSubmit = useMemo(
    () => content.trim().length >= 5 && !submitting,
    [content, submitting]
  );

  const submitComment = async () => {
    try {
      if (!canSubmit) return;
      setSubmitting(true);
      setError(null);
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ articleId, content: content.trim() }),
      });
      const data = await res.json();
      if (!res.ok || data.success === false) {
        throw new Error(data?.error || "فشل في إنشاء التعليق");
      }
      setContent("");
      // تحديث تفاؤلي بسيط
      const newItem: CommentItem = {
        id: data.comment?.id || `temp-${Date.now()}`,
        content: data.comment?.content || content.trim(),
        status: data.comment?.status || "approved",
        createdAt: data.comment?.createdAt || new Date().toISOString(),
        user: data.comment?.user || { name: "أنت" },
      };
      setComments((prev) => [newItem, ...prev]);
      // إعادة الجلب بعد 300ms لضمان تزامن الحالة بعد الموافقة من لوحة التحكم
      setTimeout(() => fetchComments(1, false), 300);
    } catch (e: any) {
      setError(e.message || "فشل في إضافة التعليق");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="rounded-xl p-3 sm:p-6 lg:p-8 bg-white dark:bg-gray-800 shadow-lg"
      id="comments"
      dir="rtl"
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold">التعليقات</h3>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          ({comments.length})
        </span>
      </div>

      {/* نموذج إضافة تعليق */}
      <div className="rounded-xl border p-3 bg-card/50">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          minLength={5}
          required
          className="w-full bg-transparent outline-none min-h-[80px]"
          placeholder="أضف تعليقاً..."
        />
        <div className="mt-3 flex items-center gap-2">
          <button
            onClick={submitComment}
            disabled={!canSubmit}
            className="px-4 py-2 rounded-lg bg-blue-600 text-white disabled:opacity-50"
          >
            {submitting ? "جارٍ الإرسال..." : "إضافة تعليق"}
          </button>
          <p className="text-xs text-muted-foreground">
            تخضع التعليقات للمراجعة الآلية.
          </p>
        </div>
        {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
      </div>

      {/* قائمة التعليقات */}
      <div className="mt-4 space-y-4">
        {loading ? (
          <div className="text-center py-6 text-gray-500">
            جاري تحميل التعليقات...
          </div>
        ) : comments.length === 0 ? (
          <div className="text-center py-6 text-gray-500">
            لا توجد تعليقات بعد
          </div>
        ) : (
          comments.map((c) => (
            <div
              key={c.id}
              className="border rounded-lg p-3 bg-white/50 dark:bg-gray-900/30"
            >
              <div className="text-sm text-gray-700 dark:text-gray-200 leading-relaxed">
                {c.content}
              </div>
              <div className="mt-2 text-xs text-gray-500">
                {c.user?.name || "زائر"} •{" "}
                {new Date(c.createdAt).toLocaleDateString("ar-SA")}
              </div>
            </div>
          ))
        )}
      </div>

      {hasMore && !loading && (
        <div className="mt-4 text-center">
          <button
            onClick={() => {
              const next = page + 1;
              setPage(next);
              fetchComments(next, true);
            }}
            className="px-4 py-2 rounded-lg border"
          >
            تحميل المزيد
          </button>
        </div>
      )}
    </div>
  );
}
