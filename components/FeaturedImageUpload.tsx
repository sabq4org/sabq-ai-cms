'use client';

import Image from 'next/image';
import React, { useState, useRef } from 'react';
import { Upload, Image as ImageIcon, X, Link, Loader } from 'lucide-react';
import { getDefaultImageUrl } from '@/lib/cloudinary';

interface FeaturedImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  darkMode?: boolean;
}

export default function FeaturedImageUpload({ value, onChange, darkMode = false }: FeaturedImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUploadClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    console.log('🖱️ تم النقر على زر رفع الصورة');
    console.log('📂 fileInputRef.current:', fileInputRef.current);
    
    if (fileInputRef.current) {
      console.log('✅ fileInputRef موجود، محاولة فتح حوار الملف...');
      try {
        // استخدام setTimeout لضمان تنفيذ click بعد انتهاء event bubbling
        setTimeout(() => {
          if (fileInputRef.current) {
            fileInputRef.current.click();
            console.log('📁 تم استدعاء click() بنجاح');
          }
        }, 10);
      } catch (error) {
        console.error('❌ خطأ في استدعاء click():', error);
      }
    } else {
      console.error('❌ fileInputRef.current غير موجود!');
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log('📁 تم تحديد ملف:', e.target.files);
    const file = e.target.files?.[0];
    if (!file) return;

    console.log('📋 معلومات الملف:', { name: file.name, size: file.size, type: file.type });
    
    // التحقق من نوع الملف
    if (!file.type.startsWith('image/')) {
      setUploadError('يرجى اختيار ملف صورة صالح');
      return;
    }

    // التحقق من حجم الملف (5MB كحد أقصى)
    if (file.size > 5 * 1024 * 1024) {
      setUploadError('حجم الصورة يجب أن يكون أقل من 5MB');
      return;
    }

    setUploading(true);
    setUploadError(null);

    try {
      console.log('📤 بدء رفع الصورة...');
      // إنشاء FormData
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', 'featured');

      // رفع الصورة إلى API
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });

      console.log('🌐 استجابة الخادم:', response.status, response.statusText);

      if (!response.ok) {
        throw new Error('فشل رفع الصورة');
      }

      const data = await response.json();
      console.log('📊 بيانات الاستجابة:', data);
      
      // تحديث قيمة URL - إصلاح الوصول إلى البيانات الصحيحة
      if (data.success && data.url) {
        console.log('✅ تم الرفع بنجاح، URL:', data.url);
        onChange(data.url);
      } else {
        throw new Error(data.error || 'فشل في الحصول على رابط الصورة');
      }
      
    } catch (error) {
      console.error('❌ خطأ في رفع الصورة:', error);
      const errorMessage = error instanceof Error ? error.message : 'حدث خطأ أثناء رفع الصورة. يرجى المحاولة مرة أخرى.';
      setUploadError(errorMessage);
    } finally {
      setUploading(false);
    }
  };

  const handleUrlSubmit = (url: string) => {
    if (url.trim()) {
      onChange(url.trim());
      setShowUrlInput(false);
    }
  };

  const handleRemoveImage = () => {
    onChange('');
    setShowUrlInput(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
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
            JPG, PNG, GIF, WebP, AVIF, SVG (أقصى حجم: 5MB)
          </p>

          {uploadError && (
            <div className={`mt-3 text-sm p-2 rounded ${
              darkMode 
                ? 'bg-red-900/50 text-red-300' 
                : 'bg-red-50 text-red-600'
            }`}>
              {uploadError}
            </div>
          )}
        </div>
      ) : (
        <div className="relative group">
          <Image 
            src={value || "/placeholder.jpg"} 
            alt="صورة بارزة" 
            width={300} 
            height={200}
            className="w-full h-48 object-cover rounded-xl"
            onError={(e) => {
              console.error('خطأ في تحميل الصورة:', {
                src: e.currentTarget.src,
                alt: e.currentTarget.alt
              });
              // استخدام صورة افتراضية من Cloudinary
              e.currentTarget.src = getDefaultImageUrl('article');
            }}
          />
          
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
      )}

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