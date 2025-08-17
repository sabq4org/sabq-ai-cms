"use client";

import React, { useState, useCallback, useRef } from 'react';
import { 
  CloudArrowUpIcon, 
  XMarkIcon,
  PhotoIcon,
  PlayIcon,
  DocumentIcon
} from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

interface MediaUploadProps {
  onUploadSuccess?: (file: any) => void;
  onUploadError?: (error: string) => void;
  onUploadProgress?: (progress: number) => void;
  allowedTypes?: string[];
  maxSize?: number; // في MB
  multiple?: boolean;
  folderId?: string;
  className?: string;
}

interface UploadingFile {
  id: string;
  file: File;
  progress: number;
  status: 'uploading' | 'success' | 'error';
  result?: any;
  error?: string;
}

const MediaUpload: React.FC<MediaUploadProps> = ({
  onUploadSuccess,
  onUploadError,
  onUploadProgress,
  allowedTypes = ['image/*', 'video/*', 'audio/*', 'application/pdf'],
  maxSize = 50,
  multiple = true,
  folderId,
  className = ''
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // تحويل الملف إلى base64
  const fileToBase64 = useCallback((file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  }, []);

  // التحقق من نوع الملف
  const validateFile = useCallback((file: File) => {
    // فحص الحجم
    if (file.size > maxSize * 1024 * 1024) {
      return `حجم الملف يتجاوز الحد المسموح (${maxSize}MB)`;
    }

    // فحص النوع
    const fileType = file.type;
    const isAllowed = allowedTypes.some(type => {
      if (type.endsWith('/*')) {
        return fileType.startsWith(type.replace('/*', '/'));
      }
      return fileType === type;
    });

    if (!isAllowed) {
      return 'نوع الملف غير مدعوم';
    }

    return null;
  }, [allowedTypes, maxSize]);

  // رفع ملف واحد
  const uploadSingleFile = useCallback(async (file: File, uploadId: string) => {
    try {
      const validation = validateFile(file);
      if (validation) {
        throw new Error(validation);
      }

      // تحديث حالة الرفع
      setUploadingFiles(prev => 
        prev.map(f => f.id === uploadId ? { ...f, status: 'uploading' } : f)
      );

      // تحويل إلى base64
      const base64Data = await fileToBase64(file);

      // إعداد البيانات
      const uploadData = {
        file: {
          name: file.name,
          type: file.type,
          size: file.size,
          data: base64Data
        },
        folderId: folderId || null,
        altText: `صورة ${file.name}`
      };

      // رفع الملف
      const response = await fetch('/api/admin/media/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(uploadData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      const result = await response.json();

      // تحديث حالة النجاح
      setUploadingFiles(prev => 
        prev.map(f => f.id === uploadId ? 
          { ...f, status: 'success', progress: 100, result } : f
        )
      );

      // استدعاء callback النجاح
      onUploadSuccess?.(result);
      toast.success(`تم رفع ${file.name} بنجاح!`);

      return result;

    } catch (error: any) {
      console.error('خطأ في رفع الملف:', error);

      // تحديث حالة الخطأ
      setUploadingFiles(prev => 
        prev.map(f => f.id === uploadId ? 
          { ...f, status: 'error', error: error.message } : f
        )
      );

      // استدعاء callback الخطأ
      onUploadError?.(error.message);
      toast.error(`فشل رفع ${file.name}: ${error.message}`);

      throw error;
    }
  }, [validateFile, fileToBase64, folderId, onUploadSuccess, onUploadError]);

  // معالج رفع الملفات
  const handleFiles = useCallback(async (files: FileList) => {
    const filesToUpload = Array.from(files);

    // إنشاء قائمة الملفات قيد الرفع
    const newUploadingFiles: UploadingFile[] = filesToUpload.map((file, index) => ({
      id: `upload-${Date.now()}-${index}`,
      file,
      progress: 0,
      status: 'uploading'
    }));

    setUploadingFiles(prev => [...prev, ...newUploadingFiles]);

    // رفع الملفات بشكل متوازي (محدود)
    const uploadPromises = newUploadingFiles.map(uploadFile => 
      uploadSingleFile(uploadFile.file, uploadFile.id)
    );

    try {
      await Promise.allSettled(uploadPromises);
    } catch (error) {
      console.error('خطأ في رفع بعض الملفات:', error);
    }

    // مسح الملفات المرفوعة بنجاح بعد 3 ثواني
    setTimeout(() => {
      setUploadingFiles(prev => 
        prev.filter(f => f.status !== 'success')
      );
    }, 3000);
  }, [uploadSingleFile]);

  // معالج النقر
  const handleClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  // معالج تغيير input
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
    }
  }, [handleFiles]);

  // معالجات السحب والإفلات
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  }, [handleFiles]);

  // إزالة ملف من قائمة الرفع
  const removeUploadingFile = useCallback((id: string) => {
    setUploadingFiles(prev => prev.filter(f => f.id !== id));
  }, []);

  // أيقونة نوع الملف
  const getFileIcon = useCallback((file: File) => {
    if (file.type.startsWith('image/')) {
      return <PhotoIcon className="w-8 h-8 text-blue-500" />;
    } else if (file.type.startsWith('video/')) {
      return <PlayIcon className="w-8 h-8 text-purple-500" />;
    } else {
      return <DocumentIcon className="w-8 h-8 text-gray-500" />;
    }
  }, []);

  // تنسيق حجم الملف
  const formatFileSize = useCallback((bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }, []);

  return (
    <div className={`media-upload-container ${className}`}>
      {/* منطقة الرفع */}
      <div
        onClick={handleClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
          transition-all duration-200 hover:border-blue-400 hover:bg-blue-50/50
          dark:hover:bg-blue-900/20 dark:border-gray-600
          ${isDragOver 
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30' 
            : 'border-gray-300 dark:border-gray-600'
          }
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple={multiple}
          accept={allowedTypes.join(',')}
          onChange={handleInputChange}
          className="hidden"
        />

        <div className="space-y-4">
          <motion.div
            animate={isDragOver ? { scale: 1.1 } : { scale: 1 }}
            transition={{ duration: 0.2 }}
          >
            <CloudArrowUpIcon className="w-12 h-12 mx-auto text-gray-400" />
          </motion.div>

          <div>
            <p className="text-lg font-medium text-gray-900 dark:text-white">
              {isDragOver ? 'أفلت الملفات هنا' : 'اسحب الملفات هنا أو انقر للاختيار'}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              الأنواع المدعومة: الصور، الفيديو، الصوت، PDF
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500">
              الحد الأقصى: {maxSize}MB لكل ملف
            </p>
          </div>
        </div>
      </div>

      {/* قائمة الملفات قيد الرفع */}
      <AnimatePresence>
        {uploadingFiles.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 space-y-3"
          >
            <h3 className="text-sm font-medium text-gray-900 dark:text-white">
              الملفات قيد الرفع ({uploadingFiles.length})
            </h3>
            
            {uploadingFiles.map((uploadFile) => (
              <motion.div
                key={uploadFile.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className={`
                  flex items-center gap-3 p-3 rounded-lg border
                  ${uploadFile.status === 'success' 
                    ? 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20'
                    : uploadFile.status === 'error'
                    ? 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20'
                    : 'border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800/50'
                  }
                `}
              >
                {/* أيقونة الملف */}
                <div className="flex-shrink-0">
                  {getFileIcon(uploadFile.file)}
                </div>

                {/* معلومات الملف */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {uploadFile.file.name}
                    </p>
                    <button
                      onClick={() => removeUploadingFile(uploadFile.id)}
                      className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                      <XMarkIcon className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {formatFileSize(uploadFile.file.size)}
                  </p>

                  {/* شريط التقدم */}
                  {uploadFile.status === 'uploading' && (
                    <div className="mt-2 w-full bg-gray-200 rounded-full h-1.5 dark:bg-gray-700">
                      <motion.div
                        className="bg-blue-600 h-1.5 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: '90%' }}
                        transition={{ duration: 2, repeat: Infinity, repeatType: 'reverse' }}
                      />
                    </div>
                  )}

                  {/* رسالة الحالة */}
                  {uploadFile.status === 'success' && (
                    <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                      ✅ تم الرفع بنجاح
                    </p>
                  )}
                  
                  {uploadFile.status === 'error' && (
                    <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                      ❌ {uploadFile.error}
                    </p>
                  )}
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MediaUpload;
