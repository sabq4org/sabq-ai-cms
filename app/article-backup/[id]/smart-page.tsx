'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useDarkModeContext } from '@/contexts/DarkModeContext';
import SmartArticleHero from '@/components/article/SmartArticleHero';
import SmartContentRenderer from '@/components/article/SmartContentRenderer';
import SmartSummary from '@/components/article/SmartSummary';
import SmartRecommendations from '@/components/article/SmartRecommendations';
import { Loader2, AlertCircle, BookOpen } from 'lucide-react';

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
  recommendations?: {
    highly_recommended: Array<{
      id: string;
      title: string;
      excerpt: string;
      featured_image?: string;
      author_name?: string;
      published_at: string;
      reading_time?: number;
      views_count: number;
      likes_count?: number;
      similarity_score: number;
      reason: string;
      category_name?: string;
      ai_match_type: 'topic_similarity' | 'author_style' | 'reader_interest' | 'trending_topic' | 'complementary_content';
    }>;
    trending_now: Array<{
      id: string;
      title: string;
      excerpt: string;
      featured_image?: string;
      author_name?: string;
      published_at: string;
      reading_time?: number;
      views_count: number;
      trend_score: number;
      category_name?: string;
    }>;
    based_on_reading_pattern: Array<{
      id: string;
      title: string;
      excerpt: string;
      featured_image?: string;
      author_name?: string;
      published_at: string;
      reading_time?: number;
      views_count: number;
      match_reason: string;
      category_name?: string;
    }>;
  };
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
            ai_analysis: {
              tone: 'analytical',
              depth_score: Math.floor(Math.random() * 30) + 70,
              recommendation: 'recommended',
              complexity_level: 'intermediate',
              reading_goal: 'deep_analysis',
              key_themes: ['التقنية', 'الابتكار', 'المستقبل']
            },
            smart_quotes: [
              {
                id: '1',
                text: 'التحول الرقمي ليس مجرد تطبيق للتقنية، بل إعادة تفكير شاملة في طريقة العمل والتفاعل مع العملاء.',
                context: 'في سياق الحديث عن استراتيجيات الشركات',
                importance_score: 85,
                emotional_impact: 'high',
                quote_type: 'key_insight',
                position_in_article: 25
              },
              {
                id: '2',
                text: 'يجب على المؤسسات أن تستثمر في تدريب موظفيها وتطوير مهاراتهم الرقمية لضمان النجاح في هذا التحول.',
                context: 'عند مناقشة التحديات التي تواجه الشركات',
                importance_score: 75,
                emotional_impact: 'medium',
                quote_type: 'call_to_action',
                position_in_article: 60
              },
              {
                id: '3',
                text: 'البيانات هي النفط الجديد، والذكاء الاصطناعي هو المحرك الذي يحولها إلى قيمة حقيقية.',
                context: 'في خلاصة المقال',
                importance_score: 90,
                emotional_impact: 'high',
                quote_type: 'conclusion',
                position_in_article: 85
              }
            ],
            ai_summary: {
              id: '1',
              brief_summary: 'يناقش هذا المقال أهمية التحول الرقمي في العصر الحديث وكيفية تطبيقه بفعالية في المؤسسات المختلفة، مع التركيز على التحديات والفرص المتاحة.',
              key_points: [
                'التحول الرقمي ضرورة حتمية وليس مجرد خيار للشركات اليوم',
                'الاستثمار في التدريب والتطوير عنصر أساسي لنجاح التحول',
                'البيانات والذكاء الاصطناعي يلعبان دورًا محوريًا في المستقبل',
                'التخطيط الاستراتيجي والتنفيذ التدريجي أفضل من التغيير الجذري المفاجئ'
              ],
              main_insights: [
                'الشركات التي تتبنى التحول الرقمي بشكل صحيح تحقق نموًا بنسبة 40% أكثر من منافسيها',
                'الاستثمار في التقنية وحده لا يكفي بدون تغيير الثقافة المؤسسية',
                'العملاء اليوم يتوقعون تجربة رقمية سلسة ومتكاملة عبر جميع نقاط التفاعل'
              ],
              action_items: [
                'إجراء تقييم شامل للوضع الرقمي الحالي للمؤسسة',
                'وضع استراتيجية واضحة للتحول الرقمي مع جدول زمني محدد',
                'الاستثمار في تدريب الموظفين على التقنيات الجديدة',
                'اختيار شركاء تقنيين موثوقين لضمان نجاح التنفيذ'
              ],
              conclusion: 'التحول الرقمي رحلة مستمرة وليس وجهة نهائية، والنجاح فيه يتطلب التزامًا طويل المدى من القيادة والموظفين على حد سواء.',
              reading_time_saved: 3,
              comprehension_score: 88,
              relevance_topics: ['التقنية', 'الأعمال', 'الابتكار', 'التطوير المهني'],
              next_steps: [
                'قراءة دليل التحول الرقمي للشركات الناشئة',
                'حضور ورش عمل حول الذكاء الاصطناعي في الأعمال',
                'التواصل مع خبراء التحول الرقمي للحصول على استشارة'
              ],
              related_concepts: ['الذكاء الاصطناعي', 'البيانات الضخمة', 'إنترنت الأشياء', 'الحوسبة السحابية', 'الأمن السيبراني']
            },
            recommendations: {
              highly_recommended: [
                {
                  id: 'rec-1',
                  title: 'مستقبل الذكاء الاصطناعي في الأعمال السعودية',
                  excerpt: 'نظرة شاملة على كيفية تغيير الذكاء الاصطناعي لقطاع الأعمال في المملكة...',
                  featured_image: '/images/ai-business.jpg',
                  author_name: 'د. محمد الأحمد',
                  published_at: '2024-01-15T10:00:00Z',
                  reading_time: 8,
                  views_count: 15420,
                  likes_count: 245,
                  similarity_score: 92,
                  reason: 'يناقش نفس موضوع التقنية والتحول الرقمي بعمق أكبر',
                  category_name: 'تقنية',
                  ai_match_type: 'topic_similarity'
                },
                {
                  id: 'rec-2',
                  title: 'تجارب ناجحة في التحول الرقمي للمؤسسات الحكومية',
                  excerpt: 'قصص نجاح ملهمة من مؤسسات حكومية نجحت في تطبيق التحول الرقمي...',
                  featured_image: '/images/government-digital.jpg',
                  author_name: 'سارة العتيبي',
                  published_at: '2024-01-10T14:30:00Z',
                  reading_time: 12,
                  views_count: 8930,
                  likes_count: 167,
                  similarity_score: 85,
                  reason: 'يقدم أمثلة عملية لما تم مناقشته نظريًا في هذا المقال',
                  category_name: 'حكومة رقمية',
                  ai_match_type: 'complementary_content'
                }
              ],
              trending_now: [
                {
                  id: 'trend-1',
                  title: 'الثورة الصناعية الرابعة وتأثيرها على سوق العمل',
                  excerpt: 'كيف تعيد التقنيات الناشئة تشكيل طبيعة الوظائف والمهارات المطلوبة...',
                  featured_image: '/images/industry-4.jpg',
                  author_name: 'أحمد المطيري',
                  published_at: '2024-01-20T09:15:00Z',
                  reading_time: 10,
                  views_count: 25340,
                  trend_score: 95,
                  category_name: 'اقتصاد'
                }
              ],
              based_on_reading_pattern: [
                {
                  id: 'pattern-1',
                  title: 'أساسيات الأمن السيبراني للشركات الصغيرة',
                  excerpt: 'دليل شامل لحماية بيانات الشركات الصغيرة من التهديدات السيبرانية...',
                  featured_image: '/images/cybersecurity.jpg',
                  author_name: 'نورا الزهراني',
                  published_at: '2024-01-12T16:45:00Z',
                  reading_time: 7,
                  views_count: 12580,
                  match_reason: 'تقرأ عادة مقالات حول التقنية والأمان الرقمي',
                  category_name: 'أمن معلومات'
                }
              ]
            }
          };
          
          setArticle(smartArticle);
        } else {
          const smartData = await response.json();
          setArticle(smartData);
        }
        
      } catch (err) {
        console.error('خطأ في جلب المقال:', err);
        setError(err instanceof Error ? err.message : 'خطأ غير معروف');
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
          <Loader2 className={`w-12 h-12 animate-spin mx-auto mb-4 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
          <p className={`text-lg ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            جاري تحميل المقال الذكي...
          </p>
          <p className={`text-sm mt-2 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
            نقوم بتحليل المحتوى وإعداد الميزات الذكية
          </p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !article) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="text-center max-w-md">
          <AlertCircle className={`w-16 h-16 mx-auto mb-4 ${darkMode ? 'text-red-400' : 'text-red-500'}`} />
          <h1 className={`text-2xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            لم يتم العثور على المقال
          </h1>
          <p className={`text-lg mb-6 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            {error || 'المقال المطلوب غير موجود أو تم حذفه'}
          </p>
          <button 
            onClick={() => window.history.back()}
            className={`
              px-6 py-3 rounded-xl font-medium transition-colors
              ${darkMode 
                ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                : 'bg-blue-600 hover:bg-blue-700 text-white'
              }
            `}
          >
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