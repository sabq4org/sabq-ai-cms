'use client';

import { useState, useEffect } from 'react';
import { Radio, Play, Pause, Download, Volume2 } from 'lucide-react';
import { useRef } from 'react';

interface PodcastData {
  link: string;
  timestamp: string;
  duration: number;
}

export default function PodcastBlock() {
  const [podcast, setPodcast] = useState<PodcastData | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [loading, setLoading] = useState(true);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    fetchLatestPodcast();
  }, []);

  const fetchLatestPodcast = async () => {
    try {
      const res = await fetch('/api/generate-podcast');
      const data = await res.json();
      
      if (data.success && data.lastPodcast) {
        setPodcast({
          link: data.lastPodcast.link,
          timestamp: data.lastPodcast.createdAt,
          duration: 3 // تقدير افتراضي
        });
      }
    } catch (err) {
      console.error('Error fetching podcast:', err);
    } finally {
      setLoading(false);
    }
  };

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const formatTime = (timestamp: string) => {
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

  if (loading) {
    return (
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-6 mb-8 animate-pulse">
        <div className="h-20 bg-white/20 rounded-lg"></div>
      </div>
    );
  }

  if (!podcast) {
    return null;
  }

  return (
    <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-6 mb-8 text-white shadow-xl">
      <audio
        ref={audioRef}
        src={podcast.link}
        onEnded={() => setIsPlaying(false)}
        className="hidden"
      />
      
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* أيقونة الراديو */}
          <div className="bg-white/20 backdrop-blur-sm p-4 rounded-xl">
            <Radio className="w-8 h-8" />
          </div>
          
          {/* معلومات النشرة */}
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-lg font-bold">النشرة الصوتية اليومية</h3>
              <span className="bg-white/20 px-2 py-0.5 rounded-full text-xs">
                جديد
              </span>
            </div>
            <p className="text-sm opacity-90">
              آخر أخبار صحيفة سبق • {formatTime(podcast.timestamp)}
            </p>
          </div>
        </div>

        {/* أزرار التحكم */}
        <div className="flex items-center gap-3">
          {/* زر التشغيل */}
          <button
            onClick={togglePlay}
            className="bg-white text-blue-600 p-3 rounded-full hover:bg-white/90 transition-all transform hover:scale-105 shadow-lg"
            aria-label={isPlaying ? 'إيقاف' : 'تشغيل'}
          >
            {isPlaying ? (
              <Pause className="w-6 h-6" />
            ) : (
              <Play className="w-6 h-6 mr-0.5" />
            )}
          </button>

          {/* زر التحميل */}
          <a
            href={podcast.link}
            download
            className="bg-white/20 backdrop-blur-sm p-3 rounded-full hover:bg-white/30 transition-all"
            aria-label="تحميل النشرة"
          >
            <Download className="w-5 h-5" />
          </a>
        </div>
      </div>

      {/* مؤشر الصوت المتحرك */}
      {isPlaying && (
        <div className="mt-4 flex items-center gap-2">
          <Volume2 className="w-4 h-4 opacity-70" />
          <div className="flex gap-1 items-end">
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                className="w-1 bg-white/50 rounded-full animate-pulse"
                style={{
                  height: Math.random() * 20 + 10 + 'px',
                  animationDelay: i * 0.1 + 's'
                }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 