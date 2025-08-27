"use client";

import { useState, useEffect } from "react";

interface CommentsCallToActionProps {
  articleId: string;
}

export default function CommentsCallToAction({ articleId }: CommentsCallToActionProps) {
  const [commentCount, setCommentCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCommentCount();
  }, [articleId]);

  const fetchCommentCount = async () => {
    try {
      const response = await fetch(`/api/comments?articleId=${articleId}`);
      if (response.ok) {
        const data = await response.json();
        // عد التعليقات المنشورة فقط
        const approvedComments = data.comments?.filter((comment: any) => comment.status === 'approved') || [];
        setCommentCount(approvedComments.length);
      }
    } catch (error) {
      console.error("Error fetching comment count:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse">
        <span className="inline-block w-48 h-6 bg-neutral-200 dark:bg-neutral-700 rounded"></span>
      </div>
    );
  }

  // خيارات النصوص المختلفة
  const getCallToActionText = () => {
    if (commentCount === 0) {
      return "كن أول من يعلق على هذا الخبر!";
    } else if (commentCount === 1) {
      return "يوجد تعليق واحد — انضم للنقاش!";
    } else if (commentCount === 2) {
      return "يوجد تعليقان — شارك برأيك!";
    } else if (commentCount <= 10) {
      return `يوجد ${commentCount} تعليقات — انضم للحوار!`;
    } else {
      return `نقاش حي: ${commentCount} تعليق — أضف صوتك!`;
    }
  };

  return (
    <div className="text-lg text-neutral-800 dark:text-neutral-200 hover:scale-[1.02] transition-transform duration-200 cursor-pointer">
      <span className="inline-flex items-center gap-2">
        <span className="text-2xl animate-pulse">💬</span>
        <span>
          {commentCount > 0 ? (
            <>
              يوجد <strong className="font-bold text-xl mx-1 text-emerald-600 dark:text-emerald-400">{commentCount}</strong> تعليق على هذا الخبر — شارك رأيك الآن!
            </>
          ) : (
            getCallToActionText()
          )}
        </span>
      </span>
    </div>
  );
}
