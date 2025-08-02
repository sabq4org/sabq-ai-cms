'use client';

import React, { useState, useEffect } from 'react';
import { Heart, MessageSquare, Share2, Bookmark, Clock, TrendingUp, Sparkles, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { getPeriodColors, getPeriodIcon, getPeriodLabel, type DosePeriod } from '@/lib/ai/doseGenerator';

interface DailyDoseCardProps {
  dose: {
    id: string;
    period: DosePeriod;
    main_text: string;
    sub_text: string;
    topics: string[];
    view_count: number;
    interaction_count: number;
    user_feedback?: {
      reaction: 'like' | 'dislike' | 'neutral';
      saved: boolean;
      shared: boolean;
    } | null;
    created_at: string;
  };
  userId?: string;
  onFeedback?: (feedback: {
    reaction?: 'like' | 'dislike' | 'neutral';
    saved?: boolean;
    shared?: boolean;
    comment?: string;
  }) => void;
  className?: string;
}

export default function DailyDoseCard({ 
  dose, 
  userId, 
  onFeedback,
  className = '' 
}: DailyDoseCardProps) {
  const [userReaction, setUserReaction] = useState(dose.user_feedback?.reaction || 'neutral');
  const [isSaved, setIsSaved] = useState(dose.user_feedback?.saved || false);
  const [isShared, setIsShared] = useState(dose.user_feedback?.shared || false);
  const [shareCount, setShareCount] = useState(0);
  const [copied, setCopied] = useState(false);
  const [timeSpent, setTimeSpent] = useState(0);

  const colors = getPeriodColors(dose.period);
  const icon = getPeriodIcon(dose.period);
  const label = getPeriodLabel(dose.period);

  // تتبع الوقت المقضي في قراءة الجرعة
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeSpent(prev => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // إرسال التفاعل للخادم
  const handleFeedback = async (feedback: any) => {
    if (onFeedback) {
      onFeedback({ ...feedback, timeSpent });
    }
  };

  // معالجة الإعجاب/عدم الإعجاب
  const handleReaction = async (reaction: 'like' | 'dislike') => {
    const newReaction = userReaction === reaction ? 'neutral' : reaction;
    setUserReaction(newReaction);
    await handleFeedback({ reaction: newReaction });
  };

  // معالجة الحفظ
  const handleSave = async () => {
    const newSaved = !isSaved;
    setIsSaved(newSaved);
    await handleFeedback({ saved: newSaved });
  };

  // معالجة المشاركة
  const handleShare = async () => {
    const text = `${dose.main_text}\n\n${dose.sub_text}\n\n#سبق_الذكية`;
    const url = window.location.origin;

    if (navigator.share) {
      try {
        await navigator.share({
          title: dose.main_text,
          text: dose.sub_text,
          url: url
        });
        setIsShared(true);
        setShareCount(prev => prev + 1);
        await handleFeedback({ shared: true });
      } catch (error) {
        console.log('تم إلغاء المشاركة');
      }
    } else {
      // نسخ للحافظة كبديل
      try {
        await navigator.clipboard.writeText(`${text}\n\n${url}`);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        setIsShared(true);
        setShareCount(prev => prev + 1);
        await handleFeedback({ shared: true });
      } catch (error) {
        console.error('فشل في النسخ:', error);
      }
    }
  };

  // تحديد نمط البطاقة بناءً على الفترة
  const getCardStyle = () => {
    return {
      background: `linear-gradient(135deg, ${colors.primary}15 0%, ${colors.secondary}10 100%)`,
      borderColor: `${colors.primary}30`
    };
  };

  return (
    <Card 
      className={cn(
        'relative overflow-hidden border-2 transition-all duration-300 hover:shadow-lg',
        className
      )}
      style={getCardStyle()}
    >
      <CardContent className="p-6">
        {/* Header مع الفترة والأيقونة */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{icon}</span>
            <Badge 
              variant="outline" 
              className="text-xs font-medium"
              style={{ 
                borderColor: colors.primary,
                color: colors.primary,
                backgroundColor: `${colors.primary}10`
              }}
            >
              {label}
            </Badge>
          </div>
          
          {/* إحصائيات سريعة */}
          <div className="flex items-center gap-3 text-xs text-gray-500">
            <div className="flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              <span>{dose.view_count}</span>
            </div>
            <div className="flex items-center gap-1">
              <Heart className="w-3 h-3" />
              <span>{dose.interaction_count}</span>
            </div>
          </div>
        </div>

        {/* المحتوى الرئيسي */}
        <div className="space-y-3 mb-6">
          <h2 className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-white leading-tight text-right">
            {dose.main_text}
          </h2>
          <p className="text-base lg:text-lg text-gray-600 dark:text-gray-300 leading-relaxed text-right">
            {dose.sub_text}
          </p>
        </div>

        {/* المواضيع */}
        {dose.topics && dose.topics.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {dose.topics.slice(0, 3).map((topic, index) => (
              <Badge 
                key={index}
                variant="secondary"
                className="text-xs px-2 py-1"
                style={{
                  backgroundColor: `${colors.secondary}20`,
                  color: colors.primary
                }}
              >
                {topic}
              </Badge>
            ))}
          </div>
        )}

        {/* أزرار التفاعل */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
          {/* التفاعلات */}
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleReaction('like')}
              className={cn(
                'gap-1 hover:scale-105 transition-transform',
                userReaction === 'like' && 'text-green-600 bg-green-50'
              )}
            >
              <Heart className={cn(
                'w-4 h-4',
                userReaction === 'like' && 'fill-current'
              )} />
              <span className="text-xs">👍</span>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleReaction('dislike')}
              className={cn(
                'gap-1 hover:scale-105 transition-transform',
                userReaction === 'dislike' && 'text-red-600 bg-red-50'
              )}
            >
              <span className="text-xs">👎</span>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleSave}
              className={cn(
                'gap-1 hover:scale-105 transition-transform',
                isSaved && 'text-blue-600 bg-blue-50'
              )}
            >
              <Bookmark className={cn(
                'w-4 h-4',
                isSaved && 'fill-current'
              )} />
            </Button>
          </div>

          {/* مشاركة */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleShare}
            className="gap-2 hover:scale-105 transition-transform"
            style={{
              borderColor: colors.primary,
              color: colors.primary
            }}
          >
            {copied ? (
              <>
                <Check className="w-4 h-4" />
                <span className="text-xs">تم النسخ</span>
              </>
            ) : (
              <>
                <Share2 className="w-4 h-4" />
                <span className="text-xs">مشاركة</span>
              </>
            )}
          </Button>
        </div>

        {/* شريط التقدم للوقت المقضي */}
        {timeSpent > 0 && (
          <div className="mt-3 flex items-center gap-2 text-xs text-gray-500">
            <Clock className="w-3 h-3" />
            <span>قضيت {timeSpent} ثانية في قراءة هذه الجرعة</span>
          </div>
        )}

        {/* مؤشر ذكي للتفاعل الإيجابي */}
        {userReaction === 'like' && (
          <div className="absolute top-2 right-2">
            <Sparkles className="w-5 h-5 text-yellow-500 animate-pulse" />
          </div>
        )}
      </CardContent>
    </Card>
  );
}