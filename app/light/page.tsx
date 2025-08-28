import Link from "next/link";
import dynamic from "next/dynamic";

// تحميل المكونات بشكل lazy
const OldStyleNewsServerMarkup = dynamic(
  () => import("@/components/old-style/OldStyleNewsServerMarkup"),
  { ssr: true }
);

const LightFeaturedServerMarkup = dynamic(
  () => import("@/components/featured/LightFeaturedServerMarkup"),
  { ssr: true }
);

// cache أفضل
export const revalidate = 300; // 5 دقائق
export const runtime = 'nodejs';

export default async function LightPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 bg-gray-50 dark:bg-gray-950">
      {/* رأس مبسط */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">النسخة الخفيفة</h1>
      </div>

      <div className="mb-8">
        <LightFeaturedServerMarkup limit={3} />
      </div>

      <OldStyleNewsServerMarkup 
        endpoint="/api/light/news?limit=9" 
        title="آخر الأخبار" 
        columns={3} 
        className="mb-8" 
        revalidateSeconds={60} 
      />

      {/* دعوة مبسطة للتسجيل */}
      <div className="mt-8 text-center bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6">
        <h3 className="text-lg font-bold mb-2 text-gray-900 dark:text-white">احصل على تجربة أفضل</h3>
        <p className="text-gray-600 dark:text-gray-400 mb-3">سجّل الآن للحصول على مزايا إضافية</p>
        <Link href="/register" className="inline-block bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
          سجّل مجاناً
        </Link>
      </div>
    </div>
  );
}
