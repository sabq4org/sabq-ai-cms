'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  Save, Eye, Send, AlertTriangle, Plus, ArrowUp, ArrowDown, 
  Trash2, Image, Video, Quote, Type, List, Link, Palette,
  Sparkles, Brain, MapPin, Clock, User, Globe, Settings,
  Upload, Play, MessageSquare, Hash, FileText, CheckCircle,
  XCircle, Lightbulb, Zap, Target, Star, RefreshCw, Edit3,
  ArrowLeft, Loader2
} from 'lucide-react';
import toast from 'react-hot-toast';
import { logActions, getCurrentUser } from '../../../../../lib/log-activity';
import ContentEditorWithTiptap from '../../../../../components/ContentEditorWithTiptap';

// ===============================
// أنواع البيانات
// ===============================

interface ArticleEditFormData {
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
  status: 'draft' | 'pending' | 'published' | 'deleted';
  content_blocks: ContentBlock[];
  content?: string;
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

export default function EditArticlePage() {
  const params = useParams();
  const router = useRouter();
  const articleId = params?.id as string;

  const [formData, setFormData] = useState<ArticleEditFormData>({
    id: articleId,
    title: '',
    subtitle: '',
    description: '',
    category_id: 0,
    is_breaking: false,
    is_featured: false,
    keywords: [],
    publish_time: new Date().toISOString(),
    author_id: 'current_user',
    scope: 'local',
    status: 'draft',
    content_blocks: [],
    content: ''
  });

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'content' | 'settings' | 'seo'>('content');
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
          category_id: articleData.category_id || 0,
          subcategory_id: articleData.subcategory_id,
          is_breaking: articleData.is_breaking || false,
          is_featured: articleData.is_featured || false,
          keywords: articleData.seo_keywords || [],
          cover_image: articleData.featured_image || '',
          cover_video: articleData.featured_video || '',
          publish_time: articleData.publish_at || new Date().toISOString(),
          author_id: articleData.author_id || 'current_user',
          scope: articleData.scope || 'local',
          status: articleData.status || 'draft',
          content_blocks: articleData.content_blocks || [],
          content: articleData.content || ''
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

  // تحميل التصنيفات
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const res = await fetch('/api/categories');
        if (!res.ok) {
          throw new Error('فشل تحميل التصنيفات');
        }
        const data = await res.json();
        
        setCategories(data || []);
      } catch (err) {
        console.error('خطأ في تحميل التصنيفات:', err);
        setCategories([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const handleSave = async (status: 'draft' | 'pending' | 'published') => {
    if (!formData.title.trim()) {
      toast.error('العنوان مطلوب');
      return;
    }

    setSaving(true);
    try {
      const articleData = {
        title: formData.title,
        subtitle: formData.subtitle,
        content: formData.content,
        summary: formData.description,
        category_id: formData.category_id,
        status,
        is_breaking: formData.is_breaking,
        is_featured: formData.is_featured,
        featured_image: formData.cover_image,
        seo_title: formData.title,
        seo_description: formData.description,
        seo_keywords: formData.keywords,
        publish_at: formData.publish_time
      };

      // استخدام PATCH للتحديث
      const res = await fetch(`/api/articles/${articleId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(articleData)
      });
      
      if (!res.ok) {
        const result = await res.json();
        throw new Error(result.error || 'فشل التحديث');
      }

      // تسجيل الحدث في سجلات النظام
      const userInfo = getCurrentUser();
      await logActions.updateArticle(userInfo, articleId, formData.title);
      
      if (status === 'published') {
        await logActions.publishArticle(userInfo, articleId, formData.title);
      }

      toast.success(status === 'published' ? 'تم نشر المقال بنجاح' : 'تم حفظ التعديلات بنجاح');
      router.push('/dashboard/news');
    } catch (err) {
      console.error(err);
      toast.error(err instanceof Error ? err.message : 'حدث خطأ أثناء التحديث');
    } finally {
      setSaving(false);
    }
  };

  // عرض حالة التحميل
  if (articleLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">جارٍ تحميل المقال...</p>
        </div>
      </div>
    );
  }

  // عرض رسالة الخطأ
  if (loadError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
            <XCircle className="w-10 h-10 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">خطأ في تحميل المقال</h2>
          <p className="text-gray-600 mb-4">{loadError}</p>
          <button
            onClick={() => router.push('/dashboard/news')}
            className="flex items-center gap-2 mx-auto px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <ArrowLeft className="w-4 h-4" />
            العودة إلى قائمة الأخبار
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 rounded-3xl p-8 mb-8 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full">
            <div className="absolute top-10 right-10 w-32 h-32 bg-white/10 rounded-full blur-xl"></div>
            <div className="absolute bottom-10 left-10 w-40 h-40 bg-yellow-400/20 rounded-full blur-2xl"></div>
          </div>
          
          <div className="relative z-10">
            <h1 className="text-4xl font-bold text-white mb-4 flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
                <Edit3 className="w-6 h-6 text-white" />
              </div>
              تعديل المقال
            </h1>
            <p className="text-blue-100 text-lg mb-8">
              ✏️ قم بتحديث وتحسين محتوى المقال
            </p>

            {/* أزرار الحفظ */}
            <div className="flex items-center gap-4 flex-wrap">
              <button
                onClick={() => router.push('/dashboard/news')}
                className="flex items-center gap-3 px-6 py-3 bg-white/20 backdrop-blur-md border border-white/30 text-white rounded-xl hover:bg-white/30 transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="font-medium">🔙 رجوع</span>
              </button>

              <button
                onClick={() => handleSave('draft')}
                disabled={saving}
                className="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-xl hover:from-gray-600 hover:to-gray-700 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 shadow-lg backdrop-blur-md border border-white/20"
              >
                <Save className="w-5 h-5" />
                <span className="font-medium">💾 حفظ كمسودة</span>
              </button>
              
              <button
                onClick={() => handleSave('pending')}
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
                <span className="font-medium">🌐 نشر التحديثات</span>
              </button>
            </div>
          </div>
        </div>

        {/* تبويبات */}
        <div className="bg-white rounded-2xl shadow-sm mb-6 p-2">
          <div className="flex gap-2">
            {[
              { id: 'content', name: 'محرر المحتوى', icon: FileText, emoji: '✍️' },
              { id: 'settings', name: 'الإعدادات', icon: Settings, emoji: '⚙️' },
              { id: 'seo', name: 'تحسين SEO', icon: Target, emoji: '🎯' }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-4 py-3 rounded-xl font-medium transition-all duration-300 ${
                    activeTab === tab.id
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{tab.emoji} {tab.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* المحتوى الرئيسي */}
        {activeTab === 'content' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              {/* الحقول الأساسية */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-6">معلومات المقال الأساسية</h2>
                
                <div className="space-y-4">
                  {/* العنوان الرئيسي */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      العنوان الرئيسي <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      className="w-full p-3 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 resize-none"
                      rows={2}
                      placeholder="اكتب عنواناً جذاباً ومميزاً..."
                    />
                  </div>

                  {/* العنوان الفرعي */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      العنوان الفرعي
                    </label>
                    <input
                      type="text"
                      value={formData.subtitle || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, subtitle: e.target.value }))}
                      className="w-full p-3 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="عنوان فرعي (اختياري)"
                    />
                  </div>

                  {/* التصنيف */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      التصنيف <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.category_id}
                      onChange={(e) => setFormData(prev => ({ ...prev, category_id: Number(e.target.value) }))}
                      className="w-full p-3 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value={0}>اختر التصنيف...</option>
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>
                          {cat.icon} {cat.name_ar}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* الوصف */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      الوصف الموجز
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      className="w-full p-3 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 resize-none"
                      rows={3}
                      placeholder="وصف موجز يظهر في نتائج البحث..."
                    />
                  </div>
                </div>
              </div>

              {/* محرر المحتوى */}
              <ContentEditorWithTiptap 
                formData={formData}
                setFormData={setFormData}
                categories={categories}
                aiLoading={{}}
              />
            </div>

            {/* الشريط الجانبي */}
            <div className="space-y-6">
              {/* خيارات النشر */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">خيارات النشر</h3>
                
                <div className="space-y-4">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.is_breaking}
                      onChange={(e) => setFormData(prev => ({ ...prev, is_breaking: e.target.checked }))}
                      className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                    />
                    <span className="text-sm text-gray-700">خبر عاجل</span>
                  </label>
                  
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.is_featured}
                      onChange={(e) => setFormData(prev => ({ ...prev, is_featured: e.target.checked }))}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">خبر رئيسي</span>
                  </label>
                </div>
              </div>

              {/* الصورة البارزة */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">الصورة البارزة</h3>
                
                <div className="space-y-4">
                  <input
                    type="text"
                    value={formData.cover_image || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, cover_image: e.target.value }))}
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="رابط الصورة..."
                  />
                  
                  {formData.cover_image && (
                    <img 
                      src={formData.cover_image} 
                      alt="صورة المقال" 
                      className="w-full h-40 object-cover rounded-lg"
                    />
                  )}
                </div>
              </div>

              {/* الكلمات المفتاحية */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">الكلمات المفتاحية</h3>
                
                <div className="space-y-4">
                  <input
                    type="text"
                    value={formData.keywords.join(', ')}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      keywords: e.target.value.split(',').map(k => k.trim()).filter(k => k)
                    }))}
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="كلمة1، كلمة2، كلمة3..."
                  />
                  <p className="text-xs text-gray-500">افصل بين الكلمات بفاصلة</p>
                </div>
              </div>
            </div>
          </div>
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
    </div>
  );
} 