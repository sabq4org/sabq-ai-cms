'use client';

import React, { useState, useEffect } from 'react';
import { Clock, RefreshCw, ChevronLeft, Brain, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import DailyDoseCard from './DailyDoseCard';
import { getCurrentPeriod, getPeriodLabel, getPeriodIcon, type DosePeriod } from '@/lib/ai/doseGenerator';
import { cn } from '@/lib/utils';

interface SmartDoseBlockProps {
  userId?: string;
  className?: string;
}

interface DoseData {
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
}

export default function SmartDoseBlock({ userId, className = '' }: SmartDoseBlockProps) {
  const [currentDose, setCurrentDose] = useState<DoseData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const currentPeriod = getCurrentPeriod();
  const periodIcon = getPeriodIcon(currentPeriod);
  const periodLabel = getPeriodLabel(currentPeriod);

  // جلب الجرعة الحالية
  const fetchCurrentDose = async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      setError(null);

      // محاولة جلب الجرعة من API أولاً
      try {
        const params = new URLSearchParams({
          period: currentPeriod,
          ...(userId && { userId })
        });

        const response = await fetch(`/api/doses?${params}`);
        const data = await response.json();

        if (data.success) {
          setCurrentDose(data.dose);
          return;
        }
      } catch (apiError) {
        console.warn('API غير متاح، استخدام البيانات المحلية:', apiError);
      }

      // إذا فشل API، استخدم جرعة محلية
      const localDose = getLocalDose(currentPeriod);
      setCurrentDose(localDose);

    } catch (error) {
      console.error('خطأ في جلب الجرعة:', error);
      setError('خطأ في الاتصال بالخادم');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // جرعات محلية كـ fallback
  const getLocalDose = (period: DosePeriod): DoseData => {
    const localDoses = {
      morning: {
        id: 'local-morning',
        period: 'morning' as DosePeriod,
        main_text: 'ابدأ يومك بالأهم 👇',
        sub_text: 'ملخص ذكي لما فاتك من أحداث البارحة… قبل فنجان القهوة ☕️',
        topics: ['أخبار عامة', 'اقتصاد', 'تقنية'],
        view_count: 150,
        interaction_count: 12,
        user_feedback: null,
        created_at: new Date().toISOString()
      },
      noon: {
        id: 'local-noon',
        period: 'noon' as DosePeriod,
        main_text: 'منتصف النهار… وحرارة الأخبار 🔥',
        sub_text: 'إليك آخر المستجدات حتى هذه اللحظة، باختصار لا يفوّت',
        topics: ['أخبار عاجلة', 'سياسة', 'رياضة'],
        view_count: 89,
        interaction_count: 7,
        user_feedback: null,
        created_at: new Date().toISOString()
      },
      evening: {
        id: 'local-evening',
        period: 'evening' as DosePeriod,
        main_text: 'مساؤك ذكاء واطّلاع 🌇',
        sub_text: 'إليك تحليلًا خفيفًا وذكيًا لأبرز قصص اليوم',
        topics: ['تحليلات', 'ثقافة', 'مجتمع'],
        view_count: 203,
        interaction_count: 18,
        user_feedback: null,
        created_at: new Date().toISOString()
      },
      night: {
        id: 'local-night',
        period: 'night' as DosePeriod,
        main_text: 'قبل أن تنام… تعرف على ملخص اليوم 🌙',
        sub_text: '3 أخبار مختارة بعناية، خالية من الضجيج',
        topics: ['ملخص اليوم', 'أخبار هادئة', 'إيجابية'],
        view_count: 67,
        interaction_count: 4,
        user_feedback: null,
        created_at: new Date().toISOString()
      }
    };

    return localDoses[period] || localDoses.morning;
  };

  // جلب الجرعة عند التحميل
  useEffect(() => {
    fetchCurrentDose();
  }, [currentPeriod, userId]);

  // تحديث الجرعة
  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchCurrentDose(false);
  };

  // معالجة تفاعل المستخدم
  const handleFeedback = async (feedback: any) => {
    if (!currentDose || !userId) return;

    try {
      const response = await fetch('/api/doses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'feedback',
          doseId: currentDose.id,
          userId,
          ...feedback
        })
      });

      const data = await response.json();
      if (data.success) {
        // تحديث حالة الجرعة محلياً
        setCurrentDose(prev => prev ? {
          ...prev,
          interaction_count: prev.interaction_count + 1,
          user_feedback: {
            reaction: feedback.reaction || prev.user_feedback?.reaction || 'neutral',
            saved: feedback.saved !== undefined ? feedback.saved : prev.user_feedback?.saved || false,
            shared: feedback.shared !== undefined ? feedback.shared : prev.user_feedback?.shared || false
          }
        } : null);
      }
    } catch (error) {
      console.error('خطأ في إرسال التفاعل:', error);
    }
  };

  if (loading) {
    return (
      <section className={cn('w-full', className)}>
        <div className="w-full bg-gradient-to-r from-slate-50/50 via-white to-slate-50/50 dark:from-slate-900/50 dark:via-slate-800/50 dark:to-slate-900/50 py-8 lg:py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="w-full bg-white dark:bg-slate-800 rounded-3xl shadow-xl p-8 lg:p-12">
              <div className="flex flex-col lg:flex-row items-center justify-center gap-8 text-center">
                <div className="relative">
                  <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center animate-pulse shadow-2xl">
                    <Brain className="w-10 h-10 text-white" />
                  </div>
                  <div className="absolute -inset-2 bg-gradient-to-br from-purple-500/20 to-indigo-600/20 rounded-full animate-ping" />
                </div>
                <div className="space-y-3">
                  <h3 className="text-xl lg:text-2xl font-bold text-slate-900 dark:text-white">
                    جاري تحضير جرعتك الذكية...
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400">
                    نقوم بتخصيص المحتوى وفقاً لاهتماماتك
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className={cn('w-full', className)}>
        <div className="w-full bg-gradient-to-r from-slate-50/50 via-white to-slate-50/50 dark:from-slate-900/50 dark:via-slate-800/50 dark:to-slate-900/50 py-8 lg:py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="w-full bg-white dark:bg-slate-800 rounded-3xl shadow-xl p-8 lg:p-12">
              <div className="text-center space-y-6">
                <div className="w-16 h-16 mx-auto rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
                  <Zap className="w-8 h-8 text-red-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">
                    عذراً، حدث خطأ في تحضير الجرعة
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400 mb-6 max-w-md mx-auto">
                    {error}
                  </p>
                  <Button 
                    onClick={() => fetchCurrentDose()} 
                    className="gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700"
                  >
                    <RefreshCw className="w-5 h-5" />
                    إعادة المحاولة
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (!currentDose) {
    return null;
  }

  return (
    <section className={cn('w-full', className)}>
      {/* Container للعرض الكامل */}
      <div className="w-full bg-gradient-to-r from-slate-50/50 via-white to-slate-50/50 dark:from-slate-900/50 dark:via-slate-800/50 dark:to-slate-900/50 py-8 lg:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Header محسن مع العرض الكامل */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8 lg:mb-12">
            <div className="flex flex-col lg:flex-row lg:items-center gap-4 lg:gap-6 mb-4 lg:mb-0">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 shadow-lg">
                  <Brain className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 dark:text-white">
                    الجرعات الذكية
                  </h2>
                  <p className="text-slate-600 dark:text-slate-400 mt-1">
                    محتوى ملهم ومخصص لك
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 px-4 py-2 bg-white/70 dark:bg-slate-800/70 rounded-full shadow-md backdrop-blur-sm">
                <span className="text-2xl">{periodIcon}</span>
                <div className="text-sm">
                  <span className="font-medium text-slate-900 dark:text-white">{periodLabel}</span>
                  <p className="text-slate-500 dark:text-slate-400">جرعة الآن</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="lg"
                onClick={handleRefresh}
                disabled={refreshing}
                className="gap-3 px-6 py-3 rounded-full border-2 hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                <RefreshCw className={cn('w-5 h-5', refreshing && 'animate-spin')} />
                تحديث
              </Button>
              
              <Button 
                variant="ghost" 
                size="lg" 
                onClick={() => window.open('/doses', '_blank')}
                className="gap-3 px-6 py-3 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <ChevronLeft className="w-5 h-5" />
                أرشيف الجرعات
              </Button>
            </div>
          </div>

          {/* بطاقة الجرعة بالعرض الكامل */}
          <DailyDoseCard
            dose={currentDose}
            userId={userId}
            onFeedback={handleFeedback}
            className="w-full max-w-none"
          />

          {/* معلومات إضافية محسنة */}
          <div className="mt-8 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/60 dark:bg-slate-800/60 rounded-full backdrop-blur-sm">
              <Clock className="w-4 h-4 text-slate-500" />
              <span className="text-sm text-slate-600 dark:text-slate-400">
                يتم تحديث الجرعات 4 مرات يومياً • مُولدة بالذكاء الاصطناعي ومُراجعة تحريرياً
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}