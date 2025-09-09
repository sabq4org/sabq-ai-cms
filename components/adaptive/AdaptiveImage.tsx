/**
 * مكون صورة تكيفي يحسن التحميل حسب الجهاز والشبكة
 */

import React, { useMemo, useState, useEffect } from 'react';
import { useEnhancedDeviceDetection } from '@/lib/enhanced-device-detector';

interface AdaptiveImageProps {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
  sizes?: string;
  onLoad?: () => void;
  onError?: () => void;
  aspectRatio?: string;
  objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';
}

/**
 * مكون الصورة التكيفية
 */
export function AdaptiveImage({
  src,
  alt,
  className = '',
  priority = false,
  sizes,
  onLoad,
  onError,
  aspectRatio = '16/9',
  objectFit = 'cover'
}: AdaptiveImageProps) {
  const {
    deviceType,
    subType,
    network,
    features,
    loadingStrategy,
    shouldReduceData,
    isOffline
  } = useEnhancedDeviceDetection();
  
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isInView, setIsInView] = useState(priority);
  
  // تحديد جودة الصورة بناءً على الشبكة والجهاز
  const imageQuality = useMemo(() => {
    if (isOffline) return 'placeholder';
    if (shouldReduceData) return 'low';
    
    switch (loadingStrategy?.imageQuality) {
      case 'low':
        return 'q_40';
      case 'medium':
        return 'q_70';
      case 'high':
        return 'q_90';
      case 'auto':
      default:
        // تحديد تلقائي بناءً على الشبكة
        if (network?.effectiveType === '2g') return 'q_40';
        if (network?.effectiveType === '3g') return 'q_60';
        if (network?.effectiveType === '4g') return 'q_80';
        if (network?.effectiveType === '5g') return 'q_90';
        return 'q_70';
    }
  }, [network, loadingStrategy, shouldReduceData, isOffline]);
  
  // تحديد حجم الصورة بناءً على الجهاز
  const imageSize = useMemo(() => {
    const baseWidth = {
      'phone': 400,
      'phablet': 600,
      'small-tablet': 800,
      'large-tablet': 1024,
      'laptop': 1366,
      'desktop': 1920,
      'foldable': 800
    };
    
    const width = baseWidth[subType as keyof typeof baseWidth] || 1024;
    
    // تقليل الحجم للشبكات البطيئة
    if (shouldReduceData) {
      return Math.round(width * 0.5);
    }
    
    return width;
  }, [subType, shouldReduceData]);
  
  // تحديد صيغة الصورة
  const imageFormat = useMemo(() => {
    if (!features) return 'auto';
    
    if (features.avif) return 'f_avif';
    if (features.webp) return 'f_webp';
    return 'f_auto';
  }, [features]);
  
  // بناء رابط الصورة المحسن
  const optimizedSrc = useMemo(() => {
    if (!src) return '';
    
    // للصور من Cloudinary
    if (src.includes('cloudinary.com')) {
      const transformations = [
        imageQuality !== 'placeholder' && imageQuality,
        imageFormat,
        `w_${imageSize}`,
        'c_limit',
        'dpr_auto'
      ].filter(Boolean).join(',');
      
      return src.replace('/upload/', `/upload/${transformations}/`);
    }
    
    // للصور المحلية أو من مصادر أخرى
    const params = new URLSearchParams({
      w: imageSize.toString(),
      q: imageQuality.replace('q_', '')
    });
    
    return `${src}?${params.toString()}`;
  }, [src, imageQuality, imageFormat, imageSize]);
  
  // Placeholder للتحميل
  const placeholderSrc = useMemo(() => {
    if (src.includes('cloudinary.com')) {
      return src.replace('/upload/', '/upload/w_50,q_10,f_auto,e_blur:1000/');
    }
    return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 ${aspectRatio.replace('/', ' ')}'%3E%3Crect width='100%25' height='100%25' fill='%23f0f0f0'/%3E%3C/svg%3E`;
  }, [src, aspectRatio]);
  
  // Intersection Observer للـ lazy loading
  useEffect(() => {
    if (priority || !features?.intersectionObserver || !loadingStrategy?.lazyLoading) {
      setIsInView(true);
      return;
    }
    
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.disconnect();
          }
        });
      },
      {
        rootMargin: deviceType === 'mobile' ? '50px' : '100px',
        threshold: 0.01
      }
    );
    
    const element = document.querySelector(`[data-image-id="${src}"]`);
    if (element) {
      observer.observe(element);
    }
    
    return () => observer.disconnect();
  }, [src, priority, features, loadingStrategy, deviceType]);
  
  // معالج تحميل الصورة
  const handleImageLoad = () => {
    setImageLoaded(true);
    onLoad?.();
  };
  
  // معالج خطأ الصورة
  const handleImageError = () => {
    setImageError(true);
    onError?.();
  };
  
  // تحديد loading attribute
  const loadingAttr = priority ? 'eager' : loadingStrategy?.lazyLoading ? 'lazy' : 'auto';
  
  // تحديد fetchpriority
  const fetchPriority = priority ? 'high' : 'auto';
  
  // حالة عدم الاتصال
  if (isOffline && !imageLoaded) {
    return (
      <div 
        className={`adaptive-image-offline ${className}`}
        style={{ aspectRatio }}
      >
        <svg viewBox="0 0 24 24" width="48" height="48">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
        </svg>
        <p>غير متصل بالإنترنت</p>
      </div>
    );
  }
  
  // حالة الخطأ
  if (imageError) {
    return (
      <div 
        className={`adaptive-image-error ${className}`}
        style={{ aspectRatio }}
      >
        <svg viewBox="0 0 24 24" width="48" height="48">
          <path d="M21 5v6.59l-3-3.01-4 4.01-4-4-4 4-3-3.01V5c0-1.1.9-2 2-2h14c1.1 0 2 .9 2 2zm-3 6.42l3 3.01V19c0 1.1-.9 2-2 2H5c-1.1 0-2-.9-2-2v-6.58l3 2.99 4-4 4 4 4-3.99z" />
        </svg>
        <p>فشل تحميل الصورة</p>
      </div>
    );
  }
  
  return (
    <div 
      className={`adaptive-image-container ${className}`}
      data-image-id={src}
      style={{ aspectRatio }}
    >
      {/* Placeholder blur */}
      {!imageLoaded && (
        <img
          src={placeholderSrc}
          alt=""
          className="adaptive-image-placeholder"
          aria-hidden="true"
        />
      )}
      
      {/* الصورة الفعلية */}
      {isInView && (
        <picture>
          {/* AVIF للمتصفحات الحديثة */}
          {features?.avif && (
            <source
              srcSet={optimizedSrc.replace(/f_\w+/, 'f_avif')}
              type="image/avif"
            />
          )}
          
          {/* WebP للمتصفحات التي تدعمها */}
          {features?.webp && (
            <source
              srcSet={optimizedSrc.replace(/f_\w+/, 'f_webp')}
              type="image/webp"
            />
          )}
          
          {/* الصورة الأساسية */}
          <img
            src={optimizedSrc}
            alt={alt}
            className={`adaptive-image ${imageLoaded ? 'loaded' : 'loading'}`}
            loading={loadingAttr as any}
            fetchpriority={fetchPriority as any}
            onLoad={handleImageLoad}
            onError={handleImageError}
            sizes={sizes}
            style={{ objectFit }}
          />
        </picture>
      )}
    </div>
  );
}

