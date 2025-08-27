"use client";

import { useState, useEffect } from "react";
import { formatDistanceToNow } from "date-fns";
import { ar } from "date-fns/locale";

interface Comment {
  id: string;
  content: string;
  created_at: string;
  createdAt?: string; // دعم كلا الصيغتين
  status: string;
  user?: {
    id: string;
    name: string;
    avatar: string | null;
  };
}

interface LazyCommentsListProps {
  articleId: string;
  isVisible: boolean;
}

export default function LazyCommentsList({ articleId, isVisible }: LazyCommentsListProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(false);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const LIMIT = 10;

  useEffect(() => {
    if (isVisible && comments.length === 0) {
      loadComments();
    }
  }, [isVisible]);

  const loadComments = async (loadMore = false) => {
    if (loading) return;
    
    setLoading(true);
    try {
      const currentOffset = loadMore ? offset : 0;
      const response = await fetch(
        `/api/comments?articleId=${articleId}&limit=${LIMIT}&offset=${currentOffset}`
      );
      
      if (response.ok) {
        const data = await response.json();
        const newComments = data.comments || [];
        
        if (loadMore) {
          setComments(prev => [...prev, ...newComments]);
        } else {
          setComments(newComments);
        }
        
        setOffset(currentOffset + newComments.length);
        setHasMore(newComments.length === LIMIT);
        setTotalCount(data.totalCount || newComments.length);
      }
    } catch (error) {
      console.error("Error loading comments:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLoadMore = () => {
    loadComments(true);
  };

  if (!isVisible) return null;

  if (loading && comments.length === 0) {
    return (
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
    );
  }

  return (
    <div className="space-y-4 animate-in slide-in-from-top-2 duration-300">
      {comments.length === 0 ? (
        <p className="text-center text-neutral-500 dark:text-neutral-400 py-8">
          لا توجد تعليقات حتى الآن. كن أول من يعلق!
        </p>
      ) : (
        <>
          <div className="space-y-4">
            {comments.map((comment) => (
              <div
                key={comment.id}
                className="p-4 bg-neutral-50 dark:bg-neutral-900/50 rounded-xl border border-neutral-200 dark:border-neutral-800 hover:shadow-sm transition-shadow"
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0">
                    {comment.user?.avatar ? (
                      <img
                        src={comment.user.avatar}
                        alt={comment.user.name || "مستخدم"}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 bg-neutral-200 dark:bg-neutral-700 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium">
                          {comment.user?.name?.[0]?.toUpperCase() || "?"}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-semibold text-sm text-neutral-900 dark:text-neutral-100">
                        {comment.user?.name || "مستخدم"}
                      </span>
                      <span className="text-xs text-neutral-500 dark:text-neutral-400">
                        •
                      </span>
                      <span className="text-xs text-neutral-500 dark:text-neutral-400">
                        {(() => {
                          try {
                            const dateStr = comment.created_at || comment.createdAt;
                            if (!dateStr) return "منذ قليل";
                            
                            const date = new Date(dateStr);
                            if (isNaN(date.getTime())) {
                              return "منذ قليل";
                            }
                            return formatDistanceToNow(date, {
                              addSuffix: true,
                              locale: ar,
                            });
                          } catch (error) {
                            console.error("Invalid date:", comment.created_at || comment.createdAt);
                            return "منذ قليل";
                          }
                        })()}
                      </span>
                    </div>
                    <p className="text-neutral-700 dark:text-neutral-300 leading-relaxed text-[15px]">
                      {comment.content}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {hasMore && (
            <div className="text-center pt-4">
              <button
                onClick={handleLoadMore}
                disabled={loading}
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 rounded-lg transition-colors disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <span className="animate-spin">⏳</span>
                    <span>جاري التحميل...</span>
                  </>
                ) : (
                  <>
                    <span>📥</span>
                    <span>تحميل المزيد ({comments.length} من {totalCount})</span>
                  </>
                )}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
