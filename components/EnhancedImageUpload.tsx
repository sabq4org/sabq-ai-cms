'use client';

import Image from 'next/image';
import React, { useState, useRef } from 'react';
import { Upload, Image as ImageIcon, X, Link, Loader, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

interface EnhancedImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  darkMode?: boolean;
  type?: 'featured' | 'avatar' | 'general';
}

export default function EnhancedImageUpload({ 
  value, 
  onChange, 
  darkMode = false,
  type = 'featured'
}: EnhancedImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [urlInput, setUrlInput] = useState('');
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
      type: file.type,
      lastModified: new Date(file.lastModified).toISOString()
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
    setDebugInfo(null);
    
    // عرض toast للتحميل
    const uploadToast = toast.loading('🔄 جاري رفع الصورة...', {
      duration: 60000 // دقيقة واحدة للتحميل
    });

    try {
      console.log('📤 بدء رفع الصورة...');
      
      // إنشاء FormData
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', type);

      console.log('🌐 إرسال طلب الرفع...');
      
      // محاولة استخدام API المحسّن أولاً
      const response = await fetch('/api/upload-enhanced', {
        method: 'POST',
        body: formData
      });

      console.log('📡 استجابة الخادم:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok
      });

      const data = await response.json();
      console.log('📊 بيانات الاستجابة:', data);
      
      // حفظ معلومات التشخيص
      setDebugInfo({
        timestamp: new Date().toISOString(),
        fileInfo: {
          name: file.name,
          size: file.size,
          type: file.type
        },
        response: {
          status: response.status,
          success: data.success,
          debug: data.debug,
          is_placeholder: data.is_placeholder
        }
      });
      
      // التحقق من نجاح العملية والحصول على URL
      if (data.success && data.url) {
        console.log('✅ تم الرفع بنجاح، URL:', data.url);
        
        // تحديث الحالة
        onChange(data.url);
        setImageLoaded(false); // إعادة تعيين حالة التحميل
        
        // رسالة نجاح مختلفة حسب النوع
        if (data.is_placeholder) {
          toast.error('⚠️ تم استخدام صورة مؤقتة - تحقق من إعدادات Cloudinary', { 
            id: uploadToast,
            duration: 5000 
          });
        } else {
          toast.success('✅ تم رفع الصورة بنجاح!', { 
            id: uploadToast,
            duration: 3000 
          });
        }
        
        console.log('📸 تم حفظ رابط الصورة:', data.url);
      } else {
        throw new Error(data.error || 'فشل في الحصول على رابط الصورة');
      }
      
    } catch (error) {
      console.error('❌ خطأ في رفع الصورة:', error);
      const errorMessage = error instanceof Error ? error.message : 'حدث خطأ أثناء رفع الصورة';
      setUploadError(errorMessage);
      
      // محاولة fallback مع API القديم
      try {
        console.log('🔄 محاولة استخدام API القديم...');
        
        const fallbackFormData = new FormData();
        fallbackFormData.append('file', file);
        fallbackFormData.append('type', type);

        const fallbackResponse = await fetch('/api/upload', {
          method: 'POST',
          body: fallbackFormData
        });

        if (fallbackResponse.ok) {
          const fallbackData = await fallbackResponse.json();
          if (fallbackData.success && fallbackData.url) {
            onChange(fallbackData.url);
            toast.success('✅ تم الرفع باستخدام النظام البديل', { 
              id: uploadToast,
              duration: 3000 
            });
            return;
          }
        }
      } catch (fallbackError) {
        console.error('❌ فشل النظام البديل أيضاً:', fallbackError);
      }
      
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

  const handleUrlSubmit = () => {
    if (urlInput.trim()) {
      console.log('🔗 إدخال رابط صورة:', urlInput.trim());
      onChange(urlInput.trim());
      setShowUrlInput(false);
      setUrlInput('');
      setImageLoaded(false);
      toast.success('✅ تم حفظ رابط الصورة');
    }
  };

  const handleRemoveImage = () => {
    console.log('🗑️ حذف الصورة');
    onChange('');
    setImageLoaded(false);
    setUploadError(null);
    setDebugInfo(null);
    toast.success('تم حذف الصورة');
  };

  const handleImageLoad = () => {
    console.log('🖼️ تم تحميل الصورة بنجاح');
    setImageLoaded(true);
  };

  const handleImageError = () => {
    console.error('❌ فشل في تحميل الصورة');
    setImageLoaded(false);
    setUploadError('فشل في عرض الصورة');
  };

  const retryUpload = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const isPlaceholder = value.includes('placeholder');

  return (
    <div className={`space-y-4 p-4 rounded-xl border transition-all ${
      darkMode 
        ? 'bg-gray-800 border-gray-700' 
        : 'bg-white border-gray-200'
    }`}>
      <div className="flex items-center justify-between">
        <h3 className={`text-lg font-semibold ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>
          الصورة البارزة
        </h3>
        {isPlaceholder && (
          <Badge variant="destructive" className="text-xs">
            صورة مؤقتة
          </Badge>
        )}
      </div>

      {/* مدخل الملف المخفي */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept="image/*"
        className="hidden"
        disabled={uploading}
      />

      {!value ? (
        <div className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
          darkMode 
            ? 'border-gray-600 bg-gray-700/50' 
            : 'border-gray-300 bg-gray-50'
        }`}>
          <ImageIcon className={`w-12 h-12 mx-auto mb-4 ${
            darkMode ? 'text-gray-500' : 'text-gray-400'
          }`} />
          
          <div className="space-y-4">
            <button
              type="button"
              onClick={handleUploadClick}
              disabled={uploading}
              className={`mx-auto flex items-center gap-2 px-6 py-3 rounded-xl transition-colors ${
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
                  <Loader className="w-5 h-5 animate-spin" />
                  <span>جارٍ الرفع...</span>
                </>
              ) : (
                <>
                  <Upload className="w-5 h-5" />
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

          <p className={`text-xs mt-4 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
            JPG, PNG, GIF, WebP (أقصى حجم: 10MB)
          </p>

          {uploadError && (
            <div className={`mt-4 text-sm p-3 rounded-lg flex items-center gap-2 ${
              darkMode 
                ? 'bg-red-900/50 text-red-300 border border-red-700' 
                : 'bg-red-50 text-red-600 border border-red-200'
            }`}>
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{uploadError}</span>
              <button
                onClick={retryUpload}
                className="mr-auto text-xs underline hover:no-underline"
              >
                إعادة المحاولة
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {/* معاينة الصورة */}
          <div className="relative group">
            <Image 
              src={value} 
              alt="صورة بارزة" 
              width={400} 
              height={250}
              className="w-full h-64 object-cover rounded-xl"
              onLoad={handleImageLoad}
              onError={handleImageError}
              priority
            />
            
            {/* تحذير للصورة المؤقتة */}
            {isPlaceholder && (
              <div className="absolute top-3 left-3 bg-orange-500 text-white px-2 py-1 rounded-lg text-xs flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                صورة مؤقتة
              </div>
            )}
            
            {/* حالة التحميل */}
            {!imageLoaded && (
              <div className="absolute inset-0 bg-gray-200 dark:bg-gray-700 rounded-xl flex items-center justify-center">
                <Loader className="w-8 h-8 animate-spin text-gray-400" />
              </div>
            )}
            
            {/* مؤشر نجاح التحميل */}
            {imageLoaded && !isPlaceholder && (
              <div className="absolute top-3 right-3 bg-green-500 text-white p-1 rounded-full">
                <CheckCircle className="w-4 h-4" />
              </div>
            )}
            
            {/* أزرار التحكم */}
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={handleUploadClick}
                disabled={uploading}
                className="p-3 bg-white/90 hover:bg-white text-gray-700 rounded-lg transition-colors"
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
                className="p-3 bg-white/90 hover:bg-white text-gray-700 rounded-lg transition-colors"
                title="تغيير الرابط"
              >
                <Link className="w-5 h-5" />
              </button>
              
              {isPlaceholder && (
                <button
                  type="button"
                  onClick={retryUpload}
                  className="p-3 bg-orange-500/90 hover:bg-orange-500 text-white rounded-lg transition-colors"
                  title="رفع صورة حقيقية"
                >
                  <RefreshCw className="w-5 h-5" />
                </button>
              )}
              
              <button
                type="button"
                onClick={handleRemoveImage}
                className="p-3 bg-red-500/90 hover:bg-red-500 text-white rounded-lg transition-colors"
                title="حذف الصورة"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
          
          {/* معلومات الصورة */}
          <div className={`text-xs p-3 rounded-lg ${
            darkMode ? 'bg-gray-800 text-gray-400' : 'bg-gray-100 text-gray-600'
          }`}>
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span>🔗 رابط الصورة:</span>
              </div>
              <div className="font-mono text-xs break-all opacity-75">
                {value}
              </div>
              {isPlaceholder && (
                <div className="text-orange-500 text-xs mt-2">
                  ⚠️ هذه صورة مؤقتة - لن تظهر في الموقع الحقيقي
                </div>
              )}
            </div>
          </div>
          
          {/* معلومات التشخيص */}
          {debugInfo && (
            <details className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
              <summary className="cursor-pointer hover:text-blue-500">
                معلومات التشخيص (للمطورين)
              </summary>
              <pre className="mt-2 p-2 bg-gray-100 dark:bg-gray-800 rounded text-xs overflow-auto">
                {JSON.stringify(debugInfo, null, 2)}
              </pre>
            </details>
          )}
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
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="https://example.com/image.jpg"
              className={`w-full px-3 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                darkMode 
                  ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-500' 
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
              }`}
              onKeyPress={(e) => e.key === 'Enter' && handleUrlSubmit()}
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleUrlSubmit}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                حفظ
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowUrlInput(false);
                  setUrlInput('');
                }}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  darkMode 
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
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
