'use client';

import React, { useState, useRef, useEffect } from 'react';
import CompactCategoryCard from './CompactCategoryCard';

interface LazyCompactCategoryCardProps {
  article: any;
  darkMode?: boolean;
  size?: 'small' | 'medium' | 'large';
  showExcerpt?: boolean;
  className?: string;
}

export default function LazyCompactCategoryCard(props: LazyCompactCategoryCardProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [hasIntersected, setHasIntersected] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasIntersected) {
          setIsVisible(true);
          setHasIntersected(true);
          // فصل الـ observer بعد التحميل
          if (cardRef.current) {
            observer.unobserve(cardRef.current);
          }
        }
      },
      {
        rootMargin: '50px 0px', // تحميل قبل 50px من الظهور
        threshold: 0.1
      }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => {
      if (cardRef.current) {
        observer.unobserve(cardRef.current);
      }
    };
  }, [hasIntersected]);

  // إذا لم يتم رؤية البطاقة بعد، اعرض placeholder
  if (!isVisible) {
    return (
      <div 
        ref={cardRef}
        className={`${props.className} ${
          props.darkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-100 border-gray-200'
        } border rounded-xl animate-pulse`}
        style={{ 
          height: props.size === 'small' ? '80px' : props.size === 'large' ? '120px' : '100px' 
        }}
      >
        <div className="flex p-3 gap-3 h-full">
          {/* مكان الصورة */}
          <div className={`${
            props.size === 'small' ? 'w-16 h-16' : 
            props.size === 'large' ? 'w-24 h-24' : 'w-20 h-20'
          } ${
            props.darkMode ? 'bg-gray-700' : 'bg-gray-200'
          } rounded-lg flex-shrink-0`}></div>
          
          {/* مكان النص */}
          <div className="flex-1 space-y-2">
            <div className={`h-4 ${
              props.darkMode ? 'bg-gray-700' : 'bg-gray-200'
            } rounded w-full`}></div>
            <div className={`h-4 ${
              props.darkMode ? 'bg-gray-700' : 'bg-gray-200'
            } rounded w-3/4`}></div>
            <div className={`h-3 ${
              props.darkMode ? 'bg-gray-700' : 'bg-gray-200'
            } rounded w-1/2`}></div>
          </div>
        </div>
      </div>
    );
  }

  // اعرض البطاقة الفعلية بعد أن تصبح مرئية
  return <CompactCategoryCard {...props} />;
}