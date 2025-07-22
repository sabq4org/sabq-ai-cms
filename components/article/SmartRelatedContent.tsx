'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { formatRelativeDate } from '@/lib/date-utils';
import { 
  Clock, User, Eye, Brain, Edit, Newspaper, TrendingUp, 
  ChevronRight, Sparkles, BarChart3, MessageCircle 
} from 'lucide-react';

interface SmartArticle {
  id: string;
  title: string;
  summary?: string;
  slug: string;
  type: 'news' | 'analysis' | 'opinion' | 'breaking';
  featuredImage?: string;
  author?: string;
  readTime?: number;
  views?: number;
  category?: string;
  publishedAt?: string;
}

interface SmartRelatedContentProps {
  articleId: string;
  categoryId?: string;
  categoryName?: string;
  tags?: string[];
  darkMode?: boolean;
}

// دالة للحصول على أيقونة النوع
const getTypeIcon = (type: string) => {
  switch (type) {
    case 'analysis': return '🧠';
    case 'opinion': return '🖋️';
    case 'breaking': return '⚡';
    case 'news': return '📰';
    default: return '📄';
  }
};

// دالة للحصول على ألوان الشارات
const getBadgeColors = (type: string) => {
  switch (type) {
    case 'analysis': return 'bg-purple-100 text-purple-700 border-purple-200';
    case 'opinion': return 'bg-orange-100 text-orange-700 border-orange-200';
    case 'breaking': return 'bg-red-100 text-red-700 border-red-200';
    case 'news': return 'bg-blue-100 text-blue-700 border-blue-200';
    default: return 'bg-gray-100 text-gray-700 border-gray-200';
  }
};

// تنسيق الوقت باستخدام النظام الموحد
const formatTimeAgo = (dateString: string) => {
  return formatRelativeDate(dateString);
};

