"use client";

import React, { useState, useEffect } from 'react';
import { Heart, Bookmark } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface BasicLikeSaveProps {
  articleId: string;
  initialLikes?: number;
  initialSaves?: number;
}

function getAuthToken(): string | null {
  try {
    // 1) من localStorage إذا كان محفوظاً
    if (typeof window !== 'undefined') {
      const ls = localStorage.getItem('auth-token');
      if (ls) return ls;
    }
    // 2) من الكوكيز
    if (typeof document !== 'undefined') {
      const match = document.cookie
        .split('; ')
        .find((row) => row.startsWith('auth-token='));
      if (match) return decodeURIComponent(match.split('=')[1]);
    }
  } catch {}
  return null;
}

export default function BasicLikeSave({ 
  articleId, 
  initialLikes = 0, 
  initialSaves = 0 
}: BasicLikeSaveProps) {
  const { user } = useAuth();
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [likes, setLikes] = useState(initialLikes);
  const [saves, setSaves] = useState(initialSaves);
  const [loading, setLoading] = useState(false);

  const authToken = getAuthToken();
  const authHeaders: Record<string, string> = authToken
    ? { Authorization: `Bearer ${authToken}` }
    : {};

  // تشخيص حالة المصادقة
  console.log('🔧 BasicLikeSave Debug:', {
    articleId,
    user: user ? { id: user.id, name: user.name } : null,
    authToken: authToken ? 'موجود' : 'غير موجود',
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
      
      const response = await fetch(`/api/interactions/user-status?articleId=${articleId}` , {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders,
        },
      });
      
      console.log('📊 استجابة حالة المستخدم:', response.status, response.statusText);
      
      const data = await response.json();
      console.log('📄 بيانات حالة المستخدم:', data);
      
      if (response.ok && data) {
        setLiked(!!(data.liked ?? data.hasLiked ?? data.interactions?.liked));
        setSaved(!!(data.saved ?? data.hasSaved ?? data.interactions?.saved));
        if (typeof data.likesCount === 'number') setLikes(data.likesCount);
        if (typeof data.savesCount === 'number') setSaves(data.savesCount);
        console.log('✅ تم تحديث حالة المستخدم');
      } else {
        console.warn('⚠️ فشل في جلب حالة المستخدم:', data);
      }
    } catch (error) {
      console.error('❌ خطأ في جلب حالة المستخدم:', error);
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
      
      // استخدام النظام الموحد للتتبع
      const response = await fetch('/api/unified-tracking', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders,
        },
        body: JSON.stringify({ 
          articleId, 
          interactionType: 'like',
          metadata: {
            previousState: liked,
            action: newLikeStatus ? 'add' : 'remove'
          }
        }),
      });

      console.log('📊 استجابة النظام الموحد:', response.status, response.statusText);
      
      const data = await response.json().catch(() => ({}));
      console.log('📄 بيانات الاستجابة:', data);
      
      if (response.ok && data.success) {
        setLiked(newLikeStatus);
        setLikes(newLikeStatus ? likes + 1 : Math.max(0, likes - 1));
        
        // إظهار رسالة النجاح مع النقاط
        if (data.pointsAwarded > 0) {
          alert(`✅ ${data.message}\n🎯 إجمالي نقاطك: ${data.totalPoints} (${data.level})`);
        }
        
        console.log('✅ تم الإعجاب بنجاح:', data);
      } else {
        console.error('❌ فشل الإعجاب:', data);
        
        if (data.limitReached) {
          alert(`⚠️ ${data.message}`);
        } else if (data.alreadyExists) {
          alert(`ℹ️ ${data.message}`);
        } else {
          alert(`حدث خطأ في الإعجاب: ${data.error || data.message || 'خطأ غير معروف'}`);
        }
      }
    } catch (error) {
      console.error('❌ خطأ في الإعجاب:', error);
      alert('حدث خطأ في الاتصال');
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
      
      // استخدام النظام الموحد للتتبع
      const response = await fetch('/api/unified-tracking', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders,
        },
        body: JSON.stringify({ 
          articleId, 
          interactionType: 'save',
          metadata: {
            previousState: saved,
            action: newSaveStatus ? 'add' : 'remove'
          }
        }),
      });

      console.log('📊 استجابة النظام الموحد:', response.status, response.statusText);
      
      const data = await response.json().catch(() => ({}));
      console.log('📄 بيانات الاستجابة:', data);
      
      if (response.ok && data.success) {
        setSaved(newSaveStatus);
        setSaves(newSaveStatus ? saves + 1 : Math.max(0, saves - 1));
        
        // إظهار رسالة النجاح مع النقاط
        if (data.pointsAwarded > 0) {
          alert(`✅ ${data.message}\n🎯 إجمالي نقاطك: ${data.totalPoints} (${data.level})`);
        }
        
        console.log('✅ تم الحفظ بنجاح:', data);
      } else {
        console.error('❌ فشل الحفظ:', data);
        
        if (data.limitReached) {
          alert(`⚠️ ${data.message}`);
        } else if (data.alreadyExists) {
          alert(`ℹ️ ${data.message}`);
        } else {
          alert(`حدث خطأ في الحفظ: ${data.error || data.message || 'خطأ غير معروف'}`);
        }
      }
    } catch (error) {
      console.error('❌ خطأ في الحفظ:', error);
      alert('حدث خطأ في الاتصال');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
      <button
        onClick={handleSave}
        disabled={loading || !user}
        className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${
          saved
            ? 'bg-blue-500 text-white'
            : 'bg-gray-200 text-gray-700 hover:bg-blue-100'
        } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <Bookmark className={`w-5 h-5 ${saved ? 'fill-current' : ''}`} />
        <span>{saves}</span>
      </button>

      <button
        onClick={handleLike}
        disabled={loading || !user}
        className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${
          liked
            ? 'bg-red-500 text-white'
            : 'bg-gray-200 text-gray-700 hover:bg-red-100'
        } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <Heart className={`w-5 h-5 ${liked ? 'fill-current' : ''}`} />
        <span>{likes}</span>
      </button>
    </div>
  );
}
