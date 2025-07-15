'use client';

import React, { useState, useCallback, memo } from 'react';
import { FileText, User, Tag, AlertCircle, Sparkles, Loader2, Type } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface BasicInfoStepEnhancedProps {
  formData: {
    title: string;
    subtitle: string;
    excerpt: string;
    authorId: string;
    categoryId: string;
  };
  setFormData: React.Dispatch<React.SetStateAction<any>>;
  categories: Array<{ id: string; name: string; name_ar?: string; color?: string }>;
  authors: Array<{ id: string; name: string; avatar?: string }>;
  darkMode: boolean;
  isAILoading: boolean;
  setIsAILoading: React.Dispatch<React.SetStateAction<boolean>>;
}

// مكون محسن للأداء
const BasicInfoStepEnhanced = memo(({ 
  formData, 
  setFormData, 
  categories, 
  authors,
  darkMode,
  isAILoading,
  setIsAILoading
}: BasicInfoStepEnhancedProps) => {
  const [titleFocused, setTitleFocused] = useState(false);
  const [excerptFocused, setExcerptFocused] = useState(false);

  // تحليل جودة الموجز
  const analyzeExcerpt = useCallback((text: string) => {
    const length = text.trim().length;
    if (length === 0) return { quality: 'empty', color: 'gray', message: 'أدخل موجز المقال' };
    if (length < 50) return { quality: 'poor', color: 'red', message: 'موجز قصير جداً' };
    if (length > 160) return { quality: 'poor', color: 'red', message: 'موجز طويل جداً' };
    if (length >= 100 && length <= 140) return { quality: 'excellent', color: 'green', message: 'ممتاز!' };
    return { quality: 'good', color: 'yellow', message: 'جيد' };
  }, []);

  const excerptAnalysis = analyzeExcerpt(formData.excerpt);

  // اقتراح عناوين بالذكاء الاصطناعي
  const suggestTitles = useCallback(async () => {
    if (!formData.excerpt.trim() || isAILoading) return;
    
    setIsAILoading(true);
    try {
      const response = await fetch('/api/ai/suggest-titles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ excerpt: formData.excerpt })
      });
      
      if (response.ok) {
        const data = await response.json();
        // تطبيق اقتراحات AI
                  if (data.titles?.length > 0) {
            setFormData((prev: any) => ({ ...prev, title: data.titles[0] }));
          }
      }
    } catch (error) {
      console.error('AI suggestion error:', error);
    } finally {
      setIsAILoading(false);
    }
  }, [formData.excerpt, isAILoading, setFormData, setIsAILoading]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* العنوان الرئيسي */}
      <div className="relative">
        <label className={cn(
          "absolute right-3 transition-all duration-200 pointer-events-none",
          titleFocused || formData.title
            ? "-top-2 text-xs bg-white dark:bg-gray-800 px-1"
            : "top-3 text-sm",
          titleFocused ? "text-blue-600" : "text-gray-500"
        )}>
          العنوان الرئيسي
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData((prev: any) => ({ ...prev, title: e.target.value }))}
            onFocus={() => setTitleFocused(true)}
            onBlur={() => setTitleFocused(false)}
            className={cn(
              "flex-1 px-4 py-3 border rounded-lg transition-all duration-200",
              "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent",
              darkMode 
                ? "bg-gray-800 border-gray-700 text-white" 
                : "bg-white border-gray-300 text-gray-900"
            )}
            placeholder=" "
            required
          />
          <button
            type="button"
            onClick={suggestTitles}
            disabled={!formData.excerpt.trim() || isAILoading}
            className={cn(
              "px-4 py-3 rounded-lg transition-all duration-200",
              "flex items-center gap-2",
              formData.excerpt.trim() && !isAILoading
                ? "bg-blue-600 hover:bg-blue-700 text-white"
                : "bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed"
            )}
            title="اكتب الموجز أولاً لاقتراح عناوين"
          >
            {isAILoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4" />
            )}
            <span className="hidden sm:inline">اقتراح</span>
          </button>
        </div>
      </div>

      {/* العنوان الفرعي */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          العنوان الفرعي (اختياري)
        </label>
        <input
          type="text"
          value={formData.subtitle}
          onChange={(e) => setFormData((prev: any) => ({ ...prev, subtitle: e.target.value }))}
          className={cn(
            "w-full px-4 py-3 border rounded-lg transition-all duration-200",
            "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent",
            darkMode 
              ? "bg-gray-800 border-gray-700 text-white" 
              : "bg-white border-gray-300 text-gray-900"
          )}
          placeholder="أضف عنواناً فرعياً توضيحياً"
        />
      </div>

      {/* الموجز */}
      <div className="relative">
        <label className={cn(
          "absolute right-3 transition-all duration-200 pointer-events-none z-10",
          excerptFocused || formData.excerpt
            ? "-top-2 text-xs bg-white dark:bg-gray-800 px-1"
            : "top-3 text-sm",
          excerptFocused ? "text-blue-600" : "text-gray-500"
        )}>
          الموجز / Lead
        </label>
        <textarea
          value={formData.excerpt}
          onChange={(e) => setFormData((prev: any) => ({ ...prev, excerpt: e.target.value }))}
          onFocus={() => setExcerptFocused(true)}
          onBlur={() => setExcerptFocused(false)}
          rows={3}
          className={cn(
            "w-full px-4 py-3 border rounded-lg transition-all duration-200 resize-none",
            "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent",
            darkMode 
              ? "bg-gray-800 border-gray-700 text-white" 
              : "bg-white border-gray-300 text-gray-900"
          )}
          placeholder=" "
          required
        />
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center gap-2">
            <div className={cn(
              "w-2 h-2 rounded-full",
              excerptAnalysis.color === 'green' && "bg-green-500",
              excerptAnalysis.color === 'yellow' && "bg-yellow-500",
              excerptAnalysis.color === 'red' && "bg-red-500",
              excerptAnalysis.color === 'gray' && "bg-gray-400"
            )} />
            <span className={cn(
              "text-sm",
              excerptAnalysis.color === 'green' && "text-green-600 dark:text-green-400",
              excerptAnalysis.color === 'yellow' && "text-yellow-600 dark:text-yellow-400",
              excerptAnalysis.color === 'red' && "text-red-600 dark:text-red-400",
              excerptAnalysis.color === 'gray' && "text-gray-500"
            )}>
              {excerptAnalysis.message}
            </span>
          </div>
          <span className="text-sm text-gray-500">
            {formData.excerpt.length} / 140
          </span>
        </div>
      </div>

      {/* التصنيف والكاتب */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* التصنيف */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            <Tag className="w-4 h-4 inline ml-1" />
            التصنيف
          </label>
          <select
            value={formData.categoryId}
            onChange={(e) => setFormData((prev: any) => ({ ...prev, categoryId: e.target.value }))}
            className={cn(
              "w-full px-4 py-3 border rounded-lg transition-all duration-200",
              "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent",
              darkMode 
                ? "bg-gray-800 border-gray-700 text-white" 
                : "bg-white border-gray-300 text-gray-900"
            )}
            required
          >
            <option value="">اختر التصنيف</option>
            {categories.map(category => (
              <option key={category.id} value={category.id}>
                {category.name_ar || category.name}
              </option>
            ))}
          </select>
        </div>

        {/* الكاتب */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            <User className="w-4 h-4 inline ml-1" />
            الكاتب / المراسل
          </label>
          <select
            value={formData.authorId}
            onChange={(e) => setFormData((prev: any) => ({ ...prev, authorId: e.target.value }))}
            className={cn(
              "w-full px-4 py-3 border rounded-lg transition-all duration-200",
              "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent",
              darkMode 
                ? "bg-gray-800 border-gray-700 text-white" 
                : "bg-white border-gray-300 text-gray-900"
            )}
            required
          >
            <option value="">اختر الكاتب</option>
            {authors.map(author => (
              <option key={author.id} value={author.id}>
                {author.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* نصائح سريعة */}
      <div className={cn(
        "p-4 rounded-lg border",
        darkMode 
          ? "bg-gray-800/50 border-gray-700" 
          : "bg-blue-50 border-blue-200"
      )}>
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
          <div className="space-y-1">
            <p className="text-sm font-medium text-blue-900 dark:text-blue-200">
              نصائح لكتابة موجز فعّال:
            </p>
            <ul className="text-sm text-blue-800 dark:text-blue-300 space-y-0.5">
              <li>• اكتب بين 100-140 حرف للحصول على أفضل نتيجة</li>
              <li>• ابدأ بالمعلومة الأهم وتجنب التفاصيل الزائدة</li>
              <li>• استخدم لغة واضحة ومباشرة</li>
            </ul>
          </div>
        </div>
      </div>
    </motion.div>
  );
});

BasicInfoStepEnhanced.displayName = 'BasicInfoStepEnhanced';

export default BasicInfoStepEnhanced; 