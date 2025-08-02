/**
 * مكون التحكم في عرض الواجهة
 * Width Controller Component
 *
 * يسمح للمستخدم بالتبديل بين العرض الكامل والعرض المحدود
 */

'use client';

import { Monitor, Smartphone } from 'lucide-react';
import { useEffect, useState } from 'react';

interface WidthControllerProps {
  onWidthChange?: (isFullWidth: boolean) => void;
  className?: string;
}

export default function WidthController({ onWidthChange, className = "" }: WidthControllerProps) {
  const [isFullWidth, setIsFullWidth] = useState(true);
  const [isVisible, setIsVisible] = useState(false);

  // التحقق من حجم الشاشة لإظهار المكون فقط على الديسكتوب
  useEffect(() => {
    const checkScreenSize = () => {
      const isDesktop = window.innerWidth >= 1280; // xl breakpoint
      setIsVisible(isDesktop);
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // حفظ إعداد المستخدم في localStorage
  useEffect(() => {
    const savedSetting = localStorage.getItem('dashboard-full-width');
    if (savedSetting !== null) {
      const fullWidth = savedSetting === 'true';
      setIsFullWidth(fullWidth);
      onWidthChange?.(fullWidth);
    }
  }, [onWidthChange]);

  const toggleWidth = () => {
    const newFullWidth = !isFullWidth;
    setIsFullWidth(newFullWidth);
    localStorage.setItem('dashboard-full-width', newFullWidth.toString());
    onWidthChange?.(newFullWidth);

    // تطبيق التغيير على عنصر الجسم
    document.documentElement.classList.toggle('full-width-dashboard', newFullWidth);
  };

  if (!isVisible) return null;

  return (
    <button
      onClick={toggleWidth}
      className={`
        fixed top-1/2 left-4 transform -translate-y-1/2 z-50
        bg-blue-600 hover:bg-blue-700 text-white
        p-3 rounded-lg shadow-lg hover:shadow-xl
        transition-all duration-200 hover:scale-105
        flex items-center justify-center
        group
        ${className}
      `}
      title={isFullWidth ? 'تبديل إلى العرض المحدود' : 'تبديل إلى العرض الكامل'}
      aria-label="تبديل عرض الواجهة"
    >
      {isFullWidth ? (
        <Smartphone size={20} className="group-hover:scale-110 transition-transform" />
      ) : (
        <Monitor size={20} className="group-hover:scale-110 transition-transform" />
      )}

      {/* تلميح نصي */}
      <span className="
        absolute left-full ml-3 px-3 py-2
        bg-gray-900 text-white text-sm rounded-lg
        opacity-0 group-hover:opacity-100
        transition-opacity duration-200
        whitespace-nowrap pointer-events-none
      ">
        {isFullWidth ? 'العرض المحدود' : 'العرض الكامل'}
      </span>
    </button>
  );
}

// Hook لاستخدام إعداد العرض في المكونات الأخرى
export function useWidthSetting() {
  const [isFullWidth, setIsFullWidth] = useState(true);

  useEffect(() => {
    const savedSetting = localStorage.getItem('dashboard-full-width');
    if (savedSetting !== null) {
      setIsFullWidth(savedSetting === 'true');
    }

    const handleStorageChange = () => {
      const currentSetting = localStorage.getItem('dashboard-full-width');
      if (currentSetting !== null) {
        setIsFullWidth(currentSetting === 'true');
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  return isFullWidth;
}
