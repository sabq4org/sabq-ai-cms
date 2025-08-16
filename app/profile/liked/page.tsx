'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Heart, Clock, Eye, User } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'react-hot-toast';

interface LikedArticle {
  id: string;
  title: string;
  summary: string;
  slug: string;
  created_at: string;
  author_name: string;
  views: number;
  likes: number;
  saves: number;
  featured_image_url?: string;
}

export default function LikedArticlesPage() {
  const { user } = useAuth();
  const [articles, setArticles] = useState<LikedArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const fetchLikedArticles = async () => {
      try {
        const response = await fetch('/api/user/likes', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('auth-token')}`,
          }
        });

        if (!response.ok) {
          throw new Error('فشل في تحميل المقالات المعجب بها');
        }

        const data = await response.json();
        setArticles(data.articles || []);
      } catch (err) {
        console.error('Error fetching liked articles:', err);
        setError('حدث خطأ في تحميل المقالات المعجب بها');
        toast.error('حدث خطأ في تحميل المقالات');
      } finally {
        setLoading(false);
      }
    };

    fetchLikedArticles();
  }, [user]);

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="text-center py-8">
            <Heart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-700 mb-2">
              يجب تسجيل الدخول
            </h2>
            <p className="text-gray-500">
              يجب تسجيل الدخول لرؤية المقالات المعجب بها
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          {[1, 2, 3].map(i => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="flex gap-4">
                  <div className="w-24 h-24 bg-gray-200 rounded"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="text-center py-8">
            <div className="text-red-500 text-lg mb-2">❌</div>
            <h2 className="text-xl font-semibold text-gray-700 mb-2">
              حدث خطأ
            </h2>
            <p className="text-gray-500">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8" dir="rtl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-3 mb-2">
          <Heart className="w-8 h-8 text-red-500" />
          المقالات المعجب بها
        </h1>
        <p className="text-gray-600">
          المقالات التي أعجبتك ({articles.length} مقال)
        </p>
      </div>

      {articles.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-600 mb-2">
              لا توجد مقالات معجب بها
            </h2>
            <p className="text-gray-500 mb-4">
              لم تقم بالإعجاب بأي مقال بعد
            </p>
            <Link 
              href="/news"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              تصفح المقالات
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {articles.map((article) => (
            <Card key={article.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex gap-4">
                  {/* صورة المقال */}
                  <div className="flex-shrink-0">
                    {article.featured_image_url ? (
                      <img
                        src={article.featured_image_url}
                        alt={article.title}
                        className="w-24 h-24 object-cover rounded-lg"
                      />
                    ) : (
                      <div className="w-24 h-24 bg-gray-200 rounded-lg flex items-center justify-center">
                        <Heart className="w-8 h-8 text-gray-400" />
                      </div>
                    )}
                  </div>

                  {/* محتوى المقال */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2 line-clamp-2">
                      <Link 
                        href={`/article/${article.id}`}
                        className="hover:text-blue-600 transition-colors"
                      >
                        {article.title}
                      </Link>
                    </h3>
                    
                    <p className="text-gray-600 mb-3 line-clamp-2">
                      {article.summary}
                    </p>

                    {/* معلومات إضافية */}
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        {article.author_name}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {new Date(article.created_at).toLocaleDateString('ar-SA')}
                      </div>
                      <div className="flex items-center gap-1">
                        <Eye className="w-4 h-4" />
                        {article.views}
                      </div>
                      <div className="flex items-center gap-1">
                        <Heart className="w-4 h-4 text-red-500" />
                        {article.likes}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
