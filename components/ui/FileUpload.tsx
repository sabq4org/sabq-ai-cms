'use client';

import React, { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon, Loader2, Check, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FileUploadProps {
  accept?: string;
  maxSize?: string; // e.g., "5MB"
  onUpload: (url: string) => void;
  currentImage?: string;
  darkMode?: boolean;
  className?: string;
}

const FileUpload: React.FC<FileUploadProps> = ({
  accept = "image/*",
  maxSize = "5MB",
  onUpload,
  currentImage,
  darkMode = false,
  className
}) => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(currentImage || null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // تحويل حجم الملف من string إلى bytes
  const parseMaxSize = (sizeStr: string): number => {
    const match = sizeStr.match(/^(\d+)(KB|MB|GB)$/i);
    if (!match) return 5 * 1024 * 1024; // 5MB default
    
    const size = parseInt(match[1]);
    const unit = match[2].toUpperCase();
    
    switch (unit) {
      case 'KB': return size * 1024;
      case 'MB': return size * 1024 * 1024;
      case 'GB': return size * 1024 * 1024 * 1024;
      default: return size;
    }
  };
  
  const maxSizeBytes = parseMaxSize(maxSize);
  
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    setError(null);
    
    // التحقق من نوع الملف
    if (!file.type.startsWith('image/')) {
      setError('يجب أن يكون الملف صورة');
      return;
    }
    
    // التحقق من حجم الملف
    if (file.size > maxSizeBytes) {
      setError(`حجم الملف يجب ألا يتجاوز ${maxSize}`);
      return;
    }
    
    // إنشاء معاينة
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setPreview(result);
    };
    reader.readAsDataURL(file);
    
    // رفع الملف
    uploadFile(file);
  };
  
  const uploadFile = async (file: File) => {
    setUploading(true);
    setError(null);
    
    try {
      // إنشاء FormData للرفع
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', 'article-image');
      
      // رفع الملف إلى الخادم
      const response = await fetch('/api/upload-image', {
        method: 'POST',
        body: formData,
      });
      
      // إذا فشل الـ API الأساسي، جرب الآمن
      if (!response.ok) {
        const errorData = await response.json();
        console.log('❌ [FileUpload] فشل API الأساسي:', errorData);
        
        // جرب الـ API الآمن كـ fallback
        console.log('🔄 [FileUpload] محاولة استخدام API الآمن...');
        try {
          const safeResponse = await fetch('/api/upload-image-safe', {
            method: 'POST',
            body: formData,
          });
          
          if (safeResponse.ok) {
            const safeData = await safeResponse.json();
            if (safeData.success && safeData.url) {
              console.log('✅ [FileUpload] نجح الـ API الآمن:', safeData.url);
              onUpload(safeData.url);
              return;
            }
          }
        } catch (safeError) {
          console.error('❌ [FileUpload] فشل حتى الـ API الآمن:', safeError);
        }
        
        throw new Error(errorData.error || 'فشل في رفع الملف');
      }
      
      const data = await response.json();
      
      if (data.success && data.url) {
        onUpload(data.url);
        console.log('✅ [FileUpload] تم رفع الصورة بنجاح:', data.url);
      } else {
        throw new Error(data.error || 'فشل في رفع الملف');
      }
      
    } catch (error: any) {
      console.error('❌ خطأ في رفع الملف:', error);
      setError(error.message || 'حدث خطأ أثناء رفع الملف');
      setPreview(null);
    } finally {
      setUploading(false);
    }
  };
  
  const handleRemove = () => {
    setPreview(null);
    setError(null);
    onUpload('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  const handleClick = () => {
    if (!uploading) {
      fileInputRef.current?.click();
    }
  };
  
  return (
    <div className={cn('space-y-3', className)}>
      {/* منطقة الرفع */}
      <div
        onClick={handleClick}
        className={cn(
          'relative border-2 border-dashed rounded-xl p-6 transition-all cursor-pointer',
          uploading 
            ? 'cursor-not-allowed opacity-50' 
            : 'hover:border-blue-400 hover:bg-blue-50/50',
          darkMode 
            ? 'border-gray-600 bg-gray-700/50 hover:border-blue-500 hover:bg-blue-900/20' 
            : 'border-gray-300 bg-gray-50 hover:border-blue-400 hover:bg-blue-50',
          error && 'border-red-400 bg-red-50 dark:border-red-600 dark:bg-red-900/20'
        )}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleFileSelect}
          className="hidden"
          disabled={uploading}
        />
        
        <div className="text-center">
          {uploading ? (
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
              <p className={cn('text-sm font-medium', darkMode ? 'text-gray-300' : 'text-gray-700')}>
                جاري رفع الصورة...
              </p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center gap-3">
              <AlertCircle className="w-8 h-8 text-red-500" />
              <p className="text-sm font-medium text-red-600 dark:text-red-400">
                {error}
              </p>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setError(null);
                }}
                className="text-xs text-red-600 dark:text-red-400 hover:underline"
              >
                إعادة المحاولة
              </button>
            </div>
          ) : preview ? (
            <div className="flex flex-col items-center gap-3">
              <Check className="w-8 h-8 text-green-500" />
              <p className={cn('text-sm font-medium', darkMode ? 'text-gray-300' : 'text-gray-700')}>
                تم رفع الصورة بنجاح
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                انقر لتغيير الصورة
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3">
              <Upload className={cn('w-8 h-8', darkMode ? 'text-gray-400' : 'text-gray-500')} />
              <div>
                <p className={cn('text-sm font-medium', darkMode ? 'text-gray-300' : 'text-gray-700')}>
                  انقر لرفع صورة أو اسحبها هنا
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {accept.includes('image') ? 'PNG, JPG, WEBP' : accept} • الحد الأقصى {maxSize}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* معاينة الصورة */}
      {preview && (
        <div className="relative">
          <img
            src={preview}
            alt="معاينة الصورة"
            className="w-full h-32 md:h-40 object-cover rounded-xl border border-gray-200 dark:border-gray-600"
          />
          <button
            onClick={handleRemove}
            className="absolute top-2 left-2 p-1 bg-red-500 hover:bg-red-600 text-white rounded-full transition-colors"
            title="حذف الصورة"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};

export default FileUpload;