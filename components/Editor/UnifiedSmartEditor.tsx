/**
 * المحرر الذكي الموحد - كل الميزات في صفحة واحدة
 * Unified Smart Editor - All features in one page
 */

'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import OptimizedImageUpload from '@/components/ui/optimized-image-upload';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import {
  Bold,
  Brain,
  Calendar,
  Camera,
  CheckCircle,
  Clock,
  FileText,
  Heading1,
  Heading2,
  Image as ImageIcon,
  Italic,
  Link as LinkIcon,
  List,
  ListOrdered,
  Plus,
  Quote,
  Redo,
  RefreshCw,
  Save,
  Sparkles,
  Trash2,
  Type,
  Undo,
  Users,
  Wand2
} from 'lucide-react';
import React, { useCallback, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import EditorErrorBoundary from './EditorErrorBoundary';

interface UnifiedEditorProps {
  initialContent?: string;
  onSave?: (content: any, metadata: any) => Promise<void>;
  readOnly?: boolean;
}

interface ArticleData {
  // معلومات أساسية
  title: string;
  subtitle: string;
  summary: string;
  content: any;

  // المراسل
  reporter: {
    name: string;
    email: string;
    location: string;
    phone?: string;
  } | null;

  // التصنيف والوسوم
  category: string;
  tags: string[];
  priority: 'normal' | 'urgent' | 'breaking';
  status: 'draft' | 'review' | 'published';

  // الوسائط
  images: string[];

  // البيانات الوصفية
  location: string;
  publishDate: Date;
  wordCount: number;
  readingTime: number;
}

const UnifiedSmartEditor: React.FC<UnifiedEditorProps> = ({
  initialContent = '',
  onSave,
  readOnly = false
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // بيانات المقال الموحدة
  const [articleData, setArticleData] = useState<ArticleData>({
    title: '',
    subtitle: '',
    summary: '',
    content: null,
    reporter: null,
    category: '',
    tags: [],
    priority: 'normal',
    status: 'draft',
    images: [],
    location: '',
    publishDate: new Date(),
    wordCount: 0,
    readingTime: 0
  });

  // قائمة المراسلين المحددة مسبقاً
  const predefinedReporters = [
    { name: 'أحمد السعيد', email: 'ahmed@sabq.org', location: 'الرياض', phone: '+966501234567' },
    { name: 'فاطمة النجار', email: 'fatima@sabq.org', location: 'جدة', phone: '+966502345678' },
    { name: 'محمد العتيبي', email: 'mohammed@sabq.org', location: 'الدمام', phone: '+966503456789' },
    { name: 'نورا المطيري', email: 'nora@sabq.org', location: 'المدينة المنورة', phone: '+966504567890' }
  ];

  // إعداد المحرر
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] }
      }),
      Image,
      Link.configure({
        openOnClick: false,
      })
    ],
    content: initialContent,
    editable: !readOnly,
    onUpdate: ({ editor }) => {
      const text = editor.getText();
      const words = text.match(/[\u0600-\u06FF\w]+/g) || [];
      const wordCount = words.length;
      const readingTime = Math.ceil(wordCount / 200);

      setArticleData(prev => ({
        ...prev,
        content: editor.getJSON(),
        wordCount,
        readingTime
      }));
    }
  });

  // حفظ المحتوى
  const handleSave = useCallback(async () => {
    if (!onSave || !editor) return;

    try {
      setIsSaving(true);
      await onSave(editor.getJSON(), articleData);
      setLastSaved(new Date());
      toast.success('تم حفظ المحتوى بنجاح');
    } catch (error) {
      toast.error('فشل في حفظ المحتوى');
    } finally {
      setIsSaving(false);
    }
  }, [editor, articleData, onSave]);

  // رفع الصور
  const handleImageUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || !editor) return;

    Array.from(files).forEach(file => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const imageUrl = e.target?.result as string;

          // إدراج في المحرر
          editor.chain().focus().setImage({ src: imageUrl }).run();

          // إضافة لقائمة الصور
          setArticleData(prev => ({
            ...prev,
            images: [...prev.images, imageUrl]
          }));

          toast.success('تم رفع الصورة بنجاح');
        };
        reader.readAsDataURL(file);
      }
    });
  }, [editor]);

  // توليد موجز ذكي
  const generateSmartSummary = useCallback(async () => {
    if (!editor) return;

    setIsGenerating(true);
    try {
      const content = editor.getText();

      // محاكاة AI
      await new Promise(resolve => setTimeout(resolve, 2000));

      const summary = `هذا ملخص ذكي تم توليده تلقائياً بناءً على المحتوى. يتناول المقال ${articleData.wordCount} كلمة ويحتاج ${articleData.readingTime} دقائق للقراءة.`;

      setArticleData(prev => ({
        ...prev,
        summary,
        title: prev.title || 'عنوان مقترح بناءً على المحتوى',
        subtitle: prev.subtitle || 'عنوان فرعي يلخص الموضوع الرئيسي'
      }));

      toast.success('تم توليد الموجز الذكي');
    } catch (error) {
      toast.error('فشل في توليد الموجز');
    } finally {
      setIsGenerating(false);
    }
  }, [editor, articleData.wordCount, articleData.readingTime]);

  // توليد محتوى بالذكاء الاصطناعي
  const generateAIContent = useCallback(async (type: 'full' | 'paragraph' | 'improve') => {
    if (!editor) return;

    setIsGenerating(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));

      let aiContent = '';

      switch (type) {
        case 'full':
          aiContent = `
<h2>مقال تم توليده بالذكاء الاصطناعي</h2>
<p>هذا محتوى تجريبي تم إنشاؤه باستخدام الذكاء الاصطناعي. يمكن للنظام توليد مقالات كاملة حول أي موضوع.</p>
<p>يتميز المحتوى المولد بالذكاء الاصطناعي بالدقة والشمولية، مع مراعاة السياق الثقافي واللغوي.</p>
<ul>
  <li>نقطة رئيسية أولى</li>
  <li>نقطة رئيسية ثانية</li>
  <li>نقطة رئيسية ثالثة</li>
</ul>
          `;
          break;

        case 'paragraph':
          aiContent = '<p>فقرة جديدة تم توليدها بالذكاء الاصطناعي. تحتوي على معلومات مفيدة ومنظمة بشكل احترافي.</p>';
          break;

        case 'improve':
          const currentContent = editor.getHTML();
          aiContent = currentContent + '<p><strong>تحسين:</strong> تم تحسين النص وإضافة معلومات إضافية لجعله أكثر وضوحاً وفائدة.</p>';
          break;
      }

      editor.commands.setContent(aiContent);
      toast.success('تم توليد المحتوى بنجاح');
    } catch (error) {
      toast.error('فشل في توليد المحتوى');
    } finally {
      setIsGenerating(false);
    }
  }, [editor]);

  // اختيار مراسل سريع
  const selectReporter = (reporter: typeof predefinedReporters[0]) => {
    setArticleData(prev => ({
      ...prev,
      reporter: {
        name: reporter.name,
        email: reporter.email,
        location: reporter.location,
        phone: reporter.phone
      }
    }));
    toast.success(`تم اختيار المراسل: ${reporter.name}`);
  };

  // أزرار شريط الأدوات
  const ToolbarButton = ({ onClick, isActive = false, children, title }: any) => (
    <Button
      variant={isActive ? "default" : "ghost"}
      size="sm"
      onClick={onClick}
      title={title}
      className={`h-8 w-8 p-0 ${isActive ? 'bg-blue-100 text-blue-700' : ''}`}
    >
      {children}
    </Button>
  );

  if (!editor) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="space-y-4 max-w-7xl mx-auto">
      {/* شريط الحالة البسيط */}
      <div className="flex items-center justify-between p-4 bg-white border rounded-lg shadow-sm">
        <div className="flex items-center gap-3">
          <Brain className="w-6 h-6 text-blue-600" />
          <div>
            <h1 className="text-lg font-semibold text-gray-900">المحرر الذكي</h1>
            <p className="text-sm text-gray-500">محرر متطور وسهل الاستخدام</p>
          </div>
        </div>

        <div className="flex items-center gap-6 text-sm text-gray-600">
          <div className="flex items-center gap-1">
            <Type className="w-4 h-4" />
            <span>{articleData.wordCount} كلمة</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            <span>{articleData.readingTime} دقيقة</span>
          </div>
          {lastSaved && (
            <div className="flex items-center gap-1 text-green-600">
              <CheckCircle className="w-4 h-4" />
              <span>محفوظ</span>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-4">
        {/* العمود الرئيسي - المحرر والمحتوى */}
        <div className="xl:col-span-3 space-y-4">
          {/* المعلومات الأساسية في صف واحد */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="shadow-sm">
              <CardContent className="p-4 space-y-3">
                <div>
                  <Label htmlFor="title" className="text-sm font-medium">العنوان الرئيسي</Label>
                  <Input
                    id="title"
                    value={articleData.title}
                    onChange={(e) => setArticleData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="أدخل العنوان الرئيسي..."
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="subtitle" className="text-sm font-medium">العنوان الفرعي</Label>
                  <Input
                    id="subtitle"
                    value={articleData.subtitle}
                    onChange={(e) => setArticleData(prev => ({ ...prev, subtitle: e.target.value }))}
                    placeholder="أدخل العنوان الفرعي..."
                    className="mt-1"
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm">
              <CardContent className="p-4 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-sm font-medium">التصنيف</Label>
                    <Select
                      value={articleData.category}
                      onValueChange={(value) => setArticleData(prev => ({ ...prev, category: value }))}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="اختر..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="politics">سياسة</SelectItem>
                        <SelectItem value="economy">اقتصاد</SelectItem>
                        <SelectItem value="technology">تقنية</SelectItem>
                        <SelectItem value="sports">رياضة</SelectItem>
                        <SelectItem value="culture">ثقافة</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">الأولوية</Label>
                    <Select
                      value={articleData.priority}
                      onValueChange={(value: any) => setArticleData(prev => ({ ...prev, priority: value }))}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="اختر..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="breaking">🔴 عاجل</SelectItem>
                        <SelectItem value="urgent">🟡 مهم</SelectItem>
                        <SelectItem value="normal">⚪ عادي</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium">الكلمات المفتاحية</Label>
                  <Input
                    value={articleData.tags.join(', ')}
                    onChange={(e) => setArticleData(prev => ({
                      ...prev,
                      tags: e.target.value.split(',').map(tag => tag.trim()).filter(Boolean)
                    }))}
                    placeholder="تقنية, أخبار, تطوير..."
                    className="mt-1"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* الملخص */}
          <Card className="shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <FileText className="w-4 h-4 text-gray-600" />
                <Label className="text-sm font-medium">الملخص</Label>
                <Button
                  onClick={generateSmartSummary}
                  disabled={isGenerating}
                  size="sm"
                  variant="outline"
                  className="mr-auto"
                >
                  <Sparkles className="w-3 h-3 ml-1" />
                  توليد ذكي
                </Button>
              </div>
              <Textarea
                value={articleData.summary}
                onChange={(e) => setArticleData(prev => ({ ...prev, summary: e.target.value }))}
                placeholder="ملخص مختصر للمقال..."
                rows={2}
                className="resize-none"
              />
            </CardContent>
          </Card>

          {/* المحرر */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wand2 className="w-5 h-5" />
                محرر المحتوى
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* شريط الأدوات */}
              <div className="flex items-center gap-2 flex-wrap p-3 border rounded-lg bg-gray-50">
                <div className="flex items-center gap-1">
                  <ToolbarButton
                    onClick={() => editor.chain().focus().toggleBold().run()}
                    isActive={editor.isActive('bold')}
                    title="غامق"
                  >
                    <Bold className="w-4 h-4" />
                  </ToolbarButton>
                  <ToolbarButton
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                    isActive={editor.isActive('italic')}
                    title="مائل"
                  >
                    <Italic className="w-4 h-4" />
                  </ToolbarButton>
                </div>

                <Separator orientation="vertical" className="h-6" />

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
                </div>

                <Separator orientation="vertical" className="h-6" />

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

                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    title="رفع صورة"
                  >
                    <Camera className="w-4 h-4" />
                  </Button>
                  <ToolbarButton
                    onClick={() => {
                      const url = window.prompt('أدخل رابط URL');
                      if (url) {
                        editor.chain().focus().setLink({ href: url }).run();
                      }
                    }}
                    isActive={editor.isActive('link')}
                    title="رابط"
                  >
                    <LinkIcon className="w-4 h-4" />
                  </ToolbarButton>
                </div>

                <Separator orientation="vertical" className="h-6" />

                <div className="flex items-center gap-1">
                  <ToolbarButton
                    onClick={() => editor.chain().focus().undo().run()}
                    disabled={!editor.can().undo()}
                    title="تراجع"
                  >
                    <Undo className="w-4 h-4" />
                  </ToolbarButton>
                  <ToolbarButton
                    onClick={() => editor.chain().focus().redo().run()}
                    disabled={!editor.can().redo()}
                    title="إعادة"
                  >
                    <Redo className="w-4 h-4" />
                  </ToolbarButton>
                </div>

                <div className="mr-auto">
                  <Button
                    onClick={handleSave}
                    disabled={isSaving || readOnly}
                    size="sm"
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Save className="w-4 h-4 ml-1" />
                    {isSaving ? 'جاري الحفظ...' : 'حفظ'}
                  </Button>
                </div>
              </div>

              {/* منطقة المحرر */}
              <div className="border rounded-lg min-h-[400px] p-4">
                <EditorContent
                  editor={editor}
                  className="prose prose-lg max-w-none focus:outline-none rtl"
                />
              </div>

              {/* أدوات الذكاء الاصطناعي */}
              <div className="flex items-center gap-2 flex-wrap">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => generateAIContent('full')}
                  disabled={isGenerating}
                >
                  <Sparkles className="w-4 h-4 ml-1" />
                  توليد مقال كامل
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => generateAIContent('paragraph')}
                  disabled={isGenerating}
                >
                  <Plus className="w-4 h-4 ml-1" />
                  إضافة فقرة
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => generateAIContent('improve')}
                  disabled={isGenerating}
                >
                  <Wand2 className="w-4 h-4 ml-1" />
                  تحسين النص
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* العمود الأيمن - الأدوات الجانبية */}
        <div className="space-y-4">
          {/* المراسل */}
          <div className="bg-white border rounded-lg p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <Users className="w-4 h-4 text-gray-600" />
              <span className="text-sm font-medium">المراسل</span>
            </div>

            {articleData.reporter ? (
              <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-medium">
                  {articleData.reporter.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{articleData.reporter.name}</p>
                  <p className="text-xs text-gray-500 truncate">{articleData.reporter.location}</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setArticleData(prev => ({ ...prev, reporter: null }))}
                  className="h-6 w-6 p-0"
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            ) : (
              <Select onValueChange={(value) => {
                const reporter = predefinedReporters[parseInt(value)];
                selectReporter(reporter);
              }}>
                <SelectTrigger className="text-sm">
                  <SelectValue placeholder="اختر مراسل..." />
                </SelectTrigger>
                <SelectContent>
                  {predefinedReporters.map((reporter, index) => (
                    <SelectItem key={index} value={index.toString()}>
                      {reporter.name} - {reporter.location}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {/* التفاصيل الإضافية */}
          <div className="bg-white border rounded-lg p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <Calendar className="w-4 h-4 text-gray-600" />
              <span className="text-sm font-medium">التفاصيل</span>
            </div>

            <div className="space-y-3">
              <div>
                <Label className="text-xs text-gray-600">الموقع</Label>
                <Input
                  value={articleData.location}
                  onChange={(e) => setArticleData(prev => ({ ...prev, location: e.target.value }))}
                  placeholder="الرياض، السعودية"
                  className="mt-1 text-sm"
                />
              </div>

              <div>
                <Label className="text-xs text-gray-600">الحالة</Label>
                <Select
                  value={articleData.status}
                  onValueChange={(value: any) => setArticleData(prev => ({ ...prev, status: value }))}
                >
                  <SelectTrigger className="mt-1 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">🟡 مسودة</SelectItem>
                    <SelectItem value="review">🔵 قيد المراجعة</SelectItem>
                    <SelectItem value="published">🟢 منشور</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* الصور */}
          <div className="bg-white border rounded-lg p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <ImageIcon className="w-4 h-4 text-gray-600" />
              <span className="text-sm font-medium">الصور ({articleData.images.length})</span>
            </div>
            
            <OptimizedImageUpload
              onImageUpload={(imageUrl) => {
                setArticleData(prev => ({
                  ...prev,
                  images: [...prev.images, imageUrl]
                }));
                
                // إدراج في المحرر أيضاً
                if (editor) {
                  editor.chain().focus().setImage({ src: imageUrl }).run();
                }
              }}
              maxSize={5} // 5MB
              acceptedTypes={['image/jpeg', 'image/png', 'image/webp']}
            />

            {/* عرض الصور المرفقة */}
            {articleData.images.length > 0 && (
              <div className="grid grid-cols-3 gap-2 mt-4">
                {articleData.images.map((image, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={image}
                      alt={`صورة ${index + 1}`}
                      className="w-full h-16 object-cover rounded border"
                    />
                    <Button
                      variant="destructive"
                      size="sm"
                      className="absolute top-0.5 right-0.5 opacity-0 group-hover:opacity-100 transition-opacity h-4 w-4 p-0"
                      onClick={() => setArticleData(prev => ({
                        ...prev,
                        images: prev.images.filter((_, i) => i !== index)
                      }))}
                    >
                      <Trash2 className="w-2 h-2" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ملف الإدخال المخفي */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleImageUpload}
        accept="image/*"
        multiple
        className="hidden"
      />
    </div>
  );
};

// مكون مُحاط بـ Error Boundary
const SafeUnifiedSmartEditor: React.FC<UnifiedEditorProps> = (props) => {
  return (
    <EditorErrorBoundary>
      <UnifiedSmartEditor {...props} />
    </EditorErrorBoundary>
  );
};

export default SafeUnifiedSmartEditor;
