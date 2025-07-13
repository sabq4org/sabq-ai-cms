'use client';

import { useState, useEffect, useRef } from 'react';
import { Radio, Play, Pause, Download, Volume2, Headphones, Sparkles, Clock, Mic, RefreshCw, Share2, Calendar, TrendingUp, Zap } from 'lucide-react';

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
      <div className="relative overflow-hidden bg-gradient-to-br from-blue-900 via-purple-800 to-pink-700 rounded-3xl p-8 mb-8 animate-pulse">
        <div className="absolute inset-0 bg-black/20 backdrop-blur-sm"></div>
        <div className="relative h-32"></div>
      </div>
    );
  }

  // عرض حالة أفضل عندما لا توجد نشرة
  if (!podcast || error) {
    return (
      <div className="relative overflow-hidden bg-gradient-to-br from-blue-900 via-purple-800 to-pink-700 rounded-3xl p-6 mb-8 shadow-2xl">
        {/* خلفية متحركة */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-4 -right-4 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
          <div className="absolute -bottom-8 -left-4 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000"></div>
        </div>

        {/* طبقة شفافة */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>

        <div className="relative z-10">
          <div className="flex flex-col md:flex-row items-center gap-6">
            {/* القسم الأيسر - المحتوى */}
            <div className="flex-1 text-center md:text-right">
              {/* العنوان الرئيسي */}
              <div className="flex items-center justify-center md:justify-start gap-3 mb-4">
                <div className="bg-white/20 backdrop-blur-md p-3 rounded-xl">
                  <Headphones className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white mb-1">
                    استمع الآن لنشرة سبق الصوتية 📢
                  </h3>
                  <p className="text-white/80 text-sm flex items-center gap-2">
                    <Zap className="w-4 h-4" />
                    نلخص لك أهم 5 أخبار في أقل من دقيقتين
                  </p>
                </div>
              </div>

              {/* المميزات */}
              <div className="grid grid-cols-3 gap-3 mb-6">
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-center">
                  <TrendingUp className="w-5 h-5 text-green-400 mx-auto mb-1" />
                  <p className="text-white/90 text-xs font-medium">أخبار محدثة</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-center">
                  <Mic className="w-5 h-5 text-blue-400 mx-auto mb-1" />
                  <p className="text-white/90 text-xs font-medium">صوت واضح</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-center">
                  <Clock className="w-5 h-5 text-purple-400 mx-auto mb-1" />
                  <p className="text-white/90 text-xs font-medium">دقيقتان فقط</p>
                </div>
              </div>

              {/* الأزرار */}
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={generateNewPodcast}
                  disabled={generating}
                  className="flex-1 bg-white text-purple-700 px-6 py-3 rounded-xl font-bold hover:bg-white/90 transition-all transform hover:scale-105 shadow-lg flex items-center justify-center gap-2"
                >
                  {generating ? (
                    <>
                      <RefreshCw className="w-5 h-5 animate-spin" />
                      جاري التوليد...
                    </>
                  ) : (
                    <>
                      <Play className="w-5 h-5" />
                      توليد نشرة جديدة الآن
                    </>
                  )}
                </button>
                
                <button
                  onClick={shareLink}
                  className="bg-white/20 backdrop-blur-md px-4 py-3 rounded-xl hover:bg-white/30 transition-all text-white font-medium flex items-center justify-center gap-2"
                >
                  <Share2 className="w-5 h-5" />
                  مشاركة
                </button>
              </div>
            </div>

            {/* القسم الأيمن - معاينة */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
              <div className="text-center mb-4">
                <div className="bg-gradient-to-br from-pink-500 to-purple-500 p-6 rounded-full inline-block mb-3 shadow-2xl">
                  <Radio className="w-12 h-12 text-white" />
                </div>
                <p className="text-white/90 font-medium">نموذج من النشرة</p>
              </div>
              
              <div className="space-y-2 text-white/70 text-sm">
                <p>🎯 أهم الأخبار المحلية</p>
                <p>💼 تطورات اقتصادية</p>
                <p>🏆 إنجازات رياضية</p>
                <p>🌍 أخبار عالمية مؤثرة</p>
                <p>📱 جديد التقنية</p>
              </div>
              
              <div className="mt-4 pt-4 border-t border-white/20">
                <p className="text-white/60 text-xs text-center">
                  <Calendar className="w-3 h-3 inline ml-1" />
                  يتم التحديث كل 6 ساعات
                </p>
              </div>
            </div>
          </div>
        </div>

        <style jsx>{`
          @keyframes blob {
            0% {
              transform: translate(0px, 0px) scale(1);
            }
            33% {
              transform: translate(30px, -50px) scale(1.1);
            }
            66% {
              transform: translate(-20px, 20px) scale(0.9);
            }
            100% {
              transform: translate(0px, 0px) scale(1);
            }
          }
          .animate-blob {
            animation: blob 7s infinite;
          }
          .animation-delay-2000 {
            animation-delay: 2s;
          }
          .animation-delay-4000 {
            animation-delay: 4s;
          }
        `}</style>
      </div>
    );
  }

  // عرض النشرة الموجودة
  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-blue-900 via-purple-800 to-pink-700 rounded-3xl p-8 mb-8 shadow-2xl transform hover:scale-[1.01] transition-all duration-300">
      {/* خلفية متحركة */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-4 -right-4 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
        <div className="absolute -bottom-8 -left-4 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000"></div>
      </div>

      {/* طبقة شفافة */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>

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
      
      <div className="relative z-10">
        {/* الهيدر */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-4">
            {/* أيقونة متحركة */}
            <div className="relative">
              <div className="absolute inset-0 bg-white/20 rounded-2xl blur-xl animate-pulse"></div>
              <div className="relative bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20">
                <Radio className="w-10 h-10 text-white" />
                {isPlaying && (
                  <div className="absolute -top-1 -right-1">
                    <span className="flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                    </span>
                  </div>
                )}
              </div>
            </div>
            
            {/* معلومات النشرة */}
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-2xl font-bold text-white">النشرة الصوتية اليومية</h3>
                <div className="flex items-center gap-2">
                  <span className="bg-gradient-to-r from-yellow-400 to-orange-500 px-3 py-1 rounded-full text-xs font-bold text-white shadow-lg animate-pulse">
                    <Sparkles className="w-3 h-3 inline mr-1" />
                    جديد
                  </span>
                  <span className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-xs text-white/90">
                    <Mic className="w-3 h-3 inline mr-1" />
                    AI
                  </span>
                </div>
              </div>
              <p className="text-white/80 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                آخر أخبار صحيفة سبق • {formatTimestamp(podcast.timestamp)}
              </p>
            </div>
          </div>

          {/* أزرار التحكم */}
          <div className="flex items-center gap-2">
            <button
              onClick={shareLink}
              className="bg-white/10 backdrop-blur-md p-3 rounded-xl hover:bg-white/20 transition-all border border-white/20"
              aria-label="مشاركة"
            >
              <Share2 className="w-5 h-5 text-white" />
            </button>
            <a
              href={podcast.link}
              download
              className="bg-white/10 backdrop-blur-md p-3 rounded-xl hover:bg-white/20 transition-all border border-white/20 group"
              aria-label="تحميل النشرة"
            >
              <Download className="w-5 h-5 text-white group-hover:scale-110 transition-transform" />
            </a>
          </div>
        </div>

        {/* مشغل الصوت */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
          <div className="flex items-center gap-4 mb-4">
            {/* زر التشغيل الرئيسي */}
            <button
              onClick={togglePlay}
              className="relative group"
              aria-label={isPlaying ? 'إيقاف' : 'تشغيل'}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full blur-lg group-hover:blur-xl transition-all opacity-70"></div>
              <div className="relative bg-gradient-to-r from-pink-500 to-purple-500 p-4 rounded-full shadow-2xl transform group-hover:scale-105 transition-all">
                {isPlaying ? (
                  <Pause className="w-8 h-8 text-white" />
                ) : (
                  <Play className="w-8 h-8 text-white mr-1" />
                )}
              </div>
            </button>

            {/* معلومات المسار */}
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <span className="text-white/90 font-medium flex items-center gap-2">
                  <Headphones className="w-4 h-4" />
                  نشرة أخبار اليوم
                </span>
                <span className="text-white/70 text-sm">
                  {formatTime(currentTime)} / {formatTime(duration || podcast.duration * 60)}
                </span>
              </div>

              {/* شريط التقدم */}
              <div 
                className="relative h-2 bg-white/20 rounded-full cursor-pointer overflow-hidden group"
                onClick={handleProgressClick}
              >
                <div 
                  className="absolute inset-y-0 left-0 bg-gradient-to-r from-pink-400 to-purple-400 rounded-full transition-all duration-100"
                  style={{ width: `${progress}%` }}
                >
                  <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </div>
              </div>
            </div>
          </div>

          {/* مؤشرات الصوت المتحركة */}
          {isPlaying && (
            <div className="flex items-center justify-center gap-1 mt-4">
              <Volume2 className="w-4 h-4 text-white/60 mr-2" />
              {[...Array(30)].map((_, i) => (
                <div
                  key={i}
                  className="w-1 bg-gradient-to-t from-pink-400 to-purple-400 rounded-full"
                  style={{
                    height: Math.sin((i / 30) * Math.PI * 2 + (Date.now() / 200)) * 15 + 20 + 'px',
                    opacity: 0.6 + Math.sin((i / 30) * Math.PI) * 0.4,
                    transition: 'height 0.1s ease-out'
                  }}
                />
              ))}
            </div>
          )}
        </div>

        {/* رسالة تحفيزية */}
        <div className="mt-4 text-center">
          <p className="text-white/70 text-sm">
            🎧 استمع لآخر الأخبار بتقنية الذكاء الاصطناعي
          </p>
        </div>
      </div>

      <style jsx>{`
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
} 