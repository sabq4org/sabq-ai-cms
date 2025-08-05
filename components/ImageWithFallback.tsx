"use client";

import { AlertCircle } from "lucide-react";
import Image from "next/image";
import { useCallback, useState } from "react";

interface ImageWithFallbackProps {
  src: string;
  alt: string;
  fill?: boolean;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
  quality?: number;
  placeholder?: "blur" | "empty";
  blurDataURL?: string;
  sizes?: string;
  fallbackSrc?: string;
  loadingText?: string;
  errorText?: string;
  showLoadingIndicator?: boolean;
  onLoadComplete?: () => void;
  onError?: (error: any) => void;
}

export default function ImageWithFallback({
  src,
  alt,
  fill = false,
  width,
  height,
  className = "",
  priority = false,
  quality = 85,
  placeholder,
  blurDataURL,
  sizes,
  fallbackSrc = "/images/placeholder-featured.jpg",
  loadingText = "جاري تحميل الصورة...",
  errorText = "فشل في تحميل الصورة",
  showLoadingIndicator = true,
  onLoadComplete,
  onError,
}: ImageWithFallbackProps) {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(src);

  console.log("🖼️ ImageWithFallback rendering with:", {
    src,
    currentSrc,
    imageError,
    imageLoaded,
  });

  const handleLoad = useCallback(() => {
    console.log("✅ Image loaded successfully:", currentSrc);
    setImageLoaded(true);
    setImageError(false);
    onLoadComplete?.();
  }, [currentSrc, onLoadComplete]);

  const handleError = useCallback(
    (error: any) => {
      console.error("❌ Image failed to load:", currentSrc, error);

      // جرب الصورة البديلة إذا لم نكن نستخدمها بالفعل
      if (currentSrc !== fallbackSrc && !imageError) {
        console.log("🔄 Trying fallback image:", fallbackSrc);
        setCurrentSrc(fallbackSrc);
        setImageError(false);
        setImageLoaded(false);
      } else {
        setImageError(true);
      }

      onError?.(error);
    },
    [currentSrc, fallbackSrc, imageError, onError]
  );

  // التحقق من صحة القيم
  const validWidth = width && !isNaN(width) ? width : 800;
  const validHeight = height && !isNaN(height) ? height : 600;

  const imageClass = `${className} transition-opacity duration-300 ${
    imageLoaded || currentSrc.startsWith("data:") ? "opacity-100" : "opacity-80"
  }`;
  const isUnoptimized =
    currentSrc.includes("cloudinary.com") || currentSrc.startsWith("data:");

  return (
    <div className="relative">
      {fill ? (
        <Image
          src={currentSrc}
          alt={alt || "صورة"}
          fill={true}
          sizes={sizes || "100vw"}
          className={imageClass}
          priority={priority}
          quality={quality}
          placeholder={placeholder}
          blurDataURL={blurDataURL}
          onLoad={handleLoad}
          onError={handleError}
          unoptimized={isUnoptimized}
          style={{ objectFit: "cover" }}
        />
      ) : (
        <Image
          src={currentSrc}
          alt={alt || "صورة"}
          width={validWidth}
          height={validHeight}
          className={imageClass}
          priority={priority}
          quality={quality}
          placeholder={placeholder}
          blurDataURL={blurDataURL}
          sizes={sizes}
          onLoad={handleLoad}
          onError={handleError}
          unoptimized={isUnoptimized}
          style={{ objectFit: "cover" }}
        />
      )}

      {/* مؤشر التحميل */}
      {showLoadingIndicator && !imageLoaded && !imageError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-200 dark:bg-gray-800">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {loadingText}
            </p>
          </div>
        </div>
      )}

      {/* رسالة خطأ فقط في حالة فشل كامل */}
      {imageError && currentSrc === fallbackSrc && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800 border-2 border-dashed border-gray-300 dark:border-gray-600">
          <div className="text-center">
            <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
            <p className="text-sm text-red-600 dark:text-red-400">
              {errorText}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
