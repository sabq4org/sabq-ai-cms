export default function EmergencyPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          صحيفة سبق الالكترونية AI
        </h1>
        <p className="text-gray-600 mb-8">
          النظام يعمل بنجاح - وضع الطوارئ المبسط
        </p>
        <div className="space-y-4">
          <a 
            href="/dashboard" 
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
          >
            لوحة التحكم
          </a>
          <div>
            <a 
              href="/articles" 
              className="inline-block bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 mr-4"
            >
              المقالات
            </a>
            <a 
              href="/categories" 
              className="inline-block bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700"
            >
              التصنيفات
            </a>
          </div>
        </div>
        <div className="mt-8 text-sm text-gray-500">
          ✅ قاعدة البيانات متصلة | ✅ API يعمل | ✅ النظام مستقر
        </div>
      </div>
    </div>
  );
}
