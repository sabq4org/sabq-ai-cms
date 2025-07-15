'use client';

import { useState, useEffect } from 'react';
import { Heart, Bookmark, Share2, MessageSquare, Eye, Clock } from 'lucide-react';
import { useEnhancedTracking } from '@/hooks/useEnhancedTracking';
import { useDarkModeContext } from '@/contexts/DarkModeContext';
import { toast } from 'sonner';

interface ArticleInteractionBarProps {
  articleId: string;
  initialLiked?: boolean;
  initialSaved?: boolean;
  initialViews?: number;
  initialLikes?: number;
  onComment?: () => void;
}

export default function ArticleInteractionBar({
  articleId,
  initialLiked = false,
  initialSaved = false,
  initialViews = 0,
  initialLikes = 0,
  onComment
}: ArticleInteractionBarProps) {
  const { darkMode } = useDarkModeContext();
  const [liked, setLiked] = useState(initialLiked);
  const [saved, setSaved] = useState(initialSaved);
  const [likes, setLikes] = useState(initialLikes);
  const [views, setViews] = useState(initialViews);
  const [shareMenuOpen, setShareMenuOpen] = useState(false);

  // استخدام Enhanced Tracking
  const { 
    onLike, 
    onSave, 
    onShare, 
    onComment: trackComment,
    getCurrentDuration,
    getScrollDepth
  } = useEnhancedTracking({
    articleId,
    autoTrackView: true,
    autoTrackDuration: true,
    debug: true
  });

  // جلب حالة التفاعل الأولية
  useEffect(() => {
    const fetchInteractionState = async () => {
      const userId = localStorage.getItem('user_id');
      if (userId && userId !== 'anonymous') {
        try {
          const response = await fetch(`/api/interactions/user-article?userId=${userId}&articleId=${articleId}`);
          if (response.ok) {
            const data = await response.json();
            setLiked(data.data.liked);
            setSaved(data.data.saved);
          }
        } catch (error) {
          console.error('Error fetching interaction state:', error);
        }
      }
    };

    fetchInteractionState();
  }, [articleId]);

  const handleLike = async () => {
    const newLiked = !liked;
    setLiked(newLiked);
    setLikes(prev => newLiked ? prev + 1 : Math.max(0, prev - 1));

    // تتبع التفاعل
    const result = await onLike(articleId, newLiked);
    
    if (result?.points_earned) {
      // الإشعار يتم عرضه تلقائياً من hook
    }

    // تحديث في قاعدة البيانات
    try {
      const userId = localStorage.getItem('user_id');
      if (!userId || userId === 'anonymous') {
        toast.error('يجب تسجيل الدخول للإعجاب');
        setLiked(!newLiked);
        setLikes(prev => !newLiked ? prev + 1 : Math.max(0, prev - 1));
        return;
      }

      const response = await fetch('/api/interactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          userId,
          articleId,
          type: 'like',
          action: newLiked ? 'add' : 'remove'
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update like');
      }
    } catch (error) {
      // إرجاع الحالة في حالة الفشل
      setLiked(!newLiked);
      setLikes(prev => !newLiked ? prev + 1 : Math.max(0, prev - 1));
      toast.error('حدث خطأ في تسجيل الإعجاب');
    }
  };

  const handleSave = async () => {
    const newSaved = !saved;
    setSaved(newSaved);

    // تتبع التفاعل
    const result = await onSave(articleId, newSaved);

    // تحديث في قاعدة البيانات
    try {
      const userId = localStorage.getItem('user_id');
      if (!userId || userId === 'anonymous') {
        toast.error('يجب تسجيل الدخول للحفظ');
        setSaved(!newSaved);
        return;
      }

      const response = await fetch('/api/interactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          articleId,
          type: 'save',
          action: newSaved ? 'add' : 'remove'
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update save');
      }

      toast.success(newSaved ? 'تم حفظ المقال' : 'تم إلغاء الحفظ', {
        icon: newSaved ? '📑' : '🗑️'
      });
    } catch (error) {
      // إرجاع الحالة في حالة الفشل
      setSaved(!newSaved);
      toast.error('حدث خطأ في حفظ المقال');
    }
  };

  const handleShare = async (platform: string) => {
    // تتبع التفاعل
    await onShare(articleId, platform);

    const url = `${window.location.origin}/article/${articleId}`;
    const title = document.title;

    switch (platform) {
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`);
        break;
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`);
        break;
      case 'whatsapp':
        window.open(`https://wa.me/?text=${encodeURIComponent(title + ' ' + url)}`);
        break;
      case 'copy':
        navigator.clipboard.writeText(url);
        toast.success('تم نسخ الرابط', { icon: '📋' });
        break;
    }

    setShareMenuOpen(false);
  };

  const handleComment = () => {
    trackComment(articleId);
    if (onComment) {
      onComment();
    }
  };

  // عرض معلومات الجلسة في وضع التطوير
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      const interval = setInterval(() => {
        const duration = getCurrentDuration();
        const depth = getScrollDepth();
        console.log(`⏱️ Duration: ${duration}s | 📜 Scroll: ${depth}%`);
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [getCurrentDuration, getScrollDepth]);

  return (
    <div className={`sticky bottom-4 left-4 right-4 md:bottom-8 md:left-auto md:right-8 z-20 ${
      darkMode ? 'bg-gray-800/95' : 'bg-white/95'
    } backdrop-blur-md rounded-2xl shadow-2xl border ${
      darkMode ? 'border-gray-700' : 'border-gray-200'
    } p-4 max-w-sm mx-auto md:mx-0`}>
      <div className="flex items-center justify-around gap-2">
        {/* زر الإعجاب */}
        <button
          onClick={handleLike}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
            liked 
              ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400' 
              : darkMode 
                ? 'hover:bg-gray-700 text-gray-400' 
                : 'hover:bg-gray-100 text-gray-600'
          }`}
        >
          <Heart className={`w-5 h-5 transition-all ${liked ? 'fill-current scale-110' : ''}`} />
          <span className="text-sm font-medium">{likes}</span>
        </button>

        {/* زر الحفظ */}
        <button
          onClick={handleSave}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
            saved 
              ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' 
              : darkMode 
                ? 'hover:bg-gray-700 text-gray-400' 
                : 'hover:bg-gray-100 text-gray-600'
          }`}
        >
          <Bookmark className={`w-5 h-5 transition-all ${saved ? 'fill-current scale-110' : ''}`} />
        </button>

        {/* زر المشاركة */}
        <div className="relative">
          <button
            onClick={() => setShareMenuOpen(!shareMenuOpen)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
              darkMode 
                ? 'hover:bg-gray-700 text-gray-400' 
                : 'hover:bg-gray-100 text-gray-600'
            }`}
          >
            <Share2 className="w-5 h-5" />
          </button>

          {shareMenuOpen && (
            <div className={`absolute bottom-full mb-2 left-1/2 -translate-x-1/2 p-2 rounded-xl shadow-lg ${
              darkMode ? 'bg-gray-700' : 'bg-white'
            } border ${darkMode ? 'border-gray-600' : 'border-gray-200'}`}>
              <div className="flex gap-2">
                <button
                  onClick={() => handleShare('twitter')}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600"
                  title="Twitter"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                </button>
                <button
                  onClick={() => handleShare('facebook')}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600"
                  title="Facebook"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </button>
                <button
                  onClick={() => handleShare('whatsapp')}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600"
                  title="WhatsApp"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                  </svg>
                </button>
                <button
                  onClick={() => handleShare('copy')}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600"
                  title="نسخ الرابط"
                >
                  📋
                </button>
              </div>
            </div>
          )}
        </div>

        {/* زر التعليق */}
        <button
          onClick={handleComment}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
            darkMode 
              ? 'hover:bg-gray-700 text-gray-400' 
              : 'hover:bg-gray-100 text-gray-600'
          }`}
        >
          <MessageSquare className="w-5 h-5" />
        </button>

        {/* عداد المشاهدات */}
        <div className={`flex items-center gap-2 px-4 py-2 rounded-xl ${
          darkMode ? 'bg-gray-700/50' : 'bg-gray-100/50'
        }`}>
          <Eye className="w-4 h-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{views}</span>
        </div>
      </div>
    </div>
  );
} 