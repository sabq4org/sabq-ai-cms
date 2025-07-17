'use client';

import { useState, useEffect, useRef } from 'react';
import { Play, Pause, Download, Volume2, Headphones, Clock, Mic, RefreshCw, Share2, CheckCircle, AlertCircle, Activity, Copy, Share } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface PodcastData {
  link: string;
  timestamp: string;
  duration: number;
}

interface ServiceStatus {
  success: boolean;
  status: string;
  message?: string;
  error?: string;
  connection?: any;
  voices?: any;
  usage?: any;
  service_health?: any;
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
  const [serviceStatus, setServiceStatus] = useState<ServiceStatus | null>(null);
  const [checkingStatus, setCheckingStatus] = useState(false);
  const [showStatusDetails, setShowStatusDetails] = useState(false);
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
      // جلب آخر نشرة منشورة من الأرشيف
      const res = await fetch('/api/audio/archive?published=true&latest=true');
      
      if (!res.ok) {
        throw new Error('Failed to fetch podcast');
      }
      
      const data = await res.json();
      
      if (data.success && data.podcast) {
        setPodcast({
          link: data.podcast.url,
          timestamp: data.podcast.created_at,
          duration: parseInt(data.podcast.duration) || 3
        });
      }
    } catch (err) {
      console.error('Error fetching podcast:', err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  // فحص حالة خدمة ElevenLabs
  const checkServiceStatus = async () => {
    setCheckingStatus(true);
    
    try {
      const response = await fetch('/api/audio/status');
      const data = await response.json();
      
      setServiceStatus(data);
      
      if (data.success) {
        toast.success(`✅ ${data.message}`, { duration: 4000 });
        
        // عرض تفاصيل الخدمة
        toast.custom((t) => (
          <div className="bg-white p-4 rounded-lg shadow-lg border border-green-200 max-w-md">
            <div className="flex items-center gap-3 mb-3">
              <Activity className="w-6 h-6 text-green-600" />
              <div>
                <h3 className="font-semibold text-gray-800">حالة الخدمة</h3>
                <p className="text-sm text-green-600">تعمل بنجاح</p>
              </div>
            </div>
            {data.voices && (
              <div className="text-sm text-gray-600 mb-2">
                <p>🎙️ الأصوات: {data.voices.total_voices} متاح</p>
                <p>📊 Bradford: {data.voices.bradford_available ? '✅ متاح' : '❌ غير متاح'}</p>
              </div>
            )}
            {data.usage && (
              <div className="text-sm text-gray-600">
                <p>📈 الاستخدام: {data.usage.characters.percentage}% ({data.usage.characters.used}/{data.usage.characters.limit})</p>
              </div>
            )}
          </div>
        ), {
          duration: 6000,
          position: 'top-center'
        });
      } else {
        toast.error(`❌ ${data.error}`, { duration: 6000 });
        
        toast.custom((t) => (
          <div className="bg-white p-4 rounded-lg shadow-lg border border-red-200 max-w-md">
            <div className="flex items-center gap-3 mb-3">
              <AlertCircle className="w-6 h-6 text-red-600" />
              <div>
                <h3 className="font-semibold text-gray-800">مشكلة في الخدمة</h3>
                <p className="text-sm text-red-600">{data.error}</p>
              </div>
            </div>
            {data.details && (
              <p className="text-xs text-gray-500 mb-2">{data.details}</p>
            )}
            {data.troubleshooting && (
              <div className="text-xs text-gray-600">
                <p className="font-semibold mb-1">خطوات الحل:</p>
                <ul className="list-disc list-inside space-y-1">
                  {data.troubleshooting.map((step: string, index: number) => (
                    <li key={index}>{step}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ), {
          duration: 10000,
          position: 'top-center'
        });
      }
    } catch (error: any) {
      console.error('❌ خطأ في فحص الحالة:', error);
      toast.error('❌ فشل في فحص حالة الخدمة', { duration: 4000 });
    } finally {
      setCheckingStatus(false);
    }
  };

  const generateNewPodcast = async () => {
    setGenerating(true);
    
    // إشعار البداية
    const loadingToast = toast.loading('🎙️ جارٍ توليد النشرة الصوتية...', {
      duration: 0,
    });
    
    try {
      let newsText = '';
      
      try {
        // 1. محاولة جلب آخر الأخبار
        toast.loading('📰 جلب آخر الأخبار...', { id: loadingToast });
        const articlesRes = await fetch('/api/articles?limit=5&sort=created_at&order=desc');
        
        if (articlesRes.ok) {
          const articlesData = await articlesRes.json();
          const articles = articlesData.articles || [];
          
          if (articles.length > 0) {
            // إنشاء نص من العناوين والملخصات
            newsText = `أهلاً بكم في النشرة الصوتية اليومية لصحيفة سبق. إليكم أهم الأخبار:\n\n`;
            newsText += articles.map((article: any, index: number) => {
              const title = article.title || 'خبر بدون عنوان';
              const excerpt = article.excerpt || article.summary || '';
              return `الخبر ${index + 1}: ${title}. ${excerpt}`;
            }).join('\n\n');
            newsText += '\n\nكانت هذه نشرتكم الصوتية اليومية. شكراً لاستماعكم.';
          }
        }
      } catch (fetchError) {
        console.error('خطأ في جلب المقالات:', fetchError);
      }
      
      // 2. إذا فشل جلب الأخبار، استخدم نص تجريبي
      if (!newsText) {
        toast.loading('✍️ إنشاء نشرة تجريبية...', { id: loadingToast });
        newsText = `
          أهلاً بكم في النشرة الصوتية اليومية لصحيفة سبق.
          
          نعتذر عن عدم توفر الأخبار في الوقت الحالي، لكن إليكم نشرة تجريبية:
          
          الخبر الأول: المملكة العربية السعودية تواصل تقدمها في مجال التحول الرقمي وتحقق إنجازات نوعية في مشاريع الذكاء الاصطناعي.
          
          الخبر الثاني: نمو ملحوظ في قطاع السياحة السعودي مع استقبال ملايين الزوار في الربع الأول من العام.
          
          الخبر الثالث: إطلاق مبادرات جديدة لدعم رواد الأعمال والمشاريع الناشئة في المملكة.
          
          كانت هذه نشرتكم الصوتية التجريبية. شكراً لاستماعكم.
        `.trim();
      }
      
      // 3. توليد الصوت
      toast.loading('🔊 تحويل النص إلى صوت...', { id: loadingToast });
      const audioRes = await fetch('/api/audio/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          summary: newsText,
          voice: 'arabic_male',
          filename: 'daily-podcast',
          language: 'arabic',
          is_daily: true // إضافة علامة النشرة اليومية
        })
      });
      
      if (!audioRes.ok) {
        const error = await audioRes.json();
        throw new Error(error.details || error.error || 'فشل توليد الصوت');
      }
      
      const data = await audioRes.json();
      
      // 4. تحديث البيانات المحلية
      if (data.success) {
        // جلب البيانات المحدثة من الأرشيف
        const archiveRes = await fetch('/api/audio/archive?published=true&latest=true');
        const archiveData = await archiveRes.json();
        
        if (archiveData.success && archiveData.podcast) {
          setPodcast({
            link: archiveData.podcast.url,
            timestamp: archiveData.podcast.created_at,
            duration: parseInt(archiveData.podcast.duration) || 3
          });
        }
        
        // إشعارات النجاح
        toast.dismiss(loadingToast);
        toast.success('✅ تم توليد النشرة الصوتية بنجاح!', {
          duration: 5000,
          icon: '🎉'
        });
        
        // إشعار إضافي مع خيارات
        toast.custom((t) => (
          <div className="bg-white p-4 rounded-lg shadow-lg border border-green-200 max-w-md">
            <div className="flex items-center gap-3 mb-3">
              <CheckCircle className="w-6 h-6 text-green-600" />
              <div>
                <h3 className="font-semibold text-gray-800">النشرة جاهزة!</h3>
                <p className="text-sm text-gray-600">المدة: {data.duration_estimate || '3 دقائق'}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  togglePlay();
                  toast.dismiss(t.id);
                }}
                className="flex-1 bg-green-600 text-white py-2 px-3 rounded text-sm hover:bg-green-700"
              >
                🎵 تشغيل
              </button>
              <a
                href={data.url}
                download
                onClick={() => toast.dismiss(t.id)}
                className="flex-1 bg-blue-600 text-white py-2 px-3 rounded text-sm hover:bg-blue-700 text-center"
              >
                📥 تحميل
              </a>
            </div>
          </div>
        ), {
          duration: 8000,
          position: 'top-center'
        });
        
      } else {
        throw new Error(data.error || 'فشل في توليد النشرة');
      }
    } catch (error: any) {
      console.error('خطأ في توليد النشرة:', error);
      toast.dismiss(loadingToast);
      
      // إشعار الخطأ مع التفاصيل
      toast.error(
        <div>
          <p className="font-semibold">❌ فشل توليد النشرة</p>
          <p className="text-sm mt-1">{error.message}</p>
        </div>,
        { duration: 6000 }
      );
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

  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    if (diffInHours < 1) return 'منذ دقائق';
    if (diffInHours < 24) return `منذ ${diffInHours} ساعة`;
    return `منذ ${Math.floor(diffInHours / 24)} يوم`;
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
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md mb-8 overflow-hidden border border-gray-100 dark:border-gray-700">
      {/* الهيدر البسيط */}
      <div className="p-4 sm:p-6 pb-0">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
          {/* القسم الأيسر - العنوان والأيقونة */}
          <div className="flex items-center gap-3">
            {/* أيقونة السماعة */}
            <div className="bg-gray-100 dark:bg-gray-700/50 p-3 rounded-xl">
              <Headphones className="w-6 h-6 text-gray-700 dark:text-gray-300" />
            </div>
            {/* العنوان والتاريخ */}
            <div>
              <h3 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-red-600 to-red-700 bg-clip-text text-transparent">
                النشرة اليومية الصباحية
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                {podcast ? formatTimestamp(podcast.timestamp) : 'لا توجد نشرة'}
              </p>
            </div>
          </div>
          {/* شارة الذكاء الاصطناعي */}
          <div className="bg-gray-50 dark:bg-gray-700/30 px-3 py-1.5 rounded-full self-start sm:self-auto">
            <span className="text-xs text-gray-600 dark:text-gray-400 font-medium flex items-center gap-1">
              <Mic className="w-3 h-3" />
              بالذكاء الاصطناعي
            </span>
          </div>
        </div>
      </div>

      {/* المحتوى الرئيسي */}
      <div className="p-4 sm:p-6 pt-2">
        {podcast ? (
          <div className="flex flex-col sm:flex-row items-start gap-4">
            {/* قسم زر التشغيل */}
            <div className="flex flex-col items-center gap-2 mx-auto sm:mx-0">
              {/* مشغل الصوت المخفي */}
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

              {/* زر التشغيل الدائري الأنيق */}
              <button
                onClick={togglePlay}
                className={`
                  relative w-16 h-16 flex items-center justify-center
                  bg-gradient-to-br from-gray-800 to-gray-900 dark:from-gray-700 dark:to-gray-800
                  hover:from-gray-900 hover:to-black
                  text-white rounded-full
                  shadow-lg hover:shadow-xl
                  transform transition-all duration-200
                  hover:scale-105 active:scale-95
                  group
                `}
                disabled={!podcast?.link}
                aria-label={isPlaying ? 'إيقاف' : 'تشغيل'}
              >
                {/* الأيقونة */}
                {isPlaying ? (
                  <Pause className="w-7 h-7 text-white fill-white" />
                ) : (
                  <Play className="w-7 h-7 text-white fill-white mr-0.5" />
                )}
                
                {/* حلقة خارجية عند التشغيل */}
                {isPlaying && (
                  <div className="absolute inset-0 rounded-full border-2 border-gray-300 dark:border-gray-600 animate-ping opacity-75" />
                )}
              </button>
              
              {/* النص التوضيحي */}
              <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                <Headphones className="w-3.5 h-3.5" />
                استمع الآن
              </p>
            </div>

            {/* قسم المعلومات */}
            <div className="flex-1">
              {/* عنوان النشرة والمدة */}
              <div className="mb-3">
                <h4 className="font-bold text-gray-900 dark:text-white text-lg">
                  نشرة أخبار اليوم الصباحية
                </h4>
                <div className="flex items-center gap-3 mt-1">
                  <span className="flex items-center gap-1 text-sm text-green-600 dark:text-green-400">
                    <Clock className="w-3.5 h-3.5" />
                    <span className="font-medium">{formatTime(duration || podcast.duration * 60)}</span>
                  </span>
                  <span className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
                    <CheckCircle className="w-3.5 h-3.5" />
                    جودة عالية
                  </span>
                </div>
              </div>

              {/* الوصف */}
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 leading-relaxed">
                استمع لملخص أهم الأخبار والأحداث في دقائق معدودة
              </p>

              {/* أزرار التحكم الأفقية */}
              <div className="flex flex-wrap items-center gap-2">
                {/* زر التحميل */}
                <a
                  href={podcast.link}
                  download
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg text-sm font-medium transition-colors group"
                  title="تحميل النشرة"
                >
                  <Download className="w-3.5 h-3.5 group-hover:translate-y-0.5 transition-transform" />
                  تحميل
                </a>

                {/* زر المشاركة */}
                <button
                  onClick={() => {
                    if (navigator.share) {
                      navigator.share({
                        title: 'النشرة الصوتية - صحيفة سبق',
                        text: 'استمع لآخر الأخبار في نشرة صوتية مميزة',
                        url: podcast.link
                      }).catch(() => {});
                    } else {
                      toast.success('تم نسخ الرابط!');
                      navigator.clipboard.writeText(podcast.link);
                    }
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg text-sm font-medium transition-colors group"
                  title="مشاركة عبر واتساب"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  مشاركة
                </button>

                {/* زر نسخ الرابط */}
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(podcast.link);
                    toast.success('تم نسخ الرابط!');
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg text-sm font-medium transition-colors group"
                  title="نسخ الرابط"
                >
                  <Copy className="w-3.5 h-3.5" />
                  نسخ الرابط
                </button>
              </div>

              {/* شريط التقدم - يظهر فقط عند التشغيل */}
              {(isPlaying || progress > 0) && (
                <div className="mt-4">
                  <div 
                    className="relative h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full cursor-pointer overflow-hidden"
                    onClick={handleProgressClick}
                  >
                    <div 
                      className="absolute inset-y-0 left-0 bg-gradient-to-r from-red-500 to-red-600 rounded-full transition-all duration-100"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <div className="flex justify-between mt-1 text-xs text-gray-500 dark:text-gray-400">
                    <span>{formatTime(currentTime)}</span>
                    <span>{formatTime(duration)}</span>
                  </div>
                </div>
              )}

              {/* مؤشرات الصوت - مبسطة */}
              {isPlaying && (
                <div className="flex items-center gap-0.5 h-6 mt-3">
                  {[...Array(15)].map((_, i) => (
                    <div
                      key={i}
                      className="w-0.5 bg-red-400 dark:bg-red-500 rounded-full animate-pulse opacity-60"
                      style={{
                        height: Math.random() * 16 + 8 + 'px',
                        animationDelay: i * 0.1 + 's'
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          /* حالة عدم وجود نشرة */
          <div className="text-center py-12">
            <div className="bg-gray-100 dark:bg-gray-700/50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Headphones className="w-10 h-10 text-gray-400 dark:text-gray-500" />
            </div>
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              لا توجد نشرة صوتية متاحة
            </h4>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              يتم تحديث النشرة الصوتية بشكل يومي
            </p>
          </div>
        )}
      </div>
    </div>
  );
} 