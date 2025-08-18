'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
// import { useSession } from 'next-auth/react';
import { useAuth } from '@/hooks/useAuth';
import { 
  Menu, 
  X, 
  Search, 
  User, 
  Bell, 
  Home,
  FileText,
  TrendingUp,
  Users,
  Settings,
  LogOut,
  ChevronDown,
  BarChart,
  MessageSquare,
  BookOpen
} from 'lucide-react';
import { useResponsive } from '../responsive/ResponsiveDetector';

export default function OptimizedHeader() {
  const { isMobile, isTablet } = useResponsive();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const pathname = usePathname();
  const { user, loading } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { href: '/', label: 'الرئيسية', icon: Home },
    { href: '/news', label: 'الأخبار', icon: FileText },
    { href: '/opinion-articles', label: 'المقالات', icon: BookOpen },
    { href: '/trending', label: 'الأكثر قراءة', icon: TrendingUp },
    { href: '/stats', label: 'الإحصائيات', icon: BarChart },
    { href: '/community', label: 'المجتمع', icon: Users },
  ];

  if (isMobile || isTablet) {
    return (
      <header className={`mobile-header ${isScrolled ? 'scrolled' : ''}`}>
        <div className="mobile-header-container">
          {/* الصف العلوي */}
          <div className="mobile-header-top">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="mobile-menu-btn"
              aria-label="القائمة"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            <Link href="/" className="mobile-logo">
              <span className="logo-text">سبق</span>
              <span className="logo-sub">AI</span>
            </Link>

            <div className="mobile-actions">
              <button
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                className="mobile-search-btn"
                aria-label="البحث"
              >
                <Search size={20} />
              </button>
              
              {user && (
                <button className="mobile-notification-btn" aria-label="الإشعارات">
                  <Bell size={20} />
                  <span className="notification-badge">3</span>
                </button>
              )}
            </div>
          </div>

          {/* شريط البحث */}
          {isSearchOpen && (
            <div className="mobile-search-bar">
              <input
                type="text"
                placeholder="ابحث في سبق..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="mobile-search-input"
              />
              <button className="mobile-search-submit">
                <Search size={18} />
              </button>
            </div>
          )}
        </div>

        {/* القائمة الجانبية */}
        <div className={`mobile-menu ${isMenuOpen ? 'open' : ''}`}>
          <div className="mobile-menu-content">
            {/* معلومات المستخدم */}
            {user ? (
              <div className="mobile-user-info">
                <div className="user-avatar">
                  {user.image ? (
                    <img src={user.image} alt={user.name || ''} />
                  ) : (
                    <User size={24} />
                  )}
                </div>
                <div className="user-details">
                  <h3>{user.name || 'المستخدم'}</h3>
                  <p>{user.email}</p>
                </div>
              </div>
            ) : (
              <div className="mobile-auth-buttons">
                <Link href="/login" className="mobile-login-btn">
                  تسجيل الدخول
                </Link>
                <Link href="/register" className="mobile-register-btn">
                  حساب جديد
                </Link>
              </div>
            )}

            {/* القائمة الرئيسية */}
            <nav className="mobile-nav">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`mobile-nav-item ${pathname === item.href ? 'active' : ''}`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Icon size={20} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>

            {/* خيارات إضافية */}
            {session && (
              <div className="mobile-menu-footer">
                <Link 
                  href="/dashboard" 
                  className="mobile-menu-item"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Settings size={20} />
                  <span>لوحة التحكم</span>
                </Link>
                <button 
                  className="mobile-logout-btn"
                  onClick={async () => {
                    try {
                      // إضافة منطق تسجيل الخروج
                      localStorage.removeItem('auth-token');
                      localStorage.removeItem('user');
                      setIsMenuOpen(false);
                      window.location.href = '/';
                    } catch (error) {
                      console.error('خطأ في تسجيل الخروج:', error);
                    }
                  }}
                >
                  <LogOut size={20} />
                  <span>تسجيل الخروج</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* خلفية القائمة */}
        {isMenuOpen && (
          <div 
            className="mobile-menu-overlay"
            onClick={() => setIsMenuOpen(false)}
          />
        )}
      </header>
    );
  }

  // النسخة الكاملة للديسكتوب
  return (
    <header className={`desktop-header ${isScrolled ? 'scrolled' : ''}`}>
      <div className="desktop-header-container">
        <div className="desktop-header-content">
          {/* الشعار */}
          <Link href="/" className="desktop-logo">
            <span className="logo-text">صحيفة سبق</span>
            <span className="logo-ai">AI</span>
          </Link>

          {/* القائمة الرئيسية */}
          <nav className="desktop-nav">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`desktop-nav-item ${pathname === item.href ? 'active' : ''}`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* شريط البحث */}
          <div className="desktop-search">
            <input
              type="text"
              placeholder="ابحث في سبق..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="desktop-search-input"
            />
            <button className="desktop-search-btn">
              <Search size={18} />
            </button>
          </div>

          {/* الإجراءات */}
          <div className="desktop-actions">
            {session ? (
              <>
                <button className="desktop-notification-btn">
                  <Bell size={20} />
                  <span className="notification-badge">3</span>
                </button>

                <div className="desktop-user-menu">
                  <button className="user-menu-trigger">
                    <div className="user-avatar-small">
                      {session.user?.image ? (
                        <img src={session.user.image} alt={session.user.name || ''} />
                      ) : (
                        <User size={18} />
                      )}
                    </div>
                    <ChevronDown size={16} />
                  </button>

                  <div className="user-dropdown">
                    <Link href="/profile">الملف الشخصي</Link>
                    <Link href="/dashboard">لوحة التحكم</Link>
                    <Link href="/settings">الإعدادات</Link>
                    <hr />
                    <button>تسجيل الخروج</button>
                  </div>
                </div>
              </>
            ) : (
              <div className="desktop-auth">
                <Link href="/login" className="desktop-login-btn">
                  تسجيل الدخول
                </Link>
                <Link href="/register" className="desktop-register-btn">
                  حساب جديد
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
