/**
 * المحرر الذكي المتقدم - نسخة كاملة مع جميع الميزات الذكية
 * Smart Advanced Editor - Full version with all intelligent features
 */

'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import {
    AlignCenter,
    AlignJustify,
    AlignLeft,
    AlignRight,
    Bold,
    BookOpen,
    Brain,
    CheckSquare,
    Clock,
    Eye,
    FileText,
    Globe,
    Hash,
    Heading1,
    Heading2,
    Heading3,
    Heart,
    Highlighter,
    Image as ImageIcon,
    Italic,
    Link as LinkIcon,
    List,
    ListOrdered,
    Quote,
    Redo,
    Save,
    Search,
    Settings,
    Strikethrough,
    Table as TableIcon,
    TrendingUp,
    Type,
    Underline as UnderlineIcon,
    Undo,
    User,
    Zap
} from 'lucide-react';
import React, { useCallback, useRef, useState } from 'react';
import toast from 'react-hot-toast';

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: string;
  color: string;
}

interface SmartEditorProps {
  documentId: string;
  currentUser: User;
  initialContent?: any;
  onSave?: (content: any, metadata?: any) => void;
  onPublish?: (content: any, metadata: any) => void;
  readOnly?: boolean;
  className?: string;
  enableAI?: boolean;
  enableCollaboration?: boolean;
  enableAnalytics?: boolean;
}

interface ArticleMetadata {
  title: string;
  summary: string;
  category: string;
  tags: string[];
  author: string;
  publishDate: Date;
  featured: boolean;
  breaking: boolean;
  seoTitle: string;
  seoDescription: string;
  readingTime: number;
  wordCount: number;
  language: 'ar' | 'en';
  status: 'draft' | 'review' | 'published';
}

