export default function TestPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">صفحة اختبار</h1>
        <p className="text-lg text-gray-600">إذا كنت ترى هذه الصفحة، فالتطبيق يعمل بشكل صحيح!</p>
        <div className="mt-8">
          <a href="/" className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600">
            العودة للصفحة الرئيسية
          </a>
        </div>
      </div>
    </div>
  );
} 