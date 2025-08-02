'use client';

import React, { useState, useEffect } from 'react';
import { 
  Save, Eye, Sparkles, Clock, Tag, User, Image, 
  FileText, Wand2, Brain, ArrowLeft, Upload,
  MessageSquare, TrendingUp, BookOpen, Quote,
  RefreshCw, Check, X, Zap, AlertCircle,
  CheckCircle, Plus
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useDarkModeContext } from '@/contexts/DarkModeContext';
import toast from 'react-hot-toast';

import SafeArticleEditor from '@/components/Editor/SafeArticleEditor';

// Types
interface ArticleAuthor {
  id: string;
  full_name: string;
  slug: string;
  title?: string;
  avatar_url?: string;
}

interface ArticleForm {
  title: string;
  content: string;
  excerpt: string;
  article_author_id: string;
  article_type: 'opinion' | 'analysis' | 'interview' | 'news';
  featured_image: string;
  tags: string[];
  status: 'draft' | 'published';
}

const NewArticlePage = () => {
  const { darkMode } = useDarkModeContext();
  const router = useRouter();
  
  // State
  const [authors, setAuthors] = useState<ArticleAuthor[]>([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [form, setForm] = useState<ArticleForm>({
    title: '',
    content: '',
    excerpt: '',
    article_author_id: '',
    article_type: 'opinion',
    featured_image: '',
    tags: [],
    status: 'draft'
  });
  
  const [aiContent, setAiContent] = useState({
    title: '',
    summary: '',
    quotes: [] as string[],
    keywords: [] as string[],
    reading_time: 0,
    ai_score: 0,
    processing_time: 0
  });
  
  const [generateStatus, setGenerateStatus] = useState<'idle' | 'generating' | 'success' | 'error'>('idle');
  
  // حالات التوليد المحسنة
  const [aiTitles, setAiTitles] = useState<string[]>([]);
  const [aiKeywords, setAiKeywords] = useState<any>({});
  const [showTitleSuggestions, setShowTitleSuggestions] = useState(false);
  const [showKeywordSuggestions, setShowKeywordSuggestions] = useState(false);
  const [selectedKeywords, setSelectedKeywords] = useState<string[]>([]);
  
  // حالة رفع الصورة
  const [uploadingImage, setUploadingImage] = useState(false);

  // Fetch authors
  useEffect(() => {
    fetchAuthors();
  }, []);

  const fetchAuthors = async () => {
    try {
      const response = await fetch('/api/admin/article-authors?active_only=true');
      const data = await response.json();
      
      if (data.success) {
        setAuthors(data.authors || []);
        if (data.authors?.length > 0) {
          setForm(prev => ({ ...prev, article_author_id: data.authors[0].id }));
        }
      }
    } catch (error) {
      console.error('خطأ في جلب الكتّاب:', error);
      toast.error('خطأ في تحميل قائمة الكتّاب');
    }
  };

  // Auto-generate AI content when content changes
  useEffect(() => {
    if (form.content.length > 100) {
      const timer = setTimeout(() => {
        autoGenerateAIContent();
      }, 2000); // انتظار ثانيتين بعد التوقف عن الكتابة
      
      return () => clearTimeout(timer);
    }
  }, [form.content]);

  // Auto generate AI content
  const autoGenerateAIContent = async () => {
    if (!form.content || form.content.length < 100) return;
    
    setGenerating(true);
    setGenerateStatus('generating');
    
    try {
      const response = await fetch('/api/ai/smart-editor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: ['generate_title', 'create_summary', 'generate_keywords', 'generate_quotes'],
          content: form.content,
          title: form.title
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setAiContent(data);
        setGenerateStatus('success');
        
        // تحديث النموذج تلقائياً
        setForm(prev => ({
          ...prev,
          title: prev.title || data.title || prev.title,
          excerpt: prev.excerpt || data.summary || prev.excerpt,
          tags: [...new Set([...prev.tags, ...(data.keywords || [])])]
        }));
        
        toast.success('تم توليد المحتوى الذكي تلقائياً');
      } else {
        setGenerateStatus('error');
        console.error('خطأ في API:', data.error);
      }
    } catch (error) {
      console.error('خطأ في توليد المحتوى:', error);
      setGenerateStatus('error');
    } finally {
      setGenerating(false);
    }
  };

  // توليد عناوين احترافية متعددة
  const generateTitles = async () => {
    if (!form.content) {
      toast.error('يجب إدخال المحتوى أولاً');
      return;
    }

    setGenerating(true);
    try {
      const response = await fetch('/api/ai/generate-titles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: form.content,
          currentTitle: form.title
        })
      });

      const data = await response.json();
      
      if (data.success && data.titles) {
        setAiTitles(data.titles);
        setShowTitleSuggestions(true);
        toast.success(`تم توليد ${data.titles.length} عناوين احترافية`);
      } else {
        toast.error(data.error || 'خطأ في توليد العناوين');
      }
    } catch (error) {
      console.error('خطأ في توليد العناوين:', error);
      toast.error('خطأ في الاتصال بالخادم');
    } finally {
      setGenerating(false);
    }
  };

  // توليد كلمات مفتاحية مع إمكانية الاختيار
  const generateKeywords = async () => {
    if (!form.content) {
      toast.error('يجب إدخال المحتوى أولاً');
      return;
    }

    setGenerating(true);
    try {
      const response = await fetch('/api/ai/generate-keywords', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: form.content,
          title: form.title,
          currentKeywords: form.tags
        })
      });

      const data = await response.json();
      
      if (data.success && data.keywords) {
        setAiKeywords(data);
        setSelectedKeywords([]);
        setShowKeywordSuggestions(true);
        toast.success(`تم توليد ${data.keywords.length} كلمة مفتاحية`);
      } else {
        toast.error(data.error || 'خطأ في توليد الكلمات المفتاحية');
      }
    } catch (error) {
      console.error('خطأ في توليد الكلمات المفتاحية:', error);
      toast.error('خطأ في الاتصال بالخادم');
    } finally {
      setGenerating(false);
    }
  };

  // اختيار عنوان من الاقتراحات
  const selectTitle = (title: string) => {
    setForm(prev => ({ ...prev, title }));
    setShowTitleSuggestions(false);
    toast.success('تم اختيار العنوان');
  };

  // إضافة/إزالة كلمات مفتاحية
  const toggleKeyword = (keyword: string) => {
    setSelectedKeywords(prev => 
      prev.includes(keyword) 
        ? prev.filter(k => k !== keyword)
        : [...prev, keyword]
    );
  };

  // تطبيق الكلمات المفتاحية المختارة
  const applySelectedKeywords = () => {
    setForm(prev => ({
      ...prev,
      tags: [...new Set([...prev.tags, ...selectedKeywords])]
    }));
    setShowKeywordSuggestions(false);
    toast.success(`تم إضافة ${selectedKeywords.length} كلمة مفتاحية`);
  };

  // رفع الصورة (نفس نهج العضوية)
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    console.log('📸 [Article Image] بدء رفع الصورة:', file.name, file.size, file.type);

    try {
      setUploadingImage(true);
      toast.loading('جاري رفع الصورة...');

      // إنشاء FormData
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', 'article-featured');

      console.log('📤 [Article Image] إرسال الطلب إلى /api/upload-image مع fallback آمن');

      // رفع الصورة مع fallback (نفس نهج العضوية)
      let response;
      try {
        response = await fetch('/api/upload-image', {
          method: 'POST',
          body: formData
        });
        
        // إذا كان هناك خطأ 500، جرب الـ API الآمن
        if (!response.ok && response.status === 500) {
          console.log('🔄 [Article Image] الانتقال للـ API الآمن بسبب خطأ 500');
          response = await fetch('/api/upload-image-safe', {
            method: 'POST',
            body: formData
          });
        }
      } catch (primaryError) {
        console.log('🔄 [Article Image] الانتقال للـ API الآمن بسبب خطأ في الاتصال');
        response = await fetch('/api/upload-image-safe', {
          method: 'POST',
          body: formData
        });
      }

      const result = await response.json();

      if (result.success && result.url) {
        console.log('✅ [Article Image] تم رفع الصورة بنجاح:', result.url);
        setForm(prev => ({ ...prev, featured_image: result.url }));
        toast.dismiss();
        toast.success('تم رفع الصورة بنجاح');
      } else {
        throw new Error(result.error || 'فشل في رفع الصورة');
      }

    } catch (error: any) {
      console.error('❌ [Article Image] خطأ في رفع الصورة:', error);
      toast.dismiss();
      toast.error(`خطأ في رفع الصورة: ${error.message}`);
    } finally {
      setUploadingImage(false);
    }
  };

  // Manual AI content generation (تحديث للاقتباسات فقط)
  const generateAIContent = async () => {
    if (!form.content) {
      toast.error('يجب إدخال المحتوى أولاً');
      return;
    }

    setGenerating(true);
    setGenerateStatus('generating');
    
    try {
      const response = await fetch('/api/ai/smart-editor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: ['generate_quotes', 'create_summary'],
          content: form.content,
          title: form.title
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setAiContent(data);
        setGenerateStatus('success');
        
        // Update excerpt only if not manually set
        if (!form.excerpt && data.summary) {
          setForm(prev => ({ ...prev, excerpt: data.summary }));
        }
        
        toast.success(`تم توليد الاقتباسات في ${data.processing_time}ms`);
      } else {
        setGenerateStatus('error');
        toast.error(data.error || 'خطأ في توليد المحتوى الذكي');
      }
    } catch (error) {
      console.error('خطأ في توليد المحتوى:', error);
      setGenerateStatus('error');
      toast.error('خطأ في الاتصال بالخادم');
    } finally {
      setGenerating(false);
    }
  };

  // Save article
  const saveArticle = async (status: 'draft' | 'published') => {
    if (!form.title || !form.content || !form.article_author_id) {
      toast.error('يرجى إكمال الحقول المطلوبة');
      return;
    }

    setLoading(true);
    try {
      const articleData = {
        ...form,
        status,
        ai_quotes: aiContent.quotes,
        reading_time: aiContent.reading_time || Math.ceil(form.content.replace(/<[^>]*>/g, '').split(' ').filter(w => w.length > 0).length / 225)
      };

      const response = await fetch('/api/admin/articles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(articleData)
      });

      if (response.ok) {
        toast.success(status === 'draft' ? 'تم حفظ المسودة' : 'تم نشر المقال');
        router.push('/admin/articles');
      } else {
        throw new Error('فشل في حفظ المقال');
      }
    } catch (error) {
      console.error('خطأ في الحفظ:', error);
      toast.error('حدث خطأ في حفظ المقال');
    } finally {
      setLoading(false);
    }
  };

  // Handle tag input
  const handleTagInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && e.currentTarget.value.trim()) {
      const newTag = e.currentTarget.value.trim();
      if (!form.tags.includes(newTag)) {
        setForm(prev => ({ ...prev, tags: [...prev.tags, newTag] }));
      }
      e.currentTarget.value = '';
    }
  };

  const removeTag = (tagToRemove: string) => {
    setForm(prev => ({ ...prev, tags: prev.tags.filter(tag => tag !== tagToRemove) }));
  };

  return (
    <div className={cn(
      "min-h-screen transition-colors duration-300",
      darkMode ? "bg-gray-900" : "bg-gray-50"
    )}>
      <div className="max-w-7xl mx-auto px-4 py-8">
        
        {/* Header */}
        <div className={cn(
          "rounded-2xl p-6 mb-8 shadow-sm border transition-colors duration-300",
          darkMode 
            ? "bg-gray-800 border-gray-700" 
            : "bg-white border-gray-100"
        )}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link 
                href="/admin/articles"
                className={cn(
                  "p-2 rounded-lg transition-colors duration-300",
                  darkMode ? "hover:bg-gray-700 text-gray-400" : "hover:bg-gray-100 text-gray-600"
                )}
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <h1 className={cn(
                  "text-2xl font-bold transition-colors duration-300",
                  darkMode ? "text-white" : "text-gray-900"
                )}>
                  📝 كتابة مقال جديد
                </h1>
                <p className={cn(
                  "text-sm transition-colors duration-300",
                  darkMode ? "text-gray-400" : "text-gray-600"
                )}>
                  مع ميزات الذكاء الاصطناعي والاقتباسات الذكية
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* حالة التوليد الذكي */}
              {generateStatus === 'generating' && (
                <div className="flex items-center gap-2 px-3 py-2 bg-blue-100 text-blue-700 rounded-lg">
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span className="text-sm">جاري التوليد...</span>
                </div>
              )}
              
              {generateStatus === 'success' && (
                <div className="flex items-center gap-2 px-3 py-2 bg-green-100 text-green-700 rounded-lg">
                  <Check className="w-4 h-4" />
                  <span className="text-sm">تم التوليد</span>
                </div>
              )}
              
              {generateStatus === 'error' && (
                <div className="flex items-center gap-2 px-3 py-2 bg-red-100 text-red-700 rounded-lg">
                  <X className="w-4 h-4" />
                  <span className="text-sm">فشل التوليد</span>
                </div>
              )}
              
              <Button
                onClick={generateAIContent}
                disabled={generating || !form.content}
                className={cn(
                  "relative transition-all duration-300",
                  generating || !form.content
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700 shadow-lg hover:shadow-xl"
                )}
              >
                {generating ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4" />
                )}
                {generating ? 'جاري التوليد...' : 'توليد ذكي'}
              </Button>

              <Button
                onClick={() => saveArticle('draft')}
                disabled={loading}
                variant="outline"
                className={cn(
                  "transition-colors duration-300",
                  darkMode ? "border-gray-600 text-gray-300 hover:bg-gray-700" : ""
                )}
              >
                <Save className="w-4 h-4" />
                حفظ مسودة
              </Button>

              <Button
                onClick={() => saveArticle('published')}
                disabled={loading}
                className="bg-green-600 text-white hover:bg-green-700 transition-colors duration-300"
              >
                {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Eye className="w-4 h-4" />}
                نشر
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* 1. الكاتب */}
            <div className={cn(
              "rounded-2xl p-6 shadow-sm border transition-colors duration-300",
              darkMode 
                ? "bg-gray-800 border-gray-700" 
                : "bg-white border-gray-100"
            )}>
              <label className={cn(
                "block text-sm font-medium mb-3 transition-colors duration-300",
                darkMode ? "text-gray-200" : "text-gray-700"
              )}>
                <User className="w-4 h-4 inline ml-2" />
                الكاتب المختص *
              </label>
              <select
                value={form.article_author_id}
                onChange={(e) => setForm(prev => ({ ...prev, article_author_id: e.target.value }))}
                className={cn(
                  "w-full p-3 rounded-lg border transition-colors duration-300",
                  darkMode 
                    ? "bg-gray-700 border-gray-600 text-white focus:border-blue-500" 
                    : "bg-white border-gray-300 text-gray-900 focus:border-blue-500"
                )}
              >
                <option value="">اختر الكاتب</option>
                {authors.map(author => (
                  <option key={author.id} value={author.id}>
                    {author.full_name} {author.title && `- ${author.title}`}
                  </option>
                ))}
              </select>
            </div>

            {/* 2. نوع المقال */}
            <div className={cn(
              "rounded-2xl p-6 shadow-sm border transition-colors duration-300",
              darkMode 
                ? "bg-gray-800 border-gray-700" 
                : "bg-white border-gray-100"
            )}>
              <label className={cn(
                "block text-sm font-medium mb-3 transition-colors duration-300",
                darkMode ? "text-gray-200" : "text-gray-700"
              )}>
                <FileText className="w-4 h-4 inline ml-2" />
                نوع المقال
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { value: 'opinion', label: 'رأي', icon: MessageSquare },
                  { value: 'analysis', label: 'تحليل', icon: TrendingUp },
                  { value: 'interview', label: 'مقابلة', icon: User },
                  { value: 'news', label: 'خبر', icon: BookOpen }
                ].map(({ value, label, icon: Icon }) => (
                  <button
                    key={value}
                    onClick={() => setForm(prev => ({ ...prev, article_type: value as any }))}
                    className={cn(
                      "p-3 rounded-lg border-2 transition-all duration-300 flex flex-col items-center gap-2",
                      form.article_type === value
                        ? "border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                        : darkMode 
                          ? "border-gray-600 text-gray-400 hover:border-gray-500" 
                          : "border-gray-200 text-gray-600 hover:border-gray-300"
                    )}
                  >
                    <Icon className="w-6 h-6" />
                    <span className="text-sm font-medium">{label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* 3. العنوان */}
            <div className={cn(
              "rounded-2xl p-6 shadow-sm border transition-colors duration-300",
              darkMode 
                ? "bg-gray-800 border-gray-700" 
                : "bg-white border-gray-100"
            )}>
              <label className={cn(
                "block text-sm font-medium mb-3 transition-colors duration-300",
                darkMode ? "text-gray-200" : "text-gray-700"
              )}>
                العنوان الرئيسي *
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="اكتب عنوان المقال..."
                  className={cn(
                    "w-full p-4 rounded-lg border text-lg transition-colors duration-300",
                    darkMode 
                      ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500" 
                      : "bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500"
                  )}
                />
                <button
                  onClick={generateTitles}
                  disabled={generating || !form.content}
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 p-2 text-purple-600 hover:text-purple-700 transition-colors duration-300 disabled:opacity-50"
                  title="توليد عناوين احترافية"
                >
                  <Sparkles className="w-3 h-3" />
                </button>
              </div>
            </div>

            {/* اقتراحات العناوين */}
            {showTitleSuggestions && aiTitles.length > 0 && (
              <div className={cn(
                "rounded-2xl p-6 shadow-sm border transition-colors duration-300",
                darkMode 
                  ? "bg-gray-800 border-gray-700" 
                  : "bg-white border-gray-100"
              )}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className={cn(
                    "text-lg font-semibold flex items-center gap-2",
                    darkMode ? "text-white" : "text-gray-900"
                  )}>
                    <Sparkles className="w-5 h-5 text-purple-500" />
                    عناوين احترافية مقترحة
                  </h3>
                  <button
                    onClick={() => setShowTitleSuggestions(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                
                <div className="space-y-3">
                  {aiTitles.map((title, index) => (
                    <div
                      key={index}
                      className={cn(
                        "p-4 rounded-lg border cursor-pointer transition-all hover:shadow-md",
                        darkMode 
                          ? "border-gray-600 bg-gray-700 hover:border-purple-500" 
                          : "border-gray-200 bg-gray-50 hover:border-purple-500"
                      )}
                      onClick={() => selectTitle(title)}
                    >
                      <p className={cn(
                        "font-medium",
                        darkMode ? "text-white" : "text-gray-900"
                      )}>
                        {title}
                      </p>
                      <p className="text-xs text-purple-600 mt-1">اضغط للاختيار</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 4. الملخص */}
            <div className={cn(
              "rounded-2xl p-6 shadow-sm border transition-colors duration-300",
              darkMode 
                ? "bg-gray-800 border-gray-700" 
                : "bg-white border-gray-100"
            )}>
              <label className={cn(
                "block text-sm font-medium mb-3 transition-colors duration-300",
                darkMode ? "text-gray-200" : "text-gray-700"
              )}>
                الملخص أو المقتطف
                <span className={cn(
                  "text-xs ml-2 transition-colors duration-300",
                  darkMode ? "text-gray-400" : "text-gray-500"
                )}>
                  (120-160 حرف مُستحسن)
                </span>
              </label>
              <div className="relative">
                <textarea
                  value={form.excerpt}
                  onChange={(e) => setForm(prev => ({ ...prev, excerpt: e.target.value }))}
                  placeholder="اكتب ملخصاً مختصراً للمقال..."
                  rows={4}
                  className={cn(
                    "w-full p-4 rounded-lg border resize-none transition-colors duration-300",
                    darkMode 
                      ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500" 
                      : "bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500"
                  )}
                />
                <button
                  onClick={() => {/* توليد ملخص */}}
                  disabled={generating}
                  className="absolute left-3 top-3 p-2 text-purple-600 hover:text-purple-700 transition-colors duration-300"
                >
                  <Sparkles className="w-3 h-3" />
                </button>
              </div>
            </div>

            {/* 5. الصورة البارزة */}
            <div className={cn(
              "rounded-2xl p-6 shadow-sm border transition-colors duration-300",
              darkMode 
                ? "bg-gray-800 border-gray-700" 
                : "bg-white border-gray-100"
            )}>
              <label className={cn(
                "block text-sm font-medium mb-3 transition-colors duration-300",
                darkMode ? "text-gray-200" : "text-gray-700"
              )}>
                <Image className="w-4 h-4 inline ml-2" />
                الصورة البارزة
              </label>
              
              {form.featured_image ? (
                <div className="relative">
                  <img 
                    src={form.featured_image} 
                    alt="الصورة البارزة" 
                    className="w-full h-48 object-cover rounded-lg"
                  />
                  <button
                    onClick={() => setForm(prev => ({ ...prev, featured_image: '' }))}
                    className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className={cn(
                  "border-2 border-dashed rounded-lg p-6 text-center transition-colors duration-300 cursor-pointer hover:border-purple-500",
                  darkMode 
                    ? "border-gray-600 hover:border-gray-500" 
                    : "border-gray-300 hover:border-gray-400"
                )}>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={uploadingImage}
                    className="hidden"
                    id="featured-image-upload"
                  />
                  <label 
                    htmlFor="featured-image-upload"
                    className="cursor-pointer block"
                  >
                    <div className="flex flex-col items-center gap-2">
                      {uploadingImage ? (
                        <RefreshCw className={cn(
                          "w-8 h-8 animate-spin",
                          darkMode ? "text-purple-400" : "text-purple-500"
                        )} />
                      ) : (
                        <Upload className={cn(
                          "w-8 h-8",
                          darkMode ? "text-gray-400" : "text-gray-500"
                        )} />
                      )}
                      <p className={cn(
                        "text-sm",
                        darkMode ? "text-gray-400" : "text-gray-600"
                      )}>
                        {uploadingImage ? 'جاري رفع الصورة...' : 'اضغط أو اسحب لرفع الصورة البارزة'}
                      </p>
                      <p className={cn(
                        "text-xs",
                        darkMode ? "text-gray-500" : "text-gray-400"
                      )}>
                        PNG, JPG, WebP (الحد الأقصى 5MB)
                      </p>
                    </div>
                  </label>
                </div>
              )}
            </div>

            {/* 6. المحتوى */}
            <div className={cn(
              "rounded-2xl p-6 shadow-sm border transition-colors duration-300",
              darkMode 
                ? "bg-gray-800 border-gray-700" 
                : "bg-white border-gray-100"
            )}>
              <label className={cn(
                "block text-sm font-medium mb-3 transition-colors duration-300",
                darkMode ? "text-gray-200" : "text-gray-700"
              )}>
                محتوى المقال *
              </label>
              <SafeArticleEditor
                initialContent={form.content}
                onChange={(content) => setForm(prev => ({ ...prev, content }))}
                placeholder="ابدأ كتابة المقال هنا... سيتم توليد المحتوى الذكي تلقائياً بعد كتابة 100 حرف"
                minHeight={500}
              />
              <div className="flex justify-between mt-2 text-xs text-gray-500">
                <span>الكلمات: {form.content.replace(/<[^>]*>/g, '').split(' ').filter(w => w.length > 0).length}</span>
                <span>وقت القراءة المتوقع: {Math.ceil(form.content.replace(/<[^>]*>/g, '').split(' ').length / 225)} دقيقة</span>
                {generating && (
                  <span className="text-purple-600 dark:text-purple-400 flex items-center gap-1">
                    <RefreshCw className="w-3 h-3 animate-spin" />
                    جاري المعالجة الذكية...
                  </span>
                )}
              </div>
            </div>

            {/* 7. العلامات */}
            <div className={cn(
              "rounded-2xl p-6 shadow-sm border transition-colors duration-300",
              darkMode 
                ? "bg-gray-800 border-gray-700" 
                : "bg-white border-gray-100"
            )}>
              <div className="flex items-center justify-between mb-3">
                <label className={cn(
                  "text-sm font-medium transition-colors duration-300",
                  darkMode ? "text-gray-200" : "text-gray-700"
                )}>
                  <Tag className="w-4 h-4 inline ml-2" />
                  العلامات والكلمات المفتاحية
                </label>
                <button
                  onClick={generateKeywords}
                  disabled={generating || !form.content}
                  className={cn(
                    "px-3 py-1 text-xs rounded-md transition-colors duration-300 flex items-center gap-1",
                    darkMode 
                      ? "bg-purple-600 text-white hover:bg-purple-700 disabled:opacity-50" 
                      : "bg-purple-500 text-white hover:bg-purple-600 disabled:opacity-50"
                  )}
                  title="توليد كلمات مفتاحية ذكية"
                >
                  <Sparkles className="w-3 h-3" />
                  {generating ? 'جاري...' : 'توليد ذكي'}
                </button>
              </div>
              
              <input
                type="text"
                placeholder="اكتب علامة واضغط Enter..."
                onKeyDown={handleTagInput}
                className={cn(
                  "w-full p-3 rounded-lg border mb-3 transition-colors duration-300",
                  darkMode 
                    ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500" 
                    : "bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500"
                )}
              />
              
              {form.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {form.tags.map((tag, index) => (
                    <span 
                      key={index}
                      className={cn(
                        "inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm transition-colors duration-300",
                        darkMode 
                          ? "bg-blue-900/30 text-blue-400" 
                          : "bg-blue-100 text-blue-700"
                      )}
                    >
                      {tag}
                      <button
                        onClick={() => removeTag(tag)}
                        className={cn(
                          "ml-1 hover:text-red-500 transition-colors duration-300",
                          darkMode ? "text-blue-300" : "text-blue-600"
                        )}
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* اقتراحات الكلمات المفتاحية */}
            {showKeywordSuggestions && aiKeywords.keywords && (
              <div className={cn(
                "rounded-2xl p-6 shadow-sm border transition-colors duration-300",
                darkMode 
                  ? "bg-gray-800 border-gray-700" 
                  : "bg-white border-gray-100"
              )}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className={cn(
                    "text-lg font-semibold flex items-center gap-2",
                    darkMode ? "text-white" : "text-gray-900"
                  )}>
                    <Tag className="w-5 h-5 text-green-500" />
                    كلمات مفتاحية مقترحة
                  </h3>
                  <button
                    onClick={() => setShowKeywordSuggestions(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                
                {/* الكلمات الأساسية */}
                {aiKeywords.grouped?.primary && (
                  <div className="mb-4">
                    <h4 className={cn(
                      "text-sm font-medium mb-2",
                      darkMode ? "text-gray-300" : "text-gray-700"
                    )}>
                      🎯 كلمات أساسية
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {aiKeywords.grouped.primary.map((keyword: string, index: number) => (
                        <button
                          key={index}
                          onClick={() => toggleKeyword(keyword)}
                          className={cn(
                            "px-3 py-1 rounded-full text-sm transition-all",
                            selectedKeywords.includes(keyword)
                              ? "bg-green-500 text-white border-green-500"
                              : darkMode
                                ? "bg-gray-700 text-gray-300 border-gray-600 hover:border-green-500"
                                : "bg-gray-100 text-gray-700 border-gray-300 hover:border-green-500"
                          )}
                        >
                          {keyword}
                          {selectedKeywords.includes(keyword) && (
                            <CheckCircle className="w-3 h-3 inline ml-1" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* باقي المجموعات */}
                {aiKeywords.keywords && (
                  <div className="mb-4">
                    <h4 className={cn(
                      "text-sm font-medium mb-2",
                      darkMode ? "text-gray-300" : "text-gray-700"
                    )}>
                      📋 كلمات إضافية
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {aiKeywords.keywords
                        .filter((keyword: string) => !aiKeywords.grouped?.primary?.includes(keyword))
                        .slice(0, 15)
                        .map((keyword: string, index: number) => (
                        <button
                          key={index}
                          onClick={() => toggleKeyword(keyword)}
                          className={cn(
                            "px-3 py-1 rounded-full text-sm transition-all",
                            selectedKeywords.includes(keyword)
                              ? "bg-blue-500 text-white border-blue-500"
                              : darkMode
                                ? "bg-gray-700 text-gray-300 border-gray-600 hover:border-blue-500"
                                : "bg-gray-100 text-gray-700 border-gray-300 hover:border-blue-500"
                          )}
                        >
                          {keyword}
                          {selectedKeywords.includes(keyword) && (
                            <CheckCircle className="w-3 h-3 inline ml-1" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* أزرار التحكم */}
                <div className="flex items-center gap-3 pt-4 border-t border-gray-200 dark:border-gray-600">
                  <button
                    onClick={applySelectedKeywords}
                    disabled={selectedKeywords.length === 0}
                    className={cn(
                      "px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2",
                      selectedKeywords.length > 0
                        ? "bg-green-500 text-white hover:bg-green-600"
                        : "bg-gray-300 text-gray-500 cursor-not-allowed"
                    )}
                  >
                    <Plus className="w-4 h-4" />
                    إضافة المختارة ({selectedKeywords.length})
                  </button>
                  
                  <button
                    onClick={() => setSelectedKeywords([])}
                    className={cn(
                      "px-4 py-2 rounded-lg font-medium transition-colors",
                      darkMode 
                        ? "bg-gray-600 text-gray-300 hover:bg-gray-500" 
                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    )}
                  >
                    إلغاء الاختيار
                  </button>
                </div>
              </div>
            )}

            {/* AI Generated Quotes */}
            <div className={cn(
              "rounded-2xl p-6 shadow-sm border transition-colors duration-300",
              darkMode 
                ? "bg-gray-800 border-gray-700" 
                : "bg-white border-gray-100"
            )}>
              <div className="flex items-center justify-between mb-4">
                <h3 className={cn(
                  "text-lg font-semibold flex items-center gap-3 transition-colors duration-300",
                  darkMode ? "text-white" : "text-gray-900"
                )}>
                  <Quote className={cn('w-5 h-5', darkMode ? 'text-purple-400' : 'text-purple-600')} />
                  الاقتباسات الذكية والتحليل
                  {aiContent.quotes.length > 0 && (
                    <span className={cn(
                      'text-xs px-2 py-1 rounded-full',
                      darkMode ? 'bg-purple-900/20 text-purple-400' : 'bg-purple-100 text-purple-600'
                    )}>
                      {aiContent.quotes.length}
                    </span>
                  )}
                </h3>
                
                <Button
                  onClick={generateAIContent}
                  disabled={generating || !form.content}
                  size="sm"
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                >
                  {generating ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                  توليد ذكي
                </Button>
              </div>

              {aiContent.quotes.length > 0 ? (
                <div className="space-y-4">
                  {aiContent.quotes.map((quote, index) => (
                    <div 
                      key={index}
                      className={cn(
                        "p-4 rounded-xl border-r-4 transition-colors duration-300",
                        darkMode 
                          ? "bg-gray-700 border-purple-500 text-gray-200" 
                          : "bg-purple-50 border-purple-500 text-gray-800"
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <Quote className={cn(
                          "w-5 h-5 mt-1 flex-shrink-0",
                          darkMode ? "text-purple-400" : "text-purple-600"
                        )} />
                        <div className="flex-1">
                          <p className="text-sm italic leading-relaxed font-medium">
                            "{quote}"
                          </p>
                          <div className="flex items-center gap-4 mt-2 text-xs">
                            <span className={cn(
                              "px-2 py-1 rounded-full",
                              darkMode ? "bg-gray-600 text-gray-300" : "bg-white text-gray-600"
                            )}>
                              اقتباس {index + 1}
                            </span>
                            <button className={cn(
                              "hover:underline transition-colors duration-300",
                              darkMode ? "text-purple-400 hover:text-purple-300" : "text-purple-600 hover:text-purple-700"
                            )}>
                              نسخ
                            </button>
                            <button className={cn(
                              "hover:underline transition-colors duration-300",
                              darkMode ? "text-blue-400 hover:text-blue-300" : "text-blue-600 hover:text-blue-700"
                            )}>
                              مشاركة
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className={cn(
                  "text-center py-12 transition-colors duration-300",
                  darkMode ? "text-gray-400" : "text-gray-500"
                )}>
                  <Quote className={cn(
                    "w-12 h-12 mx-auto mb-4 opacity-50",
                    darkMode ? "text-purple-400" : "text-purple-600"
                  )} />
                  <p className="text-sm">
                    اكتب المحتوى أولاً ثم اضغط على "توليد ذكي" لاستخراج الاقتباسات المؤثرة
                  </p>
                </div>
              )}
            </div>

          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            
            {/* AI Insights */}
            {(aiContent.reading_time > 0 || aiContent.ai_score > 0) && (
              <div className={cn(
                "rounded-2xl p-6 shadow-sm border transition-colors duration-300",
                darkMode 
                  ? "bg-gray-800 border-gray-700" 
                  : "bg-white border-gray-100"
              )}>
                <h3 className={cn(
                  "text-lg font-semibold mb-4 flex items-center gap-2 transition-colors duration-300",
                  darkMode ? "text-white" : "text-gray-900"
                )}>
                  <Brain className="w-5 h-5 text-blue-600" />
                  تحليل ذكي
                </h3>
                
                <div className="space-y-4">
                  {aiContent.ai_score > 0 && (
                    <div className="flex justify-between">
                      <span className={cn(
                        "text-sm transition-colors duration-300",
                        darkMode ? "text-gray-400" : "text-gray-600"
                      )}>
                        نقاط الجودة:
                      </span>
                      <span className={cn(
                        "text-sm font-medium transition-colors duration-300",
                        aiContent.ai_score >= 80 ? "text-green-600" :
                        aiContent.ai_score >= 60 ? "text-yellow-600" : "text-red-600"
                      )}>
                        {aiContent.ai_score}/100
                      </span>
                    </div>
                  )}
                  
                  {aiContent.keywords.length > 0 && (
                    <div>
                      <h4 className={cn(
                        "text-sm font-medium mb-2 transition-colors duration-300",
                        darkMode ? "text-gray-200" : "text-gray-700"
                      )}>
                        الكلمات المفتاحية:
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {aiContent.keywords.map((keyword, index) => (
                          <span 
                            key={index}
                            className={cn(
                              "px-2 py-1 rounded-full text-xs transition-colors duration-300",
                              darkMode 
                                ? "bg-blue-900/30 text-blue-400" 
                                : "bg-blue-100 text-blue-700"
                            )}
                          >
                            {keyword}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Reading Time */}
                {aiContent.reading_time > 0 && (
                  <div className={cn('flex items-center gap-2 mt-4 text-sm', darkMode ? 'text-gray-400' : 'text-gray-600')}>
                    <Clock className="w-4 h-4" />
                    <span>وقت القراءة المقدر: {aiContent.reading_time} دقيقة</span>
                  </div>
                )}
              </div>
            )}

          </div>
        </div>

      </div>
    </div>
  );
};

export default NewArticlePage;