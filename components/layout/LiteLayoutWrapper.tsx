"use client";

import React from 'react';
import Image from 'next/image';
import { useDeviceType } from '@/hooks/useDeviceType';

interface LiteLayoutWrapperProps {
  children: React.ReactNode;
  className?: string;
  fullWidth?: boolean;
  noSpacing?: boolean;
  component?: 'div' | 'section' | 'article' | 'main';
}

/**
 * مكون مساعد لتطبيق تحسينات النسخة الخفيفة
 * يضمن استغلال المساحات الجانبية بشكل أفضل في الموبايل
 */
export default function LiteLayoutWrapper({ 
  children, 
  className = '',
  fullWidth = false,
  noSpacing = false,
  component = 'div'
}: LiteLayoutWrapperProps) {
  const { isMobile } = useDeviceType();
  const Component = component;

  // بناء الفئات المطلوبة
  const baseClasses = isMobile 
    ? `lite-layout-optimized ${fullWidth ? 'lite-full-width' : ''} ${noSpacing ? 'lite-no-spacing' : ''}`
    : '';

  const combinedClasses = `${baseClasses} ${className}`.trim();

  return (
    <Component className={combinedClasses}>
      {children}
      {/* إضافة CSS مباشرة في النسخة الخفيفة */}
      {isMobile && (
        <style jsx>{`
          .lite-layout-optimized {
            max-width: 100% !important;
            width: 100% !important;
          }

          .lite-full-width {
            margin-left: 0 !important;
            margin-right: 0 !important;
            padding-left: 0.5rem !important;
            padding-right: 0.5rem !important;
          }

          .lite-no-spacing {
            padding: 0 !important;
            margin: 0 !important;
          }

          /* تطبيق التحسينات على العناصر الفرعية */
          .lite-layout-optimized .max-w-6xl,
          .lite-layout-optimized .max-w-7xl,
          .lite-layout-optimized .max-w-5xl,
          .lite-layout-optimized .container {
            max-width: 100% !important;
            width: 100% !important;
            padding-left: 0.75rem !important;
            padding-right: 0.75rem !important;
          }

          /* تحسين الشبكة */
          .lite-layout-optimized .grid {
            grid-template-columns: 1fr !important;
            gap: 0.75rem !important;
          }

          /* تحسين البطاقات */
          .lite-layout-optimized .card,
          .lite-layout-optimized .bg-white {
            margin-left: 0 !important;
            margin-right: 0 !important;
            border-radius: 12px !important;
          }

          /* تحسين الصور */
          .lite-layout-optimized img {
            width: 100% !important;
            height: auto !important;
            border-radius: 8px !important;
          }

          /* تحسين النصوص */
          .lite-layout-optimized h1,
          .lite-layout-optimized h2,
          .lite-layout-optimized h3 {
            line-height: 1.3 !important;
            margin-bottom: 0.75rem !important;
          }

          .lite-layout-optimized p {
            line-height: 1.6 !important;
            margin-bottom: 0.75rem !important;
          }
        `}</style>
      )}
    </Component>
  );
}

// مكونات مساعدة إضافية

/**
 * حاوية للمحتوى مع امتداد كامل في النسخة الخفيفة
 */
export function LiteFullWidthContainer({ 
  children, 
  className = '',
  background = false 
}: { 
  children: React.ReactNode;
  className?: string;
  background?: boolean;
}) {
  const { isMobile } = useDeviceType();

  if (!isMobile) {
    return <div className={className}>{children}</div>;
  }

  return (
    <div 
      className={`
        w-full max-w-none
        -mx-4 px-4
        ${background ? 'py-4' : ''}
        ${className}
      `}
      style={{
        marginLeft: '-1rem',
        marginRight: '-1rem',
        paddingLeft: '1rem',
        paddingRight: '1rem',
        width: 'calc(100% + 2rem)',
        ...(background && {
          background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.03) 0%, rgba(16, 185, 129, 0.03) 100%)',
          borderTop: '1px solid rgba(59, 130, 246, 0.08)',
          borderBottom: '1px solid rgba(16, 185, 129, 0.08)'
        })
      }}
    >
      {children}
    </div>
  );
}

