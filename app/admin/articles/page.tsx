'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Plus, Search, Filter, MoreHorizontal, Edit, Trash2, Eye, 
  Clock, User, Tag, Star, BookOpen, Calendar,
  FileText, TrendingUp, Heart, Share2, MessageSquare,
  ChevronDown, ChevronRight, RefreshCw, Download,
  Zap, Brain, Award, Target, Crown
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useDarkModeContext } from '@/contexts/DarkModeContext';
import toast from 'react-hot-toast';
// تم إزالة DashboardLayout لأن الصفحة تستخدم layout.tsx في /admin

// Types
interface ArticleAuthor {
  id: string;
  full_name: string;
  slug: string;
  title?: string;
  avatar_url?: string;
  ai_score: number;
  total_articles: number;
}

interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  summary?: string;
  article_author_id?: string;
  article_author?: ArticleAuthor;
  status: 'published' | 'draft' | 'archived';
  article_type: string;
  featured_image?: string;
  published_at?: string;
  created_at: string;
  updated_at: string;
  views: number;
  likes: number;
  shares: number;
  reading_time?: number;
  tags: string[];
  ai_quotes: string[];
  ai_score?: number;
  is_opinion_leader?: boolean;
}

interface ArticleStats {
  total: number;
  published: number;
  draft: number;
  archived: number;
  thisWeek: number;
  totalViews: number;
  avgScore: number;
}

