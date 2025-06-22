'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  Sparkles, 
  FileText, 
  Link as LinkIcon,
  Brain,
  Layers,
  Save,
  Send,
  Loader2,
  AlertCircle,
  X,
  Clock,
  User,
  Hash,
  CheckCircle,
  FileCheck
} from 'lucide-react';
import dynamic from 'next/dynamic';
import { cn } from '@/lib/utils';

const Editor = dynamic(() => import('@/components/Editor/Editor'), { ssr: false });

interface Article {
  id: string;
  title: string;
  slug: string;
  published_at: string;
}

export default function CreateDeepAnalysisPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [method, setMethod] = useState<'manual' | 'gpt' | 'hybrid'>('manual');
  const [recentArticles, setRecentArticles] = useState<Article[]>([]);
  const [wordCount, setWordCount] = useState(0);
  const [readingTime, setReadingTime] = useState(0);
  
  const [formData, setFormData] = useState({
    title: '',
    summary: '',
    categories: [] as string[],
    tags: [] as string[],
    articleUrl: '',
    articleId: '',
    articleText: '',
    analysisAngle: 'economic',
    depthLevel: 3,
    content: '',
    sources: [] as string[],
    keyTakeaways: [] as string[]
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [currentTag, setCurrentTag] = useState('');
  const [currentSource, setCurrentSource] = useState('');
  const [currentTakeaway, setCurrentTakeaway] = useState('');

  // الحصول على معلومات المستخدم الحالي
  const currentUser = {
    name: 'علي الحازمي',
    role: 'محرر رئيسي',
    avatar: '/avatars/ali.jpg'
  };

  useEffect(() => {
    fetchRecentArticles();
  }, []);

  useEffect(() => {
    // حساب عدد الكلمات ووقت القراءة
    const text = formData.content.replace(/<[^>]*>/g, ''); // إزالة HTML tags
    const words = text.trim().split(/\s+/).length;
    setWordCount(words);
    setReadingTime(Math.ceil(words / 200)); // متوسط 200 كلمة في الدقيقة
  }, [formData.content]);

  const fetchRecentArticles = async () => {
    try {
      const response = await fetch('/api/articles?status=published&limit=10&sort=published_at&order=desc');
      if (response.ok) {
        const data = await response.json();
        setRecentArticles(data);
      }
    } catch (error) {
      console.error('خطأ في جلب المقالات:', error);
    }
  };

  const handleCategoryToggle = (category: string) => {
    if (formData.categories.includes(category)) {
      setFormData({
        ...formData,
        categories: formData.categories.filter(c => c !== category)
      });
    } else {
      setFormData({
        ...formData,
        categories: [...formData.categories, category]
      });
    }
  };

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && currentTag.trim()) {
      e.preventDefault();
      if (!formData.tags.includes(currentTag.trim())) {
        setFormData({
          ...formData,
          tags: [...formData.tags, currentTag.trim()]
        });
      }
      setCurrentTag('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter(t => t !== tag)
    });
  };

  const handleAddSource = () => {
    if (currentSource.trim() && !formData.sources.includes(currentSource.trim())) {
      setFormData({
        ...formData,
        sources: [...formData.sources, currentSource.trim()]
      });
      setCurrentSource('');
    }
  };

  const handleAddTakeaway = () => {
    if (currentTakeaway.trim() && !formData.keyTakeaways.includes(currentTakeaway.trim())) {
      setFormData({
        ...formData,
        keyTakeaways: [...formData.keyTakeaways, currentTakeaway.trim()]
      });
      setCurrentTakeaway('');
    }
  };

  const handleGenerateAnalysis = async () => {
    // التحقق من المدخلات
    const newErrors: Record<string, string> = {};
    
    if (!formData.title) newErrors.title = 'العنوان مطلوب';
    if (formData.categories.length === 0) newErrors.categories = 'اختر تصنيف واحد على الأقل';
    if (!formData.articleUrl && !formData.articleId && !formData.articleText) {
      newErrors.source = 'يجب إدخال رابط المقال أو اختياره من القائمة أو إدخال النص';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // التحقق من وجود مفتاح API
    const apiKey = localStorage.getItem('openaiApiKey');
    if (!apiKey) {
      alert('الرجاء إعداد مفتاح OpenAI API من صفحة الإعدادات');
      router.push('/dashboard/deep-analysis/settings');
      return;
    }

    // جلب الإعدادات المحفوظة
    const savedSettings = localStorage.getItem('deepAnalysisSettings');
    const settings = savedSettings ? JSON.parse(savedSettings) : {};

    setGenerating(true);
    try {
      const response = await fetch('/api/ai/deep-analysis', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-api-key': apiKey // إرسال مفتاح API في الهيدر
        },
        body: JSON.stringify({
          title: formData.title,
          articleUrl: formData.articleUrl,
          articleId: formData.articleId,
          articleText: formData.articleText,
          analysisAngle: formData.analysisAngle,
          depthLevel: formData.depthLevel,
          categories: formData.categories,
          settings: settings // إرسال الإعدادات المخصصة
        })
      });

      if (response.ok) {
        const data = await response.json();
        setFormData({
          ...formData,
          content: data.content,
          summary: data.summary || formData.summary,
          keyTakeaways: data.recommendations || []
        });
      } else {
        throw new Error('فشل في توليد التحليل');
      }
    } catch (error) {
      console.error('خطأ في توليد التحليل:', error);
      setErrors({ general: 'حدث خطأ في توليد التحليل. يرجى المحاولة مرة أخرى.' });
    } finally {
      setGenerating(false);
    }
  };

  const handleSubmit = async (action: 'draft' | 'publish' | 'review') => {
    // التحقق من المدخلات
    const newErrors: Record<string, string> = {};
    
    if (!formData.title) newErrors.title = 'العنوان مطلوب';
    if (formData.title.length > 150) newErrors.title = 'العنوان يجب ألا يتجاوز 150 حرف';
    if (!formData.summary) newErrors.summary = 'الملخص مطلوب';
    if (!formData.content) newErrors.content = 'المحتوى مطلوب';
    if (formData.categories.length === 0) newErrors.categories = 'اختر تصنيف واحد على الأقل';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      const status = action === 'draft' ? 'draft' : action === 'review' ? 'editing' : 'published';
      
      const response = await fetch('/api/deep-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          status,
          source: method,
          articleId: formData.articleId || undefined,
          wordCount,
          readingTime,
          author: currentUser.name
        })
      });

      if (response.ok) {
        const data = await response.json();
        router.push(`/dashboard/deep-analysis/${data.id}`);
      } else {
        throw new Error('فشل في حفظ التحليل');
      }
    } catch (error) {
      console.error('خطأ في حفظ التحليل:', error);
      setErrors({ general: 'حدث خطأ في حفظ التحليل. يرجى المحاولة مرة أخرى.' });
    } finally {
      setLoading(false);
    }
  };

  const analysisAngles = [
    { value: 'economic', label: 'اقتصادي', icon: '💰' },
    { value: 'social', label: 'اجتماعي', icon: '👥' },
    { value: 'political', label: 'سياسي', icon: '🏛️' },
    { value: 'environmental', label: 'بيئي', icon: '🌱' },
    { value: 'technological', label: 'تقني', icon: '💻' },
    { value: 'security', label: 'أمني', icon: '🔒' }
  ];

  const mainCategories = [
    'الاقتصاد', 'التقنية', 'رؤية 2030', 'الأمن السيبراني', 
    'التعليم', 'الصحة', 'البيئة', 'السياسة', 'الرياضة', 
    'الثقافة', 'السياحة', 'الطاقة'
  ];

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            رجوع
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              إنشاء تحليل عميق جديد
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              أنشئ تحليلاً استراتيجياً شاملاً بالذكاء الاصطناعي أو يدوياً
            </p>
          </div>
        </div>
      </div>

      {errors.general && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
          <span className="text-red-700 dark:text-red-300">{errors.general}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* 1️⃣ المعلومات الأساسية */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-2xl">1️⃣</span>
                المعلومات الأساسية
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  عنوان التحليل <span className="text-red-500">*</span>
                  <span className="text-xs text-gray-500 mr-2">
                    ({formData.title.length}/150 حرف)
                  </span>
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => {
                    if (e.target.value.length <= 150) {
                      setFormData({ ...formData, title: e.target.value });
                      setErrors({ ...errors, title: '' });
                    }
                  }}
                  className={cn(
                    "w-full px-4 py-2 border rounded-lg",
                    "bg-white dark:bg-gray-800 dark:border-gray-700",
                    errors.title && "border-red-500"
                  )}
                  placeholder="عنوان واضح ومحدد للتحليل"
                />
                {errors.title && (
                  <p className="text-red-500 text-sm mt-1">{errors.title}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  ملخص التحليل <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.summary}
                  onChange={(e) => {
                    setFormData({ ...formData, summary: e.target.value });
                    setErrors({ ...errors, summary: '' });
                  }}
                  className={cn(
                    "w-full px-4 py-2 border rounded-lg",
                    "bg-white dark:bg-gray-800 dark:border-gray-700",
                    errors.summary && "border-red-500"
                  )}
                  rows={3}
                  placeholder="مقدمة تمهيدية تظهر في كروت التحليل..."
                />
                {errors.summary && (
                  <p className="text-red-500 text-sm mt-1">{errors.summary}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  التصنيفات <span className="text-red-500">*</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {mainCategories.map((category) => (
                    <button
                      key={category}
                      onClick={() => handleCategoryToggle(category)}
                      className={cn(
                        "px-3 py-1 rounded-full text-sm font-medium transition-all",
                        formData.categories.includes(category)
                          ? "bg-primary text-primary-foreground hover:bg-primary/90"
                          : "border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800"
                      )}
                    >
                      {category}
                    </button>
                  ))}
                </div>
                {errors.categories && (
                  <p className="text-red-500 text-sm mt-1">{errors.categories}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* 2️⃣ طريقة الإنشاء */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-2xl">2️⃣</span>
                طريقة الإنشاء
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                  onClick={() => setMethod('manual')}
                  className={cn(
                    "p-4 rounded-lg border-2 transition-all",
                    method === 'manual' 
                      ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20" 
                      : "border-gray-200 dark:border-gray-700 hover:border-gray-300"
                  )}
                >
                  <FileText className="w-8 h-8 mx-auto mb-2 text-gray-600 dark:text-gray-400" />
                  <h3 className="font-semibold">يدوي</h3>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    اكتب كل شيء بنفسك
                  </p>
                  {method === 'manual' && (
                    <CheckCircle className="w-5 h-5 text-blue-500 mx-auto mt-2" />
                  )}
                </button>
                
                <button
                  onClick={() => setMethod('gpt')}
                  className={cn(
                    "p-4 rounded-lg border-2 transition-all",
                    method === 'gpt' 
                      ? "border-purple-500 bg-purple-50 dark:bg-purple-900/20" 
                      : "border-gray-200 dark:border-gray-700 hover:border-gray-300"
                  )}
                >
                  <Sparkles className="w-8 h-8 mx-auto mb-2 text-purple-600 dark:text-purple-400" />
                  <h3 className="font-semibold">GPT</h3>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    توليد بالذكاء الاصطناعي
                  </p>
                  {method === 'gpt' && (
                    <CheckCircle className="w-5 h-5 text-purple-500 mx-auto mt-2" />
                  )}
                </button>

                <button
                  onClick={() => setMethod('hybrid')}
                  className={cn(
                    "p-4 rounded-lg border-2 transition-all",
                    method === 'hybrid' 
                      ? "border-green-500 bg-green-50 dark:bg-green-900/20" 
                      : "border-gray-200 dark:border-gray-700 hover:border-gray-300"
                  )}
                >
                  <Layers className="w-8 h-8 mx-auto mb-2 text-green-600 dark:text-green-400" />
                  <h3 className="font-semibold">مزيج</h3>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    توليد آلي ثم تحرير
                  </p>
                  {method === 'hybrid' && (
                    <CheckCircle className="w-5 h-5 text-green-500 mx-auto mt-2" />
                  )}
                </button>
              </div>
            </CardContent>
          </Card>

          {/* إعدادات التوليد بالذكاء الاصطناعي */}
          {(method === 'gpt' || method === 'hybrid') && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-purple-600" />
                  إعدادات التوليد بالذكاء الاصطناعي
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    مصدر المقال
                  </label>
                  
                  <div className="space-y-3">
                    <div className="flex gap-2">
                      <LinkIcon className="w-5 h-5 text-gray-400 mt-2" />
                      <input
                        type="url"
                        value={formData.articleUrl}
                        onChange={(e) => setFormData({ ...formData, articleUrl: e.target.value })}
                        className="flex-1 px-4 py-2 border rounded-lg bg-white dark:bg-gray-800 dark:border-gray-700"
                        placeholder="رابط المقال أو الخبر"
                      />
                    </div>

                    <div className="text-center text-gray-500 text-sm">أو</div>

                    <div>
                      <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">
                        اختر من المقالات الأخيرة
                      </label>
                      <select
                        value={formData.articleId}
                        onChange={(e) => setFormData({ ...formData, articleId: e.target.value })}
                        className="w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-800 dark:border-gray-700"
                      >
                        <option value="">-- اختر مقال --</option>
                        {recentArticles.map((article) => (
                          <option key={article.id} value={article.id}>
                            {article.title}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="text-center text-gray-500 text-sm">أو</div>

                    <div>
                      <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">
                        أدخل نص المقال مباشرة
                      </label>
                      <textarea
                        value={formData.articleText}
                        onChange={(e) => setFormData({ ...formData, articleText: e.target.value })}
                        className="w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-800 dark:border-gray-700"
                        rows={6}
                        placeholder="الصق نص المقال هنا..."
                      />
                    </div>
                  </div>
                  {errors.source && (
                    <p className="text-red-500 text-sm mt-1">{errors.source}</p>
                  )}
                </div>

                {/* زاوية التحليل */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    زاوية التحليل
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {analysisAngles.map((angle) => (
                      <button
                        key={angle.value}
                        onClick={() => setFormData({ ...formData, analysisAngle: angle.value })}
                        className={cn(
                          "p-3 rounded-lg border transition-all flex items-center gap-2",
                          formData.analysisAngle === angle.value
                            ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                            : "border-gray-200 dark:border-gray-700 hover:border-gray-300"
                        )}
                      >
                        <span className="text-2xl">{angle.icon}</span>
                        <span className="font-medium">{angle.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* مستوى العمق */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    مستوى العمق التحليلي
                  </label>
                  <div className="flex items-center gap-4">
                    <input
                      type="range"
                      min="1"
                      max="5"
                      value={formData.depthLevel}
                      onChange={(e) => setFormData({ ...formData, depthLevel: parseInt(e.target.value) })}
                      className="flex-1"
                    />
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Layers
                          key={i}
                          className={cn(
                            "w-5 h-5",
                            i < formData.depthLevel
                              ? "text-blue-500"
                              : "text-gray-300 dark:text-gray-600"
                          )}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {formData.depthLevel === 1 && 'تحليل سطحي سريع'}
                    {formData.depthLevel === 2 && 'تحليل أساسي'}
                    {formData.depthLevel === 3 && 'تحليل متوسط العمق'}
                    {formData.depthLevel === 4 && 'تحليل عميق'}
                    {formData.depthLevel === 5 && 'تحليل شامل ومعمق جداً'}
                  </p>
                </div>

                <Button
                  onClick={handleGenerateAnalysis}
                  disabled={generating}
                  className="w-full"
                >
                  {generating ? (
                    <>
                      <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                      جاري توليد التحليل...
                    </>
                  ) : (
                    <>
                      <Brain className="w-4 h-4 ml-2" />
                      توليد التحليل بالذكاء الاصطناعي
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          )}

          {/* 3️⃣ محتوى التحليل */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-2xl">3️⃣</span>
                محتوى التحليل
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  نص التحليل <span className="text-red-500">*</span>
                </label>
                <div className="min-h-[400px] border rounded-lg p-4 bg-white dark:bg-gray-800">
                  <Editor
                    content={formData.content}
                    onChange={(content) => {
                      setFormData({ ...formData, content });
                      setErrors({ ...errors, content: '' });
                    }}
                    placeholder="ابدأ كتابة التحليل هنا..."
                  />
                </div>
                {errors.content && (
                  <p className="text-red-500 text-sm mt-1">{errors.content}</p>
                )}
              </div>

              {/* الوسوم */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  الوسوم
                  <span className="text-xs text-gray-500 mr-2">
                    (اضغط Enter لإضافة وسم)
                  </span>
                </label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {formData.tags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="secondary"
                      className="flex items-center gap-1"
                    >
                      <Hash className="w-3 h-3" />
                      {tag}
                      <button
                        onClick={() => handleRemoveTag(tag)}
                        className="mr-1 hover:text-red-500"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
                <input
                  type="text"
                  value={currentTag}
                  onChange={(e) => setCurrentTag(e.target.value)}
                  onKeyPress={handleAddTag}
                  className="w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-800 dark:border-gray-700"
                  placeholder="أدخل وسم..."
                />
              </div>

              {/* النقاط المميزة */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  النقاط المميزة (Key Takeaways)
                </label>
                <div className="space-y-2">
                  {formData.keyTakeaways.map((takeaway, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <span className="flex-1">{takeaway}</span>
                      <button
                        onClick={() => setFormData({
                          ...formData,
                          keyTakeaways: formData.keyTakeaways.filter((_, i) => i !== index)
                        })}
                        className="text-red-500 hover:text-red-700"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={currentTakeaway}
                      onChange={(e) => setCurrentTakeaway(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddTakeaway();
                        }
                      }}
                      className="flex-1 px-4 py-2 border rounded-lg bg-white dark:bg-gray-800 dark:border-gray-700"
                      placeholder="أضف نقطة مميزة..."
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleAddTakeaway}
                    >
                      إضافة
                    </Button>
                  </div>
                </div>
              </div>

              {/* المصادر */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  المصادر والمراجع
                </label>
                <div className="space-y-2">
                  {formData.sources.map((source, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <LinkIcon className="w-4 h-4 text-blue-500" />
                      <span className="flex-1">{source}</span>
                      <button
                        onClick={() => setFormData({
                          ...formData,
                          sources: formData.sources.filter((_, i) => i !== index)
                        })}
                        className="text-red-500 hover:text-red-700"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={currentSource}
                      onChange={(e) => setCurrentSource(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddSource();
                        }
                      }}
                      className="flex-1 px-4 py-2 border rounded-lg bg-white dark:bg-gray-800 dark:border-gray-700"
                      placeholder="أضف مصدر أو رابط..."
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleAddSource}
                    >
                      إضافة
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* الشريط الجانبي */}
        <div className="space-y-6">
          {/* معلومات المحرر */}
          <Card>
            <CardHeader>
              <CardTitle>معلومات المحرر</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="font-semibold">{currentUser.name}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{currentUser.role}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* إحصائيات المحتوى */}
          <Card>
            <CardHeader>
              <CardTitle>إحصائيات المحتوى</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">عدد الكلمات</span>
                <span className="font-semibold">{wordCount}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">وقت القراءة المقدر</span>
                <span className="font-semibold flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {readingTime} دقيقة
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">التصنيفات</span>
                <span className="font-semibold">{formData.categories.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">الوسوم</span>
                <span className="font-semibold">{formData.tags.length}</span>
              </div>
              {method !== 'manual' && (
                <div className="pt-3 border-t">
                  <Badge variant="outline" className="w-full justify-center">
                    {method === 'gpt' && 'AI Generated'}
                    {method === 'hybrid' && 'AI Assisted'}
                  </Badge>
                </div>
              )}
            </CardContent>
          </Card>

          {/* إجراءات النشر */}
          <Card>
            <CardHeader>
              <CardTitle>⚙️ الإجراءات</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                onClick={() => handleSubmit('draft')}
                disabled={loading || generating}
                variant="outline"
                className="w-full"
              >
                <Save className="w-4 h-4 ml-2" />
                حفظ كمسودة
              </Button>
              
              <Button
                onClick={() => handleSubmit('review')}
                disabled={loading || generating}
                variant="outline"
                className="w-full"
              >
                <FileCheck className="w-4 h-4 ml-2" />
                إرسال للتحقق
              </Button>
              
              <Button
                onClick={() => handleSubmit('publish')}
                disabled={loading || generating}
                className="w-full"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                    جاري النشر...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 ml-2" />
                    نشر التحليل
                  </>
                )}
              </Button>
              
              <Button
                onClick={() => router.back()}
                variant="ghost"
                className="w-full"
              >
                <X className="w-4 h-4 ml-2" />
                إلغاء
              </Button>
            </CardContent>
          </Card>

          {/* نصائح */}
          <Card>
            <CardHeader>
              <CardTitle>✨ نصائح للتحليل الناجح</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-0.5">•</span>
                  <span>اختر عنواناً واضحاً ومحدداً (max 150 حرف)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-0.5">•</span>
                  <span>اكتب ملخصاً جذاباً يظهر في البطاقات</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-0.5">•</span>
                  <span>استخدم البيانات والإحصائيات لدعم تحليلك</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-0.5">•</span>
                  <span>أضف مصادر موثوقة لزيادة المصداقية</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-0.5">•</span>
                  <span>حدد النقاط المميزة بوضوح</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 