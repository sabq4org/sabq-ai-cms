export default function TestSimplePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          🎉 النظام يعمل!
        </h1>
        <p className="text-gray-600 mb-6">
          تم حل مشكلة الصفحة البيضاء بنجاح
        </p>
        <div className="space-y-2 text-sm text-gray-500">
          <p>✅ إصلاح DevTools مطبق</p>
          <p>✅ معالجة الأخطاء نشطة</p>
          <p>✅ التطبيق يعمل بشكل طبيعي</p>
        </div>
        <div className="mt-6">
          <a 
            href="/" 
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            العودة للرئيسية
          </a>
        </div>
      </div>
    </div>
  )
}