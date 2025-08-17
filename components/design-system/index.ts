/**
 * 📦 نظام التصميم الموحد - ملف التصدير الرئيسي
 * Unified Design System - Main Export File
 */

// 🎨 نظام الألوان والثيم
export { 
  sabqTheme, 
  darkTheme, 
  lightTheme, 
  cssClasses, 
  getColorValue 
} from '@/lib/design-system/theme';

// 🃏 المكونات الأساسية
export { default as SabqCard } from './SabqCard';
export type { SabqCardProps } from './SabqCard';

export { default as SabqButton } from './SabqButton';
export type { SabqButtonProps } from './SabqButton';

export { default as SabqInput } from './SabqInput';
export type { SabqInputProps } from './SabqInput';

export { default as SabqStatCard } from './SabqStatCard';
export type { SabqStatCardProps } from './SabqStatCard';

// 🏗️ Layout والتخطيط
export { default as DashboardLayout } from './DashboardLayout';
export type { DashboardLayoutProps } from './DashboardLayout';

// 🎯 المساعدات والأدوات
export const designSystemUtils = {
  // 🎨 مساعدات الألوان
  getThemeColor: (colorPath: string, isDark = false) => getColorValue(colorPath, isDark),
  
  // 📱 مساعدات التصميم المتجاوب
  breakpoints: sabqTheme.breakpoints,
  
  // 📐 مساعدات المسافات
  spacing: sabqTheme.spacing,
  
  // 🎭 مساعدات الرسوم المتحركة
  animations: sabqTheme.animation
};

// 🔧 Hooks مفيدة للنظام
export const useDesignSystem = () => {
  return {
    theme: sabqTheme,
    darkTheme,
    lightTheme,
    cssClasses,
    utils: designSystemUtils
  };
};