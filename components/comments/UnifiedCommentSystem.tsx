'use client';

/**
 * نظام تعليقات موحد يستخدم نظام المصادقة الموحد
 * يحل مشاكل تضارب أنظمة المصادقة
 */

import React, { useState, useEffect } from 'react';
import { useUnifiedAuth } from '@/contexts/UnifiedAuthContext';
import { toast } from 'sonner';
import { 
  MessageSquare, 
  Heart, 
  Reply, 
  MoreHorizontal,
  Flag,
  Edit3,
  Trash2,
  Users,
  Clock,
  CheckCircle,
  AlertCircle,
  LogIn,
  UserPlus
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ar } from 'date-fns/locale';
import Link from 'next/link';

interface Comment {
  id: string;
  content: string;
  author: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
    reputation?: number;
    badges?: string[];
  };
  articleId: string;
  parentId?: string;
  likes: number;
  isLiked: boolean;
  replies: Comment[];
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  updatedAt: string;
  metadata?: {
    edited?: boolean;
    editedAt?: string;
    sentiment?: 'positive' | 'negative' | 'neutral';
    qualityScore?: number;
    isVerified?: boolean;
  };
}

interface UnifiedCommentSystemProps {
  articleId: string;
  articleTitle: string;
  articleSlug: string;
  initialComments?: Comment[];
  enableRealTime?: boolean;
  moderationEnabled?: boolean;
}

