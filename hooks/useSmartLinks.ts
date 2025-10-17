'use client';

/**
 * 🔗 Hook لإدارة الروابط الذكية
 * 
 * يوفر واجهة سهلة للتعامل مع نظام الروابط الذكية:
 * - تحليل المقالات
 * - إدارة الاقتراحات
 * - إدراج الروابط
 * - إنشاء صفحات الكيانات
 * 
 * @version 1.0.0
 */

import { useState, useCallback, useEffect } from 'react';
import { toast } from 'react-hot-toast';

// ========================================
// Types
// ========================================

interface LinkSuggestion {
  id?: string;
  text: string;
  normalized: string;
  type: string;
  position: number;
  endPosition: number;
  context: string;
  confidence: number;
  suggestedUrl?: string;
  suggestedEntity?: {
    title: string;
    description?: string;
    sourceType: string;
  };
  action: 'auto' | 'suggest' | 'skip';
  reason: string;
}

interface AnalysisResult {
  articleId: string;
  entities: any[];
  suggestions: LinkSuggestion[];
  stats: {
    totalEntities: number;
    autoInsert: number;
    suggested: number;
    skipped: number;
    processingTime: number;
    cost?: number;
  };
}

interface UseSmartLinksOptions {
  articleId: string;
  autoAnalyze?: boolean;
  onAnalysisComplete?: (result: AnalysisResult) => void;
  onLinkInserted?: (count: number) => void;
  onError?: (error: Error) => void;
}

interface UseSmartLinksReturn {
  // State
  isAnalyzing: boolean;
  isInserting: boolean;
  suggestions: LinkSuggestion[];
  acceptedSuggestions: LinkSuggestion[];
  rejectedSuggestions: LinkSuggestion[];
  analysisResult: AnalysisResult | null;
  error: Error | null;

  // Actions
  analyzeArticle: (content: string) => Promise<void>;
  acceptSuggestion: (suggestion: LinkSuggestion) => void;
  rejectSuggestion: (suggestion: LinkSuggestion) => void;
  acceptAllSuggestions: () => void;
  insertAcceptedLinks: () => Promise<void>;
  createEntityPage: (suggestion: LinkSuggestion) => Promise<void>;
  reset: () => void;

  // Computed
  stats: {
    total: number;
    accepted: number;
    rejected: number;
    pending: number;
    avgConfidence: number;
  };
}

// ========================================
// Hook
// ========================================

