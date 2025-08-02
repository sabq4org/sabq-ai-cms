/**
 * 📄 صفحة إدارة المقالات المحسنة - مثال على تطبيق نظام التصميم الموحد
 * Improved Articles Management Page - Design System Implementation Example
 */

'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Plus, Search, Filter, MoreHorizontal, Edit, Trash2, Eye, 
  Clock, User, Tag, Star, BookOpen, Calendar,
  FileText, TrendingUp, Heart, Share2, MessageSquare,
  RefreshCw, Download, Crown
} from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

// 🎨 استيراد نظام التصميم الموحد
import {
  DashboardLayout,
  SabqCard,
  SabqButton,
  SabqInput,
  SabqStatCard,
  sabqTheme
} from '@/components/design-system';

// Types (نفس الأنواع الموجودة)
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

const ImprovedArticlesPage = () => {
  // State (نفس الحالة الموجودة)
  const [articles, setArticles] = useState<Article[]>([]);
  const [authors, setAuthors] = useState<ArticleAuthor[]>([]);
  const [stats, setStats] = useState<ArticleStats>({
    total: 0, published: 0, draft: 0, archived: 0,
    thisWeek: 0, totalViews: 0, avgScore: 0
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

  // Load data functions (نفس الدوال الموجودة)
  const loadArticles = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/articles');
      if (response.ok) {
        const data = await response.json();
        setArticles(data.articles || []);
        
        // حساب الإحصائيات
        const total = data.articles?.length || 0;
        const published = data.articles?.filter((a: Article) => a.status === 'published').length || 0;
        const draft = data.articles?.filter((a: Article) => a.status === 'draft').length || 0;
        const archived = data.articles?.filter((a: Article) => a.status === 'archived').length || 0;
        const totalViews = data.articles?.reduce((sum: number, a: Article) => sum + (a.views || 0), 0) || 0;
        const avgScore = data.articles?.filter((a: Article) => a.ai_score).reduce((sum: number, a: Article) => sum + (a.ai_score || 0), 0) / data.articles?.filter((a: Article) => a.ai_score).length || 0;
        
        setStats({
          total, published, draft, archived,
          thisWeek: 0, totalViews,
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
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ articleId }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setCurrentOpinionLeader(articleId);
          toast.success('تم تعيين المقال كقائد رأي اليوم بنجاح!');
          
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

  useEffect(() => {
    loadArticles();
    loadAuthors(); 
    loadCurrentOpinionLeader();
  }, []);

  // Filter articles (نفس المنطق)
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
    <DashboardLayout
      pageTitle="إدارة المقالات"
      pageDescription="نظام إدارة مقالات قادة الرأي مع الذكاء الاصطناعي"
      breadcrumbs={[
        { label: "إدارة المحتوى", href: "/admin/content" },
        { label: "المقالات" }
      ]}
      headerActions={
        <div className="flex gap-3">
          <SabqButton
            variant="secondary"
            icon={<RefreshCw />}
            onClick={loadArticles}
            loading={loading}
          >
            تحديث
          </SabqButton>
          
          <SabqButton
            variant="primary"
            icon={<Plus />}
            href="/admin/articles/new"
          >
            مقال جديد
          </SabqButton>
        </div>
      }
    >
      {/* 📊 بطاقات الإحصائيات - محسنة */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        <SabqStatCard
          title="إجمالي المقالات"
          value={stats.total.toString()}
          icon={<FileText />}
          color="primary"
          size="md"
        />
        
        <SabqStatCard
          title="المنشورة"
          value={stats.published.toString()}
          icon={<Eye />}
          color="success"
          trend="up"
          size="md"
        />
        
        <SabqStatCard
          title="المسودات"
          value={stats.draft.toString()}
          icon={<Clock />}
          color="warning"
          size="md"
        />
        
        <SabqStatCard
          title="المشاهدات"
          value={stats.totalViews.toLocaleString()}
          icon={<TrendingUp />}
          color="purple"
          trend="up"
          changeValue="+5.2%"
          size="md"
        />
        
        <SabqStatCard
          title="قائد رأي اليوم"
          value={currentOpinionLeader ? '✓' : '✗'}
          icon={<Crown />}
          color={currentOpinionLeader ? 'success' : 'error'}
          description={currentOpinionLeader ? 'محدد' : 'غير محدد'}
          size="md"
        />
      </div>

      {/* 🔍 المرشحات - محسنة */}
      <SabqCard className="mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* البحث */}
          <SabqInput
            search={true}
            placeholder="البحث في المقالات..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            clearable={true}
            onClear={() => setSearchTerm('')}
          />

          {/* فلتر الحالة */}
          <div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="w-full h-10 px-4 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">جميع الحالات</option>
              <option value="published">منشورة</option>
              <option value="draft">مسودة</option>
              <option value="archived">مؤرشفة</option>
            </select>
          </div>

          {/* فلتر الكاتب */}
          <div>
            <select
              value={filterAuthor}
              onChange={(e) => setFilterAuthor(e.target.value)}
              className="w-full h-10 px-4 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">جميع الكتّاب</option>
              {authors.map(author => (
                <option key={author.id} value={author.id}>
                  {author.full_name}
                </option>
              ))}
            </select>
          </div>

          {/* الترتيب */}
          <div>
            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [field, order] = e.target.value.split('-');
                setSortBy(field as any);
                setSortOrder(order as any);
              }}
              className="w-full h-10 px-4 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="created_at-desc">الأحدث أولاً</option>
              <option value="created_at-asc">الأقدم أولاً</option>
              <option value="published_at-desc">آخر نشر</option>
              <option value="views-desc">الأكثر مشاهدة</option>
              <option value="ai_score-desc">أعلى تقييم</option>
            </select>
          </div>
        </div>
      </SabqCard>

      {/* 📄 قائمة المقالات - محسنة */}
      {loading ? (
        <SabqCard className="flex justify-center items-center py-12">
          <div className="text-center">
            <RefreshCw className="w-8 h-8 animate-spin text-blue-500 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">جاري تحميل المقالات...</p>
          </div>
        </SabqCard>
      ) : filteredArticles.length === 0 ? (
        <SabqCard className="text-center py-12">
          <FileText className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">
            لا توجد مقالات
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            ابدأ بكتابة أول مقال لك
          </p>
          <SabqButton
            variant="primary"
            icon={<Plus />}
            href="/admin/articles/new"
          >
            إنشاء مقال جديد
          </SabqButton>
        </SabqCard>
      ) : (
        <div className="space-y-4">
          {filteredArticles.map((article) => (
            <SabqCard
              key={article.id}
              interactive={true}
              className="hover:shadow-lg transition-all duration-300"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                      {article.title}
                    </h3>
                    
                    {/* شارة قائد الرأي اليوم */}
                    {currentOpinionLeader === article.id && (
                      <span className="flex items-center gap-1 px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                        <Crown className="w-3 h-3" />
                        قائد رأي اليوم
                      </span>
                    )}
                    
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      article.status === 'published' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                      article.status === 'draft' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                      'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                    }`}>
                      {article.status === 'published' ? 'منشور' :
                       article.status === 'draft' ? 'مسودة' : 'مؤرشف'}
                    </span>
                  </div>

                  {article.excerpt && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                      {article.excerpt}
                    </p>
                  )}

                  <div className="flex items-center gap-6 text-sm text-gray-500 dark:text-gray-400">
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
                        <Star className="w-4 h-4" />
                        <span>{Math.round(article.ai_score * 100)}%</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {/* زر قائد الرأي اليوم */}
                  {article.status === 'published' && article.article_type === 'opinion' && (
                    <SabqButton
                      variant="ghost"
                      size="sm"
                      icon={<Crown />}
                      onClick={() => setAsOpinionLeader(article.id)}
                      loading={settingOpinionLeader === article.id}
                      className={
                        currentOpinionLeader === article.id
                          ? 'text-yellow-600 hover:text-yellow-700'
                          : 'text-gray-400 hover:text-yellow-600'
                      }
                    />
                  )}
                  
                  <SabqButton
                    variant="ghost"
                    size="sm"
                    icon={<Edit />}
                    href={`/admin/articles/edit/${article.id}`}
                  />
                  
                  <SabqButton
                    variant="ghost"
                    size="sm"
                    icon={<MoreHorizontal />}
                  />
                </div>
              </div>
            </SabqCard>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
};

export default ImprovedArticlesPage;