'use client';

import React from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { Clock, Eye, MessageCircle, Share2, Heart } from 'lucide-react';
import CloudImage from '@/components/ui/CloudImage';

interface EnhancedMobileCardProps {
  title: string;
  subtitle?: string;
  description?: string;
  image?: string;
  date?: string;
  views?: number;
  likes?: number;
  comments?: number;
  readTime?: number;
  category?: {
    name: string;
    color?: string;
  };
  onClick?: () => void;
  className?: string;
  variant?: 'news' | 'article' | 'analysis' | 'compact';
}

/**
 * بطاقة محسنة للنسخة الخفيفة مع دعم الوضع الليلي
 */
export default function EnhancedMobileCard({
  title,
  subtitle,
  description,
  image,
  date,
  views,
  likes,
  comments,
  readTime,
  category,
  onClick,
  className = '',
  variant = 'news'
}: EnhancedMobileCardProps) {
  const { resolvedTheme } = useTheme();

  const formatNumber = (num?: number) => {
    if (!num) return '0';
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}م`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}ك`;
    return num.toString();
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('ar-SA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date);
  };

  return (
    <article 
      className={`enhanced-mobile-card ${variant} ${resolvedTheme} ${className}`}
      onClick={onClick}
      role={onClick ? 'button' : 'article'}
      tabIndex={onClick ? 0 : undefined}
    >
      {/* الصورة */}
      {image && (
        <div className="card-image-container relative">
          <CloudImage 
            src={image} 
            alt={title}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="card-image object-cover"
            fallbackType="article"
          />
          {category && (
            <div 
              className="card-category absolute bottom-2 right-2 z-10"
              style={{ backgroundColor: category.color || '#3b82f6' }}
            >
              {category.name}
            </div>
          )}
        </div>
      )}

      {/* المحتوى */}
      <div className="card-content">
        {/* العنوان الرئيسي */}
        <h3 className="card-title">{title}</h3>
        
        {/* العنوان الفرعي */}
        {subtitle && (
          <h4 className="card-subtitle">{subtitle}</h4>
        )}
        
        {/* الوصف */}
        {description && (
          <p className="card-description">{description}</p>
        )}

        {/* المعلومات الإضافية */}
        <div className="card-meta">
          {/* التاريخ ووقت القراءة */}
          <div className="meta-left">
            {date && (
              <span className="meta-date">
                <Clock className="meta-icon" />
                {formatDate(date)}
              </span>
            )}
            {readTime && (
              <span className="meta-read-time">
                {readTime} دقيقة قراءة
              </span>
            )}
          </div>

          {/* الإحصائيات */}
          <div className="meta-stats">
            {views && (
              <span className="stat-item">
                <Eye className="stat-icon" />
                {formatNumber(views)}
              </span>
            )}
            {likes && (
              <span className="stat-item">
                <Heart className="stat-icon" />
                {formatNumber(likes)}
              </span>
            )}
            {comments && (
              <span className="stat-item">
                <MessageCircle className="stat-icon" />
                {formatNumber(comments)}
              </span>
            )}
          </div>
        </div>

        {/* أزرار الإجراءات */}
        {variant !== 'compact' && (
          <div className="card-actions">
            <button className="action-button primary">
              قراءة المزيد
            </button>
            <button className="action-button secondary">
              <Share2 className="action-icon" />
              مشاركة
            </button>
          </div>
        )}
      </div>

      <style jsx>{`
        .enhanced-mobile-card {
          background: var(--mobile-card-bg);
          border: 1px solid var(--border-color);
          border-radius: 16px;
          overflow: hidden;
          transition: all 0.3s ease;
          cursor: ${onClick ? 'pointer' : 'default'};
          box-shadow: 0 2px 8px var(--shadow-color);
          position: relative;
        }

        .enhanced-mobile-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px var(--shadow-elevated);
          border-color: var(--accent-primary);
        }

        .enhanced-mobile-card:active {
          transform: translateY(0);
          box-shadow: 0 4px 12px var(--shadow-color);
        }

        /* أنواع البطاقات المختلفة */
        .enhanced-mobile-card.compact {
          border-radius: 12px;
        }

        .enhanced-mobile-card.compact .card-content {
          padding: 12px;
        }

        .enhanced-mobile-card.analysis {
          border-left: 4px solid var(--accent-primary);
        }

        /* حاوية الصورة */
        .card-image-container {
          position: relative;
          width: 100%;
          height: 180px;
          overflow: hidden;
        }

        .enhanced-mobile-card.compact .card-image-container {
          height: 120px;
        }

        .card-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.3s ease;
        }

        .enhanced-mobile-card:hover .card-image {
          transform: scale(1.05);
        }

        .card-category {
          position: absolute;
          top: 12px;
          right: 12px;
          padding: 4px 8px;
          border-radius: 6px;
          color: white;
          font-size: 10px;
          font-weight: 600;
          text-transform: uppercase;
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
        }

        /* محتوى البطاقة */
        .card-content {
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .card-title {
          font-size: 16px;
          font-weight: 700;
          color: var(--text-primary);
          margin: 0;
          line-height: 1.4;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .enhanced-mobile-card.compact .card-title {
          font-size: 14px;
          -webkit-line-clamp: 1;
        }

        .card-subtitle {
          font-size: 14px;
          font-weight: 600;
          color: var(--text-secondary);
          margin: 0;
          line-height: 1.3;
        }

        .card-description {
          font-size: 13px;
          color: var(--text-tertiary);
          margin: 0;
          line-height: 1.5;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .enhanced-mobile-card.compact .card-description {
          display: none;
        }

        /* معلومات البطاقة */
        .card-meta {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-top: 8px;
          padding-top: 8px;
          border-top: 1px solid var(--border-light);
        }

        .meta-left {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .meta-date {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 11px;
          color: var(--text-tertiary);
        }

        .meta-read-time {
          font-size: 10px;
          color: var(--text-tertiary);
          opacity: 0.8;
        }

        .meta-icon {
          width: 12px;
          height: 12px;
        }

        .meta-stats {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .stat-item {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 11px;
          color: var(--text-tertiary);
          font-weight: 500;
        }

        .stat-icon {
          width: 12px;
          height: 12px;
        }

        /* أزرار الإجراءات */
        .card-actions {
          display: flex;
          gap: 8px;
          margin-top: 12px;
          padding-top: 12px;
          border-top: 1px solid var(--border-light);
        }

        .action-button {
          flex: 1;
          padding: 8px 12px;
          border-radius: 8px;
          font-size: 12px;
          font-weight: 600;
          border: none;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 4px;
        }

        .action-button.primary {
          background: var(--accent-primary);
          color: white;
        }

        .action-button.primary:hover {
          background: var(--accent-secondary);
        }

        .action-button.secondary {
          background: var(--bg-tertiary);
          color: var(--text-secondary);
          border: 1px solid var(--border-color);
        }

        .action-button.secondary:hover {
          background: var(--border-color);
          color: var(--text-primary);
        }

        .action-icon {
          width: 14px;
          height: 14px;
        }

        /* الوضع الليلي */
        .enhanced-mobile-card.dark {
          --mobile-card-bg: #1e293b;
          --text-primary: #f8fafc;
          --text-secondary: #e2e8f0;
          --text-tertiary: #cbd5e1;
          --border-color: #475569;
          --border-light: #334155;
          --bg-tertiary: #334155;
          --accent-primary: #3b82f6;
          --accent-secondary: #60a5fa;
          --shadow-color: rgba(0, 0, 0, 0.3);
          --shadow-elevated: rgba(0, 0, 0, 0.5);
        }

        .enhanced-mobile-card.light {
          --mobile-card-bg: #ffffff;
          --text-primary: #1e293b;
          --text-secondary: #475569;
          --text-tertiary: #64748b;
          --border-color: #e2e8f0;
          --border-light: #f1f5f9;
          --bg-tertiary: #f1f5f9;
          --accent-primary: #2563eb;
          --accent-secondary: #3b82f6;
          --shadow-color: rgba(15, 23, 42, 0.08);
          --shadow-elevated: rgba(15, 23, 42, 0.15);
        }

        /* تحسينات للشاشات الصغيرة */
        @media (max-width: 480px) {
          .card-content {
            padding: 12px;
          }

          .card-title {
            font-size: 15px;
          }

          .card-image-container {
            height: 160px;
          }

          .meta-stats {
            gap: 8px;
          }

          .card-actions {
            flex-direction: column;
          }

          .action-button {
            padding: 10px;
          }
        }

        /* تحسينات الـ accessibility */
        @media (prefers-reduced-motion: reduce) {
          .enhanced-mobile-card,
          .card-image,
          .action-button {
            transition: none;
          }
        }

        /* Focus للوصولية */
        .enhanced-mobile-card:focus {
          outline: 2px solid var(--accent-primary);
          outline-offset: 2px;
        }

        /* دعم الـ RTL */
        [dir="rtl"] .card-category {
          left: 12px;
          right: auto;
        }

        [dir="rtl"] .meta-date,
        [dir="rtl"] .stat-item {
          direction: rtl;
        }

        /* إصلاحات خاصة بـ iOS */
        @supports (-webkit-touch-callout: none) {
          .enhanced-mobile-card {
            -webkit-tap-highlight-color: transparent;
          }
        }
      `}</style>
    </article>
  );
}
