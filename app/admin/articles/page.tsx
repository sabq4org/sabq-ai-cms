'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Plus, Search, Filter, MoreHorizontal, Edit, Trash2, Eye, 
  Clock, User, Tag, Star, BookOpen, Calendar,
  FileText, TrendingUp, Heart, Share2, MessageSquare,
  ChevronDown, ChevronRight, RefreshCw, Download,
  Zap, Brain, Award, Target, Sparkles
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useDarkModeContext } from '@/contexts/DarkModeContext';
import toast from 'react-hot-toast';


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

  // Simple component - just structure for now
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

        {/* قائمة المقالات */}
        <div className={cn(
          'rounded-xl border',
          darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        )}>
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h3 className={cn('text-lg font-semibold mb-2', darkMode ? 'text-white' : 'text-gray-900')}>
              إدارة المقالات
            </h3>
            <p className={cn('text-sm', darkMode ? 'text-gray-400' : 'text-gray-600')}>
              قم بإنشاء وتحرير وإدارة جميع المقالات من هنا
            </p>
          </div>
          
          <div className="p-6">
            <div className="text-center py-12">
              <FileText className={cn('w-16 h-16 mx-auto mb-4', darkMode ? 'text-gray-600' : 'text-gray-400')} />
              <h4 className={cn('text-xl font-semibold mb-2', darkMode ? 'text-white' : 'text-gray-900')}>
                ابدأ بإنشاء أول مقال
              </h4>
              <p className={cn('text-sm mb-6', darkMode ? 'text-gray-400' : 'text-gray-600')}>
                استخدم الواجهة الموحدة الجديدة لإنشاء وتحرير المقالات بكفاءة
              </p>
              
              <div className="flex justify-center gap-3">
                <Link
                  href="/admin/articles/unified/new"
                  className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-6 py-3 rounded-lg transition-colors"
                >
                  <Sparkles className="w-5 h-5" />
                  الواجهة الموحدة
                </Link>
                
                <Link
                  href="/admin/articles/new"
                  className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg transition-colors"
                >
                  <Plus className="w-5 h-5" />
                  إنشاء عادي
                </Link>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ArticlesAdminPage;