const ArticlesAdminPage = () => {
  const { darkMode } = useDarkModeContext();
  
  // State
  const [articles, setArticles] = useState<Article[]>([]);
  const [authors, setAuthors] = useState<ArticleAuthor[]>([]);
  const [stats, setStats] = useState<ArticleStats>({
    total: 0,
    published: 0,
    draft: 0,
    archived: 0,
    thisWeek: 0,
    totalViews: 0,
    avgScore: 0
  });
  
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'published' | 'draft' | 'archived'>('all');
  const [filterAuthor, setFilterAuthor] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'created_at' | 'published_at' | 'views' | 'ai_score'>('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentOpinionLeader, setCurrentOpinionLeader] = useState<string | null>(null);
  const [settingOpinionLeader, setSettingOpinionLeader] = useState<string | null>(null);

  // Load data
  useEffect(() => {
    loadArticles();
    loadAuthors();
    loadCurrentOpinionLeader();
  }, []);

  const loadArticles = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/articles');
      if (response.ok) {
        const data = await response.json();
        setArticles(data.articles || []);
        
        // Calculate stats
        const total = data.articles?.length || 0;
        const published = data.articles?.filter((a: Article) => a.status === 'published').length || 0;
        const draft = data.articles?.filter((a: Article) => a.status === 'draft').length || 0;
        const archived = data.articles?.filter((a: Article) => a.status === 'archived').length || 0;
        const totalViews = data.articles?.reduce((sum: number, a: Article) => sum + (a.views || 0), 0) || 0;
        const avgScore = data.articles?.filter((a: Article) => a.ai_score).reduce((sum: number, a: Article) => sum + (a.ai_score || 0), 0) / data.articles?.filter((a: Article) => a.ai_score).length || 0;
        
        setStats({
          total,
          published,
          draft,
          archived,
          thisWeek: 0,
          totalViews,
          avgScore: Math.round(avgScore * 100) / 100
        });
      }
    } catch (error) {
      console.error('Error loading articles:', error);
      toast.error('خطأ في تحميل المقالات');
    } finally {
      setLoading(false);
    }
  };

  const loadAuthors = async () => {
    try {
      const response = await fetch('/api/admin/article-authors');
      if (response.ok) {
        const data = await response.json();
        setAuthors(data.authors || []);
      }
    } catch (error) {
      console.error('Error loading authors:', error);
    }
  };

  const loadCurrentOpinionLeader = async () => {
    try {
      const response = await fetch('/api/opinion/leaders');
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          setCurrentOpinionLeader(data.data.id);
        }
      }
    } catch (error) {
      console.error('Error loading current opinion leader:', error);
    }
  };

  const setAsOpinionLeader = async (articleId: string) => {
    try {
      setSettingOpinionLeader(articleId);
      
      const response = await fetch('/api/opinion/leaders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ articleId }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setCurrentOpinionLeader(articleId);
          toast.success('تم تعيين المقال كقائد رأي اليوم بنجاح!');
          
          // Update the articles list to reflect the change
          setArticles(prev => prev.map(article => ({
            ...article,
            is_opinion_leader: article.id === articleId
          })));
        } else {
          toast.error(data.error || 'فشل في تعيين قائد الرأي');
        }
      } else {
        toast.error('فشل في تعيين قائد الرأي');
      }
    } catch (error) {
      console.error('Error setting opinion leader:', error);
      toast.error('حدث خطأ في تعيين قائد الرأي');
    } finally {
      setSettingOpinionLeader(null);
    }
  };

  // Filter articles
  const filteredArticles = useMemo(() => {
    let filtered = articles;

    if (searchTerm) {
      filtered = filtered.filter(article => 
        article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        article.article_author?.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterStatus !== 'all') {
      filtered = filtered.filter(article => article.status === filterStatus);
    }

    if (filterAuthor !== 'all') {
      filtered = filtered.filter(article => article.article_author_id === filterAuthor);
    }

    if (filterType !== 'all') {
      filtered = filtered.filter(article => article.article_type === filterType);
    }

    // Sort
    filtered.sort((a, b) => {
      const aValue = a[sortBy] || 0;
      const bValue = b[sortBy] || 0;
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [articles, searchTerm, filterStatus, filterAuthor, filterType, sortBy, sortOrder]);

  return (
    <div className={cn('min-h-screen p-6', darkMode ? 'bg-gray-900' : 'bg-gray-50')}>
      
      {/* Header */}
      <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className={cn('text-3xl font-bold mb-2', darkMode ? 'text-white' : 'text-gray-900')}>
                إدارة المقالات
              </h1>
              <p className={cn('text-sm', darkMode ? 'text-gray-400' : 'text-gray-600')}>
                نظام إدارة مقالات قادة الرأي مع الذكاء الاصطناعي
              </p>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={loadArticles}
                className={cn(
                  'flex items-center gap-2 px-4 py-2 rounded-lg transition-colors',
                  darkMode 
                    ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' 
                    : 'bg-white text-gray-700 hover:bg-gray-50 border'
                )}
              >
                <RefreshCw className="w-4 h-4" />
                تحديث
              </button>
              
              <Link
                href="/admin/articles/new"
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                <Plus className="w-4 h-4" />
                مقال جديد
              </Link>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          {[
            { label: 'إجمالي المقالات', value: stats.total.toString(), icon: FileText, color: 'blue' },
            { label: 'المنشورة', value: stats.published.toString(), icon: Eye, color: 'green' },
            { label: 'المسودات', value: stats.draft.toString(), icon: Clock, color: 'yellow' },
            { label: 'المشاهدات', value: stats.totalViews.toLocaleString(), icon: TrendingUp, color: 'purple' },
            { 
              label: 'قائد رأي اليوم', 
              value: currentOpinionLeader ? '✓' : '✗', 
              icon: Crown, 
              color: 'gold',
              special: true
            }
          ].map((stat, index) => (
            <div
              key={index}
              className={cn(
                'p-6 rounded-xl border',
                darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
              )}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className={cn('text-2xl font-bold', darkMode ? 'text-white' : 'text-gray-900')}>
                    {stat.value}
                  </p>
                  <p className={cn('text-sm', darkMode ? 'text-gray-400' : 'text-gray-600')}>
                    {stat.label}
                  </p>
                </div>
                <stat.icon className={cn('w-8 h-8', 
                  stat.color === 'blue' ? 'text-blue-500' :
                  stat.color === 'green' ? 'text-green-500' :
                  stat.color === 'yellow' ? 'text-yellow-500' :
                  stat.color === 'gold' ? (currentOpinionLeader ? 'text-yellow-500' : 'text-gray-400') :
                  'text-purple-500'
                )} />
              </div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className={cn(
          'p-6 rounded-xl border mb-6',
          darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        )}>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="البحث في المقالات..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={cn(
                  'w-full pr-10 pl-4 py-2 rounded-lg border',
                  darkMode 
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                )}
              />
            </div>

            {/* Status Filter */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className={cn(
                'px-4 py-2 rounded-lg border',
                darkMode 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-white border-gray-300 text-gray-900'
              )}
            >
              <option value="all">جميع الحالات</option>
              <option value="published">منشورة</option>
              <option value="draft">مسودة</option>
              <option value="archived">مؤرشفة</option>
            </select>

            {/* Author Filter */}
            <select
              value={filterAuthor}
              onChange={(e) => setFilterAuthor(e.target.value)}
              className={cn(
                'px-4 py-2 rounded-lg border',
                darkMode 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-white border-gray-300 text-gray-900'
              )}
            >
              <option value="all">جميع الكتّاب</option>
              {authors.map(author => (
                <option key={author.id} value={author.id}>
                  {author.full_name}
                </option>
              ))}
            </select>

            {/* Sort */}
            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [field, order] = e.target.value.split('-');
                setSortBy(field as any);
                setSortOrder(order as any);
              }}
              className={cn(
                'px-4 py-2 rounded-lg border',
                darkMode 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-white border-gray-300 text-gray-900'
              )}
            >
              <option value="created_at-desc">الأحدث أولاً</option>
              <option value="created_at-asc">الأقدم أولاً</option>
              <option value="published_at-desc">آخر نشر</option>
              <option value="views-desc">الأكثر مشاهدة</option>
              <option value="ai_score-desc">أعلى تقييم</option>
            </select>
          </div>
        </div>

        {/* Articles List */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <RefreshCw className="w-8 h-8 animate-spin text-blue-500" />
          </div>
        ) : filteredArticles.length === 0 ? (
          <div className={cn(
            'p-12 rounded-xl border text-center',
            darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          )}>
            <FileText className={cn('w-16 h-16 mx-auto mb-4', darkMode ? 'text-gray-600' : 'text-gray-400')} />
            <h3 className={cn('text-xl font-bold mb-2', darkMode ? 'text-white' : 'text-gray-900')}>
              لا توجد مقالات
            </h3>
          <p className={cn('text-sm mb-6', darkMode ? 'text-gray-400' : 'text-gray-600')}>
              ابدأ بكتابة أول مقال لك
            </p>
            <Link
              href="/admin/articles/new"
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              إنشاء مقال جديد
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredArticles.map((article) => (
              <div
                key={article.id}
                className={cn(
                  'p-6 rounded-xl border transition-all hover:shadow-lg',
                  darkMode ? 'bg-gray-800 border-gray-700 hover:bg-gray-750' : 'bg-white border-gray-200 hover:shadow-md'
                )}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className={cn('text-lg font-bold', darkMode ? 'text-white' : 'text-gray-900')}>
                        {article.title}
                      </h3>
                      
                      {/* شارة قائد الرأي اليوم */}
                      {currentOpinionLeader === article.id && (
                        <span className="flex items-center gap-1 px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                          <Crown className="w-3 h-3" />
                          قائد رأي اليوم
                        </span>
                      )}
                      
                      <span className={cn(
                        'px-2 py-1 text-xs rounded-full',
                        article.status === 'published' ? 'bg-green-100 text-green-800' :
                        article.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      )}>
                        {article.status === 'published' ? 'منشور' :
                         article.status === 'draft' ? 'مسودة' : 'مؤرشف'}
                      </span>
                    </div>

                    {article.excerpt && (
                      <p className={cn('text-sm mb-3 line-clamp-2', darkMode ? 'text-gray-400' : 'text-gray-600')}>
                        {article.excerpt}
                      </p>
                    )}

                    <div className="flex items-center gap-6 text-sm">
                      {article.article_author && (
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4" />
                          <span>{article.article_author.full_name}</span>
                          {article.article_author.title && (
                            <span className="text-gray-400">({article.article_author.title})</span>
                          )}
                        </div>
                      )}
                      
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(article.created_at).toLocaleDateString('ar-SA')}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Eye className="w-4 h-4" />
                        <span>{article.views.toLocaleString()}</span>
                      </div>

                      {article.ai_score && (
                        <div className="flex items-center gap-2">
                          <Brain className="w-4 h-4" />
                          <span>{Math.round(article.ai_score * 100)}%</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* زر قائد الرأي اليوم */}
                    {article.status === 'published' && article.article_type === 'opinion' && (
                      <button
                        onClick={() => setAsOpinionLeader(article.id)}
                        disabled={settingOpinionLeader === article.id}
                        className={cn(
                          'p-2 rounded-lg transition-colors relative',
                          currentOpinionLeader === article.id
                            ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                            : darkMode 
                            ? 'hover:bg-gray-700 text-gray-400 hover:text-yellow-500' 
                            : 'hover:bg-gray-100 text-gray-600 hover:text-yellow-600',
                          settingOpinionLeader === article.id && 'opacity-50 cursor-not-allowed'
                        )}
                        title={currentOpinionLeader === article.id ? 'قائد رأي اليوم الحالي' : 'تعيين كقائد رأي اليوم'}
                      >
                        <Crown className={cn(
                          'w-4 h-4',
                          currentOpinionLeader === article.id && 'text-yellow-600'
                        )} />
                        {currentOpinionLeader === article.id && (
                          <span className="absolute -top-1 -right-1 w-2 h-2 bg-yellow-500 rounded-full"></span>
                        )}
                      </button>
                    )}
                    
                    <Link
                      href={`/admin/articles/edit/${article.id}`}
                      className={cn(
                        'p-2 rounded-lg transition-colors',
                        darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                      )}
                    >
                      <Edit className="w-4 h-4" />
                    </Link>
                    
                    <button
                      className={cn(
                        'p-2 rounded-lg transition-colors',
                        darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                      )}
                    >
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

    </div>
  );
};

export default ArticlesAdminPage;