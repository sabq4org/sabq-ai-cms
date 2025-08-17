'use client';

import React, { useState, useEffect } from 'react';
import { Sun, Moon } from 'lucide-react';

export default function DarkModeToggle() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const shouldBeDark = saved === 'dark' || (saved !== 'light' && prefersDark);
    
    setIsDark(shouldBeDark);
    document.documentElement.setAttribute('data-theme', shouldBeDark ? 'dark' : 'light');
  }, []);

  const toggleTheme = () => {
    const newTheme = !isDark;
    setIsDark(newTheme);
    const theme = newTheme ? 'dark' : 'light';
    
    localStorage.setItem('theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
  };

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
        background: isDark ? 'hsl(var(--accent-4) / 0.1)' : 'hsl(var(--accent) / 0.1)',
        color: isDark ? 'hsl(var(--accent-4))' : 'hsl(var(--accent))',
        border: `1px solid ${isDark ? 'hsl(var(--accent-4) / 0.2)' : 'hsl(var(--accent) / 0.2)'}`
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
