import { Suspense } from "react";
import { notFound } from "next/navigation";
import MuqtarabClientContent from "./MuqtarabClientContent";
import { MuqtarabPageSkeleton } from "@/components/muqtarab/MuqtarabSkeletons";
import HeaderSpacer from "@/components/layout/HeaderSpacer";

// تفعيل ISR لمدة دقيقة
export const revalidate = 60;
export const runtime = "nodejs";

// Metadata للصفحة
export const metadata = {
  title: "مُقترب - منصة المحتوى الإبداعي | صحيفة سبق",
  description: "اكتشف عوالم مُقترب المتنوعة من المحتوى الإبداعي والمقالات المتخصصة في التقنية والثقافة والابتكار",
  keywords: ["مقترب", "محتوى إبداعي", "مقالات", "تقنية", "ثقافة", "ابتكار"],
  openGraph: {
    title: "مُقترب - منصة المحتوى الإبداعي",
    description: "اكتشف عوالم مُقترب المتنوعة",
    images: ["/images/muqtarab-og.jpg"],
  },
};

// جلب البيانات على الخادم
async function getMuqtarabData() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://sabq.io";
    const response = await fetch(`${baseUrl}/api/muqtarab/optimized-page/v2`, {
      next: { 
        revalidate: 60,
        tags: ["muqtarab", "muqtarab-home"]
      },
    });

    if (!response.ok) {
      console.error("Failed to fetch muqtarab data:", response.status);
      return null;
    }

    const data = await response.json();
    
    if (!data.success) {
      console.error("Invalid muqtarab data response");
      return null;
    }

    // إزالة التكرارات على الخادم
    const seen = new Set<string>();
    const uniqueAngles = (data.angles || []).filter((a: any) => {
      const key = (a.slug || a.id || "").toString().toLowerCase();
      if (!key || seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    const seenArticles = new Set<string>();
    const uniqueFeaturedArticles = (data.featuredArticles || []).filter((art: any) => {
      const key = (art.slug || art.id || "").toString().toLowerCase();
      if (!key || seenArticles.has(key)) return false;
      seenArticles.add(key);
      return true;
    });

    return {
      angles: uniqueAngles,
      heroArticle: data.heroArticle,
      featuredArticles: uniqueFeaturedArticles,
      stats: data.stats,
    };
  } catch (error) {
    console.error("Error fetching muqtarab data:", error);
    return null;
  }
}

export default async function MuqtarabPage() {
  // جلب البيانات على الخادم
  const data = await getMuqtarabData();

  if (!data) {
    // يمكن عرض صفحة خطأ مخصصة
    return notFound();
  }

  return (
    <>
      {/* مساحة ثابتة للهيدر */}
      <HeaderSpacer />
      
      {/* المحتوى الرئيسي مع skeleton */}
      <Suspense fallback={<MuqtarabPageSkeleton />}>
        <MuqtarabClientContent 
          initialData={data}
        />
      </Suspense>
    </>
  );
}
