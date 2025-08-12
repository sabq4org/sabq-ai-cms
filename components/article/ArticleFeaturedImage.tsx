"use client";

import Image from "next/image";
import { useState } from "react";
import { IMAGE_CONFIG } from "./ImageDisplayConfig";

interface ArticleFeaturedImageProps {
  imageUrl: string;
  title: string;
  caption?: string; // تعريف الصورة
  category?: {
    name: string;
    color?: string;
    icon?: string;
  };
}

export default function ArticleFeaturedImage({
  imageUrl,
  title,
  caption,
  category,
}: ArticleFeaturedImageProps) {
  const [imageError, setImageError] = useState(false);

  // طباعة تشخيصية مؤقتة
  console.log("🖼️ ArticleFeaturedImage Debug:", {
    imageUrl: imageUrl?.substring(0, 50),
    title: title?.substring(0, 30),
    caption: caption,
    hasCaption: !!caption,
    category: category?.name
  });

  // التحقق من صحة URL الصورة
  const isValidImageUrl = (url: string): boolean => {
    if (!url) return false;
    if (typeof url !== "string") return false;
    if (url.length < 5) return false; // URL غير منطقي

    // تحقق من بعض الحالات الشائعة للعناوين غير الصالحة
    if (url === "undefined" || url === "null" || url.includes("undefined")) {
      return false;
    }

    // محاولة معرفة إذا كان URL صالح
    try {
      const urlObj = new URL(
        url.startsWith("http") ? url : `https://example.com/${url}`
      );
      return true;
    } catch (e) {
      return url.startsWith("/") || url.includes("images/"); // قد تكون مسارات محلية صالحة
    }
  };

  // إذا كانت الصورة غير صالحة أو حدث خطأ في تحميلها
  if (imageError || !isValidImageUrl(imageUrl)) {
    return (
      <div className="w-full h-48 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
        <p className="text-gray-500 dark:text-gray-400 text-center">
          الصورة غير متاحة حالياً
        </p>
      </div>
    );
  }

  // عرض بناءً على الوضع المحدد في الإعدادات
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
              priority={true}
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 90vw, 1024px"
              unoptimized={imageUrl.includes('placeholder') || imageUrl.includes('via.placeholder')}
              onError={() => setImageError(true)}
            />
          </div>
          {/* تعريف الصورة */}
          {caption && (
            <div className="mt-3 px-4 py-2 bg-gray-50 dark:bg-gray-800 rounded-lg border-r-4 border-blue-500">
              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                {caption}
              </p>
            </div>
          )}
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
            unoptimized={imageUrl.includes('placeholder') || imageUrl.includes('via.placeholder')}
            onError={() => setImageError(true)}
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
                priority={true}
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 90vw, 1200px"
                unoptimized={imageUrl.includes('placeholder') || imageUrl.includes('via.placeholder')}
                onError={() => setImageError(true)}
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

    case "aspect-ratio":
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
                priority={true}
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 90vw, 1024px"
                unoptimized={imageUrl.includes('placeholder') || imageUrl.includes('via.placeholder')}
              />
            </div>
            {/* تعريف الصورة */}
            {caption && (
              <div className="mt-3 px-4 py-2 bg-gray-50 dark:bg-gray-800 rounded-lg border-r-4 border-blue-500">
                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                  {caption}
                </p>
              </div>
            )}
          </div>
        </div>
      );

    case "fullwidth":
      return (
        <div className="article-featured-image relative h-[300px] sm:h-[400px] md:h-[500px] lg:h-[60vh] w-full bg-gray-200 dark:bg-gray-800">
          <Image
            src={imageUrl}
            alt={title || "صورة المقال"}
            width={1920}
            height={1080}
            className="w-full h-full object-cover"
            priority={true}
            sizes="100vw"
            unoptimized={imageUrl.includes('placeholder') || imageUrl.includes('via.placeholder')}
            onError={() => setImageError(true)}
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
              priority={true}
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 90vw, 1024px"
              unoptimized={imageUrl.includes('placeholder') || imageUrl.includes('via.placeholder')}
              onError={() => setImageError(true)}
            />
          </div>
          {/* تعريف الصورة */}
          {caption && (
            <div className="mt-3 px-4 py-2 bg-gray-50 dark:bg-gray-800 rounded-lg border-r-4 border-blue-500">
              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                {caption}
              </p>
            </div>
          )}
        </div>
      );

    default:
      return null;
  }
}
