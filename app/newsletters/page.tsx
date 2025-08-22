'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useDarkModeContext } from '@/contexts/DarkModeContext';
import { 
  Play, 
  Pause, 
  Download, 
  Calendar, 
  Clock, 
  Volume2, 
  FileAudio, 
  ArrowLeft,
  Headphones,
  Star,
  RefreshCw
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface Newsletter {
  id: string;
  title: string;
  content: string;
  audioUrl: string;
  duration: number;
  voice_name: string;
  language: string;
  category: string;
  is_published: boolean;
  is_featured: boolean;
  play_count: number;
  created_at: string;
  updated_at: string;
}

export default function NewslettersArchive() {
  const { darkMode } = useDarkModeContext();
  const [newsletters, setNewsletters] = useState<Newsletter[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPlaying, setCurrentPlaying] = useState<string | null>(null);
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null);

  useEffect(() => {
    fetchNewsletters();
  }, []);

  const fetchNewsletters = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/audio/newsletters');
      
      if (!response.ok) {
        throw new Error('فشل في جلب النشرات');
      }
      
      const data = await response.json();
      
      if (data.success && data.newsletters) {
        // ترتيب النشرات المنشورة فقط حسب التاريخ
        const publishedNewsletters = data.newsletters
          .filter((newsletter: Newsletter) => newsletter.is_published)
          .sort((a: Newsletter, b: Newsletter) => 
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          );
        
        setNewsletters(publishedNewsletters);
      }
    } catch (error) {
      console.error('خطأ في جلب النشرات:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('ar-SA', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'تاريخ غير صحيح';
    }
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handlePlay = (newsletter: Newsletter) => {
    // إيقاف الصوت الحالي إذا كان يعمل
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
    }

    if (currentPlaying === newsletter.id) {
      // إيقاف التشغيل
      setCurrentPlaying(null);
      setCurrentAudio(null);
    } else {
      // تشغيل نشرة جديدة
      const audio = new Audio(newsletter.audioUrl);
      audio.addEventListener('ended', () => {
        setCurrentPlaying(null);
        setCurrentAudio(null);
      });
      
      audio.play().catch(error => {
        console.error('خطأ في تشغيل الصوت:', error);
      });
      
      setCurrentAudio(audio);
      setCurrentPlaying(newsletter.id);
    }
  };

  const handleDownload = async (newsletter: Newsletter) => {
    try {
      const response = await fetch(newsletter.audioUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `newsletter-${newsletter.id}.mp3`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('خطأ في تحميل الملف:', error);
    }
  };

  if (loading) {
    return (
      <div className={cn(
        "min-h-screen transition-colors duration-300",
        darkMode ? "bg-slate-900" : "bg-background-primary"
      )}>
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <RefreshCw className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
              <p className={cn(
                "text-lg",
                darkMode ? "text-gray-300" : "text-gray-600"
              )}>
                جاري تحميل النشرات الصوتية...
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn(
      "min-h-screen transition-colors duration-300",
      darkMode ? "bg-slate-900" : "bg-gray-50"
    )}>
      
      <div className="container mx-auto px-4 py-8">
        {/* رأس الصفحة */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-6">
            <Link href="/">
              <Button variant="outline" size="sm" className="gap-2">
                <ArrowLeft className="w-4 h-4" />
                العودة للرئيسية
              </Button>
            </Link>
          </div>
          
          <div className="text-center">
            <div className="mb-4">
              <div className={cn(
                "w-20 h-20 mx-auto rounded-full flex items-center justify-center shadow-lg",
                darkMode ? "bg-blue-900" : "bg-blue-600"
              )}>
                <FileAudio className="w-10 h-10 text-white" />
              </div>
            </div>
            <h1 className={cn(
              "text-4xl font-bold mb-4",
              darkMode ? "text-white" : "text-gray-900"
            )}>
              🎙️ أرشيف النشرات الصوتية
            </h1>
            <p className={cn(
              "text-lg max-w-2xl mx-auto",
              darkMode ? "text-gray-300" : "text-gray-600"
            )}>
              استمع لجميع النشرات الصوتية الإخبارية المنشورة على صحيفة سبق
            </p>
          </div>
        </div>

        {/* قائمة النشرات */}
        {newsletters.length > 0 ? (
          <div className="grid gap-6 max-w-4xl mx-auto">
            {newsletters.map((newsletter) => (
              <Card key={newsletter.id} className={cn(
                "shadow-lg transition-all duration-300 hover:shadow-xl",
                darkMode ? "bg-slate-800 border-slate-700" : "bg-white border-gray-200"
              )}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className={cn(
                        "text-xl mb-2",
                        darkMode ? "text-white" : "text-gray-900"
                      )}>
                        {newsletter.title}
                      </CardTitle>
                      
                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-blue-600" />
                          <span className={cn(
                            darkMode ? "text-gray-300" : "text-gray-600"
                          )}>
                            {formatDate(newsletter.created_at)}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-green-600" />
                          <span className={cn(
                            darkMode ? "text-gray-300" : "text-gray-600"
                          )}>
                            {formatDuration(newsletter.duration)}
                          </span>
                        </div>
                        
                        {newsletter.is_featured && (
                          <Badge variant="secondary" className="gap-1">
                            <Star className="w-3 h-3" />
                            مميزة
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent>
                  {/* ملخص المحتوى */}
                  <div className="mb-4">
                    <p className={cn(
                      "text-sm leading-relaxed",
                      darkMode ? "text-gray-300" : "text-gray-600"
                    )}>
                      {newsletter.content.slice(0, 200)}
                      {newsletter.content.length > 200 && '...'}
                    </p>
                  </div>
                  
                  {/* مشغل الصوت */}
                  <div className="mb-4">
                    <audio 
                      controls 
                      className="w-full"
                      preload="metadata"
                      style={{ height: '40px' }}
                    >
                      <source src={newsletter.audioUrl} type="audio/mpeg" />
                      <source src={newsletter.audioUrl} type="audio/wav" />
                      <source src={newsletter.audioUrl} type="audio/ogg" />
                      متصفحك لا يدعم تشغيل الملفات الصوتية
                    </audio>
                  </div>
                  
                  {/* أزرار التحكم */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Button
                        onClick={() => handlePlay(newsletter)}
                        size="sm"
                        variant="outline"
                        className="gap-2"
                      >
                        {currentPlaying === newsletter.id ? (
                          <Pause className="w-4 h-4" />
                        ) : (
                          <Play className="w-4 h-4" />
                        )}
                        {currentPlaying === newsletter.id ? 'إيقاف' : 'تشغيل'}
                      </Button>
                      
                      <Button
                        onClick={() => handleDownload(newsletter)}
                        size="sm"
                        variant="outline"
                        className="gap-2"
                      >
                        <Download className="w-4 h-4" />
                        تحميل
                      </Button>
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Volume2 className="w-4 h-4" />
                      <span>{newsletter.play_count} استماع</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          /* حالة عدم وجود نشرات */
          <div className="text-center py-16">
            <div className={cn(
              "w-24 h-24 mx-auto rounded-full flex items-center justify-center mb-6 shadow-lg",
              darkMode ? "bg-slate-800" : "bg-gray-100"
            )}>
              <Headphones className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className={cn(
              "text-2xl font-semibold mb-4",
              darkMode ? "text-white" : "text-gray-900"
            )}>
              لا توجد نشرات صوتية
            </h3>
            <p className={cn(
              "text-lg mb-6",
              darkMode ? "text-gray-300" : "text-gray-600"
            )}>
              لم يتم نشر أي نشرات صوتية حتى الآن
            </p>
            <Link href="/">
              <Button className="gap-2">
                <ArrowLeft className="w-4 h-4" />
                العودة للرئيسية
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
