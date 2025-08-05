"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

interface UltimateImageProps {
  src: string;
  alt: string;
  fill?: boolean;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
  sizes?: string;
}

export default function UltimateImage({
  src,
  alt,
  fill = false,
  width,
  height,
  className = "",
  priority = false,
  sizes,
}: UltimateImageProps) {
  const [method, setMethod] = useState<"nextjs" | "html" | "fallback">(
    "nextjs"
  );
  const [currentSrc, setCurrentSrc] = useState(src);

  console.log("🎯 UltimateImage:", { src, method, currentSrc });

  // جرب NextJS Image أولاً، ثم HTML img، ثم placeholder
  const handleNextJSError = () => {
    console.log("❌ Next.js Image failed, trying HTML img");
    setMethod("html");
  };

  const handleHTMLError = () => {
    console.log("❌ HTML img failed, using fallback");
    setMethod("fallback");
    setCurrentSrc("/images/placeholder-featured.jpg");
  };

  // للصور من Cloudinary، استخدم HTML img مباشرة
  useEffect(() => {
    if (src.includes("cloudinary.com")) {
      setMethod("html");
    }
  }, [src]);

  const baseStyle = fill
    ? {
        position: "absolute" as const,
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        objectFit: "cover" as const,
      }
    : {
        width: width || "auto",
        height: height || "auto",
        objectFit: "cover" as const,
        maxWidth: "100%",
      };

  // طريقة Next.js
  if (method === "nextjs") {
    // التحقق من صحة القيم والفصل بين fill و width/height
    const validWidth = width && !isNaN(width) ? width : 800;
    const validHeight = height && !isNaN(height) ? height : 600;

    if (fill) {
      return (
        <Image
          src={currentSrc || "/images/placeholder-featured.jpg"}
          alt={alt || "صورة"}
          fill={true}
          className={className}
          priority={priority}
          sizes={sizes || "100vw"}
          unoptimized={true}
          onLoad={() => console.log("✅ Next.js Image loaded:", currentSrc)}
          onError={handleNextJSError}
          style={{ objectFit: "cover" }}
        />
      );
    }

    return (
      <Image
        src={currentSrc || "/images/placeholder-featured.jpg"}
        alt={alt || "صورة"}
        width={validWidth}
        height={validHeight}
        className={className}
        priority={priority}
        sizes={sizes}
        unoptimized={true}
        onLoad={() => console.log("✅ Next.js Image loaded:", currentSrc)}
        onError={handleNextJSError}
        style={{ objectFit: "cover" }}
      />
    );
  }

  // طريقة HTML img
  if (method === "html") {
    return (
      <img
        src={currentSrc}
        alt={alt}
        className={className}
        style={baseStyle}
        onLoad={() => console.log("✅ HTML img loaded:", currentSrc)}
        onError={handleHTMLError}
      />
    );
  }

  // الحل الأخير - placeholder
  return (
    <div
      className={`${className} bg-gray-200 dark:bg-gray-700 flex items-center justify-center`}
      style={baseStyle}
    >
      <div className="text-center text-gray-500 dark:text-gray-400">
        <svg
          className="w-12 h-12 mx-auto mb-2"
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z" />
        </svg>
        <p className="text-sm">صورة المقال</p>
      </div>
    </div>
  );
}
