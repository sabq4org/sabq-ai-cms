'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Plus, 
  Search, 
  Edit3,
  Trash2,
  Eye,
  EyeOff,
  FolderOpen,
  Folder,
  Tag,
  Hash,
  Palette,
  ChevronDown,
  ChevronRight,
  MoreHorizontal,
  Move,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Info,
  Save,
  X,
  RefreshCw,
  Filter,
  SortAsc,
  Link,
  Globe
} from 'lucide-react';

interface Category {
  id: number;
  name_ar: string;
  name_en?: string;
  description?: string;
  slug: string;
  color_hex: string;
  icon?: string;
  parent_id?: number;
  position: number;
  is_active: boolean;
  created_at: string;
  updated_at?: string;
  children?: Category[];
  article_count?: number;
  meta_title?: string;
  meta_description?: string;
  can_delete?: boolean;
}

interface CategoryFormData {
  name_ar: string;
  name_en: string;
  description: string;
  slug: string;
  color_hex: string;
  icon: string;
  parent_id: number | undefined;
  position: number;
  is_active: boolean;
  meta_title: string;
  meta_description: string;
}

export default function CategoriesPage() {
  const [activeTab, setActiveTab] = useState('list');
  const [darkMode, setDarkMode] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<Set<number>>(new Set());
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [draggedCategory, setDraggedCategory] = useState<Category | null>(null);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error' | 'warning' | 'info';
    message: string;
  } | null>(null);

  // استرجاع حالة الوضع الليلي
  useEffect(() => {
    const savedDarkMode = localStorage.getItem('darkMode');
    if (savedDarkMode !== null) {
      setDarkMode(JSON.parse(savedDarkMode));
    }
  }, []);

  // تحميل البيانات الوهمية
  useEffect(() => {
    // محاكاة تحميل البيانات من API
    const mockCategories: Category[] = [
      {
        id: 1,
        name_ar: 'السياسة',
        name_en: 'Politics',
        description: 'أخبار سياسية محلية ودولية',
        slug: 'politics',
        color_hex: '#E5F1FA',
        icon: '🏛️',
        position: 1,
        is_active: true,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-06-15T12:00:00Z',
        article_count: 45,
        meta_title: 'أخبار السياسة - صحيفة سبق',
        meta_description: 'تابع آخر الأخبار السياسية المحلية والدولية مع صحيفة سبق',
        can_delete: false,
        children: [
          {
            id: 2,
            name_ar: 'السياسة المحلية',
            name_en: 'Local Politics',
            description: 'الأخبار السياسية المحلية',
            slug: 'local-politics',
            color_hex: '#E5F1FA',
            icon: '🏢',
            parent_id: 1,
            position: 1,
            is_active: true,
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-06-10T10:30:00Z',
            article_count: 25,
            meta_title: 'السياسة المحلية - أخبار الداخل',
            meta_description: 'آخر أخبار السياسة المحلية والقرارات الحكومية',
            can_delete: false
          },
          {
            id: 3,
            name_ar: 'السياسة الدولية',
            name_en: 'International Politics',
            description: 'الأخبار السياسية الدولية',
            slug: 'international-politics',
            color_hex: '#E5F1FA',
            icon: '🌍',
            parent_id: 1,
            position: 2,
            is_active: true,
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-06-12T16:20:00Z',
            article_count: 20,
            meta_title: 'السياسة الدولية - أخبار العالم',
            meta_description: 'تغطية شاملة للأحداث السياسية الدولية',
            can_delete: false
          }
        ]
      },
      {
        id: 4,
        name_ar: 'الاقتصاد',
        name_en: 'Economy',
        description: 'أخبار اقتصادية ومالية',
        slug: 'economy',
        color_hex: '#E3FCEF',
        icon: '💰',
        position: 2,
        is_active: true,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-06-14T14:15:00Z',
        article_count: 38,
        meta_title: 'الأخبار الاقتصادية - صحيفة سبق',
        meta_description: 'تابع آخر الأخبار الاقتصادية والمالية والاستثمارية',
        can_delete: false,
        children: [
          {
            id: 5,
            name_ar: 'البورصة',
            name_en: 'Stock Market',
            description: 'أخبار البورصة والأسهم',
            slug: 'stock-market',
            color_hex: '#E3FCEF',
            icon: '📈',
            parent_id: 4,
            position: 1,
            is_active: true,
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-06-13T09:45:00Z',
            article_count: 18,
            meta_title: 'أخبار البورصة والأسهم',
            meta_description: 'تحليلات وأخبار البورصة السعودية والعالمية',
            can_delete: false
          }
        ]
      },
      {
        id: 6,
        name_ar: 'التكنولوجيا',
        name_en: 'Technology',
        description: 'أخبار التقنية والابتكار',
        slug: 'technology',
        color_hex: '#F2F6FF',
        icon: '💻',
        position: 3,
        is_active: true,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-06-15T11:30:00Z',
        article_count: 52,
        meta_title: 'أخبار التكنولوجيا والابتكار',
        meta_description: 'آخر أخبار التقنية والذكاء الاصطناعي والابتكار',
        can_delete: false
      },
      {
        id: 7,
        name_ar: 'الرياضة',
        name_en: 'Sports',
        description: 'أخبار رياضية',
        slug: 'sports',
        color_hex: '#FFF5E5',
        icon: '⚽',
        position: 4,
        is_active: false,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-06-08T18:00:00Z',
        article_count: 29,
        meta_title: 'الأخبار الرياضية',
        meta_description: 'تغطية شاملة للأحداث الرياضية المحلية والعالمية',
        can_delete: false
      },
      {
        id: 8,
        name_ar: 'ثقافة وفنون',
        name_en: 'Culture & Arts',
        description: 'أخبار الثقافة والفنون',
        slug: 'culture-arts',
        color_hex: '#FDE7F3',
        icon: '🎭',
        position: 5,
        is_active: true,
        created_at: '2024-01-15T00:00:00Z',
        updated_at: '2024-06-01T13:20:00Z',
        article_count: 0,
        meta_title: 'أخبار الثقافة والفنون',
        meta_description: 'متابعة الأحداث الثقافية والفنية والمهرجانات',
        can_delete: true
      }
    ];

    setTimeout(() => {
      setCategories(mockCategories);
      setLoading(false);
    }, 1000);
  }, []);

  // ألوان التصنيفات المتاحة - مجموعة موسعة من الألوان الهادئة والفاتحة
  const categoryColors = [
    { name: 'أزرق سماوي', value: '#E5F1FA', textColor: '#1E40AF' },
    { name: 'أخضر ناعم', value: '#E3FCEF', textColor: '#065F46' },
    { name: 'برتقالي دافئ', value: '#FFF5E5', textColor: '#C2410C' },
    { name: 'وردي خفيف', value: '#FDE7F3', textColor: '#BE185D' },
    { name: 'بنفسجي فاتح', value: '#F2F6FF', textColor: '#6366F1' },
    { name: 'أصفر ذهبي', value: '#FEF3C7', textColor: '#D97706' },
    { name: 'أخضر زمردي', value: '#F0FDF4', textColor: '#047857' },
    { name: 'أزرق غامق', value: '#EFF6FF', textColor: '#1D4ED8' },
    { name: 'بنفسجي وردي', value: '#FAF5FF', textColor: '#7C3AED' },
    { name: 'برتقالي فاتح', value: '#FFF7ED', textColor: '#EA580C' },
    { name: 'رمادي هادئ', value: '#F9FAFB', textColor: '#374151' },
    { name: 'تركوازي ناعم', value: '#F0FDFA', textColor: '#0F766E' }
  ];

  // الأيقونات المتاحة - مجموعة موسعة مع تنوع أكبر
  const categoryIcons = [
    '📰', '🏛️', '💼', '⚽', '🎭', '💡', '🌍', '📱', 
    '🏥', '🚗', '✈️', '🏠', '🎓', '💰', '⚖️', '🔬',
    '🎨', '🎵', '📺', '🍽️', '👗', '💊', '🌱', '🔥',
    '💎', '⭐', '🎯', '🚀', '🏆', '📊', '🎪', '🌈'
  ];

  // مكون بطاقة الإحصائية الدائرية
  const CircularStatsCard = ({ 
    title, 
    value, 
    subtitle, 
    icon: Icon, 
    bgColor,
    iconColor
  }: {
    title: string;
    value: string;
    subtitle: string;
    icon: any;
    bgColor: string;
    iconColor: string;
  }) => (
    <div className={`rounded-2xl p-6 shadow-sm border transition-colors duration-300 hover:shadow-md ${
      darkMode 
        ? 'bg-gray-800 border-gray-700' 
        : 'bg-white border-gray-100'
    }`}>
      <div className="flex items-center gap-4">
        <div className={`w-12 h-12 ${bgColor} rounded-full flex items-center justify-center`}>
          <Icon className={`w-6 h-6 ${iconColor}`} />
        </div>
        <div className="flex-1">
          <p className={`text-sm mb-1 transition-colors duration-300 ${
            darkMode ? 'text-gray-400' : 'text-gray-500'
          }`}>{title}</p>
          <div className="flex items-baseline gap-2">
            <span className={`text-2xl font-bold transition-colors duration-300 ${
              darkMode ? 'text-white' : 'text-gray-800'
            }`}>{value}</span>
            <span className={`text-sm transition-colors duration-300 ${
              darkMode ? 'text-gray-400' : 'text-gray-500'
            }`}>{subtitle}</span>
          </div>
        </div>
      </div>
    </div>
  );

  // مكون أزرار التنقل
  const NavigationTabs = () => {
    const tabs = [
      { id: 'list', name: 'قائمة التصنيفات', icon: Folder },
      { id: 'hierarchy', name: 'التسلسل الهرمي', icon: FolderOpen },
      { id: 'analytics', name: 'إحصائيات الاستخدام', icon: Tag },
      { id: 'settings', name: 'إعدادات التصنيفات', icon: Palette }
    ];

    return (
      <div className={`rounded-2xl p-2 shadow-sm border mb-8 w-full transition-colors duration-300 ${
        darkMode 
          ? 'bg-gray-800 border-gray-700' 
          : 'bg-white border-gray-100'
      }`}>
        <div className="flex gap-2 justify-start pr-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-48 flex flex-col items-center justify-center gap-2 py-4 pb-3 px-3 rounded-xl font-medium text-sm transition-all duration-300 ${
                  activeTab === tab.id
                    ? 'bg-blue-500 text-white shadow-md border-b-4 border-blue-600'
                    : darkMode
                      ? 'text-gray-300 hover:bg-gray-700 border-b-4 border-transparent hover:border-gray-600'
                      : 'text-gray-600 hover:bg-gray-50 border-b-4 border-transparent hover:border-gray-200'
                }`}
              >
                <Icon className="w-5 h-5" />
                {tab.name}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  // مكون شجرة التصنيفات
  const CategoryTree = ({ categories, level = 0 }: { categories: Category[], level?: number }) => {
    return (
      <div className={level > 0 ? 'mr-6' : ''}>
        {categories.map((category) => (
          <div key={category.id} className="mb-2">
            <div className={`p-4 rounded-xl border transition-colors duration-200 ${
              darkMode 
                ? 'bg-gray-700 border-gray-600 hover:bg-gray-600' 
                : 'bg-white border-gray-200 hover:bg-gray-50'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {category.children && category.children.length > 0 && (
                    <button
                      onClick={() => {
                        const newExpanded = new Set(expandedCategories);
                        if (expandedCategories.has(category.id)) {
                          newExpanded.delete(category.id);
                        } else {
                          newExpanded.add(category.id);
                        }
                        setExpandedCategories(newExpanded);
                      }}
                      className="p-1 hover:bg-gray-200 rounded"
                    >
                      {expandedCategories.has(category.id) ? (
                        <ChevronDown className="w-4 h-4" />
                      ) : (
                        <ChevronRight className="w-4 h-4" />
                      )}
                    </button>
                  )}
                  
                  <div 
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-sm"
                    style={{ 
                      backgroundColor: category.color_hex,
                      color: categoryColors.find(c => c.value === category.color_hex)?.textColor || '#000'
                    }}
                  >
                    {category.icon}
                  </div>
                  
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className={`font-semibold transition-colors duration-300 ${
                        darkMode ? 'text-white' : 'text-gray-900'
                      }`}>{category.name_ar}</h3>
                      {category.name_en && (
                        <span className={`text-sm transition-colors duration-300 ${
                          darkMode ? 'text-gray-400' : 'text-gray-500'
                        }`}>({category.name_en})</span>
                      )}
                      {!category.is_active && (
                        <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs">
                          مخفي
                        </span>
                      )}
                    </div>
                    {category.description && (
                      <p className={`text-sm transition-colors duration-300 ${
                        darkMode ? 'text-gray-400' : 'text-gray-600'
                      }`}>{category.description}</p>
                    )}
                    <div className="flex items-center gap-4 text-xs text-gray-500 mt-1">
                      <span>/{category.slug}</span>
                      <span>{category.article_count} مقال</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setSelectedCategory(category);
                      setShowEditModal(true);
                    }}
                    className={`p-2 rounded-lg transition-colors duration-200 ${
                      darkMode 
                        ? 'text-blue-400 hover:bg-blue-900/20' 
                        : 'text-blue-600 hover:bg-blue-50'
                    }`}
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleToggleStatus(category.id)}
                    className={`p-2 rounded-lg transition-colors duration-200 ${
                      category.is_active
                        ? darkMode 
                          ? 'text-yellow-400 hover:bg-yellow-900/20' 
                          : 'text-yellow-600 hover:bg-yellow-50'
                        : darkMode 
                          ? 'text-green-400 hover:bg-green-900/20' 
                          : 'text-green-600 hover:bg-green-50'
                    }`}
                    title={category.is_active ? 'إخفاء التصنيف' : 'إظهار التصنيف'}
                  >
                    {category.is_active ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => handleDeleteCategory(category.id)}
                    disabled={category.article_count ? category.article_count > 0 && !category.can_delete : false}
                    className={`p-2 rounded-lg transition-colors duration-200 ${
                      (category.article_count && category.article_count > 0 && !category.can_delete)
                        ? darkMode 
                          ? 'text-gray-600 cursor-not-allowed' 
                          : 'text-gray-400 cursor-not-allowed'
                        : darkMode 
                          ? 'text-red-400 hover:bg-red-900/20' 
                          : 'text-red-600 hover:bg-red-50'
                    }`}
                    title={
                      (category.article_count && category.article_count > 0 && !category.can_delete)
                        ? 'لا يمكن حذف تصنيف يحتوي على مقالات'
                        : 'حذف التصنيف'
                    }
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <button
                    className={`p-2 rounded-lg transition-colors duration-200 ${
                      darkMode 
                        ? 'text-gray-400 hover:bg-gray-700' 
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <MoreHorizontal className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
            
            {/* التصنيفات الفرعية */}
            {category.children && 
             category.children.length > 0 && 
             expandedCategories.has(category.id) && (
              <div className="mt-2">
                <CategoryTree categories={category.children} level={level + 1} />
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  // مكون نموذج إضافة/تعديل التصنيف المحسن
  const CategoryModal = ({ isEdit = false }: { isEdit?: boolean }) => {
    const [formData, setFormData] = useState<CategoryFormData>({
      name_ar: isEdit ? selectedCategory?.name_ar || '' : '',
      name_en: isEdit ? selectedCategory?.name_en || '' : '',
      description: isEdit ? selectedCategory?.description || '' : '',
      slug: isEdit ? selectedCategory?.slug || '' : '',
      color_hex: isEdit ? selectedCategory?.color_hex || '#E5F1FA' : '#E5F1FA',
      icon: isEdit ? selectedCategory?.icon || '' : '📰',
      parent_id: isEdit ? selectedCategory?.parent_id : undefined,
      position: isEdit ? selectedCategory?.position || 0 : 0,
      is_active: isEdit ? selectedCategory?.is_active ?? true : true,
      meta_title: isEdit ? selectedCategory?.meta_title || '' : '',
      meta_description: isEdit ? selectedCategory?.meta_description || '' : ''
    });

    const [activeTab, setActiveTab] = useState<'basic' | 'seo' | 'advanced'>('basic');

    // توليد slug تلقائي من الاسم العربي
    const generateSlug = (text: string) => {
      return text
        .replace(/[أإآ]/g, 'a')
        .replace(/[ؤ]/g, 'o')
        .replace(/[ئ]/g, 'i')
        .replace(/[ة]/g, 'h')
        .replace(/[ىي]/g, 'y')
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .toLowerCase();
    };

    const handleNameChange = (value: string) => {
      setFormData(prev => ({
        ...prev,
        name_ar: value,
        slug: prev.slug === '' ? generateSlug(value) : prev.slug,
        meta_title: prev.meta_title === '' ? `${value} - صحيفة سبق` : prev.meta_title
      }));
    };

    const handleSave = async () => {
      try {
        // في التطبيق الحقيقي، سيتم إرسال البيانات للخادم
        console.log('حفظ التصنيف:', formData);
        
        if (isEdit && selectedCategory) {
          // تحديث التصنيف الموجود
          setCategories(prev => prev.map(cat => 
            cat.id === selectedCategory.id 
              ? { ...cat, ...formData, updated_at: new Date().toISOString() }
              : {
                  ...cat,
                  children: cat.children?.map(child =>
                    child.id === selectedCategory.id 
                      ? { ...child, ...formData, updated_at: new Date().toISOString() }
                      : child
                  )
                }
          ));
          
          setNotification({
            type: 'success',
            message: 'تم تحديث التصنيف بنجاح'
          });
        } else {
          // إضافة تصنيف جديد
          const newCategory: Category = {
            id: Math.max(...categories.map(c => c.id)) + 1,
            ...formData,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            article_count: 0,
            can_delete: true
          };
          
          if (formData.parent_id) {
            // إضافة كتصنيف فرعي
            setCategories(prev => prev.map(cat => 
              cat.id === formData.parent_id 
                ? { ...cat, children: [...(cat.children || []), newCategory] }
                : cat
            ));
          } else {
            // إضافة كتصنيف رئيسي
            setCategories(prev => [...prev, newCategory]);
          }
          
          setNotification({
            type: 'success',
            message: 'تم إضافة التصنيف بنجاح'
          });
        }
        
        // إغلاق النموذج
        setShowAddModal(false);
        setShowEditModal(false);
        setSelectedCategory(null);
        
        setTimeout(() => setNotification(null), 3000);
      } catch (error) {
        setNotification({
          type: 'error',
          message: 'حدث خطأ في حفظ التصنيف'
        });
      }
    };

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className={`rounded-2xl p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto ${
          darkMode ? 'bg-gray-800' : 'bg-white'
        }`}>
          <div className="flex items-center justify-between mb-6">
            <h3 className={`text-xl font-bold transition-colors duration-300 ${
              darkMode ? 'text-white' : 'text-gray-800'
            }`}>
              {isEdit ? 'تعديل التصنيف' : 'إضافة تصنيف جديد'}
            </h3>
            <button
              onClick={() => {
                setShowAddModal(false);
                setShowEditModal(false);
                setSelectedCategory(null);
              }}
              className={`p-2 rounded-lg transition-colors ${
                darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
              }`}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* تبويبات النموذج */}
          <div className="flex border-b border-gray-200 mb-6">
            {[
              { id: 'basic', name: 'المعلومات الأساسية', icon: Tag },
              { id: 'seo', name: 'تحسين محركات البحث', icon: Globe },
              { id: 'advanced', name: 'إعدادات متقدمة', icon: Hash }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-4 py-2 border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : darkMode
                        ? 'border-transparent text-gray-400 hover:text-gray-300'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.name}
                </button>
              );
            })}
          </div>
          
          <div className="space-y-6">
            {/* الاسم بالعربية */}
            <div>
              <label className={`block text-sm font-medium mb-2 transition-colors duration-300 ${
                darkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                اسم التصنيف (عربي) *
              </label>
              <input
                type="text"
                value={formData.name_ar}
                onChange={(e) => handleNameChange(e.target.value)}
                className={`w-full px-4 py-2 rounded-xl border transition-colors duration-300 ${
                  darkMode 
                    ? 'bg-gray-700 border-gray-600 text-gray-200 focus:border-blue-500' 
                    : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
                } focus:outline-none focus:ring-1 focus:ring-blue-500`}
                placeholder="مثال: السياسة"
                required
              />
            </div>

            {/* الاسم بالإنجليزية */}
            <div>
              <label className={`block text-sm font-medium mb-2 transition-colors duration-300 ${
                darkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                اسم التصنيف (إنجليزي)
              </label>
              <input
                type="text"
                value={formData.name_en}
                onChange={(e) => setFormData({...formData, name_en: e.target.value})}
                className={`w-full px-4 py-2 rounded-xl border transition-colors duration-300 ${
                  darkMode 
                    ? 'bg-gray-700 border-gray-600 text-gray-200 focus:border-blue-500' 
                    : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
                } focus:outline-none focus:ring-1 focus:ring-blue-500`}
                placeholder="Politics"
              />
            </div>

            {/* الوصف */}
            <div>
              <label className={`block text-sm font-medium mb-2 transition-colors duration-300 ${
                darkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                الوصف
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                rows={3}
                className={`w-full px-4 py-2 rounded-xl border transition-colors duration-300 ${
                  darkMode 
                    ? 'bg-gray-700 border-gray-600 text-gray-200 focus:border-blue-500' 
                    : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
                } focus:outline-none focus:ring-1 focus:ring-blue-500`}
                placeholder="وصف مختصر للتصنيف"
              />
            </div>

            {/* الرابط المختصر */}
            <div>
              <label className={`block text-sm font-medium mb-2 transition-colors duration-300 ${
                darkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                الرابط المختصر (Slug) *
              </label>
              <input
                type="text"
                value={formData.slug}
                onChange={(e) => setFormData({...formData, slug: e.target.value})}
                className={`w-full px-4 py-2 rounded-xl border transition-colors duration-300 ${
                  darkMode 
                    ? 'bg-gray-700 border-gray-600 text-gray-200 focus:border-blue-500' 
                    : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
                } focus:outline-none focus:ring-1 focus:ring-blue-500`}
                placeholder="politics"
              />
            </div>

            {/* اللون */}
            <div>
              <label className={`block text-sm font-medium mb-2 transition-colors duration-300 ${
                darkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                لون التصنيف
              </label>
              <div className="grid grid-cols-7 gap-3">
                {categoryColors.map((color) => (
                  <button
                    key={color.value}
                    onClick={() => setFormData({...formData, color_hex: color.value})}
                    className={`w-12 h-12 rounded-xl border-2 transition-all duration-200 ${
                      formData.color_hex === color.value ? 'border-gray-400 scale-110' : 'border-gray-200'
                    }`}
                    style={{ backgroundColor: color.value }}
                    title={color.name}
                  />
                ))}
              </div>
            </div>

            {/* الأيقونة */}
            <div>
              <label className={`block text-sm font-medium mb-2 transition-colors duration-300 ${
                darkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                الأيقونة
              </label>
              <div className="grid grid-cols-10 gap-2">
                {categoryIcons.map((icon) => (
                  <button
                    key={icon}
                    onClick={() => setFormData({...formData, icon})}
                    className={`w-12 h-12 rounded-xl border transition-all duration-200 flex items-center justify-center text-xl ${
                      formData.icon === icon 
                        ? 'border-blue-500 bg-blue-50' 
                        : darkMode 
                          ? 'border-gray-600 hover:bg-gray-700' 
                          : 'border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    {icon}
                  </button>
                ))}
              </div>
            </div>

            {/* التصنيف الأب */}
            <div>
              <label className={`block text-sm font-medium mb-2 transition-colors duration-300 ${
                darkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                التصنيف الأب
              </label>
              <select
                value={formData.parent_id || ''}
                onChange={(e) => setFormData({...formData, parent_id: e.target.value ? parseInt(e.target.value) : undefined})}
                className={`w-full px-4 py-2 rounded-xl border transition-colors duration-300 ${
                  darkMode 
                    ? 'bg-gray-700 border-gray-600 text-gray-200 focus:border-blue-500' 
                    : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
                } focus:outline-none focus:ring-1 focus:ring-blue-500`}
              >
                <option value="">-- تصنيف رئيسي --</option>
                {categories.filter((cat: Category) => !cat.parent_id).map((category: Category) => (
                  <option key={category.id} value={category.id}>
                    {category.name_ar}
                  </option>
                ))}
              </select>
            </div>

            {/* حقول SEO */}
            <div className="border-t pt-6">
              <h4 className={`text-lg font-semibold mb-4 transition-colors duration-300 ${
                darkMode ? 'text-white' : 'text-gray-800'
              }`}>
                تحسين محركات البحث (SEO)
              </h4>
              
              {/* عنوان الصفحة */}
              <div className="mb-4">
                <label className={`block text-sm font-medium mb-2 transition-colors duration-300 ${
                  darkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  عنوان الصفحة (Meta Title)
                </label>
                <input
                  type="text"
                  value={formData.meta_title}
                  onChange={(e) => setFormData({...formData, meta_title: e.target.value})}
                  className={`w-full px-4 py-2 rounded-xl border transition-colors duration-300 ${
                    darkMode 
                      ? 'bg-gray-700 border-gray-600 text-gray-200 focus:border-blue-500' 
                      : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
                  } focus:outline-none focus:ring-1 focus:ring-blue-500`}
                  placeholder="مثال: أخبار السياسة - صحيفة سبق"
                  maxLength={60}
                />
                <p className="text-xs text-gray-500 mt-1">
                  {formData.meta_title.length}/60 حرف (الأمثل: 50-60 حرف)
                </p>
              </div>

              {/* وصف الصفحة */}
              <div>
                <label className={`block text-sm font-medium mb-2 transition-colors duration-300 ${
                  darkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  وصف الصفحة (Meta Description)
                </label>
                <textarea
                  value={formData.meta_description}
                  onChange={(e) => setFormData({...formData, meta_description: e.target.value})}
                  rows={3}
                  className={`w-full px-4 py-2 rounded-xl border transition-colors duration-300 ${
                    darkMode 
                      ? 'bg-gray-700 border-gray-600 text-gray-200 focus:border-blue-500' 
                      : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
                  } focus:outline-none focus:ring-1 focus:ring-blue-500`}
                  placeholder="وصف مختصر وجذاب لتصنيف الأخبار يظهر في نتائج البحث"
                  maxLength={160}
                />
                <p className="text-xs text-gray-500 mt-1">
                  {formData.meta_description.length}/160 حرف (الأمثل: 150-160 حرف)
                </p>
              </div>

              {/* معاينة نتيجة البحث */}
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-600 mb-2">معاينة في نتائج البحث:</p>
                <div className="bg-white p-3 rounded border">
                  <h5 className="text-blue-600 text-lg font-medium mb-1 truncate">
                    {formData.meta_title || formData.name_ar}
                  </h5>
                  <p className="text-green-700 text-sm mb-1">
                    https://sabq.org/news/{formData.slug}
                  </p>
                  <p className="text-gray-600 text-sm line-clamp-2">
                    {formData.meta_description || formData.description}
                  </p>
                </div>
              </div>
            </div>

            {/* الحالة */}
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="is_active"
                checked={formData.is_active}
                onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <label htmlFor="is_active" className={`text-sm font-medium transition-colors duration-300 ${
                darkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                تفعيل التصنيف (ظاهر في الواجهة)
              </label>
            </div>
          </div>

          {/* أزرار الحفظ والإلغاء */}
          <div className="flex gap-3 mt-8 pt-6 border-t">
            <button
              onClick={() => {
                setShowAddModal(false);
                setShowEditModal(false);
                setSelectedCategory(null);
              }}
              className={`flex-1 px-6 py-3 rounded-xl border transition-colors duration-300 ${
                darkMode 
                  ? 'border-gray-600 text-gray-300 hover:bg-gray-700' 
                  : 'border-gray-300 text-gray-600 hover:bg-gray-50'
              }`}
            >
              إلغاء
            </button>
            <button 
              onClick={handleSave}
              disabled={!formData.name_ar.trim() || !formData.slug.trim()}
              className={`flex-1 px-6 py-3 rounded-xl transition-colors flex items-center justify-center gap-2 ${
                !formData.name_ar.trim() || !formData.slug.trim()
                  ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                  : 'bg-blue-500 text-white hover:bg-blue-600'
              }`}
            >
              <Save className="w-4 h-4" />
              {isEdit ? 'حفظ التعديلات' : 'إضافة التصنيف'}
            </button>
          </div>
        </div>
      </div>
    );
  };

  // وظائف إدارة التصنيفات
  const handleToggleStatus = async (categoryId: number) => {
    try {
      setCategories(prev => prev.map(cat => 
        cat.id === categoryId 
          ? { ...cat, is_active: !cat.is_active }
          : {
              ...cat,
              children: cat.children?.map(child =>
                child.id === categoryId ? { ...child, is_active: !child.is_active } : child
              )
            }
      ));
      
      setNotification({
        type: 'success',
        message: 'تم تحديث حالة التصنيف بنجاح'
      });
      
      setTimeout(() => setNotification(null), 3000);
    } catch (error) {
      setNotification({
        type: 'error',
        message: 'حدث خطأ في تحديث التصنيف'
      });
    }
  };

  const handleDeleteCategory = async (categoryId: number) => {
    const category = categories.find(cat => cat.id === categoryId) || 
                     categories.find(cat => cat.children?.some(child => child.id === categoryId));
    
    if (category && !category.can_delete && category.article_count && category.article_count > 0) {
      setNotification({
        type: 'warning',
        message: 'لا يمكن حذف تصنيف يحتوي على مقالات. يرجى نقل المقالات أولاً.'
      });
      setTimeout(() => setNotification(null), 5000);
      return;
    }
    
    if (window.confirm('هل أنت متأكد من حذف هذا التصنيف؟ هذا الإجراء لا يمكن التراجع عنه.')) {
      try {
        setCategories(prev => 
          prev.filter(cat => cat.id !== categoryId)
            .map(cat => ({
              ...cat,
              children: cat.children?.filter(child => child.id !== categoryId)
            }))
        );
        
        setNotification({
          type: 'success',
          message: 'تم حذف التصنيف بنجاح'
        });
        
        setTimeout(() => setNotification(null), 3000);
      } catch (error) {
        setNotification({
          type: 'error',
          message: 'حدث خطأ في حذف التصنيف'
        });
      }
    }
  };

  // مكون الإشعارات
  const NotificationComponent = () => {
    if (!notification) return null;
    
    const iconMap = {
      success: CheckCircle,
      error: XCircle,
      warning: AlertTriangle,
      info: Info
    };
    
    const colorMap = {
      success: 'bg-green-500',
      error: 'bg-red-500',
      warning: 'bg-yellow-500',
      info: 'bg-blue-500'
    };
    
    const Icon = iconMap[notification.type];
    
    return (
      <div className="fixed top-4 right-4 z-50 max-w-sm">
        <div className={`${colorMap[notification.type]} text-white p-4 rounded-lg shadow-lg flex items-center gap-3`}>
          <Icon className="w-5 h-5" />
          <span className="flex-1">{notification.message}</span>
          <button 
            onClick={() => setNotification(null)}
            className="hover:bg-white/20 p-1 rounded"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-500" />
          <p className="text-gray-600">جارٍ تحميل التصنيفات...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`p-8 transition-colors duration-300 ${
      darkMode ? 'bg-gray-900' : ''
    }`}>
      {/* مكون الإشعارات */}
      <NotificationComponent />
      {/* عنوان وتعريف الصفحة */}
      <div className="mb-8">
        <h1 className={`text-3xl font-bold mb-2 transition-colors duration-300 ${
          darkMode ? 'text-white' : 'text-gray-800'
        }`}>إدارة التصنيفات</h1>
        <p className={`transition-colors duration-300 ${
          darkMode ? 'text-gray-300' : 'text-gray-600'
        }`}>نظام متقدم لإدارة تصنيفات المحتوى مع دعم التسلسل الهرمي والألوان</p>
      </div>

      {/* إحصائيات التصنيفات */}
      <div className="grid grid-cols-6 gap-6 mb-8">
        <CircularStatsCard
          title="إجمالي التصنيفات"
          value={`${categories.length + categories.reduce((sum, cat) => sum + (cat.children?.length || 0), 0)}`}
          subtitle="تصنيف"
          icon={Folder}
          bgColor="bg-blue-100"
          iconColor="text-blue-600"
        />
        <CircularStatsCard
          title="التصنيفات الرئيسية"
          value={`${categories.filter(cat => !cat.parent_id).length}`}
          subtitle="رئيسي"
          icon={FolderOpen}
          bgColor="bg-green-100"
          iconColor="text-green-600"
        />
        <CircularStatsCard
          title="التصنيفات الفرعية"
          value={`${categories.reduce((sum, cat) => sum + (cat.children?.length || 0), 0)}`}
          subtitle="فرعي"
          icon={Tag}
          bgColor="bg-purple-100"
          iconColor="text-purple-600"
        />
        <CircularStatsCard
          title="التصنيفات النشطة"
          value={`${categories.filter(cat => cat.is_active).length + categories.reduce((sum, cat) => sum + (cat.children?.filter(child => child.is_active).length || 0), 0)}`}
          subtitle="ظاهر"
          icon={Eye}
          bgColor="bg-cyan-100"
          iconColor="text-cyan-600"
        />
        <CircularStatsCard
          title="إجمالي المقالات"
          value={`${categories.reduce((sum, cat) => sum + (cat.article_count || 0) + (cat.children?.reduce((childSum, child) => childSum + (child.article_count || 0), 0) || 0), 0)}`}
          subtitle="مقال مصنف"
          icon={Hash}
          bgColor="bg-orange-100"
          iconColor="text-orange-600"
        />
        <CircularStatsCard
          title="الألوان المستخدمة"
          value={`${new Set([...categories.map(cat => cat.color_hex), ...categories.flatMap(cat => cat.children?.map(child => child.color_hex) || [])]).size}`}
          subtitle="لون مختلف"
          icon={Palette}
          bgColor="bg-pink-100"
          iconColor="text-pink-600"
        />
      </div>

      {/* أزرار التنقل */}
      <NavigationTabs />

      {/* شريط الأدوات */}
      <div className={`rounded-2xl p-4 shadow-sm border mb-8 transition-colors duration-300 ${
        darkMode 
          ? 'bg-gray-800 border-gray-700' 
          : 'bg-white border-gray-100'
      }`}>
        <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
          <div className="flex items-center space-x-4 w-full lg:w-auto">
            <div className="relative flex-1 lg:w-96">
              <Search className={`absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 transition-colors duration-300 ${
                darkMode ? 'text-gray-500' : 'text-gray-400'
              }`} />
              <input
                type="text"
                placeholder="البحث في التصنيفات..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full px-4 py-2 pr-10 text-sm rounded-lg border transition-colors duration-300 ${
                  darkMode 
                    ? 'bg-gray-700 border-gray-600 text-gray-200 placeholder-gray-400 focus:border-blue-500' 
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500'
                } focus:outline-none focus:ring-1 focus:ring-blue-500`}
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <select 
              value={selectedFilter}
              onChange={(e) => setSelectedFilter(e.target.value)}
              className={`px-4 py-2 text-sm rounded-lg border transition-colors duration-300 ${
                darkMode 
                  ? 'bg-gray-700 border-gray-600 text-gray-200 focus:border-blue-500' 
                  : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
              } focus:outline-none focus:ring-1 focus:ring-blue-500`}
            >
              <option value="all">جميع التصنيفات</option>
              <option value="active">النشطة فقط</option>
              <option value="inactive">المخفية فقط</option>
              <option value="main">الرئيسية فقط</option>
              <option value="sub">الفرعية فقط</option>
            </select>
            
            <button 
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              إضافة تصنيف
            </button>
          </div>
        </div>
      </div>

      {/* محتوى التبويبات */}
      <div className={`rounded-2xl shadow-sm border overflow-hidden transition-colors duration-300 ${
        darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'
      }`}>
        {activeTab === 'list' && (
          <div className="p-6">
            <h3 className={`text-lg font-bold mb-6 transition-colors duration-300 ${
              darkMode ? 'text-white' : 'text-gray-800'
            }`}>🗂️ قائمة التصنيفات</h3>
            <CategoryTree categories={categories} />
          </div>
        )}

        {activeTab === 'hierarchy' && (
          <div className="p-6">
            <h3 className={`text-lg font-bold mb-6 transition-colors duration-300 ${
              darkMode ? 'text-white' : 'text-gray-800'
            }`}>🌳 التسلسل الهرمي</h3>
            <p className={`text-center py-8 transition-colors duration-300 ${
              darkMode ? 'text-gray-400' : 'text-gray-500'
            }`}>
              عرض تفاعلي لشجرة التصنيفات مع إمكانية السحب والإفلات (قريباً)
            </p>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="p-6">
            <h3 className={`text-lg font-bold mb-6 transition-colors duration-300 ${
              darkMode ? 'text-white' : 'text-gray-800'
            }`}>📊 إحصائيات الاستخدام</h3>
            <p className={`text-center py-8 transition-colors duration-300 ${
              darkMode ? 'text-gray-400' : 'text-gray-500'
            }`}>
              تحليلات تفصيلية لاستخدام التصنيفات ومعدلات القراءة (قريباً)
            </p>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="p-6">
            <h3 className={`text-lg font-bold mb-6 transition-colors duration-300 ${
              darkMode ? 'text-white' : 'text-gray-800'
            }`}>⚙️ إعدادات التصنيفات</h3>
            <p className={`text-center py-8 transition-colors duration-300 ${
              darkMode ? 'text-gray-400' : 'text-gray-500'
            }`}>
              إعدادات عامة للتصنيفات ونظام العرض (قريباً)
            </p>
          </div>
        )}
      </div>

      {/* نوافذ الإضافة والتعديل */}
      {showAddModal && <CategoryModal />}
      {showEditModal && <CategoryModal isEdit />}
    </div>
  );
} 