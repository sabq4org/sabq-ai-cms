'use client';

import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { ImageUploadComponent as ImageUpload } from '@/components/ui/ImageUpload';

export default function TestTeamImageUploadPage() {
  const [formData, setFormData] = useState({
    avatar: ''
  });

  const [uploadMethod, setUploadMethod] = useState<'component' | 'manual'>('component');
  const [isUploading, setIsUploading] = useState(false);

  // اختبار رفع باستخدام المكون
  const handleImageUpload = (url: string) => {
    console.log('🖼️ [COMPONENT] تم رفع الصورة:', url);
    setFormData(prev => ({ ...prev, avatar: url }));
    toast.success('تم رفع الصورة بنجاح عبر المكون!');
  };

  // اختبار رفع يدوي مثل صفحة الفريق
  const handleManualUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      console.log('📁 [MANUAL] بدء رفع الملف:', file.name, file.size, file.type);
      
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', 'avatar');
      
      console.log('🌐 [MANUAL] إرسال الطلب إلى /api/upload-image');
      
      const response = await fetch('/api/upload-image', {
        method: 'POST',
        body: formData
      });
      
      const result = await response.json();
      console.log('📊 [MANUAL] نتيجة الرفع:', result);
      
      if (!response.ok || !result.success) {
        throw new Error(result.error || 'فشل رفع الصورة');
      }
      
      const imageUrl = result.url;
      console.log('✅ [MANUAL] تحديث معاينة الصورة:', imageUrl);
      
      if (!imageUrl) {
        throw new Error('لم يتم الحصول على رابط الصورة من الخادم');
      }
      
      setFormData(prev => ({ ...prev, avatar: imageUrl }));
      toast.success('تم رفع الصورة بنجاح يدوياً!');
      
    } catch (error: any) {
      console.error('❌ [MANUAL] خطأ في رفع الصورة:', error);
      toast.error(error.message || 'حدث خطأ أثناء رفع الصورة');
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8 text-center">
        اختبار رفع صورة الفريق 🧪
      </h1>

      {/* اختيار طريقة الاختبار */}
      <div className="mb-8 p-4 bg-blue-50 rounded-lg">
        <h2 className="font-semibold mb-4">اختر طريقة الاختبار:</h2>
        <div className="flex gap-4">
          <button
            onClick={() => setUploadMethod('component')}
            className={`px-4 py-2 rounded ${
              uploadMethod === 'component' 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-200 text-gray-700'
            }`}
          >
            مكون ImageUpload
          </button>
          <button
            onClick={() => setUploadMethod('manual')}
            className={`px-4 py-2 rounded ${
              uploadMethod === 'manual' 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-200 text-gray-700'
            }`}
          >
            رفع يدوي
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* الطريقة 1: مكون ImageUpload */}
        {uploadMethod === 'component' && (
          <div className="border rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">🎛️ مكون ImageUpload</h2>
            <p className="text-sm text-gray-600 mb-4">
              هذا هو نفس المكون المستخدم في صفحة /admin/team
            </p>
            
            <ImageUpload
              onImageUploaded={handleImageUpload}
              currentImage={formData.avatar}
              type="avatar"
              label="رفع صورة شخصية"
              maxSize={5}
            />
          </div>
        )}

        {/* الطريقة 2: رفع يدوي */}
        {uploadMethod === 'manual' && (
          <div className="border rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">⚡ رفع يدوي</h2>
            <p className="text-sm text-gray-600 mb-4">
              هذا هو نفس الكود المستخدم في صفحة /dashboard/team
            </p>
            
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <input
                type="file"
                accept="image/*"
                onChange={handleManualUpload}
                disabled={isUploading}
                className="mb-4"
              />
              {isUploading && <p className="text-blue-600">جاري الرفع...</p>}
            </div>
          </div>
        )}

        {/* معاينة النتيجة */}
        <div className="border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">📷 معاينة النتيجة</h2>
          
          {formData.avatar ? (
            <div className="text-center">
              <img 
                src={formData.avatar} 
                alt="الصورة المرفوعة" 
                className="w-32 h-32 rounded-full object-cover border-4 border-green-200 mx-auto mb-4"
                onError={(e) => {
                  console.log('❌ فشل في تحميل الصورة:', formData.avatar);
                  e.currentTarget.style.display = 'none';
                }}
              />
              <p className="text-green-600 font-semibold">✅ تم رفع الصورة بنجاح</p>
              <p className="text-xs text-gray-500 mt-2 break-all">
                URL: {formData.avatar}
              </p>
              <button
                onClick={() => setFormData(prev => ({ ...prev, avatar: '' }))}
                className="mt-2 px-3 py-1 bg-red-500 text-white rounded text-sm"
              >
                مسح الصورة
              </button>
            </div>
          ) : (
            <div className="text-center text-gray-500">
              لم يتم رفع صورة بعد
            </div>
          )}
        </div>
      </div>

      {/* تعليمات التشخيص */}
      <div className="mt-8 p-6 bg-yellow-50 rounded-lg">
        <h3 className="font-semibold text-yellow-800 mb-2">📋 تعليمات التشخيص:</h3>
        <ol className="list-decimal list-inside text-sm text-yellow-700 space-y-1">
          <li>افتح Developer Tools (F12)</li>
          <li>اذهب لتبويب Console</li>
          <li>اذهب لتبويب Network</li>
          <li>جرب كلا الطريقتين</li>
          <li>راقب الطلبات والأخطاء</li>
          <li>ابحث عن رسائل تبدأ بـ [COMPONENT] أو [MANUAL]</li>
        </ol>
      </div>

      {/* معلومات APIs */}
      <div className="mt-6 p-6 bg-gray-50 rounded-lg">
        <h3 className="font-semibold mb-2">🔧 معلومات APIs:</h3>
        <div className="text-sm space-y-1">
          <div>✅ API الجديد: <code>/api/upload-image</code></div>
          <div>❌ API القديم: <code>/api/upload-simple</code></div>
          <div>🗂️ نوع الملف: <code>avatar</code></div>
          <div>📏 الحد الأقصى: <code>5MB</code></div>
        </div>
      </div>
    </div>
  );
}