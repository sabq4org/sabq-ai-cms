'use client';

import React, { useState, useEffect, useRef } from 'react';
import { EditorErrorBoundary } from '@/components/ErrorBoundary';

interface ProgressiveLoaderProps {
  children: React.ReactNode;
  delay?: number;
  threshold?: number;
  fallback?: React.ReactNode;
  className?: string;
  componentName?: string;
}

const ProgressiveLoader: React.FC<ProgressiveLoaderProps> = ({
  children,
  delay = 0,
  threshold = 0.1,
  fallback,
  className = '',
  componentName = 'Component'
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [shouldLoad, setShouldLoad] = useState(delay === 0);
  const elementRef = useRef<HTMLDivElement>(null);

  // تأخير التحميل إذا كان مطلوباً
  useEffect(() => {
    if (delay > 0) {
      const timer = setTimeout(() => {
        setShouldLoad(true);
      }, delay);

      return () => clearTimeout(timer);
    }
  }, [delay]);

  // Intersection Observer للتحميل عند الحاجة
  useEffect(() => {
    if (!shouldLoad) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold }
    );

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => observer.disconnect();
  }, [shouldLoad, threshold]);

  const DefaultFallback = () => (
    <div className="flex items-center justify-center py-8">
      <div className="text-center">
        <div className="animate-pulse bg-gray-200 dark:bg-gray-700 h-4 w-32 rounded mb-2"></div>
        <div className="animate-pulse bg-gray-200 dark:bg-gray-700 h-3 w-24 rounded"></div>
      </div>
    </div>
  );

  return (
    <div ref={elementRef} className={className}>
      <EditorErrorBoundary context={`ProgressiveLoader-${componentName}`}>
        {shouldLoad && isVisible ? (
          children
        ) : (
          fallback || <DefaultFallback />
        )}
      </EditorErrorBoundary>
    </div>
  );
};

export default ProgressiveLoader;