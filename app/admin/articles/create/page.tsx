'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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
import { 
  Upload, 
  Save, 
  Loader2, 
  Sparkles,
  Image as ImageIcon,
  FileText,
  Settings,
  Calendar
} from 'lucide-react';
import SafeArticleEditor from '@/components/Editor/SafeArticleEditor';

interface ArticleData {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featured_image: string | null;
  status: 'draft' | 'review' | 'published';
  category_id: string;
  featured: boolean;
  breaking: boolean;
  seo_title?: string;
  seo_description?: string;
  seo_keywords?: string;
  published_at?: string;
}

export default function CreateArticlePage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState<ArticleData>({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    featured_image: null,
    status: 'draft',
    category_id: '',
    featured: false,
    breaking: false,
  });
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [categories, setCategories] = useState<any[]>([]);

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
      console.log('🚀 [Image Upload] بدء رفع الصورة:', file.name, file.size);
      
      const uploadFormData = new FormData();
      uploadFormData.append('file', file);
      uploadFormData.append('type', 'featured');

      const response = await fetch('/api/upload-image', {
        method: 'POST',
        body: uploadFormData,
      });

      console.log('📡 [Image Upload] Response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ [Image Upload] Server error:', errorData);
        throw new Error(errorData.error || 'فشل في رفع الصورة');
      }

      const data = await response.json();
      console.log('✅ [Image Upload] Success data:', data);
      
      const imageUrl = data.url || data.secure_url || data.path;
      
      if (!imageUrl) {
        throw new Error('لم يتم الحصول على رابط الصورة');
      }
      
      setImagePreview(imageUrl);
      setFormData(prev => ({ ...prev, featured_image: imageUrl }));
      toast.success('تم رفع الصورة بنجاح');
      
    } catch (error: any) {
      console.error('❌ [Image Upload] Error:', error);
      toast.error(error.message || 'فشل في رفع الصورة');
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
    if (!formData.title.trim()) {
      toast.error('يرجى إدخال عنوان المقال');
        return;
      }
      
    if (!formData.content.trim()) {
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

      const response = await fetch('/api/articles', {
        method: 'POST',
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

      const article = await response.json();
      toast.success('تم إنشاء المقال بنجاح');
      
      // إعادة توجيه لصفحة التعديل
        setTimeout(() => {
        router.push(`/admin/articles/edit/${article.id}`);
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
  const generateAISuggestions = async (type: 'title' | 'excerpt' | 'keywords') => {
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
          setFormData(prev => ({ ...prev, title: data.suggestion }));
        } else if (type === 'excerpt') {
          setFormData(prev => ({ ...prev, excerpt: data.suggestion }));
        } else if (type === 'keywords') {
          setFormData(prev => ({ ...prev, seo_keywords: data.suggestion }));
        }
        toast.success(`تم توليد ${type === 'title' ? 'العنوان' : type === 'excerpt' ? 'الملخص' : 'الكلمات المفتاحية'} بنجاح`);
      }
    } catch (error) {
      console.error(`Error generating ${type}:`, error);
      toast.error(`فشل في توليد ${type === 'title' ? 'العنوان' : type === 'excerpt' ? 'الملخص' : 'الكلمات المفتاحية'}`);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">إنشاء مقال جديد</h1>
            <p className="text-muted-foreground mt-2">
              قم بإنشاء محتوى جديد ونشره
            </p>
          </div>
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
                حفظ المقال
          </>
        )}
      </Button>
    </div>

        {/* Main Content */}
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
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="أدخل عنوان المقال"
                    className="text-lg"
                    required
                  />
                </div>
                
                {/* Slug */}
                <div className="space-y-2">
                  <Label htmlFor="slug">الرابط الدائم (Slug)</Label>
                  <Input
                    id="slug"
                    value={formData.slug}
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
                    value={formData.excerpt}
                    onChange={(e) => setFormData(prev => ({ ...prev, excerpt: e.target.value }))}
                    placeholder="أدخل ملخص المقال"
                    rows={3}
                  />
                </div>

                {/* Content Editor */}
                <div className="space-y-2">
                  <Label>المحتوى *</Label>
                  <SafeArticleEditor
                    initialContent={formData.content}
                    onChange={handleContentChange}
                    placeholder="ابدأ بكتابة محتوى المقال هنا... سيتم حفظ التغييرات تلقائياً"
                    minHeight={400}
                  />
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
                      value={formData.status}
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
                      value={formData.category_id}
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

                {/* Featured and Breaking Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="featured"
                      checked={formData.featured}
                      onChange={(e) => setFormData(prev => ({ ...prev, featured: e.target.checked }))}
                      className="w-4 h-4 text-primary rounded border-gray-300 focus:ring-primary"
                    />
                    <Label htmlFor="featured" className="text-sm font-medium cursor-pointer">
                      ⭐ مقال مميز
                    </Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="breaking"
                      checked={formData.breaking}
                      onChange={(e) => setFormData(prev => ({ ...prev, breaking: e.target.checked }))}
                      className="w-4 h-4 text-red-500 rounded border-gray-300 focus:ring-red-500"
                    />
                    <Label htmlFor="breaking" className="text-sm font-medium cursor-pointer">
                      🔥 خبر عاجل
                    </Label>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
          </div>
  );
}