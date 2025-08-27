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
    <div className="relative w-full py-2 px-2 md:px-4">
      <div className="mx-auto max-w-[1200px]">
        <div className="relative aspect-[4/3] sm:aspect-[16/9] md:aspect-[21/9] lg:h-[520px] overflow-hidden rounded-2xl">
          <Image
            src={img.url}
            alt={img.alt || "صورة الخبر"}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 100vw, 1200px"
            priority
            className="object-cover object-center"
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
    <div className="relative w-full py-2 px-2 md:px-4">
      <div className="mx-auto max-w-[1200px]">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-[3px] rounded-2xl overflow-hidden">
          {/* هيرو - 50% بالضبط */}
          <div className="relative md:h-full group cursor-zoom-in" onClick={() => openAt(0)}>
            <div className="relative w-full h-full min-h-[300px] md:min-h-[400px] overflow-hidden">
              <Image 
                src={hero?.url || imgs[0].url} 
                alt={hero?.alt || imgs[0].alt || "صورة"} 
                fill 
                sizes="(max-width: 768px) 100vw, 600px" 
                className="object-cover scale-105" 
              />
            </div>
          </div>
          {/* 4 مصغرات - 50% بالضبط */}
          <div className="grid grid-cols-2 grid-rows-2 gap-[3px] min-h-[300px] md:min-h-[400px]">
            {thumbs.map((t, i) => (
                <div key={i} className="relative group cursor-zoom-in overflow-hidden" onClick={() => openAt(i + 1)}>
                  <Image 
                    src={t.url} 
                    alt={t.alt || "صورة"} 
                    fill 
                    sizes="(max-width: 768px) 50vw, 300px" 
                    className="object-cover scale-105"
                  />
                  {showMore && i === 3 && (
                    <div 
                      onClick={(e) => { e.stopPropagation(); setIsOpen(true); }} 
                      className="absolute inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/85 transition-all duration-300 cursor-pointer group"
                    >
                      <div className="text-center">
                        <div className="mb-3">
                          <svg className="w-12 h-12 mx-auto opacity-90 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <span className="text-lg font-semibold block mb-1">إظهار كل الصور</span>
                        <span className="text-sm opacity-80">({imgs.length} صورة)</span>
                      </div>
                    </div>
                  )}
                </div>
            ))}
            {/* في حال أقل من 4 صور مصغرة، نملأ بخلايا فارغة */}
            {thumbs.length < 4 && Array.from({ length: 4 - thumbs.length }).map((_, i) => (
              <div key={`empty-${i}`} className="relative bg-neutral-100 dark:bg-neutral-800" />
            ))}
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


