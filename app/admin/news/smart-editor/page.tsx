/**
 * صفحة المحرر الذكي للأخبار
 * Smart News Editor Page
 */

'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { createClient } from '@supabase/supabase-js';
import {
    ArrowLeft,
    Clock,
    Edit3,
    Eye,
    Globe,
    Loader2,
    MessageCircle,
    Save,
    Settings,
    Share2,
    Users
} from 'lucide-react';
import dynamic from 'next/dynamic';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';

// تحميل ديناميكي للمحرر الذكي المتقدم
const SmartAdvancedEditor = dynamic(
  () => import('@/components/Editor/SmartAdvancedEditor'),
  {
    ssr: false,
    loading: () => (
      <div className="animate-pulse bg-gray-100 rounded-lg p-8 min-h-[400px] flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">جاري تحضير المحرر الذكي المتقدم...</p>
        </div>
      </div>
    )
  }
);// تحميل ديناميكي لنظام التعليقات
const CommentsSystem = dynamic(
  () => import('@/components/Editor/CommentsSystem'),
  {
    ssr: false,
    loading: () => (
      <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
      </div>
    )
  }
);

// إعداد Supabase client مع حماية من الأخطاء
let supabase: any = null;
try {
  if (typeof window !== 'undefined' &&
      process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );
  }
} catch (error) {
  console.warn('⚠️ Supabase client initialization failed:', error);
}interface Article {
  id: string;
  title: string;
  content: any;
  html_content?: string;
  status: 'draft' | 'published' | 'archived';
  breaking: boolean;
  featured_image?: string;
  category_id?: string;
  tags?: string[];
  published_at?: string;
  created_at: string;
  updated_at: string;
}

interface Category {
  id: string;
  name: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  color: string;
}

// ألوان المستخدمين
const getUserColor = (userId: string): string => {
  const colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FECA57',
    '#FF9FF3', '#54A0FF', '#5F27CD', '#00D2D3', '#FF9F43'
  ];
  const index = userId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return colors[index % colors.length];
};

