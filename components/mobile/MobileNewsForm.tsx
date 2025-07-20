'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { useDarkModeContext } from '@/contexts/DarkModeContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import MobileDashboardLayout from '@/components/mobile/MobileDashboardLayout';
import { 
  Save, Send, Eye, Clock, Image as ImageIcon, Upload, X, 
  Tag, User, Calendar, AlertCircle, CheckCircle, Loader2,
  Sparkles, FileText, Settings, ChevronDown, ChevronUp,
  Globe, TrendingUp, BookOpen, Star, Zap, Edit
} from 'lucide-react';
import { cn } from '@/lib/utils';
import dynamic from 'next/dynamic';

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

interface MobileNewsFormProps {
  articleId?: string;
  initialData?: any;
}

// مكون البطاقة القابلة للطي
const CollapsibleCard = ({ 
  title, 
  icon, 
  children, 
  defaultOpen = true,
  required = false,
  completed = false 
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
  required?: boolean;
  completed?: boolean;
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const { darkMode } = useDarkModeContext();

  return (
    <Card className={`
      mb-4 transition-all duration-300
      ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}
      ${completed ? 'ring-2 ring-green-500 ring-opacity-20' : ''}
      ${required && !completed ? 'ring-2 ring-red-500 ring-opacity-20' : ''}
    `}>
      <CardHeader 
        className="pb-3 cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`
              w-8 h-8 rounded-lg flex items-center justify-center
              ${completed 
                ? 'bg-green-500 text-white' 
                : required 
                  ? 'bg-red-500 text-white'
                  : darkMode 
                    ? 'bg-gray-700 text-gray-300' 
                    : 'bg-gray-100 text-gray-600'
              }
            `}>
              {completed ? <CheckCircle className="w-4 h-4" /> : icon}
            </div>
            <div>
              <h3 className={`font-semibold text-sm ${
                darkMode ? 'text-white' : 'text-gray-900'
              }`}>
                {title}
                {required && <span className="text-red-500 mr-1">*</span>}
              </h3>
              {completed && (
                <p className="text-xs text-green-600 dark:text-green-400">
                  مكتمل ✓
                </p>
              )}
            </div>
          </div>
          <button className={`
            p-1 rounded transition-colors
            ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}
          `}>
            {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </CardHeader>
      
      {isOpen && (
        <CardContent className="pt-0">
          {children}
        </CardContent>
      )}
    </Card>
  );
};

export default function MobileNewsForm({ articleId, initialData }: MobileNewsFormProps) {
  const router = useRouter();
  const { darkMode } = useDarkModeContext();
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
  }, [calculateCompletion]);

  // تحميل البيانات الأولية
  useEffect(() => {
    const loadData = async () => {
      try {
        const [categoriesRes, authorsRes] = await Promise.all([
          fetch('/api/categories'),
          fetch('/api/authors')
        ]);

        if (categoriesRes.ok) {
          const categoriesData = await categoriesRes.json();
          setCategories(categoriesData.categories || []);
        }

        if (authorsRes.ok) {
          const authorsData = await authorsRes.json();
          setAuthors(authorsData.authors || []);
        }

        // تحميل بيانات المقال للتحرير
        if (articleId && initialData) {
          setFormData({
            ...formData,
            ...initialData
          });
        }

      } catch (error) {
        console.error('خطأ في تحميل البيانات:', error);
        toast.error('خطأ في تحميل البيانات');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [articleId]);

  // حفظ المقال
  const handleSave = async (status: 'draft' | 'published') => {
    try {
      setSaving(true);
      
      if (!formData.title || !formData.content) {
        toast.error('العنوان والمحتوى مطلوبان');
        return;
      }
      
      const articleData = {
        ...formData,
        content: editorRef.current?.getContent() || formData.content,
        status,
        ...(status === 'published' && formData.publishType === 'scheduled' && formData.scheduledDate && {
          scheduled_for: formData.scheduledDate
        })
      };
      
      const response = await fetch(articleId ? `/api/articles/${articleId}` : '/api/articles', {
        method: articleId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(articleData)
      });
      
      if (response.ok) {
        toast.success(
          status === 'draft' 
            ? 'تم حفظ المسودة بنجاح' 
            : formData.publishType === 'scheduled' 
              ? 'تم جدولة المقال للنشر بنجاح'
              : 'تم نشر المقال بنجاح'
        );
        
        setTimeout(() => {
          router.push('/dashboard/news');
        }, 1500);
      } else {
        throw new Error('فشل في الحفظ');
      }
      
    } catch (error) {
      console.error('خطأ في الحفظ:', error);
      toast.error('حدث خطأ أثناء الحفظ');
    } finally {
      setSaving(false);
    }
  };

  // اقتراحات الذكاء الاصطناعي
  const suggestWithAI = async (field: 'title' | 'excerpt' | 'keywords') => {
    try {
      setIsAILoading(true);
      
      const response = await fetch('/api/ai/suggestions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          field,
          content: formData.content,
          title: formData.title
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        
        if (field === 'title') {
          setFormData(prev => ({ ...prev, title: data.suggestion }));
        } else if (field === 'excerpt') {
          setFormData(prev => ({ ...prev, excerpt: data.suggestion }));
        } else if (field === 'keywords') {
          setFormData(prev => ({ ...prev, keywords: data.suggestions || [] }));
        }
        
        toast.success('تم الاقتراح بنجاح');
      }
    } catch (error) {
      console.error('خطأ في الاقتراح:', error);
      toast.error('فشل في الحصول على الاقتراح');
    } finally {
      setIsAILoading(false);
    }
  };

  if (loading) {
    return (
      <MobileDashboardLayout title="تحميل...">
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className={`
              h-24 rounded-lg animate-pulse
              ${darkMode ? 'bg-gray-800' : 'bg-gray-200'}
            `} />
          ))}
        </div>
      </MobileDashboardLayout>
    );
  }

  return (
    <MobileDashboardLayout 
      title={articleId ? 'تحرير المقال' : 'إنشاء مقال جديد'}
    >
      <div className="space-y-4">
        {/* شريط التقدم */}
        <Card className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                مستوى الاكتمال
              </span>
              <span className={`text-sm font-bold ${
                completionScore >= 80 
                  ? 'text-green-600' 
                  : completionScore >= 50 
                    ? 'text-yellow-600' 
                    : 'text-red-600'
              }`}>
                {completionScore}%
              </span>
            </div>
            <Progress value={completionScore} className="h-2" />
          </CardContent>
        </Card>

        {/* الأساسيات */}
        <CollapsibleCard
          title="المعلومات الأساسية"
          icon={<FileText className="w-4 h-4" />}
          required={true}
          completed={!!(formData.title && formData.excerpt)}
        >
          <div className="space-y-4">
            <div>
              <Label htmlFor="title" className="flex items-center gap-2 mb-2">
                عنوان المقال *
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => suggestWithAI('title')}
                  disabled={isAILoading || !formData.content}
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
                placeholder="اكتب عنواناً جذاباً للمقال..."
                className={cn(
                  "text-base",
                  darkMode ? "bg-slate-700 border-slate-600" : "bg-white border-slate-200"
                )}
              />
            </div>

            <div>
              <Label htmlFor="subtitle" className="mb-2">العنوان الفرعي</Label>
              <Input
                id="subtitle"
                value={formData.subtitle}
                onChange={(e) => setFormData(prev => ({ ...prev, subtitle: e.target.value }))}
                placeholder="عنوان فرعي اختياري..."
                className={cn(
                  darkMode ? "bg-slate-700 border-slate-600" : "bg-white border-slate-200"
                )}
              />
            </div>

            <div>
              <Label htmlFor="excerpt" className="flex items-center gap-2 mb-2">
                موجز المقال *
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
                placeholder="اكتب موجزاً مختصراً للمقال..."
                rows={3}
                className={cn(
                  "resize-none",
                  darkMode ? "bg-slate-700 border-slate-600" : "bg-white border-slate-200"
                )}
              />
            </div>
          </div>
        </CollapsibleCard>

        {/* المحتوى */}
        <CollapsibleCard
          title="محتوى المقال"
          icon={<Edit className="w-4 h-4" />}
          required={true}
          completed={!!formData.content}
        >
          <div>
            <Label className="mb-2">المحتوى *</Label>
            <div className={`
              min-h-[300px] rounded-lg border
              ${darkMode ? 'border-gray-600' : 'border-gray-300'}
            `}>
              <Editor
                ref={editorRef}
                content={formData.content}
                onChange={(content) => setFormData(prev => ({ ...prev, content }))}
                placeholder="اكتب محتوى المقال هنا..."
              />
            </div>
          </div>
        </CollapsibleCard>

        {/* التصنيف والمؤلف */}
        <CollapsibleCard
          title="التصنيف والمؤلف"
          icon={<User className="w-4 h-4" />}
          required={true}
          completed={!!(formData.categoryId && formData.authorId)}
        >
          <div className="space-y-4">
            <div>
              <Label htmlFor="categoryId" className="mb-2">التصنيف *</Label>
              <select
                id="categoryId"
                value={formData.categoryId}
                onChange={(e) => setFormData(prev => ({ ...prev, categoryId: e.target.value }))}
                className={`
                  w-full p-3 rounded-lg border
                  ${darkMode 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-white border-gray-300 text-gray-900'
                  }
                `}
              >
                <option value="">اختر التصنيف...</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name_ar || category.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label htmlFor="authorId" className="mb-2">المؤلف *</Label>
              <select
                id="authorId"
                value={formData.authorId}
                onChange={(e) => setFormData(prev => ({ ...prev, authorId: e.target.value }))}
                className={`
                  w-full p-3 rounded-lg border
                  ${darkMode 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-white border-gray-300 text-gray-900'
                  }
                `}
              >
                <option value="">اختر المؤلف...</option>
                {authors.map((author) => (
                  <option key={author.id} value={author.id}>
                    {author.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CollapsibleCard>

        {/* الصورة المميزة */}
        <CollapsibleCard
          title="الصورة المميزة"
          icon={<ImageIcon className="w-4 h-4" />}
          defaultOpen={false}
          completed={!!formData.featuredImage}
        >
          <div>
            <Label htmlFor="featuredImage" className="mb-2">رابط الصورة المميزة</Label>
            <Input
              id="featuredImage"
              value={formData.featuredImage}
              onChange={(e) => setFormData(prev => ({ ...prev, featuredImage: e.target.value }))}
              placeholder="https://example.com/image.jpg"
              className={cn(
                darkMode ? "bg-slate-700 border-slate-600" : "bg-white border-slate-200"
              )}
            />
            {formData.featuredImage && (
              <div className="mt-3">
                <img
                  src={formData.featuredImage}
                  alt="معاينة"
                  className="w-full h-32 object-cover rounded-lg"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>
            )}
          </div>
        </CollapsibleCard>

        {/* الخيارات المتقدمة */}
        <CollapsibleCard
          title="الخيارات المتقدمة"
          icon={<Settings className="w-4 h-4" />}
          defaultOpen={false}
        >
          <div className="space-y-4">
            {/* خيارات النشر */}
            <div className="flex flex-wrap gap-3">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.isBreaking}
                  onChange={(e) => setFormData(prev => ({ ...prev, isBreaking: e.target.checked }))}
                  className="rounded"
                />
                <span className="text-sm">خبر عاجل</span>
                <Zap className="w-4 h-4 text-red-500" />
              </label>
              
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.isFeatured}
                  onChange={(e) => setFormData(prev => ({ ...prev, isFeatured: e.target.checked }))}
                  className="rounded"
                />
                <span className="text-sm">مقال مميز</span>
                <Star className="w-4 h-4 text-yellow-500" />
              </label>
            </div>

            {/* كلمات مفتاحية */}
            <div>
              <Label className="flex items-center gap-2 mb-2">
                الكلمات المفتاحية
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => suggestWithAI('keywords')}
                  disabled={isAILoading || !formData.content}
                  className="h-6 px-2 gap-1"
                >
                  <Sparkles className="w-3 h-3" />
                  اقتراح
                </Button>
              </Label>
              <div className="flex flex-wrap gap-2 mb-2">
                {formData.keywords.map((keyword, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="flex items-center gap-1"
                  >
                    {keyword}
                    <button
                      onClick={() => {
                        setFormData(prev => ({
                          ...prev,
                          keywords: prev.keywords.filter((_, i) => i !== index)
                        }));
                      }}
                      className="text-red-500 hover:text-red-700"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
              <Input
                placeholder="اضغط Enter لإضافة كلمة مفتاحية..."
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    const value = (e.target as HTMLInputElement).value.trim();
                    if (value && !formData.keywords.includes(value)) {
                      setFormData(prev => ({
                        ...prev,
                        keywords: [...prev.keywords, value]
                      }));
                      (e.target as HTMLInputElement).value = '';
                    }
                  }
                }}
                className={cn(
                  darkMode ? "bg-slate-700 border-slate-600" : "bg-white border-slate-200"
                )}
              />
            </div>
          </div>
        </CollapsibleCard>

        {/* أزرار الحفظ الثابتة */}
        <div className={`
          fixed bottom-16 left-0 right-0 p-4 border-t
          ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}
        `}>
          <div className="flex gap-3">
            <Button
              onClick={() => handleSave('draft')}
              disabled={saving}
              variant="outline"
              className="flex-1"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
              حفظ كمسودة
            </Button>
            
            <Button
              onClick={() => handleSave('published')}
              disabled={saving || !formData.title || !formData.content}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Send className="w-4 h-4 mr-2" />}
              نشر الآن
            </Button>
          </div>
        </div>

        {/* مساحة إضافية للأزرار الثابتة */}
        <div className="h-24"></div>
      </div>
    </MobileDashboardLayout>
  );
}
