import { useEffect, useRef, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface ReadingSessionOptions {
  articleId: string;
  onSessionEnd?: (duration: number, percentage: number) => void;
}

export function useReadingSession({ articleId, onSessionEnd }: ReadingSessionOptions) {
  const { user } = useAuth();
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const scrollDepthRef = useRef(0);
  const readPercentageRef = useRef(0);
  const sessionIdRef = useRef<string | null>(null);

  // بدء جلسة القراءة
  const startSession = async () => {
    if (!user?.id || isTracking) return;

    try {
      const response = await fetch('/api/user/reading-sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          articleId,
          deviceType: getDeviceType(),
          timeOfDay: new Date().getHours()
        })
      });

      if (response.ok) {
        const data = await response.json();
        setSessionId(data.sessionId);
        sessionIdRef.current = data.sessionId;
        setStartTime(new Date());
        setIsTracking(true);
      }
    } catch (error) {
      console.error('Error starting reading session:', error);
    }
  };

  // إنهاء جلسة القراءة
  const endSession = async () => {
    if (!sessionIdRef.current || !startTime) return;

    const duration = Math.floor((new Date().getTime() - startTime.getTime()) / 1000);
    const percentage = readPercentageRef.current;
    const scrollDepth = scrollDepthRef.current;

    try {
      await fetch(`/api/user/reading-sessions/${sessionIdRef.current}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          duration,
          readPercentage: percentage,
          scrollDepth
        })
      });

      onSessionEnd?.(duration, percentage);
    } catch (error) {
      console.error('Error ending reading session:', error);
    } finally {
      setIsTracking(false);
      setSessionId(null);
      sessionIdRef.current = null;
      setStartTime(null);
    }
  };

  // تتبع التمرير ونسبة القراءة
  const updateProgress = (scrollPercentage: number, readPercentage: number) => {
    scrollDepthRef.current = Math.max(scrollDepthRef.current, scrollPercentage);
    readPercentageRef.current = Math.max(readPercentageRef.current, readPercentage);
  };

  // تنظيف عند مغادرة الصفحة
  useEffect(() => {
    startSession();

    const handleBeforeUnload = () => {
      endSession();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      endSession();
    };
  }, [articleId, user?.id]);

  // تتبع التمرير
  useEffect(() => {
    if (!isTracking) return;

    const handleScroll = () => {
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      
      const scrollPercentage = (scrollTop / (documentHeight - windowHeight)) * 100;
      
      // حساب نسبة القراءة التقريبية بناءً على التمرير
      const readPercentage = Math.min(scrollPercentage * 0.9, 100); // افتراض أن 90% من التمرير = قراءة كاملة
      
      updateProgress(scrollPercentage, readPercentage);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isTracking]);

  return {
    sessionId,
    isTracking,
    startTime,
    endSession,
    updateProgress
  };
}

// دالة مساعدة لتحديد نوع الجهاز
function getDeviceType(): string {
  const width = window.innerWidth;
  if (width < 768) return 'mobile';
  if (width < 1024) return 'tablet';
  return 'desktop';
} 