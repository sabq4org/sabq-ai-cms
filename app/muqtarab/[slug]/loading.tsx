import HeaderSpacer from "@/components/layout/HeaderSpacer";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <>
      <HeaderSpacer />
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
        <div className="py-8 px-4 md:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            {/* Skeleton للهيدر */}
            <div className="mb-8">
              <Skeleton className="h-12 w-64 mb-4" />
              <Skeleton className="h-6 w-96 mb-2" />
              <Skeleton className="h-4 w-full max-w-2xl" />
            </div>

            {/* Skeleton للإحصائيات */}
            <div className="grid grid-cols-3 gap-4 mb-8">
              <Skeleton className="h-24" />
              <Skeleton className="h-24" />
              <Skeleton className="h-24" />
            </div>

            {/* Skeleton للمقالات */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="h-64" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
