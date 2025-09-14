import LightHeader from '@/components/layout/LightHeader';
import EnhancedMuqtarabBlock from '@/components/home/EnhancedMuqtarabBlock';

export default function LightTestPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900" style={{ paddingTop: 'calc(var(--light-header-height, 56px) + env(safe-area-inset-top, 0px))' }}>
      {/* الهيدر الخفيف */}
      <LightHeader />
      
      {/* المحتوى الرئيسي */}
      <main className="container mx-auto px-4 sm:px-6 py-8">
        {/* مؤشر النسخة الخفيفة */}
        <div className="mb-8 p-6 rounded-2xl border-2" style={{
          borderColor: 'var(--theme-primary, #3B82F6)',
          backgroundColor: 'var(--theme-primary-light, rgba(59, 130, 246, 0.1))',
        }}>
          <div className="flex items-center gap-3 mb-4">
            <div 
              className="w-3 h-3 rounded-full animate-pulse"
              style={{ backgroundColor: 'var(--theme-primary, #3B82F6)' }}
            />
            <h1 className="text-2xl font-bold" style={{ color: 'var(--theme-primary, #3B82F6)' }}>
              النسخة الخفيفة - نشطة الآن! ✨
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            تم تطبيق الهيدر الجديد مع نظام الألوان المتغيرة، القائمة الجانبية، والوضع الليلي المطور.
          </p>
          <div className="flex flex-wrap gap-2">
            <span className="px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
              ✓ الهيدر الخفيف
            </span>
            <span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
              ✓ نظام الألوان (6 ألوان)
            </span>
            <span className="px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
              ✓ القائمة الجانبية
            </span>
            <span className="px-3 py-1 rounded-full text-sm font-medium bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200">
              ✓ الوضع الليلي
            </span>
          </div>
        </div>

        {/* تعليمات الاستخدام */}
        <div className="mb-8 p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">🎨 كيفية تجربة النسخة الخفيفة:</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600 dark:text-gray-300">
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white mb-2">1. تغيير الألوان:</h3>
              <p>اضغط على أيقونة الألوان 🎨 في الهيدر لتغيير لون الموقع من بين 6 ألوان مختلفة</p>
            </div>
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white mb-2">2. القائمة الجانبية:</h3>
              <p>اضغط على زر القائمة ☰ لفتح القائمة الجانبية التفاعلية</p>
            </div>
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white mb-2">3. الوضع الليلي:</h3>
              <p>اضغط على أيقونة القمر/الشمس لتبديل الوضع الليلي والنهاري</p>
            </div>
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white mb-2">4. التصميم المتجاوب:</h3>
              <p>جرب تغيير حجم النافذة لرؤية التصميم المتجاوب</p>
            </div>
          </div>
        </div>

        {/* مكون مقترب للاختبار */}
        <div className="mb-8">
          <EnhancedMuqtarabBlock 
            showHeader={true}
            limit={4}
            showPagination={false}
            showFilters={true}
          />
        </div>

        {/* اختبار الألوان */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <h3 className="text-xl font-bold mb-4">بطاقة اختبار 1</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              هذه بطاقة لاختبار نظام الألوان المتغيرة والتصميم المتجاوب
            </p>
            <div className="flex items-center gap-2">
              <span className="category-pill">تصنيف تجريبي</span>
              <div 
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: 'var(--theme-primary)' }}
              />
            </div>
          </div>

          <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <h3 className="text-xl font-bold mb-4">بطاقة اختبار 2</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              اختبار hover effects وتأثيرات التفاعل
            </p>
            <div className="bg-theme-light p-3 rounded-lg">
              <span className="text-sm">خلفية بلون النمط</span>
            </div>
          </div>

          <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <h3 className="text-xl font-bold mb-4">بطاقة اختبار 3</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              اختبار الوضع الليلي والنهاري
            </p>
            <button 
              className="px-4 py-2 rounded-lg text-white font-medium"
              style={{ backgroundColor: 'var(--theme-primary)' }}
            >
              زر بلون النمط
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
