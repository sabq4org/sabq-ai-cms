'use client';

import React from 'react';
import SmartContentNewsCard from '@/components/mobile/SmartContentNewsCard';
import { useDarkModeContext } from '@/contexts/DarkModeContext';

export default function TestSmartCardCaption() {
  const { darkMode } = useDarkModeContext();

  const sampleArticle = {
    id: 'test-123',
    title: 'الذكاء الاصطناعي يغير مستقبل الصحافة الرقمية',
    url: '/article/test-123',
    type: 'تحليل' as const,
    reason: 'يتماشى مع اهتماماتك في التقنية',
    confidence: 95,
    thumbnail: 'https://res.cloudinary.com/dlaibl7id/image/upload/v1753111461/defaults/article-placeholder.jpg',
    publishedAt: new Date().toISOString(),
    category: 'تقنية',
    readingTime: 5,
    viewsCount: 1250,
    engagement: 0.75,
    slug: 'test-123',
    featured_image: 'https://res.cloudinary.com/dlaibl7id/image/upload/v1753111461/defaults/article-placeholder.jpg',
    category_name: 'تقنية',
    excerpt: 'اكتشف كيف يُحدث الذكاء الاصطناعي ثورة في عالم الصحافة الرقمية وتأثيره على مستقبل المحتوى',
    image_caption: 'محتوى تحليلي عميق • تقنية • 5 دقائق قراءة'
  };

  const sampleArticle2 = {
    ...sampleArticle,
    id: 'test-456',
    title: 'رأي: هل نحن مستعدون للتحول الرقمي الشامل؟',
    type: 'رأي' as const,
    reason: 'قد يعجبك هذا الرأي المتخصص',
    category: 'رأي',
    readingTime: 3,
    image_caption: 'وجهة نظر متخصصة حول التحول الرقمي • رأي • 3 دقائق'
  };

  return (
    <div className={`min-h-screen p-8 ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="max-w-4xl mx-auto">
        <h1 className={`text-3xl font-bold mb-8 text-center ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          🎨 معاينة البطاقة المخصصة مع وصف الصورة
        </h1>

        <div className="space-y-8">
          {/* معاينة في الوضع الكامل */}
          <div>
            <h2 className={`text-xl font-semibold mb-4 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
              الوضع الكامل (Full)
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <SmartContentNewsCard
                article={sampleArticle}
                darkMode={darkMode}
                variant="full"
                position={0}
              />
              <SmartContentNewsCard
                article={sampleArticle2}
                darkMode={darkMode}
                variant="full"
                position={1}
              />
            </div>
          </div>

          {/* معاينة في الوضع المضغوط */}
          <div>
            <h2 className={`text-xl font-semibold mb-4 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
              الوضع المضغوط (Compact) - بدون وصف
            </h2>
            <div className="space-y-4 max-w-md">
              <SmartContentNewsCard
                article={sampleArticle}
                darkMode={darkMode}
                variant="compact"
                position={0}
              />
              <SmartContentNewsCard
                article={sampleArticle2}
                darkMode={darkMode}
                variant="compact"
                position={1}
              />
            </div>
          </div>

          {/* معلومات عن الميزة */}
          <div className={`mt-12 p-6 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
            <h3 className={`text-lg font-semibold mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              📋 معلومات الميزة
            </h3>
            <ul className={`space-y-2 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              <li>• التدرج الأسود: 35% من ارتفاع الصورة بشفافية 45%</li>
              <li>• الوصف: يظهر فقط في الوضع الكامل</li>
              <li>• النص: أبيض مع ظل قوي للقراءة الواضحة</li>
              <li>• الحد الأقصى: سطرين مع قطع النص الزائد</li>
              <li>• متوافق مع الوضع الليلي والأجهزة المختلفة</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
} 