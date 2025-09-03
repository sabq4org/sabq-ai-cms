"use client";
import Image from "next/image";
import { useCallback, useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import Container from "./Container";
import { X, ChevronLeft, ChevronRight, RotateCw, Maximize2 } from "lucide-react";

type Img = { url: string; alt?: string; width?: number | null; height?: number | null };

interface ImageDimensions {
  width: number;
  height: number;
  aspectRatio: number;
  orientation: 'landscape' | 'portrait' | 'square';
}

// تحسين رابط Cloudinary
function transformCloudinary(url: string, width: number): string {
  try {
    if (!url || typeof url !== 'string') return url;
    if (!url.includes('res.cloudinary.com') || !url.includes('/upload/')) return url;
    const parts = url.split('/upload/');
    if (parts.length !== 2) return url;
    if (/\/upload\/(c_|w_|f_|q_|g_)/.test(url)) return url;
    const tx = `f_auto,q_auto,w_${width}`;
    return `${parts[0]}/upload/${tx}/${parts[1]}`;
  } catch { return url; }
}

// تحديد أبعاد الصورة
function getImageDimensions(img: HTMLImageElement): ImageDimensions {
  const aspectRatio = img.naturalWidth / img.naturalHeight;
  
  let orientation: 'landscape' | 'portrait' | 'square';
  if (aspectRatio > 1.2) orientation = 'landscape';
  else if (aspectRatio < 0.8) orientation = 'portrait';
  else orientation = 'square';

  return {
    width: img.naturalWidth,
    height: img.naturalHeight,
    aspectRatio,
    orientation
  };
}

export default function ImprovedHeroGallery({ images }: { images: Img[] }) {
  if (!images || images.length === 0) return null;
  if (images.length === 1) return <SmartSingleImage img={images[0]} />;
  return <SmartAlbumGrid imgs={images} />;
}

function SmartSingleImage({ img }: { img: Img }) {
  const [dimensions, setDimensions] = useState<ImageDimensions | null>(null);
  const [displayMode, setDisplayMode] = useState<'auto' | 'contain' | 'cover'>('auto');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const handleImageLoad = (event: React.SyntheticEvent<HTMLImageElement>) => {
    const imgElement = event.target as HTMLImageElement;
    const dims = getImageDimensions(imgElement);
    setDimensions(dims);
    setIsLoading(false);

    // تحديد نمط العرض التلقائي
    if (dims.orientation === 'portrait' && dims.aspectRatio < 0.6) {
      setDisplayMode('contain');
    } else {
      setDisplayMode('cover');
    }
  };

  const getContainerClasses = () => {
    if (!dimensions) return "aspect-[4/3] sm:aspect-[16/9] md:aspect-[21/9] lg:h-[520px]";

    const { orientation, aspectRatio } = dimensions;

    switch (orientation) {
      case 'portrait':
        if (aspectRatio < 0.5) {
          // صور عمودية جداً
          return "h-[500px] md:h-[600px] max-w-[400px] mx-auto";
        } else if (aspectRatio < 0.7) {
          // صور عمودية عادية
          return "h-[450px] md:h-[550px] max-w-[500px] mx-auto";
        } else {
          // صور عمودية قريبة من المربع
          return "aspect-[3/4] max-w-[600px] mx-auto";
        }
      case 'square':
        return "aspect-square max-w-[600px] mx-auto";
      case 'landscape':
      default:
        return "aspect-[4/3] sm:aspect-[16/9] md:aspect-[21/9] lg:h-[520px]";
    }
  };

  const getImageObjectFit = () => {
    if (displayMode === 'contain') return 'object-contain';
    if (displayMode === 'cover') return 'object-cover';
    
    if (dimensions?.orientation === 'portrait' && dimensions.aspectRatio < 0.6) {
      return 'object-contain';
    }
    return 'object-cover';
  };

  return (
    <div className="relative w-full py-2 px-2 md:px-4">
      <div className="mx-auto max-w-[1200px]">
        <div className={cn(
          "relative overflow-hidden rounded-2xl group bg-gray-100 dark:bg-gray-800",
          getContainerClasses()
        )}>
          {/* مؤشر التحميل */}
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}

          {/* الصورة */}
          <Image
            src={transformCloudinary(img.url, 1600)}
            alt={img.alt || "صورة الخبر"}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 100vw, 1200px"
            priority
            fetchPriority="high"
            decoding="async"
            className={cn(
              "transition-all duration-300",
              getImageObjectFit(),
              isLoading && 'opacity-0'
            )}
            onLoad={handleImageLoad}
          />

          {/* أدوات التحكم */}
          {dimensions && !isLoading && (
            <>
              <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <div className="flex gap-2">
                  {/* تبديل نمط العرض للصور العمودية */}
                  {dimensions.orientation === 'portrait' && (
                    <button
                      onClick={() => setDisplayMode(prev => 
                        prev === 'contain' ? 'cover' : 'contain'
                      )}
                      className="p-2 bg-black/70 text-white rounded-lg hover:bg-black/90 transition-colors backdrop-blur-sm"
                      title={displayMode === 'contain' ? 'ملء الإطار' : 'احتواء كامل'}
                    >
                      <RotateCw className="w-4 h-4" />
                    </button>
                  )}

                  {/* عرض بملء الشاشة */}
                  <button
                    onClick={() => setIsFullscreen(true)}
                    className="p-2 bg-black/70 text-white rounded-lg hover:bg-black/90 transition-colors backdrop-blur-sm"
                    title="عرض بملء الشاشة"
                  >
                    <Maximize2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* معلومات الصورة */}
              <div className="absolute bottom-4 left-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <div className="px-3 py-2 bg-black/70 text-white text-sm rounded-lg backdrop-blur-sm">
                  <div className="flex items-center gap-2">
                    <span>{dimensions.width} × {dimensions.height}</span>
                    <span>•</span>
                    <span className={cn(
                      "px-2 py-1 rounded text-xs",
                      dimensions.orientation === 'portrait' ? 'bg-purple-500/30' :
                      dimensions.orientation === 'landscape' ? 'bg-blue-500/30' : 'bg-green-500/30'
                    )}>
                      {dimensions.orientation === 'portrait' ? 'عمودية' : 
                       dimensions.orientation === 'landscape' ? 'أفقية' : 'مربعة'}
                    </span>
                  </div>
                </div>
              </div>

              {/* نصيحة للصور العمودية */}
              {dimensions.orientation === 'portrait' && dimensions.aspectRatio < 0.7 && (
                <div className="absolute top-4 left-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <div className="px-3 py-2 bg-purple-600/80 text-white text-xs rounded-lg backdrop-blur-sm max-w-[200px]">
                    💡 صورة عمودية - انقر على زر التدوير لتغيير نمط العرض
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* نصائح إضافية تحت الصورة */}
        {dimensions?.orientation === 'portrait' && dimensions.aspectRatio < 0.6 && (
          <div className="mt-3 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 rounded-lg text-sm">
              <span>📱</span>
              <span>هذه صورة عمودية - تم تحسين العرض تلقائياً</span>
            </div>
          </div>
        )}
      </div>

      {/* عرض ملء الشاشة */}
      {isFullscreen && (
        <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4">
          <div className="relative max-w-full max-h-full">
            <Image
              src={transformCloudinary(img.url, 1920)}
              alt={img.alt || "صورة الخبر"}
              width={dimensions?.width || 800}
              height={dimensions?.height || 600}
              className="max-w-full max-h-full object-contain"
            />
            <button
              onClick={() => setIsFullscreen(false)}
              className="absolute top-4 right-4 p-3 bg-black/70 text-white rounded-full hover:bg-black/90 transition-colors backdrop-blur-sm"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function SmartAlbumGrid({ imgs }: { imgs: Img[] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [index, setIndex] = useState(0);
  const [imageDimensions, setImageDimensions] = useState<{ [key: number]: ImageDimensions }>({});

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

  const handleImageLoad = (imgIndex: number) => (event: React.SyntheticEvent<HTMLImageElement>) => {
    const imgElement = event.target as HTMLImageElement;
    const dims = getImageDimensions(imgElement);
    setImageDimensions(prev => ({ ...prev, [imgIndex]: dims }));
  };

  const hero = imgs[0];
  const thumbs = useMemo(() => imgs.slice(1, 5), [imgs]);
  const showMore = imgs.length > 5;
  const heroOrientation = imageDimensions[0]?.orientation;

  return (
    <div className="relative w-full py-2 px-2 md:px-4">
      <div className="mx-auto max-w-[1200px]">
        <div className={cn(
          "grid gap-2 rounded-2xl overflow-hidden",
          heroOrientation === 'portrait' ? "grid-cols-1 md:grid-cols-3" : "grid-cols-1 md:grid-cols-2"
        )}>
          {/* الصورة الرئيسية */}
          <div 
            className={cn(
              "relative group cursor-zoom-in",
              heroOrientation === 'portrait' ? "md:col-span-2" : "md:col-span-1"
            )}
            onClick={() => openAt(0)}
          >
            <div className={cn(
              "relative w-full overflow-hidden bg-gray-100 dark:bg-gray-800",
              heroOrientation === 'portrait' && imageDimensions[0]?.aspectRatio < 0.7
                ? "h-[400px] md:h-[500px]"
                : "min-h-[300px] md:min-h-[400px] h-full"
            )}>
              <Image 
                src={transformCloudinary(hero?.url || imgs[0].url, 1200)} 
                alt={hero?.alt || imgs[0].alt || "صورة"} 
                fill 
                sizes="(max-width: 768px) 100vw, 60vw" 
                priority 
                fetchPriority="high"
                decoding="async"
                className={cn(
                  "transition-all duration-300",
                  heroOrientation === 'portrait' && imageDimensions[0]?.aspectRatio < 0.7
                    ? "object-contain"
                    : "object-cover"
                )}
                onLoad={handleImageLoad(0)}
              />
              
              {/* مؤشر نوع الصورة */}
              {imageDimensions[0] && (
                <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className={cn(
                    "px-2 py-1 text-xs text-white rounded",
                    imageDimensions[0].orientation === 'portrait' ? 'bg-purple-600/80' :
                    imageDimensions[0].orientation === 'landscape' ? 'bg-blue-600/80' : 'bg-green-600/80'
                  )}>
                    {imageDimensions[0].orientation === 'portrait' ? 'عمودية' : 
                     imageDimensions[0].orientation === 'landscape' ? 'أفقية' : 'مربعة'}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* الصور المصغرة */}
          {thumbs.length > 0 && (
            <div className={cn(
              "grid gap-2",
              heroOrientation === 'portrait' ? "grid-cols-2 md:grid-cols-1" : "grid-cols-2"
            )}>
              {thumbs.map((thumb, i) => (
                <div 
                  key={i + 1} 
                  className="relative group cursor-zoom-in" 
                  onClick={() => openAt(i + 1)}
                >
                  <div className="relative w-full h-[120px] md:h-[150px] overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800">
                    <Image 
                      src={transformCloudinary(thumb.url, 400)} 
                      alt={thumb.alt || `صورة ${i + 2}`} 
                      fill 
                      sizes="200px"
                      className="object-cover transition-transform duration-300 group-hover:scale-105" 
                      onLoad={handleImageLoad(i + 1)}
                    />
                    
                    {/* عدد الصور المتبقية */}
                    {i === thumbs.length - 1 && showMore && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white font-medium">
                        +{imgs.length - 5}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* عارض الصور المنبثق */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center">
          <div className="relative w-full h-full flex items-center justify-center p-4">
            <Image
              src={transformCloudinary(imgs[index].url, 1920)}
              alt={imgs[index].alt || `صورة ${index + 1}`}
              width={imageDimensions[index]?.width || 800}
              height={imageDimensions[index]?.height || 600}
              className="max-w-full max-h-full object-contain"
            />
            
            {/* أزرار التحكم */}
            <button onClick={close} className="absolute top-4 right-4 p-3 bg-black/70 text-white rounded-full hover:bg-black/90 transition-colors backdrop-blur-sm">
              <X className="w-5 h-5" />
            </button>
            
            {imgs.length > 1 && (
              <>
                <button onClick={prev} className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-black/70 text-white rounded-full hover:bg-black/90 transition-colors backdrop-blur-sm">
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button onClick={next} className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-black/70 text-white rounded-full hover:bg-black/90 transition-colors backdrop-blur-sm">
                  <ChevronRight className="w-5 h-5" />
                </button>
              </>
            )}
            
            {/* مؤشر الصورة الحالية */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-3 py-2 bg-black/70 text-white rounded-lg backdrop-blur-sm">
              {index + 1} من {imgs.length}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

