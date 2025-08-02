import React, { useState, useRef } from 'react';
import { Upload, X, Loader2, Image as ImageIcon, AlertCircle, CheckCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface ImageUploadProps {
  onImageUploaded: (imageUrl: string) => void;
  currentImage?: string;
  type?: 'avatar' | 'featured' | 'gallery' | 'general';
  className?: string;
  label?: string;
  accept?: string;
  maxSize?: number; // في MB
}

export function ImageUploadComponent({ 
  onImageUploaded, 
  currentImage, 
  type = 'general',
  className = '',
  label = 'رفع صورة',
  accept = 'image/*',
  maxSize = 10 
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (file: File) => {
    try {
      setIsUploading(true);
      setUploadProgress(0);

      // التحقق من نوع الملف
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/jpg'];
      if (!allowedTypes.includes(file.type)) {
        toast.error('نوع الملف غير مدعوم. يرجى رفع صورة (JPEG, PNG, GIF, WebP)');
        return;
      }

      // التحقق من حجم الملف
      const fileSizeInMB = file.size / (1024 * 1024);
      if (fileSizeInMB > maxSize) {
        toast.error(`حجم الملف كبير جداً. الحد الأقصى ${maxSize} ميجابايت`);
        return;
      }

      // إنشاء FormData
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', type);

      console.log('🚀 بدء رفع الصورة...', { 
        fileName: file.name, 
        fileSize: fileSizeInMB.toFixed(2) + 'MB',
        type 
      });

      // محاكاة تقدم الرفع
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + Math.random() * 15;
        });
      }, 200);

      // رفع الصورة باستخدام API مع fallback آمن
      let response;
      try {
        response = await fetch('/api/upload-image', {
          method: 'POST',
          body: formData,
        });
      } catch (primaryError) {
        console.log('🔄 [ImageUpload] الانتقال للـ API الآمن بسبب خطأ في الأساسي');
        response = await fetch('/api/upload-image-safe', {
          method: 'POST',
          body: formData,
        });
      }

      clearInterval(progressInterval);
      setUploadProgress(100);

      // إذا فشل الـ API الأساسي، جرب الآمن
      if (!response.ok) {
        const errorData = await response.json();
        console.log('❌ [ImageUpload] فشل API الأساسي:', errorData);
        
        // جرب الـ API الآمن كـ fallback
        console.log('🔄 [ImageUpload] محاولة استخدام API الآمن...');
        try {
          const safeResponse = await fetch('/api/upload-image-safe', {
            method: 'POST',
            body: formData,
          });
          
          if (safeResponse.ok) {
            const safeData = await safeResponse.json();
            if (safeData.success && safeData.url) {
              console.log('✅ [ImageUpload] نجح الـ API الآمن:', safeData.url);
              toast.success('تم رفع الصورة بنجاح (نمط آمن)');
              onImageUploaded(safeData.url);
              return;
            }
          }
        } catch (safeError) {
          console.error('❌ [ImageUpload] فشل حتى الـ API الآمن:', safeError);
        }
        
        throw new Error(errorData.error || 'فشل في رفع الصورة');
      }

      const data = await response.json();
      
      if (data.success && data.url) {
        console.log('✅ [ImageUpload] تم رفع الصورة بنجاح:', data.url);
        toast.success('تم رفع الصورة بنجاح');
        onImageUploaded(data.url);
      } else {
        throw new Error(data.error || 'فشل في رفع الصورة');
      }

    } catch (error: any) {
      console.error('❌ خطأ في رفع الصورة:', error);
      toast.error(error.message || 'فشل في رفع الصورة');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    setDragActive(false);
    
    const file = event.dataTransfer.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = () => {
    setDragActive(false);
  };

  const removeImage = () => {
    onImageUploaded('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
        </label>
      )}

      {/* منطقة الرفع */}
      <div
        className={`relative border-2 border-dashed rounded-lg p-6 transition-all duration-200 ${
          dragActive 
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
            : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
        } ${isUploading ? 'pointer-events-none' : 'cursor-pointer'}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => !isUploading && fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleFileSelect}
          className="hidden"
          disabled={isUploading}
        />

        {isUploading ? (
          <div className="text-center">
            <Loader2 className="mx-auto h-8 w-8 animate-spin text-blue-500 mb-2" />
            <p className="text-sm text-gray-600 dark:text-gray-400">جاري رفع الصورة...</p>
            {uploadProgress > 0 && (
              <div className="mt-2">
                <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">{Math.round(uploadProgress)}%</p>
              </div>
            )}
          </div>
        ) : currentImage ? (
          <div className="text-center">
            <div className="relative inline-block">
              <img
                src={currentImage}
                alt="صورة مرفوعة"
                className="max-h-32 rounded-lg shadow-sm"
              />
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removeImage();
                }}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
            <p className="text-sm text-green-600 dark:text-green-400 mt-2 flex items-center justify-center">
              <CheckCircle className="h-4 w-4 mr-1" />
              تم رفع الصورة بنجاح
            </p>
            <p className="text-xs text-gray-500 mt-1">انقر لتغيير الصورة</p>
          </div>
        ) : (
          <div className="text-center">
            <ImageIcon className="mx-auto h-8 w-8 text-gray-400 mb-2" />
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
              اسحب وأفلت الصورة هنا أو انقر للاختيار
            </p>
            <p className="text-xs text-gray-500">
              JPEG, PNG, GIF, WebP - حتى {maxSize} ميجابايت
            </p>
          </div>
        )}
      </div>

      {/* رسائل إضافية */}
      {type === 'featured' && (
        <div className="flex items-start space-x-2 text-xs text-amber-600 dark:text-amber-400">
          <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
          <span>الصورة المميزة ستظهر في صفحة المقال الرئيسية والصفحة الأولى</span>
        </div>
      )}
    </div>
  );
}

export default ImageUploadComponent;
