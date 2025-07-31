'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { 
  Upload, 
  Save, 
  Loader2, 
  ArrowRight,
  Eye,
  Sparkles,
  Image as ImageIcon,
  FileText,
  Settings,
  Calendar,
  User,
  X,
  CheckCircle,
  AlertCircle,
  Trash2
} from 'lucide-react';
import dynamic from 'next/dynamic';
import DashboardLayout from '@/components/admin/modern-dashboard/DashboardLayout';

// Dynamic imports for heavy components
const ArticleEditor = dynamic(() => import('@/components/Editor/ArticleEditor'), {
  ssr: false,
  loading: () => <div className="h-96 flex items-center justify-center"><Loader2 className="animate-spin" /></div>
});

interface ArticleData {
  id: string;
  title: string;
  subtitle?: string;
  slug: string;
  excerpt: string;
  content: string;
  featured_image: string | null;
  status: 'draft' | 'review' | 'published';
  category_id: string;
  author_id: string;
  author?: {
    id: string;
    name: string;
  };
  is_featured?: boolean;
  is_breaking?: boolean;
  seo_title?: string;
  seo_description?: string;
  seo_keywords?: string;
  published_at?: string;
  created_at?: string;
  updated_at?: string;
  views_count?: number;
  metadata?: any;
}

