'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import TimelineReply from '@/components/forum/TimelineReply';
import { 
  ArrowRight, 
  MessageSquare, 
  Eye, 
  Pin, 
  Lock, 
  Unlock,
  CheckCircle,
  MoreVertical,
  Flag,
  Edit,
  Trash2,
  Share2,
  Bookmark,
  Shield
} from 'lucide-react';
import { toast } from 'react-hot-toast';

interface Topic {
  id: string;
  title: string;
  content: string;
  author: {
    id: string;
    name: string;
    avatar?: string;
    role?: string;
  };
  category: {
    id: string;
    name: string;
    slug: string;
    color: string;
  };
  createdAt: string;
  updatedAt: string;
  views: number;
  replies: number;
  isPinned: boolean;
  isLocked: boolean;
  tags?: string[];
}

interface Reply {
  id: string;
  content: string;
  author: {
    id: string;
    name: string;
    avatar?: string;
    role?: string;
  };
  createdAt: string;
  updatedAt?: string;
  isAccepted?: boolean;
  isPinned?: boolean;
  isHighlighted?: boolean;
  likes: number;
  isLiked?: boolean;
}

export default function TopicPage() {
  const params = useParams();
  const router = useRouter();
  const topicId = params?.id as string;
  
  // نظام الثيم مع حماية من SSR
  const [darkMode, setDarkMode] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // استخدام localStorage لتحديد الثيم
    const theme = localStorage.getItem('sabq-theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setDarkMode(theme === 'dark' || (theme === null && systemPrefersDark));
  }, []);
  
  const [topic, setTopic] = useState<Topic | null>(null);
  const [replies, setReplies] = useState<Reply[]>([]);
  const [loading, setLoading] = useState(true);
  const [replyContent, setReplyContent] = useState('');
  const [isReplying, setIsReplying] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  // التحقق من تسجيل الدخول
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/me', {
          credentials: 'include'
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data.user) {
            setUser(data.user);
          }
        }
      } catch (error) {
        console.error('Auth check failed:', error);
      } finally {
        setCheckingAuth(false);
      }
    };

    checkAuth();
  }, []);

  // جلب بيانات الموضوع الفعلية
  useEffect(() => {
    const fetchTopic = async () => {
      try {
        setLoading(true);
        
        // جلب بيانات الموضوع
        const topicResponse = await fetch(`/api/forum/topics/${topicId}`);
        if (!topicResponse.ok) {
          throw new Error('Topic not found');
        }
        
        const topicData = await topicResponse.json();
        
        // إذا كان الاستجابة تحتوي على topic
        const topic = topicData.topic || topicData;
        
        // تحويل البيانات للتنسيق المطلوب
        setTopic({
          id: topic.id,
          title: topic.title,
          content: topic.content,
          author: {
            id: topic.author?.id || topic.author_id,
            name: topic.author?.name || 'مستخدم',
            avatar: topic.author?.avatar || topic.author?.avatar_url,
            role: topic.author?.role
          },
          category: {
            id: topic.category?.id || topic.category_id,
            name: topic.category?.name || 'عام',
            slug: topic.category?.slug || 'general',
            color: topic.category?.color || '#3B82F6'
          },
          createdAt: topic.created_at,
          updatedAt: topic.updated_at || topic.created_at,
          views: topic.views || 0,
          replies: topic.replies || topic.replies_count || 0,
          isPinned: topic.is_pinned || false,
          isLocked: topic.is_locked || false,
          tags: topic.tags || []
        });
        
        // جلب الردود
        const repliesResponse = await fetch(`/api/forum/topics/${topicId}/replies`);
        if (repliesResponse.ok) {
          const repliesData = await repliesResponse.json();
          setReplies(repliesData.replies || []);
        }
        
      } catch (error) {
        console.error('Error fetching topic:', error);
        setTopic(null);
      } finally {
        setLoading(false);
      }
    };
    
    if (topicId) {
      fetchTopic();
    }
  }, [topicId]);

  const handleReply = async () => {
    if (!replyContent.trim()) return;
    
    setIsReplying(true);
    
    try {
      const response = await fetch(`/api/forum/topics/${topicId}/replies`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ content: replyContent })
      });

      if (response.ok) {
        const result = await response.json();
        
        // إضافة الرد الجديد مباشرة للقائمة
        if (result.reply) {
          setReplies(prev => [...prev, result.reply]);
          
          // تحديث عدد الردود
          setTopic(prev => prev ? { ...prev, replies: prev.replies + 1 } : prev);
        }
        
        // إظهار رسالة النجاح
        toast.success('تم إضافة ردك بنجاح! 🎉');
        
        // مسح المحتوى
        setReplyContent('');
        
        // التمرير لأسفل لرؤية الرد الجديد
        setTimeout(() => {
          window.scrollTo({ 
            top: document.documentElement.scrollHeight, 
            behavior: 'smooth' 
          });
        }, 100);
      } else {
        const error = await response.json();
        console.error('Error posting reply:', error);
        toast.error(error.error || 'حدث خطأ في إرسال الرد');
      }
    } catch (error) {
      console.error('Error posting reply:', error);
      alert('حدث خطأ في الاتصال بالخادم');
    } finally {
      setIsReplying(false);
    }
  };

  if (loading || !mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!topic) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">الموضوع غير موجود</h2>
          <Link href="/forum" className="text-blue-500 hover:underline">
            العودة للمنتدى
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* الهيدر الرسمي للصحيفة */}
      
      {/* رأس الصفحة */}
      <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-2 text-sm">
            <Link href="/forum" className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
              المنتدى
            </Link>
            <span className="text-gray-400">/</span>
            <Link 
              href={`/forum/category/${topic.category.slug}`}
              className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            >
              {topic.category.name}
            </Link>
            <span className="text-gray-400">/</span>
            <span className={darkMode ? 'text-gray-200' : 'text-gray-700'}>
              {topic.title}
            </span>
          </div>
        </div>
      </div>

      {/* المحتوى الرئيسي */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* رأس الموضوع */}
        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-sm p-6 mb-6`}>
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <span 
                  className="px-3 py-1 rounded-full text-xs text-white"
                  style={{ backgroundColor: topic.category.color }}
                >
                  {topic.category.name}
                </span>
                {topic.isPinned && (
                  <span className="text-yellow-500 text-sm flex items-center gap-1">
                    <Pin className="w-4 h-4" /> مثبت
                  </span>
                )}
                {topic.isLocked && (
                  <span className="text-red-500 text-sm flex items-center gap-1">
                    <Lock className="w-4 h-4" /> مغلق
                  </span>
                )}
              </div>
              
              <h1 className={`text-2xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {topic.title}
              </h1>

              <div className="flex items-center gap-4 text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold ${
                    darkMode ? 'bg-gray-600' : 'bg-gray-400'
                  }`}>
                    {topic.author.name ? topic.author.name.charAt(0).toUpperCase() : '؟'}
                  </div>
                  <span>{topic.author.name}</span>
                  {topic.author.role && (
                    <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs">
                      {topic.author.role}
                    </span>
                  )}
                </div>
                <span>•</span>
                <span>{new Date(topic.createdAt).toLocaleDateString('ar-SA')}</span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Eye className="w-4 h-4" /> {topic.views}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <MessageSquare className="w-4 h-4" /> {topic.replies}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button className={`p-2 rounded-lg ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}>
                <Share2 className="w-5 h-5" />
              </button>
              <button className={`p-2 rounded-lg ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}>
                <Bookmark className="w-5 h-5" />
              </button>
              <button className={`p-2 rounded-lg ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}>
                <MoreVertical className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className={`prose max-w-none ${darkMode ? 'prose-invert' : ''}`}>
            <p className="whitespace-pre-wrap">{topic.content}</p>
          </div>

          {topic.tags && topic.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {topic.tags.map((tag) => (
                <span 
                  key={tag}
                  className={`px-3 py-1 rounded-full text-xs ${
                    darkMode 
                      ? 'bg-gray-700 text-gray-300' 
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* قسم الردود مع Timeline */}
        <div className="mb-6">
          <h2 className={`text-xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            الردود ({replies.length})
          </h2>
          
          {replies.length > 0 ? (
            <TimelineReply replies={replies} />
          ) : (
            <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-sm p-12 text-center`}>
              <MessageSquare className={`w-16 h-16 ${darkMode ? 'text-gray-600' : 'text-gray-300'} mx-auto mb-4`} />
              <p className={`text-lg ${darkMode ? 'text-gray-400' : 'text-gray-500'} mb-2`}>
                لا توجد ردود بعد
              </p>
              <p className={`text-sm ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                كن أول من يشارك برأيه! 💬
              </p>
            </div>
          )}
        </div>

        {/* صندوق الرد */}
        {!topic.isLocked && (
          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-sm p-6`}>
            {user && user.emailVerified ? (
              <>
                <h3 className={`text-lg font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  أضف ردك
                </h3>
                <div className={`flex items-center gap-2 mb-3 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  <Shield className="w-4 h-4 text-green-500" />
                  <span>تنشر باسم: <strong>{user.name}</strong></span>
                </div>
                <textarea
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  placeholder="اكتب ردك هنا..."
                  className={`w-full p-4 rounded-lg border ${
                    darkMode 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-gray-50 border-gray-200'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  rows={4}
                />
                <div className="flex justify-end mt-4">
                  <button
                    onClick={handleReply}
                    disabled={isReplying || !replyContent.trim()}
                    className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isReplying ? 'جاري الإرسال...' : 'إرسال الرد'}
                  </button>
                </div>
              </>
            ) : (
              <div className="text-center py-8">
                <Shield className={`w-16 h-16 ${darkMode ? 'text-gray-600' : 'text-gray-300'} mx-auto mb-4`} />
                <p className={`text-lg ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-4`}>
                  يجب تسجيل الدخول للمشاركة في النقاش
                </p>
                <Link href={`/login?redirect=/forum/topic/${topicId}`}>
                  <button className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
                    تسجيل الدخول
                  </button>
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
} 