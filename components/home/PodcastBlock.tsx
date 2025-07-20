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
        const link = newsletter?.audioUrl || newsletter?.url; // ترتيب مختلف: audioUrl أولاً
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
          console.warn('بيانات النشرة ناقصة:', newsletter);
          setError(true);
        }
      } else {
        console.log('لا توجد نشرة متاحة');
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
    <div className="bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-800 dark:to-gray-900 rounded-xl p-3 sm:p-4 shadow-md border border-blue-200 dark:border-gray-700">
      {/* عنوان البلوك - مضغوط أكثر على الموبايل */}
      <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
        <div className="p-1.5 sm:p-2 bg-blue-600 rounded-lg shadow-sm">
          <Mic className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white truncate">
            🎙️ النشرة الصوتية
          </h2>
          <p className="text-xs text-gray-600 dark:text-gray-400 hidden sm:block">
            آخر الأخبار صوتياً
          </p>
        </div>
      </div>

      <div className="space-y-2 sm:space-y-3">
        {!error && podcast ? (
          /* حالة وجود نشرة - مضغوطة جداً */
          <>
            <div className="p-2 sm:p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1 sm:gap-2">
                  <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-green-600" />
                  <span className="text-xs sm:text-sm font-medium text-green-800 dark:text-green-200">
                    متاحة
                  </span>
                </div>
                <span className="text-xs text-green-600 dark:text-green-400">
                  {formatRelativeTime(podcast.timestamp)}
                </span>
              </div>
              
              {/* مشغل الصوت - مضغوط */}
              <div className="mb-2">
                <audio 
                  controls 
                  className="w-full" 
                  preload="metadata"
                  style={{ height: '28px' }}
                >
                  <source src={podcast.link} type="audio/mpeg" />
                  <source src={podcast.link} type="audio/wav" />
                  <source src={podcast.link} type="audio/ogg" />
                  متصفحك لا يدعم تشغيل الملفات الصوتية
                </audio>
              </div>
              
              {/* معلومات مختصرة */}
              <div className="flex items-center justify-between text-xs text-green-700 dark:text-green-300">
                <span>🎵 {podcast.duration} د</span>
                <a 
                  href="/newsletters" 
                  className="text-blue-600 dark:text-blue-400 hover:underline"
                >
                  📚 أرشيف
                </a>
              </div>
            </div>
          </>
        ) : (
          /* حالة عدم وجود نشرة - مضغوطة */
          <div className="text-center py-3 sm:py-4">
            <div className="bg-gray-100 dark:bg-gray-700 w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3">
              <Headphones className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400 dark:text-gray-500" />
            </div>
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-1 sm:mb-2">
              لا توجد نشرة
            </h4>
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-2 sm:mb-3">
              ستتوفر قريباً
            </p>
            <a 
              href="/newsletters" 
              className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
            >
              📚 أرشيف
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
