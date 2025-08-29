'use client';

import React, { useState, useRef } from 'react';
import { Editor } from '@tiptap/react';
import { Image, Upload, Link, X, Loader2, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

interface ImageUploadCompactProps {
  editor: Editor;
}

export function ImageUploadCompact({ editor }: ImageUploadCompactProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'upload' | 'url'>('upload');
  const [isUploading, setIsUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [imageAlt, setImageAlt] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('يرجى اختيار ملف صورة صالح');
      return;
    }

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
        editor.chain().focus().setImage({ 
          src: result.url,
          alt: imageAlt || file.name,
          title: imageAlt || file.name
        }).run();

        toast.dismiss(uploadToast);
        toast.success('تم رفع الصورة بنجاح!');
        
        setImageUrl('');
        setImageAlt('');
        setIsOpen(false);
      } else {
        throw new Error(result.error || 'فشل في رفع الصورة');
      }
    } catch (error) {
      console.error("خطأ في رفع الصورة:", error);
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

    try {
      new URL(imageUrl);
    } catch {
      toast.error('رابط الصورة غير صالح');
      return;
    }

    editor.chain().focus().setImage({ 
      src: imageUrl,
      alt: imageAlt || 'صورة',
      title: imageAlt || 'صورة'
    }).run();

    toast.success('تم إدراج الصورة بنجاح!');
    
    setImageUrl('');
    setImageAlt('');
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        title="إدراج صورة"
      >
        <Image className="w-4 h-4" />
        <span>صورة</span>
        <ChevronDown className="w-3 h-3" />
      </button>
      
      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute top-full left-0 mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg z-20 w-80">
            {/* تبويبات */}
            <div className="flex border-b border-gray-200 dark:border-gray-700">
              <button
                className={cn(
                  'flex-1 px-3 py-2 text-sm font-medium transition-colors',
                  activeTab === 'upload'
                    ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                )}
                onClick={() => setActiveTab('upload')}
              >
                <Upload className="w-4 h-4 inline-block ml-1" />
                رفع
              </button>
              <button
                className={cn(
                  'flex-1 px-3 py-2 text-sm font-medium transition-colors',
                  activeTab === 'url'
                    ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                )}
                onClick={() => setActiveTab('url')}
              >
                <Link className="w-4 h-4 inline-block ml-1" />
                رابط
              </button>
            </div>

            {/* محتوى التبويبات */}
            <div className="p-3">
              {activeTab === 'upload' && (
                <div className="space-y-3">
                  {/* منطقة الرفع */}
                  <div
                    className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 text-center hover:border-blue-400 dark:hover:border-blue-500 transition-colors cursor-pointer"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {isUploading ? (
                      <div className="flex flex-col items-center">
                        <Loader2 className="w-6 h-6 text-blue-600 animate-spin mb-1" />
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          جاري الرفع...
                        </p>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center">
                        <Upload className="w-6 h-6 text-gray-400 mb-1" />
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          انقر لاختيار صورة
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
                  <input
                    type="text"
                    value={imageAlt}
                    onChange={(e) => setImageAlt(e.target.value)}
                    placeholder="وصف الصورة (اختياري)"
                    className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    disabled={isUploading}
                  />
                </div>
              )}

              {activeTab === 'url' && (
                <div className="space-y-3">
                  {/* رابط الصورة */}
                  <input
                    type="url"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://example.com/image.jpg"
                    className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  />

                  {/* وصف الصورة */}
                  <input
                    type="text"
                    value={imageAlt}
                    onChange={(e) => setImageAlt(e.target.value)}
                    placeholder="وصف الصورة (اختياري)"
                    className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  />

                  {/* زر الإدراج */}
                  <button
                    onClick={handleUrlInsert}
                    disabled={!imageUrl.trim()}
                    className="w-full px-3 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                  >
                    إدراج الصورة
                  </button>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

