/**
 * نظام إدارة التعليقات للمحرر التعاوني
 * Comments Management System for Collaborative Editor
 */

'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Textarea } from '@/components/ui/textarea';
import { createClient } from '@supabase/supabase-js';
import {
    Check,
    Clock,
    Edit,
    MessageCircle,
    MoreHorizontal,
    Reply,
    Trash2,
    User
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

interface Comment {
  id: string;
  content: string;
  document_id: string;
  author_id: string;
  author_name: string;
  author_email?: string;
  created_at: string;
  updated_at: string;
  position_from?: number;
  position_to?: number;
  status: 'active' | 'resolved' | 'deleted';
  reply_to?: string;
  replies?: Comment[];
}

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

interface CommentsSystemProps {
  documentId: string;
  currentUser: User;
  className?: string;
}

const CommentsSystem: React.FC<CommentsSystemProps> = ({
  documentId,
  currentUser,
  className = ''
}) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [editingComment, setEditingComment] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');

  // جلب التعليقات
  const fetchComments = async () => {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from('comments')
        .select('*')
        .eq('document_id', documentId)
        .eq('status', 'active')
        .order('created_at', { ascending: true });

      if (error) {
        console.error('خطأ في جلب التعليقات:', error);
        toast.error('فشل في جلب التعليقات');
        return;
      }

      // تنظيم التعليقات مع الردود
      const commentsMap = new Map<string, Comment>();
      const rootComments: Comment[] = [];

      // إنشاء خريطة لجميع التعليقات
      data.forEach(comment => {
        commentsMap.set(comment.id, { ...comment, replies: [] });
      });

      // تنظيم التعليقات الأساسية والردود
      data.forEach(comment => {
        if (comment.reply_to) {
          // هذا رد على تعليق آخر
          const parentComment = commentsMap.get(comment.reply_to);
          if (parentComment) {
            parentComment.replies!.push(commentsMap.get(comment.id)!);
          }
        } else {
          // هذا تعليق أساسي
          rootComments.push(commentsMap.get(comment.id)!);
        }
      });

      setComments(rootComments);
      console.log(`📝 تم جلب ${rootComments.length} تعليق رئيسي`);

    } catch (error) {
      console.error('خطأ في جلب التعليقات:', error);
      toast.error('حدث خطأ في جلب التعليقات');
    } finally {
      setLoading(false);
    }
  };

  // إضافة تعليق جديد
  const addComment = async () => {
    if (!newComment.trim()) return;

    try {
      const { data, error } = await supabase
        .from('comments')
        .insert({
          content: newComment.trim(),
          document_id: documentId,
          author_id: currentUser.id,
          author_name: currentUser.name,
          author_email: currentUser.email,
          status: 'active'
        })
        .select()
        .single();

      if (error) {
        console.error('خطأ في إضافة التعليق:', error);
        toast.error('فشل في إضافة التعليق');
        return;
      }

      setNewComment('');
      await fetchComments();
      toast.success('تم إضافة التعليق بنجاح');

    } catch (error) {
      console.error('خطأ في إضافة التعليق:', error);
      toast.error('حدث خطأ في إضافة التعليق');
    }
  };

  // إضافة رد
  const addReply = async (parentId: string) => {
    if (!replyContent.trim()) return;

    try {
      const { data, error } = await supabase
        .from('comments')
        .insert({
          content: replyContent.trim(),
          document_id: documentId,
          author_id: currentUser.id,
          author_name: currentUser.name,
          author_email: currentUser.email,
          reply_to: parentId,
          status: 'active'
        })
        .select()
        .single();

      if (error) {
        console.error('خطأ في إضافة الرد:', error);
        toast.error('فشل في إضافة الرد');
        return;
      }

      setReplyContent('');
      setReplyingTo(null);
      await fetchComments();
      toast.success('تم إضافة الرد بنجاح');

    } catch (error) {
      console.error('خطأ في إضافة الرد:', error);
      toast.error('حدث خطأ في إضافة الرد');
    }
  };

  // تعديل تعليق
  const updateComment = async (commentId: string) => {
    if (!editContent.trim()) return;

    try {
      const { error } = await supabase
        .from('comments')
        .update({ content: editContent.trim() })
        .eq('id', commentId);

      if (error) {
        console.error('خطأ في تعديل التعليق:', error);
        toast.error('فشل في تعديل التعليق');
        return;
      }

      setEditContent('');
      setEditingComment(null);
      await fetchComments();
      toast.success('تم تعديل التعليق بنجاح');

    } catch (error) {
      console.error('خطأ في تعديل التعليق:', error);
      toast.error('حدث خطأ في تعديل التعليق');
    }
  };

  // حذف تعليق
  const deleteComment = async (commentId: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا التعليق؟')) return;

    try {
      const { error } = await supabase
        .from('comments')
        .update({
          status: 'deleted',
          deleted_at: new Date().toISOString()
        })
        .eq('id', commentId);

      if (error) {
        console.error('خطأ في حذف التعليق:', error);
        toast.error('فشل في حذف التعليق');
        return;
      }

      await fetchComments();
      toast.success('تم حذف التعليق بنجاح');

    } catch (error) {
      console.error('خطأ في حذف التعليق:', error);
      toast.error('حدث خطأ في حذف التعليق');
    }
  };

  // تحليل الحالة
  const resolveComment = async (commentId: string) => {
    try {
      const { error } = await supabase
        .from('comments')
        .update({ status: 'resolved' })
        .eq('id', commentId);

      if (error) {
        console.error('خطأ في تحليل التعليق:', error);
        toast.error('فشل في تحليل التعليق');
        return;
      }

      await fetchComments();
      toast.success('تم تحليل التعليق بنجاح');

    } catch (error) {
      console.error('خطأ في تحليل التعليق:', error);
      toast.error('حدث خطأ في تحليل التعليق');
    }
  };

  // تنسيق التاريخ
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'الآن';
    if (diffInMinutes < 60) return `منذ ${diffInMinutes} دقيقة`;
    if (diffInMinutes < 1440) return `منذ ${Math.floor(diffInMinutes / 60)} ساعة`;
    return date.toLocaleDateString('ar-SA');
  };

  // عرض تعليق واحد
  const CommentItem: React.FC<{ comment: Comment; isReply?: boolean }> = ({
    comment,
    isReply = false
  }) => {
    const isAuthor = comment.author_id === currentUser.id;

    return (
      <div className={`p-4 ${isReply ? 'ml-8 border-l-2 border-gray-200' : 'border rounded-lg'} bg-white`}>
        <div className="flex items-start gap-3">
          <Avatar className="w-8 h-8">
            <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${comment.author_name}`} />
            <AvatarFallback>
              <User className="w-4 h-4" />
            </AvatarFallback>
          </Avatar>

          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="font-medium text-sm">{comment.author_name}</span>
              <span className="text-xs text-gray-500 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {formatDate(comment.created_at)}
              </span>
              {comment.updated_at !== comment.created_at && (
                <Badge variant="outline" className="text-xs">معدل</Badge>
              )}
            </div>

            {editingComment === comment.id ? (
              <div className="space-y-2">
                <Textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="min-h-[80px]"
                  placeholder="عدل التعليق..."
                />
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => updateComment(comment.id)}>
                    حفظ
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setEditingComment(null);
                      setEditContent('');
                    }}
                  >
                    إلغاء
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-sm text-gray-700 mb-3 leading-relaxed">
                {comment.content}
              </div>
            )}

            <div className="flex items-center gap-2">
              {!isReply && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setReplyingTo(comment.id)}
                  className="h-7 px-2 text-xs"
                >
                  <Reply className="w-3 h-3 ml-1" />
                  رد
                </Button>
              )}

              <Button
                size="sm"
                variant="ghost"
                onClick={() => resolveComment(comment.id)}
                className="h-7 px-2 text-xs text-green-600 hover:text-green-700"
              >
                <Check className="w-3 h-3 ml-1" />
                تم الحل
              </Button>

              {isAuthor && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 w-7 p-0"
                    >
                      <MoreHorizontal className="w-3 h-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem
                      onClick={() => {
                        setEditingComment(comment.id);
                        setEditContent(comment.content);
                      }}
                    >
                      <Edit className="w-4 h-4 ml-2" />
                      تعديل
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => deleteComment(comment.id)}
                      className="text-red-600"
                    >
                      <Trash2 className="w-4 h-4 ml-2" />
                      حذف
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>

            {/* عرض النموذج للرد */}
            {replyingTo === comment.id && (
              <div className="mt-3 p-3 border rounded-lg bg-gray-50">
                <Textarea
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  placeholder="اكتب ردك هنا..."
                  className="mb-2 min-h-[60px]"
                />
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => addReply(comment.id)}>
                    إرسال الرد
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setReplyingTo(null);
                      setReplyContent('');
                    }}
                  >
                    إلغاء
                  </Button>
                </div>
              </div>
            )}

            {/* عرض الردود */}
            {comment.replies && comment.replies.length > 0 && (
              <div className="mt-4 space-y-3">
                {comment.replies.map(reply => (
                  <CommentItem key={reply.id} comment={reply} isReply={true} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  useEffect(() => {
    fetchComments();

    // إعداد real-time subscription للتعليقات
    const subscription = supabase
      .channel(`comments-${documentId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'comments',
          filter: `document_id=eq.${documentId}`
        },
        (payload) => {
          console.log('تحديث التعليقات:', payload);
          fetchComments();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [documentId]);

  return (
    <div className={`bg-gray-50 ${className}`}>
      <div className="p-4 border-b bg-white">
        <div className="flex items-center gap-2 mb-4">
          <MessageCircle className="w-5 h-5 text-gray-600" />
          <h3 className="font-semibold">التعليقات ({comments.length})</h3>
        </div>

        {/* إضافة تعليق جديد */}
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <Avatar className="w-8 h-8">
              <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${currentUser.name}`} />
              <AvatarFallback>
                <User className="w-4 h-4" />
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <Textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="أضف تعليقاً..."
                className="min-h-[80px]"
              />
            </div>
          </div>
          <div className="flex justify-end">
            <Button
              onClick={addComment}
              disabled={!newComment.trim()}
              size="sm"
            >
              إضافة تعليق
            </Button>
          </div>
        </div>
      </div>

      {/* قائمة التعليقات */}
      <div className="p-4">
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <p className="text-sm text-gray-600">جاري تحميل التعليقات...</p>
          </div>
        ) : comments.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <MessageCircle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>لا توجد تعليقات بعد</p>
            <p className="text-sm">كن أول من يضيف تعليقاً على هذا المستند</p>
          </div>
        ) : (
          <div className="space-y-4">
            {comments.map(comment => (
              <CommentItem key={comment.id} comment={comment} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CommentsSystem;
