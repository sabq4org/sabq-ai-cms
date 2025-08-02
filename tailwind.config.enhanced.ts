/**
 * إعدادات Tailwind المحسنة لنظام التصميم الموحد
 * Enhanced Tailwind Configuration for Design System
 */

import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: ['class'],
  theme: {
    extend: {
      // ألوان نظام التصميم الموحد
      colors: {
        // الألوان الأساسية
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
          950: '#172554',
        },

        // ألوان الحالة المحسنة
        success: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
          950: '#052e16',
        },

        warning: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
          950: '#451a03',
        },

        danger: {
          50: '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca',
          300: '#fca5a5',
          400: '#f87171',
          500: '#ef4444',
          600: '#dc2626',
          700: '#b91c1c',
          800: '#991b1b',
          900: '#7f1d1d',
          950: '#450a0a',
        },

        // ألوان محايدة محسنة
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
          900: '#171717',
          950: '#0a0a0a',
        },

        // ألوان مخصصة للمنصة
        sabq: {
          blue: '#2563eb',
          green: '#16a34a',
          purple: '#7c3aed',
          orange: '#ea580c',
          teal: '#0d9488',
        },
      },

      // خطوط محسنة
      fontFamily: {
        sans: ['Cairo', 'Inter', 'system-ui', 'sans-serif'],
        arabic: ['Cairo', 'system-ui', 'sans-serif'],
        english: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },

      // أحجام الخطوط المعيارية
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1rem' }],
        'sm': ['0.875rem', { lineHeight: '1.25rem' }],
        'base': ['1rem', { lineHeight: '1.5rem' }],
        'lg': ['1.125rem', { lineHeight: '1.75rem' }],
        'xl': ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
        '5xl': ['3rem', { lineHeight: '1' }],
        '6xl': ['3.75rem', { lineHeight: '1' }],
      },

      // مسافات مخصصة
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
        '144': '36rem',
      },

      // أشعة حدودية محسنة
      borderRadius: {
        'none': '0',
        'sm': '0.375rem',
        'DEFAULT': '0.5rem',
        'md': '0.5rem',
        'lg': '0.75rem',
        'xl': '1rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
        'full': '9999px',
      },

      // ظلال محسنة
      boxShadow: {
        'sm': '0 1px 2px 0 rgb(0 0 0 / 0.05)',
        'DEFAULT': '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
        'md': '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
        'lg': '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
        'xl': '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
        '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
        'inner': 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
        'none': 'none',

        // ظلال مخصصة للوضع المظلم
        'dark-sm': '0 1px 2px 0 rgb(0 0 0 / 0.3)',
        'dark-md': '0 4px 6px -1px rgb(0 0 0 / 0.3), 0 2px 4px -2px rgb(0 0 0 / 0.3)',
        'dark-lg': '0 10px 15px -3px rgb(0 0 0 / 0.4), 0 4px 6px -4px rgb(0 0 0 / 0.4)',
      },

      // تحريك محسن
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'bounce-subtle': 'bounceSubtle 0.6s ease-in-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },

      // إطارات التحريك المخصصة
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': {
            opacity: '0',
            transform: 'translateY(1rem)',
          },
          '100%': {
            opacity: '1',
            transform: 'translateY(0)',
          },
        },
        slideDown: {
          '0%': {
            opacity: '0',
            transform: 'translateY(-1rem)',
          },
          '100%': {
            opacity: '1',
            transform: 'translateY(0)',
          },
        },
        scaleIn: {
          '0%': {
            opacity: '0',
            transform: 'scale(0.95)',
          },
          '100%': {
            opacity: '1',
            transform: 'scale(1)',
          },
        },
        bounceSubtle: {
          '0%, 100%': {
            transform: 'translateY(0)',
          },
          '50%': {
            transform: 'translateY(-4px)',
          },
        },
      },

      // مسارات انتقال محسنة
      transitionTimingFunction: {
        'bounce-in': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        'ease-in-out-back': 'cubic-bezier(0.68, -0.6, 0.32, 1.6)',
      },

      // متغيرات CSS مخصصة
      screens: {
        'xs': '475px',
        'sm': '640px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1280px',
        '2xl': '1536px',
        '3xl': '1920px',
      },

      // متغيرات الشبكة
      gridTemplateColumns: {
        'auto-fill-280': 'repeat(auto-fill, minmax(280px, 1fr))',
        'auto-fit-280': 'repeat(auto-fit, minmax(280px, 1fr))',
        'auto-fill-320': 'repeat(auto-fill, minmax(320px, 1fr))',
        'auto-fit-320': 'repeat(auto-fit, minmax(320px, 1fr))',
      },
    },
  },
  plugins: [
    // إضافة مكونات مخصصة
    function({ addComponents, theme }: any) {
      addComponents({
        // مكونات الطباعة
        '.text-heading-1': {
          fontSize: theme('fontSize.4xl')[0],
          fontWeight: theme('fontWeight.bold'),
          lineHeight: theme('fontSize.4xl')[1].lineHeight,
          color: theme('colors.gray.900'),
        },
        '.text-heading-2': {
          fontSize: theme('fontSize.2xl')[0],
          fontWeight: theme('fontWeight.semibold'),
          lineHeight: theme('fontSize.2xl')[1].lineHeight,
          color: theme('colors.gray.800'),
        },
        '.text-heading-3': {
          fontSize: theme('fontSize.xl')[0],
          fontWeight: theme('fontWeight.medium'),
          lineHeight: theme('fontSize.xl')[1].lineHeight,
          color: theme('colors.gray.700'),
        },
        '.text-body': {
          fontSize: theme('fontSize.base')[0],
          lineHeight: theme('fontSize.base')[1].lineHeight,
          color: theme('colors.gray.600'),
        },
        '.text-caption': {
          fontSize: theme('fontSize.sm')[0],
          lineHeight: theme('fontSize.sm')[1].lineHeight,
          color: theme('colors.gray.500'),
        },

        // مكونات البطاقات
        '.card-default': {
          backgroundColor: theme('colors.white'),
          borderWidth: '1px',
          borderColor: theme('colors.gray.200'),
          borderRadius: theme('borderRadius.xl'),
          boxShadow: theme('boxShadow.sm'),
        },
        '.card-hover': {
          transition: 'box-shadow 200ms ease',
          '&:hover': {
            boxShadow: theme('boxShadow.md'),
          },
        },

        // مكونات الأزرار
        '.btn-base': {
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: theme('borderRadius.lg'),
          fontWeight: theme('fontWeight.semibold'),
          transition: 'all 200ms ease',
          '&:focus': {
            outline: 'none',
            boxShadow: `0 0 0 3px ${theme('colors.blue.500')}40`,
          },
          '&:active': {
            transform: 'scale(0.95)',
          },
        },

        // أنماط التركيز
        '.focus-ring': {
          '&:focus': {
            outline: 'none',
            boxShadow: `0 0 0 3px ${theme('colors.blue.500')}40`,
          },
        },

        // أنماط الشبكة
        '.grid-auto-280': {
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: theme('spacing.6'),
        },
        '.grid-auto-320': {
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: theme('spacing.6'),
        },
      });
    },

    // إضافة أدوات مساعدة
    function({ addUtilities }: any) {
      addUtilities({
        '.scrollbar-hide': {
          '-ms-overflow-style': 'none',
          'scrollbar-width': 'none',
          '&::-webkit-scrollbar': {
            display: 'none',
          },
        },
        '.scrollbar-thin': {
          'scrollbar-width': 'thin',
          '&::-webkit-scrollbar': {
            width: '8px',
            height: '8px',
          },
          '&::-webkit-scrollbar-track': {
            backgroundColor: '#f1f5f9',
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: '#cbd5e1',
            borderRadius: '4px',
          },
          '&::-webkit-scrollbar-thumb:hover': {
            backgroundColor: '#94a3b8',
          },
        },
        '.direction-rtl': {
          direction: 'rtl',
        },
        '.direction-ltr': {
          direction: 'ltr',
        },
        '.writing-vertical': {
          'writing-mode': 'vertical-rl',
        },
      });
    },

    // دعم متقدم للنماذج
    require('@tailwindcss/forms'),

    // دعم التخطيط المتقدم
    require('@tailwindcss/container-queries'),
  ],
} satisfies Config;

export default config;
