'use client';

import React from 'react';
import FeaturedNewsBlock from '@/components/FeaturedNewsBlock';

export default function TestNewBadgePage() {
  // مقال تجريبي "جديد" (تاريخ حديث)
  const recentArticle = {
    id: '1',
    title: 'عاجل: أخبار مهمة حدثت الآن - هذا خبر جديد مع شعلة النار',
    slug: 'test-recent-news',
    excerpt: 'هذا مقال جديد نُشر مؤخراً لاختبار ليبل "جديد" مع شعلة النار الجميلة من النسخة الخفيفة',
    featured_image: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800&h=400&fit=crop',
    published_at: new Date().toISOString(), // تاريخ حديث جداً
    reading_time: 3,
    views: 1250,
    likes: 89,
    shares: 23,
    category: {
      id: 'tech',
      name: 'تقنية',
      icon: '💻',
      color: '#3b82f6'
    },
    author: {
      id: '1',
      name: 'أحمد محمد',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=50&h=50&fit=crop&crop=face',
      reporter: {
        id: '1',
        full_name: 'أحمد محمد',
        slug: 'ahmed-mohamed',
        verification_badge: 'verified'
      }
    }
  };

  // مقال قديم (بدون ليبل جديد)
  const oldArticle = {
    id: '2',
    title: 'مقال قديم - لن يظهر ليبل جديد',
    slug: 'test-old-news',
    excerpt: 'هذا مقال قديم لن يظهر عليه ليبل "جديد"',
    featured_image: 'https://images.unsplash.com/photo-1495020689067-958852a7765e?w=800&h=400&fit=crop',
    published_at: '2024-01-01T10:00:00Z', // تاريخ قديم
    reading_time: 5,
    views: 2500,
    likes: 150,
    shares: 45,
    category: {
      id: 'news',
      name: 'أخبار',
      icon: '📰',
      color: '#10b981'
    },
    author: {
      id: '2',
      name: 'سارة أحمد',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b77c?w=50&h=50&fit=crop&crop=face',
      reporter: {
        id: '2',
        full_name: 'سارة أحمد',
        slug: 'sara-ahmed',
        verification_badge: 'expert'
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            🔥 ليبل "جديد" للأخبار المميزة
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            نفس التصميم الحالي + ليبل "جديد" مع الشعلة للأخبار الجديدة (آخر ساعتين)
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div>
            <h2 className="text-xl font-bold mb-4 text-green-600">
              ✅ مقال جديد - سيظهر ليبل "جديد"
            </h2>
            <FeaturedNewsBlock article={recentArticle} />
          </div>
          
          <div>
            <h2 className="text-xl font-bold mb-4 text-gray-600">
              ⏰ مقال قديم - بدون ليبل
            </h2>
            <FeaturedNewsBlock article={oldArticle} />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
          <h3 className="text-lg font-bold mb-3 text-gray-900 dark:text-white">
            📋 ملاحظات الاختبار:
          </h3>
          <ul className="text-gray-600 dark:text-gray-300 space-y-2">
            <li>🔥 <strong>ليبل "جديد" مع الشعلة</strong>: يظهر للأخبار الجديدة (آخر ساعتين)</li>
            <li>🎨 <strong>نفس التصميم الحالي</strong>: لا تغيير في التصميم، فقط إضافة الليبل</li>
            <li>⏱️ <strong>مؤقت</strong>: يختفي الليبل بعد ساعتين من النشر</li>
            <li>📱 <strong>متوافق</strong>: يعمل مع الوضع الليلي والنهاري</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
