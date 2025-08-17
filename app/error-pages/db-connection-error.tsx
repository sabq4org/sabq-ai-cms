"use client";

import {
  AlertTriangle,
  ArrowLeft,
  Database,
  Home,
  RefreshCcw,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface DbConnectionErrorProps {
  articleId?: string;
  error?: string;
}

export default function DbConnectionError({
  articleId,
  error = "Prisma Engine not connected",
}: DbConnectionErrorProps) {
  const router = useRouter();

  // محاولة إعادة تحميل الصفحة
  const handleRetry = () => {
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 shadow-lg rounded-2xl p-6 sm:p-8 text-center">
        <div className="mb-6 p-4 mx-auto w-20 h-20 flex items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30">
          <Database className="w-10 h-10 text-amber-600 dark:text-amber-400" />
        </div>

        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-2">
          خطأ في الاتصال بقاعدة البيانات
        </h1>

        <p className="text-gray-600 dark:text-gray-300 mb-6">
          نواجه مشكلة مؤقتة في الاتصال بقاعدة البيانات. يرجى المحاولة مرة أخرى
          لاحقاً.
        </p>

        {error && (
          <div className="p-4 mb-6 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
              <div className="text-amber-800 dark:text-amber-300 text-sm text-right">
                <p className="font-medium">تفاصيل الخطأ:</p>
                <p className="font-mono text-xs mt-1 break-all">{error}</p>
              </div>
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={handleRetry}
            className="flex items-center justify-center gap-2 px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
          >
            <RefreshCcw className="w-4 h-4" />
            إعادة المحاولة
          </button>

          <Link
            href="/"
            className="flex items-center justify-center gap-2 px-5 py-3 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-lg font-medium transition-colors"
          >
            <Home className="w-4 h-4" />
            الرئيسية
          </Link>

          <button
            onClick={() => router.back()}
            className="flex items-center justify-center gap-2 px-5 py-3 border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg font-medium transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            العودة
          </button>
        </div>
      </div>

      {articleId && (
        <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
          معرف المقال: <span className="font-mono">{articleId}</span>
        </div>
      )}
    </div>
  );
}
