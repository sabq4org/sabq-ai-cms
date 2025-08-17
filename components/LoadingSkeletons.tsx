'use client'

interface SkeletonProps {
  className?: string
  count?: number
}

export function ArticleSkeleton({ className = '', count = 1 }: SkeletonProps) {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className={`animate-pulse ${className}`}>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            {/* صورة placeholder */}
            <div className="h-40 sm:h-48 bg-gray-200"></div>
            
            {/* محتوى البطاقة */}
            <div className="p-4 sm:p-5 space-y-3">
              {/* تصنيف */}
              <div className="flex gap-2">
                <div className="h-6 bg-gray-200 rounded-full w-16"></div>
                <div className="h-6 bg-gray-200 rounded-full w-20"></div>
              </div>
              
              {/* عنوان */}
              <div className="space-y-2">
                <div className="h-6 bg-gray-300 rounded w-full"></div>
                <div className="h-6 bg-gray-300 rounded w-3/4"></div>
              </div>
              
              {/* وصف */}
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </div>
              
              {/* معلومات إضافية */}
              <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                <div className="flex gap-3">
                  <div className="h-4 bg-gray-200 rounded w-16"></div>
                  <div className="h-4 bg-gray-200 rounded w-12"></div>
                </div>
                <div className="h-4 bg-gray-200 rounded w-20"></div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </>
  )
}

export function CategorySkeleton({ className = '', count = 1 }: SkeletonProps) {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className={`animate-pulse ${className}`}>
          <div className="bg-white rounded-lg p-4 border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
              <div className="flex-1 space-y-2">
                <div className="h-5 bg-gray-300 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
              <div className="h-6 bg-gray-200 rounded w-8"></div>
            </div>
          </div>
        </div>
      ))}
    </>
  )
}

export function DeepAnalysisSkeleton({ className = '', count = 1 }: SkeletonProps) {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className={`animate-pulse ${className}`}>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            {/* صورة placeholder */}
            <div className="h-40 sm:h-48 bg-gray-200 relative">
              <div className="absolute top-3 right-3 h-6 bg-gray-300 rounded-full w-24"></div>
              <div className="absolute bottom-3 left-3 h-6 bg-gray-300 rounded-full w-16"></div>
            </div>
            
            {/* محتوى البطاقة */}
            <div className="p-4 sm:p-5 space-y-3">
              {/* تصنيفات */}
              <div className="flex gap-2">
                <div className="h-6 bg-purple-200 rounded-full w-20"></div>
                <div className="h-6 bg-purple-200 rounded-full w-24"></div>
              </div>
              
              {/* عنوان */}
              <div className="space-y-2">
                <div className="h-6 bg-gray-300 rounded w-full"></div>
                <div className="h-6 bg-gray-300 rounded w-4/5"></div>
              </div>
              
              {/* ملخص */}
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </div>
              
              {/* وسوم */}
              <div className="flex gap-2">
                <div className="h-4 bg-gray-200 rounded w-12"></div>
                <div className="h-5 bg-gray-200 rounded w-16"></div>
                <div className="h-5 bg-gray-200 rounded w-14"></div>
              </div>
              
              {/* معلومات إضافية */}
              <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                <div className="flex gap-3">
                  <div className="h-4 bg-gray-200 rounded w-16"></div>
                  <div className="h-4 bg-gray-200 rounded w-12"></div>
                </div>
                <div className="flex gap-3">
                  <div className="h-4 bg-gray-200 rounded w-16"></div>
                  <div className="h-4 bg-gray-200 rounded w-12"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </>
  )
}

export function PageSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50 animate-pulse">
      {/* Header Skeleton */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="h-8 bg-gray-200 rounded w-32"></div>
            <div className="flex gap-4">
              <div className="h-8 bg-gray-200 rounded w-20"></div>
              <div className="h-8 bg-gray-200 rounded w-16"></div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Main Content Skeleton */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Title */}
          <div className="h-8 bg-gray-300 rounded w-1/3"></div>
          
          {/* Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            <ArticleSkeleton count={8} />
          </div>
        </div>
      </div>
    </div>
  )
}
