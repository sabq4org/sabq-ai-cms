'use client';

import Image from 'next/image';
import React, { useEffect, useRef, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { X, Save, Upload, Loader2, Camera, Trash2, ImageIcon, CheckCircle } from 'lucide-react';
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

const categoryColors = [
    { name: 'أزرق سماوي', value: '#E0F2FE', textColor: '#0C4A6E' },
    { name: 'أخضر باهت', value: '#D1FAE5', textColor: '#065F46' },
    { name: 'أصفر رملي', value: '#FEF3C7', textColor: '#92400E' },
    { name: 'برتقالي فانيليا', value: '#FFEADD', textColor: '#C2410C' },
    { name: 'رمادي فاتح', value: '#F3F4F6', textColor: '#374151' },
    { name: 'وردي خفيف', value: '#FCE7F3', textColor: '#9D174D' },
    { name: 'بنفسجي لافندر', value: '#EDE9FE', textColor: '#5B21B6' },
    { name: 'أحمر فاتح', value: '#FEE2E2', textColor: '#991B1B' }
];
const categoryIcons = ['📰', '🏛️', '💼', '⚽', '🎭', '💡', '🌍', '📱', '📈', '⚖️', '💻', ' науки'];

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
  
  const { 
    register, 
    handleSubmit, 
    control, 
    reset, 
    setValue,
    watch,
    formState: { errors, isDirty }
  } = useForm<CategoryFormData>();

  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const watchCoverImage = watch('cover_image');
  const watchColorHex = watch('color_hex');

  useEffect(() => {
    const defaultValues: Partial<CategoryFormData> = {
      name_ar: '',
      name_en: '',
      description: '',
      slug: '',
      color_hex: categoryColors[0].value,
      icon: categoryIcons[0],
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

    if (isOpen) {
      if (isEdit && category) {
        reset({ ...defaultValues, ...category, parent_id: category.parent_id?.toString() });
      } else {
        reset(defaultValues);
      }
    }
  }, [isOpen, isEdit, category, reset]);

  const handleImageUpload = async (file: File) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('❌ يرجى اختيار ملف صورة صحيح');
      return;
    }
    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      toast.error('❌ حجم الصورة يجب أن يكون أقل من 5MB');
      return;
    }

    setUploadingImage(true);
    const uploadToast = toast.loading('جاري رفع الصورة...');
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', 'categories'); // نوع الصور للتصنيفات
    
    try {
      const response = await fetch('/api/upload/cloudinary', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `فشل الرفع: ${response.statusText}`);
      }

      const result = await response.json();
      if (result.success && result.url) {
        setValue('cover_image', result.url, { shouldDirty: true });
        toast.success('✅ تم رفع الصورة بنجاح!', { id: uploadToast });
      } else {
        throw new Error(result.error || 'فشل رفع الصورة من الخادم');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'حدث خطأ غير متوقع';
      toast.error(`❌ ${errorMessage}`, { id: uploadToast });
      console.error("Upload error:", error);
    } finally {
      setUploadingImage(false);
    }
  };
  
  const onSubmit = async (data: CategoryFormData) => {
    try {
      await onSave(data);
      reset();
    } catch (error) {
      // The parent component should handle the error toast
      console.error("Save failed:", error);
    }
  };

  if (!isOpen) return null;

  const handleColorSelect = (colorValue: string) => {
    setValue('color_hex', colorValue, { shouldDirty: true });
  };

  const handleIconSelect = (iconValue: string) => {
    setValue('icon', iconValue, { shouldDirty: true });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" dir="rtl">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl ${darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white'}`}>
        <div className={`sticky top-0 z-10 flex items-center justify-between p-5 border-b ${darkMode ? 'bg-gray-800/80 backdrop-blur-md border-gray-700' : 'bg-white/80 backdrop-blur-md border-gray-200'}`}>
          <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            {isEdit ? 'تعديل التصنيف' : 'إضافة تصنيف جديد'}
          </h2>
          <button onClick={onClose} className={`p-2 rounded-full transition-colors ${darkMode ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-600'}`}>
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name_ar" className={`mb-1 block ${darkMode ? 'text-gray-200' : ''}`}>الاسم بالعربية <span className="text-red-500">*</span></Label>
              <Input id="name_ar" {...register('name_ar', { required: 'الاسم بالعربية مطلوب' })} className={darkMode ? 'bg-gray-700' : ''} />
              {errors.name_ar && <p className="text-red-500 text-sm mt-1">{errors.name_ar.message}</p>}
            </div>
            <div>
              <Label htmlFor="slug" className={`mb-1 block ${darkMode ? 'text-gray-200' : ''}`}>الرابط (Slug) <span className="text-red-500">*</span></Label>
              <Input id="slug" {...register('slug', { required: 'الرابط مطلوب' })} className={darkMode ? 'bg-gray-700' : ''} />
              {errors.slug && <p className="text-red-500 text-sm mt-1">{errors.slug.message}</p>}
            </div>
          </div>

          {/* Color & Icon */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label className={`mb-2 block ${darkMode ? 'text-gray-200' : ''}`}>لون التصنيف</Label>
              <div className="flex flex-wrap gap-2">
                {categoryColors.map(color => (
                  <button key={color.value} type="button" onClick={() => handleColorSelect(color.value)}
                    className={`w-9 h-9 rounded-full border-2 transition-all duration-150 ${watchColorHex === color.value ? 'border-blue-500 ring-2 ring-blue-500 scale-110' : 'border-gray-300 dark:border-gray-600'}`}
                    style={{ backgroundColor: color.value }} title={color.name} />
                ))}
              </div>
            </div>
            <div>
              <Label className={`mb-2 block ${darkMode ? 'text-gray-200' : ''}`}>أيقونة التصنيف</Label>
               <Controller
                name="icon"
                control={control}
                render={({ field }) => (
                  <div className="flex flex-wrap gap-2">
                    {categoryIcons.map(icon => (
                      <button key={icon} type="button" onClick={() => handleIconSelect(icon)}
                        className={`w-10 h-10 rounded-lg border-2 text-xl flex items-center justify-center transition-all duration-150 ${field.value === icon ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/50' : 'border-gray-200 dark:border-gray-700'}`}>
                        {icon}
                      </button>
                    ))}
                  </div>
                )}
              />
            </div>
          </div>

          {/* Cover Image */}
          <div>
            <Label className={`mb-2 block ${darkMode ? 'text-gray-200' : ''}`}>صورة الغلاف</Label>
            <div className="mt-2 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 text-center">
              {watchCoverImage ? (
                <div className="relative group w-full h-48">
                  <Image src={watchCoverImage} alt="معاينة" layout="fill" className="rounded-md object-cover" />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-md">
                    <button type="button" onClick={() => setValue('cover_image', '', { shouldDirty: true })} className="text-white text-sm flex items-center gap-2 bg-red-600/80 px-4 py-2 rounded-lg">
                      <Trash2 className="w-4 h-4" /> إزالة الصورة
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3 py-6">
                  <ImageIcon className={`w-12 h-12 mx-auto ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                  <p className="text-sm text-gray-500">اسحب الصورة إلى هنا أو اضغط للاختيار</p>
                  <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()} disabled={uploadingImage}>
                    {uploadingImage ? <><Loader2 className="w-4 h-4 animate-spin ml-2" /> جاري الرفع...</> : <><Upload className="w-4 h-4 ml-2" /> اختيار صورة</>}
                  </Button>
                </div>
              )}
              <input ref={fileInputRef} type="file" accept="image/*" onChange={e => e.target.files && handleImageUpload(e.target.files[0])} className="hidden" />
            </div>
          </div>
          
          {/* Actions */}
          <div className="flex items-center justify-end gap-3 mt-8 pt-6 border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}">
            <Button type="button" variant="ghost" onClick={onClose} disabled={loading}>إلغاء</Button>
            <Button type="submit" disabled={loading || !isDirty} className="min-w-[120px]">
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Save className="w-4 h-4 ml-2" /> {isEdit ? 'حفظ التعديلات' : 'إضافة التصنيف'}</>}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}