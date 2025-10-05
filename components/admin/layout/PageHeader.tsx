import React from 'react';
import { cn } from '@/lib/utils';

interface PageHeaderProps {
  /**
   * العنوان الرئيسي للصفحة
   */
  title: string;
  /**
   * وصف أو نص فرعي اختياري
   */
  subtitle?: string;
  /**
   * محتوى إضافي في الجهة اليسرى (مثل أزرار الإجراءات)
   */
  actions?: React.ReactNode;
  /**
   * كلاسات CSS إضافية
   */
  className?: string;
  /**
   * إظهار خط فاصل أسفل الهيدر
   */
  withDivider?: boolean;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  actions,
  className,
  withDivider = true,
}) => {
  return (
    <div
      className={cn(
        'mb-6',
        withDivider && 'pb-6 border-b border-gray-200',
        className
      )}
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white truncate">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-2 text-sm sm:text-base text-gray-600 dark:text-gray-400">
              {subtitle}
            </p>
          )}
        </div>
        
        {actions && (
          <div className="flex-shrink-0 flex items-center gap-2">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
};

PageHeader.displayName = 'PageHeader';
