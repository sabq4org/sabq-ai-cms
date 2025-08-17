'use client';

import React, { useState } from 'react';
import Link from 'next/link';

// نسخة مبسطة تعمل 100% لوحة التحكم بتصميم Manus UI
export default function AdminWorking() {
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
          {/* شعار */}
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
            <p className="text-xs text-muted">Manus UI</p>
          </div>

          {/* التنقل */}
          <nav>
            <div className="divide-list">
              <div className="list-item" style={{ padding: '12px 0' }}>
                <Link href="/admin-working" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
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
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '16px' }}>
              {Object.entries(themes).map(([key, theme]) => (
                <button
                  key={key}
                  className={`btn btn-xs ${currentTheme === key ? 'btn-primary' : ''}`}
                  onClick={() => applyTheme(key)}
                  style={{ minWidth: '55px', fontSize: '11px' }}
                >
                  {theme.name}
                </button>
              ))}
            </div>
            <div className="text-xs text-muted" style={{ textAlign: 'center' }}>
              تغيير فوري
            </div>
          </div>

          <div className="divider"></div>

          {/* معلومات */}
          <div className="card" style={{ padding: '12px', marginBottom: 0 }}>
            <div className="text-sm" style={{ fontWeight: '600' }}>
              المدير
            </div>
            <div className="text-xs text-muted">
              متصل الآن
            </div>
          </div>
        </aside>

        {/* المحتوى الرئيسي */}
        <main className="manus-main">
          {/* هيدر بسيط */}
          <header className="manus-header">
            <div>
              <h1 className="heading-2" style={{ margin: 0 }}>الإدارة</h1>
              <p className="text-sm text-muted">نظام إدارة المحتوى - Manus UI</p>
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button className="btn btn-sm">🔔</button>
              <button className="btn btn-sm">👤</button>
            </div>
          </header>

          {/* الإحصائيات */}
          <section className="grid grid-4" style={{ marginBottom: '32px' }}>
            <div className="card">
              <div style={{ textAlign: 'center', padding: '24px 0' }}>
                <div style={{ fontSize: '36px', marginBottom: '12px' }}>📝</div>
                <div className="heading-3" style={{ color: 'hsl(var(--accent))', marginBottom: '4px' }}>
                  2,847
                </div>
                <div className="text-xs text-muted">المقالات</div>
                <div className="text-xs" style={{ color: '#10b981', marginTop: '4px' }}>
                  +12% هذا الأسبوع
                </div>
              </div>
            </div>

            <div className="card">
              <div style={{ textAlign: 'center', padding: '24px 0' }}>
                <div style={{ fontSize: '36px', marginBottom: '12px' }}>👥</div>
                <div className="heading-3" style={{ color: 'hsl(var(--accent))', marginBottom: '4px' }}>
                  45.2K
                </div>
                <div className="text-xs text-muted">المستخدمون</div>
                <div className="text-xs" style={{ color: '#10b981', marginTop: '4px' }}>
                  +8% هذا الأسبوع
                </div>
              </div>
            </div>

            <div className="card">
              <div style={{ textAlign: 'center', padding: '24px 0' }}>
                <div style={{ fontSize: '36px', marginBottom: '12px' }}>📊</div>
                <div className="heading-3" style={{ color: 'hsl(var(--accent))', marginBottom: '4px' }}>
                  128K
                </div>
                <div className="text-xs text-muted">المشاهدات</div>
                <div className="text-xs" style={{ color: '#10b981', marginTop: '4px' }}>
                  +15% هذا الأسبوع
                </div>
              </div>
            </div>

            <div className="card">
              <div style={{ textAlign: 'center', padding: '24px 0' }}>
                <div style={{ fontSize: '36px', marginBottom: '12px' }}>📈</div>
                <div className="heading-3" style={{ color: 'hsl(var(--accent))', marginBottom: '4px' }}>
                  89%
                </div>
                <div className="text-xs text-muted">التفاعل</div>
                <div className="text-xs" style={{ color: '#10b981', marginTop: '4px' }}>
                  +3% هذا الأسبوع
                </div>
              </div>
            </div>
          </section>

          {/* المحتوى الرئيسي */}
          <section>
            <div className="card">
              <div className="card-header">
                <div className="card-title">🎉 تم تطبيق Manus UI بنجاح!</div>
                <div className="card-subtitle">لوحة التحكم تعمل بالتصميم الثنائي الألوان</div>
              </div>

              <div className="divide-list">
                <div className="list-item">
                  <div>
                    <div className="text-base">✅ قائمة جانبية واحدة فقط</div>
                    <div className="text-sm text-muted">تم إزالة القوائم الإضافية من منتصف الصفحة</div>
                  </div>
                  <div className="chip" style={{ background: '#10b981', color: 'white', border: 'none' }}>
                    ✅ تم
                  </div>
                </div>
                
                <div className="list-item">
                  <div>
                    <div className="text-base">🎨 تصميم ثنائي الألوان</div>
                    <div className="text-sm text-muted">بدون ظلال - حدود وفواصل فقط</div>
                  </div>
                  <div className="chip" style={{ background: 'hsl(var(--accent))', color: 'white', border: 'none' }}>
                    🎯 نشط
                  </div>
                </div>
                
                <div className="list-item">
                  <div>
                    <div className="text-base">⚡ تغيير الثيم فوري</div>
                    <div className="text-sm text-muted">5 ألوان مختلفة في الشريط الجانبي</div>
                  </div>
                  <div className="chip" style={{ background: '#FF9500', color: 'white', border: 'none' }}>
                    🚀 جاهز
                  </div>
                </div>
                
                <div className="list-item">
                  <div>
                    <div className="text-base">📱 تجاوبية كاملة</div>
                    <div className="text-sm text-muted">محسن للجوال والديسكتوب</div>
                  </div>
                  <div className="chip" style={{ background: '#AF52DE', color: 'white', border: 'none' }}>
                    📱 متاح
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* أدوات سريعة */}
          <section style={{ marginTop: '32px' }}>
            <div className="grid grid-2">
              <div className="card">
                <div className="card-header">
                  <div className="card-title">⚡ أدوات سريعة</div>
                  <div className="card-subtitle">المهام الشائعة</div>
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <Link href="/admin/articles/create" className="btn btn-primary">
                    ➕ مقال جديد
                  </Link>
                  <Link href="/admin/news/create" className="btn">
                    📰 خبر عاجل
                  </Link>
                  <Link href="/admin/analytics" className="btn">
                    📊 التقارير
                  </Link>
                  <Link href="/admin/backup" className="btn">
                    💾 نسخة احتياطية
                  </Link>
                </div>
              </div>

              <div className="card">
                <div className="card-header">
                  <div className="card-title">🔗 روابط مفيدة</div>
                  <div className="card-subtitle">صفحات التصاميم المختلفة</div>
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <Link href="/admin" className="btn">النسخة الأصلية</Link>
                  <Link href="/dashboard-simple" className="btn">لوحة التحكم البسيطة</Link>
                  <Link href="/manus-ui" className="btn">العرض التوضيحي</Link>
                  <Link href="#" className="btn btn-primary">النسخة العاملة (الحالي)</Link>
                </div>
              </div>
            </div>
          </section>
        </main>
      </div>
    </>
  );
}
