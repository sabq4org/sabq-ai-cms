'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Category {
  id: string;
  name: string;
  name_ar?: string;
}

interface Author {
  id: string;
  name: string;
}

export default function SimpleNewsCreatePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [authors, setAuthors] = useState<Author[]>([]);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    categoryId: '',
    authorId: '',
    featuredImage: '',
    keywords: 'عام,أخبار'
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      console.log('🔄 تحميل البيانات...');
      
      const [categoriesRes, authorsRes] = await Promise.all([
        fetch('/api/categories'),
        fetch('/api/team-members')
      ]);
      
      const categoriesData = await categoriesRes.json();
      const authorsData = await authorsRes.json();
      
      const loadedCategories = categoriesData.categories || [];
      const loadedAuthors = authorsData.data || [];
      
      console.log(`📂 تم تحميل ${loadedCategories.length} تصنيف`);
      console.log(`👥 تم تحميل ${loadedAuthors.length} كاتب`);
      
      setCategories(loadedCategories);
      setAuthors(loadedAuthors);
      
      // تعيين قيم افتراضية
      if (loadedCategories.length > 0 && loadedAuthors.length > 0) {
        setFormData(prev => ({
          ...prev,
          categoryId: loadedCategories[0].id,
          authorId: loadedAuthors[0].id
        }));
        console.log('✅ تم تعيين القيم الافتراضية');
      }
      
    } catch (error) {
      console.error('❌ خطأ في التحميل:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      alert('يرجى إدخال عنوان المقال');
      return;
    }
    
    if (!formData.content.trim()) {
      alert('يرجى إدخال محتوى المقال');
      return;
    }

    setLoading(true);
    
    try {
      console.log('📤 إرسال المقال...');
      console.log('البيانات:', {
        title: formData.title,
        categoryId: formData.categoryId,
        authorId: formData.authorId,
        featuredImage: formData.featuredImage
      });

      const articleData = {
        title: formData.title,
        content: `<p>${formData.content}</p>`,
        category_id: formData.categoryId,
        author_id: formData.authorId,
        featured_image: formData.featuredImage || null,
        keywords: formData.keywords,
        status: 'published'
      };

      const response = await fetch('/api/articles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(articleData)
      });

      const result = await response.json();

      if (response.ok) {
        console.log('✅ نجح النشر!', result);
        alert(`تم نشر المقال بنجاح!\nمعرف المقال: ${result.article?.id}`);
        
        // إعادة تعيين النموذج
        setFormData({
          title: '',
          content: '',
          categoryId: categories[0]?.id || '',
          authorId: authors[0]?.id || '',
          featuredImage: '',
          keywords: 'عام,أخبار'
        });
      } else {
        console.error('❌ فشل النشر:', result);
        alert(`فشل في النشر: ${result.error || 'خطأ غير معروف'}`);
      }
    } catch (error) {
      console.error('❌ خطأ في الشبكة:', error);
      alert('حدث خطأ في الاتصال');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">إنشاء مقال جديد - النسخة المبسطة</h1>
        <p className="text-gray-600">نسخة بسيطة ومضمونة لإنشاء المقالات</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* العنوان */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            عنوان المقال *
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="أدخل عنوان المقال"
            required
          />
        </div>

        {/* المحتوى */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            محتوى المقال *
          </label>
          <textarea
            value={formData.content}
            onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
            rows={8}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="أدخل محتوى المقال"
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* التصنيف */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              التصنيف * ({categories.length} متاح)
            </label>
            <select
              value={formData.categoryId}
              onChange={(e) => setFormData(prev => ({ ...prev, categoryId: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">اختر التصنيف</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>
                  {cat.name_ar || cat.name} ({cat.id})
                </option>
              ))}
            </select>
          </div>

          {/* الكاتب */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              الكاتب * ({authors.length} متاح)
            </label>
            <select
              value={formData.authorId}
              onChange={(e) => setFormData(prev => ({ ...prev, authorId: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">اختر الكاتب</option>
              {authors.map(author => (
                <option key={author.id} value={author.id}>
                  {author.name} ({author.id})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* الصورة المميزة */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            رابط الصورة المميزة
          </label>
          <input
            type="url"
            value={formData.featuredImage}
            onChange={(e) => setFormData(prev => ({ ...prev, featuredImage: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="https://example.com/image.jpg"
          />
          <button
            type="button"
            onClick={() => setFormData(prev => ({ 
              ...prev, 
              featuredImage: 'https://res.cloudinary.com/dybhezmvb/image/upload/v1752733062/sabq-cms/featured/test.jpg' 
            }))}
            className="mt-2 text-sm text-blue-600 hover:underline"
          >
            استخدام صورة اختبار
          </button>
        </div>

        {/* الكلمات المفتاحية */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            الكلمات المفتاحية
          </label>
          <input
            type="text"
            value={formData.keywords}
            onChange={(e) => setFormData(prev => ({ ...prev, keywords: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="كلمة1,كلمة2,كلمة3"
          />
        </div>

        {/* معلومات النظام */}
        <div className="bg-gray-50 p-4 rounded-md">
          <h3 className="text-sm font-medium text-gray-700 mb-2">معلومات النظام:</h3>
          <div className="text-sm text-gray-600 space-y-1">
            <div>عدد التصنيفات المحملة: {categories.length}</div>
            <div>عدد الكتّاب المحملين: {authors.length}</div>
            <div>التصنيف المحدد: {formData.categoryId || 'لا يوجد'}</div>
            <div>الكاتب المحدد: {formData.authorId || 'لا يوجد'}</div>
            <div>الصورة: {formData.featuredImage ? 'موجودة' : 'غير موجودة'}</div>
          </div>
        </div>

        {/* أزرار الإجراءات */}
        <div className="flex gap-4">
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {loading ? 'جاري النشر...' : '🚀 نشر المقال'}
          </button>

          <button
            type="button"
            onClick={() => router.push('/dashboard/news/unified')}
            className="bg-gray-600 text-white px-6 py-2 rounded-md hover:bg-gray-700"
          >
            العودة للصفحة الأصلية
          </button>
        </div>
      </form>
    </div>
  );
} 