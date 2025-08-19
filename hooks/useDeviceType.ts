"use client";

import { useState, useEffect } from 'react';

export function useDeviceType() {
  const [deviceType, setDeviceType] = useState<'mobile' | 'desktop'>('desktop');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    const checkDevice = () => {
      const width = window.innerWidth;
      const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      
      // اعتبر الجهاز محمول إذا كانت الشاشة صغيرة أو إذا كان جهاز لمس صغير
      const isMobile = width < 768 || (isTouchDevice && width < 1024);
      setDeviceType(isMobile ? 'mobile' : 'desktop');
    };

    checkDevice();
    window.addEventListener('resize', checkDevice);

    return () => window.removeEventListener('resize', checkDevice);
  }, []);

  return {
    deviceType,
    isMobile: deviceType === 'mobile',
    isDesktop: deviceType === 'desktop',
    mounted
  };
}
