import { useEffect, useRef, useState } from 'react';

interface UseFeaturedCarouselOptions {
  length: number;
  autoPlayInterval?: number; // ms
  paused?: boolean;
}

export function useFeaturedCarousel({ length, autoPlayInterval = 5000, paused = false }: UseFeaturedCarouselOptions) {
  const [index, setIndex] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const isReducedMotion = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  useEffect(() => {
    if (paused || isReducedMotion || length <= 1) return;
    intervalRef.current && clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setIndex(prev => (prev + 1) % length);
    }, autoPlayInterval);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [paused, isReducedMotion, length, autoPlayInterval]);

  const goTo = (i: number) => setIndex(((i % length) + length) % length);
  const next = () => goTo(index + 1);
  const prev = () => goTo(index - 1 + length);

  return { index, setIndex: goTo, next, prev, isReducedMotion };
}
