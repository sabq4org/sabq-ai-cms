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

      const params = new URLSearchParams({
        period: currentPeriod,
        ...(userId && { userId })
      });

      const response = await fetch(`/api/doses?${params}`);
      const data = await response.json();

      if (data.success) {
        setCurrentDose(data.dose);
      } else {
        setError(data.error || 'فشل في جلب الجرعة');
      }
    } catch (error) {
      console.error('خطأ في جلب الجرعة:', error);
      setError('خطأ في الاتصال بالخادم');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
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
      <div className={cn('w-full', className)}>
        <Card className="border border-gray-200 dark:border-gray-700">
          <CardContent className="p-8">
            <div className="flex items-center justify-center">
              <div className="text-center space-y-4">
                <div className="w-12 h-12 mx-auto rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center animate-pulse">
                  <Brain className="w-6 h-6 text-white" />
                </div>
                <p className="text-gray-600 dark:text-gray-400">جاري تحضير الجرعة الذكية...</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className={cn('w-full', className)}>
        <Card className="border border-red-200 bg-red-50/50 dark:border-red-800 dark:bg-red-900/10">
          <CardContent className="p-6">
            <div className="text-center space-y-4">
              <div className="w-12 h-12 mx-auto rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
                <Zap className="w-6 h-6 text-red-600" />
              </div>
              <p className="text-red-600 dark:text-red-400">{error}</p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => fetchCurrentDose()}
                className="text-red-600 border-red-600 hover:bg-red-50"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                إعادة المحاولة
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!currentDose) {
    return null;
  }

  return (
    <div className={cn('w-full space-y-6', className)}>
      {/* عنوان القسم */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center">
            <Brain className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-white">
              الجرعة الذكية {periodIcon}
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {periodLabel} • محتوى مُخصص ومُلهم
            </p>
          </div>
        </div>

        {/* أزرار التحكم */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing}
            className="gap-2"
          >
            <RefreshCw className={cn(
              'w-4 h-4',
              refreshing && 'animate-spin'
            )} />
            <span className="hidden sm:inline">تحديث</span>
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.open('/doses', '_blank')}
            className="gap-2"
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="hidden sm:inline">جميع الجرعات</span>
          </Button>
        </div>
      </div>

      {/* بطاقة الجرعة */}
      <DailyDoseCard
        dose={currentDose}
        userId={userId}
        onFeedback={handleFeedback}
        className="max-w-2xl mx-auto"
      />

      {/* معلومات إضافية */}
      <div className="text-center">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          <Clock className="w-3 h-3 inline mr-1" />
          يتم تحديث الجرعات 4 مرات يومياً • مُولدة بالذكاء الاصطناعي ومُراجعة تحريرياً
        </p>
      </div>
    </div>
  );
}