// مكون البطاقة الأفقية
const HorizontalCard: React.FC<{ article: SmartArticle; darkMode?: boolean }> = ({ 
  article, 
  darkMode = false 
}) => (
  <Link href={`/article/${article.id}`} className="group block">
    <div className={`flex gap-3 p-3 rounded-lg border transition-all duration-300 hover:shadow-md ${
      darkMode 
        ? 'bg-gray-800 border-gray-700 hover:border-gray-600' 
        : 'bg-white border-gray-200 hover:border-blue-200'
    }`}>
      
      {/* الصورة المصغرة */}
      {article.featuredImage && (
        <div className="flex-shrink-0 relative w-20 h-20 rounded-lg overflow-hidden">
          <Image
            src={article.featuredImage}
            alt={article.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
      )}
      
      {/* المحتوى */}
      <div className="flex-1 min-w-0">
        {/* الشارة */}
        <div className="flex items-center gap-2 mb-2">
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${getBadgeColors(article.type)}`}>
            <span>{getTypeIcon(article.type)}</span>
            {article.type === 'analysis' ? 'تحليل عميق' : 
             article.type === 'opinion' ? 'مقال رأي' :
             article.type === 'breaking' ? 'عاجل' : 'خبر'}
          </span>
        </div>
        
        {/* العنوان */}
        <h3 className={`font-semibold leading-tight mb-2 line-clamp-2 text-sm group-hover:text-blue-600 transition-colors ${
          darkMode ? 'text-white' : 'text-gray-900'
        }`}>
          {article.title}
        </h3>
        
        {/* المعلومات */}
        <div className={`flex items-center gap-3 text-xs ${
          darkMode ? 'text-gray-400' : 'text-gray-500'
        }`}>
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <span>{article.readTime || 5} د</span>
          </div>
          <div className="flex items-center gap-1">
            <Eye className="w-3 h-3" />
            <span>{(article.views || 0).toLocaleString()}</span>
          </div>
          <span>{formatTimeAgo(article.publishedAt || new Date().toISOString())}</span>
        </div>
      </div>
    </div>
  </Link>
);

// مكون الرابط السريع
const QuickLink: React.FC<{ 
  title: string; 
  icon: string; 
  href: string;
  darkMode?: boolean; 
}> = ({ title, icon, href, darkMode = false }) => (
  <Link 
    href={href} 
    className={`flex items-center gap-2 p-2 rounded-lg transition-colors hover:bg-gray-50 ${
      darkMode ? 'hover:bg-gray-700' : ''
    }`}
  >
    <span className="text-base">{icon}</span>
    <span className={`text-sm font-medium flex-1 ${
      darkMode ? 'text-gray-300 hover:text-white' : 'text-gray-700 hover:text-gray-900'
    }`}>
      {title}
    </span>
    <ChevronRight className={`w-4 h-4 ${
      darkMode ? 'text-gray-500' : 'text-gray-400'
    }`} />
  </Link>
);

export default function SmartRelatedContent({ 
  articleId, 
  categoryId,
  categoryName,
  tags = [],
  darkMode = false 
}: SmartRelatedContentProps) {
  const [relatedArticles, setRelatedArticles] = useState<SmartArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRelatedContent = async () => {
      try {
        setLoading(true);
        
        // تحديد البروتوكول والمنفذ بناءً على البيئة
        const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
        const apiUrl = `${baseUrl}/api/articles/related?articleId=${articleId}&categoryId=${categoryId || ''}&tags=${tags.join(',')}&limit=8`;
        
        console.log('جلب المقالات المرتبطة من:', apiUrl);
        
        // جلب المقالات المرتبطة من API
        const response = await fetch(apiUrl, {
          headers: {
            'Content-Type': 'application/json',
          },
          // إضافة timeout
          signal: AbortSignal.timeout(10000) // 10 ثوانٍ
        });
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: فشل في جلب المحتوى المرتبط`);
        }
        
        const text = await response.text();
        console.log('استجابة API:', text.substring(0, 200) + '...');
        
        let data;
        
        try {
          data = JSON.parse(text);
        } catch (parseError) {
          console.error('خطأ في parsing JSON:', parseError);
          console.error('Response text:', text.substring(0, 500));
          throw new Error('استجابة غير صالحة من الخادم');
        }
        
        // تحويل البيانات إلى الشكل المطلوب
        const articles: SmartArticle[] = (data.articles || []).map((article: any) => ({
          id: article.id,
          title: article.title,
          summary: article.summary || article.excerpt,
          slug: article.slug || article.id,
          type: article.type || 'news',
          featuredImage: article.featured_image_url || article.featuredImage,
          author: article.author?.name,
          readTime: article.read_time || Math.ceil((article.content?.length || 1000) / 1000),
          views: article.views_count || article.views,
          category: article.category?.name,
          publishedAt: article.published_at || article.created_at
        }));
        
        setRelatedArticles(articles);
      } catch (err) {
        console.error('خطأ في جلب المحتوى المرتبط:', err);
        setError(err instanceof Error ? err.message : 'حدث خطأ غير متوقع');
        
        // بيانات تجريبية في حالة الخطأ
        setRelatedArticles([
          {
            id: '1',
            title: 'تحليل عميق: تأثير التطورات الاقتصادية على السوق السعودي',
            summary: 'دراسة شاملة للتغيرات الاقتصادية وتأثيرها على الاستثمارات المحلية',
            slug: 'economic-analysis-saudi-market',
            type: 'analysis',
            featuredImage: '/images/default-analysis.jpg',
            author: 'د. محمد العتيبي',
            readTime: 8,
            views: 1240,
            category: 'اقتصاد',
            publishedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchRelatedContent();
  }, [articleId, categoryId, tags]);

  if (loading) {
    return (
      <div className={`w-full py-6 px-4 ${
        darkMode ? 'bg-gray-800' : 'bg-gray-50'
      }`}>
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-center py-8">
            <div className="flex items-center gap-3">
              <div className="animate-spin">
                <Sparkles className={`w-5 h-5 ${
                  darkMode ? 'text-blue-400' : 'text-blue-600'
                }`} />
              </div>
              <span className={`text-sm ${
                darkMode ? 'text-gray-300' : 'text-gray-600'
              }`}>
                جاري تحميل المحتوى المخصص لك...
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error && relatedArticles.length === 0) {
    return null; // إخفاء البلوك في حالة الخطأ بدون بيانات تجريبية
  }

  return (
    <section className={`w-full py-6 px-4 ${
      darkMode ? 'bg-gray-800' : 'bg-gray-50'
    }`}>
      <div className="max-w-2xl mx-auto">
        
        {/* عنوان القسم */}
        <div className="flex items-center gap-2 mb-6">
          <div className="flex items-center gap-2">
            <Brain className={`w-5 h-5 ${
              darkMode ? 'text-blue-400' : 'text-blue-600'
            }`} />
            <h2 className={`text-lg font-bold ${
              darkMode ? 'text-white' : 'text-gray-900'
            }`}>
              مخصص لك بذكاء
            </h2>
          </div>
        </div>

        {/* البطاقات الأفقية الرئيسية (3 بطاقات) */}
        {relatedArticles.slice(0, 3).length > 0 && (
          <div className="space-y-3 mb-6">
            {relatedArticles.slice(0, 3).map((article) => (
              <HorizontalCard 
                key={article.id} 
                article={article} 
                darkMode={darkMode}
              />
            ))}
          </div>
        )}

        {/* الروابط السريعة */}
        <div className={`p-4 rounded-lg border mb-6 ${
          darkMode 
            ? 'bg-gray-700 border-gray-600' 
            : 'bg-white border-gray-200'
        }`}>
          <h3 className={`text-sm font-semibold mb-3 ${
            darkMode ? 'text-gray-300' : 'text-gray-700'
          }`}>
            قد يهمك أيضاً
          </h3>
          <div className="space-y-1">
            <QuickLink
              title="أبرز التحليلات العميقة لهذا الأسبوع"
              icon="🧠"
              href="/insights/deep"
              darkMode={darkMode}
            />
            <QuickLink
              title="مقالات الرأي الأكثر قراءة"
              icon="🖋️"
              href="/opinion"
              darkMode={darkMode}
            />
            <QuickLink
              title="إنفوجرافيك: أرقام واتجاهات 2025"
              icon="📊"
              href="/infographics"
              darkMode={darkMode}
            />
          </div>
        </div>

        {/* البطاقات الإضافية (2 بطاقات) */}
        {relatedArticles.slice(3, 5).length > 0 && (
          <div className="space-y-3 mb-4">
            {relatedArticles.slice(3, 5).map((article) => (
              <HorizontalCard 
                key={article.id} 
                article={article} 
                darkMode={darkMode}
              />
            ))}
          </div>
        )}

        {/* ملاحظة التوصيات */}
        <div className={`text-center pt-4 border-t ${
          darkMode ? 'border-gray-700' : 'border-gray-200'
        }`}>
          <p className={`text-xs ${
            darkMode ? 'text-gray-400' : 'text-gray-500'
          }`}>
            💡 يتم توليد هذه التوصيات بناءً على تفاعلك واهتماماتك
          </p>
        </div>

      </div>
    </section>
  );
}
