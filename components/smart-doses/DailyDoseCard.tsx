'use client';

import React, { useState, useEffect } from 'react';
import { Heart, MessageSquare, Share2, Bookmark, Clock, TrendingUp, Sparkles, Copy, Check, Eye, Star, Users, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { getPeriodColors, getPeriodIcon, getPeriodLabel, type DosePeriod } from '@/lib/ai/doseGenerator';
import { formatDistanceToNow } from 'date-fns';
import { ar } from 'date-fns/locale';

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

  // AI insights مولد تلقائياً
  const generateAIInsight = () => {
    const insights = [
      "الأكثر تفاعلاً اليوم",
      "قصة تستحق التأمل",
      "ملهمة ومفيدة",
      "رائجة بين القراء",
      "محتوى مميز"
    ];
    return insights[Math.floor(Math.random() * insights.length)];
  };

  return (
    <div className="w-full">
      <Card 
        className={cn(
          'relative overflow-hidden border-2 transition-all duration-500 hover:shadow-2xl hover:scale-[1.01] group',
          'bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900',
          className
        )}
        style={{
          borderImage: `linear-gradient(135deg, ${colors.primary}40, ${colors.secondary}40) 1`,
          borderRadius: '16px'
        }}
      >
        {/* الصورة المصغرة/الغلاف التعبيري */}
        <div 
          className="h-32 relative overflow-hidden"
          style={{
            background: `linear-gradient(135deg, ${colors.primary}20 0%, ${colors.secondary}30 50%, ${colors.primary}15 100%)`
          }}
        >
          {/* نمط هندسي تعبيري */}
          <div className="absolute inset-0 opacity-20">
            <div 
              className="absolute top-4 right-4 w-20 h-20 rounded-full"
              style={{ backgroundColor: colors.primary }}
            />
            <div 
              className="absolute bottom-4 left-4 w-16 h-16 rounded-full"
              style={{ backgroundColor: colors.secondary }}
            />
            <div 
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-24 h-24 rounded-full"
              style={{ backgroundColor: `${colors.primary}30` }}
            />
          </div>
          
          {/* أيقونة الفترة المكبرة */}
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-6xl opacity-40 group-hover:scale-110 transition-transform duration-300">
              {icon}
            </span>
          </div>

          {/* شارة AI Insight */}
          <div className="absolute top-3 left-3">
            <Badge 
              className="bg-white/90 text-slate-700 border-0 shadow-lg font-medium text-xs px-3 py-1 gap-1"
            >
              <Sparkles className="w-3 h-3 text-yellow-500" />
              {generateAIInsight()}
            </Badge>
          </div>

          {/* شارة الفترة */}
          <div className="absolute top-3 right-3">
            <Badge 
              className="font-bold text-sm px-4 py-2 shadow-lg border-0"
              style={{ 
                backgroundColor: colors.primary,
                color: 'white'
              }}
            >
              {label}
            </Badge>
          </div>
        </div>

        <CardContent className="p-6 lg:p-8">
          {/* الشريط العلوي - المعلومات الأساسية */}
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400">
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>{formatDistanceToNow(new Date(dose.created_at), { addSuffix: true, locale: ar })}</span>
              </div>
              <div className="flex items-center gap-1">
                <Eye className="w-4 h-4" />
                <span>{dose.view_count.toLocaleString('ar-SA')} قراءة</span>
              </div>
              <div className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                <span>{dose.interaction_count} تفاعل</span>
              </div>
            </div>
            
            {/* نجمة التقييم */}
            {userReaction === 'like' && (
              <div className="flex items-center gap-1">
                <Star className="w-5 h-5 text-yellow-500 fill-current" />
                <span className="text-sm font-medium text-yellow-600">مُقدّرة</span>
              </div>
            )}
          </div>

          {/* المحتوى الرئيسي المحسّن */}
          <div className="space-y-4 mb-8">
            <h2 className="text-2xl lg:text-3xl font-bold text-slate-900 dark:text-white leading-tight text-right">
              {dose.main_text}
            </h2>
            <p className="text-lg lg:text-xl text-slate-700 dark:text-slate-300 leading-relaxed text-right font-medium">
              {dose.sub_text}
            </p>
          </div>

          {/* المواضيع المحسنة */}
          {dose.topics && dose.topics.length > 0 && (
            <div className="flex flex-wrap gap-3 mb-8">
              {dose.topics.slice(0, 4).map((topic, index) => (
                <Badge 
                  key={index}
                  variant="secondary"
                  className="text-sm px-4 py-2 font-medium rounded-full"
                  style={{
                    backgroundColor: `${colors.secondary}20`,
                    color: colors.primary,
                    border: `1px solid ${colors.primary}30`
                  }}
                >
                  #{topic}
                </Badge>
              ))}
            </div>
          )}

          {/* أزرار التفاعل المحسنة */}
          <div className="flex items-center justify-between pt-6 border-t border-slate-200 dark:border-slate-700">
            {/* التفاعلات الرئيسية */}
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="lg"
                onClick={() => handleReaction('like')}
                className={cn(
                  'gap-2 px-4 py-2 rounded-full hover:scale-105 transition-all duration-200',
                  userReaction === 'like' 
                    ? 'text-green-600 bg-green-50 dark:bg-green-900/20' 
                    : 'text-slate-600 dark:text-slate-400 hover:text-green-600 hover:bg-green-50'
                )}
              >
                <Heart className={cn(
                  'w-5 h-5',
                  userReaction === 'like' && 'fill-current'
                )} />
                <span className="font-medium">إعجاب</span>
              </Button>

              <Button
                variant="ghost"
                size="lg"
                onClick={handleSave}
                className={cn(
                  'gap-2 px-4 py-2 rounded-full hover:scale-105 transition-all duration-200',
                  isSaved 
                    ? 'text-blue-600 bg-blue-50 dark:bg-blue-900/20' 
                    : 'text-slate-600 dark:text-slate-400 hover:text-blue-600 hover:bg-blue-50'
                )}
              >
                <Bookmark className={cn(
                  'w-5 h-5',
                  isSaved && 'fill-current'
                )} />
                <span className="font-medium">حفظ</span>
              </Button>

              <Button
                variant="ghost"
                size="lg"
                onClick={() => handleReaction('dislike')}
                className={cn(
                  'gap-2 px-4 py-2 rounded-full hover:scale-105 transition-all duration-200',
                  userReaction === 'dislike' 
                    ? 'text-red-600 bg-red-50 dark:bg-red-900/20' 
                    : 'text-slate-600 dark:text-slate-400 hover:text-red-600 hover:bg-red-50'
                )}
              >
                <span className="text-lg">👎</span>
              </Button>
            </div>

            {/* مشاركة مميزة */}
            <Button
              onClick={handleShare}
              className={cn(
                'gap-3 px-6 py-3 rounded-full font-bold text-white shadow-lg hover:shadow-xl',
                'hover:scale-105 transition-all duration-200 relative overflow-hidden'
              )}
              style={{
                background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%)`
              }}
            >
              {copied ? (
                <>
                  <Check className="w-5 h-5" />
                  <span>تم النسخ</span>
                </>
              ) : (
                <>
                  <Share2 className="w-5 h-5" />
                  <span>مشاركة الجرعة</span>
                </>
              )}
              
              {/* تأثير تفاعلي */}
              <div className="absolute inset-0 bg-white/20 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
            </Button>
          </div>

          {/* إحصائيات التفاعل */}
          {(shareCount > 0 || timeSpent > 10) && (
            <div className="mt-6 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl">
              <div className="flex items-center justify-center gap-6 text-sm">
                {shareCount > 0 && (
                  <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                    <Share2 className="w-4 h-4" />
                    <span>تم مشاركتها {shareCount} مرة</span>
                  </div>
                )}
                {timeSpent > 10 && (
                  <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                    <Clock className="w-4 h-4" />
                    <span>وقت القراءة: {Math.round(timeSpent / 60)} دقائق</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* مؤشر التميز */}
          {userReaction === 'like' && (
            <div className="absolute top-40 right-4 animate-bounce">
              <div className="bg-yellow-500 text-white p-2 rounded-full shadow-lg">
                <Sparkles className="w-4 h-4" />
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}