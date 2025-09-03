'use client';

import { useState, useEffect } from 'react';
import { MessageSquare, Eye, Clock, Share2 } from 'lucide-react';
import { useEnhancedTracking } from '@/hooks/useEnhancedTracking';
import { useDarkModeContext } from '@/contexts/DarkModeContext';
import { useUserInteractions } from '@/stores/userInteractions';
import UnifiedInteractionButtons from '@/components/ui/UnifiedInteractionButtons';
import toast from 'react-hot-toast';

interface ArticleInteractionBarProps {
  articleId: string;
  initialViews?: number;
  initialLikes?: number;
  initialSaves?: number;
  initialShares?: number;
  onComment?: () => void;
  className?: string;
}

export default function ArticleInteractionBarUpdated({
  articleId,
  initialViews = 0,
  initialLikes = 0,
  initialSaves = 0,
  initialShares = 0,
  onComment,
  className = ''
}: ArticleInteractionBarProps) {
  const { darkMode } = useDarkModeContext();
  const [views, setViews] = useState(initialViews);
  const [shareMenuOpen, setShareMenuOpen] = useState(false);
  
  // استخدام Enhanced Tracking للإحصائيات
  const { 
    onComment: trackComment,
    getCurrentDuration,
    getScrollDepth
  } = useEnhancedTracking({
    articleId,
    autoTrackView: true,
    autoTrackDuration: true,
    debug: true
  });

  // تهيئة تفاعلات المستخدم عند تحميل المكون
  const { initializeUserInteractions } = useUserInteractions();
  
  useEffect(() => {
    initializeUserInteractions([articleId]);
  }, [articleId, initializeUserInteractions]);

  // معالجة النقر على التعليقات
  const handleComment = () => {
    trackComment();
    onComment?.();
  };

  // معالجة المشاركة مع إحصائيات
  const handleInteraction = (type: 'like' | 'save' | 'share', newState: boolean) => {
    // يمكن إضافة logic إضافي هنا إذا لزم الأمر
    if (type === 'share' && newState) {
      setShareMenuOpen(true);
    }
  };

  // معالجة المشاركة الخارجية
  const handleShare = (platform?: string) => {
    const url = `${window.location.origin}/article/${articleId}`;
    const title = document.title;
    
    if (platform === 'twitter') {
      window.open(
        `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
        '_blank',
        'width=550,height=420'
      );
    } else if (platform === 'facebook') {
      window.open(
        `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
        '_blank',
        'width=550,height=420'
      );
    } else if (platform === 'linkedin') {
      window.open(
        `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
        '_blank',
        'width=550,height=420'
      );
    } else if (platform === 'whatsapp') {
      window.open(
        `https://wa.me/?text=${encodeURIComponent(title + ' ' + url)}`,
        '_blank'
      );
    } else if (platform === 'telegram') {
      window.open(
        `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
        '_blank'
      );
    } else if (navigator.share) {
      // استخدام Web Share API إذا كان متاحاً
      navigator.share({
        title,
        url
      }).catch(console.error);
    } else {
      // نسخ الرابط
      navigator.clipboard.writeText(url).then(() => {
        toast.success('تم نسخ الرابط');
      }).catch(() => {
        toast.error('فشل في نسخ الرابط');
      });
    }
    
    setShareMenuOpen(false);
  };

  return (
    <div className={`
      flex items-center justify-between p-4 
      ${darkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50 border-gray-200'} 
      border-t rounded-b-lg
      ${className}
    `}>
      {/* التفاعلات الأساسية - اللايك والحفظ والمشاركة */}
      <div className="flex items-center gap-4">
        <UnifiedInteractionButtons
          articleId={articleId}
          variant="minimal"
          size="md"
          showLabels={true}
          initialStats={{
            likes: initialLikes,
            saves: initialSaves,
            shares: initialShares
          }}
          onInteraction={handleInteraction}
        />
      </div>

      {/* الإحصائيات والأزرار الإضافية */}
      <div className="flex items-center gap-4">
        {/* المشاهدات */}
        <div className={`
          flex items-center gap-1.5 text-sm
          ${darkMode ? 'text-gray-400' : 'text-gray-500'}
        `}>
          <Eye className="w-4 h-4" />
          <span>{views.toLocaleString('ar')}</span>
        </div>

        {/* التعليقات */}
        {onComment && (
          <button
            onClick={handleComment}
            className={`
              flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium
              transition-colors duration-200
              ${darkMode 
                ? 'text-gray-400 hover:text-gray-300 hover:bg-gray-700' 
                : 'text-gray-600 hover:text-gray-700 hover:bg-gray-100'
              }
            `}
          >
            <MessageSquare className="w-4 h-4" />
            <span>تعليق</span>
          </button>
        )}

        {/* وقت القراءة الحالي */}
        <div className={`
          flex items-center gap-1.5 text-sm
          ${darkMode ? 'text-gray-400' : 'text-gray-500'}
        `}>
          <Clock className="w-4 h-4" />
          <span>{Math.floor(getCurrentDuration() / 1000)}ث</span>
        </div>
      </div>

      {/* قائمة المشاركة */}
      {shareMenuOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShareMenuOpen(false)}>
          <div 
            className={`
              p-6 rounded-xl shadow-xl max-w-sm w-full mx-4
              ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}
              border
            `}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className={`
              text-lg font-semibold mb-4 text-center
              ${darkMode ? 'text-white' : 'text-gray-900'}
            `}>
              مشاركة المقال
            </h3>
            
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => handleShare('twitter')}
                className="flex items-center gap-2 p-3 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors"
              >
                <Share2 className="w-4 h-4" />
                <span className="text-sm">تويتر</span>
              </button>
              
              <button
                onClick={() => handleShare('facebook')}
                className="flex items-center gap-2 p-3 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
              >
                <Share2 className="w-4 h-4" />
                <span className="text-sm">فيسبوك</span>
              </button>
              
              <button
                onClick={() => handleShare('whatsapp')}
                className="flex items-center gap-2 p-3 rounded-lg bg-green-500 text-white hover:bg-green-600 transition-colors"
              >
                <Share2 className="w-4 h-4" />
                <span className="text-sm">واتساب</span>
              </button>
              
              <button
                onClick={() => handleShare('telegram')}
                className="flex items-center gap-2 p-3 rounded-lg bg-blue-400 text-white hover:bg-blue-500 transition-colors"
              >
                <Share2 className="w-4 h-4" />
                <span className="text-sm">تلجرام</span>
              </button>
            </div>
            
            <button
              onClick={() => handleShare()}
              className={`
                w-full mt-4 p-3 rounded-lg border-2 border-dashed transition-colors
                ${darkMode 
                  ? 'border-gray-600 text-gray-400 hover:border-gray-500 hover:text-gray-300' 
                  : 'border-gray-300 text-gray-600 hover:border-gray-400 hover:text-gray-700'
                }
              `}
            >
              نسخ الرابط
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
