/**
 * صفحة اختبار سحابة الكلمات التفاعلية
 * /app/test-wordcloud/page.tsx
 */

import WordCloud from '@/components/Analytics/WordCloud';

export default function TestWordCloudPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      {/* رأس الصفحة */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🌟 سحابة الكلمات التفاعلية
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            اكتشف الاتجاهات السائدة والكلمات الأكثر شيوعاً في المحتوى الإخباري
          </p>
          
          {/* شريط المعلومات */}
          <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div className="space-y-2">
                <div className="text-2xl font-bold text-blue-600">25</div>
                <div className="text-sm text-gray-600">كلمة مفتاحية</div>
              </div>
              <div className="space-y-2">
                <div className="text-2xl font-bold text-green-600">تفاعلي</div>
                <div className="text-sm text-gray-600">تصميم متجاوب</div>
              </div>
              <div className="space-y-2">
                <div className="text-2xl font-bold text-purple-600">مباشر</div>
                <div className="text-sm text-gray-600">تحديث آني</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* سحابة الكلمات الرئيسية */}
      <div className="max-w-7xl mx-auto">
        <WordCloud 
          autoRefresh={true}
          refreshInterval={30000} // كل 30 ثانية للاختبار
          maxKeywords={25}
        />
      </div>

      {/* قسم الميزات */}
      <div className="max-w-7xl mx-auto mt-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* ميزة التفاعل */}
          <div className="bg-white rounded-xl shadow-sm border p-6 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <span className="text-2xl">👆</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              تفاعل مباشر
            </h3>
            <p className="text-gray-600">
              انقر على أي كلمة للانتقال إلى المقالات المرتبطة بها ومشاهدة التفاصيل الكاملة
            </p>
          </div>

          {/* ميزة الاتجاهات */}
          <div className="bg-white rounded-xl shadow-sm border p-6 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
              <span className="text-2xl">📈</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              تتبع الاتجاهات
            </h3>
            <p className="text-gray-600">
              مراقبة الكلمات الصاعدة والهابطة مع مؤشرات بصرية واضحة للتغيرات
            </p>
          </div>

          {/* ميزة التحديث */}
          <div className="bg-white rounded-xl shadow-sm border p-6 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
              <span className="text-2xl">🔄</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              تحديث تلقائي
            </h3>
            <p className="text-gray-600">
              البيانات تتحدث تلقائياً لتعكس أحدث الاتجاهات والمواضيع الشائعة
            </p>
          </div>
        </div>
      </div>

      {/* معلومات تقنية */}
      <div className="max-w-7xl mx-auto mt-12">
        <div className="bg-gray-50 rounded-xl p-6 border">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            🔧 المعلومات التقنية
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium text-gray-900 mb-2">التقنيات المستخدمة</h3>
              <ul className="space-y-1 text-sm text-gray-600">
                <li>• Next.js 15 مع دعم RTL</li>
                <li>• TypeScript للأمان</li>
                <li>• Tailwind CSS للتصميم</li>
                <li>• API مخصص للبيانات</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium text-gray-900 mb-2">الميزات المتقدمة</h3>
              <ul className="space-y-1 text-sm text-gray-600">
                <li>• تصميم متجاوب بالكامل</li>
                <li>• تأثيرات بصرية متقدمة</li>
                <li>• تتبع النقرات والإحصائيات</li>
                <li>• دعم اللغة العربية</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* تذييل الصفحة */}
      <div className="max-w-7xl mx-auto mt-12 text-center">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <p className="text-gray-600">
            تم تطوير هذا المكون كجزء من نظام إدارة المحتوى الإخباري المتقدم
          </p>
          <div className="flex justify-center items-center gap-4 mt-4">
            <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
              React
            </span>
            <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
              TypeScript
            </span>
            <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
              Next.js
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
