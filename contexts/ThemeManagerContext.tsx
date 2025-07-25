'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useTheme } from './ThemeContext';

// تعريف الأنواع
interface ColorScheme {
  id: string;
  name: string;
  displayName: string;
  colors: Record<string, string>;
  darkMode: Record<string, string>;
}

interface ThemeSettings {
  currentScheme: string;
  customColors: Record<string, string>;
  enableAnimations: boolean;
  compactMode: boolean;
  borderRadius: 'none' | 'small' | 'medium' | 'large';
  fontSize: 'small' | 'medium' | 'large';
  autoTheme: boolean;
  previewMode: boolean;
}

interface ThemeManagerContextType {
  settings: ThemeSettings;
  setSettings: (settings: ThemeSettings | ((prev: ThemeSettings) => ThemeSettings)) => void;
  customScheme: ColorScheme | null;
  setCustomScheme: (scheme: ColorScheme | null) => void;
  applyTheme: () => void;
  saveSettings: () => Promise<void>;
  resetToDefault: () => void;
  exportTheme: () => void;
  importTheme: (data: any) => void;
  predefinedSchemes: ColorScheme[];
  isLoading: boolean;
}

const ThemeManagerContext = createContext<ThemeManagerContextType | undefined>(undefined);

// الثيمات المُعرّفة مسبقاً
const predefinedSchemes: ColorScheme[] = [
  {
    id: 'sabq',
    name: 'sabq',
    displayName: 'ثيم سبق الافتراضي',
    colors: {
      primary: '#1e40af',
      secondary: '#3b82f6',
      accent: '#06b6d4',
      background: '#ffffff',
      surface: '#f8fafc',
      text: '#1e293b',
      textSecondary: '#64748b',
      border: '#e2e8f0',
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
      info: '#3b82f6'
    },
    darkMode: {
      primary: '#3b82f6',
      secondary: '#60a5fa',
      accent: '#22d3ee',
      background: '#0f172a',
      surface: '#1e293b',
      text: '#f1f5f9',
      textSecondary: '#cbd5e1',
      border: '#334155',
      success: '#22c55e',
      warning: '#fbbf24',
      error: '#f87171',
      info: '#60a5fa'
    }
  },
  {
    id: 'emerald',
    name: 'emerald',
    displayName: 'الزمرد الأخضر',
    colors: {
      primary: '#059669',
      secondary: '#10b981',
      accent: '#34d399',
      background: '#ffffff',
      surface: '#f0fdf4',
      text: '#064e3b',
      textSecondary: '#374151',
      border: '#d1fae5',
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
      info: '#3b82f6'
    },
    darkMode: {
      primary: '#10b981',
      secondary: '#34d399',
      accent: '#6ee7b7',
      background: '#022c22',
      surface: '#064e3b',
      text: '#ecfdf5',
      textSecondary: '#a7f3d0',
      border: '#065f46',
      success: '#22c55e',
      warning: '#fbbf24',
      error: '#f87171',
      info: '#60a5fa'
    }
  },
  {
    id: 'purple',
    name: 'purple',
    displayName: 'البنفسجي الملكي',
    colors: {
      primary: '#7c3aed',
      secondary: '#8b5cf6',
      accent: '#a78bfa',
      background: '#ffffff',
      surface: '#faf5ff',
      text: '#581c87',
      textSecondary: '#6b7280',
      border: '#e9d5ff',
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
      info: '#3b82f6'
    },
    darkMode: {
      primary: '#8b5cf6',
      secondary: '#a78bfa',
      accent: '#c4b5fd',
      background: '#1e1b4b',
      surface: '#312e81',
      text: '#f3f4f6',
      textSecondary: '#d1d5db',
      border: '#4c1d95',
      success: '#22c55e',
      warning: '#fbbf24',
      error: '#f87171',
      info: '#60a5fa'
    }
  },
  {
    id: 'rose',
    name: 'rose',
    displayName: 'الوردي الدافئ',
    colors: {
      primary: '#e11d48',
      secondary: '#f43f5e',
      accent: '#fb7185',
      background: '#ffffff',
      surface: '#fff1f2',
      text: '#881337',
      textSecondary: '#6b7280',
      border: '#fecdd3',
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
      info: '#3b82f6'
    },
    darkMode: {
      primary: '#f43f5e',
      secondary: '#fb7185',
      accent: '#fda4af',
      background: '#4c0519',
      surface: '#881337',
      text: '#f9fafb',
      textSecondary: '#d1d5db',
      border: '#9f1239',
      success: '#22c55e',
      warning: '#fbbf24',
      error: '#f87171',
      info: '#60a5fa'
    }
  },
  {
    id: 'orange',
    name: 'orange',
    displayName: 'البرتقالي الحيوي',
    colors: {
      primary: '#ea580c',
      secondary: '#f97316',
      accent: '#fb923c',
      background: '#ffffff',
      surface: '#fff7ed',
      text: '#7c2d12',
      textSecondary: '#6b7280',
      border: '#fed7aa',
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
      info: '#3b82f6'
    },
    darkMode: {
      primary: '#f97316',
      secondary: '#fb923c',
      accent: '#fdba74',
      background: '#431407',
      surface: '#7c2d12',
      text: '#f9fafb',
      textSecondary: '#d1d5db',
      border: '#9a3412',
      success: '#22c55e',
      warning: '#fbbf24',
      error: '#f87171',
      info: '#60a5fa'
    }
  }
];

