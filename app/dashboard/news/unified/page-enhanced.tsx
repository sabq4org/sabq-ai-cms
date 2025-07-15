'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { toast, Toaster } from 'react-hot-toast';
import { useDarkModeContext } from '@/contexts/DarkModeContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import dynamic from 'next/dynamic';
import { 
  Save, Send, Eye, Clock, Image as ImageIcon, Upload, X, 
  Tag, User, Calendar, AlertCircle, CheckCircle, Loader2,
  Sparkles, FileText, Settings, Search, Plus, Trash2,
  Globe, TrendingUp, BookOpen, ChevronRight, Home, Zap,
  Star, CheckSquare
} from 'lucide-react';
import { cn } from '@/lib/utils';

// تحميل المحرر بشكل ديناميكي
const Editor = dynamic(() => import('@/components/Editor/Editor'), { ssr: false });

interface Category {
  id: string;
  name: string;
  name_ar?: string;
  slug: string;
  color?: string;
}

interface Author {
  id: string;
  name: string;
  email?: string;
  avatar?: string;
  role?: string;
}

export default function UnifiedNewsCreatePageEnhanced() {
  const router = useRouter();
  const { darkMode } = useDarkModeContext();
  const editorRef = useRef<any>(null);
  
  // حالات التحميل
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [authors, setAuthors] = useState<Author[]>([]);
  const [isAILoading, setIsAILoading] = useState(false);
  
  // حالة رسائل النجاح والخطأ
  const [message, setMessage] = useState<{
    type: 'success' | 'error' | null;
    text: string;
  }>({ type: null, text: '' });
  
  // تتبع اكتمال المقال
  const [completionScore, setCompletionScore] = useState(0);
  
  // حالة النموذج - قيم افتراضية فارغة
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    excerpt: '',
    content: '',
    authorId: '',
    categoryId: '',
    featuredImage: '',
    keywords: [] as string[],
    seoTitle: '',
    seoDescription: '',
    publishType: 'now' as 'now' | 'scheduled',
    scheduledDate: '',
    isBreaking: false,
    isFeatured: false,
    status: 'draft' as 'draft' | 'published'
  });
  
  // حساب نسبة الاكتمال
  const calculateCompletion = useCallback(() => {
    let score = 0;
    const checks = [
      { field: formData.title, weight: 20 },
      { field: formData.excerpt, weight: 15 },
      { field: formData.content, weight: 25 },
      { field: formData.authorId, weight: 10 },
      { field: formData.categoryId, weight: 10 },
      { field: formData.featuredImage, weight: 10 },
      { field: formData.keywords.length > 0, weight: 5 },
      { field: formData.seoTitle, weight: 5 }
    ];
    
    checks.forEach(check => {
      if (check.field) score += check.weight;
    });
    
    setCompletionScore(score);
  }, [formData]);
  
  useEffect(() => {
    calculateCompletion();
  }, [formData, calculateCompletion]);
  
  // جلب البيانات الأولية
  useEffect(() => {
    fetchInitialData();
  }, []);
  
  const fetchInitialData = async () => {
    try {
      const [categoriesRes, authorsRes] = await Promise.all([
        fetch('/api/categories'),
        fetch('/api/team-members')
      ]);
      
      const [categoriesData, authorsData] = await Promise.all([
        categoriesRes.json(),
        authorsRes.json()
      ]);
      
      setCategories(categoriesData.data || categoriesData.categories || []);
      setAuthors(authorsData.data || authorsData.members || []);
    } catch (error) {
      console.error('Error fetching initial data:', error);
      toast.error('حدث خطأ في تحميل البيانات');
    } finally {
      setLoading(false);
    }
  };
  
  // رفع الصورة
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      toast.loading('جاري رفع الصورة...', { id: 'upload' });
      const response = await fetch('/api/upload-image', {
        method: 'POST',
        body: formData
      });
      
      const data = await response.json();
      if (data.url) {
        setFormData(prev => ({ ...prev, featuredImage: data.url }));
        toast.success('تم رفع الصورة بنجاح', { id: 'upload' });
      } else {
        toast.error('فشل رفع الصورة', { id: 'upload' });
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('حدث خطأ في رفع الصورة', { id: 'upload' });
    }
  };
  
  // حفظ المقال
  const handleSave = async (status: 'draft' | 'published') => {
    // مسح الرسائل السابقة
    setMessage({ type: null, text: '' });
    
    // التحقق من الحقول المطلوبة للنشر
    if (status === 'published') {
      if (!formData.title.trim()) {
        const errorMsg = 'يرجى إدخال عنوان الخبر';
        toast.error(errorMsg);
        setMessage({ type: 'error', text: errorMsg });
        return;
      }
      if (!formData.excerpt.trim()) {
        const errorMsg = 'يرجى إدخال موجز الخبر';
        toast.error(errorMsg);
        setMessage({ type: 'error', text: errorMsg });
        return;
      }
      if (!formData.authorId) {
        const errorMsg = 'يرجى اختيار المراسل';
        toast.error(errorMsg);
        setMessage({ type: 'error', text: errorMsg });
        return;
      }
      if (!formData.categoryId) {
        const errorMsg = 'يرجى اختيار التصنيف';
        toast.error(errorMsg);
        setMessage({ type: 'error', text: errorMsg });
        return;
      }
      const content = editorRef.current ? editorRef.current.getHTML() : formData.content;
      if (!content || content === '<p></p>') {
        const errorMsg = 'يرجى كتابة محتوى الخبر';
        toast.error(errorMsg);
        setMessage({ type: 'error', text: errorMsg });
        return;
      }
    }
    
    setSaving(true);
    
    try {
      const articleData: any = {
        title: formData.title.trim() || 'مسودة بدون عنوان',
        content: editorRef.current ? editorRef.current.getHTML() : formData.content,
        summary: formData.excerpt.trim(),
        subtitle: formData.subtitle,
        author_id: formData.authorId || null,
        category_id: formData.categoryId || null,
        featured_image: formData.featuredImage || null,
        is_featured: formData.isFeatured,
        is_breaking: formData.isBreaking,
        keywords: formData.keywords,
        seo_keywords: formData.keywords.join(', '),
        seo_title: formData.seoTitle || formData.title,
        seo_description: formData.seoDescription || formData.excerpt,
        status,
        published_at: status === 'published' ? new Date().toISOString() : null,
        type: 'news'
      };
      
      if (formData.publishType === 'scheduled' && formData.scheduledDate) {
        articleData.scheduled_for = formData.scheduledDate;
      }
      
      const response = await fetch('/api/articles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(articleData)
      });
      
      const data = await response.json();
      
      if (response.ok) {
        const articleId = data.article?.id || data.id;
        let successMessage = status === 'published' ? 'تم نشر الخبر بنجاح' : 'تم حفظ المسودة';
        if (articleId) {
          successMessage += ` (رقم الخبر: ${articleId})`;
        }
        
        toast.success(successMessage);
        setMessage({ type: 'success', text: successMessage });
        
        // مسح ذاكرة التخزين المؤقت
        try {
          await fetch('/api/cache/clear', { method: 'POST' });
        } catch (cacheError) {
          console.error('Cache clear error:', cacheError);
        }
        
        // الانتقال إلى قائمة الأخبار
        setTimeout(() => {
          router.push('/dashboard/news');
        }, 2000);
      } else {
        const errorMessage = data.error || 'فشل في حفظ الخبر';
        toast.error(errorMessage);
        setMessage({ type: 'error', text: errorMessage });
      }
    } catch (error) {
      console.error('Save error:', error);
      const errorMessage = 'حدث خطأ في حفظ الخبر';
      toast.error(errorMessage);
      setMessage({ type: 'error', text: errorMessage });
    } finally {
      setSaving(false);
    }
  };
  
  // إضافة كلمة مفتاحية
  const addKeyword = (keyword: string) => {
    if (keyword && !formData.keywords.includes(keyword)) {
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
  
  // اقتراحات AI
  const suggestWithAI = async (type: 'title' | 'excerpt' | 'keywords') => {
    setIsAILoading(true);
    try {
      const response = await fetch('/api/ai/editor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          content: type === 'title' ? formData.excerpt : formData.title,
          context: { title: formData.title, excerpt: formData.excerpt }
        })
      });
      
      const data = await response.json();
      if (data.result) {
        if (type === 'keywords') {
          const keywords = data.result.split(',').map((k: string) => k.trim());
          setFormData(prev => ({ ...prev, keywords }));
          toast.success('تم توليد الكلمات المفتاحية');
        } else if (type === 'title') {
          setFormData(prev => ({ ...prev, title: data.result }));
          toast.success('تم توليد العنوان');
        } else if (type === 'excerpt') {
          setFormData(prev => ({ ...prev, excerpt: data.result }));
          toast.success('تم توليد الموجز');
        }
      }
    } catch (error) {
      console.error('AI Error:', error);
      toast.error('حدث خطأ في الذكاء الاصطناعي');
    } finally {
      setIsAILoading(false);
    }
  };
  
  // مكون أزرار النشر القابل لإعادة الاستخدام
  const PublishButtons = ({ position = 'top' }: { position?: 'top' | 'bottom' }) => (
    <div className="flex gap-3">
      <Button
        onClick={() => handleSave('draft')}
        disabled={saving}
        variant="outline"
        size={position === 'bottom' ? 'default' : 'sm'}
        className={cn(
          "gap-2",
          darkMode ? "bg-gray-700 hover:bg-gray-600 text-white border-gray-600" : "bg-white hover:bg-gray-50"
        )}
      >
        {saving ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            جاري الحفظ...
          </>
        ) : (
          <>
            <Save className="w-4 h-4" />
            حفظ مسودة
          </>
        )}
      </Button>
      
      <Button
        onClick={() => {}}
        disabled={saving}
        variant="outline"
        size={position === 'bottom' ? 'default' : 'sm'}
        className={cn(
          "gap-2",
          darkMode ? "bg-blue-700 hover:bg-blue-600 text-white border-blue-600" : "bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-300"
        )}
      >
        <CheckSquare className="w-4 h-4" />
        طلب مراجعة
      </Button>
      
      <Button
        onClick={() => handleSave('published')}
        disabled={saving || completionScore < 60}
        size={position === 'bottom' ? 'default' : 'sm'}
        className={cn(
          "gap-2",
          darkMode ? "bg-green-700 hover:bg-green-600" : "bg-green-600 hover:bg-green-700",
          "text-white"
        )}
      >
        {saving ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            جاري النشر...
          </>
        ) : (
          <>
            <Send className="w-4 h-4" />
            نشر فوري
          </>
        )}
      </Button>
    </div>
  );
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <Loader2 className="w-10 h-10 animate-spin mx-auto text-blue-600" />
          <p className="text-gray-600 dark:text-gray-400">جاري تحميل البيانات...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className={cn(
      "min-h-screen p-4 transition-colors duration-200",
      darkMode ? "bg-gray-900" : "bg-gray-50"
    )}>
      {/* رأس الصفحة */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/dashboard/news')}
            className="gap-2"
          >
            <Home className="w-4 h-4" />
            العودة للأخبار
          </Button>
          <ChevronRight className="w-4 h-4 text-gray-400" />
          <h1 className="text-2xl font-bold">خبر جديد</h1>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="w-32">
            <Progress value={completionScore} className="h-2" />
            <p className="text-xs text-gray-500 mt-1">{completionScore}% مكتمل</p>
          </div>
          
          <PublishButtons position="top" />
        </div>
      </div>
      
      {/* رسالة النجاح أو الخطأ */}
      {message.type && (
        <Alert className={cn(
          "mb-4",
          message.type === 'success' 
            ? "border-green-200 bg-green-50 dark:bg-green-900/20" 
            : "border-red-200 bg-red-50 dark:bg-red-900/20"
        )}>
          {message.type === 'success' ? (
            <CheckCircle className="h-4 w-4 text-green-600" />
          ) : (
            <AlertCircle className="h-4 w-4 text-red-600" />
          )}
          <AlertDescription className={cn(
            "text-sm font-medium",
            message.type === 'success' ? "text-green-800" : "text-red-800"
          )}>
            {message.text}
          </AlertDescription>
        </Alert>
      )}
      
      {/* المحتوى الرئيسي */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* القسم الرئيسي (75%) */}
        <div className="lg:col-span-3 space-y-4">
          {/* العنوان والموجز */}
          <Card className={darkMode ? 'bg-gray-800 border-gray-700' : ''}>
            <CardContent className="p-6 space-y-4">
              <div>
                <Label htmlFor="title" className="text-sm font-medium mb-2 flex items-center gap-2">
                  العنوان الرئيسي *
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => suggestWithAI('title')}
                    disabled={isAILoading || !formData.excerpt}
                    className="h-6 px-2 gap-1"
                  >
                    <Sparkles className="w-3 h-3" />
                    اقتراح
                  </Button>
                </Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="أدخل عنوان الخبر..."
                  className={cn(
                    "text-lg font-semibold",
                    darkMode ? "bg-gray-700 border-gray-600" : ""
                  )}
                />
              </div>
              
              <div>
                <Label htmlFor="subtitle" className="text-sm font-medium mb-2">
                  العنوان الفرعي
                </Label>
                <Input
                  id="subtitle"
                  value={formData.subtitle}
                  onChange={(e) => setFormData(prev => ({ ...prev, subtitle: e.target.value }))}
                  placeholder="عنوان فرعي اختياري..."
                  className={darkMode ? "bg-gray-700 border-gray-600" : ""}
                />
              </div>
              
              <div>
                <Label htmlFor="excerpt" className="text-sm font-medium mb-2 flex items-center gap-2">
                  الموجز *
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => suggestWithAI('excerpt')}
                    disabled={isAILoading || !formData.title}
                    className="h-6 px-2 gap-1"
                  >
                    <Sparkles className="w-3 h-3" />
                    اقتراح
                  </Button>
                </Label>
                <Textarea
                  id="excerpt"
                  value={formData.excerpt}
                  onChange={(e) => setFormData(prev => ({ ...prev, excerpt: e.target.value }))}
                  placeholder="موجز قصير عن الخبر..."
                  rows={3}
                  className={darkMode ? "bg-gray-700 border-gray-600" : ""}
                />
              </div>
            </CardContent>
          </Card>
          
          {/* المحتوى */}
          <Card className={darkMode ? 'bg-gray-800 border-gray-700' : ''}>
            <CardHeader>
              <CardTitle className="text-lg">المحتوى</CardTitle>
            </CardHeader>
            <CardContent>
              <Editor
                ref={editorRef}
                content={formData.content}
                onChange={(content) => {
                  if (typeof content === 'object' && content.html) {
                    setFormData(prev => ({ ...prev, content: content.html }));
                  } else if (typeof content === 'string') {
                    setFormData(prev => ({ ...prev, content }));
                  }
                }}
                placeholder="اكتب محتوى الخبر هنا..."
                enableAI={true}
                onAIAction={async (action, content) => {
                  // معالج AI للمحرر
                }}
              />
            </CardContent>
          </Card>
          
          {/* الصور والوسائط */}
          <Card className={darkMode ? 'bg-gray-800 border-gray-700' : ''}>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <ImageIcon className="w-5 h-5" />
                الصورة البارزة
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {formData.featuredImage ? (
                  <div className="relative">
                    <img
                      src={formData.featuredImage}
                      alt="Featured"
                      className="w-full h-64 object-cover rounded-lg"
                    />
                    <Button
                      onClick={() => setFormData(prev => ({ ...prev, featuredImage: '' }))}
                      size="sm"
                      variant="destructive"
                      className="absolute top-2 right-2"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center">
                    <Upload className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                    <label htmlFor="image-upload" className="cursor-pointer">
                      <span className="text-blue-600 hover:text-blue-700">اختر صورة</span>
                      <input
                        id="image-upload"
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          
          {/* أزرار النشر في الأسفل */}
          <div className="flex justify-center pt-6 pb-4">
            <PublishButtons position="bottom" />
          </div>
        </div>
        
        {/* القسم الجانبي (25%) */}
        <div className="space-y-4">
          {/* نوع الخبر */}
          <Card className={cn(
            "shadow-sm",
            darkMode ? 'bg-gray-800 border-gray-700' : 'bg-blue-50 border-blue-200'
          )}>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">نوع الخبر</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <label className={cn(
                "flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all",
                formData.isBreaking
                  ? darkMode ? "bg-red-900/50 border-2 border-red-500" : "bg-red-100 border-2 border-red-500"
                  : darkMode ? "bg-gray-700 hover:bg-gray-600 border-2 border-transparent" : "bg-white hover:bg-gray-50 border-2 border-gray-200"
              )}>
                <input
                  type="checkbox"
                  checked={formData.isBreaking}
                  onChange={(e) => setFormData(prev => ({ ...prev, isBreaking: e.target.checked }))}
                  className="sr-only"
                />
                <Zap className={cn(
                  "w-5 h-5",
                  formData.isBreaking ? "text-red-500" : "text-gray-400"
                )} />
                <span className={cn(
                  "font-medium",
                  formData.isBreaking ? "text-red-700 dark:text-red-300" : ""
                )}>خبر عاجل</span>
              </label>
              
              <label className={cn(
                "flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all",
                formData.isFeatured
                  ? darkMode ? "bg-yellow-900/50 border-2 border-yellow-500" : "bg-yellow-100 border-2 border-yellow-500"
                  : darkMode ? "bg-gray-700 hover:bg-gray-600 border-2 border-transparent" : "bg-white hover:bg-gray-50 border-2 border-gray-200"
              )}>
                <input
                  type="checkbox"
                  checked={formData.isFeatured}
                  onChange={(e) => setFormData(prev => ({ ...prev, isFeatured: e.target.checked }))}
                  className="sr-only"
                />
                <Star className={cn(
                  "w-5 h-5",
                  formData.isFeatured ? "text-yellow-500" : "text-gray-400"
                )} />
                <span className={cn(
                  "font-medium",
                  formData.isFeatured ? "text-yellow-700 dark:text-yellow-300" : ""
                )}>خبر مميز</span>
              </label>
            </CardContent>
          </Card>
          
          {/* معلومات أساسية */}
          <Card className={cn(
            "shadow-sm",
            darkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'
          )}>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Settings className="w-4 h-4" />
                الإعدادات
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* المراسل */}
              <div>
                <Label htmlFor="author" className="text-sm mb-2 flex items-center gap-2">
                  <User className="w-4 h-4" />
                  المراسل *
                </Label>
                <select
                  id="author"
                  value={formData.authorId}
                  onChange={(e) => setFormData(prev => ({ ...prev, authorId: e.target.value }))}
                  className={cn(
                    "w-full p-2 rounded-md text-sm border",
                    darkMode ? "bg-gray-700 border-gray-600" : "bg-white border-gray-300"
                  )}
                >
                  <option value="">اختر المراسل...</option>
                  {authors.map(author => (
                    <option key={author.id} value={author.id}>
                      {author.name}
                    </option>
                  ))}
                </select>
              </div>
              
              {/* التصنيف */}
              <div>
                <Label htmlFor="category" className="text-sm mb-2 flex items-center gap-2">
                  <Tag className="w-4 h-4" />
                  التصنيف *
                </Label>
                <select
                  id="category"
                  value={formData.categoryId}
                  onChange={(e) => setFormData(prev => ({ ...prev, categoryId: e.target.value }))}
                  className={cn(
                    "w-full p-2 rounded-md text-sm border",
                    darkMode ? "bg-gray-700 border-gray-600" : "bg-white border-gray-300"
                  )}
                >
                  <option value="">اختر التصنيف...</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name_ar || cat.name}
                    </option>
                  ))}
                </select>
              </div>
            </CardContent>
          </Card>
          
          {/* طريقة النشر */}
          <Card className={cn(
            "shadow-sm",
            darkMode ? 'bg-gray-800 border-gray-700' : 'bg-green-50 border-green-200'
          )}>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                طريقة النشر
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <label className={cn(
                  "flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all",
                  formData.publishType === 'now'
                    ? darkMode ? "bg-green-900/50 border-2 border-green-500" : "bg-green-100 border-2 border-green-500"
                    : darkMode ? "bg-gray-700 hover:bg-gray-600 border-2 border-transparent" : "bg-white hover:bg-gray-50 border-2 border-gray-200"
                )}>
                  <input
                    type="radio"
                    name="publish-type"
                    value="now"
                    checked={formData.publishType === 'now'}
                    onChange={() => setFormData(prev => ({ ...prev, publishType: 'now' }))}
                    className="text-green-600"
                  />
                  <CheckCircle className={cn(
                    "w-5 h-5",
                    formData.publishType === 'now' ? "text-green-600" : "text-gray-400"
                  )} />
                  <span className="font-medium">نشر فوري</span>
                </label>
                
                <label className={cn(
                  "flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all",
                  formData.publishType === 'scheduled'
                    ? darkMode ? "bg-blue-900/50 border-2 border-blue-500" : "bg-blue-100 border-2 border-blue-500"
                    : darkMode ? "bg-gray-700 hover:bg-gray-600 border-2 border-transparent" : "bg-white hover:bg-gray-50 border-2 border-gray-200"
                )}>
                  <input
                    type="radio"
                    name="publish-type"
                    value="scheduled"
                    checked={formData.publishType === 'scheduled'}
                    onChange={() => setFormData(prev => ({ ...prev, publishType: 'scheduled' }))}
                    className="text-blue-600"
                  />
                  <Clock className={cn(
                    "w-5 h-5",
                    formData.publishType === 'scheduled' ? "text-blue-600" : "text-gray-400"
                  )} />
                  <span className="font-medium">مجدول</span>
                </label>
                
                {formData.publishType === 'scheduled' && (
                  <div className="mt-3">
                    <Label htmlFor="scheduled-date" className="text-sm mb-2">
                      التاريخ والوقت
                    </Label>
                    <Input
                      id="scheduled-date"
                      type="datetime-local"
                      value={formData.scheduledDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, scheduledDate: e.target.value }))}
                      className={cn(
                        "text-sm",
                        darkMode ? "bg-gray-700 border-gray-600" : ""
                      )}
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          
          {/* الكلمات المفتاحية */}
          <Card className={cn(
            "shadow-sm",
            darkMode ? 'bg-gray-800 border-gray-700' : 'bg-purple-50 border-purple-200'
          )}>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Tag className="w-4 h-4" />
                الكلمات المفتاحية
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => suggestWithAI('keywords')}
                  disabled={isAILoading}
                  className="h-6 px-2 gap-1 mr-auto"
                >
                  <Sparkles className="w-3 h-3" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex gap-2">
                  <Input
                    placeholder="أضف كلمة..."
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addKeyword((e.target as HTMLInputElement).value);
                        (e.target as HTMLInputElement).value = '';
                      }
                    }}
                    className={cn(
                      "flex-1 text-sm",
                      darkMode ? "bg-gray-700 border-gray-600" : ""
                    )}
                  />
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => {
                      const input = document.querySelector('input[placeholder="أضف كلمة..."]') as HTMLInputElement;
                      if (input.value) {
                        addKeyword(input.value);
                        input.value = '';
                      }
                    }}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.keywords.map((keyword, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="text-xs px-2 py-1 flex items-center gap-1"
                    >
                      {keyword}
                      <X
                        className="w-3 h-3 cursor-pointer"
                        onClick={() => removeKeyword(keyword)}
                      />
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* SEO */}
          <Card className={cn(
            "shadow-sm",
            darkMode ? 'bg-gray-800 border-gray-700' : 'bg-orange-50 border-orange-200'
          )}>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Search className="w-4 h-4" />
                تحسين محركات البحث
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label htmlFor="seo-title" className="text-sm mb-1">
                  عنوان SEO
                </Label>
                <Input
                  id="seo-title"
                  value={formData.seoTitle}
                  onChange={(e) => setFormData(prev => ({ ...prev, seoTitle: e.target.value }))}
                  placeholder={formData.title || "عنوان صفحة البحث"}
                  className={cn(
                    "text-sm",
                    darkMode ? "bg-gray-700 border-gray-600" : ""
                  )}
                />
              </div>
              <div>
                <Label htmlFor="seo-desc" className="text-sm mb-1">
                  وصف SEO
                </Label>
                <Textarea
                  id="seo-desc"
                  value={formData.seoDescription}
                  onChange={(e) => setFormData(prev => ({ ...prev, seoDescription: e.target.value }))}
                  placeholder={formData.excerpt || "وصف الصفحة في نتائج البحث"}
                  rows={2}
                  className={cn(
                    "text-sm",
                    darkMode ? "bg-gray-700 border-gray-600" : ""
                  )}
                />
              </div>
            </CardContent>
          </Card>
          
          {/* تنبيهات */}
          {completionScore < 60 && (
            <Alert className="border-orange-200 bg-orange-50 dark:bg-orange-900/20">
              <AlertCircle className="h-4 w-4 text-orange-600" />
              <AlertDescription className="text-sm">
                يرجى إكمال الحقول المطلوبة قبل النشر
              </AlertDescription>
            </Alert>
          )}
        </div>
      </div>
      
      {/* Toaster للرسائل */}
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 5000,
          style: {
            background: darkMode ? '#1f2937' : '#fff',
            color: darkMode ? '#f3f4f6' : '#1f2937',
            border: darkMode ? '1px solid #374151' : '1px solid #e5e7eb',
          },
          success: {
            iconTheme: {
              primary: '#10b981',
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />
    </div>
  );
} 