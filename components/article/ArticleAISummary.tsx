/**
 * مكون الملخص الذكي للمقال مع التحويل الصوتي
 * Article AI Summary Component with Voice
 */

'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Volume2,
  VolumeX,
  Loader2,
  Sparkles,
  RefreshCw,
  Download,
  Play,
  Pause,
  SkipForward,
  Clock,
  Brain
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ArticleAISummaryProps {
  articleId: string;
  title: string;
  content: string;
  existingSummary?: string;
  className?: string;
}

export default function ArticleAISummary({
  articleId,
  title,
  content,
  existingSummary,
  className
}: ArticleAISummaryProps) {
  const [summary, setSummary] = useState(existingSummary || '');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [duration, setDuration] = useState<number>(0);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const audioRef = useRef<HTMLAudioElement>(null);

  // تنظيف الذاكرة عند إلغاء المكون
  useEffect(() => {
    return () => {
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl]);

  // تحديث الوقت الحالي
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('ended', () => setIsPlaying(false));

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('ended', () => setIsPlaying(false));
    };
  }, [audioRef.current]);

  // توليد الملخص الذكي
  const generateSummary = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch('/api/ai/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          articleId,
          title,
          content: content.substring(0, 3000) // أول 3000 حرف
        })
      });

      if (response.ok) {
        const data = await response.json();
        setSummary(data.summary);
        // حفظ الملخص في قاعدة البيانات
        await fetch(`/api/articles/${articleId}/summary`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ai_summary: data.summary })
        });
      }
    } catch (error) {
      console.error('خطأ في توليد الملخص:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  // تحويل النص لصوت باستخدام ElevenLabs
  const generateAudio = async () => {
    if (!summary) return;

    setIsLoadingAudio(true);
    try {
      const response = await fetch('/api/tts/elevenlabs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: summary })
      });

      if (response.ok) {
        const audioBlob = await response.blob();
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);
        
        // تشغيل الصوت تلقائياً
        setTimeout(() => {
          audioRef.current?.play();
          setIsPlaying(true);
        }, 100);
      } else {
        // في حالة فشل ElevenLabs، استخدم Web Speech API كبديل
        console.warn('فشل ElevenLabs، استخدام Web Speech API');
        const utterance = new SpeechSynthesisUtterance(summary);
        utterance.lang = 'ar-SA';
        utterance.rate = 0.8;
        utterance.pitch = 1;
        
        utterance.onend = () => {
          setIsPlaying(false);
        };
        
        speechSynthesis.speak(utterance);
        setIsPlaying(true);
      }
    } catch (error) {
      console.error('خطأ في تحويل النص لصوت:', error);
    } finally {
      setIsLoadingAudio(false);
    }
  };

  // التحكم في التشغيل
  const togglePlayPause = () => {
    if (isPlaying) {
      // إيقاف الصوت
      if (audioRef.current && audioUrl) {
        audioRef.current.pause();
      } else {
        // إيقاف Web Speech API
        speechSynthesis.cancel();
      }
      setIsPlaying(false);
    } else {
      // تشغيل الصوت
      if (audioRef.current && audioUrl) {
        audioRef.current.play();
      } else {
        // إعادة تشغيل النص بـ Web Speech API
        const utterance = new SpeechSynthesisUtterance(summary);
        utterance.lang = 'ar-SA';
        utterance.rate = 0.8;
        utterance.pitch = 1;
        
        utterance.onend = () => {
          setIsPlaying(false);
        };
        
        speechSynthesis.speak(utterance);
      }
      setIsPlaying(true);
    }
  };

  // التقديم السريع
  const skipForward = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.min(
        audioRef.current.currentTime + 10,
        duration
      );
    }
  };

  // تنسيق الوقت
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // حساب وقت القراءة المتوقع
  const estimatedReadTime = Math.ceil(summary.split(' ').length / 150); // 150 كلمة في الدقيقة

  return (
    <Card className={cn('overflow-hidden border-2', className)}>
      <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-purple-600" />
            الملخص الذكي
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="gap-1">
              <Clock className="h-3 w-3" />
              {estimatedReadTime} دقيقة
            </Badge>
            <Badge variant="outline" className="gap-1">
              <Sparkles className="h-3 w-3" />
              AI
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-6">
        {/* عرض الملخص */}
        {summary ? (
          <div className="space-y-4">
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                {summary}
              </p>
            </div>

            {/* مشغل الصوت */}
            <div className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-800/50">
              {audioUrl ? (
                <div className="space-y-3">
                  {/* أزرار التحكم */}
                  <div className="flex items-center justify-center gap-3">
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={skipForward}
                      className="h-8 w-8"
                    >
                      <SkipForward className="h-4 w-4" />
                    </Button>
                    
                    <Button
                      size="icon"
                      onClick={togglePlayPause}
                      className="h-12 w-12 bg-purple-600 hover:bg-purple-700"
                    >
                      {isPlaying ? (
                        <Pause className="h-5 w-5" />
                      ) : (
                        <Play className="h-5 w-5" />
                      )}
                    </Button>

                    <Button
                      size="icon"
                      variant="outline"
                      onClick={() => {
                        if (audioUrl) {
                          const a = document.createElement('a');
                          a.href = audioUrl;
                          a.download = `summary-${articleId}.mp3`;
                          a.click();
                        }
                      }}
                      className="h-8 w-8"
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* شريط التقدم */}
                  <div className="space-y-1">
                    <div className="relative h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className="absolute h-full bg-purple-600 transition-all duration-300"
                        style={{ width: `${(currentTime / duration) * 100}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>{formatTime(currentTime)}</span>
                      <span>{formatTime(duration)}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <Button
                  onClick={generateAudio}
                  disabled={isLoadingAudio || !summary}
                  className="w-full bg-purple-600 hover:bg-purple-700"
                >
                  {isLoadingAudio ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      جارٍ تحويل النص لصوت...
                    </>
                  ) : (
                    <>
                      <Volume2 className="h-4 w-4 mr-2" />
                      الاستماع للملخص
                    </>
                  )}
                </Button>
              )}
            </div>

            {/* زر إعادة توليد */}
            <Button
              variant="outline"
              size="sm"
              onClick={generateSummary}
              disabled={isGenerating}
              className="w-full"
            >
              {isGenerating ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              إعادة توليد الملخص
            </Button>
          </div>
        ) : (
          <div className="text-center py-8">
            <Brain className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              لم يتم توليد ملخص ذكي لهذا المقال بعد
            </p>
            <Button
              onClick={generateSummary}
              disabled={isGenerating}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  جارٍ توليد الملخص...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  توليد ملخص ذكي
                </>
              )}
            </Button>
          </div>
        )}

        {/* عنصر الصوت المخفي */}
        <audio
          ref={audioRef}
          src={audioUrl || undefined}
          className="hidden"
        />
      </CardContent>
    </Card>
  );
} 