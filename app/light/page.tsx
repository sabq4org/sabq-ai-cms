"use client";

import LightLayout from "@/components/layouts/LightLayout";
import NewsCard from "@/components/NewsCard";
import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import "@/styles/light-layout.css";

// بيانات تجريبية للعرض
const sampleNews = [
  {
    id: "1",
    title: "وزير الخارجية يبحث تطورات الأوضاع الإقليمية مع نظيره الأمريكي",
    excerpt: "عقد وزير الخارجية اجتماعاً مهماً مع نظيره الأمريكي لبحث آخر التطورات في المنطقة وسبل تعزيز التعاون الثنائي.",
    featured_image: "https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=800&h=600&fit=crop",
    category: { name: "سياسة", slug: "politics" },
    author: { name: "أحمد الراشد" },
    published_at: new Date().toISOString(),
    views: 15420,
    comments_count: 45,
  },
  {
    id: "2", 
    title: "الأخضر السعودي يتأهل لنهائيات كأس آسيا بفوز مستحق",
    excerpt: "حقق المنتخب السعودي فوزاً مهماً على نظيره العماني بثلاثة أهداف مقابل هدف واحد.",
    featured_image: "https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=800&h=600&fit=crop",
    category: { name: "رياضة", slug: "sports" },
    author: { name: "سارة المطيري" },
    published_at: new Date().toISOString(),
    views: 24300,
    comments_count: 120,
    breaking: true,
  },
  {
    id: "3",
    title: "إطلاق برنامج تقني جديد لدعم رواد الأعمال في المملكة",
    excerpt: "أعلنت وزارة الاتصالات عن إطلاق برنامج شامل لدعم الشركات الناشئة في مجال التقنية.",
    featured_image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800&h=600&fit=crop",
    category: { name: "تقنية", slug: "tech" },
    author: { name: "محمد العتيبي" },
    published_at: new Date().toISOString(),
    views: 8920,
    comments_count: 23,
  },
  {
    id: "4",
    title: "مؤشر الأسهم السعودية يغلق مرتفعاً بنسبة 1.2%",
    excerpt: "أغلق المؤشر العام للسوق المالية السعودية على ارتفاع ملحوظ مدعوماً بأداء قطاع البنوك.",
    featured_image: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&h=600&fit=crop",
    category: { name: "اقتصاد", slug: "economy" },
    author: { name: "فاطمة الشمري" },
    published_at: new Date().toISOString(),
    views: 12500,
    comments_count: 67,
  },
];

export default function LightPage() {
  const [loading, setLoading] = useState(true);
  const [news, setNews] = useState<any[]>([]);

  useEffect(() => {
    // محاكاة تحميل البيانات
    setTimeout(() => {
      setNews(sampleNews);
      setLoading(false);
    }, 1000);
  }, []);

  return (
    <LightLayout>
      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            النسخة الخفيفة
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            واجهة مبسطة وسريعة مع جميع الميزات الأساسية
          </p>
        </div>

        {/* Color Theme Demo */}
        <div 
          className="mb-8 p-6 rounded-2xl border-2"
          style={{
            borderColor: 'var(--theme-primary, #3B82F6)',
            backgroundColor: 'var(--theme-primary, #3B82F6)10',
          }}
        >
          <h2 
            className="text-xl font-bold mb-2"
            style={{ color: 'var(--theme-primary, #3B82F6)' }}
          >
            نظام الألوان المتغيرة
          </h2>
          <p className="text-gray-700 dark:text-gray-300">
            يتغير لون الواجهة بناءً على تفضيلاتك. جرب تغيير اللون من إعدادات الموقع!
          </p>
        </div>

        {/* Login/Register CTA Block */}
        <div 
          className="mb-8 p-4 rounded-xl text-center border"
          style={{
            backgroundColor: 'var(--theme-primary, #3B82F6)05',
            borderColor: 'var(--theme-primary, #3B82F6)20',
          }}
        >
          <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
            للحصول على محتوى مخصص لك سجل دخولك أو أنشئ حساباً جديداً
          </p>
          <div className="flex items-center justify-center gap-3">
            <Link
              href="/login"
              className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all hover:scale-105"
              style={{
                backgroundColor: 'var(--theme-primary, #3B82F6)',
                color: 'white',
              }}
            >
              تسجيل دخول
            </Link>
            <Link
              href="/register"
              className="px-4 py-2 rounded-lg text-sm font-medium transition-all hover:scale-105 border"
              style={{
                borderColor: 'var(--theme-primary, #3B82F6)',
                color: 'var(--theme-primary, #3B82F6)',
              }}
            >
              إنشاء حساب
            </Link>
          </div>
        </div>

        {/* News Grid */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-12 h-12 animate-spin mb-4" style={{ color: 'var(--theme-primary, #3B82F6)' }} />
            <p className="text-gray-600 dark:text-gray-400">جاري تحميل الأخبار...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {news.map((article) => (
              <NewsCard key={article.id} news={article} />
            ))}
          </div>
        )}

        {/* Features Section */}
        <div className="mt-16 grid md:grid-cols-3 gap-6">
          <div className="text-center p-6">
            <div 
              className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
              style={{ backgroundColor: 'var(--theme-primary, #3B82F6)20' }}
            >
              <svg 
                className="w-8 h-8"
                style={{ color: 'var(--theme-primary, #3B82F6)' }}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold mb-2 text-gray-900 dark:text-white">سريع وخفيف</h3>
            <p className="text-gray-600 dark:text-gray-400">أداء فائق السرعة مع واجهة مبسطة</p>
          </div>

          <div className="text-center p-6">
            <div 
              className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
              style={{ backgroundColor: 'var(--theme-primary, #3B82F6)20' }}
            >
              <svg 
                className="w-8 h-8"
                style={{ color: 'var(--theme-primary, #3B82F6)' }}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold mb-2 text-gray-900 dark:text-white">متجاوب بالكامل</h3>
            <p className="text-gray-600 dark:text-gray-400">تصميم Mobile-First يعمل على جميع الأجهزة</p>
          </div>

          <div className="text-center p-6">
            <div 
              className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
              style={{ backgroundColor: 'var(--theme-primary, #3B82F6)20' }}
            >
              <svg 
                className="w-8 h-8"
                style={{ color: 'var(--theme-primary, #3B82F6)' }}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
              </svg>
            </div>
            <h3 className="text-lg font-bold mb-2 text-gray-900 dark:text-white">ألوان متغيرة</h3>
            <p className="text-gray-600 dark:text-gray-400">نظام ألوان ديناميكي قابل للتخصيص</p>
          </div>
        </div>
      </div>
    </LightLayout>
  );
}
