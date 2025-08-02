import React from 'react';
import { Eye } from 'lucide-react';

interface ArticleViewsProps {
  count: number;
  className?: string;
}

/**
 * مكون عرض المشاهدات مع التنسيق المطلوب
 * - عرض الرقم بصيغة رقمية عربية عادية مع فواصل
 * - إظهار أيقونة 🔥 اللهب عند تجاوز المشاهدات 300+
 */
export default function ArticleViews({ count, className = '' }: ArticleViewsProps) {
  // تنسيق الرقم العشري بالفواصل
  const formatViewsNumber = (num: number): string => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  return (
    <div className={`flex items-center gap-1 text-xs text-gray-500 ${className}`}>
      <Eye className="w-3 h-3" />
      <span className="font-medium">
        {formatViewsNumber(count)} مشاهدة
      </span>
      {count > 300 && (
        <span 
          className="text-orange-500 animate-pulse" 
          title="مقال رائج"
        >
          🔥
        </span>
      )}
    </div>
  );
}