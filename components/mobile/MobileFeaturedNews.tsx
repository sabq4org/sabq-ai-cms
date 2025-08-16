import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";

export interface MobileFeaturedItem {
  id: string;
  title: string;
  imageUrl: string;
  href: string;
  category?: string;
  publishedAt?: string;
}

interface MobileFeaturedNewsProps {
  items: MobileFeaturedItem[];
  withSwipe?: boolean;
}

export default function MobileFeaturedNews({ items, withSwipe = true }: MobileFeaturedNewsProps) {
  const sanitized = useMemo(() => Array.isArray(items) ? items.filter(Boolean) : [], [items]);
  const [active, setActive] = useState(0);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const timerRef = useRef<number | null>(null);
  const indexRef = useRef<number>(0);

  if (!sanitized.length) return null;

  const handleScroll = () => {
    if (!trackRef.current) return;
    const el = trackRef.current;
    // ابحث عن أقرب شريحة لموضع التمرير الفعلي بدلاً من القسمة على عرض البطاقة (لتفادي مشكلة الـ gap)
    let nearestIdx = 0;
    let minDist = Infinity;
    for (let i = 0; i < el.children.length; i++) {
      const child = el.children[i] as HTMLElement;
      const left = child.offsetLeft;
      const dist = Math.abs(el.scrollLeft - left);
      if (dist < minDist) {
        minDist = dist;
        nearestIdx = i;
      }
    }
    setActive(nearestIdx);
    indexRef.current = nearestIdx;
  };

  // تشغيل تلقائي كل 3 ثواني مع الحفاظ على السحب اليدوي
  useEffect(() => {
    if (!withSwipe || sanitized.length <= 1) return;
    const el = trackRef.current;
    if (!el) return;

    timerRef.current = window.setInterval(() => {
      const container = trackRef.current;
      if (!container) return;
      const children = container.children;
      if (!children || children.length === 0) return;
      const nextIndex = (indexRef.current + 1) % children.length;
      const targetLeft = (children[nextIndex] as HTMLElement).offsetLeft;
      container.scrollTo({ left: targetLeft, behavior: "smooth" });
      indexRef.current = nextIndex;
      setActive(nextIndex);
    }, 3000);
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
      timerRef.current = null;
    };
  }, [withSwipe, sanitized.length]);

  const formatGregorian = (iso?: string) => {
    if (!iso) return "";
    const d = new Date(iso);
    try {
      return new Intl.DateTimeFormat("ar-SA", {
        calendar: "gregory",
        day: "2-digit",
        month: "short",
        year: "numeric",
      }).format(d);
    } catch {
      return d.toLocaleDateString("en-GB");
    }
  };

  return (
    <section dir="rtl" className="relative w-full select-none">
      <div
        ref={trackRef}
        onScroll={withSwipe ? handleScroll : undefined}
        className={
          withSwipe
            ? "flex gap-3 overflow-x-auto scroll-smooth snap-x snap-mandatory no-scrollbar"
            : ""
        }
      >
        <style jsx>{`
          .no-scrollbar::-webkit-scrollbar { display: none; }
        `}</style>
        {(withSwipe ? sanitized : [sanitized[0]]).map((item, i) => (
          <Link
            key={item.id}
            href={item.href}
            className={withSwipe ? "snap-start shrink-0 w-[92vw]" : "block w-full"}
            aria-label={item.title}
          >
            <article className="relative w-full overflow-hidden rounded-2xl">
              {/* إطار بنسبة 16:9 يثبت الارتفاع */}
              <div className="relative aspect-[16/9] w-full">
                <Image
                  src={item.imageUrl}
                  alt={item.title}
                  fill
                  className="object-cover object-center"
                  priority={i === 0}
                  loading={i === 0 ? "eager" : "lazy"}
                  decoding="async"
                />
                {/* تدرج أسود من الأسفل للأعلى */}
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent" />

                {/* طبقة النص السفلي - للموبايل فقط (تحديث: 2025-01-14) */}
                <div className="md:hidden absolute inset-x-0 bottom-0 p-3 sm:p-4 pb-6 sm:pb-8">
                  {/* التصنيف + التاريخ (فوق العنوان) */}
                  <div className="flex items-center gap-2 text-[10px] sm:text-[11px] text-white/90 mb-2">
                    {item.category && (
                      <span className="inline-flex items-center px-2 py-[2px] rounded-full bg-white/15 backdrop-blur-sm border border-white/20">
                        {item.category}
                      </span>
                    )}
                    {item.publishedAt && (
                      <time dateTime={item.publishedAt} aria-label="تاريخ النشر" className="opacity-90">
                        {formatGregorian(item.publishedAt)}
                      </time>
                    )}
                  </div>
                  {/* العنوان */}
                  <h3 className="text-white text-base sm:text-lg font-semibold leading-snug line-clamp-2">
                    {item.title}
                  </h3>
                </div>
              </div>
            </article>
          </Link>
        ))}
      </div>

      {/* مؤشرات صور مصغرة عند وجود أكثر من عنصر ومع تفعيل السحب */}
      {withSwipe && sanitized.length > 1 && (
        <div className="absolute left-1/2 -translate-x-1/2 bottom-2 flex items-center gap-2">
          {sanitized.map((item, i) => (
            <button
              key={i}
              onClick={() => {
                const container = trackRef.current;
                if (!container) return;
                const children = container.children;
                if (!children || children.length === 0) return;
                const targetLeft = (children[i] as HTMLElement).offsetLeft;
                container.scrollTo({ left: targetLeft, behavior: "smooth" });
                setActive(i);
              }}
              className={`relative overflow-hidden rounded transition-all duration-300 ${
                i === active 
                  ? "w-10 h-6 ring-1 ring-white/70 shadow-md" 
                  : "w-6 h-6 opacity-40 hover:opacity-60"
              }`}
              aria-label={`الانتقال إلى ${item.title}`}
            >
              <img
                src={item.imageUrl}
                alt={item.title}
                className="w-full h-full object-cover"
                loading="lazy"
              />
              <div className={`absolute inset-0 ${
                i === active ? "bg-white/15" : "bg-black/35"
              }`}></div>
            </button>
          ))}
        </div>
      )}
    </section>
  );
}
