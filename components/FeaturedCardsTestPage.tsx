/**
 * مكون اختبار إصلاحات بطاقة الأخبار المميزة
 * Featured Cards Fixes Test Component
 */

"use client";

import FeaturedNewsCard, {
  CompactNewsCard,
  HeroNewsCard,
} from "@/components/FeaturedNewsCardEnhanced";
// import UnifiedMobileNewsCard from "@/components/mobile/UnifiedMobileNewsCard";
import { useDarkMode } from "@/hooks/useDarkMode";

// بيانات تجريبية للاختبار
const testArticles = [
  {
    id: "test-1",
    title:
      "هذا عنوان طويل جداً يجب أن يظهر في ثلاثة أسطر كاملة بدون قص في السطر الثالث والأخير للتأكد من الإصلاح",
    excerpt:
      "هذه نبذة الخبر التي يجب أن تظهر بمسافة مناسبة من العنوان بعد تطبيق التحسين المطلوب وهو تنزيلها تكة واحدة",
    featured_image:
      "https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800&h=600&fit=crop",
    category: {
      id: "tech",
      name: "تقنية",
      color: "#3b82f6",
      icon: "💻",
    },
    author: {
      id: "author-1",
      name: "محمد أحمد",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
    },
    published_at: "2025-01-28T10:00:00Z",
    created_at: "2025-01-28T10:00:00Z",
    views: 1250,
    reading_time: 5,
    comments_count: 12,
    breaking: true,
    featured: true,
  },
  {
    id: "test-2",
    title: "عنوان متوسط الطول يظهر في سطرين أو ثلاثة أسطر حسب حجم الشاشة",
    excerpt: "نبذة أقصر للاختبار",
    featured_image:
      "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&h=600&fit=crop",
    category: {
      id: "economy",
      name: "اقتصاد",
      color: "#10b981",
      icon: "📊",
    },
    author: {
      id: "author-2",
      name: "سارة محمد",
    },
    published_at: "2025-01-28T09:30:00Z",
    created_at: "2025-01-28T09:30:00Z",
    views: 890,
    reading_time: 3,
    featured: true,
  },
  {
    id: "test-3",
    title: "عنوان قصير",
    excerpt: "نبذة قصيرة للاختبار",
    featured_image:
      "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=800&h=600&fit=crop",
    category: {
      id: "sports",
      name: "رياضة",
      color: "#ef4444",
      icon: "⚽",
    },
    author: {
      id: "author-3",
      name: "أحمد علي",
    },
    published_at: "2025-01-28T08:45:00Z",
    created_at: "2025-01-28T08:45:00Z",
    views: 2100,
    reading_time: 7,
    breaking: true,
  },
];

