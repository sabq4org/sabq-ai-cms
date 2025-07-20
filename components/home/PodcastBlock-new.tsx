'use client';

import { useState, useEffect } from 'react';
import { Headphones, CheckCircle, Clock, Mic } from 'lucide-react';

interface PodcastData {
  link: string;
  timestamp: string;
  duration: number;
}

export default function PodcastBlock() {
  const [podcast, setPodcast] = useState<PodcastData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetchLatestPodcast();
  }, []);

  const fetchLatestPodcast = async () => {
    try {
      setError(false);
      // جلب آخر نشرة مميزة من النشرات الصوتية
      const res = await fetch('/api/audio/newsletters/featured');
      
      if (!res.ok) {
        console.error('Failed to fetch podcast:', res.status, res.statusText);
        setError(true);
        return;
      }
      
      const data = await res.json();
      
      // التحقق من وجود البيانات بشكل آمن
      if (data?.success && data?.newsletter) {
        const newsletter = data.newsletter;
        const link = newsletter?.url || newsletter?.audioUrl;
        const timestamp = newsletter?.created_at;
        const duration = newsletter?.duration || 3;
        
        // التحقق من البيانات المطلوبة
        if (link && timestamp) {
          setPodcast({
            link,
            timestamp,
            duration
          });
        } else {
          console.warn('Newsletter data incomplete:', newsletter);
          setError(true);
        }
      } else {
        console.log('No newsletter available');
        // لا نعتبرها خطأ، فقط لا توجد نشرة
      }
    } catch (err) {
      console.error('Error fetching podcast:', err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  const formatRelativeTime = (timestamp: string): string => {
    try {
      const date = new Date(timestamp);
      const now = new Date();
      const diffMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
      
      if (diffMinutes < 60) {
        return `منذ ${diffMinutes} دقيقة`;
      } else if (diffMinutes < 24 * 60) {
        const hours = Math.floor(diffMinutes / 60);
        return `منذ ${hours} ساعة`;
      } else {
        const days = Math.floor(diffMinutes / (24 * 60));
        return `منذ ${days} يوم`;
      }
    } catch {
      return 'حديثاً';
    }
  };

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-800 dark:to-gray-900 rounded-2xl p-6 shadow-lg">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="mr-3 text-gray-600 dark:text-gray-300">جاري تحميل النشرة...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-800 dark:to-gray-900 rounded-2xl p-6 shadow-lg border border-blue-200 dark:border-gray-700">
      {/* عنوان البلوك */}
      <div className="flex items-center gap-3 mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            🎙️ النشرة الصوتية الإخبارية
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            تأتيكم على رأس كل ساعة من سبق
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {!error && podcast ? (
          /* حالة وجود نشرة */
          <>
            {/* عرض النشرة */}
            <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="text-sm font-medium text-green-800 dark:text-green-200">
                    النشرة الصوتية
                  </span>
                </div>
                <span className="text-xs text-green-600 dark:text-green-400">
                  {formatRelativeTime(podcast.timestamp)}
                </span>
              </div>
              
              {/* معلومات النشرة */}
              <div className="mt-2 text-xs text-green-700 dark:text-green-300">
                <p>🎵 المدة: {podcast.duration} دقائق تقريباً</p>
              </div>
            </div>
          </>
        ) : (
          /* حالة عدم وجود نشرة */
          <div className="text-center py-8">
            <div className="bg-gray-100 dark:bg-gray-700 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Headphones className="w-10 h-10 text-gray-400 dark:text-gray-500" />
            </div>
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              لا توجد نشرة صوتية متاحة
            </h4>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              يتم تحديث النشرة الصوتية بشكل دوري تلقائياً
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
