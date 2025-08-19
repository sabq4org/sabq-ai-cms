"use client";

import { useEffect, useState, useMemo, Suspense } from "react";
import { Loader2 } from "lucide-react";
import { debounce } from "@/lib/performance";
import dynamic from "next/dynamic";

// تحميل ديناميكي للمكونات الثقيلة
const EnhancedMuqtarabBlock = dynamic(
  () => import("@/components/home/EnhancedMuqtarabBlock"),
  { 
    ssr: false,
    loading: () => <div className="h-32 bg-gray-200 animate-pulse rounded-lg" />
  }
);

const NewsCard = dynamic(
  () => import("@/components/NewsCard"),
  { 
    ssr: false,
    loading: () => <div className="h-24 bg-gray-200 animate-pulse rounded-lg" />
  }
);

const UserWelcomeBlock = dynamic(
  () => import("@/components/user/UserWelcomeBlock"),
  { ssr: false }
);

// بيانات تجريبية للنسخة المحمولة
const sampleMobileNews = [
  {
    id: "1",
    title: "وزير الخارجية يبحث تطورات الأوضاع الإقليمية مع نظيره الأمريكي",
    excerpt: "عقد وزير الخارجية اجتماعاً مهماً مع نظيره الأمريكي لبحث آخر التطورات في المنطقة.",
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
    excerpt: "أعلنت وزارة الاتصالات عن إطلاق برنامج شامل لدعم الشركات الناشئة.",
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

interface ResponsiveHomeProps {
  isMobile?: boolean;
}

export default function ResponsiveHome({ isMobile = false }: ResponsiveHomeProps) {
  const [loading, setLoading] = useState(true);
  const [news, setNews] = useState<any[]>([]);

  // تحسين تحميل البيانات
  useEffect(() => {
    if (isMobile) {
      // تقليل وقت التحميل للموبايل
      const loadData = debounce(() => {
        setNews(sampleMobileNews);
        setLoading(false);
      }, 300);
      
      loadData();
    } else {
      setLoading(false);
    }
  }, [isMobile]);

  // تحسين تقديم المحتوى
  const MobileHeader = useMemo(() => (
    <div className="mb-6 text-center">
      <div 
        className="mb-4 p-4 rounded-xl border-2"
        style={{
          borderColor: 'var(--theme-primary, #3B82F6)',
          backgroundColor: 'var(--theme-primary, #3B82F6)10',
        }}
      >
        <h1 
          className="text-2xl font-bold mb-2"
          style={{ color: 'var(--theme-primary, #3B82F6)' }}
        >
          🌟 النسخة الخفيفة
        </h1>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          واجهة مبسطة وسريعة للأجهزة المحمولة
        </p>
      </div>
    </div>
  ), []);

  const LoginCTA = useMemo(() => (
    <div 
      className="mb-6 p-3 rounded-lg text-center border"
      style={{
        backgroundColor: 'var(--theme-primary, #3B82F6)05',
        borderColor: 'var(--theme-primary, #3B82F6)20',
      }}
    >
      <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
        للحصول على محتوى مخصص لك
      </p>
      <div className="flex items-center justify-center gap-2">
        <button
          className="px-3 py-1 rounded-md text-xs font-medium text-white transition-all hover:scale-105"
          style={{
            backgroundColor: 'var(--theme-primary, #3B82F6)',
          }}
        >
          تسجيل دخول
        </button>
        <button
          className="px-3 py-1 rounded-md text-xs font-medium transition-all hover:scale-105 border"
          style={{
            borderColor: 'var(--theme-primary, #3B82F6)',
            color: 'var(--theme-primary, #3B82F6)',
          }}
        >
          إنشاء حساب
        </button>
      </div>
    </div>
  ), []);

  const MobileFeatures = useMemo(() => (
    <div className="mt-12 text-center">
      <h3 className="text-lg font-bold mb-4 text-gray-900 dark:text-white">
        مميزات النسخة الخفيفة
      </h3>
      <div className="grid grid-cols-2 gap-4 text-sm">
        {[
          { icon: "⚡", title: "سريع جداً", desc: "تحميل فائق السرعة" },
          { icon: "📱", title: "محمول أولاً", desc: "مُحسّن للهواتف" },
          { icon: "🎨", title: "ألوان ديناميكية", desc: "نظام ألوان متقدم" },
          { icon: "🌙", title: "وضع ليلي", desc: "راحة للعينين" }
        ].map((feature, index) => (
          <div 
            key={index}
            className="p-4 rounded-lg border"
            style={{
              backgroundColor: 'var(--theme-primary, #3B82F6)10',
              borderColor: 'var(--theme-primary, #3B82F6)20',
            }}
          >
            <div className="text-2xl mb-2">{feature.icon}</div>
            <div className="font-medium mb-1">{feature.title}</div>
            <div className="text-xs text-gray-600">{feature.desc}</div>
          </div>
        ))}
      </div>
    </div>
  ), []);

  // النسخة المحمولة - مبسطة وسريعة
  if (isMobile) {
    return (
      <div className="max-w-7xl mx-auto">
        {MobileHeader}
        {LoginCTA}

        {/* News Grid - محسن للموبايل */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin mb-3" style={{ color: 'var(--theme-primary, #3B82F6)' }} />
            <p className="text-sm text-gray-600 dark:text-gray-400">جاري تحميل الأخبار...</p>
          </div>
        ) : (
          <Suspense fallback={
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-24 bg-gray-200 animate-pulse rounded-lg" />
              ))}
            </div>
          }>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {news.map((article) => (
                <NewsCard key={article.id} news={article} />
              ))}
            </div>
          </Suspense>
        )}

        {/* مكون مقترب للموبايل - مبسط */}
        <Suspense fallback={<div className="h-32 bg-gray-200 animate-pulse rounded-lg mt-8" />}>
          <div className="mt-8">
            <EnhancedMuqtarabBlock 
              showHeader={true}
              limit={4}
              showPagination={false}
              showFilters={false}
            />
          </div>
        </Suspense>

        {MobileFeatures}
      </div>
    );
  }

  // النسخة الكاملة للديسكتوب - كما هي
  return (
    <Suspense fallback={<div className="h-96 bg-gray-200 animate-pulse rounded-lg" />}>
      <div>
        <UserWelcomeBlock />
        <EnhancedMuqtarabBlock />
        {/* المزيد من محتوى النسخة الكاملة... */}
      </div>
    </Suspense>
  );
}
