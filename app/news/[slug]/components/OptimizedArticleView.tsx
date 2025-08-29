"use client";

import { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import { Calendar, Clock, Eye, User } from 'lucide-react';
import { OptimizedArticle } from '../OptimizedArticleLoader';

interface OptimizedArticleViewProps {
  article: OptimizedArticle;
}

// مكوّن مساعد لتحويل روابط Cloudinary لتقليل الحجم تلقائياً
function transformCloudinary(url: string, width: number): string {
  try {
    if (!url || typeof url !== 'string') return url;
    if (!url.includes('res.cloudinary.com') || !url.includes('/upload/')) return url;
    // لا نكرر التحويل إذا كان موجوداً
    if (/\/upload\/(c_|w_|f_|q_|g_)/.test(url)) return url;
    const parts = url.split('/upload/');
    if (parts.length !== 2) return url;
    const tx = `f_auto,q_auto,w_${width}`;
    return `${parts[0]}/upload/${tx}/${parts[1]}`;
  } catch {
    return url;
  }
}

// مكون تحسين الصور
function OptimizedImage({ 
  src, 
  alt, 
  width = 800, 
  height = 600, 
  priority = false,
  className = ""
}: {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  priority?: boolean;
  className?: string;
}) {
  const [imageError, setImageError] = useState(false);
  const optimizedSrc = useMemo(() => transformCloudinary(src, width), [src, width]);
  
  if (imageError) {
    return (
      <div className={`bg-gray-200 dark:bg-gray-700 flex items-center justify-center ${className}`}>
        <span className="text-gray-500">فشل تحميل الصورة</span>
      </div>
    );
  }

  return (
    <Image
      src={optimizedSrc}
      alt={alt}
      width={width}
      height={height}
      priority={priority}
      className={className}
      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 70vw"
      quality={80}
      onError={() => setImageError(true)}
      placeholder="blur"
      blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
    />
  );
}

// مكون معلومات المقال
function ArticleMetadata({ article }: { article: OptimizedArticle }) {
  const publishedDate = useMemo(() => {
    if (!article.published_at) return '';
    return new Date(article.published_at).toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }, [article.published_at]);

  const readingTime = useMemo(() => {
    if (article.reading_time) {
      return `${article.reading_time} دقيقة`;
    }
    // حساب تقريبي بناءً على طول المحتوى
    const wordCount = article.content ? article.content.split(' ').length : 0;
    const estimatedTime = Math.max(1, Math.ceil(wordCount / 200));
    return `${estimatedTime} دقيقة`;
  }, [article.content, article.reading_time]);

  return (
    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-6">
      {/* تاريخ النشر */}
      <div className="flex items-center gap-1">
        <Calendar size={16} />
        <span>{publishedDate}</span>
      </div>

      {/* وقت القراءة */}
      <div className="flex items-center gap-1">
        <Clock size={16} />
        <span>{readingTime}</span>
      </div>

      {/* عدد المشاهدات */}
      {article.views && article.views > 0 && (
        <div className="flex items-center gap-1">
          <Eye size={16} />
          <span>{article.views.toLocaleString('ar-SA')} مشاهدة</span>
        </div>
      )}

      {/* المؤلف */}
      {(article.author?.name || article.article_author?.full_name) && (
        <div className="flex items-center gap-1">
          <User size={16} />
          <span>{article.author?.name || article.article_author?.full_name}</span>
        </div>
      )}
    </div>
  );
}

// مكون محتوى المقال المحسن
function ArticleContent({ content }: { content: string | null }) {
  // إزالة شرط mounted لعرض المحتوى مباشرة
  const processedContent = useMemo(() => {
    if (!content) return '';
    
    // تحسين الصور في المحتوى
    let processed = content.replace(
      /<img([^>]*?)src="([^"]*?)"([^>]*?)>/g,
      (match, before, src, after) => {
        // إضافة loading="lazy" و decoding و fetchpriority
        if (!/loading=/.test(after)) after += ' loading="lazy"';
        if (!/decoding=/.test(after)) after += ' decoding="async"';
        if (!/fetchpriority=/.test(after)) after += ' fetchpriority="low"';
        // إضافة classes للتصميم المتجاوب إن لم توجد
        if (!/class=/.test(after)) {
          after += ' class="w-full h-auto rounded-lg shadow-md my-4"';
        }
        return `<img${before}src="${src}"${after}>`;
      }
    );

    // تحسين الروابط
    processed = processed.replace(
      /<a([^>]*?)href="([^"]*?)"([^>]*?)>/g,
      (match, before, href, after) => {
        // إضافة target للأروابط الخارجية
        if (href.startsWith('http') && !/target=/.test(after)) {
          after += ' target="_blank" rel="noopener noreferrer"';
        }
        if (!/class=/.test(after)) {
          after += ' class="text-blue-600 dark:text-blue-400 hover:underline"';
        }
        return `<a${before}href="${href}"${after}>`;
      }
    );

    return processed;
  }, [content]);

  if (!processedContent) {
    return (
      <div className="prose prose-lg max-w-none dark:prose-invert">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-4/6"></div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="prose prose-lg max-w-none dark:prose-invert prose-headings:text-gray-900 dark:prose-headings:text-gray-100 prose-p:text-gray-700 dark:prose-p:text-gray-300 prose-a:text-blue-600 dark:prose-a:text-blue-400"
      dangerouslySetInnerHTML={{ __html: processedContent }}
    />
  );
}