export default function FeaturedCardsTestPage() {
  const { darkMode } = useDarkMode();

  return (
    <div
      className={`min-h-screen p-6 ${darkMode ? "bg-gray-900" : "bg-gray-50"}`}
    >
      <div className="max-w-7xl mx-auto space-y-12">
        {/* عنوان الصفحة */}
        <div className="text-center">
          <h1
            className={`text-3xl font-bold mb-4 ${
              darkMode ? "text-white" : "text-gray-900"
            }`}
          >
            اختبار إصلاحات بطاقة الأخبار المميزة
          </h1>
          <p
            className={`text-lg ${
              darkMode ? "text-gray-300" : "text-gray-600"
            }`}
          >
            اختبار مشكلة قص العنوان في السطر الثالث وتحسين موضع نبذة الخبر
          </p>
        </div>

        {/* اختبار البطاقة الرئيسية Hero */}
        <section>
          <h2
            className={`text-2xl font-bold mb-6 ${
              darkMode ? "text-white" : "text-gray-900"
            }`}
          >
            1. البطاقة الرئيسية (Hero Card)
          </h2>
          <div className="grid grid-cols-1 gap-6">
            <HeroNewsCard
              article={testArticles[0]}
              darkMode={darkMode}
              className="max-w-4xl mx-auto"
            />
          </div>
        </section>

        {/* اختبار البطاقات المميزة */}
        <section>
          <h2
            className={`text-2xl font-bold mb-6 ${
              darkMode ? "text-white" : "text-gray-900"
            }`}
          >
            2. البطاقات المميزة (Featured Cards)
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {testArticles.map((article) => (
              <FeaturedNewsCard
                key={article.id}
                article={article}
                darkMode={darkMode}
              />
            ))}
          </div>
        </section>

        {/* اختبار البطاقات المضغوطة */}
        <section>
          <h2
            className={`text-2xl font-bold mb-6 ${
              darkMode ? "text-white" : "text-gray-900"
            }`}
          >
            3. البطاقات المضغوطة (Compact Cards)
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {testArticles.map((article) => (
              <CompactNewsCard
                key={`compact-${article.id}`}
                article={article}
                darkMode={darkMode}
              />
            ))}
          </div>
        </section>

        {/* اختبار البطاقات الموحدة */}
        <section>
          <h2
            className={`text-2xl font-bold mb-6 ${
              darkMode ? "text-white" : "text-gray-900"
            }`}
          >
            4. البطاقات الموحدة المحسنة (Unified Cards)
          </h2>

          {/* Smart Block Variant */}
          <div className="mb-8">
            <h3
              className={`text-xl font-semibold mb-4 ${
                darkMode ? "text-gray-200" : "text-gray-800"
              }`}
            >
              Smart Block Variant
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {testArticles.map((article) => (
                <UnifiedMobileNewsCard
                  key={`smart-${article.id}`}
                  article={article}
                  darkMode={darkMode}
                  variant="smart-block"
                />
              ))}
            </div>
          </div>

          {/* Default Variant */}
          <div className="mb-8">
            <h3
              className={`text-xl font-semibold mb-4 ${
                darkMode ? "text-gray-200" : "text-gray-800"
              }`}
            >
              Default Variant
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {testArticles.map((article) => (
                <UnifiedMobileNewsCard
                  key={`default-${article.id}`}
                  article={article}
                  darkMode={darkMode}
                  variant="default"
                />
              ))}
            </div>
          </div>

          {/* Compact Variant */}
          <div className="mb-8">
            <h3
              className={`text-xl font-semibold mb-4 ${
                darkMode ? "text-gray-200" : "text-gray-800"
              }`}
            >
              Compact Variant
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {testArticles.map((article) => (
                <UnifiedMobileNewsCard
                  key={`unified-compact-${article.id}`}
                  article={article}
                  darkMode={darkMode}
                  variant="compact"
                />
              ))}
            </div>
          </div>
        </section>

        {/* ملاحظات الاختبار */}
        <section
          className={`p-6 rounded-xl ${
            darkMode ? "bg-gray-800" : "bg-white"
          } shadow-lg`}
        >
          <h2
            className={`text-xl font-bold mb-4 ${
              darkMode ? "text-white" : "text-gray-900"
            }`}
          >
            📝 ملاحظات الاختبار
          </h2>
          <div className="space-y-4 text-sm">
            <div
              className={`p-4 rounded-lg ${
                darkMode
                  ? "bg-blue-900/20 border-blue-800"
                  : "bg-blue-50 border-blue-200"
              } border`}
            >
              <h3
                className={`font-semibold mb-2 ${
                  darkMode ? "text-blue-400" : "text-blue-800"
                }`}
              >
                ✅ الإصلاحات المطبقة:
              </h3>
              <ul
                className={`space-y-1 ${
                  darkMode ? "text-blue-300" : "text-blue-700"
                }`}
              >
                <li>• العناوين الطويلة تظهر في 3 أسطر كاملة بدون قص</li>
                <li>• النبذة تظهر بمسافة أقل من العنوان ("تكة واحدة")</li>
                <li>• تحسين line-height للعناوين (1.4)</li>
                <li>• إضافة padding-bottom لمنع القص</li>
              </ul>
            </div>

            <div
              className={`p-4 rounded-lg ${
                darkMode
                  ? "bg-green-900/20 border-green-800"
                  : "bg-green-50 border-green-200"
              } border`}
            >
              <h3
                className={`font-semibold mb-2 ${
                  darkMode ? "text-green-400" : "text-green-800"
                }`}
              >
                🎨 التحسينات الإضافية:
              </h3>
              <ul
                className={`space-y-1 ${
                  darkMode ? "text-green-300" : "text-green-700"
                }`}
              >
                <li>• شارات متحركة للأخبار العاجلة والمميزة</li>
                <li>• تأثيرات hover محسنة</li>
                <li>• دعم كامل للوضع المظلم</li>
                <li>• تجاوب ممتاز مع جميع أحجام الشاشات</li>
              </ul>
            </div>

            <div
              className={`p-4 rounded-lg ${
                darkMode
                  ? "bg-yellow-900/20 border-yellow-800"
                  : "bg-yellow-50 border-yellow-200"
              } border`}
            >
              <h3
                className={`font-semibold mb-2 ${
                  darkMode ? "text-yellow-400" : "text-yellow-800"
                }`}
              >
                🧪 كيفية الاختبار:
              </h3>
              <ul
                className={`space-y-1 ${
                  darkMode ? "text-yellow-300" : "text-yellow-700"
                }`}
              >
                <li>• تغيير حجم الشاشة للتحقق من التجاوب</li>
                <li>• التبديل بين الوضع المظلم والفاتح</li>
                <li>• فحص العناوين الطويلة في البطاقة الأولى</li>
                <li>• التأكد من المسافة بين العنوان والنبذة</li>
              </ul>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
