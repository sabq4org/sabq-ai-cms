'use client';

import PodcastBlock from '@/components/home/PodcastBlock';
import IntelligentPodcastBlock from '@/components/home/IntelligentPodcastBlock';
import { useEffect, useState } from 'react';

export default function TestPodcastPage() {
  const [apiData, setApiData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // اختبار API الجديد للبودكاست
    fetch('/api/podcast/episodes?limit=4')
      .then(res => res.json())
      .then(data => {
        console.log('New Podcast API Response:', data);
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
      <h1 className="text-3xl font-bold mb-8 text-center text-gray-900 dark:text-white">
        اختبار بلوك البودكاست الذكي الجديد
      </h1>
      
      {/* معلومات API */}
      <div className="max-w-4xl mx-auto mb-8">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">حالة API الجديد:</h2>
          {loading && <p className="text-gray-600 dark:text-gray-400">جاري التحميل...</p>}
          {error && <p className="text-red-600">خطأ: {error}</p>}
          {apiData && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-100 dark:bg-blue-900/30 p-4 rounded-lg">
                  <p className="font-semibold text-blue-900 dark:text-blue-300">عدد الحلقات</p>
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {apiData.episodes?.length || 0}
                  </p>
                </div>
                <div className="bg-green-100 dark:bg-green-900/30 p-4 rounded-lg">
                  <p className="font-semibold text-green-900 dark:text-green-300">الحالة</p>
                  <p className="text-sm font-bold text-green-600 dark:text-green-400">
                    {apiData.success ? '✅ نجح' : '❌ فشل'}
                  </p>
                </div>
                <div className="bg-purple-100 dark:bg-purple-900/30 p-4 rounded-lg">
                  <p className="font-semibold text-purple-900 dark:text-purple-300">هناك المزيد</p>
                  <p className="text-sm font-bold text-purple-600 dark:text-purple-400">
                    {apiData.hasMore ? '📡 نعم' : '🚫 لا'}
                  </p>
                </div>
              </div>
              <details className="bg-gray-100 dark:bg-gray-700 p-4 rounded">
                <summary className="cursor-pointer font-medium text-gray-900 dark:text-white">
                  عرض البيانات التفصيلية
                </summary>
                <pre className="mt-2 text-xs overflow-auto text-gray-800 dark:text-gray-200">
                  {JSON.stringify(apiData, null, 2)}
                </pre>
              </details>
            </div>
          )}
        </div>
      </div>

      {/* البلوك الذكي الجديد */}
      <div className="max-w-7xl mx-auto mb-8">
        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">🎙️ البلوك الذكي الجديد:</h2>
        <div className="border-2 border-dashed border-blue-400 p-4 rounded-lg bg-blue-50/50 dark:bg-blue-900/10">
          <IntelligentPodcastBlock />
        </div>
      </div>

      {/* البلوك القديم للمقارنة */}
      <div className="max-w-7xl mx-auto mb-8">
        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">📻 البلوك القديم (للمقارنة):</h2>
        <div className="border-2 border-dashed border-gray-400 p-4 rounded-lg bg-gray-50/50 dark:bg-gray-900/10">
          <PodcastBlock />
        </div>
      </div>

      {/* معلومات إضافية */}
      <div className="max-w-4xl mx-auto mt-8">
        <div className="bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/20 dark:to-purple-900/20 p-6 rounded-lg">
          <h3 className="font-semibold mb-2 text-gray-900 dark:text-white">🚀 الميزات الجديدة:</h3>
          <ul className="list-disc list-inside space-y-1 text-sm text-gray-700 dark:text-gray-300">
            <li>✨ أنيميشن متقدم مع Framer Motion</li>
            <li>🎵 مشغل صوت محسن مع أنيميشن الموجة</li>
            <li>📱 Mini Player عائم أسفل الصفحة</li>
            <li>🎨 تصميم حديث مع gradients وظلال</li>
            <li>⚡ API endpoint مخصص ومحسن</li>
            <li>📊 عرض إحصائيات مفصلة</li>
            <li>🌙 دعم كامل للوضع الليلي</li>
            <li>📱 تجاوب ممتاز مع جميع الأجهزة</li>
          </ul>
        </div>
      </div>

      {/* روابط التنقل */}
      <div className="max-w-4xl mx-auto mt-8">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 className="font-semibold mb-4 text-gray-900 dark:text-white">🔗 روابط مفيدة:</h3>
          <div className="flex flex-wrap gap-4">
            <a 
              href="/podcast" 
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              صفحة البودكاست الكاملة
            </a>
            <a 
              href="/" 
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              الصفحة الرئيسية
            </a>
            <a 
              href="/api/podcast/episodes" 
              className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
              target="_blank"
            >
              API البودكاست
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}