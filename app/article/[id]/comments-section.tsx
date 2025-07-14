'use client';

import { useState, useEffect } from 'react';
import { MessageCircle, Send, User } from 'lucide-react';

interface CommentsSectionProps {
  articleId: string;
}

interface Comment {
  id: string;
  content: string;
  author_name: string;
  created_at: string;
  likes: number;
}

export default function CommentsSection({ articleId }: CommentsSectionProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // جلب التعليقات عند تحميل المكون
  useEffect(() => {
    fetchComments();
  }, [articleId]);

  const fetchComments = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/articles/${articleId}/comments`);
      if (response.ok) {
        const data = await response.json();
        setComments(data.comments || []);
      }
    } catch (error) {
      console.error('Error fetching comments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newComment.trim()) return;
    
    setSubmitting(true);
    try {
      const response = await fetch(`/api/articles/${articleId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newComment })
      });
      
      if (response.ok) {
        setNewComment('');
        fetchComments(); // إعادة جلب التعليقات
      }
    } catch (error) {
      console.error('Error submitting comment:', error);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <section className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-48 mb-6"></div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24 mb-2"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
      <div className="flex items-center gap-3 mb-6">
        <MessageCircle className="w-6 h-6 text-blue-600" />
        <h2 className="text-2xl font-bold">التعليقات ({comments.length})</h2>
      </div>

      {/* نموذج إضافة تعليق */}
      <form onSubmit={handleSubmitComment} className="mb-8">
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="اكتب تعليقك هنا..."
            className="w-full px-4 py-3 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={3}
          />
          <div className="flex justify-end mt-3">
            <button
              type="submit"
              disabled={submitting || !newComment.trim()}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Send className="w-4 h-4" />
              <span>{submitting ? 'جاري الإرسال...' : 'إرسال التعليق'}</span>
            </button>
          </div>
        </div>
      </form>

      {/* قائمة التعليقات */}
      {comments.length === 0 ? (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>لا توجد تعليقات حتى الآن</p>
          <p className="text-sm mt-2">كن أول من يعلق على هذا المقال!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => (
            <div
              key={comment.id}
              className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-10 h-10 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-sm">{comment.author_name}</h4>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(comment.created_at).toLocaleDateString('ar-SA')}
                    </span>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300">{comment.content}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
} 