'use client';

import React, { useState, useEffect } from 'react';
import { 
  Save, Eye, Sparkles, Clock, Tag, User, Image, 
  FileText, Wand2, Brain, ArrowLeft, Upload,
  MessageSquare, TrendingUp, BookOpen, Quote,
  RefreshCw, Check, X, Zap
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useDarkModeContext } from '@/contexts/DarkModeContext';
import toast from 'react-hot-toast';
import DashboardLayout from '@/components/layout/DashboardLayout';

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
    summary: '',
    quotes: [] as string[],
    readingTime: 0,
    tags: [] as string[],
    aiScore: 0
  });

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

  // Generate AI content
  const generateAIContent = async () => {
    if (!form.title || !form.content) {
      toast.error('يجب إدخال العنوان والمحتوى أولاً');
      return;
    }

    setGenerating(true);
    
    try {
      const response = await fetch('/api/admin/articles/generate-ai-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: form.title,
          content: form.content
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setAiContent(data.content);
        
        // Update form with AI suggestions
        setForm(prev => ({
          ...prev,
          excerpt: prev.excerpt || data.content.summary,
          tags: [...new Set([...prev.tags, ...data.content.tags])]
        }));
        
        toast.success('تم توليد المحتوى الذكي بنجاح');
      } else {
        toast.error('خطأ في توليد المحتوى الذكي');
      }
    } catch (error) {
      console.error('خطأ في توليد المحتوى:', error);
      toast.error('خطأ في الاتصال بالخادم');
    } finally {
      setGenerating(false);
    }
  };

  // Save article
  const saveArticle = async () => {
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
          summary: aiContent.summary,
          ai_quotes: aiContent.quotes,
          reading_time: aiContent.readingTime || Math.ceil(form.content.split(' ').length / 225)
        })
      });

      const data = await response.json();
      
      if (data.success) {
        toast.success(form.status === 'published' ? 'تم نشر المقال بنجاح' : 'تم حفظ المقال كمسودة');
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
    <DashboardLayout>
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
              <button
                onClick={generateAIContent}
                disabled={generating || !form.title || !form.content}
                className={cn(
                  'flex items-center gap-2 px-4 py-2 rounded-lg transition-colors disabled:opacity-50',
                  darkMode 
                    ? 'bg-purple-600 hover:bg-purple-700 text-white disabled:bg-gray-700' 
                    : 'bg-purple-600 hover:bg-purple-700 text-white disabled:bg-gray-300'
                )}
              >
                {generating ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4" />
                )}
                توليد ذكي
              </button>
              
              <button
                onClick={() => setForm(prev => ({ ...prev, status: 'draft' }))}
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
                onClick={() => {
                  setForm(prev => ({ ...prev, status: 'published' }));
                  saveArticle();
                }}
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
            
            {/* Title */}
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
                placeholder="أدخل عنوان المقال..."
                className={cn(
                  'w-full p-3 rounded-lg border text-lg font-medium',
                  darkMode 
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                )}
              />
            </div>

            {/* Content */}
            <div className={cn(
              'p-6 rounded-xl border',
              darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            )}>
              <label className={cn('block text-sm font-medium mb-2', darkMode ? 'text-gray-300' : 'text-gray-700')}>
                محتوى المقال *
              </label>
              <textarea
                value={form.content}
                onChange={(e) => setForm(prev => ({ ...prev, content: e.target.value }))}
                placeholder="اكتب محتوى المقال هنا..."
                rows={20}
                className={cn(
                  'w-full p-4 rounded-lg border resize-none',
                  darkMode 
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                )}
              />
              <div className="flex justify-between mt-2 text-xs text-gray-500">
                <span>الكلمات: {form.content.split(' ').filter(w => w.length > 0).length}</span>
                <span>وقت القراءة المتوقع: {Math.ceil(form.content.split(' ').length / 225)} دقيقة</span>
              </div>
            </div>

            {/* Excerpt */}
            <div className={cn(
              'p-6 rounded-xl border',
              darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            )}>
              <label className={cn('block text-sm font-medium mb-2', darkMode ? 'text-gray-300' : 'text-gray-700')}>
                الملخص
              </label>
              <textarea
                value={form.excerpt}
                onChange={(e) => setForm(prev => ({ ...prev, excerpt: e.target.value }))}
                placeholder="ملخص المقال (سيتم توليده تلقائياً)"
                rows={3}
                className={cn(
                  'w-full p-3 rounded-lg border',
                  darkMode 
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                )}
              />
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
            
            {/* Article Details */}
            <div className={cn(
              'p-6 rounded-xl border',
              darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            )}>
              <h3 className={cn('font-medium mb-4', darkMode ? 'text-white' : 'text-gray-900')}>
                تفاصيل المقال
              </h3>
              
              {/* Author */}
              <div className="mb-4">
                <label className={cn('block text-sm font-medium mb-2', darkMode ? 'text-gray-300' : 'text-gray-700')}>
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

              {/* Article Type */}
              <div className="mb-4">
                <label className={cn('block text-sm font-medium mb-2', darkMode ? 'text-gray-300' : 'text-gray-700')}>
                  نوع المقال
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {(['opinion', 'analysis', 'interview', 'news'] as const).map(type => {
                    const Icon = getTypeIcon(type);
                    return (
                      <button
                        key={type}
                        onClick={() => setForm(prev => ({ ...prev, article_type: type }))}
                        className={cn(
                          'p-3 rounded-lg border transition-colors text-sm',
                          form.article_type === type
                            ? darkMode 
                              ? 'bg-blue-600 border-blue-500 text-white' 
                              : 'bg-blue-100 border-blue-300 text-blue-800'
                            : darkMode 
                              ? 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600' 
                              : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                        )}
                      >
                        <Icon className="w-4 h-4 mx-auto mb-1" />
                        {getTypeLabel(type)}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Featured Image */}
              <div className="mb-4">
                <label className={cn('block text-sm font-medium mb-2', darkMode ? 'text-gray-300' : 'text-gray-700')}>
                  الصورة المميزة
                </label>
                <input
                  type="url"
                  value={form.featured_image}
                  onChange={(e) => setForm(prev => ({ ...prev, featured_image: e.target.value }))}
                  placeholder="رابط الصورة"
                  className={cn(
                    'w-full p-3 rounded-lg border',
                    darkMode 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  )}
                />
                {form.featured_image && (
                  <img
                    src={form.featured_image}
                    alt="Preview"
                    className="mt-2 w-full h-32 object-cover rounded-lg"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                )}
              </div>
            </div>

            {/* Tags */}
            <div className={cn(
              'p-6 rounded-xl border',
              darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            )}>
              <h3 className={cn('font-medium mb-4', darkMode ? 'text-white' : 'text-gray-900')}>
                الكلمات المفتاحية
              </h3>
              
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
              
              <div className="flex flex-wrap gap-2">
                {form.tags.map((tag, index) => (
                  <span
                    key={index}
                    className={cn(
                      'px-3 py-1 rounded-full text-sm flex items-center gap-2',
                      darkMode 
                        ? 'bg-blue-900/20 text-blue-400 border border-blue-800' 
                        : 'bg-blue-100 text-blue-800 border border-blue-200'
                    )}
                  >
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
            </div>

            {/* AI Score Preview */}
            {aiContent.aiScore > 0 && (
              <div className={cn(
                'p-6 rounded-xl border',
                darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
              )}>
                <div className="flex items-center gap-2 mb-4">
                  <Brain className={cn('w-5 h-5', darkMode ? 'text-purple-400' : 'text-purple-600')} />
                  <h3 className={cn('font-medium', darkMode ? 'text-white' : 'text-gray-900')}>
                    تقييم الذكاء الاصطناعي
                  </h3>
                </div>
                
                <div className="text-center">
                  <div className={cn('text-3xl font-bold mb-2', 
                    aiContent.aiScore >= 80 ? 'text-green-500' :
                    aiContent.aiScore >= 60 ? 'text-yellow-500' : 'text-red-500'
                  )}>
                    {aiContent.aiScore}%
                  </div>
                  <p className={cn('text-sm', darkMode ? 'text-gray-400' : 'text-gray-600')}>
                    جودة المحتوى والأسلوب
                  </p>
                </div>
              </div>
            )}

          </div>
        </div>

      </div>
    </DashboardLayout>
  );
};

export default NewArticlePage;