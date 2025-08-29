'use client';

import React, { useState } from 'react';
import { Editor } from '@tiptap/react';
import {
  Bold, Italic, Underline, Strikethrough,
  AlignLeft, AlignCenter, AlignRight, AlignJustify,
  List, ListOrdered, Quote, Table,
  Image, Link, Youtube, Code,
  Palette, Smile, Undo, Redo,
  Type, MoreHorizontal
} from 'lucide-react';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

interface FixedMainToolbarProps {
  editor: Editor;
}

export function FixedMainToolbar({ editor }: FixedMainToolbarProps) {
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  // ألوان النص
  const textColors = [
    '#000000', '#dc2626', '#2563eb', '#16a34a', 
    '#ea580c', '#9333ea', '#e11d48', '#6b7280'
  ];

  // رموز تعبيرية شائعة
  const emojis = [
    '😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣',
    '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰',
    '😘', '😗', '😙', '😚', '😋', '😛', '😝', '😜',
    '👍', '👎', '👌', '✌️', '🤞', '🤟', '🤘', '👏',
    '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍',
    '💯', '💢', '💥', '💫', '💦', '💨', '🔥', '⭐'
  ];

  const applyColor = (color: string) => {
    if (color === '#000000') {
      editor.chain().focus().unsetColor().run();
    } else {
      editor.chain().focus().setColor(color).run();
    }
    setShowColorPicker(false);
  };

  const insertEmoji = (emoji: string) => {
    editor.chain().focus().insertContent(emoji).run();
    setShowEmojiPicker(false);
  };

  const insertImage = () => {
    const url = window.prompt('رابط الصورة:');
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };

  const insertLink = () => {
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('رابط:', previousUrl);
    
    if (url === null) return;
    
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }
    
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  };

  const insertYoutube = () => {
    const url = window.prompt('رابط YouTube:');
    if (url) {
      editor.commands.setYoutubeVideo({
        src: url,
        width: 640,
        height: 480,
      });
    }
  };

  const insertTable = () => {
    editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
  };

  return (
    <div className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 sticky top-0 z-10">
      <div className="flex flex-wrap items-center gap-1 p-2">
        
        {/* أدوات التنسيق الأساسية */}
        <div className="flex items-center gap-1 border-r border-gray-300 dark:border-gray-600 pr-2 mr-2">
          <button
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={cn(
              "p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors",
              editor.isActive('bold') && "bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400"
            )}
            title="عريض (Ctrl+B)"
          >
            <Bold className="w-4 h-4" />
          </button>
          
          <button
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={cn(
              "p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors",
              editor.isActive('italic') && "bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400"
            )}
            title="مائل (Ctrl+I)"
          >
            <Italic className="w-4 h-4" />
          </button>
          
          <button
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            className={cn(
              "p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors",
              editor.isActive('underline') && "bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400"
            )}
            title="تحته خط (Ctrl+U)"
          >
            <Underline className="w-4 h-4" />
          </button>
          
          <button
            onClick={() => editor.chain().focus().toggleStrike().run()}
            className={cn(
              "p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors",
              editor.isActive('strike') && "bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400"
            )}
            title="يتوسطه خط"
          >
            <Strikethrough className="w-4 h-4" />
          </button>
          
          <button
            onClick={() => editor.chain().focus().toggleCode().run()}
            className={cn(
              "p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors",
              editor.isActive('code') && "bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400"
            )}
            title="كود"
          >
            <Code className="w-4 h-4" />
          </button>
        </div>

        {/* أدوات المحاذاة */}
        <div className="flex items-center gap-1 border-r border-gray-300 dark:border-gray-600 pr-2 mr-2">
          <button
            onClick={() => editor.chain().focus().setTextAlign('right').run()}
            className={cn(
              "p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors",
              editor.isActive({ textAlign: 'right' }) && "bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400"
            )}
            title="محاذاة يمين"
          >
            <AlignRight className="w-4 h-4" />
          </button>
          
          <button
            onClick={() => editor.chain().focus().setTextAlign('center').run()}
            className={cn(
              "p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors",
              editor.isActive({ textAlign: 'center' }) && "bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400"
            )}
            title="محاذاة وسط"
          >
            <AlignCenter className="w-4 h-4" />
          </button>
          
          <button
            onClick={() => editor.chain().focus().setTextAlign('left').run()}
            className={cn(
              "p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors",
              editor.isActive({ textAlign: 'left' }) && "bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400"
            )}
            title="محاذاة يسار"
          >
            <AlignLeft className="w-4 h-4" />
          </button>
          
          <button
            onClick={() => editor.chain().focus().setTextAlign('justify').run()}
            className={cn(
              "p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors",
              editor.isActive({ textAlign: 'justify' }) && "bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400"
            )}
            title="ضبط"
          >
            <AlignJustify className="w-4 h-4" />
          </button>
        </div>

        {/* القوائم والاقتباس */}
        <div className="flex items-center gap-1 border-r border-gray-300 dark:border-gray-600 pr-2 mr-2">
          <button
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={cn(
              "p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors",
              editor.isActive('bulletList') && "bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400"
            )}
            title="قائمة نقطية"
          >
            <List className="w-4 h-4" />
          </button>
          
          <button
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={cn(
              "p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors",
              editor.isActive('orderedList') && "bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400"
            )}
            title="قائمة مرقمة"
          >
            <ListOrdered className="w-4 h-4" />
          </button>
          
          <button
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            className={cn(
              "p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors",
              editor.isActive('blockquote') && "bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400"
            )}
            title="اقتباس"
          >
            <Quote className="w-4 h-4" />
          </button>
        </div>

        {/* الألوان */}
        <div className="relative border-r border-gray-300 dark:border-gray-600 pr-2 mr-2">
          <button
            onClick={() => setShowColorPicker(!showColorPicker)}
            className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            title="ألوان النص"
          >
            <Palette className="w-4 h-4" />
          </button>
          
          {showColorPicker && (
            <div className="absolute top-full left-0 mt-1 p-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg z-20">
              <div className="grid grid-cols-4 gap-1">
                {textColors.map((color) => (
                  <button
                    key={color}
                    className="w-6 h-6 rounded border-2 border-gray-300 dark:border-gray-600 hover:scale-110 transition-transform"
                    style={{ backgroundColor: color }}
                    onClick={() => applyColor(color)}
                    title={color}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* الرموز التعبيرية */}
        <div className="relative border-r border-gray-300 dark:border-gray-600 pr-2 mr-2">
          <button
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            title="رموز تعبيرية"
          >
            <Smile className="w-4 h-4" />
          </button>
          
          {showEmojiPicker && (
            <div className="absolute top-full left-0 mt-1 p-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg z-20 w-64">
              <div className="grid grid-cols-8 gap-1 max-h-32 overflow-y-auto">
                {emojis.map((emoji, index) => (
                  <button
                    key={index}
                    onClick={() => insertEmoji(emoji)}
                    className="p-1 text-lg hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* الوسائط */}
        <div className="flex items-center gap-1 border-r border-gray-300 dark:border-gray-600 pr-2 mr-2">
          <button
            onClick={insertImage}
            className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            title="إدراج صورة"
          >
            <Image className="w-4 h-4" />
          </button>
          
          <button
            onClick={insertLink}
            className={cn(
              "p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors",
              editor.isActive('link') && "bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400"
            )}
            title="إدراج رابط"
          >
            <Link className="w-4 h-4" />
          </button>
          
          <button
            onClick={insertYoutube}
            className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            title="إدراج فيديو YouTube"
          >
            <Youtube className="w-4 h-4" />
          </button>
          
          <button
            onClick={insertTable}
            className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            title="إدراج جدول"
          >
            <Table className="w-4 h-4" />
          </button>
        </div>

        {/* التراجع والإعادة */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
            className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="تراجع (Ctrl+Z)"
          >
            <Undo className="w-4 h-4" />
          </button>
          
          <button
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
            className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="إعادة (Ctrl+Y)"
          >
            <Redo className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* إغلاق القوائم المنبثقة عند النقر خارجها */}
      {(showColorPicker || showEmojiPicker) && (
        <div 
          className="fixed inset-0 z-10" 
          onClick={() => {
            setShowColorPicker(false);
            setShowEmojiPicker(false);
          }}
        />
      )}
    </div>
  );
}

