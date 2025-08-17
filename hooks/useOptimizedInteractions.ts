'use client';

import { useState, useCallback, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

// أنواع البيانات
interface InteractionState {
  liked: boolean;
  saved: boolean;
  likesCount: number;
  savesCount: number;
  loading: boolean;
  error: string | null;
}

interface InteractionResponse {
  success: boolean;
  action?: string;
  data?: {
    liked: boolean;
    saved: boolean;
    likesCount: number;
    savesCount: number;
  };
  error?: string;
  error_code?: string;
  request_id?: string;
  duration?: string;
}

// خطاف محسن للتفاعلات مع معالجة شاملة للأخطاء
export function useOptimizedInteractions(articleId: string) {
  const { user } = useAuth();
  
  // الحالة الأساسية
  const [state, setState] = useState<InteractionState>({
    liked: false,
    saved: false,
    likesCount: 0,
    savesCount: 0,
    loading: false,
    error: null
  });

  // منع التفاعلات المتعددة المتزامنة
  const [isProcessing, setIsProcessing] = useState(false);
  
  // رقم طلب فريد لتتبع العمليات
  const [requestCounter, setRequestCounter] = useState(0);

  // جلب الحالة الحالية من الخادم
  const fetchState = useCallback(async () => {
    if (!user || !articleId) return;

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      console.log('🔍 جلب حالة التفاعل للمقال:', articleId);
      
      const response = await fetch(`/api/interactions/optimized?articleId=${articleId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`,
          'Content-Type': 'application/json'
        }
      });

      const data: InteractionResponse = await response.json();
      
      if (data.success && data.data) {
        setState({
          liked: data.data.liked,
          saved: data.data.saved,
          likesCount: data.data.likesCount,
          savesCount: data.data.savesCount,
          loading: false,
          error: null
        });
        
        console.log('✅ تم جلب حالة التفاعل بنجاح:', data.data);
      } else {
        throw new Error(data.error || 'فشل في جلب حالة التفاعل');
      }
    } catch (error) {
      console.error('❌ خطأ في جلب حالة التفاعل:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'خطأ غير معروف'
      }));
    }
  }, [user, articleId]);

  // جلب الحالة عند التحميل الأولي
  useEffect(() => {
    fetchState();
  }, [fetchState]);

  // دالة معالجة التفاعل العامة مع تحسينات الأداء
  const handleInteraction = useCallback(async (action: 'like' | 'save') => {
    if (!user || !articleId || isProcessing) {
      console.warn('⚠️ تفاعل مرفوض:', { user: !!user, articleId, isProcessing });
      return;
    }

    // منع الطلبات المتعددة
    setIsProcessing(true);
    setRequestCounter(prev => prev + 1);
    const currentRequest = requestCounter + 1;

    // حفظ الحالة السابقة للتراجع في حالة الفشل
    const previousState = { ...state };
    
    // تطبيق التغيير بشكل تفاؤلي للاستجابة السريعة
    setState(prev => {
      const newState = { ...prev, loading: true, error: null };
      
      if (action === 'like') {
        newState.liked = !prev.liked;
        newState.likesCount = prev.liked ? prev.likesCount - 1 : prev.likesCount + 1;
      } else {
        newState.saved = !prev.saved;
        newState.savesCount = prev.saved ? prev.savesCount - 1 : prev.savesCount + 1;
      }
      
      // تأكد من عدم وجود قيم سالبة
      newState.likesCount = Math.max(0, newState.likesCount);
      newState.savesCount = Math.max(0, newState.savesCount);
      
      return newState;
    });

    const startTime = performance.now();

    try {
      console.log(`🔄 [${currentRequest}] تفاعل ${action} - بداية العملية`);
      
      const response = await fetch('/api/interactions/optimized', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          articleId,
          action,
          toggle: true
        })
      });

      const endTime = performance.now();
      const clientDuration = Math.round(endTime - startTime);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data: InteractionResponse = await response.json();
      
      // التحقق من أن هذا هو آخر طلب لتجنب race conditions
      if (currentRequest !== requestCounter) {
        console.warn(`⚠️ [${currentRequest}] طلب ملغي - طلب أحدث موجود`);
        return;
      }

      if (data.success && data.data) {
        // تحديث الحالة بالبيانات الفعلية من الخادم
        setState({
          liked: data.data.liked,
          saved: data.data.saved,
          likesCount: data.data.likesCount,
          savesCount: data.data.savesCount,
          loading: false,
          error: null
        });

        const serverDuration = data.duration ? parseInt(data.duration) : 0;
        const totalDuration = clientDuration;

        console.log(`✅ [${currentRequest}] ${action} نجح:`, {
          action: data.action,
          client_time: `${clientDuration}ms`,
          server_time: data.duration,
          total_time: `${totalDuration}ms`,
          request_id: data.request_id,
          final_state: data.data
        });

        // إشعار نجاح للمستخدم
        showNotification({
          type: 'success',
          message: getSuccessMessage(action, data.action || 'unknown'),
          duration: 2000
        });

      } else {
        throw new Error(data.error || 'فشل التفاعل');
      }

    } catch (error) {
      console.error(`❌ [${currentRequest}] فشل ${action}:`, error);

      // إعادة الحالة السابقة (rollback)
      setState({
        ...previousState,
        loading: false,
        error: error instanceof Error ? error.message : 'خطأ غير معروف'
      });

      // إشعار خطأ للمستخدم  
      showNotification({
        type: 'error',
        message: getErrorMessage(action, error),
        duration: 4000
      });

      // محاولة إعادة مزامنة الحالة من الخادم
      setTimeout(() => {
        fetchState();
      }, 1000);

    } finally {
      setIsProcessing(false);
    }
  }, [user, articleId, isProcessing, state, requestCounter, fetchState]);

  // دوال التفاعل المحددة
  const toggleLike = useCallback(() => handleInteraction('like'), [handleInteraction]);
  const toggleSave = useCallback(() => handleInteraction('save'), [handleInteraction]);

  // دالة إعادة المزامنة اليدوية
  const syncWithServer = useCallback(() => {
    console.log('🔄 إعادة مزامنة الحالة مع الخادم...');
    fetchState();
  }, [fetchState]);

  // دالة تنظيف الأخطاء
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  return {
    // الحالة
    liked: state.liked,
    saved: state.saved,
    likesCount: state.likesCount,
    savesCount: state.savesCount,
    loading: state.loading,
    error: state.error,
    isProcessing,

    // الإجراءات
    toggleLike,
    toggleSave,
    syncWithServer,
    clearError,
    
    // معلومات إضافية
    hasUser: !!user,
    articleId,
    requestCounter
  };
}

