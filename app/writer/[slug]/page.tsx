'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { 
  User, MapPin, Calendar, ExternalLink, Eye, Heart, 
  BookOpen, Award, Star, MessageSquare, Clock,
  Twitter, Linkedin, Globe, Mail, CheckCircle2,
  TrendingUp, FileText, ArrowLeft, ChevronRight,
  BarChart3, Zap, Sparkles, Target, Trophy,
  Brain, Activity, Share2, Users, MoreHorizontal,
  Gauge, Lightbulb, BrainCircuit, Radar,
  TrendingDown, Flame, Cpu, Wand2, LineChart,
  Hexagon, ArrowUpRight, Hash, Filter, Quote
} from 'lucide-react';
import CloudImage from '@/components/ui/CloudImage';
import { formatDateGregorian } from '@/lib/date-utils';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { cn, getArticleLink } from '@/lib/utils';
import FooterOfficial from '@/components/Footer';

interface ArticleAuthor {
  id: string;
  full_name: string;
  slug: string;
  title: string;
  bio: string;
  avatar_url: string;
  email: string;
  social_links: any;
  specializations: string[];
  total_articles: number;
  total_views: number;
  total_likes: number;
  total_shares: number;
  ai_score: number;
  last_article_at: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface Article {
  id: string;
  title: string;
  summary: string;
  featured_image: string;
  published_at: string;
  views: number;
  likes: number;
  reading_time: number;
  slug: string;
  article_type: string;
  tags: string[];
}

interface Quote {
  id: string;
  quote_text: string;
  is_featured: boolean;
  ai_confidence: number;
}

interface WriterStats {
  totalArticles: number;
  totalViews: number;
  totalLikes: number;
  totalShares: number;
  avgReadingTime: number;
  engagementRate: number;
  thisMonthArticles: number;
  thisYearArticles: number;
  avgAIScore: number;
  popularTopics: string[];
}

const WriterProfilePage = () => {
  const params = useParams();
  const slug = params.slug as string;
  
  // State
  const [writer, setWriter] = useState<ArticleAuthor | null>(null);
  const [articles, setArticles] = useState<Article[]>([]);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [stats, setStats] = useState<WriterStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'recent' | 'popular' | 'quotes'>('recent');

  useEffect(() => {
    if (slug) {
      fetchWriterData();
    }
  }, [slug]);

  const fetchWriterData = async () => {
    try {
      setLoading(true);
      
      // جلب بيانات الكاتب
      const writerResponse = await fetch(`/api/writers/${slug}`);
      if (!writerResponse.ok) {
        throw new Error('الكاتب غير موجود');
      }
      const writerData = await writerResponse.json();
      setWriter(writerData.writer);
      
      // جلب الإحصائيات
      const statsResponse = await fetch(`/api/writers/${slug}/stats`);
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(statsData.stats);
      }
      
      // جلب المقالات
      fetchArticles();
      
      // جلب الاقتباسات
      fetchQuotes();
      
    } catch (error: any) {
      console.error('خطأ في جلب بيانات الكاتب:', error);
      toast.error('حدث خطأ في تحميل بيانات الكاتب');
    } finally {
      setLoading(false);
    }
  };

  const fetchArticles = async () => {
    try {
      const response = await fetch(`/api/writers/${slug}/articles?sort=${activeTab}&limit=10`);
      const data = await response.json();
      
      if (data.success) {
        setArticles(data.articles || []);
      }
    } catch (error) {
      console.error('خطأ في جلب المقالات:', error);
    }
  };

  const fetchQuotes = async () => {
    try {
      const response = await fetch(`/api/writers/${slug}/quotes?limit=5`);
      const data = await response.json();
      
      if (data.success) {
        setQuotes(data.quotes || []);
      }
    } catch (error) {
      console.error('خطأ في جلب الاقتباسات:', error);
    }
  };

  useEffect(() => {
    if (slug && (activeTab === 'recent' || activeTab === 'popular')) {
      fetchArticles();
    }
  }, [activeTab, slug]);

  const getTypeIcon = (type: string) => {
    const icons = {
      opinion: MessageSquare,
      analysis: TrendingUp,
      interview: User,
      news: FileText
    };
    
    const Icon = icons[type as keyof typeof icons] || MessageSquare;
    return <Icon className="w-4 h-4" />;
  };

