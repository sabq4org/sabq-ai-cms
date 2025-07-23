'use client';

import { createContext, useContext, useEffect, useState } from 'react';

interface ResponsiveContextType {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isLandscape: boolean;
  screenWidth: number;
  screenHeight: number;
}

const ResponsiveContext = createContext<ResponsiveContextType>({
  isMobile: false,
  isTablet: false,
  isDesktop: true,
  isLandscape: false,
  screenWidth: 1920,
  screenHeight: 1080,
});

export const useResponsive = () => useContext(ResponsiveContext);

export function ResponsiveProvider({ children }: { children: React.ReactNode }) {
  const [responsive, setResponsive] = useState<ResponsiveContextType>({
    isMobile: false,
    isTablet: false,
    isDesktop: true,
    isLandscape: false,
    screenWidth: typeof window !== 'undefined' ? window.innerWidth : 1920,
    screenHeight: typeof window !== 'undefined' ? window.innerHeight : 1080,
  });

  useEffect(() => {
    const updateResponsive = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      setResponsive({
        isMobile: width < 768,
        isTablet: width >= 768 && width < 1024,
        isDesktop: width >= 1024,
        isLandscape: width > height,
        screenWidth: width,
        screenHeight: height,
      });
    };

    updateResponsive();
    window.addEventListener('resize', updateResponsive);
    window.addEventListener('orientationchange', updateResponsive);

    return () => {
      window.removeEventListener('resize', updateResponsive);
      window.removeEventListener('orientationchange', updateResponsive);
    };
  }, []);

  return (
    <ResponsiveContext.Provider value={responsive}>
      {children}
    </ResponsiveContext.Provider>
  );
}
