'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface PreferredSourceButtonProps {
  size?: 'small' | 'medium' | 'large';
  variant?: 'default' | 'ghost';
  className?: string;
}

export default function PreferredSourceButton({ 
  size = 'medium', 
  variant = 'default',
  className = '' 
}: PreferredSourceButtonProps) {
  const deeplink = 'https://google.com/preferences/source?q=https://sabq.org';

  const sizeClasses = {
    small: 'h-8 px-3 text-xs',
    medium: 'h-10 px-4 text-sm', 
    large: 'h-12 px-6 text-base'
  };

  const variantClasses = {
    default: 'bg-white hover:bg-gray-50 text-gray-900 border border-gray-300 shadow-sm',
    ghost: 'bg-transparent hover:bg-gray-100 text-gray-700 border border-transparent'
  };

  return (
    <a
      href={deeplink}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
        sizeClasses[size],
        variantClasses[variant],
        className
      )}
      aria-label="إضافة سبق كمصدر مفضل في Google News"
      title="إضافة سبق كمصدر مفضل في Google News"
    >
      {/* Google Logo */}
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        className="flex-shrink-0"
        aria-hidden="true"
      >
        <path
          fill="#4285F4"
          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        />
        <path
          fill="#34A853"
          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        />
        <path
          fill="#FBBC05"
          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        />
        <path
          fill="#EA4335"
          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        />
      </svg>
      
      {/* Text */}
      <span className="whitespace-nowrap">
        {size === 'small' ? 'مصدر مفضل' : 'إضافة كمصدر مفضل'}
      </span>
    </a>
  );
}

// إصدار متوافق مع الوضع الداكن
export function PreferredSourceButtonDark({ 
  size = 'medium', 
  variant = 'default',
  className = '' 
}: PreferredSourceButtonProps) {
  const deeplink = 'https://google.com/preferences/source?q=https://sabq.org';

  const sizeClasses = {
    small: 'h-8 px-3 text-xs',
    medium: 'h-10 px-4 text-sm', 
    large: 'h-12 px-6 text-base'
  };

  const variantClasses = {
    default: 'bg-gray-800 hover:bg-gray-700 text-white border border-gray-600 shadow-sm',
    ghost: 'bg-transparent hover:bg-gray-800/50 text-gray-300 border border-transparent'
  };

  return (
    <a
      href={deeplink}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-gray-900',
        sizeClasses[size],
        variantClasses[variant],
        className
      )}
      aria-label="إضافة سبق كمصدر مفضل في Google News"
      title="إضافة سبق كمصدر مفضل في Google News"
    >
      {/* Google Logo */}
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        className="flex-shrink-0"
        aria-hidden="true"
      >
        <path
          fill="#4285F4"
          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        />
        <path
          fill="#34A853"
          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        />
        <path
          fill="#FBBC05"
          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        />
        <path
          fill="#EA4335"
          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        />
      </svg>
      
      {/* Text */}
      <span className="whitespace-nowrap">
        {size === 'small' ? 'مصدر مفضل' : 'إضافة كمصدر مفضل'}
      </span>
    </a>
  );
}

// إصدار متوافق مع Manus UI
export function ManusPreferredSourceButton({ 
  size = 'medium',
  className = '' 
}: Omit<PreferredSourceButtonProps, 'variant'>) {
  const deeplink = 'https://google.com/preferences/source?q=https://sabq.org';

  const sizeStyles = {
    small: { padding: '6px 12px', fontSize: '12px' },
    medium: { padding: '8px 16px', fontSize: '13px' },
    large: { padding: '12px 20px', fontSize: '14px' }
  };

  return (
    <a
      href={deeplink}
      target="_blank"
      rel="noopener noreferrer"
      className={cn('btn btn-sm', className)}
      style={{
        ...sizeStyles[size],
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        textDecoration: 'none'
      }}
      aria-label="إضافة سبق كمصدر مفضل في Google News"
      title="إضافة سبق كمصدر مفضل في Google News"
    >
      {/* Google Logo */}
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        style={{ flexShrink: 0 }}
        aria-hidden="true"
      >
        <path
          fill="#4285F4"
          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        />
        <path
          fill="#34A853"
          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        />
        <path
          fill="#FBBC05"
          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        />
        <path
          fill="#EA4335"
          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        />
      </svg>
      
      <span style={{ whiteSpace: 'nowrap' }}>
        {size === 'small' ? 'مصدر مفضل' : 'إضافة كمصدر مفضل'}
      </span>
    </a>
  );
}
