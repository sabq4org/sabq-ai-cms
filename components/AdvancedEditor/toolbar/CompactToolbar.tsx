'use client';

import React, { useState } from 'react';
import { Editor } from '@tiptap/react';
import {
  Bold, Italic, Underline, Strikethrough,
  AlignLeft, AlignCenter, AlignRight, AlignJustify,
  List, ListOrdered, Quote, Table,
  Images, Link, Youtube,
  Palette, Type, Smile, MoreHorizontal,
  Undo, Redo, ChevronDown
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ImageUploadCompact } from './ImageUploadCompact';

interface CompactToolbarProps {
  editor: Editor;
}

interface DropdownProps {
  trigger: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

function Dropdown({ trigger, children, className = '' }: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "inline-flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors",
          className
        )}
      >
        {trigger}
        <ChevronDown className="w-3 h-3" />
      </button>
      
      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute top-full left-0 mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg z-20 min-w-[200px]">
            {children}
          </div>
        </>
      )}
    </div>
  );
}

export function CompactToolbar({ editor }: CompactToolbarProps) {
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  // ألوان النص الأساسية
  const textColors = [
    { name: 'أسود', value: '#000000' },
    { name: 'أحمر', value: '#dc2626' },
    { name: 'أزرق', value: '#2563eb' },
    { name: 'أخضر', value: '#16a34a' },
    { name: 'برتقالي', value: '#ea580c' },
    { name: 'بنفسجي', value: '#9333ea' },
    { name: 'وردي', value: '#e11d48' },
    { name: 'بني', value: '#a3a3a3' },
  ];

  // رموز تعبيرية شائعة
  const commonEmojis = [
    '😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣',
    '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰',
    '😘', '😗', '😙', '😚', '😋', '😛', '😝', '😜',
    '🤪', '🤨', '🧐', '🤓', '😎', '🥸', '🤩', '🥳',
    '👍', '👎', '👌', '✌️', '🤞', '🤟', '🤘', '👏',
    '🙌', '👐', '🤲', '🤝', '🙏', '✍️', '💪', '🦾',
    '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍',
    '💯', '💢', '💥', '💫', '💦', '💨', '🕳️', '💬'
  ];

  const applyTextColor = (color: string) => {
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
    
    if (url === null) {
      return;
    }
    
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

  return (
    <div className="flex flex-wrap items-center gap-2 p-3 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
      {/* أدوات التنسيق الأساسية */}
      <div className="flex items-center gap-1">
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={cn(
            "p-2 rounded-lg transition-colors",
            editor.isActive('bold')
              ? "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300"
              : "hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
          )}
          title="عريض"
        >
          <Bold className="w-4 h-4" />
        </button>
        
        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={cn(
            "p-2 rounded-lg transition-colors",
            editor.isActive('italic')
              ? "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300"
              : "hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
          )}
          title="مائل"
        >
          <Italic className="w-4 h-4" />
        </button>
        
        <button
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={cn(
            "p-2 rounded-lg transition-colors",
            editor.isActive('underline')
              ? "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300"
              : "hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
          )}
          title="تحته خط"
        >
          <Underline className="w-4 h-4" />
        </button>
        
        <button
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={cn(
            "p-2 rounded-lg transition-colors",
            editor.isActive('strike')
              ? "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300"
              : "hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
          )}
          title="يتوسطه خط"
        >
          <Strikethrough className="w-4 h-4" />
        </button>
      </div>

      <div className="w-px h-6 bg-gray-300 dark:bg-gray-600" />

      {/* ألوان النص */}
      <Dropdown
        trigger={
          <>
            <Palette className="w-4 h-4" />
            <span>ألوان</span>
          </>
        }
      >
        <div className="p-3">
          <div className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
            ألوان النص
          </div>
          <div className="grid grid-cols-4 gap-2">
            {textColors.map((color) => (
              <button
                key={color.value}
                className={cn(
                  'w-8 h-8 rounded border-2 transition-all hover:scale-110',
                  editor.isActive('textStyle', { color: color.value })
                    ? 'border-blue-500 ring-2 ring-blue-200'
                    : 'border-gray-300 dark:border-gray-600'
                )}
                style={{ backgroundColor: color.value }}
                onClick={() => applyTextColor(color.value)}
                title={color.name}
              />
            ))}
          </div>
        </div>
      </Dropdown>

      {/* محاذاة النص */}
      <Dropdown
        trigger={
          <>
            <AlignRight className="w-4 h-4" />
            <span>محاذاة</span>
          </>
        }
      >
        <div className="p-2">
          <button
            onClick={() => editor.chain().focus().setTextAlign('right').run()}
            className={cn(
              "flex items-center gap-2 w-full px-3 py-2 text-sm rounded hover:bg-gray-100 dark:hover:bg-gray-700",
              editor.isActive({ textAlign: 'right' }) && "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300"
            )}
          >
            <AlignRight className="w-4 h-4" />
            يمين
          </button>
          <button
            onClick={() => editor.chain().focus().setTextAlign('center').run()}
            className={cn(
              "flex items-center gap-2 w-full px-3 py-2 text-sm rounded hover:bg-gray-100 dark:hover:bg-gray-700",
              editor.isActive({ textAlign: 'center' }) && "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300"
            )}
          >
            <AlignCenter className="w-4 h-4" />
            وسط
          </button>
          <button
            onClick={() => editor.chain().focus().setTextAlign('left').run()}
            className={cn(
              "flex items-center gap-2 w-full px-3 py-2 text-sm rounded hover:bg-gray-100 dark:hover:bg-gray-700",
              editor.isActive({ textAlign: 'left' }) && "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300"
            )}
          >
            <AlignLeft className="w-4 h-4" />
            يسار
          </button>
          <button
            onClick={() => editor.chain().focus().setTextAlign('justify').run()}
            className={cn(
              "flex items-center gap-2 w-full px-3 py-2 text-sm rounded hover:bg-gray-100 dark:hover:bg-gray-700",
              editor.isActive({ textAlign: 'justify' }) && "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300"
            )}
          >
            <AlignJustify className="w-4 h-4" />
            ضبط
          </button>
        </div>
      </Dropdown>

      {/* القوائم */}
      <Dropdown
        trigger={
          <>
            <List className="w-4 h-4" />
            <span>قوائم</span>
          </>
        }
      >
        <div className="p-2">
          <button
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={cn(
              "flex items-center gap-2 w-full px-3 py-2 text-sm rounded hover:bg-gray-100 dark:hover:bg-gray-700",
              editor.isActive('bulletList') && "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300"
            )}
          >
            <List className="w-4 h-4" />
            قائمة نقطية
          </button>
          <button
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={cn(
              "flex items-center gap-2 w-full px-3 py-2 text-sm rounded hover:bg-gray-100 dark:hover:bg-gray-700",
              editor.isActive('orderedList') && "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300"
            )}
          >
            <ListOrdered className="w-4 h-4" />
            قائمة مرقمة
          </button>
        </div>
      </Dropdown>

      {/* الرموز التعبيرية */}
      <Dropdown
        trigger={
          <>
            <Smile className="w-4 h-4" />
            <span>إيموجي</span>
          </>
        }
      >
        <div className="p-3 w-64">
          <div className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
            رموز تعبيرية شائعة
          </div>
          <div className="grid grid-cols-8 gap-1 max-h-32 overflow-y-auto">
            {commonEmojis.map((emoji, index) => (
              <button
                key={index}
                onClick={() => insertEmoji(emoji)}
                className="p-2 text-lg hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                title={emoji}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      </Dropdown>

      <div className="w-px h-6 bg-gray-300 dark:bg-gray-600" />

      {/* أدوات الوسائط */}
      <div className="flex items-center gap-1">
        <ImageUploadCompact editor={editor} />
        
        <button
          onClick={insertLink}
          className={cn(
            "p-2 rounded-lg transition-colors",
            editor.isActive('link')
              ? "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300"
              : "hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
          )}
          title="إدراج رابط"
        >
          <Link className="w-4 h-4" />
        </button>
        
        <button
          onClick={insertYoutube}
          className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors"
          title="إدراج فيديو YouTube"
        >
          <Youtube className="w-4 h-4" />
        </button>
      </div>

      <div className="w-px h-6 bg-gray-300 dark:bg-gray-600" />

      {/* أدوات أخرى */}
      <Dropdown
        trigger={
          <>
            <MoreHorizontal className="w-4 h-4" />
            <span>المزيد</span>
          </>
        }
      >
        <div className="p-2">
          <button
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            className={cn(
              "flex items-center gap-2 w-full px-3 py-2 text-sm rounded hover:bg-gray-100 dark:hover:bg-gray-700",
              editor.isActive('blockquote') && "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300"
            )}
          >
            <Quote className="w-4 h-4" />
            اقتباس
          </button>
          <button
            onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}
            className="flex items-center gap-2 w-full px-3 py-2 text-sm rounded hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <Table className="w-4 h-4" />
            جدول
          </button>
        </div>
      </Dropdown>

      <div className="w-px h-6 bg-gray-300 dark:bg-gray-600" />

      {/* تراجع وإعادة */}
      <div className="flex items-center gap-1">
        <button
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          title="تراجع"
        >
          <Undo className="w-4 h-4" />
        </button>
        
        <button
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          title="إعادة"
        >
          <Redo className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

