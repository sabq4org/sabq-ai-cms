'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import TextStyle from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Table from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableHeader from '@tiptap/extension-table-header';
import TableCell from '@tiptap/extension-table-cell';
import Youtube from '@tiptap/extension-youtube';

import { ImprovedToolbar } from './toolbar/ImprovedToolbar';
import { AdvancedEditorProps, EditorState } from './types';
import { cn } from '@/lib/utils';
import { useDebounce } from '@/hooks/useDebounce';
import toast from 'react-hot-toast';
export function AdvancedEditor({
  initialContent = '',
  config = {},
  toolbarConfig = {},
  callbacks = {},
  className,
  style
}: AdvancedEditorProps) {
  const [editorState, setEditorState] = useState<EditorState>({
    content: initialContent,
    wordCount: 0,
    characterCount: 0,
    readingTime: 0,
    isDirty: false,
    isLoading: false,
    isSaving: false
  });

  const [isFocused, setIsFocused] = useState(false);
  const debouncedContent = useDebounce(editorState.content, config.autoSaveInterval || 2000);

  // إعداد المحرر مع الإضافات المتاحة
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Underline,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
        alignments: ['left', 'center', 'right', 'justify'],
        defaultAlignment: config.rtl ? 'right' : 'left',
      }),
      TextStyle,
      Color,
      Image.configure({
        inline: true,
        allowBase64: true,
        HTMLAttributes: {
          class: 'editor-image',
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'editor-link',
          rel: 'noopener noreferrer',
          target: '_blank',
        },
      }),
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
      Youtube.configure({
        width: 640,
        height: 480,
        ccLanguage: 'ar',
      }),
    ],
    content: initialContent,
    editable: config.editable !== false,
    autofocus: config.autofocus || false,
    onUpdate: ({ editor }) => {
      const content = editor.getHTML();
      const text = editor.getText();
      
      setEditorState(prev => ({
        ...prev,
        content,
        wordCount: text.split(/\s+/).filter(word => word.length > 0).length,
        characterCount: text.length,
        readingTime: Math.ceil(text.split(/\s+/).length / 200), // متوسط 200 كلمة في الدقيقة
        isDirty: content !== initialContent
      }));

      callbacks.onChange?.(content);
    },
    onFocus: () => {
      setIsFocused(true);
      callbacks.onFocus?.();
    },
    onBlur: () => {
      setIsFocused(false);
      callbacks.onBlur?.();
    },
    onSelectionUpdate: ({ editor }) => {
      callbacks.onSelectionChange?.(editor.state.selection);
    },
  });

  // الحفظ التلقائي
  useEffect(() => {
    if (
      config.enableAutoSave && 
      debouncedContent && 
      debouncedContent !== initialContent &&
      callbacks.onSave
    ) {
      handleAutoSave();
    }
  }, [debouncedContent]);

  const handleAutoSave = useCallback(async () => {
    if (!callbacks.onSave || editorState.isSaving) return;

    setEditorState(prev => ({ ...prev, isSaving: true }));

    try {
      await callbacks.onSave(editorState.content);
      setEditorState(prev => ({ 
        ...prev, 
        isSaving: false, 
        lastSaved: new Date(),
        isDirty: false 
      }));
      
      if (config.enableAutoSave) {
        toast.success('تم الحفظ تلقائياً', { 
          icon: '💾', 
          duration: 1000,
          position: 'bottom-right'
        });
      }
    } catch (error) {
      setEditorState(prev => ({ ...prev, isSaving: false }));
      callbacks.onError?.('فشل في الحفظ التلقائي');
      toast.error('فشل في الحفظ التلقائي');
    }
  }, [editorState.content, callbacks, config.enableAutoSave]);

  // حفظ يدوي
  const handleManualSave = useCallback(async () => {
    if (!callbacks.onSave || editorState.isSaving) return;

    setEditorState(prev => ({ ...prev, isSaving: true }));

    try {
      await callbacks.onSave(editorState.content);
      setEditorState(prev => ({ 
        ...prev, 
        isSaving: false, 
        lastSaved: new Date(),
        isDirty: false 
      }));
      toast.success('تم الحفظ بنجاح', { icon: '✅' });
    } catch (error) {
      setEditorState(prev => ({ ...prev, isSaving: false }));
      callbacks.onError?.('فشل في الحفظ');
      toast.error('فشل في الحفظ');
    }
  }, [editorState.content, callbacks]);

  // اختصارات لوحة المفاتيح
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Ctrl+S للحفظ
      if ((event.ctrlKey || event.metaKey) && event.key === 's') {
        event.preventDefault();
        handleManualSave();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleManualSave]);

  if (!editor) {
    return (
      <div className="animate-pulse">
        <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded-t-lg mb-1" />
        <div className="h-96 bg-gray-100 dark:bg-gray-800 rounded-b-lg" />
      </div>
    );
  }

  return (
    <div 
      className={cn(
        'border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden bg-white dark:bg-gray-900',
        isFocused && 'ring-2 ring-blue-500 border-transparent',
        className
      )}
      style={style}
    >
      {/* شريط الأدوات */}
      <ImprovedToolbar editor={editor} />

      {/* منطقة التحرير */}
      <div className="relative flex-1 overflow-hidden">
        <EditorContent
          editor={editor}
          className={cn(
            'prose prose-lg max-w-none dark:prose-invert p-6 min-h-[500px] focus:outline-none',
            'prose-headings:text-gray-900 dark:prose-headings:text-gray-100',
            'prose-p:text-gray-700 dark:prose-p:text-gray-300',
            'prose-strong:text-gray-900 dark:prose-strong:text-gray-100',
            'prose-blockquote:border-r-4 prose-blockquote:border-blue-500 prose-blockquote:bg-blue-50 dark:prose-blockquote:bg-blue-900/20',
            'prose-code:bg-gray-100 dark:prose-code:bg-gray-800 prose-code:px-1 prose-code:py-0.5 prose-code:rounded',
            config.rtl && 'text-right [&_*]:text-right',
            config.maxLength && editorState.characterCount > config.maxLength && 'border-red-500'
          )}
          style={{ 
            direction: config.rtl ? 'rtl' : 'ltr',
            minHeight: '500px',
            maxHeight: 'calc(100vh - 300px)',
            overflowY: 'auto'
          }}
        />

        {/* مؤشر الحفظ */}
        {editorState.isSaving && (
          <div className="absolute top-4 left-4 flex items-center gap-2 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-3 py-1 rounded-full text-sm">
            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600" />
            جاري الحفظ...
          </div>
        )}

        {/* placeholder مخصص */}
        {!editorState.content && !isFocused && config.placeholder && (
          <div className="absolute top-4 right-4 text-gray-400 pointer-events-none">
            {config.placeholder}
          </div>
        )}
      </div>

      {/* شريط الحالة */}
      <div className="flex items-center justify-between px-4 py-2 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 text-sm text-gray-600 dark:text-gray-400">
        <div className="flex items-center gap-4">
          {/* إحصائيات */}
          {config.enableWordCount && (
            <span>الكلمات: {editorState.wordCount}</span>
          )}
          {config.enableCharacterCount && (
            <span>
              الأحرف: {editorState.characterCount}
              {config.maxLength && ` / ${config.maxLength}`}
            </span>
          )}
          {config.enableReadingTime && (
            <span>وقت القراءة: {editorState.readingTime} دقيقة</span>
          )}
        </div>

        <div className="flex items-center gap-4">
          {/* حالة الحفظ */}
          {editorState.lastSaved && (
            <span className="text-xs">
              آخر حفظ: {editorState.lastSaved.toLocaleTimeString('ar-SA')}
            </span>
          )}
          
          {/* مؤشر التغييرات */}
          {editorState.isDirty && (
            <span className="text-orange-500">• غير محفوظ</span>
          )}

          {/* زر الحفظ اليدوي */}
          {callbacks.onSave && (
            <button
              onClick={handleManualSave}
              disabled={editorState.isSaving || !editorState.isDirty}
              className={cn(
                'px-3 py-1 text-xs font-medium rounded transition-colors',
                editorState.isSaving || !editorState.isDirty
                  ? 'bg-gray-200 dark:bg-gray-700 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              )}
            >
              {editorState.isSaving ? 'جاري الحفظ...' : 'حفظ (Ctrl+S)'}
            </button>
          )}
        </div>
      </div>

      {/* تحذير الحد الأقصى للأحرف */}
      {config.maxLength && editorState.characterCount > config.maxLength && (
        <div className="px-4 py-2 bg-red-50 dark:bg-red-900 border-t border-red-200 dark:border-red-700 text-red-700 dark:text-red-300 text-sm">
          تجاوزت الحد الأقصى للأحرف بـ {editorState.characterCount - config.maxLength} حرف
        </div>
      )}

      {/* أنماط CSS مخصصة */}
      <style jsx global>{`
        .ProseMirror {
          outline: none;
        }
        
        .ProseMirror .editor-image {
          max-width: 100%;
          height: auto;
          border-radius: 8px;
          margin: 16px 0;
        }
        
        .ProseMirror .editor-link {
          color: #3b82f6;
          text-decoration: underline;
        }
        
        .ProseMirror .social-embed {
          margin: 20px 0;
          padding: 16px;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          background: #f9fafb;
        }
        
        .ProseMirror .youtube-embed iframe {
          width: 100%;
          max-width: 560px;
          height: 315px;
          border-radius: 8px;
        }
        
        .ProseMirror pre {
          background: #1f2937;
          color: #f9fafb;
          padding: 16px;
          border-radius: 8px;
          overflow-x: auto;
          font-family: 'Courier New', monospace;
        }
        
        .ProseMirror blockquote {
          border-right: 4px solid #3b82f6;
          padding-right: 16px;
          margin: 16px 0;
          font-style: italic;
          color: #6b7280;
        }
        
        .ProseMirror table {
          border-collapse: collapse;
          width: 100%;
          margin: 16px 0;
        }
        
        .ProseMirror table td,
        .ProseMirror table th {
          border: 1px solid #d1d5db;
          padding: 8px 12px;
          text-align: right;
        }
        
        .ProseMirror table th {
          background: #f3f4f6;
          font-weight: bold;
        }
        
        .ProseMirror .tableWrapper {
          overflow-x: auto;
        }
        
        .ProseMirror .selectedCell:after {
          background: rgba(59, 130, 246, 0.1);
          content: "";
          left: 0;
          right: 0;
          top: 0;
          bottom: 0;
          pointer-events: none;
          position: absolute;
          z-index: 2;
        }
      `}</style>
    </div>
  );
}

