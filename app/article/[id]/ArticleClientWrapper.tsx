'use client';

import React, { useState, useEffect } from 'react';
import { useDarkModeContext } from '@/contexts/DarkModeContext';
import dynamic from 'next/dynamic';
import { Loader2, AlertCircle, BookOpen } from 'lucide-react';

/**
 * 🗞️ مكون عميل لصفحة تفاصيل المقال - توجيه ذكي حسب نوع المحتوى
 * 
 * 📰 للأخبار: التصميم الإخباري الكلاسيكي
 * 🧠 لمقالات الرأي: التصميم الذكي مع ميزات AI
 * 📊 للتحليلات: التصميم الذكي مع ميزات متقدمة
 */

// Dynamic imports للمكونات المختلفة
const SmartArticleHero = dynamic(() => import('@/components/article/SmartArticleHero'), { ssr: false });
const SmartContentRenderer = dynamic(() => import('@/components/article/SmartContentRenderer'), { ssr: false });
const SmartSummary = dynamic(() => import('@/components/article/SmartSummary'), { ssr: false });
const SmartRecommendations = dynamic(() => import('@/components/article/SmartRecommendations'), { ssr: false });
const ArticleClientComponent = dynamic(() => import('./ArticleClientComponent'), { ssr: false });

interface ArticleData {
  id: string;
  title: string;
  content: string;
  excerpt?: string;
  featured_image?: string;
  published_at: string;
  reading_time?: number;
  views_count?: number;
  views?: number;
  likes_count?: number;
  likes?: number;
  comments_count?: number;
  category_name?: string;
  category?: { name: string; slug: string; color?: string };
  categories?: { name: string; slug: string; color?: string };
  author_name?: string;
  author?: { name: string; avatar?: string; slug?: string; id?: string };
  article_type?: string;
  
  // Smart data للمقالات الذكية
  ai_analysis?: {
    tone: 'analytical' | 'emotional' | 'satirical' | 'educational' | 'investigative';
    depth_score: number;
    recommendation: 'highly_recommended' | 'recommended' | 'neutral' | 'not_recommended';
    complexity_level: 'beginner' | 'intermediate' | 'advanced';
    reading_goal: 'daily_read' | 'deep_analysis' | 'quick_insight' | 'entertainment';
  };
  
  // Smart quotes - المقتطفات الذكية
  smart_quotes?: Array<{
    text: string;
    context: string;
    relevance_score: number;
    emotional_impact: 'high' | 'medium' | 'low';
  }>;
  
  // AI Summary - الملخص الذكي
  ai_summary?: {
    brief: string;
    key_points: string[];
    conclusion: string;
    reading_time_saved: number;
  };
  
  // Smart recommendations
  recommendations?: Array<{
    id: string;
    title: string;
    reason: string;
    similarity_score: number;
  }>;
  
  // Additional fields
  tags?: string[];
  topics?: string[];
  reading_difficulty?: 'easy' | 'medium' | 'hard';
  target_audience?: string[];
  estimated_reading_time: number;
  category_name?: string;
}

interface ArticleClientWrapperProps {
  articleId: string;
}

export default function ArticleClientWrapper({ articleId }: ArticleClientWrapperProps) {
  const { darkMode } = useDarkModeContext();
  const [article, setArticle] = useState<ArticleData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [renderMode, setRenderMode] = useState<'news' | 'smart'>('news'); // Default للأخبار
  
  // تحديد نوع العرض حسب نوع المقال
  const determineRenderMode = (article: ArticleData): 'news' | 'smart' => {
    const articleType = article.article_type?.toLowerCase();
    
    // الأخبار العادية تستخدم التصميم الإخباري
    if (articleType === 'news' || articleType === 'breaking' || !articleType) {
      return 'news';
    }
    
    // مقالات الرأي والتحليل تستخدم التصميم الذكي
    if (articleType === 'opinion' || articleType === 'analysis' || articleType === 'editorial' || articleType === 'interview') {
      return 'smart';
    }
    
    // Default للأخبار
    return 'news';
  };

  // Fetch article data
  useEffect(() => {
    const fetchArticle = async () => {
      if (!articleId) {
        setError('معرف المقال غير صحيح');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // محاولة جلب المقال من API
        const response = await fetch(`/api/articles/${articleId}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            setError('المقال غير موجود');
          } else {
            setError('حدث خطأ في تحميل المقال');
          }
          setLoading(false);
          return;
        }

        const data = await response.json();
        
        if (data.success && data.article) {
          const articleData = data.article;
          setArticle(articleData);
          setRenderMode(determineRenderMode(articleData));
        } else {
          setError(data.error || 'فشل في تحميل المقال');
        }
      } catch (error) {
        console.error('خطأ في جلب المقال:', error);
        setError('حدث خطأ في الاتصال');
      } finally {
        setLoading(false);
      }
    };

    fetchArticle();
  }, [articleId]);

  // حالة التحميل
  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className={`text-lg ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            جاري تحميل المقال...
          </p>
        </div>
      </div>
    );
  }

  // حالة الخطأ
  if (error || !article) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="text-center max-w-md mx-auto p-6">
          <AlertCircle className="w-16 h-16 mx-auto mb-4 text-red-500" />
          <h1 className={`text-2xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            {error === 'المقال غير موجود' ? 'المقال غير موجود' : 'حدث خطأ'}
          </h1>
          <p className={`text-lg mb-6 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            {error || 'لم نتمكن من العثور على المقال المطلوب'}
          </p>
          <button
            onClick={() => window.history.back()}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            العودة للخلف
          </button>
        </div>
      </div>
    );
  }

  // عرض التصميم حسب النوع
  if (renderMode === 'smart') {
    // التصميم الذكي لمقالات الرأي والتحليل
    return (
      <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        {/* Hero Section */}
        <SmartArticleHero article={article} />
        
        {/* Main Content */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Article Content with Smart Quotes */}
          <SmartContentRenderer
            content={article.content}
            smartQuotes={article.smart_quotes}
            articleTitle={article.title}
            authorName={article.author_name}
            className="mb-12"
          />
          
          {/* Smart Summary */}
          {article.ai_summary && (
            <SmartSummary
              summary={article.ai_summary}
              articleTitle={article.title}
              originalReadingTime={article.reading_time || 5}
            />
          )}
          
          {/* Smart Recommendations */}
          {article.recommendations && (
            <SmartRecommendations
              currentArticleId={article.id}
              recommendations={article.recommendations}
            />
          )}
        </div>
        
        {/* Schema.org structured data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Article",
              headline: article.title,
              description: article.excerpt,
              image: article.featured_image,
              author: {
                "@type": "Person",
                name: article.author_name || "سبق الذكية"
              },
              publisher: {
                "@type": "Organization",
                name: "سبق الذكية",
                logo: {
                  "@type": "ImageObject",
                  url: "https://sabq.me/logo.png"
                }
              },
              datePublished: article.published_at,
              dateModified: article.published_at
            })
          }}
        />
      </div>
    );
  }

  // التصميم العادي للأخبار
  return <ArticleClientComponent initialArticle={article} articleId={articleId} />;
}