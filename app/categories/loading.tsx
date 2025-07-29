export default function Loading() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header Skeleton */}
        <div className="text-center mb-12">
          <div className="h-10 w-48 bg-gray-200 dark:bg-gray-700 rounded-lg mx-auto mb-4 animate-pulse" />
          <div className="h-6 w-96 bg-gray-200 dark:bg-gray-700 rounded mx-auto animate-pulse" />
        </div>

        {/* Stats Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow animate-pulse">
              <div className="h-12 w-12 bg-gray-200 dark:bg-gray-700 rounded-full mb-3" />
              <div className="h-6 w-20 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
              <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded" />
            </div>
          ))}
        </div>

        {/* Categories Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
            <div key={i} className="relative bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden h-64 animate-pulse">
              {/* Background */}
              <div className="absolute inset-0 bg-gray-200 dark:bg-gray-700" />
              
              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
              
              {/* Content */}
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <div className="h-8 w-8 bg-gray-300 dark:bg-gray-600 rounded-full mb-3" />
                <div className="h-6 w-32 bg-gray-300 dark:bg-gray-600 rounded mb-2" />
                <div className="h-4 w-24 bg-gray-300 dark:bg-gray-600 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 