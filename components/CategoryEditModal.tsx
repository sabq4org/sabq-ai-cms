import React, { useEffect, useRef, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import Image from 'next/image';
import { X, Save, Upload, Loader2, Trash2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Category } from '@/types/category';

export interface CategoryPayload {
  id?: string;
  name_ar: string;
  slug: string;
  color_hex: string;
  cover_image?: string;
  is_active: boolean;
}

interface Props {
  isOpen: boolean;
  initialData?: Category | null;
  onClose: () => void;
  onSave: (payload: CategoryPayload) => Promise<void>;
  loading?: boolean;
  darkMode?: boolean;
}

const COLORS = [
  '#E0F2FE', '#D1FAE5', '#FEF3C7', '#FFF7ED', '#F3F4F6', '#FDF2F8', '#EDE9FE', '#FEE2E2'
];

const CategoryEditModal: React.FC<Props> = ({ isOpen, initialData, onClose, onSave, loading = false, darkMode = false }) => {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { isDirty, errors }
  } = useForm<CategoryPayload>({
    defaultValues: {
      name_ar: '',
      slug: '',
      color_hex: COLORS[0],
      cover_image: '',
      is_active: true
    }
  });

  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const cover = watch('cover_image');
  const color = watch('color_hex');

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        reset({
          id: initialData.id,
          name_ar: initialData.name_ar,
          slug: initialData.slug,
          color_hex: initialData.color_hex || COLORS[0],
          cover_image: initialData.cover_image || '',
          is_active: initialData.is_active ?? true
        });
      } else {
        reset();
      }
    }
  }, [isOpen, initialData, reset]);

  const uploadImage = async (file: File) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) return toast.error('الملف ليس صورة');
    if (file.size > 5 * 1024 * 1024) return toast.error('الحد الأقصى 5MB');
    setUploading(true);
    const fd = new FormData();
    fd.append('file', file);
    try {
      fd.append('type', 'categories');
      const res = await fetch('/api/upload/cloudinary', { method: 'POST', body: fd });
      const data = await res.json();
      if (res.ok && data.url) {
        setValue('cover_image', data.url, { shouldDirty: true });
        toast.success('تم رفع الصورة');
      } else throw new Error(data.error || 'فشل الرفع');
    } catch (e:any) {
      toast.error(e.message);
    } finally { setUploading(false);} 
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" dir="rtl">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className={`relative w-full max-w-lg bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6`}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold">{initialData ? 'تعديل التصنيف' : 'إضافة تصنيف'}</h2>
          <button onClick={onClose}><X className="w-5 h-5"/></button>
        </div>

        <form onSubmit={handleSubmit(onSave)} className="space-y-6">
          {/* الاسم */}
          <div>
            <Label>الاسم بالعربية *</Label>
            <Input {...register('name_ar', { required: 'مطلوب' })} />
            {errors.name_ar && <span className="text-red-500 text-sm">{errors.name_ar.message}</span>}
          </div>
          {/* slug */}
          <div>
            <Label>الرابط (slug) *</Label>
            <Input {...register('slug', { required: 'مطلوب' })} />
          </div>
          {/* اللون */}
          <div>
            <Label>لون التصنيف</Label>
            <div className="flex gap-2 mt-2 flex-wrap">
              {COLORS.map(c => (
                <button key={c} type="button" onClick={() => setValue('color_hex', c, { shouldDirty: true })} className={`w-8 h-8 rounded-full border-2 ${color===c ? 'border-blue-500 scale-110': 'border-transparent'}`} style={{backgroundColor:c}} />
              ))}
            </div>
          </div>
          {/* صورة الغلاف */}
          <div>
            <Label>صورة الغلاف</Label>
            <div className="border-dashed border-2 border-gray-300 mt-2 p-4 text-center rounded-lg">
              {cover ? (
                <div className="relative group w-full h-40">
                  <Image src={cover} alt="cover" fill className="object-cover rounded-lg" />
                  <button type="button" onClick={()=>setValue('cover_image','',{shouldDirty:true})} className="absolute top-2 right-2 bg-red-600 text-white p-1 rounded"><Trash2 className="w-4 h-4"/></button>
                </div>
              ): (
                <div>
                  <Upload className="w-8 h-8 mx-auto text-gray-400"/>
                  <p className="text-sm">اسحب أو اضغط لاختيار صورة</p>
                  <Button type="button" variant="outline" onClick={()=>fileRef.current?.click()} disabled={uploading}>{uploading ? <Loader2 className="w-4 h-4 animate-spin"/>:'اختيار صورة'}</Button>
                  <input ref={fileRef} type="file" className="hidden" accept="image/*" onChange={e=>e.target.files&&uploadImage(e.target.files[0])}/>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="ghost" onClick={onClose}>إلغاء</Button>
            <Button type="submit" disabled={!isDirty || loading}>{loading? <Loader2 className="w-4 h-4 animate-spin"/> : <><Save className="w-4 h-4 ml-1"/>حفظ</>}</Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CategoryEditModal; 