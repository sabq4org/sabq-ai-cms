// components/ui/ArticleSkeleton.tsx
export default function ArticleSkeleton() {
  return (
    <div className="animate-pulse bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* صورة مبسطة */}
      <div className="h-48 sm:h-56 bg-gray-200 dark:bg-gray-700"></div>
      
      {/* محتوى */}
      <div className="p-4">
        {/* التصنيف */}
        <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-20 mb-3"></div>
        
        {/* العنوان */}
        <div className="space-y-2 mb-3">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-4/5"></div>
        </div>
        
        {/* المقتطف */}
        <div className="space-y-2 mb-4">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
        </div>
        
        {/* المعلومات السفلية */}
        <div className="flex items-center justify-between">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
        </div>
      </div>
    </div>
  );
}

// مكون قائمة Skeletons
export function ArticleListSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: count }).map((_, index) => (
        <ArticleSkeleton key={index} />
      ))}
    </div>
  );
}

// مكون Skeleton تفاصيل المقال
export function ArticleDetailSkeleton() {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="animate-pulse">
        {/* العنوان */}
        <div className="space-y-3 mb-6">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-4/5"></div>
        </div>
        
        {/* معلومات المقال */}
        <div className="flex items-center gap-4 mb-6">
          <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
          <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
          <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
        </div>
        
        {/* الصورة الرئيسية */}
        <div className="h-64 sm:h-80 bg-gray-200 dark:bg-gray-700 rounded-lg mb-8"></div>
        
        {/* المحتوى */}
        <div className="space-y-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <div key={index} className="space-y-2">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-4/5"></div>
            </div>
          ))}
        </div>
        
        {/* أزرار التفاعل */}
        <div className="flex items-center gap-4 mt-8">
          <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
          <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
          <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
        </div>
      </div>
    </div>
  );
}
