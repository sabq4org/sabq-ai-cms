'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { Maximize2, RotateCw } from 'lucide-react';

interface SmartImageDisplayProps {
  src: string;
  alt?: string;
  className?: string;
  priority?: boolean;
  sizes?: string;
  maxHeight?: number;
  showControls?: boolean;
}

interface ImageDimensions {
  width: number;
  height: number;
  aspectRatio: number;
  orientation: 'landscape' | 'portrait' | 'square';
}

export function SmartImageDisplay({
  src,
  alt = 'صورة',
  className = '',
  priority = false,
  sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px',
  maxHeight = 600,
  showControls = true
}: SmartImageDisplayProps) {
  const [dimensions, setDimensions] = useState<ImageDimensions | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [displayMode, setDisplayMode] = useState<'auto' | 'contain' | 'cover'>('auto');
  const [isLoading, setIsLoading] = useState(true);

  // تحديد أبعاد الصورة
  const handleImageLoad = (event: React.SyntheticEvent<HTMLImageElement>) => {
    const img = event.target as HTMLImageElement;
    const aspectRatio = img.naturalWidth / img.naturalHeight;
    
    let orientation: 'landscape' | 'portrait' | 'square';
    if (aspectRatio > 1.2) orientation = 'landscape';
    else if (aspectRatio < 0.8) orientation = 'portrait';
    else orientation = 'square';

    setDimensions({
      width: img.naturalWidth,
      height: img.naturalHeight,
      aspectRatio,
      orientation
    });
    setIsLoading(false);
  };

  // تحديد نمط العرض التلقائي
  useEffect(() => {
    if (dimensions) {
      if (dimensions.orientation === 'portrait' && dimensions.aspectRatio < 0.6) {
        setDisplayMode('contain');
      } else {
        setDisplayMode('cover');
      }
    }
  }, [dimensions]);

  // تحسين رابط Cloudinary
  const optimizeCloudinaryUrl = (url: string, width: number) => {
    try {
      if (!url.includes('res.cloudinary.com') || !url.includes('/upload/')) return url;
      const parts = url.split('/upload/');
      if (parts.length !== 2) return url;
      if (/\/upload\/(c_|w_|f_|q_)/.test(url)) return url;
      const transformations = `f_auto,q_auto,w_${width}`;
      return `${parts[0]}/upload/${transformations}/${parts[1]}`;
    } catch {
      return url;
    }
  };

  const getContainerStyle = () => {
    if (!dimensions) return {};

    const { orientation, aspectRatio } = dimensions;

    switch (orientation) {
      case 'portrait':
        if (aspectRatio < 0.5) {
          // صور عمودية جداً - نحدد العرض والارتفاع
          return {
            maxWidth: '400px',
            maxHeight: `${maxHeight}px`,
            aspectRatio: aspectRatio,
            margin: '0 auto'
          };
        } else {
          // صور عمودية عادية
          return {
            maxWidth: '500px',
            maxHeight: `${maxHeight}px`,
            aspectRatio: aspectRatio,
            margin: '0 auto'
          };
        }
      case 'square':
        return {
          maxWidth: '600px',
          aspectRatio: '1',
          margin: '0 auto'
        };
      case 'landscape':
      default:
        return {
          width: '100%',
          maxHeight: `${maxHeight}px`,
          aspectRatio: aspectRatio
        };
    }
  };

  const getImageObjectFit = () => {
    if (displayMode === 'contain') return 'object-contain';
    if (displayMode === 'cover') return 'object-cover';
    
    // تلقائي حسب نوع الصورة
    if (dimensions?.orientation === 'portrait' && dimensions.aspectRatio < 0.6) {
      return 'object-contain';
    }
    return 'object-cover';
  };

  return (
    <>
      <div className={cn('relative group', className)}>
        {/* حاوي الصورة */}
        <div 
          className="relative overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800"
          style={getContainerStyle()}
        >
          {/* مؤشر التحميل */}
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}

          {/* الصورة */}
          <Image
            src={optimizeCloudinaryUrl(src, 1200)}
            alt={alt}
            fill
            sizes={sizes}
            priority={priority}
            className={cn(
              'transition-all duration-300',
              getImageObjectFit(),
              isLoading && 'opacity-0'
            )}
            onLoad={handleImageLoad}
            onError={() => setIsLoading(false)}
          />

          {/* أدوات التحكم */}
          {showControls && dimensions && !isLoading && (
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <div className="flex gap-2">
                {/* تبديل نمط العرض للصور العمودية */}
                {dimensions.orientation === 'portrait' && (
                  <button
                    onClick={() => setDisplayMode(prev => 
                      prev === 'contain' ? 'cover' : 'contain'
                    )}
                    className="p-2 bg-black/50 text-white rounded-lg hover:bg-black/70 transition-colors"
                    title={displayMode === 'contain' ? 'ملء الإطار' : 'احتواء كامل'}
                  >
                    <RotateCw className="w-4 h-4" />
                  </button>
                )}

                {/* عرض بملء الشاشة */}
                <button
                  onClick={() => setIsFullscreen(true)}
                  className="p-2 bg-black/50 text-white rounded-lg hover:bg-black/70 transition-colors"
                  title="عرض بملء الشاشة"
                >
                  <Maximize2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* معلومات الصورة */}
          {dimensions && !isLoading && (
            <div className="absolute bottom-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <div className="px-2 py-1 bg-black/50 text-white text-xs rounded">
                {dimensions.width} × {dimensions.height}
                <span className="mx-1">•</span>
                {dimensions.orientation === 'portrait' ? 'عمودية' : 
                 dimensions.orientation === 'landscape' ? 'أفقية' : 'مربعة'}
              </div>
            </div>
          )}
        </div>

        {/* نصائح للصور العمودية */}
        {dimensions?.orientation === 'portrait' && dimensions.aspectRatio < 0.6 && (
          <div className="mt-2 text-sm text-gray-600 dark:text-gray-400 text-center">
            💡 صورة عمودية - يمكنك تغيير نمط العرض بالنقر على زر التدوير
          </div>
        )}
      </div>

      {/* عرض ملء الشاشة */}
      {isFullscreen && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
          <div className="relative max-w-full max-h-full">
            <Image
              src={optimizeCloudinaryUrl(src, 1920)}
              alt={alt}
              width={dimensions?.width || 800}
              height={dimensions?.height || 600}
              className="max-w-full max-h-full object-contain"
            />
            <button
              onClick={() => setIsFullscreen(false)}
              className="absolute top-4 right-4 p-2 bg-black/50 text-white rounded-lg hover:bg-black/70 transition-colors"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </>
  );
}

// مكون مبسط للاستخدام السريع
export function ResponsiveImage({ 
  src, 
  alt, 
  className,
  maxHeight = 400 
}: { 
  src: string; 
  alt?: string; 
  className?: string;
  maxHeight?: number;
}) {
  return (
    <SmartImageDisplay
      src={src}
      alt={alt}
      className={className}
      maxHeight={maxHeight}
      showControls={false}
    />
  );
}