// دوال مساعدة

function getAuthToken(): string {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('auth-token') || 
           localStorage.getItem('sabq_at') || 
           localStorage.getItem('access_token') || '';
  }
  return '';
}

function getSuccessMessage(action: string, result: string): string {
  const isAdded = result === 'added';
  
  if (action === 'like') {
    return isAdded ? 'تم الإعجاب بالمقال!' : 'تم إلغاء الإعجاب';
  } else {
    return isAdded ? 'تم حفظ المقال!' : 'تم إلغاء حفظ المقال';
  }
}

function getErrorMessage(action: string, error: any): string {
  if (error instanceof Error) {
    if (error.message.includes('401') || error.message.includes('Unauthorized')) {
      return 'يرجى تسجيل الدخول أولاً';
    }
    if (error.message.includes('404')) {
      return 'المقال غير موجود';
    }
    if (error.message.includes('403')) {
      return 'غير مصرح لك بهذا الإجراء';
    }
  }
  
  return action === 'like' 
    ? 'حدث خطأ في الإعجاب. يرجى المحاولة مرة أخرى.'
    : 'حدث خطأ في حفظ المقال. يرجى المحاولة مرة أخرى.';
}

function showNotification(notification: { type: string; message: string; duration: number }) {
  // التحقق من وجود نظام الإشعارات في المتصفح
  if (typeof window !== 'undefined' && (window as any).showNotification) {
    (window as any).showNotification(notification);
  } else {
    // fallback إلى console
    const emoji = notification.type === 'success' ? '✅' : '❌';
    console.log(`${emoji} ${notification.message}`);
  }
}
