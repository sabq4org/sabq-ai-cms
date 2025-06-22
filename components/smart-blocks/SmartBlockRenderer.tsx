'use client';

import React from 'react';
import { CardGridBlock } from './CardGridBlock';
import { HeadlineListBlock } from './HeadlineListBlock';
import { ImageLeftBlock } from './ImageLeftBlock';
import { CarouselBlock } from './CarouselBlock';
import { HtmlBlock } from './HtmlBlock';

interface SmartBlock {
  id: string;
  name: string;
  type: 'smart' | 'custom' | 'html';
  displayType: 'cards' | 'headline' | 'image-left' | 'carousel' | 'grid' | 'list' | 'horizontal' | 'gallery';
  theme: {
    primaryColor: string;
    backgroundColor: string;
    textColor: string;
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
  slug: string;
  excerpt?: string;
  imageUrl?: string;
  category?: string;
  author?: {
    name: string;
    avatar?: string;
  };
  publishedAt: string;
  views?: number;
  readTime?: number;
}

interface SmartBlockRendererProps {
  block: SmartBlock;
  articles: Article[];
  userType?: 'guest' | 'user';
}

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

  // تحديد نوع البلوك المناسب بناءً على displayType
  const renderBlock = () => {
    switch (block.displayType) {
      case 'cards':
      case 'grid':
        return <CardGridBlock block={block} articles={displayArticles} />;
      
      case 'headline':
      case 'list':
        return <HeadlineListBlock block={block} articles={displayArticles} />;
      
      case 'image-left':
      case 'horizontal':
        return <ImageLeftBlock block={block} articles={displayArticles} />;
      
      case 'carousel':
      case 'gallery':
        return <CarouselBlock block={block} articles={displayArticles} />;
      
      default:
        return <CardGridBlock block={block} articles={displayArticles} />;
    }
  };

  return (
    <div
      className="smart-block-container"
      style={{
        padding: block.padding || '1rem',
        margin: block.margin || '0',
        backgroundColor: block.bgColor || 'transparent'
      }}
    >
      {renderBlock()}
    </div>
  );
}; 