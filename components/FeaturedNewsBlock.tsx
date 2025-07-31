'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Star, Clock, User, Eye, Heart, Share2, 
  CheckCircle2, Award, Calendar, ExternalLink,
  Sparkles, Headphones
} from 'lucide-react';
import CloudImage from '@/components/ui/CloudImage';
import { formatDateGregorian } from '@/lib/date-utils';
import { useDarkModeContext } from '@/contexts/DarkModeContext';

interface FeaturedArticle {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  featured_image: string;
  published_at: string;
  reading_time: number;
  views: number;
  likes: number;
  shares: number;
  category: {
    id: string;
    name: string;
    icon: string;
    color: string;
  } | null;
  author: {
    id: string;
    name: string;
    reporter: {
      id: string;
      full_name: string;
      slug: string;
      title: string;
      is_verified: boolean;
      verification_badge: string;
    } | null;
  } | null;
}

const FeaturedNewsBlock: React.FC = () => {
  const { darkMode } = useDarkModeContext();
  const [featuredArticle, setFeaturedArticle] = useState<FeaturedArticle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchFeaturedNews();
    
    // تم إلغاء التحديث التلقائي لتجنب إزعاج المستخدم
    // يمكن تفعيله مرة أخرى عند الحاجة بإلغاء التعليق
    // const interval = setInterval(fetchFeaturedNews, 30000);
    // return () => clearInterval(interval);
  }, []);

  const fetchFeaturedNews = async () => {
    try {
      setLoading(true);
      
      // إنشاء controller للتحكم في timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // timeout بعد 10 ثوان
      
      // إضافة معرف فريد لتجاوز التخزين المؤقت
      const timestamp = Date.now();
      const response = await fetch(`/api/featured-news?t=${timestamp}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        },
        next: { revalidate: 0 }, // إعادة التحقق في كل مرة
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      const data = await response.json();
      
      if (data.success && data.article) {
        setFeaturedArticle(data.article);
        setError(null); // مسح أي أخطاء سابقة
      } else {
        console.log('لا يوجد خبر مميز متاح:', data.message);
        setFeaturedArticle(null);
      }
    } catch (error: any) {
      console.error('خطأ في جلب الخبر المميز:', error);
      
      // التحقق إذا كان الخطأ بسبب timeout
      if (error.name === 'AbortError') {
        setError('انتهت مهلة الاتصال. جاري إعادة المحاولة...');
        // إعادة المحاولة بعد 3 ثوان
        setTimeout(fetchFeaturedNews, 3000);
      } else {
        setError('فشل في تحميل الخبر المميز');
      }
    } finally {
      setLoading(false);
    }
  };

  const getVerificationIcon = (badge: string) => {
    switch (badge) {
      case 'expert':
        return <Star className="w-4 h-4 text-amber-500" />;
      case 'senior':
        return <Award className="w-4 h-4 text-purple-500" />;
      default:
        return <CheckCircle2 className="w-4 h-4 text-blue-500" />;
    }
  };

  const getArticleLink = (article: FeaturedArticle) => {
    return `/article/${article.id}`;
  };

  // إذا كان هناك خطأ أو لا يوجد محتوى، لا نعرض شيئاً
  if (loading || error || !featuredArticle) {
    return null;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
      <Link 
        href={getArticleLink(featuredArticle)}
        className="group block"
      >
        {/* البلوك الرئيسي */}
        <div className={`relative overflow-hidden transition-all duration-500 group-hover:shadow-2xl ${
          darkMode 
            ? 'bg-gray-800/50 hover:bg-gray-800/70' 
            : 'bg-white/80 hover:bg-white'
        } backdrop-blur-sm rounded-3xl`}>
          
          {/* Grid Layout: 50% للصورة، 50% للنص */}
          <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[240px] lg:min-h-[280px]">
            
            {/* قسم الصورة - 6 أعمدة (50%) */}
            <div className="lg:col-span-6 relative overflow-hidden lg:rounded-r-2xl rounded-t-2xl lg:rounded-t-none">
              {/* الصورة */}
              <div className="relative w-full h-48 lg:h-full">
                <CloudImage
                  src={featuredArticle.featured_image}
                  alt={featuredArticle.title}
                  fill
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  fallbackType="article"
                  priority={true}
                />
                
                {/* تدرج لوني ناعم فوق الصورة */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent lg:bg-gradient-to-l lg:from-black/30 lg:via-transparent lg:to-transparent"></div>
                
                {/* شارة الخبر المميز - مكثفة */}
                <div className="absolute top-3 right-3">
                  <div className={`flex items-center gap-1 px-2 py-1 rounded-full ${
                    darkMode 
                      ? 'bg-gradient-to-r from-amber-600 to-amber-700 text-white'
                      : 'bg-gradient-to-r from-amber-500 to-amber-600 text-white'
                  } shadow-lg backdrop-blur-sm border border-amber-400/30`}>
                    <Sparkles className="w-3 h-3" />
                    <span className="font-bold text-xs">مميز</span>
                  </div>
                </div>
              </div>
            </div>

            {/* قسم النص - 6 أعمدة (50%) */}
            <div className="lg:col-span-6 p-4 lg:p-6 flex flex-col justify-center">
              {/* العنوان الرئيسي - مقصور على 2-3 سطور */}
              <h2 className={`text-xl lg:text-2xl xl:text-3xl font-bold mb-3 leading-tight line-clamp-3 transition-colors group-hover:text-blue-600 dark:group-hover:text-blue-400 ${
                darkMode ? 'text-white' : 'text-gray-900'
              }`}>
                {featuredArticle.title}
              </h2>

              {/* موجز الخبر - مكثف */}
              {featuredArticle.excerpt && (
                <p className={`text-sm lg:text-base mb-4 leading-relaxed line-clamp-2 ${
                  darkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  {featuredArticle.excerpt}
                </p>
              )}

              {/* معلومات المراسل والتصنيف - مكثفة */}
              <div className="mb-4 space-y-2">
                {/* المراسل */}
                {featuredArticle.author && (
                  <div className="flex items-center gap-2">
                    {featuredArticle.author.reporter ? (
                      <Link 
                        href={`/reporter/${featuredArticle.author.reporter.slug}`}
                        className="inline-flex items-center gap-1 text-sm hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <User className="w-3 h-3" />
                        <span className={`font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          {featuredArticle.author.reporter.full_name || featuredArticle.author.reporter.name || 'مراسل'}
                        </span>
                        {featuredArticle.author.reporter.is_verified && (
                          <div className="flex items-center">
                            {getVerificationIcon(featuredArticle.author.reporter.verification_badge)}
                          </div>
                        )}
                      </Link>
                    ) : (
                      <div className="flex items-center gap-1 text-sm">
                        <User className="w-3 h-3" />
                        <span className={`font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          {featuredArticle.author.name}
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {/* التصنيف */}
                {featuredArticle.category && (
                  <div className="flex items-center gap-1 text-sm">
                    <span className="text-base">{featuredArticle.category.icon}</span>
                    <span className={`font-medium ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                      {featuredArticle.category.name}
                    </span>
                  </div>
                )}
              </div>

              {/* أيقونات صفية مضغوطة */}
              <div className="flex items-center justify-between mb-4">
                {/* المعلومات الأساسية */}
                <div className="flex items-center gap-3 text-xs">
                  <div className="flex items-center gap-1">
                    <Calendar className={`w-3 h-3 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                    <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
                      {formatDateGregorian(featuredArticle.published_at)}
                    </span>
                  </div>
                  {featuredArticle.reading_time && (
                    <div className="flex items-center gap-1">
                      <Clock className={`w-3 h-3 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                      <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
                        {featuredArticle.reading_time} د
                      </span>
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    <Headphones className={`w-3 h-3 ${darkMode ? 'text-green-400' : 'text-green-500'}`} />
                    <span className={darkMode ? 'text-green-400' : 'text-green-600'}>
                      استمع
                    </span>
                  </div>
                </div>

                {/* إحصائيات التفاعل */}
                <div className="flex items-center gap-3 text-xs">
                  <div className="flex items-center gap-1">
                    <Eye className={`w-3 h-3 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                    <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
                      {featuredArticle.views > 1000 ? `${(featuredArticle.views / 1000).toFixed(1)}ك` : featuredArticle.views}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Heart className={`w-3 h-3 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                    <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
                      {featuredArticle.likes}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Share2 className={`w-3 h-3 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                    <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
                      {featuredArticle.shares}
                    </span>
                  </div>
                </div>
              </div>

              {/* زر "اقرأ المزيد" */}
              <div className="mt-auto flex justify-end items-end">
                <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all hover:translate-x-[-0.25rem] ${
                  darkMode 
                    ? 'bg-gray-700 hover:bg-gray-600 text-gray-200'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}>
                  <span>اقرأ المزيد</span>
                  <ExternalLink className="w-3 h-3" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default FeaturedNewsBlock;