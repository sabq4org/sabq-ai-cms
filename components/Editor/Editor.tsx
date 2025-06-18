'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Underline from '@tiptap/extension-underline';
import Youtube from '@tiptap/extension-youtube';
import Placeholder from '@tiptap/extension-placeholder';
import TextAlign from '@tiptap/extension-text-align';
import Link from '@tiptap/extension-link';
import Table from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import { Color } from '@tiptap/extension-color';
import TextStyle from '@tiptap/extension-text-style';
import CharacterCount from '@tiptap/extension-character-count';
import { useEffect, forwardRef, useImperativeHandle } from 'react';
import EditorToolbar from './EditorToolbar';
import EditorStyles from './EditorStyles';
import { useDarkMode } from '@/hooks/useDarkMode';

interface EditorProps {
  content?: any;
  onChange?: (content: any) => void;
  placeholder?: string;
  enableAI?: boolean;
  onAIAction?: (action: string, content: string) => void;
}

export interface EditorRef {
  getContent: () => any;
  getHTML: () => string;
  setContent: (content: any) => void;
  clearContent: () => void;
}

const Editor = forwardRef<EditorRef, EditorProps>(({
  content = '',
  onChange,
  placeholder = 'ابدأ كتابة مقالك هنا...',
  enableAI = true,
  onAIAction
}, ref) => {
  const { darkMode } = useDarkMode();

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3, 4, 5, 6]
        }
      }),
      Underline,
      Image.configure({
        inline: true,
        allowBase64: true,
        HTMLAttributes: {
          class: 'rounded-lg max-w-full h-auto'
        }
      }),
      Youtube.configure({
        modestBranding: true,
        HTMLAttributes: {
          class: 'rounded-lg overflow-hidden'
        }
      }),
      Placeholder.configure({
        placeholder,
        emptyEditorClass: 'is-editor-empty',
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
        alignments: ['left', 'center', 'right', 'justify'],
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-600 dark:text-blue-400 underline hover:no-underline',
          target: '_blank',
          rel: 'noopener noreferrer'
        }
      }),
      Table.configure({
        resizable: true,
        HTMLAttributes: {
          class: 'border-collapse table-auto w-full'
        }
      }),
      TableRow,
      TableHeader.configure({
        HTMLAttributes: {
          class: 'border border-gray-300 dark:border-gray-600 px-4 py-2 bg-gray-100 dark:bg-gray-800 font-bold'
        }
      }),
      TableCell.configure({
        HTMLAttributes: {
          class: 'border border-gray-300 dark:border-gray-600 px-4 py-2'
        }
      }),
      Color,
      TextStyle,
      CharacterCount.configure({
        limit: 10000,
      }),
    ],
    content,
    editorProps: {
      attributes: {
        class: `prose prose-lg dark:prose-invert max-w-full focus:outline-none min-h-[400px] px-6 py-4 ${
          darkMode ? 'text-gray-100' : 'text-gray-900'
        }`,
        dir: 'rtl',
        spellcheck: 'false'
      }
    },
    onUpdate: ({ editor }) => {
      const json = editor.getJSON();
      const html = editor.getHTML();
      onChange?.({ json, html });
    },
  });

  // إضافة الوظائف المرجعية
  useImperativeHandle(ref, () => ({
    getContent: () => editor?.getJSON(),
    getHTML: () => editor?.getHTML() || '',
    setContent: (newContent) => {
      if (editor && newContent) {
        if (typeof newContent === 'string') {
          editor.commands.setContent(newContent);
        } else {
          editor.commands.setContent(newContent);
        }
      }
    },
    clearContent: () => editor?.commands.clearContent()
  }));

  // تحديث المحتوى عند تغييره من الخارج
  useEffect(() => {
    if (editor && content && editor.getHTML() !== content) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  // معالج لإجراءات الذكاء الاصطناعي
  const handleAIAction = (action: string) => {
    if (!editor) return;
    
    const selection = editor.state.selection;
    const { from, to } = selection;
    const selectedText = editor.state.doc.textBetween(from, to, ' ');
    
    if (onAIAction) {
      onAIAction(action, selectedText || editor.getText());
    }
  };

  // إدراج نتيجة الذكاء الاصطناعي
  const insertAIResult = (result: string) => {
    if (!editor) return;
    
    const { from, to } = editor.state.selection;
    if (from !== to) {
      // استبدال النص المحدد
      editor.chain().focus().deleteRange({ from, to }).insertContent(result).run();
    } else {
      // إدراج في موضع المؤشر
      editor.chain().focus().insertContent(result).run();
    }
  };

  // تعريض دالة insertAIResult للاستخدام الخارجي
  useEffect(() => {
    if (window && editor) {
      (window as any).editorInsertAIResult = insertAIResult;
    }
  }, [editor]);

  if (!editor) {
    return null;
  }

  return (
    <>
      <EditorStyles />
      <div className={`relative rounded-lg border-2 overflow-hidden transition-all duration-300 ${
        darkMode 
          ? 'bg-gray-900 border-gray-700 hover:border-gray-600' 
          : 'bg-white border-gray-200 hover:border-gray-300'
      }`}>
        <EditorToolbar 
          editor={editor} 
          enableAI={enableAI}
          onAIAction={handleAIAction}
        />
        
        <div className={`relative ${darkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <EditorContent 
            editor={editor} 
            className="editor-content"
          />
          
          {/* مؤشر عدد الكلمات */}
          <div className={`absolute bottom-2 left-2 text-xs ${
            darkMode ? 'text-gray-500' : 'text-gray-400'
          }`}>
            {editor.storage.characterCount?.words() || 0} كلمة • {editor.storage.characterCount?.characters() || 0} حرف
          </div>
        </div>
      </div>
    </>
  );
});

Editor.displayName = 'Editor';

export default Editor; 