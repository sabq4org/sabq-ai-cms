'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { 
  Bookmark, 
  Calendar, 
  Eye, 
  Clock, 
  Trash2, 
  Search, 
  Filter,
  ArrowLeft,
  Loader2,
  BookmarkX
} from 'lucide-react';
import { formatRelativeDate, formatFullDate } from '@/lib/date-utils';
import { getImageUrl } from '@/lib/utils';
import { useDarkModeContext } from '@/contexts/DarkModeContext';

interface SavedArticle {
  id: string;
  title: string;
  excerpt: string;
  featured_image: string;
  published_at: string;
  saved_at: string;
  views: number;
  reading_time: number;
  category: {
    id: string;
    name: string;
    color: string;
  };
  author: {
    id: string;
    name: string;
    avatar?: string;
  };
}

export default function SavedArticlesPage() {
  const router = useRouter();
  const { darkMode } = useDarkModeContext();
  const [savedArticles, setSavedArticles] = useState<SavedArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [removing, setRemoving] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'saved_date' | 'published_date'>('saved_date');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const userId = localStorage.getItem('user_id');
    const userData = localStorage.getItem('user');

    if (!userId || userId === 'anonymous' || !userData) {
      router.push('/login?redirect=/profile/saved');
      return;
    }

    fetchSavedArticles();
  };

  const fetchSavedArticles = async () => {
    try {
      const userId = localStorage.getItem('user_id');
      const response = await fetch(`/api/bookmarks?userId=${userId}`);
      
      if (response.ok) {
        const data = await response.json();
        setSavedArticles(data.bookmarks || []);
      }
    } catch (error) {
      console.error('Error fetching saved articles:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveBookmark = async (articleId: string) => {
    setRemoving(articleId);
    try {
      const userId = localStorage.getItem('user_id');
      const response = await fetch('/api/bookmarks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          itemId: articleId,
          itemType: 'article'
        })
      });

      if (response.ok) {
        setSavedArticles(prev => prev.filter(article => article.id !== articleId));
      }
    } catch (error) {
      console.error('Error removing bookmark:', error);
    } finally {
      setRemoving(null);
    }
  };

  const filteredArticles = savedArticles
    .filter(article => 
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.excerpt.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === 'saved_date') {
        return new Date(b.saved_at).getTime() - new Date(a.saved_at).getTime();
      } else {
        return new Date(b.published_at).getTime() - new Date(a.published_at).getTime();
      }
    });

  if (loading) {
    return (
      <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-blue-500 mx-auto mb-4" />
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              جاري تحميل المحفوظات...
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
                }`}>
                  محفوظاتي
                </h1>
                <p className={`text-sm ${
                  darkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  {filteredArticles.length} مقال محفوظ
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

          {/* شريط البحث والفلاتر */}
          <div className={`space-y-3 ${showFilters ? 'block' : 'hidden'}`}>
            <div className="relative">
              <Search className={`absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 ${
                darkMode ? 'text-gray-500' : 'text-gray-400'
              }`} />
              <input
                type="text"
                placeholder="ابحث في المحفوظات..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full pr-10 pl-4 py-2.5 rounded-xl border transition-colors ${
                  darkMode 
                    ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500' 
                    : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400'
                } focus:outline-none focus:ring-2 focus:ring-blue-500`}
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setSortBy('saved_date')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  sortBy === 'saved_date'
                    ? 'bg-blue-500 text-white'
                    : darkMode 
                      ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                تاريخ الحفظ
              </button>
              <button
                onClick={() => setSortBy('published_date')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  sortBy === 'published_date'
                    ? 'bg-blue-500 text-white'
                    : darkMode 
                      ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                تاريخ النشر
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* المحتوى */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {filteredArticles.length === 0 ? (
          <div className="text-center py-16">
            <BookmarkX className={`w-16 h-16 mx-auto mb-4 ${
              darkMode ? 'text-gray-700' : 'text-gray-300'
            }`} />
            <h3 className={`text-lg font-semibold mb-2 ${
              darkMode ? 'text-white' : 'text-gray-900'
            }`}>
              لا توجد مقالات محفوظة
            </h3>
            <p className={`text-sm ${
              darkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>
              {searchQuery ? 'لم يتم العثور على نتائج للبحث' : 'ابدأ بحفظ المقالات التي تهمك لقراءتها لاحقاً'}
            </p>
          </div>
        ) : (
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
                <Link href={`/article/${article.id}`} className="block relative h-48 overflow-hidden">
                  <Image
                    src={getImageUrl(article.featured_image)}
                    alt={article.title}
                    fill
                    className="object-cover transition-transform hover:scale-105"
                  />
                  {/* شارة التصنيف */}
                  <div className="absolute top-3 right-3">
                    <span 
                      className="px-3 py-1 rounded-full text-xs font-medium text-white backdrop-blur-sm"
                      style={{ backgroundColor: article.category.color }}
                    >
                      {article.category.name}
                    </span>
                  </div>
                </Link>

                {/* محتوى المقال */}
                <div className="p-4">
                  <Link href={`/article/${article.id}`}>
                    <h3 className={`font-bold text-lg mb-2 line-clamp-2 hover:text-blue-500 transition-colors ${
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
                        {article.views}
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

                  {/* معلومات الحفظ وزر الحذف */}
                  <div className={`flex items-center justify-between pt-3 border-t ${
                    darkMode ? 'border-gray-700' : 'border-gray-100'
                  }`}>
                    <span className={`text-xs flex items-center gap-1 ${
                      darkMode ? 'text-gray-500' : 'text-gray-400'
                    }`}>
                      <Bookmark className="w-3.5 h-3.5" />
                      حُفظ {formatRelativeDate(article.saved_at)}
                    </span>

                    <button
                      onClick={() => handleRemoveBookmark(article.id)}
                      disabled={removing === article.id}
                      className={`p-1.5 rounded-lg transition-colors ${
                        removing === article.id
                          ? 'opacity-50 cursor-not-allowed'
                          : darkMode 
                            ? 'hover:bg-gray-700 text-red-400' 
                            : 'hover:bg-red-50 text-red-600'
                      }`}
                      title="إزالة من المحفوظات"
                    >
                      {removing === article.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 