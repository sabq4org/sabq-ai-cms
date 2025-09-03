'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { getArticleLink } from '@/lib/utils';
import { 
  Heart, 
  Calendar, 
  Eye, 
  Clock, 
  Search, 
  Filter,
  ArrowLeft,
  Loader2,
  HeartOff,
  TrendingUp,
  BookOpen,
  Star
} from 'lucide-react';
import { formatRelativeDate, formatFullDate } from '@/lib/date-utils';
import { getImageUrl } from '@/lib/utils';
import { useDarkMode } from "@/hooks/useDarkMode";

interface LikedArticle {
  id: string;
  title: string;
  excerpt: string;
  featured_image: string;
  published_at: string;
  liked_at: string;
  views: number;
  likes: number;
  saves: number;
  reading_time: number;
  categories: {
    id: string;
    name: string;
    color: string;
    icon?: string;
  }[];
  author?: {
    id: string;
    name: string;
    avatar?: string;
  };
}

interface ApiResponse {
  success: boolean;
  data: {
    articles: LikedArticle[];
    total: number;
    page: number;
    totalPages: number;
    hasMore: boolean;
  };
  error?: string;
}

export default function LikesPage() {
  const { darkMode } = useDarkMode();
  const router = useRouter();
  const [likedArticles, setLikedArticles] = useState<LikedArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [removing, setRemoving] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'liked_date' | 'published_date' | 'popularity'>('liked_date');
  const [showFilters, setShowFilters] = useState(false);
  const [stats, setStats] = useState({ totalLikes: 0, thisMonth: 0, mostLikedCategory: '' });
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const userId = localStorage.getItem('user_id');
    const userData = localStorage.getItem('user');

    if (!userId || userId === 'anonymous' || !userData) {
      router.push('/login?redirect=/profile/likes');
      return;
    }

    fetchLikedArticles();
  };

  const fetchLikedArticles = async (pageNum = 1, reset = true) => {
    try {
      if (pageNum === 1) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      const userId = localStorage.getItem('user_id');
      const response = await fetch(`/api/users/me/likes?page=${pageNum}&limit=12&search=${encodeURIComponent(searchQuery)}&sortBy=${sortBy}`, {
        headers: {
          'user-id': userId || ''
        }
      });
      
      if (response.ok) {
        const data: ApiResponse = await response.json();
        if (data.success && data.data) {
          if (reset) {
            setLikedArticles(data.data.articles);
          } else {
            setLikedArticles(prev => [...prev, ...data.data.articles]);
          }
          setHasMore(data.data.hasMore);
          setPage(pageNum);
          
          // حساب الإحصائيات
          if (pageNum === 1) {
            calculateStats(data.data.articles, data.data.total);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching liked articles:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const calculateStats = (articles: LikedArticle[], total: number) => {
    const thisMonthStart = new Date();
    thisMonthStart.setDate(1);
    thisMonthStart.setHours(0, 0, 0, 0);
    
    const thisMonthLikes = articles.filter(article => 
      new Date(article.liked_at) >= thisMonthStart
    ).length;

    const categoryCount = articles.reduce((acc, article) => {
      article.categories.forEach(cat => {
        acc[cat.name] = (acc[cat.name] || 0) + 1;
      });
      return acc;
    }, {} as Record<string, number>);

    const mostLikedCategory = Object.entries(categoryCount)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || '';

    setStats({
      totalLikes: total,
      thisMonth: thisMonthLikes,
      mostLikedCategory
    });
  };

  const handleRemoveLike = async (articleId: string) => {
    setRemoving(articleId);
    try {
      const userId = localStorage.getItem('user_id');
      const response = await fetch(`/api/users/me/likes?articleId=${articleId}`, {
        method: 'DELETE',
        headers: { 
          'Content-Type': 'application/json',
          'user-id': userId || ''
        }
      });

      if (response.ok) {
        setLikedArticles(prev => prev.filter(article => article.id !== articleId));
        // تحديث الإحصائيات
        setStats(prev => ({
          ...prev,
          totalLikes: Math.max(0, prev.totalLikes - 1)
        }));
      }
    } catch (error) {
      console.error('Error removing like:', error);
    } finally {
      setRemoving(null);
    }
  };

  // إعادة جلب البيانات عند تغيير البحث أو الترتيب
  useEffect(() => {
    if (loading) return; // تجنب الاستدعاء المتكرر أثناء التحميل الأولي
    const timeoutId = setTimeout(() => {
      fetchLikedArticles(1, true);
    }, 500); // تأخير للبحث المباشر

    return () => clearTimeout(timeoutId);
  }, [searchQuery, sortBy]);

  const loadMore = () => {
    if (hasMore && !loadingMore) {
      fetchLikedArticles(page + 1, false);
    }
  };

  const filteredArticles = likedArticles
    .filter(article => 
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.categories.some(cat => cat.name.toLowerCase().includes(searchQuery.toLowerCase()))
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'liked_date':
          return new Date(b.liked_at).getTime() - new Date(a.liked_at).getTime();
        case 'published_date':
          return new Date(b.published_at).getTime() - new Date(a.published_at).getTime();
        case 'popularity':
          return (b.likes + b.views) - (a.likes + a.views);
        default:
          return 0;
      }
    });

  if (loading) {
    return (
      <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-red-500 mx-auto mb-4" />
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              جاري تحميل المقالات المعجب بها...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* رأس الصفحة */}
      <div className={`sticky top-0 z-10 ${darkMode ? 'bg-gray-900' : 'bg-white'} border-b ${
        darkMode ? 'border-gray-800' : 'border-gray-200'
      } shadow-sm`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.back()}
                className={`p-2 rounded-lg transition-colors ${
                  darkMode 
                    ? 'hover:bg-gray-800 text-gray-400' 
                    : 'hover:bg-gray-100 text-gray-600'
                }`}
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className={`text-2xl font-bold ${
                  darkMode ? 'text-white' : 'text-gray-900'
                } flex items-center gap-2`}>
                  <Heart className="w-7 h-7 text-red-500" />
                  المقالات المعجب بها
                </h1>
                <p className={`text-sm ${
                  darkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  {stats.totalLikes} مقال • {stats.thisMonth} هذا الشهر
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`p-2 rounded-lg transition-colors ${
                darkMode 
                  ? 'hover:bg-gray-800 text-gray-400' 
                  : 'hover:bg-gray-100 text-gray-600'
              }`}
            >
              <Filter className="w-5 h-5" />
            </button>
          </div>

          {/* الإحصائيات السريعة */}
          <div className={`grid grid-cols-3 gap-4 mb-4 ${
            showFilters ? 'block' : 'hidden md:grid'
          }`}>
            <div className={`p-3 rounded-lg ${
              darkMode ? 'bg-gray-800' : 'bg-red-50'
            }`}>
              <div className="flex items-center gap-2">
                <Heart className="w-4 h-4 text-red-500" />
                <span className={`text-xs font-medium ${
                  darkMode ? 'text-gray-400' : 'text-red-600'
                }`}>
                  إجمالي الإعجابات
                </span>
              </div>
              <p className={`text-lg font-bold ${
                darkMode ? 'text-white' : 'text-gray-900'
              }`}>
                {stats.totalLikes}
              </p>
            </div>

            <div className={`p-3 rounded-lg ${
              darkMode ? 'bg-gray-800' : 'bg-blue-50'
            }`}>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-blue-500" />
                <span className={`text-xs font-medium ${
                  darkMode ? 'text-gray-400' : 'text-blue-600'
                }`}>
                  هذا الشهر
                </span>
              </div>
              <p className={`text-lg font-bold ${
                darkMode ? 'text-white' : 'text-gray-900'
              }`}>
                {stats.thisMonth}
              </p>
            </div>

            <div className={`p-3 rounded-lg ${
              darkMode ? 'bg-gray-800' : 'bg-green-50'
            }`}>
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-green-500" />
                <span className={`text-xs font-medium ${
                  darkMode ? 'text-gray-400' : 'text-green-600'
                }`}>
                  التصنيف المفضل
                </span>
              </div>
              <p className={`text-sm font-bold ${
                darkMode ? 'text-white' : 'text-gray-900'
              } truncate`}>
                {stats.mostLikedCategory || 'غير محدد'}
              </p>
            </div>
          </div>

          {/* شريط البحث والفلاتر */}
          <div className={`space-y-3 ${showFilters ? 'block' : 'hidden'}`}>
            <div className="relative">
              <Search className={`absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 ${
                darkMode ? 'text-gray-500' : 'text-gray-400'
              }`} />
              <input
                type="text"
                placeholder="ابحث في المقالات المعجب بها..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full pr-10 pl-4 py-2.5 rounded-xl border transition-colors ${
                  darkMode 
                    ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500' 
                    : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400'
                } focus:outline-none focus:ring-2 focus:ring-red-500`}
              />
            </div>

            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setSortBy('liked_date')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  sortBy === 'liked_date'
                    ? 'bg-red-500 text-white'
                    : darkMode 
                      ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                تاريخ الإعجاب
              </button>
              <button
                onClick={() => setSortBy('published_date')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  sortBy === 'published_date'
                    ? 'bg-red-500 text-white'
                    : darkMode 
                      ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                تاريخ النشر
              </button>
              <button
                onClick={() => setSortBy('popularity')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  sortBy === 'popularity'
                    ? 'bg-red-500 text-white'
                    : darkMode 
                      ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                الأكثر شعبية
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* المحتوى */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {filteredArticles.length === 0 ? (
          <div className="text-center py-16">
            <HeartOff className={`w-16 h-16 mx-auto mb-4 ${
              darkMode ? 'text-gray-700' : 'text-gray-300'
            }`} />
            <h3 className={`text-lg font-semibold mb-2 ${
              darkMode ? 'text-white' : 'text-gray-900'
            }`}>
              لا توجد مقالات معجب بها
            </h3>
            <p className={`text-sm mb-6 ${
              darkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>
              {searchQuery ? 'لم يتم العثور على نتائج للبحث' : 'ابدأ بالإعجاب بالمقالات التي تهمك'}
            </p>
            {!searchQuery && (
              <Link
                href="/"
                className="inline-flex items-center gap-2 px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                <BookOpen className="w-4 h-4" />
                تصفح المقالات
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredArticles.map((article) => (
                <article
                  key={article.id}
                  className={`rounded-xl border overflow-hidden transition-all hover:shadow-lg ${
                    darkMode 
                      ? 'bg-gray-800 border-gray-700 hover:border-gray-600' 
                      : 'bg-white border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {/* صورة المقال */}
                  <Link href={getArticleLink(article)} className="block relative h-48 overflow-hidden">
                    <Image
                      src={getImageUrl(article.featured_image)}
                      alt={article.title}
                      fill
                      className="object-cover transition-transform hover:scale-105"
                    />
                    {/* شارات التصنيفات */}
                    <div className="absolute top-3 right-3 flex gap-2 flex-wrap">
                      {article.categories.slice(0, 2).map((category) => (
                        <span 
                          key={category.id}
                          className="px-3 py-1 rounded-full text-xs font-medium text-white backdrop-blur-sm"
                          style={{ backgroundColor: category.color }}
                        >
                          {category.name}
                        </span>
                      ))}
                    </div>
                    {/* عدد الإعجابات */}
                    <div className="absolute bottom-3 left-3">
                      <div className="flex items-center gap-1 px-2 py-1 bg-black/50 backdrop-blur-sm rounded-lg">
                        <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500" />
                        <span className="text-white text-xs font-medium">
                          {article.likes}
                        </span>
                      </div>
                    </div>
                  </Link>

                  {/* محتوى المقال */}
                  <div className="p-4">
                    <Link href={getArticleLink(article)}>
                      <h3 className={`font-bold text-lg mb-2 line-clamp-2 hover:text-red-500 transition-colors ${
                        darkMode ? 'text-white' : 'text-gray-900'
                      }`}>
                        {article.title}
                      </h3>
                    </Link>

                    <p className={`text-sm line-clamp-2 mb-4 ${
                      darkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      {article.excerpt}
                    </p>

                    {/* معلومات المقال */}
                    <div className="flex items-center justify-between text-xs mb-3">
                      <div className="flex items-center gap-3">
                        <span className={`flex items-center gap-1 ${
                          darkMode ? 'text-gray-500' : 'text-gray-400'
                        }`}>
                          <Eye className="w-3.5 h-3.5" />
                          {article.views.toLocaleString()}
                        </span>
                        <span className={`flex items-center gap-1 ${
                          darkMode ? 'text-gray-500' : 'text-gray-400'
                        }`}>
                          <Clock className="w-3.5 h-3.5" />
                          {article.reading_time} د
                        </span>
                      </div>
                      <span className={`flex items-center gap-1 ${
                        darkMode ? 'text-gray-500' : 'text-gray-400'
                      }`}>
                        <Calendar className="w-3.5 h-3.5" />
                        {formatRelativeDate(article.published_at)}
                      </span>
                    </div>

                    {/* معلومات الإعجاب وزر الإلغاء */}
                    <div className={`flex items-center justify-between pt-3 border-t ${
                      darkMode ? 'border-gray-700' : 'border-gray-100'
                    }`}>
                      <span className={`text-xs flex items-center gap-1 ${
                        darkMode ? 'text-gray-500' : 'text-gray-400'
                      }`}>
                        <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500" />
                        أعجبت به {formatRelativeDate(article.liked_at)}
                      </span>

                      <button
                        onClick={() => handleRemoveLike(article.id)}
                        disabled={removing === article.id}
                        className={`p-1.5 rounded-lg transition-colors ${
                          removing === article.id
                            ? 'opacity-50 cursor-not-allowed'
                            : darkMode 
                              ? 'hover:bg-gray-700 text-red-400' 
                              : 'hover:bg-red-50 text-red-600'
                        }`}
                        title="إلغاء الإعجاب"
                      >
                        {removing === article.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <HeartOff className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            {/* زر تحميل المزيد */}
            {hasMore && (
              <div className="text-center pt-8">
                <button
                  onClick={loadMore}
                  disabled={loadingMore}
                  className={`px-8 py-3 rounded-lg font-medium transition-colors ${
                    loadingMore
                      ? 'opacity-50 cursor-not-allowed'
                      : 'bg-red-500 hover:bg-red-600'
                  } text-white`}
                >
                  {loadingMore ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      جاري التحميل...
                    </div>
                  ) : (
                    'تحميل المزيد'
                  )}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
