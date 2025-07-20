'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useDarkModeContext } from '@/contexts/DarkModeContext';
import MobileNewsManagement from '@/components/mobile/MobileNewsManagement';

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

export default function ResponsiveNewsPage() {
  const isMobile = useIsMobile();
  const { darkMode } = useDarkModeContext();

  // عرض نسخة الموبايل المحسنة
  if (isMobile) {
    return <MobileNewsManagement />;
  }

  // عرض النسخة العادية للديسكتوب
  // يمكن استيراد المكون الأصلي هنا
  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="max-w-7xl mx-auto p-6">
        <div className={`text-center py-20 ${
          darkMode ? 'text-gray-400' : 'text-gray-600'
        }`}>
          <h2 className="text-2xl font-bold mb-4">إدارة الأخبار - نسخة الديسكتوب</h2>
          <p className="mb-4">يرجى استخدام نسخة الديسكتوب الكاملة لإدارة الأخبار</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            إعادة تحميل الصفحة
          </button>
        </div>
      </div>
    </div>
  );
}
