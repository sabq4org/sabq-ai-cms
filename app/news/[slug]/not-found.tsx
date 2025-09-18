import Link from "next/link";

export default function NewsNotFound() {
  return (
    <div dir="rtl" className="min-h-screen bg-[#f8f8f7] flex items-center justify-center px-4">
      <div className="max-w-2xl w-full text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl shadow-2xl bg-gradient-to-br from-blue-500 to-purple-600 mb-6">
          <span className="text-white text-3xl">🗞️</span>
        </div>

        <h1 className="text-3xl md:text-4xl font-black text-gray-900 mb-3">
          هِـمـسـة صـحـفـيـة: هذا الخبر يلعب الغُـمَّيـض!
        </h1>
        <p className="text-gray-600 md:text-lg mb-8">
          يبدو أن الرابط الذي وصلتَ به لا يقود إلى خبرٍ منتشر حالياً. لا تقلق، يحدث هذا حتى في أفضل غرف الأخبار.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center mb-10">
          <Link href="/" className="px-5 py-3 rounded-xl bg-blue-600 text-white hover:bg-blue-700">
            العودة للرئيسية
          </Link>
          <Link href="/news" className="px-5 py-3 rounded-xl bg-white text-gray-800 border hover:bg-gray-50">
            تصفّح آخر الأخبار
          </Link>
        </div>

        <div className="max-w-md mx-auto mb-8">
          <form action="/search" method="get" className="relative">
            <input
              type="search"
              name="q"
              placeholder="ابحث عن خبر..."
              className="w-full pr-4 pl-4 py-3 rounded-xl bg-white border border-gray-200 focus:ring-4 focus:ring-blue-500/20 focus:outline-none"
            />
            <button type="submit" className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500">
              🔎
            </button>
          </form>
        </div>

        <div className="text-sm text-gray-500">
          اقتراحات سريعة:
          <div className="mt-3 flex flex-wrap gap-2 justify-center">
            <Link href="/trending" className="px-3 py-1.5 rounded-full bg-white border hover:bg-gray-50">
              الأكثر قراءة اليوم
            </Link>
            <Link href="/categories" className="px-3 py-1.5 rounded-full bg-white border hover:bg-gray-50">
              تفقّد التصنيفات
            </Link>
            <Link href="/opinion-articles" className="px-3 py-1.5 rounded-full bg-white border hover:bg-gray-50">
              أحدث المقالات
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}


