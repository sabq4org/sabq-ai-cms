"use client";

import { useState } from "react";
import Image from "next/image";

interface MobileFeaturedImageProps {
  imageUrl: string;
  title: string;
  caption?: string;
  category?: {
    name: string;
    color?: string;
    icon?: string;
  };
}

export default function MobileFeaturedImage({
  imageUrl,
  title,
  caption,
  category,
}: MobileFeaturedImageProps) {
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  return (
    <div className="relative w-full -mx-4 sm:mx-0">
      {/* حاوي الصورة - يمتد من أقصى اليمين لليسار */}
      <div className="relative h-[240px] sm:h-[280px] overflow-hidden bg-gray-100 dark:bg-gray-800">
        {/* الصورة مع lazy loading */}
        <Image
          src={imageError ? "/images/placeholder-featured.jpg" : imageUrl}
          alt={title}
          fill
          className={`object-cover transition-opacity duration-300 ${
            imageLoading ? "opacity-0" : "opacity-100"
          }`}
          sizes="100vw"
          priority={false}
          loading="lazy"
          onLoad={() => setImageLoading(false)}
          onError={() => {
            setImageError(true);
            setImageLoading(false);
          }}
        />

        {/* تدرج خفيف في الأسفل لتحسين قراءة النص */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

        {/* شارة التصنيف */}
        {category && (
          <div className="absolute top-3 right-3 z-10">
            <span
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-white shadow-md backdrop-blur-sm"
              style={{
                backgroundColor: `${category.color || "#1a73e8"}CC`,
              }}
            >
              {category.icon && <span className="text-sm">{category.icon}</span>}
              <span>{category.name}</span>
            </span>
          </div>
        )}

        {/* تأثير التحميل */}
        {imageLoading && (
          <div className="absolute inset-0 bg-gray-200 dark:bg-gray-700 animate-pulse" />
        )}
      </div>

      {/* التعليق على الصورة إن وجد */}
      {caption && (
        <div className="px-4 py-2 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
          <p className="text-xs text-gray-600 dark:text-gray-400 text-center">
            {caption}
          </p>
        </div>
      )}
    </div>
  );
}
