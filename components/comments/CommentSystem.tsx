'use client';

import React, { useState, useEffect } from 'react';
import { useUser } from '@/hooks/useUser';
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
  AlertCircle
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ar } from 'date-fns/locale';

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

interface CommentSystemProps {
  articleId: string;
  articleTitle: string;
  articleSlug: string;
  initialComments?: Comment[];
  enableRealTime?: boolean;
  moderationEnabled?: boolean;
}

export default function CommentSystem({
  articleId,
  articleTitle,
  articleSlug,
  initialComments = [],
  enableRealTime = true,
  moderationEnabled = true
}: CommentSystemProps) {
  const { user, isLoading } = useUser();
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'popular'>('newest');
  const [showModeration, setShowModeration] = useState(false);

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
      const response = await fetch(`/api/comments/${articleId}?sort=${sortBy}`);
      if (response.ok) {
        const data = await response.json();
        setComments(data.comments || []);
      }
    } catch (error) {
      console.error('خطأ في جلب التعليقات:', error);
    }
  };

  const handleSubmitComment = async (content: string, parentId?: string) => {
    if (!user) {
      toast.error('يجب تسجيل الدخول للتعليق');
      return;
    }

    if (!content.trim()) {
      toast.error('لا يمكن إرسال تعليق فارغ');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          articleId,
          content: content.trim(),
          parentId,
          metadata: {
            userAgent: navigator.userAgent,
            timestamp: new Date().toISOString(),
            articleTitle,
            articleSlug
          }
        })
      });

      if (response.ok) {
        const data = await response.json();
        
        // إضافة فورية للتعليق (Optimistic Update)
        const optimisticComment: Comment = {
          id: data.comment.id,
          content: content.trim(),
          author: {
            id: user.id,
            name: user.name || user.email,
            email: user.email,
            avatar: user.avatar,
            reputation: user.reputation || 0,
            badges: user.badges || []
          },
          articleId,
          parentId,
          likes: 0,
          isLiked: false,
          replies: [],
          status: moderationEnabled ? 'pending' : 'approved',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          metadata: {
            sentiment: 'neutral',
            qualityScore: 85
          }
        };

        if (parentId) {
          // إضافة رد
          setComments(prev => prev.map(comment => 
            comment.id === parentId 
              ? { ...comment, replies: [...comment.replies, optimisticComment] }
              : comment
          ));
          setReplyText('');
          setReplyingTo(null);
        } else {
          // إضافة تعليق جديد
          setComments(prev => [optimisticComment, ...prev]);
          setNewComment('');
        }

        toast.success(
          moderationEnabled 
            ? 'تم إرسال تعليقك وهو في انتظار المراجعة' 
            : 'تم إضافة تعليقك بنجاح',
          { icon: '💬' }
        );

        // تتبع النشاط
        await fetch('/api/user-activity', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: user.id,
            action: 'comment',
            targetType: 'article',
            targetId: articleId,
            metadata: {
              commentLength: content.length,
              isReply: !!parentId,
              articleTitle
            }
          })
        });

      } else {
        throw new Error('فشل في إرسال التعليق');
      }
    } catch (error) {
      console.error('خطأ في إرسال التعليق:', error);
      toast.error('حدث خطأ في إرسال التعليق');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLikeComment = async (commentId: string) => {
    if (!user) {
      toast.error('يجب تسجيل الدخول للإعجاب');
      return;
    }

    try {
      const response = await fetch('/api/comments/like', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ commentId, userId: user.id })
      });

      if (response.ok) {
        const data = await response.json();
        
        // تحديث فوري
        setComments(prev => prev.map(comment => {
          if (comment.id === commentId) {
            return {
              ...comment,
              likes: data.isLiked ? comment.likes + 1 : comment.likes - 1,
              isLiked: data.isLiked
            };
          }
          // التحقق من الردود أيضاً
          return {
            ...comment,
            replies: comment.replies.map(reply => 
              reply.id === commentId 
                ? {
                    ...reply,
                    likes: data.isLiked ? reply.likes + 1 : reply.likes - 1,
                    isLiked: data.isLiked
                  }
                : reply
            )
          };
        }));

        toast.success(data.isLiked ? 'تم الإعجاب' : 'تم إلغاء الإعجاب', {
          icon: data.isLiked ? '❤️' : '💔'
        });
      }
    } catch (error) {
      console.error('خطأ في الإعجاب:', error);
      toast.error('حدث خطأ في التفاعل');
    }
  };

  const renderComment = (comment: Comment, isReply = false) => {
    const timeAgo = formatDistanceToNow(new Date(comment.createdAt), { 
      addSuffix: true, 
      locale: ar 
    });

    return (
      <div 
        key={comment.id}
        className={`${isReply ? 'mr-8 mt-4' : 'mb-6'} p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all`}
      >
        {/* هيدر التعليق */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            {/* صورة المستخدم */}
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
              {comment.author.avatar ? (
                <img 
                  src={comment.author.avatar} 
                  alt={comment.author.name}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                comment.author.name.charAt(0).toUpperCase()
              )}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                  {comment.author.name}
                </h4>
                
                {/* شارات المستخدم */}
                {comment.metadata?.isVerified && (
                  <div title="مستخدم موثق">
                    <CheckCircle className="w-4 h-4 text-blue-500" />
                  </div>
                )}
                
                {comment.author.badges && comment.author.badges.length > 0 && (
                  <div className="flex gap-1">
                    {comment.author.badges.slice(0, 2).map((badge, idx) => (
                      <span key={idx} className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full">
                        {badge}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Clock className="w-3 h-3" />
                <span>{timeAgo}</span>
                
                {/* نقاط السمعة */}
                {comment.author.reputation && comment.author.reputation > 0 && (
                  <>
                    <span>•</span>
                    <span className="text-blue-600 font-medium">
                      {comment.author.reputation} نقطة
                    </span>
                  </>
                )}
                
                {/* حالة المراجعة */}
                {comment.status === 'pending' && (
                  <>
                    <span>•</span>
                    <span className="text-yellow-600 text-xs flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      في انتظار المراجعة
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* قائمة الخيارات */}
          <div className="relative">
            <button className="p-1 text-gray-400 hover:text-gray-600 transition-colors">
              <MoreHorizontal className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* محتوى التعليق */}
        <div className="mb-4">
          <p className="text-gray-800 dark:text-gray-200 leading-relaxed whitespace-pre-wrap">
            {comment.content}
          </p>
          
          {/* معلومات الجودة */}
          {comment.metadata?.qualityScore && (
            <div className="mt-2 flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${
                comment.metadata.qualityScore >= 80 ? 'bg-green-500' :
                comment.metadata.qualityScore >= 60 ? 'bg-yellow-500' : 'bg-red-500'
              }`} />
              <span className="text-xs text-gray-500">
                جودة التعليق: {comment.metadata.qualityScore}%
              </span>
            </div>
          )}
        </div>

        {/* أزرار التفاعل */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* زر الإعجاب */}
            <button
              onClick={() => handleLikeComment(comment.id)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${
                comment.isLiked
                  ? 'bg-red-100 text-red-600 dark:bg-red-900/30'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400'
              }`}
            >
              <Heart className={`w-4 h-4 ${comment.isLiked ? 'fill-current' : ''}`} />
              <span className="text-sm font-medium">{comment.likes}</span>
            </button>

            {/* زر الرد */}
            {!isReply && (
              <button
                onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 transition-all"
              >
                <Reply className="w-4 h-4" />
                <span className="text-sm">رد</span>
              </button>
            )}

            {/* زر الإبلاغ */}
            <button className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 transition-all">
              <Flag className="w-4 h-4" />
              <span className="text-sm">إبلاغ</span>
            </button>
          </div>

          {/* عدد الردود */}
          {!isReply && comment.replies.length > 0 && (
            <div className="flex items-center gap-1 text-sm text-gray-500">
              <Users className="w-4 h-4" />
              <span>{comment.replies.length} رد</span>
            </div>
          )}
        </div>

        {/* نموذج الرد */}
        {replyingTo === comment.id && (
          <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <textarea
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder={`رد على ${comment.author.name}...`}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              rows={3}
            />
            <div className="flex items-center justify-between mt-3">
              <div className="text-xs text-gray-500">
                {replyText.length}/500 حرف
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setReplyingTo(null);
                    setReplyText('');
                  }}
                  className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition-colors"
                >
                  إلغاء
                </button>
                <button
                  onClick={() => handleSubmitComment(replyText, comment.id)}
                  disabled={!replyText.trim() || isSubmitting}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isSubmitting ? 'جاري الإرسال...' : 'رد'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* عرض الردود */}
        {comment.replies.length > 0 && (
          <div className="mt-4 space-y-4">
            {comment.replies.map(reply => renderComment(reply, true))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* هيدر قسم التعليقات */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <MessageSquare className="w-6 h-6 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            التعليقات ({comments.length})
          </h2>
        </div>

        {/* خيارات الترتيب */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600 dark:text-gray-400">ترتيب:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500"
          >
            <option value="newest">الأحدث</option>
            <option value="oldest">الأقدم</option>
            <option value="popular">الأكثر إعجاباً</option>
          </select>
        </div>
      </div>

      {/* نموذج التعليق الجديد */}
      <div className="mb-8 p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
          شارك رأيك
        </h3>
        
        {user ? (
          <div>
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="ما رأيك في هذا المقال؟ شاركنا وجهة نظرك..."
              className="w-full p-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              rows={4}
              maxLength={500}
            />
            
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-gray-500">
                {newComment.length}/500 حرف
              </div>
              
              <div className="flex items-center gap-3">
                {moderationEnabled && (
                  <span className="text-xs text-yellow-600 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    سيتم مراجعة التعليق قبل النشر
                  </span>
                )}
                
                <button
                  onClick={() => handleSubmitComment(newComment)}
                  disabled={!newComment.trim() || isSubmitting}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                >
                  {isSubmitting ? 'جاري الإرسال...' : 'نشر التعليق'}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              سجل دخولك لتتمكن من التعليق والتفاعل
            </p>
            <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              تسجيل الدخول
            </button>
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
