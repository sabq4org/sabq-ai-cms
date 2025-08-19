import LightHeader from '@/components/layout/LightHeader';
import EnhancedMuqtarabBlock from '@/components/home/EnhancedMuqtarabBlock';

export default function LightTestPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* الهيدر الخفيف */}
      <LightHeader />
      
      {/* المحتوى الرئيسي */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            اختبار النسخة الخفيفة
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            هذه صفحة لاختبار الهيدر الخفيف ونظام الألوان المتغيرة
          </p>
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
