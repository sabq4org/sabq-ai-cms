'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Play, 
  Pause, 
  Download,
  Calendar,
  Clock,
  Mic,
  Search,
  Radio,
  Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useDarkModeContext } from '@/contexts/DarkModeContext';


interface AudioNewsletter {
  id: string;
  title: string;
  content: string;
  audioUrl: string;
  duration: number;
  voice_name: string;
  created_at: string;
  play_count: number;
  is_featured: boolean;
  is_main_page: boolean;
}

export default function AudioArchivePage() {
  const { darkMode } = useDarkModeContext();
  const [newsletters, setNewsletters] = useState<AudioNewsletter[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null);

  useEffect(() => {
    fetchNewsletters();
  }, []);

  useEffect(() => {
    // تنظيف الصوت عند تغيير المشغل
    return () => {
      if (currentAudio) {
        currentAudio.pause();
        currentAudio.src = '';
      }
    };
  }, [currentAudio]);

  const fetchNewsletters = async () => {
    try {
      const response = await fetch('/api/audio/newsletters');
      const data = await response.json();
      
      if (data.success) {
        // فلتر النشرات المنشورة فقط
        const publishedNewsletters = data.newsletters.filter((nl: any) => nl.is_published);
        setNewsletters(publishedNewsletters);
      }
    } catch (error) {
      console.error('خطأ في جلب النشرات:', error);
    } finally {
      setLoading(false);
    }
  };

  const togglePlay = (newsletter: AudioNewsletter) => {
    if (playingId === newsletter.id) {
      // إيقاف التشغيل
      if (currentAudio) {
        currentAudio.pause();
        setPlayingId(null);
      }
    } else {
      // تشغيل جديد
      if (currentAudio) {
        currentAudio.pause();
      }
      
      const audio = new Audio(newsletter.audioUrl);
      audio.play();
      audio.onended = () => setPlayingId(null);
      
      setCurrentAudio(audio);
      setPlayingId(newsletter.id);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const filteredNewsletters = newsletters.filter(nl =>
    nl.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    nl.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className={cn(
      'min-h-screen py-8 px-2 sm:px-4',
      darkMode ? 'bg-gray-900' : 'bg-gray-50'
    )}>
      <div className="max-w-6xl mx-auto">
        {/* الهيدر */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className={cn(
              'p-4 rounded-full',
              darkMode ? 'bg-blue-900/30' : 'bg-blue-100'
            )}>
              <Radio className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          <h1 className={cn(
            'text-3xl sm:text-4xl font-bold mb-2',
            darkMode ? 'text-gray-100' : 'text-gray-900'
          )}>
            أرشيف النشرات الصوتية
          </h1>
          <p className={cn(
            'text-base sm:text-lg',
            darkMode ? 'text-gray-400' : 'text-gray-600'
          )}>
            استمع إلى جميع النشرات الإخبارية الصوتية
          </p>
        </div>

        {/* شريط البحث */}
        <div className="mb-6">
          <div className="relative max-w-md mx-auto">
            <Search className={cn(
              'absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5',
              darkMode ? 'text-gray-400' : 'text-gray-500'
            )} />
            <Input
              type="text"
              placeholder="ابحث عن نشرة..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={cn(
                'pr-10 w-full',
                darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'
              )}
            />
          </div>
        </div>

        {/* قائمة النشرات */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : filteredNewsletters.length === 0 ? (
          <div className="text-center py-12">
            <p className={cn(
              'text-lg',
              darkMode ? 'text-gray-400' : 'text-gray-600'
            )}>
              لم يتم العثور على نشرات
            </p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredNewsletters.map((newsletter) => (
              <Card
                key={newsletter.id}
                className={cn(
                  'overflow-hidden transition-all duration-300 hover:shadow-lg',
                  darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200',
                  newsletter.is_main_page && 'ring-2 ring-blue-500'
                )}
              >
                <div className="p-4 sm:p-5">
                  {/* رأس البطاقة */}
                  <div className="flex items-start gap-3 mb-3">
                    <div className={cn(
                      'p-2 rounded-lg flex-shrink-0',
                      darkMode ? 'bg-blue-900/30' : 'bg-blue-100'
                    )}>
                      <Mic className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className={cn(
                        'font-bold text-base line-clamp-2 mb-1',
                        darkMode ? 'text-gray-100' : 'text-gray-900'
                      )}>
                        {newsletter.title}
                      </h3>
                      <div className="flex flex-wrap items-center gap-2 text-xs">
                        {newsletter.is_main_page && (
                          <Badge variant="default" className="bg-blue-600">
                            نشرة رئيسية
                          </Badge>
                        )}
                        <span className={cn(
                          'flex items-center gap-1',
                          darkMode ? 'text-gray-400' : 'text-gray-600'
                        )}>
                          <Calendar className="w-3 h-3" />
                          {new Date(newsletter.created_at).toLocaleDateString('ar-SA', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* وصف مختصر */}
                  <p className={cn(
                    'text-sm mb-3 line-clamp-2',
                    darkMode ? 'text-gray-300' : 'text-gray-700'
                  )}>
                    {newsletter.content}
                  </p>

                  {/* معلومات إضافية */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3 text-xs">
                      <span className={cn(
                        'flex items-center gap-1',
                        darkMode ? 'text-gray-400' : 'text-gray-600'
                      )}>
                        <Clock className="w-3 h-3" />
                        {formatTime(newsletter.duration)}
                      </span>
                      <span className={cn(
                        'flex items-center gap-1',
                        darkMode ? 'text-gray-400' : 'text-gray-600'
                      )}>
                        <Play className="w-3 h-3" />
                        {newsletter.play_count} استماع
                      </span>
                    </div>
                  </div>

                  {/* أزرار التحكم */}
                  <div className="flex gap-2">
                    <Button
                      onClick={() => togglePlay(newsletter)}
                      className={cn(
                        'flex-1 text-sm',
                        playingId === newsletter.id
                          ? 'bg-red-600 hover:bg-red-700'
                          : 'bg-blue-600 hover:bg-blue-700'
                      )}
                    >
                      {playingId === newsletter.id ? (
                        <>
                          <Pause className="w-3.5 h-3.5 ml-1" />
                          إيقاف
                        </>
                      ) : (
                        <>
                          <Play className="w-3.5 h-3.5 ml-1" />
                          استماع
                        </>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(newsletter.audioUrl, '_blank')}
                      className="px-3"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 