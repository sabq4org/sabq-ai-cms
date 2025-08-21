'use client';

import React, { useState, useEffect } from 'react';
import { PaintBrushIcon } from '@heroicons/react/24/outline';

// نظام الألوان المتغيرة
const themes = [
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
  const [currentTheme, setCurrentTheme] = useState(themes[0]);
  const [focused, setFocused] = useState(false);

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

  // تحميل اللون المحفوظ عند التحميل
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme-color');
    if (savedTheme) {
      const theme = themes.find(t => t.id === savedTheme) || themes[0];
      setCurrentTheme(theme);
      setThemeVars(theme);
    }
  }, []);

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
    // إزالة جميع data-theme attributes
    themes.forEach(t => root.removeAttribute(`data-theme-${t.id}`));
    // تطبيق theme الجديد
    root.setAttribute('data-theme', theme.id);
    root.style.setProperty('--theme-primary', theme.color);
    root.style.setProperty('--theme-primary-rgb', theme.rgb);
    root.style.setProperty('--theme-primary-light', `rgba(${theme.rgb}, 0.1)`);
    root.style.setProperty('--theme-primary-lighter', `rgba(${theme.rgb}, 0.05)`);

    // ضبط متغيرات النسخة الكاملة (--accent*) لضمان توافق البلوكات القديمة
    const { h, s, l } = hexToHsl(theme.color);
    const hoverL = Math.max(0, Math.min(100, l - 5));
    const lightL = 96; // كما في النسخة الكاملة تقريباً
    root.style.setProperty('--accent', `${h} ${s}% ${l}%`);
    root.style.setProperty('--accent-hover', `${h} ${s}% ${hoverL}%`);
    root.style.setProperty('--accent-light', `${h} ${s}% ${lightL}%`);
  };

  const handleThemeChange = (themeId: string) => {
    const theme = themes.find(t => t.id === themeId) || themes[0];
    setCurrentTheme(theme);
    setThemeVars(theme);
    localStorage.setItem('theme-color', theme.id);
    setFocused(false); // إغلاق القائمة بعد الاختيار
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
          <div 
            style={{
              width: '16px',
              height: '16px',
              borderRadius: '50%',
              background: currentTheme.color,
              boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
            }}
          />
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
                  background: theme.color,
                  border: currentTheme.id === theme.id ? '2px solid #ffffff' : '1px solid rgba(255,255,255,0.5)',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  transform: currentTheme.id === theme.id ? 'scale(1.1)' : 'scale(1)',
                  boxShadow: currentTheme.id === theme.id 
                    ? '0 0 0 2px rgba(59, 130, 246, 0.5)' 
                    : '0 1px 3px rgba(0,0,0,0.2)'
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
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