export default function EditArticlePage() {
  const params = useParams();
  const router = useRouter();
  const articleId = params.articleId as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [article, setArticle] = useState<ArticleData | null>(null);
  const [formData, setFormData] = useState<Partial<ArticleData>>({});
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [isDirty, setIsDirty] = useState(false);
  const [completionScore, setCompletionScore] = useState(0);

  // جلب بيانات المقال
  useEffect(() => {
    if (!articleId) return;

    const fetchArticle = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/articles/${articleId}`);
        
        if (!response.ok) {
          throw new Error('فشل في جلب بيانات المقال');
        }

        const data = await response.json();
        console.log('Article data received:', data);
        
        // التعامل مع البيانات المتداخلة
        const articleData = data.article || data;
        
        setArticle(articleData);
        setFormData({
          ...articleData,
          subtitle: articleData.subtitle || '',
          author: articleData.author || null,
          content: articleData.content || ''
        });
        setImagePreview(articleData.featured_image);
        calculateCompletionScore(articleData);
      } catch (error) {
        console.error('Error fetching article:', error);
        toast.error('فشل في تحميل بيانات المقال');
      } finally {
        setLoading(false);
      }
    };

    fetchArticle();
  }, [articleId]);

  // جلب التصنيفات
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/categories');
        if (response.ok) {
          const data = await response.json();
          setCategories(data.categories || data.data || []);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };

    fetchCategories();
  }, []);

  // حساب نسبة اكتمال المقال
  const calculateCompletionScore = (data: Partial<ArticleData>) => {
    let score = 0;
    if (data.title && data.title.length > 10) score += 20;
    if (data.excerpt && data.excerpt.length > 20) score += 20;
    if (data.content && data.content.length > 100) score += 20;
    if (data.featured_image) score += 20;
    if (data.category_id) score += 10;
    if (data.seo_keywords) score += 10;
    setCompletionScore(score);
  };

  // تحديث البيانات
  const updateFormData = (field: string, value: any) => {
    const newData = { ...formData, [field]: value };
    setFormData(newData);
    setIsDirty(true);
    calculateCompletionScore(newData);
  };

  // توليد slug من العنوان
  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  // رفع الصورة
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // التحقق من نوع وحجم الملف
    if (!file.type.startsWith('image/')) {
      toast.error('يرجى اختيار ملف صورة');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('حجم الصورة يجب أن يكون أقل من 5 ميجابايت');
      return;
    }

    setUploading(true);
    const loadingToast = toast.loading('جاري رفع الصورة...');

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('فشل في رفع الصورة');
      }

      const data = await response.json();
      updateFormData('featured_image', data.url);
      setImagePreview(data.url);
      toast.success('تم رفع الصورة بنجاح', { id: loadingToast });
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('فشل في رفع الصورة', { id: loadingToast });
    } finally {
      setUploading(false);
    }
  };

  // حذف الصورة
  const handleRemoveImage = () => {
    updateFormData('featured_image', null);
    setImagePreview(null);
    toast.success('تم حذف الصورة');
  };

  // حفظ المقال
  const handleSave = async () => {
    if (!formData.title || !formData.content) {
      toast.error('يرجى إدخال العنوان والمحتوى');
      return;
    }

    setSaving(true);
    const savingToast = toast.loading('جاري حفظ التغييرات...');

    try {
      const response = await fetch(`/api/articles/${articleId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          slug: formData.slug || generateSlug(formData.title),
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'فشل في حفظ المقال');
      }

      const data = await response.json();
      toast.success('تم حفظ التغييرات بنجاح', { id: savingToast });
      setIsDirty(false);
      
      // التوجيه إلى صفحة الأخبار بدلاً من المقالات
      setTimeout(() => {
        router.push('/admin/news');
      }, 1000);
    } catch (error: any) {
      console.error('Error saving article:', error);
      toast.error(error.message || 'فشل في حفظ المقال', { id: savingToast });
    } finally {
      setSaving(false);
    }
  };

  // توليد محتوى بالذكاء الاصطناعي
  const generateAIContent = async (type: 'title' | 'excerpt' | 'keywords') => {
    if (!formData.content && type !== 'title') {
      toast.error('يرجى إدخال المحتوى أولاً');
      return;
    }

    const loadingToast = toast.loading(`جاري توليد ${type === 'title' ? 'العنوان' : type === 'excerpt' ? 'الملخص' : 'الكلمات المفتاحية'}...`);

    try {
      const response = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          content: formData.content || '',
          title: formData.title || '',
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (type === 'title') {
          updateFormData('title', data.suggestion);
        } else if (type === 'excerpt') {
          updateFormData('excerpt', data.suggestion);
        } else if (type === 'keywords') {
          updateFormData('seo_keywords', data.suggestion);
        }
        toast.success(`تم التوليد بنجاح`, { id: loadingToast });
      } else {
        throw new Error('فشل في التوليد');
      }
    } catch (error) {
      console.error(`Error generating ${type}:`, error);
      toast.error(`فشل في التوليد`, { id: loadingToast });
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  if (!article) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-screen">
          <h2 className="text-2xl font-bold mb-4">المقال غير موجود</h2>
          <Button onClick={() => router.push('/admin/news')}>
            العودة للأخبار
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto p-6 max-w-6xl">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push('/admin/news')}
            >
              <ArrowRight className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold">تعديل المقال</h1>
              <p className="text-muted-foreground mt-1">
                قم بتعديل محتوى المقال وإعداداته
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {/* نسبة الاكتمال */}
            <div className="flex items-center gap-2">
              <div className="relative h-10 w-10">
                <svg className="h-10 w-10 -rotate-90 transform">
                  <circle
                    cx="20"
                    cy="20"
                    r="16"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                    className="text-gray-200"
                  />
                  <circle
                    cx="20"
                    cy="20"
                    r="16"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                    strokeDasharray={`${completionScore} 100`}
                    className={`transition-all duration-500 ${
                      completionScore >= 80 ? 'text-green-500' : 
                      completionScore >= 50 ? 'text-yellow-500' : 'text-red-500'
                    }`}
                  />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-xs font-bold">
                  {completionScore}%
                </span>
              </div>
              <span className="text-sm text-muted-foreground">اكتمال</span>
            </div>

            <Button
              variant="outline"
              onClick={() => window.open(`/article/${article.slug}`, '_blank')}
            >
              <Eye className="ml-2 h-4 w-4" />
              معاينة
            </Button>
            <Button 
              onClick={handleSave} 
              disabled={saving || !isDirty}
              className="min-w-[120px]"
            >
              {saving ? (
                <>
                  <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                  جاري الحفظ...
                </>
              ) : (
                <>
                  <Save className="ml-2 h-4 w-4" />
                  حفظ التغييرات
                </>
              )}
            </Button>
          </div>
        </div>

        {/* إشعار التغييرات غير المحفوظة */}
        {isDirty && (
          <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
            <span className="text-sm text-yellow-800 dark:text-yellow-200">
              لديك تغييرات غير محفوظة
            </span>
          </div>
        )}

        {/* Main Form - All in One Page */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* العمود الأيسر - المحتوى الرئيسي */}
          <div className="lg:col-span-2 space-y-6">
            {/* معلومات أساسية */}
            <Card>
              <CardHeader>
                <CardTitle>المعلومات الأساسية</CardTitle>
                <CardDescription>
                  العنوان والملخص والمحتوى الرئيسي للمقال
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* العنوان */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="title">العنوان</Label>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => generateAIContent('title')}
                      className="text-xs"
                    >
                      <Sparkles className="h-3 w-3 ml-1" />
                      توليد بالذكاء الاصطناعي
                    </Button>
                  </div>
                  <Input
                    id="title"
                    value={formData.title || ''}
                    onChange={(e) => updateFormData('title', e.target.value)}
                    placeholder="أدخل عنوان المقال"
                    className="text-lg font-semibold"
                  />
                </div>

                {/* العنوان الفرعي */}
                <div className="space-y-2">
                  <Label htmlFor="subtitle">العنوان الفرعي</Label>
                  <Input
                    id="subtitle"
                    value={formData.subtitle || ''}
                    onChange={(e) => updateFormData('subtitle', e.target.value)}
                    placeholder="أدخل العنوان الفرعي (اختياري)"
                    className="text-base"
                  />
                </div>

                {/* الملخص */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="excerpt">الملخص</Label>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => generateAIContent('excerpt')}
                      className="text-xs"
                    >
                      <Sparkles className="h-3 w-3 ml-1" />
                      توليد بالذكاء الاصطناعي
                    </Button>
                  </div>
                  <Textarea
                    id="excerpt"
                    value={formData.excerpt || ''}
                    onChange={(e) => updateFormData('excerpt', e.target.value)}
                    placeholder="أدخل ملخص المقال"
                    rows={3}
                  />
                </div>

                {/* المحتوى */}
                <div className="space-y-2">
                  <Label>المحتوى</Label>
                  <ArticleEditor
                    content={formData.content || ''}
                    onChange={(content) => updateFormData('content', content)}
                  />
                </div>
              </CardContent>
            </Card>

            {/* SEO */}
            <Card>
              <CardHeader>
                <CardTitle>تحسين محركات البحث (SEO)</CardTitle>
                <CardDescription>
                  تحسين ظهور المقال في نتائج البحث
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="seo-title">عنوان SEO</Label>
                  <Input
                    id="seo-title"
                    value={formData.seo_title || ''}
                    onChange={(e) => updateFormData('seo_title', e.target.value)}
                    placeholder="اتركه فارغاً لاستخدام العنوان الرئيسي"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="seo-description">وصف SEO</Label>
                  <Textarea
                    id="seo-description"
                    value={formData.seo_description || ''}
                    onChange={(e) => updateFormData('seo_description', e.target.value)}
                    placeholder="اتركه فارغاً لاستخدام الملخص"
                    rows={2}
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="seo-keywords">الكلمات المفتاحية</Label>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => generateAIContent('keywords')}
                      className="text-xs"
                    >
                      <Sparkles className="h-3 w-3 ml-1" />
                      توليد بالذكاء الاصطناعي
                    </Button>
                  </div>
                  <Input
                    id="seo-keywords"
                    value={formData.seo_keywords || ''}
                    onChange={(e) => updateFormData('seo_keywords', e.target.value)}
                    placeholder="كلمة1، كلمة2، كلمة3"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* العمود الأيمن - الإعدادات والصورة */}
          <div className="space-y-6">
            {/* الصورة البارزة */}
            <Card>
              <CardHeader>
                <CardTitle>الصورة البارزة</CardTitle>
                <CardDescription>
                  الصورة الرئيسية للمقال
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {imagePreview ? (
                    <div className="relative group">
                      <img
                        src={imagePreview}
                        alt="Featured"
                        className="w-full h-48 object-cover rounded-lg"
                      />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => document.getElementById('image-upload')?.click()}
                        >
                          <Upload className="h-4 w-4 ml-1" />
                          تغيير
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={handleRemoveImage}
                        >
                          <Trash2 className="h-4 w-4 ml-1" />
                          حذف
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div
                      onClick={() => document.getElementById('image-upload')?.click()}
                      className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-8 text-center cursor-pointer hover:border-primary transition-colors"
                    >
                      <ImageIcon className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        انقر لرفع صورة أو اسحب وأفلت
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        PNG, JPG, GIF حتى 5MB
                      </p>
                    </div>
                  )}
                  <input
                    id="image-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    disabled={uploading}
                  />
                </div>
              </CardContent>
            </Card>

            {/* إعدادات النشر */}
            <Card>
              <CardHeader>
                <CardTitle>إعدادات النشر</CardTitle>
                <CardDescription>
                  التحكم في كيفية نشر المقال
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* الحالة */}
                <div className="space-y-2">
                  <Label htmlFor="status">الحالة</Label>
                  <Select
                    value={formData.status || 'draft'}
                    onValueChange={(value) => updateFormData('status', value)}
                  >
                    <SelectTrigger id="status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-2 rounded-full bg-gray-500" />
                          مسودة
                        </div>
                      </SelectItem>
                      <SelectItem value="review">
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-2 rounded-full bg-yellow-500" />
                          قيد المراجعة
                        </div>
                      </SelectItem>
                      <SelectItem value="published">
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-2 rounded-full bg-green-500" />
                          منشور
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* التصنيف */}
                <div className="space-y-2">
                  <Label htmlFor="category">التصنيف</Label>
                  <Select
                    value={formData.category_id || ''}
                    onValueChange={(value) => updateFormData('category_id', value)}
                  >
                    <SelectTrigger id="category">
                      <SelectValue placeholder="اختر التصنيف" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* المؤلف */}
                <div className="space-y-2">
                  <Label htmlFor="author">المؤلف / المراسل</Label>
                  <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <User className="h-4 w-4 text-gray-500" />
                    <span className="text-sm font-medium">
                      {formData.author?.name || article?.author?.name || 'غير محدد'}
                    </span>
                  </div>
                </div>

                {/* تاريخ النشر */}
                <div className="space-y-2">
                  <Label htmlFor="published-at">تاريخ النشر</Label>
                  <Input
                    id="published-at"
                    type="datetime-local"
                    value={formData.published_at ? new Date(formData.published_at).toISOString().slice(0, 16) : ''}
                    onChange={(e) => updateFormData('published_at', e.target.value)}
                  />
                </div>

                {/* خيارات إضافية */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="featured" className="text-sm">
                      مقال مميز
                    </Label>
                    <Switch
                      id="featured"
                      checked={formData.is_featured || false}
                      onCheckedChange={(checked) => updateFormData('is_featured', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="breaking" className="text-sm">
                      خبر عاجل
                    </Label>
                    <Switch
                      id="breaking"
                      checked={formData.is_breaking || false}
                      onCheckedChange={(checked) => updateFormData('is_breaking', checked)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* معلومات المقال */}
            <Card>
              <CardHeader>
                <CardTitle>معلومات المقال</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">ID:</span>
                  <span className="font-mono">{article.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">تاريخ الإنشاء:</span>
                  <span>{new Date(article.created_at || '').toLocaleDateString('ar')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">آخر تحديث:</span>
                  <span>{new Date(article.updated_at || '').toLocaleDateString('ar')}</span>
                </div>
                {article.views_count && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">المشاهدات:</span>
                    <span>{article.views_count.toLocaleString('ar')}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}