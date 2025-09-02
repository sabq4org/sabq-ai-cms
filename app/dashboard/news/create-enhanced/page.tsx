'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { 
  Save, Send, ArrowLeft, Loader2, Image as ImageIcon, 
  FileText, Calendar, User, Tag, Globe 
} from 'lucide-react';
import ImageUploadComponent from '@/components/ui/ImageUpload';

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface Author {
  id: string;
  name: string;
  email: string;
}

export default function CreateNewsPage() {
  const router = useRouter();
  
  // حالة النموذج
  const [formData, setFormData] = useState({
    title: '',
    excerpt: '',
    content: '',
    authorId: '',
    categoryId: '',
    featuredImage: '',
    status: 'draft' as 'draft' | 'published',
    isBreaking: false,
    isFeatured: false,
    scheduledDate: '',
    seoTitle: '',
    seoDescription: '',
    keywords: [] as string[]
  });

  // حالات التحميل والحفظ
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [authors, setAuthors] = useState<Author[]>([]);
  const [keywordInput, setKeywordInput] = useState('');

  // تحميل البيانات الأساسية
  React.useEffect(() => {
    const loadData = async () => {
      try {
        const [categoriesRes, authorsRes] = await Promise.all([
          fetch('/api/categories'),
          fetch('/api/team-members')
        ]);

        if (categoriesRes.ok) {
          const categoriesData = await categoriesRes.json();
          setCategories(categoriesData.data || categoriesData.categories || []);
        }

        if (authorsRes.ok) {
          const authorsData = await authorsRes.json();
          setAuthors(authorsData.data || authorsData.members || []);
        }
      } catch (error) {
        console.error('Error loading data:', error);
        toast.error('فشل في تحميل البيانات الأساسية');
      }
    };

    loadData();
  }, []);

  // دالة حفظ/نشر المقال
  const handleSubmit = async (status: 'draft' | 'published') => {
    try {
      if (status === 'published') {
        setIsPublishing(true);
      } else {
        setIsSaving(true);
      }

      // التحقق من البيانات المطلوبة
      if (!formData.title.trim()) {
        toast.error('عنوان المقال مطلوب');
        return;
      }

      if (!formData.content.trim()) {
        toast.error('محتوى المقال مطلوب');
        return;
      }

      const selectedAuthor = authors.find(a => a.id === formData.authorId);
      
      const articleData = {
        title: formData.title.trim(),
        content: formData.content.trim(),
        excerpt: formData.excerpt.trim() || formData.content.substring(0, 200) + '...',
        author_id: formData.authorId || 'system',
        author_name: selectedAuthor?.name || 'فريق التحرير',
        category_id: formData.categoryId || null,
        featured_image: formData.featuredImage || null,
        status,
        featured: formData.isFeatured,
        breaking: formData.isBreaking,
        seo_title: formData.seoTitle || formData.title,
        seo_description: formData.seoDescription || formData.excerpt,
        seo_keywords: formData.keywords.join(', '),
        scheduled_for: formData.scheduledDate ? new Date(formData.scheduledDate).toISOString() : null,
        reading_time: Math.ceil(formData.content.length / 1000) || 5,
        metadata: {
          keywords: formData.keywords,
          is_featured: formData.isFeatured,
          is_breaking: formData.isBreaking
        }
      };

      console.log('📤 إرسال بيانات المقال:', articleData);

      const response = await fetch('/api/articles', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(articleData),
      });

      const responseData = await response.json();
      console.log('📥 استجابة الخادم:', responseData);

      if (response.ok && responseData.success) {
        toast.success(
          status === 'draft' 
            ? '✅ تم حفظ المسودة بنجاح' 
            : '🎉 تم نشر المقال بنجاح'
        );
        router.push('/dashboard/news');
      } else {
        throw new Error(responseData.error || responseData.message || 'فشل في حفظ المقال');
      }

    } catch (error: any) {
      console.error('❌ خطأ في حفظ المقال:', error);
      toast.error(error.message || 'حدث خطأ في حفظ المقال');
    } finally {
      setIsSaving(false);
      setIsPublishing(false);
    }
  };

  // دالة إضافة كلمة مفتاحية
  const addKeyword = () => {
    if (keywordInput.trim() && !formData.keywords.includes(keywordInput.trim())) {
      setFormData(prev => ({
        ...prev,
        keywords: [...prev.keywords, keywordInput.trim()]
      }));
      setKeywordInput('');
    }
  };

  // دالة حذف كلمة مفتاحية
  const removeKeyword = (index: number) => {
    setFormData(prev => ({
      ...prev,
      keywords: prev.keywords.filter((_, i) => i !== index)
    }));
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'dark bg-gray-900' : 'bg-gray-50'}`}>
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4 rtl:space-x-reverse">
            <button
              onClick={() => router.back()}
              className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>العودة</span>
            </button>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              إنشاء خبر جديد
            </h1>
          </div>

          <div className="flex space-x-3 rtl:space-x-reverse">
            <button
              onClick={() => handleSubmit('draft')}
              disabled={isSaving || isPublishing}
              className="flex items-center space-x-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
            >
              {isSaving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              <span>حفظ مسودة</span>
            </button>

            <button
              onClick={() => handleSubmit('published')}
              disabled={isSaving || isPublishing}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {isPublishing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              <span>نشر الآن</span>
            </button>
          </div>
        </div>

        {/* Form */}
        <div className="space-y-8">
          {/* المعلومات الأساسية */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold mb-4 flex items-center">
              <FileText className="h-5 w-5 mr-2" />
              المعلومات الأساسية
            </h2>
            
            <div className="space-y-4">
              {/* العنوان */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  العنوان *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder="أدخل عنوان الخبر..."
                  required
                />
              </div>

              {/* المقدمة */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  المقدمة
                </label>
                <textarea
                  value={formData.excerpt}
                  onChange={(e) => setFormData(prev => ({ ...prev, excerpt: e.target.value }))}
                  rows={3}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder="مقدمة مختصرة عن الخبر..."
                />
              </div>

              {/* الكاتب والتصنيف */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <User className="h-4 w-4 inline mr-1" />
                    الكاتب
                  </label>
                  <select
                    value={formData.authorId}
                    onChange={(e) => setFormData(prev => ({ ...prev, authorId: e.target.value }))}
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  >
                    <option value="">اختر الكاتب</option>
                    {authors.map((author) => (
                      <option key={author.id} value={author.id}>
                        {author.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <Tag className="h-4 w-4 inline mr-1" />
                    التصنيف
                  </label>
                  <select
                    value={formData.categoryId}
                    onChange={(e) => setFormData(prev => ({ ...prev, categoryId: e.target.value }))}
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  >
                    <option value="">اختر التصنيف</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* المحتوى */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold mb-4">
              محتوى الخبر *
            </h2>
            
            <textarea
              value={formData.content}
              onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
              rows={12}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              placeholder="اكتب محتوى الخبر هنا..."
              required
            />
          </div>

          {/* الصورة المميزة */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold mb-4 flex items-center">
              <ImageIcon className="h-5 w-5 mr-2" />
              الصورة المميزة
            </h2>
            
            <ImageUploadComponent
              currentImage={formData.featuredImage}
              onImageUploaded={(url) => setFormData(prev => ({ ...prev, featuredImage: url }))}
              type="featured"
              label=""
              maxSize={10}
            />
          </div>

          {/* خيارات متقدمة */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold mb-4">
              خيارات متقدمة
            </h2>
            
            <div className="space-y-4">
              {/* خيارات النشر */}
              <div className="flex flex-wrap gap-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.isFeatured}
                    onChange={(e) => setFormData(prev => ({ ...prev, isFeatured: e.target.checked }))}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="mr-2 text-sm">خبر مميز</span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.isBreaking}
                    onChange={(e) => setFormData(prev => ({ ...prev, isBreaking: e.target.checked }))}
                    className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                  />
                  <span className="mr-2 text-sm">خبر عاجل</span>
                </label>
              </div>

              {/* الكلمات المفتاحية */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  الكلمات المفتاحية
                </label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={keywordInput}
                    onChange={(e) => setKeywordInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addKeyword())}
                    className="flex-1 p-2 border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="أضف كلمة مفتاحية واضغط Enter"
                  />
                  <button
                    type="button"
                    onClick={addKeyword}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                  >
                    إضافة
                  </button>
                </div>
                
                {formData.keywords.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.keywords.map((keyword, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                      >
                        {keyword}
                        <button
                          onClick={() => removeKeyword(index)}
                          className="mr-1 hover:text-blue-600"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
