'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Calendar, Clock, Eye, Share2, Heart, 
  TrendingUp, Newspaper, Play, ChevronLeft, Settings 
} from 'lucide-react';

interface Article {
  id: string;
  title: string;
  subtitle?: string;
  category: string;
  image?: string;
  author?: string;
  publish_at: string;
  views_count?: number;
  likes_count?: number;
  status: string;
}

export default function HomePage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    try {
      const response = await fetch('/api/articles');
      const data = await response.json();
      
      if (data.success && data.data) {
        // فلترة المقالات المنشورة فقط
        const publishedArticles = data.data.filter(
          (article: Article) => article.status === 'published'
        );
        setArticles(publishedArticles);
      }
    } catch (error) {
      console.error('خطأ في جلب المقالات:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      const diffInMinutes = Math.floor(diffInHours * 60);
      return `منذ ${diffInMinutes} دقيقة`;
    } else if (diffInHours < 24) {
      return `منذ ${Math.floor(diffInHours)} ساعة`;
    } else {
      return date.toLocaleDateString('ar-SA', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    }
  };

  const categories = [
    { id: 'all', name: 'جميع الأخبار', color: 'gray' },
    { id: 'local', name: 'محلي', color: 'blue' },
    { id: 'sports', name: 'رياضة', color: 'green' },
    { id: 'international', name: 'دولي', color: 'red' },
    { id: 'economy', name: 'اقتصاد', color: 'yellow' },
    { id: 'tech', name: 'تقنية', color: 'purple' }
  ];

  const filteredArticles = selectedCategory === 'all' 
    ? articles 
    : articles.filter(article => article.category === selectedCategory);

  // المقال الرئيسي
  const mainArticle = filteredArticles[0];
  // المقالات الثانوية
  const secondaryArticles = filteredArticles.slice(1, 4);
  // باقي المقالات
  const otherArticles = filteredArticles.slice(4);

  if (loading) {
    return (
      <div className="min-h-screen">
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      
      {/* القسم الرئيسي */}
      <main className="container mx-auto px-4 py-8">
        {/* فلتر التصنيفات */}
        <div className="mb-8">
          <div className="flex items-center gap-4 overflow-x-auto pb-2">
            {categories.map(category => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-6 py-2 rounded-full font-medium transition-all whitespace-nowrap ${
                  selectedCategory === category.id
                    ? `bg-${category.color}-600 text-white`
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>

        {filteredArticles.length === 0 ? (
          <div className="text-center py-20">
            <Newspaper className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">لا توجد أخبار في هذا التصنيف</p>
          </div>
        ) : (
          <>
            {/* القسم العلوي - المقال الرئيسي والمقالات الثانوية */}
            <div className="grid lg:grid-cols-3 gap-6 mb-12">
              {/* المقال الرئيسي */}
              {mainArticle && (
                <div className="lg:col-span-2">
                  <Link href={`/article/${mainArticle.id}`}>
                    <article className="bg-white rounded-xl shadow-md overflow-hidden group hover:shadow-xl transition-shadow">
                      <div className="relative h-96 overflow-hidden">
                        {mainArticle.image ? (
                          <img 
                            src={mainArticle.image} 
                            alt={mainArticle.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                            <Newspaper className="w-20 h-20 text-white/50" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent"></div>
                        <div className="absolute bottom-0 right-0 left-0 p-6 text-white">
                          <span className="inline-block px-3 py-1 bg-blue-600 text-sm rounded-full mb-3">
                            {mainArticle.category}
                          </span>
                          <h2 className="text-3xl font-bold mb-2 leading-tight">
                            {mainArticle.title}
                          </h2>
                          {mainArticle.subtitle && (
                            <p className="text-lg text-gray-200 mb-3">
                              {mainArticle.subtitle}
                            </p>
                          )}
                          <div className="flex items-center gap-4 text-sm text-gray-300">
                            <span className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {formatDate(mainArticle.publish_at)}
                            </span>
                            {mainArticle.author && (
                              <span>بقلم: {mainArticle.author}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </article>
                  </Link>
                </div>
              )}

              {/* المقالات الثانوية */}
              <div className="space-y-4">
                {secondaryArticles.map(article => (
                  <Link key={article.id} href={`/article/${article.id}`}>
                    <article className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow group">
                      <div className="flex gap-4">
                        <div className="flex-1">
                          <span className="text-xs text-blue-600 font-medium">
                            {article.category}
                          </span>
                          <h3 className="font-bold text-gray-800 mt-1 mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
                            {article.title}
                          </h3>
                          <div className="flex items-center gap-3 text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {formatDate(article.publish_at)}
                            </span>
                          </div>
                        </div>
                        {article.image && (
                          <div className="w-24 h-24 rounded-lg overflow-hidden flex-shrink-0">
                            <img 
                              src={article.image} 
                              alt={article.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                      </div>
                    </article>
                  </Link>
                ))}
              </div>
            </div>

            {/* باقي المقالات */}
            {otherArticles.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                  <TrendingUp className="w-6 h-6 text-blue-600" />
                  آخر الأخبار
                </h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {otherArticles.map(article => (
                    <Link key={article.id} href={`/article/${article.id}`}>
                      <article className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow group">
                        <div className="h-48 overflow-hidden">
                          {article.image ? (
                            <img 
                              src={article.image} 
                              alt={article.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                              <Newspaper className="w-12 h-12 text-gray-400" />
                            </div>
                          )}
                        </div>
                        <div className="p-4">
                          <span className="text-xs text-blue-600 font-medium">
                            {article.category}
                          </span>
                          <h3 className="font-bold text-gray-800 mt-2 mb-3 group-hover:text-blue-600 transition-colors line-clamp-2">
                            {article.title}
                          </h3>
                          <div className="flex items-center justify-between text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {formatDate(article.publish_at)}
                            </span>
                            <div className="flex items-center gap-3">
                              {article.views_count && (
                                <span className="flex items-center gap-1">
                                  <Eye className="w-3 h-3" />
                                  {article.views_count}
                                </span>
                              )}
                              {article.likes_count && (
                                <span className="flex items-center gap-1">
                                  <Heart className="w-3 h-3" />
                                  {article.likes_count}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </article>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {/* رابط سريع للوحة التحكم للمشرفين */}
      <Link
        href="/dashboard"
        className="fixed bottom-8 left-8 bg-gray-800 text-white p-3 rounded-full shadow-lg hover:bg-gray-700 transition-colors group"
        title="لوحة التحكم"
      >
        <Settings className="w-5 h-5" />
        <span className="absolute left-full ml-2 bg-gray-800 text-white px-3 py-1 rounded-md text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
          لوحة التحكم
        </span>
      </Link>
    </div>
  );
} 