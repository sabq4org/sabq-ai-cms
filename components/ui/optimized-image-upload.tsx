/**
 * مكون رفع الصور المحسن
 * Optimized Image Upload Component
 */

'use client';

import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { AlertCircle, Camera, CheckCircle, Upload, X } from 'lucide-react';
import React, { useCallback, useRef, useState } from 'react';
import toast from 'react-hot-toast';

interface OptimizedImageUploadProps {
  onImageUpload?: (imageUrl: string) => void;
  maxSize?: number; // بالميجابايت
  acceptedTypes?: string[];
  className?: string;
  disabled?: boolean;
}

interface UploadState {
  uploading: boolean;
  progress: number;
  error: string | null;
  success: boolean;
}

const OptimizedImageUpload: React.FC<OptimizedImageUploadProps> = ({
  onImageUpload,
  maxSize = 5, // 5MB default
  acceptedTypes = ['image/jpeg', 'image/png', 'image/webp'],
  className,
  disabled = false
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadState, setUploadState] = useState<UploadState>({
    uploading: false,
    progress: 0,
    error: null,
    success: false
  });
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // دالة ضغط الصورة
  const compressImage = useCallback((file: File, quality: number = 0.8): Promise<File> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        // تحديد الأبعاد الجديدة
        const maxWidth = 1920;
        const maxHeight = 1080;
        let { width, height } = img;

        if (width > height) {
          if (width > maxWidth) {
            height = height * (maxWidth / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = width * (maxHeight / height);
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;

        // رسم الصورة
        ctx?.drawImage(img, 0, 0, width, height);

        // تحويل لـ blob
        canvas.toBlob((blob) => {
          if (blob) {
            const compressedFile = new File([blob], file.name, {
              type: 'image/jpeg',
              lastModified: Date.now(),
            });
            resolve(compressedFile);
          } else {
            resolve(file);
          }
        }, 'image/jpeg', quality);
      };

      img.src = URL.createObjectURL(file);
    });
  }, []);

  // التحقق من الملف
  const validateFile = useCallback((file: File): string | null => {
    // التحقق من النوع
    if (!acceptedTypes.includes(file.type)) {
      return `نوع الملف غير مدعوم. الأنواع المدعومة: ${acceptedTypes.map(t => t.split('/')[1]).join(', ')}`;
    }

    // التحقق من الحجم
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > maxSize) {
      return `حجم الملف كبير جداً (${fileSizeMB.toFixed(1)}MB). الحد الأقصى ${maxSize}MB`;
    }

    return null;
  }, [acceptedTypes, maxSize]);

  // رفع الملف
  const uploadFile = useCallback(async (file: File) => {
    setUploadState({
      uploading: true,
      progress: 0,
      error: null,
      success: false
    });

    try {
      // ضغط الصورة إذا كانت كبيرة
      let finalFile = file;
      const fileSizeMB = file.size / (1024 * 1024);

      if (fileSizeMB > 2) { // ضغط الملفات أكبر من 2MB
        toast.loading('جاري ضغط الصورة...', { id: 'compress' });
        finalFile = await compressImage(file, 0.8);
        toast.dismiss('compress');

        const compressedSizeMB = finalFile.size / (1024 * 1024);
        console.log(`📉 تم ضغط الصورة من ${fileSizeMB.toFixed(1)}MB إلى ${compressedSizeMB.toFixed(1)}MB`);
      }

      // إنشاء FormData
      const formData = new FormData();
      formData.append('file', finalFile);

      // محاكاة التقدم
      const progressInterval = setInterval(() => {
        setUploadState(prev => ({
          ...prev,
          progress: Math.min(prev.progress + 10, 90)
        }));
      }, 200);

      // رفع الملف
      const response = await fetch('/api/upload-optimized', {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `HTTP ${response.status}`);
      }

      if (data.success) {
        setUploadState({
          uploading: false,
          progress: 100,
          error: null,
          success: true
        });

        setPreviewUrl(data.url);
        onImageUpload?.(data.url);
        toast.success('تم رفع الصورة بنجاح');
      } else {
        throw new Error(data.error || 'فشل رفع الصورة');
      }

    } catch (error) {
      console.error('❌ خطأ في رفع الصورة:', error);

      let errorMessage = 'حدث خطأ أثناء رفع الصورة';

      if (error instanceof Error) {
        if (error.message.includes('413') || error.message.includes('Too Large')) {
          errorMessage = 'حجم الملف كبير جداً. يرجى اختيار صورة أصغر';
        } else if (error.message.includes('NetworkError')) {
          errorMessage = 'مشكلة في الاتصال. يرجى المحاولة مرة أخرى';
        } else {
          errorMessage = error.message;
        }
      }

      setUploadState({
        uploading: false,
        progress: 0,
        error: errorMessage,
        success: false
      });

      toast.error(errorMessage);
    }
  }, [compressImage, onImageUpload]);

  // معالج تغيير الملف
  const handleFileChange = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];

    // التحقق من الملف
    const validationError = validateFile(file);
    if (validationError) {
      toast.error(validationError);
      return;
    }

    // رفع الملف
    await uploadFile(file);

    // إعادة تعيين input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [validateFile, uploadFile]);

  // فتح منتقي الملفات
  const handleClick = () => {
    if (disabled || uploadState.uploading) return;
    fileInputRef.current?.click();
  };

  // إزالة الصورة
  const handleRemove = () => {
    setPreviewUrl(null);
    setUploadState({
      uploading: false,
      progress: 0,
      error: null,
      success: false
    });
  };

  return (
    <div className={cn("space-y-3", className)}>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept={acceptedTypes.join(',')}
        className="hidden"
        disabled={disabled}
      />

      {/* منطقة الرفع */}
      <div
        onClick={handleClick}
        className={cn(
          "relative border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors",
          "hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/20",
          uploadState.uploading ? "border-blue-500 bg-blue-50 dark:bg-blue-950/20" : "border-gray-300 dark:border-gray-600",
          disabled && "opacity-50 cursor-not-allowed"
        )}
      >
        {uploadState.uploading ? (
          <div className="space-y-3">
            <Upload className="w-8 h-8 mx-auto text-blue-500 animate-pulse" />
            <div>
              <p className="text-sm font-medium text-blue-600 dark:text-blue-400">
                جاري رفع الصورة... {uploadState.progress}%
              </p>
              <Progress value={uploadState.progress} className="mt-2" />
            </div>
          </div>
        ) : previewUrl && uploadState.success ? (
          <div className="space-y-3">
            <div className="relative inline-block">
              <img
                src={previewUrl}
                alt="معاينة"
                className="w-24 h-24 object-cover rounded-lg mx-auto"
              />
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemove();
                }}
                variant="destructive"
                size="sm"
                className="absolute -top-2 -right-2 h-6 w-6 p-0 rounded-full"
              >
                <X className="w-3 h-3" />
              </Button>
            </div>
            <div className="flex items-center justify-center gap-2 text-green-600 dark:text-green-400">
              <CheckCircle className="w-4 h-4" />
              <span className="text-sm font-medium">تم رفع الصورة بنجاح</span>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <Camera className="w-8 h-8 mx-auto text-gray-400" />
            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                اضغط لرفع صورة
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                حد أقصى {maxSize}MB • {acceptedTypes.map(t => t.split('/')[1].toUpperCase()).join(', ')}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* رسالة الخطأ */}
      {uploadState.error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg">
          <AlertCircle className="w-4 h-4 text-red-500" />
          <p className="text-sm text-red-600 dark:text-red-400">{uploadState.error}</p>
        </div>
      )}
    </div>
  );
};

export default OptimizedImageUpload;
