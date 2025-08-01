'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useDarkModeContext } from '@/contexts/DarkModeContext';
import SmartArticleHero from '@/components/article/SmartArticleHero';
import SmartContentRenderer from '@/components/article/SmartContentRenderer';
import SmartSummary from '@/components/article/SmartSummary';
import SmartRecommendations from '@/components/article/SmartRecommendations';
import { Loader2, AlertCircle, BookOpen } from 'lucide-react';

/**
 * 🗞️ صفحة تفاصيل المقال الذكية - التصميم الجديد
 * 
 * ✨ الميزات الذكية:
 * - تصميم Hero بانورامي مع معلومات المقال
 * - مؤشرات الذكاء الاصطناعي (نبرة، مستوى التحليل، التوصية)
 * - اقتباسات ذكية مستخرجة من AI
 * - ملخص ذكي تفاعلي
 * - توصيات ذكية للمقالات ذات الصلة
 * - دعم الوضع الليلي
 * - تصميم متجاوب للموبايل والديسكتوب
 * 
 * 🤖 ميزات AI:
 * - تحليل نبرة المقال
 * - تقييم مستوى العمق
 * - استخراج اقتباسات مهمة
 * - ملخص ذكي مع نقاط رئيسية
 * - توصيات مخصصة
 */

interface SmartArticleData {
  id: string;
  title: string;
  content: string;
  excerpt?: string;
  featured_image?: string;
  published_at: string;
  reading_time?: number;
  views_count: number;
  likes_count?: number;
  comments_count?: number;
  category_name?: string;
  category_color?: string;
  author_name?: string;
  author_avatar?: string;
  author_slug?: string;
  
  // AI Analysis
  ai_analysis?: {
    tone: 'analytical' | 'emotional' | 'satirical' | 'educational' | 'investigative';
    depth_score: number;
    recommendation: 'highly_recommended' | 'recommended' | 'neutral' | 'not_recommended';
    complexity_level: 'beginner' | 'intermediate' | 'advanced';
    reading_goal: 'daily_read' | 'deep_analysis' | 'quick_insight' | 'entertainment';
    key_themes: string[];
  };
  
  // Smart Quotes
  smart_quotes?: Array<{
    id: string;
    text: string;
    context?: string;
    importance_score: number;
    emotional_impact: 'high' | 'medium' | 'low';
    quote_type: 'key_insight' | 'call_to_action' | 'expert_opinion' | 'data_point' | 'conclusion';
    position_in_article: number;
  }>;
  
  // AI Summary
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
  
  // Smart Recommendations
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

export default function SmartArticlePage() {
  const params = useParams();
  const { darkMode } = useDarkModeContext();
  const [article, setArticle] = useState<SmartArticleData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const articleId = params?.id as string;

  // Fetch article data
  useEffect(() => {
    const fetchArticle = async () => {
      if (!articleId) return;
      
      try {
        setLoading(true);
        
        // Try to fetch from smart article API first
        let response = await fetch(`/api/articles/${articleId}/smart`);
        
        if (!response.ok) {
          // Fallback to regular article API and generate mock smart data
          response = await fetch(`/api/articles/${articleId}`);
          
          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: فشل في جلب المقال`);
          }
          
          const basicArticle = await response.json();
          
          // Generate mock smart data
          const smartArticle: SmartArticleData = {
            ...basicArticle,
            views_count: basicArticle.views || 0,
            likes_count: basicArticle.likes || 0,
            comments_count: basicArticle.comments_count || 0,
            category_name: basicArticle.category?.name || basicArticle.categories?.name || 'عام',
            category_color: '#3B82F6',
            author_name: basicArticle.author?.name || 'كاتب غير محدد',
            author_avatar: basicArticle.author?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(basicArticle.author?.name || 'كاتب')}&background=0D8ABC&color=fff`,
            author_slug: basicArticle.author?.slug || 'unknown',
            
            // Mock AI Analysis
            ai_analysis: {
              tone: 'analytical',
              depth_score: Math.floor(Math.random() * 30) + 70, // 70-99%
              recommendation: 'recommended',
              complexity_level: 'intermediate',
              reading_goal: 'daily_read',
              key_themes: ['أخبار', 'تحليل', 'معلومات مهمة']
            },
            
            // Mock Smart Quotes
            smart_quotes: [
              {
                id: 'quote-1',
                text: 'هذا اقتباس ذكي مستخرج من المقال يلخص الفكرة الرئيسية',
                context: 'من الفقرة الثانية',
                importance_score: 85,
                emotional_impact: 'high',
                quote_type: 'key_insight',
                position_in_article: 2
              },
              {
                id: 'quote-2', 
                text: 'نقطة مهمة أخرى تستحق التأمل والمناقشة',
                context: 'من الخاتمة',
                importance_score: 78,
                emotional_impact: 'medium',
                quote_type: 'conclusion',
                position_in_article: 5
              }
            ],
            
            // Mock AI Summary
            ai_summary: {
              id: 'summary-1',
              brief_summary: 'ملخص ذكي للمقال يغطي النقاط الرئيسية بشكل مختصر ومفيد',
              key_points: [
                'النقطة الأولى المهمة في المقال',
                'النقطة الثانية التي تستحق الانتباه',
                'الخلاصة والتوصيات النهائية'
              ],
              main_insights: [
                'رؤية عميقة مستخرجة من تحليل المحتوى',
                'فهم متقدم للموضوع وتأثيراته'
              ],
              action_items: [
                'خطوة عملية يمكن للقارئ اتباعها',
                'توصية للمتابعة والتطبيق'
              ],
              conclusion: 'خاتمة ذكية تلخص الأفكار الرئيسية',
              reading_time_saved: 3,
              comprehension_score: 92,
              relevance_topics: ['موضوع ذو صلة 1', 'موضوع ذو صلة 2'],
              next_steps: ['خطوة تالية مقترحة'],
              related_concepts: ['مفهوم مرتبط 1', 'مفهوم مرتبط 2']
            },
            
            // Mock Recommendations  
            recommendations: [
              {
                id: 'rec-1',
                title: 'مقال ذو صلة يكمل الموضوع',
                excerpt: 'وصف مختصر للمقال المقترح',
                similarity_score: 0.85,
                recommendation_reason: 'مواضيع متشابهة',
                article_type: 'news',
                estimated_reading_time: 4,
                category_name: 'نفس التصنيف'
              }
            ]
          };
          
          setArticle(smartArticle);
        } else {
          const smartData = await response.json();
          setArticle(smartData);
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
            جاري تحميل المقال الذكي...
          </p>
          <p className={`text-sm mt-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            يتم إعداد التحليل الذكي والميزات التفاعلية
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
}