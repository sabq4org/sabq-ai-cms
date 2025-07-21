// 🎯 مثال تطبيقي: نظام التوصيات الذكي المتنوع
// Enhanced Smart Recommendations Example

import React from 'react';
import SmartRecommendationBlock from '@/components/article/SmartRecommendationBlock';

/**
 * مثال لاستخدام النظام المحدث في صفحة المقال
 * يوضح كيفية تطبيق نمط التبديل الذكي وكسر التشابه البصري
 */

// 📊 نموذج البيانات المرجعة من API
const sampleApiResponse = {
  success: true,
  recommendations: [
    // العناصر 0-4: بطاقات أخبار كاملة
    {
      id: "1",
      title: "أخبار اقتصادية مهمة حول السوق السعودي",
      excerpt: "تحليل شامل للتطورات الاقتصادية الأخيرة...",
      type: "news",
      featured_image: "/images/news-1.jpg",
      author_name: "أحمد محمد"
    },
    {
      id: "2", 
      title: "تطورات جديدة في قطاع التكنولوجيا",
      excerpt: "ابتكارات تقنية تغير مستقبل الأعمال...",
      type: "news",
      featured_image: "/images/tech-1.jpg",
      author_name: "سارة أحمد"
    },
    // ... 3 مقالات أخبار أخرى

    // العنصر 5: روابط مقالات رأي (بدون صور)
    {
      id: "6",
      title: "وجهة نظر: مستقبل الاستثمار في المملكة",
      excerpt: "رؤية تحليلية حول اتجاهات الاستثمار...",
      type: "opinion",
      author_name: "د. خالد السعود"
    },
    {
      id: "7",
      title: "رأي: التحولات الاجتماعية ورؤية 2030",
      excerpt: "تأثير رؤية المملكة على المجتمع...",
      type: "opinion", 
      author_name: "فاطمة الزهراني"
    },

    // العناصر 8-12: بطاقات أخبار جديدة
    // ... المزيد من الأخبار

    // العنصر 13: روابط تحليل عميق
    {
      id: "14",
      title: "تحليل عميق: اتجاهات السوق العقاري",
      excerpt: "دراسة تفصيلية لحالة العقارات...", 
      type: "analysis",
      author_name: "فريق التحليل الاقتصادي"
    }
  ],
  smart: {
    news: [/* مقالات أخبار */],
    opinion: [/* مقالات رأي */],
    analysis: [/* تحليلات عميقة */]
  }
};

// 🎨 مثال على العرض المرئي المتوقع
const VisualFlowExample = () => {
  return (
    <div className="space-y-6">
      
      {/* المرحلة 1: بطاقات أخبار كاملة */}
      <section className="news-cards-section">
        <h3>📰 أخبار مشابهة (بطاقات كاملة)</h3>
        {/* 5 بطاقات بصور وتفاصيل كاملة */}
        <div className="grid gap-4">
          <ArticleCard withImage={true} />
          <ArticleCard withImage={true} />
          <ArticleCard withImage={true} />
          <ArticleCard withImage={true} />
          <ArticleCard withImage={true} />
        </div>
      </section>

      {/* كسر التشابه: روابط مقالات رأي */}
      <section className="smart-links-section">
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border-r-4 border-green-400">
          <h4 className="font-bold text-green-800 flex items-center">
            <span className="text-lg ml-2">✍️</span>
            آراء وتحليلات
          </h4>
          <div className="space-y-3 mt-3">
            {/* روابط بدون صور - كسر التشابه */}
            <SmartLink 
              title="وجهة نظر: مستقبل الاستثمار في المملكة"
              author="د. خالد السعود"
              icon="✍️"
            />
            <SmartLink
              title="رأي: التحولات الاجتماعية ورؤية 2030" 
              author="فاطمة الزهراني"
              icon="✍️"
            />
          </div>
        </div>
      </section>

      {/* المرحلة 2: بطاقات أخبار جديدة */}
      <section className="news-cards-section">
        <h3>📈 المزيد من الأخبار</h3>
        {/* 5 بطاقات أخرى */}
        <div className="grid gap-4">
          <ArticleCard withImage={true} />
          <ArticleCard withImage={true} />
          <ArticleCard withImage={true} />
          <ArticleCard withImage={true} />
          <ArticleCard withImage={true} />
        </div>
      </section>

      {/* كسر التشابه: روابط تحليل عميق */}
      <section className="smart-links-section">
        <div className="bg-gradient-to-r from-purple-50 to-violet-50 rounded-xl p-4 border-r-4 border-purple-400">
          <h4 className="font-bold text-purple-800 flex items-center">
            <span className="text-lg ml-2">🧠</span>
            تحليل عميق
          </h4>
          <div className="space-y-3 mt-3">
            <SmartLink
              title="تحليل عميق: اتجاهات السوق العقاري"
              author="فريق التحليل الاقتصادي"
              icon="🧠"
            />
          </div>
        </div>
      </section>

    </div>
  );
};

