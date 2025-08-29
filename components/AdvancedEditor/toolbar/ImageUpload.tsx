'use client';

import React, { useState, useRef } from 'react';
import { Editor } from '@tiptap/react';
import { Image, Upload, Link, X, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

interface ImageUploadProps {
  editor: Editor;
}

export function ImageUpload({ editor }: ImageUploadProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'upload' | 'url'>('upload'); // التبويب الافتراضي هو رفع صورة
  const [isUploading, setIsUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [imageAlt, setImageAlt] = useState('');
  const [previewUrl, setPreviewUrl] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (file: File) => {
    console.log("🖼️ [ADVANCED EDITOR] بدء رفع صورة:", {
      name: file.name,
      size: file.size,
      type: file.type
    });

    // التحقق من نوع الملف
    if (!file.type.startsWith('image/')) {
      toast.error('يرجى اختيار ملف صورة صالح');
      return;
    }

    // التحقق من حجم الملف (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('حجم الصورة يجب أن يكون أقل من 5MB');
      return;
    }

    setIsUploading(true);
    const uploadToast = toast.loading('🔄 جاري رفع الصورة...');

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', 'article');

      // محاولة رفع عبر Cloudinary أولاً
      console.log("☁️ [ADVANCED EDITOR] محاولة رفع عبر Cloudinary...");
      let response = await fetch('/api/upload-cloudinary', {
        method: 'POST',
        body: formData,
      });

      // إذا فشل Cloudinary، جرب الرفع المحلي
      if (!response.ok) {
        console.log("📁 [ADVANCED EDITOR] فشل Cloudinary، محاولة الرفع المحلي...");
        response = await fetch('/api/upload-editor', {
          method: 'POST',
          body: formData,
        });
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log("✅ [ADVANCED EDITOR] نجح رفع الصورة:", result);

      if (result.success && result.url) {
        // إدراج الصورة في المحرر
        editor.chain().focus().setImage({ 
          src: result.url,
          alt: imageAlt || file.name,
          title: imageAlt || file.name
        }).run();

        toast.dismiss(uploadToast);
        toast.success('تم رفع الصورة بنجاح!');
        
        // إعادة تعيين النموذج
        setImageUrl('');
        setImageAlt('');
        setPreviewUrl('');
        setIsOpen(false);
      } else {
        throw new Error(result.error || 'فشل في رفع الصورة');
      }
    } catch (error) {
      console.error("❌ [ADVANCED EDITOR] خطأ في رفع الصورة:", error);
      toast.dismiss(uploadToast);
      toast.error(error instanceof Error ? error.message : 'حدث خطأ أثناء رفع الصورة');
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleUrlInsert = () => {
    if (!imageUrl.trim()) {
      toast.error('يرجى إدخال رابط الصورة');
      return;
    }

    // التحقق من صحة الرابط
    try {
      new URL(imageUrl);
    } catch {
      toast.error('رابط الصورة غير صالح');
      return;
    }

    // إدراج الصورة في المحرر
    editor.chain().focus().setImage({ 
      src: imageUrl,
      alt: imageAlt || 'صورة',
      title: imageAlt || 'صورة'
    }).run();

    toast.success('تم إدراج الصورة بنجاح!');
    
    // إعادة تعيين النموذج
    setImageUrl('');
    setImageAlt('');
    setPreviewUrl('');
    setIsOpen(false);
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      handleFileUpload(file);
    }
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
  };

  if (!isOpen) {
    return (
      <button
        className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors group"
        onClick={() => setIsOpen(true)}
        title="رفع صورة من جهازك أو إدراج رابط"
      >
        <Image className="w-4 h-4 group-hover:text-blue-600 transition-colors" />
        <span>صورة</span>
        <Upload className="w-3 h-3 text-gray-400 group-hover:text-blue-600 transition-colors" />
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md mx-4">
        {/* رأس النافذة */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            إدراج صورة
          </h3>
          <button
            onClick={() => setIsOpen(false)}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* تبويبات */}
        <div className="flex border-b border-gray-200 dark:border-gray-700">
          <button
            className={cn(
              'flex-1 px-4 py-3 text-sm font-medium transition-colors',
              activeTab === 'upload'
                ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            )}
            onClick={() => setActiveTab('upload')}
          >
            <Upload className="w-4 h-4 inline-block ml-2" />
            رفع صورة
          </button>
          <button
            className={cn(
              'flex-1 px-4 py-3 text-sm font-medium transition-colors',
              activeTab === 'url'
                ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            )}
            onClick={() => setActiveTab('url')}
          >
            <Link className="w-4 h-4 inline-block ml-2" />
            رابط صورة
          </button>
        </div>

        {/* محتوى التبويبات */}
        <div className="p-4">
          {activeTab === 'upload' && (
            <div className="space-y-4">
              {/* منطقة السحب والإفلات */}
              <div
                className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center hover:border-blue-400 dark:hover:border-blue-500 transition-colors cursor-pointer"
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onClick={() => fileInputRef.current?.click()}
              >
                {isUploading ? (
                  <div className="flex flex-col items-center">
                    <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-2" />
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      جاري رفع الصورة...
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    <Upload className="w-8 h-8 text-gray-400 mb-2" />
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                      اسحب الصورة هنا أو انقر للاختيار
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-500">
                      PNG, JPG, WEBP حتى 5MB
                    </p>
                  </div>
                )}
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
                disabled={isUploading}
              />

              {/* وصف الصورة */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  وصف الصورة (اختياري)
                </label>
                <input
                  type="text"
                  value={imageAlt}
                  onChange={(e) => setImageAlt(e.target.value)}
                  placeholder="وصف مختصر للصورة..."
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={isUploading}
                />
              </div>
            </div>
          )}

          {activeTab === 'url' && (
            <div className="space-y-4">
              {/* رابط الصورة */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  رابط الصورة
                </label>
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => {
                    setImageUrl(e.target.value);
                    setPreviewUrl(e.target.value);
                  }}
                  placeholder="https://example.com/image.jpg"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* وصف الصورة */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  وصف الصورة (اختياري)
                </label>
                <input
                  type="text"
                  value={imageAlt}
                  onChange={(e) => setImageAlt(e.target.value)}
                  placeholder="وصف مختصر للصورة..."
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* معاينة الصورة */}
              {previewUrl && (
                <div className="mt-4">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    معاينة:
                  </p>
                  <img
                    src={previewUrl}
                    alt="معاينة"
                    className="max-w-full h-32 object-contain rounded-lg border border-gray-300 dark:border-gray-600"
                    onError={() => setPreviewUrl('')}
                  />
                </div>
              )}

              {/* أزرار الإجراءات */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleUrlInsert}
                  disabled={!imageUrl.trim()}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  إدراج الصورة
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
                >
                  إلغاء
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

