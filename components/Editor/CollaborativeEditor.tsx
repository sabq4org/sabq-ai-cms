/**
 * محرر الأخبار التعاوني الذكي
 * Smart Collaborative News Editor
 */

'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from '@/components/ui/separator';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { createClient } from '@supabase/supabase-js';
import Collaboration from '@tiptap/extension-collaboration';
import CollaborationCursor from '@tiptap/extension-collaboration-cursor';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import TextAlign from '@tiptap/extension-text-align';
import Typography from '@tiptap/extension-typography';
import { BubbleMenu, EditorContent, FloatingMenu, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import {
    AlignCenter,
    AlignLeft,
    AlignRight,
    Bold,
    Eye,
    Heading1,
    Heading2,
    Heading3,
    Image as ImageIcon,
    Italic,
    Link as LinkIcon,
    List,
    ListOrdered,
    Quote,
    Redo,
    Save,
    Undo,
    Users
} from 'lucide-react';
import React, { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { WebsocketProvider } from 'y-websocket';
import * as Y from 'yjs';

// إعداد Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  color: string;
}

interface CollaborativeEditorProps {
  documentId: string;
  currentUser: User;
  initialContent?: any;
  onSave?: (content: any) => void;
  readOnly?: boolean;
  className?: string;
}

// ألوان المستخدمين للتعاون
const userColors = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FECA57',
  '#FF9FF3', '#54A0FF', '#5F27CD', '#00D2D3', '#FF9F43',
  '#10AC84', '#EE5A24', '#0984E3', '#6C5CE7', '#A29BFE'
];

