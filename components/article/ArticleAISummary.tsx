/**
 * مكون الموجز الذكي المحسّن
 * Enhanced AI Summary Component
 */

'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Volume2,
  Loader2,
  Brain,
  Pause,
  Sparkles
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useAuth } from '@/hooks/useAuth';

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
  const { user } = useAuth();
  const [summary, setSummary] = useState(existingSummary || '');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  // التحقق من صلاحيات المستخدم لتوليد الملخص
  const canGenerateSummary = user && (user.role === 'ADMIN' || user.role === 'EDITOR');

  // تنظيف الذاكرة عند إلغاء المكون
  useEffect(() => {
    return () => {
      if (audioUrl && audioUrl.startsWith('blob:')) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl]);

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

  // تحويل النص لصوت باستخدام خدمة موحدة
  const generateAndPlayAudio = async () => {
    if (!summary) return;

    // إذا كان يتم التشغيل، أوقفه
    if (isPlaying) {
      audioRef.current?.pause();
      setIsPlaying(false);
      return;
    }

    // إذا كان الصوت جاهز، شغله
    if (audioUrl && audioRef.current) {
      audioRef.current.play();
      setIsPlaying(true);
      return;
    }

    // توليد صوت جديد
    setIsLoadingAudio(true);
    try {
      const response = await fetch('/api/audio/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: summary,
          voice: 'sarah', // أو أي صوت آخر مناسب
          lang: 'ar'
        })
      });

      if (response.ok) {
        const data = await response.json();
        setAudioUrl(data.audio_url);
        
        // تشغيل الصوت بعد تحميله
        setTimeout(() => {
          if (audioRef.current) {
            audioRef.current.play();
            setIsPlaying(true);
          }
        }, 100);
      }
    } catch (error) {
      console.error('خطأ في تحويل النص لصوت:', error);
    } finally {
      setIsLoadingAudio(false);
    }
  };

  // عند انتهاء الصوت
  const handleAudioEnded = () => {
    setIsPlaying(false);
  };

  // إذا لم يكن هناك ملخص ولا يمكن للمستخدم توليد ملخص، لا تعرض شيء
  if (!summary && !canGenerateSummary) {
    return null;
  }

  return (
    <TooltipProvider>
      <div className={cn(
        'relative',
        'p-3 sm:p-4',
        'max-w-lg mx-auto', // تصغير العرض الأقصى
        className
      )}>
        {/* الأيقونة في الزاوية مع tooltip */}
        <div className="absolute top-2 right-2">
          <Tooltip>
            <TooltipTrigger>
              <div className="p-1 rounded-full bg-purple-100 dark:bg-purple-900/30">
                <Brain className="h-3 w-3 text-purple-600 dark:text-purple-400" />
              </div>
            </TooltipTrigger>
            <TooltipContent side="bottom" align="end">
              <p className="text-xs">موجز ذكي بواسطة AI</p>
            </TooltipContent>
          </Tooltip>
        </div>

        {/* زر الصوت في الزاوية اليسرى */}
        {summary && (
          <div className="absolute top-2 left-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={generateAndPlayAudio}
                  disabled={isLoadingAudio}
                  className={cn(
                    "h-7 w-7 rounded-full transition-all",
                    isPlaying 
                      ? "bg-purple-600 text-white hover:bg-purple-700" 
                      : "bg-white/80 dark:bg-gray-800/80 hover:bg-gray-100 dark:hover:bg-gray-700"
                  )}
                >
                  {isLoadingAudio ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : isPlaying ? (
                    <Pause className="h-3.5 w-3.5" />
                  ) : (
                    <Volume2 className="h-3.5 w-3.5" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom" align="start">
                <p className="text-xs">
                  {isPlaying ? 'إيقاف' : 'استمع للموجز'}
                </p>
              </TooltipContent>
            </Tooltip>
          </div>
        )}

        {/* المحتوى */}
        <div className="px-8"> {/* مساحة للأيقونات */}
          {summary ? (
            <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed line-clamp-4">
              {summary}
            </p>
          ) : canGenerateSummary ? (
            <div className="flex items-center justify-center py-2">
              <Button
                onClick={generateSummary}
                disabled={isGenerating}
                size="sm"
                variant="ghost"
                className="text-purple-600 hover:text-purple-700 hover:bg-purple-100 dark:hover:bg-purple-900/20"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="h-3 w-3 mr-1.5 animate-spin" />
                    <span className="text-xs">جارٍ توليد الموجز...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-3 w-3 mr-1.5" />
                    <span className="text-xs">توليد موجز ذكي</span>
                  </>
                )}
              </Button>
            </div>
          ) : null}
        </div>

        {/* عنصر الصوت المخفي */}
        <audio
          ref={audioRef}
          src={audioUrl || undefined}
          onEnded={handleAudioEnded}
          className="hidden"
        />
      </div>
    </TooltipProvider>
  );
} 