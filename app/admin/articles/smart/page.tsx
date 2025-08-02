'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Save, Eye, Sparkles, Clock, Tag, User, Image, 
  FileText, Wand2, Brain, ArrowLeft, Upload,
  MessageSquare, TrendingUp, BookOpen, Quote,
  RefreshCw, Check, X, Zap, AlertCircle, Loader2
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useDarkModeContext } from '@/contexts/DarkModeContext';
import toast from 'react-hot-toast';
import dynamic from 'next/dynamic';

// Dynamic imports
const AdvancedEditor = dynamic(() => import('@/components/ui/AdvancedEditor'), {
  ssr: false,
  loading: () => <div className="h-96 flex items-center justify-center"><Loader2 className="animate-spin" /></div>
});

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

interface AIContent {
  title: string;
  summary: string;
  quotes: string[];
  keywords: string[];
  reading_time: number;
  ai_score: number;
  processing_time: number;
}

export default function SmartArticlePage() {
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
  
  const [aiContent, setAiContent] = useState<AIContent>({
    title: '',
    summary: '',
    quotes: [],
    keywords: [],
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

  // Generate AI content with quotes
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
        
        toast.success(`✨ تم التوليد بنجاح! الاقتباسات: ${data.quotes?.length || 0}`);
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
        reading_time: aiContent.reading_time || Math.ceil(form.content.replace(/<[^>]*>/g, '').split(' ').length / 225)
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

  return (
    <div className={cn("min-h-screen", darkMode ? "bg-gray-900" : "bg-gray-50")}>
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link 
                href="/admin/articles"
                className={cn(
                  "p-2 rounded-lg transition-colors",
                  darkMode ? "hover:bg-gray-800" : "hover:bg-gray-100"
                )}
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <h1 className={cn("text-2xl font-bold", darkMode ? "text-white" : "text-gray-900")}>
                  📝 محرر المقالات الذكي
                </h1>
                <p className={cn("text-sm", darkMode ? "text-gray-400" : "text-gray-600")}>
                  مع التوليد التلقائي والاقتباسات الذكية
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3">
              <button
                onClick={generateAIContent}
                disabled={generating || !form.content}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all",
                  generating || !form.content
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700 shadow-lg"
                )}
              >
                {generating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                {generating ? 'توليد...' : 'توليد ذكي'}
              </button>

              <button
                onClick={() => saveArticle('draft')}
                disabled={loading}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-lg font-medium",
                  darkMode ? "bg-gray-700 text-white hover:bg-gray-600" : "bg-gray-600 text-white hover:bg-gray-700"
                )}
              >
                <Save className="w-4 h-4" />
                حفظ مسودة
              </button>

              <button
                onClick={() => saveArticle('published')}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700"
              >
                <Eye className="w-4 h-4" />
                نشر
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Author Selection */}
            <div className={cn("p-6 rounded-xl border", darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200")}>
              <label className={cn("block text-sm font-medium mb-3", darkMode ? "text-gray-200" : "text-gray-700")}>
                <User className="w-4 h-4 inline ml-2" />
                الكاتب *
              </label>
              <select
                value={form.article_author_id}
                onChange={(e) => setForm(prev => ({ ...prev, article_author_id: e.target.value }))}
                className={cn(
                  "w-full p-3 rounded-lg border",
                  darkMode 
                    ? "bg-gray-700 border-gray-600 text-white" 
                    : "bg-white border-gray-300 text-gray-900"
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

            {/* Title */}
            <div className={cn("p-6 rounded-xl border", darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200")}>
              <label className={cn("block text-sm font-medium mb-3", darkMode ? "text-gray-200" : "text-gray-700")}>
                العنوان *
              </label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm(prev => ({ ...prev, title: e.target.value }))}
                placeholder="عنوان المقال..."
                className={cn(
                  "w-full p-3 rounded-lg border text-lg",
                  darkMode 
                    ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400" 
                    : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                )}
              />
            </div>

            {/* Excerpt */}
            <div className={cn("p-6 rounded-xl border", darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200")}>
              <label className={cn("block text-sm font-medium mb-3", darkMode ? "text-gray-200" : "text-gray-700")}>
                الموجز
              </label>
              <textarea
                value={form.excerpt}
                onChange={(e) => setForm(prev => ({ ...prev, excerpt: e.target.value }))}
                placeholder="موجز المقال..."
                rows={3}
                className={cn(
                  "w-full p-3 rounded-lg border resize-none",
                  darkMode 
                    ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400" 
                    : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                )}
              />
            </div>

            {/* Content Editor */}
            <div className={cn("p-6 rounded-xl border", darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200")}>
              <label className={cn("block text-sm font-medium mb-3", darkMode ? "text-gray-200" : "text-gray-700")}>
                المحتوى *
              </label>
              <AdvancedEditor
                content={form.content}
                onChange={(content) => setForm(prev => ({ ...prev, content }))}
                placeholder="اكتب محتوى المقال هنا..."
                darkMode={darkMode}
                minHeight="400px"
              />
              <div className="flex justify-between mt-2 text-xs text-gray-500">
                <span>الكلمات: {form.content.replace(/<[^>]*>/g, '').split(' ').filter(w => w.length > 0).length}</span>
                <span>وقت القراءة: {Math.ceil(form.content.replace(/<[^>]*>/g, '').split(' ').length / 225)} دقيقة</span>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            
            {/* AI Status */}
            {generateStatus !== 'idle' && (
              <div className={cn("p-4 rounded-xl border", darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200")}>
                <div className="flex items-center gap-2">
                  {generateStatus === 'generating' && <RefreshCw className="w-4 h-4 animate-spin text-blue-500" />}
                  {generateStatus === 'success' && <Check className="w-4 h-4 text-green-500" />}
                  {generateStatus === 'error' && <X className="w-4 h-4 text-red-500" />}
                  <span className={cn("text-sm font-medium", 
                    generateStatus === 'generating' ? 'text-blue-600' :
                    generateStatus === 'success' ? 'text-green-600' : 'text-red-600'
                  )}>
                    {generateStatus === 'generating' ? 'جاري التوليد...' :
                     generateStatus === 'success' ? 'تم التوليد بنجاح' : 'فشل التوليد'}
                  </span>
                </div>
              </div>
            )}

            {/* AI Generated Quotes */}
            {aiContent.quotes.length > 0 && (
              <div className={cn("p-4 rounded-xl border", darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200")}>
                <h3 className="flex items-center gap-2 font-semibold mb-3">
                  <Quote className="w-4 h-4 text-purple-600" />
                  الاقتباسات الذكية
                  <span className="text-xs bg-purple-100 text-purple-600 px-2 py-1 rounded-full">
                    {aiContent.quotes.length}
                  </span>
                </h3>
                <div className="space-y-3">
                  {aiContent.quotes.map((quote, index) => (
                    <div 
                      key={index}
                      className={cn("p-3 rounded-lg border-r-4 border-purple-500", 
                        darkMode ? "bg-gray-700" : "bg-purple-50"
                      )}
                    >
                      <p className={cn("text-sm italic", darkMode ? "text-gray-200" : "text-gray-700")}>
                        "{quote}"
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* AI Generated Keywords */}
            {aiContent.keywords.length > 0 && (
              <div className={cn("p-4 rounded-xl border", darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200")}>
                <h3 className="flex items-center gap-2 font-semibold mb-3">
                  <Tag className="w-4 h-4 text-blue-600" />
                  الكلمات المفتاحية
                </h3>
                <div className="flex flex-wrap gap-2">
                  {aiContent.keywords.map((keyword, index) => (
                    <span 
                      key={index}
                      className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs"
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* AI Stats */}
            {aiContent.reading_time > 0 && (
              <div className={cn("p-4 rounded-xl border", darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200")}>
                <h3 className="flex items-center gap-2 font-semibold mb-3">
                  <Brain className="w-4 h-4 text-green-600" />
                  إحصائيات الذكاء الاصطناعي
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>وقت القراءة:</span>
                    <span>{aiContent.reading_time} دقيقة</span>
                  </div>
                  <div className="flex justify-between">
                    <span>نقاط الجودة:</span>
                    <span>{aiContent.ai_score}/100</span>
                  </div>
                  <div className="flex justify-between">
                    <span>وقت المعالجة:</span>
                    <span>{aiContent.processing_time}ms</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}