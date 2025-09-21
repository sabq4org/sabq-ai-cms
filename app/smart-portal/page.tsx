"use client";

import { motion } from "framer-motion";
import { Sparkles, Flame, Newspaper, Search } from "lucide-react";
import Link from "next/link";

export default function SmartPortalHome() {
  return (
    <div className="space-y-8">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-neutral-900 to-neutral-950 p-6 sm:p-8">
        <div className="relative z-10">
          <div className="flex items-center gap-2 text-emerald-400">
            <Sparkles className="h-4 w-4" />
            <span className="text-xs sm:text-sm font-medium">معاينة — الواجهة الذكية</span>
          </div>
          <h1 className="mt-3 text-2xl sm:text-3xl md:text-4xl font-extrabold leading-tight tracking-tight">
            بوابة إخبارية ذكية، سريعة، مخصّصة لك
          </h1>
          <p className="mt-3 text-sm sm:text-base text-gray-300 max-w-2xl">
            تجربة قراءة حديثة تجمع بين السرعة، التخصيص، والذكاء الاصطناعي. هذا مسار معاينة مستقل لا يؤثر على الموقع الحالي.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link href="/smart-portal/news" className="inline-flex items-center gap-2 rounded-lg bg-white text-neutral-900 px-4 py-2 text-sm font-semibold hover:bg-gray-200">
              <Newspaper className="h-4 w-4" /> تصفّح الأخبار
            </Link>
            <Link href="/smart-portal/search" className="inline-flex items-center gap-2 rounded-lg bg-neutral-800 text-gray-100 px-4 py-2 text-sm font-semibold hover:bg-neutral-700">
              <Search className="h-4 w-4" /> البحث الذكي
            </Link>
          </div>
        </div>

        {/* زخرفة متحركة */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 0.25, scale: 1 }}
          transition={{ duration: 1.2 }}
          className="absolute -bottom-16 -left-16 h-56 w-56 rounded-full bg-emerald-500 blur-3xl"
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 0.2, scale: 1 }}
          transition={{ duration: 1.2, delay: 0.1 }}
          className="absolute -top-16 -right-16 h-56 w-56 rounded-full bg-indigo-500 blur-3xl"
        />
      </section>

      {/* أقسام مميّزة */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { title: "العناوين الآن", desc: "آخر المستجدات من جميع الأقسام.", href: "/smart-portal/news", icon: Flame },
          { title: "التصنيفات", desc: "تصفّح حسب الاهتمامات.", href: "/smart-portal/categories", icon: Newspaper },
          { title: "جرعتك اليومية", desc: "ملخّص ذكي صُمّم لك.", href: "/smart-portal/ai/daily-dose", icon: Sparkles },
        ].map((item) => (
          <Link key={item.title} href={item.href} className="group rounded-xl border border-neutral-800 bg-neutral-900 p-5 hover:border-neutral-700">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold">{item.title}</h3>
                <p className="mt-1 text-sm text-gray-400">{item.desc}</p>
              </div>
              <item.icon className="h-5 w-5 text-gray-400 group-hover:text-emerald-400" />
            </div>
          </Link>
        ))}
      </section>

      {/* بطاقات أخبار — نموذج */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-extrabold">مختارات اليوم</h2>
          <Link href="/smart-portal/news" className="text-sm text-gray-300 hover:text-white">الكل</Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1,2,3,4,5,6].map((i) => (
            <article key={i} className="group overflow-hidden rounded-xl border border-neutral-800 bg-neutral-900">
              <div className="aspect-[16/9] bg-neutral-800" />
              <div className="p-4">
                <h3 className="text-sm sm:text-base font-bold group-hover:text-white">عنوان خبر تجريبي #{i}</h3>
                <p className="mt-1 text-xs sm:text-sm text-gray-400 line-clamp-2">وصف مختصر يظهر هنا لعرض الشكل العام للبطاقة في الواجهة التجريبية.</p>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}


