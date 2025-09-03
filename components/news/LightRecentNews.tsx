'use client';

import React, { useState, useEffect, memo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import Image from 'next/image';
import { Clock, Eye } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ar } from 'date-fns/locale';

interface LightArticle {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  featured_image?: string;
  published_at: string;
  views: number;
  categories?: {
    id: string;
    name: string;
    color?: string;
  } | null;
}

interface LightRecentNewsProps {
  limit?: number;
  title?: string;
  showExcerpt?: boolean;
  priority?: 'speed' | 'mobile' | 'balanced';
}

// مكون الصورة المحسّن للهواتف
const OptimizedImage = memo(({ src, alt, className }: { src?: string; alt: string; className?: string }) => {
  if (!src) {
    return (
      <div className={`bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center ${className}`}>
        <span className="text-2xl text-gray-400">📰</span>
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
      className="object-cover transition-transform duration-300 group-hover:scale-105"
      loading="lazy"
      quality={75}
    />
  );
});

// مكون البطاقة المبسّط
const LightNewsCard = memo(({ article, showExcerpt }: { article: LightArticle; showExcerpt: boolean }) => (
  <Card className="group overflow-hidden border border-gray-100 hover:border-gray-200 transition-colors">
    <div className="relative h-40 sm:h-44 md:h-48 overflow-hidden">
      <OptimizedImage 
        src={article.featured_image} 
        alt={article.title}
      />
      
      {/* شارة التصنيف على الصورة */}
      {article.categories && (
        <div className="absolute top-2 right-2">
          <Badge 
            className="text-white text-xs px-2 py-1 font-medium shadow-sm"
            style={{ backgroundColor: article.categories.color || '#3B82F6' }}
          >
            {article.categories.name}
          </Badge>
        </div>
      )}
    </div>

    <CardContent className="p-3 sm:p-4">
      {/* العنوان */}
      <Link href={`/news/${article.slug}`} className="block group-hover:text-blue-600 transition-colors">
        <h3 className="font-semibold text-sm sm:text-base leading-tight mb-2 line-clamp-2">
          {article.title}
        </h3>
      </Link>

      {/* المقتطف - يُخفى على الشاشات الصغيرة إذا لم يكن مطلوباً */}
      {showExcerpt && article.excerpt && (
        <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2 mb-2 hidden sm:block">
          {article.excerpt}
        </p>
      )}

      {/* معلومات التوقيت والمشاهدات */}
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          <span className="truncate">
            {formatDistanceToNow(new Date(article.published_at), { 
              addSuffix: true, 
              locale: ar 
            })}
          </span>
        </div>
        <div className="flex items-center gap-1 text-xs">
          <Eye className="h-3 w-3" />
          <span>{article.views > 1000 ? `${Math.round(article.views/1000)}ك` : article.views}</span>
        </div>
      </div>
    </CardContent>
  </Card>
));

const LightRecentNews: React.FC<LightRecentNewsProps> = ({
  limit = 8,
  title = "أحدث الأخبار",
  showExcerpt = false,
  priority = 'mobile'
}) => {
  const [articles, setArticles] = useState<LightArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // تحسين حجم البيانات حسب الأولوية
  const optimizedLimit = priority === 'speed' ? Math.min(limit, 6) : limit;

  useEffect(() => {
    let isMounted = true;

    const fetchArticles = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const params = new URLSearchParams({
          limit: optimizedLimit.toString(),
          light: 'true' // إشارة للـ API لإرجاع بيانات مبسطة
        });
        
        const response = await fetch(`/api/articles/recent?${params}`, {
          headers: {
            'Cache-Control': 'public, max-age=300', // 5 دقائق كاش
          }
        });
        
        if (!response.ok) {
          throw new Error('فشل في جلب الأخبار');
        }
        
        const result = await response.json();
        
        if (!isMounted) return;
        
        // تبسيط البيانات للأداء
        const lightArticles: LightArticle[] = (result.data || []).map((article: any) => ({
          id: article.id,
          title: article.title,
          slug: article.slug,
          excerpt: priority === 'speed' ? undefined : article.excerpt,
          featured_image: article.featured_image,
          published_at: article.published_at,
          views: article.views || 0,
          categories: article.categories ? {
            id: article.categories.id,
            name: article.categories.name,
            color: article.categories.color
          } : null
        }));
        
        setArticles(lightArticles);
      } catch (err) {
        if (!isMounted) return;
        setError(err instanceof Error ? err.message : 'حدث خطأ غير متوقع');
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchArticles();

    return () => {
      isMounted = false;
    };
  }, [optimizedLimit, priority]);

  // Loading State المحسّن للهواتف
  if (loading) {
    const skeletonCount = priority === 'speed' ? 4 : 6;
    return (
      <div className="space-y-4">
        <Skeleton className="h-6 w-32" />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {Array.from({ length: skeletonCount }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-32 sm:h-40 md:h-44 w-full rounded" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-3 w-3/4" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-6 text-sm">
        <div className="text-red-500 mb-2">⚠️ خطأ في التحميل</div>
        <p className="text-muted-foreground">{error}</p>
      </div>
    );
  }

  if (articles.length === 0) {
    return (
      <div className="text-center py-8 text-sm text-muted-foreground">
        <div className="text-2xl mb-2">📰</div>
        <p>لا توجد أخبار حالياً</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* العنوان المبسط */}
      <div className="flex items-center gap-2">
        <div className="w-1 h-6 bg-blue-500 rounded-full"></div>
        <h2 className="text-lg sm:text-xl font-bold">{title}</h2>
        <div className="text-xs text-muted-foreground bg-gray-100 px-2 py-1 rounded-full">
          {articles.length}
        </div>
      </div>

      {/* شبكة الأخبار المحسّنة للهواتف */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
        {articles.map((article) => (
          <LightNewsCard
            key={article.id}
            article={article}
            showExcerpt={showExcerpt && priority !== 'speed'}
          />
        ))}
      </div>

      {/* رابط المزيد - مخفي على النسخة السريعة */}
      {priority !== 'speed' && (
        <div className="text-center pt-2">
          <Link 
            href="/news" 
            className="text-sm text-blue-600 hover:text-blue-700 transition-colors"
          >
            عرض المزيد من الأخبار ←
          </Link>
        </div>
      )}
    </div>
  );
};

export default memo(LightRecentNews);
