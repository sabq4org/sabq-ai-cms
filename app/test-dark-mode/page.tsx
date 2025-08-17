"use client";

import { DarkModeToggle } from "@/components/admin/modern-dashboard/DarkModeToggle";

export default function TestDarkMode() {
  return (
    <div className="min-h-screen p-8">
      <h1 className="text-3xl font-bold mb-6">اختبار الوضع المظلم</h1>
      <div className="mb-6">
        <DarkModeToggle />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card p-6">
          <h2 className="text-xl font-semibold mb-4">بطاقة اختبار</h2>
          <p className="text-gray-600 dark:text-gray-300">
            هذا نص للاختبار في الوضع العادي والوضع المظلم
          </p>
        </div>
        
        <div className="card p-6 bg-blue-50 dark:bg-blue-900/20">
          <h2 className="text-xl font-semibold mb-4">بطاقة ملونة</h2>
          <p className="text-blue-700 dark:text-blue-300">
            هذا نص ملون للاختبار
          </p>
        </div>
      </div>
    </div>
  );
}
