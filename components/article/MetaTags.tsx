'use client';

import { useEffect } from 'react';

interface MetaTagsProps {
  title: string;
  description?: string;
  keywords?: string[];
  image?: string;
  url?: string;
  author?: string;
  publishedTime?: string;
  type?: string;
}

export function MetaTags({
  title,
  description,
  keywords,
  image,
  url,
  author,
  publishedTime,
  type = 'article'
}: MetaTagsProps) {
  useEffect(() => {
    // تحديث عنوان الصفحة
    if (typeof document !== 'undefined') {
      document.title = `${title} | صحيفة سبق الإلكترونية`;
    }

    // إضافة أو تحديث meta tags
    const updateMetaTag = (property: string, content: string, isProperty = false) => {
      let meta = document.querySelector(
        isProperty ? `meta[property="${property}"]` : `meta[name="${property}"]`
      ) as HTMLMetaElement;
      
      if (!meta) {
        meta = document.createElement('meta');
        if (isProperty) {
          meta.setAttribute('property', property);
        } else {
          meta.setAttribute('name', property);
        }
        document.head.appendChild(meta);
      }
      
      meta.content = content;
    };

    // تحديث الوصف
    if (description) {
      updateMetaTag('description', description);
      updateMetaTag('og:description', description, true);
      updateMetaTag('twitter:description', description);
    }

    // تحديث الكلمات المفتاحية
    if (keywords && keywords.length > 0) {
      updateMetaTag('keywords', keywords.join(', '));
    }

    // تحديث Open Graph tags
    updateMetaTag('og:title', title, true);
    updateMetaTag('og:type', type, true);
    updateMetaTag('og:site_name', 'صحيفة سبق الإلكترونية', true);
    updateMetaTag('og:locale', 'ar_SA', true);
    
    if (image) {
      updateMetaTag('og:image', image, true);
      updateMetaTag('twitter:image', image);
    }
    
    if (url) {
      updateMetaTag('og:url', url, true);
    }
    
    if (author) {
      updateMetaTag('article:author', author, true);
      updateMetaTag('author', author);
    }
    
    if (publishedTime) {
      updateMetaTag('article:published_time', publishedTime, true);
    }

    // Twitter Card tags
    updateMetaTag('twitter:card', 'summary_large_image');
    updateMetaTag('twitter:title', title);
    updateMetaTag('twitter:site', '@sabqorg');

    // تنظيف عند إلغاء التحميل
    return () => {
      // إعادة العنوان الافتراضي
      if (typeof document !== 'undefined') {
        document.title = 'صحيفة سبق الإلكترونية';
      }
    };
  }, [title, description, keywords, image, url, author, publishedTime, type]);

  return null;
} 