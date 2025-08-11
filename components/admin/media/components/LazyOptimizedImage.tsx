"use client";
import React, { useRef, useState, useEffect } from 'react';
import OptimizedImage from './OptimizedImage';
import { cn } from '@/lib/utils';

interface Props {
  src: string;
  alt: string;
  sizeHint?: number;
  className?: string;
  // pass-through for fill or fixed dimensions
  fill?: boolean;
  width?: number;
  height?: number;
  priority?: boolean;
  skeletonClassName?: string;
}

const LazyOptimizedImage: React.FC<Props> = ({ src, alt, sizeHint, className, fill, width, height, priority, skeletonClassName }) => {
  const ref = useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!ref.current) return;
    const el = ref.current;
    if (priority) { // load immediately if priority
      setVisible(true);
      return;
    }
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setVisible(true);
            observer.disconnect();
          }
        });
      },
      { rootMargin: '200px 0px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [priority]);

  return (
    <div ref={ref} className={cn('relative w-full h-full', className)}>
      {!visible && (
        <div className={cn('absolute inset-0 animate-pulse rounded-md bg-gray-200 dark:bg-gray-700', skeletonClassName)} />
      )}
      {visible && (
        <OptimizedImage
          src={src}
          alt={alt}
          sizeHint={sizeHint}
          className={cn('transition-opacity duration-300 object-contain', loaded ? 'opacity-100' : 'opacity-0')}
          fill={fill}
          width={width}
          height={height}
          priority={priority}
          // @ts-ignore next/image onLoadingComplete
          onLoadingComplete={() => setLoaded(true)}
        />
      )}
    </div>
  );
};

export default LazyOptimizedImage;
