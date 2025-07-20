'use client';

import React from 'react';
import { Heart, Bookmark, Share2, MessageCircle } from 'lucide-react';
import { useUserInteractionTracking } from '@/hooks/useUserInteractionTracking';
import { cn } from '@/lib/utils';

interface SmartInteractionButtonsProps {
  articleId: string;
  initialStats?: {
    likes: number;
    saves: number;
    shares: number;
    comments: number;
  };
  onComment?: () => void;
  className?: string;
}

export function SmartInteractionButtons({
  articleId,
  initialStats = { likes: 0, saves: 0, shares: 0, comments: 0 },
  onComment,
  className,
}: SmartInteractionButtonsProps) {
  const {
    hasLiked,
    hasSaved,
    toggleLike,
    toggleSave,
    trackShare,
    trackComment,
    stats,
  } = useUserInteractionTracking(articleId);

  const [localStats, setLocalStats] = React.useState(initialStats);
  const [showShareMenu, setShowShareMenu] = React.useState(false);

  // معالج الإعجاب
  const handleLike = async () => {
    await toggleLike();
    setLocalStats(prev => ({
      ...prev,
      likes: hasLiked ? prev.likes - 1 : prev.likes + 1,
    }));
  };

  // معالج الحفظ
  const handleSave = async () => {
    await toggleSave();
    setLocalStats(prev => ({
      ...prev,
      saves: hasSaved ? prev.saves - 1 : prev.saves + 1,
    }));
  };

  // معالج المشاركة
  const handleShare = async (platform?: string) => {
    await trackShare(platform);
    setLocalStats(prev => ({
      ...prev,
      shares: prev.shares + 1,
    }));
    setShowShareMenu(false);

    // مشاركة فعلية حسب المنصة
    const shareUrl = window.location.href;
    const shareTitle = document.title;

    switch (platform) {
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?url=${shareUrl}&text=${shareTitle}`);
        break;
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`);
        break;
      case 'whatsapp':
        window.open(`https://wa.me/?text=${shareTitle} ${shareUrl}`);
        break;
      case 'copy':
        navigator.clipboard.writeText(shareUrl);
        // يمكن إضافة toast notification هنا
        break;
    }
  };

  // معالج التعليق
  const handleComment = () => {
    trackComment();
    if (onComment) {
      onComment();
    }
  };

  return (
    <div className={cn("flex items-center gap-4", className)}>
      {/* زر الإعجاب */}
      <button
        onClick={handleLike}
        className={cn(
          "flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-300",
          "hover:scale-105 active:scale-95",
          hasLiked
            ? "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400"
            : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
        )}
        aria-label={hasLiked ? "إلغاء الإعجاب" : "إعجاب"}
      >
        <Heart
          className={cn(
            "w-5 h-5 transition-all duration-300",
            hasLiked && "fill-current animate-heartbeat"
          )}
        />
        <span className="text-sm font-medium">{String(localStats.likes || 0)}</span>
      </button>

      {/* زر الحفظ */}
      <button
        onClick={handleSave}
        className={cn(
          "flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-300",
          "hover:scale-105 active:scale-95",
          hasSaved
            ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
            : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
        )}
        aria-label={hasSaved ? "إلغاء الحفظ" : "حفظ"}
      >
        <Bookmark
          className={cn(
            "w-5 h-5 transition-all duration-300",
            hasSaved && "fill-current"
          )}
        />
        <span className="text-sm font-medium">{String(localStats.saves || 0)}</span>
      </button>

      {/* زر المشاركة */}
      <div className="relative">
        <button
          onClick={() => setShowShareMenu(!showShareMenu)}
          className={cn(
            "flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-300",
            "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400",
            "hover:bg-gray-200 dark:hover:bg-gray-700 hover:scale-105 active:scale-95"
          )}
          aria-label="مشاركة"
        >
          <Share2 className="w-5 h-5" />
          <span className="text-sm font-medium">{String(localStats.shares || 0)}</span>
        </button>

        {/* قائمة المشاركة */}
        {showShareMenu && (
          <div className="absolute bottom-full mb-2 left-0 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-2 min-w-[150px] z-10">
            <button
              onClick={() => handleShare('twitter')}
              className="flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
            >
              <span>X (Twitter)</span>
            </button>
            <button
              onClick={() => handleShare('facebook')}
              className="flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
            >
              <span>Facebook</span>
            </button>
            <button
              onClick={() => handleShare('whatsapp')}
              className="flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
            >
              <span>WhatsApp</span>
            </button>
            <button
              onClick={() => handleShare('copy')}
              className="flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
            >
              <span>نسخ الرابط</span>
            </button>
          </div>
        )}
      </div>

      {/* زر التعليق */}
      {onComment && (
        <button
          onClick={handleComment}
          className={cn(
            "flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-300",
            "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400",
            "hover:bg-gray-200 dark:hover:bg-gray-700 hover:scale-105 active:scale-95"
          )}
          aria-label="تعليق"
        >
          <MessageCircle className="w-5 h-5" />
          <span className="text-sm font-medium">{String(localStats.comments || 0)}</span>
        </button>
      )}

      {/* عرض إحصائيات التفاعل (للتطوير) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="ml-auto text-xs text-gray-500">
          <div>عمق التمرير: {String((stats.scrollDepth * 100).toFixed(0))}%</div>
          <div>مدة الجلسة: {String(Math.floor(stats.sessionDuration / 1000))}ث</div>
          <div>التفاعلات: {String(stats.interactionCount || 0)}</div>
        </div>
      )}
    </div>
  );
} 