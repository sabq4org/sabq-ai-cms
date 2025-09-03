'use client';

import { useDarkModeContext } from '@/contexts/DarkModeContext';
import { useState, useEffect } from 'react';

export default function TestMobileSidebarPage() {
  const { darkMode } = useDarkModeContext();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'} py-8`}>
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-900 dark:text-white">
          اختبار إصلاح القائمة الجانبية للموبايل
        </h1>

        {/* معلومات الجهاز */}
        <div className="mb-8 p-6 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
          <h2 className="text-lg font-semibold mb-4 text-blue-900 dark:text-blue-300">
            معلومات الجهاز 📱
          </h2>
          <p className="text-blue-800 dark:text-blue-200">
            {isMobile ? '✅ أنت تستخدم جهاز محمول' : '💻 أنت تستخدم جهاز سطح المكتب'}
          </p>
          <p className="text-sm text-blue-700 dark:text-blue-300 mt-2">
            عرض الشاشة: {typeof window !== 'undefined' ? window.innerWidth : 'غير معروف'}px
          </p>
        </div>

        {/* تعليمات الاختبار */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
            <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">
              خطوات الاختبار على الموبايل 📋
            </h2>
            <ol className="space-y-4 text-gray-600 dark:text-gray-300">
              <li className="flex items-start gap-3">
                <span className="text-2xl">1️⃣</span>
                <div>
                  <strong>افتح القائمة الجانبية (☰)</strong>
                  <p className="text-sm mt-1">يجب أن تحتوي فقط على: الرئيسية، اللحظة بلحظة، الأخبار، التحليل العميق، مقالات الرأي، الميديا</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-2xl">2️⃣</span>
                <div>
                  <strong>لا يجب أن تحتوي على</strong>
                  <p className="text-sm mt-1 text-red-600 dark:text-red-400">❌ الملف الشخصي، رحلتي المعرفية، المحفوظات، الإعدادات</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-2xl">3️⃣</span>
                <div>
                  <strong>انقر على أيقونة المستخدم (👤)</strong>
                  <p className="text-sm mt-1">يجب أن تظهر قائمة منسدلة تحتوي على العناصر الشخصية</p>
                </div>
              </li>
            </ol>
          </div>

          {/* ما تم إصلاحه */}
          <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-6">
            <h3 className="text-lg font-semibold mb-4 text-green-900 dark:text-green-300">
              ✅ ما تم إصلاحه
            </h3>
            <ul className="space-y-2 text-green-800 dark:text-green-200">
              <li>• إزالة العناصر الشخصية من Header.tsx</li>
              <li>• تفعيل MobileHeaderEnhanced للموبايل في ConditionalHeader</li>
              <li>• القائمة الجانبية الآن نظيفة وتحتوي فقط على أقسام الموقع</li>
              <li>• العناصر الشخصية في قائمة منسدلة منفصلة</li>
            </ul>
          </div>

          {/* مقارنة قبل وبعد */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-4 text-red-900 dark:text-red-300">
                ❌ قبل (خطأ)
              </h3>
              <p className="text-sm text-red-700 dark:text-red-300">
                القائمة الجانبية تحتوي على كل شيء: أقسام الموقع + العناصر الشخصية
              </p>
            </div>
            
            <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-4 text-green-900 dark:text-green-300">
                ✅ بعد (صحيح)
              </h3>
              <p className="text-sm text-green-700 dark:text-green-300">
                القائمة الجانبية: أقسام الموقع فقط<br />
                قائمة المستخدم: العناصر الشخصية
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
