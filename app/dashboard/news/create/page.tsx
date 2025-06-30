'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Calendar, Upload, Save, Send, Eye, Sparkles, AlertCircle, X, Plus, Loader2, FileText, Image as ImageIcon, User, Tag, Globe, Zap, Palette, Link2, Search, Clock, TrendingUp, BookOpen, Hash, Type } from 'lucide-react';
import dynamic from 'next/dynamic';
import { toast } from 'react-hot-toast';
import { useDarkModeContext } from '@/contexts/DarkModeContext';
import { TabsEnhanced } from '@/components/ui/tabs-enhanced';

// تحميل المحرر بشكل ديناميكي
const Editor = dynamic(() => import('@/components/Editor/Editor'), { ssr: false });

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface Author {
  id: string;
  name: string;
  email: string;
}

interface UploadedImage {
  id: string;
  url: string;
  publicId: string;
  width: number;
  height: number;
  format: string;
}

export default function CreateArticlePage() {
  const router = useRouter();
  const { darkMode } = useDarkModeContext();
  const [categories, setCategories] = useState<Category[]>([]);
  const [authors, setAuthors] = useState<Author[]>([]);
  const [saving, setSaving] = useState(false);
  const [isAILoading, setIsAILoading] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<any>({});
  const [uploadingImage, setUploadingImage] = useState(false);
  const [activeTab, setActiveTab] = useState('content');
  
  // مرجع للمحرر
  const editorRef = useRef<any>(null);

  // حالة النموذج
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    excerpt: '',
    content: '',
    authorId: '',
    categoryId: '',
    type: 'local',
    isBreaking: false,
    isFeatured: false,
    featuredImage: '',
    gallery: [] as UploadedImage[],
    externalLink: '',
    publishType: 'now',
    scheduledDate: '',
    keywords: [] as string[],
    seoTitle: '',
    seoDescription: '',
    status: 'draft' as 'draft' | 'pending_review' | 'published'
  });

  // تحميل البيانات الأساسية
  useEffect(() => {
    fetchCategories();
    fetchAuthors();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories');
      const data = await response.json();
      // التأكد من أن البيانات في شكل مصفوفة
      setCategories(Array.isArray(data.categories) ? data.categories : []);
    } catch (error) {
      console.error('خطأ في تحميل التصنيفات:', error);
      setCategories([]); // تعيين مصفوفة فارغة في حالة الخطأ
    }
  };

  const fetchAuthors = async () => {
    try {
      const response = await fetch('/api/team-members');
      const data = await response.json();
      // التأكد من أن البيانات في شكل مصفوفة
      setAuthors(Array.isArray(data.data) ? data.data : []);
    } catch (error) {
      console.error('خطأ في تحميل المراسلين:', error);
      setAuthors([]); // تعيين مصفوفة فارغة في حالة الخطأ
    }
  };

  // رفع الصورة البارزة
  const handleFeaturedImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', 'featured');

    try {
      setUploadingImage(true);
      const response = await fetch('/api/media/upload', {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        const data = await response.json();
        setFormData(prev => ({ ...prev, featuredImage: data.url }));
      }
    } catch (error) {
      console.error('خطأ في رفع الصورة:', error);
    } finally {
      setUploadingImage(false);
    }
  };

  // رفع صور الألبوم
  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    setUploadingImage(true);
    const uploadedImages: UploadedImage[] = [];

    for (const file of Array.from(files)) {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', 'gallery');

      try {
        const response = await fetch('/api/media/upload', {
          method: 'POST',
          body: formData
        });

        if (response.ok) {
          const data = await response.json();
          uploadedImages.push(data);
        }
      } catch (error) {
        console.error('خطأ في رفع الصورة:', error);
      }
    }

    setFormData(prev => ({ 
      ...prev, 
      gallery: [...prev.gallery, ...uploadedImages] 
    }));
    setUploadingImage(false);
  };

  // استدعاء الذكاء الاصطناعي
  const callAI = async (type: string, content: string, context?: any) => {
    setIsAILoading(true);
    try {
      const response = await fetch('/api/ai/editor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, content, context })
      });
      
      const data = await response.json();
      return data.result;
    } catch (error) {
      console.error('AI Error:', error);
      toast.error('حدث خطأ في الذكاء الاصطناعي');
      return null;
    } finally {
      setIsAILoading(false);
    }
  };

  // توليد فقرة تمهيدية
  const generateIntro = async () => {
    if (!formData.title) {
      toast.error('يرجى كتابة العنوان أولاً');
      return;
    }
    
    const result = await callAI('generate_paragraph', formData.title);
    if (result && editorRef.current) {
      editorRef.current.setContent(result);
      toast.success('تم توليد المقدمة بنجاح');
    }
  };

  // اقتراح عناوين
  const suggestTitles = async () => {
    if (!formData.excerpt) {
      toast.error('يرجى كتابة الموجز أولاً');
      return;
    }
    
    const result = await callAI('title', formData.excerpt);
    if (result) {
      setAiSuggestions({ ...aiSuggestions, titles: result.split('\n') });
      toast.success('تم اقتراح عناوين جديدة');
    }
  };

  // اقتراح كلمات مفتاحية
  const suggestKeywords = async () => {
    // الحصول على النص من المحرر أو استخدام الموجز
    let textContent = formData.excerpt;
    
    if (editorRef.current) {
      const editorContent = editorRef.current.getHTML();
      if (editorContent && editorContent.length > 50) {
        // إزالة HTML tags للحصول على النص الصافي
        textContent = editorContent.replace(/<[^>]*>/g, '');
      }
    }
    
    if (!textContent || textContent.length < 20) {
      toast.error('يرجى كتابة محتوى أولاً');
      return;
    }
    
    const result = await callAI('keywords', textContent);
    if (result) {
      // تحويل النتيجة إلى مصفوفة من الكلمات المفتاحية
      const keywords = result.split(',').map((k: string) => k.trim()).filter((k: string) => k);
      setFormData(prev => ({ ...prev, keywords }));
      toast.success('تم اقتراح الكلمات المفتاحية');
    }
  };

  // كتابة مقال كامل
  const generateFullArticle = async () => {
    if (!formData.title) {
      toast.error('يرجى كتابة العنوان أولاً');
      return;
    }
    
    const confirmed = confirm('هل تريد توليد مقال كامل بالذكاء الاصطناعي؟ سيستبدل المحتوى الحالي.');
    if (!confirmed) return;
    
    const result = await callAI('full_article', formData.title, { excerpt: formData.excerpt });
    if (result && editorRef.current) {
      editorRef.current.setContent(result);
      toast.success('تم توليد المقال بنجاح');
    }
  };

  // تحليل جودة الموجز
  const analyzeExcerpt = (excerpt: string) => {
    const minLength = 50;
    const maxLength = 160;
    const idealLength = 120;
    
    if (excerpt.length < minLength) {
      return { 
        quality: 'poor', 
        message: `الموجز قصير جداً (${excerpt.length} حرف). يُفضل ${minLength} حرف على الأقل.`,
        color: 'text-red-600'
      };
    } else if (excerpt.length > maxLength) {
      return { 
        quality: 'poor', 
        message: `الموجز طويل جداً (${excerpt.length} حرف). الحد الأقصى ${maxLength} حرف.`,
        color: 'text-red-600'
      };
    } else if (excerpt.length >= idealLength - 20 && excerpt.length <= idealLength + 20) {
      return { 
        quality: 'excellent', 
        message: `ممتاز! (${excerpt.length} حرف)`,
        color: 'text-green-600'
      };
    } else {
      return { 
        quality: 'good', 
        message: `جيد (${excerpt.length} حرف)`,
        color: 'text-yellow-600'
      };
    }
  };

  // التحقق من البيانات قبل الحفظ
  const validateForm = () => {
    const errors = [];
    
    if (!formData.title.trim()) {
      errors.push('العنوان الرئيسي مطلوب');
    }
    
    if (!formData.excerpt.trim()) {
      errors.push('الموجز مطلوب');
    }
    
    // التحقق من المحتوى من المحرر
    const editorContent = editorRef.current ? editorRef.current.getHTML() : '';
    const plainText = editorContent.replace(/<[^>]*>/g, '').trim();
    
    if (!plainText || plainText.length < 10) {
      errors.push('محتوى المقال مطلوب');
    }
    
    if (!formData.authorId) {
      errors.push('يجب اختيار المراسل/الكاتب');
    }
    
    if (!formData.categoryId) {
      errors.push('يجب اختيار التصنيف');
    }
    
    const excerptAnalysis = analyzeExcerpt(formData.excerpt);
    if (excerptAnalysis.quality === 'poor') {
      errors.push(excerptAnalysis.message);
    }
    
    return errors;
  };

  // حفظ المقال
  const handleSubmit = async (status: 'draft' | 'pending_review' | 'published') => {
    // التحقق من البيانات
    const errors = validateForm();
    if (errors.length > 0 && status !== 'draft') {
      alert('يرجى تصحيح الأخطاء التالية:\n\n' + errors.join('\n'));
      return;
    }
    setSaving(true);

    try {
      // إعداد البيانات للحفظ (مطابقة لأسماء الحقول فى الـ API)
      const articleData: any = {
        title: formData.title.trim(),
        content: editorRef.current ? editorRef.current.getHTML() : formData.content,
        summary: formData.excerpt.trim(),
        author_id: formData.authorId || undefined,
        category_id: formData.categoryId || undefined,
        is_featured: formData.isFeatured,
        is_breaking: formData.isBreaking,
        featured_image: formData.featuredImage || undefined,
        keywords: formData.keywords,
        seo_title: formData.seoTitle,
        seo_description: formData.seoDescription,
        status,
      };

      // التعامل مع النشر المجدول
      if (formData.publishType === 'scheduled' && formData.scheduledDate) {
        articleData.publish_at = formData.scheduledDate;
      }

      const response = await fetch('/api/articles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(articleData),
      });

      if (response.ok) {
        const successMessage = status === 'draft'
          ? 'تم حفظ المسودة بنجاح'
          : status === 'pending_review'
          ? 'تم إرسال المقال للمراجعة'
          : 'تم نشر المقال بنجاح';
        alert(successMessage);
        router.push(`/dashboard/news`);
      } else {
        const data = await response.json();
        throw new Error(data.error || 'فشل حفظ المقال');
      }
    } catch (error) {
      console.error('خطأ في حفظ المقال:', error);
      alert('حدث خطأ في حفظ المقال');
    } finally {
      setSaving(false);
    }
  };

  // إضافة كلمة مفتاحية
  const addKeyword = (keyword: string) => {
    if (!formData.keywords.includes(keyword)) {
      setFormData(prev => ({
        ...prev,
        keywords: [...prev.keywords, keyword]
      }));
    }
  };

  // حذف كلمة مفتاحية
  const removeKeyword = (keyword: string) => {
    setFormData(prev => ({
      ...prev,
      keywords: prev.keywords.filter(k => k !== keyword)
    }));
  };

  // إضافة دالة generateSlug للاستخدام في معاينة SEO
  const generateSlug = (title: string): string => {
    return title
      .toLowerCase()
      .replace(/[^\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  return (
    <div className={`min-h-screen p-8 transition-colors duration-300 ${
      darkMode ? 'bg-gray-900' : 'bg-gray-50'
    }`} dir="rtl">
      {/* عنوان وتعريف الصفحة */}
      <div className="mb-8">
        <h1 className={`text-3xl font-bold mb-2 transition-colors duration-300 ${
          darkMode ? 'text-white' : 'text-gray-800'
        }`}>إنشاء مقال جديد</h1>
        <p className={`transition-colors duration-300 ${
          darkMode ? 'text-gray-300' : 'text-gray-600'
        }`}>أنشئ محتوى جذاب بمساعدة الذكاء الاصطناعي</p>
      </div>

      {/* قسم نظام المحرر الذكي */}
      <div className="mb-8">
        <div className={`rounded-2xl p-6 border transition-colors duration-300 ${
          darkMode 
            ? 'bg-gradient-to-r from-purple-900/30 to-blue-900/30 border-purple-700' 
            : 'bg-gradient-to-r from-purple-50 to-blue-50 border-purple-100'
        }`}>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-600 rounded-xl flex items-center justify-center">
              <Sparkles className="w-7 h-7 text-white" />
            </div>
            <div>
              <h2 className={`text-xl font-bold transition-colors duration-300 ${
                darkMode ? 'text-white' : 'text-gray-800'
              }`}>محرر المقالات الذكي</h2>
              <p className={`text-sm transition-colors duration-300 ${
                darkMode ? 'text-gray-300' : 'text-gray-600'
              }`}>استخدم قوة الذكاء الاصطناعي لإنشاء محتوى احترافي</p>
            </div>
            <div className="mr-auto flex gap-2">
              <Button
                variant="outline"
                onClick={() => handleSubmit('draft')}
                disabled={saving}
                className={darkMode ? 'border-gray-600' : ''}
              >
                {saving ? <Loader2 className="w-4 h-4 ml-2 animate-spin" /> : <Save className="w-4 h-4 ml-2" />}
                حفظ كمسودة
              </Button>
              <Button
                variant="secondary"
                onClick={() => handleSubmit('pending_review')}
                disabled={saving}
              >
                <Send className="w-4 h-4 ml-2" />
                إرسال للمراجعة
              </Button>
              <Button
                onClick={() => handleSubmit('published')}
                disabled={saving || formData.publishType === 'scheduled'}
                className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
              >
                <Eye className="w-4 h-4 ml-2" />
                نشر المقال
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* أزرار التنقل */}
      <TabsEnhanced
        tabs={[
          { id: 'content', name: 'المحتوى', icon: FileText },
          { id: 'media', name: 'الوسائط', icon: ImageIcon },
          { id: 'seo', name: 'تحسين البحث', icon: Search },
          { id: 'ai', name: 'مساعد الذكاء', icon: Sparkles }
        ]}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* العمود الرئيسي */}
        <div className="lg:col-span-2 space-y-6">
          {/* تاب المحتوى */}
          {activeTab === 'content' && (
            <div className="space-y-6">
              {/* معلومات أساسية */}
              <Card>
                <CardHeader>
                  <CardTitle>المعلومات الأساسية</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* العنوان */}
                  <div>
                    <Label htmlFor="title">العنوان *</Label>
                    <div className="flex gap-2">
                      <Input
                        id="title"
                        value={formData.title}
                        onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="عنوان المقال"
                        required
                        className="flex-1"
                      />
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={suggestTitles}
                        disabled={isAILoading || !formData.excerpt}
                        title="اقتراح عناوين بناءً على الموجز"
                      >
                        {isAILoading ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Sparkles className="w-4 h-4" />
                        )}
                        <span className="mr-1">اقتراح</span>
                      </Button>
                    </div>
                    
                    {/* عرض العناوين المقترحة */}
                    {aiSuggestions.titles && aiSuggestions.titles.length > 0 && (
                      <div className="mt-2 p-3 bg-secondary/20 rounded-lg">
                        <p className="text-sm font-medium mb-2">عناوين مقترحة:</p>
                        <div className="space-y-2">
                          {aiSuggestions.titles.map((title: string, index: number) => (
                            <button
                              key={index}
                              type="button"
                              onClick={() => setFormData(prev => ({ ...prev, title: title.replace(/^\d+\.\s*/, '') }))}
                              className="w-full text-right p-2 hover:bg-secondary/50 rounded transition-colors text-sm"
                            >
                              {title}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="subtitle">العنوان الفرعي</Label>
                    <Input
                      id="subtitle"
                      value={formData.subtitle}
                      onChange={(e) => setFormData(prev => ({ ...prev, subtitle: e.target.value }))}
                      placeholder="عنوان فرعي اختياري"
                    />
                  </div>

                  <div>
                    <Label htmlFor="excerpt">الموجز / Lead *</Label>
                    <Textarea
                      id="excerpt"
                      value={formData.excerpt}
                      onChange={(e) => setFormData(prev => ({ ...prev, excerpt: e.target.value }))}
                      placeholder="موجز المقال (يظهر في صفحة المقال)"
                      rows={3}
                      required
                    />
                    <div className="flex justify-between items-center mt-1">
                      <p className="text-sm text-muted-foreground">
                        {formData.excerpt.length} / 160 حرف (الموصى به)
                      </p>
                      {formData.excerpt.length > 0 && (
                        <p className={`text-sm font-medium ${analyzeExcerpt(formData.excerpt).color}`}>
                          {analyzeExcerpt(formData.excerpt).message}
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* المحتوى */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex justify-between items-center">
                    <span>محتوى المقال</span>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={generateIntro}
                        disabled={isAILoading || !formData.title}
                        title="توليد مقدمة بناءً على العنوان"
                      >
                        {isAILoading ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Sparkles className="w-4 h-4" />
                        )}
                        <span className="mr-1">مقدمة تلقائية</span>
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={generateFullArticle}
                        disabled={isAILoading || !formData.title}
                        title="كتابة مقال كامل بالذكاء الاصطناعي"
                      >
                        {isAILoading ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Sparkles className="w-4 h-4" />
                        )}
                        <span className="mr-1">مقال كامل</span>
                      </Button>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Editor
                    ref={editorRef}
                    content={formData.content}
                    onChange={(content) => {
                      // حفظ كل من HTML والنص العادي
                      if (typeof content === 'object' && content.html) {
                        setFormData(prev => ({ ...prev, content: content.html }));
                      } else if (typeof content === 'string') {
                        setFormData(prev => ({ ...prev, content }));
                      }
                    }}
                    placeholder="اكتب محتوى المقال هنا..."
                    enableAI={true}
                    onAIAction={async (action, content) => {
                      const result = await callAI(action, content);
                      if (result && editorRef.current) {
                        // إدراج النتيجة في المحرر
                        if (action === 'rewrite') {
                          // استبدال النص المحدد
                          editorRef.current.setContent(result);
                        } else {
                          // إضافة نص جديد
                          const currentContent = editorRef.current.getHTML();
                          editorRef.current.setContent(currentContent + '<p>' + result + '</p>');
                        }
                      }
                    }}
                  />
                </CardContent>
              </Card>
            </div>
          )}

          {/* تاب الوسائط */}
          {activeTab === 'media' && (
            <Card>
              <CardHeader>
                <CardTitle>الصور والوسائط</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* الصورة البارزة */}
                  <div>
                    <Label>الصورة البارزة</Label>
                    <div className="mt-2">
                      {formData.featuredImage ? (
                        <div className="relative">
                          <img
                            src={formData.featuredImage}
                            alt="الصورة البارزة"
                            className="w-full h-64 object-cover rounded-lg"
                          />
                          <Button
                            variant="destructive"
                            size="icon"
                            className="absolute top-2 right-2"
                            onClick={() => setFormData(prev => ({ ...prev, featuredImage: '' }))}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ) : (
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                          {uploadingImage ? (
                            <Loader2 className="w-12 h-12 mx-auto text-gray-400 mb-2 animate-spin" />
                          ) : (
                            <Upload className="w-12 h-12 mx-auto text-gray-400 mb-2" />
                          )}
                          <Label htmlFor="featured-image" className="cursor-pointer text-primary">
                            انقر لرفع الصورة البارزة
                          </Label>
                          <Input
                            id="featured-image"
                            type="file"
                            accept="image/*"
                            onChange={handleFeaturedImageUpload}
                            className="hidden"
                            disabled={uploadingImage}
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* ألبوم الصور */}
                  <div>
                    <Label>ألبوم الصور</Label>
                    {formData.gallery.length > 1 && (
                      <Alert className="mt-2 mb-2 bg-blue-50 border-blue-200">
                        <AlertCircle className="h-4 w-4 text-blue-600" />
                        <AlertDescription className="text-blue-800">
                          سيتم عرض الصور كألبوم تلقائي في المقال ({formData.gallery.length} صور)
                        </AlertDescription>
                      </Alert>
                    )}
                    <div className="mt-2 space-y-2">
                      {formData.gallery.length > 0 && (
                        <div className="grid grid-cols-3 gap-2">
                          {formData.gallery.map((image, index) => (
                            <div key={image.id} className="relative">
                              <img
                                src={image.url}
                                alt={`صورة ${index + 1}`}
                                className="w-full h-32 object-cover rounded"
                              />
                              <Button
                                variant="destructive"
                                size="icon"
                                className="absolute top-1 right-1 h-6 w-6"
                                onClick={() => {
                                  setFormData(prev => ({
                                    ...prev,
                                    gallery: prev.gallery.filter(img => img.id !== image.id)
                                  }));
                                }}
                              >
                                <X className="w-3 h-3" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                        <Label htmlFor="gallery" className="cursor-pointer text-primary">
                          <Plus className="w-6 h-6 mx-auto mb-1" />
                          إضافة صور للألبوم
                        </Label>
                        <Input
                          id="gallery"
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={handleGalleryUpload}
                          className="hidden"
                          disabled={uploadingImage}
                        />
                      </div>
                    </div>
                  </div>

                  {/* رابط خارجي */}
                  <div>
                    <Label htmlFor="external-link">رابط خارجي (اختياري)</Label>
                    <Input
                      id="external-link"
                      type="url"
                      value={formData.externalLink}
                      onChange={(e) => setFormData(prev => ({ ...prev, externalLink: e.target.value }))}
                      placeholder="https://example.com"
                      dir="ltr"
                    />
                  </div>
                </CardContent>
              </Card>
            )}

          {/* تاب SEO */}
          {activeTab === 'seo' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="w-5 h-5 text-blue-500" />
                  تحسين محركات البحث (SEO)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="seo-title">عنوان SEO</Label>
                  <Input
                    id="seo-title"
                    value={formData.seoTitle}
                    onChange={(e) => setFormData(prev => ({ ...prev, seoTitle: e.target.value }))}
                    placeholder={formData.title || 'عنوان محركات البحث'}
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    {formData.seoTitle.length} / 60 حرف (الموصى به)
                  </p>
                </div>

                <div>
                  <Label htmlFor="seo-description">وصف SEO</Label>
                  <Textarea
                    id="seo-description"
                    value={formData.seoDescription}
                    onChange={(e) => setFormData(prev => ({ ...prev, seoDescription: e.target.value }))}
                    placeholder={formData.excerpt || 'وصف محركات البحث'}
                    rows={3}
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    {formData.seoDescription.length} / 160 حرف (الموصى به)
                  </p>
                </div>

                <div>
                  <Label>الكلمات المفتاحية</Label>
                  <div className="flex gap-2 mb-2">
                    <Input
                      placeholder="أضف كلمة مفتاحية..."
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          const input = e.target as HTMLInputElement;
                          if (input.value.trim()) {
                            addKeyword(input.value.trim());
                            input.value = '';
                          }
                        }
                      }}
                    />
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={suggestKeywords}
                      disabled={isAILoading}
                    >
                      {isAILoading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Sparkles className="w-4 h-4" />
                      )}
                      <span className="mr-1">اقتراح</span>
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.keywords.map(keyword => (
                      <div
                        key={keyword}
                        className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm flex items-center gap-1"
                      >
                        <span>{keyword}</span>
                        <button
                          onClick={() => removeKeyword(keyword)}
                          className="hover:text-destructive"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* معاينة البحث */}
                <div className="p-4 bg-secondary/20 rounded-lg">
                  <h4 className="font-medium mb-2">معاينة في محركات البحث</h4>
                  <div className="space-y-1">
                    <p className="text-blue-600 font-medium">
                      {formData.seoTitle || formData.title || 'عنوان المقال'}
                    </p>
                    <p className="text-sm text-green-600">sabq.org › article › {formData.title ? generateSlug(formData.title) : 'slug'}</p>
                    <p className="text-sm text-muted-foreground">
                      {formData.seoDescription || formData.excerpt || 'وصف المقال سيظهر هنا...'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* تاب مساعد الذكاء */}
          {activeTab === 'ai' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-purple-500" />
                  مساعد الذكاء الاصطناعي
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* أدوات AI السريعة */}
                <div className="grid grid-cols-2 gap-4">
                  <Button
                    variant="outline"
                    onClick={generateIntro}
                    disabled={isAILoading || !formData.title}
                    className="h-auto py-4 flex flex-col items-center gap-2"
                  >
                    <BookOpen className="w-8 h-8 text-blue-500" />
                    <div>
                      <p className="font-medium">توليد مقدمة</p>
                      <p className="text-xs text-muted-foreground">بناءً على العنوان</p>
                    </div>
                  </Button>

                  <Button
                    variant="outline"
                    onClick={generateFullArticle}
                    disabled={isAILoading || !formData.title}
                    className="h-auto py-4 flex flex-col items-center gap-2"
                  >
                    <FileText className="w-8 h-8 text-green-500" />
                    <div>
                      <p className="font-medium">مقال كامل</p>
                      <p className="text-xs text-muted-foreground">محتوى شامل</p>
                    </div>
                  </Button>

                  <Button
                    variant="outline"
                    onClick={suggestTitles}
                    disabled={isAILoading || !formData.excerpt}
                    className="h-auto py-4 flex flex-col items-center gap-2"
                  >
                    <Type className="w-8 h-8 text-purple-500" />
                    <div>
                      <p className="font-medium">اقتراح عناوين</p>
                      <p className="text-xs text-muted-foreground">عناوين جذابة</p>
                    </div>
                  </Button>

                  <Button
                    variant="outline"
                    onClick={suggestKeywords}
                    disabled={isAILoading}
                    className="h-auto py-4 flex flex-col items-center gap-2"
                  >
                    <Hash className="w-8 h-8 text-orange-500" />
                    <div>
                      <p className="font-medium">كلمات مفتاحية</p>
                      <p className="text-xs text-muted-foreground">تحسين SEO</p>
                    </div>
                  </Button>
                </div>

                {/* نصائح الذكاء الاصطناعي */}
                <div className="space-y-3">
                  <h4 className="font-medium flex items-center gap-2">
                    <Zap className="w-4 h-4 text-yellow-500" />
                    نصائح ذكية
                  </h4>
                  
                  {!formData.title && (
                    <Alert className="bg-amber-50 border-amber-200">
                      <AlertCircle className="h-4 w-4 text-amber-600" />
                      <AlertDescription className="text-amber-800">
                        ابدأ بكتابة عنوان جذاب لتفعيل جميع مزايا الذكاء الاصطناعي
                      </AlertDescription>
                    </Alert>
                  )}
                  
                  {formData.title && !formData.excerpt && (
                    <Alert className="bg-blue-50 border-blue-200">
                      <Sparkles className="h-4 w-4 text-blue-600" />
                      <AlertDescription className="text-blue-800">
                        أضف موجزاً للمقال لتحسين ظهوره في محركات البحث
                      </AlertDescription>
                    </Alert>
                  )}
                  
                  {formData.excerpt && analyzeExcerpt(formData.excerpt).quality !== 'excellent' && (
                    <Alert className="bg-yellow-50 border-yellow-200">
                      <AlertCircle className="h-4 w-4 text-yellow-600" />
                      <AlertDescription className="text-yellow-800">
                        {analyzeExcerpt(formData.excerpt).message}
                      </AlertDescription>
                    </Alert>
                  )}
                </div>

                {/* إحصائيات AI */}
                {editorRef.current && (
                  <div className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg">
                    <h4 className="font-medium mb-3">تحليل المحتوى بالذكاء الاصطناعي</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">عدد الكلمات</p>
                        <p className="text-2xl font-bold text-purple-600">
                          {(() => {
                            const html = editorRef.current?.getHTML() || '';
                            return html.replace(/<[^>]*>/g, '').split(/\s+/).filter(Boolean).length;
                          })()}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">وقت القراءة</p>
                        <p className="text-2xl font-bold text-blue-600">
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
              </CardContent>
            </Card>
          )}
        </div>

        {/* العمود الجانبي */}
        <div className="space-y-6">
          {/* معلومات النشر */}
          <Card>
            <CardHeader>
              <CardTitle>معلومات النشر</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="author">المراسل / الكاتب *</Label>
                <select
                  id="author"
                  value={formData.authorId}
                  onChange={(e) => setFormData(prev => ({ ...prev, authorId: e.target.value }))}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="">اختر المراسل</option>
                  {authors.map(author => (
                    <option key={author.id} value={author.id}>
                      {author.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label htmlFor="category">التصنيف *</Label>
                <select
                  id="category"
                  value={formData.categoryId}
                  onChange={(e) => setFormData(prev => ({ ...prev, categoryId: e.target.value }))}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="">اختر التصنيف</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label>نوع الخبر</Label>
                <div className="space-y-2 mt-2">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="local"
                      checked={formData.type === 'local'}
                      onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                      className="ml-2"
                    />
                    محلي
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="international"
                      checked={formData.type === 'international'}
                      onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                      className="ml-2"
                    />
                    دولي
                  </label>
                </div>
              </div>

              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.isBreaking}
                    onChange={(e) => setFormData(prev => ({ ...prev, isBreaking: e.target.checked }))}
                    className="ml-2"
                  />
                  خبر عاجل
                </label>
                {formData.isBreaking && (
                  <Alert className="bg-red-50 border-red-200">
                    <AlertCircle className="h-4 w-4 text-red-600" />
                    <AlertDescription className="text-red-800">
                      سيظهر شريط أحمر مع الخبر
                    </AlertDescription>
                  </Alert>
                )}

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.isFeatured}
                    onChange={(e) => setFormData(prev => ({ ...prev, isFeatured: e.target.checked }))}
                    className="ml-2"
                  />
                  خبر رئيسي
                </label>
                {formData.isFeatured && (
                  <Alert className="bg-blue-50 border-blue-200">
                    <AlertCircle className="h-4 w-4 text-blue-600" />
                    <AlertDescription className="text-blue-800">
                      سيظهر هذا المقال في قسم الأخبار البارزة
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </CardContent>
          </Card>

          {/* توقيت النشر */}
          <Card>
            <CardHeader>
              <CardTitle>توقيت النشر</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="now"
                    checked={formData.publishType === 'now'}
                    onChange={(e) => setFormData(prev => ({ ...prev, publishType: e.target.value }))}
                    className="ml-2"
                  />
                  نشر الآن
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="scheduled"
                    checked={formData.publishType === 'scheduled'}
                    onChange={(e) => setFormData(prev => ({ ...prev, publishType: e.target.value }))}
                    className="ml-2"
                  />
                  جدولة النشر
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="draft"
                    checked={formData.publishType === 'draft'}
                    onChange={(e) => setFormData(prev => ({ ...prev, publishType: e.target.value }))}
                    className="ml-2"
                  />
                  حفظ كمسودة
                </label>
              </div>

              {formData.publishType === 'scheduled' && (
                <div>
                  <Label htmlFor="scheduled-date">تاريخ ووقت النشر</Label>
                  <Input
                    id="scheduled-date"
                    type="datetime-local"
                    value={formData.scheduledDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, scheduledDate: e.target.value }))}
                    min={new Date().toISOString().slice(0, 16)}
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 