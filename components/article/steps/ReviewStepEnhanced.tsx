'use client';

import React, { useMemo, memo } from 'react';
import { CheckCircle, AlertCircle, Clock, User, Tag, Image as ImageIcon, Hash, Calendar, Send, Save, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface ReviewStepEnhancedProps {
  formData: {
    title: string;
    subtitle: string;
    excerpt: string;
    content: string;
    authorId: string;
    categoryId: string;
    featuredImage: string;
    gallery: Array<{ url: string; id: string }>;
    publishType: 'now' | 'scheduled';
    scheduledDate: string;
    isBreaking: boolean;
    isFeatured: boolean;
    keywords: string[];
    seoTitle: string;
    seoDescription: string;
  };
  categories: Array<{ id: string; name: string; name_ar?: string }>;
  authors: Array<{ id: string; name: string }>;
  darkMode: boolean;
  onPublish: () => void;
  onSaveDraft: () => void;
}

const ReviewStepEnhanced = memo(({ 
  formData, 
  categories, 
  authors, 
  darkMode,
  onPublish,
  onSaveDraft 
}: ReviewStepEnhancedProps) => {
  
  // حساب نسبة الاكتمال
  const completionScore = useMemo(() => {
    let score = 0;
    let totalFields = 8;
    let completedFields = 0;

    // الحقول المطلوبة
    if (formData.title) completedFields++;
    if (formData.excerpt) completedFields++;
    if (formData.content) completedFields++;
    if (formData.authorId) completedFields++;
    if (formData.categoryId) completedFields++;
    
    // الحقول الاختيارية
    if (formData.featuredImage) completedFields++;
    if (formData.keywords.length > 0) completedFields++;
    if (formData.seoTitle || formData.seoDescription) completedFields++;

    score = Math.round((completedFields / totalFields) * 100);
    
    return { score, completedFields, totalFields };
  }, [formData]);

  // الحصول على اسم التصنيف
  const getCategoryName = () => {
    const category = categories.find(c => c.id === formData.categoryId);
    return category?.name_ar || category?.name || 'غير محدد';
  };

  // الحصول على اسم الكاتب
  const getAuthorName = () => {
    const author = authors.find(a => a.id === formData.authorId);
    return author?.name || 'غير محدد';
  };

  // التحقق من جاهزية النشر
  const isReadyToPublish = formData.title && formData.excerpt && formData.content && formData.authorId && formData.categoryId;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* رأس المراجعة */}
      <div className="text-center">
        <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-500" />
        <h2 className="text-2xl font-bold mb-2">مراجعة نهائية قبل النشر</h2>
        <p className="text-gray-500 dark:text-gray-400">
          تأكد من جميع المعلومات قبل نشر المقال
        </p>
      </div>

      {/* نسبة الاكتمال */}
      <div className={cn(
        "p-6 rounded-lg border",
        darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
      )}>
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-medium">نسبة اكتمال المقال</span>
          <span className={cn(
            "text-2xl font-bold",
            completionScore.score === 100 ? "text-green-600" : 
            completionScore.score >= 75 ? "text-yellow-600" : "text-red-600"
          )}>
            {completionScore.score}%
          </span>
        </div>
        <div className="w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <motion.div
            className={cn(
              "h-full",
              completionScore.score === 100 ? "bg-green-500" : 
              completionScore.score >= 75 ? "bg-yellow-500" : "bg-red-500"
            )}
            initial={{ width: 0 }}
            animate={{ width: `${completionScore.score}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
          {completionScore.completedFields} من {completionScore.totalFields} حقول مكتملة
        </p>
      </div>

      {/* ملخص المعلومات */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* معلومات أساسية */}
        <div className={cn(
          "p-4 rounded-lg border",
          darkMode ? "bg-gray-800 border-gray-700" : "bg-gray-50 border-gray-200"
        )}>
          <h3 className="font-semibold mb-3">المعلومات الأساسية</h3>
          <div className="space-y-2 text-sm">
            <div className="flex items-start gap-2">
              <CheckCircle className={cn(
                "w-4 h-4 mt-0.5",
                formData.title ? "text-green-500" : "text-gray-400"
              )} />
              <div className="flex-1">
                <span className="text-gray-500">العنوان:</span>
                <p className="font-medium">{formData.title || 'غير محدد'}</p>
              </div>
            </div>
            
            <div className="flex items-start gap-2">
              <CheckCircle className={cn(
                "w-4 h-4 mt-0.5",
                formData.excerpt ? "text-green-500" : "text-gray-400"
              )} />
              <div className="flex-1">
                <span className="text-gray-500">الموجز:</span>
                <p className="font-medium line-clamp-2">{formData.excerpt || 'غير محدد'}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Tag className="w-4 h-4 text-gray-400" />
              <span className="text-gray-500">التصنيف:</span>
              <span className="font-medium">{getCategoryName()}</span>
            </div>

            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-gray-400" />
              <span className="text-gray-500">الكاتب:</span>
              <span className="font-medium">{getAuthorName()}</span>
            </div>
          </div>
        </div>

        {/* إعدادات النشر */}
        <div className={cn(
          "p-4 rounded-lg border",
          darkMode ? "bg-gray-800 border-gray-700" : "bg-gray-50 border-gray-200"
        )}>
          <h3 className="font-semibold mb-3">إعدادات النشر</h3>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-gray-400" />
              <span className="text-gray-500">التوقيت:</span>
              <span className="font-medium">
                {formData.publishType === 'now' ? 'نشر فوري' : 
                 `مجدول: ${new Date(formData.scheduledDate).toLocaleString('ar-SA')}`}
              </span>
            </div>

            {formData.isBreaking && (
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-500" />
                <span className="font-medium text-red-600">خبر عاجل</span>
              </div>
            )}

            {formData.isFeatured && (
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-yellow-500" />
                <span className="font-medium text-yellow-600">خبر مميز</span>
              </div>
            )}

            <div className="flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-gray-400" />
              <span className="text-gray-500">الصور:</span>
              <span className="font-medium">
                {(formData.featuredImage ? 1 : 0) + formData.gallery.length} صورة
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Hash className="w-4 h-4 text-gray-400" />
              <span className="text-gray-500">كلمات مفتاحية:</span>
              <span className="font-medium">{formData.keywords.length} كلمة</span>
            </div>
          </div>
        </div>
      </div>

      {/* معاينة المحتوى */}
      <div className={cn(
        "p-4 rounded-lg border",
        darkMode ? "bg-gray-800 border-gray-700" : "bg-gray-50 border-gray-200"
      )}>
        <h3 className="font-semibold mb-3">معاينة المحتوى</h3>
        <div 
          className="prose prose-sm dark:prose-invert max-h-40 overflow-y-auto"
          dangerouslySetInnerHTML={{ __html: formData.content || '<p>لا يوجد محتوى</p>' }}
        />
      </div>

      {/* تحذيرات */}
      {!isReadyToPublish && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className={cn(
            "p-4 rounded-lg border",
            darkMode
              ? "bg-red-900/20 border-red-800"
              : "bg-red-50 border-red-200"
          )}
        >
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
            <div>
              <p className="font-medium text-red-800 dark:text-red-200 mb-2">
                لا يمكن نشر المقال
              </p>
              <ul className="text-sm text-red-700 dark:text-red-300 space-y-1">
                {!formData.title && <li>• العنوان مطلوب</li>}
                {!formData.excerpt && <li>• الموجز مطلوب</li>}
                {!formData.content && <li>• المحتوى مطلوب</li>}
                {!formData.authorId && <li>• يجب اختيار الكاتب</li>}
                {!formData.categoryId && <li>• يجب اختيار التصنيف</li>}
              </ul>
            </div>
          </div>
        </motion.div>
      )}

      {/* أزرار الإجراءات */}
      <div className="flex gap-4 justify-center">
        <button
          onClick={onSaveDraft}
          className={cn(
            "px-8 py-3 rounded-lg font-medium transition-all duration-200 flex items-center gap-2",
            darkMode
              ? "bg-gray-700 hover:bg-gray-600 text-white"
              : "bg-gray-200 hover:bg-gray-300 text-gray-700"
          )}
        >
          <Save className="w-5 h-5" />
          حفظ كمسودة
        </button>

        <button
          onClick={onPublish}
          disabled={!isReadyToPublish}
          className={cn(
            "px-8 py-3 rounded-lg font-medium transition-all duration-200 flex items-center gap-2",
            isReadyToPublish
              ? "bg-blue-600 hover:bg-blue-700 text-white"
              : "bg-gray-300 dark:bg-gray-700 text-gray-500 cursor-not-allowed"
          )}
        >
          <Send className="w-5 h-5" />
          نشر المقال
        </button>
      </div>

      {/* معلومات إضافية */}
      <div className="text-center text-sm text-gray-500 dark:text-gray-400">
        <p>يمكنك دائماً تعديل المقال بعد النشر من لوحة التحكم</p>
      </div>
    </motion.div>
  );
});

ReviewStepEnhanced.displayName = 'ReviewStepEnhanced';

export default ReviewStepEnhanced; 