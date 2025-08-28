"use client";

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { Loader2 } from 'lucide-react';

// تحميل المحرر بشكل ديناميكي
const Editor = dynamic(
  () => import("@/components/Editor/Editor"),
  {
    ssr: false,
    loading: () => (
      <div className="h-96 bg-gray-50 dark:bg-gray-800/50 animate-pulse rounded-xl flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    ),
  }
);

export default function TestEditorPage() {
  const [content, setContent] = useState('');

  const handleContentChange = (newContent: any) => {
    console.log('محتوى المحرر تغير:', newContent);
    setContent(newContent.html || '');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
            اختبار المحرر مع رفع الصور
          </h1>
          
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              محتوى المقال
            </label>
            
            <Editor
              content={content}
              onChange={handleContentChange}
              placeholder="ابدأ بكتابة مقالك هنا... يمكنك رفع الصور من خلال النقر على أيقونة الصورة في شريط الأدوات"
              enableAI={true}
            />
          </div>

          <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <h3 className="text-lg font-medium mb-2 text-gray-900 dark:text-white">
              معاينة المحتوى:
            </h3>
            <div 
              className="prose dark:prose-invert max-w-none"
              dangerouslySetInnerHTML={{ __html: content }}
            />
          </div>

          <div className="mt-6 text-sm text-gray-600 dark:text-gray-400">
            <h4 className="font-medium mb-2">تعليمات الاستخدام:</h4>
            <ul className="list-disc list-inside space-y-1">
              <li>انقر على أيقونة الصورة في شريط الأدوات</li>
              <li>اختر "رفع صورة من الجهاز" أو "إدراج من رابط"</li>
              <li>اختر صورة من جهازك (JPG, PNG, GIF, WebP - أقصى حجم: 5MB)</li>
              <li>أضف نص بديل للصورة (مهم لمحركات البحث)</li>
              <li>انقر على "إدراج الصورة"</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
