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

  const firstThree = useMemo(() => imgs.slice(0, 3), [imgs]);
  const showMore = imgs.length > 3;

  return (
    <div className="relative w-full py-4 px-4 md:px-6">
      <div className="mx-auto max-w-[1200px]">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-3 lg:gap-4">
          {/* الصورة الكبيرة (تأخذ صفّين) */}
          <div className="relative md:col-span-2 row-span-2 aspect-[4/3] md:aspect-auto md:h-[520px] overflow-hidden rounded-2xl group cursor-zoom-in" onClick={() => openAt(0)}>
            <Image src={firstThree[0]?.url || imgs[0].url} alt={firstThree[0]?.alt || imgs[0].alt || "صورة"} fill sizes="(max-width: 768px) 100vw, 66vw" className="object-cover object-center transition-transform duration-300 group-hover:scale-[1.02]" />
          </div>
          {/* الصورتان الجانبيتان */}
          <div className="grid grid-rows-2 gap-2 md:gap-3">
            <div className="relative aspect-[4/3] overflow-hidden rounded-2xl group cursor-zoom-in" onClick={() => openAt(1)}>
              <Image src={(firstThree[1] || imgs[1] || imgs[0]).url} alt={(firstThree[1] || imgs[1] || imgs[0]).alt || "صورة"} fill sizes="33vw" className="object-cover object-center transition-transform duration-300 group-hover:scale-[1.03]" />
            </div>
            <div className="relative aspect-[4/3] overflow-hidden rounded-2xl group cursor-zoom-in" onClick={() => openAt(2)}>
              <Image src={(firstThree[2] || imgs[2] || imgs[0]).url} alt={(firstThree[2] || imgs[2] || imgs[0]).alt || "صورة"} fill sizes="33vw" className="object-cover object-center transition-transform duration-300 group-hover:scale-[1.03]" />
              {showMore && (
                <button onClick={(e) => { e.stopPropagation(); setIsOpen(true); }} className="absolute bottom-3 left-3 rtl:left-auto rtl:right-3 bg-black/50 text-white text-xs md:text-sm px-3 py-1.5 rounded-full">
                  عرض كل الصور ({imgs.length})
                </button>
              )}
            </div>
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
          <img src={imgs[index].url} alt={imgs[index].alt || "صورة"} className="max-h-[85vh] max-w-[90vw] object-contain select-none" loading="lazy" />
        </div>
      )}
    </div>
  );
}


