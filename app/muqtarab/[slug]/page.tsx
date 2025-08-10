import { Suspense } from "react";
import { notFound } from "next/navigation";
import AngleClientContent from "./AngleClientContent";
import HeaderSpacer from "@/components/layout/HeaderSpacer";
import { Skeleton } from "@/components/ui/skeleton";

// تفعيل ISR
export const revalidate = 60;
export const runtime = "nodejs";

// Metadata ديناميكية
export async function generateMetadata({ params }: { params: { slug: string } }) {
  const angle = await getAngleData(params.slug);
  
  if (!angle) {
    return {
      title: "الزاوية غير موجودة | مُقترب",
    };
  }

  return {
    title: `${angle.title} | مُقترب`,
    description: angle.description || `اكتشف محتوى ${angle.title} في مُقترب`,
    keywords: angle.tags || [],
    openGraph: {
      title: angle.title,
      description: angle.description,
      images: angle.coverImage ? [angle.coverImage] : [],
    },
  };
}

// جلب بيانات الزاوية
async function getAngleData(slug: string) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://sabq.io";
    const response = await fetch(`${baseUrl}/api/muqtarab/angles/by-slug/${slug}`, {
      next: { 
        revalidate: 60,
        tags: ["muqtarab", `muqtarab-angle-${slug}`]
      },
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return data.angle;
  } catch (error) {
    console.error("Error fetching angle:", error);
    return null;
  }
}

// جلب مقالات الزاوية
async function getAngleArticles(angleId: string) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://sabq.io";
    const response = await fetch(
      `${baseUrl}/api/muqtarab/angles/${angleId}/articles?status=published`,
      {
        next: { 
          revalidate: 60,
          tags: ["muqtarab", `muqtarab-angle-articles-${angleId}`]
        },
      }
    );

    if (!response.ok) {
      return [];
    }

    const data = await response.json();
    return data.articles || [];
  } catch (error) {
    console.error("Error fetching angle articles:", error);
    return [];
  }
}

// Skeleton للصفحة
function AnglePageSkeleton() {
  return (
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
  );
}

export default async function AnglePage({ params }: { params: { slug: string } }) {
  const decodedSlug = decodeURIComponent(params.slug);

  // جلب البيانات بالتوازي
  const [angle, articles] = await Promise.all([
    getAngleData(decodedSlug),
    // نحتاج معرف الزاوية أولاً، لذا سنجلب المقالات داخل المكون
    Promise.resolve([])
  ]);

  if (!angle) {
    return notFound();
  }

  // جلب المقالات بعد الحصول على معرف الزاوية
  const angleArticles = await getAngleArticles(angle.id);

  return (
    <>
      {/* مساحة ثابتة للهيدر */}
      <HeaderSpacer />
      
      {/* المحتوى مع Suspense */}
      <Suspense fallback={<AnglePageSkeleton />}>
        <AngleClientContent 
          angle={angle}
          initialArticles={angleArticles}
        />
      </Suspense>
    </>
  );
}
