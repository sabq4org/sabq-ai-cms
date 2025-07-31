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
  variant?: 'horizontal' | 'vertical';
}

export function SmartInteractionButtons({
  articleId,
  initialStats = { likes: 0, saves: 0, shares: 0, comments: 0 },
  onComment,
  className,
  variant = 'horizontal'
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
    <div className={cn(
      "flex gap-4 transition-all duration-300",
      variant === 'vertical' 
        ? "flex-col items-center p-2" 
        : "flex-row items-center justify-center p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700",
      className
    )}>
      {/* زر الإعجاب */}
      <button
        onClick={handleLike}
        className={cn(
          "flex items-center gap-2 transition-all duration-300",
          variant === 'vertical'
            ? "flex-col py-2"
            : "px-4 py-2.5 rounded-full hover:scale-105 active:scale-95 shadow-sm hover:shadow-md",
          hasLiked
            ? "text-red-500 dark:text-red-400"
            : "text-gray-700 dark:text-gray-300 hover:text-red-500 dark:hover:text-red-400"
        )}
        aria-label={hasLiked ? "إلغاء الإعجاب" : "إعجاب"}
      >
        <Heart
          className={cn(
            "w-6 h-6 transition-all duration-300",
            hasLiked && "fill-current animate-heartbeat"
          )}
        />
        <span className="text-sm font-medium">{String(localStats.likes || 0)}</span>
      </button>

      {/* زر الحفظ */}
      <button
        onClick={handleSave}
        className={cn(
          "flex items-center gap-2 transition-all duration-300",
          variant === 'vertical'
            ? "flex-col py-2"
            : "px-4 py-2.5 rounded-full hover:scale-105 active:scale-95 shadow-sm hover:shadow-md",
          hasSaved
            ? "text-blue-500 dark:text-blue-400"
            : "text-gray-700 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400"
        )}
        aria-label={hasSaved ? "إلغاء الحفظ" : "حفظ"}
      >
        <Bookmark
          className={cn(
            "w-6 h-6 transition-all duration-300",
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
            "flex items-center gap-2 transition-all duration-300",
            variant === 'vertical'
              ? "flex-col py-2"
              : "px-4 py-2.5 rounded-full hover:scale-105 active:scale-95 shadow-sm hover:shadow-md",
            "text-gray-700 dark:text-gray-300 hover:text-green-500 dark:hover:text-green-400"
          )}
          aria-label="مشاركة"
        >
          <Share2 className="w-6 h-6" />
          <span className="text-sm font-medium">{String(localStats.shares || 0)}</span>
        </button>

        {/* قائمة المشاركة */}
        {showShareMenu && (
          <div className={cn(
            "absolute bg-white dark:bg-gray-800 rounded-lg shadow-lg p-2 min-w-[150px] z-10",
            variant === 'vertical' ? "right-full top-0 mr-2" : "bottom-full left-0 mb-2"
          )}>
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
            "flex items-center gap-2 transition-all duration-300",
            variant === 'vertical'
              ? "flex-col py-2"
              : "px-4 py-2.5 rounded-full hover:scale-105 active:scale-95 shadow-sm hover:shadow-md",
            "text-gray-700 dark:text-gray-300 hover:text-purple-500 dark:hover:text-purple-400"
          )}
          aria-label="تعليق"
        >
          <MessageCircle className="w-6 h-6" />
          <span className="text-sm font-medium">{String(localStats.comments || 0)}</span>
        </button>
      )}


    </div>
  );
} 