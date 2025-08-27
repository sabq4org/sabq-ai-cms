"use client";
import Image from "next/image";
import { useCallback, useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import Container from "./Container";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

type Img = { url: string; alt?: string; width?: number | null; height?: number | null };

export default function HeroGallery({ images }: { images: Img[] }) {
  if (!images || images.length === 0) return null;
  if (images.length === 1) return <OneImageHero img={images[0]} />;
  // من صورتين فأكثر: نستخدم شبكة الألبوم. إذا أكثر من 3 نعرض أول 3 مع زر عرض الكل
  return <AlbumGrid imgs={images} />;
}

function OneImageHero({ img, hasMore }: { img: Img; hasMore?: boolean }) {
  return (
    <div className="relative w-full py-4 px-4 md:px-6">
      <div className="mx-auto max-w-[1200px]">
        <div className="relative aspect-[4/3] sm:aspect-[16/9] md:aspect-[21/9] lg:h-[520px] overflow-hidden rounded-2xl">
          <Image
            src={img.url}
            alt={img.alt || "صورة الخبر"}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 100vw, 1200px"
            priority
            className="object-cover object-center transition-transform duration-500 will-change-transform hover:scale-[1.02]"
          />
          {hasMore && (
            <div className="absolute bottom-3 left-3 rtl:left-auto rtl:right-3 bg-black/50 text-white text-xs md:text-sm px-3 py-1.5 rounded-full">عرض كل الصور</div>
          )}
        </div>
      </div>
    </div>
  );
}

function AlbumGrid({ imgs }: { imgs: Img[] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [index, setIndex] = useState(0);
  const openAt = useCallback((i: number) => {
    setIndex(i);
    setIsOpen(true);
  }, []);

  const close = useCallback(() => setIsOpen(false), []);
  const next = useCallback(() => setIndex((i) => (i + 1) % imgs.length), [imgs.length]);
  const prev = useCallback(() => setIndex((i) => (i - 1 + imgs.length) % imgs.length), [imgs.length]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isOpen, close, next, prev]);

  // نأخذ أول 5 صور: صورة هيرو + أربع مصغرات
  const hero = imgs[0];
  const thumbs = useMemo(() => imgs.slice(1, 5), [imgs]);
  const showMore = imgs.length > 5;

  return (
    <div className="relative w-full py-4 px-4 md:px-6">
      <div className="mx-auto max-w-[1200px] rounded-2xl overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-px md:gap-px lg:gap-1">
          {/* هيرو 50% */}
          <div className="relative md:col-span-6 aspect-[4/3] md:h-[400px] lg:h-[500px] group cursor-zoom-in" onClick={() => openAt(0)}>
            <Image src={hero?.url || imgs[0].url} alt={hero?.alt || imgs[0].alt || "صورة"} fill sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 600px" className="object-cover object-center transition-transform duration-300 group-hover:scale-[1.02] rounded-none" />
          </div>
          {/* 4 مصغرات في 50% الأخرى */}
          <div className="md:col-span-6 grid grid-cols-2 grid-rows-2 gap-px md:gap-px lg:gap-1 md:h-[400px] lg:h-[500px]">
            {thumbs.map((t, i) => (
              <div key={i} className="relative h-full group cursor-zoom-in" onClick={() => openAt(i + 1)}>
                <Image src={t.url} alt={t.alt || "صورة"} fill sizes="(max-width: 768px) 50vw, (max-width: 1280px) 25vw, 300px" className="object-cover object-center transition-transform duration-300 group-hover:scale-[1.03] rounded-none" />
                {showMore && i === 3 && (
                  <button onClick={(e) => { e.stopPropagation(); setIsOpen(true); }} className="absolute bottom-2 right-2 rtl:right-auto rtl:left-2 bg-black/55 text-white text-[11px] md:text-xs px-2.5 py-1 rounded-full">
                    عرض كل الصور ({imgs.length})
                  </button>
                )}
              </div>
            ))}
            {/* في حال أقل من 4 صور مصغرة، لا نعرض خلايا فارغة */}
          </div>
        </div>
      </div>

      {/* Lightbox */}
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center px-4" onClick={close}>
          <button onClick={(e) => { e.stopPropagation(); close(); }} className="absolute top-4 right-4 rtl:right-auto rtl:left-4 text-white p-2 rounded-full bg-white/10 hover:bg-white/20">
            <X className="w-6 h-6" />
          </button>
          <button onClick={(e) => { e.stopPropagation(); prev(); }} className="absolute left-3 rtl:left-auto rtl:right-3 text-white p-2 rounded-full bg-white/10 hover:bg-white/20">
            <ChevronRight className="w-7 h-7 rtl:rotate-180" />
          </button>
          <button onClick={(e) => { e.stopPropagation(); next(); }} className="absolute right-3 rtl:right-auto rtl:left-3 text-white p-2 rounded-full bg-white/10 hover:bg-white/20">
            <ChevronLeft className="w-7 h-7 rtl:rotate-180" />
          </button>
          <img src={imgs[index].url} alt={imgs[index].alt || "صورة"} className="max-h-[85vh] max-w-[90vw] object-contain select-none rounded-2xl" loading="lazy" />
        </div>
      )}
    </div>
  );
}


