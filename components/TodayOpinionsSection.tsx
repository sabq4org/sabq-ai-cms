'use client';

import Image from 'next/image'
import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  Play, 
  Heart, 
  Share2, 
  Volume2, 
  Eye, 
  Clock, 
  Calendar,
  ChevronLeft,
  ChevronRight,
  Star,
  Zap,
  Flame,
  User,
  MessageSquare,
  ArrowRight,
  Headphones
} from 'lucide-react';
import { generatePlaceholderImage, getValidImageUrl } from '@/lib/cloudinary';
import { getArticleLink } from '@/lib/utils';
import MobileOpinionCard from './mobile/MobileOpinionCard';

// أيقونات أندية الكتاب
const writerClubColors = {
  'platinum': 'from-gray-400 to-gray-600',
  'gold': 'from-yellow-400 to-yellow-600', 
  'silver': 'from-gray-300 to-gray-500',
  'bronze': 'from-orange-400 to-orange-600',
  'default': 'from-blue-400 to-blue-600'
};

const writerClubBorders = {
  'platinum': 'border-gray-400',
  'gold': 'border-yellow-400',
  'silver': 'border-gray-300', 
  'bronze': 'border-orange-400',
  'default': 'border-blue-400'
};

interface OpinionArticle {
  id: string;
  title: string;
  author_name: string;
  author_avatar?: string;
  author_club?: 'platinum' | 'gold' | 'silver' | 'bronze' | 'default';
  author_specialization?: string;
  excerpt: string;
  ai_summary?: string;
  featured_image?: string;
  published_at: string;
  reading_time?: number;
  views_count: number;
  likes_count: number;
  comments_count: number;
  is_featured?: boolean;
  is_trending?: boolean;
  author_slug?: string;
  audio_url?: string; // ملف صوتي للكاتب
}

interface TodayOpinionsSectionProps {
  darkMode?: boolean;
}

