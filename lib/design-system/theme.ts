/**
 * 🎨 نظام الألوان والثيم الموحد لسبق الذكية
 * Unified Color System & Theme for Sabq AI CMS
 */

export const sabqTheme = {
  // 🌈 الألوان الأساسية - Primary Colors
  colors: {
    primary: {
      50: '#eff6ff',
      100: '#dbeafe', 
      200: '#bfdbfe',
      300: '#93c5fd',
      400: '#60a5fa',
      500: '#3b82f6', // اللون الأساسي الرئيسي
      600: '#2563eb',
      700: '#1d4ed8',
      800: '#1e40af',
      900: '#1e3a8a',
      950: '#172554'
    },
    
    // ألوان حالات النظام
    success: {
      50: '#f0fdf4',
      100: '#dcfce7',
      200: '#bbf7d0',
      300: '#86efac',
      400: '#4ade80',
      500: '#22c55e', // نجاح
      600: '#16a34a',
      700: '#15803d',
      800: '#166534',
      900: '#14532d'
    },
    
    warning: {
      50: '#fffbeb',
      100: '#fef3c7',
      200: '#fde68a',
      300: '#fcd34d',
      400: '#fbbf24',
      500: '#f59e0b', // تحذير
      600: '#d97706',
      700: '#b45309',
      800: '#92400e',
      900: '#78350f'
    },
    
    error: {
      50: '#fef2f2',
      100: '#fee2e2',
      200: '#fecaca',
      300: '#fca5a5',
      400: '#f87171',
      500: '#ef4444', // خطأ
      600: '#dc2626',
      700: '#b91c1c',
      800: '#991b1b',
      900: '#7f1d1d'
    },
    
    // ألوان رمادية محسنة
    gray: {
      50: '#f9fafb',
      100: '#f3f4f6',
      200: '#e5e7eb',
      300: '#d1d5db',
      400: '#9ca3af',
      500: '#6b7280',
      600: '#4b5563',
      700: '#374151',
      800: '#1f2937',
      900: '#111827',
      950: '#030712'
    }
  },

  // 📐 المسافات الموحدة - Consistent Spacing
  spacing: {
    xs: '0.25rem',   // 4px
    sm: '0.5rem',    // 8px
    md: '0.75rem',   // 12px
    lg: '1rem',      // 16px
    xl: '1.5rem',    // 24px
    '2xl': '2rem',   // 32px
    '3xl': '2.5rem', // 40px
    '4xl': '3rem',   // 48px
    '5xl': '4rem',   // 64px
    '6xl': '5rem',   // 80px
  },

  // 🎯 أحجام الخطوط - Typography Scale
  typography: {
    size: {
      xs: '0.75rem',     // 12px
      sm: '0.875rem',    // 14px
      base: '1rem',      // 16px
      lg: '1.125rem',    // 18px
      xl: '1.25rem',     // 20px
      '2xl': '1.5rem',   // 24px
      '3xl': '1.875rem', // 30px
      '4xl': '2.25rem',  // 36px
      '5xl': '3rem',     // 48px
    },
    
    weight: {
      light: '300',
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
      extrabold: '800'
    },
    
    lineHeight: {
      tight: '1.25',
      normal: '1.5',
      relaxed: '1.625'
    }
  },

  // 🌟 الظلال الموحدة - Consistent Shadows
  shadows: {
    xs: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    sm: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
    inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)'
  },

  // 🎭 الانيميشن والتحولات - Animations & Transitions
  animation: {
    duration: {
      fast: '150ms',
      normal: '300ms',
      slow: '500ms'
    },
    
    easing: {
      linear: 'linear',
      in: 'cubic-bezier(0.4, 0, 1, 1)',
      out: 'cubic-bezier(0, 0, 0.2, 1)',
      inOut: 'cubic-bezier(0.4, 0, 0.2, 1)'
    }
  },

  // 📱 نقاط التحول للشاشات - Responsive Breakpoints
  breakpoints: {
    sm: '640px',
    md: '768px', 
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px'
  },

  // 🔘 أشعة الزوايا الموحدة - Consistent Border Radius
  borderRadius: {
    none: '0',
    sm: '0.125rem',   // 2px
    md: '0.375rem',   // 6px
    lg: '0.5rem',     // 8px
    xl: '0.75rem',    // 12px
    '2xl': '1rem',    // 16px
    '3xl': '1.5rem',  // 24px
    full: '9999px'
  }
};

