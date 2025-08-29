'use client';

import React from 'react';
import { Editor } from '@tiptap/react';
import { 
  Bold, 
  Italic, 
  Underline, 
  Strikethrough,
  Code,
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
import { ImageUpload } from './ImageUpload';
import { GalleryUpload } from './GalleryUpload';
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
      "flex flex-wrap items-center gap-1 p-2 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800",
      className
    )}>
      {/* أدوات التراجع والإعادة */}
      <ToolbarButtonGroup>
        <ToolbarButton
          icon={<Undo className="h-4 w-4" />}
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          tooltip="تراجع (Ctrl+Z)"
        />
        <ToolbarButton
          icon={<Redo className="h-4 w-4" />}
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          tooltip="إعادة (Ctrl+Y)"
        />
      </ToolbarButtonGroup>

      <ToolbarSeparator />

      {/* أدوات التنسيق الأساسية */}
      <ToolbarButtonGroup>
        <ToolbarButton
          icon={<Bold className="h-4 w-4" />}
          isActive={editor.isActive('bold')}
          onClick={() => editor.chain().focus().toggleBold().run()}
          tooltip="عريض (Ctrl+B)"
        />
        <ToolbarButton
          icon={<Italic className="h-4 w-4" />}
          isActive={editor.isActive('italic')}
          onClick={() => editor.chain().focus().toggleItalic().run()}
          tooltip="مائل (Ctrl+I)"
        />
        <ToolbarButton
          icon={<Underline className="h-4 w-4" />}
          isActive={editor.isActive('underline')}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          tooltip="تحته خط (Ctrl+U)"
        />
        <ToolbarButton
          icon={<Strikethrough className="h-4 w-4" />}
          isActive={editor.isActive('strike')}
          onClick={() => editor.chain().focus().toggleStrike().run()}
          tooltip="يتوسطه خط"
        />
        <ToolbarButton
          icon={<Code className="h-4 w-4" />}
          isActive={editor.isActive('code')}
          onClick={() => editor.chain().focus().toggleCode().run()}
          tooltip="كود"
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
          isActive={editor.isActive('bulletList')}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          tooltip="قائمة نقطية"
        />
        <ToolbarButton
          icon={<ListOrdered className="h-4 w-4" />}
          isActive={editor.isActive('orderedList')}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          tooltip="قائمة مرقمة"
        />
        <ToolbarButton
          icon={<Quote className="h-4 w-4" />}
          isActive={editor.isActive('blockquote')}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          tooltip="اقتباس"
        />
      </ToolbarButtonGroup>

      <ToolbarSeparator />

      {/* أدوات الألوان والخطوط */}
      <ToolbarButtonGroup>
        <ColorPicker editor={editor} />
        <FontSelector editor={editor} />
      </ToolbarButtonGroup>

      <ToolbarSeparator />

      {/* أدوات الوسائط */}
      <ToolbarButtonGroup>
        <ImageUpload editor={editor} />
        <GalleryUpload editor={editor} />
        <ToolbarButton
          icon={<Link className="h-4 w-4" />}
          isActive={editor.isActive('link')}
          onClick={() => {
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
          }}
          tooltip="إدراج رابط"
        />
        <ToolbarButton
          icon={<Youtube className="h-4 w-4" />}
          onClick={() => {
            const url = window.prompt('رابط YouTube:');
            if (url) {
              editor.commands.setYoutubeVideo({
                src: url,
                width: 640,
                height: 480,
              });
            }
          }}
          tooltip="إدراج فيديو YouTube"
        />
      </ToolbarButtonGroup>

      <ToolbarSeparator />

      {/* أدوات إضافية */}
      <ToolbarButtonGroup>
        <EmojiPicker editor={editor} />
        <SocialMediaEmbed editor={editor} />
        
        <ToolbarDropdown
          icon={<Table className="h-4 w-4" />}
          tooltip="جدول"
        >
          <div className="p-2 space-y-1">
            <button
              className="block w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
              onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}
            >
              إدراج جدول 3×3
            </button>
            <button
              className="block w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
              onClick={() => editor.chain().focus().addColumnBefore().run()}
            >
              إضافة عمود قبل
            </button>
            <button
              className="block w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
              onClick={() => editor.chain().focus().addColumnAfter().run()}
            >
              إضافة عمود بعد
            </button>
            <button
              className="block w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
              onClick={() => editor.chain().focus().deleteColumn().run()}
            >
              حذف عمود
            </button>
            <button
              className="block w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
              onClick={() => editor.chain().focus().addRowBefore().run()}
            >
              إضافة صف قبل
            </button>
            <button
              className="block w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
              onClick={() => editor.chain().focus().addRowAfter().run()}
            >
              إضافة صف بعد
            </button>
            <button
              className="block w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
              onClick={() => editor.chain().focus().deleteRow().run()}
            >
              حذف صف
            </button>
            <button
              className="block w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-red-600"
              onClick={() => editor.chain().focus().deleteTable().run()}
            >
              حذف الجدول
            </button>
          </div>
        </ToolbarDropdown>
      </ToolbarButtonGroup>
    </div>
  );
}

