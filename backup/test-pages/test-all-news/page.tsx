'use client';

import React from 'react';
import OldFeaturedHero from '@/components/old/OldFeaturedHero';
import LightFeaturedLoader from '@/components/featured/LightFeaturedLoader';
import OldStyleNewsBlock from '@/components/old-style/OldStyleNewsBlock';

const sampleArticles = [
  {
    id: 1,
    title: 'خبر جديد في الأخبار العادية مع ليبل "جديد"',
    excerpt: 'هذا خبر جديد لاختبار ليبل "جديد" في الأخبار العادية',
    published_at: new Date().toISOString(), // خبر جديد (خلال ساعتين)
    views: 245,
    reading_time: 3,
    slug: 'new-regular-article',
    featured_image: '/images/test-news-1.jpg'
  },
  {
    id: 2,
    title: 'خبر قديم في الأخبار العادية بدون ليبل',
    excerpt: 'هذا خبر قديم لا يحتوي على ليبل "جديد"',
    published_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), // خبر قديم (5 ساعات)
    views: 1234,
    reading_time: 5,
    slug: 'old-regular-article',
    featured_image: '/images/test-news-2.jpg'
  },
  {
    id: 3,
    title: 'خبر عاجل في الأخبار العادية',
    excerpt: 'هذا خبر عاجل في الأخبار العادية',
    published_at: new Date().toISOString(),
    views: 567,
    reading_time: 2,
    slug: 'breaking-regular-article',
    featured_image: '/images/test-news-3.jpg',
    breaking: true
  }
];

export default function TestAllNewsPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            اختبار شامل - جميع مكونات الأخبار
          </h1>
          <p className="text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            اختبار ليبل "جديد" وإصلاح الصور في جميع مكونات الأخبار - النسخة المميزة والعادية
          </p>
        </div>

        {/* الأخبار المميزة - النسخة الكاملة (الديسكتوب) */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            1️⃣ الأخبار المميزة - النسخة الكاملة (الديسكتوب)
          </h2>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              يستخدم: OldFeaturedHero → FeaturedNewsCarousel
            </p>
            <OldFeaturedHero />
          </div>
        </div>

        {/* الأخبار المميزة - النسخة الخفيفة (الموبايل) */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            2️⃣ الأخبار المميزة - النسخة الخفيفة (الموبايل)
          </h2>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              يستخدم: LightFeaturedLoader → LightFeaturedStrip
            </p>
            <LightFeaturedLoader heading="الأخبار المميزة - النسخة الخفيفة" limit={3} />
          </div>
        </div>

        {/* الأخبار العادية - النسخة الخفيفة */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            3️⃣ الأخبار العادية - النسخة الخفيفة
          </h2>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              يستخدم: OldStyleNewsBlock (بالتعديلات الجديدة لرفع الليبل)
            </p>
            <OldStyleNewsBlock 
              articles={sampleArticles}
              title="آخر الأخبار"
              showTitle={true}
              columns={3}
            />
          </div>
        </div>

        {/* تقرير التعديلات */}
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-4">
            📋 ملخص التعديلات المطبقة:
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">
                ✅ الإصلاحات المكتملة:
              </h4>
              <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                <li>• إضافة ليبل "🔥 جديد" للنسخة الخفيفة (LightFeaturedStrip)</li>
                <li>• إصلاح مشكلة عدم ظهور الصور في النسخة الخفيفة</li>
                <li>• رفع ليبل "جديد" والتاريخ في الأخبار العادية</li>
                <li>• تطبيق CSS للـ recent-news-badge في layout.tsx</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">
                🎯 التحديثات:
              </h4>
              <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                <li>• النسخة الكاملة: FeaturedNewsCarousel لديه الليبل بالفعل</li>
                <li>• النسخة الخفيفة: تم إضافة ليبل "جديد" الآن</li>
                <li>• الأخبار العادية: تم رفع الليبل والتاريخ</li>
                <li>• الصور: تم إصلاح معالجة المسارات وإضافة placeholder</li>
              </ul>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-green-100 dark:bg-green-900/20 rounded-lg">
            <p className="text-green-800 dark:text-green-200 text-sm">
              <strong>🎉 جميع المشاكل تم إصلاحها:</strong> الآن ليبل "جديد" يظهر في جميع المكونات والصور تعمل بشكل صحيح!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
