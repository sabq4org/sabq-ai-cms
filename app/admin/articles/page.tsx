'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Plus, Search, Filter, MoreHorizontal, Edit, Trash2, Eye, 
  Clock, User, Tag, Star, BookOpen, Calendar,
  FileText, TrendingUp, Heart, Share2, MessageSquare,
  ChevronDown, ChevronRight, RefreshCw, Download,
  Zap, Brain, Award, Target
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useDarkModeContext } from '@/contexts/DarkModeContext';
import toast from 'react-hot-toast';
import DashboardLayout from '@/components/layout/DashboardLayout';

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
    <DashboardLayout>
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

        {/* Placeholder content */}
        <div className={cn(
          'p-8 rounded-xl border text-center',
          darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        )}>
          <Brain className={cn('w-16 h-16 mx-auto mb-4', darkMode ? 'text-blue-400' : 'text-blue-600')} />
          <h2 className={cn('text-xl font-bold mb-2', darkMode ? 'text-white' : 'text-gray-900')}>
            نظام إدارة المقالات الذكي
          </h2>
          <p className={cn('text-sm mb-6', darkMode ? 'text-gray-400' : 'text-gray-600')}>
            قريباً... نظام شامل لإدارة مقالات قادة الرأي مع الذكاء الاصطناعي
          </p>
          
          {/* Quick stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
            {[
              { label: 'المقالات', value: '0', icon: FileText },
              { label: 'الكتّاب', value: '0', icon: User },
              { label: 'المشاهدات', value: '0', icon: Eye },
              { label: 'التقييم', value: '0%', icon: Star }
            ].map((stat, index) => (
              <div
                key={index}
                className={cn(
                  'p-4 rounded-lg border',
                  darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
                )}
              >
                <stat.icon className={cn('w-6 h-6 mx-auto mb-2', darkMode ? 'text-blue-400' : 'text-blue-600')} />
                <p className={cn('text-lg font-bold', darkMode ? 'text-white' : 'text-gray-900')}>
                  {stat.value}
                </p>
                <p className={cn('text-xs', darkMode ? 'text-gray-400' : 'text-gray-600')}>
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
};

export default ArticlesAdminPage;