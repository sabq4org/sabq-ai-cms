'use client';

import { cn } from '@/lib/utils';
import { usePathname } from 'next/navigation';

interface ContentWrapperProps {
  children: React.ReactNode;
  className?: string;
  noPadding?: boolean;
}

export default function ContentWrapper({ 
  children, 
  className,
  noPadding = false 
}: ContentWrapperProps) {
  const pathname = usePathname();
  
  // تحديد نوع الصفحة
  const isDashboard = pathname?.startsWith('/dashboard');
  const isMobilePage = pathname?.includes('/mobile');
  
  // اختيار الكلاس المناسب بناءً على نوع الصفحة
  const wrapperClass = isDashboard 
    ? 'dashboard-content-wrapper' 
    : 'page-content-wrapper';
  
  // إذا كان noPadding = true، لا نضيف padding
  if (noPadding) {
    return <>{children}</>;
  }
  
  return (
    <div className={cn(wrapperClass, className)}>
      {children}
    </div>
  );
} 