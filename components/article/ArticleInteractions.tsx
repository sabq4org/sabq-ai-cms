'use client';

import React, { useState, useEffect } from 'react';
import { Heart, Bookmark, Share2, Eye, Clock } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import toast from 'react-hot-toast';

interface ArticleInteractionsProps {
  articleId: string;
  initialStats?: {
    likes?: number;
    saves?: number;
    shares?: number;
    views?: number;
  };
  className?: string;
}

export default function ArticleInteractions({ 
  articleId, 
  initialStats = {},
  className = ''
}: ArticleInteractionsProps) {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    likes: initialStats.likes || 0,
    saves: initialStats.saves || 0,
    shares: initialStats.shares || 0,
    views: initialStats.views || 0
  });
  const [userInteractions, setUserInteractions] = useState({
    liked: false,
    saved: false,
    shared: false
  });
  const [loading, setLoading] = useState(false);
  const [readingStartTime] = useState(Date.now());

  // جلب حالة التفاعلات للمستخدم الحالي
  useEffect(() => {
    if (user?.id && articleId) {
      fetchUserInteractions();
    }
    
    // تسجيل مشاهدة المقال
    registerView();
    
    // تسجيل وقت القراءة عند مغادرة الصفحة
    return () => {
      if (user?.id) {
        registerReadingTime();
      }
    };
  }, [user?.id, articleId]);

  const fetchUserInteractions = async () => {
    try {
      const response = await fetch(`/api/interactions?article_id=${articleId}&user_id=${user?.id}`);
      if (response.ok) {
        const data = await response.json();
        if (data.interactions && data.stats) {
          // تحديث الإحصائيات
          setStats(prev => ({
            likes: data.stats.like || prev.likes,
            saves: data.stats.save || prev.saves,
            shares: data.stats.share || prev.shares,
            views: data.stats.view || prev.views
          }));
          
          // تحديد حالة تفاعلات المستخدم
          const userLiked = data.interactions.some((i: any) => 
            i.user_id === user?.id && i.type === 'like'
          );
          const userSaved = data.interactions.some((i: any) => 
            i.user_id === user?.id && i.type === 'save'
          );
          const userShared = data.interactions.some((i: any) => 
            i.user_id === user?.id && i.type === 'share'
          );
          
          setUserInteractions({
            liked: userLiked,
            saved: userSaved,
            shared: userShared
          });
        }
      }
    } catch (error) {
      console.error('خطأ في جلب التفاعلات:', error);
    }
  };

  const registerView = async () => {
    if (!user?.id) return;
    
    try {
      await fetch('/api/interactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.id,
          article_id: articleId,
          type: 'view'
        })
      });
    } catch (error) {
      console.error('خطأ في تسجيل المشاهدة:', error);
    }
  };

  const registerReadingTime = async () => {
    if (!user?.id) return; // التأكد من وجود المستخدم
    
    const readingTime = Math.floor((Date.now() - readingStartTime) / 1000); // بالثواني
    
    if (readingTime < 5) return; // تجاهل القراءات السريعة جداً
    
    try {
      await fetch('/api/interactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.id,
          article_id: articleId,
          type: 'reading_session',
          metadata: {
            duration_seconds: readingTime,
            completed_at: new Date().toISOString()
          }
        })
      });
    } catch (error) {
      console.error('خطأ في تسجيل وقت القراءة:', error);
    }
  };

  const handleInteraction = async (type: 'like' | 'save' | 'share') => {
    if (!user?.id) {
      toast.error('يرجى تسجيل الدخول أولاً');
      return;
    }

    if (loading) return;
    setLoading(true);

    try {
      const response = await fetch('/api/interactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.id,
          article_id: articleId,
          type
        })
      });

      if (response.ok) {
        const data = await response.json();
        
        // تحديث حالة التفاعل
        if (data.action === 'added') {
          setUserInteractions(prev => ({ ...prev, [type + 'd']: true }));
          setStats(prev => ({ ...prev, [type + 's']: prev[type + 's' as keyof typeof prev] + 1 }));
          toast.success(getSuccessMessage(type, true));
        } else if (data.action === 'removed') {
          setUserInteractions(prev => ({ ...prev, [type + 'd']: false }));
          setStats(prev => ({ ...prev, [type + 's']: Math.max(0, prev[type + 's' as keyof typeof prev] - 1) }));
          toast.success(getSuccessMessage(type, false));
        }
        
        // للمشاركة، فتح نافذة المشاركة
        if (type === 'share' && data.action === 'added') {
          handleShare();
        }
      } else {
        toast.error('حدث خطأ في معالجة الطلب');
      }
    } catch (error) {
      console.error('خطأ في التفاعل:', error);
      toast.error('حدث خطأ غير متوقع');
    } finally {
      setLoading(false);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: document.title,
        url: window.location.href
      }).catch(() => {
        // المستخدم ألغى المشاركة
      });
    } else {
      // نسخ الرابط للحافظة
      navigator.clipboard.writeText(window.location.href);
      toast.success('تم نسخ الرابط');
    }
  };

  const getSuccessMessage = (type: string, added: boolean) => {
    const messages = {
      like: added ? 'تم الإعجاب بالمقال' : 'تم إلغاء الإعجاب',
      save: added ? 'تم حفظ المقال' : 'تم إلغاء الحفظ',
      share: added ? 'تمت مشاركة المقال' : ''
    };
    return messages[type as keyof typeof messages] || '';
  };

  return (
    <div className={`flex items-center gap-4 ${className}`}>
      {/* زر الإعجاب */}
      <button
        onClick={() => handleInteraction('like')}
        disabled={loading}
        className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all transform hover:scale-105 ${
          userInteractions.liked
            ? 'bg-red-500 text-white'
            : darkMode 
              ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        }`}
        title={userInteractions.liked ? 'إلغاء الإعجاب' : 'إعجاب'}
      >
        <Heart 
          className={`w-5 h-5 ${userInteractions.liked ? 'fill-current' : ''}`} 
        />
        <span className="text-sm font-medium">{stats.likes}</span>
      </button>

      {/* زر الحفظ */}
      <button
        onClick={() => handleInteraction('save')}
        disabled={loading}
        className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all transform hover:scale-105 ${
          userInteractions.saved
            ? 'bg-blue-500 text-white'
            : darkMode 
              ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        }`}
        title={userInteractions.saved ? 'إلغاء الحفظ' : 'حفظ'}
      >
        <Bookmark 
          className={`w-5 h-5 ${userInteractions.saved ? 'fill-current' : ''}`} 
        />
        <span className="text-sm font-medium">{stats.saves}</span>
      </button>

      {/* زر المشاركة */}
      <button
        onClick={() => handleInteraction('share')}
        disabled={loading}
        className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all transform hover:scale-105 ${
          darkMode 
            ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        }`}
        title="مشاركة"
      >
        <Share2 className="w-5 h-5" />
        <span className="text-sm font-medium">{stats.shares}</span>
      </button>

      {/* عدد المشاهدات */}
      <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${
        darkMode ? 'bg-gray-800 text-gray-400' : 'bg-gray-100 text-gray-600'
      }`}>
        <Eye className="w-5 h-5" />
        <span className="text-sm">{stats.views}</span>
      </div>
    </div>
  );
} 