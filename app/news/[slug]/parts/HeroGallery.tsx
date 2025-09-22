"use client";
import Image from "next/image";
import { useCallback, useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import Container from "./Container";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

type Img = { url: string; alt?: string; width?: number | null; height?: number | null };

// تحسين رابط Cloudinary عند توفره لتقليل LCP عبر f_auto,q_auto,w_...
function transformCloudinary(url: string, width: number, opts?: { fill?: boolean; quality?: 'auto' | 'eco' }): string {
  try {
    if (!url || typeof url !== 'string') return url;
    if (!url.includes('res.cloudinary.com') || !url.includes('/upload/')) return url;
    const parts = url.split('/upload/');
    if (parts.length !== 2) return url;
    // إذا كانت التحويلات موجودة بالفعل، نعيد الرابط كما هو
    if (/\/upload\/(c_|w_|f_|q_|g_)/.test(url)) return url;
    const quality = opts?.quality === 'eco' || width <= 800 ? 'q_auto:eco' : 'q_auto';
    const crop = opts?.fill === false ? 'c_limit' : 'c_fill,g_auto';
    const tx = `f_auto,${quality},${crop},dpr_auto,w_${width}`;
    return `${parts[0]}/upload/${tx}/${parts[1]}`;
  } catch { return url; }
}

export default function HeroGallery({ images }: { images: Img[] }) {
  if (!images || images.length === 0) return null;
  if (images.length === 1) return <OneImageHero img={images[0]} />;
  // من صورتين فأكثر: نستخدم شبكة الألبوم. إذا أكثر من 3 نعرض أول 3 مع زر عرض الكل
  return <AlbumGrid imgs={images} />;
}

function OneImageHero({ img, hasMore }: { img: Img; hasMore?: boolean }) {
  // نحسب نسبة الصورة لتحديد إذا كانت عمودية
  const isPortrait = img.height && img.width && (img.height / img.width) > 1.2;
  const isCloudinary = typeof img.url === 'string' && img.url.includes('res.cloudinary.com');
  const blurDataURL = isCloudinary ? transformCloudinary(img.url, 20, { fill: true, quality: 'eco' }) : undefined;
  
  return (
    <div className="relative w-full py-2 px-2 md:px-4">
      <div className="mx-auto max-w-[1200px]">
        <div className={cn(
          "relative overflow-hidden rounded-2xl",
          // للصور العمودية على الموبايل، نستخدم aspect-auto للحفاظ على النسبة الأصلية
          isPortrait ? "aspect-auto sm:aspect-[4/3] md:aspect-[16/9]" : "aspect-[4/3] sm:aspect-[16/9] md:aspect-[21/9] lg:h-[520px]",
          // خلفية رمادية خفيفة للصور العمودية
          isPortrait && "bg-gray-50 dark:bg-gray-900"
        )}>
          <Image
            src={transformCloudinary(img.url, 1100, { fill: true, quality: 'eco' })}
            alt={img.alt || "صورة الخبر"}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 100vw, 1100px"
            priority
            fetchPriority="high"
            decoding="async"
            placeholder={blurDataURL ? 'blur' : undefined as any}
            blurDataURL={blurDataURL}
            className={cn(
              // للصور العمودية على الموبايل نستخدم contain، وعلى الشاشات الكبيرة cover
              isPortrait ? "object-contain sm:object-cover" : "object-cover",
              "object-center"
            )}
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
  const isCloudinaryHero = typeof hero?.url === 'string' && hero.url.includes('res.cloudinary.com');
  const blurHero = isCloudinaryHero ? transformCloudinary(hero.url, 20, { fill: true, quality: 'eco' }) : undefined;
  const thumbs = useMemo(() => imgs.slice(1, 5), [imgs]);
  const showMore = imgs.length > 5;

  return (
    <div className="relative w-full py-2 px-2 md:px-4">
      <div className="mx-auto max-w-[1200px]">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-0 rounded-2xl overflow-hidden">
          {/* هيرو - 50% بالضبط */}
          <div className="relative md:h-full group cursor-zoom-in bg-gray-50 dark:bg-gray-900" onClick={() => openAt(0)}>
            <div className="relative w-full h-full min-h-[300px] md:min-h-[400px] overflow-hidden">
              <Image 
                src={transformCloudinary(hero?.url || imgs[0].url, 900, { fill: true, quality: 'eco' })} 
                alt={hero?.alt || imgs[0].alt || "صورة"} 
                fill 
                sizes="(max-width: 768px) 100vw, 50vw" 
                priority 
                fetchPriority="high"
                decoding="async"
                placeholder={blurHero ? 'blur' : undefined as any}
                blurDataURL={blurHero}
                className="object-cover object-center" 
              />
            </div>
          </div>
          {/* 4 مصغرات - 50% بالضبط */}
          <div className="grid grid-cols-2 grid-rows-2 gap-0 min-h-[300px] md:min-h-[400px]">
            {thumbs.map((t, i) => (
                <div key={i} className="relative group cursor-zoom-in overflow-hidden bg-gray-50 dark:bg-gray-900" onClick={() => openAt(i + 1)}>
                  <Image 
                    src={transformCloudinary(t.url, 360, { fill: true, quality: 'eco' })} 
                    alt={t.alt || "صورة"} 
                    fill 
                    sizes="(max-width: 768px) 50vw, 300px" 
                    loading="lazy"
                    decoding="async"
                    className="object-cover object-center"
                  />
                  {showMore && i === 3 && (
                    <div 
                      onClick={(e) => { e.stopPropagation(); setIsOpen(true); }} 
                      className="absolute bottom-0 right-0 m-3 bg-black/80 backdrop-blur-sm px-4 py-2 rounded-lg text-white hover:bg-black/90 transition-all duration-300 cursor-pointer flex items-center gap-2 group"
                    >
                      <svg className="w-5 h-5 opacity-90 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span className="text-sm font-medium">عرض كل الصور ({imgs.length})</span>
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


