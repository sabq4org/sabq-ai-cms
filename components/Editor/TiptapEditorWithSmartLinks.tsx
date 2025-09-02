'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import Youtube from '@tiptap/extension-youtube';
import TextAlign from '@tiptap/extension-text-align';
import TextStyle from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import Underline from '@tiptap/extension-underline';
import CharacterCount from '@tiptap/extension-character-count';
import Placeholder from '@tiptap/extension-placeholder';
import Table from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableHeader from '@tiptap/extension-table-header';
import TableCell from '@tiptap/extension-table-cell';
import { SmartLinksExtension } from './extensions/SmartLinksExtension';
import SmartLinksPanel from './SmartLinksPanel';
import EnhancedSmartLinksPanel from './EnhancedSmartLinksPanel';
import toast from 'react-hot-toast';

interface SmartLink {
  entityId: string;
  matchedText: string;
  startPos: number;
  endPos: number;
  confidence: number;
  entity: {
    id: string;
    name: string;
    name_ar: string;
    entity_type: {
      name: string;
      name_ar: string;
      icon: string;
      color: string;
    };
    description: string;
    importance_score: number;
    slug: string;
    official_website: string;
  };
  suggestedLink: {
    type: 'entity' | 'tooltip' | 'modal' | 'external';
    url?: string;
    tooltip_content?: string;
  };
}

interface TiptapEditorWithSmartLinksProps {
  content?: string;
  onChange?: (html: string, json: any) => void;
  placeholder?: string;
  showSmartLinksPanel?: boolean;
  autoAnalyze?: boolean;
  debounceDelay?: number;
  userId?: string;
  articleId?: string;
  enhancedMode?: boolean;
}

