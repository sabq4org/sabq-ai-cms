'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Bars3Icon,
  MagnifyingGlassIcon,
  BellIcon,
  UserCircleIcon,
  SunIcon,
  MoonIcon,
  HomeIcon,
  NewspaperIcon,
  ChartBarIcon,
  PencilSquareIcon
} from '@heroicons/react/24/outline';

// خيار 1: بدون هيدر تماماً
export const NoHeader: React.FC = () => null;

// خيار 2: هيدر مبسط جداً
export const MinimalHeader: React.FC = () => (
  <header style={{
    background: 'var(--background-white)',
    borderBottom: '1px solid var(--border-light)',
    padding: 'var(--space-md) 0',
    position: 'sticky',
    top: 0,
    zIndex: 100
  }}>
    <div className="container-main" style={{ 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center'
    }}>
      <div style={{
        fontSize: 'var(--text-2xl)',
        fontWeight: 'var(--font-weight-bold)',
        color: 'var(--primary-blue)'
      }}>
        سبق الذكية
      </div>
    </div>
  </header>
);

// خيار 3: هيدر شفاف عائم
export const FloatingHeader: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);

  React.useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header style={{
      position: 'fixed',
      top: scrolled ? '20px' : '40px',
      left: '50%',
      transform: 'translateX(-50%)',
      background: scrolled 
        ? 'rgba(255, 255, 255, 0.95)' 
        : 'rgba(255, 255, 255, 0.8)',
      backdropFilter: 'blur(20px)',
      borderRadius: scrolled ? 'var(--radius-full)' : 'var(--radius-xl)',
      padding: scrolled 
        ? 'var(--space-sm) var(--space-xl)' 
        : 'var(--space-md) var(--space-2xl)',
      zIndex: 1000,
      transition: 'all 0.3s ease',
      border: '1px solid var(--border-light)',
      boxShadow: 'var(--shadow-medium)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-lg)' }}>
        <div style={{
          fontSize: scrolled ? 'var(--text-lg)' : 'var(--text-xl)',
          fontWeight: 'var(--font-weight-bold)',
          color: 'var(--primary-blue)',
          transition: 'all 0.3s ease'
        }}>
          سبق الذكية
        </div>
        
        {!scrolled && (
          <nav style={{ display: 'flex', gap: 'var(--space-md)' }}>
            <Link href="#" className="btn-ghost" style={{ fontSize: 'var(--text-sm)' }}>الرئيسية</Link>
            <Link href="#" className="btn-ghost" style={{ fontSize: 'var(--text-sm)' }}>الأخبار</Link>
            <Link href="#" className="btn-ghost" style={{ fontSize: 'var(--text-sm)' }}>التحليلات</Link>
          </nav>
        )}
        
        <button className="btn-primary" style={{ 
          padding: 'var(--space-xs) var(--space-sm)',
          borderRadius: 'var(--radius-full)'
        }}>
          <UserCircleIcon style={{ width: '20px', height: '20px' }} />
        </button>
      </div>
    </header>
  );
};

// خيار 4: هيدر جانبي
export const SideHeader: React.FC = () => (
  <aside style={{
    position: 'fixed',
    right: '30px',
    top: '50%',
    transform: 'translateY(-50%)',
    background: 'var(--background-white)',
    borderRadius: 'var(--radius-full)',
    padding: 'var(--space-lg) var(--space-md)',
    boxShadow: 'var(--shadow-strong)',
    zIndex: 1000,
    border: '1px solid var(--border-light)'
  }}>
    <nav style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      gap: 'var(--space-lg)',
      alignItems: 'center'
    }}>
      <div style={{
        width: '40px',
        height: '40px',
        background: 'linear-gradient(135deg, var(--primary-blue), var(--primary-blue-hover))',
        borderRadius: 'var(--radius-md)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        fontSize: '1.2rem',
        fontWeight: 'var(--font-weight-bold)'
      }}>
        س
      </div>
      
      <button className="btn-ghost" style={{ padding: 'var(--space-sm)' }}>
        <HomeIcon style={{ width: '24px', height: '24px' }} />
      </button>
      <button className="btn-ghost" style={{ padding: 'var(--space-sm)' }}>
        <NewspaperIcon style={{ width: '24px', height: '24px' }} />
      </button>
      <button className="btn-ghost" style={{ padding: 'var(--space-sm)' }}>
        <ChartBarIcon style={{ width: '24px', height: '24px' }} />
      </button>
      <button className="btn-ghost" style={{ padding: 'var(--space-sm)' }}>
        <PencilSquareIcon style={{ width: '24px', height: '24px' }} />
      </button>
      <button className="btn-ghost" style={{ padding: 'var(--space-sm)' }}>
        <MagnifyingGlassIcon style={{ width: '24px', height: '24px' }} />
      </button>
      
      <div style={{
        width: '2px',
        height: '30px',
        background: 'var(--border-light)',
        margin: 'var(--space-sm) 0'
      }} />
      
      <button className="btn-primary" style={{ 
        padding: 'var(--space-sm)',
        borderRadius: 'var(--radius-full)'
      }}>
        <UserCircleIcon style={{ width: '20px', height: '20px' }} />
      </button>
    </nav>
  </aside>
);

