"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, Eye, Heart, MessageCircle, Share2, Clock, Sparkles, Brain, Zap } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface ArticleInsight {
  id: string;
  title: string;
  slug: string;
  category: string;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  shareCount: number;
  growthRate: number;
  trendingScore: number;
  insightTag: string;
  insightColor: string;
  icon: string;
  publishedAt: string;
}

export default function AIInsightsBlock() {
  const [insights, setInsights] = useState<ArticleInsight[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  const fetchInsights = async () => {
    try {
      const response = await fetch('/api/ai-insights', {
        cache: 'no-store'
      });
      
      if (!response.ok) throw new Error('Failed to fetch insights');
      
      const data = await response.json();
      if (data.success && data.data) {
        setInsights(data.data);
        setLastUpdate(new Date());
        setError(null);
      }
    } catch (err) {
      console.error('Error fetching insights:', err);
      setError('فشل في تحميل المؤشرات الذكية');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInsights();
    
    // تحديث كل 3 دقائق
    const interval = setInterval(fetchInsights, 3 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}م`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}ك`;
    return num.toString();
  };

  const getTimeAgo = (date: string): string => {
    const minutes = Math.floor((Date.now() - new Date(date).getTime()) / 60000);
    if (minutes < 60) return `منذ ${minutes} دقيقة`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `منذ ${hours} ساعة`;
    return `منذ ${Math.floor(hours / 24)} يوم`;
  };

  if (loading) {
    return (
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <Skeleton className="h-10 w-64" />
            <Skeleton className="h-6 w-32" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="p-8 bg-red-50 dark:bg-red-900/20 rounded-xl">
            <p className="text-red-600 dark:text-red-400">
              {error}
            </p>
          </div>
        </div>
      </section>
    );
  }

  // عرض رسالة عندما لا توجد مؤشرات
  if (insights.length === 0) {
    return (
      <section className="py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center mb-8">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                  <span>مؤشرات ذكية</span>
                  <Sparkles className="w-5 h-5 text-yellow-500" />
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  ماذا يقرأ الناس الآن؟ تحليل مباشر بالذكاء الاصطناعي
                </p>
              </div>
            </div>
          </div>
          <div className="text-center p-12 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
            <p className="text-gray-500 dark:text-gray-400">
              جاري تحليل البيانات... يرجى المحاولة لاحقاً
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <span>مؤشرات ذكية</span>
                <Sparkles className="w-5 h-5 text-yellow-500" />
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                ماذا يقرأ الناس الآن؟ تحليل مباشر بالذكاء الاصطناعي
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Clock className="w-3 h-3" />
            <span>آخر تحديث {getTimeAgo(lastUpdate.toISOString())}</span>
          </div>
        </div>

        {/* Insights Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <AnimatePresence mode="popLayout">
            {insights.map((insight, index) => (
              <motion.div
                key={insight.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: index * 0.05 }}
              >
                <Link href={`/article/${insight.slug}`}>
                  <Card className="group relative overflow-hidden h-full p-4 hover:shadow-xl transition-all duration-300 border-gray-200 dark:border-gray-700">
                    {/* خلفية متحركة */}
                    <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-blue-50/20 dark:to-blue-900/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                    
                    <div className="relative z-10">
                      {/* Header */}
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-2xl">{insight.icon}</span>
                            <Badge className={cn("text-xs font-medium", insight.insightColor)}>
                              {insight.insightTag}
                            </Badge>
                            {insight.growthRate > 50 && (
                              <motion.div
                                animate={{ scale: [1, 1.2, 1] }}
                                transition={{ repeat: Infinity, duration: 2 }}
                              >
                                <Zap className="w-4 h-4 text-yellow-500" />
                              </motion.div>
                            )}
                          </div>
                          <h3 className="font-bold text-gray-900 dark:text-gray-100 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                            {insight.title}
                          </h3>
                        </div>
                      </div>

                      {/* Stats */}
                      <div className="flex items-center gap-4 text-xs text-gray-600 dark:text-gray-400">
                        <div className="flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          <span>{formatNumber(insight.viewCount)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Heart className="w-3 h-3" />
                          <span>{formatNumber(insight.likeCount)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MessageCircle className="w-3 h-3" />
                          <span>{formatNumber(insight.commentCount)}</span>
                        </div>
                        {insight.shareCount > 0 && (
                          <div className="flex items-center gap-1">
                            <Share2 className="w-3 h-3" />
                            <span>{formatNumber(insight.shareCount)}</span>
                          </div>
                        )}
                      </div>

                      {/* Growth Indicator */}
                      {insight.growthRate > 20 && (
                        <div className="mt-3 flex items-center gap-2">
                          <div className="flex-1 h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                            <motion.div
                              className="h-full bg-gradient-to-r from-green-500 to-emerald-500"
                              initial={{ width: 0 }}
                              animate={{ width: `${Math.min(100, insight.growthRate)}%` }}
                              transition={{ duration: 1, delay: index * 0.1 }}
                            />
                          </div>
                          <span className="text-xs font-medium text-green-600 dark:text-green-400 flex items-center gap-1">
                            <TrendingUp className="w-3 h-3" />
                            {insight.growthRate.toFixed(0)}%
                          </span>
                        </div>
                      )}

                      {/* Category & Time */}
                      <div className="mt-3 flex items-center justify-between text-xs">
                        <span className="text-gray-500 dark:text-gray-400">
                          {insight.category}
                        </span>
                        <span className="text-gray-400">
                          {getTimeAgo(insight.publishedAt)}
                        </span>
                      </div>
                    </div>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* AI Note */}
        <div className="mt-8 text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center justify-center gap-2">
            <Brain className="w-3 h-3" />
            يتم تحليل البيانات بواسطة الذكاء الاصطناعي وتحديثها كل 3 دقائق
          </p>
        </div>
      </div>
    </section>
  );
}
