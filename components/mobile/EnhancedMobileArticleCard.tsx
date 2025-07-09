'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Clock, Eye, User, Heart, Bookmark, Share2 } from 'lucide-react';
import { formatDateOnly } from '@/lib/date-utils';
import { getValidImageUrl, generatePlaceholderImage } from '@/lib/cloudinary';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { getArticleLink } from '@/lib/utils';

interface Article {
  id: string;
  title: string;
  summary?: string;
  featured_image?: string;
  category_id: number;
  category_name?: string;
  author_name?: string;
  views_count: number;
  created_at: string;
  published_at?: string;
  reading_time?: number;
  is_breaking?: boolean;
  is_featured?: boolean;
  excerpt?: string;
  slug: string;
  category?: {
    name: string;
    slug: string;
    color?: string;
  };
  author?: {
    name: string;
    avatar?: string;
  };
}

interface EnhancedMobileArticleCardProps {
  article: Article;
  viewMode?: 'compact' | 'detailed' | 'featured';
  showActions?: boolean;
}

export default function EnhancedMobileArticleCard({
  article,
  viewMode = 'detailed',
  showActions = true
}: EnhancedMobileArticleCardProps) {
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const isMobile = useMediaQuery('(max-width: 768px)');

  useEffect(() => {
    const storedUserId = localStorage.getItem('user_id');
    if (storedUserId && storedUserId !== 'anonymous') {
      setUserId(storedUserId);
    }
  }, []);

  const handleLike = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!userId) {
      window.location.href = '/login?redirect=' + encodeURIComponent(window.location.pathname);
      return;
    }

    try {
      const response = await fetch('/api/interactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          articleId: article.id,
          type: 'like',
          action: isLiked ? 'remove' : 'add'
        })
      });

      if (response.ok) {
        setIsLiked(!isLiked);
      }
    } catch (error) {
      console.error('Error handling like:', error);
    }
  };

  const handleSave = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!userId) {
      window.location.href = '/login?redirect=' + encodeURIComponent(window.location.pathname);
      return;
    }

    try {
      const response = await fetch('/api/bookmarks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          itemId: article.id,
          itemType: 'article'
        })
      });

      if (response.ok) {
        const data = await response.json();
        setIsSaved(data.action === 'added');
      }
    } catch (error) {
      console.error('Error handling save:', error);
    }
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: article.title,
          text: article.excerpt || article.title,
          url: getArticleLink(article)
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      navigator.clipboard.writeText(`${window.location.origin}${getArticleLink(article)}`);
    }
  };

  const imageUrl = getValidImageUrl(article.featured_image, article.title, 'article');

  // الوضع المضغوط
  if (viewMode === 'compact') {
    return (
      <Link href={getArticleLink(article)}>
        <div className="enhanced-mobile-card compact">
          <div className="flex gap-3 p-3">
            {/* صورة مصغرة */}
            <div className="relative w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden">
              <Image
                src={imageUrl}
                alt={article.title}
                fill
                sizes="64px"
                className="card-image"
                onLoad={() => setImageLoaded(true)}
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = generatePlaceholderImage(article.title, 'article');
                }}
                loading="lazy"
              />
              {!imageLoaded && (
                <div className="absolute inset-0 bg-gray-200 dark:bg-gray-700 animate-pulse" />
              )}
            </div>

            {/* المحتوى */}
            <div className="flex-1 min-w-0">
              <h3 className="card-title line-clamp-2 mb-1">
                {article.title}
              </h3>
              
              <div className="card-meta">
                <div className="meta-item">
                  <Clock className="w-3 h-3" />
                  <span>{formatDateOnly(article.created_at)}</span>
                </div>
                {article.views_count > 0 && (
                  <div className="meta-item">
                    <Eye className="w-3 h-3" />
                    <span>{article.views_count}</span>
                  </div>
                )}
              </div>
            </div>

            {/* شارات */}
            <div className="flex flex-col gap-1">
              {article.is_breaking && (
                <div className="breaking-badge">عاجل</div>
              )}
              {article.is_featured && (
                <div className="featured-badge">مميز</div>
              )}
            </div>
          </div>
        </div>
      </Link>
    );
  }

  // الوضع المفصل
  return (
    <div className="enhanced-mobile-card detailed">
      {/* صورة المقال */}
      <div className="card-image-container">
        <Image
          src={imageUrl}
          alt={article.title}
          fill
          className="card-image"
          sizes="(max-width: 768px) 100vw, 400px"
          onLoad={() => setImageLoaded(true)}
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = generatePlaceholderImage(article.title, 'article');
          }}
          loading="lazy"
        />
        {!imageLoaded && (
          <div className="absolute inset-0 bg-gray-200 dark:bg-gray-700 animate-pulse" />
        )}
        
        {/* شارات */}
        <div className="absolute top-2 right-2 flex flex-col gap-1">
          {article.is_breaking && (
            <div className="breaking-badge">عاجل</div>
          )}
          {article.is_featured && (
            <div className="featured-badge">مميز</div>
          )}
        </div>
      </div>
      
      {/* محتوى البطاقة */}
      <div className="card-content">
        <h3 className="card-title line-clamp-2">
          {article.title}
        </h3>
        
        {article.excerpt && (
          <p className="card-excerpt line-clamp-3">
            {article.excerpt}
          </p>
        )}
        
        {/* معلومات المقال */}
        <div className="card-meta">
          <div className="meta-item">
            <Clock className="w-4 h-4" />
            <span>{formatDateOnly(article.created_at)}</span>
          </div>
          {article.views_count > 0 && (
            <div className="meta-item">
              <Eye className="w-4 h-4" />
              <span>{article.views_count}</span>
            </div>
          )}
          {article.author_name && (
            <div className="meta-item">
              <User className="w-4 h-4" />
              <span>{article.author_name}</span>
            </div>
          )}
        </div>
        
        {/* أزرار التفاعل */}
        {showActions && (
          <div className="card-actions">
            <button 
              onClick={handleLike}
              className={`action-button like-button ${isLiked ? 'liked' : ''}`}
              aria-label="إعجاب"
            >
              <Heart className={`w-5 h-5 ${isLiked ? 'fill-current text-red-500' : ''}`} />
            </button>
            
            <button 
              onClick={handleSave}
              className={`action-button save-button ${isSaved ? 'saved' : ''}`}
              aria-label="حفظ"
            >
              <Bookmark className={`w-5 h-5 ${isSaved ? 'fill-current text-blue-500' : ''}`} />
            </button>
            
            <button 
              onClick={handleShare}
              className="action-button share-button"
              aria-label="مشاركة"
            >
              <Share2 className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// مكون قائمة المقالات المحسنة
export function EnhancedMobileArticleList({ 
  articles, 
  viewMode = 'detailed' 
}: { 
  articles: Article[];
  viewMode?: 'compact' | 'detailed' | 'featured';
}) {
  return (
    <div className="mobile-grid">
      {articles.map((article) => (
        <Link key={article.id} href={getArticleLink(article)}>
          <EnhancedMobileArticleCard 
            article={article} 
            viewMode={viewMode}
          />
        </Link>
      ))}
    </div>
  );
}

// مكون شبكة المقالات المحسنة
export function EnhancedMobileArticleGrid({ articles }: { articles: Article[] }) {
  return (
    <div className="mobile-container">
      <div className="mobile-grid">
        {articles.map((article) => (
          <Link key={article.id} href={getArticleLink(article)}>
            <EnhancedMobileArticleCard 
              article={article} 
              viewMode="detailed"
            />
          </Link>
        ))}
      </div>
    </div>
  );
} 