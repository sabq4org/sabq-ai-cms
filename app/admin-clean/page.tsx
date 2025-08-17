'use client';

import React, { useState } from 'react';
import Link from 'next/link';

// نسخة نظيفة تماماً من لوحة التحكم بتصميم Manus UI
export default function AdminClean() {
  const [currentTheme, setCurrentTheme] = useState('blue');

  // ثيمات الألوان
  const themes = {
    blue: { accent: '212 90% 50%', name: 'الأزرق' },
    green: { accent: '142 71% 45%', name: 'الأخضر' },
    purple: { accent: '262 83% 58%', name: 'البنفسجي' },
    orange: { accent: '25 95% 53%', name: 'البرتقالي' },
    red: { accent: '0 84% 60%', name: 'الأحمر' },
  };

  // تطبيق الثيم
  const applyTheme = (theme: string) => {
    const themeData = themes[theme as keyof typeof themes];
    if (themeData) {
      document.documentElement.style.setProperty('--accent', themeData.accent);
      setCurrentTheme(theme);
    }
  };

  return (
    <>
      {/* تحميل CSS Manus UI */}
      <link rel="stylesheet" href="/manus-ui.css" />
      
      <div className="manus-layout">
        {/* الشريط الجانبي الوحيد */}
        <aside className="manus-sidebar">
          {/* شعار بسيط */}
          <div style={{ marginBottom: '32px' }}>
            <div style={{
              width: '48px',
              height: '48px',
              background: 'hsl(var(--accent))',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '24px',
              fontWeight: '700',
              marginBottom: '12px'
            }}>
              س
            </div>
            <h1 className="heading-3" style={{ margin: 0 }}>الإدارة</h1>
            <p className="text-xs text-muted">نظام إدارة المحتوى</p>
          </div>

          {/* التنقل */}
          <nav>
            <div className="divide-list">
              <div className="list-item" style={{ padding: '12px 0' }}>
                <Link href="/admin-clean" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                  📊 الرئيسية
                </Link>
              </div>
              <div className="list-item" style={{ padding: '12px 0' }}>
                <Link href="/admin/articles" className="btn" style={{ width: '100%', justifyContent: 'center' }}>
                  📝 المقالات
                </Link>
              </div>
              <div className="list-item" style={{ padding: '12px 0' }}>
                <Link href="/admin/analytics" className="btn" style={{ width: '100%', justifyContent: 'center' }}>
                  📈 التحليلات
                </Link>
              </div>
              <div className="list-item" style={{ padding: '12px 0' }}>
                <Link href="/admin/users" className="btn" style={{ width: '100%', justifyContent: 'center' }}>
                  👥 المستخدمون
                </Link>
              </div>
              <div className="list-item" style={{ padding: '12px 0' }}>
                <Link href="/admin/settings" className="btn" style={{ width: '100%', justifyContent: 'center' }}>
                  ⚙️ الإعدادات
                </Link>
              </div>
            </div>
          </nav>

          <div className="divider"></div>

          {/* تغيير الثيم */}
          <div>
            <h3 className="heading-3" style={{ fontSize: '14px', marginBottom: '16px' }}>🎨 اللون</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {Object.entries(themes).map(([key, theme]) => (
                <button
                  key={key}
                  className={`btn btn-xs ${currentTheme === key ? 'btn-primary' : ''}`}
                  onClick={() => applyTheme(key)}
                  style={{ minWidth: '60px', fontSize: '11px' }}
                >
                  {theme.name}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* المحتوى */}
        <main className="manus-main">
          {/* هيدر مبسط */}
          <header className="manus-header">
            <div>
              <h1 className="heading-2" style={{ margin: 0 }}>الإدارة</h1>
              <p className="text-sm text-muted">نظام إدارة المحتوى</p>
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button className="btn btn-sm">🔔</button>
              <button className="btn btn-sm">👤</button>
            </div>
          </header>

          {/* محتوى نظيف */}
          <section className="grid grid-4" style={{ marginBottom: '32px' }}>
            <div className="card">
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <div style={{ fontSize: '32px', marginBottom: '8px' }}>📝</div>
                <div className="heading-3" style={{ color: 'hsl(var(--accent))' }}>2,847</div>
                <div className="text-xs text-muted">المقالات</div>
              </div>
            </div>
            
            <div className="card">
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <div style={{ fontSize: '32px', marginBottom: '8px' }}>👥</div>
                <div className="heading-3" style={{ color: 'hsl(var(--accent))' }}>45.2K</div>
                <div className="text-xs text-muted">المستخدمون</div>
              </div>
            </div>
            
            <div className="card">
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <div style={{ fontSize: '32px', marginBottom: '8px' }}>📊</div>
                <div className="heading-3" style={{ color: 'hsl(var(--accent))' }}>128K</div>
                <div className="text-xs text-muted">المشاهدات</div>
              </div>
            </div>
            
            <div className="card">
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <div style={{ fontSize: '32px', marginBottom: '8px' }}>📈</div>
                <div className="heading-3" style={{ color: 'hsl(var(--accent))' }}>89%</div>
                <div className="text-xs text-muted">التفاعل</div>
              </div>
            </div>
          </section>

          {/* بطاقة النجاح */}
          <section>
            <div className="card" style={{ 
              textAlign: 'center',
              background: 'hsl(var(--accent) / 0.05)',
              border: '1px solid hsl(var(--accent) / 0.2)'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>✅</div>
              <div className="card-title">تم تطبيق Manus UI بنجاح!</div>
              <div className="card-subtitle" style={{ marginBottom: '24px' }}>
                قائمة جانبية واحدة فقط، نظيفة وبسيطة
              </div>
              
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
                <Link href="/admin" className="btn">النسخة الكاملة</Link>
                <Link href="/dashboard-simple" className="btn">لوحة التحكم</Link>
                <Link href="#" className="btn btn-primary">النسخة النظيفة</Link>
                <Link href="/" className="btn">الموقع الرئيسي</Link>
              </div>
            </div>
          </section>
        </main>
      </div>
    </>
  );
}
