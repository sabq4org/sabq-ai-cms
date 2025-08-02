'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
// تم إزالة DashboardLayout - تستخدم الصفحة layout.tsx الأساسي
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Save, Lightbulb, Upload } from 'lucide-react';

interface Category {
  id: string;
  name: string;
}

interface FormData {
  name: string;
  slug: string;
  author_name: string;
  author_bio: string;
  description: string;
  cover_image: string;
  category_id: string;
  ai_enabled: boolean;
  is_active: boolean;
  is_featured: boolean;
}

export default function CreateCornerPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    slug: '',
    author_name: '',
    author_bio: '',
    description: '',
    cover_image: '',
    category_id: '',
    ai_enabled: true,
    is_active: true,
    is_featured: false
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories');
      if (response.ok) {
        const data = await response.json();
        setCategories(data.categories || []);
      }
    } catch (error) {
      console.error('خطأ في جلب التصنيفات:', error);
    }
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-zA-Z0-9\u0600-\u06FF-]/g, '')
      .replace(/-+/g, '-')
      .trim('-');
  };

  const handleInputChange = (field: keyof FormData, value: string | boolean) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value };
      
      // توليد الرابط تلقائياً عند تغيير الاسم
      if (field === 'name' && typeof value === 'string') {
        updated.slug = generateSlug(value);
      }
      
      return updated;
    });
  };

  const validateForm = () => {
    const required = ['name', 'slug', 'author_name'];
    const missing = required.filter(field => !formData[field as keyof FormData]);
    
    if (missing.length > 0) {
      alert(`يرجى ملء الحقول المطلوبة: ${missing.join(', ')}`);
      return false;
    }

    // التحقق من صحة الرابط
    if (!/^[a-zA-Z0-9\u0600-\u06FF-]+$/.test(formData.slug)) {
      alert('الرابط يجب أن يحتوي على حروف وأرقام وشرطات فقط');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      setLoading(true);
      
      const response = await fetch('/api/admin/muqtarab/corners', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        router.push('/admin/muqtarab/corners?success=created');
      } else {
        const error = await response.json();
        alert(error.error || 'حدث خطأ في إنشاء الزاوية');
      }
    } catch (error) {
      console.error('خطأ في إنشاء الزاوية:', error);
      alert('حدث خطأ في إنشاء الزاوية');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6" dir="rtl">
        {/* رأس الصفحة */}
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            onClick={() => router.back()}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            رجوع
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">إنشاء زاوية جديدة</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              إنشاء زاوية إبداعية جديدة في منصة مُقترَب
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* العمود الرئيسي */}
            <div className="lg:col-span-2 space-y-6">
              {/* المعلومات الأساسية */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lightbulb className="w-5 h-5 text-blue-600" />
                    المعلومات الأساسية
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">اسم الزاوية *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        placeholder="مثال: زاوية أحمد الرحالة"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="slug">رابط الزاوية *</Label>
                      <Input
                        id="slug"
                        value={formData.slug}
                        onChange={(e) => handleInputChange('slug', e.target.value)}
                        placeholder="مثال: ahmed-rahala"
                        required
                        dir="ltr"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        سيظهر كـ: /muqtarab/{formData.slug}
                      </p>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="description">وصف الزاوية</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      placeholder="وصف مختصر لمحتوى الزاوية وتخصصها..."
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label htmlFor="cover_image">رابط صورة الغلاف</Label>
                    <Input
                      id="cover_image"
                      value={formData.cover_image}
                      onChange={(e) => handleInputChange('cover_image', e.target.value)}
                      placeholder="https://example.com/image.jpg"
                      type="url"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* معلومات الكاتب */}
              <Card>
                <CardHeader>
                  <CardTitle>معلومات الكاتب المسؤول</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="author_name">اسم الكاتب *</Label>
                    <Input
                      id="author_name"
                      value={formData.author_name}
                      onChange={(e) => handleInputChange('author_name', e.target.value)}
                      placeholder="الاسم الكامل للكاتب المسؤول عن الزاوية"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="author_bio">نبذة عن الكاتب</Label>
                    <Textarea
                      id="author_bio"
                      value={formData.author_bio}
                      onChange={(e) => handleInputChange('author_bio', e.target.value)}
                      placeholder="نبذة مختصرة عن خبرة وتخصص الكاتب..."
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* الشريط الجانبي */}
            <div className="space-y-6">
              {/* إعدادات النشر */}
              <Card>
                <CardHeader>
                  <CardTitle>إعدادات النشر</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="is_active">نشط</Label>
                    <Switch
                      id="is_active"
                      checked={formData.is_active}
                      onCheckedChange={(checked) => handleInputChange('is_active', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="is_featured">مميز</Label>
                    <Switch
                      id="is_featured"
                      checked={formData.is_featured}
                      onCheckedChange={(checked) => handleInputChange('is_featured', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="ai_enabled">دعم AI</Label>
                    <Switch
                      id="ai_enabled"
                      checked={formData.ai_enabled}
                      onCheckedChange={(checked) => handleInputChange('ai_enabled', checked)}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* التصنيف */}
              <Card>
                <CardHeader>
                  <CardTitle>التصنيف</CardTitle>
                </CardHeader>
                <CardContent>
                  <Label htmlFor="category_id">تصنيف الزاوية</Label>
                  <Select 
                    value={formData.category_id} 
                    onValueChange={(value) => handleInputChange('category_id', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="اختر التصنيف" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">بدون تصنيف</SelectItem>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </CardContent>
              </Card>

              {/* أزرار الحفظ */}
              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-3">
                    <Button 
                      type="submit" 
                      className="w-full"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white ml-2"></div>
                          جاري الحفظ...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4 ml-2" />
                          إنشاء الزاوية
                        </>
                      )}
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline" 
                      className="w-full"
                      onClick={() => router.back()}
                    >
                      إلغاء
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </div>
  );
}