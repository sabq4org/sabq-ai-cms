import { useState } from 'react';
import Image from 'next/image';
import { ImageIcon } from 'lucide-react';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
  fill?: boolean;
  sizes?: string;
  quality?: number;
}

export default function OptimizedImage({
  src,
  alt,
  width,
  height,
  className = '',
  priority = false,
  fill = false,
  sizes,
  quality = 80,
}: OptimizedImageProps) {
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  const handleError = () => {
    if (process.env.NODE_ENV === 'development') {
      console.warn('🖼️ [OptimizedImage] Failed to load image:', src);
    }
    setError(true);
    setLoading(false);
  };

  const handleLoad = () => {
    if (process.env.NODE_ENV === 'development') {
      console.log('🖼️ [OptimizedImage] Successfully loaded image:', src);
    }
    setLoading(false);
  };

  // التحقق من صحة الرابط بطريقة أكثر دقة
  if (!src || src.trim() === '' || src === 'null' || src === 'undefined') {
    if (process.env.NODE_ENV === 'development') {
      console.warn('🖼️ [OptimizedImage] Invalid src provided:', src);
    }
    return (
      <div className={`flex items-center justify-center bg-gray-100 dark:bg-gray-800 ${className}`}>
        <div className="flex flex-col items-center justify-center text-gray-400 dark:text-gray-600">
          <ImageIcon className="w-8 h-8 mb-2" />
          <span className="text-xs">لا توجد صورة</span>
        </div>
      </div>
    );
  }

  // إذا كان هناك خطأ، اعرض fallback
  if (error) {
    return (
      <div className={`flex items-center justify-center bg-gray-100 dark:bg-gray-800 ${className}`}>
        <div className="flex flex-col items-center justify-center text-gray-400 dark:text-gray-600">
          <ImageIcon className="w-8 h-8 mb-2" />
          <span className="text-xs">لا يمكن تحميل الصورة</span>
        </div>
      </div>
    );
  }

  const wrapperClass = fill
    ? 'absolute inset-0 w-full h-full'
    : 'relative inline-block';

  return (
    <div className={wrapperClass}>
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800 animate-pulse">
          <div className="w-8 h-8 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
        </div>
      )}

      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        fill={fill}
        sizes={sizes}
        priority={priority}
        quality={quality}
        className={`${loading ? 'opacity-0' : 'opacity-100 transition-opacity duration-300'} ${className}`}
        onError={handleError}
        onLoad={handleLoad}
        placeholder="blur"
        blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
      />
    </div>
  );
}

// مكون خاص للأفاتار مع fallback نصي
export function AvatarImage({ 
  src, 
  alt, 
  name, 
  size = 40,
  className = '' 
}: {
  src: string;
  alt: string;
  name: string;
  size?: number;
  className?: string;
}) {
  const [error, setError] = useState(false);

  if (error || !src) {
    // عرض الأحرف الأولى من الاسم كبديل
    const initials = name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);

    return (
      <div 
        className={`
          flex items-center justify-center rounded-full 
          bg-gradient-to-br from-blue-500 to-purple-600 
          text-white font-semibold shadow-lg
          ${className}
        `}
        style={{ width: size, height: size, fontSize: size * 0.4 }}
      >
        {initials}
      </div>
    );
  }

  return (
    <div className={`relative ${className}`} style={{ width: size, height: size }}>
      <OptimizedImage
        src={src}
        alt={alt}
        width={size}
        height={size}
        className={`rounded-full object-cover shadow-lg`}
        quality={60} // تقليل الجودة للأفاتار
      />
    </div>
  );
}
