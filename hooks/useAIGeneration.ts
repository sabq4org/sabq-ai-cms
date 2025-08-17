"use client";

import { useState, useCallback } from 'react';
import toast from 'react-hot-toast';

interface AIGenerationOptions {
  title: string;
  content: string;
  onProgress?: (progress: number) => void;
  onSuccess?: (result: any) => void;
  onError?: (error: string) => void;
}

interface AIGenerationResult {
  summary: string;
  quotes: string[];
  tags: string[];
  readingTime: number;
  aiScore: number;
}

interface UseAIGenerationReturn {
  generating: boolean;
  progress: number;
  error: string | null;
  result: AIGenerationResult | null;
  generateContent: (options: AIGenerationOptions) => Promise<AIGenerationResult>;
  generateMetadata: (title: string, content: string) => Promise<any>;
  generateTitles: (content: string) => Promise<string[]>;
  reset: () => void;
}

export const useAIGeneration = (): UseAIGenerationReturn => {
  const [generating, setGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AIGenerationResult | null>(null);

  // توليد محتوى ذكي شامل
  const generateContent = useCallback(async (options: AIGenerationOptions): Promise<AIGenerationResult> => {
    const { title, content, onProgress, onSuccess, onError } = options;
    
    try {
      setGenerating(true);
      setProgress(0);
      setError(null);
      setResult(null);

      // التحقق من البيانات
      if (!title || !content) {
        throw new Error('العنوان والمحتوى مطلوبان');
      }

      if (content.length < 100) {
        throw new Error('المحتوى قصير جداً لتوليد محتوى ذكي مفيد');
      }

      onProgress?.(20);

      console.log('🤖 بدء توليد المحتوى الذكي...', {
        titleLength: title.length,
        contentLength: content.length
      });

      // استدعاء API التوليد
      const response = await fetch('/api/admin/articles/generate-ai-content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title, content })
      });

      onProgress?.(60);

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        
        // في حالة الخطأ، استخدم المحتوى الاحتياطي إذا كان متوفراً
        if (errorData?.fallback) {
          console.warn('⚠️ استخدام المحتوى الاحتياطي بسبب خطأ في التوليد');
          onProgress?.(100);
          
          const fallbackResult: AIGenerationResult = {
            summary: errorData.fallback.summary || `ملخص تلقائي: ${title}`,
            quotes: errorData.fallback.quotes || [],
            tags: errorData.fallback.tags || [],
            readingTime: errorData.fallback.readingTime || Math.ceil(content.length / 1000),
            aiScore: errorData.fallback.aiScore || 50
          };
          
          setResult(fallbackResult);
          onSuccess?.(fallbackResult);
          toast.success('تم استخدام المحتوى الاحتياطي نظراً لمشكلة في التوليد الذكي');
          
          return fallbackResult;
        }
        
        const errorMessage = errorData?.error || 
                           errorData?.message || 
                           `HTTP ${response.status}: ${response.statusText}`;
        throw new Error(errorMessage);
      }

      const data = await response.json();
      onProgress?.(100);

      if (!data.success) {
        throw new Error(data.error || 'فشل في توليد المحتوى');
      }

      const generatedResult: AIGenerationResult = data.content;
      
      console.log('✅ تم توليد المحتوى بنجاح:', {
        summaryLength: generatedResult.summary.length,
        quotesCount: generatedResult.quotes.length,
        tagsCount: generatedResult.tags.length,
        readingTime: generatedResult.readingTime,
        aiScore: generatedResult.aiScore
      });

      setResult(generatedResult);
      onSuccess?.(generatedResult);
      toast.success('تم توليد المحتوى الذكي بنجاح!');

      return generatedResult;

    } catch (error: any) {
      console.error('❌ خطأ في توليد المحتوى:', error);
      
      const errorMessage = error?.message || 'خطأ غير معروف في التوليد';
      setError(errorMessage);
      
      // محاولة إنشاء محتوى احتياطي بسيط
      const fallbackResult: AIGenerationResult = {
        summary: `ملخص تلقائي: ${title}. ${content.substring(0, 200)}...`,
        quotes: [],
        tags: title.split(' ').filter(word => word.length > 3).slice(0, 5),
        readingTime: Math.ceil(content.length / 1000) || 1,
        aiScore: 25
      };
      
      setResult(fallbackResult);
      onError?.(errorMessage);
      toast.error(`فشل التوليد الذكي: ${errorMessage}. تم استخدام محتوى احتياطي.`);
      
      return fallbackResult;
    } finally {
      setGenerating(false);
      setProgress(0);
    }
  }, []);

  // توليد metadata
  const generateMetadata = useCallback(async (title: string, content: string): Promise<any> => {
    try {
      setGenerating(true);
      setError(null);

      const response = await fetch('/api/ai/generate-metadata', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title, content })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const result = await response.json();
      
      toast.success('تم توليد البيانات الوصفية بنجاح!');
      return result;

    } catch (error: any) {
      const errorMessage = error?.message || 'خطأ في توليد البيانات الوصفية';
      setError(errorMessage);
      toast.error(errorMessage);
      throw error;
    } finally {
      setGenerating(false);
    }
  }, []);

  // توليد عناوين بديلة
  const generateTitles = useCallback(async (content: string): Promise<string[]> => {
    try {
      setGenerating(true);
      setError(null);

      const response = await fetch('/api/ai/generate-titles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const result = await response.json();
      
      toast.success('تم توليد العناوين البديلة بنجاح!');
      return result.titles || [];

    } catch (error: any) {
      const errorMessage = error?.message || 'خطأ في توليد العناوين';
      setError(errorMessage);
      toast.error(errorMessage);
      throw error;
    } finally {
      setGenerating(false);
    }
  }, []);

  // إعادة تعيين الحالة
  const reset = useCallback(() => {
    setGenerating(false);
    setProgress(0);
    setError(null);
    setResult(null);
  }, []);

  return {
    generating,
    progress,
    error,
    result,
    generateContent,
    generateMetadata,
    generateTitles,
    reset
  };
};

export default useAIGeneration;
