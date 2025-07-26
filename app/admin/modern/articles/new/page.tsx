/**
 * صفحة إنشاء مقال جديد
 * New Article Creation Page
 */

'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import DashboardLayout from '@/components/admin/modern-dashboard/DashboardLayout';
import {
  FileText,
  Save,
  Eye,
  Image,
  Tag,
  Calendar,
  User,
  Globe,
  Settings,
  Upload,
  Link,
  Hash,
  Clock,
  Brain
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

interface ArticleData {
  title: string;
  content: string;
  excerpt: string;
  category: string;
  tags: string[];
  status: 'draft' | 'published' | 'scheduled';
  publishDate: string;
  author: string;
  featuredImage: string;
  seoTitle: string;
  seoDescription: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
}

const categories = [
  { value: 'politics', label: 'سياسة' },
  { value: 'economy', label: 'اقتصاد' },
  { value: 'sports', label: 'رياضة' },
  { value: 'technology', label: 'تقنية' },
  { value: 'culture', label: 'ثقافة' },
  { value: 'health', label: 'صحة' },
  { value: 'education', label: 'تعليم' }
];

export default function NewArticlePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [currentTag, setCurrentTag] = useState('');
  
  const [articleData, setArticleData] = useState<ArticleData>({
    title: '',
    content: '',
    excerpt: '',
    category: '',
    tags: [],
    status: 'draft',
    publishDate: new Date().toISOString().split('T')[0],
    author: 'المحرر الحالي',
    featuredImage: '',
    seoTitle: '',
    seoDescription: '',
    priority: 'medium'
  });

  const handleInputChange = (field: keyof ArticleData, value: string) => {
    setArticleData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAddTag = () => {
    if (currentTag.trim() && !articleData.tags.includes(currentTag.trim())) {
      setArticleData(prev => ({
        ...prev,
        tags: [...prev.tags, currentTag.trim()]
      }));
      setCurrentTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setArticleData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleSave = async (status: 'draft' | 'published') => {
    setIsLoading(true);
    try {
      // محاكاة حفظ المقال
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const updatedData = { ...articleData, status };
      
      if (status === 'published') {
        toast.success('تم نشر المقال بنجاح!');
      } else {
        toast.success('تم حفظ المسودة بنجاح!');
      }
      
      // إعادة توجيه إلى صفحة المقالات
      setTimeout(() => {
        router.push('/admin/modern/articles');
      }, 1500);
      
    } catch (error) {
      toast.error('حدث خطأ أثناء الحفظ');
    } finally {
      setIsLoading(false);
    }
  };

  const generateAISuggestions = () => {
    toast.success('جاري توليد اقتراحات AI...');
    // محاكاة اقتراحات AI
    setTimeout(() => {
      if (!articleData.seoTitle && articleData.title) {
        handleInputChange('seoTitle', articleData.title + ' - موقع سبق');
      }
      if (!articleData.seoDescription && articleData.excerpt) {
        handleInputChange('seoDescription', articleData.excerpt.substring(0, 160));
      }
      toast.success('تم توليد اقتراحات SEO بواسطة AI');
    }, 1000);
  };

  return (
    <DashboardLayout 
      pageTitle="إنشاء مقال جديد"
      pageDescription="إنشاء وتحرير المقالات الإخبارية"
    >
      <div className="space-y-6">
        {/* شريط الأدوات العلوي */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/20">
              <FileText className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">مقال جديد</h1>
              <p className="text-gray-600 dark:text-gray-400">إنشاء محتوى إخباري جديد</p>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={() => handleSave('draft')}
              disabled={isLoading}
            >
              <Save className="h-4 w-4 mr-2" />
              حفظ كمسودة
            </Button>
            <Button 
              onClick={() => handleSave('published')}
              disabled={isLoading || !articleData.title || !articleData.content}
              className="bg-green-600 hover:bg-green-700"
            >
              <Globe className="h-4 w-4 mr-2" />
              نشر المقال
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* المحتوى الرئيسي */}
          <div className="lg:col-span-2 space-y-6">
            {/* معلومات المقال الأساسية */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  محتوى المقال
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="title">عنوان المقال *</Label>
                  <Input
                    id="title"
                    placeholder="أدخل عنوان المقال..."
                    value={articleData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="excerpt">الملخص</Label>
                  <Textarea
                    id="excerpt"
                    placeholder="ملخص مختصر للمقال..."
                    value={articleData.excerpt}
                    onChange={(e) => handleInputChange('excerpt', e.target.value)}
                    className="mt-1"
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="content">محتوى المقال *</Label>
                  <Textarea
                    id="content"
                    placeholder="اكتب محتوى المقال هنا..."
                    value={articleData.content}
                    onChange={(e) => handleInputChange('content', e.target.value)}
                    className="mt-1 min-h-[300px]"
                  />
                </div>
              </CardContent>
            </Card>

            {/* إعدادات SEO */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  إعدادات SEO
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={generateAISuggestions}
                    className="mr-auto"
                  >
                    <Brain className="h-4 w-4 mr-1" />
                    اقتراحات AI
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="seoTitle">عنوان SEO</Label>
                  <Input
                    id="seoTitle"
                    placeholder="عنوان محسن لمحركات البحث..."
                    value={articleData.seoTitle}
                    onChange={(e) => handleInputChange('seoTitle', e.target.value)}
                    className="mt-1"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {articleData.seoTitle.length}/60 حرف
                  </p>
                </div>

                <div>
                  <Label htmlFor="seoDescription">وصف SEO</Label>
                  <Textarea
                    id="seoDescription"
                    placeholder="وصف المقال لمحركات البحث..."
                    value={articleData.seoDescription}
                    onChange={(e) => handleInputChange('seoDescription', e.target.value)}
                    className="mt-1"
                    rows={3}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {articleData.seoDescription.length}/160 حرف
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* الشريط الجانبي */}
          <div className="space-y-6">
            {/* إعدادات النشر */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  إعدادات النشر
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="status">حالة المقال</Label>
                  <select 
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 mt-1"
                    value={articleData.status} 
                    onChange={(e) => handleInputChange('status', e.target.value)}
                  >
                    <option value="draft">مسودة</option>
                    <option value="published">منشور</option>
                    <option value="scheduled">مجدول</option>
                  </select>
                </div>

                <div>
                  <Label htmlFor="publishDate">تاريخ النشر</Label>
                  <Input
                    id="publishDate"
                    type="date"
                    value={articleData.publishDate}
                    onChange={(e) => handleInputChange('publishDate', e.target.value)}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="priority">أولوية المقال</Label>
                  <select 
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 mt-1"
                    value={articleData.priority} 
                    onChange={(e) => handleInputChange('priority', e.target.value)}
                  >
                    <option value="low">منخفضة</option>
                    <option value="medium">متوسطة</option>
                    <option value="high">عالية</option>
                    <option value="urgent">عاجلة</option>
                  </select>
                </div>

                <div>
                  <Label htmlFor="author">الكاتب</Label>
                  <Input
                    id="author"
                    value={articleData.author}
                    onChange={(e) => handleInputChange('author', e.target.value)}
                    className="mt-1"
                  />
                </div>
              </CardContent>
            </Card>

            {/* التصنيف والعلامات */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Tag className="h-5 w-5" />
                  التصنيف والعلامات
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="category">التصنيف</Label>
                  <select 
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 mt-1"
                    value={articleData.category} 
                    onChange={(e) => handleInputChange('category', e.target.value)}
                  >
                    <option value="">اختر التصنيف</option>
                    {categories.map((category) => (
                      <option key={category.value} value={category.value}>
                        {category.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label htmlFor="tags">العلامات</Label>
                  <div className="flex gap-2 mt-1">
                    <Input
                      placeholder="أضف علامة..."
                      value={currentTag}
                      onChange={(e) => setCurrentTag(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                    />
                    <Button onClick={handleAddTag} size="sm">
                      <Hash className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  {articleData.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {articleData.tags.map((tag) => (
                        <Badge
                          key={tag}
                          variant="secondary"
                          className="cursor-pointer"
                          onClick={() => handleRemoveTag(tag)}
                        >
                          {tag} ×
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* الصورة المميزة */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Image className="h-5 w-5" />
                  الصورة المميزة
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Input
                    placeholder="رابط الصورة..."
                    value={articleData.featuredImage}
                    onChange={(e) => handleInputChange('featuredImage', e.target.value)}
                  />
                  <Button variant="outline" className="w-full">
                    <Upload className="h-4 w-4 mr-2" />
                    رفع صورة
                  </Button>
                  
                  {articleData.featuredImage && (
                    <div className="rounded-lg border p-2">
                      <img
                        src={articleData.featuredImage}
                        alt="معاينة الصورة"
                        className="w-full h-32 object-cover rounded"
                      />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
