'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { randomUUID } from 'crypto';

// دالة debounce مخصصة
function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), wait);
  };
}

interface InteractionData {
  articleId: string;
  userId: string;
  sessionId: string;
  enterTime: number;
  exitTime?: number;
  duration?: number;
  scrollDepth: number;
  maxScrollDepth: number;
  interactionType: 'view' | 'read' | 'engage' | 'complete';
  interactions: {
    liked: boolean;
    saved: boolean;
    shared: boolean;
    commented: boolean;
    clickCount: number;
  };
  readingSpeed?: number;
  deviceType: 'mobile' | 'tablet' | 'desktop';
}

export function useUserInteractionTracking(articleId: string) {
  const { user } = useAuth();
  const [hasLiked, setHasLiked] = useState(false);
  const [hasSaved, setHasSaved] = useState(false);
  const [isTracking, setIsTracking] = useState(false);
  
  const sessionRef = useRef<InteractionData | null>(null);
  const scrollTrackingRef = useRef<NodeJS.Timeout>();
  const lastScrollPosition = useRef(0);
  const maxScrollDepth = useRef(0);
  const interactionCount = useRef(0);

  // تهيئة جلسة التتبع
  useEffect(() => {
    if (!user || !articleId) return;

    // استعمال UUID قصير لتفادي تجاوز حدود قاعدة البيانات للجلسة (<=36)
    const sessionId = cryptoRandomId();
    const deviceType = getDeviceType();

    sessionRef.current = {
      articleId,
      userId: user.id,
      sessionId,
      enterTime: Date.now(),
      scrollDepth: 0,
      maxScrollDepth: 0,
      interactionType: 'view',
      interactions: {
        liked: false,
        saved: false,
        shared: false,
        commented: false,
        clickCount: 0,
      },
      deviceType,
    };

    setIsTracking(true);

    // جلب حالة التفاعلات السابقة
    fetchUserInteractions();

    // بدء تتبع الوقت
    const startTracking = async () => {
      await fetch('/api/interactions/session/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          articleId,
          userId: user.id,
          sessionId,
          deviceType,
        }),
      });
    };

    startTracking();

    return () => {
      // إنهاء جلسة التتبع عند الخروج
      if (sessionRef.current) {
        endTrackingSession();
      }
    };
  }, [user, articleId]);

  // جلب التفاعلات السابقة للمستخدم
  const fetchUserInteractions = async () => {
    if (!user || !articleId) return;
    
    console.log('🔍 جلب حالة تفاعل المستخدم للمقال:', articleId);
    
    try {
      const token =
        (typeof window !== 'undefined' && (localStorage.getItem('auth-token') || localStorage.getItem('sabq_at') || localStorage.getItem('access_token'))) || '';
      const response = await fetch(`/api/interactions/user-status?articleId=${articleId}` , {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('📊 بيانات التفاعل المستلمة:', data);
        
        const liked = data?.liked || data?.hasLiked || false;
        const saved = data?.saved || data?.hasSaved || false;
        // تثبيت العدادات إن وُجدت
        if (typeof data?.likesCount === 'number' || typeof data?.savesCount === 'number') {
          try {
            const event = new CustomEvent('article-interactions-init', {
              detail: {
                articleId,
                likes: data?.likesCount,
                saves: data?.savesCount
              }
            });
            window.dispatchEvent(event);
          } catch {}
        }
        
        setHasLiked(!!liked);
        setHasSaved(!!saved);
        
        console.log('✅ تم تحديث الحالة - إعجاب:', liked, 'حفظ:', saved);
      } else {
        console.error('❌ فشل في جلب حالة التفاعل:', response.status);
      }
    } catch (error) {
      console.error('❌ خطأ في جلب حالة التفاعل:', error);
    }
  };

  // تتبع التمرير
  const trackScroll = useCallback(
    debounce(() => {
      if (!sessionRef.current) return;

      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const scrollHeight = document.documentElement.scrollHeight;
      const clientHeight = document.documentElement.clientHeight;
      
      const scrollDepth = (scrollTop + clientHeight) / scrollHeight;
      maxScrollDepth.current = Math.max(maxScrollDepth.current, scrollDepth);

      // تحديد نوع التفاعل بناءً على عمق التمرير
      if (scrollDepth > 0.9) {
        sessionRef.current.interactionType = 'complete';
      } else if (scrollDepth > 0.7) {
        sessionRef.current.interactionType = 'engage';
      } else if (scrollDepth > 0.3) {
        sessionRef.current.interactionType = 'read';
      }

      sessionRef.current.scrollDepth = scrollDepth;
      sessionRef.current.maxScrollDepth = maxScrollDepth.current;

      // إرسال تحديث دوري
      sendScrollUpdate();
    }, 1000),
    []
  );

  // إرسال تحديث التمرير
  const sendScrollUpdate = async () => {
    if (!sessionRef.current || !user) return;

    await fetch('/api/interactions/scroll', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId: sessionRef.current.sessionId,
        scrollDepth: sessionRef.current.scrollDepth,
        maxScrollDepth: sessionRef.current.maxScrollDepth,
        interactionType: sessionRef.current.interactionType,
      }),
    });
  };

  // تتبع التمرير
  useEffect(() => {
    if (!isTracking) return;

    window.addEventListener('scroll', trackScroll);
    return () => {
      window.removeEventListener('scroll', trackScroll);
    };
  }, [isTracking, trackScroll]);

  // تتبع النقرات
  useEffect(() => {
    if (!isTracking) return;

    const trackClick = () => {
      if (sessionRef.current) {
        sessionRef.current.interactions.clickCount++;
        interactionCount.current++;
      }
    };

    document.addEventListener('click', trackClick);
    return () => {
      document.removeEventListener('click', trackClick);
    };
  }, [isTracking]);

  // إنهاء جلسة التتبع
  const endTrackingSession = async () => {
    if (!sessionRef.current || !user) return;

    const exitTime = Date.now();
    const duration = exitTime - sessionRef.current.enterTime;

    // حساب سرعة القراءة (كلمة/دقيقة)
    const wordCount = document.body.innerText.split(' ').length;
    const readingSpeed = (wordCount / (duration / 60000)).toFixed(0);

    const finalData = {
      ...sessionRef.current,
      exitTime,
      duration,
      readingSpeed: parseInt(readingSpeed),
    };

    await fetch('/api/interactions/session/end', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(finalData),
    });
  };

  // تبديل الإعجاب
  const toggleLike = async () => {
    if (!user || !articleId) return;

    const newLikeStatus = !hasLiked;
    setHasLiked(newLikeStatus);

    if (sessionRef.current) {
      sessionRef.current.interactions.liked = newLikeStatus;
    }

    try {
      console.log('👍 محاولة إعجاب بالمقال:', { articleId, like: newLikeStatus });
      
      const res = await fetch('/api/interactions/like', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth-token') || localStorage.getItem('sabq_at') || localStorage.getItem('access_token')}`
        },
        body: JSON.stringify({
          articleId,
          like: newLikeStatus,
        }),
      });
      
      const data = await res.json();
      console.log('📊 استجابة الإعجاب:', data);
      
      if (!res.ok) {
        console.error('❌ فشل الإعجاب:', data);
        setHasLiked(!newLikeStatus);
      } else {
        console.log('✅ تم الإعجاب بنجاح!');
        // إشعار نجاح
        if (window.showNotification) {
          window.showNotification({
            type: 'success',
            message: newLikeStatus ? 'تم الإعجاب بالمقال!' : 'تم إلغاء الإعجاب!',
            duration: 3000
          });
        }
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      setHasLiked(!newLikeStatus); // العودة للحالة السابقة
      // إشعار خطأ
      if (window.showNotification) {
        window.showNotification({
          type: 'error',
          message: 'حدث خطأ في الإعجاب. يرجى المحاولة مرة أخرى.',
          duration: 5000
        });
      }
    }
  };

  // تبديل الحفظ
  const toggleSave = async () => {
    if (!user || !articleId) return;

    const newSaveStatus = !hasSaved;
    setHasSaved(newSaveStatus);

    if (sessionRef.current) {
      sessionRef.current.interactions.saved = newSaveStatus;
    }

    try {
      console.log('🔄 محاولة حفظ المقال:', { articleId, saved: newSaveStatus });
      
      const res = await fetch('/api/bookmarks', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth-token') || localStorage.getItem('sabq_at') || localStorage.getItem('access_token')}`
        },
        body: JSON.stringify({
          articleId,
          saved: newSaveStatus,
        }),
      });
      
      const data = await res.json();
      console.log('📊 استجابة حفظ المقال:', data);
      
      if (!res.ok) {
        console.error('❌ فشل حفظ المقال:', data);
        setHasSaved(!newSaveStatus);
      } else {
        console.log('✅ تم حفظ المقال بنجاح!');
        // إشعار نجاح
        if (window.showNotification) {
          window.showNotification({
            type: 'success',
            message: newSaveStatus ? 'تم حفظ المقال!' : 'تم إلغاء حفظ المقال!',
            duration: 3000
          });
        }
      }
    } catch (error) {
      console.error('Error toggling save:', error);
      setHasSaved(!newSaveStatus);
      // إشعار خطأ
      if (window.showNotification) {
        window.showNotification({
          type: 'error',
          message: 'حدث خطأ في الحفظ. يرجى المحاولة مرة أخرى.',
          duration: 5000
        });
      }
    }
  };

  // تتبع المشاركة
  const trackShare = async (platform?: string) => {
    if (!user || !articleId) return;

    if (sessionRef.current) {
      sessionRef.current.interactions.shared = true;
    }

    await fetch('/api/interactions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        targetId: articleId,
        targetType: 'article',
        type: 'share',
        userId: user.id,
        metadata: { platform },
      }),
    });
  };

  // تتبع التعليق
  const trackComment = async () => {
    if (!user || !articleId) return;

    if (sessionRef.current) {
      sessionRef.current.interactions.commented = true;
    }
  };

  return {
    // حالات التفاعل
    hasLiked,
    hasSaved,
    
    // دوال التفاعل
    toggleLike,
    toggleSave,
    trackShare,
    trackComment,
    
    // معلومات الجلسة
    sessionData: sessionRef.current,
    isTracking,
    
    // إحصائيات
    stats: {
      scrollDepth: maxScrollDepth.current,
      interactionCount: interactionCount.current,
      sessionDuration: sessionRef.current 
        ? Date.now() - sessionRef.current.enterTime 
        : 0,
    },
  };
}

// دالة مساعدة لتحديد نوع الجهاز
function getDeviceType(): 'mobile' | 'tablet' | 'desktop' {
  const width = window.innerWidth;
  if (width < 768) return 'mobile';
  if (width < 1024) return 'tablet';
  return 'desktop';
} 

// مولد معرّف جلسة بطول 36
function cryptoRandomId() {
  try {
    return randomUUID();
  } catch {
    return `session-${Math.random().toString(36).slice(2, 10)}-${Date.now()}`.slice(0, 36);
  }
}