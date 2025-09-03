'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { useDarkModeContext } from '@/contexts/DarkModeContext';
import { ArticleWizardEnhanced } from '@/components/article/ArticleWizardEnhanced';
import BasicInfoStepEnhanced from '@/components/article/steps/BasicInfoStepEnhanced';
import ContentStepEnhanced from '@/components/article/steps/ContentStepEnhanced';
import MediaStepEnhanced from '@/components/article/steps/MediaStepEnhanced';
import PublishStepEnhanced from '@/components/article/steps/PublishStepEnhanced';
import SEOStepEnhanced from '@/components/article/steps/SEOStepEnhanced';
import ReviewStepEnhanced from '@/components/article/steps/ReviewStepEnhanced';
import { 
  FileText, Image as ImageIcon, Settings, Search, Sparkles, CheckCircle,
  Calendar, Upload, Save, Send, Eye, AlertCircle, X, Plus, Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';

// تعريف خطوات الـ Wizard
const WIZARD_STEPS = [
  {
    id: 'basic-info',
    title: 'المعلومات الأساسية',
    description: 'العنوان والتصنيف والموجز',
    icon: <FileText className="w-5 h-5" />
  },
  {
    id: 'content',
    title: 'المحتوى',
    description: 'محتوى المقال الرئيسي',
    icon: <FileText className="w-5 h-5" />
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

export default function NewArticleEnhancedPage() {
  const router = useRouter();
  const { darkMode } = useDarkModeContext();
  
  // حالات التحميل
  const [dataLoading, setDataLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [authors, setAuthors] = useState<Author[]>([]);
  const [isAILoading, setIsAILoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // حالة النموذج - قيم افتراضية لمقال جديد
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
        const [categoriesRes, authorsRes] = await Promise.all([
          fetch('/api/categories?active=true'),
          fetch('/api/team-members')
        ]);

        // معالجة التصنيفات
        if (categoriesRes.ok) {
          const data = await categoriesRes.json();
          console.log('Categories API response:', data);
          setCategories(data.data || data.categories || []);
        } else {
          console.error('Failed to fetch categories:', categoriesRes.status);
          toast.error('فشل تحميل التصنيفات');
        }

        // معالجة الكُتّاب
        if (authorsRes.ok) {
          const data = await authorsRes.json();
          console.log('Authors API response:', data);
          setAuthors(data.data || data.members || []);
        } else {
          console.error('Failed to fetch authors:', authorsRes.status);
          toast.error('فشل تحميل قائمة الكُتّاب');
        }

      } catch (error) {
        console.error('Error loading data:', error);
        setLoadError('حدث خطأ في تحميل البيانات');
        toast.error('حدث خطأ في تحميل البيانات');
      } finally {
        setDataLoading(false);
      }
    };

    loadInitialData();
  }, []);

  // حفظ المقال
  const handleSave = useCallback(async (status: 'draft' | 'published' = 'draft') => {
    setIsSaving(true);
    
    try {
      const response = await fetch('/api/articles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          status,
          published_at: status === 'published' ? new Date().toISOString() : null
        })
      });

      if (response.ok) {
        const data = await response.json();
        toast.success(status === 'published' ? 'تم نشر المقال بنجاح!' : 'تم حفظ المسودة بنجاح!');
        
        // الانتقال إلى صفحة التحرير
        router.push(`/dashboard/article/edit-enhanced/${data.id || data.article?.id}`);
      } else {
        throw new Error('فشل حفظ المقال');
      }
    } catch (error) {
      console.error('Save error:', error);
      toast.error('حدث خطأ في حفظ المقال');
    } finally {
      setIsSaving(false);
    }
  }, [formData, router]);

  // معالج حفظ تلقائي
  useEffect(() => {
    const autoSaveTimer = setInterval(() => {
      if (formData.title || formData.content) {
        handleSave('draft');
      }
    }, 30000); // كل 30 ثانية

    return () => clearInterval(autoSaveTimer);
  }, [formData.title, formData.content, handleSave]);

  // عرض شاشة التحميل
  if (dataLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <Loader2 className="w-10 h-10 animate-spin mx-auto text-blue-600" />
          <p className="text-gray-600 dark:text-gray-400">جاري تحميل البيانات...</p>
        </div>
      </div>
    );
  }

  // عرض رسالة خطأ
  if (loadError) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <AlertCircle className="w-10 h-10 mx-auto text-red-600" />
          <p className="text-gray-700 dark:text-gray-300">{loadError}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            إعادة المحاولة
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={cn(
      "min-h-screen transition-colors duration-200",
      darkMode ? "bg-gray-900" : "bg-gray-50"
    )}>
      <ArticleWizardEnhanced
        steps={WIZARD_STEPS}
        onComplete={() => handleSave('published')}
        className="flex-1"
      >
        {(currentStepIndex) => {
          const currentStepId = WIZARD_STEPS[currentStepIndex]?.id;
          
          switch (currentStepId) {
            case 'basic-info':
              return (
                <BasicInfoStepEnhanced
                  formData={formData}
                  setFormData={setFormData}
                  categories={categories}
                  authors={authors}
                  darkMode={darkMode}
                  isAILoading={isAILoading}
                  setIsAILoading={setIsAILoading}
                />
              );
            
            case 'content':
              return (
                <ContentStepEnhanced
                  formData={formData}
                  setFormData={setFormData}
                  darkMode={darkMode}
                  editorRef={editorRef}
                  isAILoading={isAILoading}
                  setIsAILoading={setIsAILoading}
                />
              );
            
            case 'media':
              return (
                <MediaStepEnhanced
                  formData={formData}
                  setFormData={setFormData}
                  darkMode={darkMode}
                />
              );
            
            case 'publish':
              return (
                <PublishStepEnhanced
                  formData={formData}
                  setFormData={setFormData}
                  darkMode={darkMode}
                />
              );
            
            case 'seo':
              return (
                <SEOStepEnhanced
                  formData={formData}
                  setFormData={setFormData}
                  darkMode={darkMode}
                  isAILoading={isAILoading}
                  setIsAILoading={setIsAILoading}
                />
              );
            
            case 'review':
              return (
                <ReviewStepEnhanced
                  formData={formData}
                  onPublish={() => handleSave('published')}
                  onSaveDraft={() => handleSave('draft')}
                  darkMode={darkMode}
                  categories={categories}
                  authors={authors}
                />
              );
            
            default:
              return null;
          }
        }}
      </ArticleWizardEnhanced>
    </div>
  );
} 