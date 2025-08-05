"use client";

import Image from "next/image";

interface SimpleImageProps {
  src: string;
  alt: string;
  fill?: boolean;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
  sizes?: string;
}

export default function SimpleImage({
  src,
  alt,
  fill = false,
  width,
  height,
  className = "",
  priority = false,
  sizes,
}: SimpleImageProps) {
  console.log("🖼️ SimpleImage rendering:", { src, alt });

  // fallback إلى HTML img إذا كانت صورة Cloudinary
  if (src.includes("cloudinary.com")) {
    return (
      <img
        src={src}
        alt={alt}
        className={`${className} w-full h-full object-cover`}
        style={
          fill
            ? {
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
              }
            : {}
        }
        onLoad={() => console.log("✅ HTML img loaded:", src)}
        onError={(e) => {
          console.error("❌ HTML img failed:", src);
          const target = e.target as HTMLImageElement;
          target.src = "/images/placeholder-featured.jpg";
        }}
      />
    );
  }

  // استخدام Next.js Image للصور المحلية
  // التحقق من صحة القيم
  const validWidth = width && !isNaN(width) ? width : 800;
  const validHeight = height && !isNaN(height) ? height : 600;

  if (fill) {
    return (
      <Image
        src={src || "/images/placeholder-featured.jpg"}
        alt={alt || "صورة"}
        fill={true}
        className={className}
        priority={priority}
        sizes={sizes || "100vw"}
        unoptimized={true}
        onLoad={() => console.log("✅ Next.js Image loaded:", src)}
        onError={() => console.error("❌ Next.js Image failed:", src)}
        style={{ objectFit: "cover" }}
      />
    );
  }

  return (
    <Image
      src={src || "/images/placeholder-featured.jpg"}
      alt={alt || "صورة"}
      width={validWidth}
      height={validHeight}
      className={className}
      priority={priority}
      sizes={sizes}
      unoptimized={true}
      onLoad={() => console.log("✅ Next.js Image loaded:", src)}
      onError={() => console.error("❌ Next.js Image failed:", src)}
      style={{ objectFit: "cover" }}
    />
  );
}
