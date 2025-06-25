'use client';

import React from 'react';
import { Moon, Sun, Monitor } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { cn } from '@/lib/utils';

interface ThemeToggleProps {
  className?: string;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function ThemeToggle({ className, showLabel = false, size = 'md' }: ThemeToggleProps) {
  const { theme, resolvedTheme, toggleTheme, mounted } = useTheme();

  // اختصار لوحة المفاتيح - يجب أن يكون قبل أي early returns
  React.useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Ctrl/Cmd + Shift + L للتبديل السريع
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'L') {
        e.preventDefault();
        toggleTheme();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [toggleTheme]);

  // أحجام الأيقونات
  const iconSize = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  }[size];

  // أحجام الأزرار
  const buttonSize = {
    sm: 'p-1.5',
    md: 'p-2',
    lg: 'p-2.5'
  }[size];

  // عدم عرض شيء حتى يتم التحميل لتجنب الوميض
  if (!mounted) {
    return (
      <div className={cn(
        "rounded-lg transition-colors",
        buttonSize,
        className
      )}>
        <div className={cn("animate-pulse bg-gray-200 dark:bg-gray-700 rounded", iconSize)} />
      </div>
    );
  }

  // اختيار الأيقونة والتسمية بناءً على الثيم الحالي
  const getThemeIcon = () => {
    switch (theme) {
      case 'light':
        return <Sun className={iconSize} />;
      case 'dark':
        return <Moon className={iconSize} />;
      case 'system':
        return <Monitor className={iconSize} />;
      default:
        return <Sun className={iconSize} />;
    }
  };

  const getThemeLabel = () => {
    switch (theme) {
      case 'light':
        return 'فاتح';
      case 'dark':
        return 'داكن';
      case 'system':
        return 'تلقائي';
      default:
        return 'فاتح';
    }
  };

  return (
    <button
      onClick={toggleTheme}
      className={cn(
        "relative group rounded-lg transition-all duration-200",
        "hover:bg-gray-100 dark:hover:bg-gray-800",
        "focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2",
        "dark:focus:ring-offset-gray-900",
        buttonSize,
        showLabel && "flex items-center gap-2",
        className
      )}
      title={`تبديل الوضع (${getThemeLabel()}) - Ctrl+Shift+L`}
      aria-label={`الوضع الحالي: ${getThemeLabel()}`}
    >
      {/* الأيقونة مع تأثير الدوران */}
      <span className="relative block transition-transform duration-300 group-hover:rotate-180">
        {getThemeIcon()}
      </span>

      {/* التسمية (اختيارية) */}
      {showLabel && (
        <span className="text-sm font-medium">
          {getThemeLabel()}
        </span>
      )}

      {/* مؤشر الوضع الحالي */}
      <span className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 rounded-full bg-current opacity-0 group-hover:opacity-100 transition-opacity" />
    </button>
  );
}

// مكون منسدل لاختيار الثيم مع المزيد من الخيارات
export function ThemeSelect({ className }: { className?: string }) {
  const { theme, setTheme, mounted } = useTheme();

  if (!mounted) {
    return (
      <div className={cn("w-32 h-10 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse", className)} />
    );
  }

  const themes = [
    { value: 'light', label: 'فاتح', icon: Sun },
    { value: 'dark', label: 'داكن', icon: Moon },
    { value: 'system', label: 'تلقائي', icon: Monitor },
  ] as const;

  return (
    <select
      value={theme}
      onChange={(e) => setTheme(e.target.value as 'light' | 'dark' | 'system')}
      className={cn(
        "px-3 py-2 rounded-lg border",
        "bg-white dark:bg-gray-800",
        "border-gray-300 dark:border-gray-600",
        "text-gray-900 dark:text-gray-100",
        "focus:outline-none focus:ring-2 focus:ring-indigo-500",
        "cursor-pointer",
        className
      )}
    >
      {themes.map(({ value, label }) => (
        <option key={value} value={value}>
          {label}
        </option>
      ))}
    </select>
  );
} 