'use client';

import React, { useState, useEffect } from 'react';

export default function TestManus() {
  const [mounted, setMounted] = useState(false);
  const [currentTheme, setCurrentTheme] = useState('blue');

  useEffect(() => {
    setMounted(true);
  }, []);

  const themes = {
    blue: { accent: '212 90% 50%', name: 'الأزرق' },
    green: { accent: '142 71% 45%', name: 'الأخضر' },
  };

  const applyTheme = (theme: string) => {
    const themeData = themes[theme as keyof typeof themes];
    if (themeData) {
      document.documentElement.style.setProperty('--accent', themeData.accent);
      setCurrentTheme(theme);
    }
  };

  if (!mounted) {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#F5F5F7',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '32px', marginBottom: '16px' }}>⏳</div>
          <p style={{ color: '#86868B' }}>جاري التحميل...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <style jsx global>{`
        :root {
          --bg: 0 0% 98%;
          --fg: 220 13% 7%;
          --accent: 212 90% 50%;
          --line: 220 14% 90%;
          --muted: 220 9% 46%;
        }
        
        body {
          background: hsl(var(--bg)) !important;
          color: hsl(var(--fg)) !important;
          margin: 0;
          padding: 0;
          font-family: -apple-system, BlinkMacSystemFont, sans-serif;
        }
        
        .card {
          background: hsl(var(--bg));
          border: 1px solid hsl(var(--line));
          border-radius: 16px;
          padding: 24px;
          margin-bottom: 16px;
        }
        
        .btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 12px 20px;
          border: 1px solid hsl(var(--line));
          border-radius: 24px;
          background: transparent;
          color: hsl(var(--fg));
          text-decoration: none;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        
        .btn:hover {
          border-color: hsl(var(--accent));
          color: hsl(var(--accent));
        }
        
        .btn-primary {
          background: hsl(var(--accent));
          border-color: hsl(var(--accent));
          color: white;
        }
        
        .heading-2 {
          font-size: 24px;
          font-weight: 600;
          color: hsl(var(--fg));
          margin-bottom: 8px;
        }
        
        .text-muted {
          color: hsl(var(--muted));
        }
      `}</style>
      
      <div style={{
        minHeight: '100vh',
        background: 'hsl(var(--bg))',
        padding: '40px'
      }}>
        
        {/* اختبار أن CSS يعمل */}
        <div style={{
          textAlign: 'center',
          marginBottom: '40px'
        }}>
          <div style={{
            width: '80px',
            height: '80px',
            background: 'hsl(var(--accent))',
            borderRadius: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: '40px',
            fontWeight: '700',
            margin: '0 auto 20px'
          }}>
            س
          </div>
          <h1 className="heading-2">سبق الذكية - اختبار Manus UI</h1>
          <p className="text-muted">إذا كنت تراي هذا النص، فإن التصميم يعمل!</p>
        </div>

        {/* اختبار البطاقات */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '20px',
          marginBottom: '40px'
        }}>
          <div className="card">
            <h3 style={{ margin: '0 0 12px', color: 'hsl(var(--accent))' }}>✅ CSS يعمل</h3>
            <p className="text-muted">إذا رأيت هذه البطاقة بحدود وألوان، فإن CSS محمل بشكل صحيح</p>
          </div>
          
          <div className="card">
            <h3 style={{ margin: '0 0 12px', color: 'hsl(var(--accent))' }}>📱 JavaScript يعمل</h3>
            <p className="text-muted">إذا كانت الأزرار تتفاعل، فإن JS يعمل بشكل صحيح</p>
          </div>
          
          <div className="card">
            <h3 style={{ margin: '0 0 12px', color: 'hsl(var(--accent))' }}>🎨 الثيم يعمل</h3>
            <p className="text-muted">جرب تغيير الألوان أسفل هذه البطاقة</p>
          </div>
        </div>

        {/* اختبار تغيير الثيم */}
        <div className="card" style={{ textAlign: 'center' }}>
          <h3 style={{ margin: '0 0 20px', color: 'hsl(var(--accent))' }}>
            اختبار تغيير الألوان
          </h3>
          <p className="text-muted" style={{ marginBottom: '20px' }}>
            اللون الحالي: <strong>{themes[currentTheme as keyof typeof themes].name}</strong>
          </p>
          
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            {Object.entries(themes).map(([key, theme]) => (
              <button
                key={key}
                className={currentTheme === key ? 'btn-primary' : 'btn'}
                onClick={() => applyTheme(key)}
              >
                {theme.name}
              </button>
            ))}
          </div>
          
          <div style={{ marginTop: '20px' }}>
            <a href="/admin" className="btn btn-primary">
              العودة للوحة التحكم
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
