import Header from '@/components/Header';
import LightHeader from '@/components/layout/LightHeader';

export default function LogoComparisonPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* مقارنة الهيدر */}
      <div className="mb-8">
        <div className="mb-4 p-4 bg-white dark:bg-gray-800 border-b">
          <h3 className="text-lg font-semibold mb-2">الهيدر الأصلي (النسخة الكاملة)</h3>
          <Header />
        </div>
        
        <div className="p-4 bg-white dark:bg-gray-800">
          <h3 className="text-lg font-semibold mb-2">الهيدر الجديد (النسخة الخفيفة)</h3>
          <LightHeader />
        </div>
      </div>

      {/* المحتوى الرئيسي */}
      <main className="container mx-auto px-4 py-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
            مقارنة اللوجو بين النسختين
          </h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                النسخة الكاملة
              </h2>
              <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                <li>• يستخدم اللوجو الأصلي من إعدادات الموقع</li>
                <li>• يدعم اللوجو المخصص والوضع الليلي</li>
                <li>• أبعاد مناسبة للشاشات المختلفة</li>
                <li>• تأثيرات hover متقدمة</li>
              </ul>
            </div>
            
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                النسخة الخفيفة
              </h2>
              <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                <li>• يستخدم نفس اللوجو الأصلي</li>
                <li>• شارة "خفيف" للتمييز</li>
                <li>• أبعاد مُحسَّنة للمساحة الصغيرة</li>
                <li>• نظام ألوان متغيرة</li>
              </ul>
            </div>
          </div>

          <div className="mt-8 p-6 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <h3 className="text-lg font-semibold text-green-800 dark:text-green-200 mb-2">
              ✅ تم التحديث بنجاح
            </h3>
            <p className="text-green-700 dark:text-green-300">
              الآن يستخدم الهيدر الخفيف نفس اللوجو الأصلي المستخدم في النسخة الكاملة، 
              مع الاحتفاظ بجميع الميزات مثل دعم الوضع الليلي ونظام الألوان المتغيرة.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