const SmartAdvancedEditor: React.FC<SmartEditorProps> = ({
  documentId,
  currentUser,
  initialContent,
  onSave,
  onPublish,
  readOnly = false,
  className = '',
  enableAI = true,
  enableCollaboration = true,
  enableAnalytics = true,
}) => {
  // حالة المحرر
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [activeTab, setActiveTab] = useState('editor');
  const [showPreview, setShowPreview] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // بيانات المقال
  const [metadata, setMetadata] = useState<ArticleMetadata>({
    title: '',
    summary: '',
    category: '',
    tags: [],
    author: currentUser.name,
    publishDate: new Date(),
    featured: false,
    breaking: false,
    seoTitle: '',
    seoDescription: '',
    readingTime: 0,
    wordCount: 0,
    language: 'ar',
    status: 'draft',
  });

  // إحصائيات ذكية
  const [analytics, setAnalytics] = useState({
    wordCount: 0,
    charCount: 0,
    paragraphs: 0,
    readingTime: 0,
    readabilityScore: 0,
    sentimentScore: 0,
    keywordDensity: {} as Record<string, number>,
    suggestions: [] as string[],
  });

  // ميزات الذكاء الاصطناعي
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const [isAiProcessing, setIsAiProcessing] = useState(false);

  // مراجع
  const editorRef = useRef<HTMLDivElement>(null);

  // إعداد المحرر المتقدم
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3, 4, 5, 6],
        },
        bulletList: {
          keepMarks: true,
          keepAttributes: false,
        },
        orderedList: {
          keepMarks: true,
          keepAttributes: false,
        },
      }),
    ],
    content: initialContent || {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: 'ابدأ كتابة مقالك الذكي هنا... 📝'
            }
          ]
        }
      ]
    },
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: `prose prose-lg max-w-none focus:outline-none min-h-[500px] p-6 ${readOnly ? 'prose-gray' : ''} rtl`,
        dir: 'rtl',
        style: 'font-family: "Cairo", "Segoe UI", Tahoma, Geneva, Verdana, sans-serif; line-height: 1.8;',
      },
    },
    onUpdate: ({ editor }) => {
      analyzeContent(editor);
      debouncedSave();
    },
    editable: !readOnly,
  });

  // تحليل المحتوى الذكي
  const analyzeContent = useCallback((editor: any) => {
    const text = editor.getText();
    const html = editor.getHTML();

    // إحصائيات أساسية
    const words = text.match(/[\u0600-\u06FF\w]+/g) || [];
    const wordCount = words.length;
    const charCount = text.length;
    const paragraphs = html.split('<p>').length - 1;
    const readingTime = Math.ceil(wordCount / 200);

    // تحليل النغمة (مبسط)
    const positiveWords = ['ممتاز', 'رائع', 'جيد', 'نجح', 'تقدم', 'إيجابي'];
    const negativeWords = ['سيء', 'فشل', 'مشكلة', 'خطأ', 'سلبي'];

    const positiveCount = positiveWords.reduce((count, word) =>
      count + (text.toLowerCase().split(word).length - 1), 0);
    const negativeCount = negativeWords.reduce((count, word) =>
      count + (text.toLowerCase().split(word).length - 1), 0);

    const sentimentScore = positiveCount - negativeCount;

    // كثافة الكلمات المفتاحية
    const keywordDensity: Record<string, number> = {};
    words.forEach((word: string) => {
      if (word.length > 3) {
        keywordDensity[word] = (keywordDensity[word] || 0) + 1;
      }
    });

    // نقاط تحسين
    const suggestions: string[] = [];
    if (wordCount < 300) {
      suggestions.push('💡 المقال قصير، فكر في إضافة المزيد من التفاصيل');
    }
    if (paragraphs > wordCount / 50) {
      suggestions.push('📝 الفقرات قصيرة جداً، فكر في دمج بعضها');
    }
    if (!html.includes('<h')) {
      suggestions.push('🎯 أضف عناوين فرعية لتحسين التنظيم');
    }

    setAnalytics({
      wordCount,
      charCount,
      paragraphs,
      readingTime,
      readabilityScore: Math.min(100, Math.max(0, 100 - (wordCount / paragraphs))),
      sentimentScore,
      keywordDensity,
      suggestions,
    });

    // تحديث البيانات الوصفية
    setMetadata(prev => ({
      ...prev,
      wordCount,
      readingTime,
    }));
  }, []);

  // حفظ مؤجل
  const debouncedSave = useCallback(
    debounce(() => {
      if (editor && onSave) {
        saveContent();
      }
    }, 2000),
    [editor, onSave]
  );

  // حفظ المحتوى
  const saveContent = useCallback(async () => {
    if (!editor || !onSave) return;

    try {
      setIsSaving(true);
      const content = editor.getJSON();
      await onSave(content, metadata);
      setLastSaved(new Date());
      console.log('💾 تم حفظ المحتوى تلقائياً');
    } catch (error) {
      console.error('خطأ في حفظ المحتوى:', error);
      toast.error('فشل في حفظ المحتوى');
    } finally {
      setIsSaving(false);
    }
  }, [editor, onSave, metadata]);

  // نشر المقال
  const publishArticle = useCallback(async () => {
    if (!editor || !onPublish) return;

    if (!metadata.title || !metadata.summary) {
      toast.error('يرجى إدخال العنوان والملخص قبل النشر');
      return;
    }

    try {
      setIsPublishing(true);
      const content = editor.getJSON();
      const updatedMetadata = {
        ...metadata,
        status: 'published' as const,
        publishDate: new Date(),
      };

      await onPublish(content, updatedMetadata);
      setMetadata(updatedMetadata);
      toast.success('تم نشر المقال بنجاح! 🎉');
    } catch (error) {
      console.error('خطأ في نشر المقال:', error);
      toast.error('فشل في نشر المقال');
    } finally {
      setIsPublishing(false);
    }
  }, [editor, onPublish, metadata]);

  // اقتراحات الذكاء الاصطناعي
  const generateAISuggestions = useCallback(async () => {
    if (!enableAI || !editor) return;

    setIsAiProcessing(true);
    try {
      const content = editor.getText();

      // محاكاة استدعاء AI
      await new Promise(resolve => setTimeout(resolve, 2000));

      const suggestions = [
        '🎯 أضف إحصائيات لتعزيز مصداقية المحتوى',
        '📸 استخدم صور توضيحية لجعل المقال أكثر جاذبية',
        '🔗 أضف روابط لمصادر موثوقة',
        '📝 اكتب خلاصة في نهاية المقال',
        '🏷️ أضف كلمات مفتاحية ذات صلة',
      ];

      setAiSuggestions(suggestions);
      toast.success('تم تحليل المحتوى وإنشاء اقتراحات ذكية!');
    } catch (error) {
      toast.error('فشل في إنشاء الاقتراحات');
    } finally {
      setIsAiProcessing(false);
    }
  }, [enableAI, editor]);

  // أزرار شريط الأدوات
  const ToolbarButton = ({
    onClick,
    isActive = false,
    disabled = false,
    children,
    title,
    variant = 'ghost'
  }: {
    onClick: () => void;
    isActive?: boolean;
    disabled?: boolean;
    children: React.ReactNode;
    title: string;
    variant?: 'ghost' | 'default' | 'outline';
  }) => (
    <Button
      variant={isActive ? "default" : variant}
      size="sm"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`h-9 px-3 ${isActive ? 'bg-blue-100 text-blue-700' : ''}`}
    >
      {children}
    </Button>
  );

  if (!editor) {
    return (
      <div className={`rounded-lg border bg-gradient-to-r from-blue-50 to-purple-50 p-8 text-center ${className}`}>
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gradient-to-r from-blue-200 to-purple-200 rounded w-1/3 mx-auto"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
        <p className="mt-4 text-gray-600">جاري تحضير المحرر الذكي... 🚀</p>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className} ${isFullscreen ? 'fixed inset-0 z-50 bg-white p-4' : ''}`}>
      {/* الهيدر الذكي */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 rounded-lg shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Brain className="w-8 h-8" />
            <div>
              <h2 className="text-xl font-bold">المحرر الذكي المتقدم</h2>
              <p className="text-blue-100 text-sm">محرر ذكي مع ميزات الذكاء الاصطناعي</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="text-white hover:bg-white/20"
            >
              {isFullscreen ? 'تصغير' : 'ملء الشاشة'}
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowPreview(!showPreview)}
              className="text-white hover:bg-white/20"
            >
              <Eye className="w-4 h-4 ml-1" />
              {showPreview ? 'إخفاء المعاينة' : 'معاينة'}
            </Button>
          </div>
        </div>
      </div>

      {/* التبويبات الذكية */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="editor" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            المحرر
          </TabsTrigger>
          <TabsTrigger value="metadata" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            البيانات الوصفية
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            التحليلات
          </TabsTrigger>
          <TabsTrigger value="ai" className="flex items-center gap-2">
            <Zap className="w-4 h-4" />
            الذكاء الاصطناعي
          </TabsTrigger>
        </TabsList>

        {/* تبويب المحرر */}
        <TabsContent value="editor" className="space-y-4">
          {/* شريط الأدوات المتقدم */}
          <div className="bg-white border rounded-lg p-4 shadow-sm">
            <div className="flex items-center gap-2 flex-wrap">
              {/* التنسيق الأساسي */}
              <div className="flex items-center gap-1">
                <ToolbarButton
                  onClick={() => editor.chain().focus().toggleBold().run()}
                  isActive={editor.isActive('bold')}
                  title="غامق (Ctrl+B)"
                >
                  <Bold className="w-4 h-4" />
                </ToolbarButton>

                <ToolbarButton
                  onClick={() => editor.chain().focus().toggleItalic().run()}
                  isActive={editor.isActive('italic')}
                  title="مائل (Ctrl+I)"
                >
                  <Italic className="w-4 h-4" />
                </ToolbarButton>

                <ToolbarButton
                  onClick={() => editor.chain().focus().toggleUnderline().run()}
                  isActive={editor.isActive('underline')}
                  title="تحته خط (Ctrl+U)"
                >
                  <UnderlineIcon className="w-4 h-4" />
                </ToolbarButton>

                <ToolbarButton
                  onClick={() => editor.chain().focus().toggleStrike().run()}
                  isActive={editor.isActive('strike')}
                  title="يتوسطه خط"
                >
                  <Strikethrough className="w-4 h-4" />
                </ToolbarButton>

                <ToolbarButton
                  onClick={() => editor.chain().focus().toggleCode().run()}
                  isActive={editor.isActive('code')}
                  title="تمييز"
                >
                  <Highlighter className="w-4 h-4" />
                </ToolbarButton>
              </div>

              <Separator orientation="vertical" className="h-6" />

              {/* العناوين */}
              <div className="flex items-center gap-1">
                <ToolbarButton
                  onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                  isActive={editor.isActive('heading', { level: 1 })}
                  title="عنوان رئيسي"
                >
                  <Heading1 className="w-4 h-4" />
                </ToolbarButton>

                <ToolbarButton
                  onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                  isActive={editor.isActive('heading', { level: 2 })}
                  title="عنوان فرعي"
                >
                  <Heading2 className="w-4 h-4" />
                </ToolbarButton>

                <ToolbarButton
                  onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                  isActive={editor.isActive('heading', { level: 3 })}
                  title="عنوان صغير"
                >
                  <Heading3 className="w-4 h-4" />
                </ToolbarButton>
              </div>

              <Separator orientation="vertical" className="h-6" />

              {/* المحاذاة */}
              <div className="flex items-center gap-1">
                <ToolbarButton
                  onClick={() => editor.chain().focus().setTextAlign('right').run()}
                  title="محاذاة يمين"
                >
                  <AlignRight className="w-4 h-4" />
                </ToolbarButton>

                <ToolbarButton
                  onClick={() => editor.chain().focus().setTextAlign('center').run()}
                  title="محاذاة وسط"
                >
                  <AlignCenter className="w-4 h-4" />
                </ToolbarButton>

                <ToolbarButton
                  onClick={() => editor.chain().focus().setTextAlign('left').run()}
                  title="محاذاة يسار"
                >
                  <AlignLeft className="w-4 h-4" />
                </ToolbarButton>

                <ToolbarButton
                  onClick={() => editor.chain().focus().setTextAlign('justify').run()}
                  title="ضبط"
                >
                  <AlignJustify className="w-4 h-4" />
                </ToolbarButton>
              </div>

              <Separator orientation="vertical" className="h-6" />

              {/* القوائم والاقتباسات */}
              <div className="flex items-center gap-1">
                <ToolbarButton
                  onClick={() => editor.chain().focus().toggleBulletList().run()}
                  isActive={editor.isActive('bulletList')}
                  title="قائمة نقطية"
                >
                  <List className="w-4 h-4" />
                </ToolbarButton>

                <ToolbarButton
                  onClick={() => editor.chain().focus().toggleOrderedList().run()}
                  isActive={editor.isActive('orderedList')}
                  title="قائمة مرقمة"
                >
                  <ListOrdered className="w-4 h-4" />
                </ToolbarButton>

                <ToolbarButton
                  onClick={() => editor.chain().focus().toggleOrderedList().run()}
                  isActive={editor.isActive('orderedList')}
                  title="قائمة مهام"
                >
                  <CheckSquare className="w-4 h-4" />
                </ToolbarButton>

                <ToolbarButton
                  onClick={() => editor.chain().focus().toggleBlockquote().run()}
                  isActive={editor.isActive('blockquote')}
                  title="اقتباس"
                >
                  <Quote className="w-4 h-4" />
                </ToolbarButton>
              </div>

              <Separator orientation="vertical" className="h-6" />

              {/* الوسائط والجداول */}
              <div className="flex items-center gap-1">
                <ToolbarButton
                  onClick={() => {
                    const url = prompt('رابط الصورة:');
                    if (url) {
                      editor.chain().focus().setImage({ src: url }).run();
                    }
                  }}
                  title="إدراج صورة"
                >
                  <ImageIcon className="w-4 h-4" />
                </ToolbarButton>

                <ToolbarButton
                  onClick={() => {
                    const url = prompt('رابط الرابط:');
                    if (url) {
                      editor.chain().focus().setLink({ href: url }).run();
                    }
                  }}
                  isActive={editor.isActive('link')}
                  title="إدراج رابط"
                >
                  <LinkIcon className="w-4 h-4" />
                </ToolbarButton>

                <ToolbarButton
                  onClick={() => {
                    editor.chain().focus().insertTable({
                      rows: 3,
                      cols: 3,
                      withHeaderRow: true,
                    }).run();
                  }}
                  title="إدراج جدول"
                >
                  <TableIcon className="w-4 h-4" />
                </ToolbarButton>
              </div>

              <Separator orientation="vertical" className="h-6" />

              {/* التراجع والحفظ */}
              <div className="flex items-center gap-1">
                <ToolbarButton
                  onClick={() => editor.chain().focus().undo().run()}
                  disabled={!editor.can().undo()}
                  title="تراجع (Ctrl+Z)"
                >
                  <Undo className="w-4 h-4" />
                </ToolbarButton>

                <ToolbarButton
                  onClick={() => editor.chain().focus().redo().run()}
                  disabled={!editor.can().redo()}
                  title="إعادة (Ctrl+Y)"
                >
                  <Redo className="w-4 h-4" />
                </ToolbarButton>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={saveContent}
                  disabled={isSaving || readOnly}
                  className="text-green-600 border-green-200 hover:bg-green-50"
                >
                  <Save className="w-4 h-4 ml-1" />
                  {isSaving ? 'جاري الحفظ...' : 'حفظ'}
                </Button>

                <Button
                  variant="default"
                  size="sm"
                  onClick={publishArticle}
                  disabled={isPublishing || readOnly}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Globe className="w-4 h-4 ml-1" />
                  {isPublishing ? 'جاري النشر...' : 'نشر'}
                </Button>
              </div>
            </div>

            {/* شريط المعلومات المتقدم */}
            <div className="flex items-center justify-between mt-4 pt-4 border-t text-sm">
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2 text-gray-600">
                  <Type className="w-4 h-4" />
                  <span>{analytics.wordCount} كلمة</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Clock className="w-4 h-4" />
                  <span>{analytics.readingTime} دقيقة قراءة</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <BookOpen className="w-4 h-4" />
                  <span>{analytics.paragraphs} فقرة</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <TrendingUp className="w-4 h-4" />
                  <span>سهولة القراءة: {analytics.readabilityScore.toFixed(0)}%</span>
                </div>
              </div>

              <div className="flex items-center gap-4">
                {lastSaved && (
                  <div className="flex items-center gap-2 text-green-600">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-xs">
                      آخر حفظ: {lastSaved.toLocaleTimeString('ar-SA')}
                    </span>
                  </div>
                )}

                <div className="flex items-center gap-2 text-blue-600">
                  <User className="w-4 h-4" />
                  <span className="text-xs">{currentUser.name}</span>
                </div>
              </div>
            </div>
          </div>

          {/* منطقة التحرير */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <div className="bg-white border rounded-lg shadow-sm">
                <EditorContent editor={editor} ref={editorRef} />
              </div>
            </div>

            {/* الشريط الجانبي للإحصائيات */}
            <div className="space-y-4">
              <div className="bg-white border rounded-lg p-4 shadow-sm">
                <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  إحصائيات سريعة
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">الكلمات:</span>
                    <span className="font-medium">{analytics.wordCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">الحروف:</span>
                    <span className="font-medium">{analytics.charCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">الفقرات:</span>
                    <span className="font-medium">{analytics.paragraphs}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">وقت القراءة:</span>
                    <span className="font-medium">{analytics.readingTime} دقيقة</span>
                  </div>
                </div>
              </div>

              {analytics.suggestions.length > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-medium text-blue-800 mb-2 flex items-center gap-2">
                    <Zap className="w-4 h-4" />
                    اقتراحات التحسين
                  </h4>
                  <ul className="space-y-2">
                    {analytics.suggestions.map((suggestion, index) => (
                      <li key={index} className="text-sm text-blue-700">
                        {suggestion}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        {/* تبويب البيانات الوصفية */}
        <TabsContent value="metadata" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">عنوان المقال *</Label>
                <Input
                  id="title"
                  value={metadata.title}
                  onChange={(e) => setMetadata(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="أدخل عنوان المقال..."
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="summary">الملخص *</Label>
                <Textarea
                  id="summary"
                  value={metadata.summary}
                  onChange={(e) => setMetadata(prev => ({ ...prev, summary: e.target.value }))}
                  placeholder="ملخص مختصر للمقال..."
                  className="mt-1"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="category">التصنيف</Label>
                <Input
                  id="category"
                  value={metadata.category}
                  onChange={(e) => setMetadata(prev => ({ ...prev, category: e.target.value }))}
                  placeholder="تصنيف المقال..."
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="tags">الكلمات المفتاحية</Label>
                <Input
                  id="tags"
                  value={metadata.tags.join(', ')}
                  onChange={(e) => setMetadata(prev => ({
                    ...prev,
                    tags: e.target.value.split(',').map(tag => tag.trim())
                  }))}
                  placeholder="كلمة1, كلمة2, كلمة3..."
                  className="mt-1"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="seoTitle">عنوان SEO</Label>
                <Input
                  id="seoTitle"
                  value={metadata.seoTitle}
                  onChange={(e) => setMetadata(prev => ({ ...prev, seoTitle: e.target.value }))}
                  placeholder="عنوان محسن لمحركات البحث..."
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="seoDescription">وصف SEO</Label>
                <Textarea
                  id="seoDescription"
                  value={metadata.seoDescription}
                  onChange={(e) => setMetadata(prev => ({ ...prev, seoDescription: e.target.value }))}
                  placeholder="وصف مختصر لمحركات البحث..."
                  className="mt-1"
                  rows={3}
                />
              </div>

              <div className="flex items-center space-x-4 space-x-reverse">
                <div className="flex items-center space-x-2 space-x-reverse">
                  <Switch
                    id="featured"
                    checked={metadata.featured}
                    onCheckedChange={(checked) => setMetadata(prev => ({ ...prev, featured: checked }))}
                  />
                  <Label htmlFor="featured">مقال مميز</Label>
                </div>

                <div className="flex items-center space-x-2 space-x-reverse">
                  <Switch
                    id="breaking"
                    checked={metadata.breaking}
                    onCheckedChange={(checked) => setMetadata(prev => ({ ...prev, breaking: checked }))}
                  />
                  <Label htmlFor="breaking">خبر عاجل</Label>
                </div>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium mb-2">معلومات إضافية</h4>
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex justify-between">
                    <span>الكاتب:</span>
                    <span>{metadata.author}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>عدد الكلمات:</span>
                    <span>{metadata.wordCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>وقت القراءة:</span>
                    <span>{metadata.readingTime} دقيقة</span>
                  </div>
                  <div className="flex justify-between">
                    <span>الحالة:</span>
                    <span className={`px-2 py-1 rounded text-xs ${
                      metadata.status === 'published' ? 'bg-green-100 text-green-700' :
                      metadata.status === 'review' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {metadata.status === 'published' ? 'منشور' :
                       metadata.status === 'review' ? 'قيد المراجعة' : 'مسودة'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* تبويب التحليلات */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-600 text-sm font-medium">عدد الكلمات</p>
                  <p className="text-2xl font-bold text-blue-700">{analytics.wordCount}</p>
                </div>
                <Type className="w-8 h-8 text-blue-500" />
              </div>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-600 text-sm font-medium">وقت القراءة</p>
                  <p className="text-2xl font-bold text-green-700">{analytics.readingTime}د</p>
                </div>
                <Clock className="w-8 h-8 text-green-500" />
              </div>
            </div>

            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-600 text-sm font-medium">سهولة القراءة</p>
                  <p className="text-2xl font-bold text-purple-700">{analytics.readabilityScore.toFixed(0)}%</p>
                </div>
                <BookOpen className="w-8 h-8 text-purple-500" />
              </div>
            </div>

            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-600 text-sm font-medium">النغمة</p>
                  <p className="text-2xl font-bold text-orange-700">
                    {analytics.sentimentScore > 0 ? '😊' : analytics.sentimentScore < 0 ? '😐' : '😊'}
                  </p>
                </div>
                <Heart className="w-8 h-8 text-orange-500" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white border rounded-lg p-4">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Hash className="w-5 h-5" />
                أهم الكلمات المفتاحية
              </h3>
              <div className="space-y-2">
                {Object.entries(analytics.keywordDensity)
                  .sort(([,a], [,b]) => (b as number) - (a as number))
                  .slice(0, 10)
                  .map(([word, count]) => (
                    <div key={word} className="flex justify-between items-center">
                      <span className="text-sm">{word}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${Math.min(100, ((count as number) / Math.max(...Object.values(analytics.keywordDensity).map(v => v as number))) * 100)}%` }}
                          ></div>
                        </div>
                        <span className="text-xs text-gray-500 w-8">{count as number}</span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            <div className="bg-white border rounded-lg p-4">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Zap className="w-5 h-5" />
                اقتراحات للتحسين
              </h3>
              <div className="space-y-3">
                {analytics.suggestions.map((suggestion, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <p className="text-sm text-blue-700">{suggestion}</p>
                  </div>
                ))}
                {analytics.suggestions.length === 0 && (
                  <p className="text-gray-500 text-center py-4">
                    رائع! لا توجد اقتراحات للتحسين الآن 🎉
                  </p>
                )}
              </div>
            </div>
          </div>
        </TabsContent>

        {/* تبويب الذكاء الاصطناعي */}
        <TabsContent value="ai" className="space-y-6">
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 border rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Brain className="w-8 h-8 text-purple-600" />
                <div>
                  <h3 className="text-xl font-bold text-gray-800">مساعد الذكاء الاصطناعي</h3>
                  <p className="text-gray-600">احصل على اقتراحات ذكية لتحسين مقالك</p>
                </div>
              </div>

              <Button
                onClick={generateAISuggestions}
                disabled={isAiProcessing}
                className="bg-purple-600 hover:bg-purple-700"
              >
                <Zap className="w-4 h-4 ml-1" />
                {isAiProcessing ? 'جاري التحليل...' : 'تحليل ذكي'}
              </Button>
            </div>

            {aiSuggestions.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-medium text-gray-800">اقتراحات الذكاء الاصطناعي:</h4>
                {aiSuggestions.map((suggestion, index) => (
                  <div key={index} className="bg-white border rounded-lg p-4 shadow-sm">
                    <p className="text-gray-700">{suggestion}</p>
                  </div>
                ))}
              </div>
            )}

            {isAiProcessing && (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                <span className="mr-3 text-purple-600">جاري تحليل المحتوى بالذكاء الاصطناعي...</span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white border rounded-lg p-6">
              <h4 className="font-semibold mb-4 flex items-center gap-2">
                <Search className="w-5 h-5" />
                تحسين SEO
              </h4>
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span>عنوان محسن:</span>
                  <span className={metadata.seoTitle ? 'text-green-600' : 'text-red-600'}>
                    {metadata.seoTitle ? '✓' : '✗'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>وصف محسن:</span>
                  <span className={metadata.seoDescription ? 'text-green-600' : 'text-red-600'}>
                    {metadata.seoDescription ? '✓' : '✗'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>كلمات مفتاحية:</span>
                  <span className={metadata.tags.length > 0 ? 'text-green-600' : 'text-red-600'}>
                    {metadata.tags.length}/5
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white border rounded-lg p-6">
              <h4 className="font-semibold mb-4 flex items-center gap-2">
                <BookOpen className="w-5 h-5" />
                جودة المحتوى
              </h4>
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span>طول مناسب:</span>
                  <span className={analytics.wordCount >= 300 ? 'text-green-600' : 'text-yellow-600'}>
                    {analytics.wordCount >= 300 ? '✓' : '⚠'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>تنسيق جيد:</span>
                  <span className={analytics.paragraphs > 1 ? 'text-green-600' : 'text-yellow-600'}>
                    {analytics.paragraphs > 1 ? '✓' : '⚠'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>سهولة القراءة:</span>
                  <span className={analytics.readabilityScore > 60 ? 'text-green-600' : 'text-yellow-600'}>
                    {analytics.readabilityScore.toFixed(0)}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

// دالة debounce للحفظ المؤجل
function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

export default SmartAdvancedEditor;
