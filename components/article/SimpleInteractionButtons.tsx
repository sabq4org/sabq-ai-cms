'use client';

import React, { useState, useEffect } from 'react';
import { Heart, Bookmark, Share2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'react-hot-toast';

interface SimpleInteractionButtonsProps {
  articleId: string;
  initialLikes?: number;
  initialSaves?: number;
  className?: string;
}

export default function SimpleInteractionButtons({
  articleId,
  initialLikes = 0,
  initialSaves = 0,
  className = ''
}: SimpleInteractionButtonsProps) {
  const { user } = useAuth();
  const [likes, setLikes] = useState(initialLikes);
  const [saves, setSaves] = useState(initialSaves);
  const [hasLiked, setHasLiked] = useState(false);
  const [hasSaved, setHasSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  // تحميل حالة المستخدم
  useEffect(() => {
    if (!user || !articleId) return;

    const loadUserInteractions = async () => {
      try {
        const response = await fetch(`/api/articles/${articleId}/status`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('auth-token')}`,
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          setHasLiked(data.hasLiked || false);
          setHasSaved(data.hasSaved || false);
        }
      } catch (error) {
        console.log('تحميل حالة التفاعلات:', error);
      }
    };

    loadUserInteractions();
  }, [articleId, user]);

  // معالج الإعجاب
  const handleLike = async () => {
    if (!user) {
      toast.error('يجب تسجيل الدخول للإعجاب');
      return;
    }

    if (loading) return;
    setLoading(true);

    const newLikeState = !hasLiked;
    
    // تحديث فوري للواجهة
    setHasLiked(newLikeState);
    setLikes(prev => newLikeState ? prev + 1 : Math.max(0, prev - 1));

    try {
      const response = await fetch('/api/interactions/like', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth-token')}`,
        },
        body: JSON.stringify({
          articleId,
          like: newLikeState
        })
      });

      if (!response.ok) {
        throw new Error('فشل في تسجيل الإعجاب');
      }

      const data = await response.json();
      setLikes(data.likes || 0);
      
      if (newLikeState) {
        toast.success('تم تسجيل الإعجاب! ❤️');
      } else {
        toast.success('تم إلغاء الإعجاب');
      }

    } catch (error) {
      console.error('خطأ في الإعجاب:', error);
      // إرجاع التغيير
      setHasLiked(!newLikeState);
      setLikes(prev => !newLikeState ? prev + 1 : Math.max(0, prev - 1));
      toast.error('حدث خطأ في تسجيل الإعجاب');
    } finally {
      setLoading(false);
    }
  };

  // معالج الحفظ
  const handleSave = async () => {
    if (!user) {
      toast.error('يجب تسجيل الدخول للحفظ');
      return;
    }

    if (loading) return;
    setLoading(true);

    const newSaveState = !hasSaved;
    
    // تحديث فوري للواجهة
    setHasSaved(newSaveState);
    setSaves(prev => newSaveState ? prev + 1 : Math.max(0, prev - 1));

    try {
      const response = await fetch('/api/interactions/bookmark', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth-token')}`,
        },
        body: JSON.stringify({
          articleId,
          saved: newSaveState
        })
      });

      if (!response.ok) {
        throw new Error('فشل في الحفظ');
      }

      const data = await response.json();
      setSaves(data.saves || 0);
      
      if (newSaveState) {
        toast.success('تم حفظ المقال! 🔖');
      } else {
        toast.success('تم إلغاء الحفظ');
      }

    } catch (error) {
      console.error('خطأ في الحفظ:', error);
      // إرجاع التغيير
      setHasSaved(!newSaveState);
      setSaves(prev => !newSaveState ? prev + 1 : Math.max(0, prev - 1));
      toast.error('حدث خطأ في الحفظ');
    } finally {
      setLoading(false);
    }
  };

  // معالج المشاركة
  const handleShare = async () => {
    try {
      const shareUrl = `${window.location.origin}/article/${articleId}`;
      
      if (navigator.share) {
        await navigator.share({
          title: document.title,
          url: shareUrl
        });
      } else {
        await navigator.clipboard.writeText(shareUrl);
        toast.success('تم نسخ الرابط!');
      }
    } catch (error) {
      console.error('خطأ في المشاركة:', error);
      toast.error('حدث خطأ في المشاركة');
    }
  };

  return (
    <div className={`flex items-center gap-4 ${className}`}>
      {/* زر الإعجاب */}
      <button
        onClick={handleLike}
        disabled={loading}
        className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-200 
          ${hasLiked 
            ? 'bg-red-500 text-white hover:bg-red-600' 
            : 'bg-gray-100 text-gray-700 hover:bg-red-50 hover:text-red-500'
          }
          ${loading ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105 active:scale-95'}
        `}
        title={hasLiked ? 'إلغاء الإعجاب' : 'إعجاب'}
      >
        <Heart 
          className={`w-5 h-5 transition-all duration-200 ${
            hasLiked ? 'fill-current scale-110' : ''
          }`} 
        />
        <span className="text-sm font-medium">{likes}</span>
      </button>

      {/* زر الحفظ */}
      <button
        onClick={handleSave}
        disabled={loading}
        className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-200 
          ${hasSaved 
            ? 'bg-blue-500 text-white hover:bg-blue-600' 
            : 'bg-gray-100 text-gray-700 hover:bg-blue-50 hover:text-blue-500'
          }
          ${loading ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105 active:scale-95'}
        `}
        title={hasSaved ? 'إلغاء الحفظ' : 'حفظ'}
      >
        <Bookmark 
          className={`w-5 h-5 transition-all duration-200 ${
            hasSaved ? 'fill-current scale-110' : ''
          }`} 
        />
        <span className="text-sm font-medium">{saves}</span>
      </button>

      {/* زر المشاركة */}
      <button
        onClick={handleShare}
        className="flex items-center gap-2 px-4 py-2 rounded-full bg-gray-100 text-gray-700 
          hover:bg-green-50 hover:text-green-600 transition-all duration-200 
          hover:scale-105 active:scale-95"
        title="مشاركة"
      >
        <Share2 className="w-5 h-5" />
        <span className="text-sm font-medium">مشاركة</span>
      </button>
    </div>
  );
}
