'use client';

import React from 'react';
import Link from 'next/link';

export default function CompareDashboards() {
  return (
    <>
      <link rel="stylesheet" href="/manus-ui.css" />
      
      <div style={{
        minHeight: '100vh',
        background: 'hsl(var(--bg))',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px'
      }}>
        <div className="card" style={{ 
          maxWidth: '600px', 
          width: '100%',
          padding: '48px',
          textAlign: 'center'
        }}>
          <div style={{
            width: '80px',
            height: '80px',
            background: 'linear-gradient(135deg, hsl(var(--accent)), hsl(var(--accent)) / 0.8)',
            borderRadius: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: '2rem',
            fontWeight: '700',
            margin: '0 auto 24px'
          }}>
            🎨
          </div>

          <h1 className="heading-1" style={{ marginBottom: '16px' }}>
            مقارنة تصاميم لوحة التحكم
          </h1>
          
          <p className="text-base text-muted" style={{ 
            marginBottom: '40px',
            lineHeight: '1.6'
          }}>
            تم تطبيق تصميم Manus UI الثنائي الألوان على لوحة التحكم الرئيسية.
            يمكنك المقارنة بين التصميمين والاختيار بينهما.
          </p>

          <div style={{ 
            display: 'flex', 
            flexDirection: 'column',
            gap: '16px',
            marginBottom: '32px'
          }}>
            <Link href="/dashboard" className="btn btn-primary" style={{
              padding: '16px 24px',
              fontSize: '16px',
              fontWeight: '600'
            }}>
              🚀 لوحة التحكم الجديدة - Manus UI
            </Link>
            
            <Link href="/dashboard/original" className="btn" style={{
              padding: '16px 24px',
              fontSize: '16px'
            }}>
              📊 لوحة التحكم الأصلية
            </Link>
          </div>

          <div className="divider"></div>

          <h3 className="heading-3" style={{ marginBottom: '16px' }}>
            ✨ مميزات التصميم الجديد
          </h3>

          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '16px',
            textAlign: 'right'
          }}>
            <div>
              <div className="text-sm" style={{ fontWeight: '600', marginBottom: '4px' }}>
                🎨 لونان فقط
              </div>
              <div className="text-xs text-muted">
                تصميم نظيف بدون تشتت بصري
              </div>
            </div>
            
            <div>
              <div className="text-sm" style={{ fontWeight: '600', marginBottom: '4px' }}>
                🚫 بدون ظلال
              </div>
              <div className="text-xs text-muted">
                اعتماد على الحدود والفواصل
              </div>
            </div>
            
            <div>
              <div className="text-sm" style={{ fontWeight: '600', marginBottom: '4px' }}>
                🎯 قابل للتخصيص
              </div>
              <div className="text-xs text-muted">
                تغيير الألوان بنقرة واحدة
              </div>
            </div>
            
            <div>
              <div className="text-sm" style={{ fontWeight: '600', marginBottom: '4px' }}>
                📱 متجاوب تماماً
              </div>
              <div className="text-xs text-muted">
                محسن للجوال والديسكتوب
              </div>
            </div>
          </div>

          <div className="divider"></div>

          <div style={{ 
            display: 'flex', 
            gap: '12px', 
            justifyContent: 'center',
            flexWrap: 'wrap'
          }}>
            <Link href="/manus-ui" className="btn btn-sm">عرض توضيحي</Link>
            <Link href="/new-design" className="btn btn-sm">التصاميم الأخرى</Link>
            <Link href="/" className="btn btn-sm">العودة للموقع</Link>
          </div>
        </div>
      </div>
    </>
  );
}
