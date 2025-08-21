import React from 'react';
import { Eye } from 'lucide-react';

interface ArticleViewsProps {
  count: number;
  className?: string;
  showLabel?: boolean;
  size?: 'xs' | 'sm' | 'md';
  variant?: 'default' | 'minimal';
}

/**
 * مكون موحد لعرض المشاهدات مع التنسيق المطلوب
 * - أيقونة العين الرسومية من lucide-react (موحدة)
 * - عرض الرقم بصيغة رقمية مع فواصل
 * - إظهار أيقونة 🔥 اللهب عند تجاوز المشاهدات 300+
 * - أحجام مختلفة ومتغيرات متعددة
 */
export default function ArticleViews({ 
  count, 
  className = '', 
  showLabel = true,
  size = 'sm',
  variant = 'default'
}: ArticleViewsProps) {
  // تنسيق الرقم العشري بالفواصل
  const formatViewsNumber = (num: number): string => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}م`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}ك`;
    }
    return new Intl.NumberFormat('en-US').format(num);
  };

  // تحديد الأحجام
  const sizeClasses = {
    xs: 'text-xs',
    sm: 'text-xs',
    md: 'text-sm'
  };

  const iconSizes = {
    xs: 'w-2.5 h-2.5',
    sm: 'w-3 h-3', 
    md: 'w-4 h-4'
  };

  const baseClasses = `flex items-center gap-1 ${sizeClasses[size]} text-gray-500 dark:text-gray-400`;
  const finalClasses = variant === 'minimal' 
    ? `${baseClasses} ${className}`
    : `${baseClasses} ${className}`;

  return (
    <div className={finalClasses}>
      {/* الأيقونة الموحدة */}
      {variant !== 'minimal' && (
        <Eye className={`${iconSizes[size]} flex-shrink-0`} />
      )}

      <span className="font-medium">
        {formatViewsNumber(count)}
        {showLabel && variant !== 'minimal' && ' مشاهدة'}
      </span>

      {/* شعلة موحّدة عند 300+ */}
      {count > 300 && (
        <span 
          className="ml-1 text-orange-500 flex-shrink-0" 
          title={`شائع - ${formatViewsNumber(count)} مشاهدة`}
          style={{ fontSize: size === 'xs' ? '10px' : size === 'sm' ? '12px' : '14px' }}
        >
          🔥
        </span>
      )}
    </div>
  );
}