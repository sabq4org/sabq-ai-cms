/**
 * 📝 حقل الإدخال الموحد - Unified Sabq Input Component
 * مكون حقل الإدخال الأساسي المستخدم في جميع أنحاء النظام
 */

'use client';

import React, { forwardRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { sabqTheme, cssClasses } from '@/lib/design-system/theme';
import { Eye, EyeOff, Search, AlertCircle, CheckCircle } from 'lucide-react';

export interface SabqInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  // 🏷️ التسمية والوصف
  label?: string;
  description?: string;
  error?: string;
  success?: string;
  
  // 📏 الأحجام
  size?: 'sm' | 'md' | 'lg';
  
  // 🎨 المتغيرات
  variant?: 'default' | 'filled' | 'underlined';
  
  // ✨ الميزات الخاصة
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  clearable?: boolean;        // إمكانية المسح
  showPassword?: boolean;     // إظهار كلمة المرور
  loading?: boolean;          // حالة التحميل
  
  // 🎯 أنواع خاصة
  search?: boolean;           // حقل بحث
  
  // 📱 تصميم متجاوب
  fullWidth?: boolean;
  
  // 🎨 ألوان الحالة
  status?: 'default' | 'error' | 'success' | 'warning';
  
  // 📊 عداد الأحرف
  maxLength?: number;
  showCounter?: boolean;
  
  // 🔗 مرجع للتنظيف
  onClear?: () => void;
}

