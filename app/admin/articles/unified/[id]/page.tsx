'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
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
  Globe, TrendingUp, BookOpen, ChevronRight, Home
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

export default function UnifiedArticleEditPage() {
  const router = useRouter();
  const params = useParams();
  const articleId = params?.id as string;
  const editorRef = useRef<any>(null);
  
  // حالات التحميل
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [authors, setAuthors] = useState<Author[]>([]);
  const [isAILoading, setIsAILoading] = useState(false);
  
  // تتبع اكتمال المقال
  const [completionScore, setCompletionScore] = useState(0);
  
  // حالة النموذج
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
  
  // تحميل البيانات
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // تحميل بيانات متوازية
        const [categoriesRes, authorsRes, articleRes] = await Promise.all([
          fetch('/api/categories?active=true'),
          fetch('/api/team-members'),
          fetch(`/api/articles/${articleId}`)
        ]);
        
        // معالجة التصنيفات
        if (categoriesRes.ok) {
          const data = await categoriesRes.json();
          setCategories(data.data || data.categories || []);
        }
        
        // معالجة المؤلفين
        if (authorsRes.ok) {
          const data = await authorsRes.json();
          setAuthors(data.data || data.members || []);
        }
        
        // معالجة المقال
        if (articleRes.ok) {
          const articleData = await articleRes.json();
          const article = articleData.article || articleData;
          
          setFormData({
            title: article.title || '',
            subtitle: article.subtitle || '',
            excerpt: article.summary || article.excerpt || '',
            content: article.content || '',
            authorId: article.author_id || '',
            categoryId: article.category_id || '',
            featuredImage: article.featured_image || '',
            keywords: Array.isArray(article.keywords) ? article.keywords : [],
            seoTitle: article.seo_title || '',
            seoDescription: article.seo_description || '',
            publishType: 'now',
            scheduledDate: article.scheduled_for || '',
            isBreaking: article.is_breaking || false,
            isFeatured: article.is_featured || false,
            status: article.status || 'draft'
          });
          
          // تحديث المحرر
          if (editorRef.current && article.content) {
            editorRef.current.setContent(article.content);
          }
        } else {
          toast.error('فشل في تحميل المقال');
          router.push('/admin/articles');
        }
      } catch (error) {
        console.error('Error loading data:', error);
        toast.error('حدث خطأ في تحميل البيانات');
      } finally {
        setLoading(false);
      }
    };
    
    if (articleId) {
      loadData();
    }
  }, [articleId, router]);
  
  // حفظ تلقائي
  useEffect(() => {
    const autoSaveTimer = setInterval(() => {
      if (formData.title || formData.content) {
        handleAutoSave();
      }
    }, 30000); // كل 30 ثانية
    
    return () => clearInterval(autoSaveTimer);
  }, [formData]);
  
  const handleAutoSave = async () => {
    try {
      await fetch(`/api/articles/${articleId}/auto-save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          lastSaved: new Date().toISOString()
        })
      });
    } catch (error) {
      console.error('Auto-save error:', error);
    }
  };
  
  // رفع الصورة
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const formDataUpload = new FormData();
    formDataUpload.append('file', file);
    
    try {
      toast.loading('جاري رفع الصورة...', { id: 'upload' });
      
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formDataUpload
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setFormData(prev => ({ ...prev, featuredImage: data.url }));
        toast.success('تم رفع الصورة بنجاح', { id: 'upload' });
      } else {
        toast.error(data.error || 'فشل في رفع الصورة', { id: 'upload' });
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('حدث خطأ في رفع الصورة', { id: 'upload' });
    }
  };
  
  // حفظ المقال
  const handleSave = async (status: 'draft' | 'published') => {
    setSaving(true);
    
    try {
      const articleData: any = {
        title: formData.title.trim(),
        content: editorRef.current ? editorRef.current.getHTML() : formData.content,
        summary: formData.excerpt.trim(),
        subtitle: formData.subtitle,
        author_id: formData.authorId,
        category_id: formData.categoryId,
        featured_image: formData.featuredImage,
        is_featured: formData.isFeatured,
        is_breaking: formData.isBreaking,
        keywords: formData.keywords,
        seo_title: formData.seoTitle || formData.title,
        seo_description: formData.seoDescription || formData.excerpt,
        status
      };
      
      if (formData.publishType === 'scheduled' && formData.scheduledDate) {
        articleData.scheduled_for = formData.scheduledDate;
      }
      
      const response = await fetch(`/api/articles/${articleId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(articleData)
      });
      
      if (response.ok) {
        toast.success(status === 'published' ? 'تم نشر المقال بنجاح' : 'تم حفظ المسودة');
        setTimeout(() => {
          router.push('/admin/articles');
        }, 1500);
      } else {
        const data = await response.json();
        toast.error(data.error || 'فشل في حفظ المقال');
      }
    } catch (error) {
      console.error('Save error:', error);
      toast.error('حدث خطأ في حفظ المقال');
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
        } else {
          toast.success(`تم توليد ${type === 'title' ? 'العنوان' : 'الموجز'} بنجاح`);
        }
      }
    } catch (error) {
      console.error('AI Error:', error);
      toast.error('حدث خطأ في الذكاء الاصطناعي');
    } finally {
      setIsAILoading(false);
    }
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <Loader2 className="w-10 h-10 animate-spin mx-auto text-blue-600" />
          <p className="text-gray-600 dark:text-gray-400">جاري تحميل المقال...</p>
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
            onClick={() => router.push('/admin/articles')}
            className="gap-2"
          >
            <Home className="w-4 h-4" />
            العودة للمقالات
          </Button>
          <ChevronRight className="w-4 h-4 text-gray-400" />
          <h1 className="text-2xl font-bold">تحرير المقال</h1>
        </div>
        
        {/* شريط التقدم */}
        <div className="flex items-center gap-4">
          <div className="w-32">
            <Progress value={completionScore} className="h-2" />
            <p className="text-xs text-gray-500 mt-1">{completionScore}% مكتمل</p>
          </div>
          
          <div className="flex gap-2">
            <Button
              onClick={() => handleSave('draft')}
              disabled={saving}
              variant="outline"
              size="sm"
              className="gap-2"
            >
              <Save className="w-4 h-4" />
              حفظ مسودة
            </Button>
            
            <Button
              onClick={() => {
                const preview = window.open(`/preview/article/${articleId}`, '_blank');
                preview?.focus();
              }}
              variant="outline"
              size="sm"
              className="gap-2"
            >
              <Eye className="w-4 h-4" />
              معاينة
            </Button>
            
            <Button
              onClick={() => handleSave('published')}
              disabled={saving || completionScore < 60}
              className="gap-2 bg-green-600 hover:bg-green-700"
            >
              <Send className="w-4 h-4" />
              نشر المقال
            </Button>
          </div>
        </div>
      </div>
      
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
                  placeholder="أدخل عنوان المقال..."
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
                  placeholder="موجز قصير عن المقال..."
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
                placeholder="اكتب محتوى المقال هنا..."
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
        </div>
        
        {/* القسم الجانبي (25%) */}
        <div className="space-y-4">
          {/* معلومات أساسية */}
          <Card className={darkMode ? 'bg-gray-800 border-gray-700' : ''}>
            <CardHeader>
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
                    "w-full p-2 rounded-md text-sm",
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
                    "w-full p-2 rounded-md text-sm",
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
              
              {/* حالة الخبر */}
              <div>
                <Label className="text-sm mb-2">الحالة</Label>
                <div className="space-y-2">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.isBreaking}
                      onChange={(e) => setFormData(prev => ({ ...prev, isBreaking: e.target.checked }))}
                      className="rounded"
                    />
                    <span className="text-sm">خبر عاجل</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.isFeatured}
                      onChange={(e) => setFormData(prev => ({ ...prev, isFeatured: e.target.checked }))}
                      className="rounded"
                    />
                    <span className="text-sm">خبر مميز</span>
                  </label>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* الكلمات المفتاحية */}
          <Card className={darkMode ? 'bg-gray-800 border-gray-700' : ''}>
            <CardHeader>
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
                  <Button size="sm" variant="outline">
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
          <Card className={darkMode ? 'bg-gray-800 border-gray-700' : ''}>
            <CardHeader>
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
          
          {/* الجدولة */}
          <Card className={darkMode ? 'bg-gray-800 border-gray-700' : ''}>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                النشر
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="publish-type"
                      value="now"
                      checked={formData.publishType === 'now'}
                      onChange={(e) => setFormData(prev => ({ ...prev, publishType: 'now' }))}
                    />
                    <span className="text-sm">نشر فوري</span>
                  </label>
                </div>
                <div>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="publish-type"
                      value="scheduled"
                      checked={formData.publishType === 'scheduled'}
                      onChange={(e) => setFormData(prev => ({ ...prev, publishType: 'scheduled' }))}
                    />
                    <span className="text-sm">جدولة</span>
                  </label>
                </div>
                {formData.publishType === 'scheduled' && (
                  <Input
                    type="datetime-local"
                    value={formData.scheduledDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, scheduledDate: e.target.value }))}
                    className={cn(
                      "text-sm",
                      darkMode ? "bg-gray-700 border-gray-600" : ""
                    )}
                  />
                )}
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
    </div>
  );
} 