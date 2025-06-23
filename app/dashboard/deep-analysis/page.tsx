'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Brain, 
  Plus, 
  Search, 
  Filter,
  Eye,
  Edit,
  Trash2,
  MoreHorizontal,
  Calendar,
  TrendingUp,
  Star,
  Clock,
  BarChart3,
  FileText,
  PenTool,
  Newspaper,
  Target,
  Sparkles,
  ChevronDown,
  MessageCircle,
  Copy,
  Activity,
  Award,
  Users,
  AlertTriangle,
  ArrowUp,
  Zap,
  ChevronLeft,
  ChevronRight,
  Layers,
  Send,
  Archive
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useDarkMode } from '@/hooks/useDarkMode';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { DeepAnalysis, AnalysisStatus, SourceType } from '@/types/deep-analysis';

export default function DeepAnalysisPage() {
  const router = useRouter();
  const { darkMode } = useDarkMode();
  const [analyses, setAnalyses] = useState<DeepAnalysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<AnalysisStatus | 'all'>('all');
  const [sourceTypeFilter, setSourceTypeFilter] = useState<SourceType | 'all'>('all');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // جلب التحليلات
  const fetchAnalyses = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        sortBy,
        sortOrder,
        ...(searchTerm && { search: searchTerm }),
        ...(statusFilter !== 'all' && { status: statusFilter }),
        ...(sourceTypeFilter !== 'all' && { sourceType: sourceTypeFilter })
      });

      const response = await fetch(`/api/deep-analyses?${params}`);
      const data = await response.json();
      
      if (response.ok) {
        setAnalyses(data.analyses || []);
        setTotalPages(data.totalPages || 1);
      } else {
        toast.error('فشل في جلب التحليلات');
      }
    } catch (error) {
      console.error('Error fetching analyses:', error);
      toast.error('حدث خطأ في جلب التحليلات');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalyses();
  }, [page, sortBy, sortOrder, statusFilter, sourceTypeFilter]);

  // حذف تحليل
  const handleDelete = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا التحليل؟')) return;

    try {
      const response = await fetch(`/api/deep-analyses/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        toast.success('تم حذف التحليل بنجاح');
        fetchAnalyses();
      } else {
        toast.error('فشل في حذف التحليل');
      }
    } catch (error) {
      console.error('Error deleting analysis:', error);
      toast.error('حدث خطأ في حذف التحليل');
    }
  };

  // تحديث حالة التحليل
  const handleStatusUpdate = async (id: string, status: AnalysisStatus) => {
    try {
      const response = await fetch(`/api/deep-analyses/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });

      if (response.ok) {
        toast.success('تم تحديث حالة التحليل');
        fetchAnalyses();
      } else {
        toast.error('فشل في تحديث الحالة');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('حدث خطأ في تحديث الحالة');
    }
  };

  // ألوان الحالة
  const getStatusColor = (status: AnalysisStatus) => {
    switch (status) {
      case 'published': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'draft': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'archived': return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  // أيقونة نوع المصدر
  const getSourceIcon = (sourceType: SourceType) => {
    switch (sourceType) {
      case 'gpt': return <Brain className="h-4 w-4 text-purple-500" />;
      case 'manual': return <PenTool className="h-4 w-4 text-blue-500" />;
      case 'hybrid': return <Layers className="h-4 w-4 text-green-500" />;
    }
  };

  // مكون بطاقة الإحصائية
  const StatsCard = ({ 
    title, 
    value, 
    subtitle, 
    icon: Icon, 
    bgColor,
    iconColor
  }: {
    title: string;
    value: string | number;
    subtitle: string;
    icon: any;
    bgColor: string;
    iconColor: string;
  }) => (
    <div className={`rounded-2xl p-4 sm:p-6 shadow-sm border transition-all duration-300 hover:shadow-md ${
      darkMode 
        ? 'bg-gray-800 border-gray-700' 
        : 'bg-white border-gray-100'
    }`}>
      <div className="flex items-center gap-3 sm:gap-4">
        <div className={`w-10 h-10 sm:w-12 sm:h-12 ${bgColor} rounded-full flex items-center justify-center`}>
          <Icon className={`w-5 h-5 sm:w-6 sm:h-6 ${iconColor}`} />
        </div>
        <div className="flex-1">
          <p className={`text-xs sm:text-sm mb-1 transition-colors duration-300 ${
            darkMode ? 'text-gray-400' : 'text-gray-500'
          }`}>{title}</p>
          <div className="flex items-baseline gap-1 sm:gap-2">
            <span className={`text-lg sm:text-2xl font-bold transition-colors duration-300 ${
              darkMode ? 'text-white' : 'text-gray-800'
            }`}>{loading ? '...' : value}</span>
            <span className={`text-xs sm:text-sm transition-colors duration-300 ${
              darkMode ? 'text-gray-400' : 'text-gray-500'
            }`}>{subtitle}</span>
          </div>
        </div>
      </div>
    </div>
  );

  // حساب الإحصائيات
  const stats = {
    total: analyses.length,
    published: analyses.filter(a => a.status === 'published').length,
    draft: analyses.filter(a => a.status === 'draft').length,
    avgQuality: analyses.length > 0 
      ? Math.round(analyses.reduce((acc, a) => acc + a.qualityScore, 0) / analyses.length * 100)
      : 0,
    totalViews: analyses.reduce((acc, a) => acc + a.views, 0),
    gptAnalyses: analyses.filter(a => a.sourceType === 'gpt').length
  };

  return (
    <div className={`p-4 sm:p-6 lg:p-8 transition-colors duration-300 ${
      darkMode ? 'bg-gray-900' : ''
    }`}>
      {/* عنوان وتعريف الصفحة */}
      <div className="mb-6 sm:mb-8">
        <h1 className={`text-2xl sm:text-3xl font-bold mb-2 transition-colors duration-300 ${
          darkMode ? 'text-white' : 'text-gray-800'
        }`}>التحليل العميق</h1>
        <p className={`text-sm sm:text-base transition-colors duration-300 ${
          darkMode ? 'text-gray-300' : 'text-gray-600'
        }`}>إنشاء وإدارة التحليلات العميقة للمحتوى باستخدام الذكاء الاصطناعي</p>
      </div>

      {/* قسم النظام الذكي */}
      <div className="mb-6 sm:mb-8">
        <div className={`rounded-2xl p-4 sm:p-6 border transition-colors duration-300 ${
          darkMode 
            ? 'bg-gradient-to-r from-purple-900/30 to-indigo-900/30 border-purple-700' 
            : 'bg-gradient-to-r from-purple-50 to-indigo-50 border-purple-100'
        }`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center">
                <Brain className="text-white w-6 h-6" />
              </div>
              <div>
                <h2 className={`text-lg sm:text-xl font-bold transition-colors duration-300 ${
                  darkMode ? 'text-white' : 'text-gray-800'
                }`}>محرك التحليل الذكي</h2>
                <p className={`text-xs sm:text-sm transition-colors duration-300 ${
                  darkMode ? 'text-gray-300' : 'text-gray-600'
                }`}>تحليل متقدم للمحتوى باستخدام GPT-4</p>
              </div>
            </div>
            <Button
              onClick={() => router.push('/dashboard/deep-analysis/create')}
              className="bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white"
            >
              <Plus className="h-4 w-4 ml-2" />
              إنشاء تحليل جديد
            </Button>
          </div>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div className={`rounded-xl p-3 sm:p-4 border transition-colors duration-300 ${
              darkMode 
                ? 'bg-gray-800 border-purple-600' 
                : 'bg-white border-purple-100'
            }`}>
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
                </div>
                <div>
                  <p className={`text-xs sm:text-sm font-medium transition-colors duration-300 ${
                    darkMode ? 'text-gray-200' : 'text-gray-800'
                  }`}>توليد تلقائي</p>
                  <p className="text-xs text-green-500">نشط</p>
                </div>
              </div>
            </div>
            
            <div className={`rounded-xl p-3 sm:p-4 border transition-colors duration-300 ${
              darkMode 
                ? 'bg-gray-800 border-purple-600' 
                : 'bg-white border-purple-100'
            }`}>
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <Target className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                </div>
                <div>
                  <p className={`text-xs sm:text-sm font-medium transition-colors duration-300 ${
                    darkMode ? 'text-gray-200' : 'text-gray-800'
                  }`}>دقة التحليل</p>
                  <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    {stats.avgQuality}%
                  </p>
                </div>
              </div>
            </div>
            
            <div className={`rounded-xl p-3 sm:p-4 border transition-colors duration-300 ${
              darkMode 
                ? 'bg-gray-800 border-purple-600' 
                : 'bg-white border-purple-100'
            }`}>
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                </div>
                <div>
                  <p className={`text-xs sm:text-sm font-medium transition-colors duration-300 ${
                    darkMode ? 'text-gray-200' : 'text-gray-800'
                  }`}>معدل المشاهدات</p>
                  <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    {stats.totalViews.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
            
            <div className={`rounded-xl p-3 sm:p-4 border transition-colors duration-300 ${
              darkMode 
                ? 'bg-gray-800 border-purple-600' 
                : 'bg-white border-purple-100'
            }`}>
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600" />
                </div>
                <div>
                  <p className={`text-xs sm:text-sm font-medium transition-colors duration-300 ${
                    darkMode ? 'text-gray-200' : 'text-gray-800'
                  }`}>سرعة الإنتاج</p>
                  <p className="text-xs text-green-500">سريع</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* بطاقات الإحصائيات */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8">
        <StatsCard
          title="إجمالي التحليلات"
          value={stats.total}
          subtitle="تحليل"
          icon={FileText}
          bgColor="bg-blue-100"
          iconColor="text-blue-600"
        />
        <StatsCard
          title="منشور"
          value={stats.published}
          subtitle="تحليل نشط"
          icon={Eye}
          bgColor="bg-green-100"
          iconColor="text-green-600"
        />
        <StatsCard
          title="مسودة"
          value={stats.draft}
          subtitle="قيد الإعداد"
          icon={Edit}
          bgColor="bg-yellow-100"
          iconColor="text-yellow-600"
        />
        <StatsCard
          title="جودة التحليل"
          value={`${stats.avgQuality}%`}
          subtitle="متوسط"
          icon={BarChart3}
          bgColor="bg-purple-100"
          iconColor="text-purple-600"
        />
        <StatsCard
          title="المشاهدات"
          value={stats.totalViews.toLocaleString()}
          subtitle="مشاهدة"
          icon={Activity}
          bgColor="bg-orange-100"
          iconColor="text-orange-600"
        />
        <StatsCard
          title="تحليلات GPT"
          value={stats.gptAnalyses}
          subtitle="بالذكاء الاصطناعي"
          icon={Brain}
          bgColor="bg-indigo-100"
          iconColor="text-indigo-600"
        />
      </div>

      {/* الفلاتر والبحث */}
      <div className={`rounded-2xl p-4 sm:p-6 shadow-sm border mb-6 transition-colors duration-300 ${
        darkMode 
          ? 'bg-gray-800 border-gray-700' 
          : 'bg-white border-gray-100'
      }`}>
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                placeholder="البحث في التحليلات..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && fetchAnalyses()}
                className={`pr-10 ${darkMode ? 'bg-gray-700 border-gray-600' : ''}`}
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as AnalysisStatus | 'all')}>
              <SelectTrigger className={`w-40 ${darkMode ? 'bg-gray-700 border-gray-600' : ''}`}>
                <SelectValue placeholder="الحالة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الحالات</SelectItem>
                <SelectItem value="published">منشور</SelectItem>
                <SelectItem value="draft">مسودة</SelectItem>
                <SelectItem value="archived">مؤرشف</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sourceTypeFilter} onValueChange={(value) => setSourceTypeFilter(value as SourceType | 'all')}>
              <SelectTrigger className={`w-40 ${darkMode ? 'bg-gray-700 border-gray-600' : ''}`}>
                <SelectValue placeholder="النوع" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الأنواع</SelectItem>
                <SelectItem value="manual">يدوي</SelectItem>
                <SelectItem value="gpt">GPT</SelectItem>
                <SelectItem value="hybrid">مختلط</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className={`w-40 ${darkMode ? 'bg-gray-700 border-gray-600' : ''}`}>
                <SelectValue placeholder="الترتيب" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="createdAt">تاريخ الإنشاء</SelectItem>
                <SelectItem value="publishedAt">تاريخ النشر</SelectItem>
                <SelectItem value="views">المشاهدات</SelectItem>
                <SelectItem value="qualityScore">الجودة</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className={darkMode ? 'border-gray-600' : ''}
            >
              {sortOrder === 'asc' ? '↑' : '↓'}
            </Button>
          </div>
        </div>
      </div>

      {/* جدول التحليلات */}
      <div className={`rounded-2xl shadow-sm border overflow-hidden transition-colors duration-300 ${
        darkMode 
          ? 'bg-gray-800 border-gray-700' 
          : 'bg-white border-gray-100'
      }`}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className={`border-b ${darkMode ? 'border-gray-700 bg-gray-900/50' : 'border-gray-200 bg-gray-50'}`}>
                <th className={`px-6 py-4 text-right text-xs font-medium uppercase tracking-wider ${
                  darkMode ? 'text-gray-400' : 'text-gray-500'
                }`}>التحليل</th>
                <th className={`px-6 py-4 text-right text-xs font-medium uppercase tracking-wider ${
                  darkMode ? 'text-gray-400' : 'text-gray-500'
                }`}>النوع</th>
                <th className={`px-6 py-4 text-right text-xs font-medium uppercase tracking-wider ${
                  darkMode ? 'text-gray-400' : 'text-gray-500'
                }`}>الحالة</th>
                <th className={`px-6 py-4 text-right text-xs font-medium uppercase tracking-wider ${
                  darkMode ? 'text-gray-400' : 'text-gray-500'
                }`}>الكاتب</th>
                <th className={`px-6 py-4 text-right text-xs font-medium uppercase tracking-wider ${
                  darkMode ? 'text-gray-400' : 'text-gray-500'
                }`}>الجودة</th>
                <th className={`px-6 py-4 text-right text-xs font-medium uppercase tracking-wider ${
                  darkMode ? 'text-gray-400' : 'text-gray-500'
                }`}>المشاهدات</th>
                <th className={`px-6 py-4 text-right text-xs font-medium uppercase tracking-wider ${
                  darkMode ? 'text-gray-400' : 'text-gray-500'
                }`}>التاريخ</th>
                <th className={`px-6 py-4 text-right text-xs font-medium uppercase tracking-wider ${
                  darkMode ? 'text-gray-400' : 'text-gray-500'
                }`}>الإجراءات</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${darkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
              {loading ? (
                <tr>
                  <td colSpan={8} className="text-center py-12">
                    <div className="flex justify-center items-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                    </div>
                  </td>
                </tr>
              ) : analyses.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-12">
                    <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      لا توجد تحليلات متاحة
                    </div>
                  </td>
                </tr>
              ) : (
                analyses.map((analysis) => (
                  <tr key={analysis.id} className={`transition-colors duration-150 ${
                    darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
                  }`}>
                    <td className="px-6 py-4">
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center">
                          <Brain className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <h3 className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                            {analysis.title}
                          </h3>
                          <p className={`text-xs mt-1 line-clamp-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            {analysis.summary}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {getSourceIcon(analysis.sourceType)}
                        <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          {analysis.sourceType === 'manual' ? 'يدوي' :
                           analysis.sourceType === 'gpt' ? 'GPT' : 'مختلط'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge className={`${getStatusColor(analysis.status)}`}>
                        {analysis.status === 'published' ? 'منشور' :
                         analysis.status === 'draft' ? 'مسودة' : 'مؤرشف'}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        {analysis.authorName}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className={`w-16 h-2 rounded-full overflow-hidden ${
                          darkMode ? 'bg-gray-700' : 'bg-gray-200'
                        }`}>
                          <div
                            className="h-full bg-gradient-to-r from-purple-500 to-indigo-600"
                            style={{ width: `${analysis.qualityScore * 100}%` }}
                          />
                        </div>
                        <span className={`text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          {Math.round(analysis.qualityScore * 100)}%
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        <Eye className={`h-4 w-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                        <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          {analysis.views.toLocaleString()}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        <Calendar className={`h-4 w-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                        <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          {new Date(analysis.createdAt).toLocaleDateString('ar-SA')}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className={darkMode ? 'hover:bg-gray-700' : ''}>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className={darkMode ? 'bg-gray-800 border-gray-700' : ''}>
                          <DropdownMenuItem
                            onClick={() => router.push(`/insights/deep/${analysis.slug}`)}
                            className={darkMode ? 'hover:bg-gray-700' : ''}
                          >
                            <Eye className="h-4 w-4 ml-2" />
                            عرض
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => router.push(`/dashboard/deep-analysis/${analysis.id}/edit`)}
                            className={darkMode ? 'hover:bg-gray-700' : ''}
                          >
                            <Edit className="h-4 w-4 ml-2" />
                            تعديل
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              navigator.clipboard.writeText(`${window.location.origin}/insights/deep/${analysis.slug}`);
                              toast.success('تم نسخ الرابط');
                            }}
                            className={darkMode ? 'hover:bg-gray-700' : ''}
                          >
                            <Copy className="h-4 w-4 ml-2" />
                            نسخ الرابط
                          </DropdownMenuItem>
                          <DropdownMenuSeparator className={darkMode ? 'bg-gray-700' : ''} />
                          {analysis.status === 'draft' && (
                            <DropdownMenuItem
                              onClick={() => handleStatusUpdate(analysis.id, 'published')}
                              className={darkMode ? 'hover:bg-gray-700' : ''}
                            >
                              <Send className="h-4 w-4 ml-2" />
                              نشر
                            </DropdownMenuItem>
                          )}
                          {analysis.status === 'published' && (
                            <DropdownMenuItem
                              onClick={() => handleStatusUpdate(analysis.id, 'archived')}
                              className={darkMode ? 'hover:bg-gray-700' : ''}
                            >
                              <Archive className="h-4 w-4 ml-2" />
                              أرشفة
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator className={darkMode ? 'bg-gray-700' : ''} />
                          <DropdownMenuItem
                            onClick={() => handleDelete(analysis.id)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                          >
                            <Trash2 className="h-4 w-4 ml-2" />
                            حذف
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* التصفح */}
        {totalPages > 1 && (
          <div className={`flex justify-between items-center px-6 py-4 border-t ${
            darkMode ? 'border-gray-700' : 'border-gray-200'
          }`}>
            <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              عرض {(page - 1) * 10 + 1} إلى {Math.min(page * 10, stats.total)} من {stats.total} تحليل
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className={darkMode ? 'border-gray-600' : ''}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const pageNum = i + 1;
                  return (
                    <Button
                      key={pageNum}
                      variant={page === pageNum ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setPage(pageNum)}
                      className={`w-8 h-8 p-0 ${
                        page === pageNum
                          ? 'bg-blue-500 text-white'
                          : darkMode
                            ? 'hover:bg-gray-700'
                            : ''
                      }`}
                    >
                      {pageNum}
                    </Button>
                  );
                })}
                {totalPages > 5 && (
                  <>
                    <span className={`px-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>...</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setPage(totalPages)}
                      className={`w-8 h-8 p-0 ${darkMode ? 'hover:bg-gray-700' : ''}`}
                    >
                      {totalPages}
                    </Button>
                  </>
                )}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
                className={darkMode ? 'border-gray-600' : ''}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 