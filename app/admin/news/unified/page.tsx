'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast, Toaster } from 'react-hot-toast';
import { useDarkModeContext } from '@/contexts/DarkModeContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import dynamic from 'next/dynamic';
import FeaturedImageUpload from '@/components/FeaturedImageUpload';
import { 
  Save, Send, Eye, Clock, Image as ImageIcon, Upload, X, 
  Tag, User, Calendar, AlertCircle, CheckCircle, Loader2,
  Sparkles, FileText, Settings, Search, Plus, Trash2,
  Globe, TrendingUp, BookOpen, ChevronRight, Home, Zap,
  Star, CheckSquare, Wand2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import DashboardLayout from '@/components/admin/modern-dashboard/DashboardLayout';

// تحميل المحرر بشكل ديناميكي
const Editor = dynamic(() => import('@/components/Editor/Editor'), { ssr: false });

interface Category {
  id: string;
  name: string;
  name_ar?: string;
  slug: string;
  color?: string;
}

interface Reporter {
  id: string;
  name: string;
  email?: string;
  avatar?: string | null;
  role?: string;
  title?: string;
  slug?: string;
  is_verified?: boolean;
  verification_badge?: string | null;
}

export default function UnifiedNewsCreatePageUltraEnhanced() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { darkMode } = useDarkModeContext();
  const editorRef = useRef<any>(null);
  
  // الحصول على معرف المقال من URL
  const articleId = searchParams.get('id');
  const isEditMode = !!articleId;
  
  // حالات التحميل
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [reporters, setReporters] = useState<Reporter[]>([]);
  const [isAILoading, setIsAILoading] = useState(false);
  
  // حالة رسائل النجاح والخطأ
  const [message, setMessage] = useState<{
    type: 'success' | 'error' | null;
    text: string;
  }>({ type: null, text: '' });
  
  // تتبع اكتمال المقال
  const [completionScore, setCompletionScore] = useState(0);
  
  // الذكاء الاصطناعي التلقائي - حالات جديدة
  const [aiAutoSuggestions, setAiAutoSuggestions] = useState({
    titleSuggestions: [] as string[],
    excerptSuggestion: '',
    keywordSuggestions: [] as string[],
    categorySuggestion: '',
    isGenerating: false,
    lastContentHash: ''
  });
  
  // تتبع التغييرات للذكاء الاصطناعي التلقائي
  const [aiTriggerTimeout, setAiTriggerTimeout] = useState<NodeJS.Timeout | null>(null);
  
  // حالة النموذج - قيم افتراضية فارغة
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    excerpt: '',
    content: '',
    authorId: '',
    categoryId: '',
    type: 'local' as 'local' | 'external',
    featuredImage: '',
    featuredImageCaption: '',
    gallery: [] as string[],
    externalLink: '',
    keywords: [] as string[],
    seoTitle: '',
    seoDescription: '',
    publishType: 'now' as 'now' | 'scheduled',
    scheduledDate: '',
    isBreaking: false,
    isFeatured: false,
    status: 'draft' as 'draft' | 'published'
  });
  
  // حساب نسبة الاكتمال
  const calculateCompletion = useCallback(() => {
    let score = 0;
    const checks = [
      { field: formData.title, weight: 20, name: 'العنوان' },
      { field: formData.excerpt, weight: 15, name: 'الموجز' },
      { field: formData.content, weight: 25, name: 'المحتوى' },
      { field: formData.authorId, weight: 10, name: 'المراسل' },
      { field: formData.categoryId, weight: 10, name: 'التصنيف' },
      { field: formData.featuredImage, weight: 10, name: 'الصورة المميزة' },
      { field: formData.keywords.length > 0, weight: 5, name: 'الكلمات المفتاحية' },
      { field: formData.seoTitle, weight: 5, name: 'عنوان SEO' }
    ];
    
    const missingFields: string[] = [];
    
    checks.forEach(check => {
      if (check.field) {
        score += check.weight;
      } else {
        missingFields.push(check.name);
      }
    });
    
    const finalScore = Math.min(score, 100);
    setCompletionScore(finalScore);
    
    console.log('📊 حساب الاكتمال:', {
      score: finalScore,
      missingFields,
      details: checks.map(c => ({
        name: c.name,
        value: !!c.field,
        weight: c.weight
      }))
    });
  }, [formData]);

  // تحديث نسبة الاكتمال عند تغيير البيانات
  useEffect(() => {
    calculateCompletion();
  }, [calculateCompletion]);

  // دالة توليد الاقتراحات الذكية التلقائية
  const generateAutoSuggestions = useCallback(async (content: string, forceGenerate = false) => {
    // التحقق من صحة المحتوى
    if (!content || typeof content !== 'string') {
      console.warn('generateAutoSuggestions: المحتوى المرسل غير صالح:', typeof content);
      return;
    }

    // تجنب الطلبات المكررة
    const contentHash = btoa(content.substring(0, 200));
    if (!forceGenerate && contentHash === aiAutoSuggestions.lastContentHash) {
      return;
    }

    // تطلب محتوى لا يقل عن 50 حرف لتوليد اقتراحات مفيدة
    if (content.length < 50) {
      return;
    }

    setAiAutoSuggestions(prev => ({ 
      ...prev, 
      isGenerating: true,
      lastContentHash: contentHash 
    }));

    try {
      console.log('🤖 توليد اقتراحات ذكية تلقائية...');
      
      // طلبات متوازية للسرعة
      const [titleResponse, excerptResponse, keywordsResponse] = await Promise.allSettled([
        // توليد 3 عناوين مقترحة
        fetch('/api/ai/editor', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            service: 'generate_title', 
            content: content.substring(0, 300),
            context: { 
              autoGenerated: true,
              timestamp: new Date().toISOString()
            }
          })
        }),
        
        // توليد ملخص ذكي
        fetch('/api/ai/editor', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            service: 'summarize', 
            content: content.substring(0, 500),
            context: { 
              targetLength: '100-140',
              autoGenerated: true 
            }
          })
        }),
        
        // استخراج كلمات مفتاحية
        fetch('/api/ai/keywords', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            title: formData.title,
            content: content.substring(0, 400),
            excerpt: formData.excerpt
          })
        })
      ]);

      // معالجة نتائج التوليد
      const suggestions = {
        titleSuggestions: [] as string[],
        excerptSuggestion: '',
        keywordSuggestions: [] as string[]
      };

      // معالجة العناوين المقترحة
      if (titleResponse.status === 'fulfilled' && titleResponse.value.ok) {
        const titleData = await titleResponse.value.json();
        if (titleData.result) {
          // استخراج العناوين من النص المُولد
          const titles = titleData.result
            .split('\n')
            .map((line: string) => line.replace(/^\d+\.?\s*/, '').trim())
            .filter((title: string) => title.length > 10 && title.length < 100)
            .slice(0, 3);
          suggestions.titleSuggestions = titles;
        }
      }

      // معالجة الملخص المقترح
      if (excerptResponse.status === 'fulfilled' && excerptResponse.value.ok) {
        const excerptData = await excerptResponse.value.json();
        if (excerptData.result && excerptData.result.length <= 160) {
          suggestions.excerptSuggestion = excerptData.result.trim();
        }
      }

      // معالجة الكلمات المفتاحية
      if (keywordsResponse.status === 'fulfilled' && keywordsResponse.value.ok) {
        const keywordsData = await keywordsResponse.value.json();
        if (keywordsData.keywords && Array.isArray(keywordsData.keywords)) {
          suggestions.keywordSuggestions = keywordsData.keywords.slice(0, 8);
        }
      }

      // تطبيق الاقتراحات
      setAiAutoSuggestions(prev => ({
        ...prev,
        ...suggestions,
        isGenerating: false
      }));

      console.log('✅ تم توليد الاقتراحات الذكية:', {
        titles: suggestions.titleSuggestions.length,
        excerpt: !!suggestions.excerptSuggestion,
        keywords: suggestions.keywordSuggestions.length
      });

    } catch (error) {
      console.error('❌ خطأ في توليد الاقتراحات الذكية:', error);
      setAiAutoSuggestions(prev => ({ 
        ...prev, 
        isGenerating: false 
      }));
    }
  }, [formData.title, formData.excerpt, aiAutoSuggestions.lastContentHash]);

  // تتبع تغييرات المحتوى لتفعيل الذكاء الاصطناعي التلقائي
  const handleContentChange = useCallback((newContent: string) => {
    setFormData(prev => ({ ...prev, content: newContent }));
    
    // إلغاء المؤقت السابق
    if (aiTriggerTimeout) {
      clearTimeout(aiTriggerTimeout);
    }
    
    // التحقق من صحة المحتوى قبل إرساله للذكاء الاصطناعي
    if (newContent && typeof newContent === 'string' && newContent.trim().length > 0) {
      // تأخير توليد الاقتراحات لـ 3 ثوان بعد آخر تغيير (debouncing)
      const newTimeout = setTimeout(() => {
        generateAutoSuggestions(newContent);
      }, 3000);
      
      setAiTriggerTimeout(newTimeout);
    }
  }, [generateAutoSuggestions, aiTriggerTimeout]);

  // دالة تطبيق الاقتراح المحدد
  const applySuggestion = useCallback((type: 'title' | 'excerpt' | 'keywords', value: any, index?: number) => {
    switch (type) {
      case 'title':
        if (typeof value === 'string') {
          setFormData(prev => ({ ...prev, title: value }));
          toast.success('تم تطبيق العنوان المقترح');
        } else if (typeof index === 'number' && aiAutoSuggestions.titleSuggestions[index]) {
          setFormData(prev => ({ ...prev, title: aiAutoSuggestions.titleSuggestions[index] }));
          toast.success('تم تطبيق العنوان المقترح');
        }
        break;
        
      case 'excerpt':
        setFormData(prev => ({ ...prev, excerpt: aiAutoSuggestions.excerptSuggestion }));
        toast.success('تم تطبيق الملخص المقترح');
        break;
        
      case 'keywords':
        setFormData(prev => ({ 
          ...prev, 
          keywords: [...new Set([...prev.keywords, ...aiAutoSuggestions.keywordSuggestions])]
        }));
        toast.success('تم إضافة الكلمات المفتاحية المقترحة');
        break;
    }
  }, [aiAutoSuggestions]);

  // تنظيف المؤقتات عند إلغاء التحميل
  useEffect(() => {
    return () => {
      if (aiTriggerTimeout) {
        clearTimeout(aiTriggerTimeout);
      }
    };
  }, [aiTriggerTimeout]);

  // تحميل البيانات الأولية
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setLoading(true);
        console.log('🔄 بدء تحميل البيانات...');
        
        // تحميل التصنيفات والمراسلين بشكل متوازي
        const [categoriesResponse, reportersResponse] = await Promise.all([
          fetch('/api/categories'),
          fetch('/api/reporters?limit=100&active_only=true')
        ]);
        
        console.log('📡 استجابات API:', {
          categories: { status: categoriesResponse.status, ok: categoriesResponse.ok },
          reporters: { status: reportersResponse.status, ok: reportersResponse.ok }
        });
        
        let loadedCategories = [];
        let loadedReporters = [];
        let defaultCategoryId = '';
        let defaultReporterId = '';
        
        // معالجة التصنيفات
        if (categoriesResponse.ok) {
          const categoriesData = await categoriesResponse.json();
          console.log('📦 بيانات التصنيفات المستلمة:', categoriesData);
          loadedCategories = categoriesData.categories || categoriesData || [];
          setCategories(loadedCategories);
          console.log(`📂 تم جلب ${loadedCategories.length} تصنيف`, loadedCategories);
          
          if (loadedCategories.length > 0) {
            defaultCategoryId = loadedCategories[0].id;
            console.log(`🎯 تصنيف افتراضي: ${loadedCategories[0].name_ar || loadedCategories[0].name} (${defaultCategoryId})`);
          }
        } else {
          console.log('❌ فشل في تحميل التصنيفات:', categoriesResponse.status);
          const errorText = await categoriesResponse.text();
          console.error('رسالة الخطأ:', errorText);
          toast.error('فشل في تحميل التصنيفات');
        }
        
        // معالجة المراسلين من API الجديد
        if (reportersResponse.ok) {
          const reportersData = await reportersResponse.json();
          console.log('📦 بيانات المراسلين المستلمة:', reportersData);
          
          if (reportersData.success && reportersData.reporters) {
            // استخدام بيانات المراسلين من جدول reporters
            loadedReporters = reportersData.reporters;
            
            // تحويل البيانات لتتوافق مع النموذج المطلوب
            const convertedReporters = loadedReporters.map((reporter: any) => ({
              id: reporter.id,  // استخدام id من reporters
              name: reporter.full_name,
              email: '', // لا نحتاج البريد في هذا السياق
              role: 'reporter',
              avatar: null, // لا صور وهمية حسب السياسة الجديدة
              title: reporter.title,
              slug: reporter.slug,
              is_verified: reporter.is_verified,
              verification_badge: reporter.verification_badge
            }));
            
            setReporters(convertedReporters);
            console.log(`👥 تم جلب ${convertedReporters.length} مراسل من جدول reporters`, convertedReporters);
            
            if (convertedReporters.length > 0) {
              defaultReporterId = convertedReporters[0].id;
              console.log(`👤 مراسل افتراضي: ${convertedReporters[0].name} (${defaultReporterId})`);
            }
          } else {
            console.log('⚠️ لا توجد مراسلين في قاعدة البيانات');
            setReporters([]);
            toast.error('لا يوجد مراسلين متاحين');
          }
        } else {
          console.log('❌ فشل في تحميل المراسلين:', reportersResponse.status);
          const errorText = await reportersResponse.text();
          console.error('رسالة الخطأ:', errorText);
          setReporters([]);
          toast.error('فشل في تحميل المراسلين - يرجى المحاولة لاحقاً');
        }
        
        // تعيين القيم الافتراضية دفعة واحدة باستخدام البيانات المحملة
        if (defaultCategoryId || defaultReporterId) {
          setFormData(prev => {
            const updated = {
              ...prev,
              ...(defaultCategoryId && { categoryId: defaultCategoryId }),
              ...(defaultReporterId && { authorId: defaultReporterId })
            };
            console.log('✅ تم تعيين القيم الافتراضية:', {
              categoryId: updated.categoryId,
              authorId: updated.authorId,
              categoriesCount: loadedCategories.length,
              reportersCount: loadedReporters.length
            });
            return updated;
          });
        }
        
        // جلب بيانات المقال إذا كان في وضع التعديل
        if (isEditMode && articleId) {
          console.log('📝 جلب بيانات المقال للتعديل:', articleId);
          try {
            const articleResponse = await fetch(`/api/articles/${articleId}?all=true`);
            
            if (articleResponse.ok) {
              const articleData = await articleResponse.json();
              console.log('✅ تم جلب بيانات المقال:', articleData);
              
              // التعامل مع كلا التنسيقين (للتوافق)
              let article = null;
              if (articleData.success && articleData.article) {
                article = articleData.article;
              } else if (articleData.id && articleData.title) {
                // البيانات مباشرة
                article = articleData;
              }
              
              if (article) {
                // تحليل metadata إذا كانت string
                if (article.metadata && typeof article.metadata === 'string') {
                  try {
                    article.metadata = JSON.parse(article.metadata);
                  } catch (e) {
                    console.error('❌ خطأ في تحليل metadata:', e);
                    article.metadata = {};
                  }
                }
                
                console.log('📋 الكلمات المفتاحية المستلمة:', {
                  'article.keywords': article.keywords,
                  'article.metadata': article.metadata,
                  'article.metadata?.keywords': article.metadata?.keywords,
                  'article.seo_keywords': article.seo_keywords
                });
                
                // تحديث بيانات النموذج
                setFormData({
                  title: article.title || '',
                  subtitle: article.metadata?.subtitle || '',
                  excerpt: article.excerpt || '',
                  content: article.content || '',
                  authorId: article.author_id || defaultReporterId || '',
                  categoryId: article.category_id || defaultCategoryId || '',
                  type: article.metadata?.type || 'local',
                  isBreaking: article.metadata?.is_breaking || article.breaking || false,
                  isFeatured: article.metadata?.is_featured || article.featured || false,
                  featuredImage: article.featured_image || '',
                  featuredImageCaption: article.metadata?.image_caption || '',
                  gallery: article.metadata?.gallery || [],
                  externalLink: article.metadata?.external_link || '',
                  publishType: 'now',
                  scheduledDate: '',
                  keywords: (() => {
                    // محاولة جلب الكلمات المفتاحية من مصادر مختلفة
                    if (article.metadata?.keywords && Array.isArray(article.metadata.keywords)) {
                      return article.metadata.keywords;
                    }
                    if (article.keywords && Array.isArray(article.keywords)) {
                      return article.keywords;
                    }
                    // إذا كانت مخزنة كـ JSON string
                    if (article.metadata?.keywords && typeof article.metadata.keywords === 'string') {
                      try {
                        const parsed = JSON.parse(article.metadata.keywords);
                        return Array.isArray(parsed) ? parsed : [];
                      } catch {
                        return [];
                      }
                    }
                    if (article.keywords && typeof article.keywords === 'string') {
                      try {
                        const parsed = JSON.parse(article.keywords);
                        return Array.isArray(parsed) ? parsed : [];
                      } catch {
                        // قد تكون مفصولة بفواصل
                        return article.keywords.split(',').map(k => k.trim()).filter(Boolean);
                      }
                    }
                    return [];
                  })(),
                  seoTitle: article.metadata?.seo_title || article.seo_title || '',
                  seoDescription: article.metadata?.seo_description || article.seo_description || '',
                  status: article.status || 'draft'
                });
                
                // تحديث المحرر
                if (editorRef.current && article.content) {
                  setTimeout(() => {
                    editorRef.current.setContent(article.content);
                  }, 100);
                }
                
                toast.success('تم تحميل بيانات المقال بنجاح');
              } else {
                console.error('❌ بيانات المقال غير صحيحة:', articleData);
                toast.error('فشل في تحميل بيانات المقال');
              }
            } else {
              console.error('❌ فشل في جلب المقال:', articleResponse.status);
              toast.error('المقال غير موجود أو لا يمكن الوصول إليه');
            }
          } catch (error) {
            console.error('❌ خطأ في جلب المقال:', error);
            toast.error('حدث خطأ في تحميل بيانات المقال');
          }
        }
        
      } catch (error) {
        console.error('❌ خطأ في تحميل البيانات الأولية:', error);
        toast.error('فشل في تحميل البيانات الأولية');
      } finally {
        setLoading(false);
        console.log('✅ انتهى تحميل البيانات');
      }
    };
    
    loadInitialData();
  }, [isEditMode, articleId]);

  // حفظ المقال
  const handleSave = async (status: 'draft' | 'published') => {
    console.log('🚀 بدء حفظ المقال:', { status, title: formData.title });
    try {
      setSaving(true);
      
      // الحصول على المحتوى من المحرر أولاً
      let editorContent = '';
      if (editorRef.current?.getHTML) {
        editorContent = editorRef.current.getHTML() || '';
      }
      
      // إذا لم نحصل على محتوى من المحرر، استخدم النص العادي كـ HTML
      if (!editorContent && formData.content) {
        editorContent = `<p>${formData.content}</p>`;
      }
      
      // التحقق من وجود العنوان والمحتوى
      if (!formData.title || (!editorContent && !formData.content)) {
        toast.error('يرجى إدخال العنوان والمحتوى على الأقل');
        setSaving(false);
        return;
      }
      
      // تحقق إضافي لضمان وجود محتوى فعلي وليس فقط HTML فارغ
      const contentText = editorContent.replace(/<[^>]*>/g, '').trim();
      if (!formData.title.trim()) {
        toast.error('يرجى إدخال عنوان للمقال');
        setSaving(false);
        return;
      }
      
      if (!contentText && !formData.content.trim()) {
        toast.error('يرجى إدخال محتوى للمقال');
        setSaving(false);
        return;
      }
      
      console.log('📝 محتوى المحرر:', {
        hasEditor: !!editorRef.current,
        hasGetHTML: !!editorRef.current?.getHTML,
        editorContent: typeof editorContent,
        preview: editorContent?.substring(0, 100),
        length: editorContent?.length,
        fallbackContent: formData.content
      });
      
      // تحويل المصفوفة إلى نص
      const keywordsString = Array.isArray(formData.keywords) 
        ? formData.keywords.join(', ') 
        : formData.keywords;
      
      console.log('📊 البيانات قبل الإرسال:', {
        title: formData.title,
        categoryId: formData.categoryId,
        authorId: formData.authorId,
        featuredImage: formData.featuredImage || 'فارغة',
        contentLength: editorContent?.length || 0
      });
      
      const articleData = {
        title: formData.title,
        excerpt: formData.excerpt,
        content: editorContent, // HTML من المحرر
        featured_image: formData.featuredImage || null,
        category_id: formData.categoryId,
        author_id: formData.authorId,
        status,
        // الحقول الرئيسية
        featured: formData.isFeatured || false,
        breaking: formData.isBreaking || false,
        // حقول SEO مباشرة
        seo_title: formData.seoTitle || null,
        seo_description: formData.seoDescription || null,
        seo_keywords: formData.keywords.length > 0 ? formData.keywords.join(', ') : null,
        // metadata كـ JSON للحقول الإضافية
        metadata: {
          subtitle: formData.subtitle || null,
          type: formData.type || 'local',
          image_caption: formData.featuredImageCaption || null,
          keywords: formData.keywords,
          gallery: formData.gallery || [],
          external_link: formData.externalLink || null
        },
        ...(status === 'published' && formData.publishType === 'scheduled' && formData.scheduledDate && {
          scheduled_for: formData.scheduledDate
        })
      };
      
      console.log('📤 البيانات التي سترسل:', {
        title: articleData.title,
        contentLength: articleData.content?.length,
        featured_image: articleData.featured_image,
        category_id: articleData.category_id,
        author_id: articleData.author_id,
        status: articleData.status
      });
      
      // تحقق نهائي وإجباري قبل الإرسال
      console.log('🔍 فحص البيانات النهائية قبل الإرسال:', {
        'articleData.category_id': articleData.category_id,
        'articleData.featured_image': articleData.featured_image ? 'موجودة' : 'غير موجودة',
        'articleData.author_id': articleData.author_id,
        'articleData.title': articleData.title,
        'articleData.content length': articleData.content?.length || 0
      });
      
      if (!articleData.category_id) {
        console.error('❌ خطأ: لا يوجد معرف تصنيف! المقال لن يُنشر بدون تصنيف.');
        toast.error('خطأ: يجب اختيار تصنيف للمقال');
        setSaving(false);
        return;
      }
      
      if (!articleData.featured_image) {
        console.warn('⚠️ تحذير: لا توجد صورة مميزة - سيتم النشر بدونها');
      } else {
        console.log('✅ صورة مميزة موجودة');
      }
      
      console.log('🚀 إرسال البيانات إلى API...');
      let response;
      try {
        const url = isEditMode ? `/api/articles/${articleId}` : '/api/articles';
        const method = isEditMode ? 'PATCH' : 'POST';
        
        response = await fetch(url, {
          method: method,
          headers: { 
            'Content-Type': 'application/json',
            'X-Debug-Mode': 'true' // تفعيل وضع التصحيح
          },
          body: JSON.stringify(articleData)
        });
      } catch (fetchError) {
        console.error('❌ خطأ في الاتصال بالخادم:', fetchError);
        toast.error('فشل الاتصال بالخادم');
        setSaving(false);
        return;
      }
      
      console.log('📡 تم استلام الاستجابة:', {
        ok: response?.ok,
        status: response?.status,
        statusText: response?.statusText
      });
      
      if (response?.ok) {
        const result = await response.json();
        console.log('✅ استجابة الخادم:', result);
        
        setMessage({
          type: 'success',
          text: isEditMode 
            ? (status === 'draft' 
              ? '💾 تم تحديث المسودة بنجاح' 
              : formData.publishType === 'scheduled' 
                ? '📅 تم تحديث جدولة المقال بنجاح'
                : '🎉 تم تحديث المقال بنجاح!')
            : (status === 'draft' 
              ? '💾 تم حفظ المسودة بنجاح' 
              : formData.publishType === 'scheduled' 
                ? '📅 تم جدولة المقال للنشر بنجاح'
                : '🎉 تم نشر المقال بنجاح!')
        });
        
        setTimeout(() => {
          router.push('/admin/news');
        }, 1500);
      } else {
        console.error('❌ خطأ في الاستجابة:', {
          status: response?.status || 'غير معروف',
          statusText: response?.statusText || 'غير معروف',
          url: response?.url || '/api/articles'
        });
        
        let errorMessage = 'فشل في الحفظ';
        if (response) {
          try {
            const errorData = await response.json();
            console.error('❌ خطأ من الخادم:', errorData);
          
            // معالجة أفضل للأخطاء
            if (errorData.error) {
              errorMessage = errorData.error;
              // إذا كان هناك تفاصيل إضافية للتصحيح
              if (errorData.debug) {
                console.error('🔍 تفاصيل التصحيح:', errorData.debug);
              }
            } else if (errorData.details) {
              errorMessage = errorData.details;
            } else if (errorData.message) {
              errorMessage = errorData.message;
            } else if (response.status === 404) {
              errorMessage = 'الصفحة المطلوبة غير موجودة';
            } else if (response.status === 500) {
              errorMessage = 'خطأ في الخادم - يرجى المحاولة مرة أخرى';
            } else {
              errorMessage = `خطأ: ${response.status} ${response.statusText}`;
            }
          } catch (e) {
            console.error('❌ خطأ في قراءة رسالة الخطأ:', e);
            errorMessage = `خطأ HTTP: ${response.status} ${response.statusText}`;
          }
        }
        throw new Error(errorMessage);
      }
      
    } catch (error) {
      console.error('❌ خطأ في حفظ المقال:', error);
      const errorMessage = error instanceof Error ? error.message : 'حدث خطأ أثناء الحفظ';
      setMessage({
        type: 'error',
        text: errorMessage
      });
      toast.error(errorMessage);
    } finally {
      console.log('🔄 انتهاء عملية الحفظ');
      setSaving(false);
    }
  };

  // اقتراحات الذكاء الاصطناعي
  const suggestWithAI = async (field: 'title' | 'excerpt' | 'keywords') => {
    try {
      setIsAILoading(true);
      
      console.log(`🤖 بدء توليد ${field} بالذكاء الاصطناعي...`);
      
      // تحديد API endpoint المناسب حسب نوع الحقل
      let endpoint = '/api/ai/editor';
      let requestBody: any = {};
      
      switch (field) {
        case 'title':
          requestBody = {
            service: 'generate_title',
            content: formData.content || formData.excerpt || '',
            context: {
              excerpt: formData.excerpt,
              category: categories.find(c => c.id === formData.categoryId)?.name
            }
          };
          break;
          
        case 'excerpt':
          requestBody = {
            service: 'summarize',
            content: formData.content || '',
            context: {
              title: formData.title,
              targetLength: '100-140'
            }
          };
          break;
          
        case 'keywords':
          endpoint = '/api/ai/keywords';
          requestBody = {
            title: formData.title || '',
            content: formData.content || '',
            excerpt: formData.excerpt || ''
          };
          break;
      }
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log(`✅ نتيجة توليد ${field}:`, result);
        
        if (field === 'keywords') {
          const newKeywords = result.keywords || [];
          if (newKeywords.length > 0) {
            setFormData(prev => ({ 
              ...prev, 
              keywords: [...new Set([...prev.keywords, ...newKeywords])]
            }));
            toast.success(`تم إضافة ${newKeywords.length} كلمة مفتاحية`);
          } else {
            toast.error('لم يتم توليد كلمات مفتاحية');
          }
        } else {
          const generatedText = result.result || result.text || '';
          if (generatedText) {
            setFormData(prev => ({ 
              ...prev, 
              [field]: generatedText 
            }));
            toast.success(`تم توليد ${field === 'title' ? 'العنوان' : 'الموجز'} بنجاح`);
          } else {
            toast.error('لم يتم توليد محتوى');
          }
        }
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'فشل في التوليد');
      }
      
    } catch (error) {
      console.error('❌ خطأ في الذكاء الاصطناعي:', error);
      toast.error(error instanceof Error ? error.message : 'حدث خطأ في الذكاء الاصطناعي');
    } finally {
      setIsAILoading(false);
    }
  };

  // دالة التوليد التلقائي من المحتوى
  const generateFromContent = async () => {
    setIsAILoading(true);
    
    try {
      console.log('🤖 بدء التوليد التلقائي من المحتوى...');
      
      // استخراج النص من المحرر
      let contentText = '';
      let rawExtractedText = null;
      
      // معالجة محتوى formData أولاً
      if (formData.content) {
        if (typeof formData.content === 'string') {
          contentText = formData.content;
        } else if (typeof formData.content === 'object' && (formData.content as any).html) {
          contentText = (formData.content as any).html;
          console.log('📝 استخراج HTML من formData.content.html');
        } else if (typeof formData.content === 'object') {
          contentText = JSON.stringify(formData.content);
          console.log('📝 تحويل formData.content object إلى string');
        }
      }
      
      console.log('🔍 بدء استخراج المحتوى:', {
        formDataContentType: typeof formData.content,
        formDataLength: contentText?.length || 0,
        formDataPreview: contentText?.substring(0, 50) || 'فارغ',
        editorRefExists: !!editorRef.current,
        editorRefMethods: editorRef.current ? Object.keys(editorRef.current) : []
      });
      
      // محاولة استخراج النص من المحرر بطرق مختلفة
      if (editorRef.current) {
        try {
          console.log('🔍 طرق المحرر المتاحة:', {
            getText: typeof editorRef.current.getText,
            getContent: typeof editorRef.current.getContent,
            getValue: typeof editorRef.current.getValue,
            getHTML: typeof editorRef.current.getHTML,
            innerText: typeof editorRef.current.innerText,
            textContent: typeof editorRef.current.textContent,
            editor: !!editorRef.current.editor,
            editorMethods: editorRef.current.editor ? Object.keys(editorRef.current.editor) : []
          });

          // محاولة استخراج النص بطرق مختلفة - الأولوية للطرق الصحيحة
          // جرب الوصول للـ editor الداخلي في Tiptap أولاً للحصول على النص الخام
          if (editorRef.current.editor?.getText) {
            rawExtractedText = editorRef.current.editor.getText();
            console.log('✅ استخدام editor.getText (نص خام):', rawExtractedText?.length);
          } else if (editorRef.current.editor?.getHTML) {
            rawExtractedText = editorRef.current.editor.getHTML();
            console.log('✅ استخدام editor.getHTML:', rawExtractedText?.length);
          } else if (editorRef.current.getText) {
            rawExtractedText = editorRef.current.getText();
            console.log('✅ استخدام getText:', rawExtractedText?.length);
          } else if (editorRef.current.getHTML) {
            rawExtractedText = editorRef.current.getHTML();
            console.log('✅ استخدام getHTML:', rawExtractedText?.length);
          } else if (editorRef.current.getContent) {
            const content = editorRef.current.getContent();
            console.log('🔍 getContent نتيجة:', typeof content, content);
            // إذا كان getContent يعيد JSON object، استخرج النص منه
            if (content && typeof content === 'object') {
              if (content.html) {
                rawExtractedText = content.html;
                console.log('✅ استخدام getContent.html:', rawExtractedText?.length);
              } else if (content.text) {
                rawExtractedText = content.text;
                console.log('✅ استخدام getContent.text:', rawExtractedText?.length);
              } else {
                // محاولة تحويل JSON إلى text
                rawExtractedText = JSON.stringify(content);
                console.log('✅ استخدام getContent JSON:', rawExtractedText?.length);
              }
            } else if (typeof content === 'string') {
              rawExtractedText = content;
              console.log('✅ استخدام getContent string:', rawExtractedText?.length);
            }
          } else if (editorRef.current.getValue) {
            rawExtractedText = editorRef.current.getValue();
            console.log('✅ استخدام getValue:', rawExtractedText?.length);
          } else if (editorRef.current.innerText) {
            rawExtractedText = editorRef.current.innerText;
            console.log('✅ استخدام innerText:', rawExtractedText?.length);
          } else if (editorRef.current.textContent) {
            rawExtractedText = editorRef.current.textContent;
            console.log('✅ استخدام textContent:', rawExtractedText?.length);
          }
          
          console.log('🔍 النص المستخرج من المحرر:', {
            type: typeof rawExtractedText,
            length: rawExtractedText?.length || 0,
            preview: typeof rawExtractedText === 'string' ? rawExtractedText.substring(0, 100) : String(rawExtractedText || '').substring(0, 100)
          });
          
          if (rawExtractedText !== null && rawExtractedText !== undefined) {
            contentText = rawExtractedText;
          }
        } catch (error) {
          console.warn('⚠️ فشل استخراج النص من المحرر:', error);
        }
      }

      // التأكد من أن contentText هو string
      if (typeof contentText !== 'string') {
        console.log('🔄 تحويل المحتوى إلى string:', typeof contentText);
        contentText = String(contentText || '');
      }

              // تنظيف أفضل للـ HTML
        let cleanText = contentText;
        
        console.log('🧹 قبل التنظيف:', {
          originalText: contentText,
          originalLength: contentText.length,
          hasHTML: contentText.includes('<'),
          firstChars: contentText.substring(0, 100)
        });
        
        if (cleanText.includes('<')) {
          console.log('🔧 بدء تنظيف HTML...');
          
          // إزالة HTML tags مع الحفاظ على المحتوى النصي - تدريجياً
          let step1 = cleanText.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, ''); // إزالة scripts
          console.log('بعد إزالة scripts:', step1.length);
          
          let step2 = step1.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, ''); // إزالة styles  
          console.log('بعد إزالة styles:', step2.length);
          
          let step3 = step2.replace(/<br\s*\/?>/gi, ' '); // تحويل br إلى مسافة
          console.log('بعد تحويل br:', step3.length);
          
          let step4 = step3.replace(/<\/p>/gi, ' '); // تحويل نهاية الفقرات إلى مسافة
          console.log('بعد تحويل p:', step4.length);
          
          let step5 = step4.replace(/<\/div>/gi, ' '); // تحويل div إلى مسافة
          console.log('بعد تحويل div:', step5.length);
          
          let step6 = step5.replace(/<[^>]+>/g, ' '); // إزالة باقي tags وتبديلها بمسافة
          console.log('بعد إزالة tags:', step6.length);
          
          let step7 = step6.replace(/\s+/g, ' ').trim(); // تنظيف المسافات الزائدة
          console.log('بعد تنظيف المسافات:', step7.length);
          
          cleanText = step7;
        }

      console.log('📝 المحتوى بعد التنظيف:', {
        originalLength: contentText.length,
        cleanedLength: cleanText.length,
        cleanedPreview: cleanText.substring(0, 200) + '...'
      });

              // التحقق من طول المحتوى بعد التنظيف
        if (!cleanText || cleanText.trim().length < 50) {
          console.error('❌ محتوى قصير:', {
            originalText: contentText,
            cleanedText: cleanText,
            originalLength: contentText.length,
            cleanedLength: cleanText.length,
            trimmedLength: cleanText.trim().length,
            formDataOriginal: formData.content,
            editorMethodsChecked: {
              hasEditor: !!editorRef.current?.editor,
              hasGetText: !!editorRef.current?.editor?.getText,
              hasGetHTML: !!editorRef.current?.editor?.getHTML
            }
          });
          
          const currentLength = cleanText.trim().length;
          if (currentLength === 0) {
            toast.error(
              `المحرر فارغ!\n` +
              `• يرجى كتابة محتوى الخبر في المحرر أولاً\n` +
              `• الحد الأدنى للتوليد التلقائي: 50 حرف`
            );
          } else {
            toast.error(
              `المحتوى قصير جداً للتوليد التلقائي!\n` +
              `• الحد الأدنى: 50 حرف\n` +
              `• الحالي: ${currentLength} حرف\n` +
              `• يرجى إضافة ${50 - currentLength} حرف إضافي على الأقل`
            );
          }
          setIsAILoading(false);
          return;
        }

              // استخدام النص المنظف
        contentText = cleanText.trim();

      console.log('🚀 إرسال طلب التوليد:', {
        contentLength: contentText.length,
        contentPreview: contentText.substring(0, 100) + '...',
        apiEndpoint: '/api/news/ai-generate'
      });

      const response = await fetch('/api/news/ai-generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: contentText
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'فشل في التوليد');
      }

      const result = await response.json();
      
      if (result.success) {
        // التحقق من وجود العنوان الرئيسي
        if (!result.title || result.title.trim() === '') {
          console.warn('⚠️ العنوان الرئيسي فارغ في الاستجابة:', result);
          toast.error('تم التوليد ولكن العنوان الرئيسي مفقود. يرجى المحاولة مرة أخرى.');
          return;
        }

        // تطبيق النتائج على النموذج
        setFormData(prev => ({
          ...prev,
          title: result.title.trim(),
          subtitle: result.subtitle && result.subtitle.trim() !== '' ? result.subtitle.trim() : prev.subtitle,
          excerpt: result.summary && result.summary.trim() !== '' ? result.summary.trim() : prev.excerpt,
          keywords: Array.isArray(result.keywords) && result.keywords.length > 0 ? result.keywords : prev.keywords
        }));

        // رسائل النجاح
        toast.success('🎉 تم توليد عناصر الخبر بنجاح!');
        
        if (result.warning) {
          toast(result.warning, { icon: '⚠️' });
        }
        
        console.log('✅ نتائج التوليد:', {
          title: `"${result.title}"`,
          subtitle: result.subtitle ? `"${result.subtitle}"` : 'غير موجود',
          summaryLength: result.summary?.length || 0,
          keywordsCount: result.keywords?.length || 0,
          model: result.metadata?.model,
          fullResult: result
        });
      } else {
        throw new Error('فشل في التوليد');
      }

    } catch (error) {
      console.error('❌ خطأ في التوليد التلقائي:', error);
      toast.error(error instanceof Error ? error.message : 'حدث خطأ في التوليد التلقائي');
    } finally {
      setIsAILoading(false);
    }
  };
  
  // مكون أزرار النشر القابل لإعادة الاستخدام
  const PublishButtons = ({ position = 'top' }: { position?: 'top' | 'bottom' }) => (
    <div className="flex gap-3">
      <Button
        onClick={() => {
          console.log('🖱️ تم الضغط على زر حفظ مسودة!');
          handleSave('draft');
        }}
        disabled={saving}
        variant="outline"
        size={position === 'bottom' ? 'lg' : 'sm'}
        className={cn(
          "gap-2 shadow-md hover:shadow-lg transition-all",
          darkMode ? "bg-slate-700 hover:bg-slate-600 text-white border-slate-600" : "bg-white hover:bg-slate-50 border-slate-300"
        )}
      >
        {saving ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            جاري الحفظ...
          </>
        ) : (
          <>
            <Save className="w-4 h-4" />
            حفظ مسودة
          </>
        )}
      </Button>
      
      <Button
        onClick={() => {
          console.log('🖱️ تم الضغط على زر طلب مراجعة!');
          handleSave('draft');
        }}
        disabled={saving}
        variant="outline"
        size={position === 'bottom' ? 'lg' : 'sm'}
        className={cn(
          "gap-2 shadow-md hover:shadow-lg transition-all",
          darkMode ? "bg-blue-700 hover:bg-blue-600 text-white border-blue-600" : "bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-300"
        )}
      >
        <CheckSquare className="w-4 h-4" />
        طلب مراجعة
      </Button>
      
      <Button
        onClick={() => {
          console.log('🖱️ تم الضغط على زر النشر الفوري!');
          console.log('📊 معلومات الاكتمال:', {
            completionScore,
            title: formData.title,
            excerpt: formData.excerpt,
            content: formData.content,
            authorId: formData.authorId,
            categoryId: formData.categoryId,
            featuredImage: formData.featuredImage
          });
          
          if (completionScore < 60) {
            toast.error(`المقال غير مكتمل بما يكفي للنشر (${completionScore}%). يرجى إكمال البيانات المطلوبة.`);
            return;
          }
          
          handleSave('published');
        }}
        disabled={saving || loading}
        size={position === 'bottom' ? 'lg' : 'sm'}
        className={cn(
          "gap-2 shadow-md hover:shadow-lg transition-all relative",
          darkMode ? "bg-emerald-700 hover:bg-emerald-600" : "bg-emerald-600 hover:bg-emerald-700",
          "text-white",
          (saving || loading) && "opacity-50 cursor-not-allowed"
        )}
      >
        {saving ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            جاري النشر...
          </>
        ) : (
          <>
            {formData.publishType === 'scheduled' ? (
              <>
                <Calendar className="w-4 h-4" />
                جدولة النشر
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                نشر فوري
              </>
            )}
          </>
        )}
        {completionScore < 60 && (
          <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-orange-500 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
            يجب إكمال {60 - completionScore}% إضافية
          </span>
        )}
      </Button>
    </div>
  );
  
  if (loading) {
    return (
      <DashboardLayout 
        pageTitle={isEditMode ? "تعديل المقال" : "إنشاء مقال جديد"}
        pageDescription={isEditMode ? "تعديل وتحديث المقال الموجود" : "إنشاء مقال جديد بأدوات متقدمة"}
      >
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-700">
          <div className="text-center space-y-4">
            <Loader2 className="w-10 h-10 animate-spin mx-auto text-blue-600" />
            <p className="text-slate-600 dark:text-slate-400">جاري تحميل البيانات...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }
  
  return (
    <DashboardLayout 
      pageTitle={isEditMode ? "تعديل المقال" : "إنشاء مقال جديد"}
      pageDescription={isEditMode ? "تعديل وتحديث المقال الموجود" : "إنشاء مقال جديد بأدوات متقدمة"}
    >
      <div className={cn(
        "min-h-screen transition-all duration-300",
        darkMode 
          ? "bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700" 
          : "bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100"
      )}>
        <div className="p-4 md:p-6">
        {/* رأس الصفحة */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/admin/news')}
              className={cn(
                "gap-2 shadow-sm hover:shadow-md transition-all",
                darkMode ? "bg-slate-800 hover:bg-slate-700" : "bg-white/70 hover:bg-white"
              )}
            >
              <Home className="w-4 h-4" />
              العودة للأخبار
            </Button>
            <ChevronRight className="w-4 h-4 text-slate-400" />
            <h1 className={cn(
              "text-2xl font-bold",
              darkMode ? "text-white" : "text-slate-800"
            )}>{isEditMode ? 'تعديل الخبر' : 'خبر جديد'}</h1>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="w-40">
              <Progress 
                value={completionScore} 
                className={cn(
                  "h-2 transition-all",
                  completionScore >= 60 ? "[&>div]:bg-emerald-500" : "[&>div]:bg-orange-500"
                )} 
              />
              <p className={cn(
                "text-xs mt-1 font-medium",
                completionScore >= 60 ? "text-emerald-600" : "text-orange-600"
              )}>
                {completionScore}% مكتمل
                {completionScore < 60 && ` (يجب ${60 - completionScore}% إضافية للنشر)`}
              </p>
            </div>
            
            <PublishButtons position="top" />
          </div>
        </div>
        
        {/* رسالة النجاح أو الخطأ */}
        {message.type && (
          <Alert className={cn(
            "mb-4 shadow-lg",
            message.type === 'success' 
              ? "border-emerald-200 bg-emerald-50 dark:bg-emerald-900/20" 
              : "border-red-200 bg-red-50 dark:bg-red-900/20"
          )}>
            {message.type === 'success' ? (
              <CheckCircle className="h-4 w-4 text-emerald-600" />
            ) : (
              <AlertCircle className="h-4 w-4 text-red-600" />
            )}
            <AlertDescription className={cn(
              "text-sm font-medium",
              message.type === 'success' ? "text-emerald-800" : "text-red-800"
            )}>
              {message.text}
            </AlertDescription>
          </Alert>
        )}
        
        {/* المحتوى الرئيسي */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* القسم الرئيسي (75%) */}
          <div className="lg:col-span-3 space-y-6">
            {/* العنوان والموجز */}
            <Card className={cn(
              "shadow-lg border-0 backdrop-blur-sm",
              darkMode ? 'bg-slate-800/90' : 'bg-white/90'
            )}>
              <CardContent className="p-6 space-y-6">
                <div>
                  <Label htmlFor="title" className="text-sm font-medium mb-2 flex items-center gap-2">
                    العنوان الرئيسي *
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => suggestWithAI('title')}
                      disabled={isAILoading || (!formData.content && !formData.excerpt)}
                      className={cn(
                        "h-6 px-2 gap-1 transition-all",
                        isAILoading && "animate-pulse"
                      )}
                      title={(!formData.content && !formData.excerpt) ? "يجب إدخال المحتوى أو الموجز أولاً" : "توليد عنوان بالذكاء الاصطناعي"}
                    >
                      <Sparkles className={cn(
                        "w-3 h-3",
                        isAILoading && "animate-spin"
                      )} />
                      اقتراح
                    </Button>
                    {aiAutoSuggestions.isGenerating && (
                      <div className="flex items-center gap-1 text-blue-500">
                        <div className="animate-spin w-3 h-3 border border-blue-500 border-t-transparent rounded-full"></div>
                        <span className="text-xs">الذكاء الاصطناعي يعمل...</span>
                      </div>
                    )}
                  </Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="أدخل عنوان الخبر..."
                    className={cn(
                      "text-lg font-semibold shadow-sm",
                      darkMode ? "bg-slate-700 border-slate-600" : "bg-white border-slate-200"
                    )}
                  />
                  
                  {/* اقتراحات العناوين الذكية التلقائية */}
                  {aiAutoSuggestions.titleSuggestions.length > 0 && (
                    <div className="mt-3 space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-blue-600 flex items-center gap-1">
                          <Sparkles className="w-3 h-3" />
                          عناوين مقترحة تلقائياً:
                        </span>
                      </div>
                      {aiAutoSuggestions.titleSuggestions && Array.isArray(aiAutoSuggestions.titleSuggestions) && aiAutoSuggestions.titleSuggestions.map((suggestion, index) => (
                        <div 
                          key={index}
                          className={cn(
                            "p-3 rounded-lg border cursor-pointer transition-all hover:scale-[1.02]",
                            darkMode 
                              ? "bg-slate-700 border-slate-600 hover:bg-slate-600 hover:border-blue-500" 
                              : "bg-gray-50 border-gray-200 hover:bg-blue-50 hover:border-blue-300"
                          )}
                          onClick={() => applySuggestion('title', suggestion, index)}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium flex-1">{suggestion}</span>
                            <Button 
                              size="sm" 
                              variant="ghost"
                              className="text-blue-500 hover:text-blue-700 h-6 px-2"
                            >
                              تطبيق
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                <div>
                  <Label htmlFor="subtitle" className="text-sm font-medium mb-2">
                    العنوان الفرعي
                  </Label>
                  <Input
                    id="subtitle"
                    value={formData.subtitle}
                    onChange={(e) => setFormData(prev => ({ ...prev, subtitle: e.target.value }))}
                    placeholder="عنوان فرعي اختياري..."
                    className={cn(
                      "shadow-sm",
                      darkMode ? "bg-slate-700 border-slate-600" : "bg-white border-slate-200"
                    )}
                  />
                </div>
                
                <div>
                  <Label htmlFor="excerpt" className="text-sm font-medium mb-2 flex items-center gap-2">
                    موجز الخبر *
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => suggestWithAI('excerpt')}
                      disabled={isAILoading || !formData.content}
                      className={cn(
                        "h-6 px-2 gap-1 transition-all",
                        isAILoading && "animate-pulse"
                      )}
                      title={!formData.content ? "يجب إدخال المحتوى أولاً" : "توليد موجز بالذكاء الاصطناعي"}
                    >
                      <Sparkles className={cn(
                        "w-3 h-3",
                        isAILoading && "animate-spin"
                      )} />
                      اقتراح
                    </Button>
                  </Label>
                  <Textarea
                    id="excerpt"
                    value={formData.excerpt}
                    onChange={(e) => setFormData(prev => ({ ...prev, excerpt: e.target.value }))}
                    placeholder="اكتب موجزاً مختصراً للخبر..."
                    rows={3}
                    className={cn(
                      "shadow-sm",
                      darkMode ? "bg-slate-700 border-slate-600" : "bg-white border-slate-200"
                    )}
                  />
                  
                  {/* اقتراح الموجز التلقائي */}
                  {aiAutoSuggestions.excerptSuggestion && (
                    <div className="mt-3">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs font-medium text-green-600 flex items-center gap-1">
                          <Sparkles className="w-3 h-3" />
                          موجز مقترح تلقائياً:
                        </span>
                      </div>
                      <div 
                        className={cn(
                          "p-3 rounded-lg border cursor-pointer transition-all hover:scale-[1.01]",
                          darkMode 
                            ? "bg-green-900/20 border-green-600 hover:bg-green-800/30" 
                            : "bg-green-50 border-green-300 hover:bg-green-100"
                        )}
                        onClick={() => applySuggestion('excerpt', aiAutoSuggestions.excerptSuggestion)}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-sm flex-1">{aiAutoSuggestions.excerptSuggestion}</p>
                          <Button 
                            size="sm" 
                            variant="ghost"
                            className="text-green-600 hover:text-green-700 h-6 px-2"
                          >
                            تطبيق
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
            
            {/* محرر المحتوى */}
            <Card className={cn(
              "shadow-lg border-0 backdrop-blur-sm",
              darkMode ? 'bg-slate-800/90' : 'bg-white/90'
            )}>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  محتوى الخبر *
                  
                  {/* زر التوليد التلقائي */}
                  <Button
                    onClick={() => {
                      console.log('🔔 تم الضغط على زر التوليد التلقائي');
                      generateFromContent();
                    }}
                    disabled={isAILoading}
                    size="sm"
                    className={cn(
                      "gap-2 ml-auto shadow-md hover:shadow-lg transition-all",
                      darkMode 
                        ? "bg-purple-700 hover:bg-purple-600 text-white border-purple-600" 
                        : "bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
                    )}
                  >
                    {isAILoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        جاري التوليد...
                      </>
                    ) : (
                      <>
                        <Wand2 className="w-4 h-4" />
                        🤖 توليد تلقائي
                      </>
                    )}
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {/* رسالة توضيحية للتوليد التلقائي */}
                <Alert className={cn(
                  "mb-4 border-0 shadow-sm",
                  darkMode ? "bg-purple-900/20 text-purple-200" : "bg-purple-50 text-purple-800"
                )}>
                  <Sparkles className="h-4 w-4" />
                  <AlertDescription className="text-sm">
                    💡 <strong>نصيحة:</strong> اكتب محتوى الخبر (50+ حرف) ثم اضغط "🤖 توليد تلقائي" لإنشاء العنوان والموجز والكلمات المفتاحية تلقائياً
                  </AlertDescription>
                </Alert>
                
                <div className={cn(
                  "min-h-[400px] rounded-lg",
                  darkMode ? "bg-slate-700" : "bg-slate-50"
                )}>
                  <Editor
                    ref={editorRef}
                    content={formData.content}
                    onChange={handleContentChange}
                    placeholder="اكتب محتوى الخبر هنا... (يجب أن يكون 50 حرف على الأقل لاستخدام التوليد التلقائي)"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* الشريط الجانبي (25%) */}
          <div className="space-y-6">
            {/* نوع الخبر */}
            <Card className={cn(
              "shadow-lg border-0 backdrop-blur-sm",
              darkMode ? 'bg-red-900/20 border-red-800' : 'bg-red-50/90 border-red-200'
            )}>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Zap className="w-4 h-4" />
                  نوع الخبر
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <label className={cn(
                    "flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all shadow-sm",
                    formData.isBreaking
                      ? darkMode ? "bg-red-800/50 border-2 border-red-500" : "bg-red-100 border-2 border-red-500"
                      : darkMode ? "bg-slate-700 hover:bg-slate-600 border-2 border-transparent" : "bg-white hover:bg-slate-50 border-2 border-slate-200"
                  )}>
                    <input
                      type="checkbox"
                      checked={formData.isBreaking}
                      onChange={(e) => setFormData(prev => ({ ...prev, isBreaking: e.target.checked }))}
                      className="text-red-600"
                    />
                    <Zap className={cn(
                      "w-5 h-5",
                      formData.isBreaking ? "text-red-600" : "text-slate-400"
                    )} />
                    <span className="font-medium text-red-600">عاجل</span>
                  </label>
                  
                  <label className={cn(
                    "flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all shadow-sm",
                    formData.isFeatured
                      ? darkMode ? "bg-yellow-800/50 border-2 border-yellow-500" : "bg-yellow-100 border-2 border-yellow-500"
                      : darkMode ? "bg-slate-700 hover:bg-slate-600 border-2 border-transparent" : "bg-white hover:bg-slate-50 border-2 border-slate-200"
                  )}>
                    <input
                      type="checkbox"
                      checked={formData.isFeatured}
                      onChange={(e) => setFormData(prev => ({ ...prev, isFeatured: e.target.checked }))}
                      className="text-yellow-600"
                    />
                    <Star className={cn(
                      "w-5 h-5",
                      formData.isFeatured ? "text-yellow-600" : "text-slate-400"
                    )} />
                    <span className="font-medium text-yellow-600">مميز</span>
                  </label>
                </div>
              </CardContent>
            </Card>
            
            {/* المؤلف والتصنيف */}
            <Card className={cn(
              "shadow-lg border-0 backdrop-blur-sm",
              darkMode ? 'bg-slate-800/90 border-slate-700' : 'bg-slate-50/90 border-slate-200'
            )}>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <User className="w-4 h-4" />
                  المراسل والتصنيف
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="reporter" className="text-sm mb-2">المراسل *</Label>
                  <select
                    id="reporter"
                    value={formData.authorId}
                    onChange={(e) => {
                      console.log('تم اختيار المراسل:', e.target.value);
                      setFormData(prev => ({ ...prev, authorId: e.target.value }));
                    }}
                    className={cn(
                      "w-full p-2 border rounded-lg shadow-sm",
                      darkMode ? "bg-slate-700 border-slate-600 text-white" : "bg-white border-slate-200"
                    )}
                  >
                    <option value="">اختر المراسل</option>
                    {loading && (
                      <option disabled>جاري التحميل...</option>
                    )}
                    {!loading && (!reporters || reporters.length === 0) && (
                      <option disabled>لا يوجد مراسلين متاحين</option>
                    )}
                    {reporters && Array.isArray(reporters) && reporters.map((reporter) => (
                      <option key={reporter.id} value={reporter.id}>
                        {reporter.name}
                        {reporter.title && ` - ${reporter.title}`}
                        {reporter.is_verified && ' ✓ معتمد'}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <Label htmlFor="category" className="text-sm mb-2">التصنيف *</Label>
                  <select
                    id="category"
                    value={formData.categoryId}
                    onChange={(e) => {
                      console.log('تم اختيار التصنيف:', e.target.value);
                      setFormData(prev => ({ ...prev, categoryId: e.target.value }));
                    }}
                    className={cn(
                      "w-full p-2 border rounded-lg shadow-sm",
                      darkMode ? "bg-slate-700 border-slate-600 text-white" : "bg-white border-slate-200"
                    )}
                  >
                    <option value="">اختر التصنيف</option>
                    {loading && (
                      <option disabled>جاري التحميل...</option>
                    )}
                    {!loading && (!categories || categories.length === 0) && (
                      <option disabled>لا يوجد تصنيفات متاحة</option>
                    )}
                    {categories && Array.isArray(categories) && categories.map((category) => (
                      <option key={category.id} value={category.id} style={{ color: category.color || undefined }}>
                        {category.name_ar || category.name}
                      </option>
                    ))}
                  </select>
                </div>
              </CardContent>
            </Card>
            
            {/* طريقة النشر - محسنة ومميزة */}
            <Card className={cn(
              "shadow-lg border-0 backdrop-blur-sm ring-2 ring-blue-200/50",
              darkMode ? 'bg-blue-900/20 border-blue-800' : 'bg-blue-50/90 border-blue-200'
            )}>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-blue-600" />
                  <span className="text-blue-600">طريقة النشر</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <label className={cn(
                    "flex items-center gap-3 p-4 rounded-xl cursor-pointer transition-all shadow-md hover:shadow-lg",
                    formData.publishType === 'now'
                      ? darkMode ? "bg-emerald-800/70 border-2 border-emerald-400 ring-2 ring-emerald-400/30" : "bg-emerald-100 border-2 border-emerald-500 ring-2 ring-emerald-200"
                      : darkMode ? "bg-slate-700 hover:bg-slate-600 border-2 border-slate-600" : "bg-white hover:bg-slate-50 border-2 border-slate-200"
                  )}>
                    <input
                      type="radio"
                      name="publish-type"
                      value="now"
                      checked={formData.publishType === 'now'}
                      onChange={() => setFormData(prev => ({ ...prev, publishType: 'now' }))}
                      className="text-emerald-600 scale-110"
                    />
                    <Send className={cn(
                      "w-5 h-5",
                      formData.publishType === 'now' ? "text-emerald-600" : "text-slate-400"
                    )} />
                    <div>
                      <span className="font-semibold">نشر فوري</span>
                      <p className="text-sm text-slate-500">نشر المقال فوراً</p>
                    </div>
                  </label>
                  
                  <label className={cn(
                    "flex items-center gap-3 p-4 rounded-xl cursor-pointer transition-all shadow-md hover:shadow-lg",
                    formData.publishType === 'scheduled'
                      ? darkMode ? "bg-blue-800/70 border-2 border-blue-400 ring-2 ring-blue-400/30" : "bg-blue-100 border-2 border-blue-500 ring-2 ring-blue-200"
                      : darkMode ? "bg-slate-700 hover:bg-slate-600 border-2 border-slate-600" : "bg-white hover:bg-slate-50 border-2 border-slate-200"
                  )}>
                    <input
                      type="radio"
                      name="publish-type"
                      value="scheduled"
                      checked={formData.publishType === 'scheduled'}
                      onChange={() => setFormData(prev => ({ ...prev, publishType: 'scheduled' }))}
                      className="text-blue-600 scale-110"
                    />
                    <Calendar className={cn(
                      "w-5 h-5",
                      formData.publishType === 'scheduled' ? "text-blue-600" : "text-slate-400"
                    )} />
                    <div>
                      <span className="font-semibold">نشر مجدول</span>
                      <p className="text-sm text-slate-500">تحديد وقت النشر</p>
                    </div>
                  </label>
                  
                  {formData.publishType === 'scheduled' && (
                    <div className={cn(
                      "mt-4 p-4 rounded-xl shadow-inner transition-all duration-300",
                      darkMode ? "bg-slate-800/50" : "bg-white/70"
                    )}>
                      <Label htmlFor="scheduled-date" className="text-sm mb-3 flex items-center gap-2">
                        <Clock className="w-4 h-4 text-blue-600" />
                        التاريخ والوقت
                      </Label>
                      <Input
                        id="scheduled-date"
                        type="datetime-local"
                        value={formData.scheduledDate}
                        onChange={(e) => setFormData(prev => ({ ...prev, scheduledDate: e.target.value }))}
                        className={cn(
                          "text-sm shadow-sm border-2",
                          darkMode ? "bg-slate-700 border-slate-600" : "bg-white border-blue-200"
                        )}
                        min={new Date().toISOString().slice(0, 16)}
                      />
                      {formData.scheduledDate && (
                        <p className="text-xs text-blue-600 mt-2">
                          سيتم النشر في: {new Date(formData.scheduledDate).toLocaleString('ar-SA')}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
            
            {/* الصورة المميزة */}
            <Card className={cn(
              "shadow-lg border-0 backdrop-blur-sm",
              darkMode ? 'bg-purple-900/20 border-purple-800' : 'bg-purple-50/90 border-purple-200'
            )}>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <ImageIcon className="w-4 h-4" />
                  الصورة المميزة
                </CardTitle>
              </CardHeader>
              <CardContent>
                <FeaturedImageUpload 
                  value={formData.featuredImage} 
                  onChange={(url) => setFormData(prev => ({ ...prev, featuredImage: url }))} 
                  darkMode={darkMode}
                />
              </CardContent>
            </Card>
            
            {/* الكلمات المفتاحية */}
            <Card className={cn(
              "shadow-lg border-0 backdrop-blur-sm",
              darkMode ? 'bg-orange-900/20 border-orange-800' : 'bg-orange-50/90 border-orange-200'
            )}>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Tag className="w-4 h-4" />
                  الكلمات المفتاحية
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => suggestWithAI('keywords')}
                    disabled={isAILoading || (!formData.title && !formData.content)}
                    className={cn(
                      "h-6 px-2 gap-1 ml-auto transition-all",
                      isAILoading && "animate-pulse"
                    )}
                    title={(!formData.title && !formData.content) ? "يجب إدخال العنوان أو المحتوى أولاً" : "توليد كلمات مفتاحية بالذكاء الاصطناعي"}
                  >
                    <Sparkles className={cn(
                      "w-3 h-3",
                      isAILoading && "animate-spin"
                    )} />
                    اقتراح
                  </Button>
                </CardTitle>
                
                {/* اقتراحات الكلمات المفتاحية التلقائية */}
                {aiAutoSuggestions.keywordSuggestions.length > 0 && (
                  <div className="px-6 pb-3">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-medium text-orange-600 flex items-center gap-1">
                        <Sparkles className="w-3 h-3" />
                        كلمات مقترحة تلقائياً:
                      </span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => applySuggestion('keywords', null)}
                        className="h-6 px-2 text-xs"
                      >
                        إضافة الكل
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {aiAutoSuggestions.keywordSuggestions && Array.isArray(aiAutoSuggestions.keywordSuggestions) && aiAutoSuggestions.keywordSuggestions.map((keyword, index) => (
                        <button
                          key={index}
                          className={cn(
                            "px-2 py-1 text-xs rounded-full border cursor-pointer hover:scale-105 transition-all",
                            darkMode 
                              ? "bg-orange-800/20 border-orange-600 hover:bg-orange-700/30 text-orange-200" 
                              : "bg-orange-50 border-orange-300 hover:bg-orange-100 text-orange-700"
                          )}
                          onClick={() => {
                            if (!formData.keywords.includes(keyword)) {
                              setFormData(prev => ({
                                ...prev,
                                keywords: [...prev.keywords, keyword]
                              }));
                              toast.success(`تم إضافة: ${keyword}`);
                            }
                          }}
                        >
                          {keyword}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <Input
                      placeholder="أضف كلمة مفتاحية"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          const target = e.target as HTMLInputElement;
                          const keyword = target.value.trim();
                          if (keyword && !formData.keywords.includes(keyword)) {
                            setFormData(prev => ({
                              ...prev,
                              keywords: [...prev.keywords, keyword]
                            }));
                            target.value = '';
                          }
                        }
                      }}
                      className={cn(
                        "shadow-sm",
                        darkMode ? "bg-slate-700 border-slate-600" : "bg-white border-slate-200"
                      )}
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      className={cn(
                        "shadow-sm",
                        darkMode ? "bg-slate-700 hover:bg-slate-600" : "bg-white hover:bg-slate-50"
                      )}
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    {formData.keywords && Array.isArray(formData.keywords) && formData.keywords.map((keyword, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className={cn(
                          "gap-1 shadow-sm",
                          darkMode ? "bg-slate-700 text-white" : "bg-slate-100 text-slate-700"
                        )}
                      >
                        {keyword}
                        <X
                          className="w-3 h-3 cursor-pointer hover:text-red-500"
                          onClick={() => setFormData(prev => ({
                            ...prev,
                            keywords: prev.keywords.filter((_, i) => i !== index)
                          }))}
                        />
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        
        {/* أزرار النشر أسفل الصفحة */}
        <div className="mt-8 flex justify-center">
          <div className={cn(
            "p-4 rounded-xl shadow-lg backdrop-blur-sm",
            darkMode ? "bg-slate-800/90" : "bg-white/90"
          )}>
            <PublishButtons position="bottom" />
          </div>
        </div>
      </div>
      
        <Toaster 
          position="top-center"
          toastOptions={{
            duration: 3000,
            style: {
              background: darkMode ? '#1e293b' : '#ffffff',
              color: darkMode ? '#ffffff' : '#1e293b',
            },
          }}
        />
      </div>
    </DashboardLayout>
  );
}