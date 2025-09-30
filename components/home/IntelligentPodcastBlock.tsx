"use client";

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, 
  Pause, 
  Clock, 
  Headphones, 
  Volume2, 
  SkipBack, 
  SkipForward,
  Mic,
  TrendingUp,
  Download,
  Share2,
  Eye
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import AudioWave from '@/components/ui/AudioWave';

// Mini Player العائم
interface MiniPlayerProps {
  isVisible: boolean;
  currentEpisode: PodcastEpisode | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  onTogglePlay: () => void;
  onClose: () => void;
  progress: number;
}

const MiniPlayer: React.FC<MiniPlayerProps> = ({
  isVisible,
  currentEpisode,
  isPlaying,
  currentTime,
  duration,
  onTogglePlay,
  onClose,
  progress
}) => {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <AnimatePresence>
      {isVisible && currentEpisode && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", damping: 20, stiffness: 300 }}
          className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 shadow-2xl"
        >
          <div className="max-w-6xl mx-auto px-4 py-3">
            <div className="flex items-center gap-4">
              {/* أيقونة البودكاست */}
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <Mic className="w-6 h-6 text-white" />
                </div>
              </div>

              {/* معلومات الحلقة */}
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-sm text-gray-900 dark:text-white truncate">
                  {currentEpisode.title}
                </h4>
                <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                  <span>{formatTime(currentTime)} / {formatTime(duration)}</span>
                  <Badge variant="secondary" className="text-xs">
                    🎙️ بودكاست الذكاء
                  </Badge>
                </div>
              </div>

              {/* أزرار التحكم */}
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onTogglePlay}
                  className="h-8 w-8 p-0"
                >
                  {isPlaying ? (
                    <Pause className="h-4 w-4" />
                  ) : (
                    <Play className="h-4 w-4" />
                  )}
                </Button>
                <button
                  onClick={onClose}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 p-1"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* شريط التقدم */}
            <div className="mt-2">
              <div className="w-full h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-blue-500 to-purple-600"
                  style={{ width: `${progress}%` }}
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// تعريف نوع البيانات
interface PodcastEpisode {
  id: string;
  title: string;
  duration: number; // بالثواني
  audioUrl: string;
  publishedAt: string;
  description?: string;
  playCount?: number;
  isNew?: boolean;
}

// بطاقة الحلقة المصغرة
interface EpisodeCardProps {
  episode: PodcastEpisode;
  onPlay: (episode: PodcastEpisode) => void;
  isPlaying: boolean;
  isCurrentEpisode: boolean;
}

const EpisodeCard: React.FC<EpisodeCardProps> = ({ 
  episode, 
  onPlay, 
  isPlaying, 
  isCurrentEpisode 
}) => {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ar-SA', {
      day: 'numeric',
      month: 'short'
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        "p-4 rounded-xl border transition-all duration-300 hover:shadow-md",
        isCurrentEpisode
          ? "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800"
          : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
      )}
    >
      <div className="flex items-start gap-3">
        {/* زر التشغيل */}
        <Button
          onClick={() => onPlay(episode)}
          size="sm"
          variant={isCurrentEpisode ? "default" : "outline"}
          className={cn(
            "rounded-full w-10 h-10 flex-shrink-0",
            isCurrentEpisode && isPlaying && "animate-pulse"
          )}
        >
          {isCurrentEpisode && isPlaying ? (
            <Pause className="w-4 h-4" />
          ) : (
            <Play className="w-4 h-4 ml-0.5" />
          )}
        </Button>

        {/* معلومات الحلقة */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-2">
            <h4 className="font-semibold text-sm text-gray-900 dark:text-white line-clamp-2">
              {episode.title}
            </h4>
            {episode.isNew && (
              <Badge variant="secondary" className="text-xs bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                جديد
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {formatTime(episode.duration)}
            </span>
            <span className="flex items-center gap-1">
              <Eye className="w-3 h-3" />
              {episode.playCount || 0}
            </span>
            <span>{formatDate(episode.publishedAt)}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// مشغل الصوت الرئيسي
interface AudioPlayerProps {
  episode: PodcastEpisode;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  onTogglePlay: () => void;
  onSeek: (time: number) => void;
  onSkipBack: () => void;
  onSkipForward: () => void;
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({
  episode,
  isPlaying,
  currentTime,
  duration,
  onTogglePlay,
  onSeek,
  onSkipBack,
  onSkipForward
}) => {
  const progressRef = useRef<HTMLDivElement>(null);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressRef.current) return;
    
    const rect = progressRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = clickX / rect.width;
    const newTime = percentage * duration;
    
    onSeek(newTime);
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="space-y-4">
      {/* معلومات الحلقة الحالية */}
      <div className="text-center">
        <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2 line-clamp-2">
          {episode.title}
        </h3>
        <div className="flex items-center justify-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          <Clock className="w-4 h-4" />
          <span>⏱ {formatTime(episode.duration)}</span>
        </div>
      </div>

      {/* شريط التقدم */}
      <div className="space-y-2">
        <div
          ref={progressRef}
          className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full cursor-pointer"
          onClick={handleProgressClick}
        >
          <motion.div
            className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full"
            style={{ width: `${progress}%` }}
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.1 }}
          />
        </div>
        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* أزرار التحكم */}
      <div className="flex items-center justify-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={onSkipBack}
          className="h-10 w-10 rounded-full"
        >
          <SkipBack className="h-4 w-4" />
        </Button>

        <Button
          onClick={onTogglePlay}
          size="lg"
          className="h-14 w-14 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 shadow-lg relative overflow-hidden"
        >
          {isPlaying ? (
            <div className="flex items-center justify-center">
              <AudioWave isPlaying={true} size="sm" color="blue" />
            </div>
          ) : (
            <Play className="h-6 w-6 ml-1 text-white" />
          )}
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={onSkipForward}
          className="h-10 w-10 rounded-full"
        >
          <SkipForward className="h-4 w-4" />
        </Button>
      </div>

      {/* أزرار إضافية */}
      <div className="flex items-center justify-center gap-2">
        <Button variant="outline" size="sm" className="text-xs">
          <Download className="w-3 h-3 mr-1" />
          تحميل
        </Button>
        <Button variant="outline" size="sm" className="text-xs">
          <Share2 className="w-3 h-3 mr-1" />
          مشاركة
        </Button>
      </div>
    </div>
  );
};

