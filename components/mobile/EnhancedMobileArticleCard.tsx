'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Clock, Eye, User, Heart, Bookmark, Share2 } from 'lucide-react';
import { formatDateShort } from '@/lib/date-utils';
import { getValidImageUrl, generatePlaceholderImage } from '@/lib/cloudinary';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { getArticleLink } from '@/lib/utils';
import ArticleViews from '@/components/ui/ArticleViews';

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
                  <span>{formatDateShort(article.created_at)}</span>
                </div>
                {article.views_count > 0 && (
                  <ArticleViews count={article.views_count} className="text-xs" />
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

  // الوضع المفصل - عندما يكون مميز
  if (viewMode === 'featured' && article.is_featured) {
    return (
      <div className="relative w-full overflow-hidden rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] mb-4">
        <Link href={getArticleLink(article)} className="block relative">
          <div className="relative w-full h-64 md:h-72 lg:h-80 overflow-hidden">
            <Image
              src={imageUrl}
              alt={article.title}
              fill
              className="object-cover transition-transform duration-500 hover:scale-105"
              sizes="(max-width: 768px) 100vw, 400px"
              onLoad={() => setImageLoaded(true)}
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = generatePlaceholderImage(article.title, 'article');
              }}
              loading="lazy"
            />
            
            {!imageLoaded && (
              <div className="absolute inset-0 bg-gray-200 dark:bg-gray-700 animate-pulse flex items-center justify-center">
                <div className="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-600 animate-bounce" />
              </div>
            )}

            {/* التدرج المحسن - ظلال من الأسفل تنتهي تدريجياً إلى ثلث الصورة */}
            <div className="absolute inset-0" 
                 style={{
                   background: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.7) 25%, rgba(0,0,0,0.4) 50%, rgba(0,0,0,0.1) 70%, transparent 100%)'
                 }} />

            {/* شارة "مميز" في الزاوية العلوية اليمنى */}
            {article.is_featured && (
              <div className="absolute top-4 right-4 z-20">
                <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-black text-xs font-bold px-3 py-1.5 rounded-full shadow-xl flex items-center gap-1 backdrop-blur-sm">
                  <span className="text-xs">✨</span>
                  مميز
                </div>
              </div>
            )}

            {/* شارة عاجل إذا كانت موجودة */}
            {article.is_breaking && (
              <div className="absolute top-4 left-4 z-20">
                <div className="bg-gradient-to-r from-red-500 to-red-600 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-xl flex items-center gap-1 backdrop-blur-sm animate-pulse">
                  <span className="w-2 h-2 bg-white rounded-full animate-ping" />
                  عاجل
                </div>
              </div>
            )}

            {/* المحتوى النصي المحسن فوق الظلال - للموبايل فقط */}
            <div className="md:hidden absolute bottom-0 left-0 right-0 p-5 text-white z-10">
              {/* التصنيف مع تصميم محسن */}
              {article.category && (
                <div className="mb-3">
                  <span 
                    className="inline-block bg-white/25 backdrop-blur-md text-white text-sm px-3 py-1.5 rounded-lg font-semibold border border-white/40 shadow-lg"
                    style={{ 
                      backgroundColor: `${article.category.color || '#3b82f6'}40`,
                      borderColor: `${article.category.color || '#3b82f6'}60`,
                      boxShadow: `0 4px 12px ${article.category.color || '#3b82f6'}20`
                    }}
                  >
                    {article.category.name}
                  </span>
                </div>
              )}

              {/* العنوان المحسن */}
              <h2 className="text-xl md:text-2xl font-bold text-white line-clamp-2 leading-tight mb-4 drop-shadow-2xl"
                  style={{
                    textShadow: '0 2px 8px rgba(0,0,0,0.8), 0 0 16px rgba(0,0,0,0.6)'
                  }}>
                {article.title}
              </h2>

              {/* معلومات المراسل والتاريخ مع تصميم جميل */}
              <div className="flex items-center justify-between text-white/95 text-sm backdrop-blur-sm bg-black/20 rounded-lg p-3 border border-white/20">
                <div className="flex items-center gap-4">
                  {/* المراسل */}
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center">
                      <User className="w-3 h-3 text-white" />
                    </div>
                    <span className="font-medium">{article.author?.name || article.author_name || 'كاتب مجهول'}</span>
                  </div>
                  
                  {/* التاريخ */}
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center">
                      <Clock className="w-3 h-3 text-white" />
                    </div>
                    <span>{formatDateShort(article.published_at || article.created_at)}</span>
                  </div>
                </div>

                {/* إحصائيات جميلة */}
                <div className="flex items-center gap-3">
                  {article.views_count > 0 && (
                    <div className="bg-white/20 rounded-full px-2 py-1">
                      <ArticleViews count={article.views_count} className="text-xs font-medium" />
                    </div>
                  )}
                  {article.reading_time && (
                    <div className="flex items-center gap-1 bg-white/20 rounded-full px-2 py-1">
                      <span className="text-xs">⏱️</span>
                      <span className="text-xs font-medium">{article.reading_time} دقيقة</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </Link>
      </div>
    );
  }

  // الوضع المفصل العادي
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
            <span>{formatDateShort(article.created_at)}</span>
          </div>
          {article.views_count > 0 && (
            <div className="meta-item">
              <ArticleViews count={article.views_count} />
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