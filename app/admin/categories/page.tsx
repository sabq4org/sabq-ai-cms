/**
 * صفحة التصنيفات - تصميم احترافي محسن
 * Categories Page - Enhanced Professional Design
 */

'use client';

import React, { useState, useEffect } from 'react';
// تم إزالة DashboardLayout - تستخدم الصفحة layout.tsx الأساسي
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useDarkModeContext } from '@/contexts/DarkModeContext';
import { 
  Folder,
  Plus,
  Search,
  Edit,
  Trash2,
  FileText,
  ArrowUp,
  ArrowDown,
  AlertTriangle,
  Eye,
  MoreHorizontal,
  Calendar,
  TrendingUp,
  BarChart3,
  Filter,
  SortDesc,
  CheckCircle,
  Clock,
  Activity,
  Sparkles,
  Target,
  Award,
  Lightbulb,
  HelpCircle,
  Copy,
  Archive,
  RefreshCw,
  ExternalLink,
  Bookmark,
  Share2,
  Download,
  FolderOpen,
  Hash,
  Palette,
  ToggleLeft,
  ToggleRight,
  Layers,
  FolderTree,
  ChevronLeft,
  ChevronRight,
  Settings,
  Globe,
  Zap
} from 'lucide-react';
import toast from 'react-hot-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import EditCategoryModal from '@/components/admin/categories/EditCategoryModal';

interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  color?: string;
  icon?: string;
  parent_id?: string;
  display_order?: number;
  is_active: boolean;
  articles_count?: number;
  created_at: string;
  updated_at: string;
}

