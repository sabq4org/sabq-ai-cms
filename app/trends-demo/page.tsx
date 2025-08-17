import TrendsWidget from '@/components/Analytics/TrendsWidget';

export default function TrendsDemo() {
  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* عنوان الصفحة */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            ويدجت اتجاهات الأخبار - عرض تجريبي
          </h1>
          <p className="text-gray-600">
            نظام تحليل شامل للاتجاهات الزمنية مع الرسوم البيانية التفاعلية ومقارنة الفترات والتنبيهات
          </p>
        </div>

        {/* الويدجت الرئيسي */}
        <TrendsWidget 
          className="mb-8"
          autoRefresh={true}
          refreshInterval={300000} // 5 دقائق
        />

        {/* مكونات إضافية للعرض */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* ويدجت مضغوط */}
          <div className="bg-white rounded-lg border p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              عرض مضغوط
            </h2>
            <TrendsWidget 
              className=""
              autoRefresh={false}
              dateRange={{
                startDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // آخر 3 أيام
                endDate: new Date()
              }}
            />
          </div>

          {/* معلومات النظام */}
          <div className="bg-white rounded-lg border p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              معلومات النظام
            </h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">حالة النظام:</span>
                <span className="text-green-600 font-medium">✅ نشط</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-600">آخر تحديث:</span>
                <span className="text-gray-900">{new Date().toLocaleString('ar-SA')}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-600">التحديث التلقائي:</span>
                <span className="text-blue-600 font-medium">كل 5 دقائق</span>
              </div>
              
              <div className="border-t pt-4">
                <h3 className="text-sm font-medium text-gray-900 mb-2">المكونات المفعلة:</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>✅ تحليل الاتجاهات الزمنية</li>
                  <li>✅ الرسوم البيانية التفاعلية الصغيرة</li>
                  <li>✅ مقارنة الفترات الزمنية</li>
                  <li>✅ التنبيهات والإشعارات</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* إرشادات الاستخدام */}
        <div className="mt-8 bg-blue-50 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            كيفية استخدام ويدجت الاتجاهات
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
            <div>
              <h3 className="font-medium text-blue-900 mb-2">النظرة العامة</h3>
              <p className="text-blue-800">
                عرض سريع للكلمات المفتاحية الرائجة مع الرسوم البيانية الصغيرة والإحصائيات
              </p>
            </div>
            
            <div>
              <h3 className="font-medium text-blue-900 mb-2">مقارنة الفترات</h3>
              <p className="text-blue-800">
                اختر فترات زمنية مختلفة لمقارنة الأداء والاتجاهات بصرياً
              </p>
            </div>
            
            <div>
              <h3 className="font-medium text-blue-900 mb-2">التنبيهات</h3>
              <p className="text-blue-800">
                إعداد قواعد التنبيه للتغييرات المهمة والحصول على إشعارات فورية
              </p>
            </div>
            
            <div>
              <h3 className="font-medium text-blue-900 mb-2">التحديث التلقائي</h3>
              <p className="text-blue-800">
                البيانات تُحدث تلقائياً كل 5 دقائق للحصول على أحدث الاتجاهات
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