/**
 * مكون معرض الصور التكيفي
 */
export function AdaptiveImageGallery({
  images,
  columns = 'auto',
  gap = '1rem'
}: {
  images: Array<{ src: string; alt: string; id: string }>;
  columns?: number | 'auto';
  gap?: string;
}) {
  const { deviceType, loadingStrategy } = useEnhancedDeviceDetection();
  
  // تحديد عدد الأعمدة بناءً على الجهاز
  const gridColumns = useMemo(() => {
    if (columns !== 'auto') return columns;
    
    switch (deviceType) {
      case 'mobile':
        return 1;
      case 'tablet':
        return 2;
      case 'desktop':
      default:
        return 3;
    }
  }, [deviceType, columns]);
  
  // تحديد عدد الصور المحملة مسبقاً
  const priorityCount = loadingStrategy?.prefetchCount || 3;
  
  return (
    <div
      className="adaptive-image-gallery"
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${gridColumns}, 1fr)`,
        gap
      }}
    >
      {images.map((image, index) => (
        <AdaptiveImage
          key={image.id}
          src={image.src}
          alt={image.alt}
          priority={index < priorityCount}
          aspectRatio="1/1"
          objectFit="cover"
        />
      ))}
    </div>
  );
}

// تصدير الأنماط CSS
export const adaptiveImageStyles = `
.adaptive-image-container {
  position: relative;
  overflow: hidden;
  background: #f5f5f5;
}

.adaptive-image-placeholder {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  filter: blur(10px);
  transform: scale(1.1);
}

.adaptive-image {
  width: 100%;
  height: 100%;
  object-fit: inherit;
  transition: opacity 0.3s ease-in-out;
}

.adaptive-image.loading {
  opacity: 0;
}

.adaptive-image.loaded {
  opacity: 1;
}

.adaptive-image-offline,
.adaptive-image-error {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: #f5f5f5;
  color: #666;
  padding: 2rem;
  text-align: center;
}

.adaptive-image-offline svg,
.adaptive-image-error svg {
  fill: currentColor;
  margin-bottom: 1rem;
}

/* تحسينات للأجهزة باللمس */
.has-touch .adaptive-image-container {
  -webkit-tap-highlight-color: transparent;
}

/* تحسينات للشاشات عالية الدقة */
.high-dpi .adaptive-image {
  image-rendering: -webkit-optimize-contrast;
  image-rendering: crisp-edges;
}

/* تعطيل الحركات للشبكات البطيئة */
.network-2g .adaptive-image,
.network-3g .adaptive-image,
.data-saver .adaptive-image {
  transition: none;
}

/* تحسينات للطباعة */
@media print {
  .adaptive-image-placeholder {
    display: none;
  }
  
  .adaptive-image {
    opacity: 1 !important;
  }
}
`;
