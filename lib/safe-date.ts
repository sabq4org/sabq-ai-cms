'use client';

/**
 * دوال آمنة للتعامل مع التواريخ لتجنب Hydration Mismatch
 */

import React from 'react';
import { useHydrated } from '@/components/SafeHydration';

/**
 * تحويل التاريخ إلى نص آمن
 * يعرض placeholder أثناء SSR
 */
export function formatDateSafe(
  date: string | Date | null | undefined,
  options?: Intl.DateTimeFormatOptions,
  placeholder = '---'
): string {
  if (!date) return placeholder;
  
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString('ar-SA', options);
  } catch {
    return placeholder;
  }
}

/**
 * تحويل الوقت إلى نص آمن
 */
export function formatTimeSafe(
  date: string | Date | null | undefined,
  options?: Intl.DateTimeFormatOptions,
  placeholder = '--:--'
): string {
  if (!date) return placeholder;
  
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleTimeString('ar-SA', options);
  } catch {
    return placeholder;
  }
}

/**
 * الحصول على الوقت النسبي بشكل آمن
 */
export function getRelativeTimeSafe(
  date: string | Date | null | undefined,
  placeholder = 'منذ فترة'
): string {
  if (!date) return placeholder;
  
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const now = new Date();
    const diffInMs = now.getTime() - dateObj.getTime();
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);
    
    if (diffInMinutes < 1) return 'للتو';
    if (diffInMinutes < 60) return `منذ ${diffInMinutes} دقيقة`;
    if (diffInHours < 24) return `منذ ${diffInHours} ساعة`;
    if (diffInDays < 7) return `منذ ${diffInDays} يوم`;
    
    return formatDateSafe(date, {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } catch {
    return placeholder;
  }
}

/**
 * مكون لعرض التاريخ بشكل آمن
 */
export function SafeDate({ 
  date, 
  format = 'date',
  placeholder = '---',
  options,
  className = ''
}: {
  date: string | Date | null | undefined;
  format?: 'date' | 'time' | 'datetime' | 'relative';
  placeholder?: string;
  options?: Intl.DateTimeFormatOptions;
  className?: string;
}) {
  const isHydrated = useHydrated();
  
  if (!isHydrated) {
    return React.createElement('span', { className }, placeholder);
  }
  
  let formattedDate = placeholder;
  
  switch (format) {
    case 'time':
      formattedDate = formatTimeSafe(date, options, placeholder);
      break;
    case 'datetime':
      formattedDate = `${formatDateSafe(date, options, placeholder)} ${formatTimeSafe(date, options, placeholder)}`;
      break;
    case 'relative':
      formattedDate = getRelativeTimeSafe(date, placeholder);
      break;
    default:
      formattedDate = formatDateSafe(date, options, placeholder);
  }
  
  return React.createElement('span', { className }, formattedDate);
} 