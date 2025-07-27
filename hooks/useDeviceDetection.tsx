/**
 * 🎯 نظام الكشف الذكي للأجهزة وتوجيه المستخدمين
 * يقوم بتحديد نوع الجهاز وتوجيه المستخدم للواجهة المناسبة
 */

"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface DeviceInfo {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  screenWidth: number;
  userAgent: string;
  touchEnabled: boolean;
}

export function useDeviceDetection(): DeviceInfo {
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo>({
    isMobile: false,
    isTablet: false,
    isDesktop: true,
    screenWidth: 1920,
    userAgent: '',
    touchEnabled: false
  });

  useEffect(() => {
    const detectDevice = () => {
      const userAgent = navigator.userAgent;
      const screenWidth = window.innerWidth;
      const touchEnabled = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

      // تحديد نوع الجهاز بناءً على عرض الشاشة و User Agent
      const isMobile = screenWidth < 768 || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
      const isTablet = screenWidth >= 768 && screenWidth < 1024 && touchEnabled;
      const isDesktop = screenWidth >= 1024 && !touchEnabled;

      // تحديث معلومات الجهاز
      setDeviceInfo({
        isMobile: isMobile && !isTablet,
        isTablet,
        isDesktop: !isMobile && !isTablet,
        screenWidth,
        userAgent,
        touchEnabled
      });

      // إضافة كلاسات CSS للجسم
      document.body.className = document.body.className.replace(
        /device-(mobile|tablet|desktop)/g, 
        ''
      );
      
      if (isMobile && !isTablet) {
        document.body.classList.add('device-mobile');
      } else if (isTablet) {
        document.body.classList.add('device-tablet');
      } else {
        document.body.classList.add('device-desktop');
      }
    };

    detectDevice();
    window.addEventListener('resize', detectDevice);
    
    return () => window.removeEventListener('resize', detectDevice);
  }, []);

  return deviceInfo;
}

export function SmartDeviceRedirect({ children }: { children: React.ReactNode }) {
  const deviceInfo = useDeviceDetection();
  const router = useRouter();
  const [hasRedirected, setHasRedirected] = useState(false);

  useEffect(() => {
    if (hasRedirected) return;

    const currentPath = window.location.pathname;
    
    // تجنب التوجيه المتكرر
    if (currentPath.startsWith('/mobile/') || currentPath.startsWith('/tablet/')) {
      setHasRedirected(true);
      return;
    }

    // توجيه المستخدمين حسب نوع الجهاز
    if (deviceInfo.isMobile && !currentPath.startsWith('/mobile/')) {
      // توجيه لوحة التحكم للهاتف
      if (currentPath === '/admin' || currentPath === '/dashboard') {
        router.push('/mobile/dashboard');
        setHasRedirected(true);
        return;
      }
      
      // توجيه صفحات أخرى للنسخة المحمولة
      const mobilePath = `/mobile${currentPath}`;
      router.push(mobilePath);
      setHasRedirected(true);
    } else if (deviceInfo.isTablet && !currentPath.startsWith('/tablet/')) {
      // توجيه للنسخة المخصصة للتابلت (اختياري)
      const tabletPath = `/tablet${currentPath}`;
      // يمكن إنشاء نسخة تابلت منفصلة أو استخدام النسخة العادية
      setHasRedirected(true);
    } else {
      setHasRedirected(true);
    }
  }, [deviceInfo, router, hasRedirected]);

  return <>{children}</>;
}

// مكون لعرض معلومات الجهاز (للتطوير والاختبار)
export function DeviceInfoDisplay() {
  const deviceInfo = useDeviceDetection();

  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 bg-black/80 text-white p-2 rounded-lg text-xs z-50">
      <div>نوع الجهاز: {deviceInfo.isMobile ? 'هاتف' : deviceInfo.isTablet ? 'تابلت' : 'سطح مكتب'}</div>
      <div>عرض الشاشة: {deviceInfo.screenWidth}px</div>
      <div>اللمس: {deviceInfo.touchEnabled ? 'مدعوم' : 'غير مدعوم'}</div>
    </div>
  );
}

// دالة مساعدة للتحقق من نوع الجهاز في الخادم
export function getDeviceTypeFromUserAgent(userAgent: string): 'mobile' | 'tablet' | 'desktop' {
  const mobileRegex = /Android|webOS|iPhone|iPod|BlackBerry|IEMobile|Opera Mini/i;
  const tabletRegex = /iPad|Android(?=.*\bMobile\b)(?=.*\bSafari\b)|KFAPWI|Kindle/i;
  
  if (mobileRegex.test(userAgent) && !tabletRegex.test(userAgent)) {
    return 'mobile';
  } else if (tabletRegex.test(userAgent)) {
    return 'tablet';
  } else {
    return 'desktop';
  }
}

// كلاسات CSS مساعدة للاستجابة
export const responsiveClasses = {
  mobile: {
    container: 'max-w-full px-4 py-2',
    text: 'text-sm',
    button: 'h-12 px-4 text-base',
    card: 'rounded-lg shadow-md',
    spacing: 'space-y-3'
  },
  tablet: {
    container: 'max-w-4xl mx-auto px-6 py-4',
    text: 'text-base',
    button: 'h-10 px-6 text-sm',
    card: 'rounded-xl shadow-lg',
    spacing: 'space-y-4'
  },
  desktop: {
    container: 'max-w-6xl mx-auto px-8 py-6',
    text: 'text-base',
    button: 'h-10 px-6 text-sm',
    card: 'rounded-xl shadow-lg',
    spacing: 'space-y-6'
  }
};

export default SmartDeviceRedirect;
