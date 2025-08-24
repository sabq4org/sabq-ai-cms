'use client';

import React, { useState, useEffect } from 'react';
import { PaintBrushIcon } from '@heroicons/react/24/outline';

// نظام الألوان المتغيرة
const themes = [
  { 
    id: 'default', 
    name: 'بلا لون', 
    color: '#3b82f6', // اللون الافتراضي للموقع
    rgb: '59 130 246',
    gradient: 'from-blue-500 to-blue-600',
    isDefault: true 
  },
  { 
    id: 'blue', 
    name: 'أزرق', 
    color: '#3b82f6', 
    rgb: '59 130 246',
    gradient: 'from-blue-500 to-blue-600' 
  },
  { 
    id: 'green', 
    name: 'أخضر', 
    color: '#10b981', 
    rgb: '16 185 129',
    gradient: 'from-green-500 to-green-600' 
  },
  { 
    id: 'purple', 
    name: 'بنفسجي', 
    color: '#8b5cf6', 
    rgb: '139 92 246',
    gradient: 'from-purple-500 to-purple-600' 
  },
  { 
    id: 'pink', 
    name: 'وردي', 
    color: '#ec4899', 
    rgb: '236 72 153',
    gradient: 'from-pink-500 to-pink-600' 
  },
  { 
    id: 'orange', 
    name: 'برتقالي', 
    color: '#f59e0b', 
    rgb: '245 158 11',
    gradient: 'from-orange-500 to-orange-600' 
  },
  { 
    id: 'red', 
    name: 'أحمر', 
    color: '#ef4444', 
    rgb: '239 68 68',
    gradient: 'from-red-500 to-red-600' 
  },
];

interface CompactThemeSwitcherProps {
  className?: string;
}

