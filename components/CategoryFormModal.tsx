'use client';

import Image from 'next/image';
import React, { useEffect, useRef } from 'react';
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
  } = useForm<CategoryFormData>({
    defaultValues: {
      name_ar: '',
      name_en: '',
      description: '',
      slug: '',
      color_hex: '#E0F2FE',
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
    }
  });

  const [uploadingImage, setUploadingImage] = React.useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const watchCoverImage = watch('cover_image');
  const watchColorHex = watch('color_hex');

  // ألوان وتصنيفات ثابتة
  const categoryColors = [
    { name: 'أزرق سماوي', value: '#E0F2FE', textColor: '#0C4A6E' },
    { name: 'أخضر باهت', value: '#ECFDF5', textColor: '#064E3B' },
    { name: 'أصفر رملي', value: '#FEF9C3', textColor: '#92400E' },
    { name: 'برتقالي فانيليا', value: '#FFF7ED', textColor: '#9A3412' },
    { name: 'رمادي فاتح', value: '#F3F4F6', textColor: '#374151' },
    { name: 'وردي خفيف', value: '#FDF2F8', textColor: '#831843' }
  ];
  const categoryIcons = ['📰', '🏛️', '💼', '⚽', '🎭', '💡', '🌍', '📱'];

  useEffect(() => {
    if (isOpen) {
      if (isEdit && category) {
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
          cover_image: category.cover_image || ''
        };
        reset(categoryData);
      } else {
        reset({
          name_ar: '', name_en: '', description: '', slug: '',
          color_hex: '#E0F2FE', icon: '📰', parent_id: undefined,
          position: 0, is_active: true, cover_image: ''
        });
      }
    }
  }, [isOpen, isEdit, category, reset]);

  const handleImageUpload = async (file: File) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('❌ يرجى اختيار ملف صورة صحيح');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('❌ حجم الصورة يجب أن يكون أقل من 5MB');
      return;
    }

    setUploadingImage(true);
    const uploadFormData = new FormData();
    uploadFormData.append('file', file);
    uploadFormData.append('upload_preset', 'simple_upload');
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'dybhezmvb';
    const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;

    try {
      const response = await fetch(uploadUrl, { method: 'POST', body: uploadFormData });
      if (response.ok) {
        const data = await response.json();
        setValue('cover_image', data.secure_url, { shouldDirty: true });
        toast.success('✅ تم رفع الصورة بنجاح!');
      } else {
        throw new Error('فشل رفع الصورة');
      }
    } catch (error) {
      toast.error('❌ حدث خطأ أثناء رفع الصورة');
    } finally {
      setUploadingImage(false);
    }
  };
  
  const onSubmit = (data: CategoryFormData) => {
    onSave(data).then(() => {
      reset(); // إعادة تعيين النموذج بعد الحفظ
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl shadow-xl ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
        <div className={`sticky top-0 z-10 flex items-center justify-between p-6 border-b ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            {isEdit ? 'تعديل التصنيف' : 'إضافة تصنيف جديد'}
          </h2>
          <button onClick={onClose} className={`p-2 rounded-lg transition-colors ${darkMode ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-600'}`}>
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          {/* Basic Info */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="name_ar" className={darkMode ? 'text-gray-200' : ''}>الاسم بالعربية <span className="text-red-500">*</span></Label>
              <Input id="name_ar" {...register('name_ar', { required: 'الاسم بالعربية مطلوب' })} className={darkMode ? 'bg-gray-700' : ''} />
              {errors.name_ar && <p className="text-red-500 text-sm mt-1">{errors.name_ar.message}</p>}
            </div>
            <div>
              <Label htmlFor="slug" className={darkMode ? 'text-gray-200' : ''}>الرابط <span className="text-red-500">*</span></Label>
              <Input id="slug" {...register('slug', { required: 'الرابط مطلوب' })} className={darkMode ? 'bg-gray-700' : ''} />
              {errors.slug && <p className="text-red-500 text-sm mt-1">{errors.slug.message}</p>}
            </div>
          </div>

          {/* Color & Icon */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label className={darkMode ? 'text-gray-200' : ''}>لون التصنيف</Label>
              <div className="flex items-center gap-2 mt-2">
                <div className="w-8 h-8 rounded-full border-2" style={{ backgroundColor: watchColorHex }}></div>
                <Input {...register('color_hex')} placeholder="#E0F2FE" className={`flex-1 ${darkMode ? 'bg-gray-700' : ''}`} />
              </div>
              <div className="grid grid-cols-6 gap-2 mt-2">
                {categoryColors.map(color => (
                  <button key={color.value} type="button" onClick={() => setValue('color_hex', color.value, { shouldDirty: true })}
                    className={`w-10 h-10 rounded-lg border-2 transition-all ${watchColorHex === color.value ? 'border-blue-500 scale-110' : 'border-transparent'}`}
                    style={{ backgroundColor: color.value }} title={color.name} />
                ))}
              </div>
            </div>
            <div>
              <Label className={darkMode ? 'text-gray-200' : ''}>أيقونة التصنيف</Label>
              <Controller
                name="icon"
                control={control}
                render={({ field }) => (
                  <div className="grid grid-cols-8 gap-2 mt-2">
                    {categoryIcons.map(icon => (
                      <button key={icon} type="button" onClick={() => setValue('icon', icon, { shouldDirty: true })}
                        className={`w-10 h-10 rounded-lg border-2 text-lg ${field.value === icon ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}>
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
            <Label className={darkMode ? 'text-gray-200' : ''}>صورة الغلاف</Label>
            <div className="mt-2 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              {watchCoverImage ? (
                <div className="space-y-2">
                  <Image src={watchCoverImage} alt="معاينة" width={200} height={120} className="rounded-lg object-cover mx-auto" />
                  <button type="button" onClick={() => setValue('cover_image', '', { shouldDirty: true })} className="text-red-500 text-sm flex items-center gap-1 mx-auto">
                    <Trash2 className="w-4 h-4" /> إزالة الصورة
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <ImageIcon className={`w-10 h-10 mx-auto ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                  <p className="text-sm">اسحب الصورة أو اضغط للاختيار</p>
                  <Button type="button" onClick={() => fileInputRef.current?.click()} disabled={uploadingImage}>
                    {uploadingImage ? <><Loader2 className="w-4 h-4 animate-spin ml-2" /> جاري الرفع...</> : <><Upload className="w-4 h-4 ml-2" /> اختيار صورة</>}
                  </Button>
                </div>
              )}
              <input ref={fileInputRef} type="file" accept="image/*" onChange={e => e.target.files && handleImageUpload(e.target.files[0])} className="hidden" />
            </div>
          </div>
          
          {/* Actions */}
          <div className="flex items-center justify-end gap-3 mt-8 pt-6 border-t">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>إلغاء</Button>
            <Button type="submit" disabled={loading || !isDirty}>
              {loading ? <><Loader2 className="w-4 h-4 animate-spin ml-2" /> جاري الحفظ...</> : <><Save className="w-4 h-4 ml-2" /> {isEdit ? 'حفظ التعديلات' : 'إضافة'}</>}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}