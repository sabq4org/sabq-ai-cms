'use client';

import React from 'react';
import Link from 'next/link';
import CloudImage from '@/components/ui/CloudImage';
import { 
  Brain
} from 'lucide-react';
import { formatNumber } from '@/lib/config/localization';
import { DeepAnalysis } from '@/types/deep-analysis';
import ArticleViews from '@/components/ui/ArticleViews';

interface SmartDeepAnalysisCardProps {
  analysis: DeepAnalysis;
  darkMode?: boolean;
}

export default function SmartDeepAnalysisCard({ analysis, darkMode = false }: SmartDeepAnalysisCardProps) {
  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      calendar: 'gregory',
      numberingSystem: 'latn'
    });
  };



  const generatePlaceholderImage = (title: string) => {
    const colors = ['#8B5CF6', '#10B981', '#3B82F6', '#EF4444', '#F59E0B'];
    const colorIndex = title.charCodeAt(0) % colors.length;
    return `data:image/svg+xml,${encodeURIComponent(`
      <svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:${colors[colorIndex]};stop-opacity:1" />
            <stop offset="100%" style="stop-color:${colors[(colorIndex + 1) % colors.length]};stop-opacity:1" />
          </linearGradient>
        </defs>
        <rect width="400" height="300" fill="url(#grad)"/>
        <g opacity="0.2">
          <circle cx="100" cy="100" r="40" fill="white"/>
          <circle cx="300" cy="200" r="60" fill="white"/>
          <circle cx="200" cy="250" r="30" fill="white"/>
        </g>
        <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="24" fill="white" text-anchor="middle" dominant-baseline="middle" opacity="0.8">
          ${title.substring(0, 20)}
        </text>
      </svg>
    `)}`;
  };

  // توحيد تصميم البطاقة: خلفية بيضاء وحدود #f0f0ef
  const baseBg = '#ffffff';
  const hoverBg = '#ffffff';
  const baseBorder = '1px solid #f0f0ef';

  return (
    <Link href={`/insights/deep/${analysis.slug}`} style={{ textDecoration: 'none' }}>
      <div 
        style={{
          background: baseBg,
          border: baseBorder,
          borderRadius: '16px',
          overflow: 'hidden',
          transition: 'all 0.3s ease',
          cursor: 'pointer',
          height: '100%',
          display: 'flex',
          flexDirection: 'column'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-4px)';
          e.currentTarget.style.background = hoverBg;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.background = baseBg;
        }}
      >
        {/* صورة المقال */}
        <div style={{
          position: 'relative',
          height: '180px',
          width: '100%',
          background: '#ffffff',
          overflow: 'hidden'
        }}>
          <CloudImage
            src={analysis.featuredImage || generatePlaceholderImage(analysis.title)}
            alt={analysis.title}
            fill
            className="w-full h-full object-cover transition-transform duration-500"
            fallbackType="article"
            priority={false}
          />
          
          {/* شارة التصنيف */}
          {analysis.categories?.[0] && (
            <div style={{
              position: 'absolute',
              top: '12px',
              right: '12px',
              background: 'hsl(var(--accent))',
              color: 'white',
              padding: '4px 12px',
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: 600,
              zIndex: 10
            }}>
              {analysis.categories[0]}
            </div>
          )}
          
          {/* شارة الذكاء الاصطناعي */}
          <div style={{
            position: 'absolute',
            top: '12px',
            left: '12px',
            background: 'linear-gradient(135deg, #8b5cf6, #a855f7)',
            color: 'white',
            padding: '4px 8px',
            borderRadius: '6px',
            fontSize: '10px',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            zIndex: 10
          }}>
            <Brain style={{ width: '12px', height: '12px' }} />
            <span>ذكي</span>
          </div>
        </div>

        {/* محتوى البطاقة */}
        <div style={{
          padding: '16px',
          flex: 1,
          display: 'flex',
          flexDirection: 'column'
        }}>
          {/* العنوان */}
          <h3 style={{
            fontSize: '16px',
            fontWeight: '600',
            color: 'hsl(var(--fg))',
            marginBottom: '12px',
            lineHeight: '1.5',
            overflow: 'hidden',
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical'
          }}>
            {analysis.title}
          </h3>

          {/* الملخص */}
          {analysis.summary && (
            <p style={{
              fontSize: '14px',
              color: 'hsl(var(--muted))',
              marginBottom: '12px',
              lineHeight: '1.4',
              overflow: 'hidden',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical'
            }}>
              {analysis.summary}
            </p>
          )}

          {/* البيانات الوصفية */}
          <div style={{
            marginTop: 'auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '12px',
            color: 'hsl(var(--muted))'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span>{formatDate(analysis.publishedAt || analysis.createdAt)}</span>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <ArticleViews
                count={analysis.views || 0}
                size="sm"
                showLabel={false}
              />
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
