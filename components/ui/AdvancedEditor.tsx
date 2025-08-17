'use client';

import React, { useEffect, useState } from 'react';
import { 
  Bold, Italic, Underline, List, ListOrdered, Quote, Link, 
  Image, Heading1, Heading2, Heading3, AlignRight, AlignCenter, AlignLeft,
  Undo, Redo, Type, Palette, Save
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface AdvancedEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
  darkMode?: boolean;
  className?: string;
  minHeight?: string;
}

const AdvancedEditor: React.FC<AdvancedEditorProps> = ({
  content,
  onChange,
  placeholder = "ابدأ الكتابة...",
  darkMode = false,
  className,
  minHeight = "400px"
}) => {
  const [editor, setEditor] = useState<any>(null);
  const [isClient, setIsClient] = useState(false);
  const editorRef = React.useRef<HTMLDivElement>(null);
  
  // تأكد من أن المكون يعمل فقط في العميل
  useEffect(() => {
    setIsClient(true);
  }, []);
  
  // تحميل TipTap فقط في العميل
  useEffect(() => {
    if (!isClient) return;
    
    let isMounted = true;
    let retryCount = 0;
    const maxRetries = 5;
    
    const initializeEditor = async () => {
      try {
        // تحميل TipTap dynamically
        const { Editor } = await import('@tiptap/core');
        const { StarterKit } = await import('@tiptap/starter-kit');
        const { TextAlign } = await import('@tiptap/extension-text-align');
        const { Link: LinkExtension } = await import('@tiptap/extension-link');
        const { Image: ImageExtension } = await import('@tiptap/extension-image');
        const { Placeholder } = await import('@tiptap/extension-placeholder');
        
        if (!isMounted) return;
        
        // التحقق من وجود عنصر DOM
        if (!editorRef.current) {
          console.error(`❌ عنصر المحرر غير جاهز بعد (محاولة ${retryCount + 1}/${maxRetries})`);
          
          if (retryCount < maxRetries) {
            retryCount++;
            // إعادة المحاولة بعد فترة قصيرة
            setTimeout(() => {
              if (isMounted) {
                initializeEditor();
              }
            }, 100 * retryCount); // زيادة التأخير مع كل محاولة
            return;
          } else {
            console.error('❌ فشل في العثور على عنصر المحرر بعد عدة محاولات');
            return;
          }
        }
        
        console.log('✅ عنصر المحرر جاهز، بدء التهيئة...');
        
        const editorInstance = new Editor({
          element: editorRef.current, // ✅ ربط المحرر بعنصر DOM
          extensions: [
            StarterKit.configure({
              // تخصيص العناوين لدعم RTL
              heading: {
                levels: [1, 2, 3, 4]
              }
            }),
            TextAlign.configure({
              types: ['heading', 'paragraph'],
              alignments: ['left', 'center', 'right'],
              defaultAlignment: 'right'
            }),
            LinkExtension.configure({
              openOnClick: false,
              HTMLAttributes: {
                class: 'text-blue-600 hover:text-blue-800 underline'
              }
            }),
            ImageExtension.configure({
              HTMLAttributes: {
                class: 'max-w-full h-auto rounded-lg'
              }
            }),
            Placeholder.configure({
              placeholder: placeholder
            })
          ],
          content: content,
          editorProps: {
            attributes: {
              class: cn(
                'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none',
                'prose-headings:text-right prose-p:text-right prose-li:text-right',
                darkMode ? 'prose-invert' : '',
                'min-h-[400px] p-4'
              ),
              dir: 'rtl'
            }
          },
          onUpdate: ({ editor }) => {
            const html = editor.getHTML();
            onChange(html);
          },
          onCreate: ({ editor }) => {
            console.log('✅ تم إنشاء المحرر بنجاح');
            editor.commands.focus();
          },
          onDestroy: () => {
            console.log('🔄 تم تدمير المحرر');
          }
        });
        
        setEditor(editorInstance);
        
      } catch (error) {
        console.error('خطأ في تحميل المحرر:', error);
        // استخدام textarea كبديل
      }
    };
    
    initializeEditor();
    
    return () => {
      isMounted = false;
      if (editor) {
        editor.destroy();
      }
    };
  }, [isClient]);
  
  // تحديث المحتوى عند تغييره من الخارج
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);
  
  // دوال التحكم في التنسيق
  const toggleBold = () => editor?.chain().focus().toggleBold().run();
  const toggleItalic = () => editor?.chain().focus().toggleItalic().run();
  const toggleUnderline = () => editor?.chain().focus().toggleUnderline().run();
  const toggleBulletList = () => editor?.chain().focus().toggleBulletList().run();
  const toggleOrderedList = () => editor?.chain().focus().toggleOrderedList().run();
  const toggleBlockquote = () => editor?.chain().focus().toggleBlockquote().run();
  
  const setHeading = (level: 1 | 2 | 3) => {
    editor?.chain().focus().toggleHeading({ level }).run();
  };
  
  const setTextAlign = (alignment: 'left' | 'center' | 'right') => {
    editor?.chain().focus().setTextAlign(alignment).run();
  };
  
  const addLink = () => {
    const url = window.prompt('أدخل رابط URL:');
    if (url) {
      editor?.chain().focus().setLink({ href: url }).run();
    }
  };
  
  const addImage = () => {
    const url = window.prompt('أدخل رابط الصورة:');
    if (url) {
      editor?.chain().focus().setImage({ src: url }).run();
    }
  };
  
  const undo = () => editor?.chain().focus().undo().run();
  const redo = () => editor?.chain().focus().redo().run();
  
  // إذا لم يتم تحميل المحرر بعد، اعرض textarea بديل
  if (!isClient || !editor) {
    return (
      <div className={cn('space-y-3', className)}>
        <div className={cn(
          'border rounded-lg p-3',
          darkMode ? 'border-gray-600 bg-gray-700' : 'border-gray-300 bg-gray-50'
        )}>
          <p className={cn('text-sm', darkMode ? 'text-gray-400' : 'text-gray-600')}>
            {!isClient ? '⏳ جاري تحميل المحرر...' : '🔧 جاري تهيئة المحرر المتقدم...'}
          </p>
          <p className={cn('text-xs mt-1', darkMode ? 'text-gray-500' : 'text-gray-500')}>
            💡 يمكنك البدء بالكتابة في المحرر البسيط أدناه
          </p>
        </div>
        <textarea
          value={content}
          onChange={(e) => {
            console.log('📝 [FALLBACK EDITOR] كتابة في المحرر البديل:', e.target.value.length, 'حرف');
            onChange(e.target.value);
          }}
          placeholder={placeholder}
          rows={15}
          dir="rtl"
          className={cn(
            'w-full p-4 rounded-lg border resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
            darkMode 
              ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
              : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
          )}
          style={{ minHeight: minHeight }}
        />
        <div className={cn('text-xs text-center', darkMode ? 'text-gray-500' : 'text-gray-500')}>
          📊 الكلمات: {content.split(/\s+/).filter(w => w.length > 0).length} | الأحرف: {content.length}
        </div>
      </div>
    );
  }
  
  return (
    <div className={cn('space-y-3', className)}>
      {/* شريط الأدوات */}
      <div className={cn(
        'flex flex-wrap items-center gap-1 p-3 rounded-lg border',
        darkMode ? 'border-gray-600 bg-gray-700' : 'border-gray-300 bg-gray-50'
      )}>
        
        {/* التراجع والإعادة */}
        <div className="flex items-center gap-1 pl-2 border-l border-gray-300 dark:border-gray-600">
          <button
            onClick={undo}
            className={cn(
              'p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors',
              editor?.can().undo() ? '' : 'opacity-50 cursor-not-allowed'
            )}
            disabled={!editor?.can().undo()}
            title="تراجع"
          >
            <Undo className="w-4 h-4" />
          </button>
          <button
            onClick={redo}
            className={cn(
              'p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors',
              editor?.can().redo() ? '' : 'opacity-50 cursor-not-allowed'
            )}
            disabled={!editor?.can().redo()}
            title="إعادة"
          >
            <Redo className="w-4 h-4" />
          </button>
        </div>
        
        {/* العناوين */}
        <div className="flex items-center gap-1 pl-2 border-l border-gray-300 dark:border-gray-600">
          <button
            onClick={() => setHeading(1)}
            className={cn(
              'p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors',
              editor?.isActive('heading', { level: 1 }) && 'bg-blue-200 dark:bg-blue-800'
            )}
            title="عنوان رئيسي"
          >
            <Heading1 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setHeading(2)}
            className={cn(
              'p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors',
              editor?.isActive('heading', { level: 2 }) && 'bg-blue-200 dark:bg-blue-800'
            )}
            title="عنوان فرعي"
          >
            <Heading2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setHeading(3)}
            className={cn(
              'p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors',
              editor?.isActive('heading', { level: 3 }) && 'bg-blue-200 dark:bg-blue-800'
            )}
            title="عنوان صغير"
          >
            <Heading3 className="w-4 h-4" />
          </button>
        </div>
        
        {/* التنسيق */}
        <div className="flex items-center gap-1 pl-2 border-l border-gray-300 dark:border-gray-600">
          <button
            onClick={toggleBold}
            className={cn(
              'p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors',
              editor?.isActive('bold') && 'bg-blue-200 dark:bg-blue-800'
            )}
            title="عريض"
          >
            <Bold className="w-4 h-4" />
          </button>
          <button
            onClick={toggleItalic}
            className={cn(
              'p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors',
              editor?.isActive('italic') && 'bg-blue-200 dark:bg-blue-800'
            )}
            title="مائل"
          >
            <Italic className="w-4 h-4" />
          </button>
          <button
            onClick={toggleUnderline}
            className={cn(
              'p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors',
              editor?.isActive('underline') && 'bg-blue-200 dark:bg-blue-800'
            )}
            title="تحته خط"
          >
            <Underline className="w-4 h-4" />
          </button>
        </div>
        
        {/* المحاذاة */}
        <div className="flex items-center gap-1 pl-2 border-l border-gray-300 dark:border-gray-600">
          <button
            onClick={() => setTextAlign('right')}
            className={cn(
              'p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors',
              editor?.isActive({ textAlign: 'right' }) && 'bg-blue-200 dark:bg-blue-800'
            )}
            title="محاذاة يمين"
          >
            <AlignRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => setTextAlign('center')}
            className={cn(
              'p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors',
              editor?.isActive({ textAlign: 'center' }) && 'bg-blue-200 dark:bg-blue-800'
            )}
            title="محاذاة وسط"
          >
            <AlignCenter className="w-4 h-4" />
          </button>
          <button
            onClick={() => setTextAlign('left')}
            className={cn(
              'p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors',
              editor?.isActive({ textAlign: 'left' }) && 'bg-blue-200 dark:bg-blue-800'
            )}
            title="محاذاة يسار"
          >
            <AlignLeft className="w-4 h-4" />
          </button>
        </div>
        
        {/* القوائم */}
        <div className="flex items-center gap-1 pl-2 border-l border-gray-300 dark:border-gray-600">
          <button
            onClick={toggleBulletList}
            className={cn(
              'p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors',
              editor?.isActive('bulletList') && 'bg-blue-200 dark:bg-blue-800'
            )}
            title="قائمة نقطية"
          >
            <List className="w-4 h-4" />
          </button>
          <button
            onClick={toggleOrderedList}
            className={cn(
              'p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors',
              editor?.isActive('orderedList') && 'bg-blue-200 dark:bg-blue-800'
            )}
            title="قائمة مرقمة"
          >
            <ListOrdered className="w-4 h-4" />
          </button>
          <button
            onClick={toggleBlockquote}
            className={cn(
              'p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors',
              editor?.isActive('blockquote') && 'bg-blue-200 dark:bg-blue-800'
            )}
            title="اقتباس"
          >
            <Quote className="w-4 h-4" />
          </button>
        </div>
        
        {/* الروابط والصور */}
        <div className="flex items-center gap-1">
          <button
            onClick={addLink}
            className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            title="إضافة رابط"
          >
            <Link className="w-4 h-4" />
          </button>
          <button
            onClick={addImage}
            className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            title="إضافة صورة"
          >
            <Image className="w-4 h-4" />
          </button>
        </div>
      </div>
      
      {/* منطقة التحرير */}
      <div 
        className={cn(
          'border rounded-lg overflow-hidden',
          darkMode ? 'border-gray-600 bg-gray-800' : 'border-gray-300 bg-white'
        )}
        style={{ minHeight: minHeight }}
      >
        <div 
          ref={editorRef}
          className={cn(
            'w-full focus:outline-none',
            darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'
          )}
        />
      </div>
      
      {/* معلومات المحرر */}
      <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
        <span>الكلمات: {editor?.storage?.characterCount?.words() || 0}</span>
        <span>الأحرف: {editor?.storage?.characterCount?.characters() || 0}</span>
      </div>
    </div>
  );
};

export default AdvancedEditor;