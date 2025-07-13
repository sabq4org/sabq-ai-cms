'use client';

import { useState, useEffect, useRef } from 'react';
import { Play, Pause, Download, Volume2, Headphones, Clock, Mic, RefreshCw, Share2 } from 'lucide-react';

interface PodcastData {
  link: string;
  timestamp: string;
  duration: number;
}

export default function PodcastBlock() {
  const [podcast, setPodcast] = useState<PodcastData | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState(false);
  const [generating, setGenerating] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const progressInterval = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    fetchLatestPodcast();
    return () => {
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
      }
    };
  }, []);

  const fetchLatestPodcast = async () => {
    try {
      setError(false);
      const res = await fetch('/api/generate-podcast');
      
      if (!res.ok) {
        throw new Error('Failed to fetch podcast');
      }
      
      const data = await res.json();
      
      if (data.success && data.lastPodcast) {
        setPodcast({
          link: data.lastPodcast.link,
          timestamp: data.lastPodcast.createdAt,
          duration: 3
        });
      }
    } catch (err) {
      console.error('Error fetching podcast:', err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  const generateNewPodcast = async () => {
    setGenerating(true);
    try {
      const res = await fetch('/api/generate-podcast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ count: 5 })
      });
      
      if (!res.ok) throw new Error('Failed to generate');
      
      const data = await res.json();
      if (data.success) {
        setPodcast({
          link: data.link,
          timestamp: new Date().toISOString(),
          duration: data.duration || 3
        });
      }
    } catch (err) {
      console.error('Error generating podcast:', err);
      alert('حدث خطأ في توليد النشرة. تأكد من إعدادات API.');
    } finally {
      setGenerating(false);
    }
  };

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        if (progressInterval.current) {
          clearInterval(progressInterval.current);
        }
      } else {
        audioRef.current.play();
        startProgressTracking();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const startProgressTracking = () => {
    progressInterval.current = setInterval(() => {
      if (audioRef.current) {
        const current = audioRef.current.currentTime;
        const total = audioRef.current.duration;
        setCurrentTime(current);
        setDuration(total);
        setProgress((current / total) * 100);
      }
    }, 100);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    
    if (hours < 1) {
      const minutes = Math.floor(diff / (1000 * 60));
      return `منذ ${minutes} دقيقة`;
    } else if (hours < 24) {
      return `منذ ${hours} ساعة`;
    } else {
      return date.toLocaleDateString('ar-SA');
    }
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (audioRef.current) {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const percentage = (x / rect.width) * 100;
      const newTime = (percentage / 100) * audioRef.current.duration;
      audioRef.current.currentTime = newTime;
      setProgress(percentage);
    }
  };

  const shareLink = () => {
    if (navigator.share) {
      navigator.share({
        title: 'النشرة الصوتية - صحيفة سبق',
        text: 'استمع لآخر الأخبار في نشرة صوتية مميزة',
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('تم نسخ الرابط!');
    }
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-8 animate-pulse">
        <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
      </div>
    );
  }

  // التصميم الاحترافي الجديد
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm mb-8 overflow-hidden">
      {/* الهيدر */}
      <div className="bg-gradient-to-r from-red-600 to-red-700 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-lg">
              <Headphones className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">النشرة الصوتية اليومية</h3>
              <p className="text-white/80 text-sm">آخر تحديث: {podcast ? formatTimestamp(podcast.timestamp) : 'لا توجد نشرة'}</p>
            </div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm px-3 py-1 rounded-full">
            <span className="text-xs text-white font-medium flex items-center gap-1">
              <Mic className="w-3 h-3" />
              بالذكاء الاصطناعي
            </span>
          </div>
        </div>
      </div>

      {/* المحتوى */}
      <div className="p-6">
        {podcast ? (
          <>
            {/* مشغل الصوت */}
            <audio
              ref={audioRef}
              src={podcast.link}
              onEnded={() => {
                setIsPlaying(false);
                setProgress(0);
                if (progressInterval.current) {
                  clearInterval(progressInterval.current);
                }
              }}
              onLoadedMetadata={() => {
                if (audioRef.current) {
                  setDuration(audioRef.current.duration);
                }
              }}
              className="hidden"
            />

            <div className="flex items-center gap-4 mb-4">
              {/* زر التشغيل */}
              <button
                onClick={togglePlay}
                className="bg-red-600 hover:bg-red-700 text-white p-4 rounded-full transition-colors shadow-lg"
                aria-label={isPlaying ? 'إيقاف' : 'تشغيل'}
              >
                {isPlaying ? (
                  <Pause className="w-6 h-6" />
                ) : (
                  <Play className="w-6 h-6 mr-0.5" />
                )}
              </button>

              {/* معلومات النشرة */}
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                  نشرة أخبار اليوم
                </h4>
                <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {formatTime(duration || podcast.duration * 60)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Volume2 className="w-4 h-4" />
                    صوت عالي الجودة
                  </span>
                </div>
              </div>

              {/* أزرار التحكم */}
              <div className="flex items-center gap-2">
                <button
                  onClick={shareLink}
                  className="p-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
                  aria-label="مشاركة"
                >
                  <Share2 className="w-5 h-5" />
                </button>
                <a
                  href={podcast.link}
                  download
                  className="p-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
                  aria-label="تحميل"
                >
                  <Download className="w-5 h-5" />
                </a>
              </div>
            </div>

            {/* شريط التقدم */}
            {(isPlaying || progress > 0) && (
              <div className="mb-4">
                <div 
                  className="relative h-2 bg-gray-200 dark:bg-gray-700 rounded-full cursor-pointer overflow-hidden"
                  onClick={handleProgressClick}
                >
                  <div 
                    className="absolute inset-y-0 left-0 bg-red-600 rounded-full transition-all duration-100"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <div className="flex justify-between mt-1 text-xs text-gray-500 dark:text-gray-400">
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(duration)}</span>
                </div>
              </div>
            )}

            {/* الوصف */}
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              استمع لملخص أهم الأخبار والأحداث في دقائق معدودة، مُعد بتقنية الذكاء الاصطناعي لتوفير وقتك وإبقائك على اطلاع دائم.
            </p>

            {/* مؤشرات الصوت */}
            {isPlaying && (
              <div className="flex items-center justify-center gap-1 h-8 mb-4">
                {[...Array(20)].map((_, i) => (
                  <div
                    key={i}
                    className="w-1 bg-red-400 rounded-full animate-pulse"
                    style={{
                      height: Math.random() * 24 + 8 + 'px',
                      animationDelay: i * 0.1 + 's'
                    }}
                  />
                ))}
              </div>
            )}
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
              اضغط على الزر أدناه لتوليد نشرة صوتية جديدة من آخر الأخبار
            </p>
          </div>
        )}

        {/* زر توليد نشرة جديدة */}
        <button
          onClick={generateNewPodcast}
          disabled={generating}
          className="w-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          {generating ? (
            <>
              <RefreshCw className="w-5 h-5 animate-spin" />
              جاري توليد النشرة...
            </>
          ) : (
            <>
              <RefreshCw className="w-5 h-5" />
              توليد نشرة جديدة
            </>
          )}
        </button>
      </div>
    </div>
  );
} 