'use client';

import { useState, useEffect, useRef } from 'react';
import { Play, Pause, Volume2, Download, Loader2, Headphones } from 'lucide-react';

interface AudioSummaryPlayerProps {
  articleId: string;
  excerpt?: string | null;
  audioUrl?: string | null;
}

export default function AudioSummaryPlayer({ 
  articleId, 
  excerpt, 
  audioUrl: initialAudioUrl 
}: AudioSummaryPlayerProps) {
  const [audioUrl, setAudioUrl] = useState<string | null>(initialAudioUrl || null);
  const [isLoading, setIsLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  // تحميل الصوت عند الطلب
  const loadAudio = async () => {
    if (audioUrl || isLoading) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/voice-summary?articleId=${articleId}`);
      const data = await response.json();

      if (data.success) {
        setAudioUrl(data.audioUrl);
      } else {
        setError(data.error || 'فشل تحميل الصوت');
      }
    } catch (err) {
      setError('حدث خطأ في تحميل الصوت');
    } finally {
      setIsLoading(false);
    }
  };

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

  // إذا لم يكن هناك موجز، لا تعرض المكون
  if (!excerpt) return null;

  return (
    <div className="bg-gradient-to-r from-red-50 to-orange-50 dark:from-gray-800 dark:to-gray-700 rounded-xl p-6 mb-8 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Headphones className="w-6 h-6 text-red-600 dark:text-red-400" />
          <h3 className="font-bold text-lg text-gray-900 dark:text-white">
            استمع إلى موجز المقال
          </h3>
        </div>
        
        {audioUrl && (
          <a
            href={audioUrl}
            download={`summary-${articleId}.mp3`}
            className="text-gray-600 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 transition-colors"
            title="تحميل الملف الصوتي"
          >
            <Download className="w-5 h-5" />
          </a>
        )}
      </div>

      {error ? (
        <div className="text-red-600 dark:text-red-400 text-sm mb-4">
          {error}
        </div>
      ) : !audioUrl && !isLoading ? (
        <button
          onClick={loadAudio}
          className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          <Volume2 className="w-5 h-5" />
          توليد الصوت من الموجز
        </button>
      ) : isLoading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-8 h-8 text-red-600 animate-spin" />
          <span className="mr-3 text-gray-600 dark:text-gray-400">
            جاري توليد الصوت...
          </span>
        </div>
      ) : audioUrl ? (
        <div className="space-y-4">
          {/* مشغل الصوت */}
          <audio
            ref={audioRef}
            src={audioUrl}
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
            onEnded={() => setIsPlaying(false)}
            className="hidden"
          />

          {/* أزرار التحكم */}
          <div className="flex items-center gap-4">
            <button
              onClick={togglePlayPause}
              className="bg-red-600 hover:bg-red-700 text-white p-3 rounded-full transition-colors"
            >
              {isPlaying ? (
                <Pause className="w-6 h-6" />
              ) : (
                <Play className="w-6 h-6 mr-0.5" />
              )}
            </button>

            {/* شريط التقدم */}
            <div className="flex-1">
              <div className="relative h-2 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                <div
                  className="absolute h-full bg-red-600 transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="flex justify-between mt-1 text-xs text-gray-600 dark:text-gray-400">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>
          </div>

          {/* نص الموجز */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
            <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
              {excerpt}
            </p>
          </div>
        </div>
      ) : null}
    </div>
  );
} 