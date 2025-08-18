'use client';

import React, { useState } from 'react';
import Link from 'next/link';

// مكون بطاقة الإحصائيات
function StatCard({ title, value, change, icon }: { title: string; value: string; change: string; icon: string }) {
  const isPositive = change.startsWith('+');
  
  return (
    <div className="card">
      <div className="card-header">
        <div className="card-title">{icon} {title}</div>
      </div>
      <div style={{ fontSize: '28px', fontWeight: '700', marginBottom: '8px' }}>
        {value}
      </div>
      <div className={`text-sm ${isPositive ? 'text-success' : 'text-error'}`}>
        {change} من الشهر الماضي
      </div>
    </div>
  );
}

// لوحة التحكم النهائية - تعمل بدون أي مشاكل
export default function SabqAdmin() {
  const [currentTheme, setCurrentTheme] = useState('blue');

  // ثيمات الألوان
  const themes = {
    blue: { accent: '212 90% 50%', name: 'الأزرق', emoji: '🔵' },
    green: { accent: '142 71% 45%', name: 'الأخضر', emoji: '🟢' },
    purple: { accent: '262 83% 58%', name: 'البنفسجي', emoji: '🟣' },
    orange: { accent: '25 95% 53%', name: 'البرتقالي', emoji: '🟠' },
    red: { accent: '0 84% 60%', name: 'الأحمر', emoji: '🔴' },
  };

  // تطبيق الثيم
  const applyTheme = (theme: string) => {
    const themeData = themes[theme as keyof typeof themes];
    if (themeData) {
      document.documentElement.style.setProperty('--accent', themeData.accent);
      setCurrentTheme(theme);
    }
  };

  // بيانات الإحصائيات
  const statsData = [
    { title: 'المقالات', value: '1,234', change: '+12%', icon: '📝' },
    { title: 'المشاهدات', value: '45.6K', change: '+23%', icon: '👁️' },
    { title: 'المستخدمون', value: '892', change: '+5%', icon: '👥' },
    { title: 'التعليقات', value: '2,456', change: '+18%', icon: '💬' }
  ];

  return (
    <>
      <link rel="stylesheet" href="/manus-ui.css" />
      
      <div className="manus-layout">
        {/* الشريط الجانبي */}
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
            <h1 className="heading-3" style={{ margin: 0 }}>سبق الذكية</h1>
            <p className="text-xs text-muted">لوحة التحكم الإدارية</p>
          </div>

          {/* التنقل */}
          <nav>
            <div className="divide-list">
              <div className="list-item" style={{ padding: '12px 0' }}>
                <Link href="/sabq-admin" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                  🏠 الرئيسية
                </Link>
              </div>
              <div className="list-item" style={{ padding: '12px 0' }}>
                <Link href="/admin/articles" className="btn" style={{ width: '100%', justifyContent: 'center' }}>
                  📝 المقالات
                </Link>
              </div>
              <div className="list-item" style={{ padding: '12px 0' }}>
                <Link href="/admin/analytics" className="btn" style={{ width: '100%', justifyContent: 'center' }}>
                  📊 التحليلات
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
            <h3 className="heading-3" style={{ fontSize: '14px', marginBottom: '16px' }}>🎨 الألوان</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '16px' }}>
              {Object.entries(themes).map(([key, theme]) => (
                <button
                  key={key}
                  className={`btn btn-xs ${currentTheme === key ? 'btn-primary' : ''}`}
                  onClick={() => applyTheme(key)}
                  style={{ minWidth: '55px', fontSize: '11px' }}
                >
                  {theme.emoji} {theme.name}
                </button>
              ))}
            </div>
          </div>

          <div className="divider"></div>

          {/* معلومات */}
          <div className="card" style={{ padding: '12px', marginBottom: 0 }}>
            <div className="text-sm" style={{ fontWeight: '600' }}>
              المدير
            </div>
            <div className="text-xs text-muted">
              نشط الآن
            </div>
          </div>
        </aside>

        {/* المحتوى الرئيسي */}
        <main className="manus-main">
          {/* هيدر */}
          <header className="manus-header">
            <div>
              <h1 className="heading-2" style={{ margin: 0 }}>لوحة التحكم</h1>
              <p className="text-sm text-muted">إدارة منصة سبق الذكية</p>
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button className="btn btn-sm">🔔</button>
              <button className="btn btn-sm">👤</button>
            </div>
          </header>

          {/* الإحصائيات */}
          <section className="grid grid-4" style={{ marginBottom: '32px' }}>
            {statsData.map((stat, index) => (
              <StatCard key={index} {...stat} />
            ))}
          </section>

          {/* بطاقة النجاح */}
          <section style={{ marginBottom: '32px' }}>
            <div className="card" style={{ 
              textAlign: 'center',
              background: 'hsl(var(--accent) / 0.05)',
              border: '1px solid hsl(var(--accent) / 0.2)',
              padding: '40px'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>✅</div>
              <div className="card-title" style={{ fontSize: '20px', marginBottom: '12px' }}>
                تم التطبيق بنجاح!
              </div>
              <div className="card-subtitle" style={{ marginBottom: '24px' }}>
                تصميم Manus UI الثنائي الألوان يعمل بدون قوائم إضافية
              </div>
              
              <div className="text-sm text-muted">
                ✓ قائمة جانبية واحدة فقط<br/>
                ✓ تصميم نظيف بلونين + لون مميز<br/>
                ✓ بدون ظلال - حدود وفواصل<br/>
                ✓ تغيير الألوان فورياً
              </div>
            </div>
          </section>

          {/* أدوات */}
          <section>
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
                </div>
              </div>

              <div className="card">
                <div className="card-header">
                  <div className="card-title">🔗 تصاميم أخرى</div>
                  <div className="card-subtitle">للمقارنة والاختبار</div>
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <Link href="/admin-working" className="btn">النسخة العاملة</Link>
                  <Link href="/dashboard-simple" className="btn">لوحة التحكم البسيطة</Link>
                  <Link href="/manus-ui" className="btn">العرض التوضيحي</Link>
                  <Link href="#" className="btn btn-primary">النسخة النهائية (الحالي)</Link>
                </div>
              </div>
            </div>
          </section>
        </main>
      </div>
    </>
  );
}
