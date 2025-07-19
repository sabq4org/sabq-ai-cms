'use client';

export default function HeaderSimple() {
  return (
    <header className="bg-white shadow-sm border-b" dir="rtl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <h1 className="text-xl font-bold text-gray-900">صحيفة سبق</h1>
          </div>
          <nav className="hidden md:flex space-x-8 space-x-reverse">
            <a href="/" className="text-gray-700 hover:text-gray-900 px-3 py-2">الرئيسية</a>
            <a href="/news" className="text-gray-700 hover:text-gray-900 px-3 py-2">الأخبار</a>
            <a href="/categories" className="text-gray-700 hover:text-gray-900 px-3 py-2">الأقسام</a>
            <a href="/opinion" className="text-gray-700 hover:text-gray-900 px-3 py-2">الرأي</a>
          </nav>
        </div>
      </div>
    </header>
  );
}
