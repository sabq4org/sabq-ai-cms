'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { 
  User, MapPin, Calendar, ExternalLink, Eye, Heart, 
  BookOpen, Award, Star, MessageSquare, Clock,
  Twitter, Linkedin, Globe, Mail, CheckCircle2,
  TrendingUp, FileText, ArrowLeft, ChevronRight,
  BarChart3, Zap, Sparkles, Target, Trophy,
  Brain, Activity, Flame, Rocket, Diamond
} from 'lucide-react';
import CloudImage from '@/components/ui/CloudImage';
import { formatDateGregorian } from '@/lib/date-utils';
import { useDarkModeContext } from '@/contexts/DarkModeContext';
import toast from 'react-hot-toast';
import Link from 'next/link';

interface Reporter {
  id: string;
  user_id: string;
  full_name: string;
  slug: string;
  title: string;
  bio: string;
  avatar_url: string;
  is_verified: boolean;
  verification_badge: string;
  specializations: string[];
  coverage_areas: string[];
  languages: string[];
  twitter_url?: string;
  linkedin_url?: string;
  website_url?: string;
  email_public?: string;
  total_articles: number;
  total_views: number;
  total_likes: number;
  total_shares: number;
  avg_reading_time: number;
  engagement_rate: number;
  writing_style: any;
  popular_topics: string[];
  publication_pattern: any;
  reader_demographics: any;
  is_active: boolean;
  show_stats: boolean;
  show_contact: boolean;
  created_at: string;
  updated_at: string;
}

interface Stats {
  totalArticles: number;
  totalViews: number;
  totalLikes: number;
  totalShares: number;
  avgReadingTime: number;
  engagementRate: number;
  thisMonthArticles: number;
  thisYearArticles: number;
  mostViewedArticle?: {
    id: string;
    title: string;
    views: number;
  };
  recentActivity: string;
}

interface Article {
  id: string;
  title: string;
  summary: string;
  image_url: string;
  published_at: string;
  category_name: string;
  category_icon: string;
  views: number;
  likes: number;
  reading_time: number;
  slug: string;
}