// 🔗 مكون الرابط الذكي 
const SmartLink = ({ title, author, icon }) => (
  <a href="#" className="group block">
    <div className="flex items-start space-x-reverse space-x-3 p-3 rounded-lg bg-white/60 hover:bg-white hover:shadow-sm transition-all duration-200">
      <div className="flex-shrink-0 mt-1">
        <span className="text-sm">{icon}</span>
      </div>
      <div className="flex-1 min-w-0">
        <h5 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors leading-tight line-clamp-2">
          {title}
        </h5>
        <div className="flex items-center mt-1 text-xs text-gray-500">
          <span>{author}</span>
        </div>
      </div>
      <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity text-blue-600">
        <span>→</span>
      </div>
    </div>
  </a>
);

// 📝 مكون البطاقة العادية
const ArticleCard = ({ withImage }) => (
  <article className="recommendation-card bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300">
    {withImage && (
      <div className="relative h-48">
        <img src="/api/placeholder/400/200" alt="صورة المقال" className="object-cover w-full h-full" />
        <div className="absolute top-3 right-3">
          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
            📰 أخبار مشابهة  
          </span>
        </div>
      </div>
    )}
    <div className="p-4">
      <h3 className="font-bold text-gray-900 leading-tight mb-2">
        عنوان المقال الأساسي هنا
      </h3>
      <p className="text-gray-600 leading-relaxed mb-3 line-clamp-2">
        ملخص المقال يظهر هنا مع وصف موجز للمحتوى...
      </p>
      <div className="flex items-center justify-between text-xs text-gray-500">
        <div className="flex items-center space-x-reverse space-x-4">
          <span>أحمد محمد</span>
          <span>5 دقائق قراءة</span>
        </div>
        <span>منذ ساعتين</span>
      </div>
    </div>
  </article>
);

// 🎯 الاستخدام في صفحة المقال
export default function ArticlePageExample() {
  const articleId = "sample-article-id";
  const articleCategory = "اقتصاد";
  const articleTags = ["استثمار", "سوق مالي", "رؤية 2030"];

  return (
    <div className="container mx-auto px-4 py-8">
      
      {/* محتوى المقال الأساسي */}
      <article className="mb-12">
        <h1 className="text-3xl font-bold mb-4">عنوان المقال الرئيسي</h1>
        <div className="prose max-w-none">
          {/* محتوى المقال */}
          <p>محتوى المقال يظهر هنا...</p>
        </div>
      </article>

      {/* نظام التوصيات الذكي المحسن */}
      <SmartRecommendationBlock
        articleId={articleId}
        category={articleCategory}
        tags={articleTags}
        className="mt-12"
      />

      {/* مثال على النتيجة المرئية */}
      <div className="mt-16 p-6 bg-gray-50 rounded-xl">
        <h2 className="text-2xl font-bold mb-6 text-center">🎯 المعاينة المرئية للنظام</h2>
        <VisualFlowExample />
      </div>

    </div>
  );
}

// 📊 إحصائيات متوقعة للتحسن
const expectedImprovements = {
  clickThroughRate: "+25%", // زيادة معدل النقر
  timeOnPage: "+40%",       // زيادة الوقت في الصفحة  
  userEngagement: "+30%",   // زيادة التفاعل
  bounceRate: "-20%"        // تقليل معدل الارتداد
};

export { expectedImprovements, sampleApiResponse };
