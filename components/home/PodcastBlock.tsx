'use client';

import { useState, useEffect, useRef } from 'react';
import { Play, Pause, Mic } from 'lucide-react';

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
          setError(true);
        }
      } else {
        setError(true);
      }
    } catch (error) {
      console.error('Error fetching podcast:', error);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  const togglePlayPause = () => {
    if (!audioRef.current || !podcast) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(error => {
        console.error('Error playing audio:', error);
      });
    }
    setIsPlaying(!isPlaying);
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

  if (loading) {
    return (
      <div className="border rounded-lg p-4 bg-blue-50 dark:bg-blue-900/20 shadow-sm border-blue-200 dark:border-blue-700">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-blue-700 dark:text-blue-300 text-sm">جاري تحميل النشرة...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="border rounded-lg p-4 bg-blue-50 dark:bg-blue-900/20 shadow-sm border-blue-200 dark:border-blue-700">
      {!error && podcast ? (
        <>
          {/* Header مبسط */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Mic className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
                النشرة الإخبارية الصوتية
              </span>
              <span className="text-sm text-blue-600 dark:text-blue-400">
                🎧 {podcast.duration}:00 دقيقة
              </span>
            </div>
          </div>

          {/* Controls مضغوطة */}
          <div className="flex justify-between items-center">
            <button
              onClick={togglePlayPause}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-full text-sm flex items-center gap-2 transition-colors"
            >
              {isPlaying ? (
                <Pause className="w-4 h-4" />
              ) : (
                <Play className="w-4 h-4" />
              )}
              {isPlaying ? 'إيقاف' : 'تشغيل'}
            </button>
            
            <div className="flex items-center gap-4">
              <span className="text-xs text-blue-500 dark:text-blue-400">
                جودة: عالية
              </span>
              <span className="text-xs text-blue-500 dark:text-blue-400">
                تُحدّث كل ساعة
              </span>
            </div>
          </div>

          {/* شريط التقدم مبسط */}
          {isPlaying && (
            <div className="mt-3 relative h-1 bg-blue-200 dark:bg-blue-700 rounded-full overflow-hidden">
              <div
                className="absolute h-full bg-blue-600 dark:bg-blue-400 transition-all duration-300"
                style={{ width: duration > 0 ? `${(currentTime / duration) * 100}%` : '0%' }}
              ></div>
            </div>
          )}

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
        /* حالة عدم وجود نشرة - مبسطة */
        <div className="text-center py-4">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Mic className="w-5 h-5 text-blue-400" />
            <p className="text-blue-600 dark:text-blue-400 text-sm">
              لا توجد نشرة صوتية متاحة حالياً
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
