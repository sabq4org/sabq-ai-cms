import { UploadDebugComponent } from '@/components/debug/UploadDebugComponent';

export default function DebugUploadPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="container mx-auto px-4">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            🔧 تشخيص APIs رفع الصور
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            أداة تشخيص مشاكل Content-Type وطلبات رفع الصور
          </p>
        </div>
        
        <UploadDebugComponent />
        
        <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
          <h3 className="font-semibold text-blue-800 dark:text-blue-400 mb-2">
            💡 نصائح للاستخدام:
          </h3>
          <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
            <li>• اختر صورة صغيرة للاختبار (أقل من 1MB)</li>
            <li>• افتح Developer Tools → Console لرؤية تفاصيل أكثر</li>
            <li>• إذا فشل جميع الاختبارات، تحقق من تشغيل الخادم المحلي</li>
            <li>• ابحث عن أخطاء Content-Type في النتائج</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
