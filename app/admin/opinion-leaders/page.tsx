'use client';

import React, { useState, useEffect } from 'react';
import { Star, Check, X, Crown, Calendar, Eye, Clock, User, Bookmark, AlertCircle, Search, Filter } from 'lucide-react';
import { toast } from 'react-hot-toast';
// تم إزالة DashboardLayout - تستخدم الصفحة layout.tsx الأساسي
interface ArticleAuthor {
  id: string;
  full_name: string;
  title: string;
  avatar_url?: string;
  specializations?: string[];
}

interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  featured_image?: string;
  published_at: string;
  reading_time?: number;
  views: number;
  article_type: string;
  status: string;
  is_opinion_leader: boolean;
  article_author?: ArticleAuthor;
}

export default function OpinionLeadersPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [currentLeader, setCurrentLeader] = useState<Article | null>(null);

  // جلب المقالات
  useEffect(() => {
    fetchArticles();
    fetchCurrentLeader();
  }, []);

  const fetchArticles = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/articles?article_type=opinion&status=published');
      const data = await response.json();
      
      if (data.success) {
        setArticles(data.articles || []);
      } else {
        toast.error('فشل في جلب المقالات');
      }
    } catch (error) {
      console.error('خطأ في جلب المقالات:', error);
      toast.error('حدث خطأ في جلب المقالات');
    } finally {
      setLoading(false);
    }
  };

  const fetchCurrentLeader = async () => {
    try {
      const response = await fetch('/api/opinion/leaders');
      const data = await response.json();
      
      if (data.success && data.data) {
        // العثور على المقال الحالي المحدد كقائد رأي
        const leaderArticle = articles.find(article => article.id === data.data.id);
        setCurrentLeader(leaderArticle || null);
      }
    } catch (error) {
      console.error('خطأ في جلب قائد الرأي الحالي:', error);
    }
  };

  const handleSetOpinionLeader = async (articleId: string) => {
    try {
      const response = await fetch('/api/opinion/leaders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ articleId }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success('تم تحديد قائد الرأي اليوم بنجاح!');
        await fetchArticles(); // إعادة جلب المقالات لتحديث الحالة
        await fetchCurrentLeader(); // جلب قائد الرأي الجديد
      } else {
        toast.error(data.error || 'فشل في تحديد قائد الرأي');
      }
    } catch (error) {
      console.error('خطأ في تحديد قائد الرأي:', error);
      toast.error('حدث خطأ أثناء تحديد قائد الرأي');
    }
  };

  // تصفية المقالات
  const filteredArticles = articles.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         article.article_author?.full_name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterStatus === 'all' || 
                         (filterStatus === 'leader' && article.is_opinion_leader) ||
                         (filterStatus === 'regular' && !article.is_opinion_leader);
    
    return matchesSearch && matchesFilter;
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="space-y-6">
          <div className="animate-pulse">
            <div className={`h-8 ${darkMode ? 'bg-gray-700' : 'bg-gray-200'} rounded-lg mb-6 w-64`}></div>
            <div className="grid gap-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className={`h-24 ${darkMode ? 'bg-gray-800' : 'bg-gray-100'} rounded-lg`}></div>
              ))}
            </div>
          </div>
        </div>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              إدارة قادة الرأي
            </h1>
            <p className={`mt-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              تحديد وإدارة مقال قائد الرأي اليوم
            </p>
          </div>
          <div className="flex items-center gap-3 px-4 py-2 rounded-lg bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20">
            <Crown className="w-5 h-5 text-yellow-500" />
            <span className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              {currentLeader ? `قائد اليوم: ${currentLeader.title.substring(0, 30)}...` : 'لم يتم تحديد قائد رأي اليوم'}
            </span>
          </div>
        </div>

        {/* قائد الرأي الحالي */}
        {currentLeader && (
          <div className={`p-6 rounded-xl border-2 border-yellow-400/30 ${
            darkMode ? 'bg-gradient-to-r from-yellow-900/20 to-orange-900/20' : 'bg-gradient-to-r from-yellow-50 to-orange-50'
          }`}>
            <div className="flex items-center gap-3 mb-4">
              <Crown className="w-6 h-6 text-yellow-500" />
              <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                قائد الرأي اليوم
              </h2>
            </div>
            <div className="flex items-start gap-4">
              {currentLeader.featured_image && (
                <img 
                  src={currentLeader.featured_image} 
                  alt={currentLeader.title}
                  className="w-24 h-24 object-cover rounded-lg"
                />
              )}
              <div className="flex-1">
                <h3 className={`text-lg font-semibold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {currentLeader.title}
                </h3>
                <div className="flex items-center gap-4 text-sm">
                  <span className={`flex items-center gap-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    <User className="w-4 h-4" />
                    {currentLeader.article_author?.full_name || 'غير محدد'}
                  </span>
                  <span className={`flex items-center gap-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    <Calendar className="w-4 h-4" />
                    {formatDate(currentLeader.published_at)}
                  </span>
                  <span className={`flex items-center gap-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    <Eye className="w-4 h-4" />
                    {currentLeader.views.toLocaleString()} مشاهدة
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* أدوات البحث والتصفية */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className={`absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${
              darkMode ? 'text-gray-400' : 'text-gray-500'
            }`} />
            <input
              type="text"
              placeholder="البحث في العناوين أو الكتاب..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full pr-10 pl-4 py-3 rounded-lg border ${
                darkMode 
                  ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400' 
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
              } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
            />
          </div>
          <div className="relative">
            <Filter className={`absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${
              darkMode ? 'text-gray-400' : 'text-gray-500'
            }`} />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className={`pr-10 pl-4 py-3 rounded-lg border ${
                darkMode 
                  ? 'bg-gray-800 border-gray-600 text-white' 
                  : 'bg-white border-gray-300 text-gray-900'
              } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
            >
              <option value="all">جميع المقالات</option>
              <option value="leader">قادة الرأي</option>
              <option value="regular">مقالات عادية</option>
            </select>
          </div>
        </div>

        {/* قائمة المقالات */}
        <div className="space-y-4">
          {filteredArticles.length === 0 ? (
            <div className={`text-center py-12 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              <AlertCircle className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg">لا توجد مقالات مطابقة للبحث</p>
            </div>
          ) : (
            filteredArticles.map((article) => (
              <div
                key={article.id}
                className={`p-6 rounded-xl border transition-all hover:shadow-lg ${
                  article.is_opinion_leader
                    ? `border-yellow-400/50 ${darkMode ? 'bg-yellow-900/10' : 'bg-yellow-50'}`
                    : darkMode 
                      ? 'bg-gray-800 border-gray-700 hover:border-gray-600' 
                      : 'bg-white border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-start gap-4">
                      {article.featured_image && (
                        <img 
                          src={article.featured_image} 
                          alt={article.title}
                          className="w-20 h-20 object-cover rounded-lg flex-shrink-0"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                            {article.title}
                          </h3>
                          {article.is_opinion_leader && (
                            <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-yellow-500/20 text-yellow-600 text-xs">
                              <Crown className="w-3 h-3" />
                              <span>قائد رأي</span>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-4 text-sm mb-3">
                          <span className={`flex items-center gap-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            <User className="w-4 h-4" />
                            {article.article_author?.full_name || 'غير محدد'}
                          </span>
                          <span className={`flex items-center gap-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            <Calendar className="w-4 h-4" />
                            {formatDate(article.published_at)}
                          </span>
                          <span className={`flex items-center gap-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            <Clock className="w-4 h-4" />
                            {article.reading_time || 5} دقائق
                          </span>
                          <span className={`flex items-center gap-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            <Eye className="w-4 h-4" />
                            {article.views.toLocaleString()} مشاهدة
                          </span>
                        </div>
                        
                        {article.excerpt && (
                          <p className={`text-sm line-clamp-2 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                            {article.excerpt}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-2 ml-4">
                    {article.is_opinion_leader ? (
                      <button
                        disabled
                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-yellow-500/20 text-yellow-600 border border-yellow-500/30 cursor-not-allowed"
                      >
                        <Crown className="w-4 h-4" />
                        <span className="text-sm font-medium">قائد رأي حالي</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => handleSetOpinionLeader(article.id)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all hover:scale-105 ${
                          darkMode 
                            ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                            : 'bg-blue-500 hover:bg-blue-600 text-white'
                        }`}
                      >
                        <Star className="w-4 h-4" />
                        <span className="text-sm font-medium">تعيين كقائد رأي</span>
                      </button>
                    )}
                    
                    <a
                      href={`/opinion/${article.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all hover:scale-105 ${
                        darkMode 
                          ? 'border-gray-600 text-gray-300 hover:bg-gray-700' 
                          : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <Bookmark className="w-4 h-4" />
                      <span className="text-sm font-medium">عرض المقال</span>
                    </a>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}