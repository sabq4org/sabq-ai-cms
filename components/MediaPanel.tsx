'use client';

import React, { useState } from 'react';
import { Upload, Image, Video, X, CheckCircle } from 'lucide-react';

interface FormData {
  cover_image?: string;
  cover_video?: string;
}

interface MediaPanelProps {
  formData: FormData;
  setFormData: (data: FormData | ((prev: FormData) => FormData)) => void;
}

export default function MediaPanel({ formData, setFormData }: MediaPanelProps) {
  const [uploading, setUploading] = useState(false);

  const sampleMedia = [
    { id: '1', name: 'مؤتمر صحفي.jpg', url: '/images/news1.jpg', type: 'image' },
    { id: '2', name: 'لقاء تلفزيوني.mp4', url: '/videos/interview.mp4', type: 'video' },
    { id: '3', name: 'صورة أخبار.jpg', url: '/images/news2.jpg', type: 'image' }
  ];

  const selectMedia = (media: any) => {
    if (media.type === 'image') {
      setFormData(prev => ({ ...prev, cover_image: media.url, cover_video: undefined }));
    } else {
      setFormData(prev => ({ ...prev, cover_video: media.url, cover_image: undefined }));
    }
  };

  return (
    <div className="bg-gradient-to-br from-white via-purple-50/30 to-pink-50/30 rounded-3xl p-6 shadow-xl border border-purple-100/50 backdrop-blur-sm">
      <div className="flex items-center gap-4 mb-6">
        <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg">
          <Image className="w-6 h-6 text-white" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-gray-800">🎨 إدارة الوسائط</h3>
          <p className="text-gray-600 text-sm">صور وفيديوهات احترافية</p>
        </div>
      </div>
      
      <div className="space-y-6">
        {/* منطقة الرفع المتطورة */}
        <div className="border-2 border-dashed border-purple-300 rounded-2xl p-8 text-center bg-gradient-to-br from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100 transition-all duration-300 group">
          <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300">
            <Upload className="w-8 h-8 text-white group-hover:animate-bounce" />
          </div>
          <h4 className="font-bold text-gray-800 mb-2 text-lg">📁 رفع الوسائط</h4>
          <p className="text-gray-600 mb-6">اسحب الصور والفيديوهات هنا أو انقر للاختيار</p>
          <button className="bg-gradient-to-r from-purple-500 to-pink-600 text-white px-6 py-3 rounded-xl hover:from-purple-600 hover:to-pink-700 transition-all duration-300 transform hover:scale-105 shadow-lg font-medium">
            🎯 اختيار الملفات
          </button>
          <div className="mt-4 text-xs text-gray-500">
            ✅ يدعم: JPG, PNG, GIF, MP4, MOV
          </div>
        </div>

        {/* المكتبة المتطورة */}
        <div>
          <h4 className="font-bold text-gray-800 mb-4 text-lg flex items-center gap-2">
            🗂️ مكتبة الوسائط
          </h4>
          <div className="grid grid-cols-2 gap-4">
            {sampleMedia.map(media => (
              <div
                key={media.id}
                className={`group relative border-2 rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 transform hover:scale-105 ${
                  (formData.cover_image === media.url || formData.cover_video === media.url)
                    ? 'border-purple-500 bg-purple-50 shadow-lg'
                    : 'border-gray-200 hover:border-purple-300 hover:shadow-md'
                }`}
                onClick={() => selectMedia(media)}
              >
                <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center group-hover:from-purple-100 group-hover:to-pink-100 transition-all duration-300">
                  {media.type === 'image' ? (
                    <div className="flex flex-col items-center gap-2">
                      <Image className="w-8 h-8 text-gray-500 group-hover:text-purple-600 transition-colors" />
                      <span className="text-xs font-medium text-gray-600">📸 صورة</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2">
                      <Video className="w-8 h-8 text-gray-500 group-hover:text-red-600 transition-colors" />
                      <span className="text-xs font-medium text-gray-600">🎥 فيديو</span>
                    </div>
                  )}
                </div>
                <div className="p-3 bg-white">
                  <p className="text-xs font-medium text-gray-700 truncate">{media.name}</p>
                </div>
                {(formData.cover_image === media.url || formData.cover_video === media.url) && (
                  <div className="absolute top-2 right-2">
                    <div className="w-6 h-6 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center shadow-lg">
                      <CheckCircle className="w-4 h-4 text-white" />
                    </div>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
              </div>
            ))}
          </div>
        </div>

        {/* المعاينة */}
        {(formData.cover_image || formData.cover_video) && (
          <div className="border-t pt-4">
            <h4 className="font-medium text-gray-900 mb-3">الغلاف المحدد:</h4>
            <div className="relative">
              <div className="w-full h-24 bg-gray-100 rounded-lg flex items-center justify-center">
                {formData.cover_image ? (
                  <Image className="w-8 h-8 text-green-600" />
                ) : (
                  <Video className="w-8 h-8 text-red-600" />
                )}
              </div>
              <button
                onClick={() => setFormData(prev => ({ ...prev, cover_image: undefined, cover_video: undefined }))}
                className="absolute top-1 right-1 p-1 bg-red-600 text-white rounded-full hover:bg-red-700"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 