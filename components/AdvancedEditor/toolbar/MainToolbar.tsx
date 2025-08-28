'use client';

import React from 'react';
import { Editor } from '@tiptap/react';
import { 
  Bold, 
  Italic, 
  Underline, 
  Strikethrough,
  Code,
  Subscript,
  Superscript,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  List,
  ListOrdered,
  Quote,
  Table,
  Image,
  Link,
  Youtube,
  Palette,
  Type,
  Undo,
  Redo,
  Smile,
  Hash,
  Share2,
  ChevronDown
} from 'lucide-react';
import { ToolbarButton, ToolbarButtonGroup, ToolbarSeparator, ToolbarDropdown } from './ToolbarButton';
import { ColorPicker } from './ColorPicker';
import { FontSelector } from './FontSelector';
import { EmojiPicker } from './EmojiPicker';
import { SocialMediaEmbed } from './SocialMediaEmbed';
import { cn } from '@/lib/utils';

interface MainToolbarProps {
  editor: Editor | null;
  className?: string;
}

export function MainToolbar({ editor, className }: MainToolbarProps) {
  if (!editor) {
    return null;
  }

  return (
    <div className={cn(
      'flex flex-wrap items-center gap-1 p-2 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800',
      className
    )}>
      {/* مجموعة التراجع والإعادة */}
      <ToolbarButtonGroup>
        <ToolbarButton
          icon={<Undo className="h-4 w-4" />}
          tooltip="تراجع (Ctrl+Z)"
          onClick={() => editor.chain().focus().undo().run()}
          isDisabled={!editor.can().undo()}
        />
        <ToolbarButton
          icon={<Redo className="h-4 w-4" />}
          tooltip="إعادة (Ctrl+Y)"
          onClick={() => editor.chain().focus().redo().run()}
          isDisabled={!editor.can().redo()}
        />
      </ToolbarButtonGroup>

      <ToolbarSeparator />

      {/* مجموعة التنسيق الأساسي */}
      <ToolbarButtonGroup>
        <ToolbarButton
          icon={<Bold className="h-4 w-4" />}
          tooltip="غامق (Ctrl+B)"
          isActive={editor.isActive('bold')}
          onClick={() => editor.chain().focus().toggleBold().run()}
        />
        <ToolbarButton
          icon={<Italic className="h-4 w-4" />}
          tooltip="مائل (Ctrl+I)"
          isActive={editor.isActive('italic')}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        />
        <ToolbarButton
          icon={<Underline className="h-4 w-4" />}
          tooltip="تحته خط (Ctrl+U)"
          isActive={editor.isActive('underline')}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
        />
        <ToolbarButton
          icon={<Strikethrough className="h-4 w-4" />}
          tooltip="يتوسطه خط"
          isActive={editor.isActive('strike')}
          onClick={() => editor.chain().focus().toggleStrike().run()}
        />
        <ToolbarButton
          icon={<Code className="h-4 w-4" />}
          tooltip="كود مضمن"
          isActive={editor.isActive('code')}
          onClick={() => editor.chain().focus().toggleCode().run()}
        />
      </ToolbarButtonGroup>

      <ToolbarSeparator />

      {/* مجموعة النص المرتفع والمنخفض */}
      <ToolbarButtonGroup>
        <ToolbarButton
          icon={<Superscript className="h-4 w-4" />}
          tooltip="نص مرتفع"
          isActive={editor.isActive('superscript')}
          onClick={() => editor.chain().focus().toggleSuperscript().run()}
        />
        <ToolbarButton
          icon={<Subscript className="h-4 w-4" />}
          tooltip="نص منخفض"
          isActive={editor.isActive('subscript')}
          onClick={() => editor.chain().focus().toggleSubscript().run()}
        />
      </ToolbarButtonGroup>

      <ToolbarSeparator />

      {/* مجموعة المحاذاة */}
      <ToolbarButtonGroup>
        <ToolbarButton
          icon={<AlignRight className="h-4 w-4" />}
          tooltip="محاذاة يمين"
          isActive={editor.isActive({ textAlign: 'right' })}
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
        />
        <ToolbarButton
          icon={<AlignCenter className="h-4 w-4" />}
          tooltip="محاذاة وسط"
          isActive={editor.isActive({ textAlign: 'center' })}
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
        />
        <ToolbarButton
          icon={<AlignLeft className="h-4 w-4" />}
          tooltip="محاذاة يسار"
          isActive={editor.isActive({ textAlign: 'left' })}
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
        />
        <ToolbarButton
          icon={<AlignJustify className="h-4 w-4" />}
          tooltip="ضبط"
          isActive={editor.isActive({ textAlign: 'justify' })}
          onClick={() => editor.chain().focus().setTextAlign('justify').run()}
        />
      </ToolbarButtonGroup>

      <ToolbarSeparator />

      {/* مجموعة القوائم */}
      <ToolbarButtonGroup>
        <ToolbarButton
          icon={<List className="h-4 w-4" />}
          tooltip="قائمة نقطية"
          isActive={editor.isActive('bulletList')}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        />
        <ToolbarButton
          icon={<ListOrdered className="h-4 w-4" />}
          tooltip="قائمة مرقمة"
          isActive={editor.isActive('orderedList')}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        />
      </ToolbarButtonGroup>

      <ToolbarSeparator />

      {/* مجموعة الاقتباس والكود */}
      <ToolbarButtonGroup>
        <ToolbarDropdown
          trigger={
            <ToolbarButton
              icon={<Quote className="h-4 w-4" />}
              tooltip="اقتباس"
              isActive={editor.isActive('blockquote')}
              onClick={() => editor.chain().focus().toggleBlockquote().run()}
            />
          }
        >
          <QuoteStylePicker editor={editor} />
        </ToolbarDropdown>
        
        <ToolbarDropdown
          trigger={
            <ToolbarButton
              icon={<Hash className="h-4 w-4" />}
              tooltip="كتلة كود"
              isActive={editor.isActive('codeBlock')}
              onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            />
          }
        >
          <CodeLanguagePicker editor={editor} />
        </ToolbarDropdown>
      </ToolbarButtonGroup>

      <ToolbarSeparator />

      {/* مجموعة الألوان والخطوط */}
      <ToolbarButtonGroup>
        <ToolbarDropdown
          trigger={
            <ToolbarButton
              icon={<Palette className="h-4 w-4" />}
              tooltip="الألوان"
            />
          }
        >
          <ColorPicker editor={editor} />
        </ToolbarDropdown>
        
        <ToolbarDropdown
          trigger={
            <ToolbarButton
              icon={<Type className="h-4 w-4" />}
              tooltip="الخطوط"
            />
          }
        >
          <FontSelector editor={editor} />
        </ToolbarDropdown>
      </ToolbarButtonGroup>

      <ToolbarSeparator />

      {/* مجموعة الوسائط */}
      <ToolbarButtonGroup>
        <ToolbarButton
          icon={<Image className="h-4 w-4" />}
          tooltip="إدراج صورة"
          onClick={() => {
            const url = window.prompt('رابط الصورة:');
            if (url) {
              editor.chain().focus().setImage({ src: url }).run();
            }
          }}
        />
        <ToolbarButton
          icon={<Link className="h-4 w-4" />}
          tooltip="إدراج رابط"
          isActive={editor.isActive('link')}
          onClick={() => {
            const url = window.prompt('الرابط:');
            if (url) {
              editor.chain().focus().setLink({ href: url }).run();
            }
          }}
        />
        <ToolbarButton
          icon={<Youtube className="h-4 w-4" />}
          tooltip="فيديو YouTube"
          onClick={() => {
            const url = window.prompt('رابط YouTube:');
            if (url) {
              editor.chain().focus().setYoutubeVideo({ src: url }).run();
            }
          }}
        />
        <ToolbarButton
          icon={<Table className="h-4 w-4" />}
          tooltip="إدراج جدول"
          onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}
        />
      </ToolbarButtonGroup>

      <ToolbarSeparator />

      {/* مجموعة الإضافات */}
      <ToolbarButtonGroup>
        <ToolbarDropdown
          trigger={
            <ToolbarButton
              icon={<Smile className="h-4 w-4" />}
              tooltip="رموز تعبيرية"
            />
          }
        >
          <EmojiPicker editor={editor} />
        </ToolbarDropdown>
        
        <ToolbarDropdown
          trigger={
            <ToolbarButton
              icon={<Share2 className="h-4 w-4" />}
              tooltip="وسائل التواصل"
            />
          }
        >
          <SocialMediaEmbed editor={editor} />
        </ToolbarDropdown>
      </ToolbarButtonGroup>
    </div>
  );
}

