'use client';

import React, { useState, useEffect } from 'react';
import { X, Save, Globe, Tag, Hash, Upload } from 'lucide-react';

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
  og_image_url?: string;
  canonical_url?: string;
  noindex?: boolean;
  og_type?: string;
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
  og_image_url: string;
  canonical_url: string;
  noindex: boolean;
  og_type: string;
}

interface CategoryFormModalProps {
  isOpen: boolean;
  isEdit?: boolean;
  category?: Category | null;
  categories: Category[];
  darkMode: boolean;
  onClose: () => void;
  onSave: (data: CategoryFormData) => Promise<void>;
  loading: boolean;
}

export default function CategoryFormModal({
  isOpen,
  isEdit = false,
  category,
  categories,
  darkMode,
  onClose,
  onSave,
  loading
}: CategoryFormModalProps) {
  const [formData, setFormData] = useState<CategoryFormData>({
    name_ar: '',
    name_en: '',
    description: '',
    slug: '',
    color_hex: '#E5F1FA',
    icon: '📰',
    parent_id: undefined,
    position: 0,
    is_active: true,
    meta_title: '',
    meta_description: '',
    og_image_url: '',
    canonical_url: '',
    noindex: false,
    og_type: 'website'
  });

  const [activeTab, setActiveTab] = useState<'basic' | 'seo' | 'advanced'>('basic');
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  // ألوان التصنيفات المتاحة
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

  // الأيقونات المتاحة
  const categoryIcons = [
    '📰', '🏛️', '💼', '⚽', '🎭', '💡', '🌍', '📱', 
    '🏥', '🚗', '✈️', '🏠', '🎓', '💰', '⚖️', '🔬',
    '🎨', '🎵', '📺', '🍽️', '👗', '💊', '🌱', '🔥',
    '💎', '⭐', '🎯', '🚀', '🏆', '📊', '🎪', '🌈'
  ];

  // تحميل بيانات التصنيف عند التحرير
  useEffect(() => {
    if (isEdit && category) {
      setFormData({
        name_ar: category.name_ar || '',
        name_en: category.name_en || '',
        description: category.description || '',
        slug: category.slug || '',
        color_hex: category.color_hex || '#E5F1FA',
        icon: category.icon || '📰',
        parent_id: category.parent_id,
        position: category.position || 0,
        is_active: category.is_active ?? true,
        meta_title: category.meta_title || '',
        meta_description: category.meta_description || '',
        og_image_url: category.og_image_url || '',
        canonical_url: category.canonical_url || '',
        noindex: category.noindex ?? false,
        og_type: category.og_type || 'website'
      });
    } else {
      // إعادة تعيين النموذج للإضافة
      setFormData({
        name_ar: '',
        name_en: '',
        description: '',
        slug: '',
        color_hex: '#E5F1FA',
        icon: '📰',
        parent_id: undefined,
        position: 0,
        is_active: true,
        meta_title: '',
        meta_description: '',
        og_image_url: '',
        canonical_url: '',
        noindex: false,
        og_type: 'website'
      });
    }
    setErrors({});
  }, [isEdit, category, isOpen]);

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
    
    if (errors.name_ar) {
      setErrors(prev => ({ ...prev, name_ar: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: {[key: string]: string} = {};

    if (!formData.name_ar.trim()) {
      newErrors.name_ar = 'اسم التصنيف بالعربية مطلوب';
    }

    if (!formData.slug.trim()) {
      newErrors.slug = 'رابط التصنيف مطلوب';
    }

    if (formData.meta_title && formData.meta_title.length > 60) {
      newErrors.meta_title = 'عنوان SEO يجب أن يكون أقل من 60 حرف';
    }

    if (formData.meta_description && formData.meta_description.length > 160) {
      newErrors.meta_description = 'وصف SEO يجب أن يكون أقل من 160 حرف';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      await onSave(formData);
    } catch (error) {
      console.error('خطأ في حفظ التصنيف:', error);
    }
  };

  if (!isOpen) return null;

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
            onClick={onClose}
            className={`p-2 rounded-lg transition-colors ${
              darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
            }`}
            disabled={loading}
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
          {/* التبويب الأساسي */}
          {activeTab === 'basic' && (
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
                    errors.name_ar
                      ? 'border-red-500 focus:border-red-500'
                      : darkMode 
                        ? 'bg-gray-700 border-gray-600 text-gray-200 focus:border-blue-500' 
                        : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
                  } focus:outline-none focus:ring-1 focus:ring-blue-500`}
                  placeholder="مثال: السياسة"
                  required
                />
                {errors.name_ar && (
                  <p className="text-red-500 text-xs mt-1">{errors.name_ar}</p>
                )}
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
                    errors.slug
                      ? 'border-red-500 focus:border-red-500'
                      : darkMode 
                        ? 'bg-gray-700 border-gray-600 text-gray-200 focus:border-blue-500' 
                        : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
                  } focus:outline-none focus:ring-1 focus:ring-blue-500`}
                  placeholder="politics"
                />
                {errors.slug && (
                  <p className="text-red-500 text-xs mt-1">{errors.slug}</p>
                )}
              </div>

              {/* اللون */}
              <div>
                <label className={`block text-sm font-medium mb-2 transition-colors duration-300 ${
                  darkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  لون التصنيف
                </label>
                <div className="grid grid-cols-6 gap-3">
                  {categoryColors.map((color) => (
                    <button
                      key={color.value}
                      type="button"
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
                <div className="grid grid-cols-8 gap-2">
                  {categoryIcons.map((icon) => (
                    <button
                      key={icon}
                      type="button"
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
            </div>
          )}

          {/* تبويب SEO */}
          {activeTab === 'seo' && (
            <div className="space-y-6">
              {/* عنوان الصفحة */}
              <div>
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
                    errors.meta_title
                      ? 'border-red-500 focus:border-red-500'
                      : darkMode 
                        ? 'bg-gray-700 border-gray-600 text-gray-200 focus:border-blue-500' 
                        : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
                  } focus:outline-none focus:ring-1 focus:ring-blue-500`}
                  placeholder="مثال: أخبار السياسة - صحيفة سبق"
                  maxLength={60}
                />
                <div className="flex justify-between text-xs mt-1">
                  <span className={`${formData.meta_title.length > 60 ? 'text-red-500' : 'text-gray-500'}`}>
                    {formData.meta_title.length}/60 حرف
                  </span>
                  <span className="text-gray-500">(الأمثل: 50-60 حرف)</span>
                </div>
                {errors.meta_title && (
                  <p className="text-red-500 text-xs mt-1">{errors.meta_title}</p>
                )}
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
                    errors.meta_description
                      ? 'border-red-500 focus:border-red-500'
                      : darkMode 
                        ? 'bg-gray-700 border-gray-600 text-gray-200 focus:border-blue-500' 
                        : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
                  } focus:outline-none focus:ring-1 focus:ring-blue-500`}
                  placeholder="وصف مختصر وجذاب لتصنيف الأخبار يظهر في نتائج البحث"
                  maxLength={160}
                />
                <div className="flex justify-between text-xs mt-1">
                  <span className={`${formData.meta_description.length > 160 ? 'text-red-500' : 'text-gray-500'}`}>
                    {formData.meta_description.length}/160 حرف
                  </span>
                  <span className="text-gray-500">(الأمثل: 150-160 حرف)</span>
                </div>
                {errors.meta_description && (
                  <p className="text-red-500 text-xs mt-1">{errors.meta_description}</p>
                )}
              </div>

              {/* صورة المشاركة */}
              <div>
                <label className={`block text-sm font-medium mb-2 transition-colors duration-300 ${
                  darkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  صورة المشاركة (OG Image)
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={formData.og_image_url}
                    onChange={(e) => setFormData({...formData, og_image_url: e.target.value})}
                    className={`flex-1 px-4 py-2 rounded-xl border transition-colors duration-300 ${
                      darkMode 
                        ? 'bg-gray-700 border-gray-600 text-gray-200 focus:border-blue-500' 
                        : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
                    } focus:outline-none focus:ring-1 focus:ring-blue-500`}
                    placeholder="https://sabq.org/images/category-politics.jpg"
                  />
                  <button
                    type="button"
                    className={`px-4 py-2 rounded-xl border transition-colors ${
                      darkMode 
                        ? 'border-gray-600 text-gray-300 hover:bg-gray-700' 
                        : 'border-gray-300 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <Upload className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  صورة تظهر عند مشاركة صفحة التصنيف في الشبكات الاجتماعية (1200x630 بكسل)
                </p>
              </div>

              {/* الرابط المرجعي */}
              <div>
                <label className={`block text-sm font-medium mb-2 transition-colors duration-300 ${
                  darkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  الرابط المرجعي (Canonical URL)
                </label>
                <input
                  type="url"
                  value={formData.canonical_url}
                  onChange={(e) => setFormData({...formData, canonical_url: e.target.value})}
                  className={`w-full px-4 py-2 rounded-xl border transition-colors duration-300 ${
                    darkMode 
                      ? 'bg-gray-700 border-gray-600 text-gray-200 focus:border-blue-500' 
                      : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
                  } focus:outline-none focus:ring-1 focus:ring-blue-500`}
                  placeholder="https://sabq.org/category/politics"
                />
                <p className="text-xs text-gray-500 mt-1">
                  يتم توليده تلقائياً إذا تُرك فارغاً
                </p>
              </div>

              {/* نوع المحتوى */}
              <div>
                <label className={`block text-sm font-medium mb-2 transition-colors duration-300 ${
                  darkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  نوع المحتوى (OG Type)
                </label>
                <select
                  value={formData.og_type}
                  onChange={(e) => setFormData({...formData, og_type: e.target.value})}
                  className={`w-full px-4 py-2 rounded-xl border transition-colors duration-300 ${
                    darkMode 
                      ? 'bg-gray-700 border-gray-600 text-gray-200 focus:border-blue-500' 
                      : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
                  } focus:outline-none focus:ring-1 focus:ring-blue-500`}
                >
                  <option value="website">موقع ويب</option>
                  <option value="article">مقال</option>
                  <option value="section">قسم</option>
                </select>
              </div>

              {/* منع الأرشفة */}
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="noindex"
                  checked={formData.noindex}
                  onChange={(e) => setFormData({...formData, noindex: e.target.checked})}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <label htmlFor="noindex" className={`text-sm font-medium transition-colors duration-300 ${
                  darkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  منع محركات البحث من فهرسة هذا التصنيف (NoIndex)
                </label>
              </div>

              {/* معاينة نتيجة البحث */}
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-600 mb-2">معاينة في نتائج البحث:</p>
                <div className="bg-white p-3 rounded border">
                  <h5 className="text-blue-600 text-lg font-medium mb-1 truncate">
                    {formData.meta_title || formData.name_ar || 'عنوان التصنيف'}
                  </h5>
                  <p className="text-green-700 text-sm mb-1">
                    {formData.canonical_url || `https://sabq.org/news/${formData.slug || 'category-slug'}`}
                  </p>
                  <p className="text-gray-600 text-sm line-clamp-2">
                    {formData.meta_description || formData.description || 'وصف التصنيف سيظهر هنا...'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* التبويب المتقدم */}
          {activeTab === 'advanced' && (
            <div className="space-y-6">
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

              {/* الترتيب */}
              <div>
                <label className={`block text-sm font-medium mb-2 transition-colors duration-300 ${
                  darkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  ترتيب العرض
                </label>
                <input
                  type="number"
                  value={formData.position}
                  onChange={(e) => setFormData({...formData, position: parseInt(e.target.value) || 0})}
                  className={`w-full px-4 py-2 rounded-xl border transition-colors duration-300 ${
                    darkMode 
                      ? 'bg-gray-700 border-gray-600 text-gray-200 focus:border-blue-500' 
                      : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
                  } focus:outline-none focus:ring-1 focus:ring-blue-500`}
                  placeholder="0"
                  min="0"
                />
                <p className="text-xs text-gray-500 mt-1">
                  الأرقام الأصغر تظهر أولاً (0 = الأول)
                </p>
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

              {/* معاينة التصنيف */}
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-600 mb-2">معاينة التصنيف:</p>
                <div className="bg-white p-3 rounded border">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-10 h-10 rounded-lg flex items-center justify-center text-lg"
                      style={{ 
                        backgroundColor: formData.color_hex,
                        color: categoryColors.find(c => c.value === formData.color_hex)?.textColor || '#000'
                      }}
                    >
                      {formData.icon}
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">{formData.name_ar || 'اسم التصنيف'}</h4>
                      {formData.name_en && (
                        <p className="text-sm text-gray-500">({formData.name_en})</p>
                      )}
                      <p className="text-xs text-gray-400">/{formData.slug || 'slug'}</p>
                    </div>
                  </div>
                  {formData.description && (
                    <p className="text-sm text-gray-600 mt-2">{formData.description}</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* أزرار الحفظ والإلغاء */}
        <div className="flex gap-3 mt-8 pt-6 border-t">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className={`flex-1 px-6 py-3 rounded-xl border transition-colors duration-300 ${
              darkMode 
                ? 'border-gray-600 text-gray-300 hover:bg-gray-700' 
                : 'border-gray-300 text-gray-600 hover:bg-gray-50'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            إلغاء
          </button>
          <button 
            type="button"
            onClick={handleSave}
            disabled={loading || !formData.name_ar.trim() || !formData.slug.trim()}
            className={`flex-1 px-6 py-3 rounded-xl transition-colors flex items-center justify-center gap-2 ${
              loading || !formData.name_ar.trim() || !formData.slug.trim()
                ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                : 'bg-blue-500 text-white hover:bg-blue-600'
            }`}
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                جاري الحفظ...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                {isEdit ? 'حفظ التعديلات' : 'إضافة التصنيف'}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
} 