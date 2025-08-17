'use client';

import React, { useState, useCallback, useEffect, memo } from 'react';
import { Search, Hash, FileText, Target, TrendingUp, AlertCircle, Sparkles, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface SEOStepEnhancedProps {
  formData: {
    seoTitle: string;
    seoDescription: string;
    keywords: string[];
    title: string;
    excerpt: string;
    content?: string;
  };
  setFormData: React.Dispatch<React.SetStateAction<any>>;
  darkMode: boolean;
  isAILoading: boolean;
  setIsAILoading: React.Dispatch<React.SetStateAction<boolean>>;
}

const SEOStepEnhanced = memo(({ formData, setFormData, darkMode, isAILoading, setIsAILoading }: SEOStepEnhancedProps) => {
  const [keywordInput, setKeywordInput] = useState('');
  const [seoScore, setSeoScore] = useState(0);
  const [seoAnalysis, setSeoAnalysis] = useState<{ good: string[]; improve: string[] }>({ good: [], improve: [] });

  // حساب نقاط SEO
  const calculateSEOScore = useCallback(() => {
    let score = 0;
    const analysis = { good: [] as string[], improve: [] as string[] };

    // تحليل العنوان
    const titleLength = formData.seoTitle.length || formData.title.length;
    if (titleLength >= 30 && titleLength <= 60) {
      score += 20;
      analysis.good.push('طول العنوان مثالي');
    } else if (titleLength > 0) {
      score += 10;
      analysis.improve.push(titleLength < 30 ? 'العنوان قصير جداً (أضف المزيد)' : 'العنوان طويل جداً (اختصر)');
    } else {
      analysis.improve.push('أضف عنوان SEO');
    }

    // تحليل الوصف
    const descLength = formData.seoDescription.length || formData.excerpt.length;
    if (descLength >= 120 && descLength <= 160) {
      score += 20;
      analysis.good.push('طول الوصف مثالي');
    } else if (descLength > 0) {
      score += 10;
      analysis.improve.push(descLength < 120 ? 'الوصف قصير جداً' : 'الوصف طويل جداً');
    } else {
      analysis.improve.push('أضف وصف SEO');
    }

    // تحليل الكلمات المفتاحية
    if (formData.keywords.length >= 3 && formData.keywords.length <= 7) {
      score += 20;
      analysis.good.push('عدد الكلمات المفتاحية ممتاز');
    } else if (formData.keywords.length > 0) {
      score += 10;
      analysis.improve.push(formData.keywords.length < 3 ? 'أضف المزيد من الكلمات المفتاحية' : 'كثير من الكلمات المفتاحية');
    } else {
      analysis.improve.push('أضف كلمات مفتاحية');
    }

    // تحقق من وجود كلمة مفتاحية في العنوان
    if (formData.keywords.length > 0 && (formData.seoTitle || formData.title)) {
      const titleText = (formData.seoTitle || formData.title).toLowerCase();
      const hasKeywordInTitle = formData.keywords.some(kw => titleText.includes(kw.toLowerCase()));
      if (hasKeywordInTitle) {
        score += 20;
        analysis.good.push('الكلمة المفتاحية موجودة في العنوان');
      } else {
        analysis.improve.push('أضف كلمة مفتاحية في العنوان');
      }
    }

    // تحقق من وجود كلمة مفتاحية في الوصف
    if (formData.keywords.length > 0 && (formData.seoDescription || formData.excerpt)) {
      const descText = (formData.seoDescription || formData.excerpt).toLowerCase();
      const hasKeywordInDesc = formData.keywords.some(kw => descText.includes(kw.toLowerCase()));
      if (hasKeywordInDesc) {
        score += 20;
        analysis.good.push('الكلمة المفتاحية موجودة في الوصف');
      } else {
        analysis.improve.push('أضف كلمة مفتاحية في الوصف');
      }
    }

    setSeoScore(score);
    setSeoAnalysis(analysis);
  }, [formData]);

  useEffect(() => {
    calculateSEOScore();
  }, [formData, calculateSEOScore]);

  // إضافة كلمة مفتاحية
  const addKeyword = useCallback(() => {
    const trimmed = keywordInput.trim();
    if (trimmed && !formData.keywords.includes(trimmed)) {
      setFormData((prev: any) => ({
        ...prev,
        keywords: [...prev.keywords, trimmed]
      }));
      setKeywordInput('');
    }
  }, [keywordInput, formData.keywords, setFormData]);

  // حذف كلمة مفتاحية
  const removeKeyword = useCallback((keyword: string) => {
    setFormData((prev: any) => ({
      ...prev,
      keywords: prev.keywords.filter((k: string) => k !== keyword)
    }));
  }, [setFormData]);

  // اقتراح SEO بالذكاء الاصطناعي
  const suggestSEO = useCallback(async () => {
    if (isAILoading || (!formData.title && !formData.excerpt)) return;

    setIsAILoading(true);
    try {
      const response = await fetch('/api/ai/suggest-seo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title,
          excerpt: formData.excerpt,
          content: formData.content
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.seoTitle) {
          setFormData((prev: any) => ({ ...prev, seoTitle: data.seoTitle }));
        }
        if (data.seoDescription) {
          setFormData((prev: any) => ({ ...prev, seoDescription: data.seoDescription }));
        }
        if (data.keywords?.length > 0) {
          setFormData((prev: any) => ({ ...prev, keywords: data.keywords }));
        }
      }
    } catch (error) {
      console.error('SEO suggestion error:', error);
    } finally {
      setIsAILoading(false);
    }
  }, [formData, isAILoading, setFormData, setIsAILoading]);

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* نقاط SEO */}
      <div className={cn(
        "p-6 rounded-lg border text-center",
        darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
      )}>
        <TrendingUp className="w-12 h-12 mx-auto mb-3 text-gray-400" />
        <div className={cn("text-4xl font-bold mb-2", getScoreColor(seoScore))}>
          {seoScore}%
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400">نقاط تحسين محركات البحث</p>
      </div>

      {/* زر اقتراح AI */}
      <button
        onClick={suggestSEO}
        disabled={isAILoading || (!formData.title && !formData.excerpt)}
        className={cn(
          "w-full px-4 py-3 rounded-lg transition-all duration-200 flex items-center justify-center gap-2",
          "font-medium",
          formData.title || formData.excerpt
            ? "bg-blue-600 hover:bg-blue-700 text-white"
            : "bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed"
        )}
      >
        {isAILoading ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <Sparkles className="w-5 h-5" />
        )}
        اقتراح تحسينات SEO بالذكاء الاصطناعي
      </button>

      {/* عنوان SEO */}
      <div>
        <label className="block text-sm font-medium mb-2 flex items-center gap-2">
          <FileText className="w-4 h-4" />
          عنوان SEO
        </label>
        <input
          type="text"
          value={formData.seoTitle}
          onChange={(e) => setFormData((prev: any) => ({ ...prev, seoTitle: e.target.value }))}
          placeholder={formData.title || "أدخل عنوان محسّن لمحركات البحث"}
          className={cn(
            "w-full px-4 py-3 border rounded-lg",
            "focus:outline-none focus:ring-2 focus:ring-blue-500",
            darkMode
              ? "bg-gray-800 border-gray-700 text-white placeholder-gray-500"
              : "bg-white border-gray-300 text-gray-900 placeholder-gray-400"
          )}
        />
        <div className="mt-1 text-sm text-gray-500">
          {formData.seoTitle.length || formData.title.length} / 60 حرف
        </div>
      </div>

      {/* وصف SEO */}
      <div>
        <label className="block text-sm font-medium mb-2 flex items-center gap-2">
          <Target className="w-4 h-4" />
          وصف SEO
        </label>
        <textarea
          value={formData.seoDescription}
          onChange={(e) => setFormData((prev: any) => ({ ...prev, seoDescription: e.target.value }))}
          placeholder={formData.excerpt || "أدخل وصف محسّن لمحركات البحث"}
          rows={3}
          className={cn(
            "w-full px-4 py-3 border rounded-lg resize-none",
            "focus:outline-none focus:ring-2 focus:ring-blue-500",
            darkMode
              ? "bg-gray-800 border-gray-700 text-white placeholder-gray-500"
              : "bg-white border-gray-300 text-gray-900 placeholder-gray-400"
          )}
        />
        <div className="mt-1 text-sm text-gray-500">
          {formData.seoDescription.length || formData.excerpt.length} / 160 حرف
        </div>
      </div>

      {/* الكلمات المفتاحية */}
      <div>
        <label className="block text-sm font-medium mb-2 flex items-center gap-2">
          <Hash className="w-4 h-4" />
          الكلمات المفتاحية
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={keywordInput}
            onChange={(e) => setKeywordInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addKeyword())}
            placeholder="أضف كلمة مفتاحية واضغط Enter"
            className={cn(
              "flex-1 px-4 py-3 border rounded-lg",
              "focus:outline-none focus:ring-2 focus:ring-blue-500",
              darkMode
                ? "bg-gray-800 border-gray-700 text-white"
                : "bg-white border-gray-300 text-gray-900"
            )}
          />
          <button
            onClick={addKeyword}
            className="px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
          >
            إضافة
          </button>
        </div>

        {/* عرض الكلمات المفتاحية */}
        {formData.keywords.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {formData.keywords.map((keyword: string, index: number) => (
              <motion.span
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className={cn(
                  "inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm",
                  darkMode
                    ? "bg-gray-700 text-gray-200"
                    : "bg-gray-200 text-gray-700"
                )}
              >
                {keyword}
                <button
                  onClick={() => removeKeyword(keyword)}
                  className="hover:text-red-500 transition-colors"
                >
                  ×
                </button>
              </motion.span>
            ))}
          </div>
        )}
      </div>

      {/* معاينة نتائج البحث */}
      <div>
        <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
          <Search className="w-4 h-4" />
          معاينة نتائج البحث
        </h3>
        <div className={cn(
          "p-4 rounded-lg border",
          darkMode ? "bg-gray-800 border-gray-700" : "bg-gray-50 border-gray-200"
        )}>
          <h4 className="text-blue-600 hover:underline cursor-pointer text-lg mb-1">
            {formData.seoTitle || formData.title || 'عنوان المقال'}
          </h4>
          <p className="text-green-700 dark:text-green-400 text-sm mb-1">
            sabq.org › article › {new Date().getFullYear()}
          </p>
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            {formData.seoDescription || formData.excerpt || 'وصف المقال سيظهر هنا...'}
          </p>
        </div>
      </div>

      {/* تحليل SEO */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* النقاط الجيدة */}
        {seoAnalysis.good.length > 0 && (
          <div className={cn(
            "p-4 rounded-lg border",
            darkMode
              ? "bg-green-900/20 border-green-800"
              : "bg-green-50 border-green-200"
          )}>
            <h4 className="font-medium text-green-800 dark:text-green-200 mb-2">
              نقاط جيدة ✓
            </h4>
            <ul className="text-sm text-green-700 dark:text-green-300 space-y-1">
              {seoAnalysis.good.map((point, index) => (
                <li key={index}>• {point}</li>
              ))}
            </ul>
          </div>
        )}

        {/* نقاط التحسين */}
        {seoAnalysis.improve.length > 0 && (
          <div className={cn(
            "p-4 rounded-lg border",
            darkMode
              ? "bg-yellow-900/20 border-yellow-800"
              : "bg-yellow-50 border-yellow-200"
          )}>
            <h4 className="font-medium text-yellow-800 dark:text-yellow-200 mb-2 flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              يحتاج تحسين
            </h4>
            <ul className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
              {seoAnalysis.improve.map((point, index) => (
                <li key={index}>• {point}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </motion.div>
  );
});

SEOStepEnhanced.displayName = 'SEOStepEnhanced';

export default SEOStepEnhanced; 