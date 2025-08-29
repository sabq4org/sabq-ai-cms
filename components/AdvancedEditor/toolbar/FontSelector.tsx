'use client';

import React, { useState } from 'react';
import { Editor } from '@tiptap/react';
import { Type, Plus, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FontSelectorProps {
  editor: Editor;
}

export function FontSelector({ editor }: FontSelectorProps) {
  const [activeTab, setActiveTab] = useState<'family' | 'size' | 'weight'>('family');

  // عائلات الخطوط
  const fontFamilies = [
    { name: 'افتراضي', value: '', preview: 'النص الافتراضي' },
    { name: 'Arial', value: 'Arial, sans-serif', preview: 'Arabic Text نص عربي' },
    { name: 'Times New Roman', value: 'Times New Roman, serif', preview: 'Arabic Text نص عربي' },
    { name: 'Helvetica', value: 'Helvetica, sans-serif', preview: 'Arabic Text نص عربي' },
    { name: 'Georgia', value: 'Georgia, serif', preview: 'Arabic Text نص عربي' },
    { name: 'Verdana', value: 'Verdana, sans-serif', preview: 'Arabic Text نص عربي' },
    { name: 'Tahoma', value: 'Tahoma, sans-serif', preview: 'Arabic Text نص عربي' },
    { name: 'Courier New', value: 'Courier New, monospace', preview: 'Arabic Text نص عربي' },
    { name: 'Cairo', value: 'Cairo, sans-serif', preview: 'نص عربي بخط القاهرة' },
    { name: 'Amiri', value: 'Amiri, serif', preview: 'نص عربي بخط أميري' },
    { name: 'Noto Sans Arabic', value: 'Noto Sans Arabic, sans-serif', preview: 'نص عربي بخط نوتو' },
    { name: 'Tajawal', value: 'Tajawal, sans-serif', preview: 'نص عربي بخط تجوال' },
  ];

  // أحجام الخطوط
  const fontSizes = [
    { name: 'صغير جداً', value: '10px' },
    { name: 'صغير', value: '12px' },
    { name: 'عادي', value: '14px' },
    { name: 'متوسط', value: '16px' },
    { name: 'كبير', value: '18px' },
    { name: 'كبير جداً', value: '20px' },
    { name: 'عنوان صغير', value: '24px' },
    { name: 'عنوان متوسط', value: '28px' },
    { name: 'عنوان كبير', value: '32px' },
    { name: 'عنوان رئيسي', value: '36px' },
  ];

  // أوزان الخطوط
  const fontWeights = [
    { name: 'رفيع', value: '100' },
    { name: 'خفيف', value: '300' },
    { name: 'عادي', value: '400' },
    { name: 'متوسط', value: '500' },
    { name: 'نصف غامق', value: '600' },
    { name: 'غامق', value: '700' },
    { name: 'غامق جداً', value: '800' },
    { name: 'أسود', value: '900' },
  ];

  const applyFontFamily = (fontFamily: string) => {
    // تم تعطيل ميزة تغيير الخط مؤقتاً
    console.log('Font family feature disabled:', fontFamily);
  };

  const applyFontSize = (fontSize: string) => {
    editor.chain().focus().setFontSize(fontSize).run();
  };

  const applyFontWeight = (fontWeight: string) => {
    if (fontWeight === '400') {
      editor.chain().focus().unsetBold().run();
    } else {
      editor.chain().focus().setFontWeight(fontWeight).run();
    }
  };

  const getCurrentFontSize = () => {
    const attrs = editor.getAttributes('textStyle');
    return attrs.fontSize || '14px';
  };

  const increaseFontSize = () => {
    const current = parseInt(getCurrentFontSize());
    const newSize = Math.min(current + 2, 72);
    applyFontSize(`${newSize}px`);
  };

  const decreaseFontSize = () => {
    const current = parseInt(getCurrentFontSize());
    const newSize = Math.max(current - 2, 8);
    applyFontSize(`${newSize}px`);
  };

  return (
    <div className="w-80 p-3">
      {/* تبويبات */}
      <div className="flex mb-3 border-b border-gray-200 dark:border-gray-700">
        <button
          className={cn(
            'px-3 py-2 text-sm font-medium border-b-2 transition-colors',
            activeTab === 'family' 
              ? 'border-blue-500 text-blue-600 dark:text-blue-400' 
              : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
          )}
          onClick={() => setActiveTab('family')}
        >
          نوع الخط
        </button>
        <button
          className={cn(
            'px-3 py-2 text-sm font-medium border-b-2 transition-colors',
            activeTab === 'size' 
              ? 'border-blue-500 text-blue-600 dark:text-blue-400' 
              : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
          )}
          onClick={() => setActiveTab('size')}
        >
          حجم الخط
        </button>
        <button
          className={cn(
            'px-3 py-2 text-sm font-medium border-b-2 transition-colors',
            activeTab === 'weight' 
              ? 'border-blue-500 text-blue-600 dark:text-blue-400' 
              : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
          )}
          onClick={() => setActiveTab('weight')}
        >
          وزن الخط
        </button>
      </div>

      {/* عائلات الخطوط */}
      {activeTab === 'family' && (
        <div className="max-h-64 overflow-y-auto">
          {fontFamilies.map((font) => (
            <button
              key={font.value}
              className={cn(
                'w-full text-right p-3 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors border-b border-gray-100 dark:border-gray-700',
                editor.isActive('textStyle', { fontFamily: font.value }) && 'bg-blue-50 dark:bg-blue-900'
              )}
              onClick={() => applyFontFamily(font.value)}
            >
              <div className="font-medium text-sm">{font.name}</div>
              <div 
                className="text-xs text-gray-600 dark:text-gray-400 mt-1"
                style={{ fontFamily: font.value }}
              >
                {font.preview}
              </div>
            </button>
          ))}
        </div>
      )}

      {/* أحجام الخطوط */}
      {activeTab === 'size' && (
        <div>
          {/* أزرار سريعة */}
          <div className="flex items-center gap-2 mb-3">
            <button
              className="flex items-center justify-center w-8 h-8 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
              onClick={decreaseFontSize}
              title="تصغير الخط"
            >
              <Minus className="h-4 w-4" />
            </button>
            <div className="flex-1 text-center text-sm font-medium">
              {getCurrentFontSize()}
            </div>
            <button
              className="flex items-center justify-center w-8 h-8 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
              onClick={increaseFontSize}
              title="تكبير الخط"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>

          {/* قائمة الأحجام */}
          <div className="max-h-48 overflow-y-auto">
            {fontSizes.map((size) => (
              <button
                key={size.value}
                className={cn(
                  'w-full text-right p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors flex items-center justify-between',
                  editor.isActive('textStyle', { fontSize: size.value }) && 'bg-blue-50 dark:bg-blue-900'
                )}
                onClick={() => applyFontSize(size.value)}
              >
                <span className="text-sm">{size.name}</span>
                <span className="text-xs text-gray-500">{size.value}</span>
              </button>
            ))}
          </div>

          {/* حجم مخصص */}
          <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="8"
                max="72"
                className="w-16 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded"
                placeholder="حجم"
                onChange={(e) => {
                  const value = parseInt(e.target.value);
                  if (value >= 8 && value <= 72) {
                    applyFontSize(`${value}px`);
                  }
                }}
              />
              <span className="text-xs text-gray-600 dark:text-gray-400">px</span>
            </div>
          </div>
        </div>
      )}

      {/* أوزان الخطوط */}
      {activeTab === 'weight' && (
        <div className="max-h-64 overflow-y-auto">
          {fontWeights.map((weight) => (
            <button
              key={weight.value}
              className={cn(
                'w-full text-right p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors flex items-center justify-between',
                editor.isActive('textStyle', { fontWeight: weight.value }) && 'bg-blue-50 dark:bg-blue-900'
              )}
              onClick={() => applyFontWeight(weight.value)}
            >
              <span 
                className="text-sm"
                style={{ fontWeight: weight.value }}
              >
                {weight.name}
              </span>
              <span className="text-xs text-gray-500">{weight.value}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

