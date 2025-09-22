import Link from "next/link";
import OldStyleNewsServerMarkup from "@/components/old-style/OldStyleNewsServerMarkup";
import LightFeaturedServerMarkup from "@/components/featured/LightFeaturedServerMarkup";

// منع التوليد الساكن أثناء البناء لتفادي مهلة 90 ثانية على Vercel
export const dynamic = 'force-dynamic';

export default async function LightPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 bg-gray-50 dark:bg-gray-950">
      <div className="mb-8 text-right pr-2 sm:pr-4">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">النسخة الخفيفة</h1>
        <p className="text-lg text-gray-600 dark:text-gray-400">واجهة مبسطة وسريعة مع جميع الميزات الأساسية</p>
      </div>

      <div 
        className="mb-8 p-6 rounded-2xl border-2"
        style={{
          borderColor: 'rgba(var(--theme-primary-rgb, 59 130 246), 0.4)',
          backgroundColor: 'rgba(var(--theme-primary-rgb, 59 130 246), 0.06)',
        }}
      >
        {/* نظام الألوان المتغيرة تم تعطيله لتحسين الأداء */}
      </div>

      <div className="mb-8 pr-2 sm:pr-4">
        <LightFeaturedServerMarkup limit={3} />
      </div>

      <OldStyleNewsServerMarkup endpoint="/api/light/news?limit=9" title="آخر الأخبار" columns={3} className="mb-12" revalidateSeconds={60} />

      <div className="max-w-3xl mx-auto text-center mb-12">
        <h3 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-2">تجربة إخبارية أفضل بانتظارك.</h3>
        <p className="text-sm md:text-base text-gray-600 dark:text-gray-300 mb-4">سجّل عضويتك مجاناً لتصلك المقالات والأخبار التي تناسب ذوقك واهتماماتك الفريدة.</p>
        <Link href="/register" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all hover:scale-[1.02] border" style={{ backgroundColor: 'var(--theme-primary, #3B82F6)', color: 'white', borderColor: 'rgba(var(--theme-primary-rgb, 59 130 246), 0.3)' }}>سجّل الآن مجاناً</Link>
      </div>

      <div className="mt-16 grid md:grid-cols-3 gap-6">
        <div className="text-center p-6">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: 'rgba(var(--theme-primary-rgb, 59 130 246), 0.2)' }}>
            <svg className="w-8 h-8" style={{ color: 'var(--theme-primary, #3B82F6)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
          </div>
          <h3 className="text-lg font-bold mb-2 text-gray-900 dark:text-white">سريع وخفيف</h3>
          <p className="text-gray-600 dark:text-gray-400">أداء فائق السرعة مع واجهة مبسطة</p>
        </div>
        <div className="text-center p-6">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: 'rgba(var(--theme-primary-rgb, 59 130 246), 0.2)' }}>
            <svg className="w-8 h-8" style={{ color: 'var(--theme-primary, #3B82F6)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
          </div>
          <h3 className="text-lg font-bold mb-2 text-gray-900 dark:text-white">متجاوب بالكامل</h3>
          <p className="text-gray-600 dark:text-gray-400">تصميم Mobile-First يعمل على جميع الأجهزة</p>
        </div>
        <div className="text-center p-6">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: 'rgba(var(--theme-primary-rgb, 59 130 246), 0.2)' }}>
            <svg className="w-8 h-8" style={{ color: 'var(--theme-primary, #3B82F6)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" /></svg>
          </div>
          <h3 className="text-lg font-bold mb-2 text-gray-900 dark:text-white">ألوان متغيرة</h3>
          <p className="text-gray-600 dark:text-gray-400">نظام ألوان ديناميكي قابل للتخصيص</p>
        </div>
      </div>
    </div>
  );
}
