'use client';

import React from 'react';
import LightFeaturedStrip from '@/components/featured/LightFeaturedStrip';
import SmartPlaceholder from '@/components/ui/SmartPlaceholder';
import { useDarkModeContext } from '@/contexts/DarkModeContext';

// بيانات تجريبية بدون صور لاختبار الصور البديلة
const testArticlesWithoutImages = [
  {
    id: 1,
    title: 'خبر جديد بدون صورة لاختبار الصورة البديلة',
    published_at: new Date().toISOString(),
    views: 245,
    category: { name: 'تقنية', icon: '💻' },
    featured_image: null, // لا توجد صورة
  },
  {
    id: 2,
    title: 'خبر آخر بدون صورة لاختبار التصميم الجديد',
    published_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    views: 1234,
    category: { name: 'أخبار', icon: '📰' },
    featured_image: '', // صورة فارغة
  },
  {
    id: 3,
    title: 'خبر عاجل بدون صورة لاختبار الصورة البديلة',
    published_at: new Date().toISOString(),
    views: 567,
    category: { name: 'عاجل', icon: '⚡' },
    breaking: true,
    featured_image: undefined, // صورة غير محددة
  }
];

const testArticlesWithBrokenImages = [
  {
    id: 4,
    title: 'خبر مع صورة مكسورة لاختبار fallback',
    published_at: new Date().toISOString(),
    views: 345,
    category: { name: 'رياضة', icon: '⚽' },
    featured_image: 'https://broken-image-url.com/image.jpg', // رابط مكسور
  },
  {
    id: 5,
    title: 'خبر مع مسار صورة خاطئ',
    published_at: new Date().toISOString(),
    views: 789,
    category: { name: 'اقتصاد', icon: '💰' },
    featured_image: '/images/nonexistent-image.jpg', // مسار غير موجود
  },
];

export default function TestPlaceholderPage() {
  const { darkMode } = useDarkModeContext();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            اختبار الصور البديلة - النسخة الخفيفة
          </h1>
          <p className="text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            اختبار الصورة البديلة المحسّنة في بلوك الأخبار المميزة للنسخة الخفيفة مع دعم الوضع الليلي
          </p>
          
          <div className="mt-4 flex items-center justify-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                الوضع الحالي: {darkMode ? 'ليلي 🌙' : 'نهاري ☀️'}
              </span>
            </div>
          </div>
        </div>

        {/* اختبار الصور البديلة المحسّنة منفردة */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            1️⃣ معاينة الصورة البديلة المحسّنة
          </h2>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* وضع نهاري */}
              <div className="space-y-3">
                <h3 className="font-semibold text-gray-700 dark:text-gray-300">الوضع النهاري</h3>
                <div className="relative aspect-video w-full rounded-lg overflow-hidden border">
                  <SmartPlaceholder 
                    darkMode={false}
                    type="article"
                  />
                </div>
              </div>
              
              {/* وضع ليلي */}
              <div className="space-y-3">
                <h3 className="font-semibold text-gray-700 dark:text-gray-300">الوضع الليلي</h3>
                <div className="relative aspect-video w-full rounded-lg overflow-hidden border">
                  <SmartPlaceholder 
                    darkMode={true}
                    type="article"
                  />
                </div>
              </div>
              
              {/* الوضع الحالي */}
              <div className="space-y-3">
                <h3 className="font-semibold text-gray-700 dark:text-gray-300">الوضع الحالي</h3>
                <div className="relative aspect-video w-full rounded-lg overflow-hidden border">
                  <SmartPlaceholder 
                    darkMode={darkMode}
                    type="article"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* اختبار الأخبار بدون صور */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            2️⃣ أخبار بدون صور (تظهر الصورة البديلة)
          </h2>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
            <LightFeaturedStrip articles={testArticlesWithoutImages} />
          </div>
        </div>

        {/* اختبار الأخبار مع صور مكسورة */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            3️⃣ أخبار مع صور مكسورة (fallback إلى الصورة البديلة)
          </h2>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
            <LightFeaturedStrip articles={testArticlesWithBrokenImages} />
          </div>
        </div>

        {/* تقرير التحسينات */}
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-4">
            📋 التحسينات المطبقة:
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">
                ✨ الصور البديلة المحسّنة:
              </h4>
              <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                <li>• تصميم SVG محسّن مع تدرج لوني جميل</li>
                <li>• نسختان: نهارية وليلية تلقائية</li>
                <li>• أيقونة جريدة عربية مع خطوط نص</li>
                <li>• زخرفة خفيفة ونص توضيحي</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">
                🔧 التحسينات التقنية:
              </h4>
              <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                <li>• مكون SmartPlaceholder ذكي</li>
                <li>• معالجة محسّنة للصور المفقودة والمكسورة</li>
                <li>• استخدام Next.js Image المحسّن</li>
                <li>• دعم كامل للوضع الليلي</li>
              </ul>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-green-100 dark:bg-green-900/20 rounded-lg">
            <p className="text-green-800 dark:text-green-200 text-sm">
              <strong>🎉 تم إصلاح المشكلة:</strong> الآن بلوك الأخبار المميزة في النسخة الخفيفة يعرض صوراً بديلة جميلة عند عدم توفر الصور!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