// خيار 5: هيدر سفلي (مثل تطبيقات الجوال)
export const BottomHeader: React.FC = () => (
  <nav style={{
    position: 'fixed',
    bottom: '20px',
    left: '50%',
    transform: 'translateX(-50%)',
    background: 'var(--background-white)',
    borderRadius: 'var(--radius-full)',
    padding: 'var(--space-md) var(--space-xl)',
    boxShadow: 'var(--shadow-strong)',
    border: '1px solid var(--border-light)',
    zIndex: 1000
  }}>
    <div style={{ 
      display: 'flex', 
      alignItems: 'center', 
      gap: 'var(--space-xl)'
    }}>
      <button className="btn-ghost" style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center',
        gap: 'var(--space-xs)',
        padding: 'var(--space-sm)'
      }}>
        <HomeIcon style={{ width: '24px', height: '24px', color: 'var(--primary-blue)' }} />
        <span style={{ fontSize: 'var(--text-xs)', color: 'var(--primary-blue)' }}>الرئيسية</span>
      </button>
      
      <button className="btn-ghost" style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center',
        gap: 'var(--space-xs)',
        padding: 'var(--space-sm)'
      }}>
        <NewspaperIcon style={{ width: '24px', height: '24px' }} />
        <span style={{ fontSize: 'var(--text-xs)' }}>أخبار</span>
      </button>
      
      <button className="btn-ghost" style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center',
        gap: 'var(--space-xs)',
        padding: 'var(--space-sm)'
      }}>
        <ChartBarIcon style={{ width: '24px', height: '24px' }} />
        <span style={{ fontSize: 'var(--text-xs)' }}>تحليلات</span>
      </button>
      
      <button className="btn-ghost" style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center',
        gap: 'var(--space-xs)',
        padding: 'var(--space-sm)'
      }}>
        <MagnifyingGlassIcon style={{ width: '24px', height: '24px' }} />
        <span style={{ fontSize: 'var(--text-xs)' }}>بحث</span>
      </button>
      
      <button className="btn-primary" style={{ 
        width: '50px',
        height: '50px',
        borderRadius: 'var(--radius-full)',
        padding: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <UserCircleIcon style={{ width: '24px', height: '24px' }} />
      </button>
    </div>
  </nav>
);

// خيار 6: شريط بحث فقط
export const SearchOnlyHeader: React.FC = () => {
  const [focused, setFocused] = useState(false);
  
  return (
    <header style={{
      position: 'fixed',
      top: '30px',
      left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 1000,
      width: focused ? '90%' : '400px',
      maxWidth: '600px',
      transition: 'all 0.3s ease'
    }}>
      <div style={{
        background: 'var(--background-white)',
        borderRadius: 'var(--radius-full)',
        border: `2px solid ${focused ? 'var(--primary-blue)' : 'var(--border-light)'}`,
        padding: 'var(--space-md) var(--space-lg)',
        boxShadow: focused ? 'var(--shadow-strong)' : 'var(--shadow-medium)',
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-md)',
        transition: 'all 0.3s ease'
      }}>
        {!focused && (
          <div style={{
            fontSize: 'var(--text-lg)',
            fontWeight: 'var(--font-weight-bold)',
            color: 'var(--primary-blue)'
          }}>
            س
          </div>
        )}
        
        <input
          type="text"
          placeholder="البحث في سبق الذكية..."
          style={{
            flex: 1,
            border: 'none',
            outline: 'none',
            fontSize: 'var(--text-base)',
            background: 'transparent',
            textAlign: 'right',
            direction: 'rtl'
          }}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        />
        
        <MagnifyingGlassIcon style={{ 
          width: '20px', 
          height: '20px', 
          color: focused ? 'var(--primary-blue)' : 'var(--text-secondary)'
        }} />
      </div>
    </header>
  );
};
