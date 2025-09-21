"use client";

import { Sparkles, CalendarDays, MapPin } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";

export default function InvitationDMS() {
  useEffect(() => {
    document.documentElement.setAttribute("dir", "rtl");
  }, []);

  return (
    <div className="min-h-screen relative overflow-hidden bg-neutral-950 text-gray-100">
      {/* خلفية AI: تدرج + نقاط ناعمة */}
      <div className="absolute inset-0 bg-gradient-to-b from-neutral-900/60 via-neutral-950 to-black" />
      <div className="pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full bg-emerald-500/15 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-indigo-500/15 blur-3xl" />

      <main className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        {/* Hero */}
        <section className="text-center max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 ring-1 ring-white/10 text-xs sm:text-sm text-gray-300">
            <Sparkles className="h-4 w-4 text-emerald-400" /> Sabq Althakiyah – Smart News CMS
          </div>
          <h1 className="mt-4 text-2xl sm:text-3xl md:text-5xl font-extrabold leading-tight tracking-tight">
            اكتشف سبق الذكية – نظام إدارة المحتوى الذكي
          </h1>
          <h2 className="mt-2 text-base sm:text-lg md:text-xl text-gray-300">
            Discover Sabq Althakiyah – Smart News CMS
          </h2>
          <p className="mt-5 text-sm sm:text-base text-gray-300 max-w-2xl mx-auto">
            جيل جديد من النشر الصحفي مدعوم بالذكاء الاصطناعي · A new generation of AI-powered publishing
          </p>
        </section>

        {/* تفاصيل الموعد */}
        <section className="mt-8 sm:mt-10 flex justify-center">
          <div className="w-full max-w-2xl rounded-2xl bg-white/5 ring-1 ring-white/10 p-4 sm:p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-300 flex items-center justify-center">
                <CalendarDays className="h-5 w-5" />
              </div>
              <div>
                <div className="text-sm text-gray-400">التاريخ والوقت · Date & Time</div>
                <div className="font-semibold">الخميس – الساعة 10:00 صباحًا</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-indigo-500/10 text-indigo-300 flex items-center justify-center">
                <MapPin className="h-5 w-5" />
              </div>
              <div>
                <div className="text-sm text-gray-400">المكان · Location</div>
                <div className="font-semibold">مقر صحيفة سبق – الرياض</div>
              </div>
            </div>
          </div>
        </section>

        {/* المزايا */}
        <section className="mt-10 sm:mt-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { titleAr: "المحرر الذكي", titleEn: "Smart Editor", icon: "✨" },
              { titleAr: "التحليل العميق", titleEn: "Deep Analysis", icon: "📊" },
              { titleAr: "التوصيات الذكية", titleEn: "Smart Recommendations", icon: "🤖" },
              { titleAr: "أنظمة الولاء والتحليلات", titleEn: "Loyalty & Analytics", icon: "🏆" }
            ].map((f, idx) => (
              <div key={idx} className="rounded-xl bg-white/5 ring-1 ring-white/10 p-4 sm:p-5 hover:ring-white/20 transition">
                <div className="text-2xl mb-2">{f.icon}</div>
                <div className="font-bold">{f.titleAr}</div>
                <div className="text-sm text-gray-400">{f.titleEn}</div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="mt-10 sm:mt-12 text-center">
          <Link
            href="#"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-indigo-500 text-white font-semibold shadow-lg hover:opacity-95 active:scale-[0.99] transition"
            aria-label="Confirm Attendance"
          >
            <span>✅ تأكيد الحضور</span>
            <span className="text-white/80">·</span>
            <span>✅ Confirm Attendance</span>
          </Link>
        </section>
      </main>
    </div>
  );
}


