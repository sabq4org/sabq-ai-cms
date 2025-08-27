"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import CommentsCallToAction from "./CommentsCallToAction";
import CommentForm from "./CommentForm";

// تحميل كسول لقائمة التعليقات
const LazyCommentsList = dynamic(() => import("./LazyCommentsList"), {
  loading: () => (
    <div className="space-y-4 animate-pulse">
      {[1, 2, 3].map(i => (
        <div key={i} className="p-4 bg-neutral-50 dark:bg-neutral-900/50 rounded-xl">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-neutral-200 dark:bg-neutral-700 rounded-full" />
            <div className="flex-1 space-y-2">
              <div className="w-32 h-4 bg-neutral-200 dark:bg-neutral-700 rounded" />
              <div className="w-full h-16 bg-neutral-200 dark:bg-neutral-700 rounded" />
            </div>
          </div>
        </div>
      ))}
    </div>
  ),
  ssr: false
});

interface CommentsSectionProps {
  articleId: string;
  articleSlug: string;
}

export default function CommentsSection({ articleId, articleSlug }: CommentsSectionProps) {
  const [showComments, setShowComments] = useState(false);

  const toggleComments = () => {
    setShowComments(!showComments);
  };

  return (
    <div className="mt-12 pt-8 border-t border-neutral-200 dark:border-neutral-800">
      {/* بلوك دعوة للتفاعل */}
      <div className="mb-8 p-4 bg-[#f8f8f7] dark:bg-neutral-900/50 rounded-xl text-center">
        <CommentsCallToAction 
          articleId={articleId} 
          onToggleComments={toggleComments}
          isExpanded={showComments}
        />
      </div>
      
      {/* قسم التعليقات - يظهر فقط عند الطلب */}
      {showComments && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* عرض التعليقات الموجودة */}
          <LazyCommentsList 
            articleId={articleId} 
            isVisible={showComments}
          />
          
          {/* فورم إضافة تعليق جديد */}
          <div className="mt-8 pt-8 border-t border-neutral-200 dark:border-neutral-800">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
              <span>✍️</span>
              <span>أضف تعليقك</span>
            </h3>
            <CommentForm articleId={articleId} articleSlug={articleSlug} />
          </div>
        </div>
      )}
    </div>
  );
}
