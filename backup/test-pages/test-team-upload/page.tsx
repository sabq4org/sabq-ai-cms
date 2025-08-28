'use client';

import React, { useState } from 'react';
import { ImageUploadComponent as ImageUpload } from '@/components/ui/ImageUpload';
import { toast } from 'react-hot-toast';

export default function TestTeamUploadPage() {
  const [uploadedImage, setUploadedImage] = useState('');

  const handleImageUpload = (url: string) => {
    console.log('🖼️ تم رفع الصورة:', url);
    setUploadedImage(url);
    toast.success('تم رفع الصورة بنجاح!');
  };

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">اختبار رفع صورة الفريق</h1>
      
      <div className="space-y-4">
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">رفع صورة عضو الفريق</h2>
          
          <ImageUpload
            onImageUploaded={handleImageUpload}
            currentImage={uploadedImage}
            type="avatar"
            label="رفع صورة شخصية"
            maxSize={5}
          />
        </div>

        {uploadedImage && (
          <div className="mt-6 p-4 bg-green-50 rounded-lg">
            <h3 className="font-semibold text-green-800 mb-2">الصورة المرفوعة:</h3>
            <img 
              src={uploadedImage} 
              alt="الصورة المرفوعة" 
              className="w-32 h-32 object-cover rounded-full border-4 border-green-200"
            />
            <p className="text-sm text-green-600 mt-2">URL: {uploadedImage}</p>
          </div>
        )}

        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-semibold text-blue-800 mb-2">خطوات التشخيص:</h3>
          <ol className="list-decimal list-inside text-sm text-blue-700 space-y-1">
            <li>افتح الـ Developer Tools (F12)</li>
            <li>اذهب لتبويب Console</li>
            <li>اذهب لتبويب Network</li>
            <li>جرب رفع صورة</li>
            <li>راقب الطلبات والأخطاء</li>
          </ol>
        </div>
      </div>
    </div>
  );
}