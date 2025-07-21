'use client';

import { useState, useEffect, useRef } from 'react';
import { Play, Pause, Clock, CheckCircle, Headphones, Radio, Volume2, VolumeX } from 'lucide-react';

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
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    fetchLatestPodcast();
  }, []);

  const fetchLatestPodcast = async () => {
    try {
      setError(false);
      const res = await fetch('/api/audio/newsletters/featured');
      
      if (!res.ok) {
        console.error('Failed to fetch podcast:', res.status, res.statusText);
        setError(true);
        return;
      }
      
      const data = await res.json();
      
      if (data?.success && data?.newsletter) {
        const newsletter = data.newsletter;
        const link = newsletter?.audioUrl || newsletter?.url;
        const timestamp = newsletter?.created_at;
        const duration = newsletter?.duration || 3;
        
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

  const togglePlay = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const toggleMute = () => {
    if (!audioRef.current) return;
    
    audioRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

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
      <div className="relative bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-800 dark:via-gray-800 dark:to-gray-900 rounded-2xl p-6 shadow-lg border border-blue-100 dark:border-gray-700 overflow-hidden">
        {/* خلفية متحركة */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 animate-pulse"></div>
        
        <div className="relative flex items-center justify-center py-8">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-gray-600 dark:text-gray-300 font-medium">جاري تحميل النشرة...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-800 dark:via-gray-800 dark:to-gray-900 rounded-2xl shadow-xl border border-blue-100 dark:border-gray-700 overflow-hidden">
      {/* خلفية ديناميكية */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-indigo-500/5 to-purple-500/5"></div>
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-blue-400/20 to-transparent rounded-full -translate-y-16 translate-x-16"></div>
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-purple-400/20 to-transparent rounded-full translate-y-12 -translate-x-12"></div>
      
      <div className="relative p-6">
        {/* Header محسن */}
        <div className="flex items-center gap-4 mb-6">
          <div className="relative">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
              <Radio className="w-6 h-6 text-white" />
            </div>
            {/* نقطة متحركة للبث المباشر */}
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full animate-pulse border-2 border-white"></div>
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
            🎙️ النشرة الصوتية
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            تأتيكم على رأس كل ساعة من سبق
          </p>
        </div>
      </div>

        {!error && podcast ? (
          <>
            {/* شريط الحالة */}
            <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800 rounded-xl">
              <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="text-sm font-semibold text-green-800 dark:text-green-200">
                    النشرة الصوتية متاحة الآن
              </span>
            </div>
                <span className="text-xs bg-green-100 dark:bg-green-800 text-green-700 dark:text-green-200 px-2 py-1 rounded-full font-medium">
              {formatRelativeTime(podcast.timestamp)}
            </span>
          </div>
          
              {/* معلومات النشرة */}
              <div className="flex items-center gap-4 text-sm text-green-700 dark:text-green-300">
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>{podcast.duration} دقائق</span>
                </div>
                <div className="flex items-center gap-1">
                  <Headphones className="w-4 h-4" />
                  <span>جودة عالية</span>
                </div>
              </div>
            </div>

            {/* مشغل الصوت المحسن */}
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-5 border border-gray-200 dark:border-gray-600">
              {/* أزرار التحكم */}
              <div className="flex items-center gap-4 mb-4">
              <button
                onClick={togglePlay}
                  className="w-14 h-14 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                {isPlaying ? (
                  <Pause className="w-6 h-6" />
                ) : (
                  <Play className="w-6 h-6 mr-0.5" />
                )}
              </button>
              
              <div className="flex-1">
                  <div className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                    النشرة الإخبارية الصوتية
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {duration > 0 ? `${formatTime(currentTime)} / ${formatTime(duration)}` : 'جاري التحميل...'}
                  </div>
                </div>
                
                <button
                  onClick={toggleMute}
                  className="w-10 h-10 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300 rounded-full flex items-center justify-center transition-colors"
                >
                  {isMuted ? (
                    <VolumeX className="w-5 h-5" />
                  ) : (
                    <Volume2 className="w-5 h-5" />
                  )}
                </button>
              </div>
              
              {/* شريط التقدم */}
              <div className="relative h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="absolute h-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-300"
                  style={{ width: duration > 0 ? `${(currentTime / duration) * 100}%` : '0%' }}
                ></div>
            </div>
          </div>
          
            {/* العنصر الصوتي */}
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
          /* حالة عدم وجود نشرة صوتية */
          <div className="text-center py-12">
            <div className="flex flex-col items-center gap-6">
              <div className="relative">
                <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 rounded-full flex items-center justify-center">
                  <Radio className="w-10 h-10 text-gray-400 dark:text-gray-500" />
                </div>
                <div className="absolute inset-0 rounded-full border-2 border-dashed border-gray-300 dark:border-gray-600 animate-spin"></div>
            </div>
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-lg font-medium mb-2">
                📻 لا توجد نشرة صوتية جديدة
              </p>
              <p className="text-gray-500 dark:text-gray-500 text-sm">
                ترقب النشرة القادمة قريباً
              </p>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}