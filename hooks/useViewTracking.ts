import { useEffect, useRef, useState } from "react";

interface UseViewTrackingOptions {
  articleId: string;
  threshold?: number; // النسبة المئوية للعرض المطلوبة (افتراضي: 50%)
  minTime?: number; // الحد الأدنى للوقت بالثواني (افتراضي: 5 ثواني)
  enabled?: boolean; // تفعيل/إلغاء التتبع
}

export function useViewTracking({
  articleId,
  threshold = 0.5,
  minTime = 5000, // 5 ثواني
  enabled = true,
}: UseViewTrackingOptions) {
  const [hasViewed, setHasViewed] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const [viewTime, setViewTime] = useState(0);
  const elementRef = useRef<HTMLElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const hasBeenViewed = useRef(false);

  // دالة لإرسال تحديث المشاهدة
  const incrementView = async () => {
    if (hasViewed || !enabled || !articleId) return;

    try {
      const response = await fetch(
        `/api/articles/${articleId}/increment-view`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        setHasViewed(true);
        console.log("تم تحديث عدد المشاهدات لمقال:", articleId);
      } else {
        console.warn("فشل في تحديث المشاهدات:", response.statusText);
      }
    } catch (error) {
      console.error("خطأ في تحديث المشاهدات:", error);
    }
  };

  // تتبع التفاعل باستخدام Intersection Observer
  useEffect(() => {
    if (!enabled || !elementRef.current || hasViewed) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;

        if (entry.isIntersecting && entry.intersectionRatio >= threshold) {
          setIsInView(true);
          startTimeRef.current = Date.now();

          // بدء العد التنازلي
          timerRef.current = setTimeout(() => {
            incrementView();
          }, minTime);
        } else {
          setIsInView(false);

          // إيقاف العد التنازلي إذا خرج المقال من العرض
          if (timerRef.current) {
            clearTimeout(timerRef.current);
            timerRef.current = null;
          }

          // حساب الوقت المنقضي
          if (startTimeRef.current) {
            const elapsed = Date.now() - startTimeRef.current;
            setViewTime((prev) => prev + elapsed);
            startTimeRef.current = null;
          }
        }
      },
      {
        threshold: threshold,
        rootMargin: "0px",
      }
    );

    observer.observe(elementRef.current);

    return () => {
      observer.disconnect();
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [articleId, threshold, minTime, enabled, hasViewed]);

  // تنظيف عند إلغاء التحميل
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  return {
    elementRef,
    hasViewed,
    isInView,
    viewTime: Math.floor(viewTime / 1000), // بالثواني
    incrementView: () => {
      if (!hasViewed) incrementView();
    },
  };
}
