/**
 * مكون لتجنب تحذيرات Hydration للمكونات التي تتطلب client-side rendering
 * Component to suppress hydration warnings for client-side only components
 */

'use client';

interface NoSSRProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export default function NoSSR({ children, fallback = null }: NoSSRProps) {
  return (
    <div suppressHydrationWarning>
      {typeof window !== 'undefined' ? children : fallback}
    </div>
  );
}
