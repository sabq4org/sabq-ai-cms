'use client';

import { useState } from 'react';
import { ImageUploadS3 } from '@/components/ui/ImageUploadS3';
import { Button } from '@/components/ui/button';
import Image from 'next/image';

export default function TestS3Page() {
  const [uploadedImages, setUploadedImages] = useState<Array<{
    url: string;
    type: string;
    timestamp: string;
  }>>([]);

  const handleImageUploaded = (url: string, type: string) => {
    if (url) {
      setUploadedImages(prev => [...prev, {
        url,
        type,
        timestamp: new Date().toLocaleString('ar-SA')
      }]);
    }
  };

  const clearImages = () => {
    setUploadedImages([]);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🚀 اختبار رفع الصور إلى Amazon S3
          </h1>
          <p className="text-gray-600">
            اختبر رفع الصور إلى S3 bucket: <code className="bg-gray-200 px-2 py-1 rounded">sabq-uploader</code>
          </p>
        </div>

        {/* Upload Sections */}
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          
          {/* Avatar Upload */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">
              👤 رفع صورة شخصية (Avatar)
            </h2>
            <ImageUploadS3
              onImageUploaded={(url) => handleImageUploaded(url, 'avatar')}
              uploadType="avatar"
            />
          </div>

          {/* Featured Image Upload */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">
              🖼️ رفع صورة مميزة (Featured)
            </h2>
            <ImageUploadS3
              onImageUploaded={(url) => handleImageUploaded(url, 'featured')}
              uploadType="featured"
            />
          </div>

          {/* Gallery Upload */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">
              🎨 رفع صورة للمعرض (Gallery)
            </h2>
            <ImageUploadS3
              onImageUploaded={(url) => handleImageUploaded(url, 'gallery')}
              uploadType="gallery"
            />
          </div>

          {/* General Upload */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">
              📁 رفع صورة عامة (General)
            </h2>
            <ImageUploadS3
              onImageUploaded={(url) => handleImageUploaded(url, 'general')}
              uploadType="general"
            />
          </div>
        </div>

        {/* Uploaded Images History */}
        {uploadedImages.length > 0 && (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800">
                📸 الصور المرفوعة ({uploadedImages.length})
              </h2>
              <Button onClick={clearImages} variant="outline" size="sm">
                مسح الكل
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {uploadedImages.map((image, index) => (
                <div key={index} className="border rounded-lg p-3">
                  <div className="relative w-full h-32 mb-2">
                    <Image
                      src={image.url}
                      alt={`صورة ${index + 1}`}
                      fill
                      className="object-cover rounded"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  </div>
                  <p className="text-sm text-gray-600 mb-1">
                    <span className="font-medium">النوع:</span> {image.type}
                  </p>
                  <p className="text-xs text-gray-500 mb-2">
                    <span className="font-medium">التوقيت:</span> {image.timestamp}
                  </p>
                  <a 
                    href={image.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-xs text-blue-600 hover:text-blue-800 break-all"
                  >
                    {image.url}
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Info Box */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-800 mb-3">
            ℹ️ معلومات الاختبار
          </h3>
          <ul className="text-blue-700 space-y-1 text-sm">
            <li>• S3 Bucket: <code>sabq-uploader</code></li>
            <li>• المنطقة: <code>us-east-1</code></li>
            <li>• الحد الأقصى لحجم الملف: 5MB</li>
            <li>• الأنواع المدعومة: JPEG, PNG, WebP, GIF, AVIF</li>
            <li>• جميع الصور لها public-read access</li>
          </ul>
        </div>

        {/* Back to Dashboard */}
        <div className="mt-8 text-center">
          <Button 
            onClick={() => window.location.href = '/dashboard'}
            className="bg-green-600 hover:bg-green-700"
          >
            🏠 العودة إلى لوحة التحكم
          </Button>
        </div>
      </div>
    </div>
  );
}
