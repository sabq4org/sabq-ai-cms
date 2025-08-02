/**
 * المحرر الذكي الشامل - مع جميع الميزات المتقدمة
 * Complete Smart Editor - With all advanced features
 */

'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import {
  AlertCircle,
  Award,
  BarChart3,
  Bold,
  BookOpen,
  Brain,
  Calendar,
  Camera,
  CheckCircle,
  Clock,
  Code,
  Edit3,
  FileText,
  Flag,
  Globe,
  Heading1,
  Heading2,
  Heading3,
  Image as ImageIcon,
  Info,
  Italic,
  Lightbulb,
  List,
  ListOrdered,
  Mail,
  MapPin,
  PenTool,
  Phone,
  Quote,
  Redo,
  RefreshCw,
  Save,
  Search,
  Settings,
  Sparkles,
  Star,
  Strikethrough,
  Target,
  Trash2,
  Type,
  Undo,
  User,
  UserPlus,
  Users,
  Zap
} from 'lucide-react';
import React, { useCallback, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import EditorErrorBoundary from './EditorErrorBoundary';

interface User {
  id: string;
  name: string;
  email: string;
  color: string;
  role?: string;
  avatar?: string;
}

interface Reporter {
  id: string;
  name: string;
  location: string;
  specialty: string;
  avatar?: string;
  isActive: boolean;
  role: string;
  email: string;
  phone?: string;
  articlesCount: number;
  rating: number;
}

interface SmartSummary {
  mainPoints: string[];
  keyQuotes: string[];
  suggestedTitle: string;
  suggestedSubtitle: string;
  estimatedReadTime: number;
  sentiment: 'positive' | 'neutral' | 'negative';
  keyPoints: string[];
  summary: string;
  suggestedTags: string[];
  suggestedTitles: string[];
  readingTime: number;
  complexity: 'simple' | 'medium' | 'complex';
}

interface ArticleMetadata {
  title: string;
  subtitle: string;
  summary: string;
  reporter: Reporter | null;
  location: string;
  category: string;
  tags: string[];
  images: string[];
  publishDate: Date;
  priority: 'breaking' | 'urgent' | 'normal' | 'scheduled';
  status: 'draft' | 'review' | 'published';
}

interface SimpleEditorProps {
  documentId: string;
  currentUser: User;
  initialContent?: any;
  onSave?: (content: any, metadata?: ArticleMetadata) => void;
  readOnly?: boolean;
  className?: string;
  enableAI?: boolean;
}

const SimpleAdvancedEditor: React.FC<SimpleEditorProps> = ({
  documentId,
  currentUser,
  initialContent,
  onSave,
  readOnly = false,
  className = '',
  enableAI = true
}) => {
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [wordCount, setWordCount] = useState(0);
  const [activeTab, setActiveTab] = useState('editor');
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // بيانات المقال المتقدمة
  const [metadata, setMetadata] = useState<ArticleMetadata>({
    title: '',
    subtitle: '',
    summary: '',
    reporter: null,
    location: '',
    category: '',
    tags: [],
    images: [],
    publishDate: new Date(),
    priority: 'normal',
    status: 'draft',
  });

  // الموجز الذكي
  const [smartSummary, setSmartSummary] = useState<SmartSummary | null>(null);

  // قائمة المراسلين التجريبية
  const [reporters] = useState<Reporter[]>([
    {
      id: 'reporter-1',
      name: 'أحمد السعيد',
      location: 'الرياض',
      specialty: 'الاقتصاد والأعمال',
      isActive: true,
      role: 'مراسل اقتصادي',
      email: 'ahmed.saeed@example.com',
      phone: '+966501234567',
      articlesCount: 156,
      rating: 4.8,
    },
    {
      id: 'reporter-2',
      name: 'فاطمة النجار',
      location: 'جدة',
      specialty: 'التقنية والابتكار',
      isActive: true,
      role: 'مراسلة تقنية',
      email: 'fatima.najjar@example.com',
      phone: '+966502345678',
      articlesCount: 89,
      rating: 4.6,
    },
    {
      id: 'reporter-3',
      name: 'محمد العتيبي',
      location: 'الدمام',
      specialty: 'السياسة والشؤون العامة',
      isActive: true,
      role: 'مراسل سياسي',
      email: 'mohammed.otaibi@example.com',
      phone: '+966503456789',
      articlesCount: 203,
      rating: 4.9,
    },
    {
      id: 'reporter-4',
      name: 'نورا المطيري',
      location: 'المدينة المنورة',
      specialty: 'الثقافة والمجتمع',
      isActive: true,
      role: 'مراسلة ثقافية',
      email: 'nora.mutairi@example.com',
      phone: '+966504567890',
      articlesCount: 78,
      rating: 4.7,
    },
  ]);

  // إعداد المحرر
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3]
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
              text: 'ابدأ الكتابة هنا...'
            }
          ]
        }
      ]
    },
    editorProps: {
      attributes: {
        class: `prose prose-lg max-w-none focus:outline-none ${readOnly ? 'prose-gray' : ''} rtl`,
        dir: 'rtl',
        style: 'min-height: 400px; padding: 1rem; border: 1px solid #e5e7eb; border-radius: 0.5rem;',
      },
    },
    onUpdate: ({ editor }) => {
      // حساب عدد الكلمات
      const text = editor.getText();
      const words = text.match(/[\u0600-\u06FF\w]+/g) || [];
      setWordCount(words.length);

      // حفظ تلقائي
      if (!readOnly && onSave) {
        debouncedSave();
      }
    },
    editable: !readOnly,
  });

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

  // توليد موجز ذكي
  const generateSmartSummary = useCallback(async () => {
    if (!editor || !enableAI) return;

    setIsGeneratingAI(true);
    try {
      const content = editor.getText();

      // محاكاة استدعاء AI للتحليل
      await new Promise(resolve => setTimeout(resolve, 2000));

      const mockSummary: SmartSummary = {
        mainPoints: [
          'النقطة الرئيسية الأولى من المحتوى',
          'النقطة الرئيسية الثانية',
          'النقطة الرئيسية الثالثة'
        ],
        keyQuotes: [
          'اقتباس مهم من النص',
          'اقتباس آخر ذو صلة'
        ],
        suggestedTitle: 'عنوان مقترح بناءً على المحتوى',
        suggestedSubtitle: 'عنوان فرعي مقترح يلخص الموضوع',
        estimatedReadTime: Math.ceil(wordCount / 200),
        sentiment: wordCount > 100 ? 'positive' : 'neutral',
        keyPoints: [
          'النقطة الرئيسية الأولى من المحتوى',
          'النقطة الرئيسية الثانية',
          'النقطة الرئيسية الثالثة'
        ],
        summary: 'ملخص ذكي للمحتوى يوضح النقاط الأساسية والمفاهيم المهمة التي يتناولها النص.',
        suggestedTags: ['تقنية', 'ذكاء اصطناعي', 'صحافة', 'تطوير'],
        suggestedTitles: [
          'عنوان مقترح بناءً على المحتوى',
          'عنوان بديل يركز على الجانب التقني',
          'عنوان يسلط الضوء على التأثير المستقبلي'
        ],
        readingTime: Math.ceil(wordCount / 200),
        complexity: wordCount > 500 ? 'complex' : wordCount > 200 ? 'medium' : 'simple'
      };

      setSmartSummary(mockSummary);

      // تحديث العنوان والعنوان الفرعي المقترحين
      setMetadata(prev => ({
        ...prev,
        title: prev.title || mockSummary.suggestedTitle,
        subtitle: prev.subtitle || mockSummary.suggestedSubtitle,
      }));

      toast.success('تم إنشاء الموجز الذكي بنجاح! 🧠');
    } catch (error) {
      toast.error('فشل في إنشاء الموجز الذكي');
    } finally {
      setIsGeneratingAI(false);
    }
  }, [editor, enableAI, wordCount]);

  // رفع الصور
  const handleImageUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach(file => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const imageUrl = e.target?.result as string;

          // إدراج الصورة في المحرر
          if (editor) {
            editor.chain().focus().setImage({ src: imageUrl }).run();
          }

          // إضافة الصورة لقائمة الصور
          setMetadata(prev => ({
            ...prev,
            images: [...prev.images, imageUrl]
          }));

          toast.success('تم رفع الصورة بنجاح! 📷');
        };
        reader.readAsDataURL(file);
      }
    });
  }, [editor]);

  // توليد محتوى بالذكاء الاصطناعي
  const generateAIContent = useCallback(async (prompt: string) => {
    if (!enableAI || !editor) return;

    setIsGeneratingAI(true);
    try {
      // محاكاة استدعاء AI
      await new Promise(resolve => setTimeout(resolve, 3000));

      const aiContent = `
**محتوى تم توليده بالذكاء الاصطناعي**

${prompt}

هذا محتوى تجريبي تم إنشاؤه باستخدام الذكاء الاصطناعي. يمكن للنظام توليد:

• مقالات إخبارية متكاملة
• تحليلات عميقة للأحداث
• ملخصات للموضوعات المعقدة
• اقتراحات لتطوير المحتوى

**النقاط الرئيسية:**
1. تحليل شامل للموضوع
2. معلومات محدثة ودقيقة
3. أسلوب صحفي احترافي
4. مراعاة السياق الثقافي

*تم إنشاء هذا المحتوى في ${new Date().toLocaleString('ar-SA')}*
      `;

      // إدراج المحتوى في المحرر
      editor.chain().focus().insertContent(aiContent).run();

      toast.success('تم توليد المحتوى بالذكاء الاصطناعي! ✨');
    } catch (error) {
      toast.error('فشل في توليد المحتوى');
    } finally {
      setIsGeneratingAI(false);
    }
  }, [enableAI, editor]);

  // حفظ يدوي
  const handleSave = useCallback(() => {
    if (editor && onSave) {
      saveContent();
      toast.success('تم حفظ المحتوى');
    }
  }, [editor, onSave, saveContent]);

  // أزرار التنسيق
  const ToolbarButton = ({
    onClick,
    isActive = false,
    disabled = false,
    children,
    title
  }: {
    onClick: () => void;
    isActive?: boolean;
    disabled?: boolean;
    children: React.ReactNode;
    title: string;
  }) => (
    <Button
      variant={isActive ? "default" : "ghost"}
      size="sm"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`h-8 w-8 p-0 ${isActive ? 'bg-blue-100 text-blue-700' : ''}`}
    >
      {children}
    </Button>
  );

  if (!editor) {
    return (
      <div className={`rounded-lg border bg-gray-50 p-8 text-center ${className}`}>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mx-auto mb-4"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
          <p className="text-gray-500 mt-4 text-sm">جاري تحميل المحرر...</p>
        </div>
      </div>
    );
  }

  // التحقق من أخطاء المحرر
  if (editor && editor.isDestroyed) {
    return (
      <div className={`rounded-lg border border-red-200 bg-red-50 p-8 text-center ${className}`}>
        <div className="text-red-600">
          <AlertCircle className="w-12 h-12 mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">خطأ في المحرر</h3>
          <p className="text-sm">حدث خطأ في تحميل المحرر. يرجى تحديث الصفحة.</p>
          <Button
            onClick={() => window.location.reload()}
            className="mt-4"
            variant="outline"
          >
            تحديث الصفحة
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className} max-w-7xl mx-auto`}>
      {/* الهيدر الذكي */}
      <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Brain className="w-8 h-8" />
              <div>
                <CardTitle className="text-2xl">المحرر الذكي الشامل</CardTitle>
                <p className="text-blue-100">محرر متقدم مع ذكاء اصطناعي وجميع الميزات</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={generateSmartSummary}
                disabled={isGeneratingAI}
                className="text-white hover:bg-white/20"
              >
                <Sparkles className="w-4 h-4 ml-1" />
                {isGeneratingAI ? 'جاري التحليل...' : 'موجز ذكي'}
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                className="text-white hover:bg-white/20"
              >
                <Camera className="w-4 h-4 ml-1" />
                رفع صورة
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* التبويبات الشاملة */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="editor" className="flex items-center gap-2">
            <Edit3 className="w-4 h-4" />
            المحرر
          </TabsTrigger>
          <TabsTrigger value="metadata" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            البيانات
          </TabsTrigger>
          <TabsTrigger value="reporters" className="flex items-center gap-2">
            <User className="w-4 h-4" />
            المراسلين
          </TabsTrigger>
          <TabsTrigger value="ai" className="flex items-center gap-2">
            <Zap className="w-4 h-4" />
            الذكاء الاصطناعي
          </TabsTrigger>
          <TabsTrigger value="summary" className="flex items-center gap-2">
            <BookOpen className="w-4 h-4" />
            الموجز الذكي
          </TabsTrigger>
        </TabsList>

        {/* تبويب المحرر */}
        <TabsContent value="editor" className="space-y-4">
          {/* شريط الأدوات المتقدم */}
          <Card>
            <CardContent className="p-4">
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
                    onClick={() => editor.chain().focus().toggleStrike().run()}
                    isActive={editor.isActive('strike')}
                    title="يتوسطه خط"
                  >
                    <Strikethrough className="w-4 h-4" />
                  </ToolbarButton>

                  <ToolbarButton
                    onClick={() => editor.chain().focus().toggleCode().run()}
                    isActive={editor.isActive('code')}
                    title="كود"
                  >
                    <Code className="w-4 h-4" />
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

                {/* القوائم */}
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
                    onClick={() => editor.chain().focus().toggleBlockquote().run()}
                    isActive={editor.isActive('blockquote')}
                    title="اقتباس"
                  >
                    <Quote className="w-4 h-4" />
                  </ToolbarButton>
                </div>

                <Separator orientation="vertical" className="h-6" />

                {/* الأدوات المتقدمة */}
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    title="رفع صورة"
                  >
                    <ImageIcon className="w-4 h-4" />
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => generateAIContent('اكتب مقال عن الذكاء الاصطناعي في الصحافة')}
                    disabled={isGeneratingAI}
                    title="توليد محتوى بالذكاء الاصطناعي"
                  >
                    <Sparkles className="w-4 h-4" />
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={generateSmartSummary}
                    disabled={isGeneratingAI}
                    title="موجز ذكي"
                  >
                    <Brain className="w-4 h-4" />
                  </Button>
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
                    onClick={handleSave}
                    disabled={isSaving || readOnly}
                    className="text-green-600 border-green-200 hover:bg-green-50"
                  >
                    <Save className="w-4 h-4 ml-1" />
                    {isSaving ? 'جاري الحفظ...' : 'حفظ'}
                  </Button>
                </div>
              </div>

              {/* شريط المعلومات المحدث */}
              <div className="flex items-center justify-between mt-4 pt-4 border-t text-sm">
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Type className="w-4 h-4" />
                    <span>{wordCount} كلمة</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Clock className="w-4 h-4" />
                    <span>{Math.ceil(wordCount / 200)} دقيقة قراءة</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <ImageIcon className="w-4 h-4" />
                    <span>{metadata.images.length} صورة</span>
                  </div>
                  {metadata.reporter && (
                    <div className="flex items-center gap-2 text-blue-600">
                      <User className="w-4 h-4" />
                      <span>{metadata.reporter.name}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-4">
                  {lastSaved && (
                    <div className="flex items-center gap-2 text-green-600">
                      <CheckCircle className="w-4 h-4" />
                      <span className="text-xs">
                        آخر حفظ: {lastSaved.toLocaleTimeString('ar-SA')}
                      </span>
                    </div>
                  )}

                  {isSaving && (
                    <div className="flex items-center gap-2 text-blue-600">
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span className="text-xs">جاري الحفظ...</span>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* منطقة التحرير */}
          <Card>
            <CardContent className="p-0">
              <EditorContent editor={editor} />
            </CardContent>
          </Card>

          {/* ملف الإدخال المخفي للصور */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageUpload}
            accept="image/*"
            multiple
            className="hidden"
          />
        </TabsContent>

        {/* تبويب البيانات الوصفية */}
        <TabsContent value="metadata" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  معلومات المقال
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="title">العنوان الرئيسي *</Label>
                  <Input
                    id="title"
                    value={metadata.title}
                    onChange={(e) => setMetadata(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="أدخل العنوان الرئيسي للمقال..."
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="subtitle">العنوان الفرعي *</Label>
                  <Input
                    id="subtitle"
                    value={metadata.subtitle}
                    onChange={(e) => setMetadata(prev => ({ ...prev, subtitle: e.target.value }))}
                    placeholder="أدخل العنوان الفرعي..."
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="summary">الملخص</Label>
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
                  <Label htmlFor="location">الموقع</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <MapPin className="w-4 h-4 text-gray-500" />
                    <Input
                      id="location"
                      value={metadata.location}
                      onChange={(e) => setMetadata(prev => ({ ...prev, location: e.target.value }))}
                      placeholder="الرياض، المملكة العربية السعودية"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="tags">الكلمات المفتاحية</Label>
                  <Input
                    id="tags"
                    value={metadata.tags.join(', ')}
                    onChange={(e) => setMetadata(prev => ({
                      ...prev,
                      tags: e.target.value.split(',').map(tag => tag.trim()).filter(Boolean)
                    }))}
                    placeholder="تقنية, ذكاء اصطناعي, صحافة..."
                    className="mt-1"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  إعدادات النشر
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="category">التصنيف</Label>
                  <Select value={metadata.category} onValueChange={(value) => setMetadata(prev => ({ ...prev, category: value }))}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="اختر التصنيف..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="breaking">أخبار عاجلة</SelectItem>
                      <SelectItem value="politics">سياسة</SelectItem>
                      <SelectItem value="economy">اقتصاد</SelectItem>
                      <SelectItem value="technology">تقنية</SelectItem>
                      <SelectItem value="sports">رياضة</SelectItem>
                      <SelectItem value="culture">ثقافة</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="priority">الأولوية</Label>
                  <Select value={metadata.priority} onValueChange={(value: any) => setMetadata(prev => ({ ...prev, priority: value }))}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="اختر الأولوية..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="breaking">
                        <div className="flex items-center gap-2">
                          <AlertCircle className="w-4 h-4 text-red-500" />
                          عاجل
                        </div>
                      </SelectItem>
                      <SelectItem value="urgent">
                        <div className="flex items-center gap-2">
                          <Flag className="w-4 h-4 text-orange-500" />
                          مهم
                        </div>
                      </SelectItem>
                      <SelectItem value="normal">
                        <div className="flex items-center gap-2">
                          <Info className="w-4 h-4 text-blue-500" />
                          عادي
                        </div>
                      </SelectItem>
                      <SelectItem value="scheduled">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-500" />
                          مجدول
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="status">الحالة</Label>
                  <Select value={metadata.status} onValueChange={(value: any) => setMetadata(prev => ({ ...prev, status: value }))}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="اختر الحالة..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">مسودة</SelectItem>
                      <SelectItem value="review">قيد المراجعة</SelectItem>
                      <SelectItem value="published">منشور</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {metadata.images.length > 0 && (
                  <div>
                    <Label>الصور المرفقة ({metadata.images.length})</Label>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      {metadata.images.slice(0, 4).map((image, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={image}
                            alt={`صورة ${index + 1}`}
                            className="w-full h-20 object-cover rounded border"
                          />
                          <Button
                            variant="destructive"
                            size="sm"
                            className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => setMetadata(prev => ({
                              ...prev,
                              images: prev.images.filter((_, i) => i !== index)
                            }))}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* تبويب المراسلين */}
        <TabsContent value="reporters" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    اختيار المراسل
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {reporters.map((reporter) => (
                      <div
                        key={reporter.id}
                        className={`p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
                          metadata.reporter?.id === reporter.id
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => setMetadata(prev => ({ ...prev, reporter }))}
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                            {reporter.name.split(' ').map(n => n[0]).join('')}
                          </div>
                          <div className="flex-1">
                            <h3 className="font-medium text-gray-900">{reporter.name}</h3>
                            <p className="text-sm text-gray-600 mb-2">{reporter.role}</p>
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                              <MapPin className="w-3 h-3" />
                              <span>{reporter.location}</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                              <Mail className="w-3 h-3" />
                              <span>{reporter.email}</span>
                            </div>
                            {reporter.phone && (
                              <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                                <Phone className="w-3 h-3" />
                                <span>{reporter.phone}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="mt-3 pt-3 border-t">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="text-xs text-gray-500">
                                <div className="flex items-center gap-1">
                                  <Award className="w-3 h-3" />
                                  <span>{reporter.articlesCount} مقال</span>
                                </div>
                              </div>
                              <div className="flex items-center gap-1 text-xs">
                                <Star className="w-3 h-3 text-yellow-500" />
                                <span className="text-gray-600">{reporter.rating}</span>
                              </div>
                            </div>
                            {metadata.reporter?.id === reporter.id && (
                              <div className="flex items-center gap-1 text-blue-600">
                                <CheckCircle className="w-4 h-4" />
                                <span className="text-xs">محدد</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <UserPlus className="w-5 h-5" />
                    إضافة مراسل جديد
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="reporter-name">الاسم الكامل</Label>
                    <Input id="reporter-name" placeholder="محمد أحمد السعيد" className="mt-1" />
                  </div>
                  <div>
                    <Label htmlFor="reporter-role">المنصب</Label>
                    <Input id="reporter-role" placeholder="مراسل أخبار محلية" className="mt-1" />
                  </div>
                  <div>
                    <Label htmlFor="reporter-email">البريد الإلكتروني</Label>
                    <Input id="reporter-email" type="email" placeholder="reporter@example.com" className="mt-1" />
                  </div>
                  <div>
                    <Label htmlFor="reporter-location">الموقع</Label>
                    <Input id="reporter-location" placeholder="الرياض، السعودية" className="mt-1" />
                  </div>
                  <Button className="w-full">
                    <UserPlus className="w-4 h-4 ml-1" />
                    إضافة مراسل
                  </Button>
                </CardContent>
              </Card>

              {metadata.reporter && (
                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="w-5 h-5" />
                      المراسل المحدد
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center">
                      <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-lg mx-auto">
                        {metadata.reporter.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <h3 className="font-medium text-gray-900 mt-3">{metadata.reporter.name}</h3>
                      <p className="text-sm text-gray-600">{metadata.reporter.role}</p>
                      <div className="flex items-center justify-center gap-1 text-xs text-gray-500 mt-2">
                        <MapPin className="w-3 h-3" />
                        <span>{metadata.reporter.location}</span>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-4"
                        onClick={() => setMetadata(prev => ({ ...prev, reporter: null }))}
                      >
                        إلغاء التحديد
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        {/* تبويب الذكاء الاصطناعي */}
        <TabsContent value="ai" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5" />
                  توليد المحتوى
                </CardTitle>
                <CardDescription>
                  استخدم الذكاء الاصطناعي لتوليد محتوى عالي الجودة
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="ai-prompt">وصف المحتوى المطلوب</Label>
                  <Textarea
                    id="ai-prompt"
                    placeholder="اكتب مقال عن تأثير الذكاء الاصطناعي على الصحافة الحديثة..."
                    className="mt-1"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="ai-tone">نبرة الكتابة</Label>
                    <Select>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="اختر النبرة..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="formal">رسمية</SelectItem>
                        <SelectItem value="casual">غير رسمية</SelectItem>
                        <SelectItem value="academic">أكاديمية</SelectItem>
                        <SelectItem value="journalistic">صحفية</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="ai-length">طول المحتوى</Label>
                    <Select>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="اختر الطول..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="short">قصير (200-300 كلمة)</SelectItem>
                        <SelectItem value="medium">متوسط (500-700 كلمة)</SelectItem>
                        <SelectItem value="long">طويل (1000+ كلمة)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    className="flex-1"
                    onClick={() => generateAIContent('مقال شامل حول الموضوع المحدد')}
                    disabled={isGeneratingAI}
                  >
                    <Sparkles className="w-4 h-4 ml-1" />
                    {isGeneratingAI ? 'جاري التوليد...' : 'توليد مقال كامل'}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => generateAIContent('فقرة واحدة حول الموضوع')}
                    disabled={isGeneratingAI}
                  >
                    <PenTool className="w-4 h-4 ml-1" />
                    فقرة واحدة
                  </Button>
                </div>

                {isGeneratingAI && (
                  <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg">
                    <RefreshCw className="w-5 h-5 text-blue-600 animate-spin" />
                    <div>
                      <p className="text-sm font-medium text-blue-900">جاري توليد المحتوى...</p>
                      <p className="text-xs text-blue-600">قد يستغرق هذا بضع ثوان</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="w-5 h-5" />
                  أدوات ذكية أخرى
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => generateAIContent('تحسين النص الحالي')}
                  disabled={isGeneratingAI}
                >
                  <Edit3 className="w-4 h-4 ml-2" />
                  تحسين النص الحالي
                </Button>

                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={generateSmartSummary}
                  disabled={isGeneratingAI}
                >
                  <FileText className="w-4 h-4 ml-2" />
                  إنشاء ملخص ذكي
                </Button>

                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => generateAIContent('اقتراح عناوين جذابة')}
                  disabled={isGeneratingAI}
                >
                  <Lightbulb className="w-4 h-4 ml-2" />
                  اقتراح عناوين
                </Button>

                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => generateAIContent('تدقيق نحوي وإملائي')}
                  disabled={isGeneratingAI}
                >
                  <CheckCircle className="w-4 h-4 ml-2" />
                  تدقيق نحوي
                </Button>

                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => generateAIContent('ترجمة إلى الإنجليزية')}
                  disabled={isGeneratingAI}
                >
                  <Globe className="w-4 h-4 ml-2" />
                  ترجمة للإنجليزية
                </Button>

                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => generateAIContent('إنشاء كلمات مفتاحية SEO')}
                  disabled={isGeneratingAI}
                >
                  <Search className="w-4 h-4 ml-2" />
                  كلمات مفتاحية SEO
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* تبويب الموجز الذكي */}
        <TabsContent value="summary" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <BookOpen className="w-5 h-5" />
                      الموجز الذكي
                    </CardTitle>
                    <Button
                      onClick={generateSmartSummary}
                      disabled={isGeneratingAI}
                      size="sm"
                    >
                      <RefreshCw className={`w-4 h-4 ml-1 ${isGeneratingAI ? 'animate-spin' : ''}`} />
                      {isGeneratingAI ? 'جاري التحليل...' : 'تحديث الموجز'}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {smartSummary ? (
                    <div className="space-y-6">
                      <div>
                        <h3 className="font-medium text-gray-900 mb-2">النقاط الرئيسية</h3>
                        <ul className="space-y-2">
                          {smartSummary.keyPoints.map((point, index) => (
                            <li key={index} className="flex items-start gap-2">
                              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                              <span className="text-gray-700">{point}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <h3 className="font-medium text-gray-900 mb-2">الملخص</h3>
                        <p className="text-gray-700 leading-relaxed">{smartSummary.summary}</p>
                      </div>

                      <div>
                        <h3 className="font-medium text-gray-900 mb-2">الكلمات المفتاحية المقترحة</h3>
                        <div className="flex flex-wrap gap-2">
                          {smartSummary.suggestedTags.map((tag, index) => (
                            <span
                              key={index}
                              className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm cursor-pointer hover:bg-blue-200 transition-colors"
                              onClick={() => {
                                const currentTags = metadata.tags;
                                if (!currentTags.includes(tag)) {
                                  setMetadata(prev => ({
                                    ...prev,
                                    tags: [...currentTags, tag]
                                  }));
                                }
                              }}
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h3 className="font-medium text-gray-900 mb-2">العناوين المقترحة</h3>
                        <div className="space-y-2">
                          {smartSummary.suggestedTitles.map((title, index) => (
                            <div
                              key={index}
                              className="p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                              onClick={() => setMetadata(prev => ({ ...prev, title }))}
                            >
                              <span className="text-gray-700">{title}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Brain className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">لا يوجد موجز متاح</h3>
                      <p className="text-gray-600 mb-4">
                        اكتب بعض المحتوى في المحرر ثم انقر على "تحديث الموجز" لإنشاء موجز ذكي
                      </p>
                      <Button onClick={generateSmartSummary} disabled={isGeneratingAI}>
                        <Sparkles className="w-4 h-4 ml-1" />
                        إنشاء موجز ذكي
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <div>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    إحصائيات المحتوى
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">عدد الكلمات</span>
                    <span className="font-medium">{wordCount}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">وقت القراءة</span>
                    <span className="font-medium">{Math.ceil(wordCount / 200)} دقيقة</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">عدد الفقرات</span>
                    <span className="font-medium">{editor.getText().split('\n\n').filter(p => p.trim()).length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">عدد الأحرف</span>
                    <span className="font-medium">{editor.getText().length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">الصور المرفقة</span>
                    <span className="font-medium">{metadata.images.length}</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="mt-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5" />
                    مؤشر جودة المحتوى
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">طول المحتوى</span>
                      <div className="flex items-center gap-2">
                        <div className="w-20 h-2 bg-gray-200 rounded-full">
                          <div
                            className={`h-2 rounded-full ${
                              wordCount > 500 ? 'bg-green-500' : wordCount > 200 ? 'bg-yellow-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${Math.min((wordCount / 500) * 100, 100)}%` }}
                          ></div>
                        </div>
                        <span className="text-xs text-gray-500">
                          {wordCount > 500 ? 'ممتاز' : wordCount > 200 ? 'جيد' : 'قصير'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm">العنوان</span>
                      <span className={`text-xs px-2 py-1 rounded ${
                        metadata.title ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {metadata.title ? 'مكتمل' : 'مطلوب'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm">العنوان الفرعي</span>
                      <span className={`text-xs px-2 py-1 rounded ${
                        metadata.subtitle ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {metadata.subtitle ? 'مكتمل' : 'اختياري'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm">المراسل</span>
                      <span className={`text-xs px-2 py-1 rounded ${
                        metadata.reporter ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {metadata.reporter ? 'محدد' : 'مطلوب'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm">الصور</span>
                      <span className={`text-xs px-2 py-1 rounded ${
                        metadata.images.length > 0 ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {metadata.images.length > 0 ? `${metadata.images.length} صورة` : 'لا توجد'}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
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

// مكون مُحاط بـ Error Boundary
const SafeSimpleAdvancedEditor: React.FC<any> = (props) => {
  return (
    <EditorErrorBoundary>
      <SimpleAdvancedEditor {...props} />
    </EditorErrorBoundary>
  );
};

export default SafeSimpleAdvancedEditor;
