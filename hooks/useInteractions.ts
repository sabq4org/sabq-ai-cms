import { useState, useCallback, useEffect } from 'react';

interface InteractionOptions {
  userId: string;
  articleId: string;
  interactionType: 'view' | 'read' | 'like' | 'share' | 'comment' | 'save';
  duration?: number;
  completed?: boolean;
  device?: string;
  source?: string;
}

export function useInteractions() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // إدارة الحالة المحلية للتفاعلات
  const [localLikes, setLocalLikes] = useState<string[]>([]);
  const [localSaves, setLocalSaves] = useState<string[]>([]);

  // تحميل التفاعلات المحلية من localStorage عند بدء التشغيل
  useEffect(() => {
    try {
      const savedLikes = localStorage.getItem('local_likes');
      const savedSaves = localStorage.getItem('local_saves');
      if (savedLikes) {
        setLocalLikes(JSON.parse(savedLikes));
      }
      if (savedSaves) {
        setLocalSaves(JSON.parse(savedSaves));
      }
    } catch (e) {
      console.error("Failed to load local interactions:", e);
    }
  }, []);

  // دالة لتبديل الإعجاب
  const toggleLike = useCallback((id: string) => {
    setLocalLikes(prevLikes => {
      const newLikes = prevLikes.includes(id)
        ? prevLikes.filter(likeId => likeId !== id)
        : [...prevLikes, id];
      localStorage.setItem('local_likes', JSON.stringify(newLikes));
      return newLikes;
    });
  }, []);

  // دالة لتبديل الحفظ
  const toggleSave = useCallback((id: string) => {
    setLocalSaves(prevSaves => {
      const newSaves = prevSaves.includes(id)
        ? prevSaves.filter(saveId => saveId !== id)
        : [...prevSaves, id];
      localStorage.setItem('local_saves', JSON.stringify(newSaves));
      return newSaves;
    });
  }, []);

  const recordInteraction = useCallback(async (options: InteractionOptions) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/interactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: options.userId,
          article_id: options.articleId,
          type: options.interactionType,
          duration: options.duration,
          completed: options.completed,
          device: options.device || 'web',
          source: options.source || 'website'
        })
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to record interaction');
      }

      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'حدث خطأ غير متوقع';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const trackReadingProgress = useCallback(async (
    userId: string,
    articleId: string,
    progress: number,
    duration: number
  ) => {
    // تسجيل بداية القراءة عند 0%
    if (progress === 0) {
      await recordInteraction({
        userId,
        articleId,
        interactionType: 'view',
        source: 'article_page'
      });
    }

    // تسجيل إكمال القراءة عند 80% أو أكثر
    if (progress >= 80) {
      await recordInteraction({
        userId,
        articleId,
        interactionType: 'read',
        duration,
        completed: true,
        source: 'article_page'
      });
    }
  }, [recordInteraction]);

  const getPersonalizedContent = useCallback(async (userId: string, limit: number = 10) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/content/personalized?user_id=${userId}&limit=${limit}`);
      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to get personalized content');
      }

      return data.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'حدث خطأ غير متوقع';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const analyzeUserBehavior = useCallback(async (userId: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/interactions?user_id=${userId}`);
      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to analyze behavior');
      }

      return data.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'حدث خطأ غير متوقع';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const calculateBehaviorRewards = useCallback(async (userId: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/interactions?user_id=${userId}&action=calculate_rewards`);
      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to calculate rewards');
      }

      return data.data.bonus_points;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'حدث خطأ غير متوقع';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    recordInteraction,
    trackReadingProgress,
    getPersonalizedContent,
    analyzeUserBehavior,
    calculateBehaviorRewards,
    localLikes,
    localSaves,
    toggleLike,
    toggleSave
  };
} 