// 🌙 ألوان الوضع المظلم - Dark Mode Colors
export const darkTheme = {
  background: {
    primary: sabqTheme.colors.gray[900],
    secondary: sabqTheme.colors.gray[800],
    tertiary: sabqTheme.colors.gray[700]
  },
  
  text: {
    primary: sabqTheme.colors.gray[50],
    secondary: sabqTheme.colors.gray[300],
    tertiary: sabqTheme.colors.gray[400]
  },
  
  border: {
    primary: sabqTheme.colors.gray[700],
    secondary: sabqTheme.colors.gray[600]
  }
};

// ☀️ ألوان الوضع الفاتح - Light Mode Colors
export const lightTheme = {
  background: {
    primary: sabqTheme.colors.gray[50],
    secondary: '#ffffff',
    tertiary: sabqTheme.colors.gray[100]
  },
  
  text: {
    primary: sabqTheme.colors.gray[900],
    secondary: sabqTheme.colors.gray[600],
    tertiary: sabqTheme.colors.gray[500]
  },
  
  border: {
    primary: sabqTheme.colors.gray[200],
    secondary: sabqTheme.colors.gray[300]
  }
};

// 🎯 مساعدات للألوان - Color Utilities
export const getColorValue = (colorPath: string, isDark = false) => {
  const [colorName, shade] = colorPath.split('.');
  const theme = isDark ? darkTheme : lightTheme;
  
  // إذا كان لون أساسي من sabqTheme
  if (sabqTheme.colors[colorName as keyof typeof sabqTheme.colors]) {
    const colorGroup = sabqTheme.colors[colorName as keyof typeof sabqTheme.colors] as any;
    return colorGroup[shade] || colorGroup['500'];
  }
  
  // إذا كان من ألوان الثيم
  const themeGroup = theme[colorName as keyof typeof theme] as any;
  return themeGroup?.[shade] || sabqTheme.colors.primary[500];
};

// 🎨 صفوف CSS جاهزة - Ready CSS Classes
export const cssClasses = {
  // بطاقات موحدة
  card: {
    base: 'rounded-xl border transition-all duration-300',
    light: 'bg-white border-gray-200 hover:shadow-md',
    dark: 'bg-gray-800 border-gray-700 hover:bg-gray-750',
    elevated: 'shadow-lg hover:shadow-xl'
  },
  
  // أزرار موحدة
  button: {
    base: 'inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2',
    sizes: {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2 text-base',
      lg: 'px-6 py-3 text-lg'
    },
    variants: {
      primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
      secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-500',
      success: 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500',
      warning: 'bg-yellow-600 text-white hover:bg-yellow-700 focus:ring-yellow-500',
      error: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500'
    }
  },
  
  // نماذج موحدة
  input: {
    base: 'block w-full rounded-lg border transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
    light: 'border-gray-300 bg-white text-gray-900 placeholder-gray-500',
    dark: 'border-gray-600 bg-gray-700 text-white placeholder-gray-400'
  },
  
  // عناوين موحدة
  heading: {
    h1: 'text-3xl font-bold tracking-tight',
    h2: 'text-2xl font-semibold tracking-tight', 
    h3: 'text-xl font-semibold',
    h4: 'text-lg font-medium',
    h5: 'text-base font-medium',
    h6: 'text-sm font-medium'
  }
};

export default sabqTheme;