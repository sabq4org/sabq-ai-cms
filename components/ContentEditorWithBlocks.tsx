'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { Sparkles, Image as ImageIcon } from 'lucide-react';
import { useDarkMode } from '@/hooks/useDarkMode';
import BlockEditor from './BlockEditor/BlockEditor';
import { Block, AIAction } from './BlockEditor/types';
import { createBlock } from './BlockEditor/utils';

interface ContentEditorProps {
  formData: {
    title: string;
    subtitle: string;
    description: string;
    category_id: number;
    content_blocks: Block[];
    keywords: string[];
    featured_image?: string;
    featured_image_alt?: string;
  };
  setFormData: React.Dispatch<React.SetStateAction<any>>;
  categories: any[];
  onGenerateTitle?: () => void;
  onGenerateDescription?: () => void;
  aiLoading?: { [key: string]: boolean };
}

export default function ContentEditorWithBlocks({
  formData,
  setFormData,
  categories,
  onGenerateTitle,
  onGenerateDescription,
  aiLoading = {}
}: ContentEditorProps) {
  const { darkMode } = useDarkMode();
  const [aiProcessing, setAiProcessing] = useState<string | null>(null);

  // تحويل البلوكات القديمة إلى تنسيق البلوكات الجديد إذا لزم الأمر
  const convertToBlocks = useCallback((blocks: any[]): Block[] => {
    if (!blocks || blocks.length === 0) {
      // استخدام معرف ثابت للبلوك الافتراضي
      return [{
        id: 'default_block_0',
        type: 'paragraph',
        data: { paragraph: { text: '' } },
        order: 0
      }];
    }
    
    // إذا كانت البلوكات بالتنسيق الصحيح، أعدها كما هي
    if (blocks[0]?.id && blocks[0]?.type && blocks[0]?.data) {
      return blocks;
    }
    
    // تحويل من التنسيق القديم باستخدام معرفات ثابتة
    return blocks.map((block, index) => {
      if (block.type && block.content) {
        const data: any = {};
        data[block.type] = block.content;
        return {
          id: `converted_block_${index}`,
          type: block.type,
          data,
          order: index
        };
      }
      return {
        id: `default_block_${index}`,
        type: 'paragraph',
        data: { paragraph: { text: '' } },
        order: index
      };
    });
  }, []);

  const handleBlocksChange = (blocks: Block[]) => {
    setFormData((prev: any) => ({
      ...prev,
      content_blocks: blocks
    }));
  };

  const handleAIAction = useCallback(async (action: AIAction) => {
    setAiProcessing(action.blockId);
    
    try {
      const block = formData.content_blocks.find(b => b.id === action.blockId);
      if (!block) return;

      // استخراج النص بناءً على نوع البلوك
      let contentText = '';
      const blockData = block.data[block.type];
      if (blockData && typeof blockData === 'object' && 'text' in blockData) {
        contentText = blockData.text || '';
      }

      const response = await fetch('/api/ai/editor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: action.type,
          content: contentText,
          type: block.type
        })
      });

      const data = await response.json();
      
      if (data.result) {
        // تحديث البلوك بالنتيجة
        const updatedBlocks = formData.content_blocks.map(b => {
          if (b.id === action.blockId) {
            const newData = { ...b.data };
            if (b.type === 'paragraph' || b.type === 'heading' || b.type === 'quote') {
              const existingData = newData[b.type] || {};
              newData[b.type] = { ...existingData, text: data.result };
            }
            return { ...b, data: newData };
          }
          return b;
        });
        
        handleBlocksChange(updatedBlocks);
      }
    } catch (error) {
      console.error('AI Error:', error);
      alert('حدث خطأ في معالجة طلب الذكاء الاصطناعي');
    } finally {
      setAiProcessing(null);
    }
  }, [formData.content_blocks]);

  return (
    <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-xl">
      {/* Header */}
      <div className="border-b border-gray-200 dark:border-gray-700 p-6">
        <div className="space-y-4">
          {/* العنوان */}
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
              العنوان الرئيسي
            </label>
            <div className="relative">
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData((prev: any) => ({ ...prev, title: e.target.value }))}
                placeholder="اكتب عنواناً جذاباً للمقال..."
                className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                  darkMode 
                    ? 'bg-gray-800 border-gray-700 text-gray-100 placeholder-gray-500' 
                    : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400'
                }`}
                maxLength={100}
              />
              {onGenerateTitle && (
                <button
                  onClick={onGenerateTitle}
                  disabled={aiLoading.title}
                  className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 rounded-lg hover:bg-purple-200 dark:hover:bg-purple-800 transition-colors disabled:opacity-50"
                  title="توليد عنوان بالذكاء الاصطناعي"
                >
                  <Sparkles className="w-4 h-4" />
                </button>
              )}
            </div>
            <div className="mt-1 text-xs text-gray-500 dark:text-gray-400 text-left">
              {formData.title.length}/100
            </div>
          </div>

          {/* العنوان الفرعي */}
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
              العنوان الفرعي (اختياري)
            </label>
            <input
              type="text"
              value={formData.subtitle}
              onChange={(e) => setFormData((prev: any) => ({ ...prev, subtitle: e.target.value }))}
              placeholder="أضف عنواناً فرعياً إن أردت..."
              className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                darkMode 
                  ? 'bg-gray-800 border-gray-700 text-gray-100 placeholder-gray-500' 
                  : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400'
              }`}
            />
          </div>

          {/* الوصف */}
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
              وصف المقال
            </label>
            <div className="relative">
              <textarea
                value={formData.description}
                onChange={(e) => setFormData((prev: any) => ({ ...prev, description: e.target.value }))}
                placeholder="اكتب وصفاً مختصراً يظهر في محركات البحث..."
                rows={3}
                maxLength={160}
                className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none ${
                  darkMode 
                    ? 'bg-gray-800 border-gray-700 text-gray-100 placeholder-gray-500' 
                    : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400'
                }`}
              />
              {onGenerateDescription && (
                <button
                  onClick={onGenerateDescription}
                  disabled={aiLoading.description}
                  className="absolute left-2 top-2 p-2 bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 rounded-lg hover:bg-purple-200 dark:hover:bg-purple-800 transition-colors disabled:opacity-50"
                  title="توليد وصف بالذكاء الاصطناعي"
                >
                  <Sparkles className="w-4 h-4" />
                </button>
              )}
            </div>
            <div className="mt-1 text-xs text-gray-500 dark:text-gray-400 text-left">
              {formData.description.length}/160
            </div>
          </div>

          {/* التصنيف وصورة البارزة */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                التصنيف
              </label>
              <select
                value={formData.category_id}
                onChange={(e) => setFormData((prev: any) => ({ ...prev, category_id: parseInt(e.target.value) }))}
                className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                  darkMode 
                    ? 'bg-gray-800 border-gray-700 text-gray-100' 
                    : 'bg-white border-gray-200 text-gray-900'
                }`}
              >
                <option value="">اختر التصنيف</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name_ar}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                الصورة البارزة
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={formData.featured_image || ''}
                  onChange={(e) => setFormData((prev: any) => ({ ...prev, featured_image: e.target.value }))}
                  placeholder="رابط الصورة البارزة..."
                  className={`flex-1 px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                    darkMode 
                      ? 'bg-gray-800 border-gray-700 text-gray-100 placeholder-gray-500' 
                      : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400'
                  }`}
                />
                <button className="px-4 py-3 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-xl hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors">
                  <ImageIcon className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* محرر البلوكات */}
      <div className="p-6">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4 block">
          محتوى المقال
        </label>
        
        <BlockEditor
          blocks={useMemo(() => convertToBlocks(formData.content_blocks), [formData.content_blocks, convertToBlocks])}
          onChange={handleBlocksChange}
          onAIAction={handleAIAction}
          placeholder="ابدأ كتابة محتوى مقالك أو اضغط على + لإضافة بلوك..."
        />
      </div>

      {/* مؤشر حالة الذكاء الاصطناعي */}
      {aiProcessing && (
        <div className="fixed bottom-4 right-4 bg-purple-600 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 z-50">
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
          <span>جارٍ معالجة طلب الذكاء الاصطناعي...</span>
        </div>
      )}
    </div>
  );
} 