export default function TiptapEditorWithSmartLinks({ 
  content, 
  onChange, 
  placeholder,
  showSmartLinksPanel = true,
  autoAnalyze = true,
  debounceDelay = 2000,
  userId,
  articleId,
  enhancedMode = true
}: TiptapEditorWithSmartLinksProps) {
  const [savedContent, setSavedContent] = useState<string>('');
  const [charCount, setCharCount] = useState(0);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [suggestedLinks, setSuggestedLinks] = useState<SmartLink[]>([]);
  const [smartLinksEnabled, setSmartLinksEnabled] = useState(true);
  const [analysisData, setAnalysisData] = useState<any>(null);
  const [settings, setSettings] = useState({
    enableAI: true,
    enablePersonalization: Boolean(userId),
    maxSuggestions: 10,
    language: 'ar' as 'ar' | 'en'
  });
  const analyzeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // دالة تحليل النص باستخدام API مع المميزات المتقدمة
  const analyzeText = useCallback(async (text: string): Promise<SmartLink[]> => {
    if (!text || text.trim().length < 50) {
      return [];
    }

    try {
      setIsAnalyzing(true);
      console.log('🚀 بدء التحليل المتقدم...', {
        textLength: text.length,
        settings,
        userId,
        articleId
      });

      const response = await fetch('/api/smart-links/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: text,
          context: 'editor',
          userId,
          articleId,
          language: settings.language,
          enableAI: settings.enableAI,
          personalization: settings.enablePersonalization,
          maxSuggestions: settings.maxSuggestions
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // حفظ بيانات التحليل المتقدمة
      setAnalysisData(data);
      
      // تحويل البيانات لتطابق واجهة SmartLink
      const links: SmartLink[] = data.entities.map((entity: any) => ({
        entityId: entity.entityId,
        matchedText: entity.matchedText,
        startPos: entity.startIndex,
        endPos: entity.endIndex,
        confidence: entity.confidence,
        entity: entity.entity,
        suggestedLink: entity.suggestedLink,
        personalizedScore: entity.personalizedScore,
        isPersonalized: entity.isPersonalized
      }));

      setSuggestedLinks(links);
      
      // رسالة تأكيد متقدمة
      const features = [];
      if (data.aiSuggestions?.length > 0) features.push('AI');
      if (data.personalization) features.push('تخصيص');
      if (data.knowledgeGraph) features.push('شبكة معرفة');
      
      const message = features.length > 0 
        ? `تم العثور على ${links.length} رابط ذكي (${features.join(', ')})` 
        : `تم العثور على ${links.length} رابط ذكي`;
        
      toast.success(message, { 
        icon: '🔗', 
        duration: 3000 
      });
      
      return links;
    } catch (error) {
      console.error('خطأ في تحليل النص:', error);
      toast.error('حدث خطأ في تحليل النص');
      return [];
    } finally {
      setIsAnalyzing(false);
    }
  }, []);

  // دالة تحليل تلقائي مع debounce
  const scheduleAutoAnalysis = useCallback((text: string) => {
    if (!autoAnalyze || !smartLinksEnabled) return;

    if (analyzeTimeoutRef.current) {
      clearTimeout(analyzeTimeoutRef.current);
    }

    analyzeTimeoutRef.current = setTimeout(() => {
      analyzeText(text);
    }, debounceDelay);
  }, [analyzeText, autoAnalyze, smartLinksEnabled, debounceDelay]);

  // دالة معالجة تغيير الإعدادات
  const handleSettingsChange = useCallback((newSettings: any) => {
    setSettings(newSettings);
    console.log('⚙️ تم تحديث الإعدادات:', newSettings);
    
    // إعادة تحليل تلقائي إذا تغيرت الإعدادات المهمة
    if (editor?.getText() && (
      newSettings.enableAI !== settings.enableAI ||
      newSettings.enablePersonalization !== settings.enablePersonalization ||
      newSettings.language !== settings.language
    )) {
      const text = editor.getText();
      if (text.length > 50) {
        analyzeText(text);
      }
    }
  }, [settings, editor, analyzeText]);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3, 4, 5, 6],
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'max-w-full h-auto rounded-lg',
        },
      }),
      Underline,
      Link.configure({
        HTMLAttributes: {
          class: 'text-primary hover:underline',
        },
      }),
      Youtube.configure({
        HTMLAttributes: {
          class: 'max-w-full h-auto rounded-lg',
        },
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      TextStyle,
      Color,
      CharacterCount.configure({
        limit: 10000,
      }),
      Placeholder.configure({
        placeholder: placeholder || 'ابدأ بكتابة محتوى المقال هنا...',
        includeChildren: true,
      }),
      Table.configure({
        resizable: true,
        HTMLAttributes: {
          class: 'w-full border-collapse',
        },
      }),
      TableRow,
      TableHeader.configure({
        HTMLAttributes: {
          class: 'bg-gray-100 dark:bg-gray-800 font-bold p-2 border border-gray-300 dark:border-gray-600',
        },
      }),
      TableCell.configure({
        HTMLAttributes: {
          class: 'p-2 border border-gray-300 dark:border-gray-600',
        },
      }),
      // امتداد الروابط الذكية
      SmartLinksExtension.configure({
        onAnalyzeText: analyzeText,
        enableTooltips: true,
        autoAnalyze: autoAnalyze,
        debounceDelay: debounceDelay,
      }),
    ],
    content: content || `<p>${placeholder || 'ابدأ بكتابة محتوى المقال هنا...'}</p>`,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: 'prose prose-lg max-w-none p-6 min-h-[400px] focus:outline-none dark:prose-invert',
        dir: 'rtl',
      },
    },
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      const json = editor.getJSON();
      const text = editor.getText();
      setCharCount(text.length);
      
      if (onChange) {
        onChange(html, json);
      }

      // جدولة التحليل التلقائي
      scheduleAutoAnalysis(text);
    },
  });

  // تحديث المحتوى عند تغيير الـ prop
  useEffect(() => {
    if (editor && content && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  // استماع لأحداث النقر على الروابط الذكية
  useEffect(() => {
    const handleSmartLinkClick = (event: CustomEvent) => {
      const link = event.detail.link as SmartLink;
      handleLinkClick(link);
    };

    document.addEventListener('smartLinkClick', handleSmartLinkClick as EventListener);
    
    return () => {
      document.removeEventListener('smartLinkClick', handleSmartLinkClick as EventListener);
    };
  }, []);

  // معالج النقر على الروابط الذكية
  const handleLinkClick = (link: SmartLink) => {
    if (link.suggestedLink.type === 'external' && link.suggestedLink.url) {
      window.open(link.suggestedLink.url, '_blank');
    } else if (link.suggestedLink.type === 'entity' && link.suggestedLink.url) {
      // يمكن إضافة modal أو صفحة تفصيلية هنا
      console.log('Navigate to entity page:', link.suggestedLink.url);
    } else if (link.suggestedLink.type === 'tooltip') {
      // عرض tooltip
      toast(link.suggestedLink.tooltip_content || link.entity.description, {
        icon: link.entity.entity_type.icon,
        duration: 4000
      });
    }
  };

  // تطبيق رابط ذكي
  const handleApplyLink = (link: SmartLink) => {
    if (!editor) return;

    const { startPos, endPos } = link;
    const url = link.suggestedLink.url || '#';
    
    // إنشاء رابط في المحرر
    editor.chain()
      .focus()
      .setTextSelection({ from: startPos, to: endPos })
      .setLink({ href: url, target: '_blank' })
      .run();

    toast.success(`تم تطبيق الرابط: ${link.matchedText}`, { 
      icon: '✅',
      duration: 2000 
    });
  };

  // رفض رابط ذكي
  const handleRejectLink = (linkId: string) => {
    setSuggestedLinks(prev => prev.filter(link => link.entityId !== linkId));
    toast('تم رفض الرابط', { icon: '❌', duration: 1500 });
  };

  // تبديل حالة الروابط الذكية
  const handleToggleSmartLinks = (enabled: boolean) => {
    setSmartLinksEnabled(enabled);
    if (!enabled) {
      setSuggestedLinks([]);
      if (analyzeTimeoutRef.current) {
        clearTimeout(analyzeTimeoutRef.current);
      }
    }
    toast(enabled ? 'تم تفعيل الروابط الذكية' : 'تم إلغاء تفعيل الروابط الذكية', {
      icon: enabled ? '✅' : '❌',
      duration: 2000
    });
  };

  // تحليل يدوي
  const handleManualAnalysis = () => {
    if (!editor) return;
    const text = editor.getText();
    analyzeText(text);
  };

  if (!editor) return null;

  return (
    <div className="w-full">
      {/* شريط الأدوات مع أزرار الروابط الذكية */}
      <div className="border border-gray-200 dark:border-gray-700 rounded-t-lg p-3 bg-gray-50 dark:bg-gray-800">
        <div className="flex flex-wrap gap-2 items-center justify-between">
          {/* أزرار التنسيق الأساسية (نفس الموجود في المحرر الأصلي) */}
          <div className="flex flex-wrap gap-2 items-center">
            {/* أزرار التنسيق */}
            <div className="flex gap-1 border-l pl-2">
              <button
                onClick={() => editor.chain().focus().toggleBold().run()}
                className={`p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors ${
                  editor.isActive('bold') ? 'bg-gray-200 dark:bg-gray-700' : ''
                }`}
                title="عريض"
              >
                <strong>B</strong>
              </button>
              
              <button
                onClick={() => editor.chain().focus().toggleItalic().run()}
                className={`p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors ${
                  editor.isActive('italic') ? 'bg-gray-200 dark:bg-gray-700' : ''
                }`}
                title="مائل"
              >
                <em>I</em>
              </button>
              
              <button
                onClick={() => editor.chain().focus().toggleUnderline().run()}
                className={`p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors ${
                  editor.isActive('underline') ? 'bg-gray-200 dark:bg-gray-700' : ''
                }`}
                title="تحته خط"
              >
                <u>U</u>
              </button>
            </div>

            {/* أزرار العناوين */}
            <div className="flex gap-1 border-l pl-2">
              <button
                onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                className={`px-3 py-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-sm font-medium ${
                  editor.isActive('heading', { level: 2 }) ? 'bg-gray-200 dark:bg-gray-700' : ''
                }`}
              >
                H2
              </button>
              <button
                onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                className={`px-3 py-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-sm font-medium ${
                  editor.isActive('heading', { level: 3 }) ? 'bg-gray-200 dark:bg-gray-700' : ''
                }`}
              >
                H3
              </button>
            </div>
          </div>

          {/* أزرار الروابط الذكية */}
          <div className="flex items-center gap-2">
            <span className={`text-sm ${smartLinksEnabled ? 'text-purple-600' : 'text-gray-400'}`}>
              🔗 روابط ذكية
            </span>
            
            {isAnalyzing && (
              <div className="flex items-center gap-1 text-sm text-blue-600">
                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600"></div>
                تحليل...
              </div>
            )}
            
            {suggestedLinks.length > 0 && (
              <span className="text-sm text-green-600 font-medium">
                {suggestedLinks.length} مقترح
              </span>
            )}

            <span className="text-sm text-gray-500 dark:text-gray-400">
              {charCount} حرف
            </span>
          </div>
        </div>
      </div>

      <div className="flex gap-4">
        {/* منطقة المحرر */}
        <div className={`${showSmartLinksPanel ? 'flex-1' : 'w-full'}`}>
          <div className="border border-t-0 border-gray-200 dark:border-gray-700 rounded-b-lg bg-white dark:bg-gray-900">
            <EditorContent editor={editor} />
          </div>
        </div>

        {/* لوحة الروابط الذكية */}
        {showSmartLinksPanel && (
          <div className="w-80">
            {enhancedMode ? (
              <EnhancedSmartLinksPanel
                isAnalyzing={isAnalyzing}
                analysisData={analysisData}
                onAnalyzeText={handleManualAnalysis}
                onApplyLink={handleApplyLink}
                onRejectLink={handleRejectLink}
                onToggleLinks={handleToggleSmartLinks}
                isEnabled={smartLinksEnabled}
                settings={settings}
                onSettingsChange={handleSettingsChange}
              />
            ) : (
              <SmartLinksPanel
                isAnalyzing={isAnalyzing}
                suggestedLinks={suggestedLinks}
                onAnalyzeText={handleManualAnalysis}
                onApplyLink={handleApplyLink}
                onRejectLink={handleRejectLink}
                onToggleLinks={handleToggleSmartLinks}
                isEnabled={smartLinksEnabled}
              />
            )}
          </div>
        )}
      </div>

      {/* أنماط CSS للروابط الذكية */}
      <style jsx global>{`
        .smart-link {
          position: relative;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        
        .smart-link:hover {
          opacity: 0.8;
          transform: translateY(-1px);
        }
        
        .smart-link-person {
          border-bottom-color: #3B82F6;
          background: linear-gradient(90deg, #3B82F620 0%, #3B82F610 100%);
        }
        
        .smart-link-organization {
          border-bottom-color: #10B981;
          background: linear-gradient(90deg, #10B98120 0%, #10B98110 100%);
        }
        
        .smart-link-project {
          border-bottom-color: #F59E0B;
          background: linear-gradient(90deg, #F59E0B20 0%, #F59E0B10 100%);
        }
        
        .smart-link-location {
          border-bottom-color: #EF4444;
          background: linear-gradient(90deg, #EF444420 0%, #EF444410 100%);
        }
        
        .smart-link-event {
          border-bottom-color: #8B5CF6;
          background: linear-gradient(90deg, #8B5CF620 0%, #8B5CF610 100%);
        }
        
        .smart-link-term {
          border-bottom-color: #6B7280;
          background: linear-gradient(90deg, #6B728020 0%, #6B728010 100%);
        }
      `}</style>
    </div>
  );
} 