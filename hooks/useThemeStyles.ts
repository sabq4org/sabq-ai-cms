'use client';

import { useEffect } from 'react';
import { useCurrentTheme } from '@/contexts/ThemeManagerContext';

/**
 * Hook لتطبيق أنماط الثيم على عنصر محدد
 */
export function useThemeStyles(elementRef?: React.RefObject<HTMLElement>) {
  const { colors, settings } = useCurrentTheme();

  useEffect(() => {
    const element = elementRef?.current || document.documentElement;
    if (!element) return;

    // تطبيق متغيرات الألوان
    Object.entries(colors).forEach(([key, value]) => {
      element.style.setProperty(`--theme-${key}`, value);
    });

    // تطبيق إعدادات المظهر
    element.style.setProperty('--theme-border-radius', 
      settings.borderRadius === 'none' ? '0px' :
      settings.borderRadius === 'small' ? '4px' :
      settings.borderRadius === 'large' ? '16px' : '8px'
    );
    
    element.style.setProperty('--theme-font-size', 
      settings.fontSize === 'small' ? '14px' :
      settings.fontSize === 'large' ? '18px' : '16px'
    );

  }, [colors, settings, elementRef]);

  return { colors, settings };
}

/**
 * Hook للحصول على كلاسات CSS للثيم الحالي
 */
export function useThemeClasses() {
  const { settings } = useCurrentTheme();

  const classes = {
    container: [
      'transition-all duration-300',
      settings.compactMode && 'theme-compact',
      !settings.enableAnimations && 'theme-no-animations'
    ].filter(Boolean).join(' '),

    card: [
      'theme-card',
      'transition-all duration-300',
      'hover:shadow-lg'
    ].join(' '),

    button: {
      primary: [
        'theme-button-primary',
        'transition-all duration-300',
        'hover:scale-105 active:scale-95'
      ].join(' '),
      
      secondary: [
        'theme-button-secondary', 
        'transition-all duration-300',
        'hover:scale-105 active:scale-95'
      ].join(' ')
    },

    text: {
      primary: 'theme-text-primary',
      secondary: 'theme-text-secondary',
      accent: 'theme-text-accent'
    },

    background: {
      surface: 'bg-[var(--theme-surface)]',
      primary: 'bg-[var(--theme-primary)]',
      secondary: 'bg-[var(--theme-secondary)]'
    },

    border: 'border-[var(--theme-border)]',
    
    shadow: settings.compactMode ? 'theme-shadow-sm' : 'theme-shadow'
  };

  return classes;
}

/**
 * Hook لتوليد أنماط inline للمكونات
 */
export function useThemeInlineStyles() {
  const { colors } = useCurrentTheme();

  const styles = {
    card: {
      backgroundColor: colors.surface,
      borderColor: colors.border,
      color: colors.text
    },

    button: {
      primary: {
        backgroundColor: colors.primary,
        color: 'white',
        border: 'none'
      },
      
      secondary: {
        backgroundColor: 'transparent',
        color: colors.primary,
        borderColor: colors.border
      }
    },

    text: {
      primary: { color: colors.text },
      secondary: { color: colors.textSecondary },
      accent: { color: colors.accent }
    },

    status: {
      success: { color: colors.success },
      warning: { color: colors.warning },
      error: { color: colors.error },
      info: { color: colors.info }
    },

    gradient: {
      primary: {
        background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`
      },
      accent: {
        background: `linear-gradient(135deg, ${colors.accent}, ${colors.primary})`
      }
    }
  };

  return styles;
}

/**
 * Hook للحصول على لون بتدرج شفافية محدد
 */
export function useThemeColor() {
  const { colors } = useCurrentTheme();

  const getColorWithOpacity = (colorKey: keyof typeof colors, opacity: number) => {
    const color = colors[colorKey];
    if (color.startsWith('#')) {
      const r = parseInt(color.slice(1, 3), 16);
      const g = parseInt(color.slice(3, 5), 16);
      const b = parseInt(color.slice(5, 7), 16);
      return `rgba(${r}, ${g}, ${b}, ${opacity})`;
    }
    return color;
  };

  const generatePalette = (baseColor: string) => ({
    50: getColorWithOpacity('primary', 0.05),
    100: getColorWithOpacity('primary', 0.1),
    200: getColorWithOpacity('primary', 0.2),
    300: getColorWithOpacity('primary', 0.3),
    400: getColorWithOpacity('primary', 0.4),
    500: baseColor,
    600: getColorWithOpacity('primary', 0.8),
    700: getColorWithOpacity('primary', 0.9),
    800: getColorWithOpacity('primary', 0.95),
    900: getColorWithOpacity('primary', 1),
  });

  return {
    colors,
    getColorWithOpacity,
    generatePalette,
    primary: generatePalette(colors.primary),
    secondary: generatePalette(colors.secondary),
    accent: generatePalette(colors.accent)
  };
}

/**
 * Hook للتحقق من حالة الثيم
 */
export function useThemeState() {
  const { settings, scheme, isDark } = useCurrentTheme();

  return {
    isDarkMode: isDark,
    isCompactMode: settings.compactMode,
    hasAnimations: settings.enableAnimations,
    currentScheme: scheme.displayName,
    fontSize: settings.fontSize,
    borderRadius: settings.borderRadius
  };
}
