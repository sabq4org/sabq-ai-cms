'use client';

import Image from 'next/image';
import React, { useState, useRef } from 'react';
import { Upload, Image as ImageIcon, X, Link, Loader, CheckCircle, AlertCircle } from 'lucide-react';
import { getDefaultImageUrl } from '@/lib/cloudinary';
import toast from 'react-hot-toast';

interface FeaturedImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  darkMode?: boolean;
}

export default function FeaturedImageUpload({ value, onChange, darkMode = false }: FeaturedImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUploadClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    console.log('🖱️ تم النقر على زر رفع الصورة');
    
    if (fileInputRef.current) {
      console.log('✅ fileInputRef موجود، فتح حوار الملف...');
      fileInputRef.current.click();
    } else {
      console.error('❌ fileInputRef.current غير موجود!');
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log('📁 تم تحديد ملف:', e.target.files);
    const file = e.target.files?.[0];
    if (!file) return;

    console.log('📋 معلومات الملف:', { 
      name: file.name, 
      size: file.size, 
      type: file.type 
    });
    
    // التحقق من نوع الملف
    if (!file.type.startsWith('image/')) {
      const error = 'يرجى اختيار ملف صورة صالح';
      setUploadError(error);
      toast.error(error);
      return;
    }

    // التحقق من حجم الملف (10MB كحد أقصى)
    if (file.size > 10 * 1024 * 1024) {
      const error = 'حجم الصورة يجب أن يكون أقل من 10MB';
      setUploadError(error);
      toast.error(error);
      return;
    }

    setUploading(true);
    setUploadError(null);
    
    // عرض toast للتحميل
    const uploadToast = toast.loading('🔄 جاري رفع الصورة...', {
      duration: 30000 // 30 ثانية للتحميل
    });

    try {
      console.log('📤 بدء رفع الصورة...');
      
      // إنشاء FormData
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', 'featured');

      console.log('🌐 إرسال طلب الرفع...');
      
      // رفع الصورة باستخدام API البسيط أولاً
      let response = await fetch('/api/upload-image', {
        method: 'POST',
        body: formData
      });
      
      // إذا فشل الرفع البسيط، جرب الرفع العادي
      if (!response.ok) {
        console.log('⚠️ فشل API البسيط، محاولة استخدام API العادي...');
        response = await fetch('/api/upload', {
          method: 'POST',
          body: formData
        });
      }
      
      // إذا فشل كليهما، جرب Cloudinary كبديل أخير
      if (!response.ok) {
        console.log('⚠️ فشل الرفع المحلي، محاولة استخدام Cloudinary...');
        response = await fetch('/api/upload/cloudinary', {
          method: 'POST',
          body: formData
        });
      }

      console.log('📡 استجابة الخادم:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok
      });

      if (!response.ok) {
        const contentType = response.headers.get('content-type');
        let errorMessage = `فشل رفع الصورة: ${response.status} ${response.statusText}`;
        
        if (contentType && contentType.includes('application/json')) {
          try {
            const errorData = await response.json();
            errorMessage = errorData.error || errorMessage;
          } catch (e) {
            console.error('❌ فشل في تحليل رسالة الخطأ:', e);
          }
        } else {
          const textError = await response.text();
          console.error('❌ استجابة غير متوقعة:', textError);
        }
        
        throw new Error(errorMessage);
      }

      // التحقق من نوع المحتوى قبل تحليل JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('❌ استجابة غير JSON:', text);
        throw new Error('الخادم أرجع استجابة غير صالحة');
      }

      const data = await response.json();
      console.log('📊 بيانات الاستجابة:', data);
      
      // التحقق من نجاح العملية والحصول على URL
      if (data.success && data.url) {
        console.log('✅ تم الرفع بنجاح، URL:', data.url);
        
        // تحديث الحالة
        onChange(data.url);
        setImageLoaded(false); // إعادة تعيين حالة التحميل
        
        // إظهار رسالة نجاح
        toast.success('✅ تم رفع الصورة بنجاح!', { 
          id: uploadToast,
          duration: 3000 
        });
        
        console.log('📸 تم حفظ رابط الصورة:', data.url);
      } else {
        throw new Error(data.error || 'فشل في الحصول على رابط الصورة');
      }
      
    } catch (error) {
      console.error('❌ خطأ في رفع الصورة:', error);
      const errorMessage = error instanceof Error ? error.message : 'حدث خطأ أثناء رفع الصورة';
      setUploadError(errorMessage);
      
      // إظهار رسالة خطأ
      toast.error(`❌ ${errorMessage}`, { 
        id: uploadToast,
        duration: 5000 
      });
    } finally {
      setUploading(false);
      
      // إعادة تعيين قيمة input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleUrlSubmit = (url: string) => {
    if (url.trim()) {
      console.log('🔗 إدخال رابط صورة:', url.trim());
      onChange(url.trim());
      setShowUrlInput(false);
      setImageLoaded(false);
      toast.success('✅ تم حفظ رابط الصورة');
    }
  };

  const handleRemoveImage = () => {
    console.log('🗑️ حذف الصورة');
    onChange('');
    setShowUrlInput(false);
    setImageLoaded(false);
    setUploadError(null);
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    
    toast.success('✅ تم حذف الصورة');
  };

  const handleImageLoad = () => {
    console.log('🖼️ تم تحميل الصورة بنجاح');
    setImageLoaded(true);
    setUploadError(null);
  };

  const handleImageError = () => {
    console.error('❌ فشل في تحميل الصورة:', value);
    setImageLoaded(false);
    setUploadError('فشل في تحميل الصورة');
    
    // إذا كانت الصورة placeholder خاطئة، استخدم المسار الصحيح
    if (value === '/placeholder.jpg' || value === '/placeholder-analysis.jpg' || value === '/images/placeholder.jpg') {
      onChange('/images/deep-analysis-default.svg');
    }
  };

  return (
    <div className="space-y-3">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileUpload}
        className="hidden"
      />

      {!value ? (
        <div className={`border-2 border-dashed rounded-xl p-6 text-center transition-all ${
          darkMode 
            ? 'border-gray-700 hover:border-gray-600 bg-gray-800/50' 
            : 'border-gray-300 hover:border-gray-400 bg-gray-50'
        }`}>
          <ImageIcon className={`w-12 h-12 mx-auto mb-3 ${
            darkMode ? 'text-gray-600' : 'text-gray-400'
          }`} />
          
          <div className="space-y-3">
            <button
              type="button"
              onClick={handleUploadClick}
              disabled={uploading}
              className={`mx-auto flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                uploading
                  ? darkMode 
                    ? 'bg-gray-700 text-gray-500 cursor-not-allowed' 
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : darkMode 
                    ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                    : 'bg-blue-500 hover:bg-blue-600 text-white'
              }`}
            >
              {uploading ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  <span>جارٍ الرفع...</span>
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  <span>رفع صورة</span>
                </>
              )}
            </button>

            <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              أو
            </div>

            <button
              type="button"
              onClick={() => setShowUrlInput(true)}
              className={`text-sm underline ${
                darkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'
              }`}
            >
              إدخال رابط URL
            </button>
          </div>

          <p className={`text-xs mt-3 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                              JPG, PNG, GIF, WebP (أقصى حجم: 10MB)
          </p>

          {uploadError && (
            <div className={`mt-3 text-sm p-3 rounded-lg flex items-center gap-2 ${
              darkMode 
                ? 'bg-red-900/50 text-red-300 border border-red-700' 
                : 'bg-red-50 text-red-600 border border-red-200'
            }`}>
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{uploadError}</span>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {/* معاينة الصورة */}
          <div className="relative group">
            {value.startsWith('data:') ? (
              // للصور المحلية أو Base64
              <img 
                src={value} 
                alt="صورة بارزة" 
                className="w-full h-48 object-cover rounded-xl"
                onLoad={handleImageLoad}
                onError={handleImageError}
              />
            ) : (
              // للصور من S3 أو روابط خارجية
              <Image 
                src={value} 
                alt="صورة بارزة" 
                width={300} 
                height={200}
                className="w-full h-48 object-cover rounded-xl"
                onLoad={handleImageLoad}
                onError={handleImageError}
                priority
              />
            )}
            
            {/* حالة التحميل */}
            {!imageLoaded && (
              <div className="absolute inset-0 bg-gray-200 dark:bg-gray-700 rounded-xl flex items-center justify-center">
                <Loader className="w-8 h-8 animate-spin text-gray-400" />
              </div>
            )}
            
            {/* مؤشر نجاح التحميل */}
            {imageLoaded && (
              <div className="absolute top-2 right-2 bg-green-500 text-white p-1 rounded-full">
                <CheckCircle className="w-4 h-4" />
              </div>
            )}
            
            {/* أزرار التحكم */}
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={handleUploadClick}
                disabled={uploading}
                className="p-2 bg-white/90 hover:bg-white text-gray-700 rounded-lg transition-colors"
                title="تغيير الصورة"
              >
                {uploading ? (
                  <Loader className="w-5 h-5 animate-spin" />
                ) : (
                  <Upload className="w-5 h-5" />
                )}
              </button>
              
              <button
                type="button"
                onClick={() => setShowUrlInput(true)}
                className="p-2 bg-white/90 hover:bg-white text-gray-700 rounded-lg transition-colors"
                title="تغيير الرابط"
              >
                <Link className="w-5 h-5" />
              </button>
              
              <button
                type="button"
                onClick={handleRemoveImage}
                className="p-2 bg-red-500/90 hover:bg-red-500 text-white rounded-lg transition-colors"
                title="حذف الصورة"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
          
          {/* معلومات الصورة */}
          <div className={`text-xs px-3 py-2 rounded-lg ${
            darkMode ? 'bg-gray-800 text-gray-400' : 'bg-gray-100 text-gray-600'
          }`}>
            <div className="flex items-center justify-between">
              <span>🔗 رابط الصورة:</span>
              <span className="font-mono text-xs truncate max-w-xs" title={value}>
                {value.length > 50 ? `...${value.slice(-47)}` : value}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* نموذج إدخال الرابط */}
      {showUrlInput && (
        <div className={`p-4 rounded-lg border ${
          darkMode 
            ? 'bg-gray-800 border-gray-700' 
            : 'bg-white border-gray-200'
        }`}>
          <div className="space-y-3">
            <label className={`block text-sm font-medium ${
              darkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
              رابط الصورة
            </label>
            <input
              type="url"
              placeholder="https://example.com/image.jpg"
              className={`w-full px-3 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                darkMode 
                  ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-500' 
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
              }`}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleUrlSubmit((e.target as HTMLInputElement).value);
                }
              }}
              autoFocus
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  const input = document.querySelector('input[type="url"]') as HTMLInputElement;
                  handleUrlSubmit(input.value);
                }}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  darkMode 
                    ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                    : 'bg-blue-500 hover:bg-blue-600 text-white'
                }`}
              >
                تأكيد
              </button>
              <button
                type="button"
                onClick={() => setShowUrlInput(false)}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  darkMode 
                    ? 'bg-gray-700 hover:bg-gray-600 text-gray-200' 
                    : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                }`}
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}