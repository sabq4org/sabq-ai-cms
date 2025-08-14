'use client';

import { useDarkModeContext } from '@/contexts/DarkModeContext';
import ArticleAISummary from '@/components/article/ArticleAISummary';
import ArticleFeaturedImage from '@/components/article/ArticleFeaturedImage';

export default function TestArticleLayoutPage() {
  const { darkMode } = useDarkModeContext();
  
  // بيانات تجريبية
  const testArticle = {
    id: 'test-123',
    title: 'اختبار عرض صفحة تفاصيل الخبر - محاذاة الصورة والموجز الذكي',
    content: 'هذا محتوى تجريبي لاختبار عرض الصورة والموجز الذكي بشكل صحيح. نريد التأكد من أن الصورة تبدأ من بداية محتوى الخبر وتنتهي عند نهايته، وأن الموجز الذكي يكون محاذي للمحتوى أيضاً.',
    featured_image: 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=1200',
    ai_summary: 'هذا موجز ذكي تجريبي يعرض ملخصاً للمقال. يجب أن يظهر هذا النص كاملاً في النسختين الكاملة والخفيفة بدون قص. زر الاستماع يجب أن يكون صغيراً وبدون إطار في أعلى اليسار. المحتوى يجب أن يكون محاذي لعرض المحتوى الرئيسي للمقال.',
    category: {
      name: 'تقنية',
      slug: 'tech',
      color: '#1a73e8',
      icon: '💻'
    }
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'} py-8`}>
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-900 dark:text-white">
          اختبار تخطيط صفحة تفاصيل الخبر
        </h1>
        
        {/* محاكاة تخطيط صفحة المقال */}
        <div className="max-w-4xl mx-auto px-3 sm:px-6 lg:px-8 py-2">
          
          {/* النسخة الكاملة (Desktop) */}
          <div className="hidden sm:block space-y-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">
              النسخة الكاملة (Desktop)
            </h2>
            
            {/* الصورة المميزة - عرض كامل */}
            <div className="article-featured-image-wrapper">
              <ArticleFeaturedImage
                imageUrl={testArticle.featured_image}
                title={testArticle.title}
                category={testArticle.category}
                className="w-full rounded-xl shadow-lg"
              />
            </div>
            
            {/* الموجز الذكي - عرض كامل */}
            <div className="article-ai-summary-wrapper">
              <ArticleAISummary
                articleId={testArticle.id}
                title={testArticle.title}
                content={testArticle.content}
                existingSummary={testArticle.ai_summary}
                className="shadow-lg w-full"
              />
            </div>
            
            {/* محاكاة محتوى المقال */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                هذا هو محتوى المقال. يجب أن تكون الصورة والموجز الذكي بنفس عرض هذا المحتوى تماماً.
              </p>
            </div>
          </div>
          
          {/* النسخة الخفيفة (Mobile) */}
          <div className="sm:hidden space-y-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">
              النسخة الخفيفة (Mobile)
            </h2>
            
            {/* الموجز الذكي - النص كاملاً */}
            <ArticleAISummary
              articleId={testArticle.id}
              title={testArticle.title}
              content={testArticle.content}
              existingSummary={testArticle.ai_summary}
              className="shadow-lg article-ai-summary-mobile"
              showFloatingAudio={true}
            />
            
            {/* محاكاة محتوى المقال */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-lg">
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-sm">
                هذا هو محتوى المقال في النسخة الخفيفة. الموجز الذكي يجب أن يعرض النص كاملاً بدون قص.
              </p>
            </div>
          </div>
        </div>
        
        {/* ملاحظات للتحقق */}
        <div className="mt-12 max-w-4xl mx-auto bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-4 text-blue-900 dark:text-blue-300">
            نقاط التحقق ✅
          </h3>
          <ul className="space-y-2 text-blue-800 dark:text-blue-200 text-sm">
            <li>• النسخة الكاملة: الصورة تبدأ وتنتهي مع عرض المحتوى</li>
            <li>• النسخة الكاملة: الموجز الذكي محاذي للمحتوى</li>
            <li>• النسخة الكاملة: النص كامل في الموجز الذكي</li>
            <li>• النسخة الخفيفة: النص كامل في الموجز الذكي</li>
            <li>• النسخة الخفيفة: زر التشغيل صغير وبدون إطار في أعلى اليسار</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
