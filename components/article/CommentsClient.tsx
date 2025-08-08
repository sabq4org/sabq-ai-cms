"use client";

import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import { Flag, ThumbsUp } from "lucide-react";
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
  const { isLoggedIn } = useAuth();
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [sort, setSort] = useState<"new" | "old" | "top">("new");
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const fetchComments = async (pageNum = 1, append = false) => {
    try {
      if (!append) setLoading(true);
      setError(null);
      const res = await fetch(
        `/api/comments?article_id=${encodeURIComponent(
          articleId
        )}&page=${pageNum}&limit=10&sort=${sort}`,
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
      // لا نعيد إرسال حدث بعدد القائمة الجزئية حتى لا نعيد ضبط العدّاد
    } catch (e: any) {
      setError(e.message || "خطأ غير معروف");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComments(1, false);
  }, [articleId, sort]);

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
        body: JSON.stringify({
          articleId,
          content: content.trim(),
        }),
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
    <div id="comments" dir="rtl">
      {/* الشريط العلوي داخل البلوك */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="font-semibold">التعليقات</span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600">
            {comments.length}
          </span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <label className="text-muted-foreground">فرز حسب</label>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as any)}
            className="rounded-md border border-slate-300 dark:border-slate-700 bg-transparent px-2 py-1 text-sm"
          >
            <option value="new">الأحدث</option>
            <option value="old">الأقدم</option>
            <option value="top">الأكثر تقييماً</option>
          </select>
        </div>
      </div>

      {/* قائمة التعليقات */}
      <div className="space-y-4">
        {loading ? (
          // سكيليتون
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse border rounded-lg p-3">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700" />
                  <div className="h-3 w-24 bg-slate-200 dark:bg-slate-700 rounded" />
                </div>
                <div className="h-3 w-full bg-slate-200 dark:bg-slate-700 rounded mb-2" />
                <div className="h-3 w-2/3 bg-slate-200 dark:bg-slate-700 rounded" />
              </div>
            ))}
          </div>
        ) : comments.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            لا توجد تعليقات بعد — كن أول من يعلّق.
          </div>
        ) : (
          comments.map((c, idx) => {
            const isLong = c.content.length > 160;
            const isOpen = !!expanded[c.id];
            const displayText =
              isLong && !isOpen ? c.content.slice(0, 160) + "…" : c.content;
            return (
              <div
                key={c.id}
                className="border rounded-lg p-3 bg-white dark:bg-white"
              >
                <div className="flex gap-3">
                  {/* عمود الصورة والاسم والتاريخ */}
                  <div className="flex flex-col items-center w-16">
                    <div className="w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center overflow-hidden">
                      {c.user?.avatar ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={c.user.avatar as any}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-sm font-semibold text-slate-600">
                          {(c.user?.name || "زائر").slice(0, 2)}
                        </span>
                      )}
                    </div>
                    <div className="mt-1 text-[11px] text-slate-700 text-center max-w-[3.5rem] truncate">
                      {c.user?.name || "زائر"}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      {new Date(c.createdAt).toLocaleDateString("ar-SA")}
                    </div>
                  </div>
                  {/* محتوى التعليق */}
                  <div className="flex-1">
                    {/* الترتيب في الزاوية */}
                    <div className="text-[11px] text-slate-400">
                      #{(page - 1) * 10 + (idx + 1)}
                    </div>
                    <div className="mt-1 text-sm text-slate-900 leading-relaxed">
                      {displayText}
                      {isLong && (
                        <button
                          onClick={() =>
                            setExpanded((prev) => ({
                              ...prev,
                              [c.id]: !isOpen,
                            }))
                          }
                          className="ml-2 text-xs text-blue-600 hover:underline"
                        >
                          {isOpen ? "إظهار أقل" : "عرض المزيد"}
                        </button>
                      )}
                    </div>
                    <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
                      <button className="inline-flex items-center gap-1 hover:text-slate-900">
                        <ThumbsUp className="w-3.5 h-3.5" /> إعجاب
                      </button>
                      <button className="inline-flex items-center gap-1 hover:text-red-600">
                        <Flag className="w-3.5 h-3.5" /> إبلاغ
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* زر تحميل المزيد */}
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
            تحميل المزيد من التعليقات
          </button>
        </div>
      )}

      {/* نموذج الإضافة أسفل القائمة */}
      <div
        className={cn(
          "mt-6 rounded-xl border p-3",
          "bg-white dark:bg-gray-800 border-slate-200 dark:border-slate-700"
        )}
      >
        <div className="mb-2 font-medium">✍️ أضف تعليقك</div>
        {!isLoggedIn ? (
          <div className="text-sm text-slate-600">
            للمشاركة، يرجى
            <a href="/login" className="mx-1 text-blue-600 hover:underline">
              تسجيل الدخول
            </a>
            .
          </div>
        ) : (
          <>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              minLength={5}
              required
              className="w-full bg-transparent outline-none min-h-[100px] resize-vertical"
              placeholder="اكتب تعليقك هنا..."
            />
            <div className="mt-2 text-xs text-muted-foreground">
              {content.length}/500
            </div>
            <div className="mt-3">
              <button
                onClick={submitComment}
                disabled={!canSubmit}
                className="px-4 py-2 rounded-lg bg-blue-600 text-white disabled:opacity-50"
              >
                {submitting ? "جارٍ الإرسال..." : "إضافة تعليق"}
              </button>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              قد يخضع تعليقك للمراجعة قبل الظهور.
            </p>
            {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
          </>
        )}
      </div>
    </div>
  );
}
