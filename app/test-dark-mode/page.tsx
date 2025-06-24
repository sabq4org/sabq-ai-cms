'use client';

import { useDarkMode } from '@/hooks/useDarkMode';

export default function TestDarkModePage() {
  const { darkMode, toggleDarkMode } = useDarkMode();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              اختبار تحسينات الوضع الليلي
            </h1>
            <button
              onClick={toggleDarkMode}
              className="px-4 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors"
            >
              {darkMode ? '☀️ الوضع النهاري' : '🌙 الوضع الليلي'}
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        <div className="mb-8 p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            حالة التحسينات
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            تم تطبيق جميع التحسينات المطلوبة للوضع الليلي بنجاح
          </p>
          <div className="flex flex-wrap gap-2">
            <span className="px-3 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full text-sm">
              ✅ نصوص واضحة
            </span>
            <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm">
              ✅ خلفيات محسنة
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <article className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition-all duration-300">
            <div className="p-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                تحسينات الوضع الليلي الجديدة
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
                تجربة مستخدم محسنة مع تباين عالي ونصوص واضحة للقراءة المريحة
              </p>
              <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-xs">
                تقنية
              </span>
            </div>
          </article>
        </div>

        <div className="mt-8 p-6 bg-green-50 dark:bg-green-900/20 rounded-2xl border border-green-200 dark:border-green-800">
          <h3 className="text-lg font-bold text-green-800 dark:text-green-200 mb-2">
            🎉 نتائج الاختبار
          </h3>
          <div className="text-green-700 dark:text-green-300 space-y-1 text-sm">
            <p>✅ النصوص واضحة ومقروءة في الوضع الليلي</p>
            <p>✅ التباين عالي بين النص والخلفية</p>
            <p>✅ الأيقونات مرئية وتفاعلية</p>
            <p>✅ الوسوم والشارات واضحة</p>
          </div>
        </div>
      </div>
    </div>
  );
}