export function ThemeManagerProvider({ children }: { children: React.ReactNode }) {
  const { resolvedTheme } = useTheme();
  const [settings, setSettings] = useState<ThemeSettings>({
    currentScheme: 'sabq',
    customColors: {},
    enableAnimations: true,
    compactMode: false,
    borderRadius: 'medium',
    fontSize: 'medium',
    autoTheme: false,
    previewMode: false
  });
  const [customScheme, setCustomScheme] = useState<ColorScheme | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // تحميل الإعدادات من localStorage
  useEffect(() => {
    try {
      const savedSettings = localStorage.getItem('theme-manager-settings');
      if (savedSettings) {
        const parsed = JSON.parse(savedSettings);
        setSettings(parsed);
      }
      
      const savedCustomScheme = localStorage.getItem('theme-manager-custom-scheme');
      if (savedCustomScheme) {
        const parsed = JSON.parse(savedCustomScheme);
        setCustomScheme(parsed);
      }
    } catch (error) {
      console.error('خطأ في تحميل إعدادات إدارة الثيم:', error);
    }
  }, []);

  // تطبيق الثيم على الصفحة
  const applyTheme = useCallback(() => {
    try {
      console.log('🎨 بدء تطبيق الثيم:', settings.currentScheme);
      
      const root = document.documentElement;
      const currentSchemeData = predefinedSchemes.find(s => s.id === settings.currentScheme) || 
                                customScheme || 
                                predefinedSchemes[0];
      
      console.log('📦 بيانات الثيم المحدد:', currentSchemeData);
      
      const colors = resolvedTheme === 'dark' ? currentSchemeData.darkMode : currentSchemeData.colors;
      
      console.log('🎯 الألوان المطبقة:', colors);
      console.log('🌙 الوضع الحالي:', resolvedTheme === 'dark' ? 'ليلي' : 'نهاري');
      
      // تطبيق متغيرات CSS للألوان
      Object.entries(colors).forEach(([key, value]) => {
        root.style.setProperty(`--theme-${key}`, value);
        console.log(`✅ تم تطبيق: --theme-${key} = ${value}`);
      });
      
      // تطبيق كلاس الثيم
      root.classList.remove('theme-sabq', 'theme-emerald', 'theme-purple', 'theme-rose', 'theme-orange');
      if (currentSchemeData.id !== 'sabq') {
        root.classList.add(`theme-${currentSchemeData.id}`);
        console.log(`🏷️ تم إضافة كلاس: theme-${currentSchemeData.id}`);
      } else {
        console.log('🏷️ إزالة جميع كلاسات الثيم (الثيم الافتراضي)');
      }
      
      // تطبيق إعدادات إضافية
      root.style.setProperty('--theme-border-radius', 
        settings.borderRadius === 'none' ? '0px' :
        settings.borderRadius === 'small' ? '4px' :
        settings.borderRadius === 'large' ? '16px' : '8px'
      );
      
      root.style.setProperty('--theme-font-size', 
        settings.fontSize === 'small' ? '14px' :
        settings.fontSize === 'large' ? '18px' : '16px'
      );
      
      // تطبيق الكلاسات
      if (settings.compactMode) {
        root.classList.add('theme-compact');
      } else {
        root.classList.remove('theme-compact');
      }
      
      if (!settings.enableAnimations) {
        root.classList.add('theme-no-animations');
      } else {
        root.classList.remove('theme-no-animations');
      }
      
      // إجبار إعادة تطبيق الأنماط
      console.log('🔄 إجبار إعادة تطبيق الأنماط...');
      setTimeout(() => {
        document.body.style.display = 'none';
        document.body.offsetHeight; // trigger reflow
        document.body.style.display = '';
        console.log('✨ تم إجبار إعادة التطبيق');
      }, 50);
      
      console.log('🎉 تم تطبيق الثيم بنجاح!');
      
    } catch (error) {
      console.error('❌ خطأ في تطبيق الثيم:', error);
    }
  }, [settings, customScheme, resolvedTheme]);

  // تطبيق الثيم عند تغيير الإعدادات
  useEffect(() => {
    applyTheme();
  }, [applyTheme]);

  // حفظ الإعدادات
  const saveSettings = useCallback(async () => {
    try {
      console.log('💾 بدء حفظ الإعدادات:', settings);
      setIsLoading(true);
      
      localStorage.setItem('theme-manager-settings', JSON.stringify(settings));
      console.log('✅ تم حفظ الإعدادات في localStorage');
      
      if (customScheme) {
        localStorage.setItem('theme-manager-custom-scheme', JSON.stringify(customScheme));
        console.log('✅ تم حفظ الثيم المخصص في localStorage');
      }
      
      // تطبيق الثيم فوراً
      console.log('🔄 تطبيق الثيم بعد الحفظ...');
      applyTheme();
      
      console.log('🎉 تم حفظ وتطبيق الثيم بنجاح!');
      
    } catch (error) {
      console.error('❌ خطأ في حفظ إعدادات الثيم:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [settings, customScheme, applyTheme]);

  // إعادة تعيين للإعدادات الافتراضية
  const resetToDefault = useCallback(() => {
    setSettings({
      currentScheme: 'sabq',
      customColors: {},
      enableAnimations: true,
      compactMode: false,
      borderRadius: 'medium',
      fontSize: 'medium',
      autoTheme: false,
      previewMode: false
    });
    setCustomScheme(null);
    localStorage.removeItem('theme-manager-settings');
    localStorage.removeItem('theme-manager-custom-scheme');
  }, []);

  // تصدير الثيم
  const exportTheme = useCallback(() => {
    const exportData = {
      settings,
      customScheme,
      timestamp: new Date().toISOString(),
      version: '1.0.0'
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sabq-theme-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [settings, customScheme]);

  // استيراد الثيم
  const importTheme = useCallback((data: any) => {
    try {
      if (data.settings) {
        setSettings(data.settings);
      }
      if (data.customScheme) {
        setCustomScheme(data.customScheme);
      }
    } catch (error) {
      console.error('خطأ في استيراد الثيم:', error);
      throw error;
    }
  }, []);

  const contextValue: ThemeManagerContextType = {
    settings,
    setSettings,
    customScheme,
    setCustomScheme,
    applyTheme,
    saveSettings,
    resetToDefault,
    exportTheme,
    importTheme,
    predefinedSchemes,
    isLoading
  };

  return (
    <ThemeManagerContext.Provider value={contextValue}>
      {children}
    </ThemeManagerContext.Provider>
  );
}

export function useThemeManager() {
  const context = useContext(ThemeManagerContext);
  if (context === undefined) {
    throw new Error('useThemeManager must be used within a ThemeManagerProvider');
  }
  return context;
}

// دالة مساعدة لتطبيق الثيم بشكل عام
export function applyGlobalTheme(schemeId: string, isDark: boolean = false) {
  console.log('🌍 تطبيق الثيم العام:', schemeId, isDark ? 'ليلي' : 'نهاري');
  
  const scheme = predefinedSchemes.find(s => s.id === schemeId) || predefinedSchemes[0];
  const colors = isDark ? scheme.darkMode : scheme.colors;
  const root = document.documentElement;
  
  // إزالة جميع كلاسات الثيم السابقة
  root.classList.remove('theme-sabq', 'theme-emerald', 'theme-purple', 'theme-rose', 'theme-orange');
  
  // تطبيق متغيرات الألوان
  Object.entries(colors).forEach(([key, value]) => {
    root.style.setProperty(`--theme-${key}`, value);
    console.log(`🎨 تطبيق: --theme-${key} = ${value}`);
  });
  
  // إضافة كلاس الثيم الجديد
  if (schemeId !== 'sabq') {
    root.classList.add(`theme-${schemeId}`);
    console.log(`✅ تم إضافة كلاس: theme-${schemeId}`);
  }
  
  // إجبار إعادة تطبيق الأنماط
  setTimeout(() => {
    document.body.style.display = 'none';
    document.body.offsetHeight; // trigger reflow
    document.body.style.display = '';
  }, 100);
}

// Hook للحصول على الثيم الحالي
export function useCurrentTheme() {
  const { settings, customScheme } = useThemeManager();
  const { resolvedTheme } = useTheme();
  
  const currentSchemeData = predefinedSchemes.find(s => s.id === settings.currentScheme) || 
                           customScheme || 
                           predefinedSchemes[0];
  
  const colors = resolvedTheme === 'dark' ? currentSchemeData.darkMode : currentSchemeData.colors;
  
  return {
    scheme: currentSchemeData,
    colors,
    settings,
    isDark: resolvedTheme === 'dark'
  };
}