// مكونات مساعدة للقوائم المنسدلة
function QuoteStylePicker({ editor }: { editor: Editor }) {
  const quoteStyles = [
    { id: 'default', name: 'اقتباس عادي', className: '' },
    { id: 'highlighted', name: 'اقتباس مميز', className: 'quote-highlighted' },
    { id: 'bordered', name: 'اقتباس بإطار', className: 'quote-bordered' },
    { id: 'colored', name: 'اقتباس ملون', className: 'quote-colored' },
  ];

  return (
    <div className="p-2">
      <div className="text-sm font-medium mb-2">أنماط الاقتباس</div>
      {quoteStyles.map((style) => (
        <button
          key={style.id}
          className="block w-full text-right p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-sm"
          onClick={() => {
            editor.chain().focus().toggleBlockquote().run();
            // إضافة الكلاس المخصص هنا
          }}
        >
          {style.name}
        </button>
      ))}
    </div>
  );
}

function CodeLanguagePicker({ editor }: { editor: Editor }) {
  const languages = [
    { id: 'javascript', name: 'JavaScript' },
    { id: 'typescript', name: 'TypeScript' },
    { id: 'python', name: 'Python' },
    { id: 'java', name: 'Java' },
    { id: 'css', name: 'CSS' },
    { id: 'html', name: 'HTML' },
    { id: 'json', name: 'JSON' },
    { id: 'sql', name: 'SQL' },
  ];

  return (
    <div className="p-2">
      <div className="text-sm font-medium mb-2">لغة البرمجة</div>
      {languages.map((lang) => (
        <button
          key={lang.id}
          className="block w-full text-right p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-sm"
          onClick={() => {
            editor.chain().focus().toggleCodeBlock({ language: lang.id }).run();
          }}
        >
          {lang.name}
        </button>
      ))}
    </div>
  );
}

