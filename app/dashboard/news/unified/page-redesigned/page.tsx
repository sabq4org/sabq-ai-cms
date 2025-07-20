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
import dynamic from 'next/dynamic';
import FeaturedImageUpload from '@/components/FeaturedImageUpload';
import { 
  Save, Send, Eye, Clock, Image as ImageIcon, Upload, X, 
  Tag, User, Calendar, AlertCircle, CheckCircle, Loader2,
  Sparkles, FileText, Settings, Search, Plus, Trash2,
  Globe, TrendingUp, BookOpen, ChevronRight, Home, Zap,
  Star, CheckSquare, Wand2, Hash, Type, Target
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
}

export default function UnifiedNewsCreatePageRedesigned() {
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
    keywordInput: '', // للإدخال الجديد
    seoTitle: '',
    seoDescription: '',
    publishType: 'now' as 'now' | 'scheduled',
    scheduledDate: '',
    isBreaking: false,
    isFeatured: false,
    status: 'draft' as 'draft' | 'published'
  });

  // تحميل البيانات الأساسية
  useEffect(() => {
    const loadData = async () => {
      try {
        const [categoriesRes, authorsRes] = await Promise.all([
          fetch('/api/categories'),
          fetch('/api/team-members')
        ]);

        if (categoriesRes.ok) {
          const categoriesData = await categoriesRes.json();
          setCategories(categoriesData.data || categoriesData.categories || []);
        }

        if (authorsRes.ok) {
          const authorsData = await authorsRes.json();
          setAuthors(authorsData.data || []);
        }
      } catch (error) {
        console.error('Error loading data:', error);
        toast.error('فشل في تحميل البيانات');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // حساب نسبة الاكتمال
  const calculateCompletion = useCallback(() => {
    let score = 0;
    const checks = [
      { field: formData.title, weight: 25 },
      { field: formData.excerpt, weight: 20 },
      { field: formData.content, weight: 25 },
      { field: formData.authorId, weight: 10 },
      { field: formData.categoryId, weight: 10 },
      { field: formData.featuredImage, weight: 5 },
      { field: formData.keywords.length > 0, weight: 5 }
    ];
    
    checks.forEach(check => {
      if (check.field) score += check.weight;
    });
    
    setCompletionScore(Math.min(score, 100));
  }, [formData]);

  useEffect(() => {
    calculateCompletion();
  }, [calculateCompletion]);

  // إضافة كلمة مفتاحية
  const addKeyword = () => {
    if (formData.keywordInput.trim() && !formData.keywords.includes(formData.keywordInput.trim())) {
      setFormData(prev => ({
        ...prev,
        keywords: [...prev.keywords, prev.keywordInput.trim()],
        keywordInput: ''
      }));
    }
  };

  // حذف كلمة مفتاحية
  const removeKeyword = (index: number) => {
    setFormData(prev => ({
      ...prev,
      keywords: prev.keywords.filter((_, i) => i !== index)
    }));
  };

  // دوال التوليد الفردية
  const generateTitle = async () => {
    if (isAILoading) return;

    try {
      setIsAILoading(true);
      let contentText = typeof formData.content === 'string' ? formData.content : '';
      if (editorRef.current?.editor?.getText) {
        const extractedText = editorRef.current.editor.getText();
        if (extractedText) contentText = extractedText;
      }

      if (!contentText.trim()) {
        toast.error('يجب إدخال المحتوى أولاً');
        return;
      }

      const response = await fetch('/api/ai/generate-metadata', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: contentText,
          type: 'title'
        })
      });

      const result = await response.json();
      if (result.success && result.title) {
        setFormData(prev => ({ ...prev, title: result.title }));
        toast.success('تم توليد العنوان بنجاح!');
      }
    } catch (error) {
      toast.error('فشل في توليد العنوان');
    } finally {
      setIsAILoading(false);
    }
  };

  const generateSummary = async () => {
    if (isAILoading) return;

    try {
      setIsAILoading(true);
      let contentText = typeof formData.content === 'string' ? formData.content : '';
      if (editorRef.current?.editor?.getText) {
        const extractedText = editorRef.current.editor.getText();
        if (extractedText) contentText = extractedText;
      }

      if (!contentText.trim()) {
        toast.error('يجب إدخال المحتوى أولاً');
        return;
      }

      const response = await fetch('/api/ai/generate-metadata', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: contentText,
          type: 'summary'
        })
      });

      const result = await response.json();
      if (result.success && result.summary) {
        setFormData(prev => ({ ...prev, excerpt: result.summary }));
        toast.success('تم توليد الموجز بنجاح!');
      }
    } catch (error) {
      toast.error('فشل في توليد الموجز');
    } finally {
      setIsAILoading(false);
    }
  };

  const generateKeywords = async () => {
    if (isAILoading) return;

    try {
      setIsAILoading(true);
      let contentText = typeof formData.content === 'string' ? formData.content : '';
      if (editorRef.current?.editor?.getText) {
        const extractedText = editorRef.current.editor.getText();
        if (extractedText) contentText = extractedText;
      }

      if (!contentText.trim()) {
        toast.error('يجب إدخال المحتوى أولاً');
        return;
      }

      const response = await fetch('/api/ai/generate-metadata', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: contentText,
          type: 'keywords'
        })
      });

      const result = await response.json();
      if (result.success && result.keywords) {
        // تحويل الكلمات المفتاحية إلى مصفوفة إذا كانت نص
        const newKeywords = Array.isArray(result.keywords) 
          ? result.keywords 
          : result.keywords.split(',').map((k: string) => k.trim()).filter((k: string) => k.length > 0);
        
        setFormData(prev => ({ 
          ...prev, 
          keywords: [...prev.keywords, ...newKeywords]
        }));
        toast.success('تم توليد الكلمات المفتاحية بنجاح!');
      } else {
        toast.error(result.error || 'فشل في توليد الكلمات المفتاحية');
      }
    } catch (error) {
      toast.error('فشل في توليد الكلمات المفتاحية');
    } finally {
      setIsAILoading(false);
    }
  };

  // دالة التحقق من صحة المحتوى
  const isContentValid = () => {
    if (typeof formData.content === 'string') {
      return formData.content.trim().length > 0;
    }
    
    // إذا كان المحتوى من محرر rich text
    if (editorRef.current?.editor?.getText) {
      const textContent = editorRef.current.editor.getText();
      return textContent && textContent.trim().length > 0;
    }
    
    return false;
  };

  // حفظ المقال
  const handleSave = async (status: 'draft' | 'published') => {
    // للمسودة: نتطلب العنوان فقط
    // للنشر: نتطلب العنوان والمحتوى والموجز
    if (status === 'published') {
      if (!formData.title.trim()) {
        toast.error('العنوان مطلوب للنشر');
        return;
      }
      if (!formData.excerpt.trim()) {
        toast.error('موجز الخبر مطلوب للنشر');
        return;
      }
      if (!isContentValid()) {
        toast.error('محتوى الخبر مطلوب للنشر');
        return;
      }
    } else {
      // للمسودة: العنوان فقط مطلوب
      if (!formData.title.trim()) {
        toast.error('العنوان مطلوب على الأقل');
        return;
      }
    }

    try {
      setSaving(true);
      
      // استخراج المحتوى من المحرر
      let contentToSave = formData.content;
      if (editorRef.current?.editor?.getHTML) {
        contentToSave = editorRef.current.editor.getHTML();
      }
      
      const articleData = {
        ...formData,
        content: contentToSave,
        status,
        keywords: formData.keywords.join(', '),
        published_at: status === 'published' ? new Date().toISOString() : null
      };

      const response = await fetch('/api/articles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(articleData),
      });

      if (!response.ok) {
        throw new Error(`خطأ HTTP: ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        setMessage({
          type: 'success',
          text: status === 'published' ? 'تم نشر المقال بنجاح!' : 'تم حفظ المسودة بنجاح!'
        });
        
        setTimeout(() => {
          router.push('/dashboard/news');
        }, 2000);
      } else {
        throw new Error(result.error || 'فشل في الحفظ');
      }
    } catch (error) {
      console.error('خطأ في الحفظ:', error);
      setMessage({
        type: 'error',
        text: 'فشل في حفظ المقال'
      });
    } finally {
      setSaving(false);
    }
  };

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
      <div className="p-4 md:p-6 max-w-7xl mx-auto">
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
            )}>✏️ إنشاء خبر جديد</h1>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-center">
              <Progress value={completionScore} className="h-2 w-32" />
              <p className="text-xs text-slate-500 mt-1">{completionScore}% مكتمل</p>
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
                مسودة
              </Button>
              <Button
                onClick={() => handleSave('published')}
                disabled={saving || !formData.title || !formData.excerpt || !isContentValid()}
                size="sm"
                className="gap-2 bg-emerald-600 hover:bg-emerald-700"
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                نشر
              </Button>
            </div>
          </div>
        </div>

        {/* رسالة النجاح أو الخطأ */}
        {message.type && (
          <Alert className={cn(
            "mb-6 shadow-lg",
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

        {/* المحتوى الرئيسي - تخطيط جديد منظم */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* العمود الرئيسي */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* [1] بلوك معلومات العنوان */}
            <Card className={cn(
              "shadow-lg border-0 backdrop-blur-sm",
              darkMode ? 'bg-slate-800/90 border-slate-700' : 'bg-white/90 border-slate-200'
            )}>
              <CardHeader className="pb-4">
                <CardTitle className="text-lg flex items-center gap-2 text-blue-600 dark:text-blue-400">
                  <Type className="w-5 h-5" />
                  📝 معلومات العنوان
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* العنوان الرئيسي */}
                <div>
                  <Label htmlFor="title" className="text-sm font-medium mb-2 flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      العنوان الرئيسي *
                      <span className="text-red-500">●</span>
                    </span>
                    <Button
                      onClick={generateTitle}
                      disabled={isAILoading}
                      size="sm"
                      variant="outline"
                      className="gap-1 text-xs"
                    >
                      {isAILoading ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <Wand2 className="w-3 h-3" />
                      )}
                      توليد العنوان
                    </Button>
                  </Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="أدخل عنوان الخبر الرئيسي..."
                    className={cn(
                      "text-lg font-semibold shadow-sm",
                      darkMode ? "bg-slate-700 border-slate-600" : "bg-white border-slate-200"
                    )}
                  />
                </div>
                
                {/* العنوان الفرعي */}
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
                
                {/* موجز الخبر */}
                <div>
                  <Label htmlFor="excerpt" className="text-sm font-medium mb-2 flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      موجز الخبر *
                      <span className="text-red-500">●</span>
                    </span>
                    <Button
                      onClick={generateSummary}
                      disabled={isAILoading}
                      size="sm"
                      variant="outline"
                      className="gap-1 text-xs"
                    >
                      {isAILoading ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <Wand2 className="w-3 h-3" />
                      )}
                      توليد الموجز
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

            {/* [2] بلوك الكلمات المفتاحية */}
            <Card className={cn(
              "shadow-lg border-0 backdrop-blur-sm",
              darkMode ? 'bg-slate-800/90 border-slate-700' : 'bg-white/90 border-slate-200'
            )}>
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2 text-green-600 dark:text-green-400">
                    <Hash className="w-5 h-5" />
                    🔑 الكلمات المفتاحية
                  </CardTitle>
                  <Button
                    onClick={generateKeywords}
                    disabled={isAILoading}
                    size="sm"
                    variant="outline"
                    className="gap-1 text-xs"
                  >
                    {isAILoading ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <Wand2 className="w-3 h-3" />
                    )}
                    توليد كلمات مفتاحية
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    value={formData.keywordInput}
                    onChange={(e) => setFormData(prev => ({ ...prev, keywordInput: e.target.value }))}
                    placeholder="أدخل كلمة مفتاحية..."
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addKeyword())}
                    className={cn(
                      "flex-1",
                      darkMode ? "bg-slate-700 border-slate-600" : "bg-white border-slate-200"
                    )}
                  />
                  <Button 
                    onClick={addKeyword} 
                    disabled={!formData.keywordInput.trim()}
                    size="sm"
                    className="gap-1"
                  >
                    <Plus className="w-4 h-4" />
                    إضافة
                  </Button>
                </div>
                
                {/* عرض الكلمات المفتاحية */}
                {formData.keywords.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {formData.keywords.map((keyword, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className={cn(
                          "flex items-center gap-1 px-3 py-1",
                          darkMode ? "bg-slate-700 text-slate-200" : "bg-slate-100 text-slate-700"
                        )}
                      >
                        {keyword}
                        <X 
                          className="w-3 h-3 cursor-pointer hover:text-red-500" 
                          onClick={() => removeKeyword(index)}
                        />
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* [3] بلوك محتوى الخبر */}
            <Card className={cn(
              "shadow-lg border-0 backdrop-blur-sm",
              darkMode ? 'bg-slate-800/90 border-slate-700' : 'bg-white/90 border-slate-200'
            )}>
              <CardHeader className="pb-4">
                <CardTitle className="text-lg flex items-center gap-2 text-purple-600 dark:text-purple-400">
                  <FileText className="w-5 h-5" />
                  ✍️ محتوى الخبر
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className={cn(
                  "min-h-[400px] rounded-lg border",
                  darkMode ? "bg-slate-700 border-slate-600" : "bg-slate-50 border-slate-200"
                )}>
                  <Editor
                    ref={editorRef}
                    content={formData.content}
                    onChange={(content) => setFormData(prev => ({ ...prev, content }))}
                    placeholder="ابدأ في كتابة محتوى الخبر..."
                  />
                </div>
                
                {/* تحذير للتوليد التلقائي */}
                <Alert className="mt-4 border-blue-200 bg-blue-50 dark:bg-blue-900/20">
                  <Sparkles className="h-4 w-4 text-blue-600" />
                  <AlertDescription className="text-blue-800 dark:text-blue-200 text-sm">
                    💡 <strong>نصيحة:</strong> اكتب محتوى الخبر أولاً، ثم استخدم أزرار التوليد الفردية لإنشاء العنوان والموجز والكلمات المفتاحية تلقائياً بالذكاء الاصطناعي.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>

            {/* [5] بلوك الصورة المميزة */}
            <Card className={cn(
              "shadow-lg border-0 backdrop-blur-sm",
              darkMode ? 'bg-slate-800/90 border-slate-700' : 'bg-white/90 border-slate-200'
            )}>
              <CardHeader className="pb-4">
                <CardTitle className="text-lg flex items-center gap-2 text-orange-600 dark:text-orange-400">
                  <ImageIcon className="w-5 h-5" />
                  🖼️ الصورة المميزة
                </CardTitle>
              </CardHeader>
              <CardContent>
                <FeaturedImageUpload
                  value={formData.featuredImage}
                  onChange={(url) => setFormData(prev => ({ ...prev, featuredImage: url }))}
                />
              </CardContent>
            </Card>
          </div>

          {/* العمود الجانبي */}
          <div className="space-y-6">
            {/* [4] بلوك إعدادات النشر */}
            <Card className={cn(
              "shadow-lg border-0 backdrop-blur-sm",
              darkMode ? 'bg-slate-800/90 border-slate-700' : 'bg-white/90 border-slate-200'
            )}>
              <CardHeader className="pb-4">
                <CardTitle className="text-lg flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
                  <Settings className="w-5 h-5" />
                  🧩 إعدادات النشر
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                
                {/* نوع الخبر */}
                <div>
                  <Label className="text-sm font-medium mb-2 block">نوع الخبر</Label>
                  <div className="space-y-2">
                    <label className={cn(
                      "flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all border-2",
                      formData.isBreaking
                        ? "border-red-500 bg-red-50 dark:bg-red-900/20"
                        : "border-slate-200 dark:border-slate-600 hover:border-slate-300"
                    )}>
                      <input
                        type="checkbox"
                        checked={formData.isBreaking}
                        onChange={(e) => setFormData(prev => ({ ...prev, isBreaking: e.target.checked }))}
                        className="text-red-600"
                      />
                      <Zap className="w-5 h-5 text-red-500" />
                      <span className="font-medium text-red-600">⚡ عاجل</span>
                    </label>
                    
                    <label className={cn(
                      "flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all border-2",
                      formData.isFeatured
                        ? "border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20"
                        : "border-slate-200 dark:border-slate-600 hover:border-slate-300"
                    )}>
                      <input
                        type="checkbox"
                        checked={formData.isFeatured}
                        onChange={(e) => setFormData(prev => ({ ...prev, isFeatured: e.target.checked }))}
                        className="text-yellow-600"
                      />
                      <Star className="w-5 h-5 text-yellow-500" />
                      <span className="font-medium text-yellow-600">⭐ مميز</span>
                    </label>
                  </div>
                </div>

                {/* المؤلف */}
                <div>
                  <Label htmlFor="author" className="text-sm font-medium mb-2 block">
                    <User className="w-4 h-4 inline ml-1" />
                    المؤلف
                  </Label>
                  <select
                    id="author"
                    value={formData.authorId}
                    onChange={(e) => setFormData(prev => ({ ...prev, authorId: e.target.value }))}
                    className={cn(
                      "w-full px-3 py-2 rounded-lg border shadow-sm",
                      darkMode ? "bg-slate-700 border-slate-600 text-white" : "bg-white border-slate-200"
                    )}
                  >
                    <option value="">اختر المؤلف...</option>
                    {authors.map((author) => (
                      <option key={author.id} value={author.id}>
                        {author.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* التصنيف */}
                <div>
                  <Label htmlFor="category" className="text-sm font-medium mb-2 block">
                    <Tag className="w-4 h-4 inline ml-1" />
                    التصنيف
                  </Label>
                  <select
                    id="category"
                    value={formData.categoryId}
                    onChange={(e) => setFormData(prev => ({ ...prev, categoryId: e.target.value }))}
                    className={cn(
                      "w-full px-3 py-2 rounded-lg border shadow-sm",
                      darkMode ? "bg-slate-700 border-slate-600 text-white" : "bg-white border-slate-200"
                    )}
                  >
                    <option value="">اختر التصنيف...</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* طريقة النشر */}
                <div>
                  <Label className="text-sm font-medium mb-2 block">
                    <Calendar className="w-4 h-4 inline ml-1" />
                    طريقة النشر
                  </Label>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="publishType"
                        value="now"
                        checked={formData.publishType === 'now'}
                        onChange={(e) => setFormData(prev => ({ ...prev, publishType: e.target.value as 'now' | 'scheduled' }))}
                        className="text-blue-600"
                      />
                      <span>نشر فوري</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="publishType"
                        value="scheduled"
                        checked={formData.publishType === 'scheduled'}
                        onChange={(e) => setFormData(prev => ({ ...prev, publishType: e.target.value as 'now' | 'scheduled' }))}
                        className="text-blue-600"
                      />
                      <span>نشر مجدول</span>
                    </label>
                  </div>
                  
                  {formData.publishType === 'scheduled' && (
                    <div className="mt-2">
                      <Input
                        type="datetime-local"
                        value={formData.scheduledDate}
                        onChange={(e) => setFormData(prev => ({ ...prev, scheduledDate: e.target.value }))}
                        className={cn(
                          "text-sm",
                          darkMode ? "bg-slate-700 border-slate-600" : "bg-white border-slate-200"
                        )}
                      />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* معلومات إضافية */}
            <Card className={cn(
              "shadow-lg border-0 backdrop-blur-sm",
              darkMode ? 'bg-slate-800/90 border-slate-700' : 'bg-white/90 border-slate-200'
            )}>
              <CardHeader className="pb-4">
                <CardTitle className="text-lg flex items-center gap-2 text-slate-600 dark:text-slate-400">
                  <Target className="w-5 h-5" />
                  📊 معلومات إضافية
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm text-slate-600 dark:text-slate-400">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>حالة الاكتمال:</span>
                    <span className="font-semibold">{completionScore}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>عدد الكلمات:</span>
                    <span>{formData.content && typeof formData.content === 'string' ? formData.content.replace(/<[^>]*>/g, '').split(' ').filter(word => word.trim().length > 0).length : 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>الكلمات المفتاحية:</span>
                    <span>{formData.keywords.length}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
} 