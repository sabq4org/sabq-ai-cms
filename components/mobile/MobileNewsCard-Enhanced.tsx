'use client';

import React, { memo, useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  Calendar, Eye, User, Clock, Zap, Star, Heart, 
  Bookmark, Share2, MessageSquare, TrendingUp, Award
} from 'lucide-react';
import { formatRelativeDate } from '@/lib/date-utils';
import { getArticleLink } from '@/lib/utils';
import { useDarkModeContext } from '@/contexts/DarkModeContext';
import { getValidImageUrl, generatePlaceholderImage } from '@/lib/cloudinary';

// تعريف واجهة محسنة للمقال
interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  summary?: string;
  ai_summary?: string;
  featured_image?: string;
  author?: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  } | null;
  category?: {
    id: string;
    name: string;
    slug: string;
    color?: string;
    icon?: string;
  } | null;
  views?: number;
  likes_count?: number;
  comments_count?: number;
  shares_count?: number;
  reading_time?: number;
  published_at?: string;
  created_at: string;
  updated_at?: string;
  featured?: boolean;
  breaking?: boolean;
  trending?: boolean;
  is_premium?: boolean;
  engagement_score?: number;
}

// واجهة محسنة للمكون
interface MobileNewsCardProps {
  article: Article;
  variant?: 'default' | 'compact' | 'featured' | 'minimal';
  showInteractions?: boolean;
  showCategory?: boolean;
  showAuthor?: boolean;
  showStats?: boolean;
  className?: string;
  onClick?: () => void;
}

// hook لحساب مؤشرات التفاعل
const useEngagementMetrics = (article: Article) => {
  return useMemo(() => {
    const views = article.views || 0;
    const likes = article.likes_count || 0;
    const comments = article.comments_count || 0;
    const shares = article.shares_count || 0;
    
    const totalEngagement = likes + comments + shares;
    const engagementRate = views > 0 ? (totalEngagement / views) * 100 : 0;
    
    return {
      totalEngagement,
      engagementRate: Math.round(engagementRate),
      isHighEngagement: engagementRate > 10,
      isTrending: views > 1000 && engagementRate > 15
    };
  }, [article]);
};

