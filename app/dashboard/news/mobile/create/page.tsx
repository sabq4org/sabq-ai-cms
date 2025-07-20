'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useDarkModeContext } from '@/contexts/DarkModeContext';
import MobileNewsForm from '@/components/mobile/MobileNewsForm';

// Hook لاكتشاف الموبايل
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkDevice = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkDevice();
    window.addEventListener('resize', checkDevice);
    return () => window.removeEventListener('resize', checkDevice);
  }, []);

  return isMobile;
}

export default function ResponsiveNewsCreatePage() {
  const isMobile = useIsMobile();
  const { darkMode } = useDarkModeContext();
  const router = useRouter();

  // عرض نسخة الموبايل المحسنة
  if (isMobile) {
    return <MobileNewsForm />;
  }

  // توجيه لنسخة الديسكتوب المحسنة
  useEffect(() => {
    if (!isMobile) {
      router.push('/dashboard/news/unified');
    }
  }, [isMobile, router]);

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="max-w-7xl mx-auto p-6">
        <div className={`text-center py-20 ${
          darkMode ? 'text-gray-400' : 'text-gray-600'
        }`}>
          <h2 className="text-2xl font-bold mb-4">إنشاء مقال جديد</h2>
          <p className="mb-4">جاري التوجيه إلى نسخة الديسكتوب المحسنة...</p>
          <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
        </div>
      </div>
    </div>
  );
}
