/**
 * 🔘 زر سبق الموحد - Unified Sabq Button Component
 * مكون الزر الأساسي المستخدم في جميع أنحاء النظام
 */

'use client';

import React, { forwardRef } from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cn } from '@/lib/utils';
import { sabqTheme, cssClasses } from '@/lib/design-system/theme';
import { Loader2 } from 'lucide-react';

export interface SabqButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  // 🎭 متغيرات التصميم
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'ghost' | 'outline';
  
  // 📏 الأحجام
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  
  // 🎨 حالات خاصة
  loading?: boolean;       // حالة التحميل
  disabled?: boolean;      // معطل
  fullWidth?: boolean;     // عرض كامل
  
  // 🔗 نوع الزر
  asChild?: boolean;       // يعمل كـ wrapper لعنصر آخر
  href?: string;           // رابط (يحول الزر لـ link)
  
  // ✨ تأثيرات بصرية
  shadow?: boolean;        // ظل
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'full';
  
  // 🎯 أيقونات
  icon?: React.ReactNode;  // أيقونة
  iconPosition?: 'left' | 'right';
  
  children?: React.ReactNode;
}

const SabqButton = forwardRef<HTMLButtonElement, SabqButtonProps>(({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  fullWidth = false,
  asChild = false,
  href,
  shadow = false,
  rounded = 'md',
  icon,
  iconPosition = 'left',
  className,
  children,
  ...props
}, ref) => {
  
  // 🎨 بناء صفوف CSS بناءً على الخصائص
  const buttonClasses = cn(
    // الصفوف الأساسية
    cssClasses.button.base,
    
    // أحجام مختلفة
    {
      'px-2 py-1 text-xs min-h-[24px]': size === 'xs',
      [cssClasses.button.sizes.sm]: size === 'sm',
      [cssClasses.button.sizes.md]: size === 'md',
      [cssClasses.button.sizes.lg]: size === 'lg',
      'px-8 py-4 text-xl min-h-[56px]': size === 'xl'
    },
    
    // متغيرات التصميم
    {
      [cssClasses.button.variants.primary]: variant === 'primary',
      [cssClasses.button.variants.secondary]: variant === 'secondary',
      [cssClasses.button.variants.success]: variant === 'success',
      [cssClasses.button.variants.warning]: variant === 'warning',
      [cssClasses.button.variants.error]: variant === 'error',
      
      // زر شبح
      'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 focus:ring-gray-500': variant === 'ghost',
      
      // زر محاط
      'border-2 bg-transparent': variant === 'outline',
      'border-blue-600 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 focus:ring-blue-500': variant === 'outline' && !disabled,
    },
    
    // العرض الكامل
    {
      'w-full': fullWidth
    },
    
    // الحالات
    {
      'opacity-50 cursor-not-allowed': disabled || loading,
      'hover:scale-105 active:scale-95': !disabled && !loading,
    },
    
    // الظلال
    {
      'shadow-md hover:shadow-lg': shadow && variant !== 'ghost' && variant !== 'outline',
      'shadow-blue-500/25': shadow && variant === 'primary',
      'shadow-green-500/25': shadow && variant === 'success',
      'shadow-yellow-500/25': shadow && variant === 'warning',
      'shadow-red-500/25': shadow && variant === 'error'
    },
    
    // الزوايا
    {
      'rounded-none': rounded === 'none',
      'rounded-sm': rounded === 'sm',
      'rounded-lg': rounded === 'md',
      'rounded-xl': rounded === 'lg',
      'rounded-full': rounded === 'full'
    },
    
    className
  );

  // 📐 حجم الأيقونة حسب حجم الزر
  function getIconSize() {
    switch (size) {
      case 'xs': return 'w-3 h-3';
      case 'sm': return 'w-4 h-4';
      case 'md': return 'w-4 h-4';
      case 'lg': return 'w-5 h-5';
      case 'xl': return 'w-6 h-6';
      default: return 'w-4 h-4';
    }
  }

  // 🎯 محتوى الزر
  const renderContent = () => {
    const iconElement = loading ? (
      <Loader2 className={cn('animate-spin', getIconSize())} />
    ) : icon ? (
      <span className={getIconSize()}>{icon}</span>
    ) : null;

    if (!children && iconElement) {
      return iconElement;
    }

    return (
      <>
        {iconElement && iconPosition === 'left' && (
          <span className={cn(children ? 'mr-2' : '')}>{iconElement}</span>
        )}
        
        {children && (
          <span className={loading ? 'opacity-70' : ''}>{children}</span>
        )}
        
        {iconElement && iconPosition === 'right' && (
          <span className={cn(children ? 'ml-2' : '')}>{iconElement}</span>
        )}
      </>
    );
  };

  if (asChild) {
    return (
      <Slot ref={ref} className={buttonClasses} {...props}>
        {children}
      </Slot>
    );
  }

  if (href && !asChild) {
    return (
      <a href={href} className={buttonClasses} {...(disabled ? { 'aria-disabled': true } : {})}>
        {renderContent()}
      </a>
    );
  }

  return (
    <button
      ref={ref}
      className={buttonClasses}
      disabled={disabled || loading}
      {...props}
    >
      {renderContent()}
    </button>
  );
});

SabqButton.displayName = 'SabqButton';

export { SabqButton };