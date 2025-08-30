import Link from "next/link";

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="flex-grow container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto bg-white shadow-lg rounded-lg overflow-hidden">
          <div className="p-6 md:p-8 text-center">
            <div className="mb-6">
              <div className="text-6xl text-gray-400 mb-4">404</div>
            </div>

            <h1 className="text-3xl font-bold mb-4 text-gray-800">
              الصفحة غير موجودة
            </h1>
            
            <p className="text-gray-600 mb-8">
              عذراً، الصفحة التي تبحث عنها غير موجودة أو تم نقلها.
            </p>

            <div className="flex flex-col space-y-3">
              <Link
                href="/"
                className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg text-center"
              >
                العودة للصفحة الرئيسية
              </Link>

              <Link
                href="/news"
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-4 rounded-lg text-center"
              >
                تصفح الأخبار
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
