'use client';

import React from 'react';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import EnhancedMobileHeader from './EnhancedMobileHeader';

interface EnhancedMobileLayoutProps {
  children: React.ReactNode;
  showHeader?: boolean;
  showFooter?: boolean;
}

export default function EnhancedMobileLayout({
  children,
  showHeader = true,
  showFooter = true
}: EnhancedMobileLayoutProps) {
  const isMobile = useMediaQuery('(max-width: 768px)');

  if (!isMobile) {
    return <>{children}</>;
  }

  return (
    <div className="mobile-layout">
      {/* الهيدر المحسن */}
      {showHeader && <EnhancedMobileHeader />}
      
      {/* المحتوى الرئيسي */}
      <main className="mobile-container">
        <div className="mobile-content">
          {children}
        </div>
      </main>
      
      {/* الفوتر المحسن */}
      {showFooter && (
        <footer className="mobile-footer">
          <div className="footer-content">
            <div className="footer-links">
              <a href="/about" className="footer-link">حول سبق</a>
              <a href="/contact" className="footer-link">اتصل بنا</a>
              <a href="/privacy" className="footer-link">سياسة الخصوصية</a>
              <a href="/terms" className="footer-link">شروط الاستخدام</a>
            </div>
            <div className="footer-copyright">
              <p>© 2024 صحيفة سبق الإلكترونية. جميع الحقوق محفوظة.</p>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}

// مكون حاوية محسنة للموبايل
export function EnhancedMobileContainer({ children }: { children: React.ReactNode }) {
  return (
    <div className="mobile-container">
      <div className="mobile-content">
        {children}
      </div>
    </div>
  );
}

// مكون شبكة محسنة للموبايل
export function EnhancedMobileGrid({ 
  children, 
  columns = 1 
}: { 
  children: React.ReactNode;
  columns?: 1 | 2 | 3;
}) {
  const gridClass = `mobile-grid grid-cols-${columns}`;
  
  return (
    <div className={gridClass}>
      {children}
    </div>
  );
}

// مكون بطاقة محسنة للموبايل
export function EnhancedMobileCard({ 
  children, 
  className = '' 
}: { 
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`enhanced-mobile-card ${className}`}>
      {children}
    </div>
  );
}

// مكون زر محسن للموبايل
export function EnhancedMobileButton({ 
  children, 
  onClick, 
  variant = 'primary',
  size = 'medium',
  className = ''
}: { 
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'small' | 'medium' | 'large';
  className?: string;
}) {
  const baseClass = 'mobile-button';
  const variantClass = `btn-${variant}`;
  const sizeClass = `btn-${size}`;
  
  return (
    <button 
      onClick={onClick}
      className={`${baseClass} ${variantClass} ${sizeClass} ${className}`}
    >
      {children}
    </button>
  );
}

// مكون نص محسن للموبايل
export function EnhancedMobileText({ 
  children, 
  variant = 'body',
  className = ''
}: { 
  children: React.ReactNode;
  variant?: 'title' | 'subtitle' | 'body' | 'caption';
  className?: string;
}) {
  const variantClass = `text-mobile-${variant}`;
  
  return (
    <div className={`${variantClass} ${className}`}>
      {children}
    </div>
  );
}

// مكون مساحة محسنة للموبايل
export function EnhancedMobileSpacer({ 
  size = 'medium' 
}: { 
  size?: 'small' | 'medium' | 'large';
}) {
  const sizeClass = `space-mobile-${size}`;
  
  return <div className={sizeClass} />;
}

// مكون تحميل محسن للموبايل
export function EnhancedMobileLoader() {
  return (
    <div className="mobile-loader">
      <div className="loader-spinner"></div>
      <p className="loader-text">جاري التحميل...</p>
    </div>
  );
}

// مكون رسالة خطأ محسنة للموبايل
export function EnhancedMobileError({ 
  message, 
  onRetry 
}: { 
  message: string;
  onRetry?: () => void;
}) {
  return (
    <div className="mobile-error">
      <div className="error-icon">⚠️</div>
      <p className="error-message">{message}</p>
      {onRetry && (
        <EnhancedMobileButton onClick={onRetry} variant="primary">
          إعادة المحاولة
        </EnhancedMobileButton>
      )}
    </div>
  );
}

// مكون رسالة فارغة محسنة للموبايل
export function EnhancedMobileEmpty({ 
  message, 
  icon = '📭' 
}: { 
  message: string;
  icon?: string;
}) {
  return (
    <div className="mobile-empty">
      <div className="empty-icon">{icon}</div>
      <p className="empty-message">{message}</p>
    </div>
  );
}

// مكون شريط تقدم محسن للموبايل
export function EnhancedMobileProgress({ 
  progress, 
  total 
}: { 
  progress: number;
  total: number;
}) {
  const percentage = Math.min((progress / total) * 100, 100);
  
  return (
    <div className="mobile-progress">
      <div className="progress-bar">
        <div 
          className="progress-fill" 
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
      <p className="progress-text">
        {progress} من {total}
      </p>
    </div>
  );
}

// مكون قائمة محسنة للموبايل
export function EnhancedMobileList({ 
  items, 
  renderItem 
}: { 
  items: any[];
  renderItem: (item: any, index: number) => React.ReactNode;
}) {
  return (
    <div className="mobile-list">
      {items.map((item, index) => (
        <div key={index} className="list-item">
          {renderItem(item, index)}
        </div>
      ))}
    </div>
  );
}

// مكون تبويب محسن للموبايل
export function EnhancedMobileTabs({ 
  tabs, 
  activeTab, 
  onTabChange 
}: { 
  tabs: { id: string; label: string; content: React.ReactNode }[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
}) {
  return (
    <div className="mobile-tabs">
      <div className="tabs-header">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="tabs-content">
        {tabs.find(tab => tab.id === activeTab)?.content}
      </div>
    </div>
  );
} 