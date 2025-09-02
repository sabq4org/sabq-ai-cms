'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

// ملاحظة: هذه الصفحة أصبحت قديمة
// يجب استخدام صفحة الإعدادات الموحدة /dashboard/settings/ai-settings
export default function DeepAnalysisSettingsPage() {
  const router = useRouter();

  useEffect(() => {
    // إعادة توجيه إلى صفحة الإعدادات الموحدة
    toast((t) => (
      <div>
        <p className="font-medium mb-1">تم نقل الإعدادات</p>
        <p className="text-sm text-gray-600">يتم توجيهك إلى صفحة الإعدادات الموحدة...</p>
      </div>
    ), {
      duration: 3000,
      icon: '🔄'
    });
    
    setTimeout(() => {
      router.push('/dashboard/settings/ai-settings');
    }, 1500);
  }, [router]);

  return (
    <div className={`p-8 transition-colors duration-300 ${darkMode ? 'bg-gray-900' : ''}`}>
      <div className="max-w-2xl mx-auto">
        <div className={`rounded-2xl p-8 shadow-sm border text-center ${
          darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'
        }`}>
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <h2 className={`text-xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
            جاري التوجيه...
          </h2>
          <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            يتم توجيهك إلى صفحة الإعدادات الموحدة
          </p>
        </div>
      </div>
    </div>
  );
}