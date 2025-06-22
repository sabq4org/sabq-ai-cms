'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  Clock, Eye, MessageCircle, Share2, Heart, User, 
  Calendar, Tag, TrendingUp, Sparkles, Zap, Award,
  ArrowLeft, BookOpen, Target, Hash, Activity,
  Flame, Brain, Star, BarChart3, Play, Newspaper,
  Trophy, Users
} from 'lucide-react';
import { useDarkModeContext } from '@/contexts/DarkModeContext';

interface SmartBlock {
  id: string;
  name: string;
  position: 'topBanner' | 'afterHighlights' | 'afterCards' | 'beforePersonalization' | 'beforeFooter';
  type: 'smart' | 'custom' | 'html';
  status: 'active' | 'inactive' | 'scheduled';
  displayType: 'grid' | 'cards' | 'horizontal' | 'gallery' | 'list' | 'hilal-special';
  keyword?: string;
  category?: string;
  articlesCount: number;
  theme: {
    primaryColor: string;
    secondaryColor?: string;
    backgroundColor: string;
    textColor: string;
    accentColor?: string;
    borderColor?: string;
  };
  customHtml?: string;
  schedule?: {
    startDate: string;
    endDate: string;
    isTemp: boolean;
  };
  order: number;
  metadata?: {
    teamName?: string;
    teamLogo?: string;
    teamColors?: string[];
    competition?: string;
    specialFeatures?: string[];
  };
}

interface Article {
  id: string;
  title: string;
  summary: string;
  content: string;
  slug: string;
  imageUrl?: string;
  author: string;
  publishedAt: string;
  tags: string[];
  category: string;
  views: number;
  likes: number;
  comments: number;
  isBreaking?: boolean;
  isFeatured?: boolean;
  readingTime?: number;
}

interface SmartSlotProps {
  position: 'topBanner' | 'afterHighlights' | 'afterCards' | 'beforePersonalization' | 'beforeFooter';
}

/**
 * SmartSlot: Placeholder لبلوكات ذكية يتم حقنها ديناميكياً لاحقاً.
 * حالياً يعرض حاوية بسيطة لتجنب أخطاء البناء.
 */
