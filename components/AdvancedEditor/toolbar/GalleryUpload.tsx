'use client';

import React, { useState, useRef } from 'react';
import { Editor } from '@tiptap/react';
import { Images, Upload, X, Loader2, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

interface GalleryUploadProps {
  editor: Editor;
}

interface UploadedImage {
  id: string;
  url: string;
  alt: string;
  name: string;
}

export function GalleryUpload({ editor }: GalleryUploadProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleMultipleFileUpload = async (files: FileList) => {
    const validFiles = Array.from(files).filter(file => {
      if (!file.type.startsWith('image/')) {
        toast.error(`${file.name}: ليس ملف صورة صالح`);
        return false;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name}: حجم الملف كبير جداً (أكثر من 5MB)`);
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) return;

    setIsUploading(true);
    const uploadToast = toast.loading(`🔄 جاري رفع ${validFiles.length} صورة...`);

    try {
      const uploadPromises = validFiles.map(async (file, index) => {
        const fileId = `${Date.now()}-${index}`;
        setUploadProgress(prev => ({ ...prev, [fileId]: 0 }));

        const formData = new FormData();
        formData.append('file', file);
        formData.append('type', 'gallery');

        try {
          // محاولة رفع عبر Cloudinary أولاً
          let response = await fetch('/api/upload-cloudinary', {
            method: 'POST',
            body: formData,
          });

          // إذا فشل Cloudinary، جرب الرفع المحلي
          if (!response.ok) {
            response = await fetch('/api/upload-editor', {
              method: 'POST',
              body: formData,
            });
          }

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          const result = await response.json();
          
          if (result.success && result.url) {
            setUploadProgress(prev => ({ ...prev, [fileId]: 100 }));
            return {
              id: fileId,
              url: result.url,
              alt: file.name.replace(/\.[^/.]+$/, ''), // إزالة الامتداد
              name: file.name
            };
          } else {
            throw new Error(result.error || 'فشل في رفع الصورة');
          }
        } catch (error) {
          console.error(`خطأ في رفع ${file.name}:`, error);
          toast.error(`فشل في رفع ${file.name}`);
          return null;
        }
      });

      const results = await Promise.all(uploadPromises);
      const successfulUploads = results.filter((result): result is UploadedImage => result !== null);

      if (successfulUploads.length > 0) {
        setUploadedImages(prev => [...prev, ...successfulUploads]);
        toast.dismiss(uploadToast);
        toast.success(`تم رفع ${successfulUploads.length} صورة بنجاح!`);
      } else {
        toast.dismiss(uploadToast);
        toast.error('فشل في رفع جميع الصور');
      }
    } catch (error) {
      console.error('خطأ في رفع الألبوم:', error);
      toast.dismiss(uploadToast);
      toast.error('حدث خطأ أثناء رفع الصور');
    } finally {
      setIsUploading(false);
      setUploadProgress({});
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      handleMultipleFileUpload(files);
    }
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    const files = event.dataTransfer.files;
    if (files.length > 0) {
      handleMultipleFileUpload(files);
    }
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
  };

  const removeImage = (imageId: string) => {
    setUploadedImages(prev => prev.filter(img => img.id !== imageId));
  };

  const insertGallery = () => {
    if (uploadedImages.length === 0) {
      toast.error('يرجى رفع صور أولاً');
      return;
    }

    // إنشاء HTML للألبوم
    const galleryHtml = `
      <div class="image-gallery" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin: 20px 0;">
        ${uploadedImages.map(img => `
          <div class="gallery-item" style="position: relative; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
            <img src="${img.url}" alt="${img.alt}" title="${img.alt}" style="width: 100%; height: 200px; object-fit: cover;" />
            ${img.alt ? `<div class="gallery-caption" style="position: absolute; bottom: 0; left: 0; right: 0; background: linear-gradient(transparent, rgba(0,0,0,0.7)); color: white; padding: 12px 8px 8px; font-size: 14px;">${img.alt}</div>` : ''}
          </div>
        `).join('')}
      </div>
    `;

    // إدراج الألبوم في المحرر
    editor.chain().focus().insertContent(galleryHtml).run();

    toast.success('تم إدراج الألبوم بنجاح!');
    
    // إعادة تعيين النموذج
    setUploadedImages([]);
    setIsOpen(false);
  };

  if (!isOpen) {
    return (
      <button
        className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        onClick={() => setIsOpen(true)}
        title="إدراج ألبوم صور"
      >
        <Images className="w-4 h-4" />
        ألبوم
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-hidden">
        {/* رأس النافذة */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            إنشاء ألبوم صور
          </h3>
          <button
            onClick={() => setIsOpen(false)}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 overflow-y-auto max-h-[calc(90vh-120px)]">
          {/* منطقة رفع الصور */}
          <div className="mb-6">
            <div
              className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center hover:border-blue-400 dark:hover:border-blue-500 transition-colors cursor-pointer"
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onClick={() => fileInputRef.current?.click()}
            >
              {isUploading ? (
                <div className="flex flex-col items-center">
                  <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
                  <p className="text-lg text-gray-600 dark:text-gray-400 mb-2">
                    جاري رفع الصور...
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-500">
                    يرجى الانتظار حتى اكتمال الرفع
                  </p>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <Images className="w-12 h-12 text-gray-400 mb-4" />
                  <p className="text-lg text-gray-600 dark:text-gray-400 mb-2">
                    اسحب الصور هنا أو انقر لاختيار عدة صور
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-500">
                    PNG, JPG, WEBP - يمكنك اختيار عدة صور معاً
                  </p>
                </div>
              )}
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileSelect}
              className="hidden"
              disabled={isUploading}
            />
          </div>

          {/* معاينة الصور المرفوعة */}
          {uploadedImages.length > 0 && (
            <div className="mb-6">
              <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
                الصور المرفوعة ({uploadedImages.length})
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {uploadedImages.map((image) => (
                  <div key={image.id} className="relative group">
                    <img
                      src={image.url}
                      alt={image.alt}
                      className="w-full h-32 object-cover rounded-lg border border-gray-300 dark:border-gray-600"
                    />
                    <button
                      onClick={() => removeImage(image.id)}
                      className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-700"
                      title="حذف الصورة"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-2 rounded-b-lg">
                      {image.name}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* أزرار الإجراءات */}
          <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={insertGallery}
              disabled={uploadedImages.length === 0 || isUploading}
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
            >
              إدراج الألبوم ({uploadedImages.length} صورة)
            </button>
            <button
              onClick={() => setIsOpen(false)}
              className="px-6 py-3 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors font-medium"
            >
              إلغاء
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

