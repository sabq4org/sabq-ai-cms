'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { 
  User, Mail, Calendar, MapPin, Briefcase, BookOpen, 
  Eye, Heart, MessageCircle, Clock, Share2, Award,
  Star, TrendingUp, Quote, CheckCircle, Filter,
  ChevronLeft, ChevronRight, ArrowLeft, ExternalLink,
  Twitter, Facebook, Instagram, Linkedin, Globe,
  Users, Target, Zap, Activity, BarChart3
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useDarkMode } from "@/hooks/useDarkMode";

export default function FatimaAlzahraniPage() {
  const { darkMode } = useDarkMode();

  // بيانات تجريبية للكاتبة فاطمة الزهراني
  const author = {
    id: 'fatima-alzahrani',
    full_name: 'فاطمة الزهراني',
    title: 'محررة تقنية وكاتبة رأي',
    bio: 'كاتبة متخصصة في التقنية والابتكار، تركز على تأثير التكنولوجيا على المجتمع السعودي. تحمل شهادة في علوم الحاسب وخبرة تزيد عن 8 سنوات في الصحافة التقنية.',
    specializations: ['التقنية', 'الابتكار', 'الذكاء الاصطناعي', 'التحول الرقمي'],
    location: 'الرياض، المملكة العربية السعودية',
    email: 'fatima.alzahrani@sabq.ai',
    website: 'https://fatima-tech.com',
    social_media: {
      twitter: 'https://twitter.com/fatima_tech',
      linkedin: 'https://linkedin.com/in/fatima-alzahrani',
      instagram: 'https://instagram.com/fatima_tech_writer'
    },
    verification_status: 'expert',
    joined_date: '2020-03-15T10:00:00Z',
    avatar_url: 'https://images.unsplash.com/photo-1494790108755-2616b612b602?auto=format&fit=crop&w=400&q=80',
    cover_image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80'
  };

  const stats = {
    total_articles: 127,
    total_views: 450000,
    total_likes: 12500,
    this_month_articles: 8,
    this_month_views: 35000,
    avg_reading_time: 6,
    avg_views_per_article: 3543,
    engagement_rate: 2.8,
    top_categories: [
      { name: 'التقنية', count: 45, color: '#3B82F6' },
      { name: 'الذكاء الاصطناعي', count: 32, color: '#8B5CF6' },
      { name: 'الابتكار', count: 28, color: '#10B981' },
      { name: 'التحول الرقمي', count: 22, color: '#F59E0B' }
    ]
  };

  const articles = [
    {
      id: 'ai-future-2024',
      title: 'مستقبل الذكاء الاصطناعي في المملكة 2024',
      excerpt: 'نظرة شاملة على التطورات المتوقعة في مجال الذكاء الاصطناعي والتقنيات الناشئة في المملكة العربية السعودية خلال العام الجاري.',
      featured_image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=800&q=80',
      published_at: '2024-12-30T15:30:00Z',
      views: 8500,
      likes: 245,
      reading_time: 8,
      article_type: 'opinion',
      category: {
        id: 'tech',
        name: 'التقنية',
        color: '#3B82F6'
      }
    },
    {
      id: 'digital-transformation-saudi',
      title: 'التحول الرقمي في القطاع الحكومي السعودي',
      excerpt: 'تحليل معمق للجهود المبذولة في تطوير الخدمات الحكومية الرقمية وأثرها على تحسين تجربة المواطنين.',
      featured_image: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?auto=format&fit=crop&w=800&q=80',
      published_at: '2024-12-28T12:00:00Z',
      views: 6200,
      likes: 178,
      reading_time: 6,
      article_type: 'analysis',
      category: {
        id: 'digital',
        name: 'التحول الرقمي',
        color: '#F59E0B'
      }
    },
    {
      id: 'women-tech-leadership',
      title: 'دور المرأة السعودية في قيادة التقنية',
      excerpt: 'استعراض للإنجازات المتميزة للمرأة السعودية في قطاع التقنية والتحديات والفرص المستقبلية.',
      featured_image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=800&q=80',
      published_at: '2024-12-25T14:15:00Z',
      views: 9100,
      likes: 312,
      reading_time: 7,
      article_type: 'opinion',
      category: {
        id: 'society',
        name: 'المجتمع',
        color: '#10B981'
      }
    }
  ];

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getVerificationBadge = (status: string) => {
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

  const verification = getVerificationBadge(author.verification_status);

  return (
    <div className={cn(
      "min-h-screen transition-colors duration-300",
      darkMode ? "bg-gray-900" : "bg-gray-50"
    )}>
      {/* Cover Image */}
      <div className="relative h-64 md:h-80 overflow-hidden">
        <Image
          src={author.cover_image}
          alt={author.full_name}
          fill
          className="object-cover"
          priority
        />
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
                  <Image
                    src={author.avatar_url}
                    alt={author.full_name}
                    width={160}
                    height={160}
                    className="rounded-full border-4 border-white shadow-lg"
                  />
                  
                  {verification && (
                    <div className="absolute -bottom-2 -right-2 bg-white rounded-full p-2 shadow-lg">
                      <verification.icon className={cn("w-6 h-6", verification.color)} />
                    </div>
                  )}
                </div>

                {/* Social Links */}
                <div className="flex gap-3 mb-6">
                  {Object.entries(author.social_media).map(([platform, url]) => {
                    const Icon = platform === 'twitter' ? Twitter :
                               platform === 'linkedin' ? Linkedin :
                               platform === 'instagram' ? Instagram : Globe;
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
                </div>
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

                    <p className={cn(
                      "text-base leading-relaxed mb-6",
                      darkMode ? "text-gray-300" : "text-gray-700"
                    )}>
                      {author.bio}
                    </p>

                    {/* Specializations */}
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

                    {/* Additional Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center gap-2 text-gray-500">
                        <MapPin className="w-4 h-4" />
                        {author.location}
                      </div>
                      <div className="flex items-center gap-2 text-gray-500">
                        <Mail className="w-4 h-4" />
                        <a href={`mailto:${author.email}`} className="hover:text-blue-600">
                          {author.email}
                        </a>
                      </div>
                      <div className="flex items-center gap-2 text-gray-500">
                        <Calendar className="w-4 h-4" />
                        عضو منذ {formatDate(author.joined_date)}
                      </div>
                      <div className="flex items-center gap-2 text-gray-500">
                        <Globe className="w-4 h-4" />
                        <a href={author.website} target="_blank" rel="noopener noreferrer" className="hover:text-blue-600">
                          الموقع الشخصي
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Section */}
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
              {stats.avg_reading_time}
            </div>
            <div className="text-sm text-gray-500">متوسط وقت القراءة (دقيقة)</div>
          </div>
        </div>

        {/* Top Categories */}
        <div className={cn(
          "rounded-xl p-6 mb-8 transition-colors duration-300",
          darkMode ? "bg-gray-800" : "bg-white"
        )}>
          <h3 className={cn(
            "text-xl font-bold mb-6",
            darkMode ? "text-white" : "text-gray-900"
          )}>
            التصنيفات الرئيسية
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.top_categories.map((category, index) => (
              <div key={index} className="text-center">
                <div 
                  className="w-12 h-12 rounded-full mx-auto mb-2 flex items-center justify-center text-white font-bold"
                  style={{ backgroundColor: category.color }}
                >
                  {category.count}
                </div>
                <div className={cn(
                  "text-sm font-medium",
                  darkMode ? "text-gray-300" : "text-gray-700"
                )}>
                  {category.name}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Articles Section */}
        <div className={cn(
          "rounded-xl p-6 transition-colors duration-300",
          darkMode ? "bg-gray-800" : "bg-white"
        )}>
          <h3 className={cn(
            "text-xl font-bold mb-6",
            darkMode ? "text-white" : "text-gray-900"
          )}>
            أحدث المقالات
          </h3>

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
                  <Image
                    src={article.featured_image}
                    alt={article.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  
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
                  <div className="absolute bottom-4 right-4">
                    <span 
                      className="px-2 py-1 rounded text-xs font-medium text-white"
                      style={{ backgroundColor: article.category.color }}
                    >
                      {article.category.name}
                    </span>
                  </div>
                </div>

                {/* Article Content */}
                <div className="p-6">
                  <h4 className={cn(
                    "text-lg font-bold mb-3 line-clamp-2 group-hover:text-blue-600 transition-colors",
                    darkMode ? "text-white" : "text-gray-900"
                  )}>
                    {article.title}
                  </h4>

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

          {/* View All Articles Button */}
          <div className="text-center mt-8">
            <Link
              href="/opinion-articles"
              className={cn(
                "inline-flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors",
                darkMode 
                  ? "bg-blue-600 hover:bg-blue-700 text-white" 
                  : "bg-blue-600 hover:bg-blue-700 text-white"
              )}
            >
              <BookOpen className="w-4 h-4" />
              عرض جميع المقالات
              <ArrowLeft className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}