'use client';

import React from 'react';
import DarkModeToggle from '@/components/admin/modern-dashboard/DarkModeToggle';

export default function TestDarkMode() {
  return (
    <>
      <link rel="stylesheet" href="/manus-ui.css" />
      
      <div style={{
        minHeight: '100vh',
        background: 'var(--bg-gradient)',
        padding: '40px',
        fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif'
      }}>
        
        <div style={{
          maxWidth: '800px',
          margin: '0 auto',
          textAlign: 'center'
        }}>
          
          <div style={{
            background: 'hsl(var(--bg-card))',
            borderRadius: '16px',
            padding: '40px',
            boxShadow: 'var(--card-shadow)',
            marginBottom: '20px'
          }}>
            
            <h1 style={{
              fontSize: '32px',
              fontWeight: '700',
              color: 'hsl(var(--fg))',
              marginBottom: '16px'
            }}>
              🌙 اختبار الوضع الداكن
            </h1>
            
            <p style={{
              fontSize: '16px',
              color: 'hsl(var(--muted))',
              marginBottom: '32px'
            }}>
              جرب زر الوضع الداكن أدناه لتبديل الألوان
            </p>
            
            {/* زر الوضع الداكن */}
            <DarkModeToggle />
            
          </div>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '16px',
            marginTop: '20px'
          }}>
            
            <div className="card card-accent" style={{
              background: 'linear-gradient(135deg, hsl(var(--bg-card)) 0%, hsl(var(--accent) / 0.05) 100%)'
            }}>
              <h3 style={{ color: 'hsl(var(--accent))', marginBottom: '8px' }}>
                🔵 أزرق
              </h3>
              <p style={{ color: 'hsl(var(--fg))', fontSize: '14px' }}>
                اللون الأساسي للنظام
              </p>
            </div>
            
            <div className="card card-success" style={{
              background: 'linear-gradient(135deg, hsl(var(--bg-card)) 0%, hsl(var(--accent-3) / 0.05) 100%)'
            }}>
              <h3 style={{ color: 'hsl(var(--accent-3))', marginBottom: '8px' }}>
                🟢 أخضر
              </h3>
              <p style={{ color: 'hsl(var(--fg))', fontSize: '14px' }}>
                للنجاح والإيجابية
              </p>
            </div>
            
            <div className="card card-warning" style={{
              background: 'linear-gradient(135deg, hsl(var(--bg-card)) 0%, hsl(var(--accent-4) / 0.05) 100%)'
            }}>
              <h3 style={{ color: 'hsl(var(--accent-4))', marginBottom: '8px' }}>
                🟠 برتقالي
              </h3>
              <p style={{ color: 'hsl(var(--fg))', fontSize: '14px' }}>
                للتحذيرات والتنبيه
              </p>
            </div>
            
          </div>
          
          <div style={{
            marginTop: '40px',
            padding: '20px',
            background: 'hsl(var(--bg-card))',
            borderRadius: '12px',
            border: '1px solid hsl(var(--line))'
          }}>
            <p style={{
              fontSize: '14px',
              color: 'hsl(var(--muted))',
              margin: 0
            }}>
              💡 الزر يحفظ تفضيلك ويعمل تلقائياً مع إعدادات النظام
            </p>
          </div>
          
          <div style={{ marginTop: '20px' }}>
            <a 
              href="/admin" 
              style={{
                display: 'inline-block',
                padding: '12px 24px',
                background: 'hsl(var(--accent))',
                color: 'white',
                textDecoration: 'none',
                borderRadius: '8px',
                fontWeight: '600'
              }}
            >
              العودة للوحة التحكم
            </a>
          </div>
          
        </div>
      </div>
    </>
  );
}
