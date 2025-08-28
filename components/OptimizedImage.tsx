"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
  fetchPriority?: 'high' | 'low' | 'auto';
  quality?: number;
  sizes?: string;
  fill?: boolean;
  style?: React.CSSProperties;
  onLoad?: () => void;
  fallbackSrc?: string;
}

export default function OptimizedImage({
  src,
  alt,
  width,
  height,
  className = "",
  priority = false,
  fetchPriority,
  quality = 85,
  sizes,
  fill = false,
  style,
  onLoad,
  fallbackSrc = "/images/placeholder.jpg",
}: OptimizedImageProps) {
  const [imageSrc, setImageSrc] = useState(src);
  const [isLoading, setIsLoading] = useState(true);
  const [isInView, setIsInView] = useState(false);
  const imageRef = useRef<HTMLDivElement>(null);

  // Intersection Observer لـ lazy loading
  useEffect(() => {
    if (priority) {
      setIsInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.disconnect();
          }
        });
      },
      {
        // تحميل الصور قبل 200px من الظهور
        rootMargin: "200px",
        threshold: 0.01,
      }
    );

    if (imageRef.current) {
      observer.observe(imageRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, [priority]);

  // معالجة أخطاء تحميل الصور
  const handleError = () => {
    console.warn(`فشل تحميل الصورة: ${src}`);
    if (fallbackSrc && imageSrc !== fallbackSrc) {
      setImageSrc(fallbackSrc);
    }
  };

  // معالجة اكتمال التحميل
  const handleLoad = () => {
    setIsLoading(false);
    if (onLoad) {
      onLoad();
    }
  };

  // عنصر placeholder أثناء التحميل
  const placeholder = (
    <div
      className={`bg-gray-200 dark:bg-gray-700 animate-pulse ${className}`}
      style={{
        width: fill ? "100%" : width,
        height: fill ? "100%" : height,
        ...style,
      }}
    />
  );

  // إذا لم تكن الصورة في مجال الرؤية بعد
  if (!isInView) {
    return <div ref={imageRef}>{placeholder}</div>;
  }

  return (
    <div ref={imageRef} className="relative">
      {isLoading && placeholder}

      <Image
        src={imageSrc}
        alt={alt}
        width={!fill ? width : undefined}
        height={!fill ? height : undefined}
        fill={fill}
        className={`${className} ${
          isLoading ? "opacity-0" : "opacity-100"
        } transition-opacity duration-300`}
        priority={priority}
        fetchPriority={fetchPriority}
        quality={quality}
        sizes={
          sizes || "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        }
        style={style}
        onLoad={handleLoad}
        onError={handleError}
        loading={priority ? "eager" : "lazy"}
        placeholder="empty" // لتجنب blur placeholder الافتراضي
      />
    </div>
  );
}

// مكون محسن لصور المقالات
export function ArticleImage({
  src,
  alt,
  caption,
}: {
  src: string;
  alt: string;
  caption?: string;
}) {
  return (
    <figure className="my-6">
      <OptimizedImage
        src={src}
        alt={alt}
        width={800}
        height={450}
        className="rounded-lg shadow-lg w-full h-auto"
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 800px"
        quality={90}
      />
      {caption && (
        <figcaption className="text-center text-sm text-gray-500 dark:text-gray-400 mt-2">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}

// مكون محسن لصور البطاقات
export function CardImage({
  src,
  alt,
  className = "",
}: {
  src: string;
  alt: string;
  className?: string;
}) {
  return (
    <OptimizedImage
      src={src}
      alt={alt}
      fill
      className={`object-cover ${className}`}
      sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw"
      quality={75} // جودة أقل للبطاقات
    />
  );
}

// مكون محسن لصور الـ Hero
export function HeroImage({
  src,
  alt,
  priority = true,
}: {
  src: string;
  alt: string;
  priority?: boolean;
}) {
  return (
    <OptimizedImage
      src={src}
      alt={alt}
      fill
      className="object-cover"
      sizes="100vw"
      quality={95}
      priority={priority}
    />
  );
}
