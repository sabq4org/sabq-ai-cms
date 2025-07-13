'use client';

import Image from 'next/image';
import React, { useState, useEffect, useRef } from 'react';
import { X, Eye, Save, Globe, Tag, Hash, Upload, Loader2, Camera, Trash2, Image as ImageIcon, CheckCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Category, CategoryFormData } from '@/types/category';

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
  console.log('CategoryFormModal rendered with:', { isOpen, isEdit, category });
  
  const [showPreview, setShowPreview] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
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
    og_type: 'website',
    cover_image: '' // إضافة حقل الصورة
  });

  const [activeTab, setActiveTab] = useState<'basic' | 'image' | 'seo' | 'advanced'>('basic');
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [isDirty, setIsDirty] = useState(false); // تتبع التغييرات
  const [originalData, setOriginalData] = useState<CategoryFormData | null>(null); // البيانات الأصلية

  // ألوان التصنيفات المتاحة - مجموعة هادئة ومريحة للعين
  const categoryColors = [
    { name: 'أزرق سماوي', value: '#E0F2FE', textColor: '#0C4A6E' },
    { name: 'أخضر باهت', value: '#ECFDF5', textColor: '#064E3B' },
    { name: 'أصفر رملي', value: '#FEF9C3', textColor: '#92400E' },
    { name: 'برتقالي فانيليا', value: '#FFF7ED', textColor: '#9A3412' },
    { name: 'رمادي فاتح', value: '#F3F4F6', textColor: '#374151' },
    { name: 'وردي خفيف', value: '#FDF2F8', textColor: '#831843' },
    { name: 'بنفسجي فاتح', value: '#FAF5FF', textColor: '#581C87' },
    { name: 'تركوازي ناعم', value: '#F0FDFA', textColor: '#134E4A' },
    { name: 'أزرق فاتح', value: '#EFF6FF', textColor: '#1E40AF' },
    { name: 'أخضر زمردي', value: '#F0FDF4', textColor: '#14532D' },
    { name: 'أصفر ذهبي', value: '#FFFBEB', textColor: '#92400E' },
    { name: 'رمادي دافئ', value: '#F9FAFB', textColor: '#374151' }
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
      console.log('Loading category data for edit:', category);
      console.log('Category cover_image:', category.cover_image);
      
      const categoryData = {
        name_ar: category.name_ar || '',
        name_en: category.name_en || '',
        description: category.description || '',
        slug: category.slug || '',
        color_hex: category.color_hex || '#E5F1FA',
        icon: category.icon || '📰',
        parent_id: category.parent_id?.toString(),
        position: category.position || 0,
        is_active: category.is_active ?? true,
        meta_title: category.meta_title || '',
        meta_description: category.meta_description || '',
        og_image_url: category.og_image_url || '',
        canonical_url: category.canonical_url || '',
        noindex: category.noindex ?? false,
        og_type: category.og_type || 'website',
        cover_image: category.cover_image || ''
      };
      
      setFormData(categoryData);
      setOriginalData(categoryData); // حفظ البيانات الأصلية
      setImagePreview(category.cover_image || null);
      console.log('Image preview set to:', category.cover_image || null);
      setIsDirty(false); // إعادة تعيين حالة التغيير عند التحرير
    } else {
      // إعادة تعيين النموذج للإضافة
      const emptyData = {
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
        og_type: 'website',
        cover_image: ''
      };
      
      setFormData(emptyData);
      setOriginalData(null); // لا توجد بيانات أصلية للإضافة
      setImagePreview(null);
    }
    setErrors({});
  }, [isEdit, category, isOpen]);

  // مراقبة التغييرات في formData ومقارنتها بالبيانات الأصلية
  useEffect(() => {
    if (originalData && isEdit) {
      const hasChanges = JSON.stringify(formData) !== JSON.stringify(originalData);
      
      // تفاصيل أكثر للتتبع
      const changes = {
        name_ar: formData.name_ar !== originalData.name_ar,
        name_en: formData.name_en !== originalData.name_en,
        description: formData.description !== originalData.description,
        slug: formData.slug !== originalData.slug,
        color_hex: formData.color_hex !== originalData.color_hex,
        icon: formData.icon !== originalData.icon,
        parent_id: formData.parent_id !== originalData.parent_id,
        position: formData.position !== originalData.position,
        is_active: formData.is_active !== originalData.is_active,
        meta_title: formData.meta_title !== originalData.meta_title,
        meta_description: formData.meta_description !== originalData.meta_description,
        og_image_url: formData.og_image_url !== originalData.og_image_url,
        canonical_url: formData.canonical_url !== originalData.canonical_url,
        noindex: formData.noindex !== originalData.noindex,
        og_type: formData.og_type !== originalData.og_type,
        cover_image: formData.cover_image !== originalData.cover_image
      };
      
      console.log('🔄 Checking for changes:', {
        hasChanges,
        changes,
        cover_image_changed: changes.cover_image,
        current_cover_image: formData.cover_image,
        original_cover_image: originalData.cover_image,
        isDirty: hasChanges
      });
      
      setIsDirty(hasChanges);
    }
  }, [formData, originalData, isEdit]);

  // دالة رفع الصورة
  const handleImageUpload = async (file: File) => {
    if (!file) return;

    // التحقق من نوع الملف
    if (!file.type.startsWith('image/')) {
      setErrors(prev => ({ ...prev, cover_image: 'يرجى اختيار ملف صورة صحيح' }));
      toast.error('❌ يرجى اختيار ملف صورة صحيح');
      return;
    }

    // التحقق من حجم الملف (أقل من 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setErrors(prev => ({ ...prev, cover_image: 'حجم الصورة يجب أن يكون أقل من 5MB' }));
      toast.error('❌ حجم الصورة يجب أن يكون أقل من 5MB');
      return;
    }

    try {
      setUploadingImage(true);
      setErrors(prev => ({ ...prev, cover_image: '' }));
      
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', 'simple_upload'); // استخدام preset بسيط
      
      // رفع مباشر إلى Cloudinary
      const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'dybhezmvb';
      const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;
      
      console.log('محاولة رفع الصورة إلى:', uploadUrl);
      
      const response = await fetch(uploadUrl, {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Cloudinary response:', data);
        console.log('📷 Secure URL:', data.secure_url);
        
        // تحديث formData أولاً
        setFormData(prev => {
          const updated = { ...prev, cover_image: data.secure_url };
          console.log('💾 Updated formData with cover_image:', updated);
          console.log('🔄 Previous cover_image:', prev.cover_image);
          console.log('🔄 New cover_image:', data.secure_url);
          return updated;
        });
        
        // ثم تحديث imagePreview
        setImagePreview(data.secure_url);
        
        // إضافة تأخير صغير لضمان تحديث isDirty
        setTimeout(() => {
          console.log('🔄 Checking isDirty after image upload...');
        }, 100);
        
        toast.success(
          <div className="flex items-center gap-2">
            <span className="text-2xl">✅</span>
            <div>
              <div className="font-bold">تم رفع الصورة بنجاح!</div>
              <div className="text-sm opacity-90">لا تنسَ الضغط على "حفظ" لحفظ التغييرات</div>
            </div>
          </div>,
          {
            duration: 5000,
            style: {
              background: '#10B981',
              color: 'white',
              padding: '16px',
            }
          }
        );
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('خطأ من Cloudinary:', errorData);
        throw new Error(errorData.error?.message || `فشل رفع الصورة: ${response.status}`);
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      const errorMessage = error instanceof Error ? error.message : 'حدث خطأ أثناء رفع الصورة';
      setErrors(prev => ({ ...prev, cover_image: errorMessage }));
      
      // رسالة خطأ مفصلة
      toast.error(
        <div className="flex items-start gap-2">
          <span className="text-xl">❌</span>
          <div>
            <div className="font-bold">خطأ في رفع الصورة</div>
            <div className="text-sm opacity-90 mt-1">{errorMessage}</div>
            {!process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME && (
              <div className="text-xs opacity-80 mt-2">
                تنبيه: متغيرات البيئة قد تكون غير مُعرّفة
              </div>
            )}
          </div>
        </div>,
        {
          duration: 7000,
          style: {
            background: '#ff6b6b',
            color: 'white',
            padding: '16px',
          }
        }
      );
    } finally {
      setUploadingImage(false);
    }
  };

  // دالة عامة لمعالجة تغييرات النموذج
  const handleFieldChange = (field: string, value: any) => {
    console.log('📝 Field changed:', { field, value, currentFormData: formData });
    setFormData(prev => ({ ...prev, [field]: value }));
    // setIsDirty سيتم تحديثه تلقائياً بواسطة useEffect
  };

  // دالة حذف الصورة
  const handleRemoveImage = () => {
    console.log('🗑️ Removing image...');
    console.log('🔄 Previous cover_image:', formData.cover_image);
    
    setFormData(prev => {
      const updated = { ...prev, cover_image: '' };
      console.log('💾 Updated formData after removing image:', updated);
      return updated;
    });
    
    setImagePreview(null);
    
    // إضافة تأخير صغير لضمان تحديث isDirty
    setTimeout(() => {
      console.log('🔄 Checking isDirty after removing image...');
    }, 100);
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // دالة معالجة تغيير الملف
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleImageUpload(file);
    }
  };

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
    
    // setIsDirty سيتم تحديثه تلقائياً بواسطة useEffect
    
    if (errors.name_ar) {
      setErrors(prev => ({ ...prev, name_ar: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: {[key: string]: string} = {};

    // التحقق من الاسم العربي
    if (!formData.name_ar || typeof formData.name_ar !== 'string' || formData.name_ar.trim().length === 0) {
      newErrors.name_ar = 'اسم التصنيف بالعربية مطلوب';
    }

    // التحقق من الـ slug
    if (!formData.slug || typeof formData.slug !== 'string' || formData.slug.trim().length === 0) {
      newErrors.slug = 'رابط التصنيف مطلوب';
    } else {
      // التحقق من صحة الـ slug (يجب أن يحتوي على أحرف صحيحة فقط)
      const slugRegex = /^[\u0600-\u06FFa-z0-9-]+$/i;
      if (!slugRegex.test(formData.slug)) {
        newErrors.slug = 'رابط التصنيف يجب أن يحتوي على أحرف عربية أو إنجليزية وأرقام وشرطات فقط';
      }
    }

    // التحقق من عنوان SEO
    if (formData.meta_title && typeof formData.meta_title === 'string' && formData.meta_title.length > 60) {
      newErrors.meta_title = 'عنوان SEO يجب أن يكون أقل من 60 حرف';
    }

    // التحقق من وصف SEO
    if (formData.meta_description && typeof formData.meta_description === 'string' && formData.meta_description.length > 160) {
      newErrors.meta_description = 'وصف SEO يجب أن يكون أقل من 160 حرف';
    }

    // التحقق من صحة اللون
    if (formData.color_hex && typeof formData.color_hex === 'string') {
      const colorRegex = /^#[0-9A-Fa-f]{6}$/;
      if (!colorRegex.test(formData.color_hex)) {
        newErrors.color_hex = 'لون غير صحيح';
      }
    }

    // التحقق من صحة الأيقونة
    if (formData.icon && typeof formData.icon !== 'string') {
      newErrors.icon = 'أيقونة غير صحيحة';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    // التحقق من وجود تغييرات عند التحرير
    if (isEdit && !isDirty) {
      toast.error('لم يتم إجراء أي تغييرات', {
        style: {
          background: '#FFA500',
          color: 'white',
        }
      });
      return;
    }

    try {
      console.log('🚀 Saving category with data:', formData);
      console.log('🖼️ Cover image value:', formData.cover_image);
      await onSave(formData);
      setIsDirty(false); // إعادة تعيين حالة التغيير بعد الحفظ الناجح
      setOriginalData(formData); // تحديث البيانات الأصلية بالبيانات الجديدة
    } catch (error) {
      console.error('خطأ في حفظ التصنيف:', error);
    }
  };

  if (!isOpen) return null;
  
  console.log('Modal is open and will render');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className={`relative w-full max-w-5xl max-h-[90vh] overflow-y-auto rounded-xl shadow-xl ${
        darkMode ? 'bg-gray-800' : 'bg-white'
      }`}>
        {/* Header */}
        <div className={`sticky top-0 z-10 flex items-center justify-between p-6 border-b ${
          darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        }`}>
          <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            {isEdit ? 'تعديل التصنيف' : 'إضافة تصنيف جديد'}
          </h2>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setShowPreview(!showPreview)}
              className={darkMode ? 'text-gray-400 hover:text-white' : ''}
            >
              <Eye className="w-4 h-4 ml-2" />
              {showPreview ? 'إخفاء المعاينة' : 'معاينة'}
            </Button>
            <button
              onClick={onClose}
              className={`p-2 rounded-lg transition-colors ${
                darkMode 
                  ? 'hover:bg-gray-700 text-gray-400' 
                  : 'hover:bg-gray-100 text-gray-600'
              }`}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <form onSubmit={(e) => {
          e.preventDefault();
          handleSave();
        }} className="p-6">
          {/* Tabs */}
          <div className="flex space-x-1 mb-6 border-b">
            {[
              { id: 'basic', name: 'المعلومات الأساسية', icon: Tag },
              { id: 'image', name: 'الصورة', icon: Camera },
              { id: 'seo', name: 'SEO', icon: Globe },
              { id: 'advanced', name: 'متقدم', icon: Hash }
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-t-lg transition-colors ${
                  activeTab === tab.id
                    ? darkMode
                      ? 'bg-gray-700 text-white border-b-2 border-blue-500'
                      : 'bg-blue-50 text-blue-600 border-b-2 border-blue-500'
                    : darkMode
                      ? 'text-gray-400 hover:text-white'
                      : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.name}
              </button>
            ))}
          </div>

          {/* Basic Tab */}
          {activeTab === 'basic' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Form Fields */}
              <div className="space-y-4">
                {/* الاسم بالعربية */}
                <div>
                  <Label htmlFor="name_ar" className={darkMode ? 'text-gray-200' : ''}>
                    الاسم بالعربية <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="name_ar"
                    value={formData.name_ar}
                    onChange={(e) => {
                      handleNameChange(e.target.value);
                    }}
                    placeholder="مثال: أخبار"
                    required
                    className={darkMode ? 'bg-gray-700 border-gray-600 text-white' : ''}
                  />
                  {errors.name_ar && (
                    <p className="text-red-500 text-sm mt-1">{errors.name_ar}</p>
                  )}
                </div>

                {/* الاسم بالإنجليزية */}
                <div>
                  <Label htmlFor="name_en" className={darkMode ? 'text-gray-200' : ''}>
                    الاسم بالإنجليزية
                  </Label>
                  <Input
                    id="name_en"
                    value={formData.name_en}
                    onChange={(e) => handleFieldChange('name_en', e.target.value)}
                    placeholder="مثال: News"
                    className={darkMode ? 'bg-gray-700 border-gray-600 text-white' : ''}
                  />
                </div>

                {/* الوصف */}
                <div>
                  <Label htmlFor="description" className={darkMode ? 'text-gray-200' : ''}>
                    الوصف
                  </Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleFieldChange('description', e.target.value)}
                    placeholder="وصف مختصر للتصنيف..."
                    rows={3}
                    className={darkMode ? 'bg-gray-700 border-gray-600 text-white' : ''}
                  />
                </div>

                {/* الرابط */}
                <div>
                  <Label htmlFor="slug" className={darkMode ? 'text-gray-200' : ''}>
                    الرابط <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="slug"
                    value={formData.slug}
                    onChange={(e) => handleFieldChange('slug', e.target.value)}
                    placeholder="مثال: news"
                    required
                    className={darkMode ? 'bg-gray-700 border-gray-600 text-white' : ''}
                  />
                  {errors.slug && (
                    <p className="text-red-500 text-sm mt-1">{errors.slug}</p>
                  )}
                </div>
              </div>

              {/* Color and Icon Selection */}
              <div className="space-y-4">
                {/* اللون */}
                <div>
                  <Label className={darkMode ? 'text-gray-200' : ''}>لون التصنيف</Label>
                  
                  {/* معاينة اللون الحالي */}
                  <div className="flex items-center gap-3 mb-3 p-3 rounded-lg border" style={{ backgroundColor: formData.color_hex }}>
                    <div className="w-8 h-8 rounded-full border-2 border-white shadow-sm" style={{ backgroundColor: formData.color_hex }}></div>
                    <div>
                      <p className="text-sm font-medium" style={{ color: categoryColors.find(c => c.value === formData.color_hex)?.textColor || '#000' }}>
                        اللون الحالي: {categoryColors.find(c => c.value === formData.color_hex)?.name || 'مخصص'}
                      </p>
                      <p className="text-xs opacity-75" style={{ color: categoryColors.find(c => c.value === formData.color_hex)?.textColor || '#000' }}>
                        {formData.color_hex}
                      </p>
                    </div>
                  </div>
                  
                  {/* حقل إدخال اللون يدوياً */}
                  <div className="mb-3">
                    <Label htmlFor="color_hex" className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      كود اللون (HEX)
                    </Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="color_hex"
                        type="text"
                        value={formData.color_hex}
                        onChange={(e) => handleFieldChange('color_hex', e.target.value)}
                        placeholder="#E0F2FE"
                        className={`flex-1 ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : ''}`}
                      />
                      <div 
                        className="w-10 h-10 rounded-lg border-2 border-gray-300 cursor-pointer"
                        style={{ backgroundColor: formData.color_hex }}
                        title="معاينة اللون"
                      ></div>
                    </div>
                    {errors.color_hex && (
                      <p className="text-red-500 text-xs mt-1">{errors.color_hex}</p>
                    )}
                  </div>
                  
                  {/* مربعات الألوان الجاهزة */}
                  <div>
                    <Label className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      ألوان جاهزة
                    </Label>
                    <div className="grid grid-cols-6 gap-2 mt-2">
                      {categoryColors.map((color) => (
                        <button
                          key={color.value}
                          type="button"
                          onClick={() => handleFieldChange('color_hex', color.value)}
                          className={`w-10 h-10 rounded-lg border-2 transition-all duration-200 hover:scale-110 ${
                            formData.color_hex === color.value
                              ? 'border-blue-500 scale-110 shadow-lg'
                              : 'border-gray-200 hover:border-gray-400'
                          }`}
                          style={{ backgroundColor: color.value }}
                          title={color.name}
                        >
                          {formData.color_hex === color.value && (
                            <div className="w-full h-full flex items-center justify-center">
                              <div className="w-3 h-3 bg-white rounded-full shadow-sm"></div>
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* الأيقونة */}
                <div>
                  <Label className={darkMode ? 'text-gray-200' : ''}>أيقونة التصنيف</Label>
                  <div className="grid grid-cols-8 gap-2 mt-2">
                    {categoryIcons.map((icon) => (
                      <button
                        key={icon}
                        type="button"
                        onClick={() => handleFieldChange('icon', icon)}
                        className={`w-10 h-10 rounded-lg border-2 text-lg transition-all ${
                          formData.icon === icon
                            ? 'border-blue-500 bg-blue-50 scale-110'
                            : 'border-gray-200 hover:scale-105'
                        }`}
                      >
                        {icon}
                      </button>
                    ))}
                  </div>
                </div>

                {/* التصنيف الأب */}
                <div>
                  <Label htmlFor="parent_id" className={darkMode ? 'text-gray-200' : ''}>
                    التصنيف الأب
                  </Label>
                  <select
                    id="parent_id"
                    value={formData.parent_id || ''}
                    onChange={(e) => handleFieldChange('parent_id', e.target.value || undefined)}
                    className={`w-full px-3 py-2 border rounded-lg ${
                      darkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300'
                    }`}
                  >
                    <option value="">بدون تصنيف أب</option>
                    {categories
                      .filter(cat => cat.id !== category?.id)
                      .map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name_ar}
                        </option>
                      ))}
                  </select>
                </div>

                {/* الترتيب */}
                <div>
                  <Label htmlFor="position" className={darkMode ? 'text-gray-200' : ''}>
                    الترتيب
                  </Label>
                  <Input
                    id="position"
                    type="number"
                    value={formData.position}
                    onChange={(e) => handleFieldChange('position', parseInt(e.target.value) || 0)}
                    className={darkMode ? 'bg-gray-700 border-gray-600 text-white' : ''}
                  />
                </div>

                {/* الحالة */}
                <div className="flex items-center justify-between">
                  <Label className={darkMode ? 'text-gray-200' : ''}>نشط</Label>
                  <Switch
                    checked={formData.is_active}
                    onCheckedChange={(checked) => handleFieldChange('is_active', checked)}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Image Tab */}
          {activeTab === 'image' && (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  صورة التصنيف
                </h3>
                <p className={`text-sm mb-6 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  اختر صورة معبرة للتصنيف. ستظهر هذه الصورة في صفحة التصنيف وفي قائمة التصنيفات.
                </p>
              </div>

              {/* Image Upload Area */}
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                {(imagePreview || (formData.cover_image && formData.cover_image.trim() !== '')) ? (
                  <div className="space-y-4">
                    <div className="relative inline-block">
                      <Image
                        src={imagePreview || formData.cover_image}
                        alt="معاينة الصورة"
                        width={300}
                        height={200}
                        className="rounded-lg object-cover"
                      />
                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <div>
                      <p className={`text-sm font-medium ${darkMode ? 'text-green-400' : 'text-green-600'}`}>
                        <CheckCircle className="inline-block w-4 h-4 ml-1" />
                        {imagePreview ? 'تم رفع صورة جديدة' : 'يوجد صورة محفوظة للتصنيف'}
                      </p>
                      {!imagePreview && formData.cover_image && (
                        <p className={`text-xs mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          يمكنك رفع صورة جديدة لاستبدال الصورة الحالية
                        </p>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center ${
                      darkMode ? 'bg-gray-700' : 'bg-gray-100'
                    }`}>
                      <ImageIcon className={`w-8 h-8 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                    </div>
                    <div>
                      <p className={`text-lg font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        اسحب الصورة هنا أو اضغط للاختيار
                      </p>
                      <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        PNG, JPG, GIF حتى 5MB
                      </p>
                    </div>
                    <Button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploadingImage}
                      className="bg-blue-500 hover:bg-blue-600 text-white"
                    >
                      {uploadingImage ? (
                        <>
                          <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                          جاري الرفع...
                        </>
                      ) : (
                        <>
                          <Upload className="w-4 h-4 ml-2" />
                          اختيار صورة
                        </>
                      )}
                    </Button>
                  </div>
                )}
                
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>

              {errors.cover_image && (
                <p className="text-red-500 text-sm text-center">{errors.cover_image}</p>
              )}

              {/* Image Tips */}
              <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-blue-50'}`}>
                <h4 className={`font-medium mb-2 ${darkMode ? 'text-white' : 'text-blue-900'}`}>
                  نصائح للصورة المثالية:
                </h4>
                <ul className={`text-sm space-y-1 ${darkMode ? 'text-gray-300' : 'text-blue-800'}`}>
                  <li>• استخدم صور عالية الجودة (1200×800 بكسل على الأقل)</li>
                  <li>• اختر صور معبرة عن محتوى التصنيف</li>
                  <li>• تجنب الصور المزدحمة بالتفاصيل</li>
                  <li>• تأكد من أن الصورة واضحة في الأحجام الصغيرة</li>
                </ul>
              </div>
            </div>
          )}

          {/* SEO Tab */}
          {activeTab === 'seo' && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="meta_title" className={darkMode ? 'text-gray-200' : ''}>
                  عنوان SEO
                </Label>
                <Input
                  id="meta_title"
                  value={formData.meta_title}
                  onChange={(e) => handleFieldChange('meta_title', e.target.value)}
                  placeholder="عنوان يظهر في محركات البحث..."
                  className={darkMode ? 'bg-gray-700 border-gray-600 text-white' : ''}
                />
                {errors.meta_title && (
                  <p className="text-red-500 text-sm mt-1">{errors.meta_title}</p>
                )}
              </div>

              <div>
                <Label htmlFor="meta_description" className={darkMode ? 'text-gray-200' : ''}>
                  وصف SEO
                </Label>
                <Textarea
                  id="meta_description"
                  value={formData.meta_description}
                  onChange={(e) => handleFieldChange('meta_description', e.target.value)}
                  placeholder="وصف مختصر يظهر في محركات البحث..."
                  rows={3}
                  className={darkMode ? 'bg-gray-700 border-gray-600 text-white' : ''}
                />
                {errors.meta_description && (
                  <p className="text-red-500 text-sm mt-1">{errors.meta_description}</p>
                )}
              </div>

              <div>
                <Label htmlFor="og_image_url" className={darkMode ? 'text-gray-200' : ''}>
                  صورة Open Graph
                </Label>
                <Input
                  id="og_image_url"
                  value={formData.og_image_url}
                  onChange={(e) => handleFieldChange('og_image_url', e.target.value)}
                  placeholder="رابط صورة خاصة بـ Open Graph..."
                  className={darkMode ? 'bg-gray-700 border-gray-600 text-white' : ''}
                />
              </div>

              <div>
                <Label htmlFor="canonical_url" className={darkMode ? 'text-gray-200' : ''}>
                  الرابط الأساسي
                </Label>
                <Input
                  id="canonical_url"
                  value={formData.canonical_url}
                  onChange={(e) => handleFieldChange('canonical_url', e.target.value)}
                  placeholder="الرابط الأساسي للتصنيف..."
                  className={darkMode ? 'bg-gray-700 border-gray-600 text-white' : ''}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label className={darkMode ? 'text-gray-200' : ''}>منع الفهرسة</Label>
                <Switch
                  checked={formData.noindex}
                  onCheckedChange={(checked) => handleFieldChange('noindex', checked)}
                />
              </div>

              <div>
                <Label htmlFor="og_type" className={darkMode ? 'text-gray-200' : ''}>
                  نوع Open Graph
                </Label>
                <select
                  id="og_type"
                  value={formData.og_type}
                  onChange={(e) => handleFieldChange('og_type', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg ${
                    darkMode 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300'
                  }`}
                >
                  <option value="website">موقع إلكتروني</option>
                  <option value="article">مقال</option>
                  <option value="category">تصنيف</option>
                </select>
              </div>
            </div>
          )}

          {/* Advanced Tab */}
          {activeTab === 'advanced' && (
            <div className="space-y-4">
              <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-yellow-50'}`}>
                <h4 className={`font-medium mb-2 ${darkMode ? 'text-white' : 'text-yellow-900'}`}>
                  إعدادات متقدمة
                </h4>
                <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-yellow-800'}`}>
                  هذه الإعدادات للمستخدمين المتقدمين فقط. لا تقم بتغييرها إلا إذا كنت متأكداً من تأثيرها.
                </p>
              </div>

              {/* يمكن إضافة المزيد من الإعدادات المتقدمة هنا */}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 mt-8 pt-6 border-t">
            {isEdit && !isDirty && (
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} ml-auto`}>
                قم بتعديل أي حقل لتفعيل زر الحفظ
              </p>
            )}
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              إلغاء
            </Button>
            <Button
              type="submit"
              disabled={loading || (isEdit && !isDirty)}
              className={`${
                isEdit && !isDirty 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-blue-500 hover:bg-blue-600'
              } text-white`}
              title={isEdit && !isDirty ? 'لم يتم إجراء أي تغييرات' : ''}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                  جاري الحفظ...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 ml-2" />
                  {isEdit ? 'حفظ التعديلات' : 'إضافة التصنيف'}
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}