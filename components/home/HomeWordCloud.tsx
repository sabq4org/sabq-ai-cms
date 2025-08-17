/**
 * مكون سحابة الكلمات للصفحة الرئيسية
 * يظهر أسفل الأخبار المميزة مباشرة
 */

'use client';

import React, { useState, useEffect } from 'react';
import EnhancedWordCloud from '@/components/EnhancedWordCloud';
import type { WordItem } from '@/components/EnhancedWordCloud';

interface KeywordData {
  id: string;
  text: string;
  count: number;
  trend: 'up' | 'down' | 'stable';
  url?: string;
  size: number; // 1-5 للحجم
  category?: string; // للتلوين الدلالي
}

interface HomeWordCloudProps {
  className?: string;
  maxKeywords?: number;
  showTitle?: boolean;
}

// خريطة تحويل الفئات إلى مفاتيح الألوان
const categoryToColorKey: Record<string, string> = {
  'السياسة': 'politics',
  'سياسة': 'politics',
  'الاقتصاد': 'economy',
  'اقتصاد': 'economy',
  'تقنية': 'tech',
  'التقنية': 'tech',
  'رياضة': 'sports',
  'الرياضة': 'sports',
  'ثقافة': 'culture',
  'الثقافة': 'culture',
  'صراعات': 'conflict',
  'حروب': 'conflict',
  'أمن': 'conflict',
  'دول': 'geo',
  'مدن': 'geo',
  'عالم': 'geo',
};

// بيانات تجريبية محسّنة للكلمات الشائعة
const mockKeywords: KeywordData[] = [
  { id: '1', text: 'السعودية', count: 156, trend: 'up', size: 5, url: '/search?q=السعودية', category: 'دول' },
  { id: '2', text: 'الرياض', count: 134, trend: 'up', size: 4, url: '/search?q=الرياض', category: 'مدن' },
  { id: '3', text: 'اقتصاد', count: 98, trend: 'stable', size: 4, url: '/search?q=اقتصاد', category: 'اقتصاد' },
  { id: '4', text: 'تقنية', count: 87, trend: 'up', size: 3, url: '/search?q=تقنية', category: 'تقنية' },
  { id: '5', text: 'رؤية 2030', count: 76, trend: 'up', size: 3, url: '/search?q=رؤية+2030', category: 'اقتصاد' },
  { id: '6', text: 'نيوم', count: 65, trend: 'up', size: 3, url: '/search?q=نيوم', category: 'اقتصاد' },
  { id: '7', text: 'الذكاء الاصطناعي', count: 54, trend: 'up', size: 2, url: '/search?q=ذكاء+اصطناعي', category: 'تقنية' },
  { id: '8', text: 'الطاقة المتجددة', count: 43, trend: 'stable', size: 2, url: '/search?q=طاقة+متجددة', category: 'اقتصاد' },
  { id: '9', text: 'المملكة', count: 89, trend: 'stable', size: 3, url: '/search?q=المملكة', category: 'دول' },
  { id: '10', text: 'جدة', count: 67, trend: 'down', size: 2, url: '/search?q=جدة', category: 'مدن' },
  { id: '11', text: 'الدمام', count: 45, trend: 'stable', size: 2, url: '/search?q=الدمام', category: 'مدن' },
  { id: '12', text: 'القمة العربية', count: 38, trend: 'up', size: 2, url: '/search?q=قمة+عربية', category: 'سياسة' },
  { id: '13', text: 'الاستثمار', count: 56, trend: 'up', size: 2, url: '/search?q=استثمار', category: 'اقتصاد' },
  { id: '14', text: 'التحول الرقمي', count: 41, trend: 'up', size: 2, url: '/search?q=تحول+رقمي', category: 'تقنية' },
  { id: '15', text: 'البيئة', count: 33, trend: 'stable', size: 1, url: '/search?q=البيئة', category: 'بيئة' },
  { id: '16', text: 'غزة', count: 72, trend: 'up', size: 4, url: '/search?q=غزة', category: 'صراعات' },
  { id: '17', text: 'إسرائيل', count: 68, trend: 'up', size: 3, url: '/search?q=إسرائيل', category: 'صراعات' },
  { id: '18', text: 'فلسطين', count: 64, trend: 'up', size: 3, url: '/search?q=فلسطين', category: 'دول' },
  { id: '19', text: 'الأمم المتحدة', count: 45, trend: 'stable', size: 2, url: '/search?q=الأمم+المتحدة', category: 'سياسة' },
  { id: '20', text: 'البورصة', count: 52, trend: 'down', size: 2, url: '/search?q=البورصة', category: 'اقتصاد' },
];

export default function HomeWordCloud({
  className = '',
  maxKeywords = 40,
  showTitle = true
}: HomeWordCloudProps) {
  const [keywords, setKeywords] = useState<KeywordData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // تحويل البيانات للصيغة الجديدة
  const convertToWordItems = (data: KeywordData[]): WordItem[] => {
    return data.map(keyword => ({
      id: keyword.id,
      text: keyword.text,
      // تحويل count إلى weight (1-100)
      weight: Math.min(100, Math.max(1, Math.round((keyword.count / 200) * 100))),
      colorKey: categoryToColorKey[keyword.category || ''] || 'misc',
      trend: keyword.trend === 'stable' ? 'flat' : keyword.trend,
      href: keyword.url
    }));
  };

  // تحميل الكلمات المفتاحية
  const loadKeywords = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/analytics/trending-keywords', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.keywords && data.keywords.length > 0) {
          setKeywords(data.keywords.slice(0, maxKeywords));
        } else {
          // استخدام البيانات التجريبية إذا لم تكن هناك بيانات
          console.log('لا توجد كلمات مفتاحية من API، استخدام البيانات التجريبية');
          setKeywords(mockKeywords.slice(0, maxKeywords));
        }
      } else {
        throw new Error('فشل تحميل البيانات');
      }
    } catch (error) {
      console.error('خطأ في تحميل الكلمات المفتاحية:', error);
      setError('تعذر تحميل الكلمات الشائعة');
      // استخدام البيانات التجريبية في حالة الخطأ
      setKeywords(mockKeywords.slice(0, maxKeywords));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadKeywords();
    
    // تحديث تلقائي كل 5 دقائق
    const interval = setInterval(loadKeywords, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [maxKeywords]);

  // معالج اختيار الكلمة
  const handleWordSelect = (word: WordItem) => {
    console.log('تم اختيار الكلمة:', word);
    // يمكن إضافة منطق إضافي هنا مثل تتبع التحليلات
  };

  return (
    <div className={`w-full ${className}`}>
      <EnhancedWordCloud
        words={convertToWordItems(keywords)}
        onSelect={handleWordSelect}
        loading={loading}
        error={error}
        title={showTitle ? "الكلمات الشائعة" : undefined}
        showStats={true}
        maxWords={maxKeywords}
        className="mx-auto"
      />
    </div>
  );
}