export default function SmartSlot({ position }: SmartSlotProps) {
  const { darkMode } = useDarkModeContext();
  const [blocks, setBlocks] = useState<SmartBlock[]>([]);
  const [articles, setArticles] = useState<{ [blockId: string]: Article[] }>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBlocks();
  }, [position]);

  const fetchBlocks = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/smart-blocks?position=${position}&status=active`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch smart blocks');
      }

      const data = await response.json();
      const activeBlocks = data.filter((block: SmartBlock) => block.status === 'active');
      
      setBlocks(activeBlocks);
      
      // جلب المقالات لكل بلوك
      for (const block of activeBlocks) {
        await fetchArticlesForBlock(block);
      }
    } catch (error) {
      console.error('Error fetching smart blocks:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchArticlesForBlock = async (block: SmartBlock) => {
    try {
      let url = `/api/articles?limit=${block.articlesCount}`;
      
      if (block.keyword) {
        url += `&search=${encodeURIComponent(block.keyword)}`;
      }
      
      if (block.category) {
        url += `&category=${encodeURIComponent(block.category)}`;
      }
      
      const response = await fetch(url);
      const data = await response.json();
      
      const articlesData = data.data || data.articles || [];
      
      setArticles(prev => ({
        ...prev,
        [block.id]: articlesData.map((article: any) => ({
          id: article.id,
          title: article.title,
          summary: article.summary || article.excerpt || '',
          content: article.content || '',
          slug: article.slug || article.id,
          imageUrl: article.featured_image || article.image || null,
          author: article.author_name || article.author || 'فريق التحرير',
          publishedAt: article.published_at || article.created_at,
          tags: article.tags || [],
          category: article.category || 'عام',
          views: article.views_count || article.views || 0,
          likes: article.likes || 0,
          comments: article.comments || 0,
          isBreaking: article.is_breaking || false,
          isFeatured: article.is_featured || false,
          readingTime: article.reading_time || Math.ceil((article.content?.length || 0) / 200)
        }))
      }));
    } catch (error) {
      console.error('Error fetching articles for block:', error);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 1) return 'منذ دقائق';
    if (diffInHours < 24) return `منذ ${Math.floor(diffInHours)} ساعة`;
    if (diffInHours < 48) return 'أمس';
    return date.toLocaleDateString('ar-SA', { day: 'numeric', month: 'long' });
  };

  const generatePlaceholderImage = (title: string) => {
    const placeholderImages = [
      'https://images.unsplash.com/photo-1504711434969-e33886168f5c',
      'https://images.unsplash.com/photo-1451187580459-43490279c0fa',
      'https://images.unsplash.com/photo-1495020689067-958852a7765e',
      'https://images.unsplash.com/photo-1585829365295-ab7cd400c167',
      'https://images.unsplash.com/photo-1478940020726-e9e191651f1a',
      'https://images.unsplash.com/photo-1572949645841-094f3a9c4c94',
      'https://images.unsplash.com/photo-1588681664899-f142ff2dc9b1',
      'https://images.unsplash.com/photo-1586339949916-3e9457bef6d3',
    ];
    
    const hash = title.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const imageIndex = hash % placeholderImages.length;
    
    return `${placeholderImages[imageIndex]}?auto=format&fit=crop&w=800&q=80`;
  };

  // مكون بطاقة الأخبار - نفس تصميم NewsCard في الصفحة الرئيسية
  const NewsCard = ({ article, isPersonalized = false }: { article: Article; isPersonalized?: boolean }) => {
    const confidenceScore = 4.5; // نقطة ثقة افتراضية
    
    return (
      <Link href={`/article/${article.slug}`} className="block" prefetch={true}>
        <div className={`group rounded-3xl transition-all duration-300 hover:shadow-2xl hover:scale-[1.02] bg-white dark:bg-gray-800 ${
          isPersonalized ? 'ring-2 ring-blue-400/30' : ''
        } shadow-lg dark:shadow-gray-900/50 overflow-hidden`}>
          <div className="relative h-48 overflow-hidden">
            <img 
              src={article.imageUrl || generatePlaceholderImage(article.title)} 
              alt={article.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
            />
            {/* تأثير التدرج على الصورة */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            
            {article.isBreaking && (
              <span className="absolute top-3 right-3 px-3 py-1 bg-red-500 text-white text-xs font-bold rounded-full shadow-lg dark:shadow-gray-900/50">
                عاجل
              </span>
            )}
            
            {/* شارة المحتوى المخصص */}
            {isPersonalized && (
              <div className="absolute top-3 left-3">
                <div className="flex items-center gap-1 px-2 py-1 bg-blue-500/90 text-white text-xs rounded-full shadow-lg dark:shadow-gray-900/50 backdrop-blur-sm">
                  <Target className="w-3 h-3" />
                  <span>مخصص لك</span>
                </div>
              </div>
            )}
            
            <div className="absolute bottom-3 left-3 right-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-1 bg-blue-500 text-white text-xs rounded-md">
                    {article.category}
                  </span>
                  <div className="flex items-center gap-1 text-blue-400">
                    <Sparkles className="w-3 h-3" />
                    <span className="text-xs">AI</span>
                  </div>
                </div>
                
                {/* نقاط الثقة */}
                <div className="flex items-center gap-1 px-2 py-1 bg-black/70 text-white text-xs rounded-full">
                  <Star className="w-3 h-3 text-yellow-400" />
                  <span>{confidenceScore.toFixed(1)}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="p-6">
            <h3 className="text-lg font-bold mb-3 leading-tight transition-colors duration-300 text-gray-800 dark:text-white">
              {article.title}
            </h3>
            
            <p className="text-sm mb-4 line-clamp-2 transition-colors duration-300 text-gray-600 dark:text-gray-400">
              {article.summary}
            </p>
            
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <span className="text-xs transition-colors duration-300 text-gray-500 dark:text-gray-400">
                  {article.author}
                </span>
                <span className="text-xs transition-colors duration-300 text-gray-500 dark:text-gray-400">
                  {article.readingTime} دقائق قراءة
                </span>
              </div>
              <div className="flex items-center gap-1">
                <Eye className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {article.views.toLocaleString()}
                </span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex gap-1">
                {article.tags.slice(0, 2).map((tag: string) => (
                  <span key={tag} className="px-2 py-1 text-xs rounded-md bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                    #{tag}
                  </span>
                ))}
              </div>
              
              <div className="flex items-center gap-2">
                <button 
                  onClick={(e) => {
                    e.preventDefault();
                  }}
                  className="p-2 rounded-lg transition-colors duration-300 hover:bg-gray-100 dark:hover:bg-gray-700">
                  <Heart className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                </button>
                <button 
                  onClick={(e) => {
                    e.preventDefault();
                  }}
                  className="p-2 rounded-lg transition-colors duration-300 hover:bg-gray-100 dark:hover:bg-gray-700">
                  <Share2 className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </Link>
    );
  };

  const renderBlockContent = (block: SmartBlock) => {
    const blockArticles = articles[block.id] || [];
    
    if (block.type === 'html' && block.customHtml) {
      return (
        <div 
          className="custom-html-block max-w-7xl mx-auto px-6"
          dangerouslySetInnerHTML={{ __html: block.customHtml }}
        />
      );
    }

    if (blockArticles.length === 0) {
      return null;
    }

    if (block.displayType === 'hilal-special') {
      return (
        <div className="mb-16 bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-lg border border-gray-100 dark:border-gray-800">
          {/* عنوان البلوك مع الأيقونة - محاذاة يسار */}
          <div className="text-left mb-8">
            <div className="flex items-center justify-start gap-3 mb-3">
              <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                {block.name}
              </h2>
            </div>
            
            {/* الكلمة المفتاحية تحت العنوان */}
            <div className="flex items-center justify-start gap-2 text-sm text-gray-500 dark:text-gray-400">
              <span>الكلمة المفتاحية:</span>
              <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-3 py-1 rounded-full font-medium">
                {block.keyword}
              </span>
            </div>
          </div>

          {/* شبكة 4 بطاقات أصغر */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {blockArticles.slice(0, 4).map((article, index) => (
              <div
                key={article.id}
                className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 hover:shadow-md transition-all duration-300 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 cursor-pointer"
              >
                {/* صورة المقال */}
                {article.imageUrl && (
                  <div className="mb-3 rounded-lg overflow-hidden">
                    <img
                      src={article.imageUrl}
                      alt={article.title}
                      className="w-full h-32 object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  </div>
                )}
                
                {/* عنوان المقال */}
                <h3 className="text-sm font-semibold text-gray-800 dark:text-white line-clamp-3 leading-tight">
                  {article.title}
                </h3>
              </div>
            ))}
          </div>
          
          {/* رابط المزيد */}
          {blockArticles.length > 4 && (
            <div className="text-center mt-6">
              <button className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium text-sm transition-colors duration-200">
                عرض المزيد من أخبار {block.name} ←
              </button>
            </div>
          )}
        </div>
      );
    }

    return (
      <section className="mb-20">
        <div className="max-w-7xl mx-auto px-6">
          {/* عنوان البلوك */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-100 mb-6">
              <Sparkles className="w-5 h-5 text-blue-600" />
              <span className="font-semibold text-gray-700 dark:text-gray-300">
                {block.name}
              </span>
              <Brain className="w-5 h-5 text-purple-600" />
            </div>
            <p className="text-xl max-w-2xl mx-auto text-gray-600 dark:text-gray-400">
              {blockArticles.length} مقال مختار بعناية
            </p>
          </div>

          {/* رابط عرض الكل */}
          <div className="flex items-center justify-end mb-8">
            <Link 
              href={block.keyword ? `/search?q=${block.keyword}` : '/news'}
              className="group inline-flex items-center gap-2 px-6 py-2 rounded-full text-sm font-semibold text-white bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 transition-all duration-300 shadow-lg dark:shadow-gray-900/50 hover:shadow-xl hover:scale-105">
              <span>عرض الكل</span>
              <ArrowLeft className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* شبكة المقالات - نفس تصميم الصفحة الرئيسية */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {blockArticles.slice(0, 8).map((article) => (
              <NewsCard key={article.id} article={article} isPersonalized={true} />
            ))}
          </div>
        </div>
      </section>
    );
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-20">
        <div className="flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-sm text-gray-600 dark:text-gray-400">جاري تحميل البلوكات الذكية...</p>
          </div>
        </div>
      </div>
    );
  }

  if (blocks.length === 0) {
    return null;
  }

  return (
    <>
      {blocks.map(block => (
        <div key={block.id}>
          {renderBlockContent(block)}
        </div>
      ))}
    </>
  );
} 