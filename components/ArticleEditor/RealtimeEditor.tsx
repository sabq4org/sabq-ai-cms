'use client';

import Image from 'next/image';
import React, { useState, useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { useDebounce } from '@/hooks/useDebounce';
import toast from 'react-hot-toast';

interface RealtimeEditorProps {
  articleId: string;
  userId: string;
  initialContent?: string;
  onSave?: (content: string) => void;
}

// دالة مؤقتة لتفادي الأخطاء
const mockBroadcast = (type: string, data: any) => {
  console.log('Mock broadcast:', type, data);
};

export default function RealtimeEditor({
  articleId,
  userId,
  initialContent = '',
  onSave
}: RealtimeEditorProps) {
  const [content, setContent] = useState(initialContent);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const debouncedContent = useDebounce(content, 1000);
  
  // إعداد محرر TipTap
  const editor = useEditor({
    immediatelyRender: false, // حل مشكلة SSR في Next.js
    extensions: [StarterKit],
    content: initialContent,
    onUpdate: ({ editor }) => {
      const newContent = editor.getHTML();
      setContent(newContent);
    }
  });
  
  // تحديث المحرر عند تغيير المحتوى الأولي
  useEffect(() => {
    if (editor && initialContent) {
      editor.commands.setContent(initialContent);
    }
  }, [editor, initialContent]);
  
  // حفظ التغييرات تلقائياً
  useEffect(() => {
    if (debouncedContent && debouncedContent !== initialContent) {
      saveContent(debouncedContent);
    }
  }, [debouncedContent]);
  
  const saveContent = async (contentToSave: string) => {
    setIsSaving(true);
    
    try {
      // حفظ في قاعدة البيانات
      if (onSave) {
        await onSave(contentToSave);
      }
      
      // بث التحديث (معطل حاليًا)
      mockBroadcast('content-update', {
        content: contentToSave,
        userName: localStorage.getItem('userName') || 'مستخدم',
        savedAt: new Date().toISOString()
      });
      
      setLastSaved(new Date());
      toast.success('تم الحفظ', { icon: '✅', duration: 1000 });
    } catch (error) {
      console.error('Error saving:', error);
      toast.error('فشل الحفظ');
    } finally {
      setIsSaving(false);
    }
  };
  
  if (!editor) {
    return <div className="animate-pulse bg-gray-200 h-96 rounded-lg" />;
  }
  
  return (
    <div className="relative">
      {/* شريط الحالة */}
      <div className="flex items-center justify-between mb-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <div className="flex items-center gap-4">
          {/* مؤشر الحفظ */}
          <div className="flex items-center gap-2 text-sm">
            {isSaving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600" />
                <span className="text-gray-600 dark:text-gray-400">جاري الحفظ...</span>
              </>
            ) : lastSaved ? (
              <>
                <div className="w-2 h-2 bg-green-500 rounded-full" />
                <span className="text-gray-600 dark:text-gray-400">
                  آخر حفظ: {lastSaved.toLocaleTimeString('ar-SA')}
                </span>
              </>
            ) : null}
          </div>
          
          {/* ملاحظة التعطيل */}
          <div className="flex items-center gap-2 text-sm text-yellow-600 dark:text-yellow-400">
            <div className="w-2 h-2 bg-yellow-500 rounded-full" />
            <span>المزامنة الفورية معطلة</span>
          </div>
        </div>
        
        {/* أزرار التحكم */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => saveContent(content)}
            disabled={isSaving}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            حفظ الآن
          </button>
        </div>
      </div>
      
      {/* المحرر */}
      <div className="prose prose-lg max-w-none dark:prose-invert">
        <EditorContent 
          editor={editor} 
          className="min-h-[400px] p-4 border border-gray-200 dark:border-gray-700 rounded-lg focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent transition-all"
        />
      </div>
      
      {/* معلومات إضافية */}
      <div className="mt-4 text-xs text-gray-500 dark:text-gray-400">
        <p>⚠️ ملاحظة: المزامنة الفورية معطلة حاليًا. يتم الحفظ محليًا فقط</p>
      </div>
    </div>
  );
}