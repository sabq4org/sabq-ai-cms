'use client';

import React, { useState, useCallback, memo } from 'react';
import { Upload, Image as ImageIcon, X, AlertCircle, CheckCircle, Loader2, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

interface MediaStepEnhancedProps {
  formData: {
    featuredImage: string;
    featuredImageCaption?: string;
    gallery: Array<{ url: string; caption?: string; id: string }>;
  };
  setFormData: React.Dispatch<React.SetStateAction<any>>;
  darkMode: boolean;
}

const MediaStepEnhanced = memo(({ formData, setFormData, darkMode }: MediaStepEnhancedProps) => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);

  // معالج رفع الصور
  const handleImageUpload = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setUploading(true);
    setUploadProgress(0);

    try {
      const formDataUpload = new FormData();
      const file = files[0];
      formDataUpload.append('file', file);

      // محاكاة تقدم الرفع
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      const response = await fetch('/api/upload-image', {
        method: 'POST',
        body: formDataUpload
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (response.ok) {
        const data = await response.json();
        
        // إذا لم تكن هناك صورة بارزة، اجعلها الصورة المرفوعة
        if (!formData.featuredImage) {
          setFormData((prev: any) => ({
            ...prev,
            featuredImage: data.url
          }));
        } else {
          // أضفها إلى الألبوم
          setFormData((prev: any) => ({
            ...prev,
            gallery: [...prev.gallery, { url: data.url, id: Date.now().toString() }]
          }));
        }
      }
    } catch (error) {
      console.error('Upload error:', error);
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  }, [formData.featuredImage, setFormData]);

  // معالج السحب والإفلات
  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleImageUpload(e.dataTransfer.files);
    }
  }, [handleImageUpload]);

  // حذف صورة
  const removeImage = useCallback((type: 'featured' | 'gallery', id?: string) => {
    if (type === 'featured') {
      setFormData((prev: any) => ({ ...prev, featuredImage: '' }));
    } else if (id) {
      setFormData((prev: any) => ({
        ...prev,
        gallery: prev.gallery.filter((img: any) => img.id !== id)
      }));
    }
  }, [setFormData]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* الصورة البارزة */}
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <ImageIcon className="w-5 h-5" />
          الصورة البارزة
        </h3>

        {formData.featuredImage ? (
          <div className="relative group">
            <div className="relative h-64 rounded-lg overflow-hidden">
              <Image
                src={formData.featuredImage}
                alt="الصورة البارزة"
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200" />
              <button
                onClick={() => removeImage('featured')}
                className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            {/* وصف الصورة */}
            <input
              type="text"
              value={formData.featuredImageCaption || ''}
              onChange={(e) => setFormData((prev: any) => ({ ...prev, featuredImageCaption: e.target.value }))}
              placeholder="أضف وصفاً للصورة (اختياري)"
              className={cn(
                "w-full mt-2 px-3 py-2 border rounded-lg text-sm",
                "focus:outline-none focus:ring-2 focus:ring-blue-500",
                darkMode
                  ? "bg-gray-800 border-gray-700 text-white"
                  : "bg-white border-gray-300 text-gray-900"
              )}
            />
          </div>
        ) : (
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={cn(
              "relative border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200",
              dragActive
                ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                : darkMode
                ? "border-gray-600 bg-gray-800/50"
                : "border-gray-300 bg-gray-50"
            )}
          >
            <input
              type="file"
              id="featured-image-upload"
              accept="image/*"
              onChange={(e) => handleImageUpload(e.target.files)}
              className="hidden"
            />
            
            <label
              htmlFor="featured-image-upload"
              className="cursor-pointer"
            >
              <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p className="text-sm font-medium mb-2">
                اسحب وأفلت الصورة هنا أو انقر للاختيار
              </p>
              <p className="text-xs text-gray-500">
                PNG, JPG, GIF حتى 10MB
              </p>
            </label>

            {/* شريط التقدم */}
            {uploading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute inset-0 bg-white/90 dark:bg-gray-900/90 flex flex-col items-center justify-center rounded-lg"
              >
                <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-4" />
                <div className="w-64 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-blue-600"
                    initial={{ width: 0 }}
                    animate={{ width: `${uploadProgress}%` }}
                  />
                </div>
                <p className="text-sm mt-2">{uploadProgress}%</p>
              </motion.div>
            )}
          </div>
        )}
      </div>

      {/* ألبوم الصور */}
      <div>
        <h3 className="text-lg font-semibold mb-4">
          ألبوم الصور (اختياري)
        </h3>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {/* عرض الصور الموجودة */}
          <AnimatePresence>
            {formData.gallery.map((image: any) => (
              <motion.div
                key={image.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="relative group aspect-square"
              >
                <div className="relative h-full rounded-lg overflow-hidden">
                  <Image
                    src={image.url}
                    alt={image.caption || 'صورة من الألبوم'}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200" />
                  <button
                    onClick={() => removeImage('gallery', image.id)}
                    className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-1 bg-red-600 text-white rounded hover:bg-red-700"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* زر إضافة صورة جديدة */}
          <div
            className={cn(
              "aspect-square border-2 border-dashed rounded-lg flex items-center justify-center cursor-pointer transition-all duration-200 hover:border-blue-500",
              darkMode
                ? "border-gray-600 bg-gray-800/50 hover:bg-gray-800"
                : "border-gray-300 bg-gray-50 hover:bg-gray-100"
            )}
          >
            <input
              type="file"
              id="gallery-upload"
              accept="image/*"
              onChange={(e) => handleImageUpload(e.target.files)}
              className="hidden"
              disabled={uploading}
            />
            <label
              htmlFor="gallery-upload"
              className="cursor-pointer text-center p-4"
            >
              <Plus className="w-8 h-8 mx-auto mb-2 text-gray-400" />
              <span className="text-sm text-gray-500">إضافة صورة</span>
            </label>
          </div>
        </div>
      </div>

      {/* نصائح الوسائط */}
      <div className={cn(
        "p-4 rounded-lg border",
        darkMode
          ? "bg-gray-800/50 border-gray-700"
          : "bg-green-50 border-green-200"
      )}>
        <div className="flex items-start gap-3">
          <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-green-900 dark:text-green-200 mb-2">
              نصائح لصور أفضل:
            </p>
            <ul className="text-sm text-green-800 dark:text-green-300 space-y-0.5">
              <li>• استخدم صور عالية الجودة (1200x630 بكسل على الأقل)</li>
              <li>• تأكد من امتلاك حقوق استخدام الصور</li>
              <li>• أضف وصفاً للصور لتحسين SEO</li>
              <li>• تجنب الصور الثقيلة جداً (أكثر من 5MB)</li>
            </ul>
          </div>
        </div>
      </div>

      {/* معلومات الحالة */}
      {(formData.featuredImage || formData.gallery.length > 0) && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className={cn(
            "p-3 rounded-lg text-sm",
            darkMode ? "bg-gray-800" : "bg-gray-100"
          )}
        >
          <div className="flex items-center justify-between">
            <span className="text-gray-600 dark:text-gray-400">
              الصور المرفوعة:
            </span>
            <span className="font-medium">
              {(formData.featuredImage ? 1 : 0) + formData.gallery.length} صورة
            </span>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
});

MediaStepEnhanced.displayName = 'MediaStepEnhanced';

export default MediaStepEnhanced; 