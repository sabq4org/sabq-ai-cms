/**
 * دليل نظام التصميم الموحد - منصة سبق الذكية
 * Design System Guide - Sabq AI CMS
 *
 * هذا الملف يحتوي على المكونات الأساسية والإرشادات التصميمية
 * للحفاظ على التناسق البصري عبر المنصة
 */

'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Grid,
  Layout,
  Monitor,
  Palette,
  Smartphone,
  Type,
  Zap
} from 'lucide-react';
import React from 'react';

// ألوان النظام الموحدة
export const DESIGN_TOKENS = {
  colors: {
    // الألوان الأساسية
    primary: {
      50: '#eff6ff',
      100: '#dbeafe',
      500: '#3b82f6',
      600: '#2563eb',
      700: '#1d4ed8',
      900: '#1e3a8a'
    },
    // الألوان الثانوية
    secondary: {
      50: '#f8fafc',
      100: '#f1f5f9',
      500: '#64748b',
      600: '#475569',
      700: '#334155',
      900: '#0f172a'
    },
    // ألوان الحالة
    success: {
      50: '#f0fdf4',
      500: '#22c55e',
      600: '#16a34a',
      700: '#15803d'
    },
    warning: {
      50: '#fffbeb',
      500: '#f59e0b',
      600: '#d97706',
      700: '#b45309'
    },
    danger: {
      50: '#fef2f2',
      500: '#ef4444',
      600: '#dc2626',
      700: '#b91c1c'
    },
    // الألوان المحايدة
    neutral: {
      50: '#fafafa',
      100: '#f5f5f5',
      200: '#e5e5e5',
      300: '#d4d4d4',
      400: '#a3a3a3',
      500: '#737373',
      600: '#525252',
      700: '#404040',
      800: '#262626',
      900: '#171717'
    }
  },

  // المسافات المعيارية
  spacing: {
    xs: '0.25rem',  // 4px
    sm: '0.5rem',   // 8px
    md: '1rem',     // 16px
    lg: '1.5rem',   // 24px
    xl: '2rem',     // 32px
    '2xl': '3rem',  // 48px
    '3xl': '4rem',  // 64px
  },

  // نقاط الانكسار الموحدة
  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px'
  },

  // الظلال المعيارية
  shadows: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)'
  },

  // الأشعة الحدودية
  borderRadius: {
    sm: '0.375rem',
    md: '0.5rem',
    lg: '0.75rem',
    xl: '1rem'
  }
};

