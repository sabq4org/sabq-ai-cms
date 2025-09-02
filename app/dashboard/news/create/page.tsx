'use client';

import React, { useState, useEffect, useRef, lazy, Suspense, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { toast } from 'react-hot-toast';
import { ArticleWizard } from '@/components/article/ArticleWizard';
import { 
  FileText, Image as ImageIcon, Settings, Search, Sparkles, CheckCircle,
  Calendar, Upload, Save, Send, Eye, AlertCircle, X, Plus, Loader2,
  User, Tag, Globe, Zap, Palette, Link2, Clock, TrendingUp, BookOpen,
  Hash, Type, Target, Lightbulb, Info, ChevronLeft, Shield, Layers
} from 'lucide-react';

// Lazy loading للمكونات الثقيلة
const Editor = dynamic(() => import('@/components/Editor/Editor'), { 
  ssr: false,
  loading: () => (
    <div className="h-96 bg-gray-100 dark:bg-gray-800 animate-pulse rounded-lg flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
    </div>
  )
});

// تعريف الخطوات
const WIZARD_STEPS = [
  {
    id: 'basic',
    title: 'المعلومات الأساسية',
    description: 'العنوان والتصنيف والكاتب',
    icon: <FileText className="w-4 h-4" />
  },
  {
    id: 'content',
    title: 'محتوى المقال',
    description: 'كتابة وتحرير المحتوى',
    icon: <Type className="w-4 h-4" />
  },
  {
    id: 'media',
    title: 'الوسائط والصور',
    description: 'رفع الصور والوسائط',
    icon: <ImageIcon className="w-4 h-4" />
  },
  {
    id: 'publish',
    title: 'إعدادات النشر',
    description: 'خيارات النشر والجدولة',
    icon: <Calendar className="w-4 h-4" />
  },
  {
    id: 'seo',
    title: 'تحسين محركات البحث',
    description: 'SEO والكلمات المفتاحية',
    icon: <Search className="w-4 h-4" />
  },
  {
    id: 'review',
    title: 'المراجعة والنشر',
    description: 'مراجعة نهائية ونشر',
    icon: <CheckCircle className="w-4 h-4" />
  }
];

// مكونات الخطوات
import { BasicInfoStep } from '@/components/article/steps/BasicInfoStep';
import { ContentStep } from '@/components/article/steps/ContentStep';
import { MediaStep } from '@/components/article/steps/MediaStep';
import { PublishStep } from '@/components/article/steps/PublishStep';
import { SEOStep } from '@/components/article/steps/SEOStep';
import { ReviewStep } from '@/components/article/steps/ReviewStep';
import { useDarkMode } from "@/hooks/useDarkMode";

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface Author {
  id: string;
  name: string;
  email: string;
  role?: string;
}

interface UploadedImage {
  url: string;
  caption?: string;
}

export default function CreateArticlePage() {
  const { darkMode } = useDarkMode();
  const router = useRouter();
  
  // تحميل البيانات الأساسية فقط عند الحاجة
  const [categories, setCategories] = useState<Category[]>([]);
  const [authors, setAuthors] = useState<Author[]>([]);
  const [isAILoading, setIsAILoading] = useState(false);
  
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
    gallery: [] as UploadedImage[],
    externalLink: '',
    publishType: 'now',
    scheduledDate: '',
    keywords: [] as string[],
    seoTitle: '',
    seoDescription: '',
    status: 'draft' as 'draft' | 'pending_review' | 'published'
  });

  // مرجع للمحرر
  const editorRef = useRef<any>(null);

  // تحميل البيانات بشكل كسول
  useEffect(() => {
    // تحميل الأساسيات فقط في البداية
    const loadInitialData = async () => {
      try {
        const [categoriesRes, authorsRes] = await Promise.all([
          fetch('/api/categories'),
          fetch('/api/team-members')
        ]);

        if (categoriesRes.ok) {
          const categoriesData = await categoriesRes.json();
          setCategories(categoriesData.categories || []);
        }

        if (authorsRes.ok) {
          const authorsData = await authorsRes.json();
          setAuthors(authorsData.members || []);
      }
    } catch (error) {
        console.error('Error loading initial data:', error);
      }
    };

    loadInitialData();
  }, []);

  // دالة حفظ المقال
  const handleSubmit = useCallback(async (status: 'draft' | 'published') => {
    // إلغاء أي رسائل سابقة
    toast.dismiss();
    // عرض رسالة "جاري الحفظ"
    const loadingToast = toast.loading('جاري الحفظ...', {
      style: {
        background: '#F9FAFB',
        color: '#111827',
        minWidth: '250px',
      },
      position: 'top-right',
    });
    
    try {
      const selectedAuthor = authors.find(a => a.id === formData.authorId);
      
      // تأكد من أن الكلمات المفتاحية مصفوفة صالحة
      const keywords = Array.isArray(formData.keywords) 
        ? formData.keywords 
        : (formData.keywords ? [formData.keywords] : []);
      
      const articleData: any = {
        title: formData.title.trim(),
        content: editorRef.current ? editorRef.current.getHTML() : formData.content,
        excerpt: formData.excerpt.trim(),
        author_id: formData.authorId || undefined,
        author_name: selectedAuthor?.name || undefined,
        category_id: formData.categoryId || undefined,
        featured_image: formData.featuredImage || undefined,
        image_caption: formData.featuredImageCaption || undefined,
        status,
        // إضافة seo_keywords مباشرة إلى الكائن الرئيسي
        seo_keywords: keywords,
        // تضمين الكلمات المفتاحية في metadata أيضاً للتوافق
        metadata: {
          keywords: keywords,
          seo_keywords: keywords, // تخزين نسخة في metadata.seo_keywords أيضاً
          seo_title: formData.seoTitle,
          seo_description: formData.seoDescription,
          is_featured: formData.isFeatured,
          is_breaking: formData.isBreaking,
          gallery: formData.gallery
        }
      };

      if (formData.publishType === 'scheduled' && formData.scheduledDate) {
        articleData.publish_at = formData.scheduledDate;
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 20000);
      const response = await fetch('/api/articles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(articleData),
        signal: controller.signal,
      });

      // إلغاء رسالة التحميل
      toast.dismiss(loadingToast);
      try { clearTimeout(timeoutId); } catch {}

      const result = await response.json();
      console.log('✅ نتيجة الإنشاء:', result);
        
      if (response.ok && result.ok) {
        // رسالة نجاح محسنة
        toast.success(
          result.message || (status === 'draft' ? 'تم حفظ المسودة بنجاح' : 'تم إنشاء المقال بنجاح'), 
          {
            duration: 5000,
            style: {
              background: '#10B981',
              color: 'white',
              minWidth: '300px',
            },
            position: 'top-right',
            icon: '✅',
            iconTheme: {
              primary: '#fff',
              secondary: '#10B981',
            }
          }
        );
        
        // تأخير التوجيه للسماح للمستخدم برؤية الرسالة
        setTimeout(() => {
          router.push('/dashboard/news');
        }, 2000);
      } else {
        console.error('❌ خطأ في الاستجابة:', result);
        
        // استخدام كود الخطأ لتخصيص الرسالة
        let errorTitle: string = result.message || 'فشل في إنشاء المقال';
        let errorDetails: string | null = result.details || null;
        
        // رسالة خطأ محسنة مع إمكانية إعادة المحاولة وعرض التفاصيل
        const toastId = toast.error(
          <div>
            <p className="font-medium">{errorTitle}</p>
            {errorDetails && <p className="text-sm mt-1 opacity-90">{errorDetails}</p>}
            {result.code === 'VALIDATION_ERROR' && result.validation_errors && (
              <ul className="mt-2 text-xs list-disc list-inside">
                {(Array.isArray(result.validation_errors) ? result.validation_errors : [result.validation_errors]).map((err: string, i: number) => (
                  <li key={i}>{err}</li>
                ))}
              </ul>
            )}
          </div>,
          {
            duration: 8000, // مدة أطول لقراءة رسالة الخطأ
            style: {
              background: '#EF4444',
              color: 'white',
              minWidth: '350px',
              maxWidth: '500px'
            },
            position: 'top-right',
            icon: '❌',
          }
        );
      }
    } catch (error: any) {
      // إلغاء رسالة التحميل في حالة الخطأ
      toast.dismiss(loadingToast);
      if (error?.name === 'AbortError') {
        toast.error('انتهت مهلة النشر، تحقق من الاتصال وحاول مرة أخرى');
        return;
      }
      console.error('Error saving article:', error);
      // رسالة خطأ محسنة مع تفاصيل
      toast.error(
        `حدث خطأ في حفظ المقال: ${error.message || 'خطأ غير معروف'}`,
        {
          duration: 8000,
          style: {
            background: '#EF4444',
            color: 'white',
            minWidth: '300px',
          },
          position: 'top-right',
          icon: '❌',
        }
      );
    }
  }, [formData, authors, router]);

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
        return <BasicInfoStep {...props} />;
      case 1:
        return (
          <Suspense fallback={<div className="h-96 animate-pulse bg-gray-100 dark:bg-gray-800 rounded-lg" />}>
            <ContentStep {...props} />
          </Suspense>
        );
      case 2:
        return <MediaStep {...props} />;
      case 3:
        return <PublishStep {...props} />;
      case 4:
        return <SEOStep {...props} />;
      case 5:
        return <ReviewStep {...props} onPublish={() => handleSubmit('published')} onSaveDraft={() => handleSubmit('draft')} />;
      default:
        return null;
    }
  };

  return (
    <div className={`min-h-screen p-4 md:p-8 transition-colors duration-300 ${
      darkMode ? 'bg-gray-900' : 'bg-gray-50'
    }`} dir="rtl">
      {/* رأس الصفحة المبسط */}
      <div className="max-w-6xl mx-auto mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className={`text-2xl md:text-3xl font-bold mb-2 transition-colors duration-300 ${
          darkMode ? 'text-white' : 'text-gray-800'
            }`}>
              إنشاء مقال جديد
            </h1>
            <p className={`text-sm md:text-base transition-colors duration-300 ${
          darkMode ? 'text-gray-300' : 'text-gray-600'
            }`}>
              أنشئ محتوى احترافي خطوة بخطوة
            </p>
            </div>

          {/* أزرار سريعة */}
                    <div className="flex gap-2">
                            <button
              onClick={() => handleSubmit('draft')}
              className={`px-4 py-2 rounded-lg text-sm transition-all duration-200 ${
                darkMode 
                  ? 'bg-gray-700 hover:bg-gray-600 text-gray-200' 
                  : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
              }`}
            >
              <Save className="w-4 h-4 inline ml-2" />
              حفظ كمسودة
                            </button>
                        </div>
                      </div>
                  </div>

      {/* Wizard Component */}
      <div className="max-w-6xl mx-auto">
        <ArticleWizard
          steps={WIZARD_STEPS}
          onComplete={handleWizardComplete}
        >
          {renderStepContent}
        </ArticleWizard>
                    </div>
                    
      {/* شريط مساعد AI عائم */}
      <div className={`fixed bottom-6 left-6 p-4 rounded-xl shadow-lg transition-all duration-300 ${
        darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
      } max-w-xs`}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-r from-purple-500 to-blue-600 rounded-lg">
            <Sparkles className="w-5 h-5 text-white" />
                      </div>
                  <div>
            <p className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                  مساعد الذكاء الاصطناعي
            </p>
            <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              متاح لمساعدتك في كل خطوة
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}