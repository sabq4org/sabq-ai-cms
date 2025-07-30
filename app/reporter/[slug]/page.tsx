'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  User, MapPin, Calendar, ExternalLink, Eye, Heart, Share2,
  BarChart3, TrendingUp, FileText, Clock, CheckCircle,
  Twitter, Linkedin, Globe, Mail, Filter, Search,
  BookOpen, Award, Star, MessageSquare
} from 'lucide-react';
import CloudImage from '@/components/ui/CloudImage';
import { formatDateGregorian } from '@/lib/date-utils';
import { useDarkModeContext } from '@/contexts/DarkModeContext';
import toast from 'react-hot-toast';

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

interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  featured_image: string;
  published_at: string;
  views: number;
  likes: number;
  shares: number;
  reading_time: number;
  category: {
    name: string;
    color: string;
  };
}

interface ReporterStats {
  weeklyViews: number;
  monthlyViews: number;
  totalEngagement: number;
  avgEngagementRate: number;
  topCategories: Array<{ name: string; count: number; percentage: number }>;
  recentArticles: Article[];
  popularArticles: Article[];
  trendingTopics: string[];
}

export default function ReporterProfilePage() {
  const { darkMode } = useDarkModeContext();
  const params = useParams();
  const slug = params.slug as string;
  
  const [reporter, setReporter] = useState<Reporter | null>(null);
  const [stats, setStats] = useState<ReporterStats | null>(null);
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');

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
      const articlesResponse = await fetch(`/api/reporters/${slug}/articles`);
      if (articlesResponse.ok) {
        const articlesData = await articlesResponse.json();
        setArticles(articlesData.articles);
      }
      
    } catch (error) {
      console.error('خطأ في جلب بيانات المراسل:', error);
      toast.error('حدث خطأ في تحميل بيانات المراسل');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">جاري تحميل بيانات المراسل...</p>
        </div>
      </div>
    );
  }

  if (!reporter) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <User className="w-24 h-24 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-2">
            المراسل غير موجود
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            عذراً، لم نتمكن من العثور على المراسل المطلوب
          </p>
        </div>
      </div>
    );
  }

  const getVerificationIcon = (badge: string) => {
    switch (badge) {
      case 'expert': return <Award className="w-5 h-5 text-purple-600" />;
      case 'senior': return <Star className="w-5 h-5 text-yellow-600" />;
      default: return <CheckCircle className="w-5 h-5 text-blue-600" />;
    }
  };

  const getVerificationText = (badge: string) => {
    switch (badge) {
      case 'expert': return 'خبير معتمد';
      case 'senior': return 'محرر أول';
      default: return 'مراسل معتمد';
    }
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="max-w-7xl mx-auto px-4 py-8">
        
        {/* بطاقة الهوية */}
        <Card className={`mb-8 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}>
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-8">
              
              {/* صورة المراسل */}
              <div className="relative">
                <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700">
                  {reporter.avatar_url ? (
                    <CloudImage
                      src={reporter.avatar_url}
                      alt={reporter.full_name}
                      width={128}
                      height={128}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <User className="w-16 h-16 text-gray-400" />
                    </div>
                  )}
                </div>
                
                {/* شارة التحقق */}
                {reporter.is_verified && (
                  <div className="absolute -bottom-2 -right-2 bg-white dark:bg-gray-800 rounded-full p-2 shadow-lg border border-gray-200 dark:border-gray-600">
                    {getVerificationIcon(reporter.verification_badge)}
                  </div>
                )}
              </div>
              
              {/* معلومات المراسل */}
              <div className="flex-1">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                      {reporter.full_name}
                    </h1>
                    
                    {reporter.title && (
                      <p className="text-lg text-blue-600 dark:text-blue-400 font-medium mb-3">
                        {reporter.title}
                      </p>
                    )}
                    
                    {reporter.is_verified && (
                      <div className="flex items-center gap-2 mb-4">
                        {getVerificationIcon(reporter.verification_badge)}
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                          {getVerificationText(reporter.verification_badge)}
                        </span>
                      </div>
                    )}
                    
                    {reporter.bio && (
                      <p className="text-gray-700 dark:text-gray-300 leading-relaxed max-w-2xl">
                        {reporter.bio}
                      </p>
                    )}
                  </div>
                  
                  {/* روابط التواصل */}
                  {reporter.show_contact && (
                    <div className="flex flex-row md:flex-col gap-3">
                      {reporter.twitter_url && (
                        <Button variant="outline" size="sm" asChild>
                          <a href={reporter.twitter_url} target="_blank" rel="noopener noreferrer">
                            <Twitter className="w-4 h-4" />
                          </a>
                        </Button>
                      )}
                      {reporter.linkedin_url && (
                        <Button variant="outline" size="sm" asChild>
                          <a href={reporter.linkedin_url} target="_blank" rel="noopener noreferrer">
                            <Linkedin className="w-4 h-4" />
                          </a>
                        </Button>
                      )}
                      {reporter.website_url && (
                        <Button variant="outline" size="sm" asChild>
                          <a href={reporter.website_url} target="_blank" rel="noopener noreferrer">
                            <Globe className="w-4 h-4" />
                          </a>
                        </Button>
                      )}
                      {reporter.email_public && (
                        <Button variant="outline" size="sm" asChild>
                          <a href={`mailto:${reporter.email_public}`}>
                            <Mail className="w-4 h-4" />
                          </a>
                        </Button>
                      )}
                    </div>
                  )}
                </div>
                
                {/* التخصصات ومناطق التغطية */}
                <div className="mt-6 flex flex-wrap gap-4">
                  
                  {/* التخصصات */}
                  {reporter.specializations && reporter.specializations.length > 0 && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                        التخصصات:
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {reporter.specializations.map((spec, index) => (
                          <Badge key={index} variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                            {spec}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* مناطق التغطية */}
                  {reporter.coverage_areas && reporter.coverage_areas.length > 0 && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                        التغطية الجغرافية:
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {reporter.coverage_areas.map((area, index) => (
                          <Badge key={index} variant="outline" className="border-green-200 text-green-800 dark:border-green-700 dark:text-green-300">
                            <MapPin className="w-3 h-3 mr-1" />
                            {area}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* إحصائيات سريعة */}
        {reporter.show_stats && stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Card className={darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}>
              <CardContent className="p-6 text-center">
                <FileText className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {reporter.total_articles.toLocaleString()}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">مقال</div>
              </CardContent>
            </Card>
            
            <Card className={darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}>
              <CardContent className="p-6 text-center">
                <Eye className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {reporter.total_views.toLocaleString()}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">مشاهدة</div>
              </CardContent>
            </Card>
            
            <Card className={darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}>
              <CardContent className="p-6 text-center">
                <Heart className="w-8 h-8 text-red-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {reporter.total_likes.toLocaleString()}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">إعجاب</div>
              </CardContent>
            </Card>
            
            <Card className={darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}>
              <CardContent className="p-6 text-center">
                <TrendingUp className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {(reporter.engagement_rate * 100).toFixed(1)}%
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">معدل التفاعل</div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* التبويبات الرئيسية */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">نظرة عامة</TabsTrigger>
            <TabsTrigger value="articles">المقالات</TabsTrigger>
            <TabsTrigger value="analytics">التحليلات</TabsTrigger>
            <TabsTrigger value="archive">الأرشيف</TabsTrigger>
          </TabsList>

          {/* نظرة عامة */}
          <TabsContent value="overview" className="mt-6">
            <div className="grid md:grid-cols-2 gap-6">
              
              {/* أحدث المقالات */}
              <Card className={darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    أحدث المقالات
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {stats?.recentArticles && stats.recentArticles.length > 0 ? (
                    <div className="space-y-4">
                      {stats.recentArticles.slice(0, 5).map((article) => (
                        <div key={article.id} className="border-b border-gray-200 dark:border-gray-700 pb-4 last:border-b-0">
                          <h4 className="font-medium text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer">
                            {article.title}
                          </h4>
                          <div className="flex items-center gap-4 mt-2 text-sm text-gray-600 dark:text-gray-400">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {formatDateGregorian(article.published_at)}
                            </span>
                            <span className="flex items-center gap-1">
                              <Eye className="w-3 h-3" />
                              {article.views.toLocaleString()}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                      لا توجد مقالات حديثة
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* الأكثر مشاهدة */}
              <Card className={darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    الأكثر مشاهدة
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {stats?.popularArticles && stats.popularArticles.length > 0 ? (
                    <div className="space-y-4">
                      {stats.popularArticles.slice(0, 5).map((article, index) => (
                        <div key={article.id} className="border-b border-gray-200 dark:border-gray-700 pb-4 last:border-b-0">
                          <div className="flex items-start gap-3">
                            <div className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                              {index + 1}
                            </div>
                            <div className="flex-1">
                              <h4 className="font-medium text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer">
                                {article.title}
                              </h4>
                              <div className="flex items-center gap-4 mt-2 text-sm text-gray-600 dark:text-gray-400">
                                <span className="flex items-center gap-1">
                                  <Eye className="w-3 h-3" />
                                  {article.views.toLocaleString()}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Heart className="w-3 h-3" />
                                  {article.likes.toLocaleString()}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                      لا توجد بيانات كافية
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* المقالات */}
          <TabsContent value="articles" className="mt-6">
            <Card className={darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}>
              <CardHeader>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <CardTitle>جميع المقالات ({articles.length})</CardTitle>
                  
                  {/* فلاتر البحث */}
                  <div className="flex flex-wrap gap-2">
                    <div className="relative">
                      <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        placeholder="البحث في المقالات..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white w-64"
                      />
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {articles.length > 0 ? (
                  <div className="space-y-6">
                    {articles.map((article) => (
                      <div key={article.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 hover:shadow-lg transition-shadow">
                        <div className="flex flex-col md:flex-row gap-4">
                          
                          {/* صورة المقال */}
                          {article.featured_image && (
                            <div className="w-full md:w-48 h-32 bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden flex-shrink-0">
                              <CloudImage
                                src={article.featured_image}
                                alt={article.title}
                                width={192}
                                height={128}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          )}
                          
                          {/* محتوى المقال */}
                          <div className="flex-1">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer mb-2">
                              {article.title}
                            </h3>
                            
                            {article.excerpt && (
                              <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
                                {article.excerpt}
                              </p>
                            )}
                            
                            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {formatDateGregorian(article.published_at)}
                              </span>
                              <span className="flex items-center gap-1">
                                <Eye className="w-3 h-3" />
                                {article.views.toLocaleString()} مشاهدة
                              </span>
                              <span className="flex items-center gap-1">
                                <Heart className="w-3 h-3" />
                                {article.likes.toLocaleString()} إعجاب
                              </span>
                              <span className="flex items-center gap-1">
                                <BookOpen className="w-3 h-3" />
                                {article.reading_time} دقيقة قراءة
                              </span>
                              {article.category && (
                                <Badge variant="outline">
                                  {article.category.name}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 dark:text-gray-400 text-center py-12">
                    لا توجد مقالات متاحة
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* التحليلات */}
          <TabsContent value="analytics" className="mt-6">
            <div className="grid md:grid-cols-2 gap-6">
              
              {/* التصنيفات الأكثر كتابة */}
              {stats?.topCategories && (
                <Card className={darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="w-5 h-5" />
                      التصنيفات الأكثر كتابة
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {stats.topCategories.map((category, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 bg-blue-600 rounded-full flex-shrink-0"></div>
                            <span className="text-gray-900 dark:text-white">{category.name}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              {category.count} مقال
                            </span>
                            <span className="text-sm font-medium text-blue-600">
                              {category.percentage.toFixed(1)}%
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* المواضيع الرائجة */}
              {reporter.popular_topics && reporter.popular_topics.length > 0 && (
                <Card className={darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="w-5 h-5" />
                      المواضيع الأكثر تناولاً
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {reporter.popular_topics.map((topic, index) => (
                        <Badge key={index} variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                          {topic}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* الأرشيف */}
          <TabsContent value="archive" className="mt-6">
            <Card className={darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  أرشيف المقالات
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    أرشيف شامل
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    تصفح الأرشيف الكامل للمراسل مع إمكانيات البحث والتصفية المتقدمة
                  </p>
                  <Button>
                    <ExternalLink className="w-4 h-4 mr-2" />
                    عرض الأرشيف الكامل
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}