'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Trophy, Clock, Eye, ChevronLeft, Sparkles } from 'lucide-react';

interface AlHilalArticle {
  id: string;
  title: string;
  slug?: string;
  excerpt?: string;
  imageUrl?: string;
  category?: string;
  publishedAt?: string;
  views?: number;
  isNew?: boolean;
}

interface AlHilalWorldCupBlockProps {
  articles?: AlHilalArticle[];
  className?: string;
  backgroundColor?: string;
  primaryColor?: string;
  textColor?: string;
}

export function AlHilalWorldCupBlock({
  articles = [],
  className = '',
  backgroundColor = '#f0f7ff', // أزرق فاتح جداً
  primaryColor = '#005eb8', // الأزرق الملكي للهلال
  textColor = '#1a1a1a'
}: AlHilalWorldCupBlockProps) {
  
  // مقال تجريبي إذا لم تكن هناك مقالات
  const defaultArticle: AlHilalArticle = {
    id: 'hilal-1',
    title: 'الهلال يتأهب لمواجهة الأهلي المصري في نصف نهائي كأس العالم للأندية',
    imageUrl: 'https://images.unsplash.com/photo-1522778119026-d647f0596c20?auto=format&fit=crop&w=800&q=80',
    publishedAt: new Date().toISOString(),
    views: 1250,
    isNew: true,
    category: 'الهلال'
  };

  const article = articles.length > 0 ? articles[0] : defaultArticle;

  const formatDate = (date: string) => {
    const now = new Date();
    const articleDate = new Date(date);
    const diffMs = now.getTime() - articleDate.getTime();
    const diffMinutes = Math.floor(diffMs / 60000);
    
    if (diffMinutes < 60) {
      return `منذ ${diffMinutes} دقيقة`;
    } else if (diffMinutes < 1440) { // أقل من 24 ساعة
      const hours = Math.floor(diffMinutes / 60);
      return `منذ ${hours} ${hours === 1 ? 'ساعة' : 'ساعات'}`;
    }
    
    return articleDate.toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div 
      className={`smart-block-container ${className}`}
      style={{
        backgroundColor: backgroundColor,
        color: textColor,
        borderRadius: '20px',
        padding: '2rem',
        marginBottom: '2rem',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* خلفية مزخرفة */}
      <div 
        style={{
          position: 'absolute',
          top: '-50%',
          left: '-20%',
          width: '200px',
          height: '200px',
          background: `linear-gradient(135deg, ${primaryColor}10, transparent)`,
          borderRadius: '50%',
          filter: 'blur(40px)'
        }}
      />
      <div 
        style={{
          position: 'absolute',
          bottom: '-30%',
          right: '-10%',
          width: '150px',
          height: '150px',
          background: `linear-gradient(135deg, ${primaryColor}08, transparent)`,
          borderRadius: '50%',
          filter: 'blur(30px)'
        }}
      />

      {/* رأس البلوك */}
      <div className="smart-block-header" style={{ borderBottomColor: `${primaryColor}20` }}>
        <div className="smart-block-header-content">
          <div className="smart-block-title-wrapper">
            <Trophy 
              className="smart-block-icon" 
              style={{ color: primaryColor }}
            />
            <h2 
              className="smart-block-title"
              style={{ color: textColor }}
            >
              الهلال في بطولة العالم
            </h2>
            <Sparkles 
              className="w-5 h-5" 
              style={{ color: primaryColor, opacity: 0.6 }}
            />
          </div>
        </div>
        <Link 
          href="/category/al-hilal-world-cup" 
          className="view-all-link"
          style={{ color: primaryColor }}
        >
          عرض الكل
          <ChevronLeft className="w-4 h-4" />
        </Link>
      </div>

      {/* محتوى البلوك - كرت واحد */}
      <div className="mt-6">
        <Link
          href={`/article/${article.id}`}
          className="block"
        >
          <div 
            className="article-card group"
            style={{
              backgroundColor: 'white',
              borderColor: `${primaryColor}20`,
              borderWidth: '1px',
              borderStyle: 'solid',
              height: 'auto',
              display: 'flex',
              flexDirection: 'row',
              gap: '1.5rem',
              padding: '1rem',
              alignItems: 'center'
            }}
          >
            {/* صورة المقال */}
            <div 
              className="article-card-image"
              style={{
                width: '280px',
                height: '180px',
                flexShrink: 0,
                borderRadius: '12px',
                overflow: 'hidden',
                position: 'relative'
              }}
            >
              {article.imageUrl ? (
                <Image
                  src={article.imageUrl}
                  alt={article.title}
                  fill
                  className="object-cover"
                />
              ) : (
                <div 
                  className="w-full h-full flex items-center justify-center"
                  style={{
                    background: `linear-gradient(135deg, ${primaryColor}20, ${primaryColor}10)`
                  }}
                >
                  <Trophy 
                    className="w-12 h-12" 
                    style={{ color: primaryColor }}
                  />
                </div>
              )}
              
              {/* شارة جديد */}
              {article.isNew && (
                <span 
                  className="absolute top-2 right-2 text-white text-xs px-3 py-1.5 rounded-full font-bold"
                  style={{ 
                    backgroundColor: '#ff4444',
                    boxShadow: '0 2px 8px rgba(255, 68, 68, 0.3)'
                  }}
                >
                  جديد
                </span>
              )}

              {/* وسم الهلال */}
              <span 
                className="absolute bottom-2 right-2 text-white text-xs px-3 py-1.5 rounded-full font-medium"
                style={{ 
                  backgroundColor: primaryColor,
                  boxShadow: `0 2px 8px ${primaryColor}40`
                }}
              >
                الهلال
              </span>
            </div>
            
            {/* محتوى المقال */}
            <div className="flex-1 py-2">
              <h3 
                className="article-card-title text-xl font-bold mb-3 line-clamp-2"
                style={{ 
                  color: textColor,
                  lineHeight: '1.5'
                }}
              >
                {article.title}
              </h3>
              
              {/* معلومات المقال */}
              <div 
                className="article-card-meta"
                style={{
                  borderTop: 'none',
                  paddingTop: '0',
                  gap: '1.5rem'
                }}
              >
                <span 
                  className="flex items-center gap-1.5"
                  style={{ color: '#64748b' }}
                >
                  <Clock className="w-4 h-4" />
                  {article.publishedAt ? formatDate(article.publishedAt) : 'منذ قليل'}
                </span>
                <span 
                  className="flex items-center gap-1.5"
                  style={{ color: '#64748b' }}
                >
                  <Eye className="w-4 h-4" />
                  {article.views || 0} مشاهدة
                </span>
              </div>
            </div>
          </div>
        </Link>
      </div>

      {/* نسخة موبايل */}
      <style jsx>{`
        @media (max-width: 768px) {
          .article-card {
            flex-direction: column !important;
            gap: 0 !important;
          }
          
          .article-card-image {
            width: 100% !important;
            height: 200px !important;
          }
          
          .article-card-title {
            font-size: 1rem !important;
          }
          
          .smart-block-container {
            padding: 1.5rem !important;
          }
        }
      `}</style>
    </div>
  );
} 