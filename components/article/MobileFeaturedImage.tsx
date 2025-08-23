"use client";

import { useState } from "react";
import Image from "next/image";

interface MobileFeaturedImageProps {
  imageUrl: string;
  title: string;
  alt?: string; // النص البديل للصورة (Alt Text)
  caption?: string;
  category?: {
    name: string;
    color?: string;
    icon?: string;
  };
  className?: string;
}

export default function MobileFeaturedImage({
  imageUrl,
  title,
  alt,
  caption,
  category,
  className,
}: MobileFeaturedImageProps) {
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  return (
    <div className={`relative w-full ${className || ''}`}>
      {/* حاوي الصورة بارتفاع مناسب */}
      <div className="relative w-full h-[230px] overflow-hidden bg-gray-100 dark:bg-gray-800 rounded-xl">
        {/* الصورة مع lazy loading */}
        <Image
          src={imageError ? "/images/placeholder-featured.jpg" : imageUrl}
          alt={alt || title}
          fill
          className={`object-cover transition-opacity duration-300 rounded-xl ${
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
          style={{ objectPosition: 'center 35%' }}
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

      {/* شرح الصورة (Alt Text) أو التعليق على الصورة إن وجد - خارج حاوي الصورة */}
      {(alt || caption) && (alt !== title || caption) && (
        <div className="mt-2 px-3 py-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          {alt && alt !== title && (
            <div className="flex items-start gap-2 justify-start text-left">
              <span className="text-xs text-blue-500 dark:text-blue-400 mt-0.5 flex-shrink-0">📷</span>
              <p className="text-xs text-gray-700 dark:text-gray-200 font-medium leading-relaxed">
                {alt}
              </p>
            </div>
          )}
          {caption && caption !== alt && (
            <div className="flex items-start gap-2 justify-start text-left mt-1">
              <span className="text-xs text-gray-400 dark:text-gray-500 mt-0.5 flex-shrink-0">💬</span>
              <p className="text-xs text-gray-500 dark:text-gray-400 italic leading-relaxed">
                {caption}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
