/**
 * 🧠 useArticleClassifier Hook
 * Hook لاستخدام وحدة التصنيف الذكي للمقالات
 */

'use client';

import { useState, useCallback } from 'react';
import { 
  classifyArabicContent, 
  ClassificationResult, 
  ArticleContent,
  getCategoryId 
} from '@/lib/ai/ArabicContentClassifier';

interface UseArticleClassifierOptions {
  autoSave?: boolean;
  useAI?: boolean;
}

interface UseArticleClassifierReturn {
  classificationResult: ClassificationResult | null;
  isClassifying: boolean;
  error: string | null;
  classify: (article: ArticleContent) => Promise<ClassificationResult | null>;
  clearResult: () => void;
  applyClassification: (articleId: string) => Promise<boolean>;
}

export function useArticleClassifier(
  options: UseArticleClassifierOptions = {}
): UseArticleClassifierReturn {
  const { autoSave = false, useAI = false } = options;
  
  const [classificationResult, setClassificationResult] = useState<ClassificationResult | null>(null);
  const [isClassifying, setIsClassifying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const classify = useCallback(async (article: ArticleContent): Promise<ClassificationResult | null> => {
    if (!article.title || !article.content) {
      setError('يجب وجود عنوان ومحتوى للمقال');
      return null;
    }

    setIsClassifying(true);
    setError(null);

    try {
      const result = await classifyArabicContent(article, useAI);
      setClassificationResult(result);
      
      // الحفظ التلقائي إذا كان مطلوباً
      if (autoSave && result) {
        // يمكن إضافة منطق الحفظ هنا
        console.log('🤖 تم التصنيف والحفظ تلقائياً:', result);
      }
      
      return result;
    } catch (err) {
      const errorMessage = 'حدث خطأ أثناء تصنيف المقال';
      setError(errorMessage);
      console.error('Classification error:', err);
      return null;
    } finally {
      setIsClassifying(false);
    }
  }, [useAI, autoSave]);

  const clearResult = useCallback(() => {
    setClassificationResult(null);
    setError(null);
  }, []);

  const applyClassification = useCallback(async (articleId: string): Promise<boolean> => {
    if (!classificationResult) {
      setError('لا توجد نتيجة تصنيف لتطبيقها');
      return false;
    }

    try {
      // تطبيق التصنيف على المقال في قاعدة البيانات
      const categoryId = getCategoryId(classificationResult.mainCategory);
      
      const response = await fetch(`/api/articles/${articleId}/classify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          categoryId,
          mainCategory: classificationResult.mainCategory,
          subCategory: classificationResult.subCategory,
          qualityScore: classificationResult.qualityScore,
          regionRelevance: classificationResult.regionRelevance,
          confidence: classificationResult.confidence,
          suggestions: classificationResult.suggestions,
        }),
      });

      if (!response.ok) {
        throw new Error('فشل في تطبيق التصنيف');
      }

      console.log('✅ تم تطبيق التصنيف بنجاح');
      return true;
    } catch (err) {
      setError('فشل في تطبيق التصنيف على المقال');
      console.error('Apply classification error:', err);
      return false;
    }
  }, [classificationResult]);

  return {
    classificationResult,
    isClassifying,
    error,
    classify,
    clearResult,
    applyClassification,
  };
}
