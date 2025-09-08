'use client';

import React, { useState, useEffect } from 'react';
import { 
  Save, Eye, Sparkles, Clock, Tag, User, Image, 
  FileText, Wand2, Brain, ArrowLeft, Upload,
  MessageSquare, TrendingUp, BookOpen, Quote,
  RefreshCw, Check, X, Zap, AlertCircle
} from 'lucide-react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useDarkModeContext } from '@/contexts/DarkModeContext';
import toast from 'react-hot-toast';
// تم إزالة DashboardLayout لأن الصفحة تستخدم layout.tsx في /admin
import FeaturedImageUpload from '@/components/FeaturedImageUpload';
import AdvancedEditor from '@/components/ui/AdvancedEditor';

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
  category_id: string;
  article_type: 'opinion' | 'analysis' | 'interview' | 'news';
  featured_image: string;
  tags: string[];
  status: 'draft' | 'published';
  featured: boolean;
  breaking: boolean;
}

const EditArticlePage = () => {
  const { darkMode } = useDarkModeContext();
  const router = useRouter();
  const params = useParams();
  const articleId = params?.id as string;
  
  // State
  const [authors, setAuthors] = useState<ArticleAuthor[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [form, setForm] = useState<ArticleForm>({
    title: '',
    content: '',
    excerpt: '',
    article_author_id: '',
    category_id: '',
    article_type: 'opinion',
    featured_image: '',
    tags: [],
    status: 'draft',
    featured: false,
    breaking: false
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

  // Fetch article data, authors and categories
  useEffect(() => {
    if (articleId) {
      fetchArticleData();
      fetchAuthors();
      fetchCategories();
    }
  }, [articleId]);

  const fetchArticleData = async () => {
    try {
      setInitialLoading(true);
      const response = await fetch(`/api/articles/${articleId}?all=true`, { credentials: 'include' });
      const json = await response.json();
      const data = json?.data || json; // دعم غلاف API { ok, data }
      
      if (response.ok && data) {
        let parsedTags = [];
      try {
        // محاولة استخراج الكلمات المفتاحية من البيانات المستلمة بطرق مختلفة
        if (Array.isArray(data.tags)) {
          parsedTags = data.tags;
        } else if (typeof data.tags === 'string') {
          // محاولة تحليل النص إلى مصفوفة إذا كان JSON
          parsedTags = JSON.parse(data.tags || '[]');
        } else if (data.seo_keywords && typeof data.seo_keywords === 'string') {
          // استخدام الكلمات المفتاحية من حقل آخر إذا كان متاحًا
          parsedTags = data.seo_keywords.split(',').map(tag => tag.trim()).filter(Boolean);
        }
        console.log("✅ الكلمات المفتاحية المستخرجة:", parsedTags);
      } catch (error) {
        console.error("⚠️ خطأ في تحليل الكلمات المفتاحية:", error);
        parsedTags = [];
      }

      setForm({
          title: data.title || '',
          content: data.content || '',
          excerpt: data.excerpt || data.summary || '',
          article_author_id: data.article_author_id || '',
          category_id: data.category_id || '',
          article_type: data.article_type || 'opinion',
          featured_image: data.featured_image || '',
          tags: parsedTags,
          status: data.status || 'draft',
          featured: data.featured || false,
          breaking: data.breaking || false
        });

        // تحديد البيانات الذكية إذا كانت متوفرة
        if (data.ai_quotes || data.reading_time || data.ai_score) {
          setAiContent({
            title: data.title || '',
            summary: data.summary || data.excerpt || '',
            quotes: data.ai_quotes || [],
            keywords: data.tags || [],
            reading_time: data.reading_time || 0,
            ai_score: data.ai_score || 0,
            processing_time: 0
          });
        }
      } else {
        toast.error('خطأ في تحميل بيانات المقال');
        router.push('/admin/articles');
      }
    } catch (error) {
      console.error('خطأ في جلب المقال:', error);
      toast.error('خطأ في تحميل المقال');
      router.push('/admin/articles');
    } finally {
      setInitialLoading(false);
    }
  };

  const fetchAuthors = async () => {
    try {
      const response = await fetch('/api/admin/article-authors?active_only=true', { credentials: 'include' });
      const data = await response.json();
      
      if (data.success) {
        setAuthors(data.authors || []);
      }
    } catch (error) {
      console.error('خطأ في جلب الكتّاب:', error);
      toast.error('خطأ في تحميل قائمة الكتّاب');
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories');
      const data = await response.json();
      
      if (data.success) {
        setCategories(data.categories || []);
      }
    } catch (error) {
      console.error('خطأ في جلب التصنيفات:', error);
      toast.error('خطأ في تحميل التصنيفات');
    }
  };

  // Handle form submission
  const handleSubmit = async (status: 'draft' | 'published') => {
    if (!form.title.trim()) {
      toast.error('عنوان المقال مطلوب');
      return;
    }
    
    if (!form.content.trim()) {
      toast.error('محتوى المقال مطلوب');
      return;
    }

    try {
      setLoading(true);
      
      const articleData = {
        ...form,
        status,
        // إضافة البيانات الذكية إذا كانت متوفرة
        ai_quotes: aiContent.quotes,
        reading_time: aiContent.reading_time,
        ai_score: aiContent.ai_score,
        summary: form.excerpt || aiContent.summary,
        // تأكد من إرسال featured و breaking
        featured: form.featured,
        breaking: form.breaking
      };

      const response = await fetch(`/api/articles/${articleId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(articleData),
      });

      const result = await response.json();
      
      if (response.ok) {
        toast.success(status === 'published' ? 'تم نشر المقال بنجاح!' : 'تم حفظ المسودة بنجاح!');
        
        // إعادة توجيه لصفحة إدارة المقالات
        setTimeout(() => {
          router.push('/admin/articles');
        }, 1500);
      } else {
        toast.error(result.error || 'خطأ في حفظ المقال');
      }
    } catch (error) {
      console.error('خطأ في حفظ المقال:', error);
      toast.error('حدث خطأ أثناء حفظ المقال');
    } finally {
      setLoading(false);
    }
  };

  // Generate AI content
  const generateAIContent = async () => {
    if (!form.title.trim() && !form.content.trim()) {
      toast.error('أدخل العنوان أو المحتوى أولاً لتوليد محتوى ذكي');
      return;
    }

    try {
      setGenerating(true);
      setGenerateStatus('generating');
      
      const response = await fetch('/api/ai/generate-article', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: form.title,
          content: form.content,
          excerpt: form.excerpt
        }),
      });

      const data = await response.json();
      
      if (response.ok && data.success) {
        setAiContent(data.data);
        setGenerateStatus('success');
        toast.success('تم توليد المحتوى الذكي بنجاح!');
        
        // تحديث النموذج بالبيانات المولدة
        setForm(prev => ({
          ...prev,
          excerpt: prev.excerpt || data.data.summary,
          tags: [...new Set([...prev.tags, ...data.data.keywords])]
        }));
      } else {
        setGenerateStatus('error');
        toast.error(data.error || 'خطأ في توليد المحتوى الذكي');
      }
    } catch (error) {
      console.error('خطأ في التوليد الذكي:', error);
      setGenerateStatus('error');
      toast.error('حدث خطأ أثناء التوليد الذكي');
    } finally {
      setGenerating(false);
    }
  };

  // Handle tag addition
  const addTag = (tag: string) => {
    if (tag && !form.tags.includes(tag)) {
      setForm(prev => ({
        ...prev,
        tags: [...prev.tags, tag]
      }));
    }
  };

  // Handle tag removal
  const removeTag = (tagToRemove: string) => {
    setForm(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  if (initialLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className={cn('text-lg', darkMode ? 'text-gray-300' : 'text-gray-600')}>
            جاري تحميل بيانات المقال...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 bg-gray-50 dark:bg-gray-900">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/admin/articles"
                className={cn(
                  'p-2 rounded-lg border transition-colors',
                  darkMode 
                    ? 'border-gray-700 hover:bg-gray-800 text-gray-300' 
                    : 'border-gray-300 hover:bg-gray-100 text-gray-700'
                )}
              >
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <div>
                <h1 className={cn('text-3xl font-bold', darkMode ? 'text-white' : 'text-gray-900')}>
                  تعديل المقال
                </h1>
                <p className={cn('text-sm mt-1', darkMode ? 'text-gray-400' : 'text-gray-600')}>
                  قم بتعديل وتحديث محتوى المقال
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={() => handleSubmit('draft')}
                disabled={loading}
                className={cn(
                  'flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors',
                  darkMode 
                    ? 'border-gray-600 hover:bg-gray-700 text-gray-300' 
                    : 'border-gray-300 hover:bg-gray-50 text-gray-700',
                  loading && 'opacity-50 cursor-not-allowed'
                )}
              >
                <Save className="h-4 w-4" />
                حفظ كمسودة
              </button>
              
              <button
                onClick={() => handleSubmit('published')}
                disabled={loading}
                className={cn(
                  'flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors',
                  loading && 'opacity-50 cursor-not-allowed'
                )}
              >
                {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Eye className="h-4 w-4" />}
                تحديث ونشر
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Title */}
            <div className={cn(
              'p-6 rounded-xl border',
              darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            )}>
              <label className={cn('block text-sm font-medium mb-2', darkMode ? 'text-gray-300' : 'text-gray-700')}>
                عنوان المقال
              </label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm(prev => ({ ...prev, title: e.target.value }))}
                placeholder="اكتب عنوان المقال..."
                className={cn(
                  'w-full px-4 py-3 rounded-lg border text-lg',
                  darkMode 
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                )}
              />
            </div>

            {/* Content Editor */}
            <div className={cn(
              'p-6 rounded-xl border',
              darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            )}>
              <label className={cn('block text-sm font-medium mb-2', darkMode ? 'text-gray-300' : 'text-gray-700')}>
                محتوى المقال
              </label>
              <AdvancedEditor
                content={form.content}
                onChange={(value) => setForm(prev => ({ ...prev, content: value }))}
                placeholder="ابدأ كتابة المقال..."
              />
            </div>

            {/* Excerpt */}
            <div className={cn(
              'p-6 rounded-xl border',
              darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            )}>
              <label className={cn('block text-sm font-medium mb-2', darkMode ? 'text-gray-300' : 'text-gray-700')}>
                الملخص التنفيذي
              </label>
              <textarea
                value={form.excerpt}
                onChange={(e) => setForm(prev => ({ ...prev, excerpt: e.target.value }))}
                placeholder="ملخص مختصر للمقال..."
                rows={4}
                className={cn(
                  'w-full px-4 py-3 rounded-lg border resize-none',
                  darkMode 
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                )}
              />
            </div>

            {/* Featured Image */}
            <div className={cn(
              'p-6 rounded-xl border',
              darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            )}>
              <label className={cn('block text-sm font-medium mb-4', darkMode ? 'text-gray-300' : 'text-gray-700')}>
                الصورة المميزة
              </label>
              <FeaturedImageUpload
                currentImage={form.featured_image}
                onImageUploaded={(imageUrl) => setForm(prev => ({ ...prev, featured_image: imageUrl }))}
                onImageRemoved={() => setForm(prev => ({ ...prev, featured_image: '' }))}
              />
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* AI Generation */}
            <div className={cn(
              'p-6 rounded-xl border',
              darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            )}>
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="h-5 w-5 text-purple-500" />
                <h3 className={cn('font-semibold', darkMode ? 'text-white' : 'text-gray-900')}>
                  التحليل الذكي
                </h3>
              </div>
              
              <button
                onClick={generateAIContent}
                disabled={generating}
                className={cn(
                  'w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white transition-colors',
                  generating && 'opacity-50 cursor-not-allowed'
                )}
              >
                {generating ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <Wand2 className="h-4 w-4" />
                )}
                {generating ? 'جاري التوليد...' : 'توليد محتوى ذكي'}
              </button>

              {/* AI Content Display */}
              {generateStatus === 'success' && aiContent.ai_score > 0 && (
                <div className="mt-4 space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className={cn(darkMode ? 'text-gray-400' : 'text-gray-600')}>تقييم الجودة</span>
                    <span className={cn('font-medium', 
                      aiContent.ai_score >= 0.8 ? 'text-green-500' : 
                      aiContent.ai_score >= 0.6 ? 'text-yellow-500' : 'text-red-500'
                    )}>
                      {Math.round(aiContent.ai_score * 100)}%
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className={cn(darkMode ? 'text-gray-400' : 'text-gray-600')}>وقت القراءة</span>
                    <span className={cn('font-medium', darkMode ? 'text-gray-300' : 'text-gray-700')}>
                      {aiContent.reading_time} دقائق
                    </span>
                  </div>

                  {aiContent.quotes.length > 0 && (
                    <div>
                      <span className={cn('text-sm block mb-2', darkMode ? 'text-gray-400' : 'text-gray-600')}>
                        اقتباسات مميزة
                      </span>
                      <div className="space-y-1">
                        {aiContent.quotes.slice(0, 2).map((quote, index) => (
                          <div key={index} className={cn(
                            'text-xs p-2 rounded italic',
                            darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'
                          )}>
                            "{quote}"
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Article Settings */}
            <div className={cn(
              'p-6 rounded-xl border',
              darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            )}>
              <h3 className={cn('font-semibold mb-4', darkMode ? 'text-white' : 'text-gray-900')}>
                إعدادات المقال
              </h3>
              
              <div className="space-y-4">
                {/* Author */}
                <div>
                  <label className={cn('block text-sm font-medium mb-2', darkMode ? 'text-gray-300' : 'text-gray-700')}>
                    الكاتب
                  </label>
                  <select
                    value={form.article_author_id}
                    onChange={(e) => setForm(prev => ({ ...prev, article_author_id: e.target.value }))}
                    className={cn(
                      'w-full px-3 py-2 rounded-lg border',
                      darkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    )}
                  >
                    <option value="">اختر الكاتب</option>
                    {authors.map((author) => (
                      <option key={author.id} value={author.id}>
                        {author.full_name} {author.title && `(${author.title})`}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Category */}
                <div>
                  <label className={cn('block text-sm font-medium mb-2', darkMode ? 'text-gray-300' : 'text-gray-700')}>
                    التصنيف
                  </label>
                  <select
                    value={form.category_id}
                    onChange={(e) => setForm(prev => ({ ...prev, category_id: e.target.value }))}
                    className={cn(
                      'w-full px-3 py-2 rounded-lg border',
                      darkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    )}
                  >
                    <option value="">اختر التصنيف</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Article Type */}
                <div>
                  <label className={cn('block text-sm font-medium mb-2', darkMode ? 'text-gray-300' : 'text-gray-700')}>
                    نوع المقال
                  </label>
                  <select
                    value={form.article_type}
                    onChange={(e) => setForm(prev => ({ ...prev, article_type: e.target.value as any }))}
                    className={cn(
                      'w-full px-3 py-2 rounded-lg border',
                      darkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    )}
                  >
                    <option value="opinion">مقال رأي</option>
                    <option value="analysis">تحليل</option>
                    <option value="interview">مقابلة</option>
                    <option value="news">خبر</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Tags */}
            <div className={cn(
              'p-6 rounded-xl border',
              darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            )}>
              <div className="flex justify-between items-center mb-4">
                <h3 className={cn('font-semibold', darkMode ? 'text-white' : 'text-gray-900')}>
                  الكلمات المفتاحية
                </h3>
                <span className={cn('text-xs font-medium rounded-full px-2 py-1',
                  form.tags.length > 0 
                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                    : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                )}>
                  {form.tags.length > 0 ? `${form.tags.length} كلمات` : 'لم يتم الإضافة'}
                </span>
              </div>
              
              {/* Tag Input */}
              <div className="mb-3">
                <input
                  type="text"
                  placeholder="أضف كلمة مفتاحية..."
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      const value = e.currentTarget.value.trim();
                      if (value) {
                        addTag(value);
                        e.currentTarget.value = '';
                      }
                    }
                  }}
                  className={cn(
                    'w-full px-3 py-2 rounded-lg border text-sm',
                    darkMode 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  )}
                />
              </div>

              {/* Tags Display */}
              <div className="flex flex-wrap gap-2">
                {form.tags.map((tag, index) => (
                  <span
                    key={index}
                    className={cn(
                      'inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs',
                      darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'
                    )}
                  >
                    {tag}
                    <button
                      onClick={() => removeTag(tag)}
                      className="hover:text-red-500"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>

              {/* AI Suggested Tags */}
              {aiContent.keywords.length > 0 && (
                <div className="mt-4">
                  <p className={cn('text-sm mb-2', darkMode ? 'text-gray-400' : 'text-gray-600')}>
                    كلمات مقترحة:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {aiContent.keywords.filter(keyword => !form.tags.includes(keyword)).map((keyword, index) => (
                      <button
                        key={index}
                        onClick={() => addTag(keyword)}
                        className={cn(
                          'px-2 py-1 rounded-full text-xs border border-dashed transition-colors',
                          darkMode 
                            ? 'border-gray-600 text-gray-400 hover:bg-gray-700' 
                            : 'border-gray-300 text-gray-600 hover:bg-gray-50'
                        )}
                      >
                        + {keyword}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Settings Section */}
            <div className={cn(
              'p-6 rounded-xl border',
              darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            )}>
              <h3 className={cn('font-semibold mb-4', darkMode ? 'text-white' : 'text-gray-900')}>
                إعدادات المقال
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Featured Checkbox */}
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="featured"
                    checked={form.featured}
                    onChange={(e) => setForm(prev => ({ ...prev, featured: e.target.checked }))}
                    className="w-4 h-4 text-primary rounded border-gray-300 focus:ring-primary"
                  />
                  <label htmlFor="featured" className={cn(
                    'text-sm font-medium cursor-pointer',
                    darkMode ? 'text-gray-300' : 'text-gray-700'
                  )}>
                    ⭐ مقال مميز
                  </label>
                </div>
                
                {/* Breaking Checkbox */}
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="breaking"
                    checked={form.breaking}
                    onChange={(e) => setForm(prev => ({ ...prev, breaking: e.target.checked }))}
                    className="w-4 h-4 text-red-500 rounded border-gray-300 focus:ring-red-500"
                  />
                  <label htmlFor="breaking" className={cn(
                    'text-sm font-medium cursor-pointer',
                    darkMode ? 'text-gray-300' : 'text-gray-700'
                  )}>
                    🔥 خبر عاجل
                  </label>
                </div>
              </div>

              {/* Status Info */}
              <div className="mt-4 p-3 rounded-lg bg-gray-50 dark:bg-gray-700">
                <p className={cn('text-sm', darkMode ? 'text-gray-300' : 'text-gray-600')}>
                  <strong>الحالة:</strong> {form.status === 'published' ? 'منشور' : 'مسودة'}
                </p>
                {form.featured && (
                  <p className={cn('text-sm mt-1', darkMode ? 'text-yellow-400' : 'text-yellow-600')}>
                    ⭐ هذا المقال مميز وسيظهر في الأخبار المميزة
                  </p>
                )}
                {form.breaking && (
                  <p className={cn('text-sm mt-1', darkMode ? 'text-red-400' : 'text-red-600')}>
                    🔥 هذا خبر عاجل وسيظهر في الأخبار العاجلة
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
    </div>
  );
};

export default EditArticlePage;