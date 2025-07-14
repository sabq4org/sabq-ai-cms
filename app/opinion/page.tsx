'use client';

import Image from 'next/image';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { getArticleLink } from '@/lib/utils';
import { formatDateOnly } from '@/lib/date-utils';
import { generatePlaceholderImage, getValidImageUrl } from '@/lib/cloudinary';
import CloudImage from '@/components/ui/CloudImage';
import Header from '@/components/Header';
import { useDarkModeContext } from '@/contexts/DarkModeContext';
import { 
  Search, Filter, ChevronLeft, ChevronRight, Sparkles, 
  TrendingUp, Calendar, User, Eye, Heart, MessageCircle, 
  Share2, Volume2, Zap, Podcast, Flame, Star, Award,
  Mic, BookOpen, Timer, BarChart3, Crown, Headphones,
  PlayCircle, PauseCircle, ChevronDown, Brain, Quote,
  ThumbsUp, ThumbsDown, X, Plus, HeartHandshake,
  CheckCircle, Radio, Activity, Clock, Tag, ArrowLeft,
  Newspaper, ArrowRight, Users
} from 'lucide-react';
interface OpinionArticle {
  id: string;
  title: string;
  excerpt?: string;
  content?: string;
  featured_image?: string;
  category_id?: number;
  category_name?: string;
  author_name?: string;
  author_id?: string;
  author_avatar?: string;
  author_bio?: string;
  author_specialization?: string;
  author_followers?: number;
  views_count: number;
  likes_count?: number;
  comments_count?: number;
  shares_count?: number;
  reading_time?: number;
  created_at: string;
  published_at?: string;
  is_trending?: boolean;
  is_featured?: boolean;
  type?: string;
  ai_summary?: string;
  ai_keywords?: string[];
  engagement_score?: number;
  topic_tags?: string[];
  audio_url?: string;
  podcast_duration?: number;
  sentiment?: 'positive' | 'negative' | 'neutral' | 'mixed';
  agree_count?: number;
  disagree_count?: number;
}
interface OpinionAuthor {
  id: string;
  name: string;
  avatar?: string;
  bio?: string;
  specialization?: string;
  followers_count?: number;
  articles_count?: number;
  total_views?: number;
  rating?: number;
  badge?: 'gold' | 'silver' | 'bronze' | null;
  social_links?: {
    twitter?: string;
    linkedin?: string;
    website?: string;
  };
  is_featured?: boolean;
  latest_article?: OpinionArticle;
}
interface FilterOptions {
  author: string;
  mood: 'all' | 'optimistic' | 'critical' | 'analytical' | 'controversial';
  topic: string;
  dateRange: 'all' | 'today' | 'week' | 'month';
  format: 'all' | 'article' | 'podcast' | 'video';
  sortBy: 'latest' | 'popular' | 'trending' | 'controversial';
}
export default function OpinionPage() {
  // الحالات الأساسية
  const [articles, setArticles] = useState<OpinionArticle[]>([]);
  const [authors, setAuthors] = useState<OpinionAuthor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const { darkMode } = useDarkModeContext();
  
  // إعدادات العرض والفلترة
  const [filters, setFilters] = useState<FilterOptions>({
    author: 'all',
    mood: 'all',
    topic: 'all',
    dateRange: 'all',
    format: 'all',
    sortBy: 'latest'
  });
  const [showFilters, setShowFilters] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [selectedAuthor, setSelectedAuthor] = useState<string | null>(null);
  
  // ميزات AI والتفاعل
  const [currentPlayingId, setCurrentPlayingId] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [aiRecommendations, setAiRecommendations] = useState<OpinionArticle[]>([]);
  const [topTrends, setTopTrends] = useState<string[]>([]);
  const [userMood, setUserMood] = useState<string>('neutral');
  
  // المراجع
  const authorsCarouselRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);
  
  // جلب البيانات الأولية
  useEffect(() => {
    fetchInitialData();
  }, []);
  
  // جلب المقالات عند تغيير الفلاتر
  useEffect(() => {
    fetchArticles();
  }, [filters, searchQuery, selectedAuthor]);
  
  // تحديث أسهم التنقل للكاروسيل
  useEffect(() => {
    const checkScrollButtons = () => {
      if (authorsCarouselRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = authorsCarouselRef.current;
        setShowLeftArrow(scrollLeft > 0);
        setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
      }
    };
    const carousel = authorsCarouselRef.current;
    carousel?.addEventListener('scroll', checkScrollButtons);
    checkScrollButtons();
    return () => {
      carousel?.removeEventListener('scroll', checkScrollButtons);
    };
  }, [authors]);
  const fetchInitialData = async () => {
    try {
      setLoading(true);
      // جلب البيانات بالتوازي
      const [articlesRes, authorsRes, trendsRes, recommendationsRes] = await Promise.all([
        fetch('/api/articles?type=OPINION&status=published&limit=20'),
        fetch('/api/opinion-authors?isActive=true&featured=true'),
        fetch('/api/analytics/trending-topics?type=opinion').catch(() => null),
        fetch('/api/ai/recommendations?type=opinion').catch(() => null)
      ]);
      // معالجة المقالات
      const articlesData = await articlesRes.json();
      const articlesList = Array.isArray(articlesData) ? articlesData : articlesData.articles || [];
      setArticles(articlesList);
      // معالجة الكتاب
      if (authorsRes.ok) {
        const authorsData = await authorsRes.json();
        setAuthors(Array.isArray(authorsData) ? authorsData : authorsData.authors || []);
      }
      // معالجة المواضيع الرائجة
      if (trendsRes?.ok) {
        const trendsData = await trendsRes.json();
        setTopTrends(trendsData.topics || []);
      }
      // معالجة التوصيات
      if (recommendationsRes?.ok) {
        const recommendationsData = await recommendationsRes.json();
        setAiRecommendations(recommendationsData.articles || []);
      }
    } catch (error) {
      console.error('خطأ في جلب البيانات:', error);
    } finally {
      setLoading(false);
    }
  };
  const fetchArticles = async () => {
    try {
      setLoading(true);
      // بناء URL مع الفلاتر
      let url = `/api/articles?type=OPINION&status=published&limit=20`;
      if (selectedAuthor) url += `&author_id=${selectedAuthor}`;
      if (filters.topic !== 'all') url += `&tag=${filters.topic}`;
      if (searchQuery) url += `&search=${encodeURIComponent(searchQuery)}`;
      // ترتيب النتائج
      switch (filters.sortBy) {
        case 'popular':
          url += '&sortBy=views_count&order=desc';
          break;
        case 'trending':
          url += '&sortBy=engagement_score&order=desc';
          break;
        case 'controversial':
          url += '&sortBy=comments_count&order=desc';
          break;
        default:
          url += '&sortBy=published_at&order=desc';
      }
      // فلترة التاريخ
      if (filters.dateRange !== 'all') {
        const now = new Date();
        let startDate = new Date();
        switch (filters.dateRange) {
          case 'today':
            startDate.setHours(0, 0, 0, 0);
            break;
          case 'week':
            startDate.setDate(now.getDate() - 7);
            break;
          case 'month':
            startDate.setMonth(now.getMonth() - 1);
            break;
        }
        url += `&from_date=${startDate.toISOString()}`;
      }
      const response = await fetch(url);
      const data = await response.json();
      const newArticles = Array.isArray(data) ? data : data.articles || [];
      setArticles(newArticles);
    } catch (error) {
      console.error('خطأ في جلب المقالات:', error);
    } finally {
      setLoading(false);
    }
  };
  // التنقل في كاروسيل الكتاب
  const scrollAuthors = (direction: 'left' | 'right') => {
    if (authorsCarouselRef.current) {
      const scrollAmount = 300;
      authorsCarouselRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };
  // تشغيل الملخص الصوتي
  const handleAudioPlay = async (articleId: string, audioUrl?: string, text?: string) => {
    if (currentPlayingId === articleId) {
      setIsPlaying(false);
      setCurrentPlayingId(null);
      if (!audioUrl) speechSynthesis.cancel();
      return;
    }
    setIsPlaying(true);
    setCurrentPlayingId(articleId);
    if (audioUrl) {
      // تشغيل ملف صوتي إذا كان متوفراً
      const audio = new Audio(audioUrl);
      audio.play();
      audio.onended = () => {
        setIsPlaying(false);
        setCurrentPlayingId(null);
      };
    } else if (text) {
      // استخدام TTS إذا لم يكن هناك ملف صوتي
      try {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'ar-SA';
        utterance.rate = 0.9;
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
    }
  };
  // تحديث الفلتر
  const updateFilter = (key: keyof FilterOptions, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };
  // حساب نسبة التوافق مع اهتمامات المستخدم
  const getRelevanceScore = (article: OpinionArticle): number => {
    // نسبة وهمية للعرض - يمكن استبدالها بخوارزمية حقيقية
    return Math.floor(Math.random() * 30) + 70;
  };
  // مكون بطاقة المقال - يتبع نفس تصميم NewsCard في الصفحة الرئيسية
  const OpinionCard = ({ article }: { article: OpinionArticle }) => {
    const [imageLoading, setImageLoading] = useState(true);
    
    return (
      <Link href={getArticleLink(article)} className="group block">
        <article className={`h-full rounded-3xl overflow-hidden shadow-xl dark:shadow-gray-900/50 transition-all duration-300 transform ${
          darkMode 
            ? 'bg-gray-800 border border-gray-700' 
            : 'bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700'
        }`}>
          {/* صورة المقال */}
          <div className="relative h-40 sm:h-48 overflow-hidden">
            <CloudImage
              src={article.featured_image}
              alt={article.title || 'صورة المقال'}
              fill
              className="w-full h-full object-cover transition-transform duration-500"
              fallbackType="article"
              priority={false}
            />
            {/* Category Badge */}
            <div className="absolute top-2 right-2 sm:top-3 sm:right-3">
              <span className={`inline-flex items-center gap-1 px-2 py-1 sm:px-3 sm:py-1 rounded-full text-xs font-bold ${darkMode ? 'bg-blue-900/80 text-blue-200 backdrop-blur-sm' : 'bg-blue-500/90 text-white backdrop-blur-sm'}`}>
                <Quote className="w-2 h-2 sm:w-3 sm:h-3" />
                رأي
              </span>
            </div>
            {/* بودكاست Badge إن وجد */}
            {(article.audio_url || article.podcast_duration) && (
              <div className="absolute top-2 left-2 sm:top-3 sm:left-3">
                <span className={`inline-flex items-center gap-1 px-2 py-1 sm:px-3 sm:py-1 rounded-full text-xs font-bold ${darkMode ? 'bg-gray-900/80 text-gray-200 backdrop-blur-sm' : 'bg-gray-800/90 text-white backdrop-blur-sm'}`}>
                  <Headphones className="w-2 h-2 sm:w-3 sm:h-3" />
                  صوتي
                </span>
              </div>
            )}
          </div>
          {/* محتوى البطاقة */}
          <div className="p-4 sm:p-5">
            {/* معلومات الكاتب */}
            <div className="flex items-center gap-3 mb-3">
              <div className="relative">
                <CloudImage
                  src={article.author_avatar}
                  alt={article.author_name || ''}
                  width={32}
                  height={32}
                  className="rounded-full"
                  fallbackType="author"
                />
              </div>
              <div className="flex-1">
                <p className={`font-medium text-sm ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {article.author_name}
                </p>
                <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  {article.author_specialization || 'كاتب رأي'}
                </p>
              </div>
            </div>
            
            {/* العنوان */}
            <h4 className={`font-bold text-base sm:text-lg mb-3 line-clamp-2 ${
              darkMode 
                ? 'text-white' 
                : 'text-gray-900 dark:text-white'
            } transition-colors`} title={article.title}>
              {article.title}
            </h4>
            
            {/* الملخص */}
            {article.ai_summary && (
              <p className={`text-sm mb-4 line-clamp-2 transition-colors duration-300 text-gray-600 dark:text-gray-400`}>
                {article.ai_summary}
              </p>
            )}
            
            {/* التفاعلات */}
            <div className="flex items-center gap-4 mb-3">
              <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                <ThumbsUp className="w-3 h-3" />
                <span>{article.agree_count || 0}</span>
              </div>
              <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                <ThumbsDown className="w-3 h-3" />
                <span>{article.disagree_count || 0}</span>
              </div>
              <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                <MessageCircle className="w-3 h-3" />
                <span>{article.comments_count || 0}</span>
              </div>
            </div>
            
            {/* التفاصيل السفلية */}
            <div className={`flex items-center justify-between pt-3 sm:pt-4 border-t ${darkMode ? 'border-gray-700' : 'border-gray-100 dark:border-gray-700'}`}>
              {/* المعلومات */}
              <div className="flex items-center gap-2 sm:gap-3 text-xs">
                <div className="text-sm text-gray-500 flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  {new Date(article.published_at || article.created_at).toLocaleDateString('ar-SA', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                    calendar: 'gregory',
                    numberingSystem: 'latn'
                  })}
                </div>
                {article.reading_time && (
                  <span className={`flex items-center gap-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    <Clock className="w-3 h-3" />
                    {article.reading_time} د
                  </span>
                )}
              </div>
              {/* زر القراءة */}
              <div className={`p-2 rounded-xl transition-all ${darkMode ? 'bg-blue-900/20' : 'bg-blue-50 dark:bg-blue-900/20'}`}>
                <ArrowLeft className={`w-4 h-4 transition-transform ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
              </div>
            </div>
          </div>
        </article>
      </Link>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <Header />
      
      {/* Hero Section - نفس تصميم الصفحة الرئيسية */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-100 mb-6 dark:from-blue-900/20 dark:to-purple-900/20 dark:border-blue-800/30">
            <BookOpen className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <span className={`font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              منصة متقدمة
            </span>
            <Quote className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          </div>
          <h1 className={`text-4xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
            قادة الرأي
          </h1>
          <p className={`text-xl max-w-2xl mx-auto ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            آراء وتحليلات من أبرز الكتّاب وصنّاع الفكر
          </p>
        </div>
      </section>

      {/* شريط التصنيفات - نفس تصميم الصفحة الرئيسية */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 mb-8">
        <div className={`rounded-3xl p-4 sm:p-6 lg:p-8 transition-all duration-500 shadow-lg dark:shadow-gray-900/50 ${darkMode ? 'bg-blue-900/10 border border-blue-800/30' : 'bg-blue-50 border border-blue-200/50'}`}>
          <div className="text-center mb-6">
            <h2 className={`text-xl sm:text-2xl font-bold mb-3 transition-colors duration-300 ${
              darkMode ? 'text-white' : 'text-gray-800 dark:text-gray-100'
            }`}>
              استكشف حسب الكاتب
            </h2>
            <p className={`text-sm transition-colors duration-300 ${
              darkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>
              اختر الكاتب المفضل لديك لقراءة آرائه وتحليلاته
            </p>
          </div>
          
          {/* عرض الكتّاب بشكل أفقي مع إمكانية التمرير */}
          <div className="relative">
            <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-2">
              {/* زر "جميع الكتّاب" */}
              <button
                onClick={() => setSelectedAuthor(null)}
                className={`flex-shrink-0 text-center transition-all duration-300 transform hover:scale-105 ${
                  !selectedAuthor 
                    ? 'scale-105' 
                    : ''
                }`}
              >
                <div className={`w-20 h-20 sm:w-24 sm:h-24 rounded-full flex items-center justify-center mb-2 transition-all border-2 ${
                  !selectedAuthor 
                    ? 'border-blue-500 ring-4 ring-blue-400/50' 
                    : darkMode 
                      ? 'border-gray-600 hover:border-gray-500' 
                      : 'border-gray-300 hover:border-gray-400'
                }`}>
                  <Users className={`w-8 h-8 sm:w-10 sm:h-10 ${
                    !selectedAuthor 
                      ? darkMode 
                        ? 'text-blue-400' 
                        : 'text-blue-600'
                      : darkMode 
                        ? 'text-gray-400' 
                        : 'text-gray-600'
                  }`} />
                </div>
                <p className={`text-xs sm:text-sm font-medium ${
                  !selectedAuthor 
                    ? darkMode 
                      ? 'text-blue-300' 
                      : 'text-blue-700'
                    : darkMode 
                      ? 'text-gray-300' 
                      : 'text-gray-700'
                }`}>
                  جميع الكتّاب
                </p>
              </button>
              
              {/* عرض الكتّاب */}
              {authors.map((author) => (
                <button
                  key={author.id}
                  onClick={() => setSelectedAuthor(author.id)}
                  className={`flex-shrink-0 text-center transition-all duration-300 transform hover:scale-105 bg-transparent ${
                    selectedAuthor === author.id 
                      ? 'scale-105' 
                      : ''
                  }`}
                >
                  <div className={`relative w-16 h-16 sm:w-20 sm:h-20 mb-2 bg-transparent ${
                    selectedAuthor === author.id 
                      ? 'ring-4 ring-blue-400/50 dark:ring-blue-300/50' 
                      : ''
                  }`}>
                    <CloudImage
                      src={author.avatar}
                      alt={author.name}
                      width={64}
                      height={64}
                      className={`w-full h-full rounded-full object-cover transition-all ${
                        selectedAuthor === author.id 
                          ? 'border-3 border-blue-500' 
                          : 'border-2 border-gray-200 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-600'
                      }`}
                      fallbackType="author"
                    />
                    {/* شارة عدد المقالات */}
                    <div className={`absolute -bottom-1 -right-1 px-2 py-0.5 rounded-full text-xs font-bold ${
                      selectedAuthor === author.id
                        ? 'bg-blue-500 text-white'
                        : darkMode 
                          ? 'bg-gray-800 text-gray-200 border border-gray-700' 
                          : 'bg-white text-gray-700 border border-gray-200'
                    } shadow-sm`}>
                      {author.articles_count || 0}
                    </div>
                    {/* شارة التميز إن وجدت */}
                    {author.is_featured && (
                      <div className="absolute -top-1 -left-1">
                        <div className="relative">
                          <Star className={`w-5 h-5 ${
                            darkMode 
                              ? 'text-yellow-400' 
                              : 'text-yellow-500'
                          } fill-current`} />
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="bg-transparent">
                    <p className={`text-xs sm:text-sm font-medium line-clamp-2 px-1 ${
                      selectedAuthor === author.id 
                        ? darkMode 
                          ? 'text-blue-300' 
                          : 'text-blue-700'
                        : darkMode 
                          ? 'text-gray-300' 
                          : 'text-gray-700'
                    }`}>
                      {author.name}
                    </p>
                    {author.specialization && (
                      <p className={`text-xs mt-0.5 line-clamp-1 px-1 ${
                        selectedAuthor === author.id
                          ? darkMode 
                            ? 'text-blue-400/70' 
                            : 'text-blue-600/70'
                          : darkMode 
                            ? 'text-gray-500' 
                            : 'text-gray-500'
                      }`}>
                        {author.specialization}
                      </p>
                    )}
                    {/* عدد المشاهدات */}
                    {author.total_views && (
                      <div className={`flex items-center justify-center gap-1 mt-1 text-xs ${
                        darkMode 
                          ? 'text-gray-500' 
                          : 'text-gray-400'
                      }`}>
                        <Eye className="w-3 h-3" />
                        <span>{author.total_views > 1000 ? `${(author.total_views / 1000).toFixed(1)}k` : author.total_views}</span>
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
            
            {/* أسهم التمرير للموبايل */}
            {authors.length > 5 && (
              <>
                <div className="absolute left-0 top-1/3 -translate-y-1/2 bg-gradient-to-r from-white dark:from-gray-900 to-transparent w-12 h-20 pointer-events-none md:hidden" />
                <div className="absolute right-0 top-1/3 -translate-y-1/2 bg-gradient-to-l from-white dark:from-gray-900 to-transparent w-12 h-20 pointer-events-none md:hidden" />
              </>
            )}
          </div>
        </div>
      </section>

      {/* المحتوى الرئيسي */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* قائمة المقالات - العمود الرئيسي */}
          <div className="lg:col-span-3">
            {/* عرض معلومات الكاتب المختار */}
            {selectedAuthor && (
              <div className="mb-6">
                {(() => {
                  const author = authors.find(a => a.id === selectedAuthor);
                  if (!author) return null;
                  return (
                    <div className={`rounded-3xl p-6 shadow-lg dark:shadow-gray-900/50 border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
                      <div className="flex items-center gap-4">
                        <CloudImage
                          src={author.avatar}
                          alt={author.name}
                          width={64}
                          height={64}
                          className="rounded-full"
                          fallbackType="author"
                        />
                        <div className="flex-1">
                          <h3 className={`text-2xl font-bold mb-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                            {author.name}
                          </h3>
                          {author.specialization && (
                            <p className={`text-sm mb-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                              {author.specialization}
                            </p>
                          )}
                          {author.bio && (
                            <p className={`text-sm line-clamp-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                              {author.bio}
                            </p>
                          )}
                          <div className="flex items-center gap-4 mt-3 text-sm">
                            <div className={`flex items-center gap-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                              <Newspaper className="w-4 h-4" />
                              <span>{author.articles_count || 0} مقال</span>
                            </div>
                            <div className={`flex items-center gap-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                              <Eye className="w-4 h-4" />
                              <span>{author.total_views?.toLocaleString() || 0} مشاهدة</span>
                            </div>
                            {author.followers_count && (
                              <div className={`flex items-center gap-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                <Users className="w-4 h-4" />
                                <span>{author.followers_count} متابع</span>
                              </div>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={() => setSelectedAuthor(null)}
                          className={`p-2 rounded-xl transition-colors ${
                            darkMode 
                              ? 'hover:bg-gray-700' 
                              : 'hover:bg-gray-100'
                          }`}
                        >
                          <X className={`w-5 h-5 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`} />
                        </button>
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}
            
            {/* توصية اليوم */}
            {aiRecommendations.length > 0 && (
              <div className="mb-8">
                <div className="text-center mb-6">
                  <h3 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                    مقال اليوم المقترح لك
                  </h3>
                </div>
                <OpinionCard article={aiRecommendations[0]} />
              </div>
            )}
            
            {/* قائمة المقالات */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {articles.map((article) => (
                <OpinionCard key={article.id} article={article} />
              ))}
            </div>
            
            {articles.length === 0 && (
              <div className={`text-center py-20 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                <Quote className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className="text-xl mb-2">لا توجد مقالات رأي حالياً</p>
                <p className="text-sm">تحقق لاحقاً للحصول على آخر الآراء والتحليلات</p>
              </div>
            )}
          </div>
          
          {/* الشريط الجانبي */}
          <div className="space-y-6">
            {/* أفضل 5 كتّاب الأسبوع */}
            <div className={`rounded-3xl p-6 shadow-lg dark:shadow-gray-900/50 border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
              <h3 className={`text-lg font-bold mb-4 flex items-center gap-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                <Award className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                أفضل كتّاب الأسبوع
              </h3>
              <div className="space-y-3">
                {authors.slice(0, 5).map((author, index) => (
                  <Link
                    key={author.id}
                    href={`/author/${author.id}`}
                    className={`flex items-center gap-3 p-3 rounded-xl transition-colors group ${
                      darkMode 
                        ? 'hover:bg-gray-700/50' 
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    <span className={`text-lg font-bold ${
                      index === 0 ? 'text-blue-600 dark:text-blue-400' :
                      index === 1 ? 'text-gray-500' :
                      index === 2 ? 'text-gray-400' :
                      'text-gray-400'
                    }`}>
                      {index + 1}
                    </span>
                    <CloudImage
                      src={author.avatar}
                      alt={author.name}
                      width={40}
                      height={40}
                      className="rounded-full"
                      fallbackType="author"
                    />
                    <div className="flex-1">
                      <p className={`font-medium text-sm ${darkMode ? 'text-white' : 'text-gray-900'} group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors`}>
                        {author.name}
                      </p>
                      <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        {author.articles_count || 0} مقال • {author.total_views?.toLocaleString() || 0} مشاهدة
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
            
            {/* إحصائيات القسم */}
            <div className={`rounded-3xl p-6 shadow-lg dark:shadow-gray-900/50 border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
              <h3 className={`text-lg font-bold mb-4 flex items-center gap-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                <BarChart3 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                إحصائيات القسم
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>عدد المقالات</span>
                  <span className={`font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{articles.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>عدد الكتّاب</span>
                  <span className={`font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{authors.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>متوسط القراءة</span>
                  <span className={`font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>5 دقائق</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>نسبة التفاعل</span>
                  <span className="font-bold text-blue-600 dark:text-blue-400">87%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}