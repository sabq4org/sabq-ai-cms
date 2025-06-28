'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, Bookmark, Share2, Eye, Calendar, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

interface Article {
  id: string;
  title: string;
  excerpt: string;
  slug: string;
  publishedAt: string;
  readTime?: number;
  views?: number;
  category?: {
    name: string;
    slug: string;
  };
  author?: {
    name: string;
  };
  image?: string;
  importanceScore?: number;
  relevanceScore?: number;
  engagementScore?: number;
}

type TimeIntent = 'morning' | 'afternoon' | 'evening';

interface DigestConfig {
  intent: TimeIntent;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  gradient: string;
}

const digestConfigs: Record<TimeIntent, DigestConfig> = {
  morning: {
    intent: 'morning',
    title: 'ابدأ صباحك بالمفيد والهادئ',
    subtitle: 'كل شيء بوضوح قبل أن تبدأ يومك',
    icon: <span className="text-2xl">☀️</span>,
    gradient: 'from-amber-50 to-orange-50'
  },
  afternoon: {
    intent: 'afternoon',
    title: 'متابعات الظهيرة… اللحظة الآن بين يديك',
    subtitle: 'استراحة معرفية وسط يومك المتسارع',
    icon: <span className="text-2xl">🔄</span>,
    gradient: 'from-blue-50 to-cyan-50'
  },
  evening: {
    intent: 'evening',
    title: 'ختام يومك… باختصار تستحقه',
    subtitle: 'ملخص ذكي قبل أن تنهي يومك',
    icon: <span className="text-2xl">🌙</span>,
    gradient: 'from-indigo-50 to-purple-50'
  }
};

export default function SmartDigestBlock() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIntent, setCurrentIntent] = useState<TimeIntent>('morning');
  const [savedArticles, setSavedArticles] = useState<Set<string>>(new Set());

  // تحديد النية حسب الوقت
  const getTimeIntent = (): TimeIntent => {
    const hour = new Date().getHours();
    if (hour >= 6 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 18) return 'afternoon';
    return 'evening';
  };

  // جلب المقالات الذكية
  const fetchSmartDigest = async () => {
    try {
      setLoading(true);
      const intent = getTimeIntent();
      setCurrentIntent(intent);

      const response = await fetch(`/api/smart-digest?intent=${intent}`);
      if (!response.ok) throw new Error('Failed to fetch digest');
      
      const data = await response.json();
      setArticles(data.articles || []);
    } catch (error) {
      console.error('Error fetching smart digest:', error);
      // جلب مقالات عادية كبديل
      try {
        const fallbackResponse = await fetch('/api/articles?limit=3&orderBy=publishedAt');
        const fallbackData = await fallbackResponse.json();
        setArticles(fallbackData.articles || []);
      } catch (fallbackError) {
        console.error('Error fetching fallback articles:', fallbackError);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSmartDigest();
    
    // تحديث كل ساعة
    const interval = setInterval(fetchSmartDigest, 60 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  const handleSave = (articleId: string) => {
    setSavedArticles(prev => {
      const newSet = new Set(prev);
      if (newSet.has(articleId)) {
        newSet.delete(articleId);
      } else {
        newSet.add(articleId);
      }
      return newSet;
    });
  };

  const config = digestConfigs[currentIntent];

  if (loading) {
    return (
      <div className="w-full py-12">
        <div className="container mx-auto px-4">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-64 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <section className="w-full py-12 relative overflow-hidden">
      {/* خلفية متدرجة خفيفة */}
      <div className={`absolute inset-0 bg-gradient-to-br ${config.gradient} opacity-50`} />
      
      <div className="container mx-auto px-4 relative z-10">
        {/* العنوان */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            {config.icon}
            <h2 className="text-3xl font-bold text-gray-900">{config.title}</h2>
          </div>
          <p className="text-lg text-gray-600">{config.subtitle}</p>
        </motion.div>

        {/* البطاقات */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <AnimatePresence mode="wait">
            {articles.map((article, index) => (
              <motion.div
                key={article.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="h-full hover:shadow-lg transition-shadow duration-300 overflow-hidden group">
                  {/* صورة المقال */}
                  {article.image && (
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={article.image}
                        alt={article.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      {article.category && (
                        <Badge className="absolute top-3 right-3 bg-white/90 text-gray-900">
                          {article.category.name}
                        </Badge>
                      )}
                    </div>
                  )}
                  
                  <CardHeader className="pb-3">
                    <CardTitle className="text-xl line-clamp-2 group-hover:text-blue-600 transition-colors">
                      <Link href={`/article/${article.slug || article.id}`}>
                        {article.title}
                      </Link>
                    </CardTitle>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <CardDescription className="line-clamp-3">
                      {article.excerpt}
                    </CardDescription>
                    
                    {/* معلومات إضافية */}
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      {article.readTime && (
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          <span>{article.readTime} دقائق</span>
                        </div>
                      )}
                      {article.views && (
                        <div className="flex items-center gap-1">
                          <Eye className="w-4 h-4" />
                          <span>{article.views}</span>
                        </div>
                      )}
                      {article.publishedAt && (
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          <span>{format(new Date(article.publishedAt), 'dd MMM', { locale: ar })}</span>
                        </div>
                      )}
                    </div>
                    
                    {/* أزرار التفاعل */}
                    <div className="flex items-center gap-2 pt-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleSave(article.id)}
                        className={savedArticles.has(article.id) ? 'text-blue-600' : ''}
                      >
                        <Bookmark className={`w-4 h-4 ${savedArticles.has(article.id) ? 'fill-current' : ''}`} />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Share2 className="w-4 h-4" />
                      </Button>
                      <Link href={`/article/${article.slug || article.id}`} className="mr-auto">
                        <Button variant="link" size="sm" className="text-blue-600">
                          اقرأ المزيد
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* زر عرض المزيد */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center mt-8"
        >
          <Link href="/news">
            <Button variant="outline" size="lg" className="gap-2">
              <TrendingUp className="w-4 h-4" />
              استكشف المزيد من المحتوى
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
} 