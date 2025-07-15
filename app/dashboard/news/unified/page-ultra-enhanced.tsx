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
  Star, CheckSquare, Schedule
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

export default function UnifiedNewsCreatePageUltraEnhanced() {
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
    
    setCompletionScore(Math.min(score, 100));
  }, [formData]);

  // تحديث نسبة الاكتمال عند تغيير البيانات
  useEffect(() => {
    calculateCompletion();
  }, [calculateCompletion]);

  // تحميل البيانات الأولية
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setLoading(true);
        
        // تحميل التصنيفات
        const categoriesResponse = await fetch('/api/categories');
        if (categoriesResponse.ok) {
          const categoriesData = await categoriesResponse.json();
          setCategories(categoriesData.categories || []);
        }
        
        // تحميل المؤلفين
        const authorsResponse = await fetch('/api/authors');
        if (authorsResponse.ok) {
          const authorsData = await authorsResponse.json();
          setAuthors(authorsData.authors || []);
        }
        
      } catch (error) {
        console.error('خطأ في تحميل البيانات:', error);
        toast.error('فشل في تحميل البيانات الأولية');
      } finally {
        setLoading(false);
      }
    };
    
    loadInitialData();
  }, []);

  // حفظ المقال
  const handleSave = async (status: 'draft' | 'published') => {
    try {
      setSaving(true);
      
      if (!formData.title || !formData.content) {
        toast.error('يرجى إدخال العنوان والمحتوى على الأقل');
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
      
      const response = await fetch('/api/articles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(articleData)
      });
      
      if (response.ok) {
        const result = await response.json();
        setMessage({
          type: 'success',
          text: status === 'draft' 
            ? 'تم حفظ المسودة بنجاح' 
            : formData.publishType === 'scheduled' 
              ? 'تم جدولة المقال للنشر بنجاح'
              : 'تم نشر المقال بنجاح'
        });
        
        setTimeout(() => {
          router.push('/dashboard/news');
        }, 1500);
      } else {
        throw new Error('فشل في الحفظ');
      }
      
    } catch (error) {
      console.error('خطأ في الحفظ:', error);
      setMessage({
        type: 'error',
        text: 'حدث خطأ أثناء الحفظ'
      });
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
          context: {
            title: formData.title,
            excerpt: formData.excerpt,
            content: formData.content
          }
        })
      });
      
      if (response.ok) {
        const suggestion = await response.json();
        
        if (field === 'keywords') {
          setFormData(prev => ({ 
            ...prev, 
            keywords: [...prev.keywords, ...suggestion.keywords] 
          }));
        } else {
          setFormData(prev => ({ 
            ...prev, 
            [field]: suggestion.text 
          }));
        }
        
        toast.success('تم إنشاء الاقتراح بنجاح');
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
        size={position === 'bottom' ? 'lg' : 'sm'}
        className={cn(
          "gap-2 shadow-md hover:shadow-lg transition-all",
          darkMode ? "bg-slate-700 hover:bg-slate-600 text-white border-slate-600" : "bg-white hover:bg-slate-50 border-slate-300"
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
        size={position === 'bottom' ? 'lg' : 'sm'}
        className={cn(
          "gap-2 shadow-md hover:shadow-lg transition-all",
          darkMode ? "bg-blue-700 hover:bg-blue-600 text-white border-blue-600" : "bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-300"
        )}
      >
        <CheckSquare className="w-4 h-4" />
        طلب مراجعة
      </Button>
      
      <Button
        onClick={() => handleSave('published')}
        disabled={saving || completionScore < 60}
        size={position === 'bottom' ? 'lg' : 'sm'}
        className={cn(
          "gap-2 shadow-md hover:shadow-lg transition-all",
          darkMode ? "bg-emerald-700 hover:bg-emerald-600" : "bg-emerald-600 hover:bg-emerald-700",
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
            {formData.publishType === 'scheduled' ? (
              <>
                <Schedule className="w-4 h-4" />
                جدولة النشر
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                نشر فوري
              </>
            )}
          </>
        )}
      </Button>
    </div>
  );
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-700">
        <div className="text-center space-y-4">
          <Loader2 className="w-10 h-10 animate-spin mx-auto text-blue-600" />
          <p className="text-slate-600 dark:text-slate-400">جاري تحميل البيانات...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className={cn(
      "min-h-screen transition-all duration-300",
      darkMode 
        ? "bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700" 
        : "bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100"
    )}>
      <div className="p-4 md:p-6">
        {/* رأس الصفحة */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/dashboard/news')}
              className={cn(
                "gap-2 shadow-sm hover:shadow-md transition-all",
                darkMode ? "bg-slate-800 hover:bg-slate-700" : "bg-white/70 hover:bg-white"
              )}
            >
              <Home className="w-4 h-4" />
              العودة للأخبار
            </Button>
            <ChevronRight className="w-4 h-4 text-slate-400" />
            <h1 className={cn(
              "text-2xl font-bold",
              darkMode ? "text-white" : "text-slate-800"
            )}>خبر جديد</h1>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="w-32">
              <Progress value={completionScore} className="h-2" />
              <p className="text-xs text-slate-500 mt-1">{completionScore}% مكتمل</p>
            </div>
            
            <PublishButtons position="top" />
          </div>
        </div>
        
        {/* رسالة النجاح أو الخطأ */}
        {message.type && (
          <Alert className={cn(
            "mb-4 shadow-lg",
            message.type === 'success' 
              ? "border-emerald-200 bg-emerald-50 dark:bg-emerald-900/20" 
              : "border-red-200 bg-red-50 dark:bg-red-900/20"
          )}>
            {message.type === 'success' ? (
              <CheckCircle className="h-4 w-4 text-emerald-600" />
            ) : (
              <AlertCircle className="h-4 w-4 text-red-600" />
            )}
            <AlertDescription className={cn(
              "text-sm font-medium",
              message.type === 'success' ? "text-emerald-800" : "text-red-800"
            )}>
              {message.text}
            </AlertDescription>
          </Alert>
        )}
        
        {/* المحتوى الرئيسي */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* القسم الرئيسي (75%) */}
          <div className="lg:col-span-3 space-y-6">
            {/* العنوان والموجز */}
            <Card className={cn(
              "shadow-lg border-0 backdrop-blur-sm",
              darkMode ? 'bg-slate-800/90' : 'bg-white/90'
            )}>
              <CardContent className="p-6 space-y-6">
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
                      "text-lg font-semibold shadow-sm",
                      darkMode ? "bg-slate-700 border-slate-600" : "bg-white border-slate-200"
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
                    className={cn(
                      "shadow-sm",
                      darkMode ? "bg-slate-700 border-slate-600" : "bg-white border-slate-200"
                    )}
                  />
                </div>
                
                <div>
                  <Label htmlFor="excerpt" className="text-sm font-medium mb-2 flex items-center gap-2">
                    موجز الخبر *
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
                    placeholder="اكتب موجزاً مختصراً للخبر..."
                    rows={3}
                    className={cn(
                      "shadow-sm",
                      darkMode ? "bg-slate-700 border-slate-600" : "bg-white border-slate-200"
                    )}
                  />
                </div>
              </CardContent>
            </Card>
            
            {/* محرر المحتوى */}
            <Card className={cn(
              "shadow-lg border-0 backdrop-blur-sm",
              darkMode ? 'bg-slate-800/90' : 'bg-white/90'
            )}>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  محتوى الخبر *
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className={cn(
                  "min-h-[400px] rounded-lg",
                  darkMode ? "bg-slate-700" : "bg-slate-50"
                )}>
                  <Editor
                    ref={editorRef}
                    content={formData.content}
                    onChange={(content) => setFormData(prev => ({ ...prev, content }))}
                    placeholder="ابدأ في كتابة محتوى الخبر..."
                  />
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* الشريط الجانبي (25%) */}
          <div className="space-y-6">
            {/* نوع الخبر */}
            <Card className={cn(
              "shadow-lg border-0 backdrop-blur-sm",
              darkMode ? 'bg-red-900/20 border-red-800' : 'bg-red-50/90 border-red-200'
            )}>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Zap className="w-4 h-4" />
                  نوع الخبر
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <label className={cn(
                    "flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all shadow-sm",
                    formData.isBreaking
                      ? darkMode ? "bg-red-800/50 border-2 border-red-500" : "bg-red-100 border-2 border-red-500"
                      : darkMode ? "bg-slate-700 hover:bg-slate-600 border-2 border-transparent" : "bg-white hover:bg-slate-50 border-2 border-slate-200"
                  )}>
                    <input
                      type="checkbox"
                      checked={formData.isBreaking}
                      onChange={(e) => setFormData(prev => ({ ...prev, isBreaking: e.target.checked }))}
                      className="text-red-600"
                    />
                    <Zap className={cn(
                      "w-5 h-5",
                      formData.isBreaking ? "text-red-600" : "text-slate-400"
                    )} />
                    <span className="font-medium text-red-600">عاجل</span>
                  </label>
                  
                  <label className={cn(
                    "flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all shadow-sm",
                    formData.isFeatured
                      ? darkMode ? "bg-yellow-800/50 border-2 border-yellow-500" : "bg-yellow-100 border-2 border-yellow-500"
                      : darkMode ? "bg-slate-700 hover:bg-slate-600 border-2 border-transparent" : "bg-white hover:bg-slate-50 border-2 border-slate-200"
                  )}>
                    <input
                      type="checkbox"
                      checked={formData.isFeatured}
                      onChange={(e) => setFormData(prev => ({ ...prev, isFeatured: e.target.checked }))}
                      className="text-yellow-600"
                    />
                    <Star className={cn(
                      "w-5 h-5",
                      formData.isFeatured ? "text-yellow-600" : "text-slate-400"
                    )} />
                    <span className="font-medium text-yellow-600">مميز</span>
                  </label>
                </div>
              </CardContent>
            </Card>
            
            {/* المؤلف والتصنيف */}
            <Card className={cn(
              "shadow-lg border-0 backdrop-blur-sm",
              darkMode ? 'bg-slate-800/90 border-slate-700' : 'bg-slate-50/90 border-slate-200'
            )}>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <User className="w-4 h-4" />
                  المؤلف والتصنيف
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="author" className="text-sm mb-2">المؤلف *</Label>
                  <select
                    id="author"
                    value={formData.authorId}
                    onChange={(e) => setFormData(prev => ({ ...prev, authorId: e.target.value }))}
                    className={cn(
                      "w-full p-2 border rounded-lg shadow-sm",
                      darkMode ? "bg-slate-700 border-slate-600 text-white" : "bg-white border-slate-200"
                    )}
                  >
                    <option value="">اختر المؤلف</option>
                    {authors.map((author) => (
                      <option key={author.id} value={author.id}>
                        {author.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <Label htmlFor="category" className="text-sm mb-2">التصنيف *</Label>
                  <select
                    id="category"
                    value={formData.categoryId}
                    onChange={(e) => setFormData(prev => ({ ...prev, categoryId: e.target.value }))}
                    className={cn(
                      "w-full p-2 border rounded-lg shadow-sm",
                      darkMode ? "bg-slate-700 border-slate-600 text-white" : "bg-white border-slate-200"
                    )}
                  >
                    <option value="">اختر التصنيف</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name_ar || category.name}
                      </option>
                    ))}
                  </select>
                </div>
              </CardContent>
            </Card>
            
            {/* طريقة النشر - محسنة ومميزة */}
            <Card className={cn(
              "shadow-lg border-0 backdrop-blur-sm ring-2 ring-blue-200/50",
              darkMode ? 'bg-blue-900/20 border-blue-800' : 'bg-blue-50/90 border-blue-200'
            )}>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-blue-600" />
                  <span className="text-blue-600">طريقة النشر</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <label className={cn(
                    "flex items-center gap-3 p-4 rounded-xl cursor-pointer transition-all shadow-md hover:shadow-lg",
                    formData.publishType === 'now'
                      ? darkMode ? "bg-emerald-800/70 border-2 border-emerald-400 ring-2 ring-emerald-400/30" : "bg-emerald-100 border-2 border-emerald-500 ring-2 ring-emerald-200"
                      : darkMode ? "bg-slate-700 hover:bg-slate-600 border-2 border-slate-600" : "bg-white hover:bg-slate-50 border-2 border-slate-200"
                  )}>
                    <input
                      type="radio"
                      name="publish-type"
                      value="now"
                      checked={formData.publishType === 'now'}
                      onChange={() => setFormData(prev => ({ ...prev, publishType: 'now' }))}
                      className="text-emerald-600 scale-110"
                    />
                    <Send className={cn(
                      "w-5 h-5",
                      formData.publishType === 'now' ? "text-emerald-600" : "text-slate-400"
                    )} />
                    <div>
                      <span className="font-semibold">نشر فوري</span>
                      <p className="text-sm text-slate-500">نشر المقال فوراً</p>
                    </div>
                  </label>
                  
                  <label className={cn(
                    "flex items-center gap-3 p-4 rounded-xl cursor-pointer transition-all shadow-md hover:shadow-lg",
                    formData.publishType === 'scheduled'
                      ? darkMode ? "bg-blue-800/70 border-2 border-blue-400 ring-2 ring-blue-400/30" : "bg-blue-100 border-2 border-blue-500 ring-2 ring-blue-200"
                      : darkMode ? "bg-slate-700 hover:bg-slate-600 border-2 border-slate-600" : "bg-white hover:bg-slate-50 border-2 border-slate-200"
                  )}>
                    <input
                      type="radio"
                      name="publish-type"
                      value="scheduled"
                      checked={formData.publishType === 'scheduled'}
                      onChange={() => setFormData(prev => ({ ...prev, publishType: 'scheduled' }))}
                      className="text-blue-600 scale-110"
                    />
                    <Schedule className={cn(
                      "w-5 h-5",
                      formData.publishType === 'scheduled' ? "text-blue-600" : "text-slate-400"
                    )} />
                    <div>
                      <span className="font-semibold">نشر مجدول</span>
                      <p className="text-sm text-slate-500">تحديد وقت النشر</p>
                    </div>
                  </label>
                  
                  {formData.publishType === 'scheduled' && (
                    <div className={cn(
                      "mt-4 p-4 rounded-xl shadow-inner transition-all duration-300",
                      darkMode ? "bg-slate-800/50" : "bg-white/70"
                    )}>
                      <Label htmlFor="scheduled-date" className="text-sm mb-3 flex items-center gap-2">
                        <Clock className="w-4 h-4 text-blue-600" />
                        التاريخ والوقت
                      </Label>
                      <Input
                        id="scheduled-date"
                        type="datetime-local"
                        value={formData.scheduledDate}
                        onChange={(e) => setFormData(prev => ({ ...prev, scheduledDate: e.target.value }))}
                        className={cn(
                          "text-sm shadow-sm border-2",
                          darkMode ? "bg-slate-700 border-slate-600" : "bg-white border-blue-200"
                        )}
                        min={new Date().toISOString().slice(0, 16)}
                      />
                      {formData.scheduledDate && (
                        <p className="text-xs text-blue-600 mt-2">
                          سيتم النشر في: {new Date(formData.scheduledDate).toLocaleString('ar-SA')}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
            
            {/* الصورة المميزة */}
            <Card className={cn(
              "shadow-lg border-0 backdrop-blur-sm",
              darkMode ? 'bg-purple-900/20 border-purple-800' : 'bg-purple-50/90 border-purple-200'
            )}>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <ImageIcon className="w-4 h-4" />
                  الصورة المميزة
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Input
                    placeholder="رابط الصورة"
                    value={formData.featuredImage}
                    onChange={(e) => setFormData(prev => ({ ...prev, featuredImage: e.target.value }))}
                    className={cn(
                      "shadow-sm",
                      darkMode ? "bg-slate-700 border-slate-600" : "bg-white border-slate-200"
                    )}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    className={cn(
                      "w-full gap-2 shadow-sm",
                      darkMode ? "bg-slate-700 hover:bg-slate-600" : "bg-white hover:bg-slate-50"
                    )}
                  >
                    <Upload className="w-4 h-4" />
                    رفع صورة
                  </Button>
                  {formData.featuredImage && (
                    <div className="mt-3">
                      <img
                        src={formData.featuredImage}
                        alt="معاينة"
                        className="w-full h-32 object-cover rounded-lg shadow-md"
                      />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
            
            {/* الكلمات المفتاحية */}
            <Card className={cn(
              "shadow-lg border-0 backdrop-blur-sm",
              darkMode ? 'bg-orange-900/20 border-orange-800' : 'bg-orange-50/90 border-orange-200'
            )}>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Tag className="w-4 h-4" />
                  الكلمات المفتاحية
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => suggestWithAI('keywords')}
                    disabled={isAILoading || !formData.title}
                    className="h-6 px-2 gap-1 ml-auto"
                  >
                    <Sparkles className="w-3 h-3" />
                    اقتراح
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <Input
                      placeholder="أضف كلمة مفتاحية"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          const target = e.target as HTMLInputElement;
                          const keyword = target.value.trim();
                          if (keyword && !formData.keywords.includes(keyword)) {
                            setFormData(prev => ({
                              ...prev,
                              keywords: [...prev.keywords, keyword]
                            }));
                            target.value = '';
                          }
                        }
                      }}
                      className={cn(
                        "shadow-sm",
                        darkMode ? "bg-slate-700 border-slate-600" : "bg-white border-slate-200"
                      )}
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      className={cn(
                        "shadow-sm",
                        darkMode ? "bg-slate-700 hover:bg-slate-600" : "bg-white hover:bg-slate-50"
                      )}
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    {formData.keywords.map((keyword, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className={cn(
                          "gap-1 shadow-sm",
                          darkMode ? "bg-slate-700 text-white" : "bg-slate-100 text-slate-700"
                        )}
                      >
                        {keyword}
                        <X
                          className="w-3 h-3 cursor-pointer hover:text-red-500"
                          onClick={() => setFormData(prev => ({
                            ...prev,
                            keywords: prev.keywords.filter((_, i) => i !== index)
                          }))}
                        />
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        
        {/* أزرار النشر أسفل الصفحة */}
        <div className="mt-8 flex justify-center">
          <div className={cn(
            "p-4 rounded-xl shadow-lg backdrop-blur-sm",
            darkMode ? "bg-slate-800/90" : "bg-white/90"
          )}>
            <PublishButtons position="bottom" />
          </div>
        </div>
      </div>
      
      <Toaster 
        position="top-center"
        toastOptions={{
          duration: 3000,
          style: {
            background: darkMode ? '#1e293b' : '#ffffff',
            color: darkMode ? '#ffffff' : '#1e293b',
          },
        }}
      />
    </div>
  );
} 