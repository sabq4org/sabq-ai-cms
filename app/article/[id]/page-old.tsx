'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useDarkModeContext } from '@/contexts/DarkModeContext';
import dynamic from 'next/dynamic';
import { Loader2, AlertCircle, BookOpen } from 'lucide-react';

/**
 * 🗞️ صفحة تفاصيل المقال - توجيه ذكي حسب نوع المحتوى
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
    key_themes: string[];
  };
  
  smart_quotes?: Array<{
    id: string;
    text: string;
    context?: string;
    importance_score: number;
    emotional_impact: 'high' | 'medium' | 'low';
    quote_type: 'key_insight' | 'call_to_action' | 'expert_opinion' | 'data_point' | 'conclusion';
    position_in_article: number;
  }>;
  
  ai_summary?: {
    id: string;
    brief_summary: string;
    key_points: string[];
    main_insights: string[];
    action_items?: string[];
    conclusion: string;
    reading_time_saved: number;
    comprehension_score: number;
    relevance_topics: string[];
    next_steps?: string[];
    related_concepts: string[];
  };
  
  recommendations?: Array<{
    id: string;
    title: string;
    excerpt: string;
    similarity_score: number;
    recommendation_reason: string;
    article_type: 'news' | 'analysis' | 'opinion';
    estimated_reading_time: number;
    category_name?: string;
  }>;
}

export default function ArticlePage() {
  const params = useParams();
  const { darkMode } = useDarkModeContext();
  const [article, setArticle] = useState<ArticleData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [renderMode, setRenderMode] = useState<'news' | 'smart'>('news'); // Default للأخبار
  
  const articleId = params?.id as string;

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
      if (!articleId) return;
      
      try {
        setLoading(true);
        
        // جلب البيانات الأساسية أولاً
        const response = await fetch(`/api/articles/${articleId}`);
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: فشل في جلب المقال`);
        }
        
        const basicArticle = await response.json();
        
        // تحديد نوع العرض
        const mode = determineRenderMode(basicArticle);
        setRenderMode(mode);
        
        if (mode === 'smart') {
          // للمقالات الذكية: جرب API الذكي أولاً
          try {
            const smartResponse = await fetch(`/api/articles/${articleId}/smart`);
            if (smartResponse.ok) {
              const smartData = await smartResponse.json();
              setArticle(smartData);
              return;
            }
          } catch (smartError) {
            console.log('Smart API غير متوفر، سيتم استخدام بيانات وهمية');
          }
          
          // إنشاء بيانات ذكية وهمية لمقالات الرأي
          const smartArticle: ArticleData = {
            ...basicArticle,
            views_count: basicArticle.views || 0,
            likes_count: basicArticle.likes || 0,
            comments_count: basicArticle.comments_count || 0,
            category_name: basicArticle.category?.name || basicArticle.categories?.name || 'رأي',
            author_name: basicArticle.author?.name || 'كاتب رأي',
            
            // Mock AI Analysis لمقالات الرأي
            ai_analysis: {
              tone: 'analytical',
              depth_score: Math.floor(Math.random() * 30) + 70,
              recommendation: 'recommended',
              complexity_level: 'intermediate',
              reading_goal: 'deep_analysis',
              key_themes: ['رأي', 'تحليل', 'وجهة نظر']
            },
            
            // Mock Smart Quotes
            smart_quotes: [
              {
                id: 'quote-1',
                text: 'رؤية عميقة من الكاتب تستحق التأمل والمناقشة',
                context: 'من صلب المقال',
                importance_score: 85,
                emotional_impact: 'high',
                quote_type: 'key_insight',
                position_in_article: 2
              }
            ],
            
            // Mock AI Summary
            ai_summary: {
              id: 'summary-1',
              brief_summary: 'ملخص ذكي لوجهة النظر والحجج المطروحة في المقال',
              key_points: [
                'النقطة الرئيسية في الرأي',
                'الحجة المركزية للكاتب',
                'الخلاصة والتوصيات'
              ],
              main_insights: [
                'فهم عميق لموضوع المقال',
                'تحليل متقدم لوجهة النظر'
              ],
              conclusion: 'خاتمة تلخص الرأي والموقف',
              reading_time_saved: 3,
              comprehension_score: 90,
              relevance_topics: ['موضوع ذو صلة 1', 'موضوع ذو صلة 2'],
              related_concepts: ['مفهوم مرتبط 1', 'مفهوم مرتبط 2']
            },
            
            recommendations: [
              {
                id: 'rec-1',
                title: 'مقال رأي آخر ذو صلة',
                excerpt: 'وجهة نظر مكملة أو مختلفة',
                similarity_score: 0.80,
                recommendation_reason: 'موضوع مشابه أو وجهة نظر أخرى',
                article_type: 'opinion',
                estimated_reading_time: 5,
                category_name: 'رأي'
              }
            ]
          };
          
          setArticle(smartArticle);
        } else {
          // للأخبار: استخدم البيانات الأساسية مع التصميم الإخباري
          setArticle(basicArticle);
        }
        
      } catch (error: any) {
        console.error('خطأ في جلب المقال:', error);
        setError(error.message || 'حدث خطأ في جلب المقال');
      } finally {
        setLoading(false);
      }
    };

    fetchArticle();
  }, [articleId]);

  // Loading state
  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="text-center">
          <Loader2 className={`w-8 h-8 animate-spin mx-auto mb-4 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
          <p className={`text-lg ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            جاري تحميل المقال...
          </p>
          <p className={`text-sm mt-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            {renderMode === 'smart' ? 'يتم إعداد التحليل الذكي والميزات التفاعلية' : 'تحضير المحتوى الإخباري'}
          </p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !article) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="text-center max-w-md mx-auto p-6">
          <AlertCircle className={`w-16 h-16 mx-auto mb-4 ${darkMode ? 'text-red-400' : 'text-red-500'}`} />
          <h2 className={`text-2xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            عذراً، حدث خطأ
          </h2>
          <p className={`text-lg mb-6 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            {error || 'لم يتم العثور على المقال المطلوب'}
          </p>
          <button 
            onClick={() => window.history.back()}
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
              darkMode 
                ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            <BookOpen className="w-5 h-5 inline-block ml-2" />
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
              "headline": article.title,
              "description": article.excerpt,
              "image": article.featured_image,
              "author": {
                "@type": "Person",
                "name": article.author_name
              },
              "publisher": {
                "@type": "Organization",
                "name": "صحيفة سبق",
                "logo": {
                  "@type": "ImageObject",
                  "url": "/logo.png"
                }
              },
              "datePublished": article.published_at,
              "dateModified": article.published_at
            })
          }}
        />
      </div>
    );
  } else {
    // التصميم الإخباري الكلاسيكي للأخبار
    return <ArticleClientComponent initialArticle={article} articleId={articleId} />;
  }
}