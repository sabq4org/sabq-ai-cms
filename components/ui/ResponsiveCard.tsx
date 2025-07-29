'use client';

import React from 'react';
import { Calendar, User, Eye, MessageCircle, Share2, Bookmark, Clock } from 'lucide-react';
import CloudImage from './CloudImage';

// أنواع البطاقات
export type CardVariant = 'default' | 'featured' | 'compact' | 'grid' | 'list';
export type CardSize = 'sm' | 'md' | 'lg' | 'xl';

// خصائص المقال/الخبر
interface Article {
  id: string;
  title: string;
  summary?: string;
  content?: string;
  image?: string;
  author: {
    name: string;
    avatar?: string;
  };
  publishedAt: string;
  readingTime?: number;
  views?: number;
  comments?: number;
  category?: string;
  tags?: string[];
  featured?: boolean;
}

// خصائص المكون
interface ResponsiveCardProps {
  article: Article;
  variant?: CardVariant;
  size?: CardSize;
  showImage?: boolean;
  showAuthor?: boolean;
  showStats?: boolean;
  showActions?: boolean;
  className?: string;
  onClick?: () => void;
}

export default function ResponsiveCard({
  article,
  variant = 'default',
  size = 'md',
  showImage = true,
  showAuthor = true,
  showStats = true,
  showActions = true,
  className = '',
  onClick
}: ResponsiveCardProps) {
  // تنسيق التاريخ
  const formatDate = (date: string) => {
    const now = new Date();
    const articleDate = new Date(date);
    const diffInHours = Math.floor((now.getTime() - articleDate.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'منذ دقائق';
    if (diffInHours < 24) return `منذ ${diffInHours} ساعة`;
    if (diffInHours < 48) return 'منذ يوم';
    
    return articleDate.toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // تنسيق الأرقام
  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}م`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}ك`;
    return num.toString();
  };

  // فئات CSS حسب النوع والحجم
  const getCardClasses = () => {
    const baseClasses = 'card fade-in cursor-pointer';
    
    const variantClasses = {
      default: 'card-default',
      featured: 'card-featured border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-white',
      compact: 'card-compact',
      grid: 'card-grid',
      list: 'card-list flex flex-row'
    };

    const sizeClasses = {
      sm: 'card-sm',
      md: 'card-md',
      lg: 'card-lg',
      xl: 'card-xl'
    };

    return `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`;
  };

  // مكون الصورة
  const ImageComponent = () => {
    if (!showImage || !article.image) return null;

    const imageClasses = variant === 'list' 
      ? 'w-24 h-24 sm:w-32 sm:h-32 md:w-40 md:h-32 lg:w-48 lg:h-36 object-cover rounded-lg flex-shrink-0'
      : 'w-full h-48 sm:h-56 md:h-64 lg:h-72 object-cover';

    return (
      <div className={`relative ${variant === 'list' ? '' : 'card-image-container mb-4'}`}>
        <CloudImage
          src={article.image}
          alt={article.title}
          fill={variant !== 'list'}
          width={variant === 'list' ? 200 : undefined}
          height={variant === 'list' ? 150 : undefined}
          className={imageClasses}
          fallbackType="article"
        />
        {article.featured && (
          <div className="absolute top-2 right-2 bg-blue-600 text-white px-2 py-1 rounded-full text-xs font-semibold z-10">
            مميز
          </div>
        )}
        {article.category && (
          <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white px-2 py-1 rounded text-xs z-10">
            {article.category}
          </div>
        )}
      </div>
    );
  };

  // مكون المحتوى
  const ContentComponent = () => (
    <div className={`card-content ${variant === 'list' ? 'flex-1 mr-4' : ''}`}>
      {/* العنوان */}
      <h3 className={`font-bold text-gray-900 mb-2 line-clamp-2 hover:text-blue-600 transition-colors ${
        size === 'sm' ? 'text-sm' : 
        size === 'md' ? 'text-base sm:text-lg' : 
        size === 'lg' ? 'text-lg sm:text-xl' : 
        'text-xl sm:text-2xl'
      }`}>
        {article.title}
      </h3>

      {/* الملخص */}
      {article.summary && variant !== 'compact' && (
        <p className={`text-gray-600 mb-3 line-clamp-2 ${
          size === 'sm' ? 'text-xs' : 'text-sm'
        }`}>
          {article.summary}
        </p>
      )}

      {/* معلومات المؤلف */}
      {showAuthor && (
        <div className="flex items-center gap-2 mb-3">
          {article.author.avatar ? (
            <img
              src={article.author.avatar}
              alt={article.author.name}
              className="w-6 h-6 rounded-full object-cover"
            />
          ) : (
            <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center">
              <User size={12} />
            </div>
          )}
          <span className="text-sm text-gray-600">{article.author.name}</span>
        </div>
      )}

      {/* التاريخ ووقت القراءة */}
      <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
        <div className="flex items-center gap-1">
          <Calendar size={12} />
          <span>{formatDate(article.publishedAt)}</span>
        </div>
        {article.readingTime && (
          <div className="flex items-center gap-1">
            <Clock size={12} />
            <span>{article.readingTime} دقيقة</span>
          </div>
        )}
      </div>

      {/* العلامات */}
      {article.tags && article.tags.length > 0 && variant !== 'compact' && (
        <div className="flex flex-wrap gap-1 mb-3">
          {article.tags.slice(0, 3).map((tag, index) => (
            <span
              key={index}
              className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs"
            >
              {tag}
            </span>
          ))}
          {article.tags.length > 3 && (
            <span className="text-gray-500 text-xs">+{article.tags.length - 3}</span>
          )}
        </div>
      )}
    </div>
  );

  // مكون الإحصائيات
  const StatsComponent = () => {
    if (!showStats) return null;

    return (
      <div className="card-stats flex items-center justify-between pt-3 border-t border-gray-100">
        <div className="flex items-center gap-4 text-sm text-gray-500">
          {article.views && (
            <div className="flex items-center gap-1">
              <Eye size={14} />
              <span>{formatNumber(article.views)}</span>
            </div>
          )}
          {article.comments && (
            <div className="flex items-center gap-1">
              <MessageCircle size={14} />
              <span>{formatNumber(article.comments)}</span>
            </div>
          )}
        </div>

        {showActions && (
          <div className="flex items-center gap-2">
            <button className="p-1 rounded-full hover:bg-gray-100 transition-colors">
              <Bookmark size={14} className="text-gray-500" />
            </button>
            <button className="p-1 rounded-full hover:bg-gray-100 transition-colors">
              <Share2 size={14} className="text-gray-500" />
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <article
      className={getCardClasses()}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          onClick?.();
        }
      }}
    >
      {variant === 'list' ? (
        <>
          <ImageComponent />
          <div className="flex-1">
            <ContentComponent />
            <StatsComponent />
          </div>
        </>
      ) : (
        <>
          <ImageComponent />
          <ContentComponent />
          <StatsComponent />
        </>
      )}
    </article>
  );
}

// مكون شبكة البطاقات المتجاوبة
interface ResponsiveGridProps {
  articles: Article[];
  variant?: CardVariant;
  columns?: {
    mobile?: number;
    tablet?: number;
    desktop?: number;
  };
  className?: string;
  onCardClick?: (article: Article) => void;
}

export function ResponsiveGrid({
  articles,
  variant = 'default',
  columns = { mobile: 1, tablet: 2, desktop: 3 },
  className = '',
  onCardClick
}: ResponsiveGridProps) {
  const getGridClasses = () => {
    const { mobile = 1, tablet = 2, desktop = 3 } = columns;
    return `grid gap-6 ${
      mobile === 1 ? 'grid-cols-1' : 
      mobile === 2 ? 'grid-cols-2' : 'grid-cols-3'
    } ${
      tablet === 1 ? 'md:grid-cols-1' : 
      tablet === 2 ? 'md:grid-cols-2' : 
      tablet === 3 ? 'md:grid-cols-3' : 'md:grid-cols-4'
    } ${
      desktop === 1 ? 'lg:grid-cols-1' : 
      desktop === 2 ? 'lg:grid-cols-2' : 
      desktop === 3 ? 'lg:grid-cols-3' : 
      desktop === 4 ? 'lg:grid-cols-4' : 'lg:grid-cols-5'
    }`;
  };

  return (
    <div className={`${getGridClasses()} ${className}`}>
      {articles.map((article) => (
        <ResponsiveCard
          key={article.id}
          article={article}
          variant={variant}
          onClick={() => onCardClick?.(article)}
        />
      ))}
    </div>
  );
}
