'use client';

import React, { useState, useRef } from 'react';
import { uploadToCloudinary, getImageUrl } from '@/lib/image-utils';
import CloudImage from './CloudImage';
import { Upload, X, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface ImageUploaderProps {
  onUpload: (url: string) => void;
  onError?: (error: string) => void;
  maxSize?: number; // بالميجابايت
  acceptedFormats?: string[];
  className?: string;
  placeholder?: string;
}

export default function ImageUploader({
  onUpload,
  onError,
  maxSize = 5,
  acceptedFormats = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  className = '',
  placeholder = 'اسحب الصورة هنا أو انقر للاختيار'
}: ImageUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    // التحقق من نوع الملف
    if (!acceptedFormats.includes(file.type)) {
      const error = `نوع الملف غير مدعوم. الأنواع المدعومة: ${acceptedFormats.join(', ')}`;
      toast.error(error);
      onError?.(error);
      return;
    }

    // التحقق من حجم الملف
    const maxSizeBytes = maxSize * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      const error = `حجم الملف كبير جداً. الحد الأقصى: ${maxSize} ميجابايت`;
      toast.error(error);
      onError?.(error);
      return;
    }

    try {
      setIsUploading(true);
      const url = await uploadToCloudinary(file);
      setUploadedUrl(url);
      onUpload(url);
      toast.success('تم رفع الصورة بنجاح');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'فشل رفع الصورة';
      toast.error(errorMessage);
      onError?.(errorMessage);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const clearUpload = () => {
    setUploadedUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className={className}>
      {!uploadedUrl ? (
        <div
          className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-all ${
            dragActive
              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
              : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
          } ${isUploading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          onDragOver={(e) => {
            e.preventDefault();
            setDragActive(true);
          }}
          onDragLeave={() => setDragActive(false)}
          onDrop={handleDrop}
          onClick={() => !isUploading && fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept={acceptedFormats.join(',')}
            onChange={handleChange}
            className="hidden"
            disabled={isUploading}
          />

          <div className="flex flex-col items-center justify-center">
            {isUploading ? (
              <>
                <Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-4" />
                <p className="text-gray-600 dark:text-gray-400">جاري رفع الصورة...</p>
              </>
            ) : (
              <>
                <Upload className="w-12 h-12 text-gray-400 mb-4" />
                <p className="text-gray-600 dark:text-gray-400 mb-2">{placeholder}</p>
                <p className="text-sm text-gray-500 dark:text-gray-500">
                  الحد الأقصى: {maxSize} ميجابايت
                </p>
              </>
            )}
          </div>
        </div>
      ) : (
        <div className="relative">
          <div className="relative rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
            <CloudImage
              src={uploadedUrl}
              alt="الصورة المرفوعة"
              width={400}
              height={300}
              className="w-full h-48"
            />
            <button
              onClick={clearUpload}
              className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
              title="حذف الصورة"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="mt-2 flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
            <CheckCircle className="w-4 h-4" />
            <span>تم رفع الصورة بنجاح</span>
          </div>
        </div>
      )}
    </div>
  );
}

// مكون لرفع صور متعددة
export function MultiImageUploader({
  onUpload,
  maxImages = 5,
  ...props
}: ImageUploaderProps & { maxImages?: number }) {
  const [uploadedUrls, setUploadedUrls] = useState<string[]>([]);

  const handleUpload = (url: string) => {
    if (uploadedUrls.length < maxImages) {
      const newUrls = [...uploadedUrls, url];
      setUploadedUrls(newUrls);
      onUpload(url);
    }
  };

  const removeImage = (index: number) => {
    const newUrls = uploadedUrls.filter((_, i) => i !== index);
    setUploadedUrls(newUrls);
  };

  return (
    <div>
      {uploadedUrls.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
          {uploadedUrls.map((url, index) => (
            <div key={index} className="relative">
              <CloudImage
                src={url}
                alt={`صورة ${index + 1}`}
                width={200}
                height={150}
                className="w-full h-32 rounded-lg"
              />
              <button
                onClick={() => removeImage(index)}
                className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {uploadedUrls.length < maxImages && (
        <ImageUploader
          {...props}
          onUpload={handleUpload}
          placeholder={`اسحب الصورة هنا أو انقر للاختيار (${uploadedUrls.length}/${maxImages})`}
        />
      )}

      {uploadedUrls.length >= maxImages && (
        <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
          <AlertCircle className="w-6 h-6 text-yellow-600 dark:text-yellow-400 mx-auto mb-2" />
          <p className="text-sm text-yellow-700 dark:text-yellow-300">
            وصلت للحد الأقصى من الصور ({maxImages})
          </p>
        </div>
      )}
    </div>
  );
} 