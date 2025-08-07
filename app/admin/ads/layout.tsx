import { BarChart3, Eye, Plus, Settings } from "lucide-react";
import Link from "next/link";

export default function AdsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* الهيدر */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                إدارة الإعلانات
              </h1>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                إدارة وتتبع الحملات الإعلانية في الموقع
              </p>
            </div>
            <Link
              href="/admin/ads/create"
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              إعلان جديد
            </Link>
          </div>
        </div>
      </div>

      {/* التنقل */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8" dir="rtl">
            <Link
              href="/admin/ads"
              className="flex items-center gap-2 py-3 px-1 border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300 transition-colors"
            >
              <Eye className="w-4 h-4" />
              جميع الإعلانات
            </Link>
            <Link
              href="/admin/ads/report"
              className="flex items-center gap-2 py-3 px-1 border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300 transition-colors"
            >
              <BarChart3 className="w-4 h-4" />
              التقارير
            </Link>
            <Link
              href="/admin/ads/settings"
              className="flex items-center gap-2 py-3 px-1 border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300 transition-colors"
            >
              <Settings className="w-4 h-4" />
              الإعدادات
            </Link>
          </nav>
        </div>
      </div>

      {/* المحتوى */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
