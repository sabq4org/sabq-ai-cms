/**
 * 📊 بطاقة الإحصائيات الموحدة - Unified Sabq Stat Card
 * مكون بطاقة الإحصائيات المستخدم في جميع أنحاء لوحة التحكم
 */

'use client';

import React, { forwardRef } from 'react';
import { cn } from '@/lib/utils';
import { sabqTheme } from '@/lib/design-system/theme';
import SabqCard from './SabqCard';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export interface SabqStatCardProps {
  // 📊 البيانات الأساسية
  title: string;
  value: string | number;
  description?: string;
  
  // 🎨 التصميم
  icon?: React.ReactNode;
  color?: 'default' | 'primary' | 'success' | 'warning' | 'error' | 'purple' | 'indigo';
  
  // 📈 الاتجاه والتغيير
  trend?: 'up' | 'down' | 'stable';
  changeValue?: string | number;
  changeLabel?: string;
  
  // 📏 الحجم
  size?: 'sm' | 'md' | 'lg';
  
  // ✨ ميزات إضافية
  loading?: boolean;
  animated?: boolean;        // أنيميشن للقيمة
  clickable?: boolean;       // قابلة للنقر
  
  // 🎯 الوقت والسياق
  timeframe?: string;        // "آخر 7 أيام"، "هذا الشهر"
  
  // 📱 تصميم متجاوب
  responsive?: boolean;
  
  // 🔗 أحداث
  onClick?: () => void;
  
  className?: string;
}

const SabqStatCard = forwardRef<HTMLDivElement, SabqStatCardProps>(({
  title,
  value,
  description,
  icon,
  color = 'default',
  trend,
  changeValue,
  changeLabel,
  size = 'md',
  loading = false,
  animated = false,
  clickable = false,
  timeframe,
  responsive = true,
  onClick,
  className,
  ...props
}, ref) => {

  // 🎨 ألوان حسب النوع
  const colorClasses = {
    default: {
      icon: 'text-gray-600 dark:text-gray-400',
      bg: 'bg-gray-100 dark:bg-gray-800',
      accent: 'text-gray-900 dark:text-gray-100'
    },
    primary: {
      icon: 'text-blue-600 dark:text-blue-400',
      bg: 'bg-blue-100 dark:bg-blue-900/20',
      accent: 'text-blue-900 dark:text-blue-100'
    },
    success: {
      icon: 'text-green-600 dark:text-green-400',
      bg: 'bg-green-100 dark:bg-green-900/20',
      accent: 'text-green-900 dark:text-green-100'
    },
    warning: {
      icon: 'text-yellow-600 dark:text-yellow-400',
      bg: 'bg-yellow-100 dark:bg-yellow-900/20',
      accent: 'text-yellow-900 dark:text-yellow-100'
    },
    error: {
      icon: 'text-red-600 dark:text-red-400',
      bg: 'bg-red-100 dark:bg-red-900/20',
      accent: 'text-red-900 dark:text-red-100'
    },
    purple: {
      icon: 'text-purple-600 dark:text-purple-400',
      bg: 'bg-purple-100 dark:bg-purple-900/20',
      accent: 'text-purple-900 dark:text-purple-100'
    },
    indigo: {
      icon: 'text-indigo-600 dark:text-indigo-400',
      bg: 'bg-indigo-100 dark:bg-indigo-900/20',
      accent: 'text-indigo-900 dark:text-indigo-100'
    }
  };

  // 📈 رسم الاتجاه
  function renderTrend() {
    if (!trend || !changeValue) return null;

    const trendClasses = {
      up: 'text-green-600 dark:text-green-400',
      down: 'text-red-600 dark:text-red-400',
      stable: 'text-gray-600 dark:text-gray-400'
    };

    const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;

    return (
      <div className={cn('flex items-center gap-1 text-sm', trendClasses[trend])}>
        <TrendIcon className="w-4 h-4" />
        <span className="font-medium">{changeValue}</span>
        {changeLabel && <span className="text-xs">{changeLabel}</span>}
      </div>
    );
  }

  // 🎯 محتوى البطاقة
  function renderContent() {
    const currentColors = colorClasses[color];
    
    return (
      <div className="flex items-start justify-between">
        {/* الجانب الأيسر - النص والقيم */}
        <div className="flex-1">
          {/* العنوان */}
          <h3 className={cn(
            'font-medium text-gray-700 dark:text-gray-300 leading-tight',
            {
              'text-sm': size === 'sm',
              'text-base': size === 'md',
              'text-lg': size === 'lg'
            }
          )}>
            {title}
          </h3>

          {/* القيمة الرئيسية */}
          <div className={cn(
            'font-bold text-gray-900 dark:text-white mt-1',
            {
              'text-xl': size === 'sm',
              'text-2xl': size === 'md', 
              'text-3xl': size === 'lg'
            },
            animated && 'transition-all duration-500 ease-in-out'
          )}>
            {loading ? (
              <div className="animate-pulse bg-gray-300 dark:bg-gray-600 rounded h-8 w-20"></div>
            ) : (
              value
            )}
          </div>

          {/* الوصف */}
          {description && (
            <p className={cn(
              'text-gray-500 dark:text-gray-400 mt-1',
              {
                'text-xs': size === 'sm',
                'text-sm': size === 'md',
                'text-base': size === 'lg'
              }
            )}>
              {description}
            </p>
          )}

          {/* الاتجاه والتغيير */}
          {renderTrend()}

          {/* الإطار الزمني */}
          {timeframe && (
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
              {timeframe}
            </p>
          )}
        </div>

        {/* الجانب الأيمن - الأيقونة */}
        {icon && (
          <div className={cn(
            'flex items-center justify-center rounded-lg',
            currentColors.bg,
            {
              'w-10 h-10': size === 'sm',
              'w-12 h-12': size === 'md',
              'w-14 h-14': size === 'lg'
            }
          )}>
            <span className={cn(
              currentColors.icon,
              {
                'w-5 h-5': size === 'sm',
                'w-6 h-6': size === 'md',
                'w-7 h-7': size === 'lg'
              }
            )}>
              {icon}
            </span>
          </div>
        )}
      </div>
    );
  }

  return (
    <SabqCard
      ref={ref}
      variant="default"
      size={size}
      interactive={clickable}
      loading={loading}
      color={color}
      responsive={responsive}
      className={cn(
        'hover:shadow-lg transition-all duration-300',
        clickable && 'cursor-pointer transform hover:scale-[1.02]',
        className
      )}
      onClick={onClick}
      {...props}
    >
      {renderContent()}
    </SabqCard>
  );
});

SabqStatCard.displayName = 'SabqStatCard';

export default SabqStatCard;