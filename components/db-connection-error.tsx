"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

interface DbConnectionErrorProps {
  articleId?: string;
  showRetryButton?: boolean;
  showAdminLink?: boolean;
  errorMessage?: string;
  errorDetail?: string;
}

export default function DbConnectionError({
  articleId,
  showRetryButton = true,
  showAdminLink = false,
  errorMessage = "عذراً، حدثت مشكلة في الاتصال بقاعدة البيانات",
  errorDetail = "نواجه مشكلة مؤقتة في الاتصال بقاعدة البيانات. نعمل على حل المشكلة في أسرع وقت ممكن.",
}: DbConnectionErrorProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleRetry = () => {
    setIsLoading(true);
    window.location.reload();
  };

  const handleEmergencyMode = () => {
    if (articleId) {
      window.location.href = `/emergency/${articleId}`;
    }
  };

  return (
    <div className="bg-white shadow-lg rounded-lg p-6 md:p-8 max-w-2xl mx-auto my-10 text-center">
      <div className="mb-6 flex justify-center">
        <div className="relative w-20 h-20">
          <Image
            src="/images/database-error.svg"
            alt="خطأ في قاعدة البيانات"
            width={80}
            height={80}
            onError={(e) => {
              // إذا فشل تحميل الصورة، نعرض أيقونة نصية بدلاً من ذلك
              e.currentTarget.style.display = "none";
            }}
          />
        </div>
      </div>

      <h2 className="text-2xl font-bold mb-4 text-red-600">{errorMessage}</h2>
      <p className="text-gray-700 mb-6">{errorDetail}</p>

      <div className="space-y-3">
        {showRetryButton && (
          <button
            onClick={handleRetry}
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md focus:outline-none disabled:bg-blue-300 flex items-center justify-center"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
                <span>جاري المحاولة...</span>
              </>
            ) : (
              "إعادة المحاولة"
            )}
          </button>
        )}

        {articleId && (
          <button
            onClick={handleEmergencyMode}
            className="w-full bg-yellow-500 hover:bg-yellow-600 text-white py-2 px-4 rounded-md focus:outline-none"
          >
            عرض نسخة محفوظة من المقال
          </button>
        )}

        <Link
          href="/"
          className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-4 rounded-md focus:outline-none block text-center"
        >
          العودة للصفحة الرئيسية
        </Link>

        {showAdminLink && (
          <Link
            href="/admin/db-status"
            className="w-full bg-red-100 hover:bg-red-200 text-red-800 py-2 px-4 rounded-md focus:outline-none block text-center mt-4"
          >
            الانتقال إلى صفحة حالة قاعدة البيانات
          </Link>
        )}
      </div>

      <div className="mt-8 border-t pt-4 text-sm text-gray-500">
        <p>رمز الخطأ: DB_CONNECTION_ERROR</p>
        <p>يمكنك التواصل مع الدعم الفني إذا استمرت المشكلة</p>
      </div>
    </div>
  );
}
