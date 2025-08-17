'use client';

import { useState, useRef } from 'react';
import { Play, Pause, Volume2, Headphones } from 'lucide-react';

interface AudioSummaryPlayerCompactProps {
  articleId: string;
  audioUrl?: string | null;
  excerpt?: string | null;
}

export default function AudioSummaryPlayerCompact({ 
  articleId, 
  audioUrl 
}: AudioSummaryPlayerCompactProps) {
  const [showPlayer, setShowPlayer] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);

  // إذا لم يكن هناك رابط صوتي، لا تعرض المكون
  if (!audioUrl) return null;

  // التحكم في التشغيل
  const togglePlayPause = () => {
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

  // تحديث المدة عند تحميل البيانات الوصفية
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

  // حساب نسبة التقدم
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <>
      {/* أيقونة الاستماع */}
      <button
        onClick={() => setShowPlayer(!showPlayer)}
        className={`p-2 rounded-lg transition-all ${
          showPlayer 
            ? 'bg-blue-600 text-white' 
            : 'bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-800/50'
        }`}
        title="استمع للملخص"
      >
        <Headphones className="w-5 h-5" />
      </button>

      {/* مشغل الصوت - يظهر عند الضغط */}
      {showPlayer && (
        <div className="absolute top-full left-0 mt-2 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50 min-w-[300px]">
          <audio
            ref={audioRef}
            src={audioUrl}
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
            onEnded={() => setIsPlaying(false)}
            className="hidden"
          />

          <div className="space-y-3">
            {/* أزرار التحكم */}
            <div className="flex items-center gap-3">
              <button
                onClick={togglePlayPause}
                className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full transition-colors"
              >
                {isPlaying ? (
                  <Pause className="w-5 h-5" />
                ) : (
                  <Play className="w-5 h-5" />
                )}
              </button>

              {/* شريط التقدم */}
              <div className="flex-1">
                <div className="relative h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="absolute h-full bg-blue-600 transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <div className="flex justify-between mt-1 text-xs text-gray-600 dark:text-gray-400">
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(duration)}</span>
                </div>
              </div>
            </div>

            {/* معلومات */}
            <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
              <Volume2 className="w-3 h-3" />
              <span>الاستماع للملخص الصوتي</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
} 