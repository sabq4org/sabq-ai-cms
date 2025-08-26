"use client";

import React, { useState, useEffect } from 'react';
import { Heart, Bookmark, BookOpen } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useLoyalty } from '@/hooks/useLoyalty';

interface BasicLikeSaveProps {
  articleId: string;
  initialLikes?: number;
  initialSaves?: number;
  showReadingModeButton?: boolean;
  isReading?: boolean;
  onReadingModeToggle?: () => void;
}

// لم نعد نحتاج لقراءة التوكن
// الكوكيز HttpOnly ستتولى المصادقة تلقائياً

export default function BasicLikeSave({ 
  articleId, 
  initialLikes = 0, 
  initialSaves = 0,
  showReadingModeButton = false,
  isReading = false,
  onReadingModeToggle
}: BasicLikeSaveProps) {
  const { user } = useAuth();
  const { mutate: refreshLoyalty } = useLoyalty();
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [likes, setLikes] = useState(initialLikes);
  const [saves, setSaves] = useState(initialSaves);
  const [loading, setLoading] = useState(false);

  // لا نحتاج لإرسال headers إضافية
  // الكوكيز ستُرسل تلقائياً مع credentials: 'include'

  // تشخيص حالة المصادقة
  console.log('🔧 BasicLikeSave Debug:', {
    articleId,
    user: user ? { id: user.id, name: user.name } : null,
    initialLikes,
    initialSaves
  });

  // جلب حالة المستخدم عند التحميل
  useEffect(() => {
    if (!user || !articleId) return;
    fetchUserStatus();
    // الاستماع لتثبيت العدادات من hook آخر
    const onInit = (e: any) => {
      try {
        if (e?.detail?.articleId === articleId) {
          if (typeof e.detail.likes === 'number') setLikes(e.detail.likes);
          if (typeof e.detail.saves === 'number') setSaves(e.detail.saves);
        }
      } catch {}
    };
    window.addEventListener('article-interactions-init', onInit);
    return () => window.removeEventListener('article-interactions-init', onInit);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, articleId]);

  const fetchUserStatus = async () => {
    try {
      console.log('🔍 جلب حالة المستخدم للمقال:', articleId);
      
      // استخدام fetch مباشرة لتجنب interceptor issues
      const response = await fetch(`/api/interactions/user-status?articleId=${articleId}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('📄 بيانات حالة المستخدم:', data);
        
        if (data) {
          setLiked(!!(data.liked ?? data.hasLiked ?? data.interactions?.liked));
          setSaved(!!(data.saved ?? data.hasSaved ?? data.interactions?.saved));
          if (typeof data.likesCount === 'number') setLikes(data.likesCount);
          if (typeof data.savesCount === 'number') setSaves(data.savesCount);
          console.log('✅ تم تحديث حالة المستخدم');
        }
      } else {
        console.warn('⚠️ فشل في جلب حالة المستخدم:', response.status);
      }
    } catch (error) {
      console.error('❌ خطأ في جلب حالة المستخدم:', error);
      // لا تقطع الجلسة عند فشل جلب حالة المستخدم
    }
  };

  const handleLike = async () => {
    if (!user) {
      console.log('❌ المستخدم غير مسجل الدخول');
      alert('يرجى تسجيل الدخول أولاً');
      return;
    }
    if (loading) return;
    setLoading(true);

    try {
      const newLikeStatus = !liked;
      console.log('👍 محاولة إعجاب موحد:', { articleId, like: newLikeStatus, userId: user.id });
      
      // استخدام fetch مباشرة لتجنب interceptor issues
      const response = await fetch('/api/interactions/like', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include', // مهم لإرسال الكوكيز
        body: JSON.stringify({ articleId, like: newLikeStatus })
      });

      const data = await response.json();
      console.log('📄 بيانات الاستجابة:', data);
      
      if (response.ok && data.success) {
        setLiked(newLikeStatus);
        setLikes(newLikeStatus ? likes + 1 : Math.max(0, likes - 1));
        
        // إشعار مختصر فقط عند منح نقاط
        if (data.pointsAwarded > 0) {
          try { 
            const toast = await import('@/components/ui/toast');
            toast.toast.success(`+${data.pointsAwarded} نقاط • إجمالي: ${data.totalPoints} (${data.level})`);
          } catch {}
        }
        
        console.log('✅ تم الإعجاب بنجاح:', data);
        // تحديث نقاط الولاء في الهيدر فوراً
        refreshLoyalty();
      } else {
        console.error('❌ فشل الإعجاب:', data);
        
        // لا تقطع الجلسة عند فشل التفاعل - فقط أظهر رسالة خطأ
        const msg = data.message || data.error || 'فشل العملية';
        try { 
          const toast = await import('@/components/ui/toast');
          toast.toast.error(msg);
        } catch { 
          alert(msg); 
        }
      }
    } catch (error: any) {
      console.error('❌ خطأ في الإعجاب:', error);
      
      // معالجة أخطاء الشبكة بدون قطع الجلسة
      let errorMessage = 'حدث خطأ في الاتصال';
      if (error.name === 'AbortError') {
        errorMessage = 'انتهت مهلة الاتصال';
      } else if (!navigator.onLine) {
        errorMessage = 'تحقق من اتصالك بالإنترنت';
      }
      
      try { 
        const toast = await import('@/components/ui/toast');
        toast.toast.error(errorMessage);
      } catch { 
        alert(errorMessage); 
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user) {
      console.log('❌ المستخدم غير مسجل الدخول');
      alert('يرجى تسجيل الدخول أولاً');
      return;
    }
    if (loading) return;
    setLoading(true);

    try {
      const newSaveStatus = !saved;
      console.log('💾 محاولة حفظ موحد:', { articleId, saved: newSaveStatus, userId: user.id });
      
      // استخدام fetch مباشرة لتجنب interceptor issues
      const response = await fetch('/api/interactions/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include', // مهم لإرسال الكوكيز
        body: JSON.stringify({ articleId, save: newSaveStatus })
      });

      const data = await response.json();
      console.log('📄 بيانات الاستجابة:', data);
      
      if (response.ok && data.success) {
        setSaved(newSaveStatus);
        setSaves(newSaveStatus ? saves + 1 : Math.max(0, saves - 1));
        
        if (data.pointsAwarded > 0) {
          try { (await import('@/components/ui/toast')).toast.success(`+${data.pointsAwarded} نقاط • إجمالي: ${data.totalPoints} (${data.level})`); } catch {}
        }
        
        console.log('✅ تم الحفظ بنجاح:', data);
      } else {
        console.error('❌ فشل الحفظ:', data);
        
        const msg = data.message || data.error || 'فشل العملية';
        try { (await import('@/components/ui/toast')).toast.error(msg); } catch { alert(msg); }
      }
    } catch (error) {
      console.error('❌ خطأ في الحفظ:', error);
      try { (await import('@/components/ui/toast')).toast.error('حدث خطأ في الاتصال'); } catch { alert('حدث خطأ في الاتصال'); }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-between gap-3 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-200/60 dark:border-gray-700/50">
      {/* أزرار التفاعل */}
      <div className="flex items-center gap-3">
        <button
          onClick={handleLike}
          disabled={loading || !user}
          className={`flex items-center gap-2 px-3 py-2 rounded-full transition-all duration-200 ${
            liked
              ? 'bg-gradient-to-r from-red-500 to-rose-500 text-white shadow-lg'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-red-100 dark:hover:bg-red-900/30 hover:text-red-600 dark:hover:text-red-400'
          } ${loading ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105 active:scale-95'}`}
          aria-label={liked ? 'إلغاء الإعجاب' : 'إعجاب'}
        >
          <Heart className={`w-4 h-4 ${liked ? 'fill-current' : ''}`} />
          <span className="text-sm font-medium">{likes}</span>
        </button>

        <button
          onClick={handleSave}
          disabled={loading || !user}
          className={`flex items-center gap-2 px-3 py-2 rounded-full transition-all duration-200 ${
            saved
              ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-blue-100 dark:hover:bg-blue-900/30 hover:text-blue-600 dark:hover:text-blue-400'
          } ${loading ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105 active:scale-95'}`}
          aria-label={saved ? 'إلغاء الحفظ' : 'حفظ'}
        >
          <Bookmark className={`w-4 h-4 ${saved ? 'fill-current' : ''}`} />
          <span className="text-sm font-medium">{saves}</span>
        </button>
      </div>

      {/* زر وضع القراءة */}
      {showReadingModeButton && onReadingModeToggle && (
        <button
          onClick={onReadingModeToggle}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${
            isReading
              ? "bg-gradient-to-r from-emerald-500 to-green-500 text-white shadow-lg"
              : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 hover:text-emerald-600 dark:hover:text-emerald-400"
          } hover:scale-105 active:scale-95`}
          aria-label={isReading ? 'إيقاف وضع القراءة' : 'تفعيل وضع القراءة'}
        >
          <BookOpen className="w-4 h-4" />
          <span className="text-sm font-medium">
            {isReading ? "إيقاف القراءة" : "وضع القراءة"}
          </span>
        </button>
      )}
    </div>
  );
}
