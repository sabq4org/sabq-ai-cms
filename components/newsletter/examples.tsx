import NewsletterBox from "@/components/newsletter/NewsletterBox";
import NewsletterSignup from "@/components/newsletter/NewsletterSignup";

/**
 * أمثلة عملية لاستخدام مكونات النشرة البريدية
 * في صفحات مختلفة من الموقع
 */

// مثال 1: في الشريط الجانبي للمقالات
export function ArticleSidebarExample() {
  return (
    <aside className="w-full lg:w-80 space-y-6">
      {/* محتوى الشريط الجانبي الآخر */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
        <h3 className="text-lg font-bold mb-4">مقالات ذات صلة</h3>
        {/* مقالات ذات صلة */}
      </div>

      {/* صندوق النشرة البريدية المصغر */}
      <NewsletterBox
        size="sm"
        showFeatures={false}
        title="📧 انضم لنشرتنا الذكية"
        description="أحدث الأخبار مع تحليل الذكاء الاصطناعي"
        className="sticky top-4"
      />

      {/* المزيد من محتوى الشريط الجانبي */}
    </aside>
  );
}

// مثال 2: في نهاية المقال
export function ArticleFooterExample() {
  return (
    <div className="mt-12 border-t pt-8">
      <div className="text-center mb-6">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
          🤖 أعجبك هذا المقال؟
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          احصل على المزيد من التحليلات الذكية والأخبار المخصصة
        </p>
      </div>

      <NewsletterSignup
        compact={true}
        showLatestArticles={false}
        className="max-w-md mx-auto"
      />
    </div>
  );
}

// مثال 3: في صفحة التصنيفات/الفئات
export function CategoryPageExample() {
  return (
    <div className="container mx-auto px-4 py-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold mb-4">📈 أخبار الاقتصاد</h1>
        <p className="text-gray-600 dark:text-gray-400">
          آخر الأخبار والتحليلات الاقتصادية
        </p>
      </header>

      {/* النشرة المتخصصة للفئة */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-lg p-6 mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
              📊 نشرة الاقتصاد الذكية
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              تحليلات اقتصادية مخصصة بالذكاء الاصطناعي
            </p>
          </div>
          <NewsletterBox
            size="md"
            showFeatures={true}
            title="اشترك الآن"
            description=""
            className="flex-shrink-0"
          />
        </div>
      </div>

      {/* محتوى الفئة */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* مقالات الفئة */}
      </div>
    </div>
  );
}

// مثال 4: في الصفحة الرئيسية
export function HomePageExample() {
  return (
    <div className="container mx-auto px-4">
      {/* محتوى الصفحة الرئيسية */}

      {/* قسم النشرة البريدية المميز */}
      <section className="my-16">
        <div className="bg-gradient-to-br from-blue-600 via-purple-600 to-blue-800 rounded-2xl p-8 text-white">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-4">
              🚀 اكتشف قوة الأخبار الذكية
            </h2>
            <p className="text-blue-100 text-lg max-w-2xl mx-auto">
              انضم لأكثر من 50,000 قارئ يحصلون على تحليلات مدعومة بالذكاء
              الاصطناعي
            </p>
          </div>

          <NewsletterSignup
            showLatestArticles={true}
            compact={false}
            className="max-w-4xl mx-auto"
          />
        </div>
      </section>

      {/* باقي محتوى الصفحة */}
    </div>
  );
}

// مثال 5: نافذة منبثقة للنشرة (Modal)
export function NewsletterModalExample() {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-900 rounded-2xl max-w-md w-full p-6 relative">
        {/* زر الإغلاق */}
        <button className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
          ✕
        </button>

        <div className="text-center mb-6">
          <div className="text-4xl mb-4">🎯</div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            لا تفوت أهم الأخبار!
          </h3>
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            احصل على ملخص ذكي لأهم الأحداث يومياً
          </p>
        </div>

        <NewsletterBox size="lg" showFeatures={true} title="" description="" />

        <p className="text-xs text-gray-500 text-center mt-4">
          يمكنك إلغاء الاشتراك في أي وقت
        </p>
      </div>
    </div>
  );
}

// مثال 6: بانر النشرة في الهيدر
export function HeaderNewsletterBanner() {
  return (
    <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white py-2 px-4">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-3 rtl:space-x-reverse">
          <span className="text-sm font-medium">
            🔥 جديد: نشرة الذكاء الاصطناعي
          </span>
          <span className="text-xs opacity-90">تحليلات ذكية + توقيت مثالي</span>
        </div>

        <NewsletterBox
          size="sm"
          showFeatures={false}
          title="اشترك"
          description=""
          className="text-white"
        />
      </div>
    </div>
  );
}

// مثال 7: في صفحة المؤلف/الكاتب
export function AuthorPageExample() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* معلومات المؤلف */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 mb-8">
        {/* تفاصيل المؤلف */}
      </div>

      {/* نشرة مخصصة للمؤلف */}
      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6 mb-8">
        <h3 className="text-lg font-bold mb-4 text-gray-900 dark:text-white">
          📝 تابع كتابات هذا المؤلف
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          احصل على إشعار فور نشر مقال جديد
        </p>

        <NewsletterBox
          size="md"
          showFeatures={false}
          title="تابع المؤلف"
          description="إشعارات فورية للمقالات الجديدة"
        />
      </div>

      {/* مقالات المؤلف */}
    </div>
  );
}

const NewsletterExamples = {
  ArticleSidebarExample,
  ArticleFooterExample,
  CategoryPageExample,
  HomePageExample,
  NewsletterModalExample,
  HeaderNewsletterBanner,
  AuthorPageExample,
};

export default NewsletterExamples;
