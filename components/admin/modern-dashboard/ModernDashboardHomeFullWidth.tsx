/**
 * لوحة التحكم الحديثة - تصميم Manus UI - إصدار عامل
 * Modern Dashboard - Manus UI Design - Working Version
 */

"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from "@/hooks/useAuth";
import {
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  BarChart3,
  Bell,
  Eye,
  FileText,
  Home,
  MessageSquare,
  Settings,
  Users,
  Plus,
  Search,
  Menu,
  X,
  Target,
  Zap,
  Globe
} from "lucide-react";

// تطبيق Manus UI النظيف بدون أخطاء
export default function ModernDashboardHomeFullWidth() {
  const { user } = useAuth();
  const [currentTheme, setCurrentTheme] = useState('blue');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [isMobile, setIsMobile] = useState(false);

  // كشف الجهاز المحمول
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      setSidebarOpen(!mobile);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

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

  // بيانات الإحصائيات
  const statsData = [
    {
      title: "إجمالي الزوار",
      value: "45.2K",
      icon: Users,
      change: 12.5,
      changeType: "increase" as const,
    },
    {
      title: "مشاهدات الصفحة",
      value: "128.4K",
      icon: Eye,
      change: 8.2,
      changeType: "increase" as const,
    },
    {
      title: "المقالات",
      value: "1,247",
      icon: FileText,
      change: -2.1,
      changeType: "decrease" as const,
    },
    {
      title: "التعليقات",
      value: "896",
      icon: MessageSquare,
      change: 15.3,
      changeType: "increase" as const,
    },
  ];

  // مكون الإحصائيات
  const StatCard = ({ title, value, icon: Icon, change, changeType }: any) => {
    const ChangeIcon = changeType === 'increase' ? ArrowUpRight : ArrowDownRight;
    
    return (
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
            color: 'hsl(var(--accent))'
          }}>
            <Icon style={{ width: '24px', height: '24px' }} />
          </div>
          
          <div style={{ flex: 1 }}>
            <div className="text-xs text-muted" style={{ marginBottom: '4px' }}>{title}</div>
            <div className="heading-3" style={{ margin: '4px 0', color: 'hsl(var(--accent))' }}>
              {value}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <ChangeIcon style={{ 
                width: '14px', 
                height: '14px',
                color: changeType === 'increase' ? '#10b981' : '#ef4444'
              }} />
              <span className="text-xs" style={{ 
                color: changeType === 'increase' ? '#10b981' : '#ef4444' 
              }}>
                {Math.abs(change)}%
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <link rel="stylesheet" href="/manus-ui.css" />
      
      <div style={{ background: 'hsl(var(--bg))', minHeight: '100vh', padding: '24px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          
          {/* هيدر الصفحة */}
          <header style={{
            marginBottom: '32px',
            padding: '24px 0',
            borderBottom: '1px solid hsl(var(--line))'
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{
                width: '64px',
                height: '64px',
                background: 'hsl(var(--accent))',
                borderRadius: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '32px',
                fontWeight: '700',
                margin: '0 auto 16px'
              }}>
                س
              </div>
              <h1 className="heading-1" style={{ marginBottom: '8px' }}>سبق الذكية</h1>
              <p className="text-base text-muted">لوحة التحكم الإدارية - تصميم Manus UI</p>
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
              <div style={{ fontSize: '64px', marginBottom: '16px' }}>🎉</div>
              <div className="card-title" style={{ fontSize: '24px', marginBottom: '12px' }}>
                تم تطبيق Manus UI بنجاح!
              </div>
              <div className="card-subtitle" style={{ marginBottom: '24px', fontSize: '16px' }}>
                التصميم الثنائي الألوان يعمل الآن بدون قوائم إضافية
              </div>
              
              <div className="grid grid-2" style={{ gap: '16px', maxWidth: '400px', margin: '0 auto' }}>
                <div className="card" style={{ padding: '16px' }}>
                  <div className="text-sm" style={{ fontWeight: '600', marginBottom: '4px' }}>
                    ✅ مشكلة القائمة الإضافية
                  </div>
                  <div className="text-xs text-muted">تم حلها نهائياً</div>
                </div>
                
                <div className="card" style={{ padding: '16px' }}>
                  <div className="text-sm" style={{ fontWeight: '600', marginBottom: '4px' }}>
                    🎨 تصميم Manus UI
                  </div>
                  <div className="text-xs text-muted">يعمل بدون أخطاء</div>
                </div>
              </div>
            </div>
          </section>

          {/* تغيير الألوان */}
          <section style={{ marginBottom: '32px' }}>
            <div className="card">
              <div className="card-header">
                <div className="card-title">🎨 تجربة الألوان</div>
                <div className="card-subtitle">جرب الألوان المختلفة للواجهة</div>
              </div>
              
              <div style={{ textAlign: 'center' }}>
                <div className="text-sm" style={{ marginBottom: '16px' }}>
                  اللون الحالي: <strong>{themes[currentTheme as keyof typeof themes].name}</strong>
                </div>
                
                <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
                  {Object.entries(themes).map(([key, theme]) => (
                    <button
                      key={key}
                      className={`btn ${currentTheme === key ? 'btn-primary' : ''}`}
                      onClick={() => applyTheme(key)}
                      style={{ minWidth: '80px' }}
                    >
                      {theme.name}
                    </button>
                  ))}
                </div>
                
                <div className="text-xs text-muted" style={{ marginTop: '16px' }}>
                  💡 التغيير فوري ويؤثر على كامل الصفحة
                </div>
              </div>
            </div>
          </section>

          {/* روابط مفيدة */}
          <section>
            <div className="card">
              <div className="card-header">
                <div className="card-title">🔗 صفحات أخرى</div>
                <div className="card-subtitle">جرب التصاميم المختلفة</div>
              </div>
              
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '12px'
              }}>
                <Link href="/admin" className="btn">
                  📊 الإدارة الأصلية
                </Link>
                <Link href="/dashboard-simple" className="btn">
                  📋 لوحة التحكم البسيطة
                </Link>
                <Link href="/manus-ui" className="btn">
                  🎨 العرض التوضيحي
                </Link>
                <Link href="/" className="btn btn-primary">
                  🏠 الموقع الرئيسي
                </Link>
              </div>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}