const ReporterProfilePage: React.FC = () => {
  const params = useParams();
  const slug = params?.slug as string;
  const { darkMode } = useDarkModeContext();
  
  const [reporter, setReporter] = useState<Reporter | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [articlesLoading, setArticlesLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('recent');
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // جلب بيانات المراسل
  useEffect(() => {
    if (slug) {
      fetchReporterData();
    }
  }, [slug]);

  const fetchReporterData = async () => {
    try {
      setLoading(true);
      
      // جلب بيانات المراسل
      const reporterResponse = await fetch(`/api/reporters/${slug}`);
      if (!reporterResponse.ok) {
        throw new Error('المراسل غير موجود');
      }
      const reporterData = await reporterResponse.json();
      setReporter(reporterData.reporter);
      
      // جلب الإحصائيات
      const statsResponse = await fetch(`/api/reporters/${slug}/stats`);
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(statsData.stats);
      }
      
      // جلب المقالات
      fetchArticles();
      
    } catch (error: any) {
      console.error('خطأ في جلب بيانات المراسل:', error);
      toast.error('حدث خطأ في تحميل بيانات المراسل');
    } finally {
      setLoading(false);
    }
  };

  const fetchArticles = async (search = '', category = 'all', tab = 'recent') => {
    try {
      setArticlesLoading(true);
      const params = new URLSearchParams({
        search,
        category,
        sort: tab === 'popular' ? 'views' : 'date',
        limit: '20'
      });
      
      const response = await fetch(`/api/reporters/${slug}/articles?${params}`);
      if (response.ok) {
        const data = await response.json();
        setArticles(data.articles);
      }
    } catch (error) {
      console.error('خطأ في جلب المقالات:', error);
    } finally {
      setArticlesLoading(false);
    }
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    fetchArticles(searchTerm, categoryFilter, tab);
  };

  const handleSearch = (search: string) => {
    setSearchTerm(search);
    fetchArticles(search, categoryFilter, activeTab);
  };

  const getVerificationIcon = (badge: string) => {
    switch (badge) {
      case 'expert':
        return <Diamond className="w-5 h-5 text-purple-400" />;
      case 'senior':
        return <Trophy className="w-5 h-5 text-amber-400" />;
      default:
        return <CheckCircle2 className="w-5 h-5 text-emerald-400" />;
    }
  };

  const getVerificationText = (badge: string) => {
    switch (badge) {
      case 'expert':
        return 'خبير متخصص';
      case 'senior':
        return 'محرر أول';
      default:
        return 'معتمد';
    }
  };

  if (loading) {
    return (
      <div className={`min-h-screen ${darkMode ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' : 'bg-gradient-to-br from-gray-50 via-white to-gray-50'}`}>
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            {/* Header skeleton */}
            <div className={`rounded-3xl p-8 mb-8 ${darkMode ? 'bg-gray-800/50' : 'bg-white/80'} backdrop-blur-sm`}>
              <div className="flex flex-col md:flex-row items-center gap-6">
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
    );
  }

  if (!reporter) {
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
            المراسل غير موجود
          </h2>
          <p className={`text-xl mb-8 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            لم نتمكن من العثور على هذا المراسل
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
    <div className={`min-h-screen transition-all duration-300 ${darkMode ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' : 'bg-gradient-to-br from-gray-50 via-white to-gray-50'}`}>
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            backgroundSize: '60px 60px'
          }}></div>
        </div>

        {/* Hero Content */}
        <div className="relative z-10 container mx-auto px-4 py-12">
          <div className={`rounded-3xl overflow-hidden shadow-2xl backdrop-blur-sm border ${
            darkMode 
              ? 'bg-gradient-to-r from-gray-800/80 via-gray-700/80 to-gray-800/80 border-gray-700/50' 
              : 'bg-gradient-to-r from-white/90 via-gray-50/90 to-white/90 border-gray-200/50'
          }`}>
            <div className="p-8 lg:p-12">
              <div className="grid lg:grid-cols-3 gap-8 items-center">
                
                {/* Avatar & Basic Info */}
                <div className="lg:col-span-1 text-center lg:text-right">
                  <div className="relative inline-block">
                    <div className="w-32 h-32 lg:w-40 lg:h-40 rounded-full overflow-hidden ring-4 ring-gradient-to-r from-blue-400 to-purple-500 shadow-2xl mx-auto lg:mx-0">
                      <CloudImage
                        src={reporter.avatar_url}
                        alt={reporter.full_name}
                        width={160}
                        height={160}
                        className="w-full h-full object-cover"
                        fallbackType="author"
                      />
                    </div>
                    
                    {/* Verification Badge */}
                    {reporter.is_verified && (
                      <div className="absolute -bottom-2 -right-2 lg:-right-4">
                        <div className={`flex items-center gap-2 px-3 py-2 rounded-full shadow-lg ${
                          darkMode 
                            ? 'bg-gradient-to-r from-emerald-600 to-emerald-700 border border-emerald-500/30'
                            : 'bg-gradient-to-r from-emerald-500 to-emerald-600 border border-emerald-400/30'
                        }`}>
                          {getVerificationIcon(reporter.verification_badge)}
                          <span className="text-white font-bold text-sm hidden lg:inline">
                            {getVerificationText(reporter.verification_badge)}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* AI Indicator */}
                    <div className="absolute -top-2 -left-2 lg:-left-4">
                      <div className={`flex items-center gap-1 px-2 py-1 rounded-full shadow-lg ${
                        darkMode 
                          ? 'bg-gradient-to-r from-purple-600 to-pink-600'
                          : 'bg-gradient-to-r from-purple-500 to-pink-500'
                      }`}>
                        <Brain className="w-4 h-4 text-white" />
                        <span className="text-white font-bold text-xs">AI</span>
                      </div>
                    </div>
                  </div>

                  {/* Name & Title */}
                  <div className="mt-6">
                    <h1 className={`text-3xl lg:text-4xl font-bold mb-2 bg-gradient-to-r from-gray-800 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent`}>
                      {reporter.full_name}
                    </h1>
                    {reporter.title && (
                      <p className={`text-lg font-medium ${darkMode ? 'text-purple-400' : 'text-purple-600'}`}>
                        {reporter.title}
                      </p>
                    )}
                  </div>
                </div>

                {/* Bio & Details */}
                <div className="lg:col-span-2">
                  {reporter.bio && (
                    <div className="mb-6">
                      <div className="flex items-center gap-2 mb-3">
                        <Sparkles className={`w-5 h-5 ${darkMode ? 'text-yellow-400' : 'text-yellow-500'}`} />
                        <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                          نبذة مهنية
                        </h3>
                      </div>
                      <p className={`text-lg leading-relaxed ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        {reporter.bio}
                      </p>
                    </div>
                  )}

                  {/* Quick Stats */}
                  {stats && (
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className={`p-4 rounded-2xl ${darkMode ? 'bg-gradient-to-br from-blue-600/20 to-blue-700/20 border border-blue-500/30' : 'bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200'}`}>
                        <div className="flex items-center gap-2 mb-1">
                          <FileText className={`w-5 h-5 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                          <span className={`text-xs font-medium ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>مقالات</span>
                        </div>
                        <div className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                          {stats.totalArticles}
                        </div>
                        <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          {stats.thisMonthArticles} هذا الشهر
                        </div>
                      </div>

                      <div className={`p-4 rounded-2xl ${darkMode ? 'bg-gradient-to-br from-emerald-600/20 to-emerald-700/20 border border-emerald-500/30' : 'bg-gradient-to-br from-emerald-50 to-emerald-100 border border-emerald-200'}`}>
                        <div className="flex items-center gap-2 mb-1">
                          <Eye className={`w-5 h-5 ${darkMode ? 'text-emerald-400' : 'text-emerald-600'}`} />
                          <span className={`text-xs font-medium ${darkMode ? 'text-emerald-400' : 'text-emerald-600'}`}>مشاهدات</span>
                        </div>
                        <div className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                          {stats.totalViews > 1000 ? `${(stats.totalViews / 1000).toFixed(1)}ك` : stats.totalViews}
                        </div>
                        <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          إجمالي القراءات
                        </div>
                      </div>

                      <div className={`p-4 rounded-2xl ${darkMode ? 'bg-gradient-to-br from-pink-600/20 to-pink-700/20 border border-pink-500/30' : 'bg-gradient-to-br from-pink-50 to-pink-100 border border-pink-200'}`}>
                        <div className="flex items-center gap-2 mb-1">
                          <Heart className={`w-5 h-5 ${darkMode ? 'text-pink-400' : 'text-pink-600'}`} />
                          <span className={`text-xs font-medium ${darkMode ? 'text-pink-400' : 'text-pink-600'}`}>إعجابات</span>
                        </div>
                        <div className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                          {stats.totalLikes}
                        </div>
                        <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          تفاعل إيجابي
                        </div>
                      </div>

                      <div className={`p-4 rounded-2xl ${darkMode ? 'bg-gradient-to-br from-amber-600/20 to-amber-700/20 border border-amber-500/30' : 'bg-gradient-to-br from-amber-50 to-amber-100 border border-amber-200'}`}>
                        <div className="flex items-center gap-2 mb-1">
                          <TrendingUp className={`w-5 h-5 ${darkMode ? 'text-amber-400' : 'text-amber-600'}`} />
                          <span className={`text-xs font-medium ${darkMode ? 'text-amber-400' : 'text-amber-600'}`}>معدل التفاعل</span>
                        </div>
                        <div className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                          {Math.round(stats.engagementRate)}%
                        </div>
                        <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          متوسط الإنخراط
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Articles Section */}
          <div className="lg:col-span-3">
            <div className={`rounded-2xl shadow-xl overflow-hidden backdrop-blur-sm border ${
              darkMode 
                ? 'bg-gray-800/80 border-gray-700/50' 
                : 'bg-white/90 border-gray-200/50'
            }`}>
              {/* Header */}
              <div className="p-6 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                      <Rocket className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-white">
                        محتوى {reporter.full_name}
                      </h2>
                      <p className="text-white/80 text-sm">
                        مقالات وتقارير متخصصة بذكاء اصطناعي
                      </p>
                    </div>
                  </div>
                  
                  {/* AI-Powered Tabs */}
                  <div className="flex bg-white/10 backdrop-blur-sm rounded-xl p-1">
                    <button
                      onClick={() => handleTabChange('recent')}
                      className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                        activeTab === 'recent'
                          ? 'bg-white text-purple-600 shadow-lg'
                          : 'text-white/80 hover:text-white hover:bg-white/10'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Activity className="w-4 h-4" />
                        الأحدث
                      </div>
                    </button>
                    <button
                      onClick={() => handleTabChange('popular')}
                      className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                        activeTab === 'popular'
                          ? 'bg-white text-purple-600 shadow-lg'
                          : 'text-white/80 hover:text-white hover:bg-white/10'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Flame className="w-4 h-4" />
                        الأكثر قراءة
                      </div>
                    </button>
                  </div>
                </div>

                {/* AI-Powered Search */}
                <div className="mt-4">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="البحث الذكي في مقالات المراسل..."
                      value={searchTerm}
                      onChange={(e) => handleSearch(e.target.value)}
                      className={`w-full pl-12 pr-4 py-3 rounded-xl border-0 ${
                        darkMode 
                          ? 'bg-gray-900/50 text-white placeholder-gray-400' 
                          : 'bg-white/90 text-gray-800 placeholder-gray-500'
                      } focus:ring-2 focus:ring-white/50 backdrop-blur-sm`}
                    />
                    <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                      <Brain className="w-5 h-5 text-purple-400" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Articles List */}
              <div className="p-6">
                {articlesLoading ? (
                  <div className="space-y-6">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="animate-pulse flex gap-4">
                        <div className="w-32 h-24 bg-gradient-to-br from-gray-300 to-gray-400 rounded-xl"></div>
                        <div className="flex-1 space-y-2">
                          <div className="h-5 bg-gradient-to-r from-gray-300 to-gray-400 rounded w-3/4"></div>
                          <div className="h-4 bg-gradient-to-r from-gray-300 to-gray-400 rounded w-full"></div>
                          <div className="h-4 bg-gradient-to-r from-gray-300 to-gray-400 rounded w-1/2"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : articles.length > 0 ? (
                  <div className="space-y-6">
                    {articles.map((article) => (
                      <Link
                        key={article.id}
                        href={`/article/${article.id}`}
                        className={`group block p-4 rounded-xl transition-all duration-300 hover:shadow-lg transform hover:scale-[1.02] ${
                          darkMode ? 'hover:bg-gray-700/50' : 'hover:bg-gray-50/80'
                        }`}
                      >
                        <div className="flex gap-4">
                          {/* Article Image */}
                          <div className="flex-shrink-0 relative overflow-hidden rounded-xl">
                            <div className="w-32 h-24 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800">
                              {article.image_url ? (
                                <CloudImage
                                  src={article.image_url}
                                  alt={article.title}
                                  width={128}
                                  height={96}
                                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                  fallbackType="article"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <FileText className={`w-8 h-8 ${darkMode ? 'text-gray-600' : 'text-gray-400'}`} />
                                </div>
                              )}
                            </div>
                            
                            {/* AI Enhancement Badge */}
                            <div className="absolute top-1 right-1">
                              <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs px-2 py-1 rounded-full">
                                <Zap className="w-3 h-3 inline mr-1" />
                                AI
                              </div>
                            </div>
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            {/* Category */}
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-lg">{article.category_icon}</span>
                              <span className={`text-sm font-medium px-2 py-1 rounded-full ${
                                darkMode 
                                  ? 'bg-gradient-to-r from-blue-600/20 to-purple-600/20 text-blue-400 border border-blue-500/30' 
                                  : 'bg-gradient-to-r from-blue-50 to-purple-50 text-blue-600 border border-blue-200'
                              }`}>
                                {article.category_name}
                              </span>
                              
                              {/* AI Insights */}
                              <div className="flex items-center gap-1 text-xs">
                                <Target className="w-3 h-3 text-emerald-500" />
                                <span className={`${darkMode ? 'text-emerald-400' : 'text-emerald-600'}`}>
                                  دقة عالية
                                </span>
                              </div>
                            </div>

                            {/* Title */}
                            <h3 className={`font-bold text-lg mb-2 line-clamp-2 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors ${
                              darkMode ? 'text-white' : 'text-gray-800'
                            }`}>
                              {article.title}
                            </h3>

                            {/* Summary */}
                            {article.summary && (
                              <p className={`text-sm mb-3 line-clamp-2 ${
                                darkMode ? 'text-gray-400' : 'text-gray-600'
                              }`}>
                                {article.summary}
                              </p>
                            )}

                            {/* Meta Info */}
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4">
                                <div className="flex items-center gap-1">
                                  <Calendar className="w-4 h-4 text-gray-400" />
                                  <span className="text-sm text-gray-500">
                                    {formatDateGregorian(article.published_at)}
                                  </span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Clock className="w-4 h-4 text-gray-400" />
                                  <span className="text-sm text-gray-500">
                                    {article.reading_time} دقيقة
                                  </span>
                                </div>
                              </div>

                              {/* Enhanced Stats */}
                              <div className="flex items-center gap-4">
                                <div className="flex items-center gap-1">
                                  <Eye className="w-4 h-4 text-gray-400" />
                                  <span className="text-sm text-gray-500 font-medium">
                                    {article.views > 1000 ? `${(article.views / 1000).toFixed(1)}ك` : article.views}
                                  </span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Heart className="w-4 h-4 text-gray-400" />
                                  <span className="text-sm text-gray-500 font-medium">{article.likes}</span>
                                </div>
                                <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors" />
                              </div>
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-gray-300 to-gray-400 dark:from-gray-600 dark:to-gray-700 rounded-full flex items-center justify-center">
                      <FileText className="w-10 h-10 text-gray-500 dark:text-gray-400" />
                    </div>
                    <h3 className={`text-xl font-semibold mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      لا توجد مقالات
                    </h3>
                    <p className={`text-sm ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                      لم يقم هذا المراسل بنشر أي مقالات بعد
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Enhanced Sidebar */}
          <div className="space-y-6">
            {/* AI Insights Panel */}
            <div className={`rounded-2xl shadow-xl p-6 ${
              darkMode 
                ? 'bg-gradient-to-br from-purple-900/50 to-pink-900/50 border border-purple-500/30' 
                : 'bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200'
            }`}>
              <div className="flex items-center gap-3 mb-4">
                <Brain className={`w-6 h-6 ${darkMode ? 'text-purple-400' : 'text-purple-600'}`} />
                <h3 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                  رؤى ذكية
                </h3>
              </div>

              <div className="space-y-4">
                {/* Performance Indicator */}
                <div className={`p-4 rounded-xl ${darkMode ? 'bg-gray-800/50' : 'bg-white/70'}`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      مستوى الأداء
                    </span>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-500" />
                      <span className={`text-sm font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                        ممتاز
                      </span>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 h-2 rounded-full" style={{ width: '85%' }}></div>
                  </div>
                </div>

                {/* AI-Generated Tags */}
                <div>
                  <h4 className={`font-semibold mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    كلمات مفتاحية ذكية
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {['صحافة استقصائية', 'تحليل عميق', 'مصادر موثقة', 'تغطية حصرية'].map((tag, index) => (
                      <span
                        key={index}
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          darkMode 
                            ? 'bg-gradient-to-r from-blue-600/20 to-purple-600/20 text-blue-400 border border-blue-500/30'
                            : 'bg-gradient-to-r from-blue-100 to-purple-100 text-blue-600 border border-blue-200'
                        }`}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Specializations */}
            {reporter.specializations && reporter.specializations.length > 0 && (
              <div className={`rounded-2xl shadow-xl p-6 ${
                darkMode ? 'bg-gray-800/80' : 'bg-white/90'
              }`}>
                <h3 className={`text-xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                  التخصصات
                </h3>
                <div className="flex flex-wrap gap-2">
                  {reporter.specializations.map((spec, index) => (
                    <span
                      key={index}
                      className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg"
                    >
                      {spec}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Coverage Areas */}
            {reporter.coverage_areas && reporter.coverage_areas.length > 0 && (
              <div className={`rounded-2xl shadow-xl p-6 ${
                darkMode ? 'bg-gray-800/80' : 'bg-white/90'
              }`}>
                <h3 className={`text-xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                  نطاق التغطية
                </h3>
                <div className="space-y-2">
                  {reporter.coverage_areas.map((area, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-emerald-500" />
                      <span className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        {area}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Contact Links */}
            {(reporter.twitter_url || reporter.linkedin_url || reporter.website_url || reporter.email_public) && (
              <div className={`rounded-2xl shadow-xl p-6 ${
                darkMode ? 'bg-gray-800/80' : 'bg-white/90'
              }`}>
                <h3 className={`text-xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                  تواصل معنا
                </h3>

                <div className="space-y-3">
                  {reporter.twitter_url && (
                    <a
                      href={reporter.twitter_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white transition-all duration-300 group shadow-lg hover:shadow-xl"
                    >
                      <Twitter className="w-5 h-5" />
                      <span className="font-medium">تويتر</span>
                      <ExternalLink className="w-4 h-4 mr-auto group-hover:scale-110 transition-transform" />
                    </a>
                  )}

                  {reporter.linkedin_url && (
                    <a
                      href={reporter.linkedin_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white transition-all duration-300 group shadow-lg hover:shadow-xl"
                    >
                      <Linkedin className="w-5 h-5" />
                      <span className="font-medium">لينكد إن</span>
                      <ExternalLink className="w-4 h-4 mr-auto group-hover:scale-110 transition-transform" />
                    </a>
                  )}

                  {reporter.website_url && (
                    <a
                      href={reporter.website_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white transition-all duration-300 group shadow-lg hover:shadow-xl"
                    >
                      <Globe className="w-5 h-5" />
                      <span className="font-medium">الموقع الشخصي</span>
                      <ExternalLink className="w-4 h-4 mr-auto group-hover:scale-110 transition-transform" />
                    </a>
                  )}

                  {reporter.email_public && (
                    <a
                      href={`mailto:${reporter.email_public}`}
                      className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white transition-all duration-300 group shadow-lg hover:shadow-xl"
                    >
                      <Mail className="w-5 h-5" />
                      <span className="font-medium">البريد الإلكتروني</span>
                      <ExternalLink className="w-4 h-4 mr-auto group-hover:scale-110 transition-transform" />
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReporterProfilePage;