"use client";

import React, { useState, useEffect } from 'react';
import { Heart, Bookmark } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface BasicLikeSaveProps {
  articleId: string;
  initialLikes?: number;
  initialSaves?: number;
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

  // جلب حالة المستخدم عند التحميل
  useEffect(() => {
    if (!user || !articleId) return;
    
    console.log('🔍 جلب حالة التفاعل للمقال:', articleId);
    fetchUserStatus();
  }, [user, articleId]);

  const fetchUserStatus = async () => {
    try {
      const response = await fetch(`/api/interactions/user-status?articleId=${articleId}`);
      const data = await response.json();
      
      console.log('📊 حالة التفاعل:', data);
      
      if (data.success) {
        setLiked(data.liked || false);
        setSaved(data.saved || false);
      }
    } catch (error) {
      console.error('❌ خطأ في جلب الحالة:', error);
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
      console.log('👍 محاولة إعجاب:', newLikeStatus);
      
      const response = await fetch('/api/interactions/like', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          articleId, 
          like: newLikeStatus 
        }),
      });

      const data = await response.json();
      console.log('📊 نتيجة الإعجاب:', data);

      if (response.ok) {
        setLiked(newLikeStatus);
        setLikes(data.likes || (newLikeStatus ? likes + 1 : likes - 1));
        console.log('✅ تم الإعجاب بنجاح');
      } else {
        console.error('❌ فشل الإعجاب:', data);
        alert('حدث خطأ في الإعجاب');
      }
    } catch (error) {
      console.error('❌ خطأ في الإعجاب:', error);
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
      console.log('💾 محاولة حفظ:', newSaveStatus);
      
      const response = await fetch('/api/bookmarks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          articleId, 
          saved: newSaveStatus 
        }),
      });

      const data = await response.json();
      console.log('📊 نتيجة الحفظ:', data);

      if (response.ok) {
        setSaved(newSaveStatus);
        setSaves(data.saves || (newSaveStatus ? saves + 1 : saves - 1));
        console.log('✅ تم الحفظ بنجاح');
      } else {
        console.error('❌ فشل الحفظ:', data);
        alert('حدث خطأ في الحفظ');
      }
    } catch (error) {
      console.error('❌ خطأ في الحفظ:', error);
      alert('حدث خطأ في الحفظ');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
      {/* زر الإعجاب */}
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

      {/* زر الحفظ */}
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

      {/* معلومات التطوير */}
      <div className="text-xs text-gray-500">
        {user ? `مستخدم: ${user.name}` : 'غير مسجل دخول'}
      </div>
    </div>
  );
}
