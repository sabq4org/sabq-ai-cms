"use client";

export default function Error({ error, reset }: { error: Error, reset: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center bg-white dark:bg-gray-900" dir="rtl">
      <h2 className="text-2xl md:text-3xl font-bold text-red-600 dark:text-red-400 mb-4">
        حدث خطأ غير متوقع في التصنيفات
      </h2>
      <p className="text-gray-700 dark:text-gray-300 mb-6">{error.message}</p>
      <button
        onClick={reset}
        className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-lg font-semibold transition"
      >
        إعادة المحاولة
      </button>
    </div>
  );
} 