// مكون الشارات المحسن
const ArticleBadges = memo(({ article, variant }: { article: Article; variant: string }) => {
  const badges = [];

  if (article.breaking) {
    badges.push({
      key: 'breaking',
      icon: Zap,
      label: 'عاجل',
      className: 'bg-red-500 text-white animate-pulse'
    });
  }

  if (article.featured) {
    badges.push({
      key: 'featured',
      icon: Star,
      label: 'مميز',
      className: 'bg-yellow-500 text-white'
    });
  }

  if (article.trending) {
    badges.push({
      key: 'trending',
      icon: TrendingUp,
      label: 'رائج',
      className: 'bg-green-500 text-white'
    });
  }

  if (article.is_premium) {
    badges.push({
      key: 'premium',
      icon: Award,
      label: 'مميز+',
      className: 'bg-purple-500 text-white'
    });
  }

  if (badges.length === 0) return null;

  return (
    <div className={`flex flex-wrap gap-1 ${variant === 'compact' ? 'mb-1' : 'mb-2'}`}>
      {badges.map(({ key, icon: Icon, label, className }) => (
        <span
          key={key}
          className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-bold rounded-full ${className} shadow-sm`}
        >
          <Icon className="w-3 h-3" />
          {variant !== 'minimal' && label}
        </span>
      ))}
    </div>
  );
});

ArticleBadges.displayName = 'ArticleBadges';

// مكون التصنيف المحسن
const CategoryTag = memo(({ category }: { category: Article['category'] }) => {
  if (!category) return null;

  const categoryColor = category.color || '#3B82F6';
  
  return (
    <span 
      className="inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full mb-2 transition-all duration-200 hover:scale-105"
      style={{
        backgroundColor: `${categoryColor}15`,
        color: categoryColor,
        borderColor: `${categoryColor}30`
      }}
    >
      {category.icon && <span className="text-xs">{category.icon}</span>}
      {category.name}
    </span>
  );
});

CategoryTag.displayName = 'CategoryTag';

// مكون الصورة المحسن
const ArticleImage = memo(({ 
  src, 
  alt, 
  variant,
  className = '' 
}: { 
  src?: string; 
  alt: string; 
  variant: string;
  className?: string;
}) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const imageUrl = useMemo(() => {
    if (!src || imageError) {
      return generatePlaceholderImage(alt, 'article');
    }
    return getValidImageUrl(src, alt, 'article');
  }, [src, alt, imageError]);

  const sizeClasses = {
    compact: 'w-16 h-16',
    minimal: 'w-12 h-12',
    default: 'w-20 h-20',
    featured: 'w-24 h-24'
  };

  return (
    <div className={`relative ${sizeClasses[variant as keyof typeof sizeClasses] || sizeClasses.default} rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-700 flex-shrink-0 ${className}`}>
      <Image
        src={imageUrl}
        alt={alt}
        fill
        className={`object-cover transition-all duration-300 ${
          imageLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
        }`}
        sizes="(max-width: 768px) 100px, 120px"
        onError={() => setImageError(true)}
        onLoad={() => setImageLoaded(true)}
        priority={variant === 'featured'}
      />
      
      {/* تأثير التحميل */}
      {!imageLoaded && (
        <div className="absolute inset-0 bg-gray-200 dark:bg-gray-600 animate-pulse" />
      )}
      
      {/* تدرج للصور المميزة */}
      {variant === 'featured' && (
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
      )}
    </div>
  );
});

ArticleImage.displayName = 'ArticleImage';

// مكون الإحصائيات المحسن
const ArticleStats = memo(({ 
  article, 
  showStats, 
  variant,
  metrics 
}: { 
  article: Article; 
  showStats: boolean;
  variant: string;
  metrics: ReturnType<typeof useEngagementMetrics>;
}) => {
  const { darkMode } = useDarkModeContext();
  
  if (!showStats) return null;

  const stats = [
    {
      icon: Eye,
      value: article.views || 0,
      label: 'مشاهدة',
      color: 'text-blue-500'
    },
    {
      icon: Heart,
      value: article.likes_count || 0,
      label: 'إعجاب',
      color: 'text-red-500'
    },
    {
      icon: MessageSquare,
      value: article.comments_count || 0,
      label: 'تعليق',
      color: 'text-green-500'
    },
    {
      icon: Clock,
      value: `${article.reading_time || 5} د`,
      label: 'قراءة',
      color: 'text-purple-500'
    }
  ];

  const visibleStats = variant === 'compact' ? stats.slice(0, 2) : stats;

  return (
    <div className="flex items-center gap-3 text-xs">
      {visibleStats.map(({ icon: Icon, value, label, color }, index) => (
        <div 
          key={index}
          className={`flex items-center gap-1 ${
            darkMode ? 'text-gray-400' : 'text-gray-500'
          } hover:${color} transition-colors duration-200`}
        >
          <Icon className="w-3 h-3" />
          <span className="font-medium">{value}</span>
          {variant === 'featured' && <span className="hidden sm:inline">{label}</span>}
        </div>
      ))}
      
      {/* مؤشر التفاعل العالي */}
      {metrics.isTrending && (
        <div className="flex items-center gap-1 text-orange-500">
          <TrendingUp className="w-3 h-3 animate-bounce" />
          <span className="text-xs font-bold">رائج</span>
        </div>
      )}
    </div>
  );
});

ArticleStats.displayName = 'ArticleStats';

// مكون معلومات الكاتب المحسن
const AuthorInfo = memo(({ 
  author, 
  publishedAt, 
  showAuthor,
  variant 
}: { 
  author: Article['author']; 
  publishedAt: string;
  showAuthor: boolean;
  variant: string;
}) => {
  const { darkMode } = useDarkModeContext();

  return (
    <div className={`flex items-center gap-2 text-xs ${
      darkMode ? 'text-gray-400' : 'text-gray-500'
    }`}>
      {/* الكاتب */}
      {showAuthor && author && (
        <div className="flex items-center gap-1">
          {author.avatar && variant === 'featured' ? (
            <div className="w-5 h-5 rounded-full overflow-hidden">
              <Image
                src={author.avatar}
                alt={author.name}
                width={20}
                height={20}
                className="object-cover"
              />
            </div>
          ) : (
            <User className="w-3 h-3" />
          )}
          <span className="truncate max-w-[80px] font-medium">{author.name}</span>
        </div>
      )}

      {/* التاريخ */}
      <div className="flex items-center gap-1">
        <Calendar className="w-3 h-3" />
        <span className="font-medium">{formatRelativeDate(publishedAt)}</span>
      </div>
    </div>
  );
});

AuthorInfo.displayName = 'AuthorInfo';

// المكون الرئيسي المحسن
const MobileNewsCard = memo(({
  article,
  variant = 'default',
  showInteractions = false,
  showCategory = true,
  showAuthor = true,
  showStats = true,
  className = '',
  onClick
}: MobileNewsCardProps) => {
  const { darkMode } = useDarkModeContext();
  const metrics = useEngagementMetrics(article);
  
  const {
    title,
    slug,
    excerpt,
    summary,
    ai_summary,
    featured_image,
    author,
    category,
    published_at,
    created_at
  } = article;

  const displayDate = published_at || created_at;
  const displayExcerpt = excerpt || summary || ai_summary || '';

  // تحديد تخطيط البطاقة حسب النوع
  const cardStyles = useMemo(() => {
    const base = `block w-full transition-all duration-300 overflow-hidden border group ${
      darkMode 
        ? 'bg-gray-800 border-gray-700 hover:border-gray-600 hover:bg-gray-750' 
        : 'bg-white border-gray-200 hover:border-gray-300 hover:bg-gray-50'
    } ${className}`;

    switch (variant) {
      case 'compact':
        return `${base} rounded-lg shadow-sm hover:shadow-md p-3 mb-2`;
      case 'minimal':
        return `${base} rounded-lg p-2 mb-1`;
      case 'featured':
        return `${base} rounded-2xl shadow-lg hover:shadow-xl p-4 mb-4 transform hover:scale-[1.02]`;
      default:
        return `${base} rounded-xl shadow-sm hover:shadow-md p-4 mb-3`;
    }
  }, [variant, darkMode, className]);

  // معالج النقر
  const handleClick = (e: React.MouseEvent) => {
    if (onClick) {
      e.preventDefault();
      onClick();
    }
  };

  return (
    <Link 
      href={getArticleLink(article)}
      className={cardStyles}
      onClick={handleClick}
    >
      {/* الشارات */}
      <ArticleBadges article={article} variant={variant} />

      {/* المحتوى الرئيسي */}
      <div className="flex gap-3">
        {/* الصورة */}
        {featured_image && (
          <ArticleImage 
            src={featured_image}
            alt={title}
            variant={variant}
          />
        )}

        {/* المحتوى النصي */}
        <div className="flex-1 min-w-0 space-y-2">
          {/* التصنيف */}
          {showCategory && <CategoryTag category={category} />}

          {/* العنوان */}
          <h3 className={`font-bold leading-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200 ${
            variant === 'featured' ? 'text-lg line-clamp-2' :
            variant === 'compact' ? 'text-sm line-clamp-2' :
            variant === 'minimal' ? 'text-sm line-clamp-1' :
            'text-base line-clamp-2'
          } ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            {title}
          </h3>

          {/* المقتطف */}
          {displayExcerpt && variant !== 'minimal' && (
            <p className={`leading-relaxed ${
              variant === 'compact' ? 'text-xs line-clamp-1' : 'text-sm line-clamp-2'
            } ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              {displayExcerpt}
            </p>
          )}

          {/* معلومات الكاتب والتاريخ */}
          <AuthorInfo 
            author={author}
            publishedAt={displayDate}
            showAuthor={showAuthor}
            variant={variant}
          />

          {/* الإحصائيات */}
          <ArticleStats 
            article={article}
            showStats={showStats}
            variant={variant}
            metrics={metrics}
          />

          {/* أزرار التفاعل */}
          {showInteractions && variant === 'featured' && (
            <div className="flex items-center gap-2 pt-2 border-t border-gray-200 dark:border-gray-700">
              <button className="flex items-center gap-1 px-3 py-1 rounded-full text-xs hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-600 dark:text-gray-400 hover:text-red-600 transition-all duration-200">
                <Heart className="w-3 h-3" />
                إعجاب
              </button>
              <button className="flex items-center gap-1 px-3 py-1 rounded-full text-xs hover:bg-blue-50 dark:hover:bg-blue-900/20 text-gray-600 dark:text-gray-400 hover:text-blue-600 transition-all duration-200">
                <Bookmark className="w-3 h-3" />
                حفظ
              </button>
              <button className="flex items-center gap-1 px-3 py-1 rounded-full text-xs hover:bg-green-50 dark:hover:bg-green-900/20 text-gray-600 dark:text-gray-400 hover:text-green-600 transition-all duration-200">
                <Share2 className="w-3 h-3" />
                مشاركة
              </button>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
});

MobileNewsCard.displayName = 'MobileNewsCard';

// مكونات متخصصة لأنواع مختلفة من البطاقات
export const CompactMobileNewsCard = memo((props: Omit<MobileNewsCardProps, 'variant'>) => (
  <MobileNewsCard {...props} variant="compact" />
));

export const FeaturedMobileNewsCard = memo((props: Omit<MobileNewsCardProps, 'variant'>) => (
  <MobileNewsCard {...props} variant="featured" showInteractions={true} />
));

export const MinimalMobileNewsCard = memo((props: Omit<MobileNewsCardProps, 'variant'>) => (
  <MobileNewsCard {...props} variant="minimal" showStats={false} showCategory={false} />
));

// تسمية المكونات للتطوير
CompactMobileNewsCard.displayName = 'CompactMobileNewsCard';
FeaturedMobileNewsCard.displayName = 'FeaturedMobileNewsCard';
MinimalMobileNewsCard.displayName = 'MinimalMobileNewsCard';

export default MobileNewsCard;
