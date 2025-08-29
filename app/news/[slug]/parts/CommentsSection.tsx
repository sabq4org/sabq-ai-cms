"use client";

import { useEffect, useRef, useState } from "react";
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
  const ref = useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = useState(false);
  const [showComments, setShowComments] = useState(false); // الإبقاء على التحميل الكسول

  const toggleComments = () => {
    setShowComments(!showComments);
  };

  useEffect(() => {
    if (!ref.current || visible) return;
    const el = ref.current;
    const obs = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (e.isIntersecting) {
          setVisible(true);
          obs.disconnect();
          break;
        }
      }
    }, { rootMargin: '400px 0px' });
    obs.observe(el);
    return () => obs.disconnect();
  }, [visible]);

  return (
    <div className="mt-12 pt-8 border-t border-neutral-200 dark:border-neutral-800">
      {/* بلوك دعوة للتفاعل */}
      <div 
        className="mb-8 p-4 rounded-xl text-center"
        style={{ 
          backgroundColor: 'rgb(248, 248, 247)',
        }}
      >
        <div className="dark:bg-neutral-900/50 dark:rounded-xl dark:p-4 dark:-m-4">
          <CommentsCallToAction 
            articleId={articleId} 
            onToggleComments={toggleComments}
            isExpanded={showComments}
          />
        </div>
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

      {/* تصيير كسول للتعليقات باستخدام IntersectionObserver */}
      <div ref={ref} className="mt-8">
        {!visible ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md animate-pulse h-40" />
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md">
            <h3 className="text-xl font-bold mb-4">التعليقات</h3>
            {/* المحتوى الفعلي يمكن فصله لمكوّن فرعي أو تحميله من API */}
            <p className="text-gray-600 dark:text-gray-400">تم تحميل التعليقات عند الوصول إلى هذا القسم.</p>
          </div>
        )}
      </div>
    </div>
  );
}
