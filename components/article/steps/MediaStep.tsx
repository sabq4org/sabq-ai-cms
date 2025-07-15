'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Upload, X, Plus, Loader2, ImageIcon, Info, AlertCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface MediaStepProps {
  formData: any;
  setFormData: (data: any) => void;
  darkMode: boolean;
}

export function MediaStep({
  formData,
  setFormData,
  darkMode
}: MediaStepProps) {
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imageUploadStatus, setImageUploadStatus] = useState<{
    status: 'idle' | 'uploading' | 'success' | 'error' | 'placeholder';
    message?: string;
    isPlaceholder?: boolean;
  }>({ status: 'idle' });

  // رفع الصورة البارزة
  const handleFeaturedImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', 'featured');
    
    try {
      setUploadingImage(true);
      setImageUploadStatus({ status: 'uploading' });
      
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setFormData((prev: any) => ({ ...prev, featuredImage: data.url }));
          
          if (data.is_placeholder || data.cloudinary_storage === false) {
            setImageUploadStatus({
              status: 'placeholder',
              message: data.message || 'تم استخدام صورة مؤقتة',
              isPlaceholder: true
            });
            toast('تحذير: تم استخدام صورة مؤقتة', { icon: '⚠️' });
          } else {
            setImageUploadStatus({
              status: 'success',
              message: 'تم رفع الصورة بنجاح',
              isPlaceholder: false
            });
            toast.success('تم رفع الصورة بنجاح!');
          }
        }
      } else {
        const errorData = await response.json();
        setImageUploadStatus({
          status: 'error',
          message: errorData.error || 'فشل في رفع الصورة'
        });
        toast.error(errorData.error || 'فشل في رفع الصورة');
      }
    } catch (error) {
      console.error('خطأ في رفع الصورة:', error);
      setImageUploadStatus({
        status: 'error',
        message: 'حدث خطأ في الاتصال بالخادم'
      });
      toast.error('حدث خطأ في رفع الصورة');
    } finally {
      setUploadingImage(false);
    }
  };

  // رفع صور الألبوم
  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    
    setUploadingImage(true);
    const uploadedImages: any[] = [];
    let successCount = 0;
    let errorCount = 0;
    
    for (const file of Array.from(files)) {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', 'gallery');
      
      try {
        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            uploadedImages.push({ url: data.url });
            successCount++;
          } else {
            errorCount++;
          }
        } else {
          errorCount++;
        }
      } catch (error) {
        errorCount++;
        console.error('خطأ في رفع الصورة:', error);
      }
    }
    
    setFormData((prev: any) => ({ 
      ...prev, 
      gallery: [...prev.gallery, ...uploadedImages] 
    }));
    
    setUploadingImage(false);
    
    if (successCount > 0) {
      toast.success(`تم رفع ${successCount} صورة بنجاح!`);
    }
    if (errorCount > 0) {
      toast.error(`فشل في رفع ${errorCount} صورة`);
    }
  };

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h2 className={`text-2xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
          الوسائط والصور
        </h2>
        <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
          أضف الصور والوسائط لإثراء المقال
        </p>
      </div>

      {/* الصورة البارزة */}
      <div>
        <Label className="text-base font-medium mb-3 block">الصورة البارزة</Label>
        
        {formData.featuredImage ? (
          <div className="relative inline-block">
            <Image 
              src={formData.featuredImage} 
              alt="الصورة البارزة" 
              width={400} 
              height={300}
              className="rounded-lg object-cover"
            />
            <button
              onClick={() => {
                setFormData((prev: any) => ({ ...prev, featuredImage: '', featuredImageCaption: '' }));
                setImageUploadStatus({ status: 'idle' });
              }}
              className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className={`border-2 border-dashed rounded-lg p-8 text-center ${
            darkMode ? 'border-gray-600' : 'border-gray-300'
          }`}>
            {uploadingImage ? (
              <Loader2 className="w-12 h-12 mx-auto text-gray-400 mb-2 animate-spin" />
            ) : (
              <Upload className="w-12 h-12 mx-auto text-gray-400 mb-2" />
            )}
            <Label htmlFor="featured-image" className="cursor-pointer text-blue-600 hover:text-blue-700 font-medium">
              انقر لرفع الصورة البارزة
            </Label>
            <p className="text-sm text-gray-500 mt-1">JPG, PNG (Max 5MB)</p>
            <Input
              id="featured-image"
              type="file"
              accept="image/*"
              onChange={handleFeaturedImageUpload}
              className="hidden"
              disabled={uploadingImage}
            />
          </div>
        )}

        {/* حقل شرح الصورة */}
        {formData.featuredImage && (
          <div className="mt-4">
            <Label htmlFor="image-caption">شرح الصورة (Alt Text)</Label>
            <Input
              id="image-caption"
              type="text"
              value={formData.featuredImageCaption}
              onChange={(e) => setFormData((prev: any) => ({ ...prev, featuredImageCaption: e.target.value }))}
              placeholder="اكتب وصفاً للصورة يظهر تحتها..."
              className="mt-2"
            />
            <p className="text-sm text-gray-500 mt-1">
              هذا الوصف يحسن من SEO ويساعد القراء ذوي الإعاقة البصرية
            </p>
          </div>
        )}

        {/* حالة رفع الصورة */}
        {imageUploadStatus.status !== 'idle' && (
          <div className="mt-4">
            {imageUploadStatus.status === 'uploading' && (
              <Alert>
                <Loader2 className="h-4 w-4 animate-spin" />
                <AlertDescription>جاري رفع الصورة...</AlertDescription>
              </Alert>
            )}
            
            {imageUploadStatus.status === 'success' && !imageUploadStatus.isPlaceholder && (
              <Alert className="border-green-200 bg-green-50">
                <AlertCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-700">
                  تم رفع الصورة بنجاح
                </AlertDescription>
              </Alert>
            )}
            
            {imageUploadStatus.isPlaceholder && (
              <Alert className="border-yellow-200 bg-yellow-50">
                <AlertCircle className="h-4 w-4 text-yellow-600" />
                <AlertDescription className="text-yellow-700">
                  <strong>تحذير:</strong> تم استخدام صورة مؤقتة. يُنصح برفع صورة حقيقية قبل النشر.
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}
      </div>

      {/* ألبوم الصور */}
      <div>
        <Label className="text-base font-medium mb-3 block">
          ألبوم الصور
          {formData.gallery.length > 0 && (
            <span className="text-sm text-gray-500 font-normal mr-2">
              ({formData.gallery.length} صور)
            </span>
          )}
        </Label>
        
        {formData.gallery.length > 0 && (
          <div className="grid grid-cols-3 gap-3 mb-4">
            {formData.gallery.map((image: any, index: number) => (
              <div key={index} className="relative group">
                <Image 
                  src={image.url} 
                  alt={`صورة ${index + 1}`} 
                  width={200} 
                  height={150}
                  className="rounded-lg object-cover w-full h-32"
                />
                <button
                  onClick={() => {
                    setFormData((prev: any) => ({
                      ...prev,
                      gallery: prev.gallery.filter((_: any, i: number) => i !== index)
                    }));
                  }}
                  className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}
        
        <div className={`border-2 border-dashed rounded-lg p-6 text-center ${
          darkMode ? 'border-gray-600' : 'border-gray-300'
        }`}>
          <Label htmlFor="gallery" className="cursor-pointer">
            <Plus className="w-8 h-8 mx-auto mb-2 text-gray-400" />
            <span className="text-blue-600 hover:text-blue-700 font-medium">
              إضافة صور للألبوم
            </span>
          </Label>
          <p className="text-sm text-gray-500 mt-1">يمكنك اختيار عدة صور مرة واحدة</p>
          <Input
            id="gallery"
            type="file"
            accept="image/*"
            multiple
            onChange={handleGalleryUpload}
            className="hidden"
            disabled={uploadingImage}
          />
        </div>
      </div>

      {/* نصائح */}
      <Alert className={darkMode ? 'bg-blue-900/20 border-blue-800' : 'bg-blue-50 border-blue-200'}>
        <Info className="h-4 w-4" />
        <AlertDescription className={darkMode ? 'text-blue-200' : 'text-blue-800'}>
          <strong>نصائح للصور:</strong>
          <ul className="mt-2 space-y-1 text-sm">
            <li>• استخدم صور عالية الجودة (1200×630 بكسل على الأقل)</li>
            <li>• الصورة البارزة مهمة لجذب القراء</li>
            <li>• أضف وصفاً للصور لتحسين SEO</li>
            <li>• تجنب الصور الكبيرة جداً (أكثر من 5MB)</li>
          </ul>
        </AlertDescription>
      </Alert>
    </div>
  );
} 