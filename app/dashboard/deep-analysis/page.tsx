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
  Zap
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

interface Analysis {
  id: string;
  title: string;
  summary: string;
  category: string;
  status: 'published' | 'draft' | 'under_review';
  source: 'manual' | 'ai' | 'mixed';
  author: string;
  publishedAt: string;
  views: number;
  likes: number;
  comments: number;
  rating: number;
}

// بيانات تجريبية
const mockAnalyses: Analysis[] = [
  {
    id: '1',
    title: 'تحليل استراتيجي: مستقبل الذكاء الاصطناعي في المملكة العربية السعودية',
    summary: 'دراسة معمقة حول تطور تقنيات الذكاء الاصطناعي وتأثيرها على الاقتصاد السعودي في إطار رؤية 2030',
    category: 'تقنية',
    status: 'published',
    source: 'ai',
    author: 'د. أحمد الشمري',
    publishedAt: '2024-01-15',
    views: 15420,
    likes: 892,
    comments: 156,
    rating: 4.8
  },
  {
    id: '2',
    title: 'التحول الرقمي في القطاع المصرفي: التحديات والفرص',
    summary: 'تحليل شامل للتحديات التي تواجه البنوك السعودية في رحلة التحول الرقمي وأبرز الفرص المتاحة',
    category: 'اقتصاد',
    status: 'published',
    source: 'mixed',
    author: 'سارة القحطاني',
    publishedAt: '2024-01-14',
    views: 8930,
    likes: 567,
    comments: 89,
    rating: 4.5
  },
  {
    id: '3',
    title: 'مستقبل الطاقة المتجددة في دول الخليج',
    summary: 'رؤية تحليلية لمشاريع الطاقة المتجددة في المنطقة وتأثيرها على أسواق النفط العالمية',
    category: 'طاقة',
    status: 'draft',
    source: 'manual',
    author: 'محمد العتيبي',
    publishedAt: '2024-01-13',
    views: 0,
    likes: 0,
    comments: 0,
    rating: 0
  }
];

