"use client";

import { useState, useCallback } from 'react';
import toast from 'react-hot-toast';

interface UploadOptions {
  folderId?: string;
  altText?: string;
  onProgress?: (progress: number) => void;
  onSuccess?: (result: any) => void;
  onError?: (error: string) => void;
}

interface UseMediaUploadReturn {
  uploading: boolean;
  progress: number;
  error: string | null;
  uploadFile: (file: File, options?: UploadOptions) => Promise<any>;
  uploadFiles: (files: FileList, options?: UploadOptions) => Promise<any[]>;
  reset: () => void;
}

export const useMediaUpload = (): UseMediaUploadReturn => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // تحويل الملف إلى base64
  const fileToBase64 = useCallback((file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  }, []);

  // التحقق من صحة الملف
  const validateFile = useCallback((file: File): string | null => {
    // فحص الحجم (50MB كحد أقصى)
    const maxSize = 50 * 1024 * 1024; // 50MB
    if (file.size > maxSize) {
      return 'حجم الملف يتجاوز 50MB';
    }

    // فحص النوع
    const allowedTypes = [
      'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml',
      'video/mp4', 'video/webm', 'video/quicktime',
      'audio/mp3', 'audio/wav', 'audio/mpeg',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];

    if (!allowedTypes.includes(file.type)) {
      return `نوع الملف غير مدعوم: ${file.type}`;
    }

    return null;
  }, []);

  // رفع ملف واحد
  const uploadFile = useCallback(async (file: File, options: UploadOptions = {}): Promise<any> => {
    const { folderId, altText, onProgress, onSuccess, onError } = options;
    
    try {
      setUploading(true);
      setProgress(0);
      setError(null);

      // التحقق من صحة الملف
      const validationError = validateFile(file);
      if (validationError) {
        throw new Error(validationError);
      }

      onProgress?.(10);
      
      // تحويل إلى base64
      console.log('🔄 تحويل الملف إلى base64...');
      const base64Data = await fileToBase64(file);
      onProgress?.(30);

      // إعداد البيانات
      const uploadData = {
        file: {
          name: file.name,
          type: file.type,
          size: file.size,
          data: base64Data
        },
        folderId: folderId || null,
        altText: altText || `ملف ${file.name}`
      };

      onProgress?.(50);

      console.log('☁️ رفع الملف إلى الخادم...', {
        name: file.name,
        size: file.size,
        type: file.type
      });

      // رفع الملف
      const response = await fetch('/api/admin/media/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(uploadData)
      });

      onProgress?.(80);

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        const errorMessage = errorData?.error || 
                           errorData?.message || 
                           `HTTP ${response.status}: ${response.statusText}`;
        throw new Error(errorMessage);
      }

      const result = await response.json();
      onProgress?.(100);

      console.log('✅ تم رفع الملف بنجاح:', result);

      // استدعاء callback النجاح
      onSuccess?.(result);
      toast.success(`تم رفع "${file.name}" بنجاح!`);

      return result;

    } catch (error: any) {
      console.error('❌ خطأ في رفع الملف:', error);
      
      const errorMessage = error?.message || 'خطأ غير معروف في رفع الملف';
      setError(errorMessage);
      
      // استدعاء callback الخطأ
      onError?.(errorMessage);
      toast.error(`فشل رفع "${file.name}": ${errorMessage}`);
      
      throw error;
    } finally {
      setUploading(false);
      setProgress(0);
    }
  }, [fileToBase64, validateFile]);

  // رفع ملفات متعددة
  const uploadFiles = useCallback(async (files: FileList, options: UploadOptions = {}): Promise<any[]> => {
    const fileArray = Array.from(files);
    const results: any[] = [];
    
    try {
      setUploading(true);
      setError(null);

      for (let i = 0; i < fileArray.length; i++) {
        const file = fileArray[i];
        const fileProgress = ((i + 1) / fileArray.length) * 100;
        
        try {
          const result = await uploadFile(file, {
            ...options,
            onProgress: (progress) => {
              const overallProgress = ((i / fileArray.length) * 100) + (progress / fileArray.length);
              setProgress(Math.round(overallProgress));
              options.onProgress?.(Math.round(overallProgress));
            }
          });
          
          results.push(result);
        } catch (error) {
          console.error(`خطأ في رفع الملف ${file.name}:`, error);
          // متابعة رفع الملفات الأخرى حتى لو فشل أحدها
          results.push({ error: error instanceof Error ? error.message : 'خطأ غير معروف', file: file.name });
        }
      }

      const successCount = results.filter(r => !r.error).length;
      const errorCount = results.filter(r => r.error).length;

      if (successCount > 0) {
        toast.success(`تم رفع ${successCount} ملف بنجاح!`);
      }
      if (errorCount > 0) {
        toast.error(`فشل رفع ${errorCount} ملف`);
      }

      return results;

    } catch (error: any) {
      console.error('❌ خطأ في رفع الملفات:', error);
      const errorMessage = error?.message || 'خطأ غير معروف في رفع الملفات';
      setError(errorMessage);
      toast.error(`فشل رفع الملفات: ${errorMessage}`);
      throw error;
    } finally {
      setUploading(false);
      setProgress(0);
    }
  }, [uploadFile]);

  // إعادة تعيين الحالة
  const reset = useCallback(() => {
    setUploading(false);
    setProgress(0);
    setError(null);
  }, []);

  return {
    uploading,
    progress,
    error,
    uploadFile,
    uploadFiles,
    reset
  };
};

export default useMediaUpload;
