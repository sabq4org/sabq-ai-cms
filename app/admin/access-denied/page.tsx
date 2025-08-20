"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

export default function AdminAccessDeniedPage() {
  const searchParams = useSearchParams();
  const next = searchParams?.get("next") || "/admin";

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950 px-4" dir="rtl">
      <div className="max-w-md w-full text-center bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-xl p-6">
        <div className="text-5xl mb-3">🛑</div>
        <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
          هذه المنطقة للإداريين فقط
        </h1>
        <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
          واضح إنك شخص لطيف يا بطل، بس الباب هذا مكتوب عليه: «دخول الإداريين فقط».<br/>
          إذا كنت تائهًا، لا تقلق… حتى الـ 404 يضيع أحيانًا.
        </p>
        <div className="space-y-2">
          <Link href="/admin/login" className="inline-flex items-center justify-center w-full py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition-colors">
            تسجيل الدخول بحساب إداري
          </Link>
          <Link href={next} className="inline-flex items-center justify-center w-full py-2 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-100 text-sm font-medium transition-colors">
            الرجوع إلى حيث كنت
          </Link>
          <Link href="/" className="inline-flex items-center justify-center w-full py-2 rounded-lg bg-white hover:bg-gray-50 dark:bg-gray-900 dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm font-medium transition-colors">
            الصفحة الرئيسية
          </Link>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-4">
          تلميح ساخر: لو كان عندك صلاحية… كان دخلت بدون ما تشوفني 😉
        </p>
      </div>
    </div>
  );
}


