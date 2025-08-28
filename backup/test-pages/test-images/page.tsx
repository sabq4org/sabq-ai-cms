"use client";

import { useState, useEffect } from "react";

export default function ImageTestPage() {
  const [imageUrl, setImageUrl] = useState("");

  useEffect(() => {
    setImageUrl("https://res.cloudinary.com/dybhezmvb/image/upload/v1755070568/media/tmltk923af8fiuqod9hb.jpg");
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-center mb-8">اختبار الصور</h1>
        
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-xl font-bold mb-4">اختبار الصورة الأساسي</h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">HTML img tag:</h3>
              <div className="w-full h-64 border-2 border-gray-300 rounded-lg overflow-hidden">
                <img 
                  src={imageUrl} 
                  alt="اختبار"
                  className="w-full h-full object-cover"
                  onLoad={() => console.log("✅ تم تحميل الصورة بـ img tag")}
                  onError={() => console.error("❌ فشل تحميل الصورة بـ img tag")}
                />
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold mb-2">Next.js Image:</h3>
              <div className="w-full h-64 border-2 border-gray-300 rounded-lg overflow-hidden relative">
                <img 
                  src={imageUrl} 
                  alt="اختبار Next.js"
                  className="w-full h-full object-cover"
                  onLoad={() => console.log("✅ تم تحميل الصورة بـ Next.js Image")}
                  onError={() => console.error("❌ فشل تحميل الصورة بـ Next.js Image")}
                />
              </div>
            </div>
            
            <div className="text-sm bg-gray-100 p-4 rounded">
              <strong>URL الصورة:</strong>
              <code className="block mt-2 break-all">{imageUrl}</code>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}