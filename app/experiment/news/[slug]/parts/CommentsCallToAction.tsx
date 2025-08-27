"use client";

import { useState, useEffect } from "react";

interface CommentsCallToActionProps {
  articleId: string;
  onToggleComments: () => void;
  isExpanded: boolean;
}

export default function CommentsCallToAction({ 
  articleId, 
  onToggleComments,
  isExpanded 
}: CommentsCallToActionProps) {
  const [commentCount, setCommentCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCommentCount();
  }, [articleId]);

  const fetchCommentCount = async () => {
    try {
      // نجلب العدد فقط بدون التعليقات نفسها
      const response = await fetch(`/api/comments/count?articleId=${articleId}`);
      if (response.ok) {
        const data = await response.json();
        setCommentCount(data.count || 0);
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
    <div 
      onClick={onToggleComments}
      className="text-lg text-neutral-800 dark:text-neutral-200 hover:scale-[1.02] transition-all duration-200 cursor-pointer select-none"
    >
      <div className="inline-flex items-center gap-3">
        <span className={`text-2xl transition-transform duration-300 ${isExpanded ? 'rotate-90' : ''}`}>
          {isExpanded ? '👁️' : '💬'}
        </span>
        <span className="flex items-center gap-2">
          {commentCount > 0 ? (
            <>
              <span>
                يوجد <strong className="font-bold text-xl mx-1 text-emerald-600 dark:text-emerald-400">{commentCount}</strong> تعليق
              </span>
              <span className="text-neutral-600 dark:text-neutral-400">—</span>
              <span className="text-blue-600 dark:text-blue-400 hover:underline">
                {isExpanded ? 'إخفاء التعليقات' : 'اضغط لعرضها'}
              </span>
            </>
          ) : (
            <span>{getCallToActionText()}</span>
          )}
        </span>
      </div>
    </div>
  );
}
