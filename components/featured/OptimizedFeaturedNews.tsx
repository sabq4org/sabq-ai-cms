"use client";

import { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Clock, Eye } from 'lucide-react';

interface NewsItem {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  featured_image?: string;
  published_at: string;
  reading_time?: number;
  views?: number;
  categories?: {
    name: string;
    color?: string;
  };
  author?: {
    name: string;
  };
}

interface OptimizedFeaturedNewsProps {
  heading: string;
  limit: number;
  layout: 'mobile' | 'desktop';
}

// Hook لتحميل البيانات مع cache
function useFeaturedNews(limit: number) {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function fetchNews() {
      try {
        // محاولة الحصول على البيانات من الـ cache أولاً
        const cacheKey = `featured-news-${limit}`;
        const cached = sessionStorage.getItem(cacheKey);
        
        if (cached) {
          const { data, timestamp } = JSON.parse(cached);
          // إذا كانت البيانات أقل من 5 دقائق، استخدمها
          if (Date.now() - timestamp < 5 * 60 * 1000) {
            if (isMounted) {
              setNews(data);
              setLoading(false);
            }
            return;
          }
        }

        // تحميل البيانات من الـ API
        const response = await fetch(`/api/articles/featured?limit=${limit}`, {
          cache: 'no-store', // عدم تخزين لضمان الحصول على أحدث المحتوى
          next: { revalidate: 0 } // تحديث فوري
        });
        
        if (!response.ok) {
          throw new Error('فشل في تحميل الأخبار');
        }
        
        const data = await response.json();
        
        if (isMounted) {
          setNews(data);
          setLoading(false);
          
          // حفظ في الـ cache
          sessionStorage.setItem(cacheKey, JSON.stringify({
            data,
            timestamp: Date.now()
          }));
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'حدث خطأ غير متوقع');
          setLoading(false);
        }
      }
    }

    fetchNews();

    return () => {
      isMounted = false;
    };
  }, [limit]);

  return { news, loading, error };
}

// مكون بطاقة الخبر المحسن
function NewsCard({ 
  item, 
  priority = false, 
  size = 'medium' 
}: { 
  item: NewsItem; 
  priority?: boolean;
  size?: 'small' | 'medium' | 'large';
}) {
  const [imageError, setImageError] = useState(false);
  
  const cardClasses = useMemo(() => {
    const baseClasses = "group bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden";
    
    switch (size) {
      case 'small':
        return `${baseClasses} h-64`;
      case 'large':
        return `${baseClasses} h-96`;
      default:
        return `${baseClasses} h-80`;
    }
  }, [size]);

  const imageHeight = useMemo(() => {
    switch (size) {
      case 'small': return 120;
      case 'large': return 240;
      default: return 180;
    }
  }, [size]);

  const publishedDate = useMemo(() => {
    return new Date(item.published_at).toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }, [item.published_at]);

  return (
    <Link 
      href={`/news/${item.slug}`}
      className={cardClasses}
      prefetch={priority}
    >
      {/* الصورة */}
      <div className="relative overflow-hidden" style={{ height: imageHeight }}>
        {item.featured_image && !imageError ? (
          <Image
            src={item.featured_image}
            alt={item.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes={size === 'large' ? "(max-width: 768px) 100vw, 50vw" : "(max-width: 768px) 100vw, 33vw"}
            priority={priority}
            quality={priority ? 90 : 75}
            onError={() => setImageError(true)}
            placeholder="blur"
            blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
          />
        ) : (
          <div className="w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
            <span className="text-gray-500 text-sm">لا توجد صورة</span>
          </div>
        )}
        
        {/* الفئة */}
        {item.categories && (
          <div className="absolute top-2 right-2">
            <span 
              className="px-2 py-1 text-xs font-medium rounded-full text-white"
              style={{ backgroundColor: item.categories.color || '#3B82F6' }}
            >
              {item.categories.name}
            </span>
          </div>
        )}
      </div>

      {/* المحتوى */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <h3 className={`font-bold text-gray-900 dark:text-gray-100 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors ${
            size === 'large' ? 'text-lg' : 'text-base'
          }`}>
            {item.title}
          </h3>
          
          {item.excerpt && size !== 'small' && (
            <p className="text-gray-600 dark:text-gray-400 text-sm mt-2 line-clamp-2">
              {item.excerpt}
            </p>
          )}
        </div>

        {/* معلومات إضافية */}
        <div className="flex items-center justify-between mt-3 text-xs text-gray-500 dark:text-gray-400">
          <div className="flex items-center gap-3">
            <span>{publishedDate}</span>
            
            {item.reading_time && (
              <div className="flex items-center gap-1">
                <Clock size={12} />
                <span>{item.reading_time} د</span>
              </div>
            )}
            
            {item.views && item.views > 0 && (
              <div className="flex items-center gap-1">
                <Eye size={12} />
                <span>{item.views.toLocaleString('ar-SA')}</span>
              </div>
            )}
          </div>
          
          {item.author && (
            <span className="text-blue-600 dark:text-blue-400">
              {item.author.name}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

// مكون التحميل
function LoadingSkeleton({ layout }: { layout: 'mobile' | 'desktop' }) {
  const skeletonCount = layout === 'mobile' ? 3 : 6;
  
  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-6"></div>
        <div className={`grid gap-6 ${
          layout === 'mobile' 
            ? 'grid-cols-1' 
            : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
        }`}>
          {[...Array(skeletonCount)].map((_, i) => (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
              <div className="h-48 bg-gray-200 dark:bg-gray-700"></div>
              <div className="p-4">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// مكون الخطأ
function ErrorMessage({ error, onRetry }: { error: string; onRetry: () => void }) {
  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded-lg p-6 text-center">
        <h3 className="text-lg font-semibold text-red-800 dark:text-red-200 mb-2">
          فشل في تحميل الأخبار
        </h3>
        <p className="text-red-600 dark:text-red-300 mb-4">{error}</p>
        <button
          onClick={onRetry}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          إعادة المحاولة
        </button>
      </div>
    </div>
  );
}

export default function OptimizedFeaturedNews({ 
  heading, 
  limit, 
  layout 
}: OptimizedFeaturedNewsProps) {
  const { news, loading, error } = useFeaturedNews(limit);
  const [retryKey, setRetryKey] = useState(0);

  const handleRetry = () => {
    setRetryKey(prev => prev + 1);
  };

  if (loading) {
    return <LoadingSkeleton layout={layout} />;
  }

  if (error) {
    return <ErrorMessage error={error} onRetry={handleRetry} />;
  }

  if (news.length === 0) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="text-center py-12">
          <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-400 mb-2">
            لا توجد أخبار متاحة حالياً
          </h3>
          <p className="text-gray-500 dark:text-gray-500">
            يرجى المحاولة مرة أخرى لاحقاً
          </p>
        </div>
      </div>
    );
  }

  return (
    <section className="max-w-6xl mx-auto px-4 py-8">
      <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-8">
        {heading}
      </h2>
      
      <div className={`grid gap-6 ${
        layout === 'mobile' 
          ? 'grid-cols-1' 
          : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
      }`}>
        {news.map((item, index) => (
          <NewsCard
            key={`${item.id}-${retryKey}`}
            item={item}
            priority={index < 3}
            size={
              layout === 'desktop' && index === 0 
                ? 'large' 
                : layout === 'mobile' 
                ? 'medium' 
                : 'medium'
            }
          />
        ))}
      </div>

      {/* رابط عرض المزيد */}
      <div className="text-center mt-8">
        <Link
          href="/news"
          className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          عرض جميع الأخبار
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
      </div>
    </section>
  );
}

