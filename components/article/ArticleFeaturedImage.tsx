'use client';

import React from 'react';
import OptimizedImage from '@/components/ui/optimized-image';
import { IMAGE_CONFIG } from './ImageDisplayConfig';

interface ArticleFeaturedImageProps {
  imageUrl: string;
  title: string;
  category?: {
    name: string;
    color?: string;
    icon?: string;
  };
}

export default function ArticleFeaturedImage({ 
  imageUrl, 
  title, 
  category 
}: ArticleFeaturedImageProps) {
  
  // عرض بناءً على الوضع المحدد في الإعدادات
  switch (IMAGE_CONFIG.DISPLAY_MODE) {
    case 'default':
      return (
        <div className="relative w-full px-0 sm:px-6 lg:px-8">
          {/* الصورة الرئيسية مع إطار وظل */}
          <div className="relative rounded-xl overflow-hidden shadow-xl border border-gray-200 dark:border-gray-700">
            <OptimizedImage
              src={imageUrl}
              alt={title}
              className="w-full object-cover max-h-[250px] sm:max-h-[400px] lg:max-h-[500px]"
              priority={true}
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 90vw, 1024px"
            />
            {/* تدرج خفيف في الأسفل */}
            <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
          </div>
        </div>
      );

    case 'blur-overlay':
      return (
        <div className="article-featured-image relative h-[400px] sm:h-[500px] lg:h-[600px] w-full overflow-hidden bg-gray-900 dark:bg-black">
          {/* صورة الخلفية المموهة */}
          <img
            src={imageUrl}
            alt=""
            className="absolute inset-0 w-full h-full object-cover blur-2xl scale-110 opacity-60"
            loading="lazy"
          />
          
          {/* الطبقة الداكنة فوق الخلفية المموهة */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/60" />
          
          {/* حاوي الصورة الرئيسية */}
          <div className="relative z-10 h-full flex items-center justify-center p-4 sm:p-8">
            <div className="max-w-4xl w-full h-full flex items-center justify-center">
              <OptimizedImage
                src={imageUrl}
                alt={title}
                className="max-w-full max-h-full rounded-lg shadow-2xl transition-all duration-500 hover:scale-[1.02]"
                aspectRatio="auto"
                priority={true}
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 90vw, 1200px"
              />
            </div>
          </div>
          
          {/* معلومات إضافية اختيارية على الصورة */}
          {category && (
            <div className="absolute bottom-0 left-0 right-0 p-6 z-20">
              <div className="max-w-4xl mx-auto">
                <span 
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium text-white backdrop-blur-md"
                  style={{ backgroundColor: `${category.color || '#1a73e8'}99` }}
                >
                  {category.icon && <span>{category.icon}</span>}
                  {category.name}
                </span>
              </div>
            </div>
          )}
        </div>
      );
      
    case 'aspect-ratio':
      return (
        <div className="article-featured-image w-full bg-gray-100 dark:bg-gray-800">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="relative rounded-xl overflow-hidden shadow-xl">
              <OptimizedImage
                src={imageUrl}
                alt={title}
                className="w-full"
                aspectRatio={IMAGE_CONFIG.ASPECT_RATIO as any}
                priority={true}
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 90vw, 1200px"
              />
              
              {/* تراكب التصنيف */}
              {category && (
                <div className="absolute bottom-4 left-4">
                  <span 
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium text-white backdrop-blur-md"
                    style={{ backgroundColor: `${category.color || '#1a73e8'}CC` }}
                  >
                    {category.icon && <span>{category.icon}</span>}
                    {category.name}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      );
      
    case 'fullwidth':
      return (
        <div className="article-featured-image relative h-[300px] sm:h-[400px] md:h-[500px] lg:h-[60vh] w-full bg-gray-200 dark:bg-gray-800">
          <OptimizedImage
            src={imageUrl}
            alt={title}
            className="w-full h-full object-cover"
            priority={true}
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 z-10" />
        </div>
      );
      
    default:
      return null;
  }
}