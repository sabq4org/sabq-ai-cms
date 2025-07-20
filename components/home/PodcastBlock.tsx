'use client';

import { useState, useEffect, useRef } from 'react';
import { Play, Pause, Volume2, Clock, Mic, Headphones, CheckCircle, ChevronRight } from 'lucide-react';

interface PodcastData {
  link: string;
  timestamp: string;
  duration: number;
}

export default function PodcastBlock() {
  const [podcast, setPodcast] = useState<PodcastData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);

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
        const link = newsletter?.audioUrl || newsletter?.url;
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
      }
    } catch (err) {
      console.error('Error fetching podcast:', err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  // التحكم في مشغل الصوت
  const togglePlay = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  // تحديث الوقت الحالي
  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  // تحديث المدة عند تحميل الصوت
  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  // تنسيق الوقت
  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
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
      <div className="bg-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="mr-3 text-gray-600 dark:text-gray-300">جاري تحميل النشرة...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
      {/* عنوان البلوك */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-blue-600 rounded-lg shadow-sm">
          <Mic className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">
            🎙️ النشرة الصوتية
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            آخر الأخبار صوتياً
          </p>
        </div>
      </div>

      {loading ? (
        /* حالة التحميل */
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600 dark:text-gray-400">جاري تحميل النشرة...</span>
        </div>
      ) : !error && podcast ? (
        /* حالة وجود نشرة مع مشغل أنيق */
        <>
          {/* مؤشر الحالة - مصغر ومتناسق */}
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                متاحة الآن
              </span>
            </div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {formatRelativeTime(podcast.timestamp)}
            </span>
          </div>
          
          {/* مشغل الصوت الموحد */}
          <div className="bg-white dark:bg-gray-700 rounded-lg p-5 shadow-sm border border-gray-100 dark:border-gray-600">
            <div className="flex items-center gap-4">
              {/* زر التشغيل */}
              <button
                onClick={togglePlay}
                className="flex items-center justify-center w-12 h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg transition-all duration-200 hover:scale-105"
              >
                {isPlaying ? (
                  <Pause className="w-6 h-6" />
                ) : (
                  <Play className="w-6 h-6 mr-0.5" />
                )}
              </button>
              
              {/* معلومات الوقت والشريط */}
              <div className="flex-1">
                <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(duration || podcast.duration * 60)}</span>
                </div>
                
                {/* شريط التقدم */}
                <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-200"
                    style={{ 
                      width: duration > 0 ? `${(currentTime / duration) * 100}%` : '0%' 
                    }}
                  />
                </div>
              </div>
              
              {/* أيقونة الصوت */}
              <Volume2 className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            </div>
          </div>
          
          {/* معلومات إضافية */}
          <div className="flex items-center justify-between mt-4 text-sm">
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
              <Clock className="w-4 h-4" />
              <span>{podcast.duration} دقيقة</span>
            </div>
            <a 
              href="/newsletters" 
              className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-colors"
            >
              📚 أرشيف النشرات
            </a>
          </div>
          
          {/* العنصر الصوتي المخفي */}
          <audio
            ref={audioRef}
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
            onEnded={() => setIsPlaying(false)}
            preload="metadata"
          >
            <source src={podcast.link} type="audio/mpeg" />
            <source src={podcast.link} type="audio/wav" />
            <source src={podcast.link} type="audio/ogg" />
          </audio>
        </>
      ) : (
        /* حالة عدم وجود نشرة صوتية - بتصميم نظيف */
        <div className="text-center py-8">
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
              <Play className="w-8 h-8 text-gray-400 dark:text-gray-500" />
            </div>
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-lg font-medium mb-2">
                📻 لا توجد نشرة صوتية جديدة
              </p>
              <p className="text-gray-500 dark:text-gray-500 text-sm">
                ترقب النشرة القادمة قريباً
              </p>
            </div>
            <a 
              href="/newsletters" 
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors font-medium"
            >
              📚 أرشيف النشرات
            </a>
          </div>
        </div>
      )}
    </div>
  );
}