export default function CategoriesPage() {
  const { darkMode } = useDarkModeContext();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState('display_order');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [filterActive, setFilterActive] = useState<'all' | 'active' | 'inactive'>('all');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

  // جلب التصنيفات
  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // إضافة timestamp لتجاوز الكاش
      const response = await fetch(`/api/categories?t=${Date.now()}`);
      const data = await response.json();
      
      if (response.ok && data.success) {
        setCategories(data.categories || []);
        setTotalPages(Math.ceil((data.categories?.length || 0) / 10));
      } else {
        setError(data.error || 'فشل في جلب التصنيفات');
      }
    } catch (err) {
      setError('حدث خطأ في الاتصال بالخادم');
      console.error('Error fetching categories:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // حذف تصنيف
  const handleDelete = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا التصنيف؟')) return;
    
    try {
      const response = await fetch(`/api/categories/${id}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        toast.success('تم حذف التصنيف بنجاح');
        fetchCategories();
      } else {
        toast.error('فشل في حذف التصنيف');
      }
    } catch (error) {
      console.error('Error deleting category:', error);
      toast.error('حدث خطأ في حذف التصنيف');
    }
  };

  // فتح نموذج التحرير
  const handleEdit = (category: Category) => {
    setSelectedCategory(category);
    setShowEditModal(true);
  };

  // إغلاق نموذج التحرير
  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setSelectedCategory(null);
  };

  // نجاح التحرير
  const handleEditSuccess = () => {
    fetchCategories();
    handleCloseEditModal();
  };

  // تبديل حالة التصنيف
  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/categories/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !currentStatus })
      });
      
      if (response.ok) {
        toast.success(`تم ${!currentStatus ? 'تفعيل' : 'إلغاء تفعيل'} التصنيف`);
        fetchCategories();
      } else {
        toast.error('فشل في تحديث حالة التصنيف');
      }
    } catch (error) {
      console.error('Error toggling category status:', error);
      toast.error('حدث خطأ في تحديث الحالة');
    }
  };

  // حساب الإحصائيات
  const stats = {
    total: categories.length,
    active: categories.filter(c => c.is_active).length,
    inactive: categories.filter(c => !c.is_active).length,
    withArticles: categories.filter(c => (c.articles_count || 0) > 0).length,
    totalArticles: categories.reduce((acc, c) => acc + (c.articles_count || 0), 0),
    parentCategories: categories.filter(c => !c.parent_id).length,
    subCategories: categories.filter(c => c.parent_id).length,
    recentlyUpdated: categories.filter(c => {
      const threeDaysAgo = new Date();
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
      return new Date(c.updated_at) > threeDaysAgo;
    }).length
  };

  // فلترة وترتيب التصنيفات
  const filteredCategories = categories
    .filter(category => {
      const matchesSearch = category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           category.slug.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesActive = filterActive === 'all' || 
                           (filterActive === 'active' && category.is_active) ||
                           (filterActive === 'inactive' && !category.is_active);
      return matchesSearch && matchesActive;
    })
    .sort((a, b) => {
      let compareValue = 0;
      switch (sortBy) {
        case 'name':
          compareValue = a.name.localeCompare(b.name);
          break;
        case 'articles_count':
          compareValue = (b.articles_count || 0) - (a.articles_count || 0);
          break;
        case 'updated_at':
          compareValue = new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
          break;
        default:
          compareValue = (a.display_order || 0) - (b.display_order || 0);
      }
      return sortOrder === 'asc' ? compareValue : -compareValue;
    });

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

  return (
    <div className={`transition-colors duration-300 ${
        darkMode ? 'bg-gray-900' : ''
      }`}>
        {/* عنوان وتعريف الصفحة المحسن */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            <div>
              <h1 className={`text-2xl sm:text-3xl font-bold mb-2 transition-colors duration-300 ${
                darkMode ? 'text-white' : 'text-gray-800'
              }`}>
                📁 إدارة التصنيفات
              </h1>
              <p className={`text-sm sm:text-base transition-colors duration-300 ${
                darkMode ? 'text-gray-300' : 'text-gray-600'
              }`}>
                تنظيم وإدارة تصنيفات المحتوى بكفاءة عالية
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700">
                <Layers className="w-3 h-3 mr-1" />
                {stats.total} تصنيف
              </Badge>
              <Badge variant="outline" className={darkMode ? 'border-gray-600' : ''}>
                <FileText className="w-3 h-3 mr-1" />
                {stats.totalArticles} مقال
              </Badge>
            </div>
          </div>
          
          {/* شريط المؤشرات السريعة */}
          <div className={`rounded-xl p-3 border ${
            darkMode 
              ? 'bg-gray-800/50 border-gray-700' 
              : 'bg-gray-50 border-gray-200'
          }`}>
            <div className="flex items-center justify-between text-xs sm:text-sm">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <CheckCircle className={`w-4 h-4 ${stats.active > 0 ? 'text-green-500' : 'text-gray-400'}`} />
                  <span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>
                    {stats.active} نشط
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <FolderTree className={`w-4 h-4 ${stats.parentCategories > 0 ? 'text-blue-500' : 'text-gray-400'}`} />
                  <span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>
                    {stats.parentCategories} رئيسي
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Activity className={`w-4 h-4 ${stats.recentlyUpdated > 0 ? 'text-orange-500' : 'text-gray-400'}`} />
                  <span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>
                    {stats.recentlyUpdated} محدث مؤخراً
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => toast('قريباً: استيراد التصنيفات', { icon: 'ℹ️' })}
                  className={`${darkMode ? 'border-gray-600 hover:bg-gray-700' : ''}`}
                >
                  <Download className="h-4 w-4 ml-2" />
                  استيراد
                </Button>
                <Button
                  onClick={() => setShowCreateForm(true)}
                  className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-lg"
                >
                  <Plus className="h-4 w-4 ml-2" />
                  إضافة تصنيف
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* بطاقات الإحصائيات المحسنة */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8">
          <StatsCard
            title="إجمالي التصنيفات"
            value={stats.total}
            subtitle="تصنيف"
            icon={Folder}
            bgColor="bg-gradient-to-br from-blue-100 to-blue-200"
            iconColor="text-blue-600"
          />
          <StatsCard
            title="نشط"
            value={stats.active}
            subtitle="تصنيف فعال"
            icon={CheckCircle}
            bgColor="bg-gradient-to-br from-green-100 to-green-200"
            iconColor="text-green-600"
          />
          <StatsCard
            title="غير نشط"
            value={stats.inactive}
            subtitle="معطل"
            icon={ToggleLeft}
            bgColor="bg-gradient-to-br from-gray-100 to-gray-200"
            iconColor="text-gray-600"
          />
          <StatsCard
            title="رئيسي"
            value={stats.parentCategories}
            subtitle="تصنيف أساسي"
            icon={FolderOpen}
            bgColor="bg-gradient-to-br from-purple-100 to-purple-200"
            iconColor="text-purple-600"
          />
          <StatsCard
            title="فرعي"
            value={stats.subCategories}
            subtitle="تصنيف فرعي"
            icon={FolderTree}
            bgColor="bg-gradient-to-br from-orange-100 to-orange-200"
            iconColor="text-orange-600"
          />
          <StatsCard
            title="المقالات"
            value={stats.totalArticles}
            subtitle="مقال"
            icon={FileText}
            bgColor="bg-gradient-to-br from-indigo-100 to-indigo-200"
            iconColor="text-indigo-600"
          />
        </div>

        {/* الفلاتر والبحث المحسن */}
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
                  placeholder="🔍 البحث في التصنيفات..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`pr-10 ${darkMode ? 'bg-gray-700 border-gray-600' : ''}`}
                />
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className={`${darkMode ? 'border-gray-600 hover:bg-gray-700' : ''} ${
                  showFilters ? 'bg-blue-50 border-blue-300' : ''
                }`}
              >
                <Filter className="h-4 w-4 ml-2" />
                فلاتر {showFilters ? '🔽' : '🔼'}
              </Button>
              
              <select 
                value={filterActive} 
                onChange={(e) => setFilterActive(e.target.value as any)}
                className={`px-3 py-1 text-sm rounded-md border ${
                  darkMode 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-white border-gray-300'
                }`}
              >
                <option value="all">📋 جميع الحالات</option>
                <option value="active">✅ نشط فقط</option>
                <option value="inactive">⏸️ غير نشط</option>
              </select>
              
              <select 
                value={sortBy} 
                onChange={(e) => setSortBy(e.target.value)}
                className={`px-3 py-1 text-sm rounded-md border ${
                  darkMode 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-white border-gray-300'
                }`}
              >
                <option value="display_order">📊 الترتيب</option>
                <option value="name">🔤 الاسم</option>
                <option value="articles_count">📰 عدد المقالات</option>
                <option value="updated_at">🕒 آخر تحديث</option>
              </select>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className={`${darkMode ? 'border-gray-600 hover:bg-gray-700' : ''}`}
              >
                <SortDesc className={`h-4 w-4 ${sortOrder === 'desc' ? 'rotate-180' : ''} transition-transform`} />
              </Button>
            </div>
          </div>
        </div>

        {/* جدول التصنيفات المحسن */}
        <div className={`rounded-2xl shadow-lg border overflow-hidden transition-colors duration-300 ${
          darkMode 
            ? 'bg-gray-800 border-gray-700' 
            : 'bg-white border-gray-100'
        }`}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className={`border-b ${darkMode ? 'border-gray-700 bg-gray-900/50' : 'border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100'}`}>
                  <th className={`px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider ${
                    darkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    📁 التصنيف
                  </th>
                  <th className={`px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider ${
                    darkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    🏷️ المعرف
                  </th>
                  <th className={`px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider ${
                    darkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    📊 الحالة
                  </th>
                  <th className={`px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider ${
                    darkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    📰 المقالات
                  </th>
                  <th className={`px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider ${
                    darkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    📅 آخر تحديث
                  </th>
                  <th className={`px-6 py-4 text-center text-xs font-semibold uppercase tracking-wider ${
                    darkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    ⚙️ الإجراءات
                  </th>
                </tr>
              </thead>
              <tbody className={`divide-y ${darkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
                {loading ? (
                  <tr>
                    <td colSpan={6} className="text-center py-16">
                      <div className="flex flex-col items-center justify-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
                        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          جاري تحميل التصنيفات...
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : filteredCategories.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-16">
                      <div className="flex flex-col items-center justify-center">
                        <Folder className="w-16 h-16 text-gray-300 mb-4" />
                        <h3 className={`text-lg font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          لا توجد تصنيفات
                        </h3>
                        <p className={`text-sm mb-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          ابدأ بإضافة أول تصنيف للمحتوى
                        </p>
                        <Button 
                          onClick={() => setShowCreateForm(true)}
                          className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white"
                        >
                          <Plus className="h-4 w-4 ml-2" />
                          إضافة تصنيف
                        </Button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredCategories.map((category) => (
                    <tr key={category.id} className={`transition-all duration-200 hover:scale-[1.01] ${
                      darkMode ? 'hover:bg-gray-700/50' : 'hover:bg-blue-50/50'
                    }`}>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div 
                            className={`w-10 h-10 rounded-lg flex items-center justify-center`}
                            style={{ backgroundColor: category.color || '#6B7280' }}
                          >
                            <span className="text-white text-lg">
                              {category.icon || '📁'}
                            </span>
                          </div>
                          <div>
                            <h3 className={`font-semibold text-sm ${
                              darkMode ? 'text-white' : 'text-gray-900'
                            }`}>
                              {category.name}
                            </h3>
                            {category.description && (
                              <p className={`text-xs mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                {category.description}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <Badge variant="outline" className="font-mono text-xs">
                          {category.slug}
                        </Badge>
                      </td>
                      <td className="px-6 py-5">
                        <Badge 
                          className={`${
                            category.is_active
                              ? 'bg-green-100 text-green-700 border-green-200'
                              : 'bg-gray-100 text-gray-700 border-gray-200'
                          }`}
                        >
                          {category.is_active ? '✅ نشط' : '⏸️ غير نشط'}
                        </Badge>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2">
                          <FileText className={`w-4 h-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                          <span className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            {category.articles_count || 0}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2">
                          <Calendar className={`h-4 w-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                          <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            {new Date(category.updated_at).toLocaleDateString('ar-SA')}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center justify-center gap-1">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleEdit(category)}
                                  className={`hover:bg-blue-100 dark:hover:bg-blue-900/20`}
                                >
                                  <Edit className="h-4 w-4 text-blue-600" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>✏️ تحرير</p>
                              </TooltipContent>
                            </Tooltip>
                            
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleToggleActive(category.id, category.is_active)}
                                  className={`${
                                    category.is_active 
                                      ? 'hover:bg-orange-100 dark:hover:bg-orange-900/20' 
                                      : 'hover:bg-green-100 dark:hover:bg-green-900/20'
                                  }`}
                                >
                                  {category.is_active ? (
                                    <ToggleRight className="h-4 w-4 text-orange-600" />
                                  ) : (
                                    <ToggleLeft className="h-4 w-4 text-green-600" />
                                  )}
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>{category.is_active ? '⏸️ إلغاء التفعيل' : '✅ تفعيل'}</p>
                              </TooltipContent>
                            </Tooltip>
                            
                            <DropdownMenu>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <DropdownMenuTrigger asChild>
                                    <Button 
                                      variant="ghost" 
                                      size="sm" 
                                      className={`hover:bg-gray-100 dark:hover:bg-gray-700`}
                                    >
                                      <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>⚙️ المزيد</p>
                                </TooltipContent>
                              </Tooltip>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => toast('قريباً: عرض المقالات', { icon: '📰' })}>
                                  <FileText className="h-4 w-4 ml-2 text-blue-600" />
                                  <span>📰 عرض المقالات</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => toast('قريباً: نسخ التصنيف', { icon: '📋' })}>
                                  <Copy className="h-4 w-4 ml-2 text-gray-600" />
                                  <span>📋 نسخ</span>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() => handleDelete(category.id)}
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                >
                                  <Trash2 className="h-4 w-4 ml-2" />
                                  <span>🗑️ حذف</span>
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TooltipProvider>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      
      {/* نموذج تحرير التصنيف */}
      <EditCategoryModal
        category={selectedCategory}
        isOpen={showEditModal}
        onClose={handleCloseEditModal}
        onSuccess={handleEditSuccess}
      />
    </div>
  );
};
