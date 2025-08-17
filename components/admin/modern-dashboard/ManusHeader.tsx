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
              </div>
            </Link>
          </div>

          {/* الوسط - التنقل السريع (للشاشات الكبيرة) */}
          <nav style={{ display: 'flex', gap: '8px' }} className="hidden md:flex">
            <Link href="/admin/modern" className="btn btn-sm">
              🏠 الرئيسية
            </Link>
            <Link href="/admin/articles" className="btn btn-sm">
              📝 المقالات
            </Link>
            <Link href="/admin/analytics" className="btn btn-sm">
              📊 التحليلات
            </Link>
            <Link href="/admin/users" className="btn btn-sm">
              👥 المستخدمون
            </Link>
          </nav>

          {/* الجانب الأيسر - الأدوات والمستخدم */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            
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
            <div style={{ display: 'flex', gap: '4px' }} className="hidden lg:flex">
              {Object.entries(themes).slice(0, 3).map(([key, theme]) => (
                <button
                  key={key}
                  className={currentTheme === key ? 'btn-primary' : 'btn'}
                  onClick={() => applyTheme(key)}
                  style={{ 
                    padding: '6px 8px',
                    fontSize: '12px',
                    minWidth: 'auto'
                  }}
                  title={`تغيير إلى ${theme.name}`}
                >
                  {theme.emoji}
                </button>
              ))}
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
                      <Link href="/profile" className="btn" style={{ width: '100%', justifyContent: 'flex-start' }}>
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
                        onClick={logout}
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

      {/* مساحة للهيدر الثابت - بلون الصفحة الرئيسية */}
      <div style={{ 
        height: searchOpen ? '120px' : '56px', 
        transition: 'height 0.3s ease',
        background: 'hsl(var(--bg))'
      }}></div>
    </>
  );
}