const SmartNewsEditor: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const articleId = searchParams?.get('id') || null;
  const isEdit = Boolean(articleId);

  // حالة المقال
  const [article, setArticle] = useState<Article>({
    id: '',
    title: '',
    content: {},
    status: 'draft',
    breaking: false,
    created_at: '',
    updated_at: ''
  });

  // حالة التطبيق
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [loading, setLoading] = useState(isEdit);
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeTab, setActiveTab] = useState('editor');
  const [wordCount, setWordCount] = useState(0);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // المستخدم الحالي (يمكن الحصول عليه من context أو session)
  const currentUser: User = {
    id: 'current-user-id', // استبدل بالمستخدم الحقيقي
    name: 'محرر الأخبار',
    email: 'editor@sabq.org',
    color: getUserColor('current-user-id')
  };

  // جلب المقال للتعديل
  const fetchArticle = useCallback(async () => {
    if (!articleId) return;

    try {
      setLoading(true);

      // جلب من API الحالي
      const response = await fetch(`/api/articles/${articleId}`);
      if (!response.ok) {
        throw new Error('فشل في جلب المقال');
      }

      const data = await response.json();
      if (data.article) {
        setArticle(data.article);
        setWordCount(data.article.content?.content?.length || 0);
        console.log('📖 تم جلب المقال:', data.article.title);
      }

    } catch (error) {
      console.error('خطأ في جلب المقال:', error);
      toast.error('فشل في جلب المقال');
      router.push('/admin/news');
    } finally {
      setLoading(false);
    }
  }, [articleId, router]);

  // جلب التصنيفات
  const fetchCategories = useCallback(async () => {
    try {
      const response = await fetch('/api/categories');
      const data = await response.json();
      if (data.categories) {
        setCategories(data.categories);
      }
    } catch (error) {
      console.error('خطأ في جلب التصنيفات:', error);
    }
  }, []);

  // حفظ المقال
  const saveArticle = useCallback(async (content?: any) => {
    try {
      setSaving(true);

      const articleData = {
        title: article.title,
        content: content || article.content,
        status: article.status,
        breaking: article.breaking,
        featured_image: article.featured_image,
        category_id: article.category_id,
        tags: article.tags
      };

      const url = isEdit ? `/api/articles/${articleId}` : '/api/articles';
      const method = isEdit ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(articleData)
      });

      if (!response.ok) {
        throw new Error('فشل في حفظ المقال');
      }

      const data = await response.json();

      if (!isEdit && data.article) {
        // إعادة توجيه للتعديل بعد الإنشاء
        router.push(`/admin/news/smart-editor?id=${data.article.id}`);
        return;
      }

      setLastSaved(new Date());
      toast.success('تم حفظ المقال بنجاح');
      console.log('💾 تم حفظ المقال');

    } catch (error) {
      console.error('خطأ في حفظ المقال:', error);
      toast.error('فشل في حفظ المقال');
    } finally {
      setSaving(false);
    }
  }, [article, articleId, isEdit, router]);

  // نشر المقال
  const publishArticle = useCallback(async () => {
    if (!article.title.trim()) {
      toast.error('يجب إضافة عنوان للمقال');
      return;
    }

    try {
      setPublishing(true);

      const updatedArticle = {
        ...article,
        status: 'published' as const,
        published_at: new Date().toISOString()
      };

      await saveArticle();
      setArticle(updatedArticle);

      toast.success('تم نشر المقال بنجاح');
      console.log('🚀 تم نشر المقال');

    } catch (error) {
      console.error('خطأ في نشر المقال:', error);
      toast.error('فشل في نشر المقال');
    } finally {
      setPublishing(false);
    }
  }, [article, saveArticle]);

  // معالجة تغيير المحتوى
  const handleContentChange = useCallback((content: any) => {
    setArticle(prev => ({ ...prev, content }));

    // حساب عدد الكلمات تقريبياً
    const textContent = JSON.stringify(content);
    const words = textContent.match(/[\u0600-\u06FF\w]+/g) || [];
    setWordCount(words.length);
  }, []);

  // تحميل البيانات الأولية
  useEffect(() => {
    fetchCategories();
    if (isEdit) {
      fetchArticle();
    }
  }, [fetchCategories, fetchArticle, isEdit]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">جاري تحميل المحرر الذكي</h2>
          <p className="text-gray-600">يرجى الانتظار...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* شريط التنقل العلوي */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/admin/news')}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                العودة للأخبار
              </Button>

              <div className="flex items-center gap-2">
                <Badge variant={article.status === 'published' ? 'default' : 'secondary'}>
                  {article.status === 'published' ? '✅ منشور' :
                   article.status === 'draft' ? '📝 مسودة' : '📦 مؤرشف'}
                </Badge>

                {article.breaking && (
                  <Badge variant="destructive">⚡ عاجل</Badge>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3">
              {lastSaved && (
                <span className="text-sm text-gray-500">
                  آخر حفظ: {lastSaved.toLocaleTimeString('ar-SA')}
                </span>
              )}

              <Button
                variant="outline"
                size="sm"
                onClick={() => saveArticle()}
                disabled={saving}
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 animate-spin ml-2" />
                ) : (
                  <Save className="w-4 h-4 ml-2" />
                )}
                {saving ? 'جاري الحفظ...' : 'حفظ'}
              </Button>

              {article.status !== 'published' && (
                <Button
                  size="sm"
                  onClick={publishArticle}
                  disabled={publishing || !article.title.trim()}
                >
                  {publishing ? (
                    <Loader2 className="w-4 h-4 animate-spin ml-2" />
                  ) : (
                    <Globe className="w-4 h-4 ml-2" />
                  )}
                  {publishing ? 'جاري النشر...' : 'نشر'}
                </Button>
              )}

              {article.status === 'published' && (
                <Button variant="outline" size="sm">
                  <Eye className="w-4 h-4 ml-2" />
                  معاينة
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* المحتوى الرئيسي */}
      <div className="flex">
        {/* المنطقة الرئيسية */}
        <div className="flex-1 p-6">
          <div className="max-w-5xl mx-auto space-y-6">
            {/* إعدادات المقال */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  إعدادات المقال
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* العنوان */}
                <div>
                  <Label htmlFor="title" className="text-sm font-medium mb-2 block">
                    عنوان المقال <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="title"
                    value={article.title}
                    onChange={(e) => setArticle(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="أدخل عنوان المقال..."
                    className="text-lg"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* التصنيف */}
                  <div>
                    <Label className="text-sm font-medium mb-2 block">التصنيف</Label>
                    <Select
                      value={article.category_id || ''}
                      onValueChange={(value) => setArticle(prev => ({ ...prev, category_id: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="اختر التصنيف" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map(category => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* الخبر العاجل */}
                  <div className="flex items-center gap-3">
                    <Label htmlFor="breaking" className="text-sm font-medium">
                      خبر عاجل
                    </Label>
                    <Switch
                      id="breaking"
                      checked={article.breaking}
                      onCheckedChange={(checked) => setArticle(prev => ({ ...prev, breaking: checked }))}
                    />
                  </div>

                  {/* عداد الكلمات */}
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Clock className="w-4 h-4" />
                    <span>{wordCount} كلمة</span>
                    <span>•</span>
                    <span>{Math.ceil(wordCount / 200)} دقيقة قراءة</span>
                  </div>
                </div>

                {/* رابط الصورة المميزة */}
                <div>
                  <Label htmlFor="featured_image" className="text-sm font-medium mb-2 block">
                    الصورة المميزة (رابط)
                  </Label>
                  <Input
                    id="featured_image"
                    value={article.featured_image || ''}
                    onChange={(e) => setArticle(prev => ({ ...prev, featured_image: e.target.value }))}
                    placeholder="https://example.com/image.jpg"
                    type="url"
                  />
                </div>
              </CardContent>
            </Card>

            {/* التبويبات */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="editor" className="flex items-center gap-2">
                  <Edit3 className="w-4 h-4" />
                  المحرر التعاوني
                </TabsTrigger>
                <TabsTrigger value="comments" className="flex items-center gap-2">
                  <MessageCircle className="w-4 h-4" />
                  التعليقات والملاحظات
                </TabsTrigger>
              </TabsList>

              <TabsContent value="editor" className="mt-6">
                <SmartAdvancedEditor
                  documentId={articleId || 'new-document'}
                  currentUser={{
                    ...currentUser,
                    role: 'editor',
                    color: '#3b82f6'
                  }}
                  initialContent={article.content}
                  onSave={handleContentChange}
                  className="min-h-[600px]"
                  enableAI={true}
                  enableCollaboration={true}
                  enableAnalytics={true}
                />
              </TabsContent>

              <TabsContent value="comments" className="mt-6">
                {articleId ? (
                  <CommentsSystem
                    documentId={articleId}
                    currentUser={currentUser}
                    className="min-h-[600px] rounded-lg border"
                  />
                ) : (
                  <Card className="p-12 text-center">
                    <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">احفظ المقال أولاً</h3>
                    <p className="text-gray-600">
                      يجب حفظ المقال قبل إمكانية إضافة التعليقات والتعاون مع الفريق
                    </p>
                    <Button
                      className="mt-4"
                      onClick={() => saveArticle()}
                      disabled={!article.title.trim()}
                    >
                      حفظ المقال
                    </Button>
                  </Card>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>

        {/* الشريط الجانبي */}
        <div className="w-80 bg-white border-l p-6 space-y-6">
          {/* معلومات الجلسة */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm">
                <Users className="w-4 h-4" />
                جلسة التعاون
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium"
                    style={{ backgroundColor: currentUser.color }}
                  >
                    {currentUser.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-medium text-sm">{currentUser.name}</p>
                    <p className="text-xs text-gray-500">أنت (محرر نشط)</p>
                  </div>
                </div>

                <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
                  💡 ادع أعضاء الفريق للتعاون في التحرير والمراجعة
                </div>
              </div>
            </CardContent>
          </Card>

          {/* إحصائيات سريعة */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">إحصائيات المقال</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span>الكلمات:</span>
                <span className="font-medium">{wordCount}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>وقت القراءة:</span>
                <span className="font-medium">{Math.ceil(wordCount / 200)} دقيقة</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>الحالة:</span>
                <Badge variant="outline" className="text-xs">
                  {article.status === 'published' ? 'منشور' :
                   article.status === 'draft' ? 'مسودة' : 'مؤرشف'}
                </Badge>
              </div>
              {article.published_at && (
                <div className="flex justify-between text-sm">
                  <span>تاريخ النشر:</span>
                  <span className="font-medium text-xs">
                    {new Date(article.published_at).toLocaleDateString('ar-SA')}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* أدوات سريعة */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">أدوات سريعة</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" size="sm" className="w-full justify-start">
                <Share2 className="w-4 h-4 ml-2" />
                مشاركة للمراجعة
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start">
                <Eye className="w-4 h-4 ml-2" />
                معاينة المقال
              </Button>
              {article.status === 'published' && (
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <Globe className="w-4 h-4 ml-2" />
                  عرض في الموقع
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SmartNewsEditor;
