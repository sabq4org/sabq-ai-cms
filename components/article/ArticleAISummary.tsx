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
  showFloatingAudio?: boolean;
}

export default function ArticleAISummary({
  articleId,
  title,
  content,
  existingSummary,
  className,
  showFloatingAudio
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
      const response = await fetch('/api/tts/elevenlabs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: summary,
          articleId: articleId
        })
      });

      if (response.ok) {
        // إنشاء blob URL من الصوت المُستلم
        const audioBlob = await response.blob();
        const audioUrl = URL.createObjectURL(audioBlob);
        setAudioUrl(audioUrl);
        
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

  // نعرض المكون دائمًا للتجربة المستخدم المستمرة
  // حتى لو لم يكن هناك ملخص، سنعرض رسالة مناسبة
  
  return (
    <TooltipProvider>
      <div className={cn(
        'relative bg-gradient-to-br from-purple-50/50 to-pink-50/50 dark:from-purple-900/10 dark:to-pink-900/10',
        'rounded-xl p-3 sm:p-4',
        'border border-purple-200/50 dark:border-purple-700/30',
        'shadow-sm hover:shadow-md transition-shadow',
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

        {/* زر الصوت في الزاوية اليسرى - بسيط وبدون إطار */}
        {summary && (
          <div className="absolute top-1 left-1">
            <button
              onClick={generateAndPlayAudio}
              disabled={isLoadingAudio}
              className={cn(
                "h-8 w-8 flex items-center justify-center rounded-md transition-all",
                "hover:bg-purple-100/50 dark:hover:bg-purple-900/20",
                isPlaying && "text-purple-600 dark:text-purple-400"
              )}
              aria-label={isPlaying ? 'إيقاف الاستماع' : 'استمع للموجز'}
            >
              {isLoadingAudio ? (
                <Loader2 className="h-4 w-4 animate-spin text-purple-600" />
              ) : isPlaying ? (
                <Pause className="h-4 w-4" />
              ) : (
                <Volume2 className="h-4 w-4" />
              )}
            </button>
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
          ) : (
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-2">
              الموجز الذكي غير متاح حالياً
            </p>
          )}
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