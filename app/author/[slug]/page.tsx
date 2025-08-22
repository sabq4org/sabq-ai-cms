'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { useDarkModeContext } from '@/contexts/DarkModeContext';
import { 
  User, Mail, Calendar, MapPin, Briefcase, BookOpen, 
  Eye, Heart, MessageCircle, Clock, Share2, Award,
  Star, TrendingUp, Quote, CheckCircle, Filter,
  ChevronLeft, ChevronRight, ArrowLeft, ExternalLink,
  Twitter, Facebook, Instagram, Linkedin, Globe,
  Users, Target, Zap, Activity, BarChart3
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Author {
  id: string;
  full_name: string;
  slug: string;
  title: string;
  bio?: string;
  avatar_url?: string;
  cover_image?: string;
  specializations?: string[];
  location?: string;
  email?: string;
  website?: string;
  social_media?: {
    twitter?: string;
    linkedin?: string;
    instagram?: string;
    facebook?: string;
  };
  verification_status?: 'verified' | 'expert' | 'senior_editor' | null;
  joined_date?: string;
  total_articles?: number;
  total_views?: number;
  total_likes?: number;
  avg_reading_time?: number;
  featured_topics?: string[];
}

interface Article {
  id: string;
  title: string;
  excerpt: string;
  featured_image?: string;
  published_at: string;
  views: number;
  likes: number;
  reading_time: number;
  article_type: string;
  category?: {
    id: string;
    name: string;
    color: string;
  };
}

interface AuthorStats {
  total_articles: number;
  total_views: number;
  total_likes: number;
  this_month_articles: number;
  this_month_views: number;
  avg_reading_time: number;
  top_categories: Array<{ name: string; count: number; color: string }>;
  recent_activity: Array<{ type: string; date: string; title: string }>;
}

const ARTICLES_PER_PAGE = 9;

export default function AuthorPage() {
  const params = useParams();
  const rawSlug = params?.slug as string;
  const { darkMode } = useDarkModeContext();
  
  // فك ترميز الـ slug للتعامل مع الأسماء العربية
  const slug = rawSlug ? decodeURIComponent(rawSlug) : '';
  
  console.log('🔍 صفحة الكاتب:', {
    rawSlug,
    decodedSlug: slug,
    areEqual: rawSlug === slug
  });
  
  const [author, setAuthor] = useState<Author | null>(null);
  const [articles, setArticles] = useState<Article[]>([]);
  const [stats, setStats] = useState<AuthorStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [articlesLoading, setArticlesLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'recent' | 'popular' | 'most_liked'>('recent');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // جلب بيانات الكاتب
  useEffect(() => {
    if (slug) {
      fetchAuthorData();
    }
  }, [slug]);

  // جلب المقالات عند تغيير التبويب
  useEffect(() => {
    if (author) {
      fetchArticles(true);
    }
  }, [activeTab, author]);

  const fetchAuthorData = async () => {
    try {
      setLoading(true);
      
      // جلب بيانات الكاتب الأساسية
      const authorResponse = await fetch(`/api/writers/${slug}`);
      if (!authorResponse.ok) {
        throw new Error('الكاتب غير موجود');
      }
      
      const authorData = await authorResponse.json();
      if (authorData.success) {
        setAuthor(authorData.writer);
        
        // جلب الإحصائيات
        const statsResponse = await fetch(`/api/writers/${slug}/stats`);
        if (statsResponse.ok) {
          const statsData = await statsResponse.json();
          setStats(statsData.stats);
        }
      }
    } catch (error) {
      console.error('خطأ في جلب بيانات الكاتب:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchArticles = async (reset = false) => {
    try {
      setArticlesLoading(true);
      
      const currentPage = reset ? 1 : page;
      const sortParam = activeTab === 'recent' ? 'published_at' : 
                       activeTab === 'popular' ? 'views' : 'likes';
      
      const response = await fetch(
        `/api/writers/${slug}/articles?sort=${sortParam}&page=${currentPage}&limit=${ARTICLES_PER_PAGE}`
      );
      
      if (response.ok) {
        const data = await response.json();
        const newArticles = data.articles || [];
        
        if (reset) {
          setArticles(newArticles);
          setPage(1);
        } else {
          setArticles(prev => [...prev, ...newArticles]);
        }
        
        setHasMore(newArticles.length === ARTICLES_PER_PAGE);
      }
    } catch (error) {
      console.error('خطأ في جلب المقالات:', error);
    } finally {
      setArticlesLoading(false);
    }
  };

  const loadMore = () => {
    if (!articlesLoading && hasMore) {
      setPage(prev => prev + 1);
      fetchArticles(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getVerificationBadge = (status?: string) => {
    switch (status) {
      case 'verified':
        return { icon: CheckCircle, color: 'text-blue-500', label: 'كاتب معتمد' };
      case 'expert':
        return { icon: Award, color: 'text-purple-500', label: 'خبير' };
      case 'senior_editor':
        return { icon: Star, color: 'text-yellow-500', label: 'محرر أول' };
      default:
        return null;
    }
  };

  const getSocialIcon = (platform: string) => {
    switch (platform) {
      case 'twitter': return Twitter;
      case 'linkedin': return Linkedin;
      case 'instagram': return Instagram;
      case 'facebook': return Facebook;
      default: return Globe;
    }
  };

  if (loading) {
    return (
      <div className={cn(
        "min-h-screen flex items-center justify-center",
        darkMode ? "bg-gray-900" : "bg-gray-50"
      )}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!author) {
    return (
      <div className={cn(
        "min-h-screen flex items-center justify-center",
        darkMode ? "bg-gray-900 text-white" : "bg-gray-50 text-gray-900"
      )}>
        <div className="text-center max-w-md">
          <User className="w-24 h-24 mx-auto mb-4 text-gray-400" />
          <h1 className="text-2xl font-bold mb-2">الكاتب غير موجود</h1>
          <p className="text-gray-500 mb-4">عذراً، لم نتمكن من العثور على الكاتب المطلوب</p>
          
          {/* معلومات تشخيصية للمطور فقط */}
          {process.env.NODE_ENV === 'development' && (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-6 text-left">
              <h3 className="text-sm font-semibold text-yellow-800 dark:text-yellow-200 mb-2">معلومات التشخيص</h3>
              <pre className="text-xs text-yellow-700 dark:text-yellow-300 overflow-auto">
                Raw Slug: {rawSlug}
                Decoded Slug: {slug}
                Are Equal: {String(rawSlug === slug)}
              </pre>
            </div>
          )}
          
          <div className="space-y-3">
            <Link 
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              العودة للرئيسية
            </Link>
            
            <div className="text-sm text-gray-400">
              أو جرب البحث في <Link href="/opinion" className="text-blue-500 hover:underline">صفحة قادة الرأي</Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const verification = getVerificationBadge(author.verification_status);

  return (
    <div className={cn(
      "min-h-screen transition-colors duration-300",
      darkMode ? "bg-gray-900" : "bg-gray-50"
    )}>
      {/* Cover Image */}
      <div className="relative h-64 md:h-80 overflow-hidden">
        {author.cover_image ? (
          <Image
            src={author.cover_image}
            alt={author.full_name}
            fill
            className="object-cover"
            priority
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-blue-600 to-purple-700" />
        )}
        <div className="absolute inset-0 bg-black bg-opacity-40" />
        
        {/* Navigation */}
        <div className="absolute top-6 right-6">
          <Link 
            href="/"
            className="inline-flex items-center gap-2 px-4 py-2 bg-black bg-opacity-50 text-white rounded-lg hover:bg-opacity-70 transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            العودة
          </Link>
        </div>
      </div>

      {/* Profile Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative -mt-24 mb-8">
          <div className={cn(
            "rounded-xl shadow-xl p-8 transition-colors duration-300",
            darkMode ? "bg-gray-800" : "bg-white"
          )}>
            <div className="flex flex-col lg:flex-row gap-8">
              {/* Avatar & Basic Info */}
              <div className="flex flex-col items-center lg:items-start">
                <div className="relative mb-6">
                  {author.avatar_url ? (
                    <Image
                      src={author.avatar_url}
                      alt={author.full_name}
                      width={160}
                      height={160}
                      className="rounded-full border-4 border-white shadow-lg"
                    />
                  ) : (
                    <div className="w-40 h-40 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center border-4 border-white shadow-lg">
                      <User className="w-16 h-16 text-white" />
                    </div>
                  )}
                  
                  {verification && (
                    <div className="absolute -bottom-2 -right-2 bg-white rounded-full p-2 shadow-lg">
                      <verification.icon className={cn("w-6 h-6", verification.color)} />
                    </div>
                  )}
                </div>

                {/* Social Links */}
                {author.social_media && (
                  <div className="flex gap-3 mb-6">
                    {Object.entries(author.social_media).map(([platform, url]) => {
                      if (!url) return null;
                      const Icon = getSocialIcon(platform);
                      return (
                        <a
                          key={platform}
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={cn(
                            "p-2 rounded-full transition-colors",
                            darkMode 
                              ? "bg-gray-700 hover:bg-gray-600 text-gray-300" 
                              : "bg-gray-100 hover:bg-gray-200 text-gray-600"
                          )}
                        >
                          <Icon className="w-5 h-5" />
                        </a>
                      );
                    })}
                    {author.website && (
                      <a
                        href={author.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={cn(
                          "p-2 rounded-full transition-colors",
                          darkMode 
                            ? "bg-gray-700 hover:bg-gray-600 text-gray-300" 
                            : "bg-gray-100 hover:bg-gray-200 text-gray-600"
                        )}
                      >
                        <Globe className="w-5 h-5" />
                      </a>
                    )}
                  </div>
                )}
              </div>

              {/* Author Details */}
              <div className="flex-1">
                <div className="flex flex-col lg:flex-row lg:items-start gap-6 mb-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h1 className={cn(
                        "text-3xl font-bold",
                        darkMode ? "text-white" : "text-gray-900"
                      )}>
                        {author.full_name}
                      </h1>
                      {verification && (
                        <span className={cn(
                          "text-sm px-3 py-1 rounded-full",
                          darkMode ? "bg-gray-700 text-gray-300" : "bg-gray-100 text-gray-600"
                        )}>
                          {verification.label}
                        </span>
                      )}
                    </div>

                    <p className={cn(
                      "text-lg mb-4",
                      darkMode ? "text-blue-400" : "text-blue-600"
                    )}>
                      {author.title}
                    </p>

                    {author.bio && (
                      <p className={cn(
                        "text-base leading-relaxed mb-6",
                        darkMode ? "text-gray-300" : "text-gray-700"
                      )}>
                        {author.bio}
                      </p>
                    )}

                    {/* Specializations */}
                    {author.specializations && author.specializations.length > 0 && (
                      <div className="mb-6">
                        <h3 className={cn(
                          "text-sm font-semibold mb-3",
                          darkMode ? "text-gray-400" : "text-gray-600"
                        )}>
                          التخصصات:
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {author.specializations.map((spec, index) => (
                            <span
                              key={index}
                              className={cn(
                                "px-3 py-1 rounded-full text-sm",
                                darkMode 
                                  ? "bg-blue-900 text-blue-300" 
                                  : "bg-blue-100 text-blue-800"
                              )}
                            >
                              {spec}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Additional Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      {author.location && (
                        <div className="flex items-center gap-2 text-gray-500">
                          <MapPin className="w-4 h-4" />
                          {author.location}
                        </div>
                      )}
                      {author.email && (
                        <div className="flex items-center gap-2 text-gray-500">
                          <Mail className="w-4 h-4" />
                          <a href={`mailto:${author.email}`} className="hover:text-blue-600">
                            {author.email}
                          </a>
                        </div>
                      )}
                      {author.joined_date && (
                        <div className="flex items-center gap-2 text-gray-500">
                          <Calendar className="w-4 h-4" />
                          عضو منذ {formatDate(author.joined_date)}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className={cn(
              "p-6 rounded-xl text-center transition-colors duration-300",
              darkMode ? "bg-gray-800" : "bg-white"
            )}>
              <BookOpen className="w-8 h-8 mx-auto mb-3 text-blue-600" />
              <div className={cn(
                "text-2xl font-bold mb-1",
                darkMode ? "text-white" : "text-gray-900"
              )}>
                {stats.total_articles}
              </div>
              <div className="text-sm text-gray-500">إجمالي المقالات</div>
            </div>

            <div className={cn(
              "p-6 rounded-xl text-center transition-colors duration-300",
              darkMode ? "bg-gray-800" : "bg-white"
            )}>
              <Eye className="w-8 h-8 mx-auto mb-3 text-green-600" />
              <div className={cn(
                "text-2xl font-bold mb-1",
                darkMode ? "text-white" : "text-gray-900"
              )}>
                {stats.total_views.toLocaleString()}
              </div>
              <div className="text-sm text-gray-500">إجمالي المشاهدات</div>
            </div>

            <div className={cn(
              "p-6 rounded-xl text-center transition-colors duration-300",
              darkMode ? "bg-gray-800" : "bg-white"
            )}>
              <Heart className="w-8 h-8 mx-auto mb-3 text-red-600" />
              <div className={cn(
                "text-2xl font-bold mb-1",
                darkMode ? "text-white" : "text-gray-900"
              )}>
                {stats.total_likes.toLocaleString()}
              </div>
              <div className="text-sm text-gray-500">إجمالي الإعجابات</div>
            </div>

            <div className={cn(
              "p-6 rounded-xl text-center transition-colors duration-300",
              darkMode ? "bg-gray-800" : "bg-white"
            )}>
              <Clock className="w-8 h-8 mx-auto mb-3 text-purple-600" />
              <div className={cn(
                "text-2xl font-bold mb-1",
                darkMode ? "text-white" : "text-gray-900"
              )}>
                {Math.round(stats.avg_reading_time)}
              </div>
              <div className="text-sm text-gray-500">متوسط وقت القراءة (دقيقة)</div>
            </div>
          </div>
        )}

        {/* Articles Section */}
        <div className={cn(
          "rounded-xl p-6 transition-colors duration-300",
          darkMode ? "bg-gray-800" : "bg-white"
        )}>
          {/* Tabs */}
          <div className="flex flex-wrap gap-2 mb-6 border-b border-gray-200 dark:border-gray-700">
            {[
              { key: 'recent', label: 'الأحدث', icon: Clock },
              { key: 'popular', label: 'الأكثر مشاهدة', icon: TrendingUp },
              { key: 'most_liked', label: 'الأكثر إعجاباً', icon: Heart }
            ].map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key as any)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors",
                  activeTab === key
                    ? "bg-blue-600 text-white"
                    : darkMode
                    ? "text-gray-300 hover:bg-gray-700"
                    : "text-gray-600 hover:bg-gray-100"
                )}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </div>

          {/* Articles Grid */}
          {articlesLoading && articles.length === 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className={cn(
                  "animate-pulse rounded-lg overflow-hidden",
                  darkMode ? "bg-gray-700" : "bg-gray-100"
                )}>
                  <div className="h-48 bg-gray-300 dark:bg-gray-600"></div>
                  <div className="p-6 space-y-4">
                    <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : articles.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <p className={cn(
                "text-lg",
                darkMode ? "text-gray-400" : "text-gray-600"
              )}>
                لا توجد مقالات متاحة حالياً
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {articles.map((article) => (
                  <Link 
                    key={article.id}
                    href={`/news/${article.slug || article.id}`}
                    className={cn(
                      "group block rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300",
                      darkMode ? "bg-gray-700 hover:bg-gray-650" : "bg-gray-50 hover:shadow-xl"
                    )}
                  >
                    {/* Article Image */}
                    <div className="relative h-48 overflow-hidden">
                      {article.featured_image ? (
                        <Image
                          src={article.featured_image}
                          alt={article.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className={cn(
                          "w-full h-full flex items-center justify-center",
                          darkMode ? "bg-gray-600" : "bg-gray-200"
                        )}>
                          <BookOpen className="w-12 h-12 text-gray-400" />
                        </div>
                      )}
                      
                      {/* Article Type Badge */}
                      <div className="absolute top-4 right-4">
                        <span className={cn(
                          "px-3 py-1 rounded-full text-xs font-medium",
                          article.article_type === 'opinion' 
                            ? "bg-purple-600 text-white"
                            : article.article_type === 'analysis'
                            ? "bg-blue-600 text-white"
                            : "bg-green-600 text-white"
                        )}>
                          {article.article_type === 'opinion' ? 'رأي' :
                           article.article_type === 'analysis' ? 'تحليل' : 'مقابلة'}
                        </span>
                      </div>

                      {/* Category */}
                      {article.category && (
                        <div className="absolute bottom-4 right-4">
                          <span 
                            className="px-2 py-1 rounded text-xs font-medium text-white"
                            style={{ backgroundColor: article.category.color }}
                          >
                            {article.category.name}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Article Content */}
                    <div className="p-6">
                      <h3 className={cn(
                        "text-lg font-bold mb-3 line-clamp-2 group-hover:text-blue-600 transition-colors",
                        darkMode ? "text-white" : "text-gray-900"
                      )}>
                        {article.title}
                      </h3>

                      <p className={cn(
                        "text-sm mb-4 line-clamp-3",
                        darkMode ? "text-gray-300" : "text-gray-600"
                      )}>
                        {article.excerpt}
                      </p>

                      {/* Article Stats */}
                      <div className="flex items-center justify-between text-xs text-gray-400">
                        <div className="flex items-center gap-4">
                          <span className="flex items-center gap-1">
                            <Eye className="w-3 h-3" />
                            {article.views.toLocaleString()}
                          </span>
                          <span className="flex items-center gap-1">
                            <Heart className="w-3 h-3" />
                            {article.likes}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {article.reading_time} د
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formatDate(article.published_at)}
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>

              {/* Load More Button */}
              {hasMore && (
                <div className="text-center mt-8">
                  <button
                    onClick={loadMore}
                    disabled={articlesLoading}
                    className={cn(
                      "px-8 py-3 rounded-lg font-medium transition-colors",
                      darkMode 
                        ? "bg-blue-600 hover:bg-blue-700 text-white" 
                        : "bg-blue-600 hover:bg-blue-700 text-white",
                      articlesLoading && "opacity-50 cursor-not-allowed"
                    )}
                  >
                    {articlesLoading ? 'جاري التحميل...' : 'تحميل المزيد'}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}