const CollaborativeEditor: React.FC<CollaborativeEditorProps> = ({
  documentId,
  currentUser,
  initialContent,
  onSave,
  readOnly = false,
  className = ''
}) => {
  const [isConnected, setIsConnected] = useState(false);
  const [connectedUsers, setConnectedUsers] = useState<User[]>([]);
  const [ydoc] = useState(() => new Y.Doc());
  const [provider, setProvider] = useState<WebsocketProvider | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');

  // إعداد المحرر
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        history: false, // تعطيل التاريخ لأن Collaboration يدير ذلك
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Placeholder.configure({
        placeholder: readOnly ? 'المحتوى محمي من التعديل...' : 'ابدأ كتابة الخبر هنا... اكتب "/" للحصول على قائمة الأوامر',
        showOnlyWhenEditable: true,
      }),
      Collaboration.configure({
        document: ydoc,
      }),
      CollaborationCursor.configure({
        provider: provider || undefined,
        user: {
          name: currentUser.name,
          color: currentUser.color,
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'rounded-lg max-w-full h-auto',
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-600 hover:text-blue-800 underline',
          dir: 'ltr',
        },
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
        alignments: ['left', 'center', 'right'],
        defaultAlignment: 'right',
      }),
      Typography,
    ],
    content: initialContent,
    editable: !readOnly,
    editorProps: {
      attributes: {
        class: `prose prose-lg max-w-none focus:outline-none ${readOnly ? 'prose-gray' : ''} rtl`,
        dir: 'rtl',
        style: 'min-height: 400px; padding: 1rem;',
      },
    },
    onUpdate: ({ editor }) => {
      // حفظ تلقائي كل 30 ثانية
      if (!readOnly) {
        debouncedSave();
      }
    },
  });

  // إعداد موفر WebSocket
  useEffect(() => {
    if (!documentId) return;

    const wsProvider = new WebsocketProvider(
      process.env.NODE_ENV === 'production'
        ? 'wss://sabq-collab.herokuapp.com'
        : 'ws://localhost:1234',
      `sabq-doc-${documentId}`,
      ydoc
    );

    wsProvider.on('status', (event: any) => {
      setIsConnected(event.status === 'connected');
      if (event.status === 'connected') {
        console.log('🔗 متصل بخادم التعاون');
        toast.success('تم الاتصال بخادم التعاون');
      } else if (event.status === 'disconnected') {
        console.log('❌ انقطع الاتصال بخادم التعاون');
        toast.error('انقطع الاتصال بخادم التعاون');
      }
    });

    // مراقبة المستخدمين المتصلين
    wsProvider.awareness.on('update', () => {
      const users: User[] = [];
      wsProvider.awareness.getStates().forEach((state: any, clientId: number) => {
        if (state.user && clientId !== wsProvider.awareness.clientID) {
          users.push({
            id: clientId.toString(),
            name: state.user.name,
            email: state.user.email || '',
            color: state.user.color,
          });
        }
      });
      setConnectedUsers(users);
    });

    // تعيين معلومات المستخدم الحالي
    wsProvider.awareness.setLocalStateField('user', {
      name: currentUser.name,
      email: currentUser.email,
      color: currentUser.color,
    });

    setProvider(wsProvider);

    return () => {
      wsProvider.destroy();
    };
  }, [documentId, currentUser, ydoc]);

  // حفظ المحتوى في Supabase
  const saveContent = useCallback(async () => {
    if (!editor || readOnly || isSaving) return;

    setIsSaving(true);
    try {
      const content = editor.getJSON();
      const html = editor.getHTML();

      // حفظ في Supabase
      const { error } = await supabase
        .from('documents')
        .upsert({
          id: documentId,
          content: content,
          html_content: html,
          updated_at: new Date().toISOString(),
          updated_by: currentUser.id,
        });

      if (error) {
        console.error('خطأ في حفظ المستند:', error);
        toast.error('فشل في حفظ المستند');
        return;
      }

      setLastSaved(new Date());
      toast.success('تم حفظ المستند بنجاح');

      // استدعاء callback للحفظ
      if (onSave) {
        onSave(content);
      }

    } catch (error) {
      console.error('خطأ في حفظ المستند:', error);
      toast.error('حدث خطأ في حفظ المستند');
    } finally {
      setIsSaving(false);
    }
  }, [editor, documentId, currentUser.id, onSave, readOnly, isSaving]);

  // Debounced save function
  const debouncedSave = useCallback(
    (() => {
      let timeoutId: NodeJS.Timeout;
      return () => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(saveContent, 2000); // حفظ بعد ثانيتين من آخر تعديل
      };
    })(),
    [saveContent]
  );

  // إضافة رابط
  const setLink = useCallback(() => {
    if (!editor) return;

    if (linkUrl) {
      editor.chain().focus().setLink({ href: linkUrl }).run();
      setLinkUrl('');
      setShowLinkDialog(false);
      toast.success('تم إضافة الرابط');
    }
  }, [editor, linkUrl]);

  // إضافة صورة
  const addImage = useCallback(() => {
    if (!editor) return;

    const url = window.prompt('رابط الصورة:');
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
      toast.success('تم إضافة الصورة');
    }
  }, [editor]);

  // حفظ يدوي
  const handleManualSave = () => {
    saveContent();
  };

  if (!editor) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-gray-600">جاري تحميل المحرر...</p>
        </div>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className={`border rounded-lg bg-white ${className}`}>
        {/* شريط الأدوات */}
        <div className="border-b p-3 bg-gray-50">
          <div className="flex items-center justify-between">
            {/* أدوات التحرير */}
            <div className="flex items-center gap-2 flex-wrap">
              {/* التراجع والإعادة */}
              <div className="flex items-center gap-1">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => editor.chain().focus().undo().run()}
                      disabled={!editor.can().undo() || readOnly}
                      className="h-8 w-8 p-0"
                    >
                      <Undo className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>تراجع</TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => editor.chain().focus().redo().run()}
                      disabled={!editor.can().redo() || readOnly}
                      className="h-8 w-8 p-0"
                    >
                      <Redo className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>إعادة</TooltipContent>
                </Tooltip>
              </div>

              <Separator orientation="vertical" className="h-6" />

              {/* العناوين */}
              <div className="flex items-center gap-1">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant={editor.isActive('heading', { level: 1 }) ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                      disabled={readOnly}
                      className="h-8 w-8 p-0"
                    >
                      <Heading1 className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>عنوان رئيسي</TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant={editor.isActive('heading', { level: 2 }) ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                      disabled={readOnly}
                      className="h-8 w-8 p-0"
                    >
                      <Heading2 className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>عنوان فرعي</TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant={editor.isActive('heading', { level: 3 }) ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                      disabled={readOnly}
                      className="h-8 w-8 p-0"
                    >
                      <Heading3 className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>عنوان صغير</TooltipContent>
                </Tooltip>
              </div>

              <Separator orientation="vertical" className="h-6" />

              {/* التنسيق */}
              <div className="flex items-center gap-1">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant={editor.isActive('bold') ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => editor.chain().focus().toggleBold().run()}
                      disabled={readOnly}
                      className="h-8 w-8 p-0"
                    >
                      <Bold className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>غامق</TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant={editor.isActive('italic') ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => editor.chain().focus().toggleItalic().run()}
                      disabled={readOnly}
                      className="h-8 w-8 p-0"
                    >
                      <Italic className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>مائل</TooltipContent>
                </Tooltip>
              </div>

              <Separator orientation="vertical" className="h-6" />

              {/* المحاذاة */}
              <div className="flex items-center gap-1">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant={editor.isActive({ textAlign: 'right' }) ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => editor.chain().focus().setTextAlign('right').run()}
                      disabled={readOnly}
                      className="h-8 w-8 p-0"
                    >
                      <AlignRight className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>محاذاة يمين</TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant={editor.isActive({ textAlign: 'center' }) ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => editor.chain().focus().setTextAlign('center').run()}
                      disabled={readOnly}
                      className="h-8 w-8 p-0"
                    >
                      <AlignCenter className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>محاذاة وسط</TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant={editor.isActive({ textAlign: 'left' }) ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => editor.chain().focus().setTextAlign('left').run()}
                      disabled={readOnly}
                      className="h-8 w-8 p-0"
                    >
                      <AlignLeft className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>محاذاة يسار</TooltipContent>
                </Tooltip>
              </div>

              <Separator orientation="vertical" className="h-6" />

              {/* القائمة */}
              <div className="flex items-center gap-1">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant={editor.isActive('bulletList') ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => editor.chain().focus().toggleBulletList().run()}
                      disabled={readOnly}
                      className="h-8 w-8 p-0"
                    >
                      <List className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>قائمة نقطية</TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant={editor.isActive('orderedList') ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => editor.chain().focus().toggleOrderedList().run()}
                      disabled={readOnly}
                      className="h-8 w-8 p-0"
                    >
                      <ListOrdered className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>قائمة مرقمة</TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant={editor.isActive('blockquote') ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => editor.chain().focus().toggleBlockquote().run()}
                      disabled={readOnly}
                      className="h-8 w-8 p-0"
                    >
                      <Quote className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>اقتباس</TooltipContent>
                </Tooltip>
              </div>

              <Separator orientation="vertical" className="h-6" />

              {/* الوسائط */}
              <div className="flex items-center gap-1">
                <Popover open={showLinkDialog} onOpenChange={setShowLinkDialog}>
                  <PopoverTrigger asChild>
                    <Button
                      variant={editor.isActive('link') ? 'default' : 'ghost'}
                      size="sm"
                      disabled={readOnly}
                      className="h-8 w-8 p-0"
                    >
                      <LinkIcon className="h-4 w-4" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80">
                    <div className="space-y-2">
                      <h4 className="font-medium text-sm">إضافة رابط</h4>
                      <Input
                        placeholder="https://example.com"
                        value={linkUrl}
                        onChange={(e) => setLinkUrl(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            setLink();
                          }
                        }}
                      />
                      <div className="flex gap-2">
                        <Button size="sm" onClick={setLink} disabled={!linkUrl}>
                          إضافة
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => setShowLinkDialog(false)}>
                          إلغاء
                        </Button>
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={addImage}
                      disabled={readOnly}
                      className="h-8 w-8 p-0"
                    >
                      <ImageIcon className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>إضافة صورة</TooltipContent>
                </Tooltip>
              </div>
            </div>

            {/* معلومات الحالة */}
            <div className="flex items-center gap-3">
              {/* المستخدمون المتصلون */}
              {connectedUsers.length > 0 && (
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-gray-500" />
                  <div className="flex -space-x-1">
                    {connectedUsers.slice(0, 3).map((user) => (
                      <Tooltip key={user.id}>
                        <TooltipTrigger asChild>
                          <div
                            className="w-6 h-6 rounded-full border-2 border-white flex items-center justify-center text-xs font-medium text-white"
                            style={{ backgroundColor: user.color }}
                          >
                            {user.name.charAt(0)}
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>{user.name}</TooltipContent>
                      </Tooltip>
                    ))}
                    {connectedUsers.length > 3 && (
                      <div className="w-6 h-6 rounded-full border-2 border-white bg-gray-500 flex items-center justify-center text-xs font-medium text-white">
                        +{connectedUsers.length - 3}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* حالة الاتصال */}
              <Badge variant={isConnected ? 'default' : 'destructive'} className="text-xs">
                {isConnected ? '🔗 متصل' : '❌ غير متصل'}
              </Badge>

              {/* آخر حفظ */}
              {lastSaved && (
                <span className="text-xs text-gray-500">
                  آخر حفظ: {lastSaved.toLocaleTimeString('ar-SA')}
                </span>
              )}

              {/* زر الحفظ */}
              {!readOnly && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleManualSave}
                  disabled={isSaving}
                  className="h-8"
                >
                  {isSaving ? (
                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600 ml-2" />
                  ) : (
                    <Save className="h-3 w-3 ml-2" />
                  )}
                  {isSaving ? 'جاري الحفظ...' : 'حفظ'}
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* المحرر */}
        <div className="relative">
          <EditorContent
            editor={editor}
            className="min-h-[400px] max-h-[600px] overflow-y-auto prose-headings:font-bold prose-p:leading-relaxed"
          />

          {/* شريط الأدوات العائم */}
          {editor && (
            <BubbleMenu
              editor={editor}
              tippyOptions={{ duration: 100 }}
              className="flex items-center gap-1 p-2 bg-gray-900 text-white rounded-lg shadow-lg"
            >
              <Button
                variant={editor.isActive('bold') ? 'default' : 'ghost'}
                size="sm"
                onClick={() => editor.chain().focus().toggleBold().run()}
                className="h-8 w-8 p-0 hover:bg-gray-700"
              >
                <Bold className="h-3 w-3" />
              </Button>
              <Button
                variant={editor.isActive('italic') ? 'default' : 'ghost'}
                size="sm"
                onClick={() => editor.chain().focus().toggleItalic().run()}
                className="h-8 w-8 p-0 hover:bg-gray-700"
              >
                <Italic className="h-3 w-3" />
              </Button>
              <Button
                variant={editor.isActive('link') ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setShowLinkDialog(true)}
                className="h-8 w-8 p-0 hover:bg-gray-700"
              >
                <LinkIcon className="h-3 w-3" />
              </Button>
            </BubbleMenu>
          )}

          {/* قائمة الأوامر العائمة */}
          {editor && (
            <FloatingMenu
              editor={editor}
              tippyOptions={{ duration: 100 }}
              className="flex items-center gap-1 p-2 bg-white border rounded-lg shadow-lg"
            >
              <Button
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                className="h-8 px-2 text-xs"
              >
                عنوان كبير
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().toggleBulletList().run()}
                className="h-8 px-2 text-xs"
              >
                قائمة نقطية
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().toggleBlockquote().run()}
                className="h-8 px-2 text-xs"
              >
                اقتباس
              </Button>
            </FloatingMenu>
          )}
        </div>

        {/* شريط الحالة */}
        <div className="border-t px-3 py-2 bg-gray-50 text-xs text-gray-500 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span>الكلمات: {editor.storage.characterCount?.words() || 0}</span>
            <span>الأحرف: {editor.storage.characterCount?.characters() || 0}</span>
            {!readOnly && <span>الحفظ التلقائي مفعل</span>}
          </div>
          <div className="flex items-center gap-2">
            {readOnly && (
              <Badge variant="outline" className="text-xs">
                <Eye className="h-3 w-3 ml-1" />
                للقراءة فقط
              </Badge>
            )}
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
};

export default CollaborativeEditor;