export function useSmartLinks({
  articleId,
  autoAnalyze = false,
  onAnalysisComplete,
  onLinkInserted,
  onError
}: UseSmartLinksOptions): UseSmartLinksReturn {
  // State
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isInserting, setIsInserting] = useState(false);
  const [suggestions, setSuggestions] = useState<LinkSuggestion[]>([]);
  const [acceptedSuggestions, setAcceptedSuggestions] = useState<LinkSuggestion[]>([]);
  const [rejectedSuggestions, setRejectedSuggestions] = useState<LinkSuggestion[]>([]);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<Error | null>(null);

  /**
   * تحليل المقال واستخراج الكيانات
   */
  const analyzeArticle = useCallback(async (content: string) => {
    if (!content || content.trim().length === 0) {
      toast.error('المحتوى فارغ');
      return;
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      const response = await fetch('/api/smart-links/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          articleId,
          content
        })
      });

      if (!response.ok) {
        throw new Error('فشل تحليل المقال');
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'خطأ في التحليل');
      }

      const result = data.data as AnalysisResult;
      
      setAnalysisResult(result);
      setSuggestions(result.suggestions);
      
      toast.success(`تم العثور على ${result.suggestions.length} اقتراح`);
      
      if (onAnalysisComplete) {
        onAnalysisComplete(result);
      }

    } catch (err) {
      const error = err instanceof Error ? err : new Error('خطأ غير معروف');
      setError(error);
      toast.error(error.message);
      
      if (onError) {
        onError(error);
      }
    } finally {
      setIsAnalyzing(false);
    }
  }, [articleId, onAnalysisComplete, onError]);

  /**
   * قبول اقتراح
   */
  const acceptSuggestion = useCallback((suggestion: LinkSuggestion) => {
    setAcceptedSuggestions(prev => {
      // تجنب التكرار
      if (prev.some(s => s.position === suggestion.position)) {
        return prev;
      }
      return [...prev, suggestion];
    });

    setSuggestions(prev => 
      prev.filter(s => s.position !== suggestion.position)
    );

    toast.success(`تم قبول "${suggestion.text}"`);
  }, []);

  /**
   * رفض اقتراح
   */
  const rejectSuggestion = useCallback((suggestion: LinkSuggestion) => {
    setRejectedSuggestions(prev => [...prev, suggestion]);
    setSuggestions(prev => 
      prev.filter(s => s.position !== suggestion.position)
    );

    toast.info(`تم رفض "${suggestion.text}"`);
  }, []);

  /**
   * قبول جميع الاقتراحات
   */
  const acceptAllSuggestions = useCallback(() => {
    setAcceptedSuggestions(prev => [...prev, ...suggestions]);
    setSuggestions([]);
    toast.success(`تم قبول ${suggestions.length} اقتراح`);
  }, [suggestions]);

  /**
   * إدراج الروابط المقبولة
   */
  const insertAcceptedLinks = useCallback(async () => {
    if (acceptedSuggestions.length === 0) {
      toast.error('لا توجد روابط مقبولة للإدراج');
      return;
    }

    setIsInserting(true);

    try {
      const mentions = acceptedSuggestions.map(s => ({
        start: s.position,
        end: s.endPosition,
        linkType: 'INTERNAL',
        linkUrl: s.suggestedUrl || '',
        text: s.text,
        normalized: s.normalized,
        confidence: s.confidence
      }));

      const response = await fetch('/api/smart-links/insert', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          articleId,
          mentions
        })
      });

      if (!response.ok) {
        throw new Error('فشل إدراج الروابط');
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'خطأ في الإدراج');
      }

      toast.success(`تم إدراج ${data.insertedCount} رابط بنجاح`);
      
      // إعادة تعيين الاقتراحات المقبولة
      setAcceptedSuggestions([]);

      if (onLinkInserted) {
        onLinkInserted(data.insertedCount);
      }

    } catch (err) {
      const error = err instanceof Error ? err : new Error('خطأ غير معروف');
      toast.error(error.message);
      
      if (onError) {
        onError(error);
      }
    } finally {
      setIsInserting(false);
    }
  }, [articleId, acceptedSuggestions, onLinkInserted, onError]);

  /**
   * إنشاء صفحة كيان
   */
  const createEntityPage = useCallback(async (suggestion: LinkSuggestion) => {
    try {
      toast.loading('جاري إنشاء صفحة الكيان...');

      // أولاً: قبول الاقتراح
      acceptSuggestion(suggestion);

      // ثانياً: إنشاء الصفحة (سيتم تنفيذه لاحقاً)
      // const response = await fetch('/api/smart-entities/create-page', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json'
      //   },
      //   body: JSON.stringify({
      //     entityId: suggestion.suggestedEntity?.id
      //   })
      // });

      toast.dismiss();
      toast.success(`تم قبول "${suggestion.text}" وسيتم إنشاء الصفحة`);

    } catch (err) {
      toast.dismiss();
      const error = err instanceof Error ? err : new Error('خطأ غير معروف');
      toast.error(error.message);
      
      if (onError) {
        onError(error);
      }
    }
  }, [acceptSuggestion, onError]);

  /**
   * إعادة تعيين
   */
  const reset = useCallback(() => {
    setSuggestions([]);
    setAcceptedSuggestions([]);
    setRejectedSuggestions([]);
    setAnalysisResult(null);
    setError(null);
  }, []);

  // Computed values
  const stats = {
    total: suggestions.length + acceptedSuggestions.length + rejectedSuggestions.length,
    accepted: acceptedSuggestions.length,
    rejected: rejectedSuggestions.length,
    pending: suggestions.length,
    avgConfidence: suggestions.length > 0
      ? suggestions.reduce((sum, s) => sum + s.confidence, 0) / suggestions.length
      : 0
  };

  return {
    // State
    isAnalyzing,
    isInserting,
    suggestions,
    acceptedSuggestions,
    rejectedSuggestions,
    analysisResult,
    error,

    // Actions
    analyzeArticle,
    acceptSuggestion,
    rejectSuggestion,
    acceptAllSuggestions,
    insertAcceptedLinks,
    createEntityPage,
    reset,

    // Computed
    stats
  };
}

export default useSmartLinks;

