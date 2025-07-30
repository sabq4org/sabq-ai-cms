'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { 
  User, MapPin, Calendar, ExternalLink, Eye, Heart, 
  BookOpen, Award, Star, MessageSquare, Clock,
  Twitter, Linkedin, Globe, Mail, CheckCircle2,
  TrendingUp, FileText, ArrowLeft, ChevronRight
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

  const handleCategoryFilter = (category: string) => {
    setCategoryFilter(category);
    fetchArticles(searchTerm, category, activeTab);
  };

  const getVerificationIcon = (badge: string) => {
    switch (badge) {
      case 'expert':
        return <Star className="w-5 h-5 text-amber-500" />;
      case 'senior':
        return <Award className="w-5 h-5 text-purple-500" />;
      default:
        return <CheckCircle2 className="w-5 h-5 text-blue-500" />;
    }
  };

  const getVerificationText = (badge: string) => {
    switch (badge) {
      case 'expert':
        return 'خبير';
      case 'senior':
        return 'محرر أول';
      default:
        return 'معتمد';
    }
  };

  if (loading) {
    return (
      <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            {/* Header skeleton */}
            <div className={`rounded-3xl p-8 mb-8 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
              <div className="flex flex-col md:flex-row items-center gap-6">
                <div className="w-32 h-32 bg-gray-300 rounded-full"></div>
                <div className="flex-1 space-y-3">
                  <div className="h-8 bg-gray-300 rounded w-1/3"></div>
                  <div className="h-6 bg-gray-300 rounded w-1/4"></div>
                  <div className="h-4 bg-gray-300 rounded w-2/3"></div>
                </div>
              </div>
            </div>
            
            {/* Content skeleton */}
            <div className="grid md:grid-cols-3 gap-6">
              <div className={`md:col-span-2 rounded-2xl p-6 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex gap-4">
                      <div className="w-24 h-24 bg-gray-300 rounded-lg"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                        <div className="h-3 bg-gray-300 rounded w-full"></div>
                        <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className={`rounded-2xl p-6 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
                <div className="space-y-4">
                  <div className="h-6 bg-gray-300 rounded w-1/2"></div>
                  <div className="space-y-2">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="h-4 bg-gray-300 rounded"></div>
                    ))}
                  </div>
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
      <div className={`min-h-screen flex items-center justify-center ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="text-center">
          <div className={`text-6xl mb-4 ${darkMode ? 'text-gray-600' : 'text-gray-400'}`}>🔍</div>
          <h2 className={`text-2xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
            المراسل غير موجود
          </h2>
          <p className={`text-lg mb-6 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            لم نتمكن من العثور على هذا المراسل
          </p>
          <Link 
            href="/"
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-medium transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            العودة للصفحة الرئيسية
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header Section */}
        <div className={`rounded-3xl overflow-hidden shadow-xl mb-8 ${
          darkMode ? 'bg-gray-800' : 'bg-white'
        }`}>
          {/* Background Gradient */}
          <div className="relative bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 p-8">
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="relative z-10">
              <div className="flex flex-col lg:flex-row items-center gap-8">
                {/* Avatar */}
                <div className="relative">
                  <div className="w-32 h-32 lg:w-40 lg:h-40 rounded-full overflow-hidden border-4 border-white/20 shadow-2xl">
                    <CloudImage
                      src={reporter.avatar_url}
                      alt={reporter.full_name}
                      width={160}
                      height={160}
                      className="w-full h-full object-cover"
                      fallbackType="author"
                    />
                  </div>
                  {reporter.is_verified && (
                    <div className="absolute -bottom-2 -right-2 bg-white rounded-full p-2 shadow-lg">
                      {getVerificationIcon(reporter.verification_badge)}
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 text-center lg:text-right">
                  <div className="flex flex-col lg:flex-row lg:items-center gap-3 mb-4">
                    <h1 className="text-3xl lg:text-4xl font-bold text-white">
                      {reporter.full_name}
                    </h1>
                    {reporter.is_verified && (
                      <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2">
                        {getVerificationIcon(reporter.verification_badge)}
                        <span className="text-white font-medium">
                          {getVerificationText(reporter.verification_badge)}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  {reporter.title && (
                    <p className="text-xl text-blue-100 mb-4 font-medium">
                      {reporter.title}
                    </p>
                  )}
                  
                  {reporter.bio && (
                    <p className="text-white/90 text-lg leading-relaxed max-w-3xl mx-auto lg:mx-0">
                      {reporter.bio}
                    </p>
                  )}

                  {/* Quick Stats */}
                  {stats && (
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
                      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                        <div className="text-2xl font-bold text-white">{stats.totalArticles}</div>
                        <div className="text-blue-100 text-sm">مقال</div>
                      </div>
                      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                        <div className="text-2xl font-bold text-white">
                          {stats.totalViews > 1000 ? `${(stats.totalViews / 1000).toFixed(1)}ك` : stats.totalViews}
                        </div>
                        <div className="text-blue-100 text-sm">مشاهدة</div>
                      </div>
                      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                        <div className="text-2xl font-bold text-white">{stats.totalLikes}</div>
                        <div className="text-blue-100 text-sm">إعجاب</div>
                      </div>
                      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                        <div className="text-2xl font-bold text-white">{Math.round(stats.avgReadingTime)}</div>
                        <div className="text-blue-100 text-sm">دقيقة قراءة</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Articles Section */}
            <div className={`rounded-2xl shadow-lg overflow-hidden ${
              darkMode ? 'bg-gray-800' : 'bg-white'
            }`}>
              {/* Header */}
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <FileText className={`w-6 h-6 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                    <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                      مقالات {reporter.full_name}
                    </h2>
                  </div>
                  
                  {/* Tabs */}
                  <div className="flex bg-gray-100 dark:bg-gray-700 rounded-xl p-1">
                    <button
                      onClick={() => handleTabChange('recent')}
                      className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                        activeTab === 'recent'
                          ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow-sm'
                          : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
                      }`}
                    >
                      الأحدث
                    </button>
                    <button
                      onClick={() => handleTabChange('popular')}
                      className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                        activeTab === 'popular'
                          ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow-sm'
                          : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
                      }`}
                    >
                      الأكثر قراءة
                    </button>
                  </div>
                </div>

                {/* Search */}
                <div className="mt-4">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="البحث في مقالات المراسل..."
                      value={searchTerm}
                      onChange={(e) => handleSearch(e.target.value)}
                      className={`w-full pl-10 pr-4 py-3 rounded-xl border transition-colors ${
                        darkMode 
                          ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                          : 'bg-gray-50 border-gray-200 text-gray-800 placeholder-gray-500'
                      } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                    />
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
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
                        <div className="w-24 h-24 bg-gray-300 dark:bg-gray-600 rounded-xl"></div>
                        <div className="flex-1 space-y-2">
                          <div className="h-5 bg-gray-300 dark:bg-gray-600 rounded w-3/4"></div>
                          <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-full"></div>
                          <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/2"></div>
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
                        className={`group block p-4 rounded-xl transition-all duration-200 hover:shadow-md ${
                          darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex gap-4">
                          {/* Image */}
                          <div className="flex-shrink-0">
                            <div className="w-24 h-24 rounded-xl overflow-hidden">
                              <CloudImage
                                src={article.image_url}
                                alt={article.title}
                                width={96}
                                height={96}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                                fallbackType="article"
                              />
                            </div>
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            {/* Category */}
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-lg">{article.category_icon}</span>
                              <span className={`text-sm font-medium ${
                                darkMode ? 'text-blue-400' : 'text-blue-600'
                              }`}>
                                {article.category_name}
                              </span>
                            </div>

                            {/* Title */}
                            <h3 className={`font-bold text-lg mb-2 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors ${
                              darkMode ? 'text-white' : 'text-gray-800'
                            }`}>
                              {article.title}
                            </h3>

                            {/* Summary */}
                            <p className={`text-sm mb-3 line-clamp-2 ${
                              darkMode ? 'text-gray-400' : 'text-gray-600'
                            }`}>
                              {article.summary}
                            </p>

                            {/* Meta */}
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

                              <div className="flex items-center gap-3">
                                <div className="flex items-center gap-1">
                                  <Eye className="w-4 h-4 text-gray-400" />
                                  <span className="text-sm text-gray-500">{article.views}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Heart className="w-4 h-4 text-gray-400" />
                                  <span className="text-sm text-gray-500">{article.likes}</span>
                                </div>
                                <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
                              </div>
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <FileText className={`w-16 h-16 mx-auto mb-4 ${
                      darkMode ? 'text-gray-600' : 'text-gray-400'
                    }`} />
                    <h3 className={`text-xl font-semibold mb-2 ${
                      darkMode ? 'text-gray-300' : 'text-gray-600'
                    }`}>
                      لا توجد مقالات
                    </h3>
                    <p className={`text-sm ${
                      darkMode ? 'text-gray-500' : 'text-gray-500'
                    }`}>
                      لم يقم هذا المراسل بنشر أي مقالات بعد
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* About */}
            <div className={`rounded-2xl shadow-lg p-6 ${
              darkMode ? 'bg-gray-800' : 'bg-white'
            }`}>
              <h3 className={`text-xl font-bold mb-4 ${
                darkMode ? 'text-white' : 'text-gray-800'
              }`}>
                معلومات المراسل
              </h3>

              <div className="space-y-4">
                {/* Specializations */}
                {reporter.specializations && reporter.specializations.length > 0 && (
                  <div>
                    <h4 className={`font-semibold mb-2 ${
                      darkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      التخصصات
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {reporter.specializations.map((spec, index) => (
                        <span
                          key={index}
                          className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 px-3 py-1 rounded-full text-sm font-medium"
                        >
                          {spec}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Coverage Areas */}
                {reporter.coverage_areas && reporter.coverage_areas.length > 0 && (
                  <div>
                    <h4 className={`font-semibold mb-2 ${
                      darkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      نطاق التغطية
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {reporter.coverage_areas.map((area, index) => (
                        <span
                          key={index}
                          className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1"
                        >
                          <MapPin className="w-3 h-3" />
                          {area}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Join Date */}
                <div className="flex items-center gap-2">
                  <Calendar className={`w-4 h-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                  <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    انضم في {formatDateGregorian(reporter.created_at)}
                  </span>
                </div>
              </div>
            </div>

            {/* Contact Links */}
            {(reporter.twitter_url || reporter.linkedin_url || reporter.website_url || reporter.email_public) && (
              <div className={`rounded-2xl shadow-lg p-6 ${
                darkMode ? 'bg-gray-800' : 'bg-white'
              }`}>
                <h3 className={`text-xl font-bold mb-4 ${
                  darkMode ? 'text-white' : 'text-gray-800'
                }`}>
                  تواصل معنا
                </h3>

                <div className="space-y-3">
                  {reporter.twitter_url && (
                    <a
                      href={reporter.twitter_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 rounded-xl bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors group"
                    >
                      <Twitter className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      <span className={`font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        تويتر
                      </span>
                      <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 mr-auto" />
                    </a>
                  )}

                  {reporter.linkedin_url && (
                    <a
                      href={reporter.linkedin_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 rounded-xl bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors group"
                    >
                      <Linkedin className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      <span className={`font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        لينكد إن
                      </span>
                      <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 mr-auto" />
                    </a>
                  )}

                  {reporter.website_url && (
                    <a
                      href={reporter.website_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 rounded-xl bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors group"
                    >
                      <Globe className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      <span className={`font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        الموقع الشخصي
                      </span>
                      <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 mr-auto" />
                    </a>
                  )}

                  {reporter.email_public && (
                    <a
                      href={`mailto:${reporter.email_public}`}
                      className="flex items-center gap-3 p-3 rounded-xl bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors group"
                    >
                      <Mail className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      <span className={`font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        البريد الإلكتروني
                      </span>
                      <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 mr-auto" />
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