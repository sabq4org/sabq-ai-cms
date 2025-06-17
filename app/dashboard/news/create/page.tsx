'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Save, Eye, Send, AlertTriangle, Plus, ArrowUp, ArrowDown, 
  Trash2, Image, Video, Quote, Type, List, Link, Palette,
  Sparkles, Brain, MapPin, Clock, User, Globe, Settings,
  Upload, Play, MessageSquare, Hash, FileText, CheckCircle,
  XCircle, Lightbulb, Zap, Target, Star, RefreshCw
} from 'lucide-react';

// استيراد المكونات
import ContentEditor from '../../../../components/ContentEditor';
import QualityPanel from '../../../../components/QualityPanel';
import PublishPanel from '../../../../components/PublishPanel';
import MediaPanel from '../../../../components/MediaPanel';

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
    keywords: [],
    publish_time: '', // سيتم تعيينه في useEffect
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
  const [activeTab, setActiveTab] = useState<'content' | 'settings' | 'seo'>('content');
  const [aiLoading, setAiLoading] = useState<{ [key: string]: boolean }>({});
  const [qualityScore, setQualityScore] = useState(0);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  // تحميل التصنيفات الحقيقية من API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const res = await fetch('/api/categories?active_only=true');
        const result = await res.json();
        if (!res.ok || !result.success) throw new Error(result.error || 'فشل تحميل التصنيفات');

        // ترتيب العناصر حسب position أو id
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
  }, [formData.title, formData.description, formData.content_blocks]);

  const autoSave = useCallback(async () => {
    setAutoSaveStatus('saving');
    try {
      // محاكاة حفظ تلقائي
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
      // محاكاة استدعاء API للذكاء الاصطناعي
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

  const addContentBlock = (type: ContentBlock['type']) => {
    const newBlock: ContentBlock = {
      id: Date.now().toString(),
      type,
      content: getDefaultContent(type),
      order: formData.content_blocks.length
    };
    
    setFormData(prev => ({
      ...prev,
      content_blocks: [...prev.content_blocks, newBlock]
    }));
  };

  const getDefaultContent = (type: ContentBlock['type']) => {
    switch (type) {
      case 'paragraph': return { text: '' };
      case 'heading': return { text: '', level: 2 };
      case 'quote': return { text: '', author: '' };
      case 'image': return { url: '', caption: '', alt: '' };
      case 'video': return { url: '', caption: '' };
      case 'tweet': return { url: '' };
      case 'list': return { items: [''], ordered: false };
      case 'link': return { url: '', text: '' };
      case 'highlight': return { text: '', color: '#FEF3C7' };
      default: return {};
    }
  };

  const moveBlock = (blockId: string, direction: 'up' | 'down') => {
    const blocks = [...formData.content_blocks];
    const index = blocks.findIndex(b => b.id === blockId);
    
    if (direction === 'up' && index > 0) {
      [blocks[index], blocks[index - 1]] = [blocks[index - 1], blocks[index]];
    } else if (direction === 'down' && index < blocks.length - 1) {
      [blocks[index], blocks[index + 1]] = [blocks[index + 1], blocks[index]];
    }
    
    // إعادة ترقيم البلوكات
    blocks.forEach((block, i) => block.order = i);
    
    setFormData(prev => ({ ...prev, content_blocks: blocks }));
  };

  const deleteBlock = (blockId: string) => {
    setFormData(prev => ({
      ...prev,
      content_blocks: prev.content_blocks.filter(b => b.id !== blockId)
    }));
  };

  const updateBlockContent = (blockId: string, content: any) => {
    setFormData(prev => ({
      ...prev,
      content_blocks: prev.content_blocks.map(b => 
        b.id === blockId ? { ...b, content } : b
      )
    }));
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

      alert(status === 'published' ? 'تم نشر المقال بنجاح' : 'تم الحفظ بنجاح');
      // إعادة توجيه لقسم الأخبار
      window.location.href = '/dashboard/news';
    } catch (err) {
      console.error(err);
      alert(err instanceof Error ? err.message : 'حدث خطأ أثناء الحفظ');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header المتطور */}
        <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 rounded-3xl p-8 mb-8 shadow-2xl relative overflow-hidden">
          {/* تأثيرات بصرية */}
          <div className="absolute top-0 left-0 w-full h-full">
            <div className="absolute top-10 right-10 w-32 h-32 bg-white/10 rounded-full blur-xl"></div>
            <div className="absolute bottom-10 left-10 w-40 h-40 bg-yellow-400/20 rounded-full blur-2xl"></div>
            <div className="absolute top-1/2 left-1/2 w-24 h-24 bg-purple-400/15 rounded-full blur-lg"></div>
          </div>
          
          <div className="relative z-10 flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-bold text-white mb-4 flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                إنشاء مقال جديد في سبق
              </h1>
              <p className="text-blue-100 text-lg">
                🚀 أضف محتوى إعلامي احترافي مع دعم الذكاء الاصطناعي المتقدم
              </p>
            </div>
            
            {/* حالة الحفظ التلقائي المتطورة */}
            <div className="flex items-center gap-4">
              <div className={`flex items-center gap-3 px-5 py-3 rounded-full backdrop-blur-md border shadow-lg transition-all duration-300 ${
                autoSaveStatus === 'saved' ? 'bg-green-500/20 border-green-400/40 text-green-100' :
                autoSaveStatus === 'saving' ? 'bg-blue-500/20 border-blue-400/40 text-blue-100' :
                'bg-red-500/20 border-red-400/40 text-red-100'
              }`}>
                {autoSaveStatus === 'saved' ? <CheckCircle className="w-5 h-5" /> :
                 autoSaveStatus === 'saving' ? <RefreshCw className="w-5 h-5 animate-spin" /> :
                 <XCircle className="w-5 h-5" />}
                <span className="font-medium">
                  {autoSaveStatus === 'saved' ? '✅ محفوظ تلقائياً' :
                   autoSaveStatus === 'saving' ? '⏳ جارٍ الحفظ...' :
                   '❌ خطأ في الحفظ'}
                </span>
              </div>
              
              {/* نقاط الجودة المتطورة */}
              <div className={`flex items-center gap-3 px-5 py-3 rounded-full backdrop-blur-md border shadow-lg transition-all duration-300 ${
                qualityScore >= 80 ? 'bg-gradient-to-r from-green-500/20 to-emerald-500/20 border-green-400/40 text-green-100' :
                qualityScore >= 60 ? 'bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border-yellow-400/40 text-yellow-100' :
                'bg-gradient-to-r from-red-500/20 to-pink-500/20 border-red-400/40 text-red-100'
              }`}>
                <Star className="w-5 h-5" />
                <span className="font-bold text-lg">جودة المقال: {qualityScore}%</span>
                <div className="w-16 h-2 bg-white/20 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${
                      qualityScore >= 80 ? 'bg-green-400' :
                      qualityScore >= 60 ? 'bg-yellow-400' :
                      'bg-red-400'
                    }`}
                    style={{ width: `${qualityScore}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* تبويبات متطورة */}
          <div className="flex gap-2 mb-8">
            {[
              { id: 'content', name: 'محرر المحتوى', icon: FileText, color: 'from-blue-500 to-blue-600', emoji: '✍️' },
              { id: 'settings', name: 'الإعدادات المتقدمة', icon: Settings, color: 'from-purple-500 to-purple-600', emoji: '⚙️' },
              { id: 'seo', name: 'تحسين SEO', icon: Target, color: 'from-green-500 to-green-600', emoji: '🎯' }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-3 px-6 py-4 rounded-2xl font-medium transition-all duration-300 transform hover:scale-105 backdrop-blur-md border shadow-lg ${
                    activeTab === tab.id
                      ? `bg-gradient-to-r ${tab.color} text-white border-white/30 shadow-xl`
                      : 'bg-white/20 border-white/30 text-white hover:bg-white/30'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-lg">{tab.emoji} {tab.name}</span>
                  {activeTab === tab.id && (
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                  )}
                </button>
              );
            })}
          </div>

          {/* أزرار الحفظ المتطورة */}
          <div className="flex items-center gap-4 flex-wrap">
            <button
              onClick={() => handleSave('draft')}
              disabled={saving}
              className="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-xl hover:from-gray-600 hover:to-gray-700 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 shadow-lg backdrop-blur-md border border-white/20"
            >
              <Save className="w-5 h-5" />
              <span className="font-medium">💾 حفظ كمسودة</span>
            </button>
            
            <button
              onClick={() => handleSave('review')}
              disabled={saving}
              className="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 shadow-lg backdrop-blur-md border border-white/20"
            >
              <Send className="w-5 h-5" />
              <span className="font-medium">📤 إرسال للمراجعة</span>
            </button>
            
            <button
              onClick={() => handleSave('published')}
              disabled={saving}
              className="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 shadow-lg backdrop-blur-md border border-white/20"
            >
              <Eye className="w-5 h-5" />
              <span className="font-medium">🌐 نشر مباشر</span>
            </button>
            
            <button
              onClick={() => setPreviewMode(!previewMode)}
              className="flex items-center gap-3 px-6 py-3 bg-white/20 backdrop-blur-md border border-white/30 text-white rounded-xl hover:bg-white/30 transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              <Eye className="w-5 h-5" />
              <span className="font-medium">👁️ معاينة</span>
            </button>
            
            {saving && (
              <div className="flex items-center gap-3 px-6 py-3 bg-yellow-500/20 backdrop-blur-md border border-yellow-400/40 text-yellow-100 rounded-xl shadow-lg">
                <RefreshCw className="w-5 h-5 animate-spin" />
                <span className="font-medium">⏳ جارٍ الحفظ...</span>
              </div>
            )}
          </div>
        </div>

        {/* تنبيهات التحقق المتطورة */}
        {validationErrors.length > 0 && (
          <div className="bg-gradient-to-r from-red-50 to-pink-50 border-2 border-red-200 rounded-2xl p-6 mb-8 shadow-lg">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-pink-600 rounded-full flex items-center justify-center shadow-lg">
                <AlertTriangle className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-red-800">⚠️ يرجى تصحيح الأخطاء التالية:</h3>
                <p className="text-red-600">إصلح هذه النقاط لضمان جودة المقال</p>
              </div>
            </div>
            <ul className="space-y-3">
              {validationErrors.map((error, index) => (
                <li key={index} className="flex items-center gap-3 text-red-700 bg-white/70 p-3 rounded-xl">
                  <span className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center text-red-600 font-bold text-sm">
                    {index + 1}
                  </span>
                  <span className="font-medium">{error}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* المحتوى الرئيسي */}
          <div className="lg:col-span-2">
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
            
            {activeTab === 'settings' && (
              <div className="bg-white rounded-2xl p-6 shadow-sm border">
                <h2 className="text-lg font-semibold text-gray-900 mb-6">إعدادات متقدمة</h2>
                <p className="text-gray-600">قيد التطوير...</p>
              </div>
            )}
            
            {activeTab === 'seo' && (
              <div className="bg-white rounded-2xl p-6 shadow-sm border">
                <h2 className="text-lg font-semibold text-gray-900 mb-6">تحسين محركات البحث</h2>
                <p className="text-gray-600">قيد التطوير...</p>
              </div>
            )}
          </div>

          {/* الشريط الجانبي */}
          <div className="space-y-6">
            <QualityPanel qualityScore={qualityScore} />
            <PublishPanel 
              formData={formData}
              setFormData={setFormData}
              onSave={handleSave}
              saving={saving}
            />
            <MediaPanel 
              formData={formData}
              setFormData={setFormData}
            />
          </div>
        </div>
      </div>
    </div>
  );
} 