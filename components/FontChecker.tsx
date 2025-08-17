/**
 * 🔍 مكون فحص حالة الخطوط في صحيفة سبق
 * يعرض معلومات مفصلة عن الخطوط المستخدمة في الموقع
 */

'use client';

import { useEffect, useState } from 'react';

interface FontInfo {
  element: string;
  computedFont: string;
  expectedFont: string;
  isCorrect: boolean;
}

export default function FontChecker() {
  const [fontStatus, setFontStatus] = useState<FontInfo[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const checkFonts = () => {
      const elementsToCheck = [
        { selector: 'body', name: 'الجسم الرئيسي' },
        { selector: '.article-content', name: 'محتوى المقال' },
        { selector: '.article-title', name: 'عنوان المقال' },
        { selector: 'h1', name: 'العنوان الرئيسي' },
        { selector: 'h2', name: 'العنوان الثانوي' },
        { selector: 'p', name: 'الفقرة' },
        { selector: '.card-title', name: 'عنوان البطاقة' },
        { selector: '.prose', name: 'النص المنسق' },
      ];

      const results: FontInfo[] = [];
      const expectedFont = 'IBM Plex Sans Arabic';

      elementsToCheck.forEach(({ selector, name }) => {
        const element = document.querySelector(selector);
        if (element) {
          const computedStyle = window.getComputedStyle(element);
          const fontFamily = computedStyle.fontFamily;
          
          results.push({
            element: name,
            computedFont: fontFamily,
            expectedFont,
            isCorrect: fontFamily.includes('IBM Plex Sans Arabic')
          });
        }
      });

      setFontStatus(results);
      setIsLoaded(true);
    };

    // انتظار تحميل الخطوط
    setTimeout(checkFonts, 1000);
  }, []);

  if (!isLoaded) {
    return (
      <div className="p-6 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-yellow-700 dark:text-yellow-300">جاري فحص الخطوط...</span>
        </div>
      </div>
    );
  }

  const correctFonts = fontStatus.filter(f => f.isCorrect).length;
  const totalFonts = fontStatus.length;
  const percentage = Math.round((correctFonts / totalFonts) * 100);

  return (
    <div className="space-y-6">
      {/* إحصائيات سريعة */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">{correctFonts}</div>
          <div className="text-sm text-green-700 dark:text-green-300">عناصر صحيحة</div>
        </div>
        
        <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border border-red-200 dark:border-red-800">
          <div className="text-2xl font-bold text-red-600 dark:text-red-400">{totalFonts - correctFonts}</div>
          <div className="text-sm text-red-700 dark:text-red-300">عناصر تحتاج إصلاح</div>
        </div>
        
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{percentage}%</div>
          <div className="text-sm text-blue-700 dark:text-blue-300">نسبة التوافق</div>
        </div>
      </div>

      {/* حالة عامة */}
      <div className={`p-4 rounded-lg border ${
        percentage === 100 
          ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' 
          : percentage >= 80 
            ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800'
            : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
      }`}>
        <div className="flex items-center gap-2">
          {percentage === 100 ? (
            <>
              <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <span className="font-bold text-green-700 dark:text-green-300">ممتاز! جميع الخطوط تعمل بشكل صحيح</span>
            </>
          ) : percentage >= 80 ? (
            <>
              <div className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm">!</span>
              </div>
              <span className="font-bold text-yellow-700 dark:text-yellow-300">جيد - هناك بعض العناصر تحتاج إصلاح</span>
            </>
          ) : (
            <>
              <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm">✕</span>
              </div>
              <span className="font-bold text-red-700 dark:text-red-300">يحتاج إصلاح - عدة عناصر لا تستخدم الخط الصحيح</span>
            </>
          )}
        </div>
      </div>

      {/* تفاصيل العناصر */}
      <div className="space-y-2">
        <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">تفاصيل فحص العناصر</h3>
        
        {fontStatus.map((item, index) => (
          <div
            key={index}
            className={`p-3 rounded-lg border ${
              item.isCorrect
                ? 'bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-800'
                : 'bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`w-4 h-4 rounded-full ${
                  item.isCorrect ? 'bg-green-500' : 'bg-red-500'
                }`}></div>
                <span className="font-medium text-gray-900 dark:text-gray-100">{item.element}</span>
              </div>
              
              <div className={`text-sm px-2 py-1 rounded ${
                item.isCorrect
                  ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300'
                  : 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300'
              }`}>
                {item.isCorrect ? '✓ صحيح' : '✗ يحتاج إصلاح'}
              </div>
            </div>
            
            <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              <div><strong>الخط الحالي:</strong> {item.computedFont}</div>
              <div><strong>الخط المطلوب:</strong> {item.expectedFont}</div>
            </div>
          </div>
        ))}
      </div>

      {/* إرشادات الإصلاح */}
      {percentage < 100 && (
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
          <h4 className="font-bold text-blue-900 dark:text-blue-100 mb-2">خطوات الإصلاح:</h4>
          <ol className="text-sm text-blue-700 dark:text-blue-300 space-y-1 list-decimal list-inside">
            <li>تشغيل سكربت الإصلاح: <code className="bg-blue-100 dark:bg-blue-900/40 px-1 rounded">./fix-font-system.sh</code></li>
            <li>إعادة تشغيل الخادم: <code className="bg-blue-100 dark:bg-blue-900/40 px-1 rounded">npm run dev</code></li>
            <li>تحديث الصفحة وإعادة فحص الخطوط</li>
            <li>فحص الصفحات المختلفة للتأكد من التطبيق الصحيح</li>
          </ol>
        </div>
      )}

      {/* معلومات إضافية */}
      <div className="text-xs text-gray-500 dark:text-gray-400 pt-4 border-t">
        آخر فحص: {new Date().toLocaleString('ar-SA')}
      </div>
    </div>
  );
}
