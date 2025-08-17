'use client';

import React, { useState } from 'react';
import Link from 'next/link';

// مكونات Manus UI
const ManusPage = () => {
  const [activeTab, setActiveTab] = useState('scheduled');
  const [toggleStates, setToggleStates] = useState({
    notifications: true,
    autoPublish: false,
    darkMode: false
  });

  const toggleSwitch = (key: string) => {
    setToggleStates(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  // بيانات تجريبية
  const articles = [
    { id: 1, title: 'تطورات الذكاء الاصطناعي في 2025', category: 'تقنية', status: 'مجدول', time: '14:30' },
    { id: 2, title: 'نمو الاقتصاد السعودي يتسارع', category: 'اقتصاد', status: 'مكتمل', time: '12:15' },
    { id: 3, title: 'إنجازات رؤية 2030 في الطاقة المتجددة', category: 'بيئة', status: 'مجدول', time: '16:00' },
    { id: 4, title: 'كأس العالم 2034: استعدادات مكثفة', category: 'رياضة', status: 'مكتمل', time: '10:45' }
  ];

  const stats = [
    { label: 'المقالات المنشورة', value: '2,847', change: '+12%' },
    { label: 'القراء النشطون', value: '45.2K', change: '+8%' },
    { label: 'معدل التفاعل', value: '89%', change: '+3%' },
    { label: 'المشاركات', value: '1.2K', change: '+15%' }
  ];

  return (
    <>
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
            <p className="text-xs text-muted">منصة الأخبار الذكية</p>
          </div>

          {/* التنقل الرئيسي */}
          <nav>
            <div className="divide-list">
              <div className="list-item" style={{ padding: '12px 0' }}>
                <Link href="#" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                  📊 لوحة التحكم
                </Link>
              </div>
              <div className="list-item" style={{ padding: '12px 0' }}>
                <Link href="#" className="btn" style={{ width: '100%', justifyContent: 'center' }}>
                  📰 إدارة الأخبار
                </Link>
              </div>
              <div className="list-item" style={{ padding: '12px 0' }}>
                <Link href="#" className="btn" style={{ width: '100%', justifyContent: 'center' }}>
                  ✍️ المقالات
                </Link>
              </div>
              <div className="list-item" style={{ padding: '12px 0' }}>
                <Link href="#" className="btn" style={{ width: '100%', justifyContent: 'center' }}>
                  📈 التحليلات
                </Link>
              </div>
              <div className="list-item" style={{ padding: '12px 0' }}>
                <Link href="#" className="btn" style={{ width: '100%', justifyContent: 'center' }}>
                  👥 المستخدمون
                </Link>
              </div>
            </div>
          </nav>

          <div className="divider"></div>

          {/* الإعدادات السريعة */}
          <div>
            <h3 className="heading-3" style={{ fontSize: '14px', marginBottom: '16px' }}>الإعدادات</h3>
            <div className="divide-list">
              <div className="list-item">
                <span className="text-sm">الإشعارات</span>
                <div 
                  className={`toggle-switch ${toggleStates.notifications ? 'active' : ''}`}
                  onClick={() => toggleSwitch('notifications')}
                ></div>
              </div>
              <div className="list-item">
                <span className="text-sm">النشر التلقائي</span>
                <div 
                  className={`toggle-switch ${toggleStates.autoPublish ? 'active' : ''}`}
                  onClick={() => toggleSwitch('autoPublish')}
                ></div>
              </div>
              <div className="list-item">
                <span className="text-sm">الوضع المظلم</span>
                <div 
                  className={`toggle-switch ${toggleStates.darkMode ? 'active' : ''}`}
                  onClick={() => toggleSwitch('darkMode')}
                ></div>
              </div>
            </div>
          </div>
        </aside>

        {/* المحتوى الرئيسي */}
        <main className="manus-main">
          {/* الهيدر */}
          <header className="manus-header">
            <div>
              <h1 className="heading-2" style={{ margin: 0 }}>لوحة التحكم</h1>
              <p className="text-sm text-muted">مرحباً بك في منصة سبق الذكية</p>
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button className="btn btn-sm">🔔</button>
              <button className="btn btn-sm">👤</button>
            </div>
          </header>

          {/* الإحصائيات السريعة */}
          <section className="grid grid-4" style={{ marginBottom: '32px' }}>
            {stats.map((stat, index) => (
              <div key={index} className="card">
                <div className="text-xs text-muted">{stat.label}</div>
                <div className="heading-2" style={{ margin: '8px 0 4px' }}>{stat.value}</div>
                <div className="text-xs" style={{ color: stat.change.startsWith('+') ? '#10b981' : '#ef4444' }}>
                  {stat.change}
                </div>
              </div>
            ))}
          </section>

          {/* قسم المقالات */}
          <section>
            <div className="card">
              <div className="card-header">
                <div className="card-title">إدارة المقالات</div>
                <div className="card-subtitle">عرض وإدارة المقالات المجدولة والمكتملة</div>
              </div>

              {/* التبويبات */}
              <div className="tabbar">
                <button 
                  className={`tab ${activeTab === 'scheduled' ? 'active' : ''}`}
                  onClick={() => setActiveTab('scheduled')}
                >
                  📅 مجدول ({articles.filter(a => a.status === 'مجدول').length})
                </button>
                <button 
                  className={`tab ${activeTab === 'completed' ? 'active' : ''}`}
                  onClick={() => setActiveTab('completed')}
                >
                  ✅ مكتمل ({articles.filter(a => a.status === 'مكتمل').length})
                </button>
              </div>

              {/* قائمة المقالات */}
              <div className="divide-list">
                {articles
                  .filter(article => 
                    activeTab === 'scheduled' ? article.status === 'مجدول' : article.status === 'مكتمل'
                  )
                  .map((article) => (
                    <div key={article.id} className="list-item">
                      <div style={{ flex: 1 }}>
                        <div className="text-base" style={{ marginBottom: '4px' }}>
                          {article.title}
                        </div>
                        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                          <span className="chip chip-muted">{article.category}</span>
                          <span className="text-xs text-muted">⏰ {article.time}</span>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        {article.status === 'مجدول' ? (
                          <>
                            <button className="btn btn-xs">✏️</button>
                            <button className="btn btn-xs btn-primary">📤</button>
                          </>
                        ) : (
                          <>
                            <button className="btn btn-xs">👁️</button>
                            <button className="btn btn-xs">📊</button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </section>

          {/* قسم الإعدادات المتقدمة */}
          <section style={{ marginTop: '32px' }}>
            <div className="grid grid-2">
              <div className="card">
                <div className="card-header">
                  <div className="card-title">إعدادات النشر</div>
                  <div className="card-subtitle">تحكم في آلية النشر والجدولة</div>
                </div>
                
                <div className="divide-list">
                  <div className="list-item">
                    <div>
                      <div className="text-sm">النشر التلقائي</div>
                      <div className="text-xs text-muted">تفعيل النشر حسب الجدولة</div>
                    </div>
                    <div 
                      className={`toggle-switch ${toggleStates.autoPublish ? 'active' : ''}`}
                      onClick={() => toggleSwitch('autoPublish')}
                    ></div>
                  </div>
                  <div className="list-item">
                    <div>
                      <div className="text-sm">مراجعة ذكية</div>
                      <div className="text-xs text-muted">فحص المحتوى بالذكاء الاصطناعي</div>
                    </div>
                    <div className="toggle-switch active"></div>
                  </div>
                  <div className="list-item">
                    <div>
                      <div className="text-sm">إشعارات الفريق</div>
                      <div className="text-xs text-muted">تنبيه عند النشر والتحديث</div>
                    </div>
                    <div 
                      className={`toggle-switch ${toggleStates.notifications ? 'active' : ''}`}
                      onClick={() => toggleSwitch('notifications')}
                    ></div>
                  </div>
                </div>
              </div>

              <div className="card">
                <div className="card-header">
                  <div className="card-title">أدوات سريعة</div>
                  <div className="card-subtitle">اختصارات للمهام الشائعة</div>
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <button className="btn btn-primary">➕ مقال جديد</button>
                  <button className="btn">📊 تقرير يومي</button>
                  <button className="btn">🔄 مزامنة البيانات</button>
                  <button className="btn">⚡ تحسين الأداء</button>
                </div>

                <div className="divider"></div>

                <div>
                  <div className="text-sm" style={{ marginBottom: '12px' }}>تغيير الثيم:</div>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <button 
                      className="btn btn-xs"
                      onClick={() => {
                        document.documentElement.style.setProperty('--accent', '212 90% 50%');
                      }}
                    >
                      🔵 الأزرق
                    </button>
                    <button 
                      className="btn btn-xs"
                      onClick={() => {
                        document.documentElement.style.setProperty('--accent', '142 71% 45%');
                      }}
                    >
                      🟢 الأخضر
                    </button>
                    <button 
                      className="btn btn-xs"
                      onClick={() => {
                        document.documentElement.style.setProperty('--accent', '262 83% 58%');
                      }}
                    >
                      🟣 البنفسجي
                    </button>
                    <button 
                      className="btn btn-xs"
                      onClick={() => {
                        document.documentElement.style.setProperty('--accent', '25 95% 53%');
                      }}
                    >
                      🟠 البرتقالي
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* روابط للمقارنة */}
          <section style={{ marginTop: '32px' }}>
            <div className="card" style={{ textAlign: 'center', background: 'hsl(var(--accent-light))' }}>
              <div className="card-title">🎨 مقارنة التصاميم</div>
              <div className="card-subtitle" style={{ marginBottom: '24px' }}>
                جرب التصاميم المختلفة لسبق الذكية
              </div>
              
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
                <Link href="/new-design" className="btn">التصميم الحديث</Link>
                <Link href="/new-design/with-header" className="btn">مع هيدر بسيط</Link>
                <Link href="/new-design/header-demo" className="btn">تجربة الهيدرات</Link>
                <Link href="#" className="btn btn-primary">Manus UI (الحالي)</Link>
                <Link href="/" className="btn">الموقع الأصلي</Link>
              </div>
            </div>
          </section>
        </main>
      </div>
    </>
  );
};

export default ManusPage;
