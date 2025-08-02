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
import { ArrowLeft, Save, Send, Brain, Sparkles, Clock, Eye } from 'lucide-react';

interface Corner {
  id: string;
  name: string;
  author_name: string;
}

interface FormData {
  corner_id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  cover_image: string;
  author_name: string;
  author_bio: string;
  author_avatar: string;
  tags: string[];
  is_featured: boolean;
  read_time: number;
  publish_at: string;
  status: string;
  ai_sentiment: string;
  ai_compatibility_score: number;
  ai_summary: string;
  ai_keywords: string[];
  ai_mood: string;
}

const sentimentOptions = [
  { value: '', label: 'تحديد تلقائي' },
  { value: 'ساخر', label: '😏 ساخر' },
  { value: 'تأملي', label: '🤔 تأملي' },
  { value: 'عاطفي', label: '❤️ عاطفي' },
  { value: 'تحليلي', label: '🔍 تحليلي' },
  { value: 'إلهامي', label: '✨ إلهامي' }
];

export default function CreateArticlePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [aiProcessing, setAiProcessing] = useState(false);
  const [corners, setCorners] = useState<Corner[]>([]);
  const [selectedCorner, setSelectedCorner] = useState<Corner | null>(null);
  const [formData, setFormData] = useState<FormData>({
    corner_id: '',
    title: '',
    slug: '',
    content: '',
    excerpt: '',
    cover_image: '',
    author_name: '',
    author_bio: '',
    author_avatar: '',
    tags: [],
    is_featured: false,
    read_time: 0,
    publish_at: '',
    status: 'draft',
    ai_sentiment: '',
    ai_compatibility_score: 0,
    ai_summary: '',
    ai_keywords: [],
    ai_mood: ''
  });

  useEffect(() => {
    fetchCorners();
  }, []);

  useEffect(() => {
    if (formData.corner_id) {
      const corner = corners.find(c => c.id === formData.corner_id);
      setSelectedCorner(corner || null);
      if (corner && !formData.author_name) {
        setFormData(prev => ({ ...prev, author_name: corner.author_name }));
      }
    }
  }, [formData.corner_id, corners]);

  useEffect(() => {
    // حساب وقت القراءة تلقائياً
    if (formData.content) {
      const wordsCount = formData.content.split(/\s+/).length;
      const readTime = Math.ceil(wordsCount / 200); // 200 كلمة في الدقيقة
      setFormData(prev => ({ ...prev, read_time: readTime }));
    }
  }, [formData.content]);

  const fetchCorners = async () => {
    try {
      const response = await fetch('/api/admin/muqtarab/corners?status=active&limit=100');
      if (response.ok) {
        const data = await response.json();
        setCorners(data.data.corners || []);
      }
    } catch (error) {
      console.error('خطأ في جلب الزوايا:', error);
    }
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-zA-Z0-9\u0600-\u06FF-]/g, '')
      .replace(/-+/g, '-')
      .trim('-');
  };

  const handleInputChange = (field: keyof FormData, value: any) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value };
      
      // توليد الرابط تلقائياً عند تغيير العنوان
      if (field === 'title' && typeof value === 'string') {
        updated.slug = generateSlug(value);
      }
      
      return updated;
    });
  };

  const handleTagsChange = (tagsString: string) => {
    const tags = tagsString.split(',').map(tag => tag.trim()).filter(tag => tag);
    handleInputChange('tags', tags);
  };

  const processWithAI = async () => {
    if (!formData.content || !formData.title) {
      alert('يرجى كتابة العنوان والمحتوى أولاً');
      return;
    }

    try {
      setAiProcessing(true);
      
      // محاكاة معالجة AI (سيتم استبدالها بـ API حقيقي لاحقاً)
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const mockAIResults = {
        ai_sentiment: sentimentOptions[Math.floor(Math.random() * (sentimentOptions.length - 1)) + 1].value,
        ai_compatibility_score: Math.floor(Math.random() * 40) + 60, // بين 60-100
        ai_summary: `ملخص ذكي للمقال: ${formData.title.substring(0, 100)}...`,
        ai_keywords: ['كلمة مفتاحية 1', 'كلمة مفتاحية 2', 'كلمة مفتاحية 3'],
        ai_mood: 'إيجابي',
        excerpt: formData.content.substring(0, 200) + '...'
      };

      setFormData(prev => ({ ...prev, ...mockAIResults }));
      
    } catch (error) {
      console.error('خطأ في معالجة AI:', error);
      alert('حدث خطأ في معالجة المحتوى بالذكاء الاصطناعي');
    } finally {
      setAiProcessing(false);
    }
  };

  const validateForm = () => {
    const required = ['corner_id', 'title', 'content'];
    const missing = required.filter(field => !formData[field as keyof FormData]);
    
    if (missing.length > 0) {
      alert(`يرجى ملء الحقول المطلوبة: ${missing.join(', ')}`);
      return false;
    }

    return true;
  };

  const handleSubmit = async (status: string) => {
    if (!validateForm()) return;

    try {
      setLoading(true);
      
      const submitData = { ...formData, status };
      
      const response = await fetch('/api/admin/muqtarab/articles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
      });

      if (response.ok) {
        const successMessage = status === 'published' ? 'تم نشر المقال بنجاح' : 'تم حفظ المقال كمسودة';
        router.push(`/admin/muqtarab/articles?success=${status}&message=${successMessage}`);
      } else {
        const error = await response.json();
        alert(error.error || 'حدث خطأ في حفظ المقال');
      }
    } catch (error) {
      console.error('خطأ في حفظ المقال:', error);
      alert('حدث خطأ في حفظ المقال');
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
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">كتابة مقال جديد</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              إنشاء مقال إبداعي جديد في منصة مُقترَب
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* العمود الرئيسي - المحرر */}
          <div className="lg:col-span-3 space-y-6">
            {/* المعلومات الأساسية */}
            <Card>
              <CardHeader>
                <CardTitle>المعلومات الأساسية</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="corner_id">الزاوية *</Label>
                  <Select 
                    value={formData.corner_id} 
                    onValueChange={(value) => handleInputChange('corner_id', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="اختر الزاوية" />
                    </SelectTrigger>
                    <SelectContent>
                      {corners.map((corner) => (
                        <SelectItem key={corner.id} value={corner.id}>
                          {corner.name} - {corner.author_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="title">عنوان المقال *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => handleInputChange('title', e.target.value)}
                      placeholder="عنوان جذاب للمقال..."
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="slug">رابط المقال</Label>
                    <Input
                      id="slug"
                      value={formData.slug}
                      onChange={(e) => handleInputChange('slug', e.target.value)}
                      placeholder="article-slug"
                      dir="ltr"
                    />
                  </div>
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

            {/* محرر المحتوى */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>محتوى المقال *</CardTitle>
                  <Button 
                    onClick={processWithAI}
                    disabled={aiProcessing || !formData.content}
                    variant="outline"
                    size="sm"
                  >
                    {aiProcessing ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 ml-2"></div>
                        معالجة AI...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 ml-2" />
                        معالجة بالذكاء الاصطناعي
                      </>
                    )}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  value={formData.content}
                  onChange={(e) => handleInputChange('content', e.target.value)}
                  placeholder="اكتب محتوى المقال هنا... يمكنك استخدام الذكاء الاصطناعي لتحليل المحتوى وتوليد الملخص والكلمات المفتاحية تلقائياً."
                  rows={20}
                  className="min-h-[500px] font-mono"
                  required
                />
                
                {formData.content && (
                  <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>وقت القراءة: {formData.read_time} دقيقة</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Eye className="w-4 h-4" />
                      <span>عدد الكلمات: {formData.content.split(/\s+/).length}</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* النتائج المُحسنة بالذكاء الاصطناعي */}
            {(formData.ai_summary || formData.ai_sentiment) && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="w-5 h-5 text-blue-600" />
                    التحليل الذكي
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {formData.ai_summary && (
                    <div>
                      <Label htmlFor="excerpt">الملخص المُحسن</Label>
                      <Textarea
                        id="excerpt"
                        value={formData.excerpt}
                        onChange={(e) => handleInputChange('excerpt', e.target.value)}
                        rows={3}
                        placeholder="ملخص مختصر للمقال..."
                      />
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="ai_sentiment">نمط المحتوى</Label>
                      <Select 
                        value={formData.ai_sentiment} 
                        onValueChange={(value) => handleInputChange('ai_sentiment', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="اختر النمط" />
                        </SelectTrigger>
                        <SelectContent>
                          {sentimentOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="ai_compatibility_score">نسبة التوافق مع الجمهور</Label>
                      <Input
                        id="ai_compatibility_score"
                        type="number"
                        min="0"
                        max="100"
                        value={formData.ai_compatibility_score}
                        onChange={(e) => handleInputChange('ai_compatibility_score', parseInt(e.target.value) || 0)}
                        placeholder="85"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="tags">الكلمات المفتاحية</Label>
                    <Input
                      id="tags"
                      value={formData.tags.join(', ')}
                      onChange={(e) => handleTagsChange(e.target.value)}
                      placeholder="كلمة1, كلمة2, كلمة3"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      افصل بين الكلمات بفاصلة
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* الشريط الجانبي */}
          <div className="space-y-6">
            {/* معلومات الكاتب */}
            <Card>
              <CardHeader>
                <CardTitle>معلومات الكاتب</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="author_name">اسم الكاتب</Label>
                  <Input
                    id="author_name"
                    value={formData.author_name}
                    onChange={(e) => handleInputChange('author_name', e.target.value)}
                    placeholder="اسم الكاتب"
                  />
                  {selectedCorner && (
                    <p className="text-xs text-gray-500 mt-1">
                      الافتراضي: {selectedCorner.author_name}
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="author_bio">نبذة عن الكاتب</Label>
                  <Textarea
                    id="author_bio"
                    value={formData.author_bio}
                    onChange={(e) => handleInputChange('author_bio', e.target.value)}
                    rows={2}
                    placeholder="نبذة مختصرة..."
                  />
                </div>
              </CardContent>
            </Card>

            {/* إعدادات النشر */}
            <Card>
              <CardHeader>
                <CardTitle>إعدادات النشر</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="is_featured">مقال مميز</Label>
                  <Switch
                    id="is_featured"
                    checked={formData.is_featured}
                    onCheckedChange={(checked) => handleInputChange('is_featured', checked)}
                  />
                </div>
                
                <div>
                  <Label htmlFor="publish_at">تاريخ النشر المجدول</Label>
                  <Input
                    id="publish_at"
                    type="datetime-local"
                    value={formData.publish_at}
                    onChange={(e) => handleInputChange('publish_at', e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>

            {/* أزرار الحفظ */}
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-3">
                  <Button 
                    onClick={() => handleSubmit('published')}
                    className="w-full"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white ml-2"></div>
                        جاري النشر...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 ml-2" />
                        نشر المقال
                      </>
                    )}
                  </Button>
                  
                  <Button 
                    variant="outline"
                    onClick={() => handleSubmit('draft')}
                    className="w-full"
                    disabled={loading}
                  >
                    <Save className="w-4 h-4 ml-2" />
                    حفظ كمسودة
                  </Button>
                  
                  <Button 
                    variant="ghost" 
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
      </div>
  );
}