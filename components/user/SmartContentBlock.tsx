'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import { getArticleLink } from '@/lib/utils';
import Image from 'next/image';
import { Clock, Eye, TrendingUp, Sparkles } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ar } from 'date-fns/locale';

interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  featured_image?: string;
  published_at: string;
  views: number;
  featured: boolean;
  breaking: boolean;
  category?: {
    id: string;
    name: string;
    slug: string;
    color?: string;
  } | null;
  views_count: number;
  isPersonalized: boolean;
  confidence: number;
  readTime: number;
}

interface SmartContentResponse {
  success: boolean;
  articles: Article[];
  total: number;
  metadata: {
    algorithm: string;
    personalized: boolean;
    cached: boolean;
    timestamp: string;
  };
}

interface SmartContentBlockProps {
  category?: string;
  limit?: number;
  title?: string;
  showPersonalization?: boolean;
}

const SmartContentBlock: React.FC<SmartContentBlockProps> = ({
  category,
  limit = 12,
  title = "أحدث الأخبار",
  showPersonalization = true
}) => {
  const [data, setData] = useState<SmartContentResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSmartContent = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const params = new URLSearchParams();
        params.set('limit', limit.toString());
        if (category) params.set('category', category);
        
        // نستخدم النسخة الخفيفة لتقليل حجم الحمولة وتحسين السرعة
        params.set('light', 'true');
        const response = await fetch(`/api/articles/recent?${params.toString()}`);
        
        if (!response.ok) {
          throw new Error('فشل في جلب المحتوى الذكي');
        }
        
        const result = await response.json();
        
        // تحويل من structure الـ recent API إلى smart content format
        const smartResult: SmartContentResponse = {
          success: result.success,
          articles: (result.data || []).map((article: any) => ({
            ...article,
            category: article.categories ? {
              id: article.categories.id,
              name: article.categories.name,
              slug: article.categories.slug,
              color: article.categories.color
            } : null,
            views_count: article.views || 0,
            isPersonalized: false,
            confidence: 0.9,
            readTime: Math.ceil((article.excerpt?.length || 100) / 200),
          })),
          total: result.total,
          metadata: {
            algorithm: 'recent-news',
            personalized: false,
            cached: false,
            timestamp: new Date().toISOString()
          }
        };
        
        setData(smartResult);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'حدث خطأ غير متوقع');
      } finally {
        setLoading(false);
      }
    };

    fetchSmartContent();
  }, [category, limit]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Skeleton className="h-6 w-6 rounded" />
          <Skeleton className="h-7 w-48" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 12 }).map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <Skeleton className="h-48 w-full" />
              <CardContent className="p-4 space-y-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error || !data?.success) {
    return (
      <div className="text-center py-8">
        <div className="text-red-500 text-lg mb-2">⚠️ خطأ في تحميل المحتوى</div>
        <p className="text-muted-foreground">{error || 'فشل في جلب المحتوى الذكي'}</p>
        <Button 
          variant="outline" 
          onClick={() => window.location.reload()}
          className="mt-4"
        >
          إعادة المحاولة
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">{title}</h2>
            {showPersonalization && data.metadata.personalized && (
              <p className="text-sm text-muted-foreground">
                مخصص لاهتماماتك • {data.metadata.algorithm}
              </p>
            )}
          </div>
        </div>
        
        {data.metadata.cached && (
          <Badge variant="secondary" className="flex items-center gap-1">
            <TrendingUp className="h-3 w-3" />
            محفوظ مؤقتاً
          </Badge>
        )}
      </div>

      {/* Articles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {data.articles.map((article) => (
          <Card key={article.id} className="group overflow-hidden transition-all duration-300 border" style={{ borderColor: '#f0f0ef' }}>
            <div className="relative">
              {/* Image */}
              <div className="relative h-48 overflow-hidden">
                {article.featured_image ? (
                  <Image
                    src={article.featured_image}
                    alt={article.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                    <div className="text-4xl text-gray-400">📰</div>
                  </div>
                )}
                
                {/* Category Badge على الصورة */}
                {article.category && (
                  <div className="absolute top-3 right-3">
                    <Badge 
                      className="text-white font-medium"
                      style={{ backgroundColor: article.category.color || '#3B82F6' }}
                    >
                      {article.category.name}
                    </Badge>
                  </div>
                )}
              </div>

              {/* Breaking/Featured Badges */}
              <div className="absolute top-3 left-3 flex gap-2">
                {article.breaking && (
                  <Badge className="bg-red-500 text-white">
                    عاجل
                  </Badge>
                )}
                {article.featured && (
                  <Badge className="bg-yellow-500 text-black">
                    مميز
                  </Badge>
                )}
              </div>

              {/* Personalization Score */}
              {article.isPersonalized && showPersonalization && (
                <div className="absolute bottom-3 left-3">
                  <div className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                    <Sparkles className="h-3 w-3" />
                    {Math.round(article.confidence * 100)}%
                  </div>
                </div>
              )}
            </div>

            <CardContent className="p-4">
              {/* Title */}
              <Link href={getArticleLink(article)} className="group-hover:text-blue-600 transition-colors">
                <h3 className="font-semibold text-lg leading-tight mb-2 line-clamp-2">
                  {article.title}
                </h3>
              </Link>

              {/* Excerpt */}
              {article.excerpt && (
                <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                  {article.excerpt}
                </p>
              )}

              {/* Metadata */}
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {formatDistanceToNow(new Date(article.published_at), { 
                      addSuffix: true, 
                      locale: ar 
                    })}
                  </div>
                  <div className="flex items-center gap-1">
                    <Eye className="h-3 w-3" />
                    {article.views_count.toLocaleString('ar')}
                  </div>
                </div>
                <div className="text-xs">
                  {article.readTime} دقائق
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Footer Info */}
      {data.articles.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <div className="text-4xl mb-4">📚</div>
          <p>لا توجد مقالات متاحة حالياً</p>
        </div>
      )}
    </div>
  );
};

export default SmartContentBlock;
