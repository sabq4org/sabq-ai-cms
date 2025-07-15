'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Sparkles, Loader2, FileText, BookOpen, Info } from 'lucide-react';
import { toast } from 'react-hot-toast';

// Dynamic import للمحرر
const Editor = dynamic(() => import('@/components/Editor/Editor'), {
  ssr: false,
  loading: () => (
    <div className="h-96 bg-gray-100 dark:bg-gray-800 animate-pulse rounded-lg flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
    </div>
  )
});

interface ContentStepProps {
  formData: any;
  setFormData: (data: any) => void;
  darkMode: boolean;
  isAILoading: boolean;
  setIsAILoading: (loading: boolean) => void;
  editorRef: any;
}

export function ContentStep({
  formData,
  setFormData,
  darkMode,
  isAILoading,
  setIsAILoading,
  editorRef
}: ContentStepProps) {
  
  // توليد مقدمة بالذكاء الاصطناعي
  const generateIntro = async () => {
    if (!formData.title) {
      toast.error('يرجى كتابة العنوان أولاً');
      return;
    }
    
    setIsAILoading(true);
    try {
      const response = await fetch('/api/ai/editor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          type: 'generate_paragraph', 
          content: formData.title 
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.result && editorRef.current) {
          editorRef.current.setContent(data.result);
          toast.success('تم توليد المقدمة بنجاح');
        }
      }
    } catch (error) {
      console.error('Error generating intro:', error);
      toast.error('حدث خطأ في توليد المقدمة');
    } finally {
      setIsAILoading(false);
    }
  };

  // توليد مقال كامل بالذكاء الاصطناعي
  const generateFullArticle = async () => {
    if (!formData.title) {
      toast.error('يرجى كتابة العنوان أولاً');
      return;
    }
    
    const confirmed = confirm('هل تريد توليد مقال كامل بالذكاء الاصطناعي؟ سيستبدل المحتوى الحالي.');
    if (!confirmed) return;
    
    setIsAILoading(true);
    try {
      const response = await fetch('/api/ai/editor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          type: 'full_article', 
          content: formData.title,
          context: { excerpt: formData.excerpt }
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.result && editorRef.current) {
          editorRef.current.setContent(data.result);
          toast.success('تم توليد المقال بنجاح');
        }
      }
    } catch (error) {
      console.error('Error generating article:', error);
      toast.error('حدث خطأ في توليد المقال');
    } finally {
      setIsAILoading(false);
    }
  };

  // دالة AI للمحرر
  const handleAIAction = async (action: string, content: string) => {
    setIsAILoading(true);
    try {
      const response = await fetch('/api/ai/editor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: action, content })
      });
      
      const data = await response.json();
      if (data.result && editorRef.current) {
        if (action === 'rewrite') {
          editorRef.current.setContent(data.result);
        } else {
          const currentContent = editorRef.current.getHTML();
          editorRef.current.setContent(currentContent + '<p>' + data.result + '</p>');
        }
      }
      return data.result;
    } catch (error) {
      console.error('AI Error:', error);
      toast.error('حدث خطأ في الذكاء الاصطناعي');
      return null;
    } finally {
      setIsAILoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h2 className={`text-2xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
          محتوى المقال
        </h2>
        <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
          اكتب محتوى المقال بمساعدة المحرر الذكي
        </p>
      </div>

      {/* أزرار الذكاء الاصطناعي */}
      <div className="flex flex-wrap gap-2 mb-4">
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={generateIntro}
          disabled={isAILoading || !formData.title}
          className="flex items-center gap-2"
        >
          {isAILoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <BookOpen className="w-4 h-4" />
          )}
          <span>مقدمة تلقائية</span>
        </Button>
        
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={generateFullArticle}
          disabled={isAILoading || !formData.title}
          className="flex items-center gap-2"
        >
          {isAILoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <FileText className="w-4 h-4" />
          )}
          <span>مقال كامل</span>
        </Button>
      </div>

      {/* المحرر */}
      <div className={`rounded-lg border ${darkMode ? 'border-gray-700' : 'border-gray-300'} p-4`}>
        <Editor
          ref={editorRef}
          content={formData.content}
          onChange={(content) => {
            if (typeof content === 'object' && content.html) {
              setFormData((prev: any) => ({ ...prev, content: content.html }));
            } else if (typeof content === 'string') {
              setFormData((prev: any) => ({ ...prev, content }));
            }
          }}
          placeholder="اكتب محتوى المقال هنا..."
          enableAI={true}
          onAIAction={handleAIAction}
        />
      </div>

      {/* إحصائيات المحتوى */}
      {editorRef.current && (
        <div className={`p-4 rounded-lg ${
          darkMode ? 'bg-gray-800' : 'bg-gray-100'
        }`}>
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                عدد الكلمات
              </p>
              <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {(() => {
                  const html = editorRef.current?.getHTML() || '';
                  return html.replace(/<[^>]*>/g, '').split(/\s+/).filter(Boolean).length;
                })()}
              </p>
            </div>
            <div>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                وقت القراءة
              </p>
              <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {(() => {
                  const html = editorRef.current?.getHTML() || '';
                  const words = html.replace(/<[^>]*>/g, '').split(/\s+/).filter(Boolean).length;
                  return Math.ceil(words / 200);
                })()} دقائق
              </p>
            </div>
          </div>
        </div>
      )}

      {/* نصائح */}
      <Alert className={darkMode ? 'bg-blue-900/20 border-blue-800' : 'bg-blue-50 border-blue-200'}>
        <Info className="h-4 w-4" />
        <AlertDescription className={darkMode ? 'text-blue-200' : 'text-blue-800'}>
          <strong>نصائح للكتابة:</strong>
          <ul className="mt-2 space-y-1 text-sm">
            <li>• استخدم الفقرات القصيرة لسهولة القراءة</li>
            <li>• أضف عناوين فرعية لتنظيم المحتوى</li>
            <li>• استخدم الذكاء الاصطناعي لتحسين النص أو إعادة صياغته</li>
            <li>• المقال المثالي يحتوي على 300-500 كلمة</li>
          </ul>
        </AlertDescription>
      </Alert>
    </div>
  );
} 