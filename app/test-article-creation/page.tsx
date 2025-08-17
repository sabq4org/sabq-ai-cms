'use client';

import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import SafeArticleEditor from '@/components/Editor/SafeArticleEditor';
import { ImageUploadComponent as ImageUpload } from '@/components/ui/ImageUpload';
import { 
  Loader2, 
  AlertCircle, 
  CheckCircle, 
  FileText, 
  Image as ImageIcon,
  Code,
  Database,
  Wifi,
  Server
} from 'lucide-react';

interface TestResults {
  editorLoading: 'loading' | 'success' | 'error';
  imageUploadAPI: 'loading' | 'success' | 'error';
  databaseConnection: 'loading' | 'success' | 'error';
  categoryLoad: 'loading' | 'success' | 'error';
}

export default function TestArticleCreationPage() {
  const [testResults, setTestResults] = useState<TestResults>({
    editorLoading: 'loading',
    imageUploadAPI: 'loading',
    databaseConnection: 'loading',
    categoryLoad: 'loading'
  });

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    featured_image: ''
  });

  const [categories, setCategories] = useState<any[]>([]);
  const [errors, setErrors] = useState<string[]>([]);

  // اختبار تحميل التصنيفات
  useEffect(() => {
    const testCategoryLoad = async () => {
      try {
        const response = await fetch('/api/categories');
        if (response.ok) {
          const data = await response.json();
          setCategories(data.categories || data.data || []);
          setTestResults(prev => ({ ...prev, categoryLoad: 'success' }));
        } else {
          throw new Error(`HTTP ${response.status}`);
        }
      } catch (error: any) {
        console.error('❌ [Categories Test] Error:', error);
        setErrors(prev => [...prev, `تحميل التصنيفات: ${error.message}`]);
        setTestResults(prev => ({ ...prev, categoryLoad: 'error' }));
      }
    };

    testCategoryLoad();
  }, []);

  // اختبار اتصال قاعدة البيانات
  useEffect(() => {
    const testDatabaseConnection = async () => {
      try {
        const response = await fetch('/api/health/database');
        if (response.ok) {
          setTestResults(prev => ({ ...prev, databaseConnection: 'success' }));
        } else {
          throw new Error(`HTTP ${response.status}`);
        }
      } catch (error: any) {
        console.error('❌ [Database Test] Error:', error);
        setErrors(prev => [...prev, `قاعدة البيانات: ${error.message}`]);
        setTestResults(prev => ({ ...prev, databaseConnection: 'error' }));
      }
    };

    testDatabaseConnection();
  }, []);

  // اختبار API رفع الصور
  const testImageUploadAPI = async () => {
    try {
      setTestResults(prev => ({ ...prev, imageUploadAPI: 'loading' }));
      
      const response = await fetch('/api/upload-image', {
        method: 'GET'
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ [Image API Test] Success:', data);
        setTestResults(prev => ({ ...prev, imageUploadAPI: 'success' }));
        toast.success('API رفع الصور يعمل بشكل صحيح');
      } else {
        throw new Error(`HTTP ${response.status}`);
      }
    } catch (error: any) {
      console.error('❌ [Image API Test] Error:', error);
      setErrors(prev => [...prev, `API رفع الصور: ${error.message}`]);
      setTestResults(prev => ({ ...prev, imageUploadAPI: 'error' }));
      toast.error('فشل في اختبار API رفع الصور');
    }
  };

  // معالج تغيير المحتوى
  const handleContentChange = (content: string) => {
    setFormData(prev => ({ ...prev, content }));
    setTestResults(prev => ({ ...prev, editorLoading: 'success' }));
  };

  // معالج رفع الصورة
  const handleImageUpload = (url: string) => {
    console.log('🖼️ [Test] تم رفع الصورة:', url);
    setFormData(prev => ({ ...prev, featured_image: url }));
    toast.success('تم رفع الصورة بنجاح!');
  };

  const getStatusIcon = (status: 'loading' | 'success' | 'error') => {
    switch (status) {
      case 'loading':
        return <Loader2 className="w-5 h-5 animate-spin text-blue-500" />;
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
    }
  };

  const getStatusText = (status: 'loading' | 'success' | 'error') => {
    switch (status) {
      case 'loading':
        return 'جاري الاختبار...';
      case 'success':
        return 'نجح';
      case 'error':
        return 'فشل';
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-8 text-center">
        🧪 تشخيص شامل لصفحة إنشاء المقال
      </h1>

      {/* نتائج الاختبارات */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="p-4 border rounded-lg bg-white shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-600" />
              <span className="font-medium">المحرر</span>
            </div>
            {getStatusIcon(testResults.editorLoading)}
          </div>
          <p className="text-sm text-gray-600">
            {getStatusText(testResults.editorLoading)}
          </p>
        </div>

        <div className="p-4 border rounded-lg bg-white shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-green-600" />
              <span className="font-medium">رفع الصور</span>
            </div>
            {getStatusIcon(testResults.imageUploadAPI)}
          </div>
          <p className="text-sm text-gray-600">
            {getStatusText(testResults.imageUploadAPI)}
          </p>
          <button
            onClick={testImageUploadAPI}
            className="mt-2 text-xs text-blue-600 hover:underline"
          >
            إعادة اختبار
          </button>
        </div>

        <div className="p-4 border rounded-lg bg-white shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Database className="w-5 h-5 text-purple-600" />
              <span className="font-medium">قاعدة البيانات</span>
            </div>
            {getStatusIcon(testResults.databaseConnection)}
          </div>
          <p className="text-sm text-gray-600">
            {getStatusText(testResults.databaseConnection)}
          </p>
        </div>

        <div className="p-4 border rounded-lg bg-white shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Server className="w-5 h-5 text-orange-600" />
              <span className="font-medium">التصنيفات</span>
            </div>
            {getStatusIcon(testResults.categoryLoad)}
          </div>
          <p className="text-sm text-gray-600">
            {getStatusText(testResults.categoryLoad)} ({categories.length})
          </p>
        </div>
      </div>

      {/* الأخطاء */}
      {errors.length > 0 && (
        <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg">
          <h3 className="font-semibold text-red-800 mb-2 flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            الأخطاء المكتشفة:
          </h3>
          <ul className="text-sm text-red-700 space-y-1">
            {errors.map((error, index) => (
              <li key={index}>• {error}</li>
            ))}
          </ul>
        </div>
      )}

      {/* اختبار المحرر */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">🖊️ اختبار المحرر</h2>
          
          <div className="space-y-2">
            <label className="block text-sm font-medium">عنوان المقال:</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="اكتب عنوان المقال..."
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium">محتوى المقال:</label>
            <SafeArticleEditor
              initialContent={formData.content}
              onChange={handleContentChange}
              placeholder="ابدأ بكتابة محتوى المقال هنا للاختبار..."
              minHeight={300}
            />
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold">🖼️ اختبار رفع الصور</h2>
          
          <div className="space-y-2">
            <label className="block text-sm font-medium">الصورة البارزة:</label>
            <ImageUpload
              onImageUploaded={handleImageUpload}
              currentImage={formData.featured_image}
              type="featured"
              label="رفع صورة بارزة"
              maxSize={5}
            />
          </div>

          {formData.featured_image && (
            <div className="p-4 bg-green-50 rounded-lg">
              <p className="text-green-800 font-semibold mb-2">✅ تم رفع الصورة بنجاح</p>
              <img 
                src={formData.featured_image} 
                alt="الصورة المرفوعة" 
                className="w-full max-w-sm rounded-lg border"
              />
              <p className="text-xs text-green-600 mt-2 break-all">
                URL: {formData.featured_image}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* معلومات التشخيص */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 bg-blue-50 rounded-lg">
          <h3 className="font-semibold text-blue-800 mb-4 flex items-center gap-2">
            <Code className="w-5 h-5" />
            معلومات تقنية
          </h3>
          <div className="text-sm text-blue-700 space-y-2">
            <div>📝 المحرر: SafeArticleEditor (Tiptap)</div>
            <div>🖼️ API الصور: /api/upload-image</div>
            <div>📊 التصنيفات: /api/categories</div>
            <div>🗄️ قاعدة البيانات: Supabase PostgreSQL</div>
          </div>
        </div>

        <div className="p-6 bg-yellow-50 rounded-lg">
          <h3 className="font-semibold text-yellow-800 mb-4 flex items-center gap-2">
            <Wifi className="w-5 h-5" />
            تعليمات التشخيص
          </h3>
          <ol className="list-decimal list-inside text-sm text-yellow-700 space-y-1">
            <li>افتح Developer Tools (F12)</li>
            <li>راقب تبويب Console للأخطاء</li>
            <li>راقب تبويب Network للطلبات</li>
            <li>جرب كتابة نص في المحرر</li>
            <li>جرب رفع صورة</li>
            <li>ابحث عن رسائل تبدأ بـ [Test] أو [Image Upload]</li>
          </ol>
        </div>
      </div>

      {/* معاينة البيانات */}
      <div className="mt-8 p-6 bg-gray-50 rounded-lg">
        <h3 className="font-semibold mb-4">📋 معاينة البيانات المدخلة</h3>
        <pre className="text-sm bg-white p-4 rounded border overflow-auto">
{JSON.stringify({
  title: formData.title,
  contentLength: formData.content.length,
  hasImage: !!formData.featured_image,
  categoriesLoaded: categories.length,
  testResults
}, null, 2)}
        </pre>
      </div>
    </div>
  );
}