'use client';

import React, { useState, useEffect } from 'react';
import { 
  Save, Eye, Sparkles, Clock, Tag, User, Image, 
  FileText, Wand2, Brain, ArrowLeft, Upload,
  MessageSquare, TrendingUp, BookOpen, Quote,
  RefreshCw, Check, X, Zap, AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useDarkModeContext } from '@/contexts/DarkModeContext';
import toast from 'react-hot-toast';

import FileUpload from '@/components/ui/FileUpload';
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

  // Manual AI content generation
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
          action: ['generate_title', 'create_summary', 'generate_keywords', 'generate_quotes'],
          content: form.content,
          title: form.title
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setAiContent(data);
        setGenerateStatus('success');
        
        // Update form with AI suggestions
        setForm(prev => ({
          ...prev,
          title: data.title || prev.title,
          excerpt: data.summary || prev.excerpt,
          tags: [...new Set([...prev.tags, ...(data.keywords || [])])]
        }));
        
        toast.success(`تم التوليد في ${data.processing_time}ms`);
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
      toast.error('يجب ملء جميع الحقول المطلوبة');
      return;
    }

    setLoading(true);
    
    try {
      const response = await fetch('/api/admin/articles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          status: status,
          summary: aiContent.summary || form.excerpt,
          ai_quotes: aiContent.quotes,
          reading_time: aiContent.reading_time || Math.ceil(form.content.replace(/<[^>]*>/g, '').split(' ').filter(w => w.length > 0).length / 225)
        })
      });

      const data = await response.json();
      
      if (data.success) {
        toast.success(status === 'published' ? 'تم نشر المقال بنجاح' : 'تم حفظ المقال كمسودة');
        router.push('/admin/articles');
      } else {
        toast.error('خطأ في حفظ المقال');
      }
    } catch (error) {
      console.error('خطأ في الحفظ:', error);
      toast.error('خطأ في الاتصال بالخادم');
    } finally {
      setLoading(false);
    }
  };

  // Handle tag input
  const handleTagInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && e.currentTarget.value.trim()) {
      const newTag = e.currentTarget.value.trim();
      if (!form.tags.includes(newTag)) {
        setForm(prev => ({
          ...prev,
          tags: [...prev.tags, newTag]
        }));
      }
      e.currentTarget.value = '';
    }
  };

  const removeTag = (tagToRemove: string) => {
    setForm(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const getTypeIcon = (type: string) => {
    const icons = {
      opinion: MessageSquare,
      analysis: TrendingUp,
      interview: User,
      news: FileText
    };
    
    return icons[type as keyof typeof icons] || MessageSquare;
  };

  const getTypeLabel = (type: string) => {
    const labels = {
      opinion: 'مقال رأي',
      analysis: 'تحليل',
      interview: 'مقابلة',
      news: 'خبر'
    };
    
    return labels[type as keyof typeof labels] || 'مقال رأي';
  };

  return (
    <div className={cn('min-h-screen p-6', darkMode ? 'bg-gray-900' : 'bg-gray-50')}>
        
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/admin/articles"
                className={cn(
                  'p-2 rounded-lg transition-colors',
                  darkMode 
                    ? 'text-gray-400 hover:text-white hover:bg-gray-800' 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                )}
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              
              <div>
                <h1 className={cn('text-3xl font-bold mb-2', darkMode ? 'text-white' : 'text-gray-900')}>
                  مقال جديد
                </h1>
                <p className={cn('text-sm', darkMode ? 'text-gray-400' : 'text-gray-600')}>
                  إنشاء مقال جديد مع الذكاء الاصطناعي
                </p>
              </div>
            </div>
            
            <div className="flex gap-3">
              {/* حالة التوليد الذكي */}
              <div className="flex items-center gap-2">
                {generateStatus === 'generating' && (
                  <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400">
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span className="text-sm">جاري التوليد...</span>
                  </div>
                )}
                {generateStatus === 'success' && (
                  <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                    <Check className="w-4 h-4" />
                    <span className="text-sm">تم التوليد</span>
                  </div>
                )}
                {generateStatus === 'error' && (
                  <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                    <X className="w-4 h-4" />
                    <span className="text-sm">فشل التوليد</span>
                  </div>
                )}
              </div>
              
              <button
                onClick={generateAIContent}
                disabled={generating || !form.content}
                className={cn(
                  'flex items-center gap-2 px-4 py-2 rounded-lg transition-colors disabled:opacity-50',
                  generateStatus === 'success' 
                    ? 'bg-green-600 hover:bg-green-700 text-white'
                    : generateStatus === 'error'
                    ? 'bg-red-600 hover:bg-red-700 text-white'
                    : darkMode 
                      ? 'bg-purple-600 hover:bg-purple-700 text-white disabled:bg-gray-700' 
                      : 'bg-purple-600 hover:bg-purple-700 text-white disabled:bg-gray-300'
                )}
              >
                {generating ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : generateStatus === 'success' ? (
                  <Check className="w-4 h-4" />
                ) : generateStatus === 'error' ? (
                  <RefreshCw className="w-4 h-4" />
                ) : (
                  <Sparkles className="w-4 h-4" />
                )}
                {generateStatus === 'success' ? 'تم التوليد' : 
                 generateStatus === 'error' ? 'إعادة المحاولة' : 
                 'توليد ذكي'}
              </button>
              
              <button
                onClick={() => saveArticle('draft')}
                disabled={loading}
                className={cn(
                  'flex items-center gap-2 px-4 py-2 rounded-lg transition-colors disabled:opacity-50',
                  darkMode 
                    ? 'bg-gray-700 hover:bg-gray-600 text-white' 
                    : 'bg-gray-200 hover:bg-gray-300 text-gray-900'
                )}
              >
                <Save className="w-4 h-4" />
                حفظ كمسودة
              </button>
              
              <button
                onClick={() => saveArticle('published')}
                disabled={loading}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
              >
                {loading ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
                نشر المقال
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* 1. الكاتب */}
            <div className={cn(
              'p-6 rounded-xl border',
              darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            )}>
              <label className={cn('block text-sm font-medium mb-2', darkMode ? 'text-gray-300' : 'text-gray-700')}>
                <User className="w-4 h-4 inline ml-2" />
                الكاتب *
              </label>
              <select
                value={form.article_author_id}
                onChange={(e) => setForm(prev => ({ ...prev, article_author_id: e.target.value }))}
                className={cn(
                  'w-full p-3 rounded-lg border',
                  darkMode 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-white border-gray-300 text-gray-900'
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
              'p-6 rounded-xl border',
              darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            )}>
              <label className={cn('block text-sm font-medium mb-4', darkMode ? 'text-gray-300' : 'text-gray-700')}>
                <FileText className="w-4 h-4 inline ml-2" />
                نوع المقال
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {(['opinion', 'analysis', 'interview', 'news'] as const).map(type => {
                  const Icon = getTypeIcon(type);
                  return (
                    <button
                      key={type}
                      onClick={() => setForm(prev => ({ ...prev, article_type: type }))}
                      className={cn(
                        'p-4 rounded-lg border transition-colors text-sm flex flex-col items-center gap-2',
                        form.article_type === type
                          ? darkMode 
                            ? 'bg-blue-600 border-blue-500 text-white' 
                            : 'bg-blue-100 border-blue-300 text-blue-800'
                          : darkMode 
                            ? 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600' 
                            : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                      )}
                    >
                      <Icon className="w-6 h-6" />
                      {getTypeLabel(type)}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 3. العنوان */}
            <div className={cn(
              'p-6 rounded-xl border',
              darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            )}>
              <label className={cn('block text-sm font-medium mb-2', darkMode ? 'text-gray-300' : 'text-gray-700')}>
                العنوان *
              </label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm(prev => ({ ...prev, title: e.target.value }))}
                placeholder={aiContent.title || "أدخل عنوان المقال..."}
                className={cn(
                  'w-full p-3 rounded-lg border text-lg font-medium',
                  darkMode 
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                )}
              />
              {aiContent.title && !form.title && (
                <button
                  onClick={() => setForm(prev => ({ ...prev, title: aiContent.title }))}
                  className="mt-2 text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                >
                  <Sparkles className="w-3 h-3" />
                  استخدام العنوان المقترح: "{aiContent.title.substring(0, 50)}..."
                </button>
              )}
            </div>

            {/* 4. الملخص */}
            <div className={cn(
              'p-6 rounded-xl border',
              darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            )}>
              <label className={cn('block text-sm font-medium mb-2', darkMode ? 'text-gray-300' : 'text-gray-700')}>
                الملخص
                {aiContent.summary && (
                  <span className="text-xs text-purple-600 dark:text-purple-400 ml-2">
                    (تم توليده تلقائياً)
                  </span>
                )}
              </label>
              <textarea
                value={form.excerpt}
                onChange={(e) => setForm(prev => ({ ...prev, excerpt: e.target.value }))}
                placeholder={aiContent.summary || "ملخص المقال (سيتم توليده تلقائياً)"}
                rows={3}
                className={cn(
                  'w-full p-3 rounded-lg border',
                  darkMode 
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                )}
              />
              {aiContent.summary && !form.excerpt && (
                <button
                  onClick={() => setForm(prev => ({ ...prev, excerpt: aiContent.summary }))}
                  className="mt-2 text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                >
                  <Sparkles className="w-3 h-3" />
                  استخدام الملخص المولّد
                </button>
              )}
            </div>

            {/* 5. المحتوى */}
            <div className={cn(
              'p-6 rounded-xl border',
              darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            )}>
              <label className={cn('block text-sm font-medium mb-2', darkMode ? 'text-gray-300' : 'text-gray-700')}>
                محتوى المقال *
              </label>
              <AdvancedEditor
                content={form.content}
                onChange={(content) => setForm(prev => ({ ...prev, content }))}
                placeholder="ابدأ كتابة المقال هنا... سيتم توليد المحتوى الذكي تلقائياً بعد كتابة 100 حرف"
                darkMode={darkMode}
                minHeight="500px"
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

            {/* AI Generated Quotes */}
            {aiContent.quotes.length > 0 && (
              <div className={cn(
                'p-6 rounded-xl border',
                darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
              )}>
                <div className="flex items-center gap-2 mb-4">
                  <Quote className={cn('w-5 h-5', darkMode ? 'text-purple-400' : 'text-purple-600')} />
                  <h3 className={cn('font-medium', darkMode ? 'text-white' : 'text-gray-900')}>
                    اقتباسات ذكية
                  </h3>
                  <span className={cn('text-xs px-2 py-1 rounded-full', 
                    darkMode ? 'bg-purple-900/20 text-purple-400' : 'bg-purple-100 text-purple-600'
                  )}>
                    AI
                  </span>
                </div>
                
                <div className="space-y-3">
                  {aiContent.quotes.map((quote, index) => (
                    <div
                      key={index}
                      className={cn(
                        'p-4 rounded-lg border-r-4 border-purple-500',
                        darkMode ? 'bg-gray-700/50' : 'bg-purple-50'
                      )}
                    >
                      <p className={cn('text-sm italic', darkMode ? 'text-gray-300' : 'text-gray-700')}>
                        "{quote}"
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            
            {/* 6. الصورة المميزة */}
            <div className={cn(
              'p-6 rounded-xl border',
              darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            )}>
              <h3 className={cn('font-medium mb-4 flex items-center gap-2', darkMode ? 'text-white' : 'text-gray-900')}>
                <Image className="w-5 h-5" />
                الصورة المميزة
              </h3>
              
              <FileUpload
                accept="image/*"
                maxSize="5MB"
                onUpload={(url) => setForm(prev => ({ ...prev, featured_image: url }))}
                currentImage={form.featured_image}
                darkMode={darkMode}
              />
              
              {/* رابط يدوي كبديل */}
              <div className="mt-4">
                <label className={cn('block text-xs font-medium mb-2', darkMode ? 'text-gray-400' : 'text-gray-600')}>
                  أو أدخل رابط الصورة يدوياً
                </label>
                <input
                  type="url"
                  value={form.featured_image}
                  onChange={(e) => setForm(prev => ({ ...prev, featured_image: e.target.value }))}
                  placeholder="https://example.com/image.jpg"
                  className={cn(
                    'w-full p-2 rounded-lg border text-sm',
                    darkMode 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  )}
                />
              </div>
            </div>

            {/* 7. الكلمات المفتاحية */}
            <div className={cn(
              'p-6 rounded-xl border',
              darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            )}>
              <h3 className={cn('font-medium mb-4 flex items-center gap-2', darkMode ? 'text-white' : 'text-gray-900')}>
                <Tag className="w-5 h-5" />
                الكلمات المفتاحية
                {aiContent.keywords && aiContent.keywords.length > 0 && (
                  <span className="text-xs text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-900/20 px-2 py-1 rounded-full">
                    AI: {aiContent.keywords.length}
                  </span>
                )}
              </h3>
              
              {/* الكلمات المقترحة من الذكاء الاصطناعي */}
              {aiContent.keywords && aiContent.keywords.length > 0 && (
                <div className="mb-4">
                  <label className={cn('block text-xs font-medium mb-2', darkMode ? 'text-gray-400' : 'text-gray-600')}>
                    <Sparkles className="w-3 h-3 inline ml-1" />
                    كلمات مقترحة (اضغط لإضافة)
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {aiContent.keywords
                      .filter(keyword => !form.tags.includes(keyword))
                      .map((keyword, index) => (
                        <button
                          key={index}
                          onClick={() => {
                            if (!form.tags.includes(keyword)) {
                              setForm(prev => ({
                                ...prev,
                                tags: [...prev.tags, keyword]
                              }));
                            }
                          }}
                          className={cn(
                            'px-3 py-1 rounded-full text-sm border transition-colors hover:scale-105',
                            darkMode 
                              ? 'bg-purple-900/20 text-purple-400 border-purple-700 hover:bg-purple-800/30' 
                              : 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100'
                          )}
                        >
                          + {keyword}
                        </button>
                      ))}
                  </div>
                </div>
              )}
              
              {/* إدخال يدوي */}
              <input
                type="text"
                placeholder="أضف كلمة مفتاحية واضغط Enter"
                onKeyDown={handleTagInput}
                className={cn(
                  'w-full p-3 rounded-lg border mb-3',
                  darkMode 
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                )}
              />
              
              {/* الكلمات المضافة */}
              <div className="flex flex-wrap gap-2">
                {form.tags.map((tag, index) => (
                  <span
                    key={index}
                    className={cn(
                      'px-3 py-1 rounded-full text-sm flex items-center gap-2',
                      aiContent.keywords?.includes(tag)
                        ? darkMode 
                          ? 'bg-purple-900/20 text-purple-400 border border-purple-800' 
                          : 'bg-purple-100 text-purple-800 border border-purple-200'
                        : darkMode 
                          ? 'bg-blue-900/20 text-blue-400 border border-blue-800' 
                          : 'bg-blue-100 text-blue-800 border border-blue-200'
                    )}
                  >
                    {aiContent.keywords?.includes(tag) && (
                      <Sparkles className="w-3 h-3" />
                    )}
                    {tag}
                    <button
                      onClick={() => removeTag(tag)}
                      className="hover:text-red-500 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
              
              {form.tags.length === 0 && aiContent.keywords && aiContent.keywords.length > 0 && (
                <button
                  onClick={() => setForm(prev => ({ ...prev, tags: [...aiContent.keywords] }))}
                  className="mt-3 text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                >
                  <Sparkles className="w-3 h-3" />
                  إضافة جميع الكلمات المقترحة ({aiContent.keywords.length})
                </button>
              )}
            </div>

            {/* 8. اقتباسات ذكية وتقييم الذكاء الاصطناعي */}
            <div className={cn(
              'p-6 rounded-xl border',
              darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            )}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Brain className={cn('w-5 h-5', darkMode ? 'text-purple-400' : 'text-purple-600')} />
                  <h3 className={cn('font-medium', darkMode ? 'text-white' : 'text-gray-900')}>
                    الاقتباسات الذكية والتحليل
                  </h3>
                </div>
                
                {/* زر توليد المحتوى */}
                <Button
                  onClick={generateAIContent}
                  disabled={generating || !form.content}
                  size="sm"
                  className="bg-purple-600 hover:bg-purple-700 text-white gap-2"
                >
                  {generating ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      جاري التوليد...
                    </>
                  ) : (
                    <>
                      <Wand2 className="w-4 h-4" />
                      توليد ذكي
                    </>
                  )}
                </Button>
              </div>
                
                {/* AI Score */}
                {aiContent.ai_score > 0 && (
                  <div className="text-center mb-6">
                    <div className={cn('text-3xl font-bold mb-2', 
                      aiContent.ai_score >= 80 ? 'text-green-500' :
                      aiContent.ai_score >= 60 ? 'text-yellow-500' : 'text-red-500'
                    )}>
                      {aiContent.ai_score}%
                    </div>
                    <p className={cn('text-sm', darkMode ? 'text-gray-400' : 'text-gray-600')}>
                      جودة المحتوى والأسلوب
                    </p>
                    {aiContent.processing_time > 0 && (
                      <p className={cn('text-xs mt-1', darkMode ? 'text-gray-500' : 'text-gray-500')}>
                        تم التحليل في {aiContent.processing_time}ms
                      </p>
                    )}
                  </div>
                )}
                
              {/* AI Quotes */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Quote className={cn('w-4 h-4', darkMode ? 'text-purple-400' : 'text-purple-600')} />
                  <h4 className={cn('font-medium text-sm', darkMode ? 'text-white' : 'text-gray-900')}>
                    الاقتباسات الذكية
                  </h4>
                  {aiContent.quotes.length > 0 && (
                    <span className={cn('text-xs px-2 py-1 rounded-full', 
                      darkMode ? 'bg-purple-900/20 text-purple-400' : 'bg-purple-100 text-purple-600'
                    )}>
                      {aiContent.quotes.length}
                    </span>
                  )}
                </div>
                
                {aiContent.quotes.length > 0 ? (
                  <div className="space-y-3">
                    {aiContent.quotes.map((quote, index) => (
                      <div
                        key={index}
                        className={cn(
                          'p-3 rounded-lg border-r-4 border-purple-500',
                          darkMode ? 'bg-gray-700/50' : 'bg-purple-50'
                        )}
                      >
                        <p className={cn('text-sm italic', darkMode ? 'text-gray-300' : 'text-gray-700')}>
                          "{quote}"
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className={cn(
                    'p-4 rounded-lg border-2 border-dashed text-center',
                    darkMode ? 'border-gray-600 bg-gray-700/50' : 'border-gray-300 bg-gray-50'
                  )}>
                    <Quote className={cn('w-8 h-8 mx-auto mb-2', darkMode ? 'text-gray-500' : 'text-gray-400')} />
                    <p className={cn('text-sm mb-2', darkMode ? 'text-gray-400' : 'text-gray-600')}>
                      لم يتم توليد اقتباسات ذكية بعد
                    </p>
                    <p className={cn('text-xs', darkMode ? 'text-gray-500' : 'text-gray-500')}>
                      اكتب المحتوى أولاً ثم اضغط "توليد ذكي" لاستخراج أفضل الاقتباسات
                    </p>
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

          </div>
        </div>

      </div>
    </div>
  );
};

export default NewArticlePage;