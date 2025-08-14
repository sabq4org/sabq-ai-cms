'use client';

import ArticleFeaturedImage from '@/components/article/ArticleFeaturedImage';
import { useDarkModeContext } from '@/contexts/DarkModeContext';

export default function TestArticleImageSizePage() {
  const { darkMode } = useDarkModeContext();

  const testArticle = {
    featured_image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=2400&q=80',
    title: 'اختبار حجم الصورة المميزة في صفحة تفاصيل الخبر',
    category: {
      name: 'تقنية',
      color: '#1a73e8',
      icon: '💻'
    }
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'} py-8`}>
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-900 dark:text-white">
          اختبار حجم الصورة المميزة - النسخة الكاملة
        </h1>

        {/* معلومات التحسينات */}
        <div className="mb-8 bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-4 text-blue-900 dark:text-blue-300">
            التحسينات المطبقة ✅
          </h2>
          <ul className="space-y-2 text-blue-800 dark:text-blue-200 text-sm">
            <li>• نقل الصورة خارج الحاوية البيضاء المحدودة</li>
            <li>• استخدام <code>max-w-screen-xl</code> للصورة (عرض أكبر)</li>
            <li>• إزالة الارتفاعات الثابتة واستخدام <code>h-auto</code></li>
            <li>• إضافة <code>max-h-[90vh]</code> لتجنب الصور الطويلة جداً</li>
            <li>• إضافة <code>shadow-2xl</code> لتحسين المظهر</li>
          </ul>
        </div>

        {/* محاكاة تخطيط الصفحة */}
        <div className="space-y-8">
          {/* الصورة بالحجم الكامل */}
          <div className="w-full">
            <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200 text-center">
              الصورة بالحجم الجديد (كبيرة)
            </h3>
            <div className="hidden sm:block mb-8 px-4 sm:px-8 lg:px-12">
              <div className="max-w-screen-xl mx-auto article-featured-image-wrapper">
                <ArticleFeaturedImage
                  imageUrl={testArticle.featured_image}
                  title={testArticle.title}
                  category={testArticle.category}
                  className="w-full rounded-xl shadow-2xl"
                />
              </div>
            </div>
          </div>

          {/* محتوى المقال */}
          <div className="max-w-screen-lg lg:max-w-[110ch] mx-auto px-3 sm:px-6 lg:px-8">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6">
              <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
                محتوى المقال
              </h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                هذا هو محتوى المقال. الصورة الآن أكبر بكثير وتستفيد من العرض الكامل للشاشة.
                لم تعد محدودة داخل الحاوية البيضاء الضيقة.
              </p>
            </div>
          </div>

          {/* مقارنة الأحجام */}
          <div className="max-w-screen-xl mx-auto px-4 mt-12">
            <h3 className="text-xl font-semibold mb-6 text-gray-800 dark:text-gray-200 text-center">
              مقارنة الأحجام
            </h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-6">
                <h4 className="font-semibold mb-2 text-red-900 dark:text-red-300">
                  ❌ قبل (مقيدة)
                </h4>
                <ul className="text-sm text-red-700 dark:text-red-400 space-y-1">
                  <li>• الصورة داخل حاوية ضيقة</li>
                  <li>• ارتفاع ثابت (400-700px)</li>
                  <li>• عرض محدود بـ max-w-screen-lg</li>
                  <li>• padding إضافي من الحاوية البيضاء</li>
                </ul>
              </div>
              
              <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-6">
                <h4 className="font-semibold mb-2 text-green-900 dark:text-green-300">
                  ✅ بعد (حرة)
                </h4>
                <ul className="text-sm text-green-700 dark:text-green-400 space-y-1">
                  <li>• الصورة خارج الحاوية المحدودة</li>
                  <li>• ارتفاع تلقائي (h-auto)</li>
                  <li>• عرض أقصى max-w-screen-xl</li>
                  <li>• لا توجد قيود من padding</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
