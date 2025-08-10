export default function Loading() {
  return (
    <div className="min-h-[100svh] bg-gray-50 dark:bg-gray-900">
      {/* الفراغ العلوي بدون JavaScript */}
      <div className="pt-[var(--mobile-header-height)] sm:pt-[var(--header-height)] lg:pt-20">
        <div className="max-w-4xl mx-auto px-4 py-4 sm:py-6 lg:py-8">
          {/* Skeleton للعنوان */}
          <div className="mb-8 space-y-4 animate-pulse">
            <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-lg w-3/4"></div>
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-lg w-1/2"></div>
          </div>

          {/* Skeleton للمحتوى */}
          <div className="space-y-3 animate-pulse">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-4/6"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
          </div>

          {/* Skeleton لصورة */}
          <div className="mt-8 h-64 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
        </div>
      </div>
    </div>
  );
}
