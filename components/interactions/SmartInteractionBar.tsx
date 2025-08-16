'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Heart, Bookmark, Share2, MessageCircle, Eye, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';
import { useUser } from '@/contexts/UserContext';
import { useUserTracking } from '@/lib/user-tracking-integration';

// ===== Types =====

interface InteractionStats {
  likes: number;
  saves: number;
  shares: number;
  comments: number;
  views: number;
}

interface UserInteractionState {
  liked: boolean;
  saved: boolean;
  shared: boolean;
  viewed: boolean;
}

interface SmartInteractionBarProps {
  articleId: string;
  articleTitle: string;
  articleSlug?: string;
  initialStats?: Partial<InteractionStats>;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'horizontal' | 'vertical' | 'compact';
  showLabels?: boolean;
  showCounts?: boolean;
  enableRealtimeUpdates?: boolean;
  onInteraction?: (type: string, isActive: boolean) => void;
}

// ===== Smart Interaction Bar Component =====

export default function SmartInteractionBar({
  articleId,
  articleTitle,
  articleSlug,
  initialStats = {},
  className = '',
  size = 'md',
  variant = 'horizontal',
  showLabels = true,
  showCounts = true,
  enableRealtimeUpdates = true,
  onInteraction
}: SmartInteractionBarProps) {
  
  // ===== State =====
  
  const { user, isAuthenticated } = useUser();
  const { tracker, trackInteraction } = useUserTracking(user?.id, articleId);
  
  const [stats, setStats] = useState<InteractionStats>({
    likes: 0,
    saves: 0,
    shares: 0,
    comments: 0,
    views: 0,
    ...initialStats
  });
  
  const [userState, setUserState] = useState<UserInteractionState>({
    liked: false,
    saved: false,
    shared: false,
    viewed: false
  });
  
  const [isLoading, setIsLoading] = useState<Record<string, boolean>>({});
  const [lastUpdate, setLastUpdate] = useState<number>(Date.now());
  
  // ===== Effects =====
  
  // تحميل حالة التفاعلات عند التحميل
  useEffect(() => {
    if (isAuthenticated && user?.id) {
      loadUserInteractionState();
      
      // تسجيل مشاهدة المقال
      if (tracker) {
        trackInteraction('view', {
          metadata: {
            article_title: articleTitle,
            article_slug: articleSlug
          }
        });
      }
    }
  }, [isAuthenticated, user?.id, articleId]);
  
  // تحديث فوري للإحصائيات
  useEffect(() => {
    if (enableRealtimeUpdates) {
      const interval = setInterval(loadInteractionStats, 30000); // كل 30 ثانية
      return () => clearInterval(interval);
    }
  }, [enableRealtimeUpdates, articleId]);
  
  // ===== Data Loading =====
  
  const loadUserInteractionState = useCallback(async () => {
    if (!user?.id) return;
    
    try {
      const response = await fetch(`/api/interactions/user-article?userId=${user.id}&articleId=${articleId}`);
      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data) {
          setUserState({
            liked: result.data.liked || false,
            saved: result.data.saved || false,
            shared: result.data.shared || false,
            viewed: true // دائماً true إذا تم تحميل الصفحة
          });
        }
      }
    } catch (error) {
      console.error('خطأ في تحميل حالة التفاعلات:', error);
    }
  }, [user?.id, articleId]);
  
  const loadInteractionStats = useCallback(async () => {
    try {
      const response = await fetch(`/api/interactions?article_id=${articleId}`);
      if (response.ok) {
        const result = await response.json();
        if (result.success && result.stats) {
          setStats(prev => ({
            ...prev,
            likes: result.stats.like || 0,
            saves: result.stats.save || 0,
            shares: result.stats.share || 0,
            comments: result.stats.comment || 0,
            views: result.stats.view || 0
          }));
          setLastUpdate(Date.now());
        }
      }
    } catch (error) {
      console.error('خطأ في تحميل إحصائيات التفاعلات:', error);
    }
  }, [articleId]);
  
  // ===== Interaction Handlers =====
  
  const handleInteraction = useCallback(async (
    type: 'like' | 'save' | 'share' | 'comment',
    options: { platform?: string; url?: string } = {}
  ) => {
    // التحقق من تسجيل الدخول
    if (!isAuthenticated || !user?.id) {
      toast.error('يجب تسجيل الدخول للتفاعل مع المحتوى');
      return;
    }
    
    // منع الطلبات المتعددة
    if (isLoading[type]) return;
    
    setIsLoading(prev => ({ ...prev, [type]: true }));
    
    try {
      const currentState = userState[type === 'like' ? 'liked' : type === 'save' ? 'saved' : 'shared'];
      const newState = !currentState;
      
      // تحديث فوري للواجهة (Optimistic Update)
      setUserState(prev => ({
        ...prev,
        [type === 'like' ? 'liked' : type === 'save' ? 'saved' : 'shared']: newState
      }));
      
      setStats(prev => ({
        ...prev,
        [type === 'like' ? 'likes' : type === 'save' ? 'saves' : 'shares']: 
          newState ? prev[type === 'like' ? 'likes' : type === 'save' ? 'saves' : 'shares'] + 1 
                  : Math.max(0, prev[type === 'like' ? 'likes' : type === 'save' ? 'saves' : 'shares'] - 1)
      }));
      
      // تتبع التفاعل بالنظام الجديد
      if (tracker) {
        const trackingSuccess = await trackInteraction(type, {
          metadata: {
            action: newState ? 'add' : 'remove',
            article_title: articleTitle,
            article_slug: articleSlug,
            ...options
          }
        });
        
        if (!trackingSuccess) {
          console.warn('فشل في تتبع التفاعل بالنظام المتقدم');
        }
      }
      
      // إرسال للنظام الحالي
      const response = await fetch('/api/interactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.id,
          article_id: articleId,
          type: type,
          metadata: {
            action: newState ? 'add' : 'remove',
            tracking_system: 'smart_v2',
            platform: options.platform,
            timestamp: new Date().toISOString()
          }
        })
      });
      
      if (response.ok) {
        const result = await response.json();
        
        // عرض رسالة نجاح
        const actionText = newState ? 'إضافة' : 'إلغاء';
        const interactionText = type === 'like' ? 'الإعجاب' : 
                               type === 'save' ? 'الحفظ' : 
                               type === 'share' ? 'المشاركة' : 'التعليق';
        
        toast.success(`تم ${actionText} ${interactionText}`, {
          description: result.message,
          icon: getInteractionIcon(type, newState)
        });
        
        // استدعاء callback
        onInteraction?.(type, newState);
        
        // إعادة تحميل الإحصائيات للتأكد من التزامن
        setTimeout(loadInteractionStats, 1000);
        
      } else {
        throw new Error('فشل في حفظ التفاعل');
      }
      
    } catch (error) {
      console.error('خطأ في معالجة التفاعل:', error);
      
      // إرجاع الحالة كما كانت
      const revertedState = userState[type === 'like' ? 'liked' : type === 'save' ? 'saved' : 'shared'];
      setUserState(prev => ({
        ...prev,
        [type === 'like' ? 'liked' : type === 'save' ? 'saved' : 'shared']: revertedState
      }));
      
      setStats(prev => ({
        ...prev,
        [type === 'like' ? 'likes' : type === 'save' ? 'saves' : 'shares']: 
          revertedState ? prev[type === 'like' ? 'likes' : type === 'save' ? 'saves' : 'shares'] + 1 
                        : Math.max(0, prev[type === 'like' ? 'likes' : type === 'save' ? 'saves' : 'shares'] - 1)
      }));
      
      toast.error('فشل في حفظ التفاعل', {
        description: 'يرجى المحاولة مرة أخرى'
      });
    } finally {
      setIsLoading(prev => ({ ...prev, [type]: false }));
    }
  }, [isAuthenticated, user?.id, userState, articleId, articleTitle, articleSlug, tracker, trackInteraction, onInteraction, loadInteractionStats]);
  
  // ===== Share Handlers =====
  
  const handleShare = useCallback(async (platform: string) => {
    const url = `${window.location.origin}/article/${articleSlug || articleId}`;
    const text = `${articleTitle} - سبق الذكية`;
    
    let shareUrl = '';
    
    switch (platform) {
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
        break;
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
        break;
      case 'whatsapp':
        shareUrl = `https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`;
        break;
      case 'telegram':
        shareUrl = `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`;
        break;
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
        break;
      case 'copy':
        try {
          await navigator.clipboard.writeText(url);
          toast.success('تم نسخ الرابط', {
            description: 'تم نسخ رابط المقال إلى الحافظة'
          });
          await handleInteraction('share', { platform: 'copy', url });
          return;
        } catch (error) {
          toast.error('فشل في نسخ الرابط');
          return;
        }
      case 'native':
        if (navigator.share) {
          try {
            await navigator.share({
              title: articleTitle,
              text: text,
              url: url
            });
            await handleInteraction('share', { platform: 'native', url });
            return;
          } catch (error) {
            // المستخدم ألغى المشاركة
            return;
          }
        }
        break;
    }
    
    if (shareUrl) {
      window.open(shareUrl, '_blank', 'width=600,height=400');
      await handleInteraction('share', { platform, url });
    }
  }, [articleId, articleSlug, articleTitle, handleInteraction]);
  
  // ===== Helper Functions =====
  
  const getInteractionIcon = (type: string, isActive: boolean) => {
    const iconSize = size === 'sm' ? 16 : size === 'md' ? 20 : 24;
    const activeColor = isActive ? 'text-red-500' : 'text-gray-500';
    
    switch (type) {
      case 'like':
        return <Heart 
          size={iconSize} 
          className={`${activeColor} ${isActive ? 'fill-current' : ''} transition-colors`} 
        />;
      case 'save':
        return <Bookmark 
          size={iconSize} 
          className={`${activeColor} ${isActive ? 'fill-current' : ''} transition-colors`} 
        />;
      case 'share':
        return <Share2 size={iconSize} className="text-blue-500 transition-colors" />;
      case 'comment':
        return <MessageCircle size={iconSize} className="text-green-500 transition-colors" />;
      default:
        return null;
    }
  };
  
  const getButtonSize = () => {
    switch (size) {
      case 'sm': return 'px-2 py-1 text-xs';
      case 'lg': return 'px-4 py-3 text-lg';
      default: return 'px-3 py-2 text-sm';
    }
  };
  
  const getLayoutClasses = () => {
    const base = 'flex gap-2';
    switch (variant) {
      case 'vertical': return `${base} flex-col`;
      case 'compact': return `${base} gap-1`;
      default: return `${base} flex-row`;
    }
  };
  
  // ===== Share Menu Component =====
  
  const ShareMenu = () => {
    const [isOpen, setIsOpen] = useState(false);
    
    const shareOptions = [
      { id: 'copy', label: 'نسخ الرابط', icon: '🔗' },
      { id: 'whatsapp', label: 'واتساب', icon: '💬' },
      { id: 'twitter', label: 'تويتر', icon: '🐦' },
      { id: 'facebook', label: 'فيسبوك', icon: '📘' },
      { id: 'telegram', label: 'تيليجرام', icon: '✈️' },
      { id: 'linkedin', label: 'لينكدإن', icon: '💼' },
    ];
    
    // إضافة المشاركة الأصلية إذا كانت متاحة
    if (navigator.share) {
      shareOptions.unshift({ id: 'native', label: 'مشاركة', icon: '📤' });
    }
    
    return (
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          disabled={isLoading.share}
          className={`
            ${getButtonSize()}
            flex items-center gap-2 rounded-lg border border-gray-200 
            bg-white hover:bg-gray-50 transition-colors
            disabled:opacity-50 disabled:cursor-not-allowed
          `}
        >
          {getInteractionIcon('share', false)}
          {showLabels && <span>مشاركة</span>}
          {showCounts && <span className="text-gray-500">({stats.shares})</span>}
        </button>
        
        {isOpen && (
          <>
            <div 
              className="fixed inset-0 z-10" 
              onClick={() => setIsOpen(false)}
            />
            <div className="absolute top-full left-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-20 min-w-40">
              {shareOptions.map(option => (
                <button
                  key={option.id}
                  onClick={() => {
                    handleShare(option.id);
                    setIsOpen(false);
                  }}
                  className="w-full px-3 py-2 text-right hover:bg-gray-50 transition-colors first:rounded-t-lg last:rounded-b-lg flex items-center gap-2"
                >
                  <span>{option.icon}</span>
                  <span>{option.label}</span>
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    );
  };
  
  // ===== Render =====
  
  return (
    <div className={`smart-interaction-bar ${getLayoutClasses()} ${className}`}>
      
      {/* زر الإعجاب */}
      <button
        onClick={() => handleInteraction('like')}
        disabled={!isAuthenticated || isLoading.like}
        className={`
          ${getButtonSize()}
          flex items-center gap-2 rounded-lg border border-gray-200 
          ${userState.liked ? 'bg-red-50 border-red-200' : 'bg-white hover:bg-gray-50'}
          transition-colors disabled:opacity-50 disabled:cursor-not-allowed
        `}
        title={userState.liked ? 'إلغاء الإعجاب' : 'إعجاب'}
      >
        {getInteractionIcon('like', userState.liked)}
        {showLabels && <span>{userState.liked ? 'معجب' : 'إعجاب'}</span>}
        {showCounts && <span className="text-gray-500">({stats.likes})</span>}
      </button>
      
      {/* زر الحفظ */}
      <button
        onClick={() => handleInteraction('save')}
        disabled={!isAuthenticated || isLoading.save}
        className={`
          ${getButtonSize()}
          flex items-center gap-2 rounded-lg border border-gray-200 
          ${userState.saved ? 'bg-yellow-50 border-yellow-200' : 'bg-white hover:bg-gray-50'}
          transition-colors disabled:opacity-50 disabled:cursor-not-allowed
        `}
        title={userState.saved ? 'إلغاء الحفظ' : 'حفظ'}
      >
        {getInteractionIcon('save', userState.saved)}
        {showLabels && <span>{userState.saved ? 'محفوظ' : 'حفظ'}</span>}
        {showCounts && <span className="text-gray-500">({stats.saves})</span>}
      </button>
      
      {/* قائمة المشاركة */}
      <ShareMenu />
      
      {/* زر التعليقات */}
      <button
        onClick={() => handleInteraction('comment')}
        disabled={!isAuthenticated || isLoading.comment}
        className={`
          ${getButtonSize()}
          flex items-center gap-2 rounded-lg border border-gray-200 
          bg-white hover:bg-gray-50 transition-colors
          disabled:opacity-50 disabled:cursor-not-allowed
        `}
        title="تعليق"
      >
        {getInteractionIcon('comment', false)}
        {showLabels && <span>تعليق</span>}
        {showCounts && <span className="text-gray-500">({stats.comments})</span>}
      </button>
      
      {/* عداد المشاهدات */}
      {showCounts && (
        <div className={`${getButtonSize()} flex items-center gap-2 text-gray-500`}>
          <Eye size={size === 'sm' ? 16 : size === 'md' ? 20 : 24} />
          {showLabels && <span>مشاهدة</span>}
          <span>({stats.views})</span>
        </div>
      )}
      
      {/* مؤشر التحديث الأخير */}
      {enableRealtimeUpdates && (
        <div className="text-xs text-gray-400 self-center">
          <TrendingUp size={12} className="inline" />
          <span className="ml-1">مُحدث</span>
        </div>
      )}
    </div>
  );
}

// ===== التصدير =====

export { SmartInteractionBar };
export type { InteractionStats, UserInteractionState, SmartInteractionBarProps };
