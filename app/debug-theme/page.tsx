'use client';

import React, { useState, useEffect } from 'react';

export default function DebugTheme() {
  const [theme, setTheme] = useState('');
  const [cssVars, setCssVars] = useState({});

  useEffect(() => {
    const updateDebugInfo = () => {
      const currentTheme = document.documentElement.getAttribute('data-theme');
      setTheme(currentTheme || 'not set');
      
      // قراءة CSS Variables
      const computedStyle = getComputedStyle(document.documentElement);
      setCssVars({
        '--bg': computedStyle.getPropertyValue('--bg').trim(),
        '--bg-card': computedStyle.getPropertyValue('--bg-card').trim(),
        '--fg': computedStyle.getPropertyValue('--fg').trim(),
        '--line': computedStyle.getPropertyValue('--line').trim(),
        '--muted': computedStyle.getPropertyValue('--muted').trim()
      });
    };

    updateDebugInfo();
    
    // مراقبة تغييرات data-theme
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'data-theme') {
          updateDebugInfo();
        }
      });
    });
    
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme']
    });

    return () => observer.disconnect();
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
  };

  return (
    <>
      <link rel="stylesheet" href="/manus-ui.css" />
      
      <div style={{
        minHeight: '100vh',
        background: 'hsl(var(--bg))',
        padding: '40px',
        color: 'hsl(var(--fg))'
      }}>
        
        <div style={{
          background: 'hsl(var(--bg-card))',
          border: '1px solid hsl(var(--line))',
          borderRadius: '12px',
          padding: '20px',
          marginBottom: '20px',
          boxShadow: 'var(--card-shadow)'
        }}>
          <h1 style={{ margin: '0 0 20px', fontSize: '24px' }}>🔧 تشخيص الوضع الداكن</h1>
          
          <div style={{ marginBottom: '20px' }}>
            <strong>الوضع الحالي:</strong> {theme}
          </div>
          
          <button
            onClick={toggleTheme}
            style={{
              padding: '12px 24px',
              background: 'hsl(var(--accent))',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '16px',
              marginBottom: '20px'
            }}
          >
            تبديل الوضع
          </button>
          
          <h3 style={{ margin: '20px 0 10px' }}>متغيرات CSS:</h3>
          <div style={{ fontFamily: 'monospace', fontSize: '14px' }}>
            {Object.entries(cssVars).map(([key, value]) => (
              <div key={key} style={{ margin: '5px 0' }}>
                <strong>{key}:</strong> {value || 'غير محدد'}
              </div>
            ))}
          </div>
        </div>
        
        {/* اختبار الشريط الجانبي */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '280px 1fr',
          gap: '20px',
          height: '400px'
        }}>
          
          <div style={{
            background: 'hsl(var(--bg-card))',
            border: '1px solid hsl(var(--line))',
            borderRadius: '12px',
            padding: '20px',
            boxShadow: 'var(--card-shadow)'
          }}>
            <h3 style={{ margin: '0 0 16px', color: 'hsl(var(--accent))' }}>
              🗂️ شريط جانبي تجريبي
            </h3>
            
            <div style={{ marginBottom: '12px' }}>
              <div style={{
                padding: '10px 12px',
                borderRadius: '12px',
                background: 'hsl(var(--accent))',
                color: 'white',
                marginBottom: '8px'
              }}>
                📊 العنصر النشط
              </div>
              
              <div style={{
                padding: '10px 12px',
                borderRadius: '12px',
                background: 'transparent',
                color: 'hsl(var(--fg))',
                border: '1px solid hsl(var(--line))',
                marginBottom: '8px'
              }}>
                📝 عنصر عادي
              </div>
              
              <div style={{
                padding: '10px 12px',
                borderRadius: '12px',
                background: 'hsl(var(--accent) / 0.1)',
                color: 'hsl(var(--accent))',
                border: '1px solid hsl(var(--accent) / 0.3)'
              }}>
                👤 عنصر تحويم
              </div>
            </div>
          </div>
          
          <div style={{
            background: 'hsl(var(--bg-card))',
            border: '1px solid hsl(var(--line))',
            borderRadius: '12px',
            padding: '20px',
            boxShadow: 'var(--card-shadow)'
          }}>
            <h3 style={{ margin: '0 0 16px', color: 'hsl(var(--accent))' }}>
              📋 محتوى رئيسي تجريبي
            </h3>
            <p style={{ color: 'hsl(var(--fg))', lineHeight: 1.6 }}>
              هذا نص تجريبي لاختبار الألوان في الوضع النهاري والداكن.
            </p>
            <p style={{ color: 'hsl(var(--muted))', fontSize: '14px' }}>
              النص الثانوي يظهر بلون باهت مقروء.
            </p>
          </div>
          
        </div>
        
        <div style={{ marginTop: '20px', textAlign: 'center' }}>
          <a 
            href="/admin" 
            style={{
              display: 'inline-block',
              padding: '12px 24px',
              background: 'hsl(var(--accent))',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '8px'
            }}
          >
            العودة للوحة التحكم
          </a>
        </div>
        
      </div>
    </>
  );
}
