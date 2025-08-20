import React from 'react';
import { Eye, BarChart3 } from 'lucide-react';

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
      {/* أيقونات: نخفيها تماماً في النمط المصغر */}
      {variant !== 'minimal' && (
        count > 300 ? (
          <div className="relative flex items-center">
            <BarChart3 className={`${iconSizes[size]} flex-shrink-0 text-orange-500`} />
            <span 
              className="absolute -top-0.5 -right-0.5 text-orange-500 text-[8px] animate-pulse" 
              style={{ fontSize: size === 'xs' ? '6px' : size === 'sm' ? '8px' : '10px' }}
            >
              🔥
            </span>
          </div>
        ) : (
          <div className="relative">
            <svg 
              className={`${iconSizes[size]} flex-shrink-0`} 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2"
            >
              <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/>
              <circle cx="12" cy="12" r="3"/>
            </svg>
          </div>
        )
      )}

      <span className="font-medium">
        {formatViewsNumber(count)}
        {showLabel && variant !== 'minimal' && ' مشاهدة'}
      </span>

      {/* أيقونة النار الإضافية للمشاهدات العالية جداً - معطلة في النمط المصغر */}
      {variant !== 'minimal' && count > 1000 && (
        <span 
          className="text-red-500 animate-bounce flex-shrink-0 ml-1" 
          title={`مقال شائع جداً - ${formatViewsNumber(count)} مشاهدة`}
          style={{ fontSize: size === 'xs' ? '10px' : size === 'sm' ? '12px' : '14px' }}
        >
          🔥🔥
        </span>
      )}
    </div>
  );
}