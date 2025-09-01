// مثال على استخدام المكونات الخفيفة في الصفحة الرئيسية

import LightRecentNews from '@/components/news/LightRecentNews';
import { Suspense } from 'react';

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-12">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            صحيفة سبق الذكية
          </h1>
          <p className="text-lg opacity-90">
            أحدث الأخبار والتحليلات من المملكة والعالم
          </p>
        </div>
      </section>

      {/* محتوى الصفحة */}
      <main className="container mx-auto px-4 py-8">
        
        {/* أخبار سريعة للفوق - محسنة للسرعة */}
        <section className="mb-12">
          <Suspense fallback={
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          }>
            <LightRecentNews
              title="🔥 أخبار عاجلة"
              limit={4}
              priority="speed"
              showExcerpt={false}
            />
          </Suspense>
        </section>

        {/* شبكة الأخبار الرئيسية - محسنة للهواتف */}
        <section className="mb-12">
          <Suspense fallback={
            <div className="space-y-4">
              <div className="h-6 bg-gray-200 rounded w-32 animate-pulse"></div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="space-y-2">
                    <div className="h-32 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-3 bg-gray-200 rounded w-3/4 animate-pulse"></div>
                  </div>
                ))}
              </div>
            </div>
          }>
            <LightRecentNews
              title="📱 أحدث الأخبار"
              limit={8}
              priority="mobile"
              showExcerpt={true}
            />
          </Suspense>
        </section>

        {/* المزيد من الأخبار - نسخة متوازنة */}
        <section>
          <Suspense fallback={
            <div className="text-center py-4 text-gray-500">
              جاري تحميل المزيد من الأخبار...
            </div>
          }>
            <LightRecentNews
              title="📰 جميع الأخبار"
              limit={12}
              priority="balanced"
              showExcerpt={true}
            />
          </Suspense>
        </section>
      </main>
    </div>
  );
}

// ملاحظات الاستخدام:
/* 
1. priority="speed": أسرع، أقل بيانات، مناسب للأخبار العاجلة
2. priority="mobile": محسن للهواتف مع توازن بين السرعة والمحتوى  
3. priority="balanced": يعرض كامل المحتوى، مناسب للشاشات الكبيرة

التحسينات المطبقة:
- Lazy Loading للصور
- تقليل حجم البيانات حسب الأولوية  
- Caching ذكي
- تصميم responsive للهواتف
- تحسين الأداء مع React.memo
- Suspense للتحميل التدريجي
*/
