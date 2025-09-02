'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { ArticleWizardEnhanced } from '@/components/article/ArticleWizardEnhanced';
import BasicInfoStepEnhanced from '@/components/article/steps/BasicInfoStepEnhanced';
import ContentStepEnhanced from '@/components/article/steps/ContentStepEnhanced';
import MediaStepEnhanced from '@/components/article/steps/MediaStepEnhanced';
import PublishStepEnhanced from '@/components/article/steps/PublishStepEnhanced';
import SEOStepEnhanced from '@/components/article/steps/SEOStepEnhanced';
import ReviewStepEnhanced from '@/components/article/steps/ReviewStepEnhanced';
import { 
  FileText, Image as ImageIcon, Settings, Search, Sparkles, CheckCircle,
  Calendar, Upload, Save, Send, Eye, AlertCircle, X, Plus, Loader2,
  User, Tag, Globe, Zap, Palette, Link2, Clock, TrendingUp, BookOpen,
  Hash, Type, Target, Lightbulb, Info, ChevronLeft, Shield, Layers, Home
} from 'lucide-react';
import { cn } from '@/lib/utils';

// تعريف خطوات الـ Wizard
const WIZARD_STEPS = [
  {
    id: 'basic-info',
    title: 'المعلومات الأساسية',
    description: 'العنوان والتصنيف والموجز',
    icon: <FileText className="w-5 h-5" />,
    validation: (formData: any) => {
      const errors = [];
      if (!formData.title.trim()) errors.push('العنوان مطلوب');
      if (!formData.excerpt.trim()) errors.push('الموجز مطلوب');
      if (!formData.categoryId) errors.push('يرجى اختيار التصنيف');
      if (!formData.authorId) errors.push('يرجى اختيار الكاتب');
      return { isValid: errors.length === 0, errors };
    }
  },
  {
    id: 'content',
    title: 'المحتوى',
    description: 'محتوى المقال الرئيسي',
    icon: <FileText className="w-5 h-5" />,
    validation: (formData: any) => {
      const errors = [];
      const plainText = formData.content.replace(/<[^>]*>/g, '').trim();
      if (!plainText || plainText.length < 10) {
        errors.push('محتوى المقال مطلوب (10 أحرف على الأقل)');
      }
      return { isValid: errors.length === 0, errors };
    }
  },
  {
    id: 'media',
    title: 'الوسائط',
    description: 'الصور والملفات المرفقة',
    icon: <ImageIcon className="w-5 h-5" />,
    isOptional: true
  },
  {
    id: 'publish',
    title: 'إعدادات النشر',
    description: 'خيارات وتوقيت النشر',
    icon: <Calendar className="w-5 h-5" />,
    isOptional: true
  },
  {
    id: 'seo',
    title: 'SEO',
    description: 'تحسين محركات البحث',
    icon: <Search className="w-5 h-5" />,
    isOptional: true
  },
  {
    id: 'review',
    title: 'المراجعة والنشر',
    description: 'مراجعة نهائية قبل النشر',
    icon: <CheckCircle className="w-5 h-5" />
  }
];

interface Category {
  id: string;
  name: string;
  name_ar?: string;
  slug: string;
  color?: string;
}

interface Author {
  id: string;
  name: string;
  avatar?: string;
  role?: string;
}

