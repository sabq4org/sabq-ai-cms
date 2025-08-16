'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, 
  TrendingUp, 
  Clock, 
  Eye, 
  BookOpen, 
  Star,
  ChevronRight,
  RefreshCw,
  Filter,
  X
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useGlobalStore, useRecommendations } from '@/stores/globalStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { OptimizedImage } from '@/components/OptimizedImage';
import Link from 'next/link';

// ===========================================
// Types
// ===========================================

interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  thumbnail?: string;
  category: {
    id: string;
    name: string;
    slug: string;
  };
  author: {
    id: string;
    name: string;
    avatar?: string;
  };
  publishedAt: string;
  readingTime: number;
  views: number;
  likes: number;
}

interface SmartRecommendation {
  id: string;
  type: 'trending' | 'personalized' | 'similar' | 'category' | 'author';
  title: string;
  reason: string;
  articles: Article[];
  confidence: number;
  priority: number;
}

// ===========================================
// API Functions
// ===========================================

const fetchSmartRecommendations = async (): Promise<SmartRecommendation[]> => {
  const response = await fetch('/api/smart-recommendations', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(typeof window !== 'undefined' && localStorage.getItem('auth-token') && {
        Authorization: `Bearer ${localStorage.getItem('auth-token')}`
      }),
    },
  });

  if (!response.ok) {
    throw new Error('فشل في جلب التوصيات الذكية');
  }

  const data = await response.json();
  return data.recommendations || [];
};

// ===========================================
// Components
// ===========================================

const RecommendationTypeIcon = ({ type }: { type: string }) => {
  const iconProps = { className: "w-4 h-4" };
  
  switch (type) {
    case 'trending':
      return <TrendingUp {...iconProps} />;
    case 'personalized':
      return <Sparkles {...iconProps} />;
    case 'similar':
      return <Eye {...iconProps} />;
    case 'category':
      return <BookOpen {...iconProps} />;
    case 'author':
      return <Star {...iconProps} />;
    default:
      return <Sparkles {...iconProps} />;
  }
};

const ArticleCard = ({ article }: { article: Article }) => {
  const { trackInteraction } = useGlobalStore();

  const handleClick = () => {
    trackInteraction('recommendation_click', {
      articleId: article.id,
      type: 'smart_recommendation'
    });
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="group cursor-pointer"
    >
      <Link 
        href={`/news/${article.slug}`}
        onClick={handleClick}
        className="block"
      >
        <Card className="h-full border-0 shadow-sm hover:shadow-lg transition-all duration-300 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
          <div className="relative overflow-hidden rounded-t-lg">
            {article.thumbnail && (
              <OptimizedImage
                src={article.thumbnail}
                alt={article.title}
                width={300}
                height={200}
                className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
              />
            )}
            <div className="absolute top-2 right-2">
              <Badge variant="secondary" className="bg-white/90 text-gray-800">
                {article.category.name}
              </Badge>
            </div>
          </div>
          
          <CardContent className="p-4">
            <h3 className="font-bold text-lg mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
              {article.title}
            </h3>
            
            <p className="text-gray-600 dark:text-gray-300 text-sm mb-3 line-clamp-2">
              {article.excerpt}
            </p>
            
            <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>{article.readingTime} دقيقة</span>
                </div>
                <div className="flex items-center gap-1">
                  <Eye className="w-3 h-3" />
                  <span>{article.views.toLocaleString()}</span>
                </div>
              </div>
              
              <div className="flex items-center gap-1">
                {article.author.avatar && (
                  <img
                    src={article.author.avatar}
                    alt={article.author.name}
                    className="w-4 h-4 rounded-full"
                  />
                )}
                <span>{article.author.name}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  );
};

