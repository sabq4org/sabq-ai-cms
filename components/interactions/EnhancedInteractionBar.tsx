'use client';

import React, { useState, useEffect } from 'react';
import { useUser } from '@/hooks/useUser';
import { toast } from 'sonner';
import { 
  Heart, 
  MessageSquare, 
  Share2, 
  Bookmark, 
  Eye,
  TrendingUp,
  Clock,
  Users,
  Star,
  Award,
  Zap
} from 'lucide-react';
import CommentSystem from '../comments/CommentSystem';

interface InteractionBarProps {
  articleId: string;
  articleTitle: string;
  articleSlug: string;
  initialStats?: {
    likes: number;
    comments: number;
    shares: number;
    views: number;
    bookmarks: number;
  };
  showComments?: boolean;
  enableRealtimeUpdates?: boolean;
}

interface UserInteraction {
  liked: boolean;
  bookmarked: boolean;
  commented: boolean;
  shared: boolean;
  readTime: number;
  scrollDepth: number;
  qualityScore?: number;
}

export default function EnhancedInteractionBar({
  articleId,
  articleTitle,
  articleSlug,
  initialStats = {
    likes: 0,
    comments: 0,
    shares: 0,
    views: 0,
    bookmarks: 0
  },
  showComments = true,
  enableRealtimeUpdates = true
}: InteractionBarProps) {
  const { user, isAuthenticated } = useUser();
  const [stats, setStats] = useState(initialStats);
  const [userInteraction, setUserInteraction] = useState<UserInteraction>({
    liked: false,
    bookmarked: false,
    commented: false,
    shared: false,
    readTime: 0,
    scrollDepth: 0
  });
  const [showCommentsPanel, setShowCommentsPanel] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [sessionStartTime] = useState(Date.now());
  const [pointsEarned, setPointsEarned] = useState(0);

  // تتبع وقت القراءة والتمرير
  useEffect(() => {
    if (!user) return;

    const updateReadingProgress = () => {
      const readTime = Math.floor((Date.now() - sessionStartTime) / 1000);
      const scrollDepth = Math.round(
        (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100
      );

      setUserInteraction(prev => ({
        ...prev,
        readTime,
        scrollDepth: Math.min(100, Math.max(prev.scrollDepth, scrollDepth))
      }));

      // إرسال تحديثات دورية للخادم
      if (readTime > 0 && readTime % 30 === 0) { // كل 30 ثانية
        trackActivity('reading_progress', {
          readTime,
          scrollDepth,
          articleTitle
        });
      }
    };

    const interval = setInterval(updateReadingProgress, 1000);
    const scrollHandler = () => updateReadingProgress();

    window.addEventListener('scroll', scrollHandler);

    return () => {
      clearInterval(interval);
      window.removeEventListener('scroll', scrollHandler);
      
      // إرسال إحصائيات نهائية عند المغادرة
      if (userInteraction.readTime > 10) {
        trackActivity('reading_completed', {
          totalReadTime: userInteraction.readTime,
          finalScrollDepth: userInteraction.scrollDepth,
          articleCompleted: userInteraction.scrollDepth > 80
        });
      }
    };
  }, [user, sessionStartTime]);

  // جلب حالة التفاعل الأولية
  useEffect(() => {
    if (user) {
      fetchUserInteractionState();
    }
  }, [user, articleId]);

  const fetchUserInteractionState = async () => {
    if (!user) return;

    try {
      const response = await fetch(`/api/interactions/user-article?userId=${user.id}&articleId=${articleId}`);
      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data) {
          setUserInteraction(prev => ({
            ...prev,
            liked: result.data.liked || false,
            bookmarked: result.data.saved || false,
            shared: result.data.shared || false
          }));
        }
      }
    } catch (error) {
      console.error('خطأ في جلب حالة التفاعل:', error);
    }
  };

  const trackActivity = async (action: string, metadata: any = {}) => {
    if (!user) return;

    try {
      await fetch('/api/user-activity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          action,
          targetType: 'article',
          targetId: articleId,
          metadata: {
            ...metadata,
            userAgent: navigator.userAgent,
            timestamp: new Date().toISOString()
          }
        })
      });
    } catch (error) {
      console.error('خطأ في تتبع النشاط:', error);
    }
  };

  const handleInteraction = async (type: 'like' | 'bookmark' | 'share', platform?: string) => {
    if (!isAuthenticated) {
      toast.error('يجب تسجيل الدخول للتفاعل');
      return;
    }

    setIsLoading(true);

    try {
      // تحويل bookmark إلى save للتوافق مع API
      const apiType = type === 'bookmark' ? 'save' : type;
      const stateKey = type === 'like' ? 'liked' : type === 'bookmark' ? 'bookmarked' : 'shared';
      const statsKey = type === 'like' ? 'likes' : type === 'bookmark' ? 'bookmarks' : 'shares';
      
      const currentState = userInteraction[stateKey];
      const newState = !currentState;

      // تحديث فوري للواجهة (Optimistic Update)
      setUserInteraction(prev => ({
        ...prev,
        [stateKey]: newState
      }));

      setStats(prev => ({
        ...prev,
        [statsKey]: newState ? prev[statsKey] + 1 : Math.max(0, prev[statsKey] - 1)
      }));

      // إرسال للخادم
      const response = await fetch('/api/interactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user!.id,
          article_id: articleId,
          type: apiType,
          metadata: {
            platform,
            readTime: userInteraction.readTime,
            scrollDepth: userInteraction.scrollDepth,
            qualityScore: userInteraction.qualityScore
          }
        })
      });

      if (response.ok) {
        const data = await response.json();
        
        if (data.pointsEarned > 0) {
          setPointsEarned(prev => prev + data.pointsEarned);
          toast.success(`+${data.pointsEarned} نقطة!`, {
            icon: '⭐',
            description: getInteractionMessage(type, newState)
          });
        } else {
          toast.success(getInteractionMessage(type, newState), {
            icon: getInteractionIcon(type, newState)
          });
        }

        // تتبع النشاط
        await trackActivity(type, {
          action: newState ? 'add' : 'remove',
          platform,
          articleTitle
        });

      } else {
        throw new Error('فشل في التفاعل');
      }

    } catch (error) {
      // إرجاع الحالة في حالة الفشل
      setUserInteraction(prev => ({
        ...prev,
        [stateKey]: currentState
      }));

      setStats(prev => ({
        ...prev,
        [statsKey]: currentState ? prev[statsKey] + 1 : Math.max(0, prev[statsKey] - 1)
      }));

      toast.error('حدث خطأ في التفاعل');
    } finally {
      setIsLoading(false);
    }
  };

  const handleShare = async (platform: string) => {
    const url = `${window.location.origin}/article/${articleSlug}`;
    const text = `${articleTitle} - من موقع سبق`;

    switch (platform) {
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`);
        break;
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`);
        break;
      case 'whatsapp':
        window.open(`https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`);
        break;
      case 'copy':
        navigator.clipboard.writeText(url);
        toast.success('تم نسخ الرابط', { icon: '📋' });
        return; // عدم تسجيل مشاركة للنسخ
    }

    // تسجيل المشاركة
    await handleInteraction('share', platform);
  };

  const getInteractionMessage = (type: string, added: boolean) => {
    const messages = {
      like: added ? 'تم الإعجاب بالمقال' : 'تم إلغاء الإعجاب',
      bookmark: added ? 'تم حفظ المقال' : 'تم إلغاء الحفظ',
      share: 'تم مشاركة المقال'
    };
    return messages[type as keyof typeof messages];
  };

  const getInteractionIcon = (type: string, added: boolean) => {
    const icons = {
      like: added ? '❤️' : '💔',
      bookmark: added ? '📑' : '🗑️',
      share: '🔗'
    };
    return icons[type as keyof typeof icons];
  };

  const getEngagementLevel = () => {
    const totalInteractions = stats.likes + stats.comments + stats.shares;
    if (totalInteractions > 100) return { level: 'viral', color: 'text-red-600', icon: '🔥' };
    if (totalInteractions > 50) return { level: 'trending', color: 'text-orange-600', icon: '📈' };
    if (totalInteractions > 20) return { level: 'popular', color: 'text-blue-600', icon: '⭐' };
    return { level: 'growing', color: 'text-green-600', icon: '🌱' };
  };

  const engagement = getEngagementLevel();

  return (
    <div className="space-y-6">
      {/* شريط التفاعل الرئيسي */}
      <div className="sticky bottom-4 left-4 right-4 md:bottom-8 md:left-auto md:right-8 z-20 bg-white/95 dark:bg-gray-800/95 backdrop-blur-md rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 p-4 max-w-sm mx-auto md:mx-0">
        
        {/* مؤشر التفاعل */}
        <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <span className={`${engagement.color} font-bold text-sm`}>
              {engagement.icon} {engagement.level}
            </span>
          </div>
          
          {pointsEarned > 0 && (
            <div className="flex items-center gap-1 text-yellow-600 animate-pulse">
              <Star className="w-4 h-4" />
              <span className="text-sm font-bold">+{pointsEarned}</span>
            </div>
          )}
        </div>

        {/* أزرار التفاعل */}
        <div className="grid grid-cols-2 gap-3">
          {/* صف أول */}
          <button
            onClick={() => handleInteraction('like')}
            disabled={isLoading}
            className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl transition-all ${
              userInteraction.liked 
                ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 scale-105' 
                : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400'
            }`}
          >
            <Heart className={`w-5 h-5 transition-all ${userInteraction.liked ? 'fill-current animate-pulse' : ''}`} />
            <span className="text-sm font-medium">{stats.likes}</span>
          </button>

          <button
            onClick={() => handleInteraction('bookmark')}
            disabled={isLoading}
            className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl transition-all ${
              userInteraction.bookmarked 
                ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 scale-105' 
                : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400'
            }`}
          >
            <Bookmark className={`w-5 h-5 transition-all ${userInteraction.bookmarked ? 'fill-current' : ''}`} />
            <span className="text-sm font-medium">{stats.bookmarks}</span>
          </button>

          {/* صف ثاني */}
          <div className="relative">
            <ShareButton onShare={handleShare} shareCount={stats.shares} />
          </div>

          <button
            onClick={() => setShowCommentsPanel(!showCommentsPanel)}
            className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 transition-all"
          >
            <MessageSquare className="w-5 h-5" />
            <span className="text-sm font-medium">{stats.comments}</span>
          </button>
        </div>

        {/* معلومات إضافية */}
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <Eye className="w-3 h-3" />
                {stats.views}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {Math.floor(userInteraction.readTime / 60)}م
              </span>
            </div>
            
            {user && (
              <div className="flex items-center gap-1">
                <Zap className="w-3 h-3 text-yellow-500" />
                <span>{userInteraction.scrollDepth}%</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* نظام التعليقات */}
      {showComments && showCommentsPanel && (
        <div className="mt-8">
          <CommentSystem
            articleId={articleId}
            articleTitle={articleTitle}
            articleSlug={articleSlug}
            enableRealTime={enableRealtimeUpdates}
          />
        </div>
      )}
    </div>
  );
}

// مكون زر المشاركة
const ShareButton = ({ onShare, shareCount }: { onShare: (platform: string) => void; shareCount: number }) => {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <>
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 transition-all"
      >
        <Share2 className="w-5 h-5" />
        <span className="text-sm font-medium">{shareCount}</span>
      </button>

      {showMenu && (
        <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-white dark:bg-gray-700 rounded-xl shadow-lg border border-gray-200 dark:border-gray-600 p-2 z-30">
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => onShare('twitter')}
              className="p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
              title="Twitter"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
            </button>
            
            <button
              onClick={() => onShare('facebook')}
              className="p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
              title="Facebook"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
            </button>
            
            <button
              onClick={() => onShare('whatsapp')}
              className="p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
              title="WhatsApp"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
              </svg>
            </button>
            
            <button
              onClick={() => onShare('copy')}
              className="p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
              title="نسخ الرابط"
            >
              📋
            </button>
          </div>
        </div>
      )}
    </>
  );
};
