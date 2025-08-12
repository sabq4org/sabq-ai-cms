"use client";

import Image from "next/image";
import { useState, useMemo } from "react";
import { IMAGE_CONFIG } from "./ImageDisplayConfig";

// Simple in-memory cache for URL validity to avoid repeated parsing
const urlValidityCache = new Map<string, boolean>();

interface ArticleFeaturedImageProps {
  imageUrl: string;
  title: string;
  caption?: string; // تعريف الصورة
  category?: { name: string; color?: string; icon?: string };
  blurDataURL?: string; // اختيارية لدعم placeholder blur
}

// Caption box extracted to avoid repetition
function CaptionBox({ caption }: { caption?: string }) {
  if (!caption) return null;
  return (
    <div className="mt-3 px-4 py-2 bg-gray-50 dark:bg-gray-800 rounded-lg border-r-4 border-blue-500">
      <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
        {caption}
      </p>
    </div>
  );
}

// URL validation with caching
function isValidImageUrl(url: string): boolean {
  if (!url || typeof url !== "string" || url.length < 5) return false;
  // quick invalid patterns
  if (url === "undefined" || url === "null" || url.includes("undefined")) return false;
  if (urlValidityCache.has(url)) return urlValidityCache.get(url)!;
  let valid = false;
  try {
    // allow protocol-relative / relative local paths
    const candidate = url.startsWith("http") ? url : (url.startsWith("/") ? `https://local${url}` : `https://example.com/${url}`);
    new URL(candidate);
    valid = true;
  } catch {
    valid = url.startsWith("/") || url.includes("images/");
  }
  urlValidityCache.set(url, valid);
  return valid;
}

export default function ArticleFeaturedImage({
  imageUrl,
  title,
  caption,
  category,
  blurDataURL,
}: ArticleFeaturedImageProps) {
  const [imageError, setImageError] = useState(false);
  const valid = useMemo(() => isValidImageUrl(imageUrl), [imageUrl]);
  const shouldUnoptimize = imageUrl.includes("placeholder") || imageUrl.includes("via.placeholder");
  const commonImageProps = {
    onError: () => setImageError(true),
    placeholder: blurDataURL ? ("blur" as const) : ("empty" as const),
    blurDataURL,
  };

  // Fallback if invalid
  if (imageError || !valid) {
    return (
      <div className="w-full h-48 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
        <p className="text-gray-500 dark:text-gray-400 text-center">
          الصورة غير متاحة حالياً
        </p>
      </div>
    );
  }

  switch (IMAGE_CONFIG.DISPLAY_MODE) {
    case "default":
      return (
        <div className="relative w-full">
          {/* إطار موحّد: 300-350px للبطاقات على الشاشات الصغيرة، و500-600px للتفاصيل على الديسكتوب */}
          <div className="relative overflow-hidden rounded-lg h-[300px] sm:h-[360px] lg:h-[560px]">
            <Image
              src={imageUrl}
              alt={title || "صورة المقال"}
              fill
              className="object-cover object-center w-full h-full"
              priority
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 90vw, 1024px"
              unoptimized={shouldUnoptimize}
              {...commonImageProps}
            />
          </div>
          <CaptionBox caption={caption} />
        </div>
      );

    case "blur-overlay":
      return (
        <div className="article-featured-image relative h-[400px] sm:h-[500px] lg:h-[600px] w-full overflow-hidden bg-gray-900 dark:bg-black">
          {/* صورة الخلفية المموهة */}
          <Image
            src={imageUrl}
            alt=""
            width={800}
            height={600}
            className="absolute inset-0 w-full h-full object-cover blur-2xl scale-110 opacity-60"
            priority={false}
            unoptimized={shouldUnoptimize}
            {...commonImageProps}
          />

          {/* الطبقة الداكنة فوق الخلفية المموهة */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/60" />

          {/* حاوي الصورة الرئيسية */}
          <div className="relative z-10 h-full flex items-center justify-center p-4 sm:p-8">
            <div className="max-w-4xl w-full h-full flex items-center justify-center">
              <Image
                src={imageUrl}
                alt={title || "صورة المقال"}
                width={800}
                height={600}
                className="max-w-full max-h-full shadow-2xl transition-all duration-500 hover:scale-[1.02]"
                priority
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 90vw, 1200px"
                unoptimized={shouldUnoptimize}
                {...commonImageProps}
              />
            </div>
          </div>

          {/* معلومات إضافية اختيارية على الصورة */}
          {category && (
            <div className="absolute bottom-0 left-0 right-0 p-6 z-20">
              <div className="max-w-4xl mx-auto">
                <span
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium text-white backdrop-blur-md"
                  style={{
                    backgroundColor: `${category.color || "#1a73e8"}99`,
                  }}
                >
                  {category.icon && <span>{category.icon}</span>}
                  {category.name}
                </span>
              </div>
            </div>
          )}
        </div>
      );

    case "aspect-ratio": {
      // التحقق من وجود مسار للصورة حقيقي وليس undefined أو فارغ
      const hasValidImage =
        imageUrl &&
        imageUrl !== "undefined" &&
        imageUrl !== "null" &&
        imageUrl.length > 0 &&
        !imageUrl.includes("undefined");

      if (!hasValidImage) {
        // إذا لم تكن هناك صورة صالحة، نقدم مساحة فارغة بارتفاع صفر
        return null;
      }

      return (
        <div className="article-featured-image w-full">
          <div className="w-full">
            <div className="relative overflow-hidden shadow-md rounded-lg">
              <Image
                src={imageUrl}
                alt={title || "صورة المقال"}
                width={1024}
                height={576}
                className="w-full h-auto object-cover"
                priority
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 90vw, 1024px"
                unoptimized={shouldUnoptimize}
                {...commonImageProps}
              />
            </div>
            <CaptionBox caption={caption} />
          </div>
        </div>
      );
    }

    case "fullwidth":
      return (
        <div className="article-featured-image relative h-[300px] sm:h-[400px] md:h-[500px] lg:h-[60vh] w-full bg-gray-200 dark:bg-gray-800">
          <Image
            src={imageUrl}
            alt={title || "صورة المقال"}
            width={1920}
            height={1080}
            className="w-full h-full object-cover"
            priority
            sizes="100vw"
            unoptimized={shouldUnoptimize}
            {...commonImageProps}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 z-10" />
        </div>
      );

    case "content-width":
      return (
        <div className="article-featured-image w-full">
          <div className="relative overflow-hidden rounded-lg">
            <Image
              src={imageUrl}
              alt={title || "صورة المقال"}
              width={1024}
              height={576}
              className="w-full h-auto object-cover min-h-[220px] sm:min-h-[300px] md:min-h-[350px] lg:min-h-[400px]"
              priority
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 90vw, 1024px"
              unoptimized={shouldUnoptimize}
              {...commonImageProps}
            />
          </div>
          <CaptionBox caption={caption} />
        </div>
      );

    default:
      return null;
  }
}
