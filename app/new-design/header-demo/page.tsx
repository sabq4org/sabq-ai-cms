'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  NoHeader,
  MinimalHeader,
  FloatingHeader,
  SideHeader,
  BottomHeader,
  SearchOnlyHeader
} from '../components/HeaderOptions';

const headerOptions = [
  { id: 'none', name: 'بدون هيدر', component: NoHeader },
  { id: 'minimal', name: 'مبسط', component: MinimalHeader },
  { id: 'floating', name: 'عائم', component: FloatingHeader },
  { id: 'side', name: 'جانبي', component: SideHeader },
  { id: 'bottom', name: 'سفلي', component: BottomHeader },
  { id: 'search', name: 'بحث فقط', component: SearchOnlyHeader }
];

export default function HeaderDemoPage() {
  const [selectedHeader, setSelectedHeader] = useState('floating');
  
  const SelectedHeaderComponent = headerOptions.find(h => h.id === selectedHeader)?.component || NoHeader;

  return (
    <>
      <link rel="stylesheet" href="/modern-design-system.css" />
      <div style={{ 
        background: 'var(--background-main)', 
        minHeight: '100vh',
        paddingTop: selectedHeader === 'none' ? '0' : selectedHeader === 'bottom' ? '0' : '100px'
      }}>
        
        {/* الهيدر المختار */}
        <SelectedHeaderComponent />

        {/* قائمة الخيارات */}
        <div className="container-main" style={{ padding: 'var(--space-3xl) var(--space-lg)' }}>
          <div className="modern-card" style={{ 
            padding: 'var(--space-2xl)',
            marginBottom: 'var(--space-2xl)',
            textAlign: 'center'
          }}>
            <h1 className="heading-main" style={{ marginBottom: 'var(--space-lg)' }}>
              🎨 اختر نوع الهيدر المناسب لك
            </h1>
            <p className="text-body" style={{ marginBottom: 'var(--space-xl)' }}>
              جرب الخيارات المختلفة واختر ما يناسب رؤيتك للتصميم
            </p>

            <div style={{ 
              display: 'flex', 
              flexWrap: 'wrap',
              gap: 'var(--space-md)',
              justifyContent: 'center'
            }}>
              {headerOptions.map((option) => (
                <button
                  key={option.id}
                  className={selectedHeader === option.id ? "btn-primary" : "btn-secondary"}
                  onClick={() => setSelectedHeader(option.id)}
                  style={{ minWidth: '120px' }}
                >
                  {option.name}
                </button>
              ))}
            </div>

            <div style={{ 
              marginTop: 'var(--space-xl)',
              padding: 'var(--space-lg)',
              background: 'var(--primary-blue-light)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--primary-blue-border)'
            }}>
              <p className="text-secondary">
                <strong>الهيدر الحالي:</strong> {headerOptions.find(h => h.id === selectedHeader)?.name}
              </p>
            </div>
          </div>

          {/* محتوى تجريبي */}
          <div className="grid-3" style={{ gap: 'var(--space-lg)' }}>
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="modern-card" style={{ padding: 'var(--space-xl)' }}>
                <h3 className="heading-card">مقال تجريبي {i}</h3>
                <p className="text-secondary" style={{ marginTop: 'var(--space-md)' }}>
                  هذا محتوى تجريبي لاختبار شكل الصفحة مع الهيدر المختار. 
                  يمكنك تمرير الصفحة لأعلى وأسفل لرؤية تأثير الهيدر.
                </p>
                <button className="btn-primary" style={{ marginTop: 'var(--space-md)' }}>
                  قراءة المزيد
                </button>
              </div>
            ))}
          </div>

          {/* رابط العودة */}
          <div style={{ textAlign: 'center', marginTop: 'var(--space-3xl)' }}>
            <Link href="/new-design" className="btn-secondary">
              العودة للتصميم الأصلي
            </Link>
          </div>

        </div>
      </div>
    </>
  );
}
