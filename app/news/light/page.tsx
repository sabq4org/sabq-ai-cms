import React from 'react';
import LightRecentNews from '@/components/news/LightRecentNews';

// صفحة مثال لاستخدام المكون الخفيف
export default function NewsPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="container mx-auto px-4 space-y-8">
        
        {/* النسخة السريعة - للصفحات ذات الأولوية للسرعة */}
        <section className="bg-white rounded-lg p-4 sm:p-6 shadow-sm">
          <LightRecentNews
            title="أخبار سريعة"
            limit={6}
            priority="speed"
            showExcerpt={false}
          />
        </section>

        {/* النسخة المحسنة للهواتف */}
        <section className="bg-white rounded-lg p-4 sm:p-6 shadow-sm">
          <LightRecentNews
            title="أحدث الأخبار - محسن للهواتف"
            limit={8}
            priority="mobile"
            showExcerpt={true}
          />
        </section>

        {/* النسخة المتوازنة */}
        <section className="bg-white rounded-lg p-4 sm:p-6 shadow-sm">
          <LightRecentNews
            title="جميع الأخبار الحديثة"
            limit={12}
            priority="balanced"
            showExcerpt={true}
          />
        </section>

      </div>
    </div>
  );
}