// مكون أزرار المشاركة المحسن
function ShareButtons({ article }: { article: OptimizedArticle }) {
  const [copied, setCopied] = useState(false);
  
  const shareUrl = useMemo(() => {
    if (typeof window !== 'undefined') {
      return window.location.href;
    }
    return '';
  }, []);

  const shareText = useMemo(() => {
    return `${article.title} - سبق الإلكترونية`;
  }, [article.title]);

  const handleShare = async (platform: string) => {
    const encodedUrl = encodeURIComponent(shareUrl);
    const encodedText = encodeURIComponent(shareText);
    
    let shareLink = '';
    
    switch (platform) {
      case 'twitter':
        shareLink = `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`;
        break;
      case 'facebook':
        shareLink = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
        break;
      case 'whatsapp':
        shareLink = `https://wa.me/?text=${encodedText}%20${encodedUrl}`;
        break;
      case 'telegram':
        shareLink = `https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`;
        break;
      case 'copy':
        try {
          await navigator.clipboard.writeText(shareUrl);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        } catch (error) {
          console.error('Failed to copy:', error);
        }
        return;
    }
    
    if (shareLink) {
      window.open(shareLink, '_blank', 'width=600,height=400');
    }
  };

  return (
    <div className="flex items-center gap-3 py-4 border-t border-gray-200 dark:border-gray-700">
      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
        شارك المقال:
      </span>
      
      <div className="flex gap-2">
        <button
          onClick={() => handleShare('twitter')}
          className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors"
          aria-label="مشاركة على تويتر"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
          </svg>
        </button>

        <button
          onClick={() => handleShare('facebook')}
          className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors"
          aria-label="مشاركة على فيسبوك"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
          </svg>
        </button>

        <button
          onClick={() => handleShare('whatsapp')}
          className="p-2 bg-green-500 text-white rounded-full hover:bg-green-600 transition-colors"
          aria-label="مشاركة على واتساب"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
          </svg>
        </button>

        <button
          onClick={() => handleShare('copy')}
          className={`p-2 ${copied ? 'bg-green-500' : 'bg-gray-500'} text-white rounded-full hover:bg-gray-600 transition-colors`}
          aria-label="نسخ الرابط"
        >
          {copied ? (
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
            </svg>
          ) : (
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/>
            </svg>
          )}
        </button>
      </div>
    </div>
  );
}

export default function OptimizedArticleView({ article }: OptimizedArticleViewProps) {
  return (
    <article className="max-w-4xl mx-auto px-4 py-8">
      {/* الفئة */}
      {article.categories && (
        <div className="mb-4">
          <span 
            className="inline-block px-3 py-1 text-sm font-medium rounded-full"
            style={{
              backgroundColor: article.categories.color || '#3B82F6',
              color: 'white'
            }}
          >
            {article.categories.name}
          </span>
        </div>
      )}

      {/* العنوان */}
      <header className="mb-6">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100 leading-tight mb-4">
          {article.title}
        </h1>
        
        {/* العنوان الفرعي */}
        {article.subtitle && (
          <h2 className="text-xl text-gray-600 dark:text-gray-400 mb-4">
            {article.subtitle}
          </h2>
        )}

        {/* الملخص */}
        {article.summary && (
          <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed mb-6 bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border-l-4 border-blue-500">
            {article.summary}
          </p>
        )}

        {/* معلومات المقال */}
        <ArticleMetadata article={article} />
      </header>

      {/* الصورة البارزة */}
      {article.featured_image && (
        <div className="mb-8">
          <OptimizedImage
            src={article.featured_image}
            alt={article.title}
            width={1200}
            height={675}
            priority={true}
            className="w-full h-auto rounded-lg shadow-lg"
          />
        </div>
      )}

      {/* محتوى المقال */}
      <div className="mb-8">
        <ArticleContent content={article.content} />
      </div>

      {/* أزرار المشاركة */}
      <ShareButtons article={article} />
    </article>
  );
}

