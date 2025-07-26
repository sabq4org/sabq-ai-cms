/**
 * صفحة التصنيفات
 * Categories Page
 */

'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/admin/modern-dashboard/DashboardLayout';
import { 
  Folder,
  Plus,
  Search,
  Edit,
  Trash2,
  FileText,
  ArrowUp,
  ArrowDown,
  AlertTriangle
} from 'lucide-react';
import toast from 'react-hot-toast';

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
  articles_count: number;
  created_at: string;
  updated_at: string;
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);

  // جلب التصنيفات
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch('/api/categories?is_active=true');
        if (!response.ok) {
          throw new Error('فشل في تحميل التصنيفات');
        }
        const data = await response.json();
        setCategories(data.categories || data.data || []);
      } catch (err) {
        console.error('خطأ في جلب التصنيفات:', err);
        setError(err instanceof Error ? err.message : 'حدث خطأ في تحميل التصنيفات');
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  // نموذج إنشاء تصنيف جديد
  const CreateCategoryForm = () => {
    const [formData, setFormData] = useState({
      name: '',
      slug: '',
      description: '',
      color: '#3B82F6',
      icon: '📂',
      parent_id: '',
      is_active: true
    });
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setSubmitting(true);

      try {
        const response = await fetch('/api/categories', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        });

        const result = await response.json();

        if (result.success) {
          toast.success('تم إنشاء التصنيف بنجاح');
          setShowCreateForm(false);
          // تحديث القائمة
          setCategories(prev => [...prev, result.data]);
        } else {
          toast.error(result.error || 'حدث خطأ في إنشاء التصنيف');
        }
      } catch (error) {
        console.error('خطأ في إنشاء التصنيف:', error);
        toast.error('فشل في الاتصال بالخادم');
      } finally {
        setSubmitting(false);
      }
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                  <Plus className="w-6 h-6 text-white" />
                </div>
                إنشاء تصنيف جديد
              </h2>
              <button 
                onClick={() => setShowCreateForm(false)}
                className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors"
              >
                ✕
              </button>
            </div>
          </div>
          
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* اسم التصنيف */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                اسم التصنيف *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  name: e.target.value,
                  slug: e.target.value
                    .toLowerCase()
                    .replace(/\s+/g, '-')
                    .replace(/[^\w\-]+/g, '')
                }))}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                placeholder="اكتب اسم التصنيف هنا..."
              />
            </div>

            {/* الوصف */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                وصف التصنيف
              </label>
              <textarea
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                placeholder="اكتب وصفاً مختصراً للتصنيف..."
              />
            </div>

            {/* اللون والأيقونة */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  لون التصنيف
                </label>
                <input
                  type="color"
                  value={formData.color}
                  onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                  className="w-full h-12 px-2 py-1 border border-gray-200 rounded-xl"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  أيقونة التصنيف
                </label>
                <input
                  type="text"
                  value={formData.icon}
                  onChange={(e) => setFormData(prev => ({ ...prev, icon: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                  placeholder="📂"
                />
              </div>
            </div>

            {/* التصنيف الأب */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                التصنيف الأب
              </label>
              <select
                value={formData.parent_id}
                onChange={(e) => setFormData(prev => ({ ...prev, parent_id: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">بدون تصنيف أب</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            {/* خيارات إضافية */}
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <input 
                  type="checkbox" 
                  id="is_active" 
                  checked={formData.is_active}
                  onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
                  className="w-4 h-4 text-blue-600" 
                />
                <label htmlFor="is_active" className="text-sm text-gray-700">
                  تفعيل التصنيف
                </label>
              </div>
            </div>

            {/* أزرار الحفظ */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                className="flex-1 px-6 py-3 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
              >
                إلغاء
              </button>
              <button 
                type="submit"
                disabled={submitting}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all disabled:opacity-50"
              >
                {submitting ? 'جاري الحفظ...' : 'حفظ التصنيف'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  return (
    <DashboardLayout
      pageTitle="إدارة التصنيفات"
      pageDescription="إدارة تصنيفات المحتوى الإخباري"
    >
      <div className="space-y-6">
        {/* Header مع زر إنشاء تصنيف جديد */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              <Folder className="w-8 h-8 text-blue-600" />
              إدارة التصنيفات
              <span className="text-sm font-normal text-gray-500">({categories.length} تصنيف)</span>
            </h1>
            <p className="text-gray-600 mt-1">إدارة تصنيفات المحتوى الإخباري وتنظيمها</p>
          </div>
          
          <button
            onClick={() => setShowCreateForm(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-6 py-3 rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl"
          >
            <Plus className="w-5 h-5" />
            إنشاء تصنيف جديد
          </button>
        </div>

        {/* أدوات البحث */}
        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="البحث في التصنيفات..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pr-10 pl-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="relative">
              <div className="w-20 h-20 border-4 border-blue-200 rounded-full animate-pulse"></div>
              <div className="w-20 h-20 border-4 border-transparent border-t-blue-500 rounded-full animate-spin absolute top-0 left-0"></div>
            </div>
            <span className="mr-4 text-lg text-gray-600">
              جارٍ تحميل التصنيفات...
            </span>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-6 mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-500 rounded-xl flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-red-800">خطأ في تحميل البيانات</h3>
                <p className="text-red-600">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* قائمة التصنيفات */}
        {!loading && !error && (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">قائمة التصنيفات</h2>
            </div>
            
            <div className="divide-y divide-gray-100">
              {categories
                .filter(category => 
                  category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  category.description?.toLowerCase().includes(searchTerm.toLowerCase())
                )
                .map((category) => (
                  <div key={category.id} className="p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span 
                            className="w-6 h-6 flex items-center justify-center rounded-lg"
                            style={{ backgroundColor: category.color || '#3B82F6' }}
                          >
                            {category.icon || '📂'}
                          </span>
                          <span className="font-semibold text-gray-900">{category.name}</span>
                          {category.articles_count > 0 && (
                            <span className="px-2 py-0.5 bg-blue-100 text-blue-600 text-xs rounded-full">
                              {category.articles_count} مقال
                            </span>
                          )}
                        </div>
                        {category.description && (
                          <p className="text-sm text-gray-600 line-clamp-2">{category.description}</p>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                          <ArrowUp className="w-4 h-4 text-gray-600" />
                        </button>
                        <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                          <ArrowDown className="w-4 h-4 text-gray-600" />
                        </button>
                        <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                          <Edit className="w-4 h-4 text-gray-600" />
                        </button>
                        <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                          <Trash2 className="w-4 h-4 text-gray-600" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              
              {categories.filter(category => 
                category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                category.description?.toLowerCase().includes(searchTerm.toLowerCase())
              ).length === 0 && (
                <div className="text-center py-12">
                  <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p className="text-gray-600">
                    لا توجد تصنيفات {searchTerm && 'تطابق البحث'}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* نموذج إنشاء تصنيف جديد */}
        {showCreateForm && <CreateCategoryForm />}
      </div>
    </DashboardLayout>
  );
}
