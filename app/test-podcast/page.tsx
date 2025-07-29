'use client';

import PodcastBlock from '@/components/home/PodcastBlock';
import { useEffect, useState } from 'react';

export default function TestPodcastPage() {
  const [apiData, setApiData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // اختبار API مباشرة
    fetch('/api/audio/newsletters/main-page')
      .then(res => res.json())
      .then(data => {
        console.log('API Response:', data);
        setApiData(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('API Error:', err);
        setError(err.message);
        setLoading(false);
      });
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <h1 className="text-3xl font-bold mb-8 text-center">اختبار بلوك النشرة الصوتية</h1>
      
      {/* معلومات API */}
      <div className="max-w-4xl mx-auto mb-8">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">حالة API:</h2>
          {loading && <p>جاري التحميل...</p>}
          {error && <p className="text-red-600">خطأ: {error}</p>}
          {apiData && (
            <pre className="bg-gray-100 dark:bg-gray-700 p-4 rounded overflow-auto text-sm">
              {JSON.stringify(apiData, null, 2)}
            </pre>
          )}
        </div>
      </div>

      {/* البلوك الفعلي */}
      <div className="max-w-7xl mx-auto">
        <h2 className="text-xl font-semibold mb-4">البلوك:</h2>
        <div className="border-2 border-dashed border-purple-400 p-4 rounded-lg">
          <PodcastBlock />
        </div>
      </div>

      {/* معلومات إضافية */}
      <div className="max-w-4xl mx-auto mt-8">
        <div className="bg-yellow-100 dark:bg-yellow-900/20 p-6 rounded-lg">
          <h3 className="font-semibold mb-2">ملاحظات:</h3>
          <ul className="list-disc list-inside space-y-1 text-sm">
            <li>إذا لم يظهر البلوك، تحقق من وجود نشرة بـ is_main_page = true و is_published = true</li>
            <li>البلوك يعود null إذا لم توجد نشرة أو في حالة التحميل</li>
            <li>تحقق من console للمزيد من المعلومات</li>
          </ul>
        </div>
      </div>
    </div>
  );
} 