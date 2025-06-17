'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Save, Eye, Send, AlertTriangle, Plus, ArrowUp, ArrowDown, 
  Trash2, Image, Video, Quote, Type, List, Link, Palette,
  Sparkles, Brain, MapPin, Clock, User, Globe, Settings,
  Upload, Play, MessageSquare, Hash, FileText, CheckCircle,
  XCircle, Lightbulb, Zap, Target, Star, RefreshCw,
  Wand2, Layers, Layout, PenTool, BookOpen, Award,
  TrendingUp, Activity, BarChart3, Rocket, Heart,
  Shield, Crown, Gem, Flame, Coffee, Music,
  Camera, Mic, Headphones, Wifi, Cpu, Database, Mail
} from 'lucide-react';

// استيراد المكونات
import ContentEditor from '../../../../components/ContentEditor';
import QualityPanel from '../../../../components/QualityPanel';
import PublishPanel from '../../../../components/PublishPanel';
import MediaPanel from '../../../../components/MediaPanel';
import { logActions, getCurrentUser } from '../../../../lib/log-activity';

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
}

interface ContentBlock {
  id: string;
  type: 'paragraph' | 'heading' | 'quote' | 'image' | 'video' | 'tweet' | 'list' | 'link' | 'highlight';
  content: any;
  order: number;
}

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

