'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCcw, Home } from 'lucide-react';

export default function ChunkLoadError() {
  useEffect(() => {
    // تسجيل الخطأ
    console.error('Chunk load error detected');
    
    // محاولة تنظيف الكاش
    if ('caches' in window) {
      caches.keys().then(names => {
        names.forEach(name => {
          caches.delete(name);
        });
      });
    }
  }, []);

  const handleReload = () => {
    // تنظيف الكاش وإعادة التحميل
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then(registrations => {
        registrations.forEach(registration => {
          registration.unregister();
        });
      });
    }
    
    // إعادة تحميل الصفحة مع تجاوز الكاش
    window.location.reload();
  };

  const handleHome = () => {
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="max-w-md w-full p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-xl">
        <div className="text-center">
          {/* أيقونة الخطأ */}
          <div className="mx-auto w-20 h-20 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mb-6">
            <AlertCircle className="w-10 h-10 text-red-600 dark:text-red-400" />
          </div>

          {/* العنوان */}
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            حدث خطأ في تحميل الصفحة
          </h1>

          {/* الوصف */}
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            نعتذر عن الإزعاج. يبدو أن هناك مشكلة في تحميل بعض ملفات الموقع. 
            يرجى تجربة إعادة تحميل الصفحة أو العودة للصفحة الرئيسية.
          </p>

          {/* الأزرار */}
          <div className="space-y-3">
            <Button
              onClick={handleReload}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center gap-2"
            >
              <RefreshCcw className="w-4 h-4" />
              إعادة تحميل الصفحة
            </Button>

            <Button
              onClick={handleHome}
              variant="outline"
              className="w-full flex items-center justify-center gap-2"
            >
              <Home className="w-4 h-4" />
              العودة للرئيسية
            </Button>
          </div>

          {/* معلومات إضافية */}
          <div className="mt-8 p-4 bg-gray-100 dark:bg-gray-700/50 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              <strong>نصيحة:</strong> إذا استمرت المشكلة، جرب:
            </p>
            <ul className="text-sm text-gray-600 dark:text-gray-400 mt-2 text-right list-disc list-inside">
              <li>مسح ملفات تعريف الارتباط وذاكرة التخزين المؤقت</li>
              <li>استخدام متصفح آخر</li>
              <li>التحقق من اتصال الإنترنت</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
} 