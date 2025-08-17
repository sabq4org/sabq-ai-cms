'use client';

import React, { useState, useEffect, useRef } from 'react';
import OptimizedImage from '@/components/OptimizedImage';
import { EditorErrorBoundary } from '@/components/ErrorBoundary';

interface LazyImageGridProps {
  images: Array<{
    id: string;
    src: string;
    alt: string;
    title?: string;
    link?: string;
  }>;
  columns?: number;
  gap?: number;
  className?: string;
  onImageClick?: (image: any) => void;
  loadingPlaceholder?: React.ReactNode;
}

const LazyImageGrid: React.FC<LazyImageGridProps> = ({
  images,
  columns = 3,
  gap = 4,
  className = '',
  onImageClick,
  loadingPlaceholder
}) => {
  const [visibleImages, setVisibleImages] = useState<Set<string>>(new Set());
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());
  const observerRef = useRef<IntersectionObserver | null>(null);
  const imageRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  // إعداد Intersection Observer
  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const imageId = entry.target.getAttribute('data-image-id');
            if (imageId) {
              setVisibleImages(prev => new Set([...prev, imageId]));
              observerRef.current?.unobserve(entry.target);
            }
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: '50px'
      }
    );

    return () => {
      observerRef.current?.disconnect();
    };
  }, []);

  // مراقبة العناصر الجديدة
  useEffect(() => {
    imageRefs.current.forEach((element, imageId) => {
      if (!visibleImages.has(imageId) && observerRef.current) {
        observerRef.current.observe(element);
      }
    });
  }, [images, visibleImages]);

  // معالج تحميل الصورة
  const handleImageLoad = (imageId: string) => {
    setLoadedImages(prev => new Set([...prev, imageId]));
  };

  // معالج خطأ الصورة
  const handleImageError = (imageId: string, error: Error) => {
    console.warn(`Failed to load image ${imageId}:`, error);
  };

  // تعيين مرجع العنصر
  const setImageRef = (imageId: string, element: HTMLDivElement | null) => {
    if (element) {
      imageRefs.current.set(imageId, element);
    } else {
      imageRefs.current.delete(imageId);
    }
  };

  const gridCols = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
    5: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5',
    6: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6'
  };

  const gapClass = `gap-${gap}`;

  const DefaultPlaceholder = () => (
    <div className="aspect-video bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse flex items-center justify-center">
      <div className="text-gray-400 dark:text-gray-500 text-sm">جاري التحميل...</div>
    </div>
  );

  return (
    <EditorErrorBoundary context="LazyImageGrid">
      <div className={`grid ${gridCols[columns as keyof typeof gridCols] || gridCols[3]} ${gapClass} ${className}`}>
        {images.map((image) => (
          <div
            key={image.id}
            ref={(el) => setImageRef(image.id, el)}
            data-image-id={image.id}
            className="relative group cursor-pointer"
            onClick={() => onImageClick?.(image)}
          >
            {visibleImages.has(image.id) ? (
              <div className="relative overflow-hidden rounded-lg">
                <OptimizedImage
                  src={image.src}
                  alt={image.alt}
                  className="w-full aspect-video object-cover transition-transform duration-300 group-hover:scale-105"
                  onLoad={() => handleImageLoad(image.id)}
                  onError={(error) => handleImageError(image.id, error)}
                  lazy={true}
                />
                
                {/* طبقة التفاعل */}
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="bg-white dark:bg-gray-800 rounded-full p-2 shadow-lg">
                      <svg className="w-6 h-6 text-gray-700 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* العنوان */}
                {image.title && (
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4">
                    <h3 className="text-white text-sm font-medium line-clamp-2">
                      {image.title}
                    </h3>
                  </div>
                )}

                {/* مؤشر التحميل */}
                {!loadedImages.has(image.id) && (
                  <div className="absolute inset-0 bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                  </div>
                )}
              </div>
            ) : (
              loadingPlaceholder || <DefaultPlaceholder />
            )}
          </div>
        ))}
      </div>
    </EditorErrorBoundary>
  );
};

export default LazyImageGrid;