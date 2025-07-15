'use client';

import React, { useState, useEffect } from 'react';
import { Heart, Clock, User, ExternalLink, Trash2, BookOpen } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import toast from 'react-hot-toast';

interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  authorName: string;
  publishedAt: string;
  featuredImage?: string | null;
  categoryId: string;
  readingTime: number;
}

interface Like {
  id: string;
  articleId: string;
  likedAt: string;
  article: Article;
}

interface LikedArticlesTabProps {
  userId: string;
  darkMode?: boolean;
}

export default function LikedArticlesTab({ userId, darkMode = false }: LikedArticlesTabProps) {
  const [likes, setLikes] = useState<Like[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  // جلب الإعجابات
  const fetchLikes = async (pageNum: number = 1, append: boolean = false) => {
    try {
      if (pageNum === 1) setLoading(true);
      else setLoadingMore(true);

      const response = await fetch(`/api/user/likes?userId=${userId}&page=${pageNum}&limit=10`);
      const result = await response.json();

      if (result.success) {
        const newLikes = result.data.likes || [];
        
        if (append) {
          setLikes(prev => [...prev, ...newLikes]);
        } else {
          setLikes(newLikes);
        }
        
        setHasMore(result.data.pagination?.hasMore || false);
        setPage(pageNum);
      } else {
        throw new Error(result.error || 'فشل في جلب الإعجابات');
      }
    } catch (error) {
      console.error('خطأ في جلب الإعجابات:', error);
      toast.error('حدث خطأ في تحميل الإعجابات');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  // إزالة الإعجاب
  const removeLike = async (articleId: string) => {
    try {
      const response = await fetch(`/api/user/likes?userId=${userId}&articleId=${articleId}`, {
        method: 'DELETE'
      });

      const result = await response.json();
      
      if (result.success) {
        setLikes(prev => prev.filter(like => like.articleId !== articleId));
        toast.success('تم إزالة الإعجاب بنجاح');
      } else {
        throw new Error(result.error || 'فشل في إزالة الإعجاب');
      }
    } catch (error) {
      console.error('خطأ في إزالة الإعجاب:', error);
      toast.error('حدث خطأ في إزالة الإعجاب');
    }
  };

  // تحميل المزيد
  const loadMore = () => {
    if (!loadingMore && hasMore) {
      fetchLikes(page + 1, true);
    }
  };

  // تحميل الإعجابات عند بداية التحميل
  useEffect(() => {
    if (userId) {
      fetchLikes();
    }
  }, [userId]);

  // تنسيق التاريخ
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return 'اليوم';
    if (diffDays === 2) return 'أمس';
    if (diffDays <= 7) return `منذ ${diffDays} أيام`;
    if (diffDays <= 30) return `منذ ${Math.ceil(diffDays / 7)} أسابيع`;
    return date.toLocaleDateString('ar-SA');
  };

  if (loading) {
    return (
      <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-sm p-6`}>
        <h3 className={`text-lg font-bold mb-6 flex items-center gap-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          <Heart className="w-5 h-5 text-red-500" />
          المقالات المُعجب بها
        </h3>
        
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'} animate-pulse`}>
              <div className="flex gap-4">
                <div className={`w-20 h-20 ${darkMode ? 'bg-gray-600' : 'bg-gray-300'} rounded-lg`}></div>
                <div className="flex-1">
                  <div className={`h-4 ${darkMode ? 'bg-gray-600' : 'bg-gray-300'} rounded mb-2`}></div>
                  <div className={`h-3 ${darkMode ? 'bg-gray-600' : 'bg-gray-300'} rounded mb-2 w-3/4`}></div>
                  <div className={`h-3 ${darkMode ? 'bg-gray-600' : 'bg-gray-300'} rounded w-1/2`}></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-sm p-6`}>
      <div className="flex items-center justify-between mb-6">
        <h3 className={`text-lg font-bold flex items-center gap-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          <Heart className="w-5 h-5 text-red-500" />
          المقالات المُعجب بها
        </h3>
        <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          {likes.length} مقال
        </span>
      </div>

      {likes.length === 0 ? (
        <div className="text-center py-12">
          <Heart className={`w-16 h-16 mx-auto mb-4 ${darkMode ? 'text-gray-600' : 'text-gray-300'}`} />
          <h4 className={`text-lg font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            لا توجد مقالات مُعجب بها
          </h4>
          <p className={`text-sm mb-6 ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
            ابدأ بالإعجاب بالمقالات التي تستمتع بقراءتها
          </p>
          <Link 
            href="/"
            className="inline-flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all"
          >
            <BookOpen className="w-4 h-4" />
            تصفح المقالات
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {likes.map((like) => (
            <div 
              key={like.id}
              className={`group p-4 rounded-lg border ${
                darkMode 
                  ? 'bg-gray-700 border-gray-600 hover:bg-gray-650' 
                  : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
              } transition-all duration-200`}
            >
              <div className="flex gap-4">
                {/* صورة المقال */}
                <div className="flex-shrink-0">
                  {like.article.featuredImage ? (
                    <Image
                      src={like.article.featuredImage}
                      alt={like.article.title}
                      width={80}
                      height={80}
                      className="w-20 h-20 object-cover rounded-lg"
                    />
                  ) : (
                    <div className={`w-20 h-20 ${darkMode ? 'bg-gray-600' : 'bg-gray-300'} rounded-lg flex items-center justify-center`}>
                      <BookOpen className={`w-8 h-8 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                    </div>
                  )}
                </div>

                {/* محتوى المقال */}
                <div className="flex-1 min-w-0">
                  <Link 
                    href={`/article/${like.article.slug}`}
                    className={`block mb-2 ${darkMode ? 'text-white hover:text-blue-400' : 'text-gray-900 hover:text-blue-600'} transition-colors`}
                  >
                    <h4 className="font-medium line-clamp-2 group-hover:underline">
                      {like.article.title}
                    </h4>
                  </Link>
                  
                  <p className={`text-sm mb-3 line-clamp-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {like.article.excerpt}
                  </p>
                  
                  <div className={`flex items-center gap-4 text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                    <span className="flex items-center gap-1">
                      <User className="w-3 h-3" />
                      {like.article.authorName}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {like.article.readingTime} دقائق
                    </span>
                    <span className="flex items-center gap-1">
                      <Heart className="w-3 h-3 text-red-500" />
                      أُعجبت به {formatDate(like.likedAt)}
                    </span>
                  </div>
                </div>

                {/* أزرار التحكم */}
                <div className="flex-shrink-0 flex flex-col gap-2">
                  <Link
                    href={`/article/${like.article.slug}`}
                    className={`p-2 rounded-lg ${
                      darkMode 
                        ? 'text-gray-400 hover:text-white hover:bg-gray-600' 
                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200'
                    } transition-all`}
                    title="قراءة المقال"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </Link>
                  
                  <button
                    onClick={() => removeLike(like.articleId)}
                    className={`p-2 rounded-lg ${
                      darkMode 
                        ? 'text-gray-400 hover:text-red-400 hover:bg-gray-600' 
                        : 'text-gray-500 hover:text-red-600 hover:bg-gray-200'
                    } transition-all`}
                    title="إزالة الإعجاب"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}

          {/* زر تحميل المزيد */}
          {hasMore && (
            <div className="text-center pt-4">
              <button
                onClick={loadMore}
                disabled={loadingMore}
                className={`px-6 py-3 rounded-lg font-medium transition-all ${
                  darkMode 
                    ? 'bg-gray-700 text-white hover:bg-gray-600 disabled:bg-gray-800' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:bg-gray-50'
                } disabled:cursor-not-allowed`}
              >
                {loadingMore ? (
                  <span className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                    جاري التحميل...
                  </span>
                ) : (
                  'تحميل المزيد'
                )}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
} 