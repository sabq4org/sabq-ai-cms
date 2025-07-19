'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useDarkModeContext } from '@/contexts/DarkModeContext';
import { getValidImageUrl, generatePlaceholderImage } from '@/lib/cloudinary';

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
  CheckCircle,
  AlertCircle,
  Bookmark
} from 'lucide-react';



interface Article {
  id: string;
  title: string;
  excerpt: string;
  summary?: string;
  category: string;
  category_id?: number;
  tags: string[];
  featured_image: string;
  author: string;
  author_name?: string;
  published_at: string;
  views: number;
  views_count?: number;
  likes: number;
  likes_count?: number;
  shares: number;
  shares_count?: number;
  recommendation_reason?: string;
  category_weight?: number;
}

interface PersonalizationStats {
  totalArticles: number;
  personalizedCount: number;
  relevancePercentage: number;
  userInterests: string[];
  articlesByCategory: Record<string, Article[]>;
}

interface UserPreference {
  id: string;
  user_id: string;
  category_id: number;
  source: string;
  created_at: string;
  updated_at: string;
}

export default function PersonalizedContent() {
  const { darkMode } = useDarkModeContext();
  const [articles, setArticles] = useState<Article[]>([]);
  const [stats, setStats] = useState<PersonalizationStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [userPreferences, setUserPreferences] = useState<UserPreference[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [interactions, setInteractions] = useState<Record<string, { liked: boolean; saved: boolean }>>({});

  useEffect(() => {
    // جلب معرف المستخدم من localStorage
    const storedUserId = localStorage.getItem('user_id');
    if (storedUserId && storedUserId !== 'anonymous') {
      setUserId(storedUserId);
    }
    
    // جلب التصنيفات
    fetchCategories();
  }, []);

  useEffect(() => {
    if (userId) {
      fetchUserPreferences();
    } else {
      // إذا لم يكن هناك مستخدم مسجل، استخدم التفضيلات الافتراضية
      fetchPersonalizedContent();
    }
  }, [userId]);

  useEffect(() => {
    if (userPreferences.length > 0 || !userId) {
      fetchPersonalizedContent();
    }
  }, [userPreferences]);

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories');
      const data = await response.json();
      setCategories(data.categories || data.data || data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchUserPreferences = async () => {
    try {
      // جلب تفضيلات المستخدم من الملف
      const response = await fetch(`/api/user/preferences?userId=${userId}`);
      const data = await response.json();
      
      if (data.success && data.data) {
        setUserPreferences(data.data);
      }
    } catch (error) {
      console.error('Error fetching user preferences:', error);
    }
  };

  const fetchPersonalizedContent = async () => {
    try {
      setLoading(true);
      setError(null);
      
      let userInterests: string[] = [];
      let categoryIds: number[] = [];
      
      if (userId && userPreferences.length > 0) {
        // استخدام تفضيلات المستخدم الفعلية
        categoryIds = userPreferences.map(pref => pref.category_id);
        
        // تحويل معرفات التصنيفات إلى أسماء
        userInterests = categoryIds.map(id => {
          const category = categories.find(cat => cat.id === id);
          return category?.name || category?.name_ar || `تصنيف ${id}`;
        });
      } else {
        // تفضيلات افتراضية للزوار
        userInterests = ['رياضة', 'تقنية'];
        categoryIds = categories
          .filter(cat => userInterests.includes(cat.name) || userInterests.includes(cat.name_ar))
          .map(cat => cat.id);
      }
      
      if (userInterests.length === 0) {
        setError('لم يتم تحديد أي اهتمامات. يرجى تخصيص اهتماماتك أولاً.');
        setArticles([]);
        setLoading(false);
        return;
      }
      
      // جلب المقالات المخصصة
      if (userId) {
        // للمستخدمين المسجلين - استخدام API المخصص
        const response = await fetch(`/api/content/personalized?user_id=${userId}&limit=50`);
        const data = await response.json();
        
        if (data.success && data.data) {
          const personalizedArticles = data.data.articles || [];
          processArticles(personalizedArticles, userInterests, categoryIds);
        } else {
          throw new Error('فشل في جلب المحتوى المخصص');
        }
      } else {
        // للزوار - جلب وتصفية المقالات يدوياً
        const response = await fetch('/api/articles?status=published&limit=100');
        const data = await response.json();
        
        if (data.success && data.articles) {
          const allArticles = data.articles || data.data || [];
          
          // تصفية المقالات حسب التصنيفات المحددة فقط
          const filteredArticles = allArticles.filter((article: any) => {
            const articleCategoryId = article.category_id;
            return categoryIds.includes(articleCategoryId);
          });
          
          processArticles(filteredArticles, userInterests, categoryIds);
        } else {
          throw new Error('فشل في جلب المقالات');
        }
      }
    } catch (error) {
      console.error('Error fetching personalized content:', error);
      setError('حدث خطأ في جلب المحتوى المخصص');
      setArticles([]);
    } finally {
      setLoading(false);
    }
  };

  const processArticles = (articles: any[], userInterests: string[], categoryIds: number[]) => {
    // تجميع المقالات حسب التصنيف
    const articlesByCategory: Record<string, Article[]> = {};
    
    articles.forEach((article: any) => {
      const categoryId = article.category_id;
      const category = categories.find(cat => cat.id === categoryId);
      const categoryName = category?.name || category?.name_ar || 'غير مصنف';
      
      // التحقق من أن المقال ينتمي لأحد التصنيفات المحددة
      if (categoryIds.includes(categoryId)) {
        if (!articlesByCategory[categoryName]) {
          articlesByCategory[categoryName] = [];
        }
        
        // تنسيق المقال
        const formattedArticle: Article = {
          id: article.id,
          title: article.title,
          excerpt: article.summary || article.excerpt || '',
          summary: article.summary || article.excerpt || '',
          category: categoryName,
          category_id: categoryId,
          tags: article.seo_keywords || [],
          featured_image: article.featured_image || article.featuredImage || '',
          author: article.author_name || article.author || 'غير محدد',
          author_name: article.author_name || article.author || 'غير محدد',
          published_at: article.published_at || article.publishedAt || article.created_at,
          views: article.views_count || article.views || 0,
          views_count: article.views_count || article.views || 0,
          likes: article.likes_count || article.likes || 0,
          likes_count: article.likes_count || article.likes || 0,
          shares: article.shares_count || article.shares || 0,
          shares_count: article.shares_count || article.shares || 0,
          recommendation_reason: article.recommendation_reason,
          category_weight: article.category_weight
        };
        
        articlesByCategory[categoryName].push(formattedArticle);
      }
    });
    
    // حساب الإحصائيات
    const personalizedCount = Object.values(articlesByCategory).reduce((sum, arr) => sum + arr.length, 0);
    const relevancePercentage = personalizedCount > 0 ? 100 : 0; // 100% لأن جميع المقالات مفلترة
    
    setArticles(articles.filter(article => categoryIds.includes(article.category_id)));
    setStats({
      totalArticles: personalizedCount,
      personalizedCount,
      relevancePercentage,
      userInterests,
      articlesByCategory
    });
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

  // دالة معالجة الإعجاب
  const handleLike = async (articleId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!userId) {
      // إذا لم يكن المستخدم مسجل، توجيه إلى صفحة تسجيل الدخول
      window.location.href = '/login?redirect=' + encodeURIComponent(window.location.pathname);
      return;
    }

    try {
      const currentState = interactions[articleId]?.liked || false;
      const response = await fetch('/api/interactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          articleId,
          type: 'like',
          action: currentState ? 'remove' : 'add'
        })
      });

      if (response.ok) {
        setInteractions(prev => ({
          ...prev,
          [articleId]: {
            ...prev[articleId],
            liked: !currentState
          }
        }));
      }
    } catch (error) {
      console.error('Error handling like:', error);
    }
  };

  // دالة معالجة الحفظ
  const handleSave = async (articleId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!userId) {
      // إذا لم يكن المستخدم مسجل، توجيه إلى صفحة تسجيل الدخول
      window.location.href = '/login?redirect=' + encodeURIComponent(window.location.pathname);
      return;
    }

    try {
      const currentState = interactions[articleId]?.saved || false;
      const response = await fetch('/api/bookmarks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          itemId: articleId,
          itemType: 'article'
        })
      });

      if (response.ok) {
        const data = await response.json();
        setInteractions(prev => ({
          ...prev,
          [articleId]: {
            ...prev[articleId],
            saved: data.action === 'added'
          }
        }));
      }
    } catch (error) {
      console.error('Error handling save:', error);
    }
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
          <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-500" />
          <div className="text-red-500 text-lg font-semibold mb-2">خطأ في التحميل</div>
          <div className={`text-sm mb-4 ${darkMode ? 'text-red-300' : 'text-red-600'}`}>
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
                {categoryArticles.slice(0, 12).map((article) => (
                  <div key={article.id} className="relative group">
                    <Link 
                      href={`/article/${article.id}`}
                      className="block"
                    >
                      <div className={`p-4 rounded-lg border transition-all duration-200 ${
                        darkMode 
                          ? 'border-gray-600 hover:border-blue-500 hover:bg-gray-700/50' 
                          : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                      }`}>
                        <div className="flex items-start space-x-4 space-x-reverse">
                          {/* صورة المقال */}
                          <div className="flex-shrink-0">
                            {article.featured_image ? (
                              <Image 
                                src={getValidImageUrl(article.featured_image, article.title, 'article')} 
                                alt={article.title}
                                width={64}
                                height={64}
                                className="w-16 h-16 rounded-lg object-cover"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.src = generatePlaceholderImage(article.title, 'article');
                                }}
                              />
                            ) : (
                              <div className={`w-16 h-16 rounded-lg flex items-center justify-center ${
                                darkMode ? 'bg-gray-700' : 'bg-gray-200'
                              }`}>
                                <span className="text-2xl">📰</span>
                              </div>
                            )}
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
                              {article.excerpt || article.summary}
                            </p>

                            {/* معلومات إضافية */}
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-4 space-x-reverse text-xs">
                                <span className={`flex items-center space-x-1 space-x-reverse ${
                                  darkMode ? 'text-gray-400' : 'text-gray-500'
                                }`}>
                                  <User className="w-3 h-3" />
                                  <span>{article.author_name || article.author}</span>
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
                                  <span>{formatNumber(article.views_count || article.views)}</span>
                                </span>
                                
                                <span className={`flex items-center space-x-1 space-x-reverse ${
                                  darkMode ? 'text-gray-400' : 'text-gray-500'
                                }`}>
                                  <Heart className="w-3 h-3" />
                                  <span>{formatNumber(article.likes_count || article.likes)}</span>
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>

                    {/* أزرار التفاعل */}
                    <div className="absolute top-2 left-2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={(e) => handleLike(article.id, e)}
                        className={`w-6 h-6 rounded-full shadow-md flex items-center justify-center transition-all ${
                          interactions[article.id]?.liked 
                            ? 'bg-red-500 text-white' 
                            : 'bg-white/90 dark:bg-gray-800/90 text-gray-600 dark:text-gray-400 hover:bg-red-500 hover:text-white'
                        }`}
                      >
                        <Heart className={`w-3 h-3 ${interactions[article.id]?.liked ? 'fill-current' : ''}`} />
                      </button>
                      <button 
                        onClick={(e) => handleSave(article.id, e)}
                        className={`w-6 h-6 rounded-full shadow-md flex items-center justify-center transition-all ${
                          interactions[article.id]?.saved 
                            ? 'bg-blue-500 text-white' 
                            : 'bg-white/90 dark:bg-gray-800/90 text-gray-600 dark:text-gray-400 hover:bg-blue-500 hover:text-white'
                        }`}
                      >
                        <Bookmark className={`w-3 h-3 ${interactions[article.id]?.saved ? 'fill-current' : ''}`} />
                      </button>
                    </div>
                  </div>
                ))}

                {/* رابط عرض المزيد */}
                {categoryArticles.length > 12 && (
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
            لا توجد تحليلات جديدة في اهتماماتك الآن
          </h3>
          
          <p className={`text-sm mb-4 ${
            darkMode ? 'text-gray-300' : 'text-gray-600'
          }`}>
            نحدث الوجبة المعرفية يومياً... تحقق لاحقاً أو قم بتوسيع اهتماماتك
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