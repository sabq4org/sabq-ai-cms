'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { useDarkModeContext } from '@/contexts/DarkModeContext';
import Image from 'next/image';
import { 
  ArrowLeft, 
  Save, 
  Upload, 
  X, 
  Loader2,
  AlertCircle,
  CheckCircle,
  Image as ImageIcon,
  Trash2,
  Palette,
  Smile
} from 'lucide-react';

interface Category {
  id: string;
  name: string;
  name_ar: string;
  name_en?: string;
  slug: string;
  description?: string;
  description_en?: string;
  color?: string;
  color_hex?: string;
  icon?: string;
  parent_id?: string | null;
  display_order?: number;
  position?: number;
  is_active?: boolean;
  cover_image?: string;
  meta_title?: string;
  meta_description?: string;
  og_image_url?: string;
  canonical_url?: string;
  noindex?: boolean;
  og_type?: string;
}

export default function EditCategoryPage() {
  const params = useParams();
  const router = useRouter();
  const { darkMode } = useDarkModeContext();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const colorPickerRef = useRef<HTMLDivElement>(null);
  const iconPickerRef = useRef<HTMLDivElement>(null);
  
  const categoryId = params?.id as string;
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [category, setCategory] = useState<Category | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showIconPicker, setShowIconPicker] = useState(false);
  
  // مجموعة الألوان المحددة مسبقاً
  const predefinedColors = [
    '#EF4444', // أحمر
    '#F59E0B', // برتقالي
    '#10B981', // أخضر
    '#3B82F6', // أزرق
    '#6366F1', // نيلي
    '#8B5CF6', // بنفسجي
    '#EC4899', // وردي
    '#6B7280', // رمادي
    '#059669', // أخضر داكن
    '#DC2626', // أحمر داكن
    '#7C3AED', // بنفسجي داكن
    '#2563EB', // أزرق داكن
  ];
  
  // مجموعة الأيقونات المحددة مسبقاً
  const predefinedIcons = [
    '📰', '📄', '📋', '📌', '📍', '📎', '🗂️', '📁',
    '💼', '💰', '🏆', '🎯', '🎨', '🎭', '🎪', '🎬',
    '🏀', '⚽', '🏈', '⚾', '🎾', '🏐', '🏉', '🎱',
    '🚗', '✈️', '🚀', '🏠', '🏢', '🏛️', '🏗️', '🏭',
    '💻', '📱', '🖥️', '⌨️', '🖱️', '💾', '💿', '📷',
    '🍔', '🍕', '🍎', '🥗', '🍰', '☕', '🍷', '🍺',
    '🌍', '🌎', '🌏', '🗺️', '🧭', '🏔️', '🏖️', '🏜️',
    '👥', '👤', '👨‍💼', '👩‍💼', '👨‍🎓', '👩‍🎓', '👨‍⚕️', '👩‍⚕️'
  ];
  
  // جلب بيانات التصنيف
  useEffect(() => {
    fetchCategory();
  }, [categoryId]);

  // إغلاق النوافذ عند النقر خارجها
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (colorPickerRef.current && !colorPickerRef.current.contains(event.target as Node)) {
        setShowColorPicker(false);
      }
      if (iconPickerRef.current && !iconPickerRef.current.contains(event.target as Node)) {
        setShowIconPicker(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  const fetchCategory = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/categories?id=${categoryId}`);
      const data = await response.json();
      
      if (data.success && data.data?.length > 0) {
        const categoryData = data.data[0];
        setCategory(categoryData);
        
        // تعيين معاينة الصورة إذا كانت موجودة
        if (categoryData.cover_image) {
          setImagePreview(categoryData.cover_image);
        }
      } else {
        toast.error('التصنيف غير موجود');
        router.push('/dashboard/categories');
      }
    } catch (error) {
      console.error('Error fetching category:', error);
      toast.error('فشل في جلب بيانات التصنيف');
    } finally {
      setLoading(false);
    }
  };
  
  // معالجة اختيار الصورة
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // التحقق من نوع الملف
    if (!file.type.startsWith('image/')) {
      setErrors({ ...errors, cover_image: 'يرجى اختيار ملف صورة صحيح' });
      toast.error('يرجى اختيار ملف صورة صحيح (JPG, PNG, GIF)');
      return;
    }
    
    // التحقق من حجم الملف (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      setErrors({ ...errors, cover_image: 'حجم الصورة يجب أن يكون أقل من 5MB' });
      toast.error('حجم الصورة كبير جداً! الحد الأقصى 5MB');
      return;
    }
    
    setErrors({ ...errors, cover_image: '' });
    setImageFile(file);
    
    // إنشاء معاينة
    const reader = new FileReader();
    reader.onload = (event) => {
      setImagePreview(event.target?.result as string);
      toast.success('تم اختيار الصورة بنجاح! اضغط "حفظ التعديلات" لرفعها');
    };
    reader.readAsDataURL(file);
  };
  
  // رفع الصورة إلى Cloudinary
  const uploadImage = async (): Promise<string | null> => {
    if (!imageFile) return category?.cover_image || null;
    
    try {
      setUploading(true);
      toast.loading('جاري رفع الصورة...', { id: 'upload-image' });
      
      const formData = new FormData();
      formData.append('file', imageFile);
      formData.append('upload_preset', 'simple_upload'); // استخدام preset بسيط
      formData.append('folder', 'categories');
      
      const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'dybhezmvb';
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        {
          method: 'POST',
          body: formData
        }
      );
      
      if (!response.ok) {
        throw new Error('فشل رفع الصورة');
      }
      
      const data = await response.json();
      console.log('✅ Upload successful:', data.secure_url);
      
      toast.success('تم رفع الصورة بنجاح ✅', { id: 'upload-image' });
      
      return data.secure_url;
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('فشل في رفع الصورة', { id: 'upload-image' });
      return null;
    } finally {
      setUploading(false);
    }
  };
  
  // حفظ التعديلات
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!category) return;
    
    try {
      setSaving(true);
      
      // رفع الصورة أولاً إذا كان هناك ملف جديد
      let coverImageUrl = category.cover_image;
      if (imageFile) {
        const uploadedUrl = await uploadImage();
        if (uploadedUrl) {
          coverImageUrl = uploadedUrl;
          console.log('📸 New image uploaded:', uploadedUrl);
        } else {
          toast.error('فشل رفع الصورة - يرجى المحاولة مرة أخرى');
          return;
        }
      }
      
      // إعداد البيانات للإرسال
      const updateData = {
        id: category.id,
        name: category.name_ar || category.name,
        name_ar: category.name_ar || category.name,
        name_en: category.name_en || '',
        description: category.description || '',
        slug: category.slug,
        color: category.color || category.color_hex || '#6B7280',
        color_hex: category.color || category.color_hex || '#6B7280',
        icon: category.icon || '📁',
        parent_id: category.parent_id || null,
        position: category.position || category.display_order || 0,
        display_order: category.display_order || category.position || 0,
        is_active: category.is_active !== false,
        cover_image: coverImageUrl || '',
        meta_title: category.meta_title || '',
        meta_description: category.meta_description || '',
        og_image_url: category.og_image_url || '',
        canonical_url: category.canonical_url || '',
        noindex: category.noindex || false,
        og_type: category.og_type || 'website'
      };
      
      console.log('📤 Sending update with data:', {
        id: updateData.id,
        name: updateData.name,
        color: updateData.color,
        icon: updateData.icon,
        cover_image: updateData.cover_image
      });
      
      const response = await fetch('/api/categories', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData)
      });
      
      const result = await response.json();
      
      if (result.success) {
        toast.success('تم تحديث التصنيف بنجاح');
        
        // التحقق من وجود الصورة في النتيجة
        if (result.data?.cover_image) {
          console.log('✅ Cover image saved:', result.data.cover_image);
          toast.success('تم حفظ صورة الغلاف بنجاح', { duration: 3000 });
        }
        
        // الانتقال إلى صفحة التصنيفات بعد ثانيتين
        setTimeout(() => {
          router.push('/dashboard/categories');
        }, 2000);
      } else {
        throw new Error(result.error || 'فشل في تحديث التصنيف');
      }
    } catch (error) {
      console.error('Error saving category:', error);
      toast.error(error instanceof Error ? error.message : 'حدث خطأ في حفظ التصنيف');
    } finally {
      setSaving(false);
    }
  };
  
  // حذف الصورة
  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (category) {
      setCategory({ ...category, cover_image: '' });
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  // تحديث قيمة حقل
  const updateField = (field: keyof Category, value: any) => {
    if (category) {
      setCategory({ ...category, [field]: value });
    }
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }
  
  if (!category) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-lg">التصنيف غير موجود</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className={`min-h-screen p-6 ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => router.push('/dashboard/categories')}
            className={`flex items-center gap-2 mb-4 ${
              darkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'
            } transition-colors`}
          >
            <ArrowLeft className="w-5 h-5" />
            <span>العودة إلى التصنيفات</span>
          </button>
          
          <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            تعديل التصنيف
          </h1>
        </div>
        
        {/* Form */}
        <form onSubmit={handleSave} className={`${
          darkMode ? 'bg-gray-800' : 'bg-white'
        } rounded-lg shadow-lg p-6`}>
          
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Arabic Name */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${
                darkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                اسم التصنيف (عربي) *
              </label>
              <input
                type="text"
                value={category.name_ar || category.name}
                onChange={(e) => updateField('name_ar', e.target.value)}
                className={`w-full px-4 py-2 rounded-lg border ${
                  darkMode 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-white border-gray-300 text-gray-900'
                } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                required
              />
            </div>
            
            {/* English Name */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${
                darkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                اسم التصنيف (إنجليزي)
              </label>
              <input
                type="text"
                value={category.name_en || ''}
                onChange={(e) => updateField('name_en', e.target.value)}
                className={`w-full px-4 py-2 rounded-lg border ${
                  darkMode 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-white border-gray-300 text-gray-900'
                } focus:outline-none focus:ring-2 focus:ring-blue-500`}
              />
            </div>
            
            {/* Slug */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${
                darkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                الرابط المختصر (Slug) *
              </label>
              <input
                type="text"
                value={category.slug}
                onChange={(e) => updateField('slug', e.target.value)}
                className={`w-full px-4 py-2 rounded-lg border ${
                  darkMode 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-white border-gray-300 text-gray-900'
                } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                required
              />
            </div>
            
            {/* Color Picker */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${
                darkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                اللون
              </label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowColorPicker(!showColorPicker)}
                  className={`w-full px-4 py-2 rounded-lg border flex items-center justify-between ${
                    darkMode 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                >
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-6 h-6 rounded border border-gray-300"
                      style={{ backgroundColor: category.color || category.color_hex || '#6B7280' }}
                    />
                    <span>{category.color || category.color_hex || '#6B7280'}</span>
                  </div>
                  <Palette className="w-4 h-4" />
                </button>
                
                {/* Color Picker Dropdown */}
                {showColorPicker && (
                  <div 
                    ref={colorPickerRef}
                    className={`absolute top-full mt-2 p-4 rounded-lg shadow-xl z-10 ${
                      darkMode ? 'bg-gray-700' : 'bg-white'
                    } border ${darkMode ? 'border-gray-600' : 'border-gray-200'}`}
                  >
                    <div className="grid grid-cols-6 gap-2 mb-3">
                      {predefinedColors.map((color) => (
                        <button
                          key={color}
                          type="button"
                          onClick={() => {
                            updateField('color', color);
                            updateField('color_hex', color);
                            setShowColorPicker(false);
                          }}
                          className={`w-8 h-8 rounded border-2 transition-transform hover:scale-110 ${
                            (category.color === color || category.color_hex === color)
                              ? 'border-blue-500 ring-2 ring-blue-300'
                              : 'border-gray-300'
                          }`}
                          style={{ backgroundColor: color }}
                          title={color}
                        />
                      ))}
                    </div>
                    <input
                      type="color"
                      value={category.color || category.color_hex || '#6B7280'}
                      onChange={(e) => {
                        updateField('color', e.target.value);
                        updateField('color_hex', e.target.value);
                      }}
                      className="w-full h-10 cursor-pointer rounded"
                    />
                  </div>
                )}
              </div>
            </div>
            
            {/* Icon Picker */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${
                darkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                الأيقونة
              </label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowIconPicker(!showIconPicker)}
                  className={`w-full px-4 py-2 rounded-lg border flex items-center justify-between ${
                    darkMode 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                >
                  <span className="text-2xl">{category.icon || '📁'}</span>
                  <Smile className="w-4 h-4" />
                </button>
                
                {/* Icon Picker Dropdown */}
                {showIconPicker && (
                  <div 
                    ref={iconPickerRef}
                    className={`absolute top-full mt-2 p-4 rounded-lg shadow-xl z-10 max-h-64 overflow-y-auto ${
                      darkMode ? 'bg-gray-700' : 'bg-white'
                    } border ${darkMode ? 'border-gray-600' : 'border-gray-200'}`}
                  >
                    <div className="grid grid-cols-8 gap-2">
                      {predefinedIcons.map((icon) => (
                        <button
                          key={icon}
                          type="button"
                          onClick={() => {
                            updateField('icon', icon);
                            setShowIconPicker(false);
                          }}
                          className={`p-2 text-2xl rounded hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors ${
                            category.icon === icon
                              ? 'bg-blue-100 dark:bg-blue-900 ring-2 ring-blue-500'
                              : ''
                          }`}
                        >
                          {icon}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Description */}
          <div className="mb-6">
            <label className={`block text-sm font-medium mb-2 ${
              darkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
              الوصف
            </label>
            <textarea
              value={category.description || ''}
              onChange={(e) => updateField('description', e.target.value)}
              rows={3}
              className={`w-full px-4 py-2 rounded-lg border ${
                darkMode 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-white border-gray-300 text-gray-900'
              } focus:outline-none focus:ring-2 focus:ring-blue-500`}
            />
          </div>
          
          {/* Cover Image */}
          <div className="mb-6">
            <label className={`block text-sm font-medium mb-2 ${
              darkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
              صورة الغلاف
            </label>
            
            <div className={`border-2 border-dashed rounded-lg p-6 text-center ${
              darkMode ? 'border-gray-600' : 'border-gray-300'
            }`}>
              {imagePreview || category.cover_image ? (
                <div className="relative inline-block">
                  <img
                    src={imagePreview || category.cover_image}
                    alt="معاينة الصورة"
                    className="max-w-full max-h-64 rounded-lg shadow-lg"
                  />
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div>
                  <ImageIcon className={`w-12 h-12 mx-auto mb-4 ${
                    darkMode ? 'text-gray-400' : 'text-gray-500'
                  }`} />
                  <p className={`mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    اضغط لاختيار صورة أو اسحب وأفلت هنا
                  </p>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    PNG, JPG, GIF حتى 5MB
                  </p>
                </div>
              )}
              
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                className="hidden"
              />
              
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className={`mt-4 px-4 py-2 rounded-lg font-medium ${
                  darkMode 
                    ? 'bg-gray-700 hover:bg-gray-600 text-white' 
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
                } transition-colors`}
              >
                {imagePreview || category.cover_image ? 'تغيير الصورة' : 'اختيار صورة'}
              </button>
              
              {errors.cover_image && (
                <p className="text-red-500 text-sm mt-2">{errors.cover_image}</p>
              )}
            </div>
          </div>
          
          {/* Active Status */}
          <div className="mb-6">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={category.is_active !== false}
                onChange={(e) => updateField('is_active', e.target.checked)}
                className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
              />
              <span className={`${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                تصنيف نشط
              </span>
            </label>
          </div>
          
          {/* Action Buttons */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={saving || uploading}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium ${
                saving || uploading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700'
              } text-white transition-colors`}
            >
              {saving || uploading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>{uploading ? 'جاري رفع الصورة...' : 'جاري الحفظ...'}</span>
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  <span>حفظ التعديلات</span>
                </>
              )}
            </button>
            
            <button
              type="button"
              onClick={() => router.push('/dashboard/categories')}
              className={`px-6 py-3 rounded-lg font-medium ${
                darkMode 
                  ? 'bg-gray-700 hover:bg-gray-600 text-white' 
                  : 'bg-gray-200 hover:bg-gray-300 text-gray-900'
              } transition-colors`}
            >
              إلغاء
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 