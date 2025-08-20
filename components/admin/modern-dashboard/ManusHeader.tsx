'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from "@/hooks/useAuth";
import {
  Bell,
  Search,
  Settings,
  User,
  Menu,
  Home,
  ChevronDown,
  LogOut,
  FileText,
  BarChart3,
  Users
} from "lucide-react";
import DarkModeToggle from './DarkModeToggle';


interface ManusHeaderProps {
  onMenuClick?: () => void;
  showMenuButton?: boolean;
}

export default function ManusHeader({ onMenuClick, showMenuButton = false }: ManusHeaderProps) {
  const { user, logout } = useAuth();
  const [searchOpen, setSearchOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [currentTheme, setCurrentTheme] = useState('blue');
  const [isMobile, setIsMobile] = useState(false);
  
  // التحقق من حجم الشاشة
  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // ثيمات الألوان
  const themes = {
    // الأساسية الحالية
    blue:   { accent: '212 90% 50%', name: 'الأزرق',     emoji: '🔵' },
    green:  { accent: '142 71% 45%', name: 'الأخضر',     emoji: '🟢' },
    purple: { accent: '262 83% 58%', name: 'البنفسجي',   emoji: '🟣' },
    // ألوان إضافية
    teal:   { accent: '174 72% 45%', name: 'الفيروزي',   emoji: '🟦' },
    amber:  { accent: '39 92% 50%',  name: 'الكهرماني',  emoji: '🟨' },
    rose:   { accent: '340 82% 58%', name: 'الوردي',     emoji: '🌸' },
    // ألوان متوفرة لكن مخفية افتراضياً (يمكن استخدامها لاحقاً)
    orange: { accent: '25 95% 53%',  name: 'البرتقالي',  emoji: '🟠' },
    red:    { accent: '0 84% 60%',   name: 'الأحمر',     emoji: '🔴' },
  } as const;

  // مفاتيح الألوان التي نعرضها في الهيدر (٦ ألوان)
  const visibleThemeKeys: Array<keyof typeof themes> = [
    'blue', 'green', 'purple', 'teal', 'amber', 'rose'
  ];

  // تطبيق الثيم مع ضبط المتغيرات المشتقة
  const applyTheme = (theme: string) => {
    const themeData = themes[theme as keyof typeof themes];
    if (themeData) {
      const accent = themeData.accent; // صيغة: "H S% L%"
      const parts = accent.split(' ');
      const h = parts[0] || '212';
      const s = parts[1] || '90%';
      const l = parts[2] || '50%';
      const lNum = parseFloat(l.replace('%', ''));
      const hoverL = Math.max(0, Math.min(100, lNum - 5));
      const accentHover = `${h} ${s} ${hoverL}%`;
      const accentLight = `${h} ${s} 96%`;

      document.documentElement.style.setProperty('--accent', accent);
      document.documentElement.style.setProperty('--accent-hover', accentHover);
      document.documentElement.style.setProperty('--accent-light', accentLight);
      setCurrentTheme(theme);
    }
  };

  return (
    <>
      <link rel="stylesheet" href="/manus-ui.css" />
      
      {/* هيدر كامل العرض */}
      <header style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: '56px',
        background: 'hsl(var(--bg-elevated))',
        borderBottom: '1px solid hsl(var(--line))',
        zIndex: 1000,
        backdropFilter: 'blur(10px)',
        boxShadow: '0 1px 3px hsla(var(--shadow) / 0.1)'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: '100%',
          padding: '0 20px',
          maxWidth: '100%'
        }}>
          
          {/* الجانب الأيمن - الشعار والقائمة */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            {/* قائمة الجوال */}
            {showMenuButton && (
              <button className="btn btn-sm" onClick={onMenuClick}>
                <Menu style={{ width: '20px', height: '20px' }} />
              </button>
            )}
            
            {/* الشعار والعنوان */}
            <Link href="/admin" style={{ display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none' }}>
              <div style={{
                width: '40px',
                height: '40px',
                background: 'hsl(var(--accent))',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '20px',
                fontWeight: '700'
              }}>
                س
              </div>
              <div>
                {isMobile ? (
                  <span style={{ 
                    fontSize: '20px', 
                    fontWeight: '700',
                    color: 'hsl(var(--accent))',
                    letterSpacing: '-0.5px'
                  }}>
                    سبق
                  </span>
                ) : (
                  <>
                    <h1 style={{ 
                      margin: 0, 
                      fontSize: '18px', 
                      fontWeight: '600',
                      color: 'hsl(var(--fg))'
                    }}>
                      سبق الذكية
                    </h1>
                    <p style={{ 
                      margin: 0, 
                      fontSize: '12px', 
                      color: 'hsl(var(--muted))'
                    }}>
                      لوحة التحكم الإدارية
                    </p>
                  </>
                )}
              </div>
            </Link>
          </div>

          {/* الوسط - الوصول السريع (للشاشات الكبيرة) */}
          <nav style={{ display: 'flex', gap: '8px', alignItems: 'center' }} className="hidden md:flex">
            <Link href="/admin" className="btn btn-sm">
              🏠 الرئيسية
            </Link>
            <Link href="/admin/news" className="btn btn-sm">
              📰 الأخبار
            </Link>
            <Link href="/admin/articles" className="btn btn-sm">
              📝 المقالات
            </Link>
            <Link href="/admin/muqtarab" className="btn btn-sm">
              🧩 مقترب
            </Link>
            <Link href="/admin/deep-analysis" className="btn btn-sm">
              🧠 عمق
            </Link>
            <Link href="/admin/news/unified" className="btn btn-sm btn-primary" style={{ background: 'hsl(var(--accent))', color: 'white' }}>
              ＋
            </Link>
          </nav>

          {/* الجانب الأيسر - الأدوات والمستخدم */}
          <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '8px' : '12px' }}>
            {/* زر القائمة للموبايل */}
            {showMenuButton && (
              <button 
                onClick={onMenuClick}
                className="btn btn-sm"
                style={{ 
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '8px',
                  width: '36px',
                  height: '36px'
                }}
              >
                <Menu style={{ width: '20px', height: '20px' }} />
              </button>
            )}
            
            
            {/* شريط البحث */}
            <div style={{ position: 'relative' }}>
              <button 
                className="btn btn-sm"
                onClick={() => setSearchOpen(!searchOpen)}
              >
                <Search style={{ width: '18px', height: '18px' }} />
              </button>
              
              {searchOpen && (
                <div style={{
                  position: 'absolute',
                  top: '45px',
                  right: 0,
                  width: '300px',
                  background: 'hsl(var(--bg))',
                  border: '1px solid hsl(var(--line))',
                  borderRadius: '12px',
                  padding: '12px',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
                }}>
                  <input
                    type="text"
                    placeholder="البحث في النظام..."
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid hsl(var(--line))',
                      borderRadius: '8px',
                      fontSize: '14px',
                      outline: 'none',
                      background: 'hsl(var(--bg))'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = 'hsl(var(--accent))';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = 'hsl(var(--line))';
                    }}
                  />
                </div>
              )}
            </div>

            {/* الإشعارات */}
            <button className="btn btn-sm">
              <Bell style={{ width: '18px', height: '18px' }} />
              <span className="chip" style={{
                background: 'hsl(var(--accent))',
                color: 'white',
                fontSize: '10px',
                padding: '2px 6px',
                borderRadius: '10px',
                border: 'none',
                marginRight: '4px'
              }}>
                3
              </span>
            </button>

            {/* تغيير الثيم السريع */}
            <div 
              className="theme-colors-scroll"
              style={{ 
                display: 'flex', 
                gap: '8px',
                overflowX: 'auto',
                WebkitOverflowScrolling: 'touch',
                scrollbarWidth: 'none',
                msOverflowStyle: 'none',
                maxWidth: isMobile ? '180px' : '250px',
                padding: '4px 8px',
                margin: '0 -8px'
              }}
            >

              {visibleThemeKeys.map((key) => {
                const theme = themes[key];
                const isActive = currentTheme === key;
                return (
                  <button
                    key={key}
                    className={isActive ? 'btn btn-primary btn-xs' : 'btn btn-xs'}
                    onClick={() => applyTheme(key)}
                    aria-pressed={isActive}
                    aria-label={`تغيير إلى ${theme.name}`}
                    title={`تغيير إلى ${theme.name}`}
                    style={{ 
                      padding: '4px',
                      minWidth: '32px',
                      width: '32px',
                      height: '32px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: 'none',
                      background: 'transparent'
                    }}
                  >
                    <span
                      aria-hidden
                      style={{
                        display: 'inline-block',
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        background: `hsl(${theme.accent})`,
                        border: isActive ? '3px solid white' : '2px solid transparent',
                        boxShadow: isActive ? `0 0 0 2px hsl(${theme.accent})` : '0 1px 3px rgba(0,0,0,0.2)',
                        position: 'relative'
                      }}
                    >
                      {isActive && (
                        <svg 
                          style={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            width: '12px',
                            height: '12px'
                          }}
                          fill="white" 
                          viewBox="0 0 20 20"
                        >
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* زر الوضع الداكن */}
            <DarkModeToggle />

            {/* قائمة المستخدم */}
            <div style={{ position: 'relative' }}>
              <button 
                className="btn btn-sm"
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                <User style={{ width: '18px', height: '18px' }} />
                {user?.name && (
                  <span style={{ fontSize: '12px', maxWidth: '80px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {user.name}
                  </span>
                )}
                <ChevronDown style={{ width: '14px', height: '14px' }} />
              </button>
              
              {userMenuOpen && (
                <div style={{
                  position: 'absolute',
                  top: '45px',
                  right: 0,
                  width: '200px',
                  background: 'hsl(var(--bg))',
                  border: '1px solid hsl(var(--line))',
                  borderRadius: '12px',
                  padding: '8px',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
                }}>
                  <div className="divide-list">
                    <div className="list-item" style={{ padding: '8px 0' }}>
                      <Link href="/admin/modern/settings" className="btn" style={{ width: '100%', justifyContent: 'flex-start' }}>
                        <User style={{ width: '16px', height: '16px' }} />
                        الملف الشخصي
                      </Link>
                    </div>
                    <div className="list-item" style={{ padding: '8px 0' }}>
                      <Link href="/admin/settings" className="btn" style={{ width: '100%', justifyContent: 'flex-start' }}>
                        <Settings style={{ width: '16px', height: '16px' }} />
                        الإعدادات
                      </Link>
                    </div>
                    <div className="list-item" style={{ padding: '8px 0' }}>
                      <button 
                        className="btn" 
                        onClick={async () => {
                          try { await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' }); } catch {}
                          try { await logout(); } catch {}
                          window.location.replace('/admin/login');
                        }}
                        style={{ width: '100%', justifyContent: 'flex-start', color: '#ef4444' }}
                      >
                        <LogOut style={{ width: '16px', height: '16px' }} />
                        تسجيل الخروج
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* شريط البحث الموسع */}
        {searchOpen && (
          <div style={{
            position: 'absolute',
            top: '56px',
            left: 0,
            right: 0,
            background: 'hsl(var(--bg))',
            borderBottom: '1px solid hsl(var(--line))',
            padding: '16px 24px'
          }}>
            <div style={{ maxWidth: '600px', margin: '0 auto' }}>
              <input
                type="text"
                placeholder="البحث في المقالات، المستخدمين، التحليلات..."
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '1px solid hsl(var(--line))',
                  borderRadius: '24px',
                  fontSize: '16px',
                  outline: 'none',
                  background: 'hsl(var(--bg))',
                  textAlign: 'center'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = 'hsl(var(--accent))';
                  e.target.style.boxShadow = '0 0 0 3px hsl(var(--accent) / 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'hsl(var(--line))';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>
          </div>
        )}
      </header>

    </>
  );
}
