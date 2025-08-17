/**
 * 🃏 بطاقة سبق الموحدة - Unified Sabq Card Component
 * مكون البطاقة الأساسي المستخدم في جميع أنحاء النظام
 */

'use client';

import React, { forwardRef } from 'react';
import { cn } from '@/lib/utils';
import { sabqTheme, cssClasses } from '@/lib/design-system/theme';

export interface SabqCardProps extends React.HTMLAttributes<HTMLDivElement> {
  // 🎭 متغيرات التصميم
  variant?: 'default' | 'elevated' | 'outlined' | 'ghost';
  
  // 📏 الأحجام
  size?: 'sm' | 'md' | 'lg' | 'xl';
  
  // 🎨 حالات خاصة
  interactive?: boolean;   // قابلة للتفاعل (hover, click)
  loading?: boolean;       // حالة التحميل
  disabled?: boolean;      // معطلة
  
  // 🌈 ألوان مخصصة
  color?: 'default' | 'primary' | 'success' | 'warning' | 'error';
  
  // 📱 تصميم متجاوب
  responsive?: boolean;
  
  // ✨ تأثيرات بصرية
  glow?: boolean;         // وهج خفيف
  gradient?: boolean;     // خلفية متدرجة
  
  children: React.ReactNode;
}

const SabqCard = forwardRef<HTMLDivElement, SabqCardProps>(({
  variant = 'default',
  size = 'md',
  interactive = false,
  loading = false,
  disabled = false,
  color = 'default',
  responsive = true,
  glow = false,
  gradient = false,
  className,
  children,
  ...props
}, ref) => {
  
  // 🎨 بناء صفوف CSS بناءً على الخصائص
  const cardClasses = cn(
    // الصفوف الأساسية
    cssClasses.card.base,
    
    // أحجام مختلفة
    {
      'p-3': size === 'sm',
      'p-4': size === 'md', 
      'p-6': size === 'lg',
      'p-8': size === 'xl'
    },
    
    // متغيرات التصميم
    {
      // بطاقة عادية
      [cssClasses.card.light]: variant === 'default',
      [cssClasses.card.dark]: variant === 'default',
      
      // بطاقة مرفوعة
      [cssClasses.card.elevated]: variant === 'elevated',
      'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700': variant === 'elevated',
      
      // بطاقة محاطة
      'bg-transparent border-2': variant === 'outlined',
      'border-gray-300 dark:border-gray-600': variant === 'outlined' && color === 'default',
      'border-blue-300 dark:border-blue-600': variant === 'outlined' && color === 'primary',
      'border-green-300 dark:border-green-600': variant === 'outlined' && color === 'success',
      'border-yellow-300 dark:border-yellow-600': variant === 'outlined' && color === 'warning',
      'border-red-300 dark:border-red-600': variant === 'outlined' && color === 'error',
      
      // بطاقة شبح
      'bg-transparent border-transparent': variant === 'ghost',
      'hover:bg-gray-50 dark:hover:bg-gray-800': variant === 'ghost' && interactive
    },
    
    // ألوان مخصصة
    {
      'bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800': color === 'primary' && variant !== 'outlined' && variant !== 'ghost',
      'bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-800': color === 'success' && variant !== 'outlined' && variant !== 'ghost',
      'bg-yellow-50 dark:bg-yellow-900/10 border-yellow-200 dark:border-yellow-800': color === 'warning' && variant !== 'outlined' && variant !== 'ghost',
      'bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800': color === 'error' && variant !== 'outlined' && variant !== 'ghost'
    },
    
    // التفاعل
    {
      'cursor-pointer transform transition-transform hover:scale-[1.02]': interactive && !disabled && !loading,
      'hover:shadow-lg': interactive && !disabled && variant !== 'ghost',
      'cursor-not-allowed opacity-60': disabled,
      'animate-pulse': loading
    },
    
    // تصميم متجاوب
    {
      'w-full': responsive,
      'max-w-none sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl': responsive && size === 'sm',
      'max-w-none sm:max-w-md md:max-w-lg lg:max-w-xl xl:max-w-2xl': responsive && size === 'md',
      'max-w-none sm:max-w-lg md:max-w-xl lg:max-w-2xl xl:max-w-4xl': responsive && size === 'lg',
      'max-w-none sm:max-w-xl md:max-w-2xl lg:max-w-4xl xl:max-w-6xl': responsive && size === 'xl'
    },
    
    // تأثيرات بصرية
    {
      'ring-1 ring-blue-500/20 shadow-blue-500/10': glow && color === 'primary',
      'ring-1 ring-green-500/20 shadow-green-500/10': glow && color === 'success',
      'ring-1 ring-yellow-500/20 shadow-yellow-500/10': glow && color === 'warning',
      'ring-1 ring-red-500/20 shadow-red-500/10': glow && color === 'error',
      
      // خلفيات متدرجة
      'bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/20': gradient && color === 'primary',
      'bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-900/20 dark:to-emerald-900/20': gradient && color === 'success',
      'bg-gradient-to-br from-yellow-50 to-orange-100 dark:from-yellow-900/20 dark:to-orange-900/20': gradient && color === 'warning',
      'bg-gradient-to-br from-red-50 to-pink-100 dark:from-red-900/20 dark:to-pink-900/20': gradient && color === 'error'
    },
    
    className
  );

  return (
    <div
      ref={ref}
      className={cardClasses}
      {...props}
    >
      {loading ? (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="mr-3 text-gray-600 dark:text-gray-400">جاري التحميل...</span>
        </div>
      ) : (
        children
      )}
    </div>
  );
});

SabqCard.displayName = 'SabqCard';

export default SabqCard;