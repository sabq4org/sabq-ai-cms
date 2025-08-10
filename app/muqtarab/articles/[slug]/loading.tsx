import HeaderSpacer from "@/components/layout/HeaderSpacer";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <>
      <HeaderSpacer />
      <div className="min-h-screen bg-white dark:bg-gray-900">
        <article className="max-w-4xl mx-auto px-4 py-8">
          {/* Skeleton للعنوان */}
          <Skeleton className="h-12 w-3/4 mb-4" />

          {/* Skeleton للمعلومات */}
          <div className="flex items-center gap-4 mb-6">
            <Skeleton className="h-10 w-10 rounded-full" />
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-24" />
          </div>

          {/* Skeleton للصورة */}
          <Skeleton className="w-full h-96 rounded-lg mb-8" />

          {/* Skeleton للمحتوى */}
          <div className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-4/6" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
          </div>
        </article>
      </div>
    </>
  );
}