export default function UnifiedCommentSystem({
  articleId,
  articleTitle,
  articleSlug,
  initialComments = [],
  enableRealTime = true,
  moderationEnabled = true
}: UnifiedCommentSystemProps) {
  const { user, loading, isAuthenticated } = useUnifiedAuth();
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'popular'>('newest');

  // جلب التعليقات
  useEffect(() => {
    fetchComments();
  }, [articleId, sortBy]);

  // تحديث في الوقت الفعلي
  useEffect(() => {
    if (!enableRealTime) return;

    const interval = setInterval(() => {
      fetchComments();
    }, 30000); // تحديث كل 30 ثانية

    return () => clearInterval(interval);
  }, [enableRealTime, articleId]);

  const fetchComments = async () => {
    try {
      const response = await fetch(`/api/comments/${articleId}?sort=${sortBy}`, {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setComments(data.comments || []);
      }
    } catch (error) {
      console.error('خطأ في جلب التعليقات:', error);
    }
  };

  const submitComment = async () => {
    if (!isAuthenticated || !user) {
      toast.error('يجب تسجيل الدخول أولاً');
      return;
    }

    if (!newComment.trim()) {
      toast.error('يرجى كتابة تعليق');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          content: newComment,
          articleId,
          articleTitle,
          articleSlug
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success('تم إرسال التعليق بنجاح');
        setNewComment('');
        fetchComments(); // إعادة تحميل التعليقات
      } else {
        toast.error(data.error || 'فشل في إرسال التعليق');
      }
    } catch (error) {
      console.error('خطأ في إرسال التعليق:', error);
      toast.error('حدث خطأ في إرسال التعليق');
    } finally {
      setIsSubmitting(false);
    }
  };

  const submitReply = async (parentId: string) => {
    if (!isAuthenticated || !user) {
      toast.error('يجب تسجيل الدخول أولاً');
      return;
    }

    if (!replyText.trim()) {
      toast.error('يرجى كتابة رد');
      return;
    }

    try {
      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          content: replyText,
          articleId,
          parentId,
          articleTitle,
          articleSlug
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success('تم إرسال الرد بنجاح');
        setReplyText('');
        setReplyingTo(null);
        fetchComments();
      } else {
        toast.error(data.error || 'فشل في إرسال الرد');
      }
    } catch (error) {
      console.error('خطأ في إرسال الرد:', error);
      toast.error('حدث خطأ في إرسال الرد');
    }
  };

  const toggleLike = async (commentId: string) => {
    if (!isAuthenticated) {
      toast.error('يجب تسجيل الدخول للإعجاب');
      return;
    }

    try {
      const response = await fetch(`/api/comments/${commentId}/like`, {
        method: 'POST',
        credentials: 'include'
      });

      if (response.ok) {
        fetchComments(); // إعادة تحميل التعليقات
      }
    } catch (error) {
      console.error('خطأ في الإعجاب:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'rejected':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return null;
    }
  };

  const renderComment = (comment: Comment, isReply = false) => (
    <div key={comment.id} className={`${isReply ? 'ml-8 border-l-2 border-gray-200 pl-4' : ''} bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700`}>
      {/* رأس التعليق */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
            {comment.author.avatar ? (
              <img src={comment.author.avatar} alt={comment.author.name} className="w-full h-full rounded-full object-cover" />
            ) : (
              comment.author.name.charAt(0).toUpperCase()
            )}
          </div>
          <div>
            <h4 className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
              {comment.author.name}
              {comment.metadata?.isVerified && (
                <CheckCircle className="w-4 h-4 text-blue-500" />
              )}
              {getStatusBadge(comment.status)}
            </h4>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {formatDistanceToNow(new Date(comment.createdAt), { 
                addSuffix: true, 
                locale: ar 
              })}
              {comment.metadata?.edited && (
                <span className="mr-2 text-xs">(تم التعديل)</span>
              )}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {comment.author.reputation && (
            <span className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
              {comment.author.reputation} نقطة
            </span>
          )}
          <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
            <MoreHorizontal className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* محتوى التعليق */}
      <div className="mb-4">
        <p className="text-gray-800 dark:text-gray-200 leading-relaxed">
          {comment.content}
        </p>
        
        {comment.metadata?.sentiment && (
          <div className="mt-2 flex items-center gap-2">
            <span className={`text-xs px-2 py-1 rounded ${
              comment.metadata.sentiment === 'positive' ? 'bg-green-100 text-green-800' :
              comment.metadata.sentiment === 'negative' ? 'bg-red-100 text-red-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {comment.metadata.sentiment === 'positive' ? 'إيجابي' :
               comment.metadata.sentiment === 'negative' ? 'سلبي' : 'محايد'}
            </span>
            {comment.metadata.qualityScore && (
              <span className="text-xs text-gray-500">
                جودة: {Math.round(comment.metadata.qualityScore)}%
              </span>
            )}
          </div>
        )}
      </div>

      {/* أزرار التفاعل */}
      <div className="flex items-center gap-4 text-sm">
        <button
          onClick={() => toggleLike(comment.id)}
          className={`flex items-center gap-1 px-3 py-1 rounded-full transition-colors ${
            comment.isLiked
              ? 'bg-red-100 text-red-600 dark:bg-red-900/20'
              : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400'
          }`}
          disabled={!isAuthenticated}
        >
          <Heart className={`w-4 h-4 ${comment.isLiked ? 'fill-current' : ''}`} />
          <span>{comment.likes}</span>
        </button>

        <button
          onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
          className="flex items-center gap-1 px-3 py-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 transition-colors"
          disabled={!isAuthenticated}
        >
          <Reply className="w-4 h-4" />
          <span>رد</span>
        </button>

        <button className="flex items-center gap-1 px-3 py-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 transition-colors">
          <Flag className="w-4 h-4" />
          <span>إبلاغ</span>
        </button>
      </div>

      {/* نموذج الرد */}
      {replyingTo === comment.id && isAuthenticated && (
        <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <textarea
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            placeholder="اكتب ردك هنا..."
            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
            rows={3}
          />
          <div className="flex justify-end gap-2 mt-3">
            <button
              onClick={() => {
                setReplyingTo(null);
                setReplyText('');
              }}
              className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
            >
              إلغاء
            </button>
            <button
              onClick={() => submitReply(comment.id)}
              disabled={!replyText.trim()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              إرسال الرد
            </button>
          </div>
        </div>
      )}

      {/* الردود */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="mt-4 space-y-4">
          {comment.replies.map(reply => renderComment(reply, true))}
        </div>
      )}
    </div>
  );

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
          <div className="space-y-3">
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
      {/* رأس قسم التعليقات */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <MessageSquare className="w-6 h-6" />
          التعليقات ({comments.length})
        </h3>
        
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as any)}
          className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        >
          <option value="newest">الأحدث</option>
          <option value="oldest">الأقدم</option>
          <option value="popular">الأكثر إعجاباً</option>
        </select>
      </div>

      {/* نموذج إضافة تعليق */}
      <div className="mb-8">
        {isAuthenticated && user ? (
          <div className="space-y-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                {user.avatar ? (
                  <img src={user.avatar} alt={user.name} className="w-full h-full rounded-full object-cover" />
                ) : (
                  user.name.charAt(0).toUpperCase()
                )}
              </div>
              <div>
                <p className="font-medium text-gray-900 dark:text-white">{user.name}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">شارك برأيك</p>
              </div>
            </div>
            
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="اكتب تعليقك هنا... شاركنا رأيك حول هذا المقال"
              className="w-full p-4 border border-gray-300 dark:border-gray-600 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              rows={4}
            />
            
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                <Users className="w-4 h-4 inline mr-1" />
                تعليقك سيكون مرئياً لجميع القراء
              </div>
              <button
                onClick={submitComment}
                disabled={!newComment.trim() || isSubmitting}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    جاري الإرسال...
                  </>
                ) : (
                  <>
                    <MessageSquare className="w-4 h-4" />
                    نشر التعليق
                  </>
                )}
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              شارك برأيك
            </h4>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              سجل دخولك لتتمكن من التعليق والتفاعل مع المقالات
            </p>
            <div className="flex justify-center gap-3">
              <Link
                href="/login"
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <LogIn className="w-4 h-4" />
                تسجيل الدخول
              </Link>
              <Link
                href="/register"
                className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors flex items-center gap-2"
              >
                <UserPlus className="w-4 h-4" />
                إنشاء حساب
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* قائمة التعليقات */}
      <div className="space-y-6">
        {comments.length > 0 ? (
          comments.map(comment => renderComment(comment))
        ) : (
          <div className="text-center py-12">
            <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-400 mb-2">
              لا توجد تعليقات بعد
            </h3>
            <p className="text-gray-500">كن أول من يعلق على هذا المقال</p>
          </div>
        )}
      </div>
    </div>
  );
}
