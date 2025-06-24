'use client';

import React from 'react';
import { CardGridBlock } from './CardGridBlock';
import { HeadlineListBlock } from './HeadlineListBlock';
import { ImageLeftBlock } from './ImageLeftBlock';
import { CarouselBlock } from './CarouselBlock';
import { HtmlBlock } from './HtmlBlock';
import { HeroSliderBlock } from './HeroSliderBlock';
import { MagazineLayoutBlock } from './MagazineLayoutBlock';
import { AlHilalWorldCupBlock } from './AlHilalWorldCupBlock';

interface SmartBlock {
  id: string;
  name: string;
  type: 'smart' | 'custom' | 'html';
  displayType: 'cards' | 'headline' | 'image-left' | 'carousel' | 'grid' | 'list' | 'horizontal' | 'gallery' | 'hero-slider' | 'magazine';
  theme: {
    primaryColor: string;
    backgroundColor: string;
    textColor: string;
    secondaryColor?: string;
    accentColor?: string;
    borderColor?: string;
  };
  customHtml?: string;
  articlesCount: number;
  keywords?: string[];
  category?: string;
  padding?: string;
  margin?: string;
  bgColor?: string;
  visibility?: 'all' | 'guest' | 'user';
  maxItems?: number;
}

interface Article {
  id: string;
  title: string;
  slug?: string;
  excerpt?: string;
  content?: string;
  image?: string;
  featured_image?: string;
  imageUrl?: string;
  category?: string;
  author?: {
    name: string;
    avatar?: string;
  };
  published_at?: string;
  created_at?: string;
  publishedAt?: string;
  views?: number;
  readTime?: number;
  breaking?: boolean;
}

interface SmartBlockRendererProps {
  block: SmartBlock;
  articles: Article[];
  userType?: 'guest' | 'user';
}

/**
 * SmartBlockRenderer - المكون الرئيسي لعرض البلوكات الذكية
 * 
 * يدعم الألوان المخصصة من خلال:
 * - theme.primaryColor: اللون الأساسي للعناصر التفاعلية والأيقونات
 * - theme.backgroundColor: لون خلفية البلوك
 * - theme.textColor: لون النص الأساسي
 * - theme.secondaryColor: لون ثانوي للخلفيات الفرعية
 * 
 * جميع المكونات تطبق هذه الألوان ديناميكياً عبر inline styles
 */
export const SmartBlockRenderer: React.FC<SmartBlockRendererProps> = ({
  block,
  articles,
  userType = 'guest'
}) => {
  // التحقق من صلاحية العرض
  if (block.visibility && block.visibility !== 'all' && block.visibility !== userType) {
    return null;
  }

  // تحديد عدد المقالات المعروضة
  const displayArticles = articles.slice(0, block.maxItems || block.articlesCount || 6);

  // عرض البلوك HTML المخصص
  if (block.type === 'html' && block.customHtml) {
    return <HtmlBlock block={block} />;
  }

  // عرض البلوكات المخصصة
  if (block.type === 'custom') {
    // بلوك الهلال في بطولة العالم
    if (block.name === 'الهلال في بطولة العالم' || block.id === '1750599575769') {
      return (
        <AlHilalWorldCupBlock 
          articles={displayArticles.map(article => ({
            id: article.id,
            title: article.title,
            slug: article.slug,
            imageUrl: article.imageUrl || article.featured_image || article.image,
            category: article.category,
            publishedAt: article.publishedAt || article.published_at || article.created_at,
            views: article.views,
            isNew: true // يمكن تحديد هذا بناءً على تاريخ النشر
          }))}
          backgroundColor={block.theme.backgroundColor}
          primaryColor={block.theme.primaryColor}
          textColor={block.theme.textColor}
        />
      );
    }
  }

  // تحديد نوع البلوك المناسب بناءً على displayType
  const renderBlock = () => {
    switch (block.displayType) {
      case 'cards':
      case 'grid':
        return <CardGridBlock block={block} articles={displayArticles as any} />;
      
      case 'headline':
      case 'list':
        return <HeadlineListBlock block={block} articles={displayArticles as any} />;
      
      case 'image-left':
      case 'horizontal':
        return <ImageLeftBlock block={block} articles={displayArticles as any} />;
      
      case 'carousel':
      case 'gallery':
        return <CarouselBlock block={block} articles={displayArticles as any} />;
      
      case 'hero-slider':
        return <HeroSliderBlock block={block} articles={displayArticles as any} />;
      
      case 'magazine':
        return <MagazineLayoutBlock block={block} articles={displayArticles as any} />;
      
      default:
        return <CardGridBlock block={block} articles={displayArticles as any} />;
    }
  };

  return (
    <div
      className="smart-block-wrapper"
      style={{
        padding: block.padding || '0',
        margin: block.margin || '0',
        backgroundColor: block.bgColor || 'transparent'
      }}
    >
      {renderBlock()}
    </div>
  );
}; 