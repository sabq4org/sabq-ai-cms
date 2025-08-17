'use client';

import React from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  CheckCircle, AlertCircle, FileText, Image as ImageIcon, 
  Calendar, Tag, User, Globe, Star, Clock,
  Send, Save, Eye
} from 'lucide-react';

interface ReviewStepProps {
  formData: any;
  darkMode: boolean;
  categories: any[];
  authors: any[];
  onPublish: () => void;
  onSaveDraft: () => void;
}

export function ReviewStep({
  formData,
  darkMode,
  categories,
  authors,
  onPublish,
  onSaveDraft
}: ReviewStepProps) {
  
  // الحصول على اسم التصنيف
  const getCategoryName = () => {
    const category = categories.find(c => c.id === formData.categoryId);
    return category?.name || 'غير محدد';
  };

  // الحصول على اسم الكاتب
  const getAuthorName = () => {
    const author = authors.find(a => a.id === formData.authorId);
    return author?.name || 'غير محدد';
  };

  // التحقق من اكتمال البيانات
  const checkCompleteness = () => {
    const required = {
      title: !!formData.title,
      excerpt: !!formData.excerpt,
      content: !!formData.content,
      category: !!formData.categoryId,
      author: !!formData.authorId
    };

    const optional = {
      featuredImage: !!formData.featuredImage,
      keywords: formData.keywords.length > 0,
      seoTitle: !!formData.seoTitle,
      seoDescription: !!formData.seoDescription
    };

    const requiredCount = Object.values(required).filter(v => v).length;
    const optionalCount = Object.values(optional).filter(v => v).length;
    const totalRequired = Object.keys(required).length;
    const totalOptional = Object.keys(optional).length;

    return {
      required,
      optional,
      requiredComplete: requiredCount === totalRequired,
      score: Math.round(((requiredCount + optionalCount) / (totalRequired + totalOptional)) * 100)
    };
  };

  const completeness = checkCompleteness();

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h2 className={`text-2xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
          المراجعة النهائية
        </h2>
        <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
          راجع المقال قبل النشر
        </p>
      </div>

      {/* نسبة الاكتمال */}
      <div className={`p-6 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            نسبة اكتمال المقال
          </h3>
          <div className={`text-3xl font-bold ${
            completeness.score >= 80 ? 'text-green-600' : 
            completeness.score >= 60 ? 'text-yellow-600' : 'text-red-600'
          }`}>
            {completeness.score}%
          </div>
        </div>
        
        <div className="w-full h-4 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div 
            className={`h-full transition-all duration-500 ${
              completeness.score >= 80 ? 'bg-green-600' : 
              completeness.score >= 60 ? 'bg-yellow-600' : 'bg-red-600'
            }`}
            style={{ width: `${completeness.score}%` }}
          />
        </div>
        
        {!completeness.requiredComplete && (
          <Alert className="mt-4 border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-700">
              يجب إكمال جميع الحقول المطلوبة قبل النشر
            </AlertDescription>
          </Alert>
        )}
      </div>

      {/* ملخص المقال */}
      <div className="space-y-4">
        <h3 className={`font-medium text-lg ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          ملخص المقال
        </h3>

        {/* المعلومات الأساسية */}
        <div className={`p-4 rounded-lg border ${
          darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        }`}>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <FileText className="w-5 h-5 text-blue-600 mt-0.5" />
              <div className="flex-1">
                <p className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  العنوان
                </p>
                <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {formData.title || 'غير محدد'}
                  {!formData.title && <span className="text-red-500 text-sm mr-2">*مطلوب</span>}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Tag className="w-5 h-5 text-purple-600 mt-0.5" />
              <div className="flex-1">
                <p className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  التصنيف
                </p>
                <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {getCategoryName()}
                  {!formData.categoryId && <span className="text-red-500 text-sm mr-2">*مطلوب</span>}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <User className="w-5 h-5 text-green-600 mt-0.5" />
              <div className="flex-1">
                <p className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  الكاتب
                </p>
                <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {getAuthorName()}
                  {!formData.authorId && <span className="text-red-500 text-sm mr-2">*مطلوب</span>}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* الصورة البارزة */}
        {formData.featuredImage && (
          <div className={`p-4 rounded-lg border ${
            darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          }`}>
            <div className="flex items-start gap-3">
              <ImageIcon className="w-5 h-5 text-orange-600 mt-0.5" />
              <div className="flex-1">
                <p className={`text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  الصورة البارزة
                </p>
                <Image 
                  src={formData.featuredImage} 
                  alt="الصورة البارزة" 
                  width={200} 
                  height={150}
                  className="rounded-lg object-cover"
                />
                {formData.featuredImageCaption && (
                  <p className={`text-sm mt-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {formData.featuredImageCaption}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* خيارات النشر */}
        <div className={`p-4 rounded-lg border ${
          darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        }`}>
          <h4 className={`font-medium mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            خيارات النشر
          </h4>
          <div className="space-y-2">
            {formData.isBreaking && (
              <div className="flex items-center gap-2 text-red-600">
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm">خبر عاجل</span>
              </div>
            )}
            {formData.isFeatured && (
              <div className="flex items-center gap-2 text-yellow-600">
                <Star className="w-4 h-4" />
                <span className="text-sm">مقال مميز</span>
              </div>
            )}
            <div className="flex items-center gap-2 text-blue-600">
              <Globe className="w-4 h-4" />
              <span className="text-sm">
                {formData.type === 'local' ? 'محلي' : 'دولي'}
              </span>
            </div>
            <div className="flex items-center gap-2 text-green-600">
              <Clock className="w-4 h-4" />
              <span className="text-sm">
                {formData.publishType === 'now' ? 'نشر فوري' : `مجدول: ${formData.scheduledDate}`}
              </span>
            </div>
          </div>
        </div>

        {/* الكلمات المفتاحية */}
        {formData.keywords.length > 0 && (
          <div className={`p-4 rounded-lg border ${
            darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          }`}>
            <h4 className={`font-medium mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              الكلمات المفتاحية
            </h4>
            <div className="flex flex-wrap gap-2">
              {formData.keywords.map((keyword: string, index: number) => (
                <span key={index} className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded text-sm">
                  #{keyword}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* أزرار الإجراءات */}
      <div className="flex gap-3 pt-6">
        <Button
          onClick={onSaveDraft}
          variant="outline"
          className="flex-1"
        >
          <Save className="w-4 h-4 ml-2" />
          حفظ كمسودة
        </Button>
        
        <Button
          onClick={onPublish}
          disabled={!completeness.requiredComplete || formData.publishType === 'scheduled'}
          className="flex-1 bg-green-600 hover:bg-green-700"
        >
          {formData.publishType === 'scheduled' ? (
            <>
              <Calendar className="w-4 h-4 ml-2" />
              جدولة النشر
            </>
          ) : (
            <>
              <Send className="w-4 h-4 ml-2" />
              نشر المقال
            </>
          )}
        </Button>
      </div>

      {/* معلومات إضافية */}
      <Alert className={darkMode ? 'bg-blue-900/20 border-blue-800' : 'bg-blue-50 border-blue-200'}>
        <CheckCircle className="h-4 w-4" />
        <AlertDescription className={darkMode ? 'text-blue-200' : 'text-blue-800'}>
          {formData.publishType === 'scheduled' 
            ? `سيتم نشر المقال تلقائياً في ${new Date(formData.scheduledDate).toLocaleString('ar-SA')}`
            : 'سيتم نشر المقال فور الضغط على زر النشر'
          }
        </AlertDescription>
      </Alert>
    </div>
  );
} 