export default function EditArticleEnhancedPage() {
  const router = useRouter();
  const params = useParams();
  const articleId = params?.id as string;
  
  // حالات التحميل
  const [articleLoading, setArticleLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [authors, setAuthors] = useState<Author[]>([]);
  const [isAILoading, setIsAILoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // حالة النموذج
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    excerpt: '',
    content: '',
    authorId: '',
    categoryId: '',
    type: 'local',
    isBreaking: false,
    isFeatured: false,
    featuredImage: '',
    featuredImageCaption: '',
    gallery: [] as any[],
    externalLink: '',
    publishType: 'now' as 'now' | 'scheduled',
    scheduledDate: '',
    keywords: [] as string[],
    seoTitle: '',
    seoDescription: '',
    status: 'draft' as 'draft' | 'pending_review' | 'published'
  });

  // مرجع للمحرر
  const editorRef = useRef<any>(null);

  // تحميل البيانات الأساسية بشكل متوازي
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const [categoriesRes, authorsRes, articleRes] = await Promise.all([
          fetch('/api/categories?active=true'),
          fetch('/api/team-members'),
          fetch(`/api/articles/${articleId}`)
        ]);

        // معالجة التصنيفات
        if (categoriesRes.ok) {
          const data = await categoriesRes.json();
          console.log('Categories API response:', data);
          setCategories(data.data || data.categories || []);
        } else {
          console.error('Failed to fetch categories:', categoriesRes.status);
        }

        // معالجة الكُتّاب
        if (authorsRes.ok) {
          const data = await authorsRes.json();
          console.log('Authors API response:', data);
          setAuthors(data.data || data.members || []);
        } else {
          console.error('Failed to fetch authors:', authorsRes.status);
        }

        // معالجة بيانات المقال
        if (articleRes.ok) {
          const articleData = await articleRes.json();
          const article = articleData.article || articleData;
          
          setFormData({
            title: article.title || '',
            subtitle: article.subtitle || '',
            excerpt: article.summary || article.excerpt || '',
            content: article.content || '',
            authorId: article.author_id || '',
            categoryId: article.category_id || '',
            type: article.type || article.scope || 'local',
            isBreaking: article.is_breaking || false,
            isFeatured: article.is_featured || false,
            featuredImage: article.featured_image || '',
            featuredImageCaption: article.image_caption || '',
            gallery: article.gallery || [],
            externalLink: article.external_link || '',
            publishType: 'now',
            scheduledDate: article.scheduled_for || '',
            keywords: Array.isArray(article.keywords) ? article.keywords : [],
            seoTitle: article.seo_title || '',
            seoDescription: article.seo_description || '',
            status: article.status || 'draft'
          });

          // تحديث المحرر إذا كان متاحاً
          if (editorRef.current && article.content) {
            editorRef.current.setContent(article.content);
          }
        } else {
          throw new Error('فشل في جلب بيانات المقال');
        }
      } catch (error) {
        console.error('Error loading data:', error);
        setLoadError('حدث خطأ في تحميل البيانات');
      } finally {
        setArticleLoading(false);
      }
    };

    if (articleId) {
      loadInitialData();
    }
  }, [articleId]);

  // حفظ تلقائي
  const handleAutoSave = useCallback(async (stepData: any) => {
    if (isSaving) return;

    try {
      const response = await fetch(`/api/articles/${articleId}/auto-save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          stepData,
          lastSaved: new Date().toISOString()
        })
      });

      if (!response.ok) {
        console.error('Auto-save failed');
      }
    } catch (error) {
      console.error('Auto-save error:', error);
    }
  }, [formData, articleId, isSaving]);

  // حفظ المقال
  const handleSubmit = useCallback(async (status: 'draft' | 'published') => {
    setIsSaving(true);
    
    try {
      const articleData: any = {
        title: formData.title.trim(),
        content: editorRef.current ? editorRef.current.getHTML() : formData.content,
        summary: formData.excerpt.trim(),
        author_id: formData.authorId,
        category_id: formData.categoryId,
        featured_image: formData.featuredImage,
        is_featured: formData.isFeatured,
        is_breaking: formData.isBreaking,
        keywords: formData.keywords,
        seo_title: formData.seoTitle,
        seo_description: formData.seoDescription,
        status
      };

      if (formData.publishType === 'scheduled' && formData.scheduledDate) {
        articleData.scheduled_for = formData.scheduledDate;
      }

      const response = await fetch(`/api/articles/${articleId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(articleData)
      });

      if (response.ok) {
        toast.success(
          status === 'draft' 
            ? 'تم حفظ المسودة بنجاح' 
            : 'تم تحديث المقال بنجاح'
        );
        router.push('/dashboard/article');
      } else {
        const data = await response.json();
        throw new Error(data.error || 'فشل في حفظ المقال');
      }
    } catch (error) {
      console.error('Error saving article:', error);
      toast.error('حدث خطأ في حفظ المقال');
    } finally {
      setIsSaving(false);
    }
  }, [formData, articleId, router]);

  // معالج إكمال الـ Wizard
  const handleWizardComplete = () => {
    handleSubmit('published');
  };

  // عرض محتوى الخطوة
  const renderStepContent = (currentStep: number, goToStep: (step: number) => void) => {
    const props = {
      formData,
      setFormData,
      categories,
      authors,
      darkMode,
      isAILoading,
      setIsAILoading,
      editorRef,
      goToStep
    };

    switch (currentStep) {
      case 0:
        return <BasicInfoStepEnhanced {...props} />;
      case 1:
        return <ContentStepEnhanced {...props} />;
      case 2:
        return <MediaStepEnhanced {...props} />;
      case 3:
        return <PublishStepEnhanced {...props} />;
      case 4:
        return <SEOStepEnhanced {...props} />;
      case 5:
        return <ReviewStepEnhanced {...props} onPublish={() => handleSubmit('published')} onSaveDraft={() => handleSubmit('draft')} />;
      default:
        return null;
    }
  };

  // عرض حالة التحميل
  if (articleLoading) {
    return (
      <div className={cn(
        "min-h-screen flex items-center justify-center",
        darkMode ? "bg-gray-900" : "bg-gray-50"
      )}>
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto text-blue-600" />
          <p className={cn(
            "mt-4",
            darkMode ? "text-gray-300" : "text-gray-600"
          )}>
            جاري تحميل بيانات المقال...
          </p>
        </div>
      </div>
    );
  }

  // عرض رسالة الخطأ
  if (loadError) {
    return (
      <div className={cn(
        "min-h-screen flex items-center justify-center",
        darkMode ? "bg-gray-900" : "bg-gray-50"
      )}>
        <div className="text-center">
          <AlertCircle className="w-12 h-12 mx-auto text-red-500 mb-4" />
          <p className={cn(
            "text-lg mb-4",
            darkMode ? "text-gray-300" : "text-gray-700"
          )}>
            {loadError}
          </p>
          <button
            onClick={() => router.push('/dashboard/article')}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
          >
            العودة إلى قائمة المقالات
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={cn(
      "min-h-screen",
      darkMode ? "bg-gray-900" : "bg-gray-50"
    )}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* رأس الصفحة */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className={cn(
                "text-2xl md:text-3xl font-bold mb-2",
                darkMode ? "text-white" : "text-gray-800"
              )}>
                تعديل المقال
              </h1>
              <p className={cn(
                "text-sm md:text-base",
                darkMode ? "text-gray-300" : "text-gray-600"
              )}>
                قم بتحديث المقال خطوة بخطوة
              </p>
            </div>
            
            {/* أزرار سريعة */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => router.push('/dashboard/article')}
                className={cn(
                  "px-4 py-2 rounded-lg text-sm transition-all duration-200 flex items-center gap-2",
                  darkMode 
                    ? "bg-gray-700 hover:bg-gray-600 text-gray-200" 
                    : "bg-gray-200 hover:bg-gray-300 text-gray-700"
                )}
              >
                <Home className="w-4 h-4" />
                <span className="hidden sm:inline">القائمة</span>
              </button>
              <button
                onClick={() => handleSubmit('draft')}
                disabled={isSaving}
                className={cn(
                  "px-4 py-2 rounded-lg text-sm transition-all duration-200 flex items-center gap-2",
                  darkMode 
                    ? "bg-gray-700 hover:bg-gray-600 text-gray-200" 
                    : "bg-gray-200 hover:bg-gray-300 text-gray-700"
                )}
              >
                {isSaving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                <span className="hidden sm:inline">حفظ كمسودة</span>
              </button>
            </div>
          </div>
        </div>

        {/* Wizard Component */}
        <ArticleWizardEnhanced
          steps={WIZARD_STEPS.map(step => ({
            ...step,
            validation: step.validation ? () => step.validation!(formData) : undefined
          }))}
          onComplete={handleWizardComplete}
          enableAutoSave={true}
          onAutoSave={handleAutoSave}
          minimalistMode={true}
          showProgressPercentage={true}
          enableKeyboardNavigation={true}
        >
          {renderStepContent}
        </ArticleWizardEnhanced>
      </div>
    </div>
  );
} 