'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from "@/hooks/useAuth";
import { useClientTheme } from '@/hooks/useClientTheme';
import {
  Bell,
  Search,
  Settings,
  User,
  Menu,
  Home,
  ChevronDown,
  LogOut,
  Heart,
  Bookmark,
  Clock,
  TrendingUp,
  Newspaper,
  Brain,
  Grid,
  Folder,
  Target
} from "lucide-react";
import DarkModeToggle from '@/components/admin/modern-dashboard/DarkModeToggle';
import Image from 'next/image';
import SabqLogo from '@/components/SabqLogo';
import { useSiteSettings } from '@/hooks/useSiteSettings';

import { NotificationDropdown } from '@/components/Notifications/NotificationDropdownOptimized';
import { useDarkMode } from "@/hooks/useDarkMode";

interface UserHeaderProps {
  onMenuClick?: () => void;
  showMenuButton?: boolean;
}

export default function UserHeader({ onMenuClick, showMenuButton = false }: UserHeaderProps) {
  const { darkMode, setDarkMode, mounted } = useClientTheme();
  const { user, logout } = useAuth();
  const { logoUrl, logoDarkUrl } = useSiteSettings();
  const [searchOpen, setSearchOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [currentTheme, setCurrentTheme] = useState('blue');
  const [isMobile, setIsMobile] = useState(false);
  const [currentThemeColor, setCurrentThemeColor] = useState<string | null>(null);
  // Added: track dark mode to avoid ReferenceError and react to changes
// التحقق من حجم الشاشة ومنع مشاكل Hydration
  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // تتبع تغيير اللون من نظام الألوان المتغيرة
  React.useEffect(() => {
    const updateThemeColor = () => {
      const root = document.documentElement;
      const themeColor = root.style.getPropertyValue('--theme-primary');
      const accentColor = root.style.getPropertyValue('--accent');
      
      if (themeColor) {
        setCurrentThemeColor(themeColor);
      } else if (accentColor) {
        // تحويل HSL إلى استخدام مباشر
        const hslMatch = accentColor.match(/(\d+)\s+(\d+)%\s+(\d+)%/);
        if (hslMatch) {
          const [_, h, s, l] = hslMatch;
          setCurrentThemeColor(`hsl(${h}, ${s}%, ${l}%)`);
        }
      } else {
        setCurrentThemeColor(null);
      }
    };

    updateThemeColor();
    window.addEventListener('theme-color-change', updateThemeColor);
    return () => window.removeEventListener('theme-color-change', updateThemeColor);
  }, []);

  // إغلاق القوائم المنسدلة عند النقر خارجها
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // إغلاق قائمة المستخدم
      if (userMenuOpen) {
        const userMenuElement = document.getElementById('user-menu');
        const userButtonElement = document.getElementById('user-menu-button');
        if (userMenuElement && userButtonElement && 
            !userMenuElement.contains(event.target as Node) && 
            !userButtonElement.contains(event.target as Node)) {
          setUserMenuOpen(false);
        }
      }
      
      // إغلاق قائمة البحث
      if (searchOpen) {
        const searchElement = document.getElementById('search-menu');
        const searchButtonElement = document.getElementById('search-button');
        if (searchElement && searchButtonElement && 
            !searchElement.contains(event.target as Node) && 
            !searchButtonElement.contains(event.target as Node)) {
          setSearchOpen(false);
        }
      }
    };

    if (userMenuOpen || searchOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [userMenuOpen, searchOpen]);

  // ثيمات الألوان
  const themes = {
    blue:   { accent: '212 90% 50%', name: 'الأزرق',     emoji: '🔵' },
    green:  { accent: '142 71% 45%', name: 'الأخضر',     emoji: '🟢' },
    purple: { accent: '262 83% 58%', name: 'البنفسجي',   emoji: '🟣' },
    teal:   { accent: '174 72% 45%', name: 'الفيروزي',   emoji: '🟦' },
    amber:  { accent: '39 92% 50%',  name: 'الكهرماني',  emoji: '🟨' },
    rose:   { accent: '340 82% 58%', name: 'الوردي',     emoji: '🌸' },
  } as const;

  const visibleThemeKeys: Array<keyof typeof themes> = [
    'blue', 'green', 'purple', 'teal', 'amber', 'rose'
  ];

  // تطبيق الثيم
  const applyTheme = (theme: string) => {
    const themeData = themes[theme as keyof typeof themes];
    if (themeData) {
      const accent = themeData.accent;
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
      
      // إضافة متغيرات للثيم المتغير
      document.documentElement.style.setProperty('--theme-primary', `hsl(${accent})`);
      document.documentElement.style.setProperty('--theme-secondary', `hsl(${accentHover})`);
      
      // إضافة متغيرات RGB
      const hslToRgb = (h: number, s: number, l: number) => {
        s /= 100;
        l /= 100;
        const k = (n: number) => (n + h / 30) % 12;
        const a = s * Math.min(l, 1 - l);
        const f = (n: number) =>
          l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
        return [255 * f(0), 255 * f(8), 255 * f(4)].map(Math.round);
      };
      
      const [r, g, b] = hslToRgb(parseInt(h), parseInt(s), parseInt(l.replace('%', '')));
      document.documentElement.style.setProperty('--theme-primary-rgb', `${r} ${g} ${b}`);
      
      setCurrentTheme(theme);
    }
  };
  
  // تطبيق الثيم الافتراضي عند التحميل
  React.useEffect(() => {
    // تأخير قليل للتأكد من تحميل DOM
    setTimeout(() => {
      applyTheme(currentTheme);
    }, 100);
  }, []);

  // عدم عرض أي شيء حتى يتم mount الكامل لمنع hydration errors
  if (!mounted) {
    return (
      <header style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: '72px',
        background: currentThemeColor 
          ? `${currentThemeColor}15`
          : (darkMode ? 'rgba(17, 24, 39, 0.85)' : 'rgba(255, 255, 255, 0.6)'),
        borderBottom: currentThemeColor 
          ? `1px solid ${currentThemeColor}30`
          : (darkMode ? '1px solid rgb(55, 65, 81)' : '1px solid rgba(255,255,255,0.3)'),
        zIndex: 1000,
        backdropFilter: 'blur(12px)',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: '100%',
          padding: '0 16px',
          maxWidth: '1400px',
          margin: '0 auto',
          width: '100%'
        }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <span style={{ fontSize: '18px', fontWeight: 'bold' }}>سبق الذكية</span>
          </div>
        </div>
      </header>
    );
  }

  return (
    <>
      <header style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: '72px',
        background: currentThemeColor 
          ? `${currentThemeColor}15`
          : (darkMode ? 'rgba(17, 24, 39, 0.85)' : 'rgba(255, 255, 255, 0.6)'),
        borderBottom: currentThemeColor 
          ? `1px solid ${currentThemeColor}30`
          : (darkMode ? '1px solid rgb(55, 65, 81)' : '1px solid rgba(255,255,255,0.3)'),
        zIndex: 1000,
        backdropFilter: 'blur(12px)',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: '100%',
          padding: '0 16px',
          maxWidth: '1400px',
          margin: '0 auto',
          width: '100%'
        }}>
          
          {/* الجانب الأيمن - الشعار */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            {/* قائمة الجوال */}
            {showMenuButton && (
              <button className="btn btn-sm" onClick={onMenuClick}>
                <Menu style={{ width: '20px', height: '20px' }} />
              </button>
            )}
            
            {/* الشعار */}
            <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none' }}>
              <Image
                src={(isMobile ? (logoUrl || '/logo.png') : (logoUrl || '/logo.png')) as string}
                alt="شعار سبق"
                width={200}
                height={48}
                className="h-12 md:h-12 w-auto object-contain mix-blend-multiply dark:mix-blend-normal"
                priority
                unoptimized={Boolean((logoUrl || '/logo.png').toString().startsWith('http'))}
              />
            </Link>
          </div>

          {/* الوسط - التنقل السريع (للشاشات الكبيرة) */}
          <nav style={{ display: 'flex', gap: '8px', alignItems: 'center' }} className="hidden md:flex">
            <Link href="/" className="btn btn-sm">
              <Home style={{ width: '16px', height: '16px', marginLeft: '6px' }} />
              الرئيسية
            </Link>
            <Link href="/news" className="btn btn-sm">
              <Newspaper style={{ width: '16px', height: '16px', marginLeft: '6px' }} />
              الأخبار
            </Link>
            <Link href="/categories" className="btn btn-sm">
              <Folder style={{ width: '16px', height: '16px', marginLeft: '6px' }} />
              الأقسام
            </Link>
            <Link href="/muqtarab" className="btn btn-sm">
              <Target style={{ width: '16px', height: '16px', marginLeft: '6px' }} />
              مقترب
            </Link>
            <Link href="/insights/deep" className="btn btn-sm">
              <Brain style={{ width: '16px', height: '16px', marginLeft: '6px' }} />
              عمق
            </Link>
          </nav>

          {/* الجانب الأيسر - الأدوات والمستخدم */}
          <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '8px' : '12px' }}>
            
            {/* زر البحث */}
            <button 
              id="search-button"
              className="btn btn-sm"
              onClick={() => setSearchOpen(!searchOpen)}
              title="البحث"
            >
              <Search style={{ width: '18px', height: '18px' }} />
            </button>

            {/* الإشعارات الذكية */}
            {user && (
              <NotificationDropdown />
            )}

            {/* تغيير الثيم السريع - مخفي لاستخدام CompactThemeSwitcher */}
            {/* <div 
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
            </div> */}

            {/* منتقي الألوان المتوسع */}

            {/* زر الوضع الداكن */}
            <DarkModeToggle />

            {/* قائمة المستخدم */}
            {user ? (
              <div style={{ position: 'relative' }}>
                <button 
                  id="user-menu-button"
                  className="btn btn-sm"
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                  <User style={{ width: '18px', height: '18px' }} />
                  {user?.name && !isMobile && (
                    <span style={{ fontSize: '12px', maxWidth: '80px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {user.name}
                    </span>
                  )}
                  <ChevronDown style={{ width: '14px', height: '14px' }} />
                </button>
                
                {userMenuOpen && (
                  <div 
                    id="user-menu"
                    style={{
                      position: 'absolute',
                      top: '45px',
                      right: '-20px',
                      width: '220px',
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
                        <Link href="/favorites" className="btn" style={{ width: '100%', justifyContent: 'flex-start' }}>
                          <Heart style={{ width: '16px', height: '16px' }} />
                          المفضلة
                        </Link>
                      </div>
                      <div className="list-item" style={{ padding: '8px 0' }}>
                        <Link href="/bookmarks" className="btn" style={{ width: '100%', justifyContent: 'flex-start' }}>
                          <Bookmark style={{ width: '16px', height: '16px' }} />
                          المحفوظات
                        </Link>
                      </div>
                      <div className="list-item" style={{ padding: '8px 0' }}>
                        <Link href="/history" className="btn" style={{ width: '100%', justifyContent: 'flex-start' }}>
                          <Clock style={{ width: '16px', height: '16px' }} />
                          سجل التصفح
                        </Link>
                      </div>
                      <div className="list-item" style={{ padding: '8px 0' }}>
                        <Link href="/settings" className="btn" style={{ width: '100%', justifyContent: 'flex-start' }}>
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
            ) : (
              <Link href="/login" className="btn btn-sm btn-primary" style={{
                background: 'hsl(var(--accent))',
                color: 'white'
              }}>
                تسجيل الدخول
              </Link>
            )}
          </div>
        </div>

        {/* شريط البحث الموسع */}
        {searchOpen && (
          <div 
            id="search-menu"
            style={{
              position: 'absolute',
              top: '72px',
              left: 0,
              right: 0,
              background: 'hsl(var(--bg-elevated))',
              borderBottom: '1px solid hsl(var(--line))',
              padding: '16px 24px'
            }}>
            <div style={{ maxWidth: '600px', margin: '0 auto' }}>
              <input
                type="text"
                placeholder="ابحث عن الأخبار، المقالات، الكُتّاب، الموضوعات..."
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '1px solid hsl(var(--line))',
                  borderRadius: '24px',
                  fontSize: '16px',
                  outline: 'none',
                  background: 'hsl(var(--bg))',
                  textAlign: 'center',
                  color: 'hsl(var(--fg))'
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