export default function CompactThemeSwitcher({ className = '' }: CompactThemeSwitcherProps) {
  const [currentTheme, setCurrentTheme] = useState(themes[0]); // الافتراضي هو "بلا لون"
  const [focused, setFocused] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // إغلاق المكون عند النقر خارجه
  useEffect(() => {
    if (!focused) return;
    
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('[data-compact-theme-switcher]')) {
        setFocused(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [focused]);

  // استمع لتغييرات localStorage من علامات تبويب أخرى
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'theme-color' && e.newValue) {
        const theme = themes.find(t => t.id === e.newValue) || themes[0];
        setCurrentTheme(theme);
        setThemeVars(theme);
        console.log('🔄 Theme synced from another tab:', theme);
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // تحميل اللون المحفوظ عند التحميل
  useEffect(() => {
    // تأخير بسيط للتأكد من أن DOM جاهز
    const initializeTheme = () => {
      const savedTheme = localStorage.getItem('theme-color');
      console.log('🔍 Saved theme in localStorage:', savedTheme);
      
      let themeToApply;
      if (savedTheme) {
        themeToApply = themes.find(t => t.id === savedTheme) || themes[0];
        console.log('✅ Found saved theme:', themeToApply);
      } else {
        themeToApply = themes[0]; // الافتراضي هو "بلا لون"
        console.log('⚠️ No saved theme, using default:', themeToApply);
        // لا نحفظ "بلا لون" في localStorage لتجنب الخلط
        if (!themeToApply.isDefault) {
          localStorage.setItem('theme-color', themeToApply.id);
        } else {
          localStorage.removeItem('theme-color');
        }
      }
      
      setCurrentTheme(themeToApply);
      setThemeVars(themeToApply);
      setIsInitialized(true);
    };

    // تأخير بسيط للتأكد من تحميل DOM
    const timer = setTimeout(initializeTheme, 100);
    return () => clearTimeout(timer);
  }, []);

  // التأكد من تطبيق الثيم عند تغيير currentTheme
  useEffect(() => {
    if (currentTheme && isInitialized) {
      setThemeVars(currentTheme);
    }
  }, [currentTheme, isInitialized]);

  // تحويل Hex إلى HSL (لضبط متغيرات --accent كما في النسخة الكاملة)
  const hexToHsl = (hex: string) => {
    let r = 0, g = 0, b = 0;
    const clean = hex.replace('#', '');
    if (clean.length === 3) {
      r = parseInt(clean[0] + clean[0], 16);
      g = parseInt(clean[1] + clean[1], 16);
      b = parseInt(clean[2] + clean[2], 16);
    } else if (clean.length === 6) {
      r = parseInt(clean.substring(0, 2), 16);
      g = parseInt(clean.substring(2, 4), 16);
      b = parseInt(clean.substring(4, 6), 16);
    }
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h = 0, s = 0; let l = (max + min) / 2;
    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }
    return {
      h: Math.round(h * 360),
      s: Math.round(s * 100),
      l: Math.round(l * 100),
    };
  };

  const setThemeVars = (theme: typeof themes[0]) => {
    const root = document.documentElement;
    
    // إزالة جميع data-theme attributes القديمة
    themes.forEach(t => root.removeAttribute(`data-theme-${t.id}`));
    
    if (theme.isDefault) {
      // إذا كان "بلا لون"، إزالة جميع المتغيرات المخصصة
      root.removeAttribute('data-theme');
      root.style.removeProperty('--theme-primary');
      root.style.removeProperty('--theme-secondary');
      root.style.removeProperty('--theme-primary-rgb');
      root.style.removeProperty('--theme-primary-hover');
      root.style.removeProperty('--theme-primary-light');
      root.style.removeProperty('--theme-primary-lighter');
      root.style.removeProperty('--accent');
      root.style.removeProperty('--accent-hover');
      root.style.removeProperty('--accent-light');
      console.log('🎨 Theme reset to default (no custom colors)');
    } else {
      // تطبيق theme الجديد
      root.setAttribute('data-theme', theme.id);
      root.style.setProperty('--theme-primary', theme.color);
      root.style.setProperty('--theme-secondary', theme.color);
      root.style.setProperty('--theme-primary-rgb', theme.rgb);
      root.style.setProperty('--theme-primary-hover', theme.color);
      root.style.setProperty('--theme-primary-light', `rgba(${theme.rgb}, 0.1)`);
      root.style.setProperty('--theme-primary-lighter', `rgba(${theme.rgb}, 0.05)`);

      // ضبط متغيرات النسخة الكاملة (--accent*) لضمان توافق البلوكات القديمة
      const { h, s, l } = hexToHsl(theme.color);
      const hoverL = Math.max(0, Math.min(100, l - 5));
      const lightL = 96; // كما في النسخة الكاملة تقريباً
      root.style.setProperty('--accent', `${h} ${s}% ${l}%`);
      root.style.setProperty('--accent-hover', `${h} ${s}% ${hoverL}%`);
      root.style.setProperty('--accent-light', `${h} ${s}% ${lightL}%`);
      
      // إضافة console.log للتشخيص
      console.log(`🎨 Theme changed to: ${theme.name} (${theme.color})`);
      console.log('🔧 Applied CSS variables:', {
        '--theme-primary': theme.color,
        '--theme-primary-rgb': theme.rgb,
        '--accent': `${h} ${s}% ${l}%`,
        'data-theme': theme.id
      });
    }
  };

  const handleThemeChange = (themeId: string) => {
    const theme = themes.find(t => t.id === themeId) || themes[0];
    console.log('🎯 User selected theme:', theme);
    
    // تطبيق التغييرات
    setCurrentTheme(theme);
    setThemeVars(theme);
    
    // حفظ في localStorage فقط إذا لم يكن "بلا لون"
    if (theme.isDefault) {
      localStorage.removeItem('theme-color');
      console.log('💾 Removed theme from localStorage (using default)');
    } else {
      localStorage.setItem('theme-color', theme.id);
      console.log('💾 Saved to localStorage:', theme.id);
    }
    
    // إغلاق القائمة بعد الاختيار
    setFocused(false);
    
    // إشعار في الكونسول للتأكيد
    setTimeout(() => {
      console.log('🔍 Current CSS variables after change:');
      console.log('--theme-primary:', getComputedStyle(document.documentElement).getPropertyValue('--theme-primary'));
      console.log('data-theme:', document.documentElement.getAttribute('data-theme'));
    }, 100);
  };

  return (
    <div 
      className={`${className}`}
      data-compact-theme-switcher
      style={{
        position: 'relative',
        zIndex: 1000,
        transition: 'all 0.2s ease'
      }}
    >
      {!focused ? (
        // الحالة المطوية - زر صغير أنيق
        <button
          onClick={() => setFocused(!focused)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 10px',
            borderRadius: '8px',
            border: 'none',
            background: 'rgba(59, 130, 246, 0.1)',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            fontSize: '14px',
            fontWeight: '500',
            color: '#374151'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(59, 130, 246, 0.15)';
            e.currentTarget.style.transform = 'scale(1.02)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(59, 130, 246, 0.1)';
            e.currentTarget.style.transform = 'scale(1)';
          }}
          title={`الثيم: ${currentTheme.name}`}
        >
          {currentTheme.isDefault ? (
            <div 
              style={{
                width: '16px',
                height: '16px',
                borderRadius: '50%',
                background: 'white',
                border: '2px solid #9ca3af',
                position: 'relative',
                overflow: 'hidden',
                boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
              }}
            >
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                width: '120%',
                height: '2px',
                background: '#ef4444',
                transform: 'translate(-50%, -50%) rotate(-45deg)',
                transformOrigin: 'center'
              }} />
            </div>
          ) : (
            <div 
              style={{
                width: '16px',
                height: '16px',
                borderRadius: '50%',
                background: currentTheme.color,
                boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
              }}
            />
          )}
          <span style={{ fontSize: '12px', opacity: 0.8 }}>
            {currentTheme.name}
          </span>
        </button>
      ) : (
        // الحالة المتوسعة - قائمة الألوان
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 10px',
            borderRadius: '8px',
            background: 'white',
            border: '1px solid #e5e7eb',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
            transition: 'all 0.2s ease'
          }}
        >
          <PaintBrushIcon 
            style={{ 
              width: '16px', 
              height: '16px',
              color: '#6b7280',
              strokeWidth: 2
            }} 
          />
          <div style={{ display: 'flex', gap: '4px' }}>
            {themes.map((theme) => (
              <button
                key={theme.id}
                onClick={(e) => {
                  e.stopPropagation();
                  handleThemeChange(theme.id);
                }}
                style={{
                  width: '20px',
                  height: '20px',
                  borderRadius: '50%',
                  background: theme.isDefault ? 'white' : theme.color,
                  border: theme.isDefault 
                    ? (currentTheme.id === theme.id ? '2px solid #ef4444' : '2px solid #9ca3af')
                    : (currentTheme.id === theme.id ? '2px solid #ffffff' : '1px solid rgba(255,255,255,0.5)'),
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  transform: currentTheme.id === theme.id ? 'scale(1.1)' : 'scale(1)',
                  boxShadow: currentTheme.id === theme.id 
                    ? '0 0 0 2px rgba(59, 130, 246, 0.5)' 
                    : '0 1px 3px rgba(0,0,0,0.2)',
                  position: 'relative',
                  overflow: 'hidden'
                }}
                onMouseEnter={(e) => {
                  if (currentTheme.id !== theme.id) {
                    e.currentTarget.style.transform = 'scale(1.05)';
                    e.currentTarget.style.boxShadow = '0 2px 6px rgba(0,0,0,0.3)';
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = currentTheme.id === theme.id ? 'scale(1.1)' : 'scale(1)';
                  e.currentTarget.style.boxShadow = currentTheme.id === theme.id 
                    ? '0 0 0 2px rgba(59, 130, 246, 0.5)' 
                    : '0 1px 3px rgba(0,0,0,0.2)';
                }}
                title={theme.name}
              >
                {theme.isDefault && (
                  <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    width: '120%',
                    height: '2px',
                    background: '#ef4444',
                    transform: 'translate(-50%, -50%) rotate(-45deg)',
                    transformOrigin: 'center'
                  }} />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
