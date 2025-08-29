'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

/**
 * صفحة إنشاء خبر جديد
 * تعيد التوجيه مباشرة إلى صفحة المحرر الموحد
 */
export default function CreateNewsPage() {
  const router = useRouter();

  useEffect(() => {
    // إعادة توجيه فورية إلى صفحة المحرر الموحد
    router.replace('/admin/news/unified');
  }, [router]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600 dark:text-gray-400">
          جاري التوجيه إلى محرر الأخبار...
        </p>
      </div>
    </div>
  );
}

