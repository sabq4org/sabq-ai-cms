'use client';

import { useState, useRef, useCallback } from 'react';
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import Image from 'next/image';

interface CloudinaryImageUploadProps {
  type?: 'articles' | 'categories' | 'avatars' | 'featured' | 'gallery' | 'team' | 'analysis' | 'daily-doses' | 'opinions' | 'audio' | 'general';
  onUploadComplete?: (url: string, data: any) => void;
  onUploadError?: (error: string) => void;
  maxSize?: number; // بالـ MB
  accept?: string;
  className?: string;
  placeholder?: string;
  existingImage?: string;
  showPreview?: boolean;
  generateThumbnail?: boolean;
  disabled?: boolean;
}

export default function CloudinaryImageUpload({
  type = 'general',
  onUploadComplete,
  onUploadError,
  maxSize = 10,
  accept = 'image/jpeg,image/jpg,image/png,image/webp,image/gif',
  className = '',
  placeholder = 'اسحب الصورة هنا أو انقر للاختيار',
  existingImage,
  showPreview = true,
  generateThumbnail = false,
  disabled = false
}: CloudinaryImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(existingImage || null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // معالجة اختيار الملف
  const handleFileSelect = useCallback(async (file: File) => {
    // التحقق من الحجم
    if (file.size > maxSize * 1024 * 1024) {
      const error = `حجم الملف يجب أن يكون أقل من ${maxSize}MB`;
      toast.error(error);
      onUploadError?.(error);
      return;
    }

    // التحقق من النوع
    if (!file.type.startsWith('image/')) {
      const error = 'يجب أن يكون الملف صورة';
      toast.error(error);
      onUploadError?.(error);
      return;
    }

    // عرض المعاينة
    if (showPreview) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }

    // رفع الصورة
    await uploadImage(file);
  }, [maxSize, showPreview, type, generateThumbnail, onUploadComplete, onUploadError]);

  // رفع الصورة إلى Cloudinary
  const uploadImage = async (file: File) => {
    setIsUploading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', type);
      if (generateThumbnail) {
        formData.append('generateThumbnail', 'true');
      }

      // محاكاة تقدم الرفع
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      const response = await fetch('/api/upload/cloudinary', {
        method: 'POST',
        body: formData
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'فشل في رفع الصورة');
      }

      // نجح الرفع
      toast.success('تم رفع الصورة بنجاح');
      onUploadComplete?.(data.url, data);

      // إعادة تعيين الحالة
      setTimeout(() => {
        setUploadProgress(0);
      }, 500);

    } catch (error) {
      console.error('❌ خطأ في رفع الصورة:', error);
      const errorMessage = error instanceof Error ? error.message : 'حدث خطأ في رفع الصورة';
      toast.error(errorMessage);
      onUploadError?.(errorMessage);
      setPreview(existingImage || null);
      setUploadProgress(0);
    } finally {
      setIsUploading(false);
    }
  };

  // معالجة السحب والإفلات
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    const imageFile = files.find(file => file.type.startsWith('image/'));

    if (imageFile) {
      handleFileSelect(imageFile);
    } else {
      toast.error('يرجى سحب ملف صورة');
    }
  }, [handleFileSelect]);

  // معالجة النقر على منطقة الرفع
  const handleClick = () => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // معالجة تغيير الملف
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  // إزالة الصورة
  const handleRemove = () => {
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onUploadComplete?.('', null);
  };

  return (
    <div className={`relative ${className}`}>
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileChange}
        className="hidden"
        disabled={disabled || isUploading}
      />

      <div
        onClick={handleClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          relative border-2 border-dashed rounded-lg p-6 text-center cursor-pointer
          transition-all duration-200
          ${isDragging ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-300 dark:border-gray-600'}
          ${disabled || isUploading ? 'opacity-50 cursor-not-allowed' : 'hover:border-gray-400 dark:hover:border-gray-500'}
        `}
      >
        {preview ? (
          <div className="relative">
            <Image
              src={preview}
              alt="معاينة الصورة"
              width={200}
              height={150}
              className="mx-auto rounded-lg object-cover"
            />
            {!isUploading && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemove();
                }}
                className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                disabled={disabled}
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            {isUploading ? (
              <Loader2 className="w-10 h-10 mx-auto text-blue-500 animate-spin" />
            ) : (
              <Upload className="w-10 h-10 mx-auto text-gray-400" />
            )}
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {isUploading ? 'جاري الرفع...' : placeholder}
            </p>
            {!isUploading && (
              <p className="text-xs text-gray-500 dark:text-gray-500">
                الحد الأقصى: {maxSize}MB
              </p>
            )}
          </div>
        )}

        {/* شريط التقدم */}
        {isUploading && uploadProgress > 0 && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-200 dark:bg-gray-700 rounded-b-lg overflow-hidden">
            <div
              className="h-full bg-blue-500 transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        )}
      </div>
    </div>
  );
} 