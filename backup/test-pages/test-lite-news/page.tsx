'use client';

import React from 'react';
import OldStyleNewsBlock from '@/components/old-style/OldStyleNewsBlock';

const sampleArticles = [
  {
    id: 1,
    title: 'خبر جديد مع ليبل "جديد" مرفوع لأعلى',
    excerpt: 'هذا خبر جديد لاختبار رفع ليبل "جديد" والتاريخ ليحاذوا الحد العلوي للصورة',
    published_at: new Date().toISOString(), // خبر جديد (خلال ساعتين)
    views: 245,
    reading_time: 3,
    slug: 'new-article-test',
    featured_image: '/images/test-news-1.jpg'
  },
  {
    id: 2,
    title: 'خبر قديم بدون ليبل جديد',
    excerpt: 'هذا خبر قديم لا يحتوي على ليبل "جديد"',
    published_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), // خبر قديم (5 ساعات)
    views: 1234,
    reading_time: 5,
    slug: 'old-article-test',
    featured_image: '/images/test-news-2.jpg'
  },
  {
    id: 3,
    title: 'خبر عاجل مع ليبل عاجل مرفوع',
    excerpt: 'هذا خبر عاجل لاختبار رفع ليبل "عاجل"',
    published_at: new Date().toISOString(),
    views: 567,
    reading_time: 2,
    slug: 'breaking-news-test',
    featured_image: '/images/test-news-3.jpg',
    breaking: true
  }
];

export default function TestLiteNewsPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            اختبار بطاقات الأخبار - النسخة الخفيفة
          </h1>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            اختبار رفع ليبل "جديد" والتاريخ ليحاذوا الحد العلوي للصورة في بطاقات الأخبار العادية
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
            بطاقات الأخبار مع التصميم المُحدث - النمط الأول (مرفوع أكثر)
          </h2>
          
          <OldStyleNewsBlock 
            articles={sampleArticles}
            title="آخر الأخبار"
            showTitle={false}
            columns={3}
            className="lite-news-demo"
          />
        </div>

        <div className="mt-8 bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
            معاينة التحديثات المطبقة
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-700 dark:text-gray-300">النمط الحالي:</h3>
              <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                <li>• رفع الشريط العلوي بـ -16px</li>
                <li>• تقليل المسافة السفلية للصورة إلى 6px</li>
                <li>• رفع إضافي للشارات والتاريخ بـ -2px</li>
              </ul>
            </div>
            
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-700 dark:text-gray-300">البدائل المتاحة:</h3>
              <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                <li>• وضع الشارات فوق الصورة مباشرة</li>
                <li>• إضافة خلفية شفافة للوضوح</li>
                <li>• تحكم أدق في المحاذاة</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-3">
            التغييرات المطبقة:
          </h3>
          <ul className="text-blue-800 dark:text-blue-200 space-y-2">
            <li>• رفع ليبل "جديد" والتاريخ بـ -16px لأعلى (بدلاً من -8px)</li>
            <li>• تقليل المسافة السفلية للصورة من 12px إلى 6px</li>
            <li>• إضافة رفع إضافي -2px للشارات والتاريخ للمحاذاة الدقيقة</li>
            <li>• الليبل والتاريخ الآن يحاذوان الحد العلوي للصورة بدقة أكبر</li>
            <li>• متوفر نمط بديل لوضع الشارات فوق الصورة مباشرة</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
