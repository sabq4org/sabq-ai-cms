'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import TextAlign from '@tiptap/extension-text-align';
import Underline from '@tiptap/extension-underline';
import { 
  Bold, 
  Italic, 
  Underline as UnderlineIcon,
  List,
  ListOrdered,
  Quote,
  Undo,
  Redo,
  Link as LinkIcon,
  Image as ImageIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Toggle } from '@/components/ui/toggle';
import { Separator } from '@/components/ui/separator';

interface ArticleEditorProps {
  initialContent: string;
  onChange: (content: string) => void;
}

export default function ArticleEditor({ initialContent, onChange }: ArticleEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Placeholder.configure({
        placeholder: 'ابدأ بكتابة محتوى المقال...',
      }),
      Link.configure({
        openOnClick: false,
      }),
      Image,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Underline,
    ],
    content: initialContent,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-lg max-w-none focus:outline-none min-h-[400px] p-6',
      },
    },
  });

  if (!editor) {
    return null;
  }

  const addLink = () => {
    const url = window.prompt('أدخل رابط URL:');
    if (url) {
      editor.chain().focus().setLink({ href: url }).run();
    }
  };

  const addImage = () => {
    const url = window.prompt('أدخل رابط الصورة:');
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };

  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="bg-gray-50 dark:bg-gray-800 border-b p-2 flex items-center gap-1 flex-wrap">
        {/* Text Formatting */}
        <div className="flex items-center gap-1">
          <Toggle
            size="sm"
            pressed={editor.isActive('bold')}
            onPressedChange={() => editor.chain().focus().toggleBold().run()}
          >
            <Bold className="h-4 w-4" />
          </Toggle>
          <Toggle
            size="sm"
            pressed={editor.isActive('italic')}
            onPressedChange={() => editor.chain().focus().toggleItalic().run()}
          >
            <Italic className="h-4 w-4" />
          </Toggle>
          <Toggle
            size="sm"
            pressed={editor.isActive('underline')}
            onPressedChange={() => editor.chain().focus().toggleUnderline().run()}
          >
            <UnderlineIcon className="h-4 w-4" />
          </Toggle>
        </div>

        <Separator orientation="vertical" className="h-6" />

        {/* Text Alignment */}
        <div className="flex items-center gap-1">
          <Toggle
            size="sm"
            pressed={editor.isActive({ textAlign: 'right' })}
            onPressedChange={() => editor.chain().focus().setTextAlign('right').run()}
          >
            <AlignRight className="h-4 w-4" />
          </Toggle>
          <Toggle
            size="sm"
            pressed={editor.isActive({ textAlign: 'center' })}
            onPressedChange={() => editor.chain().focus().setTextAlign('center').run()}
          >
            <AlignCenter className="h-4 w-4" />
          </Toggle>
          <Toggle
            size="sm"
            pressed={editor.isActive({ textAlign: 'left' })}
            onPressedChange={() => editor.chain().focus().setTextAlign('left').run()}
          >
            <AlignLeft className="h-4 w-4" />
          </Toggle>
          <Toggle
            size="sm"
            pressed={editor.isActive({ textAlign: 'justify' })}
            onPressedChange={() => editor.chain().focus().setTextAlign('justify').run()}
          >
            <AlignJustify className="h-4 w-4" />
          </Toggle>
        </div>

        <Separator orientation="vertical" className="h-6" />

        {/* Lists */}
        <div className="flex items-center gap-1">
          <Toggle
            size="sm"
            pressed={editor.isActive('bulletList')}
            onPressedChange={() => editor.chain().focus().toggleBulletList().run()}
          >
            <List className="h-4 w-4" />
          </Toggle>
          <Toggle
            size="sm"
            pressed={editor.isActive('orderedList')}
            onPressedChange={() => editor.chain().focus().toggleOrderedList().run()}
          >
            <ListOrdered className="h-4 w-4" />
          </Toggle>
          <Toggle
            size="sm"
            pressed={editor.isActive('blockquote')}
            onPressedChange={() => editor.chain().focus().toggleBlockquote().run()}
          >
            <Quote className="h-4 w-4" />
          </Toggle>
        </div>

        <Separator orientation="vertical" className="h-6" />

        {/* Media */}
        <div className="flex items-center gap-1">
          <Button
            size="sm"
            variant="ghost"
            onClick={addLink}
            className="h-8"
          >
            <LinkIcon className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={addImage}
            className="h-8"
          >
            <ImageIcon className="h-4 w-4" />
          </Button>
        </div>

        <Separator orientation="vertical" className="h-6" />

        {/* History */}
        <div className="flex items-center gap-1">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
            className="h-8"
          >
            <Undo className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
            className="h-8"
          >
            <Redo className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <EditorContent 
        editor={editor} 
        className="min-h-[400px] [&_.ProseMirror]:min-h-[400px] [&_.ProseMirror]:p-6 [&_.ProseMirror]:focus:outline-none"
      />
    </div>
  );
}