// المكون الرئيسي
const IntelligentPodcastBlock: React.FC = () => {
  // حالة البيانات والتشغيل
  const [episodes, setEpisodes] = useState<PodcastEpisode[]>([]);
  const [currentEpisode, setCurrentEpisode] = useState<PodcastEpisode | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showMiniPlayer, setShowMiniPlayer] = useState(false);

  // مرجع عنصر الصوت
  const audioRef = useRef<HTMLAudioElement>(null);

  // بيانات وهمية للتطوير
  const mockEpisodes: PodcastEpisode[] = [
    {
      id: '1',
      title: 'تحليل عميق: تطورات السوق السعودي وتأثير رؤية 2030',
      duration: 300, // 5 دقائق
      audioUrl: '/audio/podcast-1.mp3', // سيتم استبدالها بـ API حقيقي
      publishedAt: '2024-01-15T10:00:00Z',
      description: 'نظرة شاملة على التطورات الاقتصادية الأخيرة في المملكة',
      playCount: 1250,
      isNew: true
    },
    {
      id: '2',
      title: 'الذكاء الاصطناعي في التعليم: نقلة نوعية في التعلم',
      duration: 280,
      audioUrl: '/audio/podcast-2.mp3',
      publishedAt: '2024-01-14T15:30:00Z',
      description: 'كيف يغير الذكاء الاصطناعي مستقبل التعليم',
      playCount: 980,
      isNew: false
    },
    {
      id: '3',
      title: 'مستقبل الطاقة المتجددة في المنطقة',
      duration: 310,
      audioUrl: '/audio/podcast-3.mp3',
      publishedAt: '2024-01-13T09:15:00Z',
      description: 'استكشاف الفرص والتحديات في قطاع الطاقة المتجددة',
      playCount: 750,
      isNew: false
    }
  ];

  // تحميل البيانات عند بدء المكون
  useEffect(() => {
    const loadEpisodes = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // محاولة جلب البيانات من API
        const response = await fetch('/api/podcast/episodes?limit=4');
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.episodes?.length > 0) {
            setEpisodes(data.episodes);
            setCurrentEpisode(data.episodes[0]);
          } else {
            setError('لا توجد حلقات متاحة حالياً');
          }
        } else {
          setError('فشل في الاتصال بالخادم');
        }
        
      } catch (err) {
        console.error('خطأ في تحميل حلقات البودكاست:', err);
        setError('فشل في تحميل حلقات البودكاست');
      } finally {
        setIsLoading(false);
      }
    };

    loadEpisodes();
  }, []);

  // معالجة أحداث الصوت
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleLoadedMetadata = () => setDuration(audio.duration);
    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [currentEpisode]);

  // وظائف التحكم في التشغيل
  const handleTogglePlay = useCallback(async () => {
    if (!audioRef.current || !currentEpisode) return;

    try {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        await audioRef.current.play();
        setIsPlaying(true);
        setShowMiniPlayer(true);
      }
    } catch (error) {
      console.error('خطأ في تشغيل الصوت:', error);
    }
  }, [isPlaying, currentEpisode]);

  const handlePlayEpisode = useCallback((episode: PodcastEpisode) => {
    if (currentEpisode?.id === episode.id) {
      handleTogglePlay();
    } else {
      setCurrentEpisode(episode);
      setCurrentTime(0);
      setIsPlaying(false);
      
      // تحديث عدد الاستماع
      updatePlayCount(episode.id);
      
      // سيتم تشغيل الحلقة الجديدة تلقائياً عند تحميلها
      setTimeout(() => {
        handleTogglePlay();
      }, 100);
    }
  }, [currentEpisode, handleTogglePlay]);

  // تحديث عدد الاستماع
  const updatePlayCount = async (episodeId: string) => {
    try {
      await fetch('/api/podcast/episodes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ episodeId }),
      });
    } catch (error) {
      console.error('فشل في تحديث عدد الاستماع:', error);
    }
  };

  const handleSeek = useCallback((time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  }, []);

  const handleSkipBack = useCallback(() => {
    if (audioRef.current) {
      const newTime = Math.max(0, currentTime - 15);
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  }, [currentTime]);

  const handleSkipForward = useCallback(() => {
    if (audioRef.current) {
      const newTime = Math.min(duration, currentTime + 15);
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  }, [currentTime, duration]);

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  // عرض حالة التحميل
  if (isLoading) {
    return (
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-6xl mx-auto my-8 px-4"
      >
        <Card className="rounded-2xl shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center justify-center h-64">
              <div className="flex items-center gap-3">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                <span className="text-gray-600 dark:text-gray-400">جاري تحميل بودكاست الذكاء...</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.section>
    );
  }

  // عرض حالة الخطأ
  if (error && episodes.length === 0) {
    return (
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-6xl mx-auto my-8 px-4"
      >
        <Card className="rounded-2xl shadow-md border-red-200 dark:border-red-800">
          <CardContent className="p-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mic className="w-8 h-8 text-red-600 dark:text-red-400" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                🎙️ بودكاست الذكاء
              </h3>
              <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
              <Button variant="outline" onClick={() => window.location.reload()}>
                إعادة المحاولة
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.section>
    );
  }

  return (
    <>
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-6xl mx-auto my-8 px-4"
      >
        {/* رأس القسم */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="mb-6 flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <Mic className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                🎙️ بودكاست الذكاء
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                تحليلات عميقة في 5 دقائق
              </p>
            </div>
          </div>
          
          <Link href="/podcast" className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 flex items-center gap-1">
            <span>جميع الحلقات</span>
            <TrendingUp className="w-4 h-4" />
          </Link>
        </motion.div>

        {/* المحتوى الرئيسي */}
        <Card className="rounded-2xl shadow-md border-gray-200 dark:border-gray-700">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* الحلقة الحالية - يسار في الديسكتوب، أعلى في الموبايل */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="space-y-6"
              >
                <div className="flex items-center gap-2 mb-4">
                  <Badge variant="secondary" className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                    الحلقة الحالية
                  </Badge>
                  {currentEpisode?.isNew && (
                    <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                      🔥 جديد
                    </Badge>
                  )}
                </div>

                {currentEpisode && (
                  <AudioPlayer
                    episode={currentEpisode}
                    isPlaying={isPlaying}
                    currentTime={currentTime}
                    duration={duration}
                    onTogglePlay={handleTogglePlay}
                    onSeek={handleSeek}
                    onSkipBack={handleSkipBack}
                    onSkipForward={handleSkipForward}
                  />
                )}
              </motion.div>

              {/* الحلقات السابقة - يمين في الديسكتوب، أسفل في الموبايل */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4, duration: 0.5 }}
                className="space-y-4"
              >
                <div className="flex items-center gap-2 mb-4">
                  <Headphones className="w-4 h-4 text-gray-500" />
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    الحلقات السابقة
                  </h3>
                </div>

                <div className="space-y-3 max-h-80 overflow-y-auto">
                  {episodes.slice(1, 4).map((episode, index) => (
                    <motion.div
                      key={episode.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 + index * 0.1, duration: 0.3 }}
                    >
                      <EpisodeCard
                        episode={episode}
                        onPlay={handlePlayEpisode}
                        isPlaying={isPlaying}
                        isCurrentEpisode={currentEpisode?.id === episode.id}
                      />
                    </motion.div>
                  ))}
                </div>

                {episodes.length > 4 && (
                  <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                    <Link 
                      href="/podcast"
                      className="flex items-center justify-center gap-2 text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
                    >
                      <span>عرض جميع الحلقات ({episodes.length})</span>
                      <TrendingUp className="w-4 h-4" />
                    </Link>
                  </div>
                )}
              </motion.div>
            </div>
          </CardContent>
        </Card>
      </motion.section>

      {/* Mini Player العائم */}
      <MiniPlayer
        isVisible={showMiniPlayer && isPlaying}
        currentEpisode={currentEpisode}
        isPlaying={isPlaying}
        currentTime={currentTime}
        duration={duration}
        onTogglePlay={handleTogglePlay}
        onClose={() => setShowMiniPlayer(false)}
        progress={progress}
      />

      {/* عنصر الصوت المخفي */}
      {currentEpisode && (
        <audio
          ref={audioRef}
          src={currentEpisode.audioUrl}
          preload="metadata"
          className="hidden"
        />
      )}
    </>
  );
};

export default IntelligentPodcastBlock;
