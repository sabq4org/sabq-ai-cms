/**
 * نموذج تحرير التصنيف
 * Edit Category Modal
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Loader2, Save, Upload, X, Image as ImageIcon, Palette } from 'lucide-react';
import toast from 'react-hot-toast';
import FeaturedImageUpload from '@/components/FeaturedImageUpload';

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
  featured_image?: string;
  metadata?: any;
}

interface EditCategoryModalProps {
  category: Category | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function EditCategoryModal({ 
  category, 
  isOpen, 
  onClose, 
  onSuccess 
}: EditCategoryModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<Category>>({
    name: '',
    slug: '',
    description: '',
    color: '#3B82F6',
    icon: '📁',
    display_order: 0,
    is_active: true,
    featured_image: ''
  });

  // تحميل بيانات التصنيف عند فتح النموذج
  useEffect(() => {
    if (category && isOpen) {
      setFormData({
        name: category.name || '',
        slug: category.slug || '',
        description: category.description || '',
        color: category.color || '#3B82F6',
        icon: category.icon || '📁',
        display_order: category.display_order || 0,
        is_active: category.is_active !== false,
        featured_image: category.featured_image || category.metadata?.cover_image || ''
      });
    }
  }, [category, isOpen]);

  // توليد slug تلقائياً من الاسم
  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^\w\-ا-ي]+/g, '')
      .replace(/\-\-+/g, '-')
      .replace(/^-+/, '')
      .replace(/-+$/, '');
  };

  // معالج تغيير الاسم
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    setFormData(prev => ({
      ...prev,
      name,
      slug: generateSlug(name)
    }));
  };

  // معالج حفظ التصنيف
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.slug) {
      toast.error('الاسم والرابط مطلوبان');
      return;
    }

    setLoading(true);
    
    try {
      const response = await fetch(`/api/categories/${category?.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          metadata: {
            ...(category?.metadata || {}),
            cover_image: formData.featured_image
          }
        })
      });

      // التحقق من نوع المحتوى قبل تحليل JSON
      const contentType = response.headers.get('content-type');
      
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('❌ استجابة غير JSON:', text);
        throw new Error('الخادم أرجع استجابة غير صالحة');
      }

      const data = await response.json();

      if (response.ok && data.success) {
        toast.success('✅ تم تحديث التصنيف بنجاح');
        onSuccess();
        onClose();
      } else {
        throw new Error(data.error || 'فشل في تحديث التصنيف');
      }
    } catch (error) {
      console.error('Error updating category:', error);
      toast.error(error instanceof Error ? error.message : 'حدث خطأ في تحديث التصنيف');
    } finally {
      setLoading(false);
    }
  };

  // قائمة الأيقونات المقترحة
  const suggestedIcons = ['📁', '📂', '📰', '💼', '🏆', '⚽', '🌍', '💻', '🚗', '🎬', '🏥', '🎨'];
  
  // قائمة الألوان المقترحة
  const suggestedColors = [
    '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', 
    '#EC4899', '#14B8A6', '#F97316', '#6366F1', '#84CC16'
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={`max-w-2xl ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
        <DialogHeader>
          <DialogTitle className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            ✏️ تحرير التصنيف
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-6">
          {/* الحقول الأساسية */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* اسم التصنيف */}
            <div>
              <Label htmlFor="name" className={darkMode ? 'text-gray-200' : 'text-gray-700'}>
                اسم التصنيف *
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={handleNameChange}
                placeholder="مثال: رياضة"
                required
                className={`mt-1 ${darkMode ? 'bg-gray-700 text-white' : ''}`}
              />
            </div>

            {/* الرابط */}
            <div>
              <Label htmlFor="slug" className={darkMode ? 'text-gray-200' : 'text-gray-700'}>
                الرابط (Slug) *
              </Label>
              <Input
                id="slug"
                value={formData.slug}
                onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                placeholder="sports"
                required
                dir="ltr"
                className={`mt-1 ${darkMode ? 'bg-gray-700 text-white' : ''}`}
              />
            </div>
          </div>

          {/* الوصف */}
          <div>
            <Label htmlFor="description" className={darkMode ? 'text-gray-200' : 'text-gray-700'}>
              الوصف
            </Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="وصف مختصر للتصنيف..."
              rows={3}
              className={`mt-1 ${darkMode ? 'bg-gray-700 text-white' : ''}`}
            />
          </div>

          {/* الأيقونة واللون */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* الأيقونة */}
            <div>
              <Label className={darkMode ? 'text-gray-200' : 'text-gray-700'}>
                الأيقونة
              </Label>
              <div className="mt-2 space-y-2">
                <Input
                  value={formData.icon}
                  onChange={(e) => setFormData(prev => ({ ...prev, icon: e.target.value }))}
                  placeholder="📁"
                  className={`text-center text-2xl ${darkMode ? 'bg-gray-700 text-white' : ''}`}
                />
                <div className="flex flex-wrap gap-2 mt-2">
                  {suggestedIcons.map(icon => (
                    <button
                      key={icon}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, icon }))}
                      className={`w-10 h-10 rounded-lg border ${
                        formData.icon === icon 
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                          : 'border-gray-300 dark:border-gray-600'
                      } hover:border-blue-400 transition-colors text-xl`}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* اللون */}
            <div>
              <Label className={darkMode ? 'text-gray-200' : 'text-gray-700'}>
                اللون
              </Label>
              <div className="mt-2 space-y-2">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-10 h-10 rounded-lg border-2 border-gray-300 dark:border-gray-600"
                    style={{ backgroundColor: formData.color }}
                  />
                  <Input
                    type="color"
                    value={formData.color}
                    onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                    className={`flex-1 h-10 ${darkMode ? 'bg-gray-700' : ''}`}
                  />
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {suggestedColors.map(color => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, color }))}
                      className={`w-8 h-8 rounded-lg border-2 ${
                        formData.color === color 
                          ? 'border-gray-800 dark:border-white scale-110' 
                          : 'border-gray-300 dark:border-gray-600'
                      } hover:scale-105 transition-all`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ترتيب العرض */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="display_order" className={darkMode ? 'text-gray-200' : 'text-gray-700'}>
                ترتيب العرض
              </Label>
              <Input
                id="display_order"
                type="number"
                value={formData.display_order}
                onChange={(e) => setFormData(prev => ({ ...prev, display_order: parseInt(e.target.value) || 0 }))}
                min="0"
                className={`mt-1 ${darkMode ? 'bg-gray-700 text-white' : ''}`}
              />
            </div>

            {/* حالة التفعيل */}
            <div className="flex items-center gap-3 mt-6">
              <input
                type="checkbox"
                id="is_active"
                checked={formData.is_active}
                onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
                className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <Label htmlFor="is_active" className={`cursor-pointer ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                تصنيف نشط
              </Label>
            </div>
          </div>

          {/* صورة الغلاف */}
          <div>
            <Label className={`mb-2 block ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
              <ImageIcon className="w-4 h-4 inline-block ml-1" />
              صورة الغلاف
            </Label>
            <FeaturedImageUpload
              value={formData.featured_image || ''}
              onChange={(url) => setFormData(prev => ({ ...prev, featured_image: url }))}
              darkMode={darkMode}
            />
            <p className={`text-sm mt-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              صورة تظهر في صفحة التصنيف وبطاقات العرض
            </p>
          </div>

          {/* أزرار الإجراءات */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
              className={darkMode ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : ''}
            >
              <X className="w-4 h-4 ml-2" />
              إلغاء
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                  جاري الحفظ...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 ml-2" />
                  حفظ التغييرات
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
} 