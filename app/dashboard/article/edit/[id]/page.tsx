'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  Save, Eye, Send, AlertTriangle, Plus, ArrowUp, ArrowDown, 
  Trash2, Image, Video, Quote, Type, List, Link, Palette,
  Sparkles, Brain, MapPin, Clock, User, Globe, Settings,
  Upload, Play, MessageSquare, Hash, FileText, CheckCircle,
  XCircle, Lightbulb, Zap, Target, Star, RefreshCw,
  Wand2, Layers, Layout, PenTool, BookOpen, Award,
  TrendingUp, Activity, BarChart3, Rocket, Heart,
  Shield, Crown, Gem, Flame, Coffee, Music,
  Camera, Mic, Headphones, Wifi, Cpu, Database, Mail,
  Share2, Calendar, ArrowLeft, Loader2, Edit3, Info
} from 'lucide-react';

// استيراد المكونات
import ContentEditorWithBlocks from '../../../../../components/ContentEditorWithBlocks';
import FeaturedImageUpload from '../../../../../components/FeaturedImageUpload';
import { logActions, getCurrentUser } from '../../../../../lib/log-activity';
import { useDarkMode } from '../../../../../hooks/useDarkMode';

// ===============================
// أنواع البيانات
// ===============================

interface ArticleFormData {
  id?: string;
  title: string;
  subtitle: string;
  description: string;
  category_id: number;
  subcategory_id?: number;
  is_breaking: boolean;
  is_featured: boolean;
  is_smart_newsletter: boolean;
  ai_category_suggestion?: string;
  ai_summary?: string;
  keywords: string[];
  cover_image?: string;
  cover_video?: string;
  location?: {
    lat: number;
    lng: number;
    address: string;
  };
  publish_time: string;
  author_id: string;
  scope: 'local' | 'international';
  status: 'draft' | 'review' | 'published';
  content_blocks: ContentBlock[];
  featured_image?: string;
  featured_image_alt?: string;
}

// استخدام أنواع Block من محرر البلوكات
import { Block } from '../../../../../components/BlockEditor/types';

// ContentBlock سيكون مرادف لـ Block
type ContentBlock = Block;

interface Category {
  id: number;
  name_ar: string;
  name_en?: string;
  color_hex: string;
  icon?: string;
  children?: Category[];
  position?: number;
  is_active?: boolean;
}

// نوع بيانات المراسل
interface Reporter {
  id: string;
  name: string;
  avatar?: string;
}

