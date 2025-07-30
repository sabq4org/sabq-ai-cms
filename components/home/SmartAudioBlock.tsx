'use client';

import { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Play, 
  Pause, 
  Volume2, 
  Clock, 
  Radio,
  Archive,
  Mic,
  Download,
  Loader2,
  Brain,
  TrendingUp,
  MessageSquare,
  Lightbulb,
  Sparkles,
  BarChart3,
  Zap,
  Globe
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useDarkModeContext } from '@/contexts/DarkModeContext';

interface AudioNewsletter {
  id: string;
  title: string;
  content: string;
  audioUrl: string;
  voice_name: string;
  created_at: string;
  play_count: number;
}

// مكون النشرة الصوتية المضغوطة
function CompactPodcastSection() {
  const { darkMode } = useDarkModeContext();
  const [newsletter, setNewsletter] = useState<AudioNewsletter | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);

  // جلب النشرة الرئيسية
  useEffect(() => {
    fetchMainNewsletter();
  }, []);

  const fetchMainNewsletter = async () => {
    try {
      setError(null);
      const response = await fetch('/api/audio/newsletters/main-page');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success && data.newsletter) {
        setNewsletter(data.newsletter);
        setDuration(data.newsletter.duration);
      } else {
        setNewsletter(null);
      }
    } catch (error) {
      console.error('❌ خطأ في جلب النشرة:', error);
      setError(error instanceof Error ? error.message : 'خطأ في جلب النشرة الصوتية');
      setNewsletter(null);
    } finally {
      setIsLoading(false);
    }
  };

  // معالجة تشغيل/إيقاف الصوت
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

  // عند انتهاء التشغيل
  const handleEnded = () => {
    setIsPlaying(false);
    setCurrentTime(0);
  };

  // تنسيق الوقت
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // إذا كان في حالة التحميل
  if (isLoading) {
    return (
      <div className={`h-[160px] rounded-2xl border-2 border-dashed flex items-center justify-center ${
        darkMode 
          ? 'bg-gray-800/50 border-gray-600 text-gray-300' 
          : 'bg-blue-50/50 border-blue-200 text-gray-600'
      }`}>
        <div className="flex items-center gap-3">
          <div className="animate-spin w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
          <span className="text-sm font-medium">جاري التحميل...</span>
        </div>
      </div>
    );
  }

  // إذا حدث خطأ أو لا توجد نشرة
  if (error || !newsletter) {
    return (
      <div className={`h-[160px] rounded-2xl border-2 border-dashed flex flex-col items-center justify-center text-center p-4 ${
        darkMode 
          ? 'bg-gray-800/50 border-gray-600 text-gray-300' 
          : 'bg-amber-50/50 border-amber-200 text-gray-600'
      }`}>
        <span className="text-2xl mb-2">🎙️</span>
        <h3 className="text-sm font-bold mb-1">النشرة الصوتية</h3>
        <p className="text-xs opacity-75 mb-2">
          {error ? 'خطأ في التحميل' : 'لا توجد نشرة حالياً'}
        </p>
        <button 
          onClick={fetchMainNewsletter}
          className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
            darkMode 
              ? 'bg-gray-700 hover:bg-gray-600 text-gray-200' 
              : 'bg-amber-100 hover:bg-amber-200 text-amber-700'
          }`}
        >
          🔄 تحديث
        </button>
      </div>
    );
  }

  return (
    <div className={cn(
      'h-[160px] p-4 rounded-2xl transition-all duration-300',
      darkMode ? 'bg-gray-800 border-gray-700' : 'bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200'
    )}>
      {/* الرأس المضغوط */}
      <div className="flex items-center gap-3 mb-3">
        <div className={cn(
          'p-2 rounded-lg flex-shrink-0',
          darkMode ? 'bg-blue-900/30' : 'bg-blue-100'
        )}>
          <Mic className="w-4 h-4 text-blue-600" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className={cn(
            'text-sm font-bold line-clamp-1',
            darkMode ? 'text-gray-100' : 'text-gray-900'
          )}>
            {newsletter.title}
          </h3>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant="secondary" className="text-xs">
              <Radio className="w-3 h-3 mr-1" />
              نشرة
            </Badge>
          </div>
        </div>
      </div>

      {/* مشغل الصوت المضغوط */}
      <div className={cn(
        'p-3 rounded-lg mb-3',
        darkMode ? 'bg-gray-900/50' : 'bg-white/80'
      )}>
        <div className="flex items-center gap-3">
          {/* زر التشغيل المضغوط */}
          <Button
            onClick={togglePlayPause}
            size="sm"
            className={cn(
              'rounded-full w-10 h-10 flex-shrink-0',
              isPlaying 
                ? 'bg-red-600 hover:bg-red-700' 
                : 'bg-blue-600 hover:bg-blue-700'
            )}
          >
            {isPlaying ? (
              <Pause className="w-4 h-4" />
            ) : (
              <Play className="w-4 h-4 ml-0.5" />
            )}
          </Button>

          {/* شريط التقدم المضغوط */}
          <div className="flex-1">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
                {formatTime(currentTime)}
              </span>
              <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
                {formatTime(duration)}
              </span>
            </div>
            <div className={cn(
              'h-1.5 rounded-full overflow-hidden',
              darkMode ? 'bg-gray-700' : 'bg-gray-200'
            )}>
              <div 
                className="h-full bg-blue-600 transition-all duration-300"
                style={{ width: `${(currentTime / duration) * 100}%` }}
              />
            </div>
          </div>

          {/* زر التحميل المضغوط */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.open(newsletter.audioUrl, '_blank')}
            className="flex-shrink-0 p-2"
          >
            <Download className="w-3 h-3" />
          </Button>
        </div>
      </div>

      {/* الأزرار السفلى */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 text-xs">
          <span className={cn(
            'flex items-center gap-1',
            darkMode ? 'text-gray-400' : 'text-gray-600'
          )}>
            <Play className="w-3 h-3" />
            {newsletter.play_count}
          </span>
        </div>
        
        <Link href="/audio-archive">
          <Button variant="ghost" size="sm" className="text-xs">
            <Archive className="w-3 h-3 mr-1" />
            الأرشيف
          </Button>
        </Link>
      </div>

      {/* عنصر الصوت المخفي */}
      <audio
        ref={audioRef}
        src={newsletter.audioUrl}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleEnded}
        onLoadedMetadata={(e) => {
          const audio = e.target as HTMLAudioElement;
          setDuration(audio.duration);
        }}
      />
    </div>
  );
}

// مكون الوحدة الذكية
function SmartModule() {
  const { darkMode } = useDarkModeContext();
  const [activeModule, setActiveModule] = useState<'sentiment' | 'fact'>('sentiment');
  const [sentimentData, setSentimentData] = useState({
    topic: 'القرار الاقتصادي الجديد',
    sentiment: 'إيجابي',
    percentage: 78,
    trend: 'صاعد'
  });
  
  const [factData, setFactData] = useState({
    title: 'معلومة ذكية',
    fact: 'السعودية تحتل المرتبة الأولى عالمياً في إنتاج ماء الورد، بإنتاج يصل إلى 300 طن سنوياً من منطقة الطائف.',
    source: 'الهيئة العامة للإحصاء'
  });

  useEffect(() => {
    // محاكاة تحديث البيانات كل 30 ثانية
    const interval = setInterval(() => {
      if (activeModule === 'sentiment') {
        setSentimentData(prev => ({
          ...prev,
          percentage: Math.floor(Math.random() * 40) + 60 // 60-100%
        }));
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [activeModule]);

  return (
    <div className={cn(
      'h-[160px] p-4 rounded-2xl transition-all duration-300',
      darkMode ? 'bg-gray-800 border-gray-700' : 'bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200'
    )}>
      {/* رأس الوحدة الذكية */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className={cn(
            'p-2 rounded-lg flex-shrink-0',
            darkMode ? 'bg-purple-900/30' : 'bg-purple-100'
          )}>
            <Brain className="w-4 h-4 text-purple-600" />
          </div>
          <h3 className={cn(
            'text-sm font-bold',
            darkMode ? 'text-gray-100' : 'text-gray-900'
          )}>
            وحدة ذكية
          </h3>
        </div>
        
        {/* أزرار التبديل */}
        <div className="flex gap-1">
          <button
            onClick={() => setActiveModule('sentiment')}
            className={cn(
              'p-1 rounded-lg transition-colors text-xs',
              activeModule === 'sentiment'
                ? (darkMode ? 'bg-purple-700 text-white' : 'bg-purple-600 text-white')
                : (darkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-600 hover:bg-gray-300')
            )}
          >
            <MessageSquare className="w-3 h-3" />
          </button>
          <button
            onClick={() => setActiveModule('fact')}
            className={cn(
              'p-1 rounded-lg transition-colors text-xs',
              activeModule === 'fact'
                ? (darkMode ? 'bg-purple-700 text-white' : 'bg-purple-600 text-white')
                : (darkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-600 hover:bg-gray-300')
            )}
          >
            <Lightbulb className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* محتوى الوحدة */}
      <div className="h-[100px] overflow-hidden">
        {activeModule === 'sentiment' ? (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-green-600" />
              <h4 className={cn(
                'text-xs font-bold',
                darkMode ? 'text-gray-200' : 'text-gray-800'
              )}>
                تحليل رأي الجمهور
              </h4>
            </div>
            
            <div className={cn(
              'p-3 rounded-lg',
              darkMode ? 'bg-gray-900/50' : 'bg-white/80'
            )}>
              <p className={cn(
                'text-xs mb-2 line-clamp-2',
                darkMode ? 'text-gray-300' : 'text-gray-700'
              )}>
                💬 <strong>"{sentimentData.topic}"</strong>
              </p>
              
              <div className="flex items-center gap-2 mb-2">
                <div className={cn(
                  'w-8 h-2 rounded-full overflow-hidden',
                  darkMode ? 'bg-gray-700' : 'bg-gray-200'
                )}>
                  <div 
                    className="h-full bg-green-500 transition-all duration-500"
                    style={{ width: `${sentimentData.percentage}%` }}
                  />
                </div>
                <span className={cn(
                  'text-xs font-bold',
                  darkMode ? 'text-green-400' : 'text-green-600'
                )}>
                  {sentimentData.percentage}% {sentimentData.sentiment}
                </span>
              </div>
              
              <div className="flex items-center gap-1">
                <Zap className="w-3 h-3 text-blue-500" />
                <span className={cn(
                  'text-xs',
                  darkMode ? 'text-gray-400' : 'text-gray-600'
                )}>
                  الاتجاه: {sentimentData.trend}
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-yellow-600" />
              <h4 className={cn(
                'text-xs font-bold',
                darkMode ? 'text-gray-200' : 'text-gray-800'
              )}>
                {factData.title}
              </h4>
            </div>
            
            <div className={cn(
              'p-3 rounded-lg',
              darkMode ? 'bg-gray-900/50' : 'bg-white/80'
            )}>
              <p className={cn(
                'text-xs mb-2 line-clamp-3 leading-relaxed',
                darkMode ? 'text-gray-300' : 'text-gray-700'
              )}>
                🤖 <strong>هل تعلم أن</strong> {factData.fact}
              </p>
              
              <div className="flex items-center gap-1 mt-2">
                <Globe className="w-3 h-3 text-blue-500" />
                <span className={cn(
                  'text-xs opacity-75',
                  darkMode ? 'text-gray-400' : 'text-gray-600'
                )}>
                  المصدر: {factData.source}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// المكون الرئيسي
export default function SmartAudioBlock() {
  const { darkMode } = useDarkModeContext();

  return (
    <div className="w-full mb-6 px-2 sm:px-0">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* النشرة الصوتية المضغوطة - يسار */}
        <CompactPodcastSection />
        
        {/* الوحدة الذكية - يمين */}
        <SmartModule />
      </div>
    </div>
  );
}