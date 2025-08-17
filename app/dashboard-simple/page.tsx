'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export default function SimpleDashboard() {
  const [currentTheme, setCurrentTheme] = useState('blue');

  // تحديد المتغيرات للثيمات المختلفة
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
        {/* الشريط الجانبي */}
        <aside className="manus-sidebar">
          {/* شعار المنصة */}
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
            <h1 className="heading-3" style={{ margin: 0 }}>سبق الذكية</h1>
            <p className="text-xs text-muted">لوحة التحكم - Manus UI</p>
          </div>

          {/* التنقل الرئيسي */}
          <nav>
            <div className="divide-list">
              <div className="list-item" style={{ padding: '12px 0' }}>
                <Link href="/dashboard-simple" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                  📊 لوحة التحكم
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
            <h3 className="heading-3" style={{ fontSize: '14px', marginBottom: '16px' }}>لون الواجهة</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '16px' }}>
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

        {/* المحتوى الرئيسي */}
        <main className="manus-main">
          {/* الهيدر */}
          <header className="manus-header">
            <div>
              <h1 className="heading-2" style={{ margin: 0 }}>لوحة التحكم</h1>
              <p className="text-sm text-muted">تصميم Manus UI المطبق على سبق الذكية</p>
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button className="btn btn-sm">🔔</button>
              <button className="btn btn-sm">👤</button>
            </div>
          </header>

          {/* الإحصائيات المبسطة */}
          <section className="grid grid-4" style={{ marginBottom: '32px' }}>
            <div className="card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  background: 'hsl(var(--accent) / 0.1)',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'hsl(var(--accent))',
                  fontSize: '24px'
                }}>
                  📝
                </div>
                <div>
                  <div className="text-xs text-muted">إجمالي المقالات</div>
                  <div className="heading-3" style={{ margin: '4px 0', color: 'hsl(var(--accent))' }}>
                    2,847
                  </div>
                  <div className="text-xs" style={{ color: '#10b981' }}>
                    +12% هذا الأسبوع
                  </div>
                </div>
              </div>
            </div>

            <div className="card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  background: 'hsl(var(--accent) / 0.1)',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'hsl(var(--accent))',
                  fontSize: '24px'
                }}>
                  👥
                </div>
                <div>
                  <div className="text-xs text-muted">المستخدمون النشطون</div>
                  <div className="heading-3" style={{ margin: '4px 0', color: 'hsl(var(--accent))' }}>
                    45.2K
                  </div>
                  <div className="text-xs" style={{ color: '#10b981' }}>
                    +8% هذا الأسبوع
                  </div>
                </div>
              </div>
            </div>

            <div className="card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  background: 'hsl(var(--accent) / 0.1)',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'hsl(var(--accent))',
                  fontSize: '24px'
                }}>
                  📊
                </div>
                <div>
                  <div className="text-xs text-muted">إجمالي المشاهدات</div>
                  <div className="heading-3" style={{ margin: '4px 0', color: 'hsl(var(--accent))' }}>
                    128K
                  </div>
                  <div className="text-xs" style={{ color: '#10b981' }}>
                    +15% هذا الأسبوع
                  </div>
                </div>
              </div>
            </div>

            <div className="card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  background: 'hsl(var(--accent) / 0.1)',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'hsl(var(--accent))',
                  fontSize: '24px'
                }}>
                  📈
                </div>
                <div>
                  <div className="text-xs text-muted">معدل التفاعل</div>
                  <div className="heading-3" style={{ margin: '4px 0', color: 'hsl(var(--accent))' }}>
                    89%
                  </div>
                  <div className="text-xs" style={{ color: '#10b981' }}>
                    +3% هذا الأسبوع
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* قسم رئيسي */}
          <section style={{ marginBottom: '32px' }}>
            <div className="card">
              <div className="card-header">
                <div className="card-title">🎯 تم تطبيق Manus UI بنجاح!</div>
                <div className="card-subtitle">التصميم الثنائي الألوان يعمل الآن على لوحة التحكم</div>
              </div>

              <div className="divide-list">
                <div className="list-item">
                  <div>
                    <div className="text-base">✅ نظام الألوان الثنائي</div>
                    <div className="text-sm text-muted">لونان فقط + لون مميز واحد قابل للتغيير</div>
                  </div>
                  <div className="chip" style={{ background: 'hsl(var(--accent))', color: 'white', border: 'none' }}>
                    نشط
                  </div>
                </div>
                
                <div className="list-item">
                  <div>
                    <div className="text-base">🚫 بدون ظلال نهائياً</div>
                    <div className="text-sm text-muted">اعتماد كامل على الحدود والفواصل</div>
                  </div>
                  <div className="chip" style={{ background: '#10b981', color: 'white', border: 'none' }}>
                    مطبق
                  </div>
                </div>
                
                <div className="list-item">
                  <div>
                    <div className="text-base">📱 تجاوبية كاملة</div>
                    <div className="text-sm text-muted">محسن للجوال والديسكتوب</div>
                  </div>
                  <div className="chip" style={{ background: '#FF9500', color: 'white', border: 'none' }}>
                    جاهز
                  </div>
                </div>
                
                <div className="list-item">
                  <div>
                    <div className="text-base">🎨 تغيير الثيم فوري</div>
                    <div className="text-sm text-muted">5 ألوان مختلفة بنقرة واحدة</div>
                  </div>
                  <div className="chip" style={{ background: '#AF52DE', color: 'white', border: 'none' }}>
                    متاح
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* أدوات سريعة */}
          <section>
            <div className="grid grid-2">
              <div className="card">
                <div className="card-header">
                  <div className="card-title">⚡ إجراءات سريعة</div>
                  <div className="card-subtitle">الأدوات والاختصارات المفيدة</div>
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <Link href="/admin/articles/create" className="btn btn-primary">
                    ➕ إنشاء مقال جديد
                  </Link>
                  <Link href="/admin/news/create" className="btn">
                    📰 إضافة خبر عاجل
                  </Link>
                  <Link href="/admin/analytics" className="btn">
                    📊 عرض التقارير
                  </Link>
                  <Link href="/dashboard/original" className="btn">
                    🔄 التصميم الأصلي
                  </Link>
                </div>
              </div>

              <div className="card">
                <div className="card-header">
                  <div className="card-title">🎨 تجربة الألوان</div>
                  <div className="card-subtitle">جرب الألوان المختلفة للواجهة</div>
                </div>
                
                <div style={{ marginBottom: '16px' }}>
                  <div className="text-sm" style={{ marginBottom: '8px' }}>اللون الحالي: {themes[currentTheme as keyof typeof themes].name}</div>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {Object.entries(themes).map(([key, theme]) => (
                      <button
                        key={key}
                        className={`btn btn-xs ${currentTheme === key ? 'btn-primary' : ''}`}
                        onClick={() => applyTheme(key)}
                        style={{ minWidth: '70px' }}
                      >
                        {theme.name}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="divider"></div>

                <div style={{ textAlign: 'center' }}>
                  <div className="text-sm" style={{ marginBottom: '12px' }}>💡 تغيير فوري بدون إعادة تحميل!</div>
                  <div className="chip chip-muted" style={{ fontSize: '11px' }}>
                    CSS Variables + HSL Colors
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* روابط للمقارنة */}
          <section style={{ marginTop: '32px' }}>
            <div className="card" style={{ textAlign: 'center', background: 'hsl(var(--accent) / 0.05)' }}>
              <div className="card-title">🎉 تم تطبيق Manus UI بنجاح!</div>
              <div className="card-subtitle" style={{ marginBottom: '24px' }}>
                التصميم الثنائي الألوان يعمل الآن على منصة سبق الذكية
              </div>
              
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
                <Link href="/dashboard" className="btn">لوحة التحكم المتكاملة</Link>
                <Link href="/manus-ui" className="btn">العرض التوضيحي</Link>
                <Link href="#" className="btn btn-primary">النسخة البسيطة (الحالي)</Link>
                <Link href="/" className="btn">الموقع الرئيسي</Link>
              </div>
            </div>
          </section>
        </main>
      </div>
    </>
  );
}