export default function TodayOpinionsSection({ darkMode = false }: TodayOpinionsSectionProps) {
  const [featuredWriters, setFeaturedWriters] = useState<OpinionArticle[]>([]);
  const [opinionArticles, setOpinionArticles] = useState<OpinionArticle[]>([]);
  const [currentWriterIndex, setCurrentWriterIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentPlayingId, setCurrentPlayingId] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  // تحديد نوع الجهاز
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // جلب البيانات
  useEffect(() => {
    const fetchOpinionData = async () => {
      try {
        setLoading(true);
        
        // جلب مقال قائد الرأي اليوم الحقيقي
        const opinionLeaderResponse = await fetch('/api/opinion/leaders');
        const opinionLeaderData = await opinionLeaderResponse.json();
        
        // جلب مقالات الرأي الحقيقية
        const articlesResponse = await fetch('/api/opinion-articles?limit=3&status=published');
        const articlesData = await articlesResponse.json();
        
        // جلب كتاب الرأي المميزين
        const authorsResponse = await fetch('/api/opinion-authors?isActive=true');
        const authorsData = await authorsResponse.json();

        // تحويل البيانات الحقيقية إلى الشكل المطلوب
        let allOpinionArticles: OpinionArticle[] = [];

        // إضافة مقال قائد الرأي اليوم إذا كان متوفرًا
        if (opinionLeaderData.success && opinionLeaderData.data) {
          const leader = opinionLeaderData.data;
          const leaderArticle: OpinionArticle = {
            id: leader.id,
            title: leader.title,
            author_name: leader.author?.name || 'كاتب غير محدد',
            author_avatar: leader.author?.avatar_url || 'https://ui-avatars.com/api/?name=K&background=0D8ABC&color=fff',
            author_club: 'platinum', // قائد الرأي دائماً بلاتيني
            author_specialization: leader.author?.specialty || 'كاتب رأي',
            excerpt: leader.excerpt || '',
            ai_summary: leader.excerpt || '',
            featured_image: leader.hero_image || 'https://images.unsplash.com/photo-1542281286-9e0a16bb7366?auto=format&fit=crop&w=800&q=80',
            published_at: leader.published_at || new Date().toISOString(),
            reading_time: leader.read_time || 5,
            views_count: leader.views || 0,
            likes_count: 0,
            comments_count: 0,
            is_featured: true,
            is_trending: true,
            author_slug: leader.slug || 'opinion-leader'
          };
          allOpinionArticles.push(leaderArticle);
        }

        // إضافة المقالات الحقيقية المتبقية من API
        if (articlesData.success && articlesData.articles) {
          const realArticles = articlesData.articles
            .filter((article: any) => !allOpinionArticles.find(existing => existing.id === article.id)) // تجنب التكرار
            .map((article: any) => ({
              id: article.id,
              title: article.title,
              author_name: article.article_author?.full_name || article.author?.name || 'كاتب مجهول',
              author_avatar: article.article_author?.avatar_url || article.author?.avatar || 'https://ui-avatars.com/api/?name=K&background=0D8ABC&color=fff',
              author_club: 'silver',
              author_specialization: article.article_author?.title || article.article_author?.specializations?.[0] || 'كاتب رأي',
              excerpt: article.excerpt || 'مقال رأي يستحق القراءة',
              ai_summary: article.ai_summary || article.summary || article.excerpt || 'مقال رأي متميز',
              featured_image: article.featured_image || 'https://images.unsplash.com/photo-1542281286-9e0a16bb7366?auto=format&fit=crop&w=800&q=80',
              published_at: article.published_at || new Date().toISOString(),
              reading_time: article.reading_time || 5,
              views_count: article.views || 0,
              likes_count: article.likes || 0,
              comments_count: article.comments_count || 0,
              is_featured: allOpinionArticles.length < 3,
              author_slug: article.article_author?.slug || article.author?.id || 'unknown'
            }));
          
          allOpinionArticles = [...allOpinionArticles, ...realArticles];
        }

        setOpinionArticles(allOpinionArticles);
        setFeaturedWriters(allOpinionArticles.filter(article => article.is_featured));
      } catch (error) {
        console.error('خطأ في جلب بيانات الرأي:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOpinionData();
  }, []);

  // تدوير الكتاب المميزين
  useEffect(() => {
    if (featuredWriters.length > 0) {
      const interval = setInterval(() => {
        setCurrentWriterIndex((prev) => (prev + 1) % featuredWriters.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [featuredWriters.length]);

  const handleTTSPlay = async (articleId: string, summary: string) => {
    if (currentPlayingId === articleId) {
      setIsPlaying(false);
      setCurrentPlayingId(null);
      // إيقاف التشغيل
      speechSynthesis.cancel();
      return;
    }

    setIsPlaying(true);
    setCurrentPlayingId(articleId);
    
    try {
      // استخدام Web Speech API للتجربة
      const utterance = new SpeechSynthesisUtterance(summary);
      utterance.lang = 'ar-SA';
      utterance.rate = 0.8;
      utterance.pitch = 1;
      
      utterance.onend = () => {
        setIsPlaying(false);
        setCurrentPlayingId(null);
      };
      
      speechSynthesis.speak(utterance);
    } catch (error) {
      console.error('خطأ في تشغيل الصوت:', error);
      setIsPlaying(false);
      setCurrentPlayingId(null);
    }
  };

  const handleLike = async (articleId: string) => {
    // منطق الإعجاب
    try {
      await fetch(`/api/articles/${articleId}/like`, { method: 'POST' });
      // تحديث حالة الإعجاب
    } catch (error) {
      console.error('خطأ في الإعجاب:', error);
    }
  };

  const handleShare = (article: OpinionArticle) => {
    if (navigator.share) {
      navigator.share({
        title: article.title,
        text: article.ai_summary || article.excerpt,
        url: `/opinion/${article.id}`
      });
    } else {
      // نسخ الرابط
      navigator.clipboard.writeText(`${window.location.origin}/opinion/${article.id}`);
      // إظهار رسالة نجاح
    }
  };

  if (loading) {
    return (
      <section className="mb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className={`h-8 ${darkMode ? 'bg-gray-700' : 'bg-gray-200'} rounded-lg mb-6 w-64`}></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className={`h-96 ${darkMode ? 'bg-gray-800' : 'bg-gray-100'} rounded-2xl`}></div>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="mb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header متحرك */}
        <div className="mb-12">
          {/* العنوان الرئيسي */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-gradient-to-r from-orange-50 to-red-50 border border-orange-100 mb-6 dark:bg-gradient-to-r dark:from-orange-900/20 dark:to-red-900/20 dark:border-orange-800/30">
              <Flame className="w-5 h-5 text-orange-600" />
              <span className={`font-semibold ${darkMode ? 'text-orange-300' : 'text-orange-700'}`}>
                رأي اليوم
              </span>
              <Zap className="w-5 h-5 text-red-600" />
            </div>
            <h2 className={`text-4xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
              🔥 قادة الرأي اليوم
            </h2>
            <p className={`text-lg max-w-3xl mx-auto ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              آراء مميزة من نخبة الكتاب والمفكرين السعوديين حول أبرز القضايا المعاصرة
            </p>
          </div>

          {/* شريط الكتاب المتحرك */}
          {featuredWriters.length > 0 && (
            <div className={`relative overflow-hidden rounded-2xl p-6 mb-8 ${
              darkMode 
                ? 'bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800 border border-gray-600' 
                : 'bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 border border-blue-100'
            }`}>
              <div className="flex items-center justify-between">
                {/* معلومات الكاتب الحالي */}
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="w-[120px] h-[120px] rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700">
                      <Image 
                        src={featuredWriters[currentWriterIndex]?.author_avatar || '/default-avatar.png'} 
                        alt={featuredWriters[currentWriterIndex]?.author_name || ''} 
                        width={120} 
                        height={120}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className={`absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-gradient-to-r ${
                      writerClubColors[featuredWriters[currentWriterIndex]?.author_club || 'default']
                    } flex items-center justify-center border-2 border-white dark:border-gray-800 shadow-lg`}>
                      <Star className="w-4 h-4 text-white" />
                    </div>
                  </div>
                  
                  <div>
                    <h3 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                      {featuredWriters[currentWriterIndex]?.author_name}
                    </h3>
                    <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      {featuredWriters[currentWriterIndex]?.author_specialization}
                    </p>
                    <div className="flex items-center gap-4 mt-2">
                      <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        📖 {featuredWriters[currentWriterIndex]?.reading_time} دقائق قراءة
                      </span>
                      <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        👁️ {featuredWriters[currentWriterIndex]?.views_count.toLocaleString()} مشاهدة
                      </span>
                    </div>
                  </div>
                </div>

                {/* أيقونات التفاعل */}
                <div className={`flex items-center gap-1 sm:gap-3 ${isMobile ? 'flex-col' : ''}`}>
                  <button 
                    onClick={() => handleLike(featuredWriters[currentWriterIndex]?.id)}
                    className={`flex items-center gap-1 sm:gap-2 ${
                      isMobile ? 'px-3 py-1.5' : 'px-4 py-2'
                    } rounded-xl transition-all hover:scale-105 ${
                      darkMode 
                        ? 'bg-gray-700 hover:bg-red-900/20 text-gray-300 hover:text-red-400' 
                        : 'bg-white hover:bg-red-50 text-gray-600 hover:text-red-600'
                    } shadow-lg`}
                  >
                    <Heart className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span className={`${isMobile ? 'text-xs' : 'text-sm'} font-medium`}>
                      {featuredWriters[currentWriterIndex]?.likes_count}
                    </span>
                  </button>
                  
                  <button 
                    onClick={() => handleShare(featuredWriters[currentWriterIndex])}
                    className={`flex items-center gap-1 sm:gap-2 ${
                      isMobile ? 'px-3 py-1.5' : 'px-4 py-2'
                    } rounded-xl transition-all hover:scale-105 ${
                      darkMode 
                        ? 'bg-gray-700 hover:bg-blue-900/20 text-gray-300 hover:text-blue-400' 
                        : 'bg-white hover:bg-blue-50 text-gray-600 hover:text-blue-600'
                    } shadow-lg`}
                  >
                    <Share2 className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span className={`${isMobile ? 'text-xs hidden' : 'text-sm'} font-medium`}>مشاركة</span>
                  </button>
                  
                  <button 
                    onClick={() => handleTTSPlay(
                      featuredWriters[currentWriterIndex]?.id, 
                      featuredWriters[currentWriterIndex]?.ai_summary || featuredWriters[currentWriterIndex]?.excerpt
                    )}
                    className={`flex items-center gap-1 sm:gap-2 ${
                      isMobile ? 'px-3 py-1.5' : 'px-4 py-2'
                    } rounded-xl transition-all hover:scale-105 ${
                      currentPlayingId === featuredWriters[currentWriterIndex]?.id
                        ? 'bg-green-500 text-white'
                        : darkMode 
                          ? 'bg-gray-700 hover:bg-green-900/20 text-gray-300 hover:text-green-400' 
                          : 'bg-white hover:bg-green-50 text-gray-600 hover:text-green-600'
                    } shadow-lg`}
                  >
                    {currentPlayingId === featuredWriters[currentWriterIndex]?.id ? (
                      <Volume2 className="w-3 h-3 sm:w-4 sm:h-4 animate-pulse" />
                    ) : (
                      <Headphones className="w-3 h-3 sm:w-4 sm:h-4" />
                    )}
                    <span className={`${isMobile ? 'text-xs hidden' : 'text-sm'} font-medium`}>استمع</span>
                  </button>
                </div>
              </div>

              {/* شريط التقدم */}
              <div className="mt-4 w-full bg-gray-200 dark:bg-gray-600 rounded-full h-1">
                <div 
                  className="h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-1000"
                  style={{ width: `${((currentWriterIndex + 1) / featuredWriters.length) * 100}%` }}
                ></div>
              </div>

              {/* نقاط التنقل */}
              <div className="flex justify-center mt-4 gap-2">
                {featuredWriters.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentWriterIndex(index)}
                    className={`w-2 h-2 rounded-full transition-all ${
                      index === currentWriterIndex 
                        ? 'bg-blue-500 w-8' 
                        : darkMode ? 'bg-gray-600' : 'bg-gray-300'
                    }`}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* بطاقات الآراء المُضغوطة والأنيقة */}
        {isMobile ? (
          // عرض الموبايل - قائمة عمودية
          <div className="space-y-3">
            {opinionArticles.slice(0, 5).map((article) => (
              <MobileOpinionCard 
                key={article.id} 
                article={article} 
                darkMode={darkMode} 
              />
            ))}
          </div>
        ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 lg:gap-6">
          {opinionArticles.slice(0, 5).map((article) => (
            <div 
              key={article.id}
              className={`group relative rounded-2xl overflow-hidden shadow-lg dark:shadow-gray-900/50 transition-all duration-300 transform hover:scale-105 hover:shadow-xl ${
                darkMode 
                  ? 'bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700' 
                  : 'bg-gradient-to-br from-white to-gray-50 border border-gray-200'
              }`}
            >
              {/* شارات المقال - في الزاوية العلوية اليمنى بحجم أصغر */}
              <div className="absolute top-2 right-2 z-10 flex gap-1">
                {article.is_trending && (
                  <span className="w-6 h-6 flex items-center justify-center bg-red-500/20 backdrop-blur-sm rounded-full">
                    <span className="text-xs">🔥</span>
                  </span>
                )}
                {article.is_featured && (
                  <span className="w-6 h-6 flex items-center justify-center bg-yellow-500/20 backdrop-blur-sm rounded-full">
                    <span className="text-xs">⭐</span>
                  </span>
                )}
              </div>

              {/* المحتوى الرئيسي - بدون صورة كبيرة */}
              <div className="p-4">
                {/* 1. صورة الكاتب (avatar دائرية صغيرة) */}
                <div className="flex items-start gap-3 mb-3">
                  <Link href={`/author/${article.author_slug || article.id || 'unknown-author'}`} className="flex-shrink-0">
                    <div className="relative">
                      <div className="w-14 h-14 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 ring-2 ring-white dark:ring-gray-800 shadow-lg">
                        <Image 
                          src={article.author_avatar || '/default-avatar.png'} 
                          alt={article.author_name}
                          width={56}
                          height={56}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-gradient-to-r ${
                        writerClubColors[article.author_club || 'default']
                      } flex items-center justify-center border border-white dark:border-gray-800`}>
                        <Star className="w-1.5 h-1.5 text-white" />
                      </div>
                    </div>
                  </Link>
                  
                  <div className="flex-1 min-w-0">
                    {/* 2. اسم الكاتب (سطر واحد فقط) */}
                    <Link href={`/author/${article.author_slug || article.id || 'unknown-author'}`}>
                      <h4 className={`font-bold text-sm truncate hover:text-blue-600 transition-colors ${
                        darkMode ? 'text-white' : 'text-gray-800'
                      }`}>
                        {article.author_name}
                      </h4>
                    </Link>
                    {/* 3. صفة الكاتب */}
                    <p className={`text-xs truncate ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      {article.author_specialization}
                    </p>
                  </div>
                </div>

                {/* 4. عنوان المقال (2 سطر max) */}
                <Link href={getArticleLink(article)}>
                  <h3 className={`font-bold text-sm mb-2 line-clamp-2 leading-snug group-hover:text-blue-600 transition-colors ${
                    darkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    {article.title}
                  </h3>
                </Link>

                {/* 5. الملخص */}
                <p className={`text-xs leading-relaxed line-clamp-3 mb-3 ${
                  darkMode ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  {article.ai_summary || article.excerpt}
                </p>

                {/* 6. أزرار التفاعل والتفاصيل */}
                <div className="space-y-3">
                  {/* زر التفاصيل - كرابط نصي أنيق */}
                  <Link 
                    href={getArticleLink(article)}
                    className={`inline-flex items-center gap-1 text-xs font-medium transition-colors ${
                      darkMode 
                        ? 'text-blue-400 hover:text-blue-300' 
                        : 'text-blue-600 hover:text-blue-700'
                    }`}
                  >
                    <span>قراءة المزيد</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>

                  {/* أزرار التفاعل */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <button 
                        onClick={() => handleTTSPlay(article.id, article.ai_summary || article.excerpt)}
                        className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs transition-all hover:scale-105 ${
                          currentPlayingId === article.id
                            ? 'bg-green-500 text-white'
                            : darkMode 
                              ? 'bg-gray-700/50 hover:bg-green-900/20 text-gray-300 hover:text-green-400' 
                              : 'bg-gray-100 hover:bg-green-50 text-gray-600 hover:text-green-600'
                        }`}
                      >
                        {currentPlayingId === article.id ? (
                          <Volume2 className="w-3 h-3 animate-pulse" />
                        ) : (
                          <Headphones className="w-3 h-3" />
                        )}
                      </button>

                      <button 
                        onClick={() => handleLike(article.id)}
                        className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs transition-all hover:scale-105 ${
                          darkMode 
                            ? 'hover:bg-red-900/20 text-gray-400 hover:text-red-400' 
                            : 'hover:bg-red-50 text-gray-500 hover:text-red-600'
                        }`}
                      >
                        <Heart className="w-3 h-3" />
                        <span>{article.likes_count}</span>
                      </button>

                      <button 
                        onClick={() => handleShare(article)}
                        className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs transition-all hover:scale-105 ${
                          darkMode 
                            ? 'hover:bg-blue-900/20 text-gray-400 hover:text-blue-400' 
                            : 'hover:bg-blue-50 text-gray-500 hover:text-blue-600'
                        }`}
                      >
                        <Share2 className="w-3 h-3" />
                      </button>
                    </div>

                    {/* معلومات إضافية */}
                    <div className="flex items-center gap-2 text-xs">
                      <span className={`flex items-center gap-0.5 ${
                        darkMode ? 'text-gray-400' : 'text-gray-500'
                      }`}>
                        <Clock className="w-3 h-3" />
                        {article.reading_time}د
                      </span>
                      <span className={`flex items-center gap-0.5 ${
                        darkMode ? 'text-gray-400' : 'text-gray-500'
                      }`}>
                        <Eye className="w-3 h-3" />
                        {article.views_count > 1000 ? `${(article.views_count / 1000).toFixed(1)}ك` : article.views_count}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        )}

        {/* رابط عرض المزيد */}
        <div className="text-center mt-12">
          <Link 
            href="/opinion"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl font-semibold text-base transition-all duration-300 transform hover:scale-105 shadow-lg"
          >
            <span>استكشف جميع آراء اليوم</span>
            <ChevronLeft className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}