/**
 * صفحة اختبار مكون Word Cloud الجديد
 * Word Cloud Component Test Page
 */

"use client";

import React, { useState, useEffect } from 'react';
import WordCloud from '@/components/ui/WordCloud';
import { WordItem } from '@/types/word-cloud';
import { Button } from '@/components/ui/button';
import { RefreshCw, Settings, Eye } from 'lucide-react';

export default function WordCloudTestPage() {
  const [words, setWords] = useState<WordItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showTrends, setShowTrends] = useState(true);
  const [enableTooltip, setEnableTooltip] = useState(true);
  const [maxWords, setMaxWords] = useState(30);

  // جلب البيانات من API
  const fetchWords = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/analytics/trending-keywords?limit=${maxWords}`);
      const data = await response.json();
      
      if (data.success) {
        // تحويل البيانات للتنسيق الجديد
        const transformedWords: WordItem[] = data.keywords.map((keyword: any) => ({
          id: keyword.id,
          text: keyword.text,
          weight: keyword.weight || Math.round((keyword.count / 156) * 100), // تطبيع الوزن
          count: keyword.count,
          colorKey: keyword.colorKey || 'misc',
          trend: keyword.trend,
          href: keyword.href || keyword.url
        }));
        
        setWords(transformedWords);
      } else {
        setError(data.error || 'فشل في جلب البيانات');
      }
    } catch (err) {
      setError('خطأ في الاتصال بالخادم');
      console.error('خطأ في جلب الكلمات:', err);
    } finally {
      setLoading(false);
    }
  };

  // جلب البيانات عند تحميل الصفحة
  useEffect(() => {
    fetchWords();
  }, [maxWords]);

  // معالج اختيار الكلمة
  const handleWordSelect = (word: WordItem) => {
    console.log('تم اختيار الكلمة:', word);
    alert(`تم اختيار: ${word.text}\nالوزن: ${word.weight}\nعدد المقالات: ${word.count || 'غير محدد'}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* العنوان والتحكم */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            اختبار مكون Word Cloud المتطور
          </h1>
          
          <div className="flex flex-wrap gap-4 items-center mb-6">
            <Button 
              onClick={fetchWords}
              disabled={loading}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              تحديث البيانات
            </Button>
            
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">عدد الكلمات:</label>
              <select 
                value={maxWords} 
                onChange={(e) => setMaxWords(parseInt(e.target.value))}
                className="border border-gray-300 rounded-md px-3 py-1 text-sm"
              >
                <option value={15}>15</option>
                <option value={20}>20</option>
                <option value={30}>30</option>
                <option value={50}>50</option>
              </select>
            </div>
            
            <label className="flex items-center gap-2 cursor-pointer">
              <input 
                type="checkbox" 
                checked={showTrends}
                onChange={(e) => setShowTrends(e.target.checked)}
                className="rounded"
              />
              <span className="text-sm">عرض الاتجاهات</span>
            </label>
            
            <label className="flex items-center gap-2 cursor-pointer">
              <input 
                type="checkbox" 
                checked={enableTooltip}
                onChange={(e) => setEnableTooltip(e.target.checked)}
                className="rounded"
              />
              <span className="text-sm">تفعيل التلميحات</span>
            </label>
          </div>
        </div>

        {/* إحصائيات */}
        {!loading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border">
              <div className="flex items-center gap-2">
                <Eye className="w-5 h-5 text-blue-500" />
                <span className="font-medium">إجمالي الكلمات</span>
              </div>
              <p className="text-2xl font-bold text-blue-600 mt-2">{words.length}</p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border">
              <div className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-green-500" />
                <span className="font-medium">الكلمات الصاعدة</span>
              </div>
              <p className="text-2xl font-bold text-green-600 mt-2">
                {words.filter(w => w.trend === 'up').length}
              </p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border">
              <div className="flex items-center gap-2">
                <RefreshCw className="w-5 h-5 text-orange-500" />
                <span className="font-medium">أعلى وزن</span>
              </div>
              <p className="text-2xl font-bold text-orange-600 mt-2">
                {Math.max(...words.map(w => w.weight), 0)}
              </p>
            </div>
          </div>
        )}

        {/* مكون Word Cloud */}
        <div className="mb-8">
          <WordCloud
            words={words}
            loading={loading}
            error={error}
            onSelect={handleWordSelect}
            showTrends={showTrends}
            enableTooltip={enableTooltip}
            maxWords={maxWords}
            className="shadow-lg"
          />
        </div>

        {/* معلومات إضافية */}
        {!loading && !error && words.length > 0 && (
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border">
            <h3 className="text-lg font-semibold mb-4">تفاصيل الكلمات</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {words.slice(0, 6).map(word => (
                <div key={word.id} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
                  <div className="font-medium text-lg">{word.text}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                    <div>الوزن: {word.weight}</div>
                    <div>التكرار: {word.count || 'غير محدد'}</div>
                    <div>الاتجاه: {word.trend === 'up' ? '📈 صاعد' : word.trend === 'down' ? '📉 هابط' : '➡️ ثابت'}</div>
                    <div>الفئة: {word.colorKey}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* تعليمات الاستخدام */}
        <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg border border-blue-200 dark:border-blue-800">
          <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-3">
            تعليمات الاستخدام
          </h3>
          <ul className="text-blue-800 dark:text-blue-200 space-y-2 text-sm">
            <li>• اضغط على أي كلمة للبحث في الأخبار المرتبطة بها</li>
            <li>• الكلمات الأكبر تمثل أعلى تكرار وأهمية</li>
            <li>• الأيقونات تظهر اتجاه الكلمة (صاعد/هابط/ثابت)</li>
            <li>• الألوان تمثل فئات مختلفة (سياسة، اقتصاد، جغرافيا، إلخ)</li>
            <li>• مر بالماوس فوق الكلمة لرؤية تفاصيل إضافية</li>
            <li>• المكون متجاوب ويعمل على جميع أحجام الشاشات</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