const SabqInput = forwardRef<HTMLInputElement, SabqInputProps>(({
  label,
  description,
  error,
  success,
  size = 'md',
  variant = 'default',
  icon,
  iconPosition = 'right',
  clearable = false,
  showPassword = false,
  loading = false,
  search = false,
  fullWidth = true,
  status = 'default',
  maxLength,
  showCounter = false,
  onClear,
  className,
  type = 'text',
  value,
  ...props
}, ref) => {
  
  const [showPasswordText, setShowPasswordText] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  
  // تحديد حالة الحقل
  const currentStatus = error ? 'error' : success ? 'success' : status;
  
  // 🎨 بناء صفوف CSS
  const inputClasses = cn(
    cssClasses.input.base,
    
    // الأحجام
    {
      'h-8 px-3 text-sm': size === 'sm',
      'h-10 px-4 text-base': size === 'md',
      'h-12 px-5 text-lg': size === 'lg'
    },
    
    // المتغيرات
    {
      [cssClasses.input.light]: variant === 'default',
      [cssClasses.input.dark]: variant === 'default',
      
      // حقل ممتلئ
      'border-transparent bg-gray-100 dark:bg-gray-800 focus:bg-white dark:focus:bg-gray-700': variant === 'filled',
      
      // حقل مخطط من الأسفل
      'border-0 border-b-2 rounded-none bg-transparent px-0 focus:ring-0': variant === 'underlined'
    },
    
    // الحالات
    {
      'border-red-300 focus:border-red-500 focus:ring-red-500 dark:border-red-600': currentStatus === 'error',
      'border-green-300 focus:border-green-500 focus:ring-green-500 dark:border-green-600': currentStatus === 'success',
      'border-yellow-300 focus:border-yellow-500 focus:ring-yellow-500 dark:border-yellow-600': currentStatus === 'warning'
    },
    
    // العرض الكامل
    {
      'w-full': fullWidth
    },
    
    // المسافات للأيقونات
    {
      'pr-10': (icon && iconPosition === 'right') || clearable || (type === 'password' && showPassword) || search,
      'pl-10': icon && iconPosition === 'left',
      'pr-16': (clearable && (icon && iconPosition === 'right')) || (search && clearable)
    },
    
    className
  );

  // 🎯 رسم الأيقونات
  function renderIcon() {
    // أيقونة البحث
    if (search) {
      return (
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          <Search className="w-4 h-4 text-gray-400" />
        </div>
      );
    }

    // أيقونة مخصصة
    if (icon) {
      return (
        <div className={cn(
          'absolute top-1/2 transform -translate-y-1/2',
          iconPosition === 'right' ? 'right-3' : 'left-3'
        )}>
          <span className="w-4 h-4 text-gray-400">{icon}</span>
        </div>
      );
    }

    return null;
  }

  // 🎯 رسم أزرار التحكم
  function renderControls() {
    const controls = [];
    let rightOffset = 3;

    // زر مسح
    if (clearable && value) {
      controls.push(
        <button
          key="clear"
          type="button"
          onClick={() => {
            onClear?.();
            if (props.onChange) {
              const event = { target: { value: '' } } as React.ChangeEvent<HTMLInputElement>;
              props.onChange(event);
            }
          }}
          className={cn(
            'absolute top-1/2 transform -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300',
            `right-${rightOffset}`
          )}
          style={{ right: `${rightOffset * 4}px` }}
        >
          <div className="w-4 h-4 flex items-center justify-center bg-gray-300 dark:bg-gray-600 rounded-full text-xs">×</div>
        </button>
      );
      rightOffset += 6;
    }

    // زر إظهار كلمة المرور
    if (type === 'password' && showPassword) {
      controls.push(
        <button
          key="password"
          type="button"
          onClick={() => setShowPasswordText(!showPasswordText)}
          className={cn(
            'absolute top-1/2 transform -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300',
            `right-${rightOffset}`
          )}
          style={{ right: `${rightOffset * 4}px` }}
        >
          {showPasswordText ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      );
    }

    return controls;
  }

  // 🎯 أيقونة الحالة
  function renderStatusIcon() {
    if (currentStatus === 'error') {
      return <AlertCircle className="w-4 h-4 text-red-500" />;
    }
    if (currentStatus === 'success') {
      return <CheckCircle className="w-4 h-4 text-green-500" />;
    }
    return null;
  }

  return (
    <div className={cn('relative', fullWidth ? 'w-full' : 'w-auto')}>
      {/* التسمية */}
      {label && (
        <label className={cn(
          'block text-sm font-medium mb-2',
          currentStatus === 'error' ? 'text-red-700 dark:text-red-400' :
          currentStatus === 'success' ? 'text-green-700 dark:text-green-400' :
          'text-gray-700 dark:text-gray-300'
        )}>
          {label}
        </label>
      )}

      {/* حاوي الحقل */}
      <div className="relative">
        {/* الحقل نفسه */}
        <input
          ref={ref}
          type={type === 'password' && showPasswordText ? 'text' : type}
          className={inputClasses}
          value={value}
          onFocus={(e) => {
            setIsFocused(true);
            props.onFocus?.(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            props.onBlur?.(e);
          }}
          {...props}
        />

        {/* الأيقونات */}
        {renderIcon()}
        
        {/* أزرار التحكم */}
        {renderControls()}

        {/* مؤشر التحميل */}
        {loading && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
          </div>
        )}
      </div>

      {/* الوصف أو الخطأ أو النجاح */}
      <div className="mt-1 min-h-[1.25rem]">
        {error && (
          <div className="flex items-center gap-1 text-sm text-red-600 dark:text-red-400">
            <AlertCircle className="w-3 h-3" />
            {error}
          </div>
        )}
        
        {success && !error && (
          <div className="flex items-center gap-1 text-sm text-green-600 dark:text-green-400">
            <CheckCircle className="w-3 h-3" />
            {success}
          </div>
        )}
        
        {description && !error && !success && (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {description}
          </p>
        )}

        {/* عداد الأحرف */}
        {showCounter && maxLength && (
          <div className="flex justify-end mt-1">
            <span className={cn(
              'text-xs',
              (value?.toString().length || 0) > maxLength * 0.9 
                ? 'text-yellow-600 dark:text-yellow-400' 
                : 'text-gray-400'
            )}>
              {value?.toString().length || 0} / {maxLength}
            </span>
          </div>
        )}
      </div>
    </div>
  );
});

SabqInput.displayName = 'SabqInput';

export default SabqInput;