/**
 * شبكة محسنة للنسخة الخفيفة
 */
export function LiteGrid({ 
  children, 
  columns = 1, 
  gap = 'md',
  className = '' 
}: { 
  children: React.ReactNode;
  columns?: 1 | 2 | 3;
  gap?: 'sm' | 'md' | 'lg';
  className?: string;
}) {
  const { isMobile } = useDeviceType();

  const gapSizes = {
    sm: isMobile ? '0.5rem' : '0.75rem',
    md: isMobile ? '0.75rem' : '1rem',
    lg: isMobile ? '1rem' : '1.5rem'
  };

  const gridColumns = isMobile ? 1 : columns;

  return (
    <div 
      className={`grid ${className}`}
      style={{
        gridTemplateColumns: `repeat(${gridColumns}, minmax(0, 1fr))`,
        gap: gapSizes[gap]
      }}
    >
      {children}
    </div>
  );
}

/**
 * بطاقة محسنة للنسخة الخفيفة
 */
export function LiteCard({ 
  children, 
  padding = 'md',
  shadow = true,
  className = '' 
}: { 
  children: React.ReactNode;
  padding?: 'sm' | 'md' | 'lg';
  shadow?: boolean;
  className?: string;
}) {
  const { isMobile } = useDeviceType();

  const paddingSize = {
    sm: isMobile ? '0.75rem' : '1rem',
    md: isMobile ? '1rem' : '1.5rem',
    lg: isMobile ? '1.25rem' : '2rem'
  };

  return (
    <div 
      className={`
        bg-white dark:bg-gray-800 
        rounded-xl 
        border border-gray-200 dark:border-gray-700
        ${shadow ? 'shadow-sm hover:shadow-md' : ''}
        transition-shadow duration-200
        ${className}
      `}
      style={{
        padding: paddingSize[padding],
        borderRadius: isMobile ? '12px' : '16px'
      }}
    >
      {children}
    </div>
  );
}

/**
 * عنوان محسن للنسخة الخفيفة
 */
export function LiteHeading({ 
  children, 
  level = 2, 
  className = '' 
}: { 
  children: React.ReactNode;
  level?: 1 | 2 | 3 | 4 | 5 | 6;
  className?: string;
}) {
  const { isMobile } = useDeviceType();
  const Tag = `h${level}` as keyof JSX.IntrinsicElements;

  const fontSize = {
    1: isMobile ? '1.5rem' : '2rem',
    2: isMobile ? '1.25rem' : '1.5rem',
    3: isMobile ? '1.125rem' : '1.25rem',
    4: isMobile ? '1rem' : '1.125rem',
    5: isMobile ? '0.875rem' : '1rem',
    6: isMobile ? '0.75rem' : '0.875rem'
  };

  return (
    <Tag 
      className={`
        font-bold text-gray-900 dark:text-gray-100
        ${className}
      `}
      style={{
        fontSize: fontSize[level],
        lineHeight: 1.3,
        marginBottom: isMobile ? '0.75rem' : '1rem'
      }}
    >
      {children}
    </Tag>
  );
}

/**
 * صورة محسنة للنسخة الخفيفة
 */
export function LiteImage({ 
  src, 
  alt, 
  aspectRatio = '16/9',
  rounded = true,
  className = '' 
}: { 
  src: string;
  alt: string;
  aspectRatio?: string;
  rounded?: boolean;
  className?: string;
}) {
  const { isMobile } = useDeviceType();

  return (
    <div 
      className={`
        relative overflow-hidden
        ${rounded ? 'rounded-lg' : ''}
        ${className}
      `}
      style={{
        aspectRatio,
        borderRadius: rounded ? (isMobile ? '8px' : '12px') : 0
      }}
    >
      <Image
        src={src}
        alt={alt}
        fill
        className="object-cover"
        sizes="100vw"
        priority={false}
      />
    </div>
  );
}
