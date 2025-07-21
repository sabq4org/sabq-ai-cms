'use client';

import { usePathname } from 'next/navigation';
import Header from './Header';

export default function ConditionalHeader() {
  const pathname = usePathname();
  
  // إخفاء الهيدر في لوحة التحكم فقط
  const shouldHideHeader = pathname.startsWith('/dashboard');
  
  if (shouldHideHeader) {
    return null;
  }
  
  return <Header />;
}