export default function CreateArticlePage() {
  const [formData, setFormData] = useState<ArticleFormData>({
    title: '',
    subtitle: '',
    description: '',
    category_id: 0,
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

  // إصلاح مشكلة Hydration للتوقيت الأولي
  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      publish_time: new Date().toISOString()
    }));
  }, []);

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [autoSaveStatus, setAutoSaveStatus] = useState<'saved' | 'saving' | 'error'>('saved');
  const [previewMode, setPreviewMode] = useState(false);
  const [activeTab, setActiveTab] = useState<'content' | 'settings' | 'seo' | 'ai'>('content');
  const [aiLoading, setAiLoading] = useState<{ [key: string]: boolean }>({});
  const [qualityScore, setQualityScore] = useState(0);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [wordCount, setWordCount] = useState(0);
  const [readingTime, setReadingTime] = useState(0);

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

  // حساب عدد الكلمات ووقت القراءة
  useEffect(() => {
    const text = formData.content_blocks
      .filter(b => b.type === 'paragraph' || b.type === 'heading')
      .map(b => b.content.text || '')
      .join(' ');
    
    const words = text.trim().split(/\s+/).length;
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
    if (formData.title.length > 10 && formData.title.length < 80) score += 20;
    else if (formData.title.length > 0) score += 10;
    
    // الوصف (15 نقطة)
    if (formData.description.length > 50 && formData.description.length < 160) score += 15;
    else if (formData.description.length > 0) score += 8;
    
    // المحتوى (30 نقطة)
    const textBlocks = formData.content_blocks.filter(b => b.type === 'paragraph');
    if (textBlocks.length >= 3) score += 30;
    else if (textBlocks.length > 0) score += 15;
    
    // الصور (15 نقطة)
    const imageBlocks = formData.content_blocks.filter(b => b.type === 'image');
    if (imageBlocks.length >= 1) score += 15;
    
    // التصنيف (10 نقطة)
    if (formData.category_id > 0) score += 10;
    
    // الكلمات المفتاحية (10 نقطة)
    if (formData.keywords.length >= 3) score += 10;
    else if (formData.keywords.length > 0) score += 5;
    
    setQualityScore(score);
  };

  const validateForm = (): string[] => {
    const errors: string[] = [];
    
    if (!formData.title.trim()) errors.push('العنوان الرئيسي مطلوب');
    if (formData.title.length > 100) errors.push('العنوان طويل جداً (أكثر من 100 حرف)');
    if (!formData.category_id) errors.push('يجب اختيار تصنيف');
    if (formData.content_blocks.length === 0) errors.push('المحتوى فارغ - أضف بعض الفقرات');
    if (formData.description.length > 160) errors.push('الوصف طويل جداً (أكثر من 160 حرف)');
    
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
      const articleData = {
        title: formData.title,
        content_blocks: formData.content_blocks,
        content: formData.content_blocks
          .map((b) => (b.type === 'paragraph' ? b.content.text : ''))
          .join('\n\n'),
        summary: formData.description,
        category_id: formData.category_id,
        status,
        is_breaking: formData.is_breaking,
        is_featured: formData.is_featured,
        featured_image: formData.cover_image,
        seo_title: formData.title,
        seo_description: formData.description,
        publish_at: formData.publish_time
      };

      const res = await fetch('/api/articles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(articleData)
      });
      const result = await res.json();

      if (!res.ok || !result.success) throw new Error(result.error || 'فشل الحفظ');

      // تسجيل الحدث في سجلات النظام
      const userInfo = getCurrentUser();
      await logActions.createArticle(userInfo, result.data.id, formData.title);
      
      if (status === 'published') {
        await logActions.publishArticle(userInfo, result.data.id, formData.title);
      }

      alert(status === 'published' ? 'تم نشر المقال بنجاح' : 'تم الحفظ بنجاح');
      window.location.href = '/dashboard/news';
    } catch (err) {
      console.error(err);
      alert(err instanceof Error ? err.message : 'حدث خطأ أثناء الحفظ');
    } finally {
      setSaving(false);
    }
  };

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
                  <div className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl flex items-center justify-center shadow-2xl transform rotate-3 hover:rotate-6 transition-transform">
                    <PenTool className="w-10 h-10 text-white" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center animate-bounce">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                </div>
                
                <div>
                  <h1 className="text-4xl lg:text-5xl font-bold text-white mb-2 flex items-center gap-3">
                    محرر سبق الذكي
                    <span className="text-2xl">✨</span>
                  </h1>
                  <p className="text-xl text-blue-100 flex items-center gap-2">
                    <Rocket className="w-5 h-5" />
                    أنشئ محتوى إعلامي مميز بدعم الذكاء الاصطناعي
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
                      {formData.content_blocks.filter(b => b.type === 'image').length}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center mx-auto mb-1">
                      <Video className="w-5 h-5 text-white" />
                    </div>
                    <div className="text-xs text-white/80">فيديو</div>
                    <div className="text-lg font-bold text-white">
                      {formData.content_blocks.filter(b => b.type === 'video').length}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center mx-auto mb-1">
                      <Hash className="w-5 h-5 text-white" />
                    </div>
                    <div className="text-xs text-white/80">وسوم</div>
                    <div className="text-lg font-bold text-white">{formData.keywords.length}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* التبويبات المحسنة */}
            <div className="flex flex-wrap gap-2">
              {[
                { id: 'content', name: 'المحتوى', icon: FileText, color: 'from-blue-500 to-blue-600', desc: 'محرر المحتوى الأساسي' },
                { id: 'ai', name: 'مساعد AI', icon: Brain, color: 'from-purple-500 to-pink-600', desc: 'أدوات الذكاء الاصطناعي' },
                { id: 'settings', name: 'الإعدادات', icon: Settings, color: 'from-orange-500 to-red-600', desc: 'خيارات النشر' },
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

        {/* تنبيهات الأخطاء المحسنة */}
        {validationErrors.length > 0 && (
          <div className="mb-8 bg-gradient-to-r from-red-500 to-pink-600 rounded-2xl p-1">
            <div className="bg-white rounded-2xl p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-pink-600 rounded-xl flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-900 mb-2">يرجى تصحيح الأخطاء التالية</h3>
                  <ul className="space-y-2">
                    {validationErrors.map((error, index) => (
                      <li key={index} className="flex items-center gap-2 text-red-700">
                        <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center text-xs font-bold">
                          {index + 1}
                        </div>
                        <span>{error}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* المحتوى الرئيسي */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* منطقة المحتوى الرئيسية */}
          <div className="xl:col-span-2">
            {activeTab === 'content' && (
              <ContentEditor 
                formData={formData}
                setFormData={setFormData}
                categories={categories}
                onGenerateTitle={generateTitle}
                onGenerateDescription={generateDescription}
                aiLoading={aiLoading}
              />
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
            
            {activeTab === 'settings' && (
              <div className="bg-white rounded-3xl shadow-xl p-8">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <Settings className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">إعدادات النشر</h2>
                    <p className="text-gray-600">تحكم في خيارات عرض ونشر المقال</p>
                  </div>
                </div>

                <div className="space-y-6">
                  {/* خيارات العرض */}
                  <div className="border-2 border-gray-100 rounded-2xl p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <Eye className="w-5 h-5 text-blue-600" />
                      خيارات العرض
                    </h3>
                    <div className="space-y-4">
                      <label className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer">
                        <div className="flex items-center gap-3">
                          <Zap className="w-5 h-5 text-yellow-600" />
                          <div>
                            <div className="font-medium text-gray-900">خبر عاجل</div>
                            <div className="text-sm text-gray-600">عرض كخبر عاجل في الصفحة الرئيسية</div>
                          </div>
                        </div>
                        <input
                          type="checkbox"
                          checked={formData.is_breaking}
                          onChange={(e) => setFormData(prev => ({ ...prev, is_breaking: e.target.checked }))}
                          className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                        />
                      </label>
                      
                      <label className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer">
                        <div className="flex items-center gap-3">
                          <Star className="w-5 h-5 text-yellow-600" />
                          <div>
                            <div className="font-medium text-gray-900">مقال مميز</div>
                            <div className="text-sm text-gray-600">إبراز المقال في الصفحة الرئيسية</div>
                          </div>
                        </div>
                        <input
                          type="checkbox"
                          checked={formData.is_featured}
                          onChange={(e) => setFormData(prev => ({ ...prev, is_featured: e.target.checked }))}
                          className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                        />
                      </label>

                      <label className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer">
                        <div className="flex items-center gap-3">
                          <Mail className="w-5 h-5 text-blue-600" />
                          <div>
                            <div className="font-medium text-gray-900">النشرة الذكية</div>
                            <div className="text-sm text-gray-600">إضافة للنشرة البريدية الذكية</div>
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
                  <div className="border-2 border-gray-100 rounded-2xl p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <Globe className="w-5 h-5 text-green-600" />
                      نطاق النشر
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <label className={`relative flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                        formData.scope === 'local' 
                          ? 'border-blue-500 bg-blue-50' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}>
                        <input
                          type="radio"
                          name="scope"
                          value="local"
                          checked={formData.scope === 'local'}
                          onChange={(e) => setFormData(prev => ({ ...prev, scope: 'local' }))}
                          className="sr-only"
                        />
                        <MapPin className="w-5 h-5 text-blue-600" />
                        <div>
                          <div className="font-medium text-gray-900">محلي</div>
                          <div className="text-sm text-gray-600">أخبار محلية</div>
                        </div>
                        {formData.scope === 'local' && (
                          <CheckCircle className="absolute top-2 right-2 w-5 h-5 text-blue-600" />
                        )}
                      </label>

                      <label className={`relative flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                        formData.scope === 'international' 
                          ? 'border-blue-500 bg-blue-50' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}>
                        <input
                          type="radio"
                          name="scope"
                          value="international"
                          checked={formData.scope === 'international'}
                          onChange={(e) => setFormData(prev => ({ ...prev, scope: 'international' }))}
                          className="sr-only"
                        />
                        <Globe className="w-5 h-5 text-green-600" />
                        <div>
                          <div className="font-medium text-gray-900">دولي</div>
                          <div className="text-sm text-gray-600">أخبار عالمية</div>
                        </div>
                        {formData.scope === 'international' && (
                          <CheckCircle className="absolute top-2 right-2 w-5 h-5 text-blue-600" />
                        )}
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
                        current: formData.title.length, 
                        ideal: '50-60', 
                        status: formData.title.length >= 50 && formData.title.length <= 60 ? 'good' : formData.title.length > 0 ? 'warning' : 'bad'
                      },
                      { 
                        title: 'طول الوصف', 
                        current: formData.description.length, 
                        ideal: '120-160', 
                        status: formData.description.length >= 120 && formData.description.length <= 160 ? 'good' : formData.description.length > 0 ? 'warning' : 'bad'
                      },
                      { 
                        title: 'الكلمات المفتاحية', 
                        current: formData.keywords.length, 
                        ideal: '3-5', 
                        status: formData.keywords.length >= 3 && formData.keywords.length <= 5 ? 'good' : formData.keywords.length > 0 ? 'warning' : 'bad'
                      },
                      { 
                        title: 'الصور', 
                        current: formData.content_blocks.filter(b => b.type === 'image').length, 
                        ideal: '2+', 
                        status: formData.content_blocks.filter(b => b.type === 'image').length >= 2 ? 'good' : formData.content_blocks.filter(b => b.type === 'image').length > 0 ? 'warning' : 'bad'
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

                  {/* الكلمات المفتاحية */}
                  <div className="border-2 border-gray-100 rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                        <Hash className="w-5 h-5 text-purple-600" />
                        الكلمات المفتاحية
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
                    <div className="flex flex-wrap gap-2">
                      {formData.keywords.map((keyword, index) => (
                        <span key={index} className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium flex items-center gap-1">
                          {keyword}
                          <button
                            onClick={() => setFormData(prev => ({ 
                              ...prev, 
                              keywords: prev.keywords.filter((_, i) => i !== index) 
                            }))}
                            className="ml-1 hover:text-purple-900"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                      <input
                        type="text"
                        placeholder="أضف كلمة مفتاحية..."
                        className="px-3 py-1 bg-gray-100 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            const value = (e.target as HTMLInputElement).value.trim();
                            if (value) {
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
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* الشريط الجانبي */}
          <div className="xl:col-span-1 space-y-6">
            {/* بطاقة الجودة المحسنة */}
            <QualityPanel qualityScore={qualityScore} />

            {/* بطاقة النشر */}
            <PublishPanel 
              formData={formData}
              setFormData={setFormData}
              onSave={handleSave}
              saving={saving}
            />

            {/* بطاقة الوسائط */}
            <MediaPanel 
              formData={formData}
              setFormData={setFormData}
            />

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