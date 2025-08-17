'use client';

import React, { useState, useEffect } from 'react';
import { Sun, Moon } from 'lucide-react';

export default function DarkModeToggle() {
  const [isDark, setIsDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const shouldBeDark = saved === 'dark' || (saved !== 'light' && prefersDark);
    
    setIsDark(shouldBeDark);
    applyTheme(shouldBeDark);
  }, []);

  const applyTheme = (dark: boolean) => {
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
      
      // تطبيق الألوان فوراً على body
      if (dark) {
        document.body.style.background = 'linear-gradient(135deg, hsl(222 47% 11%) 0%, hsl(222 47% 9%) 100%)';
        document.body.style.color = 'hsl(213 31% 91%)';
      } else {
        document.body.style.background = 'linear-gradient(135deg, hsl(220 14% 96%) 0%, hsl(210 20% 98%) 100%)';
        document.body.style.color = 'hsl(220 13% 7%)';
      }
    }
  };

  const toggleTheme = () => {
    const newTheme = !isDark;
    setIsDark(newTheme);
    const theme = newTheme ? 'dark' : 'light';
    
    localStorage.setItem('theme', theme);
    applyTheme(newTheme);
  };

  if (!mounted) {
    return (
      <div style={{
        width: '34px',
        height: '34px',
        background: 'hsl(var(--line))',
        borderRadius: '8px',
        opacity: 0.5
      }} />
    );
  }

  return (
    <button
      onClick={toggleTheme}
      className="btn btn-sm"
      style={{
        padding: '8px',
        borderRadius: '8px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: isDark ? 'hsl(25 95% 53% / 0.15)' : 'hsl(212 90% 50% / 0.15)',
        color: isDark ? 'hsl(25 95% 53%)' : 'hsl(212 90% 50%)',
        border: `1px solid ${isDark ? 'hsl(25 95% 53% / 0.3)' : 'hsl(212 90% 50% / 0.3)'}`,
        transition: 'all 0.2s ease',
        position: 'relative',
        overflow: 'hidden'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'scale(1.05)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'scale(1)';
      }}
      title={isDark ? 'تفعيل الوضع النهاري' : 'تفعيل الوضع الليلي'}
    >
      {isDark ? (
        <Sun style={{ width: '18px', height: '18px' }} />
      ) : (
        <Moon style={{ width: '18px', height: '18px' }} />
      )}
    </button>
  );
}