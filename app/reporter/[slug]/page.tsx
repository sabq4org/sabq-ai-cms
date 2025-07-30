'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { 
  User, MapPin, Calendar, ExternalLink, Eye, Heart, 
  BookOpen, Award, Star, MessageSquare, Clock,
  Twitter, Linkedin, Globe, Mail, CheckCircle2,
  TrendingUp, FileText, ArrowLeft, ChevronRight,
  BarChart3, Zap, Sparkles, Target, Trophy,
  Brain, Activity, Share2, Users, MoreHorizontal
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

// مساعد وظائف للتحقق والشارات
function getVerificationIcon(badge: string) {
  switch (badge) {
    case 'expert':
      return <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />;
    case 'senior':
      return <Award className="w-3 h-3 text-orange-400 fill-orange-400" />;
    default:
      return <CheckCircle2 className="w-3 h-3 text-green-400 fill-green-400" />;
  }
}

function getVerificationText(badge: string) {
  switch (badge) {
    case 'expert':
      return 'خبير';
    case 'senior':
      return 'محرر أول';
    default:
      return 'معتمد';
  }
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

  // تم حذف التعريف المكرر - الدالة معرفة في أعلى الملف

  // تم حذف التعريف المكرر - الدالة معرفة في أعلى الملف

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
    <div className={`min-h-screen transition-all duration-300 ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Hero Card - بارز */}
      <div className="container mx-auto px-4 py-8">
        <div className={`rounded-2xl shadow-lg border p-6 ${
          darkMode 
            ? 'bg-gradient-to-r from-slate-800 to-slate-700 border-slate-600/50' 
            : 'bg-gradient-to-r from-slate-50 to-blue-50 border-slate-200'
        }`}>
          <div className="flex flex-col lg:flex-row items-center lg:items-start gap-6">
            
            {/* صورة شخصية دائرية */}
            <div className="relative">
              <div className="w-24 h-24 lg:w-32 lg:h-32 rounded-full overflow-hidden ring-4 ring-blue-200 dark:ring-slate-600 shadow-lg">
                <CloudImage
                  src={reporter.avatar_url}
                  alt={reporter.full_name}
                  width={128}
                  height={128}
                  className="w-full h-full object-cover"
                  fallbackType="author"
                />
              </div>
              
              {/* شارة التحقق */}
              {reporter.is_verified && (
                <div className="absolute -bottom-1 -right-1">
                  <div className={`flex items-center gap-1 px-2 py-1 rounded-full shadow-md ${
                    darkMode 
                      ? 'bg-emerald-600 border border-emerald-500/50'
                      : 'bg-emerald-500 border border-emerald-400/50'
                  }`}>
                    {getVerificationIcon(reporter.verification_badge)}
                    <span className="text-white font-bold text-xs">
                      {getVerificationText(reporter.verification_badge)}
                    </span>
                  </div>
                </div>
              )}

              {/* مؤشر AI */}
              <div className="absolute -top-1 -left-1">
                <div className={`flex items-center gap-1 px-2 py-1 rounded-full shadow-md ${
                  darkMode 
                    ? 'bg-blue-600'
                    : 'bg-blue-500'
                }`}>
                  <Brain className="w-3 h-3 text-white" />
                  <span className="text-white font-bold text-xs">AI</span>
                </div>
              </div>
            </div>

            {/* معلومات أساسية */}
            <div className="flex-1 text-center lg:text-right">
              <h1 className={`text-2xl lg:text-3xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {reporter.full_name}
              </h1>
              {reporter.title && (
                <p className={`text-base lg:text-lg font-medium mb-3 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                  {reporter.title}
                </p>
              )}
              
              {/* إحصائيات سريعة */}
              {stats && (
                <div className="flex flex-wrap justify-center lg:justify-start gap-4 text-sm">
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
            </div>
          </div>
        </div>
      </div>

      {/* نبذة تحريرية */}
      {reporter.bio && (
        <div className="container mx-auto px-4 mb-6">
          <div className={`rounded-2xl shadow-lg border p-4 ${
            darkMode ? 'bg-slate-800 border-slate-600/50' : 'bg-white border-slate-200'
          }`}>
            <div className="flex items-center gap-2 mb-3">
              <User className={`w-5 h-5 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
              <h2 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                نبذة تحريرية
              </h2>
            </div>
            <div className={`${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              <p className="line-clamp-2 leading-relaxed">
                {reporter.bio}
              </p>
              <button className={`mt-2 text-sm font-medium hover:underline ${
                darkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-500'
              }`}>
                عرض المزيد
              </button>
            </div>
          </div>
        </div>
      )}

      {/* إحصائيات سريعة في بطاقات منفصلة */}
      {stats && (
        <div className="container mx-auto px-4 mb-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {/* عدد المقالات */}
            <div className={`rounded-2xl shadow-lg border p-4 ${
              darkMode ? 'bg-slate-800 border-slate-600/50' : 'bg-white border-slate-200'
            }`}>
              <div className="flex items-center gap-2 mb-2">
                <FileText className="w-5 h-5 text-blue-600" />
                <span className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  المقالات
                </span>
              </div>
              <div className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {stats.totalArticles}
              </div>
              <div className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                {stats.thisMonthArticles} هذا الشهر
              </div>
            </div>

            {/* عدد المشاهدات */}
            <div className={`rounded-2xl shadow-lg border p-4 ${
              darkMode ? 'bg-slate-800 border-slate-600/50' : 'bg-white border-slate-200'
            }`}>
              <div className="flex items-center gap-2 mb-2">
                <Eye className="w-5 h-5 text-green-600" />
                <span className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  المشاهدات
                </span>
              </div>
              <div className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {stats.totalViews > 1000 ? `${(stats.totalViews / 1000).toFixed(1)}ك` : stats.totalViews}
              </div>
              <div className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                إجمالي القراءات
              </div>
            </div>

            {/* التفاعل */}
            <div className={`rounded-2xl shadow-lg border p-4 ${
              darkMode ? 'bg-slate-800 border-slate-600/50' : 'bg-white border-slate-200'
            }`}>
              <div className="flex items-center gap-2 mb-2">
                <Heart className="w-5 h-5 text-red-600" />
                <span className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  التفاعل
                </span>
              </div>
              <div className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {stats.totalLikes + stats.totalShares}
              </div>
              <div className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                إعجابات ومشاركات
              </div>
            </div>

            {/* متوسط الأداء */}
            <div className={`rounded-2xl shadow-lg border p-4 ${
              darkMode ? 'bg-slate-800 border-slate-600/50' : 'bg-white border-slate-200'
            }`}>
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-5 h-5 text-purple-600" />
                <span className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  الأداء
                </span>
              </div>
              <div className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {Math.round(stats.engagementRate)}%
              </div>
              <div className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                معدل التفاعل
              </div>
            </div>
          </div>
        </div>
      )}

      {/* كلمات مفتاحية للذكاء الاصطناعي */}
      <div className="container mx-auto px-4 mb-6">
        <div className={`rounded-2xl shadow-lg border p-4 ${
          darkMode ? 'bg-slate-800 border-slate-600/50' : 'bg-gray-100 border-gray-200'
        }`}>
          <div className="flex items-center gap-2 mb-3">
            <Brain className={`w-5 h-5 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
            <h2 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              كلمات مفتاحية ذكية
            </h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {['صحافة استقصائية', 'تحليل عميق', 'مصادر موثقة', 'تغطية حصرية', 'تقارير ميدانية'].map((tag, index) => (
              <span
                key={index}
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  darkMode 
                    ? 'bg-slate-700 text-slate-300 border border-slate-600'
                    : 'bg-white text-gray-700 border border-gray-300'
                }`}
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* تبويب المحتوى المنشور */}
      <div className="container mx-auto px-4 mb-6">
        <div className={`rounded-2xl shadow-lg border ${
          darkMode ? 'bg-slate-800 border-slate-600/50' : 'bg-white border-slate-200'
        }`}>
          {/* Tabs Header */}
          <div className="border-b border-gray-200 dark:border-slate-600">
            <div className="flex flex-wrap">
              {[
                { id: 'recent', label: 'الأحدث', icon: Clock },
                { id: 'popular', label: 'الأكثر قراءة', icon: Eye },
                { id: 'trending', label: 'الأكثر تفاعلاً', icon: TrendingUp }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
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

          {/* Articles Content */}
          <div className="p-4">
            {articles.length > 0 ? (
              <div className="grid gap-4">
                {articles.map((article) => (
                  <Link
                    key={article.id}
                    href={`/article/${article.slug}`}
                    className={`block p-4 rounded-xl border transition-all hover:shadow-md ${
                      darkMode 
                        ? 'bg-slate-700 border-slate-600 hover:bg-slate-600/50'
                        : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex gap-4">
                      {/* صورة مصغرة */}
                      <div className="w-20 h-16 rounded-lg overflow-hidden flex-shrink-0">
                        <CloudImage
                          src={article.image_url}
                          alt={article.title}
                          width={80}
                          height={64}
                          className="w-full h-full object-cover"
                          fallbackType="article"
                        />
                      </div>
                      
                      {/* محتوى */}
                      <div className="flex-1 min-w-0">
                        <h3 className={`font-semibold line-clamp-2 mb-2 ${
                          darkMode ? 'text-white' : 'text-gray-900'
                        }`}>
                          {article.title}
                        </h3>
                        
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
                            <Clock className="w-3 h-3" />
                            <span>{article.reading_time} د</span>
                          </div>
                        </div>
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
              <div className="text-center py-8">
                <FileText className={`w-12 h-12 mx-auto mb-3 ${darkMode ? 'text-gray-600' : 'text-gray-400'}`} />
                <h3 className={`text-lg font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
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

      {/* معلومات إضافية */}
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-3 gap-6">
          
          {/* التخصصات */}
          {reporter.specializations && reporter.specializations.length > 0 && (
            <div className={`rounded-2xl shadow-lg border p-4 ${
              darkMode ? 'bg-slate-800 border-slate-600/50' : 'bg-white border-slate-200'
            }`}>
              <h3 className={`text-lg font-semibold mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                التخصصات
              </h3>
              <div className="flex flex-wrap gap-2">
                {reporter.specializations.map((spec, index) => (
                  <span
                    key={index}
                    className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium"
                  >
                    {spec}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* نطاق التغطية */}
          {reporter.coverage_areas && reporter.coverage_areas.length > 0 && (
            <div className={`rounded-2xl shadow-lg border p-4 ${
              darkMode ? 'bg-slate-800 border-slate-600/50' : 'bg-white border-slate-200'
            }`}>
              <h3 className={`text-lg font-semibold mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                نطاق التغطية
              </h3>
              <div className="space-y-2">
                {reporter.coverage_areas.map((area, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-green-600" />
                    <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      {area}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* روابط التواصل */}
          {(reporter.twitter_url || reporter.linkedin_url || reporter.website_url || reporter.email_public) && (
            <div className={`rounded-2xl shadow-lg border p-4 ${
              darkMode ? 'bg-slate-800 border-slate-600/50' : 'bg-white border-slate-200'
            }`}>
              <h3 className={`text-lg font-semibold mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                تواصل
              </h3>
              <div className="space-y-3">
                {reporter.twitter_url && (
                  <a
                    href={reporter.twitter_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors"
                  >
                    <Twitter className="w-4 h-4" />
                    <span className="text-sm font-medium">تويتر</span>
                    <ExternalLink className="w-3 h-3 mr-auto" />
                  </a>
                )}

                {reporter.linkedin_url && (
                  <a
                    href={reporter.linkedin_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white transition-colors"
                  >
                    <Linkedin className="w-4 h-4" />
                    <span className="text-sm font-medium">لينكد إن</span>
                    <ExternalLink className="w-3 h-3 mr-auto" />
                  </a>
                )}

                {reporter.website_url && (
                  <a
                    href={reporter.website_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 rounded-lg bg-purple-600 hover:bg-purple-700 text-white transition-colors"
                  >
                    <Globe className="w-4 h-4" />
                    <span className="text-sm font-medium">الموقع الشخصي</span>
                    <ExternalLink className="w-3 h-3 mr-auto" />
                  </a>
                )}

                {reporter.email_public && (
                  <a
                    href={`mailto:${reporter.email_public}`}
                    className="flex items-center gap-3 p-3 rounded-lg bg-green-600 hover:bg-green-700 text-white transition-colors"
                  >
                    <Mail className="w-4 h-4" />
                    <span className="text-sm font-medium">البريد الإلكتروني</span>
                    <ExternalLink className="w-3 h-3 mr-auto" />
                  </a>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReporterProfilePage;