  const getTypeLabel = (type: string) => {
    const labels = {
      opinion: 'رأي',
      analysis: 'تحليل',
      interview: 'مقابلة',
      news: 'خبر'
    };
    
    return labels[type as keyof typeof labels] || 'مقال';
  };

  if (loading) {
    return (
      <div className={`min-h-screen ${darkMode ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' : 'bg-gradient-to-br from-gray-50 via-white to-gray-50'}`}>
        <div className="mx-auto px-4 md:px-6 max-w-7xl">
          <div className="pt-20 pb-16">
            <div className="animate-pulse">
              {/* Header skeleton */}
              <div className={`rounded-3xl p-8 mb-8 ${darkMode ? 'bg-gray-800/50' : 'bg-white/80'} backdrop-blur-sm`}>
                <div className="flex flex-col lg:flex-row items-center gap-6">
                  <div className="w-32 h-32 bg-gradient-to-br from-gray-300 to-gray-400 rounded-full"></div>
                  <div className="flex-1 space-y-3">
                    <div className="h-8 bg-gradient-to-r from-gray-300 to-gray-400 rounded w-1/3"></div>
                    <div className="h-6 bg-gradient-to-r from-gray-300 to-gray-400 rounded w-1/4"></div>
                    <div className="h-4 bg-gradient-to-r from-gray-300 to-gray-400 rounded w-2/3"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!writer) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${darkMode ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' : 'bg-gradient-to-br from-gray-50 via-white to-gray-50'}`}>
        <div className="text-center">
          <div className="w-24 h-24 mx-auto mb-6 relative">
            <div className="absolute inset-0 bg-gradient-to-r from-red-400 to-red-600 rounded-full animate-pulse"></div>
            <div className="absolute inset-2 bg-white dark:bg-gray-900 rounded-full flex items-center justify-center">
              <User className="w-8 h-8 text-red-500" />
            </div>
          </div>
          <h2 className={`text-3xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
            الكاتب غير موجود
          </h2>
          <p className={`text-xl mb-8 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            لم نتمكن من العثور على هذا الكاتب
          </p>
          <Link 
            href="/"
            className="inline-flex items-center gap-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 rounded-2xl font-medium transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <ArrowLeft className="w-5 h-5" />
            العودة للصفحة الرئيسية
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-all duration-300 ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* المحتوى الرئيسي */}
      <main className="pt-20 pb-16">
        <div className="mx-auto px-4 md:px-6 max-w-7xl">
          
          {/* Hero Section */}
          <section className="py-10 bg-transparent">
            <div className={`rounded-2xl shadow-lg border p-8 ${
              darkMode 
                ? 'bg-gradient-to-r from-slate-800 to-slate-700 border-slate-600/50' 
                : 'bg-gradient-to-r from-slate-50 to-blue-50 border-slate-200'
            }`}>
              <div className="flex flex-col lg:flex-row items-center lg:items-start gap-6">
                
                {/* صورة الكاتب */}
                <div className="relative">
                  <div className="w-24 h-24 lg:w-32 lg:h-32 rounded-full overflow-hidden ring-4 ring-blue-200 dark:ring-slate-600 shadow-lg">
                    <CloudImage
                      src={writer.avatar_url || '/default-avatar.png'}
                      alt={writer.full_name}
                      width={128}
                      height={128}
                      className="w-full h-full object-cover"
                      fallbackType="author"
                    />
                  </div>
                  
                  {/* مؤشر AI */}
                  <div className="absolute -top-1 -left-1">
                    <div className={`flex items-center gap-1 px-2 py-1 rounded-full shadow-md animate-pulse ${
                      darkMode 
                        ? 'bg-gradient-to-r from-purple-600 via-blue-600 to-green-600'
                        : 'bg-gradient-to-r from-purple-500 via-blue-500 to-green-500'
                    }`}>
                      <BrainCircuit className="w-3 h-3 text-white" />
                      <span className="text-white font-bold text-xs">AI</span>
                    </div>
                  </div>
                </div>

                {/* معلومات الكاتب */}
                <div className="flex-1 text-center lg:text-right">
                  <h1 className={`text-2xl md:text-3xl font-medium tracking-tight leading-snug mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {writer.full_name}
                  </h1>
                  {writer.title && (
                    <p className={`text-base md:text-lg font-medium tracking-tight mb-3 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                      {writer.title}
                    </p>
                  )}
                  
                  {/* إحصائيات سريعة */}
                  {stats && (
                    <div className="flex flex-wrap justify-center lg:justify-start gap-4 text-sm mb-4">
                      <div className="flex items-center gap-2">
                        <FileText className={`w-4 h-4 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                        <span className={`font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          {stats.totalArticles} مقال
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Eye className={`w-4 h-4 ${darkMode ? 'text-green-400' : 'text-green-600'}`} />
                        <span className={`font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          {stats.totalViews > 1000 ? `${(stats.totalViews / 1000).toFixed(1)}ك` : stats.totalViews} مشاهدة
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Heart className={`w-4 h-4 ${darkMode ? 'text-red-400' : 'text-red-600'}`} />
                        <span className={`font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          {stats.totalLikes} إعجاب
                        </span>
                      </div>
                    </div>
                  )}

                  {/* أزرار التفاعل */}
                  <div className="flex flex-col sm:flex-row justify-center lg:justify-start gap-3">
                    {writer.email && (
                      <a
                        href={`mailto:${writer.email}`}
                        className={`inline-flex items-center justify-center gap-2 px-4 py-2 rounded-full font-medium transition-all hover:scale-105 ${
                          darkMode 
                            ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                            : 'bg-blue-600 hover:bg-blue-700 text-white'
                        }`}
                      >
                        <Mail className="w-4 h-4" />
                        <span className="text-sm">تواصل مع الكاتب</span>
                      </a>
                    )}

                    <button
                      onClick={async () => {
                        const shareData = {
                          title: `${writer.full_name} - كاتب في صحيفة سبق`,
                          text: `تعرف على ${writer.full_name} ${writer.title ? '- ' + writer.title : ''}`,
                          url: window.location.href
                        };

                        if (navigator.share) {
                          try {
                            await navigator.share(shareData);
                          } catch (error) {
                            console.log('تم إلغاء المشاركة');
                          }
                        } else {
                          await navigator.clipboard.writeText(window.location.href);
                          toast.success('تم نسخ الرابط');
                        }
                      }}
                      className={`inline-flex items-center justify-center gap-2 px-4 py-2 rounded-full font-medium transition-all hover:scale-105 border ${
                        darkMode 
                          ? 'border-slate-600 text-slate-300 hover:bg-slate-700' 
                          : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <Share2 className="w-4 h-4" />
                      <span className="text-sm">مشاركة البروفايل</span>
                    </button>
                  </div>
                </div>
                
                {/* AI Score */}
                <div className="hidden xl:block">
                  <div className="relative w-32 h-32">
                    <svg className="transform -rotate-90 w-32 h-32">
                      <circle 
                        cx="64" cy="64" r="56" 
                        strokeWidth="8" 
                        stroke={darkMode ? '#374151' : '#e5e7eb'}
                        fill="transparent"
                      />
                      <circle 
                        cx="64" cy="64" r="56" 
                        strokeWidth="8" 
                        stroke="url(#aiGradient)"
                        fill="transparent"
                        strokeDasharray={`${(writer.ai_score / 100) * 351.86} 351.86`}
                        strokeLinecap="round"
                        className="transition-all duration-700"
                      />
                      <defs>
                        <linearGradient id="aiGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#8b5cf6" />
                          <stop offset="50%" stopColor="#3b82f6" />
                          <stop offset="100%" stopColor="#10b981" />
                        </linearGradient>
                      </defs>
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center flex-col">
                      <span className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        {Math.round(writer.ai_score)}
                      </span>
                      <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        AI Score
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* نبذة تعريفية */}
          {writer.bio && (
            <section className="mb-10">
              <div className={`rounded-xl shadow-sm border p-6 hover:shadow-md transition-shadow ${
                darkMode ? 'bg-slate-800 border-slate-600/50' : 'bg-white border-slate-200'
              }`}>
                <div className="flex items-center gap-2 mb-3">
                  <User className={`w-5 h-5 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                  <h2 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    نبذة تعريفية
                  </h2>
                </div>
                <div className={`${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  <p className="leading-relaxed">
                    {writer.bio}
                  </p>
                </div>
              </div>
            </section>
          )}

          {/* التخصصات */}
          {writer.specializations && writer.specializations.length > 0 && (
            <section className="mb-10">
              <div className={`rounded-xl shadow-sm border p-6 ${
                darkMode ? 'bg-slate-800 border-slate-600/50' : 'bg-white border-slate-200'
              }`}>
                <div className="flex items-center gap-2 mb-3">
                  <Target className={`w-5 h-5 ${darkMode ? 'text-green-400' : 'text-green-600'}`} />
                  <h2 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    التخصصات
                  </h2>
                </div>
                <div className="flex flex-wrap gap-2">
                  {writer.specializations.map((spec, index) => (
                    <span
                      key={index}
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        darkMode 
                          ? 'bg-green-900/20 text-green-400 border border-green-800'
                          : 'bg-green-100 text-green-800 border border-green-200'
                      }`}
                    >
                      {spec}
                    </span>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* الإحصائيات التفصيلية */}
          {stats && (
            <section className="mb-12">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { label: 'المقالات', value: stats.totalArticles, icon: FileText, color: 'blue' },
                  { label: 'المشاهدات', value: stats.totalViews > 1000 ? `${(stats.totalViews / 1000).toFixed(1)}ك` : stats.totalViews, icon: Eye, color: 'green' },
                  { label: 'التفاعل', value: stats.totalLikes + stats.totalShares, icon: Heart, color: 'red' },
                  { label: 'متوسط الأداء', value: `${Math.round(stats.engagementRate)}%`, icon: TrendingUp, color: 'purple' }
                ].map((stat, index) => (
                  <div
                    key={index}
                    className={`p-6 rounded-xl border shadow-sm hover:shadow-md transition-shadow ${
                      darkMode ? 'bg-slate-800 border-slate-600/50' : 'bg-white border-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          {stat.label}
                        </p>
                        <p className={`text-2xl font-bold mt-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          {stat.value}
                        </p>
                      </div>
                      <div className={`p-3 rounded-lg bg-${stat.color}-100 dark:bg-${stat.color}-900/20`}>
                        <stat.icon className={`w-6 h-6 text-${stat.color}-600 dark:text-${stat.color}-400`} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* المحتوى المنشور */}
          <section className="mb-12">
            <div className={`rounded-2xl shadow-md border ${
              darkMode ? 'bg-slate-800 border-slate-600/50' : 'bg-white border-slate-200'
            }`}>
              {/* Tabs Header */}
              <div className="border-b border-gray-200 dark:border-slate-600">
                <div className="flex flex-wrap">
                  {[
                    { id: 'recent', label: 'الأحدث', icon: Clock },
                    { id: 'popular', label: 'الأكثر قراءة', icon: Eye },
                    { id: 'quotes', label: 'اقتباسات مختارة', icon: Quote }
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                        activeTab === tab.id
                          ? `border-blue-600 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`
                          : `border-transparent ${darkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-600 hover:text-gray-700'}`
                      }`}
                    >
                      <tab.icon className="w-4 h-4" />
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Content */}
              <div className="p-4">
                {activeTab === 'quotes' ? (
                  // الاقتباسات
                  quotes.length > 0 ? (
                    <div className="space-y-4">
                      {quotes.map((quote) => (
                        <div
                          key={quote.id}
                          className={`p-6 rounded-xl border-r-4 border-purple-500 ${
                            darkMode ? 'bg-gray-700/50' : 'bg-purple-50'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <Quote className={`w-6 h-6 flex-shrink-0 mt-1 ${darkMode ? 'text-purple-400' : 'text-purple-600'}`} />
                            <div className="flex-1">
                              <p className={`text-lg italic leading-relaxed ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                                "{quote.quote_text}"
                              </p>
                              {quote.is_featured && (
                                <span className={`inline-block mt-2 px-2 py-1 text-xs font-medium rounded-full ${
                                  darkMode ? 'bg-yellow-900/20 text-yellow-400' : 'bg-yellow-100 text-yellow-800'
                                }`}>
                                  مميز
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Quote className={`w-12 h-12 mx-auto mb-4 ${darkMode ? 'text-gray-600' : 'text-gray-400'}`} />
                      <p className={`text-lg font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        لا توجد اقتباسات متاحة
                      </p>
                    </div>
                  )
                ) : (
                  // المقالات
                  articles.length > 0 ? (
                    <div className="grid gap-4">
                      {articles.map((article) => (
                        <Link
                          key={article.id}
                          href={getArticleLink(article)}
                          className={`block p-4 rounded-xl border transition-all hover:shadow-md ${
                            darkMode 
                              ? 'bg-slate-700 border-slate-600 hover:bg-slate-600/50'
                              : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                          }`}
                        >
                          <div className="flex gap-4">
                            {/* صورة مصغرة */}
                            {article.featured_image && (
                              <div className="w-20 h-16 rounded-lg overflow-hidden flex-shrink-0">
                                <CloudImage
                                  src={article.featured_image}
                                  alt={article.title}
                                  width={80}
                                  height={64}
                                  className="w-full h-full object-cover"
                                  fallbackType="article"
                                />
                              </div>
                            )}
                            
                            {/* محتوى */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                {getTypeIcon(article.article_type)}
                                <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                  {getTypeLabel(article.article_type)}
                                </span>
                              </div>
                              
                              <h3 className={`font-semibold line-clamp-2 mb-2 ${
                                darkMode ? 'text-white' : 'text-gray-900'
                              }`}>
                                {article.title}
                              </h3>
                              
                              {article.summary && (
                                <p className={`text-sm line-clamp-2 mb-2 ${
                                  darkMode ? 'text-gray-400' : 'text-gray-600'
                                }`}>
                                  {article.summary}
                                </p>
                              )}
                              
                              <div className="flex items-center gap-4 text-xs text-gray-500">
                                <div className="flex items-center gap-1">
                                  <Calendar className="w-3 h-3" />
                                  <span>{formatDateGregorian(article.published_at)}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Eye className="w-3 h-3" />
                                  <span>{article.views > 1000 ? `${(article.views / 1000).toFixed(1)}ك` : article.views}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Heart className="w-3 h-3" />
                                  <span>{article.likes}</span>
                                </div>
                                {article.reading_time && (
                                  <div className="flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    <span>{article.reading_time} د</span>
                                  </div>
                                )}
                              </div>
                              
                              {/* Tags */}
                              {article.tags.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-2">
                                  {article.tags.slice(0, 3).map((tag, index) => (
                                    <span
                                      key={index}
                                      className={`px-2 py-1 text-xs rounded-full ${
                                        darkMode 
                                          ? 'bg-gray-600 text-gray-300' 
                                          : 'bg-gray-200 text-gray-600'
                                      }`}
                                    >
                                      {tag}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                            
                            {/* زر اقرأ المزيد */}
                            <div className="flex-shrink-0">
                              <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                                darkMode 
                                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                                  : 'bg-blue-600 hover:bg-blue-700 text-white'
                              }`}>
                                <span>اقرأ</span>
                                <ChevronRight className="w-3 h-3" />
                              </div>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <FileText className={`w-12 h-12 mx-auto mb-4 ${darkMode ? 'text-gray-600' : 'text-gray-400'}`} />
                      <p className={`text-lg font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        لا توجد مقالات متاحة
                      </p>
                    </div>
                  )
                )}
              </div>
            </div>
          </section>

          {/* روابط التواصل */}
          {writer.social_links && Object.keys(writer.social_links).length > 0 && (
            <section className="mb-10">
              <div className={`rounded-xl shadow-sm border p-6 hover:shadow-md transition-shadow ${
                darkMode ? 'bg-slate-800 border-slate-600/50' : 'bg-white border-slate-200'
              }`}>
                <h3 className={`text-lg font-semibold mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  تواصل
                </h3>
                <div className="flex gap-3">
                  {writer.social_links.twitter && (
                    <a
                      href={writer.social_links.twitter}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors"
                    >
                      <Twitter className="w-4 h-4" />
                      <span className="text-sm font-medium">تويتر</span>
                      <ExternalLink className="w-3 h-3 mr-auto" />
                    </a>
                  )}

                  {writer.social_links.linkedin && (
                    <a
                      href={writer.social_links.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white transition-colors"
                    >
                      <Linkedin className="w-4 h-4" />
                      <span className="text-sm font-medium">لينكد إن</span>
                      <ExternalLink className="w-3 h-3 mr-auto" />
                    </a>
                  )}

                  {writer.social_links.website && (
                    <a
                      href={writer.social_links.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 rounded-lg bg-purple-600 hover:bg-purple-700 text-white transition-colors"
                    >
                      <Globe className="w-4 h-4" />
                      <span className="text-sm font-medium">الموقع الشخصي</span>
                      <ExternalLink className="w-3 h-3 mr-auto" />
                    </a>
                  )}
                </div>
              </div>
            </section>
          )}

        </div>
      </main>
      
      {/* Footer الرسمي */}
      <FooterOfficial />
    </div>
  );
};

export default WriterProfilePage;