import Link from "next/link";

export default function SPSiteFooter() {
  return (
    <footer className="mt-12 border-t border-neutral-800 bg-neutral-950">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div>
            <h3 className="text-sm font-extrabold">عن الواجهة</h3>
            <p className="mt-2 text-sm text-gray-400">
              هذه معاينة مستقلة لتصميم بوابة إخبارية ذكية. لا تؤثر على الواجهة الحالية.
            </p>
          </div>
          <div>
            <h3 className="text-sm font-extrabold">روابط</h3>
            <ul className="mt-2 space-y-2 text-sm text-gray-300">
              <li><Link href="/smart-portal/news" className="hover:text-white">الأخبار</Link></li>
              <li><Link href="/smart-portal/categories" className="hover:text-white">التصنيفات</Link></li>
              <li><Link href="/smart-portal/search" className="hover:text-white">البحث</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-extrabold">ميزات الذكاء</h3>
            <ul className="mt-2 space-y-2 text-sm text-gray-300">
              <li><Link href="/smart-portal/ai/daily-dose" className="hover:text-white">الجرعة اليومية</Link></li>
              <li><Link href="/smart-portal/ai/summary" className="hover:text-white">ملخّص ذكي</Link></li>
              <li><Link href="/smart-portal/ai/recommendations" className="hover:text-white">توصيات مخصّصة</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-extrabold">التحديث القادم</h3>
            <p className="mt-2 text-sm text-gray-400">سنجمع آراء المستخدمين قبل الاعتماد النهائي.</p>
          </div>
        </div>
        <div className="mt-8 border-t border-neutral-800 pt-4 text-xs text-gray-400">
          © {new Date().getFullYear()} — معاينة الواجهة الذكية
        </div>
      </div>
    </footer>
  );
}
