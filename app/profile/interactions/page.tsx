'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { 
  Heart, 
  Share2, 
  MessageSquare, 
  Calendar, 
  Eye, 
  Clock, 
  Filter,
  ArrowLeft,
  Loader2,
  Activity,
  TrendingUp,
  Award
} from 'lucide-react';
import { formatRelativeDate } from '@/lib/date-utils';
import { getImageUrl } from '@/lib/utils';

interface InteractionArticle {
  id: string;
  title: string;
  excerpt: string;
  featured_image: string;
  published_at: string;
  views: number;
  reading_time: number;
  category: {
    id: string;
    name: string;
    color: string;
  };
  interaction: {
    type: 'like' | 'share' | 'comment';
    created_at: string;
    points_earned?: number;
  };
}

interface InteractionStats {
  totalLikes: number;
  totalShares: number;
  totalComments: number;
  totalPoints: number;
  mostInteractedCategory: {
    name: string;
    count: number;
  };
}

export default function InteractionsPage() {
  const router = useRouter();
  const [interactions, setInteractions] = useState<InteractionArticle[]>([]);
  const [stats, setStats] = useState<InteractionStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<'all' | 'like' | 'share' | 'comment'>('all');
  const [sortBy, setSortBy] = useState<'recent' | 'points'>('recent');

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const userId = localStorage.getItem('user_id');
    const userData = localStorage.getItem('user');

    if (!userId || userId === 'anonymous' || !userData) {
      router.push('/login?redirect=/profile/interactions');
      return;
    }

    fetchInteractions();
  };

  const fetchInteractions = async () => {
    try {
      const userId = localStorage.getItem('user_id');
      
      // جلب التفاعلات
      const interactionsResponse = await fetch(`/api/user/interactions?userId=${userId}`);
      if (interactionsResponse.ok) {
        const data = await interactionsResponse.json();
        setInteractions(data.interactions || []);
        
        // حساب الإحصائيات
        const stats: InteractionStats = {
          totalLikes: 0,
          totalShares: 0,
          totalComments: 0,
          totalPoints: 0,
          mostInteractedCategory: { name: 'غير محدد', count: 0 }
        };

        const categoryCount: Record<string, number> = {};

        data.interactions?.forEach((item: InteractionArticle) => {
          switch (item.interaction.type) {
            case 'like':
              stats.totalLikes++;
              stats.totalPoints += item.interaction.points_earned || 1;
              break;
            case 'share':
              stats.totalShares++;
              stats.totalPoints += item.interaction.points_earned || 3;
              break;
            case 'comment':
              stats.totalComments++;
              stats.totalPoints += item.interaction.points_earned || 4;
              break;
          }

          // حساب التصنيفات الأكثر تفاعلاً
          const categoryName = item.category.name;
          categoryCount[categoryName] = (categoryCount[categoryName] || 0) + 1;
        });

        // إيجاد التصنيف الأكثر تفاعلاً
        const mostInteracted = Object.entries(categoryCount).reduce((max, [name, count]) => {
          return count > max.count ? { name, count } : max;
        }, { name: 'غير محدد', count: 0 });

        stats.mostInteractedCategory = mostInteracted;
        setStats(stats);
      }
    } catch (error) {
      console.error('Error fetching interactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredInteractions = interactions
    .filter(item => filterType === 'all' || item.interaction.type === filterType)
    .sort((a, b) => {
      if (sortBy === 'recent') {
        return new Date(b.interaction.created_at).getTime() - new Date(a.interaction.created_at).getTime();
      } else {
        return (b.interaction.points_earned || 0) - (a.interaction.points_earned || 0);
      }
    });

  const getInteractionIcon = (type: string) => {
    switch (type) {
      case 'like': return Heart;
      case 'share': return Share2;
      case 'comment': return MessageSquare;
      default: return Activity;
    }
  };

  const getInteractionColor = (type: string) => {
    switch (type) {
      case 'like': return 'text-red-500';
      case 'share': return 'text-blue-500';
      case 'comment': return 'text-green-500';
      default: return 'text-gray-500';
    }
  };

  if (loading) {
    return (
      <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-blue-500 mx-auto mb-4" />
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              جاري تحميل التفاعلات...
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
                  تفاعلاتي
                </h1>
                <p className={`text-sm ${
                  darkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  {filteredInteractions.length} تفاعل
                </p>
              </div>
            </div>
          </div>

          {/* الإحصائيات */}
          {stats && (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">
              <div className={`p-3 rounded-xl ${
                darkMode ? 'bg-gray-800' : 'bg-gray-100'
              }`}>
                <div className="flex items-center gap-2 mb-1">
                  <Heart className="w-4 h-4 text-red-500" />
                  <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    إعجابات
                  </span>
                </div>
                <p className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {stats.totalLikes}
                </p>
              </div>

              <div className={`p-3 rounded-xl ${
                darkMode ? 'bg-gray-800' : 'bg-gray-100'
              }`}>
                <div className="flex items-center gap-2 mb-1">
                  <Share2 className="w-4 h-4 text-blue-500" />
                  <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    مشاركات
                  </span>
                </div>
                <p className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {stats.totalShares}
                </p>
              </div>

              <div className={`p-3 rounded-xl ${
                darkMode ? 'bg-gray-800' : 'bg-gray-100'
              }`}>
                <div className="flex items-center gap-2 mb-1">
                  <MessageSquare className="w-4 h-4 text-green-500" />
                  <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    تعليقات
                  </span>
                </div>
                <p className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {stats.totalComments}
                </p>
              </div>

              <div className={`p-3 rounded-xl ${
                darkMode ? 'bg-gray-800' : 'bg-gray-100'
              }`}>
                <div className="flex items-center gap-2 mb-1">
                  <Award className="w-4 h-4 text-yellow-500" />
                  <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    النقاط المكتسبة
                  </span>
                </div>
                <p className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {stats.totalPoints}
                </p>
              </div>

              <div className={`p-3 rounded-xl ${
                darkMode ? 'bg-gray-800' : 'bg-gray-100'
              }`}>
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp className="w-4 h-4 text-purple-500" />
                  <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    أكثر تصنيف
                  </span>
                </div>
                <p className={`text-sm font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {stats.mostInteractedCategory.name}
                </p>
              </div>
            </div>
          )}

          {/* الفلاتر */}
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setFilterType('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filterType === 'all'
                  ? 'bg-blue-500 text-white'
                  : darkMode 
                    ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              الكل
            </button>
            <button
              onClick={() => setFilterType('like')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                filterType === 'like'
                  ? 'bg-red-500 text-white'
                  : darkMode 
                    ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Heart className="w-4 h-4" />
              إعجابات
            </button>
            <button
              onClick={() => setFilterType('share')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                filterType === 'share'
                  ? 'bg-blue-500 text-white'
                  : darkMode 
                    ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Share2 className="w-4 h-4" />
              مشاركات
            </button>
            <button
              onClick={() => setFilterType('comment')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                filterType === 'comment'
                  ? 'bg-green-500 text-white'
                  : darkMode 
                    ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              تعليقات
            </button>
          </div>
        </div>
      </div>

      {/* المحتوى */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {filteredInteractions.length === 0 ? (
          <div className="text-center py-16">
            <Activity className={`w-16 h-16 mx-auto mb-4 ${
              darkMode ? 'text-gray-700' : 'text-gray-300'
            }`} />
            <h3 className={`text-lg font-semibold mb-2 ${
              darkMode ? 'text-white' : 'text-gray-900'
            }`}>
              لا توجد تفاعلات
            </h3>
            <p className={`text-sm ${
              darkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>
              ابدأ بالتفاعل مع المقالات لتظهر هنا
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredInteractions.map((item) => {
              const Icon = getInteractionIcon(item.interaction.type);
              const iconColor = getInteractionColor(item.interaction.type);

              return (
                <article
                  key={`${item.id}-${item.interaction.created_at}`}
                  className={`rounded-xl border overflow-hidden transition-all hover:shadow-lg ${
                    darkMode 
                      ? 'bg-gray-800 border-gray-700 hover:border-gray-600' 
                      : 'bg-white border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex gap-4 p-4">
                    {/* صورة المقال */}
                    <Link href={`/article/${item.id}`} className="relative w-32 h-24 flex-shrink-0 overflow-hidden rounded-lg">
                      <Image
                        src={getImageUrl(item.featured_image)}
                        alt={item.title}
                        fill
                        className="object-cover"
                      />
                    </Link>

                    {/* محتوى المقال */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <Link href={`/article/${item.id}`}>
                          <h3 className={`font-bold text-base line-clamp-2 hover:text-blue-500 transition-colors ${
                            darkMode ? 'text-white' : 'text-gray-900'
                          }`}>
                            {item.title}
                          </h3>
                        </Link>
                        
                        {/* أيقونة التفاعل */}
                        <div className={`p-2 rounded-lg ${
                          darkMode ? 'bg-gray-700' : 'bg-gray-100'
                        }`}>
                          <Icon className={`w-5 h-5 ${iconColor}`} />
                        </div>
                      </div>

                      {/* التصنيف ومعلومات المقال */}
                      <div className="flex items-center gap-4 text-xs mb-2">
                        <span 
                          className="px-2 py-1 rounded-full text-white"
                          style={{ backgroundColor: item.category.color }}
                        >
                          {item.category.name}
                        </span>
                        <span className={`flex items-center gap-1 ${
                          darkMode ? 'text-gray-500' : 'text-gray-400'
                        }`}>
                          <Eye className="w-3.5 h-3.5" />
                          {item.views}
                        </span>
                        <span className={`flex items-center gap-1 ${
                          darkMode ? 'text-gray-500' : 'text-gray-400'
                        }`}>
                          <Clock className="w-3.5 h-3.5" />
                          {item.reading_time} د
                        </span>
                      </div>

                      {/* معلومات التفاعل */}
                      <div className="flex items-center justify-between">
                        <span className={`text-xs flex items-center gap-1 ${
                          darkMode ? 'text-gray-400' : 'text-gray-500'
                        }`}>
                          <Calendar className="w-3.5 h-3.5" />
                          تفاعلت {formatRelativeDate(item.interaction.created_at)}
                        </span>
                        
                        {item.interaction.points_earned && (
                          <span className="text-xs font-medium text-green-600 dark:text-green-400">
                            +{item.interaction.points_earned} نقطة
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
} 