export default function EditArticlePage() {
  const params = useParams();
  const router = useRouter();
  const { darkMode } = useDarkMode();
  const articleId = params?.id as string;

  const [formData, setFormData] = useState<ArticleFormData>({
    title: '',
    subtitle: '',
    description: '',
    category_id: 1,
    is_breaking: false,
    is_featured: false,
    is_smart_newsletter: false,
    keywords: [],
    publish_time: '',
    author_id: 'current_user',
    scope: 'local',
    status: 'draft',
    content_blocks: []
  });

  const [categories, setCategories] = useState<Category[]>([]);
  const [reporters, setReporters] = useState<Reporter[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [autoSaveStatus, setAutoSaveStatus] = useState<'saved' | 'saving' | 'error'>('saved');
  const [previewMode, setPreviewMode] = useState(false);
  const [activeTab, setActiveTab] = useState<'content' | 'settings' | 'seo' | 'ai' | 'publish'>('content');
  const [aiLoading, setAiLoading] = useState<{ [key: string]: boolean }>({});
  const [qualityScore, setQualityScore] = useState(0);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [wordCount, setWordCount] = useState(0);
  const [readingTime, setReadingTime] = useState(0);
  const [articleLoading, setArticleLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // تحميل بيانات المقال
  useEffect(() => {
    const fetchArticle = async () => {
      try {
        setArticleLoading(true);
        const res = await fetch(`/api/articles/${articleId}`);
        if (!res.ok) {
          throw new Error('فشل في جلب المقال');
        }
        
        const articleData = await res.json();
        
        // تحويل البيانات إلى تنسيق النموذج
        setFormData({
          id: articleData.id,
          title: articleData.title || '',
          subtitle: articleData.subtitle || '',
          description: articleData.summary || '',
          category_id: articleData.category_id || 1,
          subcategory_id: articleData.subcategory_id,
          is_breaking: articleData.is_breaking || false,
          is_featured: articleData.is_featured || false,
          is_smart_newsletter: articleData.is_smart_newsletter || false,
          keywords: (() => {
            // دعم مختلف أنواع البيانات للكلمات المفتاحية
            const keywordsData = articleData.seo_keywords || articleData.keywords || articleData.tags || [];
            console.log('Loading keywords:', keywordsData);
            
            if (Array.isArray(keywordsData)) {
              return keywordsData.filter(k => k && typeof k === 'string' && k.trim());
            } else if (typeof keywordsData === 'string' && keywordsData.trim()) {
              return keywordsData.split(',').map((k: string) => k.trim()).filter((k: string) => k);
            }
            return [];
          })(),
          cover_image: articleData.featured_image || '',
          cover_video: articleData.featured_video || '',
          publish_time: articleData.publish_at || new Date().toISOString(),
          author_id: articleData.author_id || 'current_user',
          scope: articleData.scope || 'local',
          status: articleData.status || 'draft',
          content_blocks: articleData.content_blocks || [],
          featured_image: articleData.featured_image || '',
          featured_image_alt: articleData.featured_image_alt || ''
        });
      } catch (err) {
        console.error('خطأ في تحميل المقال:', err);
        setLoadError(err instanceof Error ? err.message : 'المقال غير موجود أو حدث خطأ');
      } finally {
        setArticleLoading(false);
      }
    };

    if (articleId) {
      fetchArticle();
    }
  }, [articleId]);

  // تحميل التصنيفات الحقيقية من API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const res = await fetch('/api/categories?active_only=true');
        const result = await res.json();
        if (!res.ok || !result.success) throw new Error(result.error || 'فشل تحميل التصنيفات');

        const sorted = (result.data as Category[])
          .filter(cat => cat.is_active)
          .sort((a, b) => (a.position || 0) - (b.position || 0));

        setCategories(sorted);
      } catch (err) {
        console.error('خطأ في تحميل التصنيفات:', err);
        setCategories([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // تحميل المراسلين
  useEffect(() => {
    const fetchReporters = async () => {
      try {
        const res = await fetch('/api/team-members');
        const result = await res.json();
        if (res.ok && result.success && Array.isArray(result.data)) {
          // فلترة أعضاء الفريق حسب الأدوار المطلوبة
          const reps = result.data
            .filter((m: any) => m.isActive && ['admin', 'editor', 'media', 'correspondent', 'content-manager'].includes(m.roleId))
            .map((m: any) => ({ id: m.id, name: m.name, avatar: m.avatar }));
          setReporters(reps);
        }
      } catch (err) {
        console.error('خطأ في تحميل المراسلين:', err);
      }
    };

    fetchReporters();
  }, []);

  // حساب عدد الكلمات ووقت القراءة
  useEffect(() => {
    // التحقق من وجود content_blocks
    if (!formData.content_blocks || !Array.isArray(formData.content_blocks)) {
      setWordCount(0);
      setReadingTime(0);
      return;
    }

    const text = formData.content_blocks
      .filter(b => b && b.type && (b.type === 'paragraph' || b.type === 'heading'))
      .map(b => {
        // التحقق من وجود b.data قبل محاولة الوصول إليه
        if (!b.data) return '';
        
        const blockData = b.data[b.type] || b.data;
        
        // معالجة أنواع مختلفة من البيانات
        if (typeof blockData === 'string') return blockData;
        if (blockData && typeof blockData === 'object' && 'text' in blockData) return blockData.text;
        if (blockData && typeof blockData === 'object' && 'content' in blockData) return blockData.content;
        
        return '';
      })
      .join(' ');
    
    const trimmedText = text.trim();
    const words = trimmedText ? trimmedText.split(/\s+/).length : 0;
    setWordCount(words);
    setReadingTime(Math.ceil(words / 200)); // متوسط 200 كلمة في الدقيقة
  }, [formData.content_blocks]);

  // حفظ تلقائي كل 30 ثانية
  useEffect(() => {
    const interval = setInterval(() => {
      if (formData.title.trim()) {
        autoSave();
      }
    }, 30000);
    return () => clearInterval(interval);
  }, [formData]);

  // تحليل جودة المقال
  useEffect(() => {
    calculateQualityScore();
  }, [formData.title, formData.description, formData.content_blocks, formData.keywords]);

  const autoSave = useCallback(async () => {
    setAutoSaveStatus('saving');
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setAutoSaveStatus('saved');
    } catch (error) {
      setAutoSaveStatus('error');
    }
  }, [formData]);

  const calculateQualityScore = () => {
    let score = 0;
    
    // العنوان (20 نقطة)
    if (formData.title && formData.title.length > 10 && formData.title.length < 80) score += 20;
    else if (formData.title && formData.title.length > 0) score += 10;
    
    // الوصف (15 نقطة)
    if (formData.description && formData.description.length > 50 && formData.description.length < 160) score += 15;
    else if (formData.description && formData.description.length > 0) score += 8;
    
    // المحتوى (30 نقطة)
    if (formData.content_blocks && Array.isArray(formData.content_blocks)) {
      const textBlocks = formData.content_blocks.filter(b => b && b.type === 'paragraph');
      if (textBlocks.length >= 3) score += 30;
      else if (textBlocks.length > 0) score += 15;
      
      // الصور (15 نقطة)
      const imageBlocks = formData.content_blocks.filter(b => b && b.type === 'image');
      if (imageBlocks.length >= 1) score += 15;
    }
    
    // التصنيف (10 نقطة)
    if (formData.category_id > 0) score += 10;
    
    // الكلمات المفتاحية (10 نقطة)
    if (formData.keywords && Array.isArray(formData.keywords)) {
      if (formData.keywords.length >= 3) score += 10;
      else if (formData.keywords.length > 0) score += 5;
    }
    
    setQualityScore(score);
  };

  const validateForm = (): string[] => {
    const errors: string[] = [];
    
    if (!formData.title || !formData.title.trim()) errors.push('العنوان الرئيسي مطلوب');
    if (!formData.author_id || !formData.author_id.trim()) errors.push('اسم المراسل مطلوب');
    if (formData.title && formData.title.length > 100) errors.push('العنوان طويل جداً (أكثر من 100 حرف)');
    if (!formData.category_id) errors.push('يجب اختيار تصنيف');
    if (!formData.content_blocks || !Array.isArray(formData.content_blocks) || formData.content_blocks.length === 0) {
      errors.push('المحتوى فارغ - أضف بعض الفقرات');
    }
    if (formData.description && formData.description.length > 160) errors.push('الوصف طويل جداً (أكثر من 160 حرف)');
    
    setValidationErrors(errors);
    return errors;
  };

  // دوال الذكاء الاصطناعي
  const generateTitle = async () => {
    setAiLoading({ ...aiLoading, title: true });
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      const suggestions = [
        'الذكاء الاصطناعي يعيد تشكيل مستقبل الإعلام في السعودية',
        'تطورات جديدة في قطاع التقنية تعزز رؤية 2030',
        'ابتكارات سعودية تقود التحول الرقمي في المنطقة'
      ];
      setFormData(prev => ({ 
        ...prev, 
        title: suggestions[Math.floor(Math.random() * suggestions.length)]
      }));
    } finally {
      setAiLoading({ ...aiLoading, title: false });
    }
  };

  const generateDescription = async () => {
    setAiLoading({ ...aiLoading, description: true });
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      const description = 'وصف مولد تلقائياً يلخص محتوى المقال بطريقة جذابة ومناسبة لمحركات البحث، يحتوي على الكلمات المفتاحية الرئيسية.';
      setFormData(prev => ({ ...prev, description }));
    } finally {
      setAiLoading({ ...aiLoading, description: false });
    }
  };

  const generateKeywords = async () => {
    setAiLoading({ ...aiLoading, keywords: true });
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      const keywords = ['تقنية', 'ذكاء اصطناعي', 'رؤية 2030', 'ابتكار', 'السعودية'];
      setFormData(prev => ({ ...prev, keywords }));
    } finally {
      setAiLoading({ ...aiLoading, keywords: false });
    }
  };

  const handleSave = async (status: 'draft' | 'review' | 'published') => {
    const errors = validateForm();
    if (errors.length > 0) return;

    setSaving(true);
    try {
      // إنشاء محتوى نصي بسيط كـ fallback
      const textContent = formData.content_blocks
        .map((b) => {
          const blockData = b.data?.[b.type] || b.data || {};
          
          switch (b.type) {
            case 'paragraph':
              return (blockData as any).text || '';
            case 'heading':
              return (blockData as any).text || '';
            case 'quote':
              const quoteData = blockData as any;
              return `"${quoteData.text || ''}"${quoteData.author ? ` — ${quoteData.author}` : ''}`;
            case 'list':
              const listData = blockData as any;
              const items = listData.items || [];
              return items.map((item: string) => `• ${item}`).join('\n');
            case 'divider':
              return '---';
            default:
              return (blockData as any).text || '';
          }
        })
        .filter((text: string) => text.trim())
        .join('\n\n');

      const reporter = reporters.find(r => r.id === formData.author_id);
      const articleData = {
        title: formData.title,
        content_blocks: formData.content_blocks,
        content: textContent || 'محتوى المقال', // fallback نصي للتوافق
        summary: formData.description,
        category_id: formData.category_id,
        status,
        is_breaking: formData.is_breaking,
        is_featured: formData.is_featured,
        featured_image: formData.featured_image || formData.cover_image,
        featured_image_alt: formData.featured_image_alt,
        seo_title: formData.title,
        seo_description: formData.description,
        seo_keywords: formData.keywords,
        publish_at: formData.publish_time,
        author_id: formData.author_id,
        author: reporter?.name || undefined
      };

      const res = await fetch(`/api/articles/${articleId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(articleData)
      });
        const result = await res.json();

      if (!res.ok || !result.success) throw new Error(result.error || 'فشل التحديث');

      // تسجيل الحدث في سجلات النظام
      const userInfo = getCurrentUser();
      await logActions.updateArticle(userInfo, articleId, formData.title);
      
      if (status === 'published') {
        await logActions.publishArticle(userInfo, articleId, formData.title);
      }

      alert(status === 'published' ? 'تم نشر التحديثات بنجاح' : 'تم حفظ التعديلات بنجاح');
      window.location.href = '/dashboard/news';
    } catch (err) {
      console.error(err);
      alert(err instanceof Error ? err.message : 'حدث خطأ أثناء التحديث');
    } finally {
      setSaving(false);
    }
  };

  // عرض حالة التحميل
  if (articleLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="text-center">
          <div className="relative">
            <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 animate-pulse">
              <Edit3 className="w-12 h-12 text-white" />
            </div>
            <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center animate-bounce">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">جارٍ تحميل المقال</h2>
          <p className="text-gray-600 mb-4">نقوم بتحضير محرر التعديل لك...</p>
          <div className="flex items-center justify-center gap-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce"></div>
            <div className="w-3 h-3 bg-purple-500 rounded-full animate-bounce delay-100"></div>
            <div className="w-3 h-3 bg-pink-500 rounded-full animate-bounce delay-200"></div>
          </div>
        </div>
      </div>
    );
  }

  // عرض رسالة الخطأ
  if (loadError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="text-center">
          <div className="bg-red-100 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
            <XCircle className="w-12 h-12 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">خطأ في تحميل المقال</h2>
          <p className="text-gray-600 mb-6">{loadError}</p>
          <div className="flex items-center gap-4 justify-center">
            <button
              onClick={() => window.location.reload()}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              إعادة المحاولة
            </button>
          <button
            onClick={() => router.push('/dashboard/news')}
              className="flex items-center gap-2 px-6 py-3 bg-gray-600 text-white rounded-xl hover:bg-gray-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
              العودة للقائمة
          </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4 lg:p-8">
      <div className="max-w-[1600px] mx-auto">
        {/* Header الإبداعي الجديد */}
        <div className="relative mb-8">
          {/* خلفية متحركة */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-3xl opacity-90"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-3xl"></div>
          
          {/* نمط الخلفية */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-40 h-40 bg-white rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-0 right-0 w-60 h-60 bg-yellow-300 rounded-full blur-3xl animate-pulse delay-1000"></div>
            <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-pink-300 rounded-full blur-3xl animate-pulse delay-2000"></div>
          </div>
          
          <div className="relative z-10 p-8 lg:p-12">
            {/* العنوان الرئيسي */}
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 mb-8">
              <div className="flex items-center gap-6">
                <div className="relative">
                  <div className="w-20 h-20 bg-gradient-to-br from-orange-400 to-red-500 rounded-2xl flex items-center justify-center shadow-2xl transform rotate-3 hover:rotate-6 transition-transform">
                    <Edit3 className="w-10 h-10 text-white" />
              </div>
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center animate-bounce">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                </div>
                
                <div>
                  <h1 className="text-4xl lg:text-5xl font-bold text-white mb-2 flex items-center gap-3">
              تعديل المقال
                    <span className="text-2xl">✏️</span>
            </h1>
                  <p className="text-xl text-blue-100 flex items-center gap-2">
                    <Rocket className="w-5 h-5" />
                    حدّث وطوّر محتوى مقالك بدعم الذكاء الاصطناعي
                  </p>
                </div>
              </div>

              {/* معلومات المقال */}
              <div className="flex items-center gap-4 bg-white/20 backdrop-blur-md rounded-2xl p-4 border border-white/30">
                <div className="text-center px-4 border-r border-white/30">
                  <div className="text-3xl font-bold text-white">{wordCount}</div>
                  <div className="text-sm text-blue-100">كلمة</div>
                </div>
                <div className="text-center px-4 border-r border-white/30">
                  <div className="text-3xl font-bold text-white">{readingTime}</div>
                  <div className="text-sm text-blue-100">دقيقة قراءة</div>
                </div>
                <div className="text-center px-4">
                  <div className="text-3xl font-bold text-white">{qualityScore}%</div>
                  <div className="text-sm text-blue-100">جودة</div>
                </div>
              </div>
            </div>

            {/* شريط التقدم والحالة */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
              {/* حالة الحفظ */}
              <div className={`flex items-center gap-3 px-6 py-4 rounded-2xl backdrop-blur-md border transition-all ${
                autoSaveStatus === 'saved' 
                  ? 'bg-green-500/20 border-green-400/50 text-green-100' 
                  : autoSaveStatus === 'saving' 
                  ? 'bg-blue-500/20 border-blue-400/50 text-blue-100' 
                  : 'bg-red-500/20 border-red-400/50 text-red-100'
              }`}>
                <div className="relative">
                  {autoSaveStatus === 'saved' ? (
                    <CheckCircle className="w-6 h-6" />
                  ) : autoSaveStatus === 'saving' ? (
                    <RefreshCw className="w-6 h-6 animate-spin" />
                  ) : (
                    <XCircle className="w-6 h-6" />
                  )}
                </div>
                <div>
                  <div className="font-semibold">
                    {autoSaveStatus === 'saved' ? 'تم الحفظ' : autoSaveStatus === 'saving' ? 'جارٍ الحفظ' : 'خطأ في الحفظ'}
                  </div>
                  <div className="text-xs opacity-80">آخر حفظ منذ دقيقتين</div>
                </div>
              </div>

              {/* مؤشر الجودة */}
              <div className="bg-white/20 backdrop-blur-md border border-white/30 rounded-2xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white font-medium">جودة المحتوى</span>
                  <span className="text-white font-bold">{qualityScore}%</span>
                </div>
                <div className="w-full h-3 bg-white/20 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${
                      qualityScore >= 80 ? 'bg-gradient-to-r from-green-400 to-emerald-500' :
                      qualityScore >= 60 ? 'bg-gradient-to-r from-yellow-400 to-orange-500' :
                      'bg-gradient-to-r from-red-400 to-pink-500'
                    }`}
                    style={{ width: `${qualityScore}%` }}
                  />
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-white/70">ضعيف</span>
                  <span className="text-xs text-white/70">ممتاز</span>
                </div>
              </div>

              {/* إحصائيات سريعة */}
              <div className="bg-white/20 backdrop-blur-md border border-white/30 rounded-2xl p-4">
                <div className="grid grid-cols-3 gap-2">
                  <div className="text-center">
                    <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center mx-auto mb-1">
                      <Image className="w-5 h-5 text-white" />
                    </div>
                    <div className="text-xs text-white/80">صور</div>
                    <div className="text-lg font-bold text-white">
                      {formData.content_blocks && Array.isArray(formData.content_blocks) 
                        ? formData.content_blocks.filter(b => b && b.type === 'image').length 
                        : 0}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center mx-auto mb-1">
                      <Video className="w-5 h-5 text-white" />
                    </div>
                    <div className="text-xs text-white/80">فيديو</div>
                    <div className="text-lg font-bold text-white">
                      {formData.content_blocks && Array.isArray(formData.content_blocks)
                        ? formData.content_blocks.filter(b => b && b.type === 'video').length
                        : 0}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center mx-auto mb-1">
                      <Hash className="w-5 h-5 text-white" />
                    </div>
                    <div className="text-xs text-white/80">وسوم</div>
                    <div className="text-lg font-bold text-white">
                      {formData.keywords && Array.isArray(formData.keywords) ? formData.keywords.length : 0}
                    </div>
                  </div>
            </div>
          </div>
        </div>

            {/* التبويبات المحسنة */}
            <div className="flex flex-wrap gap-2">
              {[
                { id: 'content', name: 'المحتوى', icon: FileText, color: 'from-blue-500 to-blue-600', desc: 'محرر المحتوى الأساسي' },
                { id: 'ai', name: 'مساعد AI', icon: Brain, color: 'from-purple-500 to-pink-600', desc: 'أدوات الذكاء الاصطناعي' },
                { id: 'publish', name: 'إعدادات النشر', icon: Rocket, color: 'from-orange-500 to-red-600', desc: 'خيارات النشر والتوقيت' },
                { id: 'settings', name: 'الإعدادات', icon: Settings, color: 'from-cyan-500 to-blue-600', desc: 'خيارات العرض' },
                { id: 'seo', name: 'تحسين SEO', icon: Target, color: 'from-green-500 to-emerald-600', desc: 'محركات البحث' }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                    className={`group relative flex items-center gap-3 px-6 py-4 rounded-2xl font-medium transition-all duration-300 transform hover:scale-105 ${
                    activeTab === tab.id
                        ? `bg-gradient-to-r ${tab.color} text-white shadow-xl`
                        : 'bg-white/20 backdrop-blur-sm text-white hover:bg-white/30'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                    <div className="text-left">
                      <div className="font-semibold">{tab.name}</div>
                      <div className="text-xs opacity-80">{tab.desc}</div>
                    </div>
                    {activeTab === tab.id && (
                      <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-white rounded-full"></div>
                    )}
                </button>
              );
            })}
            </div>
          </div>
        </div>

        {/* شريط الأخطاء */}
        {validationErrors.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
              <div className="flex-1">
                <h4 className="font-semibold text-red-900 mb-1">يرجى تصحيح الأخطاء التالية:</h4>
                <ul className="list-disc list-inside text-sm text-red-700 space-y-1">
                  {validationErrors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* المحتوى الرئيسي والشريط الجانبي */}
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
        {/* المحتوى الرئيسي */}
          <div className="xl:col-span-3">
        {activeTab === 'content' && (
              <div className="bg-white rounded-3xl shadow-xl p-8">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <FileText className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">محتوى المقال</h2>
                    <p className="text-gray-600">عدّل المحتوى باستخدام المحرر المتقدم</p>
                  </div>
                </div>

                <div className="space-y-6">
                  {/* العنوان الرئيسي */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      العنوان الرئيسي <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                    <textarea
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="اكتب عنواناً جذاباً ومميزاً للمقال..."
                        className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      rows={2}
                      />
                      <button
                        onClick={generateTitle}
                        disabled={aiLoading.title}
                        className="absolute left-2 top-2 p-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors disabled:opacity-50"
                      >
                        {aiLoading.title ? (
                          <RefreshCw className="w-4 h-4 animate-spin" />
                        ) : (
                          <Sparkles className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                    <div className="flex justify-between mt-1">
                      <span className={`text-xs ${formData.title && formData.title.length > 100 ? 'text-red-500' : 'text-gray-500'}`}>
                        {formData.title ? formData.title.length : 0} / 100 حرف
                      </span>
                    </div>
                  </div>

                  {/* العنوان الفرعي */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      العنوان الفرعي (اختياري)
                    </label>
                    <input
                      type="text"
                      value={formData.subtitle}
                      onChange={(e) => setFormData(prev => ({ ...prev, subtitle: e.target.value }))}
                      placeholder="عنوان فرعي يدعم العنوان الرئيسي..."
                      className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  {/* اسم المراسل */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      اسم المراسل <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.author_id}
                      onChange={(e) => setFormData(prev => ({ ...prev, author_id: e.target.value }))}
                      className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">اختر المراسل...</option>
                      {reporters.map((rep) => (
                        <option key={rep.id} value={rep.id}>{rep.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* التصنيف والنطاق */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                        التصنيف الرئيسي <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.category_id}
                      onChange={(e) => setFormData(prev => ({ ...prev, category_id: Number(e.target.value) }))}
                        className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value={0}>اختر التصنيف...</option>
                        {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>
                          {cat.icon} {cat.name_ar}
                        </option>
                      ))}
                    </select>
                  </div>

                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">
                        النطاق
                      </label>
                      <select
                        value={formData.scope}
                        onChange={(e) => setFormData(prev => ({ ...prev, scope: e.target.value as 'local' | 'international' }))}
                        className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="local">🏠 محلي</option>
                        <option value="international">🌍 دولي</option>
                      </select>
                    </div>
                  </div>

                  {/* الوصف الموجز */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      الوصف الموجز
                    </label>
                    <div className="relative">
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="وصف موجز يظهر في نتائج البحث ومعاينة المقال..."
                        className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      rows={3}
                      />
                      <button
                        onClick={generateDescription}
                        disabled={aiLoading.description}
                        className="absolute left-2 top-2 p-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors disabled:opacity-50"
                      >
                        {aiLoading.description ? (
                          <RefreshCw className="w-4 h-4 animate-spin" />
                        ) : (
                          <Sparkles className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                    <div className="flex justify-between mt-1">
                      <span className={`text-xs ${formData.description && formData.description.length > 160 ? 'text-red-500' : 'text-gray-500'}`}>
                        {formData.description ? formData.description.length : 0} / 160 حرف
                      </span>
                    </div>
                  </div>

                  {/* محرر المحتوى */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      محتوى المقال <span className="text-red-500">*</span>
                    </label>
                    <ContentEditorWithBlocks 
                      formData={formData}
                      setFormData={setFormData}
                      categories={categories}
                      aiLoading={aiLoading}
                      onGenerateTitle={generateTitle}
                      onGenerateDescription={generateDescription}
                    />
                  </div>
                </div>
              </div>
            )}
            
            {activeTab === 'ai' && (
              <div className="bg-white rounded-3xl shadow-xl p-8">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <Brain className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">مساعد الذكاء الاصطناعي</h2>
                    <p className="text-gray-600">استخدم قوة AI لإنشاء محتوى احترافي</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { icon: Wand2, title: 'توليد عنوان جذاب', desc: 'اقتراحات عناوين مُحسّنة', color: 'from-blue-500 to-indigo-600', action: generateTitle },
                    { icon: FileText, title: 'كتابة الوصف', desc: 'وصف مُحسّن لمحركات البحث', color: 'from-purple-500 to-pink-600', action: generateDescription },
                    { icon: Hash, title: 'اقتراح الوسوم', desc: 'كلمات مفتاحية ذكية', color: 'from-green-500 to-emerald-600', action: generateKeywords },
                    { icon: Sparkles, title: 'تحسين المحتوى', desc: 'مراجعة وتحسين النص', color: 'from-orange-500 to-red-600', action: () => {} },
                    { icon: Target, title: 'تحليل SEO', desc: 'نصائح لتحسين الظهور', color: 'from-cyan-500 to-blue-600', action: () => {} },
                    { icon: Globe, title: 'ترجمة ذكية', desc: 'ترجمة احترافية للإنجليزية', color: 'from-indigo-500 to-purple-600', action: () => {} }
                  ].map((tool, index) => {
                    const Icon = tool.icon;
                    const isLoading = aiLoading[tool.title];
                    return (
                      <button
                        key={index}
                        onClick={tool.action}
                        disabled={isLoading}
                        className={`group relative bg-gradient-to-r ${tool.color} p-6 rounded-2xl text-white shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300 disabled:opacity-50`}
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                            {isLoading ? (
                              <RefreshCw className="w-6 h-6 animate-spin" />
                            ) : (
                              <Icon className="w-6 h-6" />
                            )}
                          </div>
                          <div className="text-left">
                            <h3 className="font-bold text-lg">{tool.title}</h3>
                            <p className="text-sm opacity-90">{tool.desc}</p>
                          </div>
                        </div>
                        <div className="absolute top-2 right-2">
                          <Sparkles className="w-4 h-4 opacity-50" />
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
            
            {activeTab === 'publish' && (
              <div className="bg-white rounded-3xl shadow-xl p-8">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <Rocket className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">إعدادات النشر 🚀</h2>
                    <p className="text-gray-600">جدولة وتوقيت نشر المقال</p>
                  </div>
                </div>

                <div className="space-y-6">
                  {/* توقيت النشر */}
                  <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-2xl p-6 border border-orange-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                      <Clock className="w-5 h-5 text-orange-600" />
                      توقيت النشر
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-2 block">التاريخ</label>
                    <input
                          type="date"
                          value={formData.publish_time ? new Date(formData.publish_time).toISOString().split('T')[0] : ''}
                          onChange={(e) => {
                            const date = new Date(e.target.value);
                            const time = formData.publish_time ? new Date(formData.publish_time).toTimeString().split(' ')[0] : '00:00:00';
                            setFormData(prev => ({ 
                              ...prev, 
                              publish_time: new Date(`${e.target.value}T${time}`).toISOString()
                            }));
                          }}
                          className="w-full p-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>
                      
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-2 block">الوقت</label>
                        <input
                          type="time"
                          value={formData.publish_time ? new Date(formData.publish_time).toTimeString().slice(0, 5) : ''}
                          onChange={(e) => {
                            const date = formData.publish_time ? new Date(formData.publish_time).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
                            setFormData(prev => ({ 
                              ...prev, 
                              publish_time: new Date(`${date}T${e.target.value}`).toISOString()
                            }));
                          }}
                          className="w-full p-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        />
                </div>
              </div>

                    {/* خيارات النشر السريع */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {[
                        { label: 'الآن', icon: Zap, action: () => setFormData(prev => ({ ...prev, publish_time: new Date().toISOString() })) },
                        { label: 'بعد ساعة', icon: Clock, action: () => setFormData(prev => ({ ...prev, publish_time: new Date(Date.now() + 3600000).toISOString() })) },
                        { label: 'غداً', icon: Calendar, action: () => setFormData(prev => ({ ...prev, publish_time: new Date(Date.now() + 86400000).toISOString() })) },
                        { label: 'نهاية الأسبوع', icon: Calendar, action: () => {
                          const now = new Date();
                          const daysUntilFriday = (5 - now.getDay() + 7) % 7 || 7;
                          setFormData(prev => ({ ...prev, publish_time: new Date(Date.now() + daysUntilFriday * 86400000).toISOString() }));
                        }}
                      ].map((option, index) => {
                        const Icon = option.icon;
                        return (
                          <button
                            key={index}
                            onClick={option.action}
                            className="flex items-center justify-center gap-2 p-3 bg-white border-2 border-gray-200 rounded-xl hover:border-orange-500 hover:bg-orange-50 transition-all"
                          >
                            <Icon className="w-4 h-4 text-orange-600" />
                            <span className="text-sm font-medium">{option.label}</span>
                          </button>
                        );
                      })}
                    </div>

                    {/* عرض التوقيت المحدد */}
                    {formData.publish_time && (
                      <div className="mt-4 p-4 bg-white rounded-xl border border-orange-200">
                        <div className="flex items-center gap-2 text-sm text-gray-700">
                          <Clock className="w-4 h-4 text-orange-600" />
                          <span className="font-medium">موعد النشر المحدد:</span>
                          <span className="text-orange-600 font-bold">
                            {new Date(formData.publish_time).toLocaleString('ar-SA', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                              weekday: 'long'
                            })}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* حالة المقال */}
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                      <Activity className="w-5 h-5 text-blue-600" />
                      حالة المقال
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {[
                        { 
                          status: 'draft', 
                          label: 'مسودة', 
                          icon: FileText, 
                          color: 'gray',
                          desc: 'حفظ كمسودة للعمل عليها لاحقاً'
                        },
                        { 
                          status: 'review', 
                          label: 'للمراجعة', 
                          icon: Eye, 
                          color: 'yellow',
                          desc: 'إرسال للمحرر للمراجعة والموافقة'
                        },
                        { 
                          status: 'published', 
                          label: 'نشر مباشر', 
                          icon: Send, 
                          color: 'green',
                          desc: 'نشر المقال فوراً على الموقع'
                        }
                      ].map((option) => {
                        const Icon = option.icon;
                        const isSelected = formData.status === option.status;
                        return (
                          <label
                            key={option.status}
                            className={`relative cursor-pointer rounded-xl border-2 p-6 transition-all ${
                              isSelected 
                                ? `border-${option.color}-500 bg-${option.color}-50` 
                                : 'border-gray-200 hover:border-gray-300 bg-white'
                            }`}
                          >
                            <input
                              type="radio"
                              name="status"
                              value={option.status}
                              checked={isSelected}
                              onChange={() => setFormData(prev => ({ ...prev, status: option.status as any }))}
                              className="sr-only"
                            />
                            <div className="text-center">
                              <div className={`w-12 h-12 mx-auto mb-3 rounded-xl flex items-center justify-center ${
                                isSelected 
                                  ? `bg-${option.color}-500 text-white` 
                                  : 'bg-gray-100 text-gray-600'
                              }`}>
                                <Icon className="w-6 h-6" />
                              </div>
                              <h4 className="font-semibold text-gray-900">{option.label}</h4>
                              <p className="text-sm text-gray-600 mt-1">{option.desc}</p>
                            </div>
                            {isSelected && (
                              <CheckCircle className={`absolute top-3 right-3 w-5 h-5 text-${option.color}-600`} />
                            )}
                          </label>
                        );
                      })}
              </div>
            </div>

                  {/* إعدادات متقدمة */}
                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                      <Settings className="w-5 h-5 text-purple-600" />
                      إعدادات متقدمة
                    </h3>
                
                <div className="space-y-4">
                      <label className="flex items-center justify-between p-4 bg-white rounded-xl">
                        <div className="flex items-center gap-3">
                          <Shield className="w-5 h-5 text-purple-600" />
                  <div>
                            <div className="font-medium text-gray-900">تفعيل التعليقات</div>
                            <div className="text-sm text-gray-600">السماح للقراء بالتعليق على المقال</div>
                          </div>
                        </div>
                        <input
                          type="checkbox"
                          defaultChecked
                          className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500"
                        />
                    </label>
                      
                      <label className="flex items-center justify-between p-4 bg-white rounded-xl">
                        <div className="flex items-center gap-3">
                          <Heart className="w-5 h-5 text-pink-600" />
                          <div>
                            <div className="font-medium text-gray-900">تفعيل الإعجابات</div>
                            <div className="text-sm text-gray-600">السماح للقراء بالإعجاب بالمقال</div>
                  </div>
                        </div>
                        <input
                          type="checkbox"
                          defaultChecked
                          className="w-5 h-5 text-pink-600 rounded focus:ring-pink-500"
                        />
                      </label>
                      
                      <label className="flex items-center justify-between p-4 bg-white rounded-xl">
                        <div className="flex items-center gap-3">
                          <Share2 className="w-5 h-5 text-indigo-600" />
                          <div>
                            <div className="font-medium text-gray-900">تفعيل المشاركة</div>
                            <div className="text-sm text-gray-600">عرض أزرار مشاركة المقال</div>
                          </div>
                        </div>
                        <input
                          type="checkbox"
                          defaultChecked
                          className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500"
                        />
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {activeTab === 'settings' && (
              <div className="bg-white rounded-3xl shadow-xl p-8">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <Settings className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">إعدادات العرض</h2>
                    <p className="text-gray-600">تحكم في كيفية عرض المقال</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* خيارات العرض المميز */}
                  <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-2xl p-6 border border-yellow-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <Star className="w-5 h-5 text-yellow-600" />
                      خيارات مميزة
                    </h3>
                    <div className="space-y-4">
                      <label className="flex items-center justify-between p-4 bg-white rounded-xl hover:shadow-md transition-all cursor-pointer">
                        <div className="flex items-center gap-3">
                          <Zap className="w-5 h-5 text-red-600" />
                          <div>
                            <div className="font-medium text-gray-900">خبر عاجل</div>
                            <div className="text-sm text-gray-600">عرض شريط عاجل أعلى الموقع</div>
                          </div>
                        </div>
                    <input
                      type="checkbox"
                      checked={formData.is_breaking}
                      onChange={(e) => setFormData(prev => ({ ...prev, is_breaking: e.target.checked }))}
                          className="w-5 h-5 text-red-600 rounded focus:ring-red-500"
                    />
                  </label>
                  
                      <label className="flex items-center justify-between p-4 bg-white rounded-xl hover:shadow-md transition-all cursor-pointer">
                        <div className="flex items-center gap-3">
                          <Star className="w-5 h-5 text-yellow-600" />
                          <div>
                            <div className="font-medium text-gray-900">مقال مميز</div>
                            <div className="text-sm text-gray-600">إبراز في الصفحة الرئيسية</div>
                          </div>
                        </div>
                    <input
                      type="checkbox"
                      checked={formData.is_featured}
                      onChange={(e) => setFormData(prev => ({ ...prev, is_featured: e.target.checked }))}
                          className="w-5 h-5 text-yellow-600 rounded focus:ring-yellow-500"
                        />
                      </label>

                      <label className="flex items-center justify-between p-4 bg-white rounded-xl hover:shadow-md transition-all cursor-pointer">
                        <div className="flex items-center gap-3">
                          <Mail className="w-5 h-5 text-blue-600" />
                          <div>
                            <div className="font-medium text-gray-900">النشرة الذكية</div>
                            <div className="text-sm text-gray-600">إضافة للنشرة البريدية</div>
                          </div>
                        </div>
                        <input
                          type="checkbox"
                          checked={formData.is_smart_newsletter}
                          onChange={(e) => setFormData(prev => ({ ...prev, is_smart_newsletter: e.target.checked }))}
                          className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                        />
                  </label>
                </div>
              </div>

                  {/* نطاق النشر */}
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <Globe className="w-5 h-5 text-green-600" />
                      نطاق النشر
                    </h3>
                    <div className="space-y-3">
                      <label className={`relative flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                        formData.scope === 'local' 
                          ? 'border-green-500 bg-white shadow-md' 
                          : 'border-gray-200 bg-white hover:border-gray-300'
                      }`}>
                        <input
                          type="radio"
                          name="scope"
                          value="local"
                          checked={formData.scope === 'local'}
                          onChange={() => setFormData(prev => ({ ...prev, scope: 'local' }))}
                          className="sr-only"
                        />
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          formData.scope === 'local' ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-600'
                        }`}>
                          <MapPin className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">أخبار محلية</div>
                          <div className="text-sm text-gray-600">للقراء داخل المملكة</div>
                        </div>
                        {formData.scope === 'local' && (
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        )}
                      </label>

                      <label className={`relative flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                        formData.scope === 'international' 
                          ? 'border-green-500 bg-white shadow-md' 
                          : 'border-gray-200 bg-white hover:border-gray-300'
                      }`}>
                        <input
                          type="radio"
                          name="scope"
                          value="international"
                          checked={formData.scope === 'international'}
                          onChange={() => setFormData(prev => ({ ...prev, scope: 'international' }))}
                          className="sr-only"
                        />
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          formData.scope === 'international' ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-600'
                        }`}>
                          <Globe className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">أخبار دولية</div>
                          <div className="text-sm text-gray-600">للقراء حول العالم</div>
                      </div>
                        {formData.scope === 'international' && (
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        )}
                      </label>
                    </div>
                  </div>

                  {/* خيارات التفاعل */}
                  <div className="md:col-span-2 bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <MessageSquare className="w-5 h-5 text-purple-600" />
                      خيارات التفاعل
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <label className="flex items-center gap-3 p-4 bg-white rounded-xl cursor-pointer hover:shadow-md transition-all">
                      <input
                          type="checkbox"
                          defaultChecked
                          className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500"
                        />
                        <div className="flex items-center gap-2">
                          <MessageSquare className="w-4 h-4 text-purple-600" />
                          <span className="font-medium text-gray-900">التعليقات</span>
                      </div>
                      </label>
                      
                      <label className="flex items-center gap-3 p-4 bg-white rounded-xl cursor-pointer hover:shadow-md transition-all">
                      <input
                          type="checkbox"
                          defaultChecked
                          className="w-5 h-5 text-pink-600 rounded focus:ring-pink-500"
                        />
                        <div className="flex items-center gap-2">
                          <Heart className="w-4 h-4 text-pink-600" />
                          <span className="font-medium text-gray-900">الإعجابات</span>
                        </div>
                      </label>
                      
                      <label className="flex items-center gap-3 p-4 bg-white rounded-xl cursor-pointer hover:shadow-md transition-all">
                        <input
                          type="checkbox"
                          defaultChecked
                          className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500"
                        />
                        <div className="flex items-center gap-2">
                          <Share2 className="w-4 h-4 text-indigo-600" />
                          <span className="font-medium text-gray-900">المشاركة</span>
                        </div>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {activeTab === 'seo' && (
              <div className="bg-white rounded-3xl shadow-xl p-8">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <Target className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">تحسين محركات البحث</h2>
                    <p className="text-gray-600">حسّن ظهور مقالك في نتائج البحث</p>
                </div>
              </div>

                <div className="space-y-6">
                  {/* معاينة نتيجة البحث */}
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6">
                    <h3 className="text-sm font-medium text-gray-700 mb-3">معاينة في نتائج البحث</h3>
                    <div className="bg-white rounded-xl p-4 shadow-sm">
                      <h4 className="text-blue-600 text-lg font-medium mb-1 hover:underline cursor-pointer">
                        {formData.title || 'عنوان المقال سيظهر هنا...'}
                      </h4>
                      <p className="text-green-700 text-sm mb-2">sabq.org › article › {new Date().toISOString().split('T')[0]}</p>
                      <p className="text-gray-600 text-sm">
                        {formData.description || 'وصف المقال سيظهر هنا. اكتب وصفاً جذاباً يشجع على النقر...'}
                      </p>
                    </div>
                  </div>

                  {/* نصائح SEO */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      { 
                        title: 'طول العنوان', 
                        current: formData.title ? formData.title.length : 0, 
                        ideal: '50-60', 
                        status: formData.title 
                          ? (formData.title.length >= 50 && formData.title.length <= 60 ? 'good' 
                            : formData.title.length > 0 ? 'warning' 
                            : 'bad')
                          : 'bad'
                      },
                      { 
                        title: 'طول الوصف', 
                        current: formData.description ? formData.description.length : 0, 
                        ideal: '120-160', 
                        status: formData.description
                          ? (formData.description.length >= 120 && formData.description.length <= 160 ? 'good' 
                            : formData.description.length > 0 ? 'warning' 
                            : 'bad')
                          : 'bad'
                      },
                      { 
                        title: 'الكلمات المفتاحية', 
                        current: formData.keywords && Array.isArray(formData.keywords) ? formData.keywords.length : 0, 
                        ideal: '3-5', 
                        status: formData.keywords && Array.isArray(formData.keywords)
                          ? (formData.keywords.length >= 3 && formData.keywords.length <= 5 ? 'good' 
                            : formData.keywords.length > 0 ? 'warning' 
                            : 'bad')
                          : 'bad'
                      },
                      { 
                        title: 'الصور', 
                        current: formData.content_blocks && Array.isArray(formData.content_blocks) 
                          ? formData.content_blocks.filter(b => b && b.type === 'image').length 
                          : 0, 
                        ideal: '2+', 
                        status: formData.content_blocks && Array.isArray(formData.content_blocks) 
                          ? (formData.content_blocks.filter(b => b && b.type === 'image').length >= 2 ? 'good' 
                            : formData.content_blocks.filter(b => b && b.type === 'image').length > 0 ? 'warning' 
                            : 'bad')
                          : 'bad'
                      }
                    ].map((metric, index) => (
                      <div key={index} className="bg-gray-50 rounded-xl p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-gray-900">{metric.title}</span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            metric.status === 'good' ? 'bg-green-100 text-green-700' :
                            metric.status === 'warning' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-red-100 text-red-700'
                          }`}>
                            {metric.current} / {metric.ideal}
                          </span>
                        </div>
                        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full transition-all duration-300 ${
                            metric.status === 'good' ? 'bg-green-500' :
                            metric.status === 'warning' ? 'bg-yellow-500' :
                            'bg-red-500'
                          }`} style={{ width: metric.status === 'good' ? '100%' : metric.status === 'warning' ? '60%' : '20%' }} />
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* الكلمات المفتاحية المحسنة */}
                  <div className="border-2 border-gray-100 rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                        <Hash className="w-5 h-5 text-purple-600" />
                        الكلمات المفتاحية
                        {formData.keywords && formData.keywords.length > 0 && (
                          <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded-full text-xs">
                            {formData.keywords.length}
                          </span>
                        )}
                      </h3>
                      <button
                        onClick={generateKeywords}
                        disabled={aiLoading.keywords}
                        className="flex items-center gap-2 px-4 py-2 bg-purple-100 text-purple-700 rounded-xl hover:bg-purple-200 transition-colors disabled:opacity-50"
                      >
                        {aiLoading.keywords ? (
                          <RefreshCw className="w-4 h-4 animate-spin" />
                        ) : (
                          <Sparkles className="w-4 h-4" />
                        )}
                        اقتراح بالذكاء الاصطناعي
                      </button>
                    </div>
                    
                    {/* عرض الكلمات المفتاحية الحالية */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {formData.keywords && Array.isArray(formData.keywords) && formData.keywords.map((keyword, index) => (
                        <span key={index} className="px-3 py-2 bg-purple-100 text-purple-700 rounded-full text-sm font-medium flex items-center gap-2 hover:bg-purple-200 transition-colors">
                          <Hash className="w-3 h-3" />
                          {keyword}
                          <button
                            onClick={() => setFormData(prev => ({ 
                              ...prev, 
                              keywords: prev.keywords.filter((_, i) => i !== index) 
                            }))}
                            className="ml-1 hover:text-purple-900 hover:bg-purple-300 rounded-full w-4 h-4 flex items-center justify-center text-xs"
                            title="حذف الكلمة المفتاحية"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                      
                      {/* حقل إدخال جديد */}
                      <input
                        type="text"
                        placeholder="أضف كلمة مفتاحية واضغط Enter..."
                        className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent min-w-[200px]"
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
                      />
                    </div>
                    
                    {/* اقتراحات سريعة */}
                    <div className="bg-gray-50 rounded-xl p-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                        <Lightbulb className="w-4 h-4 text-yellow-500" />
                        اقتراحات سريعة
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {['السعودية', 'الرياض', 'أخبار', 'عاجل', 'تقنية', 'اقتصاد', 'رياضة', 'صحة'].map((suggestion) => (
                          <button
                            key={suggestion}
                            onClick={() => {
                              if (!formData.keywords.includes(suggestion)) {
                                setFormData(prev => ({ 
                                  ...prev, 
                                  keywords: [...prev.keywords, suggestion] 
                                }));
                              }
                            }}
                            disabled={formData.keywords.includes(suggestion)}
                            className="px-3 py-1 bg-white border border-gray-200 text-gray-600 rounded-full text-xs hover:bg-purple-50 hover:border-purple-200 hover:text-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            + {suggestion}
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    {/* نصائح للكلمات المفتاحية */}
                    <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                      <p className="text-xs text-blue-700 flex items-start gap-2">
                        <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        <span>
                          استخدم 3-5 كلمات مفتاحية ذات صلة بالمحتوى. تجنب تكرار نفس الكلمات وركز على المصطلحات التي يبحث عنها القراء.
                        </span>
                      </p>
                    </div>
                  </div>
            </div>
          </div>
        )}
          </div>

          {/* الشريط الجانبي */}
          <div className="xl:col-span-1 space-y-6">
            {/* بطاقة الجودة المحسنة */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-3xl p-6 border border-green-200">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-green-600" />
                جودة المقال
              </h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">نسبة الاكتمال</span>
                    <span className="text-2xl font-bold text-green-600">{qualityScore}%</span>
          </div>
                  <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${
                        qualityScore >= 80 ? 'bg-gradient-to-r from-green-500 to-emerald-600' :
                        qualityScore >= 60 ? 'bg-gradient-to-r from-yellow-500 to-orange-600' :
                        'bg-gradient-to-r from-red-500 to-pink-600'
                      }`}
                      style={{ width: `${qualityScore}%` }}
                    />
                  </div>
                </div>
                <div className="text-sm text-gray-600">
                  {qualityScore >= 80 ? '🎉 ممتاز! مقالك جاهز للنشر' :
                   qualityScore >= 60 ? '👍 جيد، يمكن تحسينه أكثر' :
                   '💡 يحتاج لمزيد من المحتوى'}
                </div>
              </div>
            </div>

            {/* بطاقة النشر */}
            <div className="bg-white rounded-3xl shadow-xl p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Send className="w-5 h-5 text-blue-600" />
                خيارات النشر
              </h3>
              <div className="space-y-3">
                <button
                  onClick={() => handleSave('draft')}
                  disabled={saving}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors disabled:opacity-50"
                >
                  <Save className="w-5 h-5" />
                  حفظ كمسودة
                </button>
                
                <button
                  onClick={() => handleSave('review')}
                  disabled={saving}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-yellow-100 text-yellow-700 rounded-xl hover:bg-yellow-200 transition-colors disabled:opacity-50"
                >
                  <Eye className="w-5 h-5" />
                  إرسال للمراجعة
                </button>
                
                <button
                  onClick={() => handleSave('published')}
                  disabled={saving || validationErrors.length > 0}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                >
                  {saving ? (
                    <RefreshCw className="w-5 h-5 animate-spin" />
                  ) : (
                    <Send className="w-5 h-5" />
                  )}
                  نشر الآن
                </button>
              </div>
            </div>

            {/* بطاقة الوسائط */}
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-3xl p-6 border border-purple-200">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Image className="w-5 h-5 text-purple-600" />
                الوسائط المتعددة
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">الصورة البارزة</label>
                  <FeaturedImageUpload
                    value={formData.featured_image || ''}
                    onChange={(url) => setFormData(prev => ({ ...prev, featured_image: url }))}
                    darkMode={darkMode}
                  />
          </div>
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">الصور في المقال</span>
                  <span className="font-semibold text-purple-600">
                    {formData.content_blocks && Array.isArray(formData.content_blocks)
                      ? formData.content_blocks.filter(b => b && b.type === 'image').length
                      : 0}
                  </span>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">مقاطع الفيديو</span>
                  <span className="font-semibold text-purple-600">
                    {formData.content_blocks && Array.isArray(formData.content_blocks)
                      ? formData.content_blocks.filter(b => b && b.type === 'video').length
                      : 0}
                  </span>
                </div>
              </div>
            </div>

            {/* نصائح الكتابة */}
            <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-3xl p-6 border border-yellow-200">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-yellow-600" />
                نصائح للكتابة
              </h3>
              <ul className="space-y-3 text-sm text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-yellow-600 mt-1">•</span>
                  <span>استخدم عنواناً جذاباً وواضحاً (50-60 حرف)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-yellow-600 mt-1">•</span>
                  <span>اكتب وصفاً مختصراً يلخص المحتوى (120-160 حرف)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-yellow-600 mt-1">•</span>
                  <span>أضف صوراً عالية الجودة مع نص بديل</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-yellow-600 mt-1">•</span>
                  <span>استخدم 3-5 كلمات مفتاحية ذات صلة</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 