'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  User, 
  Heart, 
  Target, 
  TrendingUp, 
  Clock, 
  Eye,
  Filter,
  Settings,
  BarChart3,
  Zap,
  CheckCircle
} from 'lucide-react';
import { useDarkModeContext } from '@/contexts/DarkModeContext';

interface Article {
  id: string;
  title: string;
  excerpt: string;
  category: string;
  tags: string[];
  featured_image: string;
  author: string;
  published_at: string;
  views: number;
  likes: number;
  shares: number;
}

interface PersonalizationStats {
  totalArticles: number;
  personalizedCount: number;
  relevancePercentage: number;
  userInterests: string[];
  articlesByCategory: Record<string, Article[]>;
}

export default function PersonalizedContent() {
  const { darkMode } = useDarkModeContext();
  const [articles, setArticles] = useState<Article[]>([]);
  const [stats, setStats] = useState<PersonalizationStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPersonalizedContent();
  }, []);

  const fetchPersonalizedContent = async () => {
    try {
      setLoading(true);
      
      // جلب تفضيلات المستخدم (محاكاة)
      const userInterests = ['رياضة', 'اقتصاد']; // في التطبيق الحقيقي، سيتم جلبها من localStorage أو API
      
      // جلب جميع المقالات
      const response = await fetch('/api/articles?status=published&limit=100');
      const data = await response.json();
      
      if (data.success && data.articles) {
        const allArticles = data.articles;
        
        // فلترة المقالات حسب الاهتمامات
        const personalizedArticles = allArticles.filter((article: Article) => 
          userInterests.includes(article.category)
        );
        
        // تجميع حسب التصنيف
        const articlesByCategory: Record<string, Article[]> = {};
        personalizedArticles.forEach((article: Article) => {
          if (!articlesByCategory[article.category]) {
            articlesByCategory[article.category] = [];
          }
          articlesByCategory[article.category].push(article);
        });
        
        // حساب الإحصائيات
        const relevancePercentage = allArticles.length > 0 
          ? Math.round((personalizedArticles.length / allArticles.length) * 100)
          : 0;
        
        setArticles(personalizedArticles);
        setStats({
          totalArticles: allArticles.length,
          personalizedCount: personalizedArticles.length,
          relevancePercentage,
          userInterests,
          articlesByCategory
        });
      } else {
        setError('فشل في جلب المقالات');
      }
    } catch (error) {
      console.error('Error fetching personalized content:', error);
      setError('حدث خطأ في جلب المحتوى المخصص');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'منذ أقل من ساعة';
    if (diffInHours < 24) return `منذ ${diffInHours} ساعة`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `منذ ${diffInDays} يوم`;
  };

  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'ك';
    }
    return num.toString();
  };

  if (loading) {
    return (
      <div className={`p-6 rounded-lg border ${
        darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      }`}>
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-300 rounded w-1/3"></div>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-20 bg-gray-300 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`p-6 rounded-lg border ${
        darkMode ? 'bg-red-900/20 border-red-700' : 'bg-red-50 border-red-200'
      }`}>
        <div className="text-center">
          <div className="text-red-500 text-lg font-semibold mb-2">خطأ في التحميل</div>
          <div className={`text-sm ${darkMode ? 'text-red-300' : 'text-red-600'}`}>
            {error}
          </div>
          <button
            onClick={fetchPersonalizedContent}
            className="mt-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
          >
            إعادة المحاولة
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* إحصائيات التخصيص */}
      {stats && (
        <div className={`p-6 rounded-lg border ${
          darkMode ? 'bg-gradient-to-r from-blue-900/20 to-purple-900/20 border-blue-700' : 'bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200'
        }`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3 space-x-reverse">
              <div className={`p-2 rounded-lg ${
                darkMode ? 'bg-blue-600' : 'bg-blue-500'
              }`}>
                <Target className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className={`font-bold text-lg ${
                  darkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  المحتوى المخصص لك
                </h3>
                <p className={`text-sm ${
                  darkMode ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  بناءً على اهتماماتك: {stats.userInterests.join(' • ')}
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className={`text-2xl font-bold ${
                darkMode ? 'text-blue-400' : 'text-blue-600'
              }`}>
                {stats.relevancePercentage}%
              </div>
              <div className={`text-xs ${
                darkMode ? 'text-gray-400' : 'text-gray-500'
              }`}>
                دقة التخصيص
              </div>
            </div>
          </div>

          {/* إحصائيات سريعة */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className={`p-3 rounded-lg ${
              darkMode ? 'bg-gray-800' : 'bg-white'
            }`}>
              <div className="flex items-center space-x-2 space-x-reverse">
                <BarChart3 className={`w-4 h-4 ${
                  darkMode ? 'text-green-400' : 'text-green-600'
                }`} />
                <span className={`text-sm ${
                  darkMode ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  مقالات مخصصة
                </span>
              </div>
              <div className={`text-lg font-bold ${
                darkMode ? 'text-green-400' : 'text-green-600'
              }`}>
                {stats.personalizedCount}
              </div>
            </div>

            <div className={`p-3 rounded-lg ${
              darkMode ? 'bg-gray-800' : 'bg-white'
            }`}>
              <div className="flex items-center space-x-2 space-x-reverse">
                <Eye className={`w-4 h-4 ${
                  darkMode ? 'text-blue-400' : 'text-blue-600'
                }`} />
                <span className={`text-sm ${
                  darkMode ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  إجمالي المقالات
                </span>
              </div>
              <div className={`text-lg font-bold ${
                darkMode ? 'text-blue-400' : 'text-blue-600'
              }`}>
                {stats.totalArticles}
              </div>
            </div>

            <div className={`p-3 rounded-lg ${
              darkMode ? 'bg-gray-800' : 'bg-white'
            }`}>
              <div className="flex items-center space-x-2 space-x-reverse">
                <Filter className={`w-4 h-4 ${
                  darkMode ? 'text-purple-400' : 'text-purple-600'
                }`} />
                <span className={`text-sm ${
                  darkMode ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  تصنيفات متطابقة
                </span>
              </div>
              <div className={`text-lg font-bold ${
                darkMode ? 'text-purple-400' : 'text-purple-600'
              }`}>
                {Object.keys(stats.articlesByCategory).length}
              </div>
            </div>

            <div className={`p-3 rounded-lg ${
              darkMode ? 'bg-gray-800' : 'bg-white'
            }`}>
              <div className="flex items-center space-x-2 space-x-reverse">
                <Zap className={`w-4 h-4 ${
                  darkMode ? 'text-yellow-400' : 'text-yellow-600'
                }`} />
                <span className={`text-sm ${
                  darkMode ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  حالة النظام
                </span>
              </div>
              <div className="flex items-center space-x-1 space-x-reverse">
                <CheckCircle className={`w-4 h-4 ${
                  darkMode ? 'text-green-400' : 'text-green-600'
                }`} />
                <span className={`text-sm font-semibold ${
                  darkMode ? 'text-green-400' : 'text-green-600'
                }`}>
                  نشط
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* المقالات المخصصة */}
      {stats && Object.keys(stats.articlesByCategory).length > 0 ? (
        <div className="space-y-6">
          {Object.entries(stats.articlesByCategory).map(([category, categoryArticles]) => (
            <div key={category} className={`rounded-lg border ${
              darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            }`}>
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <h3 className={`font-bold text-lg ${
                    darkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    📁 {category}
                  </h3>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    darkMode ? 'bg-blue-900/50 text-blue-300' : 'bg-blue-100 text-blue-800'
                  }`}>
                    {categoryArticles.length} مقال
                  </span>
                </div>
              </div>

              <div className="p-4 space-y-4">
                {categoryArticles.slice(0, 3).map((article) => (
                  <Link 
                    key={article.id} 
                    href={`/article/${article.id}`}
                    className="block group"
                  >
                    <div className={`p-4 rounded-lg border transition-all duration-200 ${
                      darkMode 
                        ? 'border-gray-600 hover:border-blue-500 hover:bg-gray-700/50' 
                        : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                    }`}>
                      <div className="flex items-start space-x-4 space-x-reverse">
                        {/* صورة المقال */}
                        <div className="flex-shrink-0">
                          <div className={`w-16 h-16 rounded-lg flex items-center justify-center ${
                            darkMode ? 'bg-gray-700' : 'bg-gray-200'
                          }`}>
                            <span className="text-2xl">📰</span>
                          </div>
                        </div>

                        {/* محتوى المقال */}
                        <div className="flex-1 min-w-0">
                          <h4 className={`font-semibold text-lg mb-2 group-hover:text-blue-600 transition-colors ${
                            darkMode ? 'text-white' : 'text-gray-900'
                          }`}>
                            {article.title}
                          </h4>
                          
                          <p className={`text-sm mb-3 line-clamp-2 ${
                            darkMode ? 'text-gray-300' : 'text-gray-600'
                          }`}>
                            {article.excerpt}
                          </p>

                          {/* معلومات إضافية */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4 space-x-reverse text-xs">
                              <span className={`flex items-center space-x-1 space-x-reverse ${
                                darkMode ? 'text-gray-400' : 'text-gray-500'
                              }`}>
                                <User className="w-3 h-3" />
                                <span>{article.author}</span>
                              </span>
                              
                              <span className={`flex items-center space-x-1 space-x-reverse ${
                                darkMode ? 'text-gray-400' : 'text-gray-500'
                              }`}>
                                <Clock className="w-3 h-3" />
                                <span>{formatDate(article.published_at)}</span>
                              </span>
                            </div>

                            <div className="flex items-center space-x-3 space-x-reverse text-xs">
                              <span className={`flex items-center space-x-1 space-x-reverse ${
                                darkMode ? 'text-gray-400' : 'text-gray-500'
                              }`}>
                                <Eye className="w-3 h-3" />
                                <span>{formatNumber(article.views)}</span>
                              </span>
                              
                              <span className={`flex items-center space-x-1 space-x-reverse ${
                                darkMode ? 'text-gray-400' : 'text-gray-500'
                              }`}>
                                <Heart className="w-3 h-3" />
                                <span>{formatNumber(article.likes)}</span>
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}

                {/* رابط عرض المزيد */}
                {categoryArticles.length > 3 && (
                  <div className="text-center pt-2">
                    <Link 
                      href={`/categories/${category}`}
                      className={`inline-flex items-center space-x-2 space-x-reverse px-4 py-2 rounded-lg font-medium transition-colors ${
                        darkMode 
                          ? 'text-blue-400 hover:bg-blue-900/20' 
                          : 'text-blue-600 hover:bg-blue-50'
                      }`}
                    >
                      <span>عرض جميع مقالات {category}</span>
                      <TrendingUp className="w-4 h-4" />
                    </Link>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* حالة عدم وجود محتوى مخصص */
        <div className={`p-8 text-center rounded-lg border ${
          darkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'
        }`}>
          <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 ${
            darkMode ? 'bg-gray-700' : 'bg-gray-200'
          }`}>
            <Settings className={`w-8 h-8 ${
              darkMode ? 'text-gray-400' : 'text-gray-500'
            }`} />
          </div>
          
          <h3 className={`text-lg font-semibold mb-2 ${
            darkMode ? 'text-white' : 'text-gray-900'
          }`}>
            لا يوجد محتوى مخصص حالياً
          </h3>
          
          <p className={`text-sm mb-4 ${
            darkMode ? 'text-gray-300' : 'text-gray-600'
          }`}>
            قم بتخصيص اهتماماتك لرؤية محتوى مناسب لك
          </p>
          
          <Link 
            href="/welcome/preferences"
            className="inline-flex items-center space-x-2 space-x-reverse px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Settings className="w-4 h-4" />
            <span>تخصيص الاهتمامات</span>
          </Link>
        </div>
      )}
    </div>
  );
} 