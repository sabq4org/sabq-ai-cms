/**
 * Hook موحد لإدارة نماذج المقالات
 * يوفر واجهة موحدة لجميع صفحات إنشاء وتعديل المقالات
 */

import { useState, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { 
  UnifiedArticleForm, 
  ApiArticleData,
  ArticleApiResponse,
  normalizeArticleForm,
  validateArticleForm,
  Author,
  Category,
  ArticleFormOptions
} from '@/types/article-form';

interface UseUnifiedArticleFormProps {
  initialData?: Partial<UnifiedArticleForm>;
  options?: Partial<ArticleFormOptions>;
  onSuccess?: (article: any) => void;
  onError?: (error: string) => void;
}

export function useUnifiedArticleForm({
  initialData = {},
  options = {},
  onSuccess,
  onError
}: UseUnifiedArticleFormProps = {}) {
  
  const router = useRouter();
  
  // حالة النموذج
  const [formData, setFormData] = useState<UnifiedArticleForm>({
    title: '',
    content: '',
    excerpt: '',
    subtitle: '',
    featured_image: '',
    status: 'draft',
    featured: false,
    breaking: false,
    keywords: '',
    seo_title: '',
    seo_description: '',
    publishType: 'immediate',
    allow_comments: true,
    ...initialData
  });
  
  // حالات التحميل والمعالجة
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  
  // تحديث حقل واحد
  const updateField = useCallback((field: keyof UnifiedArticleForm, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // مسح أخطاء التحقق عند التعديل
    if (validationErrors.length > 0) {
      setValidationErrors([]);
    }
  }, [validationErrors.length]);
  
  // تحديث حقول متعددة
  const updateFields = useCallback((updates: Partial<UnifiedArticleForm>) => {
    setFormData(prev => ({
      ...prev,
      ...updates
    }));
    
    if (validationErrors.length > 0) {
      setValidationErrors([]);
    }
  }, [validationErrors.length]);
  
  // إعادة تعيين النموذج
  const resetForm = useCallback(() => {
    setFormData({
      title: '',
      content: '',
      excerpt: '',
      subtitle: '',
      featured_image: '',
      status: 'draft',
      featured: false,
      breaking: false,
      keywords: '',
      seo_title: '',
      seo_description: '',
      publishType: 'immediate',
      allow_comments: true,
      ...initialData
    });
    setValidationErrors([]);
  }, [initialData]);
  
  // التحقق من صحة البيانات
  const validate = useCallback(() => {
    const errors = validateArticleForm(formData);
    setValidationErrors(errors);
    return errors.length === 0;
  }, [formData]);
  
  // حفظ المقال
  const saveArticle = useCallback(async (status: 'draft' | 'published' = 'draft') => {
    console.log('🚀 بدء حفظ المقال:', { status, title: formData.title });
    
    try {
      setSaving(true);
      
      // تحديث حالة المقال
      const updatedForm = { ...formData, status };
      
      // التحقق من صحة البيانات
      const errors = validateArticleForm(updatedForm);
      if (errors.length > 0) {
        setValidationErrors(errors);
        errors.forEach(error => toast.error(error));
        return false;
      }
      
      // تحويل البيانات إلى تنسيق API
      const apiData = normalizeArticleForm(updatedForm);
      
      console.log('📤 إرسال البيانات:', apiData);
      
      // إرسال الطلب
      const response = await fetch('/api/articles', {
        method: formData.id ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(apiData)
      });
      
      const result: ArticleApiResponse = await response.json();
      
      if (result.success) {
        console.log('✅ نجح الحفظ:', result.summary);
        
        toast.success(result.message || 'تم حفظ المقال بنجاح');
        
        // تحديث بيانات النموذج مع المعرف الجديد
        if (result.article?.id && !formData.id) {
          updateField('id', result.article.id);
        }
        
        // استدعاء callback النجاح
        if (onSuccess) {
          onSuccess(result.article);
        }
        
        return true;
      } else {
        console.error('❌ فشل الحفظ:', result);
        
        const errorMessage = result.error || 'فشل في حفظ المقال';
        toast.error(errorMessage);
        
        // عرض أخطاء التحقق إن وجدت
        if (result.validation_errors) {
          setValidationErrors(result.validation_errors);
        }
        
        // استدعاء callback الخطأ
        if (onError) {
          onError(errorMessage);
        }
        
        return false;
      }
      
    } catch (error) {
      console.error('❌ خطأ في الحفظ:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'حدث خطأ أثناء الحفظ';
      toast.error(errorMessage);
      
      if (onError) {
        onError(errorMessage);
      }
      
      return false;
      
    } finally {
      setSaving(false);
    }
  }, [formData, onSuccess, onError, updateField]);
  
  // حفظ كمسودة
  const saveDraft = useCallback(() => {
    return saveArticle('draft');
  }, [saveArticle]);
  
  // نشر المقال
  const publish = useCallback(() => {
    return saveArticle('published');
  }, [saveArticle]);
  
  // جدولة المقال
  const schedule = useCallback(async (scheduledDate: Date) => {
    updateFields({
      status: 'scheduled',
      publishType: 'scheduled',
      scheduledDate: scheduledDate.toISOString()
    });
    
    return saveArticle('scheduled');
  }, [updateFields, saveArticle]);
  
  // التحقق من إمكانية النشر
  const canPublish = useCallback(() => {
    const author_id = formData.author_id || formData.authorId || formData.article_author_id;
    const category_id = formData.category_id || formData.categoryId;
    
    return !!(
      formData.title?.trim() &&
      formData.content?.trim() &&
      author_id &&
      category_id
    );
  }, [formData]);
  
  // التحقق من وجود تغييرات غير محفوظة
  const hasUnsavedChanges = useCallback(() => {
    // يمكن تحسين هذا بمقارنة مع البيانات الأصلية
    return !!(formData.title || formData.content);
  }, [formData.title, formData.content]);
  
  return {
    // البيانات
    formData,
    validationErrors,
    
    // الحالات
    loading,
    saving,
    
    // الدوال
    updateField,
    updateFields,
    resetForm,
    validate,
    saveArticle,
    saveDraft,
    publish,
    schedule,
    
    // المساعدات
    canPublish: canPublish(),
    hasUnsavedChanges: hasUnsavedChanges(),
    
    // دوال مساعدة
    isValid: validationErrors.length === 0,
    isDraft: formData.status === 'draft',
    isPublished: formData.status === 'published',
    isScheduled: formData.status === 'scheduled'
  };
}

// Hook للحصول على خيارات النموذج (المؤلفين والتصنيفات)
export function useArticleFormOptions() {
  const [options, setOptions] = useState<ArticleFormOptions>({
    authors: [],
    categories: [],
    allowDrafts: true,
    allowScheduling: true,
    enableAI: false
  });
  
  const [loading, setLoading] = useState(false);
  
  const loadOptions = useCallback(async () => {
    setLoading(true);
    
    try {
      // جلب المؤلفين والتصنيفات بشكل متوازي
      const [authorsResponse, categoriesResponse] = await Promise.all([
        fetch('/api/users?role=author').then(r => r.json()),
        fetch('/api/categories?active_only=true').then(r => r.json())
      ]);
      
      setOptions({
        authors: authorsResponse.users || authorsResponse.data || [],
        categories: categoriesResponse.categories || categoriesResponse.data || [],
        allowDrafts: true,
        allowScheduling: true,
        enableAI: false
      });
      
    } catch (error) {
      console.error('خطأ في جلب خيارات النموذج:', error);
      toast.error('فشل في تحميل بيانات النموذج');
    } finally {
      setLoading(false);
    }
  }, []);
  
  return {
    options,
    loading,
    loadOptions
  };
}