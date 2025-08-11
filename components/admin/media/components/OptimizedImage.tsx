"use client";
import Image from 'next/image';
import { memo } from 'react';

interface Props {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  sizeHint?: number; // target width for transformation
  className?: string;
  fill?: boolean;
  priority?: boolean;
}

// بسيط: إدخال تحويل Cloudinary إذا كان الرابط Cloudinary
function transform(src: string, width?: number) {
  if (!src) return src;
  if (!src.includes('/upload/')) return src; // ليس رابط Cloudinary قياسي
  const w = width || 400;
  // إدخال f_auto,q_auto,w_{w}
  return src.replace('/upload/', `/upload/f_auto,q_auto,w_${w}/`);
}

const OptimizedImage = ({ src, alt, width, height, sizeHint, className, fill, priority }: Props) => {
  const optimized = transform(src, sizeHint || width);
  if (fill) {
    return (
      <Image
        src={optimized}
        alt={alt}
        fill
        sizes="(max-width:768px) 50vw, (max-width:1200px) 33vw, 200px"
        className={className}
        priority={priority}
      />
    );
  }
  return (
    <Image
      src={optimized}
      alt={alt}
      width={width || 400}
      height={height || 300}
      sizes="(max-width:768px) 50vw, (max-width:1200px) 25vw, 200px"
      className={className}
      priority={priority}
    />
  );
};

export default memo(OptimizedImage);
