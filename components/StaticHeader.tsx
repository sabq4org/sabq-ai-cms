import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function StaticHeader() {
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* اللوجو */}
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center">
              <Image
                src="/logo.png"
                alt="سبق"
                width={120}
                height={48}
                className="h-10 w-auto"
                priority
              />
            </Link>
          </div>

          {/* القائمة الرئيسية */}
          <nav className="hidden md:flex items-center space-x-8 rtl:space-x-reverse">
            <Link
              href="/"
              className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              🏠 الرئيسية
            </Link>
            <Link
              href="/news"
              className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              📰 الأخبار
            </Link>
            <Link
              href="/categories"
              className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              📁 الأقسام
            </Link>
            <Link
              href="/editor"
              className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              ✏️ كتابة مقال
            </Link>
            <Link
              href="/dashboard/users"
              className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              👥 المستخدمين
            </Link>
          </nav>

          {/* أدوات الهيدر */}
          <div className="flex items-center space-x-4 rtl:space-x-reverse">
            {/* زر تسجيل الدخول */}
            <Link
              href="/login"
              className="text-gray-700 hover:text-blue-600 px-4 py-2 rounded-md text-sm font-medium transition-colors"
            >
              🔐 تسجيل الدخول
            </Link>

            {/* المينيو المحمول */}
            <div className="md:hidden">
              <div className="text-gray-700">☰</div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
