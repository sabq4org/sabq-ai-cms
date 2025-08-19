"use client";

import { useState, useEffect, useCallback } from 'react';

export function useDeviceType() {
  const [deviceType, setDeviceType] = useState<'mobile' | 'desktop'>('desktop');
  const [mounted, setMounted] = useState(false);

  // تحسين الأداء بـ useCallback و debounce
  const checkDevice = useCallback(() => {
    const width = window.innerWidth;
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    
    // اعتبر الجهاز محمول إذا كانت الشاشة صغيرة أو إذا كان جهاز لمس صغير
    const isMobile = width < 768 || (isTouchDevice && width < 1024);
    const newDeviceType = isMobile ? 'mobile' : 'desktop';
    
    // تحديث فقط إذا تغير نوع الجهاز
    setDeviceType(prev => prev !== newDeviceType ? newDeviceType : prev);
  }, []);

  useEffect(() => {
    setMounted(true);
    checkDevice();

    // debounce للتحسين من الأداء
    let timeoutId: NodeJS.Timeout;
    const debouncedResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(checkDevice, 150);
    };

    window.addEventListener('resize', debouncedResize, { passive: true });

    return () => {
      window.removeEventListener('resize', debouncedResize);
      clearTimeout(timeoutId);
    };
  }, [checkDevice]);

  return {
    deviceType,
    isMobile: deviceType === 'mobile',
    isDesktop: deviceType === 'desktop',
    mounted
  };
}