const RecommendationSection = ({ recommendation }: { recommendation: SmartRecommendation }) => {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="mb-8"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
            <RecommendationTypeIcon type={recommendation.type} />
            <h2 className="text-xl font-bold">{recommendation.title}</h2>
          </div>
          <Badge 
            variant="outline" 
            className="text-xs"
          >
            {Math.round(recommendation.confidence * 100)}% دقة
          </Badge>
        </div>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-gray-500 hover:text-gray-700"
        >
          <motion.div
            animate={{ rotate: isExpanded ? 90 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronRight className="w-4 h-4" />
          </motion.div>
        </Button>
      </div>
      
      <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
        {recommendation.reason}
      </p>
      
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {recommendation.articles.map((article) => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const LoadingSkeleton = () => (
  <div className="space-y-8">
    {[1, 2, 3].map((i) => (
      <div key={i} className="space-y-4">
        <div className="flex items-center gap-3">
          <Skeleton className="w-6 h-6 rounded" />
          <Skeleton className="w-48 h-6" />
        </div>
        <Skeleton className="w-full h-4" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((j) => (
            <Card key={j} className="border-0 shadow-sm">
              <Skeleton className="w-full h-48 rounded-t-lg" />
              <CardContent className="p-4 space-y-2">
                <Skeleton className="w-full h-5" />
                <Skeleton className="w-3/4 h-5" />
                <Skeleton className="w-full h-4" />
                <Skeleton className="w-1/2 h-4" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    ))}
  </div>
);

// ===========================================
// Main Component
// ===========================================

export const SmartRecommendations: React.FC = () => {
  const { user, trackInteraction } = useGlobalStore();
  const [filterType, setFilterType] = useState<string | null>(null);

  // Fetch smart recommendations
  const {
    data: recommendations = [],
    isLoading,
    error,
    refetch,
    isRefetching
  } = useQuery({
    queryKey: ['smart-recommendations', user?.id],
    queryFn: fetchSmartRecommendations,
    enabled: true,
    refetchInterval: 5 * 60 * 1000, // Refresh every 5 minutes
    staleTime: 2 * 60 * 1000, // Consider data stale after 2 minutes
  });

  // Filter recommendations
  const filteredRecommendations = filterType
    ? recommendations.filter(rec => rec.type === filterType)
    : recommendations;

  // Sort by priority and confidence
  const sortedRecommendations = [...filteredRecommendations].sort((a, b) => {
    if (a.priority !== b.priority) {
      return b.priority - a.priority;
    }
    return b.confidence - a.confidence;
  });

  const handleRefresh = () => {
    trackInteraction('refresh_recommendations');
    refetch();
  };

  const availableTypes = [
    { key: 'trending', label: 'الأكثر تداولاً', icon: TrendingUp },
    { key: 'personalized', label: 'مخصص لك', icon: Sparkles },
    { key: 'similar', label: 'محتوى مشابه', icon: Eye },
    { key: 'category', label: 'من نفس الفئة', icon: BookOpen },
    { key: 'author', label: 'كُتاب تتابعهم', icon: Star },
  ];

  if (error) {
    return (
      <Card className="border-red-200 bg-red-50 dark:bg-red-950/20">
        <CardContent className="p-6 text-center">
          <p className="text-red-600 dark:text-red-400 mb-4">
            حدث خطأ في تحميل التوصيات الذكية
          </p>
          <Button 
            onClick={handleRefresh}
            variant="outline"
            className="border-red-300 text-red-600 hover:bg-red-100"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            المحاولة مرة أخرى
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-2xl font-bold text-gray-900 dark:text-white">
            <Sparkles className="w-6 h-6 text-blue-600" />
            التوصيات الذكية
          </div>
          {!isLoading && (
            <Badge variant="secondary">
              {recommendations.length} توصية
            </Badge>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          {/* Filter buttons */}
          <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
            <Button
              variant={filterType === null ? "default" : "ghost"}
              size="sm"
              onClick={() => setFilterType(null)}
              className="h-8 text-xs"
            >
              الكل
            </Button>
            {availableTypes.map(({ key, label, icon: Icon }) => (
              <Button
                key={key}
                variant={filterType === key ? "default" : "ghost"}
                size="sm"
                onClick={() => setFilterType(filterType === key ? null : key)}
                className="h-8 text-xs flex items-center gap-1"
              >
                <Icon className="w-3 h-3" />
                {label}
              </Button>
            ))}
          </div>
          
          {/* Refresh button */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefetching}
            className="h-8"
          >
            <RefreshCw className={`w-4 h-4 ${isRefetching ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* Filter indicator */}
      {filterType && (
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-blue-600" />
          <span className="text-sm text-gray-600 dark:text-gray-300">
            عرض: {availableTypes.find(t => t.key === filterType)?.label}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setFilterType(null)}
            className="h-6 w-6 p-0 text-gray-400 hover:text-gray-600"
          >
            <X className="w-3 h-3" />
          </Button>
        </div>
      )}

      {/* Content */}
      {isLoading ? (
        <LoadingSkeleton />
      ) : sortedRecommendations.length === 0 ? (
        <Card className="border-dashed border-2 border-gray-200 dark:border-gray-700">
          <CardContent className="p-8 text-center">
            <Sparkles className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-300 mb-2">
              لا توجد توصيات متاحة حالياً
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              تفاعل أكثر مع المحتوى ليتمكن نظامنا الذكي من تقديم توصيات مخصصة لك
            </p>
            <Button onClick={handleRefresh} variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" />
              تحديث التوصيات
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div>
          {sortedRecommendations.map((recommendation) => (
            <RecommendationSection
              key={recommendation.id}
              recommendation={recommendation}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default SmartRecommendations;
