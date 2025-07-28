'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

interface ImageUploadS3Props {
  onImageUploaded: (url: string) => void;
  currentImage?: string;
  uploadType?: 'avatar' | 'featured' | 'gallery' | 'team' | 'analysis' | 'categories' | 'general';
  className?: string;
}

export function ImageUploadS3({ 
  onImageUploaded, 
  currentImage, 
  uploadType = 'general',
  className = '' 
}: ImageUploadS3Props) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(currentImage || null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // التحقق من نوع الملف قبل الرفع
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif', 'image/avif'];
    if (!allowedTypes.includes(file.type)) {
      setError('نوع الملف غير مدعوم. يُسمح فقط بـ JPEG, PNG, WebP, GIF, AVIF');
      return;
    }

    // التحقق من حجم الملف
    if (file.size > 5 * 1024 * 1024) {
      setError('حجم الملف كبير جداً. الحد الأقصى 5 ميجابايت');
      return;
    }

    setUploading(true);
    setError(null);
    setUploadProgress(0);

    // إنشاء preview محلي
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', uploadType);

      // محاكاة progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      const response = await fetch('/api/upload-s3', {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      const result = await response.json();

      if (result.success) {
        setPreview(result.url);
        onImageUploaded(result.url);
        console.log('✅ تم رفع الصورة بنجاح إلى S3:', result.url);
      } else {
        throw new Error(result.error || 'فشل في رفع الصورة');
      }
    } catch (error) {
      console.error('Upload error:', error);
      setError(error instanceof Error ? error.message : 'حدث خطأ أثناء رفع الصورة');
      setPreview(currentImage || null);
    } finally {
      setUploading(false);
      setTimeout(() => setUploadProgress(0), 1000);
    }
  };

  const handleRemoveImage = () => {
    setPreview(null);
    onImageUploaded('');
    setError(null);
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex flex-col items-center justify-center w-full">
        
        {/* منطقة الرفع */}
        <label htmlFor="image-upload" className="cursor-pointer w-full">
          <div className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
            {preview ? (
              <div className="relative w-full h-full">
                <Image
                  src={preview}
                  alt="Preview"
                  fill
                  className="object-cover rounded-lg"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
                {/* زر الحذف */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    handleRemoveImage();
                  }}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <svg className="w-8 h-8 mb-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <p className="mb-2 text-sm text-gray-500">
                  <span className="font-semibold">اضغط لرفع الصورة إلى Amazon S3</span>
                </p>
                <p className="text-xs text-gray-500">PNG, JPG, WebP, GIF (MAX. 5MB)</p>
              </div>
            )}
          </div>
        </label>

        <input
          id="image-upload"
          type="file"
          className="hidden"
          onChange={handleFileChange}
          accept="image/jpeg,image/jpg,image/png,image/webp,image/gif,image/avif"
          disabled={uploading}
        />

        {/* شريط التقدم */}
        {uploading && (
          <div className="w-full mt-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">جاري رفع الصورة إلى S3...</span>
              <span className="text-sm text-gray-600">{uploadProgress}%</span>
            </div>
            <Progress value={uploadProgress} className="w-full" />
          </div>
        )}

        {/* رسالة الخطأ */}
        {error && (
          <div className="w-full mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* معلومات إضافية */}
        <div className="mt-4 text-center">
          <p className="text-xs text-gray-500">
            🔒 الصور يتم رفعها إلى Amazon S3 بشكل آمن
          </p>
          <p className="text-xs text-gray-400 mt-1">
            نوع الرفع: {uploadType} | الحد الأقصى: 5MB
          </p>
        </div>
      </div>
    </div>
  );
}
