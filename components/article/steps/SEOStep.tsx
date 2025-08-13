'use client';

import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Hash, Sparkles, Loader2, X, Info, Target, Search } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface SEOStepProps {
  formData: any;
  setFormData: (data: any) => void;
  darkMode: boolean;
  isAILoading: boolean;
  setIsAILoading: (loading: boolean) => void;
  editorRef: any;
}

export function SEOStep({
  formData,
  setFormData,
  darkMode,
  isAILoading,
  setIsAILoading,
  editorRef
}: SEOStepProps) {
  const [currentKeyword, setCurrentKeyword] = useState('');

  // اقتراح كلمات مفتاحية بالذكاء الاصطناعي
  const suggestKeywords = async () => {
    let textContent = formData.excerpt;
    if (editorRef.current) {
      const editorContent = editorRef.current.getHTML();
      if (editorContent && editorContent.length > 50) {
        textContent = editorContent.replace(/<[^>]*>/g, '');
      }
    }
    
    if (!textContent || textContent.length < 20) {
      toast.error('يرجى كتابة محتوى أولاً');
      return;
    }
    
    setIsAILoading(true);
    try {
      const response = await fetch('/api/ai/editor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'keywords', content: textContent })
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.result) {
          const keywords = data.result.split(',').map((k: string) => k.trim()).filter((k: string) => k);
          setFormData((prev: any) => ({ ...prev, keywords }));
          toast.success('تم اقتراح الكلمات المفتاحية');
        }
      }
    } catch (error) {
      console.error('Error suggesting keywords:', error);
      toast.error('حدث خطأ في اقتراح الكلمات المفتاحية');
    } finally {
      setIsAILoading(false);
    }
  };

  // تأكد من أن keywords دائمًا مصفوفة
  const ensureKeywordsArray = () => {
    if (!formData.keywords) {
      setFormData((prev: any) => ({
        ...prev,
        keywords: []
      }));
      return [];
    } else if (!Array.isArray(formData.keywords)) {
      // إذا كانت نصًا أو أي نوع آخر، نحولها إلى مصفوفة
      const convertedKeywords = typeof formData.keywords === 'string' 
        ? formData.keywords.split(',').map((k: string) => k.trim()).filter((k: string) => k)
        : [String(formData.keywords)];
      
      setFormData((prev: any) => ({
        ...prev,
        keywords: convertedKeywords
      }));
      
      return convertedKeywords;
    }
    return formData.keywords;
  };

  // استدعاء التحويل عند تحميل المكون
  React.useEffect(() => {
    ensureKeywordsArray();
  }, []);

  // إضافة كلمة مفتاحية
  const addKeyword = (keyword: string) => {
    const keywords = ensureKeywordsArray();
    if (keyword && !keywords.includes(keyword)) {
      setFormData((prev: any) => ({
        ...prev,
        keywords: [...keywords, keyword]
      }));
      setCurrentKeyword('');
    }
  };

  // حذف كلمة مفتاحية
  const removeKeyword = (keyword: string) => {
    const keywords = ensureKeywordsArray();
    setFormData((prev: any) => ({
      ...prev,
      keywords: keywords.filter((k: string) => k !== keyword)
    }));
  };

  // توليد slug من العنوان
  const generateSlug = (title: string): string => {
    return title
      .toLowerCase()
      .replace(/[^\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  // حساب جودة SEO
  const getSEOScore = () => {
    let score = 0;
    const keywordsLength = Array.isArray(formData.keywords) ? formData.keywords.length : 0;
    const checks = {
      title: formData.title && formData.title.length >= 30 && formData.title.length <= 60,
      description: formData.seoDescription && formData.seoDescription.length >= 120 && formData.seoDescription.length <= 160,
      keywords: keywordsLength >= 3 && keywordsLength <= 5,
      image: !!formData.featuredImage
    };
    
    Object.values(checks).forEach(check => {
      if (check) score += 25;
    });
    
    return { score, checks };
  };

  const { score, checks } = getSEOScore();

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h2 className={`text-2xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
          تحسين محركات البحث
        </h2>
        <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
          حسّن ظهور مقالك في نتائج البحث
        </p>
      </div>

      {/* نقاط SEO */}
      <div className={`p-6 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            نقاط تحسين SEO
          </h3>
          <div className={`text-2xl font-bold ${
            score >= 75 ? 'text-green-600' : score >= 50 ? 'text-yellow-600' : 'text-red-600'
          }`}>
            {score}%
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              طول العنوان (30-60 حرف)
            </span>
            <span className={`text-sm ${checks.title ? 'text-green-600' : 'text-red-600'}`}>
              {formData.title.length} حرف
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              طول الوصف (120-160 حرف)
            </span>
            <span className={`text-sm ${checks.description ? 'text-green-600' : 'text-red-600'}`}>
              {formData.seoDescription.length || formData.excerpt.length} حرف
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              الكلمات المفتاحية (3-5)
            </span>
            <span className={`text-sm ${checks.keywords ? 'text-green-600' : 'text-red-600'}`}>
              {Array.isArray(formData.keywords) ? formData.keywords.length : 0} كلمات
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              الصورة البارزة
            </span>
            <span className={`text-sm ${checks.image ? 'text-green-600' : 'text-red-600'}`}>
              {checks.image ? 'موجودة' : 'مفقودة'}
            </span>
          </div>
        </div>
      </div>

      {/* معاينة نتيجة البحث */}
      <div>
        <Label className="text-base font-medium mb-3 block">معاينة في نتائج البحث</Label>
        <div className={`p-4 rounded-lg border ${
          darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        }`}>
          <h3 className="text-blue-600 text-lg font-medium mb-1 hover:underline cursor-pointer">
            {formData.seoTitle || formData.title || 'عنوان المقال سيظهر هنا...'}
          </h3>
          <p className="text-green-700 dark:text-green-400 text-sm mb-2">
            sabq.org › article › {formData.title ? generateSlug(formData.title) : new Date().toISOString().split('T')[0]}
          </p>
          <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            {formData.seoDescription || formData.excerpt || 'وصف المقال سيظهر هنا...'}
          </p>
        </div>
      </div>

      {/* عنوان SEO */}
      <div>
        <Label htmlFor="seo-title" className="text-base font-medium mb-2 block">
          عنوان SEO (اختياري)
        </Label>
        <Input
          id="seo-title"
          value={formData.seoTitle}
          onChange={(e) => setFormData((prev: any) => ({ ...prev, seoTitle: e.target.value }))}
          placeholder={formData.title || 'عنوان محركات البحث'}
        />
        <p className="text-sm text-gray-500 mt-1">
          {formData.seoTitle.length} / 60 حرف (الموصى به)
        </p>
      </div>

      {/* وصف SEO */}
      <div>
        <Label htmlFor="seo-description" className="text-base font-medium mb-2 block">
          وصف SEO (اختياري)
        </Label>
        <Textarea
          id="seo-description"
          value={formData.seoDescription}
          onChange={(e) => setFormData((prev: any) => ({ ...prev, seoDescription: e.target.value }))}
          placeholder={formData.excerpt || 'وصف محركات البحث'}
          rows={3}
        />
        <p className="text-sm text-gray-500 mt-1">
          {formData.seoDescription.length} / 160 حرف (الموصى به)
        </p>
      </div>

      {/* الكلمات المفتاحية */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <Label className="text-base font-medium">
            الكلمات المفتاحية
            {Array.isArray(formData.keywords) && formData.keywords.length > 0 && (
              <span className="text-sm text-gray-500 font-normal mr-2">
                ({formData.keywords.length})
              </span>
            )}
          </Label>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={suggestKeywords}
            disabled={isAILoading}
          >
            {isAILoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4" />
            )}
            <span className="mr-1">اقتراح بالذكاء الاصطناعي</span>
          </Button>
        </div>

        {/* عرض الكلمات المفتاحية */}
        <div className="flex flex-wrap gap-2 mb-3">
          {Array.isArray(formData.keywords) ? (
            formData.keywords.length > 0 ? (
              formData.keywords.map((keyword: string, index: number) => (
                <span key={index} className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-sm flex items-center gap-1">
                  <Hash className="w-3 h-3" />
                  {keyword}
                  <button
                    onClick={() => removeKeyword(keyword)}
                    className="ml-1 hover:text-purple-900 dark:hover:text-purple-100"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))
            ) : (
              <span className="text-sm text-gray-500">لم يتم إضافة كلمات مفتاحية بعد</span>
            )
          ) : (
            <span className="text-sm text-gray-500">جاري تحميل الكلمات المفتاحية...</span>
          )}
        </div>

        {/* إضافة كلمة مفتاحية */}
        <div className="flex gap-2">
          <Input
            value={currentKeyword}
            onChange={(e) => setCurrentKeyword(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addKeyword(currentKeyword.trim());
              }
            }}
            placeholder="أضف كلمة مفتاحية واضغط Enter..."
            className="flex-1"
          />
          <Button
            type="button"
            onClick={() => addKeyword(currentKeyword.trim())}
            disabled={!currentKeyword.trim()}
          >
            إضافة
          </Button>
        </div>

        {/* اقتراحات سريعة */}
        <div className="mt-3">
          <p className="text-sm text-gray-500 mb-2">اقتراحات سريعة:</p>
          <div className="flex flex-wrap gap-1">
            {['السعودية', 'الرياض', 'أخبار', 'عاجل', 'تقنية', 'اقتصاد', 'رياضة'].map((suggestion) => (
              <button
                key={suggestion}
                onClick={() => addKeyword(suggestion)}
                disabled={formData.keywords.includes(suggestion)}
                className={`px-2 py-1 text-xs rounded ${
                  formData.keywords.includes(suggestion)
                    ? 'bg-gray-200 dark:bg-gray-700 text-gray-500 cursor-not-allowed'
                    : 'bg-gray-100 dark:bg-gray-800 hover:bg-purple-100 dark:hover:bg-purple-900/30'
                }`}
              >
                + {suggestion}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* نصائح */}
      <Alert className={darkMode ? 'bg-blue-900/20 border-blue-800' : 'bg-blue-50 border-blue-200'}>
        <Info className="h-4 w-4" />
        <AlertDescription className={darkMode ? 'text-blue-200' : 'text-blue-800'}>
          <strong>نصائح SEO:</strong>
          <ul className="mt-2 space-y-1 text-sm">
            <li>• استخدم الكلمات المفتاحية بشكل طبيعي في المحتوى</li>
            <li>• اجعل العنوان جذاباً ويحتوي على الكلمة المفتاحية الرئيسية</li>
            <li>• الوصف الجيد يزيد من نسبة النقر في نتائج البحث</li>
            <li>• استخدم 3-5 كلمات مفتاحية ذات صلة بالموضوع</li>
          </ul>
        </AlertDescription>
      </Alert>
    </div>
  );
} 