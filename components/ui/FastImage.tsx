"use client";

import Image from "next/image";
import React, { useState } from "react";

interface FastImageProps {
  src?: string | null;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
  fill?: boolean;
  sizes?: string;
  quality?: number;
}

export default function FastImage({
  src,
  alt,
  width = 800,
  height = 600,
  className = "",
  priority = false,
  fill = false,
  sizes,
  quality = 75,
}: FastImageProps) {
  const [hasError, setHasError] = useState(false);

  // معالجة بسيطة وسريعة للصور
  const imageUrl = React.useMemo(() => {
    if (!src || src.trim() === "" || hasError) {
      return "/images/placeholder-featured.jpg";
    }
    return src;
  }, [src, hasError]);

  const handleError = () => {
    setHasError(true);
  };

  return (
    <>
      <Image
        src={imageUrl}
        alt={alt}
        fill={fill}
        width={fill ? undefined : width}
        height={fill ? undefined : height}
        sizes={sizes || "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"}
        quality={quality}
        priority={priority}
        className={`${className} object-cover transition-opacity duration-200`}
        onError={handleError}
        placeholder="blur"
        blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
      />
    </>
  );
}
