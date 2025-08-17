'use client';

import { useDarkModeContext } from '@/contexts/DarkModeContext';
import ContentImage from '@/components/article/ContentImage';

export default function TestArticleImagesPage() {
  const { darkMode } = useDarkModeContext();

  // محتوى تجريبي مع صور
  const articleContent = `
    <h2>اختبار عرض الصور في محتوى المقال</h2>
    <p>هذا مقال تجريبي لاختبار عرض الصور بأحجام مختلفة في صفحة الخبر. نريد التأكد من أن الصور تظهر بالحجم الكامل وليست مقيدة بعرض ضيق.</p>
    
    <h3>صورة بالحجم العادي</h3>
    <img src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920" alt="صورة جبلية رائعة" />
    
    <h3>صورة عريضة</h3>
    <img src="https://images.unsplash.com/photo-1519904981063-b0cf448d479e?w=2400" alt="منظر بحري واسع" class="wide-image" />
    
    <h3>صورة ممتدة بالكامل</h3>
    <img src="https://images.unsplash.com/photo-1484591974057-265bb767ef71?w=2560" alt="مدينة ليلية" class="full-bleed" />
    
    <p>يجب أن تكون جميع الصور أعلاه بعرض كامل يملأ عمود القراءة، وليست محدودة بعرض صغير.</p>
  `;

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'} py-8`}>
      {/* محاكاة تخطيط صفحة المقال بالعرض الجديد */}
      <div className="max-w-screen-lg lg:max-w-[110ch] mx-auto px-3 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-900 dark:text-white">
          اختبار صور محتوى المقال - العرض الموسع
        </h1>

        {/* بطاقة معلومات */}
        <div className="mb-8 bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-4 text-blue-900 dark:text-blue-300">
            التحسينات المطبقة ✅
          </h2>
          <ul className="space-y-2 text-blue-800 dark:text-blue-200 text-sm">
            <li>• توسيع عمود القراءة من <code>max-w-4xl</code> إلى <code>max-w-screen-lg</code> و <code>max-w-[110ch]</code></li>
            <li>• إضافة <code>prose-img:w-full prose-img:h-auto prose-img:max-w-none</code> للصور</li>
            <li>• إزالة أي ارتفاعات ثابتة على الصور</li>
            <li>• دعم صور full-bleed التي تمتد عبر الصفحة بالكامل</li>
          </ul>
        </div>

        {/* محتوى المقال مع prose */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 sm:p-8">
          <div 
            className="prose max-w-none dark:prose-invert arabic-article-content
                       prose-headings:text-gray-900 dark:prose-headings:text-white
                       prose-p:text-gray-700 dark:prose-p:text-gray-300
                       prose-p:leading-relaxed
                       prose-img:w-full prose-img:h-auto prose-img:max-w-none
                       prose-img:rounded-xl prose-img:shadow-xl
                       prose-figure:m-0 prose-figure:my-8
                       prose-lg"
            dangerouslySetInnerHTML={{ __html: articleContent }}
          />
        </div>

        {/* أمثلة باستخدام ContentImage */}
        <div className="mt-12 space-y-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            أمثلة باستخدام مكون ContentImage
          </h2>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200">
              صورة افتراضية
            </h3>
            <ContentImage
              src="https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1920"
              alt="طبيعة خلابة"
              caption="منظر طبيعي رائع - صورة بالحجم الافتراضي"
            />
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200">
              صورة عريضة
            </h3>
            <ContentImage
              src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=2400"
              alt="جبال مغطاة بالثلوج"
              caption="جبال الألب - صورة عريضة"
              variant="wide"
              aspectRatio="16/9"
            />
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 overflow-hidden">
            <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200">
              صورة ممتدة بالكامل (Full Bleed)
            </h3>
            <ContentImage
              src="https://images.unsplash.com/photo-1475924156734-496f6cac6ec1?w=2560"
              alt="غروب الشمس على الشاطئ"
              caption="غروب الشمس - صورة ممتدة عبر كامل عرض الصفحة"
              variant="full-bleed"
              priority
            />
          </div>
        </div>

        {/* مقارنة قبل وبعد */}
        <div className="mt-12 grid md:grid-cols-2 gap-6">
          <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-6">
            <h3 className="text-lg font-semibold mb-4 text-red-900 dark:text-red-300">
              ❌ قبل (مقيد)
            </h3>
            <div className="max-w-prose mx-auto">
              <img 
                src="https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=800" 
                alt="صورة مقيدة"
                className="rounded-lg"
                style={{ maxWidth: '500px' }}
              />
              <p className="text-sm text-red-700 dark:text-red-300 mt-2">
                الصورة محدودة بعرض 500px بسبب قيود prose
              </p>
            </div>
          </div>

          <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-6">
            <h3 className="text-lg font-semibold mb-4 text-green-900 dark:text-green-300">
              ✅ بعد (حر)
            </h3>
            <img 
              src="https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=1920" 
              alt="صورة بالعرض الكامل"
              className="w-full h-auto rounded-lg shadow-xl"
            />
            <p className="text-sm text-green-700 dark:text-green-300 mt-2">
              الصورة تأخذ العرض الكامل للعمود
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
