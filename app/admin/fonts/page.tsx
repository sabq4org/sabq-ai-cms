/**
 * 🎨 صفحة إدارة نظام الخطوط في صحيفة سبق
 * تتيح للمديرين فحص وإصلاح مشاكل الخطوط
 */

'use client';

import FontChecker from '@/components/FontChecker';

export default function FontManagementPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* رأس الصفحة */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
            <span className="text-white text-lg">🎨</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            إدارة نظام الخطوط
          </h1>
        </div>
        <p className="text-gray-600 dark:text-gray-400">
          فحص وإدارة خطوط صحيفة سبق لضمان الاتساق والجودة عبر جميع الصفحات
        </p>
      </div>

      {/* معلومات النظام */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 mb-8">
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
          معلومات نظام الخطوط
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">الخط الأساسي</h3>
            <div className="text-gray-600 dark:text-gray-400 space-y-1">
              <div><strong>الاسم:</strong> IBM Plex Sans Arabic</div>
              <div><strong>الأوزان:</strong> 300, 400, 500, 600, 700</div>
              <div><strong>المصدر:</strong> Google Fonts</div>
            </div>
          </div>
          
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">الخطوط الاحتياطية</h3>
            <div className="text-gray-600 dark:text-gray-400 space-y-1">
              <div>• Tajawal</div>
              <div>• Noto Sans Arabic</div>
              <div>• system-ui</div>
              <div>• sans-serif</div>
            </div>
          </div>
        </div>
      </div>

      {/* فحص الخطوط */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
            فحص حالة الخطوط
          </h2>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors duration-200"
          >
            إعادة الفحص
          </button>
        </div>
        
        <FontChecker />
      </div>

      {/* إرشادات الإصلاح */}
      <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-6 shadow-sm border border-amber-200 dark:border-amber-800 mt-8">
        <h2 className="text-xl font-bold text-amber-900 dark:text-amber-100 mb-4">
          🛠️ إرشادات الإصلاح
        </h2>
        
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold text-amber-900 dark:text-amber-100 mb-2">1. الإصلاح التلقائي</h3>
            <p className="text-amber-700 dark:text-amber-300 mb-2">
              لإصلاح جميع مشاكل الخطوط تلقائياً، قم بتشغيل الأمر التالي في الطرفية:
            </p>
            <code className="block bg-amber-100 dark:bg-amber-900/40 p-3 rounded text-amber-800 dark:text-amber-200">
              chmod +x fix-font-system.sh && ./fix-font-system.sh
            </code>
          </div>
          
          <div>
            <h3 className="font-semibold text-amber-900 dark:text-amber-100 mb-2">2. إعادة تشغيل الخادم</h3>
            <p className="text-amber-700 dark:text-amber-300 mb-2">
              بعد تشغيل الإصلاح، أعد تشغيل خادم التطوير:
            </p>
            <code className="block bg-amber-100 dark:bg-amber-900/40 p-3 rounded text-amber-800 dark:text-amber-200">
              npm run dev
            </code>
          </div>
          
          <div>
            <h3 className="font-semibold text-amber-900 dark:text-amber-100 mb-2">3. فحص النتائج</h3>
            <p className="text-amber-700 dark:text-amber-300">
              اضغط على "إعادة الفحص" أعلاه للتحقق من نجاح الإصلاح.
            </p>
          </div>
        </div>
      </div>

      {/* ملفات النظام */}
      <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-600 mt-8">
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
          📁 ملفات النظام
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">ملفات التكوين</h3>
            <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
              <div>• <code>/app/layout.tsx</code> - تكوين الخط الأساسي</div>
              <div>• <code>/tailwind.config.js</code> - إعدادات Tailwind</div>
              <div>• <code>/styles/unified-font-system.css</code> - النظام الموحد</div>
            </div>
          </div>
          
          <div className="space-y-2">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">أدوات الإصلاح</h3>
            <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
              <div>• <code>/fix-font-system.sh</code> - سكربت الإصلاح</div>
              <div>• <code>/components/FontChecker.tsx</code> - مكون الفحص</div>
              <div>• <code>FONT_UPDATE_REPORT.md</code> - تقرير التحديثات</div>
            </div>
          </div>
        </div>
      </div>

      {/* معاينة الخطوط */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 mt-8">
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
          👁️ معاينة الخطوط
        </h2>
        
        <div className="space-y-6">
          <div>
            <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">العناوين الرئيسية</h3>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100">
              صحيفة سبق الإلكترونية
            </h1>
          </div>
          
          <div>
            <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">العناوين الثانوية</h3>
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200">
              أخبار المملكة العربية السعودية والعالم
            </h2>
          </div>
          
          <div>
            <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">محتوى المقالات</h3>
            <div className="prose prose-lg max-w-none dark:prose-invert">
              <p>
                هذا نص تجريبي لمعاينة خط محتوى المقالات في صحيفة سبق. يجب أن يظهر هذا النص 
                باستخدام خط IBM Plex Sans Arabic مع تباعد مناسب وقراءة مريحة للعين. 
                النص يدعم جميع الحروف العربية والأرقام والعلامات ١٢٣٤٥٦٧٨٩٠
              </p>
            </div>
          </div>
          
          <div>
            <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">النصوص الصغيرة</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              نص صغير للتواريخ والبيانات التفصيلية - ١٥ يناير ٢٠٢٥ - ١٠:٣٠ صباحاً
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
