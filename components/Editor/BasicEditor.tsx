/**
 * محرر بسيط للاختبار - بدون ميزات متقدمة
 * Simple Editor for Testing - Without advanced features
 */

'use client';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { AlertCircle, Bold, CheckCircle, Italic, List, ListOrdered } from 'lucide-react';
import React, { useCallback, useState } from 'react';
import EditorErrorBoundary from './EditorErrorBoundary';

interface BasicEditorProps {
  initialContent?: string;
  onChange?: (html: string) => void;
}

const BasicEditor: React.FC<BasicEditorProps> = ({
  initialContent = '',
  onChange,
}) => {
  const [status, setStatus] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
    ],
    content: initialContent,
    onCreate: () => {
      setStatus('ready');
      setErrorMessage(null);
    },
    onUpdate: ({ editor }) => {
      if (onChange) {
        onChange(editor.getHTML());
      }
    },
  });

  React.useEffect(() => {
    setStatus('loading');
  }, []);

  const handleBold = useCallback(() => {
    if (editor) {
      editor.chain().focus().toggleBold().run();
    }
  }, [editor]);

  const handleItalic = useCallback(() => {
    if (editor) {
      editor.chain().focus().toggleItalic().run();
    }
  }, [editor]);

  const handleBulletList = useCallback(() => {
    if (editor) {
      editor.chain().focus().toggleBulletList().run();
    }
  }, [editor]);

  const handleOrderedList = useCallback(() => {
    if (editor) {
      editor.chain().focus().toggleOrderedList().run();
    }
  }, [editor]);

  if (status === 'error') {
    return (
      <Alert className="border-red-200 bg-red-50">
        <AlertCircle className="h-4 w-4 text-red-600" />
        <AlertDescription className="text-red-800">
          خطأ في المحرر: {errorMessage}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {status === 'ready' ? (
            <CheckCircle className="w-5 h-5 text-green-600" />
          ) : (
            <AlertCircle className="w-5 h-5 text-yellow-600" />
          )}
          المحرر البسيط - حالة: {status === 'ready' ? 'جاهز' : status}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* شريط الأدوات */}
        <div className="flex gap-2 p-2 border rounded">
          <Button
            variant="outline"
            size="sm"
            onClick={handleBold}
            className={editor?.isActive('bold') ? 'bg-gray-200' : ''}
            disabled={!editor || status !== 'ready'}
          >
            <Bold className="w-4 h-4" />
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleItalic}
            className={editor?.isActive('italic') ? 'bg-gray-200' : ''}
            disabled={!editor || status !== 'ready'}
          >
            <Italic className="w-4 h-4" />
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleBulletList}
            className={editor?.isActive('bulletList') ? 'bg-gray-200' : ''}
            disabled={!editor || status !== 'ready'}
          >
            <List className="w-4 h-4" />
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleOrderedList}
            className={editor?.isActive('orderedList') ? 'bg-gray-200' : ''}
            disabled={!editor || status !== 'ready'}
          >
            <ListOrdered className="w-4 h-4" />
          </Button>
        </div>

        {/* منطقة المحرر */}
        <div className="border rounded-md min-h-[200px] p-4">
          {status === 'loading' ? (
            <div className="text-gray-500 text-center">جاري تحميل المحرر...</div>
          ) : (
            <EditorContent
              editor={editor}
              className="prose prose-sm max-w-none focus:outline-none"
            />
          )}
        </div>

        {/* معلومات التشخيص */}
        <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
          <div>حالة المحرر: {status}</div>
          <div>المحرر مُهيأ: {editor ? 'نعم' : 'لا'}</div>
          <div>يمكن التحرير: {editor?.isEditable ? 'نعم' : 'لا'}</div>
          <div>طول المحتوى: {editor?.getText().length || 0}</div>
        </div>
      </CardContent>
    </Card>
  );
};

// مكون مُحاط بـ Error Boundary
const SafeBasicEditor: React.FC<BasicEditorProps> = (props) => {
  return (
    <EditorErrorBoundary>
      <BasicEditor {...props} />
    </EditorErrorBoundary>
  );
};

export default SafeBasicEditor;
