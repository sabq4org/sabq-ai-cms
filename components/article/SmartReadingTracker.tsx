'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';

interface SmartReadingTrackerProps {
  articleId: string;
  className?: string;
}

/**
 * مكون تتبع القراءة الذكي
 * يتتبع وقت القراءة ونسبة التمرير ويمنح النقاط تلقائياً
 */
export default function SmartReadingTracker({ 
  articleId, 
  className = '' 
}: SmartReadingTrackerProps) {
  const { user } = useAuth();
  const [readingTime, setReadingTime] = useState(0);
  const [scrollPercentage, setScrollPercentage] = useState(0);
  const [hasTrackedView, setHasTrackedView] = useState(false);
  const [hasTrackedRead, setHasTrackedRead] = useState(false);
  const [hasTrackedLongRead, setHasTrackedLongRead] = useState(false);
  
  const startTimeRef = useRef<number>(Date.now());
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const isActiveRef = useRef(true);

  // تتبع وقت القراءة
  useEffect(() => {
    if (!user || !articleId) return;

    startTimeRef.current = Date.now();
    
    intervalRef.current = setInterval(() => {
      if (isActiveRef.current) {
        const currentTime = Math.floor((Date.now() - startTimeRef.current) / 1000);
        setReadingTime(currentTime);
      }
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [user, articleId]);

  // تتبع التمرير
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.pageYOffset;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const percentage = Math.min(100, Math.max(0, (scrollTop / docHeight) * 100));
      setScrollPercentage(percentage);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // تتبع النشاط (فقدان/استعادة التركيز)
  useEffect(() => {
    const handleVisibilityChange = () => {
      isActiveRef.current = !document.hidden;
      if (!document.hidden) {
        startTimeRef.current = Date.now() - (readingTime * 1000);
      }
    };

    const handleFocus = () => {
      isActiveRef.current = true;
      startTimeRef.current = Date.now() - (readingTime * 1000);
    };

    const handleBlur = () => {
      isActiveRef.current = false;
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);
    window.addEventListener('blur', handleBlur);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('blur', handleBlur);
    };
  }, [readingTime]);

  // تسجيل المشاهدة (فوري)
  useEffect(() => {
    if (user && articleId && !hasTrackedView) {
      trackInteraction('view', {
        timestamp: new Date().toISOString()
      });
      setHasTrackedView(true);
    }
  }, [user, articleId, hasTrackedView]);

  // تسجيل القراءة (بعد 30 ثانية)
  useEffect(() => {
    if (readingTime >= 30 && !hasTrackedRead && scrollPercentage > 10) {
      trackInteraction('read', {
        readingTime,
        scrollPercentage,
        timestamp: new Date().toISOString()
      });
      setHasTrackedRead(true);
    }
  }, [readingTime, scrollPercentage, hasTrackedRead]);

  // تسجيل القراءة الطويلة (بعد 60 ثانية)
  useEffect(() => {
    if (readingTime >= 60 && !hasTrackedLongRead && scrollPercentage > 25) {
      trackInteraction('read_long', {
        readingTime,
        scrollPercentage,
        timestamp: new Date().toISOString()
      });
      setHasTrackedLongRead(true);
    }
  }, [readingTime, scrollPercentage, hasTrackedLongRead]);

  const trackInteraction = async (interactionType: string, metadata: any) => {
    if (!user || !articleId) return;

    try {
      console.log(`📖 تتبع ${interactionType}:`, { articleId, readingTime, scrollPercentage });
      
      const response = await fetch('/api/unified-tracking', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          articleId,
          interactionType,
          metadata: {
            ...metadata,
            userAgent: navigator.userAgent,
            deviceType: /Mobile|Android|iPhone|iPad/.test(navigator.userAgent) ? 'mobile' : 'desktop'
          }
        }),
      });

      const data = await response.json();
      
      if (response.ok && data.success) {
        console.log(`✅ تم تسجيل ${interactionType}:`, data);
        
        // إظهار إشعار للنقاط المكتسبة (اختياري)
        if (data.pointsAwarded > 0 && interactionType !== 'view') {
          showPointsNotification(data.pointsAwarded, data.message);
        }
      } else {
        console.warn(`⚠️ فشل تسجيل ${interactionType}:`, data);
      }
    } catch (error) {
      console.error(`❌ خطأ في تسجيل ${interactionType}:`, error);
    }
  };

  const showPointsNotification = (points: number, message: string) => {
    // إنشاء إشعار مؤقت
    const notification = document.createElement('div');
    notification.className = 'fixed top-20 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 transform translate-x-full transition-transform duration-300';
    notification.innerHTML = `
      <div class="flex items-center gap-2">
        <span class="text-lg">🎯</span>
        <span class="font-medium">+${points} نقطة!</span>
      </div>
      <div class="text-xs opacity-90">${message}</div>
    `;
    
    document.body.appendChild(notification);
    
    // إظهار الإشعار
    setTimeout(() => {
      notification.classList.remove('translate-x-full');
    }, 100);
    
    // إخفاء الإشعار بعد 3 ثواني
    setTimeout(() => {
      notification.classList.add('translate-x-full');
      setTimeout(() => {
        document.body.removeChild(notification);
      }, 300);
    }, 3000);
  };

  // عرض مؤشر التقدم (اختياري)
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  if (!user) return null;

  return (
    <div className={`reading-tracker ${className}`}>
      {/* مؤشر التقدم (مخفي افتراضياً، يمكن إظهاره للتطوير) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed bottom-4 left-4 bg-black bg-opacity-75 text-white px-3 py-2 rounded-lg text-xs z-50">
          <div>⏱️ {formatTime(readingTime)}</div>
          <div>📊 {scrollPercentage.toFixed(0)}%</div>
          <div className="flex gap-2 mt-1">
            {hasTrackedView && <span className="text-green-400">👁️</span>}
            {hasTrackedRead && <span className="text-blue-400">📖</span>}
            {hasTrackedLongRead && <span className="text-purple-400">📚</span>}
          </div>
        </div>
      )}
      
      {/* شريط التقدم في القراءة */}
      <div className="fixed top-0 left-0 w-full h-1 bg-gray-200 z-40">
        <div 
          className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300"
          style={{ width: `${scrollPercentage}%` }}
        />
      </div>
    </div>
  );
}
