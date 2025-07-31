'use client';

import { useState, useEffect } from 'react';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { 
  Upload, 
  Save, 
  Loader2, 
  Sparkles,
  Image as ImageIcon,
  FileText,
  Settings,
  Calendar,
  ArrowRight,
  Eye,
  User
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
  author_id?: string;
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
  const [authors, setAuthors] = useState<any[]>([]);

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
      } catch (error) {
        console.error('Error fetching article:', error);
        toast.error('فشل في تحميل بيانات المقال');
        router.push('/admin/news');
      } finally {
        setLoading(false);
      }
    };

    fetchArticle();
  }, [articleId, router]);

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

  // جلب المؤلفين
  useEffect(() => {
    const fetchAuthors = async () => {
      try {
        const response = await fetch('/api/authors');
        if (response.ok) {
          const data = await response.json();
          setAuthors(data.authors || data.data || []);
        }
      } catch (error) {
        console.error('Error fetching authors:', error);
        // إذا فشل جلب المؤلفين، نستخدم المؤلف الحالي فقط
        if (article?.author) {
          setAuthors([article.author]);
        }
      }
    };

    fetchAuthors();
  }, [article]);

  // توليد slug من العنوان
  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  // معالج رفع الصورة
  const handleImageUpload = async (file: File) => {
    try {
      setUploading(true);
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
      const imageUrl = data.url || data.secure_url || data.path;
      
      setImagePreview(imageUrl);
      setFormData(prev => ({ ...prev, featured_image: imageUrl }));
      toast.success('تم رفع الصورة بنجاح');
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('فشل في رفع الصورة');
    } finally {
      setUploading(false);
    }
  };

  // معالج السحب والإفلات
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      handleImageUpload(file);
    }
  };

  // معالج حفظ المقال
  const handleSave = async () => {
    // التحقق من الحقول المطلوبة
    if (!formData.title?.trim()) {
      toast.error('يرجى إدخال عنوان المقال');
      return;
    }

    if (!formData.content?.trim()) {
      toast.error('يرجى إدخال محتوى المقال');
      return;
    }

    if (!formData.category_id) {
      toast.error('يرجى اختيار تصنيف المقال');
      return;
    }

    try {
      setSaving(true);

      // توليد slug إذا لم يكن موجود
      const slug = formData.slug || generateSlug(formData.title);

      const response = await fetch(`/api/articles/${articleId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          slug,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'فشل في حفظ المقال');
      }

      const updatedArticle = await response.json();
      toast.success('تم حفظ التغييرات بنجاح');
      
      // التوجيه إلى صفحة الأخبار
      setTimeout(() => {
        router.push('/admin/news');
      }, 1000);
    } catch (error) {
      console.error('Error saving article:', error);
      toast.error(error instanceof Error ? error.message : 'فشل في حفظ المقال');
    } finally {
      setSaving(false);
    }
  };

  // معالج تغيير المحتوى
  const handleContentChange = (content: string) => {
    setFormData(prev => ({ ...prev, content }));
  };

  // توليد مقترحات AI
  const generateAISuggestions = async (type: 'title' | 'subtitle' | 'excerpt' | 'keywords') => {
    try {
      const loadingToast = toast.loading(`جاري توليد ${
        type === 'title' ? 'العنوان' : 
        type === 'subtitle' ? 'العنوان الفرعي' :
        type === 'excerpt' ? 'الملخص' : 
        'الكلمات المفتاحية'
      }...`);

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
          setFormData(prev => ({ ...prev, title: data.suggestion }));
        } else if (type === 'subtitle') {
          setFormData(prev => ({ ...prev, subtitle: data.suggestion }));
        } else if (type === 'excerpt') {
          setFormData(prev => ({ ...prev, excerpt: data.suggestion }));
        } else if (type === 'keywords') {
          setFormData(prev => ({ ...prev, seo_keywords: data.suggestion }));
        }
        toast.success(`تم التوليد بنجاح`, { id: loadingToast });
      } else {
        throw new Error('فشل في التوليد');
      }
    } catch (error) {
      console.error(`Error generating ${type}:`, error);
      toast.error(`فشل في التوليد`);
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
      <div className="container mx-auto p-6 max-w-7xl">
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
              <p className="text-muted-foreground mt-2">
                قم بتعديل محتوى المقال وإعداداته
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={() => {
                // استخدام ID بدلاً من slug لتجنب الروابط العربية
                const articleId = article.id;
                window.open(`/article/${articleId}`, '_blank');
              }}
            >
              <Eye className="ml-2 h-4 w-4" />
              معاينة
            </Button>
            <Button 
              onClick={handleSave} 
              disabled={saving}
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

        {/* Main Content - نفس تصميم صفحة الإنشاء بالضبط */}
        <Tabs defaultValue="content" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-[600px]">
            <TabsTrigger value="content">
              <FileText className="ml-2 h-4 w-4" />
              المحتوى
            </TabsTrigger>
            <TabsTrigger value="media">
              <ImageIcon className="ml-2 h-4 w-4" />
              الوسائط
            </TabsTrigger>
            <TabsTrigger value="seo">
              <Settings className="ml-2 h-4 w-4" />
              SEO
            </TabsTrigger>
            <TabsTrigger value="settings">
              <Calendar className="ml-2 h-4 w-4" />
              الإعدادات
            </TabsTrigger>
          </TabsList>

          {/* Content Tab */}
          <TabsContent value="content" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>محتوى المقال</CardTitle>
                <CardDescription>
                  قم بإدخال العنوان والملخص والمحتوى الرئيسي
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Title */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="title">العنوان *</Label>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => generateAISuggestions('title')}
                      disabled={!formData.content}
                    >
                      <Sparkles className="ml-2 h-4 w-4" />
                      اقتراح بالذكاء الاصطناعي
                    </Button>
                  </div>
                  <Input
                    id="title"
                    value={formData.title || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="أدخل عنوان المقال"
                    className="text-lg"
                    required
                  />
                </div>

                {/* Subtitle */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="subtitle">العنوان الفرعي</Label>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => generateAISuggestions('subtitle')}
                      disabled={!formData.content}
                    >
                      <Sparkles className="ml-2 h-4 w-4" />
                      اقتراح بالذكاء الاصطناعي
                    </Button>
                  </div>
                  <Input
                    id="subtitle"
                    value={formData.subtitle || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, subtitle: e.target.value }))}
                    placeholder="أدخل العنوان الفرعي (اختياري)"
                  />
                </div>

                {/* Slug */}
                <div className="space-y-2">
                  <Label htmlFor="slug">الرابط الدائم (Slug)</Label>
                  <Input
                    id="slug"
                    value={formData.slug || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                    placeholder="سيتم توليده تلقائياً من العنوان"
                    dir="ltr"
                  />
                </div>

                {/* Excerpt */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="excerpt">الملخص</Label>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => generateAISuggestions('excerpt')}
                      disabled={!formData.content}
                    >
                      <Sparkles className="ml-2 h-4 w-4" />
                      اقتراح بالذكاء الاصطناعي
                    </Button>
                  </div>
                  <Textarea
                    id="excerpt"
                    value={formData.excerpt || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, excerpt: e.target.value }))}
                    placeholder="أدخل ملخص المقال"
                    rows={3}
                  />
                </div>

                {/* Content Editor */}
                <div className="space-y-2">
                  <Label>المحتوى *</Label>
                  <div className="border rounded-lg overflow-hidden">
                    <ArticleEditor
                      initialContent={formData.content || ''}
                      onChange={handleContentChange}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Media Tab */}
          <TabsContent value="media" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>الصورة البارزة</CardTitle>
                <CardDescription>
                  قم برفع صورة بارزة للمقال
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div
                  onDrop={handleDrop}
                  onDragOver={(e) => e.preventDefault()}
                  className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-primary transition-colors"
                >
                  {imagePreview ? (
                    <div className="space-y-4">
                      <img
                        src={imagePreview}
                        alt="Featured"
                        className="mx-auto max-h-64 rounded-lg shadow-lg"
                      />
                      <div className="flex justify-center gap-3">
                        <Button
                          variant="outline"
                          onClick={() => {
                            setImagePreview(null);
                            setFormData(prev => ({ ...prev, featured_image: null }));
                          }}
                        >
                          إزالة الصورة
                        </Button>
                        <label>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleImageUpload(file);
                            }}
                            disabled={uploading}
                          />
                          <Button as="span" disabled={uploading}>
                            {uploading ? (
                              <>
                                <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                                جاري الرفع...
                              </>
                            ) : (
                              <>
                                <Upload className="ml-2 h-4 w-4" />
                                تغيير الصورة
                              </>
                            )}
                          </Button>
                        </label>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <Upload className="mx-auto h-12 w-12 text-gray-400" />
                      <div>
                        <p className="text-lg font-medium">
                          اسحب وأفلت الصورة هنا
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                          أو انقر لاختيار ملف
                        </p>
                      </div>
                      <label>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleImageUpload(file);
                          }}
                          disabled={uploading}
                        />
                        <Button as="span" variant="outline" disabled={uploading}>
                          {uploading ? (
                            <>
                              <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                              جاري الرفع...
                            </>
                          ) : (
                            <>
                              <Upload className="ml-2 h-4 w-4" />
                              اختيار صورة
                            </>
                          )}
                        </Button>
                      </label>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* SEO Tab */}
          <TabsContent value="seo" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>إعدادات SEO</CardTitle>
                <CardDescription>
                  قم بتحسين المقال لمحركات البحث
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="seo_title">عنوان SEO</Label>
                  <Input
                    id="seo_title"
                    value={formData.seo_title || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, seo_title: e.target.value }))}
                    placeholder="عنوان مخصص لمحركات البحث"
                  />
                  <p className="text-sm text-muted-foreground">
                    {formData.seo_title?.length || 0} / 60 حرف
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="seo_description">وصف SEO</Label>
                  <Textarea
                    id="seo_description"
                    value={formData.seo_description || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, seo_description: e.target.value }))}
                    placeholder="وصف مخصص لمحركات البحث"
                    rows={3}
                  />
                  <p className="text-sm text-muted-foreground">
                    {formData.seo_description?.length || 0} / 160 حرف
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="seo_keywords">الكلمات المفتاحية</Label>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => generateAISuggestions('keywords')}
                      disabled={!formData.content}
                    >
                      <Sparkles className="ml-2 h-4 w-4" />
                      اقتراح بالذكاء الاصطناعي
                    </Button>
                  </div>
                  <Input
                    id="seo_keywords"
                    value={formData.seo_keywords || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, seo_keywords: e.target.value }))}
                    placeholder="كلمة1، كلمة2، كلمة3"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>إعدادات النشر</CardTitle>
                <CardDescription>
                  قم بتحديد حالة المقال وإعدادات النشر
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Status */}
                  <div className="space-y-2">
                    <Label htmlFor="status">الحالة</Label>
                    <Select
                      value={formData.status || 'draft'}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, status: value as any }))}
                    >
                      <SelectTrigger id="status">
                        <SelectValue placeholder="اختر الحالة" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">مسودة</SelectItem>
                        <SelectItem value="review">قيد المراجعة</SelectItem>
                        <SelectItem value="published">منشور</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Category */}
                  <div className="space-y-2">
                    <Label htmlFor="category">التصنيف *</Label>
                    <Select
                      value={formData.category_id || ''}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, category_id: value }))}
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

                  {/* Author */}
                  <div className="space-y-2">
                    <Label htmlFor="author">المؤلف / المراسل</Label>
                    <Select
                      value={formData.author_id || article?.author_id || ''}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, author_id: value }))}
                    >
                      <SelectTrigger id="author">
                        <SelectValue placeholder="اختر المؤلف">
                          {formData.author?.name || article?.author?.name || 'اختر المؤلف'}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {authors.length > 0 ? (
                          authors.map((author) => (
                            <SelectItem key={author.id} value={author.id}>
                              <div className="flex items-center gap-2">
                                <User className="h-4 w-4" />
                                {author.name}
                              </div>
                            </SelectItem>
                          ))
                        ) : (
                          article?.author && (
                            <SelectItem value={article.author_id || article.author.id}>
                              <div className="flex items-center gap-2">
                                <User className="h-4 w-4" />
                                {article.author.name}
                              </div>
                            </SelectItem>
                          )
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Publish Date */}
                  <div className="space-y-2">
                    <Label htmlFor="published_at">تاريخ النشر</Label>
                    <Input
                      id="published_at"
                      type="datetime-local"
                      value={formData.published_at ? new Date(formData.published_at).toISOString().slice(0, 16) : ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, published_at: new Date(e.target.value).toISOString() }))}
                    />
                  </div>
                </div>

                {/* خيارات إضافية */}
                <div className="space-y-4 pt-4 border-t">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="featured" className="text-base">
                        مقال مميز
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        عرض هذا المقال في القسم المميز
                      </p>
                    </div>
                    <Switch
                      id="featured"
                      checked={formData.is_featured || false}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_featured: checked }))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="breaking" className="text-base">
                        خبر عاجل
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        عرض هذا المقال كخبر عاجل
                      </p>
                    </div>
                    <Switch
                      id="breaking"
                      checked={formData.is_breaking || false}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_breaking: checked }))}
                    />
                  </div>
                </div>

                {/* معلومات المقال */}
                {article && (
                  <div className="pt-4 border-t space-y-3 text-sm">
                    <h4 className="font-medium mb-2">معلومات المقال</h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <span className="text-muted-foreground">ID:</span>
                        <span className="ml-2 font-mono">{article.id}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">تاريخ الإنشاء:</span>
                        <span className="ml-2">{new Date(article.created_at || '').toLocaleDateString('ar')}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">آخر تحديث:</span>
                        <span className="ml-2">{new Date(article.updated_at || '').toLocaleDateString('ar')}</span>
                      </div>
                      {article.views_count !== undefined && (
                        <div>
                          <span className="text-muted-foreground">المشاهدات:</span>
                          <span className="ml-2">{article.views_count.toLocaleString('ar')}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}