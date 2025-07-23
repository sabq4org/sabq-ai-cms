'use client';

import React, { useEffect, useState } from 'react';
import { Moon, Sun, Monitor, Palette } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';

interface EnhancedDarkModeToggleProps {
  variant?: 'mobile' | 'desktop' | 'compact';
  showLabel?: boolean;
  className?: string;
}

/**
 * مكون محسن لتبديل الوضع الليلي
 * يدعم النسخة الخفيفة والموبايل مع تصميم احترافي
 */
export default function EnhancedDarkModeToggle({
  variant = 'mobile',
  showLabel = false,
  className = ''
}: EnhancedDarkModeToggleProps) {
  const { theme, resolvedTheme, toggleTheme, setTheme, mounted } = useTheme();
  const [isTransitioning, setIsTransitioning] = useState(false);

  // منع عرض المكون قبل التحميل لتجنب hydration mismatch
  if (!mounted) {
    return (
      <div className={`theme-toggle-skeleton ${variant} ${className}`}>
        <div className="skeleton-icon" />
        {showLabel && <div className="skeleton-text" />}
      </div>
    );
  }

  const handleThemeChange = () => {
    setIsTransitioning(true);
    toggleTheme();
    
    // إضافة تأثير بصري للانتقال
    setTimeout(() => {
      setIsTransitioning(false);
    }, 300);
  };

  const getIcon = () => {
    if (isTransitioning) {
      return <Palette className="w-5 h-5 animate-spin" />;
    }
    
    switch (resolvedTheme) {
      case 'dark':
        return <Moon className="w-5 h-5" />;
      case 'light':
        return <Sun className="w-5 h-5" />;
      default:
        return <Monitor className="w-5 h-5" />;
    }
  };

  const getLabel = () => {
    switch (theme) {
      case 'dark':
        return 'الوضع الليلي';
      case 'light':
        return 'الوضع النهاري';
      case 'system':
        return 'تلقائي';
      default:
        return 'تبديل الوضع';
    }
  };

  const getAriaLabel = () => {
    switch (theme) {
      case 'dark':
        return 'تغيير إلى الوضع النهاري';
      case 'light':
        return 'تغيير إلى الوضع التلقائي';
      case 'system':
        return 'تغيير إلى الوضع الليلي';
      default:
        return 'تبديل وضع العرض';
    }
  };

  if (variant === 'compact') {
    return (
      <button
        onClick={handleThemeChange}
        className={`enhanced-theme-toggle compact ${className}`}
        aria-label={getAriaLabel()}
        disabled={isTransitioning}
      >
        {getIcon()}
      </button>
    );
  }

  if (variant === 'desktop') {
    return (
      <div className={`enhanced-theme-toggle desktop ${className}`}>
        <button
          onClick={handleThemeChange}
          className="theme-button"
          aria-label={getAriaLabel()}
          disabled={isTransitioning}
        >
          {getIcon()}
          {showLabel && <span className="theme-label">{getLabel()}</span>}
        </button>
        
        {/* إضافة قائمة منسدلة للخيارات المتقدمة */}
        <div className="theme-options">
          <button
            onClick={() => setTheme('light')}
            className={`theme-option ${theme === 'light' ? 'active' : ''}`}
            aria-label="الوضع النهاري"
          >
            <Sun className="w-4 h-4" />
            <span>نهاري</span>
          </button>
          <button
            onClick={() => setTheme('dark')}
            className={`theme-option ${theme === 'dark' ? 'active' : ''}`}
            aria-label="الوضع الليلي"
          >
            <Moon className="w-4 h-4" />
            <span>ليلي</span>
          </button>
          <button
            onClick={() => setTheme('system')}
            className={`theme-option ${theme === 'system' ? 'active' : ''}`}
            aria-label="الوضع التلقائي"
          >
            <Monitor className="w-4 h-4" />
            <span>تلقائي</span>
          </button>
        </div>
      </div>
    );
  }

  // النسخة الافتراضية للموبايل
  return (
    <button
      onClick={handleThemeChange}
      className={`enhanced-theme-toggle mobile ${isTransitioning ? 'transitioning' : ''} ${className}`}
      aria-label={getAriaLabel()}
      disabled={isTransitioning}
    >
      <div className="toggle-icon">
        {getIcon()}
      </div>
      {showLabel && (
        <span className="toggle-label">
          {getLabel()}
        </span>
      )}
      
      {/* مؤشر الحالة */}
      <div className={`theme-indicator ${resolvedTheme}`} />
      
      <style jsx>{`
        .enhanced-theme-toggle {
          position: relative;
          display: flex;
          align-items: center;
          gap: 8px;
          background: var(--mobile-input-bg);
          border: 1px solid var(--border-color);
          border-radius: 12px;
          padding: 10px 12px;
          color: var(--text-primary);
          transition: all 0.3s ease;
          cursor: pointer;
          min-height: 44px;
          font-weight: 500;
        }
        
        .enhanced-theme-toggle:hover {
          background: var(--bg-tertiary);
          border-color: var(--accent-primary);
          transform: translateY(-1px);
          box-shadow: 0 4px 12px var(--shadow-color);
        }
        
        .enhanced-theme-toggle:active {
          transform: translateY(0);
          box-shadow: 0 2px 6px var(--shadow-color);
        }
        
        .enhanced-theme-toggle.transitioning {
          pointer-events: none;
          opacity: 0.7;
        }
        
        .enhanced-theme-toggle.compact {
          width: 44px;
          height: 44px;
          padding: 0;
          justify-content: center;
          border-radius: 50%;
        }
        
        .enhanced-theme-toggle.mobile {
          border-radius: 12px;
          background: var(--mobile-card-bg);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
        }
        
        .toggle-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          transition: transform 0.3s ease;
        }
        
        .enhanced-theme-toggle:hover .toggle-icon {
          transform: scale(1.1);
        }
        
        .toggle-label {
          font-size: 14px;
          font-weight: 600;
          white-space: nowrap;
        }
        
        .theme-indicator {
          position: absolute;
          top: -2px;
          right: -2px;
          width: 8px;
          height: 8px;
          border-radius: 50%;
          border: 2px solid var(--bg-primary);
          transition: background-color 0.3s ease;
        }
        
        .theme-indicator.light {
          background-color: #fbbf24;
        }
        
        .theme-indicator.dark {
          background-color: #6366f1;
        }
        
        .theme-indicator.system {
          background: linear-gradient(45deg, #fbbf24 50%, #6366f1 50%);
        }
        
        .theme-toggle-skeleton {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 12px;
          border-radius: 12px;
          background: var(--bg-tertiary);
        }
        
        .skeleton-icon {
          width: 20px;
          height: 20px;
          border-radius: 4px;
          background: var(--border-color);
          animation: skeleton-pulse 1.5s ease-in-out infinite;
        }
        
        .skeleton-text {
          width: 60px;
          height: 14px;
          border-radius: 4px;
          background: var(--border-color);
          animation: skeleton-pulse 1.5s ease-in-out infinite;
        }
        
        @keyframes skeleton-pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        
        /* تحسينات للشاشات الصغيرة */
        @media (max-width: 480px) {
          .enhanced-theme-toggle.mobile {
            padding: 8px 10px;
            gap: 6px;
          }
          
          .toggle-label {
            font-size: 12px;
          }
          
          .theme-indicator {
            width: 6px;
            height: 6px;
          }
        }
        
        /* دعم الـ RTL */
        [dir="rtl"] .theme-indicator {
          left: -2px;
          right: auto;
        }
        
        /* تحسينات للـ accessibility */
        @media (prefers-reduced-motion: reduce) {
          .enhanced-theme-toggle,
          .toggle-icon,
          .theme-indicator {
            transition: none;
          }
        }
        
        /* تحسينات للتباين العالي */
        @media (prefers-contrast: high) {
          .enhanced-theme-toggle {
            border-width: 2px;
          }
          
          .theme-indicator {
            border-width: 3px;
          }
        }
        
        /* إصلاحات خاصة بـ iOS */
        @supports (-webkit-touch-callout: none) {
          .enhanced-theme-toggle {
            -webkit-tap-highlight-color: transparent;
            -webkit-appearance: none;
            appearance: none;
          }
        }
      `}</style>
    </button>
  );
}