// مكونات التصميم الأساسية
export const DesignComponents = {
  // بطاقة معيارية
  StandardCard: ({ children, className = "", ...props }: any) => (
    <Card
      className={`
        bg-white dark:bg-gray-800
        border border-gray-200 dark:border-gray-700
        rounded-xl shadow-sm hover:shadow-md
        transition-all duration-200
        ${className}
      `}
      {...props}
    >
      {children}
    </Card>
  ),

  // عنوان القسم
  SectionHeader: ({ title, description, action }: {
    title: string;
    description?: string;
    action?: React.ReactNode;
  }) => (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          {title}
        </h2>
        {description && (
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {description}
          </p>
        )}
      </div>
      {action && (
        <div className="flex-shrink-0">
          {action}
        </div>
      )}
    </div>
  ),

  // شبكة المحتوى التكيفية
  ResponsiveGrid: ({ children, cols = 3, className = "" }: {
    children: React.ReactNode;
    cols?: 1 | 2 | 3 | 4;
    className?: string;
  }) => {
    const gridCols = {
      1: 'grid-cols-1',
      2: 'grid-cols-1 md:grid-cols-2',
      3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
      4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
    };

    return (
      <div className={`grid ${gridCols[cols]} gap-6 ${className}`}>
        {children}
      </div>
    );
  },

  // حاوي المحتوى المحدود
  ContentContainer: ({ children, size = 'default', className = "" }: {
    children: React.ReactNode;
    size?: 'sm' | 'default' | 'lg' | 'xl' | 'full';
    className?: string;
  }) => {
    const maxWidths = {
      sm: 'max-w-2xl',
      default: 'max-w-4xl',
      lg: 'max-w-6xl',
      xl: 'max-w-7xl',
      full: 'max-w-full'
    };

    return (
      <div className={`${maxWidths[size]} mx-auto px-4 sm:px-6 lg:px-8 ${className}`}>
        {children}
      </div>
    );
  },

  // مؤشر الحالة
  StatusIndicator: ({ status, text }: {
    status: 'success' | 'warning' | 'danger' | 'info';
    text?: string;
  }) => {
    const variants = {
      success: 'bg-green-100 text-green-800 border-green-200',
      warning: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      danger: 'bg-red-100 text-red-800 border-red-200',
      info: 'bg-blue-100 text-blue-800 border-blue-200'
    };

    const dots = {
      success: 'bg-green-400',
      warning: 'bg-yellow-400',
      danger: 'bg-red-400',
      info: 'bg-blue-400'
    };

    return (
      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm font-medium ${variants[status]}`}>
        <div className={`w-2 h-2 rounded-full ${dots[status]}`} />
        {text}
      </div>
    );
  },

  // قائمة الإجراءات
  ActionBar: ({ children, align = 'right' }: {
    children: React.ReactNode;
    align?: 'left' | 'center' | 'right' | 'between';
  }) => {
    const alignments = {
      left: 'justify-start',
      center: 'justify-center',
      right: 'justify-end',
      between: 'justify-between'
    };

    return (
      <div className={`flex items-center gap-3 ${alignments[align]} flex-wrap`}>
        {children}
      </div>
    );
  }
};

// صفحة دليل التصميم (للمطورين)
export default function DesignSystemGuide() {
  return (
    <div className="p-6 max-w-7xl mx-auto">
      <DesignComponents.SectionHeader
        title="دليل نظام التصميم - منصة سبق الذكية"
        description="المكونات والإرشادات الأساسية للحفاظ على التناسق البصري"
      />

      <div className="space-y-12">
        {/* الألوان */}
        <section>
          <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
            <Palette className="w-5 h-5 text-blue-600" />
            لوحة الألوان
          </h3>

          <DesignComponents.ResponsiveGrid cols={2}>
            <DesignComponents.StandardCard className="p-6">
              <h4 className="font-semibold mb-4">اللون الأساسي (Primary)</h4>
              <div className="grid grid-cols-5 gap-2">
                {[50, 100, 500, 600, 700].map(shade => (
                  <div key={shade} className="text-center">
                    <div
                      className="w-full h-12 rounded-lg mb-2"
                      style={{ backgroundColor: DESIGN_TOKENS.colors.primary[shade as keyof typeof DESIGN_TOKENS.colors.primary] }}
                    />
                    <span className="text-xs text-gray-600">{shade}</span>
                  </div>
                ))}
              </div>
            </DesignComponents.StandardCard>

            <DesignComponents.StandardCard className="p-6">
              <h4 className="font-semibold mb-4">ألوان الحالة</h4>
              <div className="space-y-3">
                <DesignComponents.StatusIndicator status="success" text="نجح" />
                <DesignComponents.StatusIndicator status="warning" text="تحذير" />
                <DesignComponents.StatusIndicator status="danger" text="خطأ" />
                <DesignComponents.StatusIndicator status="info" text="معلومات" />
              </div>
            </DesignComponents.StandardCard>
          </DesignComponents.ResponsiveGrid>
        </section>

        {/* الطباعة */}
        <section>
          <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
            <Type className="w-5 h-5 text-blue-600" />
            الطباعة والنصوص
          </h3>

          <DesignComponents.StandardCard className="p-6">
            <div className="space-y-4">
              <div>
                <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100">عنوان رئيسي (H1)</h1>
                <code className="text-sm text-gray-600">text-4xl font-bold</code>
              </div>
              <div>
                <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200">عنوان ثانوي (H2)</h2>
                <code className="text-sm text-gray-600">text-2xl font-semibold</code>
              </div>
              <div>
                <h3 className="text-xl font-medium text-gray-700 dark:text-gray-300">عنوان فرعي (H3)</h3>
                <code className="text-sm text-gray-600">text-xl font-medium</code>
              </div>
              <div>
                <p className="text-base text-gray-600 dark:text-gray-400">نص عادي - هذا مثال على النص العادي في المنصة</p>
                <code className="text-sm text-gray-600">text-base text-gray-600</code>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-500">نص صغير للمعلومات الثانوية</p>
                <code className="text-sm text-gray-600">text-sm text-gray-500</code>
              </div>
            </div>
          </DesignComponents.StandardCard>
        </section>

        {/* الأزرار */}
        <section>
          <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
            <Zap className="w-5 h-5 text-blue-600" />
            الأزرار والإجراءات
          </h3>

          <DesignComponents.StandardCard className="p-6">
            <div className="space-y-6">
              <div>
                <h4 className="font-medium mb-3">الأزرار الأساسية</h4>
                <DesignComponents.ActionBar align="left">
                  <Button variant="primary">أساسي</Button>
                  <Button variant="secondary">ثانوي</Button>
                  <Button variant="outline">محدد</Button>
                  <Button variant="ghost">شفاف</Button>
                </DesignComponents.ActionBar>
              </div>

              <div>
                <h4 className="font-medium mb-3">أزرار الحالة</h4>
                <DesignComponents.ActionBar align="left">
                  <Button variant="success">نجح</Button>
                  <Button variant="warning">تحذير</Button>
                  <Button variant="destructive">حذف</Button>
                </DesignComponents.ActionBar>
              </div>

              <div>
                <h4 className="font-medium mb-3">الأحجام</h4>
                <DesignComponents.ActionBar align="left">
                  <Button size="sm">صغير</Button>
                  <Button size="default">عادي</Button>
                  <Button size="lg">كبير</Button>
                </DesignComponents.ActionBar>
              </div>
            </div>
          </DesignComponents.StandardCard>
        </section>

        {/* التخطيط */}
        <section>
          <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
            <Layout className="w-5 h-5 text-blue-600" />
            أنماط التخطيط
          </h3>

          <DesignComponents.ResponsiveGrid cols={1}>
            <DesignComponents.StandardCard className="p-6">
              <h4 className="font-medium mb-4">الشبكة التكيفية</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3, 4, 5, 6].map(i => (
                  <div key={i} className="bg-blue-100 dark:bg-blue-900/30 p-4 rounded-lg text-center">
                    بطاقة {i}
                  </div>
                ))}
              </div>
            </DesignComponents.StandardCard>
          </DesignComponents.ResponsiveGrid>
        </section>

        {/* المسافات */}
        <section>
          <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
            <Grid className="w-5 h-5 text-blue-600" />
            نظام المسافات
          </h3>

          <DesignComponents.StandardCard className="p-6">
            <div className="space-y-4">
              {Object.entries(DESIGN_TOKENS.spacing).map(([key, value]) => (
                <div key={key} className="flex items-center gap-4">
                  <div className="w-16 text-sm font-mono">{key}:</div>
                  <div className="w-20 text-sm text-gray-600">{value}</div>
                  <div
                    className="bg-blue-500 h-4"
                    style={{ width: value }}
                  />
                </div>
              ))}
            </div>
          </DesignComponents.StandardCard>
        </section>

        {/* التكيف مع الأجهزة */}
        <section>
          <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
            <div className="flex gap-1">
              <Smartphone className="w-4 h-4 text-blue-600" />
              <Monitor className="w-4 h-4 text-blue-600" />
            </div>
            نقاط الانكسار والتكيف
          </h3>

          <DesignComponents.StandardCard className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium mb-3">نقاط الانكسار</h4>
                <div className="space-y-2">
                  {Object.entries(DESIGN_TOKENS.breakpoints).map(([key, value]) => (
                    <div key={key} className="flex justify-between text-sm">
                      <span className="font-mono">{key}:</span>
                      <span className="text-gray-600">{value}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-3">إرشادات التكيف</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• الهاتف أولاً (Mobile First)</li>
                  <li>• أعمدة مرنة للمحتوى</li>
                  <li>• نصوص قابلة للقراءة</li>
                  <li>• أزرار لمس مريحة</li>
                </ul>
              </div>
            </div>
          </DesignComponents.StandardCard>
        </section>
      </div>
    </div>
  );
}
