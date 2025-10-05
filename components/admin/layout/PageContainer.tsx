import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const pageContainerVariants = cva(
  'w-full mx-auto px-4 sm:px-6 lg:px-8 py-6',
  {
    variants: {
      size: {
        default: 'max-w-7xl',
        wide: 'max-w-[1920px]', // للجداول والمحتوى العريض
        narrow: 'max-w-4xl',
        full: 'max-w-full', // للحالات الخاصة جداً
      },
    },
    defaultVariants: {
      size: 'default',
    },
  }
);

interface PageContainerProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof pageContainerVariants> {
  children: React.ReactNode;
  /**
   * إضافة خلفية بيضاء مع حدود وظلال (مفيد للبطاقات الكبيرة)
   */
  withCard?: boolean;
}

export const PageContainer: React.FC<PageContainerProps> = ({
  children,
  className,
  size,
  withCard = false,
  ...props
}) => {
  return (
    <div
      className={cn(
        pageContainerVariants({ size }),
        withCard && 'bg-white rounded-lg shadow-sm border border-gray-200',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

PageContainer.displayName = 'PageContainer';
