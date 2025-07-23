'use client';

import { useState, useEffect } from 'react';

interface BreakpointConfig {
  mobile: number;
  tablet: number;
  desktop: number;
}

interface UseResponsiveResult {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isLandscape: boolean;
  width: number;
  height: number;
  breakpoint: 'mobile' | 'tablet' | 'desktop';
}

const defaultBreakpoints: BreakpointConfig = {
  mobile: 768,
  tablet: 1024,
  desktop: 1200
};

export function useResponsive(customBreakpoints?: Partial<BreakpointConfig>): UseResponsiveResult {
  const breakpoints = { ...defaultBreakpoints, ...customBreakpoints };
  
  const [dimensions, setDimensions] = useState<{
    width: number;
    height: number;
  }>({
    width: typeof window !== 'undefined' ? window.innerWidth : 1200,
    height: typeof window !== 'undefined' ? window.innerHeight : 800,
  });

  useEffect(() => {
    const handleResize = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    // إضافة مؤقت لتجنب كثرة التحديثات
    let timeoutId: NodeJS.Timeout;
    const debouncedHandleResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(handleResize, 150);
    };

    window.addEventListener('resize', debouncedHandleResize);
    window.addEventListener('orientationchange', debouncedHandleResize);

    return () => {
      window.removeEventListener('resize', debouncedHandleResize);
      window.removeEventListener('orientationchange', debouncedHandleResize);
      clearTimeout(timeoutId);
    };
  }, []);

  const { width, height } = dimensions;
  
  const isMobile = width < breakpoints.mobile;
  const isTablet = width >= breakpoints.mobile && width < breakpoints.tablet;
  const isDesktop = width >= breakpoints.tablet;
  const isLandscape = width > height;

  let breakpoint: 'mobile' | 'tablet' | 'desktop';
  if (isMobile) breakpoint = 'mobile';
  else if (isTablet) breakpoint = 'tablet';
  else breakpoint = 'desktop';

  return {
    isMobile,
    isTablet,
    isDesktop,
    isLandscape,
    width,
    height,
    breakpoint
  };
}

// Hook للكشف عن دعم اللمس
export function useTouchSupport(): boolean {
  const [hasTouch, setHasTouch] = useState(false);

  useEffect(() => {
    const checkTouch = () => {
      return 'ontouchstart' in window || 
             navigator.maxTouchPoints > 0 || 
             // @ts-ignore
             navigator.msMaxTouchPoints > 0;
    };

    setHasTouch(checkTouch());
  }, []);

  return hasTouch;
}

// Hook لكشف الوضع الليلي
export function useDarkMode(): {
  isDark: boolean;
  toggleDark: () => void;
  setDark: (dark: boolean) => void;
} {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // فحص الإعداد المحفوظ
    const saved = localStorage.getItem('dark-mode');
    if (saved) {
      setIsDark(JSON.parse(saved));
    } else {
      // فحص تفضيل النظام
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      setIsDark(mediaQuery.matches);
      
      const handleChange = (e: MediaQueryListEvent) => {
        setIsDark(e.matches);
      };
      
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
    localStorage.setItem('dark-mode', JSON.stringify(isDark));
  }, [isDark]);

  const toggleDark = () => setIsDark(!isDark);
  const setDark = (dark: boolean) => setIsDark(dark);

  return { isDark, toggleDark, setDark };
}

// Hook لكشف الاتصال بالإنترنت
export function useNetworkStatus(): {
  isOnline: boolean;
  isSlowConnection: boolean;
} {
  const [isOnline, setIsOnline] = useState(true);
  const [isSlowConnection, setIsSlowConnection] = useState(false);

  useEffect(() => {
    const updateOnlineStatus = () => {
      setIsOnline(navigator.onLine);
    };

    const checkConnectionSpeed = () => {
      // @ts-ignore
      const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
      if (connection) {
        const slowTypes = ['slow-2g', '2g', '3g'];
        setIsSlowConnection(slowTypes.includes(connection.effectiveType));
      }
    };

    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);
    
    // فحص سرعة الاتصال إذا كان مدعوماً
    checkConnectionSpeed();

    return () => {
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOnlineStatus);
    };
  }, []);

  return { isOnline, isSlowConnection };
}

// Hook لكشف حركة المستخدم
export function useUserActivity(timeout: number = 30000): {
  isActive: boolean;
  lastActivity: Date | null;
} {
  const [isActive, setIsActive] = useState(true);
  const [lastActivity, setLastActivity] = useState<Date | null>(new Date());

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const handleActivity = () => {
      setIsActive(true);
      setLastActivity(new Date());
      
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        setIsActive(false);
      }, timeout);
    };

    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    events.forEach(event => {
      document.addEventListener(event, handleActivity, true);
    });

    // بدء المؤقت
    handleActivity();

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleActivity, true);
      });
      clearTimeout(timeoutId);
    };
  }, [timeout]);

  return { isActive, lastActivity };
}

// Hook لحفظ حالة التمرير
export function useScrollPosition(): {
  scrollY: number;
  scrollX: number;
  isScrolling: boolean;
  scrollDirection: 'up' | 'down' | null;
} {
  const [scrollPosition, setScrollPosition] = useState({
    scrollY: 0,
    scrollX: 0,
    isScrolling: false,
    scrollDirection: null as 'up' | 'down' | null
  });

  useEffect(() => {
    let lastScrollY = window.scrollY;
    let timeoutId: NodeJS.Timeout;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const currentScrollX = window.scrollX;
      
      setScrollPosition(prev => ({
        scrollY: currentScrollY,
        scrollX: currentScrollX,
        isScrolling: true,
        scrollDirection: currentScrollY > lastScrollY ? 'down' : 'up'
      }));

      lastScrollY = currentScrollY;

      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        setScrollPosition(prev => ({
          ...prev,
          isScrolling: false
        }));
      }, 150);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(timeoutId);
    };
  }, []);

  return scrollPosition;
}