export default function DeepAnalysisPage() {
  const { darkMode } = useDarkMode();
  const router = useRouter();
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sourceFilter, setSourceFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    // محاكاة تحميل البيانات
    setTimeout(() => {
      setAnalyses(mockAnalyses);
      setLoading(false);
    }, 1000);
  }, []);

  const filteredAnalyses = analyses.filter(analysis => {
    const matchesSearch = analysis.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         analysis.summary.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || analysis.status === statusFilter;
    const matchesSource = sourceFilter === 'all' || analysis.source === sourceFilter;
    const matchesCategory = categoryFilter === 'all' || analysis.category === categoryFilter;
    const matchesTab = activeTab === 'all' || 
                      (activeTab === 'published' && analysis.status === 'published') ||
                      (activeTab === 'draft' && analysis.status === 'draft') ||
                      (activeTab === 'under_review' && analysis.status === 'under_review') ||
                      (activeTab === 'ai' && analysis.source === 'ai');
    
    return matchesSearch && matchesStatus && matchesSource && matchesCategory && matchesTab;
  });

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      published: { color: 'bg-green-100 text-green-700', text: 'منشور' },
      draft: { color: 'bg-yellow-100 text-yellow-700', text: 'مسودة' },
      under_review: { color: 'bg-blue-100 text-blue-700', text: 'قيد المراجعة' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig];
    return <span className={`px-2 py-1 text-xs rounded-full ${config.color}`}>{config.text}</span>;
  };

  const getSourceIcon = (source: string) => {
    switch(source) {
      case 'ai': return <Brain className="w-4 h-4 text-purple-500" />;
      case 'manual': return <Edit className="w-4 h-4 text-blue-500" />;
      case 'mixed': return <BarChart3 className="w-4 h-4 text-green-500" />;
      default: return null;
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا التحليل؟')) return;
    try {
      // في الإنتاج، سيتم حذف التحليل من API
      setAnalyses(prev => prev.filter(a => a.id !== id));
      toast.success('تم حذف التحليل بنجاح');
    } catch (e) {
      toast.error('فشل حذف التحليل');
    }
  };

  const handleCopy = (id: string) => {
    navigator.clipboard.writeText(`https://sabq.org/analysis/${id}`)
      .then(() => toast.success('تم نسخ الرابط'))
      .catch(() => toast.error('لم يتم نسخ الرابط'));
  };

  // التبويبات
  const statusTabs = [
    { 
      id: 'all', 
      name: 'جميع التحليلات', 
      count: analyses.length,
      icon: <FileText className="w-5 h-5" />
    },
    { 
      id: 'published', 
      name: 'منشور', 
      count: analyses.filter(item => item.status === 'published').length,
      icon: <Eye className="w-5 h-5" />
    },
    { 
      id: 'draft', 
      name: 'مسودة', 
      count: analyses.filter(item => item.status === 'draft').length,
      icon: <Edit className="w-5 h-5" />
    },
    { 
      id: 'under_review', 
      name: 'قيد المراجعة', 
      count: analyses.filter(item => item.status === 'under_review').length,
      icon: <Clock className="w-5 h-5" />
    },
    { 
      id: 'ai', 
      name: 'تحليلات AI', 
      count: analyses.filter(item => item.source === 'ai').length,
      icon: <Brain className="w-5 h-5" />
    }
  ];

  // مكون بطاقة الإحصائية المحسّنة
  const EnhancedStatsCard = ({ 
    title, 
    value, 
    subtitle, 
    icon: Icon, 
    bgGradient,
    iconColor,
    trend,
    trendValue
  }: {
    title: string;
    value: string | number;
    subtitle: string;
    icon: any;
    bgGradient: string;
    iconColor: string;
    trend?: 'up' | 'down';
    trendValue?: string;
  }) => (
    <div className={`rounded-2xl p-4 sm:p-6 shadow-sm border transition-all duration-300 hover:shadow-lg hover:scale-[1.02] ${
      darkMode 
        ? 'bg-gray-800 border-gray-700' 
        : 'bg-white border-gray-100'
    }`}>
      <div className="flex items-center gap-3 sm:gap-4">
        <div className={`w-12 h-12 sm:w-14 sm:h-14 ${bgGradient} rounded-2xl flex items-center justify-center shadow-lg`}>
          <Icon className={`w-6 h-6 sm:w-7 sm:h-7 ${iconColor}`} />
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
          {trend && trendValue && (
            <div className={`flex items-center gap-1 mt-2 text-xs ${
              trend === 'up' ? 'text-green-600' : 'text-red-600'
            }`}>
              <TrendingUp className={`w-3 h-3 ${trend === 'down' ? 'rotate-180' : ''}`} />
              <span>{trendValue}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className={`p-4 sm:p-6 lg:p-8 transition-colors duration-300 ${
      darkMode ? 'bg-gray-900' : ''
    }`}>
      {/* عنوان وتعريف الصفحة */}
      <div className="mb-6 sm:mb-8">
        <h1 className={`text-2xl sm:text-3xl font-bold mb-2 transition-colors duration-300 ${
          darkMode ? 'text-white' : 'text-gray-800'
        }`}>مركز التحليل العميق</h1>
        <p className={`text-sm sm:text-base transition-colors duration-300 ${
          darkMode ? 'text-gray-300' : 'text-gray-600'
        }`}>منصة متكاملة لإنشاء وإدارة التحليلات الاستراتيجية والرؤى المعمقة</p>
      </div>

      {/* قسم النظام التحليلي */}
      <div className="mb-6 sm:mb-8">
        <div className={`rounded-2xl p-4 sm:p-6 border transition-colors duration-300 ${
          darkMode 
            ? 'bg-gradient-to-r from-purple-900/30 to-indigo-900/30 border-purple-700' 
            : 'bg-gradient-to-r from-purple-50 to-indigo-50 border-purple-100'
        }`}>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                <Brain className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
              </div>
              <div>
                <h2 className={`text-lg sm:text-xl font-bold transition-colors duration-300 ${
                  darkMode ? 'text-white' : 'text-gray-800'
                }`}>نظام التحليل الاستراتيجي المتقدم</h2>
                <p className={`text-xs sm:text-sm transition-colors duration-300 ${
                  darkMode ? 'text-gray-300' : 'text-gray-600'
                }`}>أدوات ذكية لإنشاء تحليلات عميقة ورؤى استراتيجية بدعم الذكاء الاصطناعي</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
              <Link 
                href="/dashboard/deep-analysis/settings"
                className="flex-1 sm:flex-initial flex items-center justify-center gap-2 bg-gradient-to-r from-purple-500 to-pink-600 text-white px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl hover:from-purple-600 hover:to-pink-700 transition-all duration-300 shadow-md hover:shadow-lg text-sm"
              >
                <BarChart3 className="w-4 h-4" />
                <span className="hidden sm:inline">إعدادات AI</span>
                <span className="sm:hidden">إعدادات</span>
              </Link>
              
              <Link 
                href="/dashboard/deep-analysis/create"
                className="flex-1 sm:flex-initial flex items-center justify-center gap-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-300 shadow-md hover:shadow-lg text-sm"
              >
                <PenTool className="w-4 h-4" />
                تحليل جديد
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* بطاقات الإحصائيات المحسّنة */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8">
        <EnhancedStatsCard
          title="إجمالي التحليلات"
          value={analyses.length}
          subtitle="تحليل"
          icon={Brain}
          bgGradient="bg-gradient-to-br from-purple-500 to-indigo-600"
          iconColor="text-white"
          trend="up"
          trendValue="+23% هذا الشهر"
        />
        <EnhancedStatsCard
          title="التحليلات المنشورة"
          value={analyses.filter(a => a.status === 'published').length}
          subtitle="متاح للقراء"
          icon={Eye}
          bgGradient="bg-gradient-to-br from-green-500 to-emerald-600"
          iconColor="text-white"
          trend="up"
          trendValue="+15% هذا الأسبوع"
        />
        <EnhancedStatsCard
          title="متوسط التقييم"
          value="4.6"
          subtitle="من 5"
          icon={Star}
          bgGradient="bg-gradient-to-br from-yellow-500 to-amber-600"
          iconColor="text-white"
        />
        <EnhancedStatsCard
          title="إجمالي المشاهدات"
          value={formatNumber(analyses.reduce((acc, a) => acc + a.views, 0))}
          subtitle="مشاهدة"
          icon={Activity}
          bgGradient="bg-gradient-to-br from-blue-500 to-cyan-600"
          iconColor="text-white"
          trend="up"
          trendValue="+45% هذا الشهر"
        />
        <EnhancedStatsCard
          title="تحليلات AI"
          value={analyses.filter(a => a.source === 'ai').length}
          subtitle="بالذكاء الاصطناعي"
          icon={Sparkles}
          bgGradient="bg-gradient-to-br from-pink-500 to-rose-600"
          iconColor="text-white"
        />
      </div>

      {/* أزرار التنقل المحسّنة */}
      <div className={`rounded-2xl p-2 shadow-sm border mb-6 sm:mb-8 w-full transition-colors duration-300 ${
        darkMode 
          ? 'bg-gray-800 border-gray-700' 
          : 'bg-white border-gray-100'
      }`}>
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {statusTabs.map((tab) => {
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`min-w-[100px] sm:min-w-[120px] lg:w-44 flex flex-col items-center justify-center gap-1 sm:gap-2 py-3 sm:py-4 px-2 sm:px-3 rounded-xl font-medium text-xs sm:text-sm transition-all duration-300 relative ${
                  activeTab === tab.id
                    ? 'bg-purple-500 text-white shadow-md border-b-4 border-purple-600'
                    : darkMode
                      ? 'text-gray-300 hover:bg-gray-700 border-b-4 border-transparent hover:border-gray-600'
                      : 'text-gray-600 hover:bg-gray-50 border-b-4 border-transparent hover:border-gray-200'
                }`}
              >
                <div className={`transition-transform duration-300 ${activeTab === tab.id ? 'scale-110' : ''}`}>
                  {React.cloneElement(tab.icon, { className: 'w-4 h-4 sm:w-5 sm:h-5' })}
                </div>
                <div className="text-center">
                  <div className="whitespace-nowrap">{tab.name}</div>
                </div>
                {tab.count > 0 && (
                  <span className={`absolute top-1 sm:top-2 left-1 sm:left-2 px-1.5 sm:px-2 py-0.5 text-xs rounded-full ${
                    activeTab === tab.id
                      ? 'bg-white text-purple-500'
                      : darkMode
                        ? 'bg-gray-700 text-gray-300'
                        : 'bg-gray-100 text-gray-600'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* شريط البحث والفلاتر */}
      <div className={`rounded-2xl p-4 sm:p-6 shadow-sm border mb-6 sm:mb-8 transition-colors duration-300 ${
        darkMode 
          ? 'bg-gray-800 border-gray-700' 
          : 'bg-white border-gray-100'
      }`}>
        <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
          <div className="flex items-center gap-3 w-full lg:w-auto">
            <div className="relative flex-1 lg:w-96">
              <Search className={`absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 transition-colors duration-300 ${
                darkMode ? 'text-gray-400' : 'text-gray-500'
              }`} />
              <input
                type="text"
                placeholder="البحث في التحليلات..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full px-3 sm:px-4 py-2 sm:py-2.5 pr-10 sm:pr-11 text-sm rounded-lg border transition-all duration-300 ${
                  darkMode 
                    ? 'bg-gray-700 border-gray-600 text-gray-200 placeholder-gray-400 focus:border-purple-500 focus:bg-gray-600' 
                    : 'bg-white border-gray-200 text-gray-900 placeholder-gray-500 focus:border-purple-500 focus:bg-white'
                } focus:outline-none focus:ring-2 focus:ring-purple-500/20`}
              />
            </div>
          </div>
          
          <div className="flex items-center gap-2 w-full lg:w-auto">
            <select 
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className={`flex-1 lg:flex-initial px-3 sm:px-4 py-2 sm:py-2.5 text-sm rounded-lg border transition-all duration-300 ${
                darkMode 
                  ? 'bg-gray-700 border-gray-600 text-gray-200 focus:border-purple-500' 
                  : 'bg-white border-gray-200 text-gray-900 focus:border-purple-500'
              } focus:outline-none focus:ring-2 focus:ring-purple-500/20`}
            >
              <option value="all">جميع التصنيفات</option>
              <option value="تقنية">تقنية</option>
              <option value="اقتصاد">اقتصاد</option>
              <option value="طاقة">طاقة</option>
              <option value="صحة">صحة</option>
              <option value="تعليم">تعليم</option>
            </select>

            <select 
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value)}
              className={`flex-1 lg:flex-initial px-3 sm:px-4 py-2 sm:py-2.5 text-sm rounded-lg border transition-all duration-300 ${
                darkMode 
                  ? 'bg-gray-700 border-gray-600 text-gray-200 focus:border-purple-500' 
                  : 'bg-white border-gray-200 text-gray-900 focus:border-purple-500'
              } focus:outline-none focus:ring-2 focus:ring-purple-500/20`}
            >
              <option value="all">جميع المصادر</option>
              <option value="manual">يدوي</option>
              <option value="ai">ذكاء اصطناعي</option>
              <option value="mixed">مختلط</option>
            </select>
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
          <table className="min-w-full">
            <thead className={`${
              darkMode ? 'bg-gray-900' : 'bg-gray-50'
            }`}>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  العنوان
                </th>
                <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  التصنيف
                </th>
                <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  المصدر
                </th>
                <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  الحالة
                </th>
                <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  الإحصائيات
                </th>
                <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  التاريخ
                </th>
                <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  الإجراءات
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <div className="flex justify-center items-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                    </div>
                  </td>
                </tr>
              ) : filteredAnalyses.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                    لا توجد تحليلات متطابقة
                  </td>
                </tr>
              ) : (
                filteredAnalyses.map((analysis) => (
                  <tr key={analysis.id} className={`hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-200`}>
                    <td className="px-6 py-4">
                      <div>
                        <div className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          {analysis.title}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                          {analysis.summary.substring(0, 60)}...
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        darkMode 
                          ? 'bg-gray-700 text-gray-300' 
                          : 'bg-gray-100 text-gray-700'
                      }`}>{analysis.category}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {getSourceIcon(analysis.source)}
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {analysis.source === 'ai' ? 'AI' : analysis.source === 'manual' ? 'يدوي' : 'مختلط'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(analysis.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                        <div className="flex items-center gap-1">
                          <Eye className="w-4 h-4" />
                          {formatNumber(analysis.views)}
                        </div>
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-500" />
                          {analysis.rating}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {new Date(analysis.publishedAt).toLocaleDateString('ar-SA')}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-left text-sm font-medium">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className={`p-2 rounded-lg transition-colors ${
                            darkMode 
                              ? 'hover:bg-gray-700 text-gray-400' 
                              : 'hover:bg-gray-100 text-gray-600'
                          }`}>
                            <MoreHorizontal className="h-4 w-4" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className={`${
                          darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'
                        }`}>
                          <DropdownMenuItem asChild>
                            <Link href={`/dashboard/deep-analysis/${analysis.id}`} className="flex items-center gap-2">
                              <Eye className="h-4 w-4" />
                              عرض التفاصيل
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/dashboard/deep-analysis/${analysis.id}/edit`} className="flex items-center gap-2">
                              <Edit className="h-4 w-4" />
                              تحرير
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleCopy(analysis.id)} className="flex items-center gap-2">
                            <Copy className="h-4 w-4" />
                            نسخ الرابط
                          </DropdownMenuItem>
                          <DropdownMenuSeparator className={darkMode ? 'bg-gray-700' : ''} />
                          <DropdownMenuItem 
                            onClick={() => handleDelete(analysis.id)} 
                            className="flex items-center gap-2 text-red-600 dark:text-red-400"
                          >
                            <Trash2 className="h-4 w-4" />
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
      </div>
    </div>
  );
} 