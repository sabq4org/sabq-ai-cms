'use client';

import React, { useState } from 'react';
import { Editor } from '@tiptap/react';
import { Palette, Type } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ColorPickerProps {
  editor: Editor;
}

export function ColorPicker({ editor }: ColorPickerProps) {
  const [activeTab, setActiveTab] = useState<'text' | 'background'>('text');

  // ألوان النص
  const textColors = [
    '#000000', '#333333', '#666666', '#999999', '#CCCCCC', '#FFFFFF',
    '#FF0000', '#FF6600', '#FFCC00', '#00FF00', '#0066FF', '#6600FF',
    '#FF3366', '#FF9933', '#FFFF33', '#33FF33', '#3366FF', '#9933FF',
    '#990000', '#CC3300', '#FF6600', '#009900', '#003399', '#330099',
    '#660033', '#993366', '#CC6699', '#336633', '#006666', '#663399',
  ];

  // ألوان الخلفية
  const backgroundColors = [
    'transparent', '#F8F9FA', '#E9ECEF', '#DEE2E6', '#CED4DA', '#ADB5BD',
    '#FFE6E6', '#FFEDE6', '#FFF9E6', '#E6FFE6', '#E6F3FF', '#F0E6FF',
    '#FFD6E6', '#FFE6D6', '#FFFFD6', '#D6FFD6', '#D6E6FF', '#E6D6FF',
    '#FFCCCC', '#FFDDCC', '#FFFFCC', '#CCFFCC', '#CCDDFF', '#DDCCFF',
    '#FF9999', '#FFBB99', '#FFFF99', '#99FF99', '#99BBFF', '#BB99FF',
  ];

  const applyTextColor = (color: string) => {
    if (color === '#000000') {
      editor.chain().focus().unsetColor().run();
    } else {
      editor.chain().focus().setColor(color).run();
    }
  };

  const applyBackgroundColor = (color: string) => {
    // تم تعطيل ميزة تلوين الخلفية مؤقتاً
    console.log('Background color feature disabled:', color);
  };

  return (
    <div className="w-64 p-3">
      {/* تبويبات */}
      <div className="flex mb-3 border-b border-gray-200 dark:border-gray-700">
        <button
          className={cn(
            'flex items-center gap-2 px-3 py-2 text-sm font-medium border-b-2 transition-colors',
            activeTab === 'text' 
              ? 'border-blue-500 text-blue-600 dark:text-blue-400' 
              : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
          )}
          onClick={() => setActiveTab('text')}
        >
          <Type className="h-4 w-4" />
          لون النص
        </button>
        <button
          className={cn(
            'flex items-center gap-2 px-3 py-2 text-sm rounded transition-colors',
            activeTab === 'background' 
              ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300' 
              : 'hover:bg-gray-100 dark:hover:bg-gray-700'
          )}
          onClick={() => setActiveTab('background')}
        >
          <Type className="h-4 w-4" />
          خلفية
        </button>
      </div>

      {/* شبكة الألوان */}
      {activeTab === 'text' && (
        <div>
          <div className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
            ألوان النص
          </div>
          <div className="grid grid-cols-6 gap-1 mb-3">
            {textColors.map((color) => (
              <button
                key={color}
                className={cn(
                  'w-8 h-8 rounded border-2 transition-all hover:scale-110',
                  editor.isActive('textStyle', { color }) 
                    ? 'border-blue-500 ring-2 ring-blue-200' 
                    : 'border-gray-300 dark:border-gray-600'
                )}
                style={{ backgroundColor: color }}
                onClick={() => applyTextColor(color)}
                title={color}
              />
            ))}
          </div>
          
          {/* منتقي لون مخصص */}
          <div className="flex items-center gap-2">
            <input
              type="color"
              className="w-8 h-8 rounded border border-gray-300 dark:border-gray-600 cursor-pointer"
              onChange={(e) => applyTextColor(e.target.value)}
              title="لون مخصص"
            />
            <span className="text-xs text-gray-600 dark:text-gray-400">لون مخصص</span>
          </div>
        </div>
      )}

      {activeTab === 'background' && (
        <div>
          <div className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
            ألوان الخلفية
          </div>
          <div className="grid grid-cols-6 gap-1 mb-3">
            {backgroundColors.map((color) => (
              <button
                key={color}
                className={cn(
                  'w-8 h-8 rounded border-2 transition-all hover:scale-110 relative',
                  editor.isActive('highlight', { color }) 
                    ? 'border-blue-500 ring-2 ring-blue-200' 
                    : 'border-gray-300 dark:border-gray-600'
                )}
                style={{ 
                  backgroundColor: color === 'transparent' ? '#ffffff' : color,
                  backgroundImage: color === 'transparent' 
                    ? 'linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%)'
                    : undefined,
                  backgroundSize: color === 'transparent' ? '4px 4px' : undefined,
                  backgroundPosition: color === 'transparent' ? '0 0, 0 2px, 2px -2px, -2px 0px' : undefined
                }}
                onClick={() => applyBackgroundColor(color)}
                title={color === 'transparent' ? 'شفاف' : color}
              >
                {color === 'transparent' && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-4 h-0.5 bg-red-500 rotate-45"></div>
                  </div>
                )}
              </button>
            ))}
          </div>
          
          {/* منتقي لون خلفية مخصص */}
          <div className="flex items-center gap-2">
            <input
              type="color"
              className="w-8 h-8 rounded border border-gray-300 dark:border-gray-600 cursor-pointer"
              onChange={(e) => applyBackgroundColor(e.target.value)}
              title="لون خلفية مخصص"
            />
            <span className="text-xs text-gray-600 dark:text-gray-400">لون خلفية مخصص</span>
          </div>
        </div>
      )}

      {/* أزرار سريعة */}
      <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
        <div className="flex gap-2">
          <button
            className="flex-1 px-3 py-2 text-xs bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
            onClick={() => {
              if (activeTab === 'text') {
                editor.chain().focus().unsetColor().run();
              } else {
                // تم تعطيل ميزة إزالة لون الخلفية مؤقتاً
                console.log('Remove background color feature disabled');
              }
            }}
          >
            إزالة {activeTab === 'text' ? 'لون النص' : 'لون الخلفية'}
          </button>
        </div>
      </div>
    </div>
  );
}

