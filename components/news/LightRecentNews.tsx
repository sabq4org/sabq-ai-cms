'use client';

import React, { useState, useEffect, memo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import Image from 'next/image';
import { Clock, Eye } from 'lucide-react';
import { getArticleLink } from '@/lib/utils';

interface LightArticle {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  featured_image?: string;
  published_at: string;
  views: number;
  featured?: boolean;
  breaking?: boolean;
  categories?: {
    id: string;
    name: string;
    color?: string;
  } | null;
}

interface LightRecentNewsProps {
  limit?: number;
  title?: string;
  icon?: 'target' | 'fire';
  priority?: 'speed' | 'mobile' | 'balanced';
}

const IconEmoji: React.FC<{ icon?: 'target' | 'fire' }> = ({ icon = 'target' }) => {
  return <span className="text-lg sm:text-xl">{icon === 'fire' ? '🔥' : '🎯'}</span>;
};

// صورة مصغرة على اليمين
const OptimizedThumb = memo(({ src, alt }: { src?: string; alt: string }) => {
  if (!src) {
    return (
      <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400">📰</div>
    );
  }
  return (
    <Image src={src} alt={alt} fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover" loading="lazy" quality={70} />
  );
});

// بطاقة خبر وفق المواصفات
const LightNewsCard = memo(({ article }: { article: LightArticle }) => {
  const publishedDate = new Date(article.published_at);
  const isNew = Date.now() - publishedDate.getTime() < 24 * 60 * 60 * 1000;
  const gregDate = new Intl.DateTimeFormat('en-GB', { year: 'numeric', month: '2-digit', day: '2-digit' }).format(publishedDate);
  const readingTime = Math.max(1, Math.ceil(((article.excerpt?.length || 500) / 800) * 5)); // تقدير بسيط

  // شارة الحالة الملونة
  const StatusBadge = () => {
    if (isNew) return <span className="text-xs px-2 py-0.5 rounded-full bg-green-500 text-white">🆕 جديد</span>;
    if (article.featured) return <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-500 text-white">⭐ مميز</span>;
    return null;
  };

  return (
    <Card className="bg-white rounded-xl shadow-sm hover:shadow transition-shadow">
      <CardContent className="p-3 sm:p-4">
        <div className="flex items-start gap-3">
          {/* الصورة يمين */}
          <div className="relative w-24 h-20 sm:w-28 sm:h-24 shrink-0 rounded-md overflow-hidden">
            <OptimizedThumb src={article.featured_image} alt={article.title} />
          </div>

          {/* المحتوى */}
          <div className="flex-1 min-w-0">
            {/* الوسم/الحالة في الأعلى */}
            <div className="mb-1">
              <StatusBadge />
            </div>

            {/* العنوان مع إمكانية 🔥 عند breaking */}
            <Link href={getArticleLink(article)} className="block">
              <h3 className="font-bold text-sm sm:text-base text-black dark:text-white leading-tight line-clamp-2">
                {article.breaking ? '🔥 ' : ''}{article.title}
              </h3>
            </Link>

            {/* التفاصيل: التاريخ، المشاهدات، مدة القراءة */}
            <div className="mt-1 flex items-center gap-3 text-[11px] sm:text-xs text-gray-600">
              <span>{gregDate}</span>
              <span className="flex items-center gap-1">
                <Eye className="h-3 w-3" />
                {article.views > 1000 ? `${Math.round(article.views/1000)}ك` : article.views}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {readingTime} دقائق
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

const LightRecentNews: React.FC<LightRecentNewsProps> = ({
  limit = 8,
  title = 'آخر الأخبار',
  icon = 'target',
  priority = 'mobile'
}) => {
  const [articles, setArticles] = useState<LightArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const optimizedLimit = priority === 'speed' ? Math.min(limit, 6) : limit;

  useEffect(() => {
    let isMounted = true;

    const fetchArticles = async () => {
      try {
        setLoading(true);
        setError(null);

        const params = new URLSearchParams({
          limit: optimizedLimit.toString(),
          light: 'true'
        });

        const res = await fetch(`/api/articles/recent?${params.toString()}`);
        if (!res.ok) throw new Error('فشل في جلب الأخبار');
        const json = await res.json();
        if (!isMounted) return;

        const lightArticles: LightArticle[] = (json.data || []).map((a: any) => ({
          id: a.id,
          title: a.title,
          slug: a.slug,
          featured_image: a.featured_image,
          published_at: a.published_at,
          views: a.views ?? 0,
          featured: a.featured ?? false,
          breaking: a.breaking ?? false,
          categories: a.categories ? { id: a.categories.id, name: a.categories.name, color: a.categories.color } : null,
        }));

        setArticles(lightArticles);
      } catch (e: any) {
        if (!isMounted) return;
        setError(e?.message || 'حدث خطأ غير متوقع');
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchArticles();
    return () => { isMounted = false; };
  }, [optimizedLimit, priority]);

  // حالة التحميل
  if (loading) {
    const skeletonCount = priority === 'speed' ? 4 : 6;
    return (
      <div className="space-y-4">
        <Skeleton className="h-6 w-40" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          {Array.from({ length: skeletonCount }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl shadow-sm p-3 sm:p-4">
              <div className="flex items-start gap-3">
                <Skeleton className="w-24 h-20 sm:w-28 sm:h-24 rounded-md" />
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-4 w-12" />
                  </div>
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
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
        <p className="text-gray-500">{error}</p>
      </div>
    );
  }

  if (articles.length === 0) {
    return (
      <div className="text-center py-8 text-sm text-gray-500">
        <div className="text-2xl mb-2">📰</div>
        <p>لا توجد أخبار حالياً</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* العنوان الرئيسي مع الأيقونة */}
      <div className="flex items-center gap-2">
        <IconEmoji icon={icon} />
        <h2 className="text-lg sm:text-xl font-bold text-black dark:text-white">{title}</h2>
        <div className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded-full">{articles.length}</div>
      </div>

      {/* الشبكة: 1 عمود في الموبايل، 2 أعمدة في التابلت والكمبيوتر */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        {articles.map((article) => (
          <LightNewsCard key={article.id} article={article} />
        ))}
      </div>
    </div>
  );
};

export default memo(LightRecentNews);
