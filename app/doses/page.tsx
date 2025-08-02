'use client';

import React, { useState, useEffect } from 'react';
import { Brain, Calendar, Filter, Clock, TrendingUp, Archive, ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import DailyDoseCard from '@/components/smart-doses/DailyDoseCard';
import { getPeriodLabel, getPeriodIcon, type DosePeriod } from '@/lib/ai/doseGenerator';
import { cn } from '@/lib/utils';
import Link from 'next/link';

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

export default function DosesArchivePage() {
  const [doses, setDoses] = useState<DoseData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<DosePeriod | 'all'>('all');
  const [totalStats, setTotalStats] = useState({
    totalDoses: 0,
    totalViews: 0,
    totalInteractions: 0
  });

  const periods: Array<{value: DosePeriod | 'all', label: string, icon: string}> = [
    { value: 'all', label: 'جميع الفترات', icon: '📚' },
    { value: 'morning', label: getPeriodLabel('morning'), icon: getPeriodIcon('morning') },
    { value: 'noon', label: getPeriodLabel('noon'), icon: getPeriodIcon('noon') },
    { value: 'evening', label: getPeriodLabel('evening'), icon: getPeriodIcon('evening') },
    { value: 'night', label: getPeriodLabel('night'), icon: getPeriodIcon('night') },
  ];

  // جلب البيانات
  useEffect(() => {
    const fetchDoses = async () => {
      try {
        setLoading(true);
        
        // محاكاة بيانات للعرض
        const mockDoses: DoseData[] = [
          {
            id: '1',
            period: 'morning',
            main_text: 'صباحك أجمل بالأخبار الإيجابية ☀️',
            sub_text: 'ابدأ يومك بجرعة من الأمل والتفاؤل مع آخر التطورات الإيجابية في العالم',
            topics: ['إيجابية', 'صحة', 'تقنية'],
            view_count: 1250,
            interaction_count: 89,
            created_at: new Date().toISOString()
          },
          {
            id: '2',
            period: 'noon',
            main_text: 'منتصف النهار والطاقة مستمرة 🌟',
            sub_text: 'استمتع بجرعة منتصف النهار مع أبرز القصص الملهمة والمحفزة',
            topics: ['إلهام', 'اقتصاد', 'مجتمع'],
            view_count: 890,
            interaction_count: 67,
            created_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString()
          },
          {
            id: '3',
            period: 'evening',
            main_text: 'مساء التأمل والحكمة 🌆',
            sub_text: 'وقت للتفكير والتأمل مع محتوى عميق ومفيد ينير طريقك',
            topics: ['حكمة', 'ثقافة', 'تطوير ذاتي'],
            view_count: 2100,
            interaction_count: 145,
            created_at: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString()
          },
          {
            id: '4',
            period: 'night',
            main_text: 'ليلة هادئة مع القراءة المفيدة 🌙',
            sub_text: 'اختتم يومك بجرعة مهدئة من المحتوى الإيجابي والمريح للنفس',
            topics: ['هدوء', 'نوم جيد', 'صحة نفسية'],
            view_count: 650,
            interaction_count: 34,
            created_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString()
          }
        ];

        const filteredDoses = selectedPeriod === 'all' 
          ? mockDoses 
          : mockDoses.filter(dose => dose.period === selectedPeriod);

        setDoses(filteredDoses);
        
        // حساب الإحصائيات
        setTotalStats({
          totalDoses: filteredDoses.length,
          totalViews: filteredDoses.reduce((sum, dose) => sum + dose.view_count, 0),
          totalInteractions: filteredDoses.reduce((sum, dose) => sum + dose.interaction_count, 0)
        });

      } catch (error) {
        console.error('خطأ في جلب الجرعات:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDoses();
  }, [selectedPeriod]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 shadow-sm border-b border-slate-200 dark:border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/" className="text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100">
                <ChevronLeft className="w-6 h-6" />
              </Link>
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 shadow-lg">
                  <Archive className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl lg:text-4xl font-bold text-slate-900 dark:text-white">
                    أرشيف الجرعات الذكية
                  </h1>
                  <p className="text-slate-600 dark:text-slate-400 mt-1">
                    تصفح جميع الجرعات السابقة والمحفوظة
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* إحصائيات سريعة */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm font-medium">إجمالي الجرعات</p>
                  <p className="text-3xl font-bold">{totalStats.totalDoses}</p>
                </div>
                <Brain className="w-10 h-10 text-purple-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium">إجمالي المشاهدات</p>
                  <p className="text-3xl font-bold">{totalStats.totalViews.toLocaleString('ar-SA')}</p>
                </div>
                <TrendingUp className="w-10 h-10 text-blue-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm font-medium">إجمالي التفاعلات</p>
                  <p className="text-3xl font-bold">{totalStats.totalInteractions}</p>
                </div>
                <Calendar className="w-10 h-10 text-green-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* فلتر الفترات */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex items-center gap-4 mb-4">
              <Filter className="w-5 h-5 text-slate-600 dark:text-slate-400" />
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                تصفية حسب الفترة
              </h3>
            </div>
            
            <div className="flex flex-wrap gap-3">
              {periods.map((period) => (
                <Button
                  key={period.value}
                  onClick={() => setSelectedPeriod(period.value)}
                  variant={selectedPeriod === period.value ? "default" : "outline"}
                  className={cn(
                    "gap-2 px-4 py-2 rounded-full transition-all duration-200",
                    selectedPeriod === period.value && "bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-lg"
                  )}
                >
                  <span className="text-lg">{period.icon}</span>
                  {period.label}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* قائمة الجرعات */}
        {loading ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4"></div>
                    <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/2"></div>
                    <div className="h-20 bg-slate-200 dark:bg-slate-700 rounded"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : doses.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {doses.map((dose) => (
              <DailyDoseCard
                key={dose.id}
                dose={dose}
                className="w-full"
              />
            ))}
          </div>
        ) : (
          <Card className="text-center py-16">
            <CardContent>
              <div className="space-y-4">
                <div className="w-16 h-16 mx-auto rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
                  <Archive className="w-8 h-8 text-slate-500" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white">
                  لا توجد جرعات لهذه الفترة
                </h3>
                <p className="text-slate-600 dark:text-slate-400">
                  جرب تصفية فترة أخرى أو عد لاحقاً للمزيد من المحتوى
                </p>
                <Button 
                  onClick={() => setSelectedPeriod('all')}
                  variant="outline"
                  className="gap-2"
                >
                  <Filter className="w-4 h-4" />
                  عرض جميع الجرعات
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}