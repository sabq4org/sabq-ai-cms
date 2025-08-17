'use client';

import React from 'react';
import dynamic from 'next/dynamic';

// Dynamic imports to avoid SSR issues
const FeaturedMobileCard = dynamic(() => import('@/components/mobile/FeaturedMobileCard'), { ssr: false });
const MobileCard = dynamic(() => import('@/components/mobile/MobileCard'), { ssr: false });
const EnhancedMobileArticleCard = dynamic(() => import('@/components/mobile/EnhancedMobileArticleCard'), { ssr: false });
const DarkModeProvider = dynamic(() => import('@/contexts/DarkModeContext').then(mod => ({ default: mod.DarkModeProvider })), { ssr: false });

const sampleArticles = [
  {
    id: '1',
    title: 'مستقبل الذكاء الاصطناعي في الصحافة العربية - تحول جذري في صناعة الإعلام',
    summary: 'تشهد صناعة الصحافة العربية تطوراً مذهلاً مع دخول تقنيات الذكاء الاصطناعي، مما يعيد تشكيل طرق إنتاج ونشر المحتوى.',
    excerpt: 'استطلاع شامل حول تأثير التقنيات الحديثة على الصحافة التقليدية',
    featured_image: '/images/ai-future.jpg',
    category_id: 1,
    category_name: 'تقنية',
    author_name: 'أحمد الغامدي',
    views_count: 1250,
    created_at: '2024-12-15T08:45:00Z',
    published_at: '2024-12-15T08:45:00Z',
    reading_time: 8,
    is_breaking: false,
    is_featured: true,
    slug: 'ai-future-arabic-journalism',
    category: {
      name: 'تقنية',
      slug: 'tech',
      color: '#3b82f6'
    },
    author: {
      name: 'أحمد الغامدي',
      avatar: '/images/placeholder-avatar.jpg'
    }
  },
  {
    id: '2',
    title: 'عاجل: تطورات مهمة في مؤتمر نيوم التقني العالمي',
    summary: 'إعلانات جديدة ومثيرة في المؤتمر التقني لمدينة نيوم تعيد تشكيل مستقبل التقنية في المنطقة.',
    excerpt: 'إعلانات جديدة ومثيرة حول مستقبل التقنية في المنطقة',
    featured_image: '/images/neom-summary.jpg',
    category_id: 2,
    category_name: 'أخبار عاجلة',
    author_name: 'سارة المحمدي',
    views_count: 2890,
    created_at: '2024-12-15T10:30:00Z',
    published_at: '2024-12-15T10:30:00Z',
    reading_time: 5,
    is_breaking: true,
    is_featured: true,
    slug: 'neom-tech-conference-updates',
    category: {
      name: 'أخبار عاجلة',
      slug: 'breaking',
      color: '#ef4444'
    },
    author: {
      name: 'سارة المحمدي',
      avatar: '/images/placeholder-avatar.jpg'
    }
  },
  {
    id: '3',
    title: 'تمكين المرأة في قطاع التقنية: نجاحات ملهمة وتحديات مستمرة',
    summary: 'قصص نجاح لنساء رائدات في مجال التقنية بالمملكة العربية السعودية وإنجازاتهن المتميزة.',
    excerpt: 'تسليط الضوء على إنجازات المرأة السعودية في القطاع التقني',
    featured_image: '/images/women-empowerment.jpg',
    category_id: 3,
    category_name: 'مجتمع',
    author_name: 'نورا العتيبي',
    views_count: 1680,
    created_at: '2024-12-15T14:15:00Z',
    published_at: '2024-12-15T14:15:00Z',
    reading_time: 12,
    is_breaking: false,
    is_featured: true,
    slug: 'women-empowerment-tech-sector',
    category: {
      name: 'مجتمع',
      slug: 'society',
      color: '#8b5cf6'
    },
    author: {
      name: 'نورا العتيبي',
      avatar: '/images/placeholder-avatar.jpg'
    }
  }
];

export default function TestFeaturedCardPage() {
  return (
    <DarkModeProvider>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="text-3xl font-bold text-center mb-8 text-gray-900 dark:text-white">
            اختبار تصميم البطاقة المميزة الجديدة
          </h1>
          
          <div className="space-y-12">
            {/* البطاقة المميزة الجديدة */}
            <section>
              <h2 className="text-2xl font-semibold mb-6 text-gray-800 dark:text-gray-200">
                1️⃣ البطاقة المميزة الجديدة (FeaturedMobileCard)
              </h2>
              <div className="space-y-6">
                {sampleArticles.map((article) => (
                  <FeaturedMobileCard
                    key={article.id}
                    article={article}
                    className="max-w-md mx-auto"
                  />
                ))}
              </div>
            </section>

            {/* البطاقة المحدثة (MobileCard) */}
            <section>
              <h2 className="text-2xl font-semibold mb-6 text-gray-800 dark:text-gray-200">
                2️⃣ البطاقة المحدثة (MobileCard - featured variant)
              </h2>
              <div className="space-y-6">
                {sampleArticles.map((article) => (
                  <MobileCard
                    key={article.id}
                    article={article}
                    variant="featured"
                    showImage={true}
                    showExcerpt={true}
                    className="max-w-md mx-auto"
                  />
                ))}
              </div>
            </section>

            {/* البطاقة المحسنة المحدثة */}
            <section>
              <h2 className="text-2xl font-semibold mb-6 text-gray-800 dark:text-gray-200">
                3️⃣ البطاقة المحسنة المحدثة (EnhancedMobileArticleCard)
              </h2>
              <div className="space-y-6">
                {sampleArticles.map((article) => (
                  <EnhancedMobileArticleCard
                    key={article.id}
                    article={article}
                    viewMode="featured"
                    showActions={false}
                  />
                ))}
              </div>
            </section>
          </div>

          {/* شرح المواصفات */}
          <section className="mt-16 p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-lg">
            <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
              📋 المواصفات المطبقة:
            </h3>
            <ul className="space-y-2 text-gray-700 dark:text-gray-300">
              <li>✅ الصورة تغطي كامل عرض البطاقة بارتفاع h-52</li>
              <li>✅ تدرج لوني أسود من الأسفل (bg-gradient-to-t from-black/70 to-transparent)</li>
              <li>✅ العنوان والنص فوق التدرج الداكن (داخل الصورة)</li>
              <li>✅ العنوان: text-white, text-base/lg, line-clamp-2, font-bold</li>
              <li>✅ التصنيف: bg-white/20, text-white, text-xs, شفاف</li>
              <li>✅ البيانات السفلية: text-xs, text-white/80</li>
              <li>✅ شارة "مميز": زاوية علوية يمنى، bg-yellow-400، دائرية</li>
              <li>✅ دعم الوضع الليلي مع الحفاظ على التباين</li>
              <li>✅ تأثيرات تفاعلية: hover:scale-[1.02], transition-all</li>
              <li>✅ شارة "عاجل" للأخبار العاجلة مع أنيميشن</li>
            </ul>
          </section>
        </div>
      </div>
    </DarkModeProvider>
  );
}