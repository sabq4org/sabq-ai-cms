'use client';

import React, { Suspense, lazy, memo, useCallback, useState, useEffect } from 'react';
import { FileText, Sparkles, Loader2, BookOpen, BarChart3, Type } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import dynamic from 'next/dynamic';

// تحميل المحرر بشكل كسول لتحسين الأداء
const Editor = dynamic(() => import('@/components/Editor/Editor'), {
  ssr: false,
  loading: () => (
    <div className="h-96 bg-gray-100 dark:bg-gray-800 animate-pulse rounded-lg flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
    </div>
  )
});

interface ContentStepEnhancedProps {
  formData: {
    content: string;
  };
  setFormData: React.Dispatch<React.SetStateAction<any>>;
  darkMode: boolean;
  isAILoading: boolean;
  setIsAILoading: React.Dispatch<React.SetStateAction<boolean>>;
  editorRef: React.MutableRefObject<any>;
}

const ContentStepEnhanced = memo(({
  formData,
  setFormData,
  darkMode,
  isAILoading,
  setIsAILoading,
  editorRef
}: ContentStepEnhancedProps) => {
  const [contentStats, setContentStats] = useState({
    words: 0,
    characters: 0,
    readingTime: 0
  });
  const [showAIMenu, setShowAIMenu] = useState(false);

  // حساب إحصائيات المحتوى
  const calculateStats = useCallback((content: string) => {
    const text = content.replace(/<[^>]*>/g, '').trim();
    const words = text.split(/\s+/).filter(word => word.length > 0).length;
    const characters = text.length;
    const readingTime = Math.ceil(words / 200); // 200 كلمة في الدقيقة

    setContentStats({ words, characters, readingTime });
  }, []);

  // معالج تغيير المحتوى
  const handleContentChange = useCallback((content: string | { html: string }) => {
    const htmlContent = typeof content === 'object' ? content.html : content;
    setFormData((prev: any) => ({ ...prev, content: htmlContent }));
    calculateStats(htmlContent);
  }, [setFormData, calculateStats]);

  // تحسين المحتوى بالذكاء الاصطناعي
  const enhanceWithAI = useCallback(async (action: string) => {
    if (isAILoading) return;

    setIsAILoading(true);
    setShowAIMenu(false);

    try {
      const currentContent = editorRef.current?.getHTML() || formData.content;
      const response = await fetch('/api/ai/enhance-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: currentContent, action })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.enhanced && editorRef.current) {
          editorRef.current.setContent(data.enhanced);
          handleContentChange(data.enhanced);
        }
      }
    } catch (error) {
      console.error('AI enhancement error:', error);
    } finally {
      setIsAILoading(false);
    }
  }, [formData.content, isAILoading, setIsAILoading, editorRef, handleContentChange]);

  useEffect(() => {
    if (formData.content) {
      calculateStats(formData.content);
    }
  }, [formData.content, calculateStats]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* شريط الأدوات */}
      <div className={cn(
        "flex items-center justify-between p-4 rounded-lg border",
        darkMode
          ? "bg-gray-800 border-gray-700"
          : "bg-white border-gray-200 shadow-sm"
      )}>
        <div className="flex items-center gap-4">
          <FileText className="w-5 h-5 text-gray-500" />
          <h3 className="font-medium">محتوى المقال</h3>
        </div>

        <div className="flex items-center gap-3">
          {/* إحصائيات المحتوى */}
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <div className="flex items-center gap-1">
              <Type className="w-4 h-4" />
              <span>{contentStats.words} كلمة</span>
            </div>
            <div className="flex items-center gap-1">
              <BookOpen className="w-4 h-4" />
              <span>{contentStats.readingTime} د قراءة</span>
            </div>
          </div>

          {/* قائمة AI */}
          <div className="relative">
            <button
              onClick={() => setShowAIMenu(!showAIMenu)}
              disabled={isAILoading}
              className={cn(
                "px-3 py-2 rounded-lg transition-all duration-200",
                "flex items-center gap-2",
                darkMode
                  ? "bg-gray-700 hover:bg-gray-600 text-white"
                  : "bg-blue-50 hover:bg-blue-100 text-blue-700"
              )}
            >
              {isAILoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4" />
              )}
              <span className="text-sm font-medium">AI مساعد</span>
            </button>

            {/* قائمة منسدلة للأوامر */}
            {showAIMenu && !isAILoading && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn(
                  "absolute left-0 top-full mt-2 w-56 rounded-lg shadow-lg overflow-hidden z-50",
                  darkMode ? "bg-gray-800 border border-gray-700" : "bg-white border border-gray-200"
                )}
              >
                <div className="p-2">
                  {[
                    { action: 'improve', label: 'تحسين الصياغة', icon: '✨' },
                    { action: 'expand', label: 'توسيع المحتوى', icon: '📝' },
                    { action: 'summarize', label: 'تلخيص', icon: '📋' },
                    { action: 'fix-grammar', label: 'تصحيح لغوي', icon: '✅' },
                    { action: 'add-details', label: 'إضافة تفاصيل', icon: '➕' }
                  ].map(item => (
                    <button
                      key={item.action}
                      onClick={() => enhanceWithAI(item.action)}
                      className={cn(
                        "w-full text-right px-3 py-2 rounded flex items-center gap-3 transition-colors",
                        darkMode
                          ? "hover:bg-gray-700 text-gray-200"
                          : "hover:bg-gray-100 text-gray-700"
                      )}
                    >
                      <span className="text-lg">{item.icon}</span>
                      <span className="text-sm">{item.label}</span>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* المحرر */}
      <div className={cn(
        "rounded-lg border overflow-hidden",
        darkMode ? "border-gray-700" : "border-gray-200"
      )}>
        <Editor
          ref={editorRef}
          content={formData.content}
          onChange={handleContentChange}
          placeholder="ابدأ بكتابة محتوى المقال هنا..."
          enableAI={true}
        />
      </div>

      {/* نصائح الكتابة */}
      <div className={cn(
        "p-4 rounded-lg border",
        darkMode
          ? "bg-gray-800/50 border-gray-700"
          : "bg-amber-50 border-amber-200"
      )}>
        <div className="flex items-start gap-3">
          <BarChart3 className="w-5 h-5 text-amber-600 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-amber-900 dark:text-amber-200 mb-2">
              نصائح لمحتوى أفضل:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-amber-800 dark:text-amber-300">
              <div>• استخدم فقرات قصيرة (3-4 جمل)</div>
              <div>• أضف عناوين فرعية للتنظيم</div>
              <div>• استخدم قوائم نقطية عند الحاجة</div>
              <div>• تجنب الجمل الطويلة المعقدة</div>
            </div>
          </div>
        </div>
      </div>

      {/* مؤشر جودة المحتوى */}
      {contentStats.words > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-2"
        >
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">جودة المحتوى</span>
            <span className={cn(
              "font-medium",
              contentStats.words < 100 && "text-red-600",
              contentStats.words >= 100 && contentStats.words < 300 && "text-yellow-600",
              contentStats.words >= 300 && "text-green-600"
            )}>
              {contentStats.words < 100 && "يحتاج المزيد"}
              {contentStats.words >= 100 && contentStats.words < 300 && "جيد"}
              {contentStats.words >= 300 && "ممتاز"}
            </span>
          </div>
          <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <motion.div
              className={cn(
                "h-full",
                contentStats.words < 100 && "bg-red-500",
                contentStats.words >= 100 && contentStats.words < 300 && "bg-yellow-500",
                contentStats.words >= 300 && "bg-green-500"
              )}
              initial={{ width: 0 }}
              animate={{ width: `${Math.min((contentStats.words / 300) * 100, 100)}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </motion.div>
      )}
    </motion.div>
  );
});

ContentStepEnhanced.displayName = 'ContentStepEnhanced';

export default ContentStepEnhanced; 