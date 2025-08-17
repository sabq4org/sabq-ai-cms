"use client";

import React, { useState, useEffect } from 'react';
import { Heart, Bookmark } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

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
      const response = await fetch(`/api/interactions/user-status?articleId=${articleId}` , {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders,
        },
      });
      const data = await response.json();
      if (response.ok && data) {
        setLiked(!!(data.liked ?? data.hasLiked ?? data.interactions?.liked));
        setSaved(!!(data.saved ?? data.hasSaved ?? data.interactions?.saved));
        if (typeof data.likesCount === 'number') setLikes(data.likesCount);
        if (typeof data.savesCount === 'number') setSaves(data.savesCount);
      }
    } catch (error) {
      // تجاهل
    }
  };

  const handleLike = async () => {
    if (!user) {
      alert('يرجى تسجيل الدخول أولاً');
      return;
    }
    if (loading) return;
    setLoading(true);

    try {
      const newLikeStatus = !liked;
      const response = await fetch('/api/interactions/like', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders,
        },
        body: JSON.stringify({ articleId, like: newLikeStatus }),
      });

      const data = await response.json().catch(() => ({}));
      if (response.ok) {
        setLiked(newLikeStatus);
        setLikes(typeof data.likes === 'number' ? data.likes : (newLikeStatus ? likes + 1 : Math.max(0, likes - 1)));
      } else {
        alert('حدث خطأ في الإعجاب');
      }
    } catch (error) {
      alert('حدث خطأ في الإعجاب');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user) {
      alert('يرجى تسجيل الدخول أولاً');
      return;
    }
    if (loading) return;
    setLoading(true);

    try {
      const newSaveStatus = !saved;
      const response = await fetch('/api/bookmarks', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders,
        },
        body: JSON.stringify({ articleId, saved: newSaveStatus }),
      });

      const data = await response.json().catch(() => ({}));
      if (response.ok) {
        // تثبيت الحالة والعداد من الخادم لضمان عدم رجوعها للصفر بعد التحديث
        setSaved(!!(data.saved ?? newSaveStatus));
        setSaves(typeof data.saves === 'number' ? data.saves : (newSaveStatus ? saves + 1 : Math.max(0, saves - 1)));
      } else {
        alert('حدث خطأ في الحفظ');
      }
    } catch (error) {
      alert('حدث خطأ في الحفظ');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
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

      <div className="text-xs text-gray-500">
        {user ? `مستخدم: ${user.name}` : 'غير مسجل دخول'}
      </div>
    </div>
  );
}
