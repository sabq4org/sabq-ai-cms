'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { 
  TrendingUp, 
  Clock, 
  Bookmark, 
  Heart, 
  BarChart3, 
  Users,
  BookOpen,
  Sparkles,
  Calendar,
  Target
} from 'lucide-react';

interface UserInsights {
  readCount: number;
  savedCount: number;
  interactedCount: number;
  readingTime: string;
  articleTypes: Record<string, number>;
  categories: Record<string, number>;
  diversityScore: number;
  readerType: string;
  weeklyStats: {
    reads: number;
    streak: number;
    lastReadDate: Date | null;
  };
}

interface RecommendedArticle {
  id: string;
  title: string;
  category: string;
  readTime: string;
  url: string;
  excerpt?: string;
  featured_image?: string;
  reason: string;
}

interface SimilarReaderArticle {
  id: string;
  title: string;
  url: string;
  category: string;
  excerpt?: string;
  featured_image?: string;
  matchReason: string;
}

export default function MyJourneyPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const [insights, setInsights] = useState<UserInsights | null>(null);
  const [recommendation, setRecommendation] = useState<RecommendedArticle | null>(null);
  const [similarReads, setSimilarReads] = useState<SimilarReaderArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login?redirect=/my-journey');
      return;
    }

    loadUserData();
  }, [isAuthenticated, router]);

  const loadUserData = async () => {
    try {
      setLoading(true);
      
      // جلب البيانات بالتوازي
      const [insightsRes, recommendationRes, similarRes] = await Promise.all([
        fetch('/api/user/insights'),
        fetch('/api/user/recommendation-of-the-day'),
        fetch('/api/user/similar-readers')
      ]);

      if (!insightsRes.ok) throw new Error('فشل جلب التحليلات');
      if (!recommendationRes.ok) throw new Error('فشل جلب التوصيات');
      if (!similarRes.ok) throw new Error('فشل جلب مقالات القراء المشابهين');

      const insightsData = await insightsRes.json();
      const recommendationData = await recommendationRes.json();
      const similarData = await similarRes.json();

      setInsights(insightsData);
      setRecommendation(recommendationData);
      setSimilarReads(similarData);
    } catch (error) {
      console.error('Error loading user data:', error);
      setError('حدث خطأ في تحميل البيانات');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary mx-auto"></div>
          <p className="text-lg text-gray-600 dark:text-gray-300">جاري تحميل رحلتك المعرفية...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-lg text-red-600">{error}</p>
          <button 
            onClick={loadUserData} 
            className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition"
          >
            إعادة المحاولة
          </button>
        </div>
      </div>
    );
  }

  if (!insights) return null;

  const categoryNames: Record<string, string> = {
    'cat-001': 'محليات',
    'cat-002': 'العالم',
    'cat-003': 'حياتنا',
    'cat-004': 'محطات',
    'cat-005': 'رياضة',
    'cat-006': 'سياحة',
    'cat-007': 'أعمال',
    'cat-008': 'تقنية',
    'cat-009': 'سيارات',
    'cat-010': 'ميديا'
  };

  const getReadingEmoji = () => {
    if (insights.weeklyStats.streak >= 7) return '🔥';
    if (insights.weeklyStats.streak >= 3) return '⭐';
    return '📚';
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            رحلتك المعرفية
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            مرحباً {user?.name || 'القارئ العزيز'}، إليك نظرة على رحلتك المعرفية
          </p>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          
          {/* ما يلهمك اليوم */}
          {recommendation && recommendation.id && (
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]">
              <div className="flex items-center mb-4">
                <Sparkles className="w-6 h-6 text-yellow-500 ml-2" />
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">ما يلهمك اليوم</h2>
              </div>
              
              {recommendation.featured_image && (
                <img 
                  src={recommendation.featured_image} 
                  alt={recommendation.title}
                  className="w-full h-40 object-cover rounded-lg mb-4"
                />
              )}
              
              <h3 className="font-semibold text-lg mb-2 text-gray-800 dark:text-gray-100 line-clamp-2">
                {recommendation.title}
              </h3>
              
              <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-3">
                <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded">
                  {recommendation.category}
                </span>
                <span className="flex items-center">
                  <Clock className="w-4 h-4 ml-1" />
                  {recommendation.readTime}
                </span>
              </div>
              
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 italic">
                {recommendation.reason}
              </p>
              
              <a 
                href={recommendation.url}
                className="block w-full text-center bg-gradient-to-r from-blue-500 to-blue-600 text-white py-2 rounded-lg hover:from-blue-600 hover:to-blue-700 transition"
              >
                اقرأ الآن
              </a>
            </div>
          )}

          {/* تنوعك المعرفي */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center mb-4">
              <BarChart3 className="w-6 h-6 text-purple-500 ml-2" />
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">تنوعك المعرفي</h2>
            </div>
            
            <div className="relative h-32 mb-4">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-4xl font-bold text-purple-600 dark:text-purple-400">
                    {insights.diversityScore}%
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    نسبة التنوع
                  </div>
                </div>
              </div>
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="64"
                  cy="64"
                  r="60"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="none"
                  className="text-gray-200 dark:text-gray-700"
                />
                <circle
                  cx="64"
                  cy="64"
                  r="60"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="none"
                  strokeDasharray={`${insights.diversityScore * 3.77} 377`}
                  className="text-purple-500"
                />
              </svg>
            </div>
            
            <div className="space-y-2">
              {Object.entries(insights.categories).slice(0, 3).map(([categoryId, count]) => (
                <div key={categoryId} className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {categoryNames[categoryId] || categoryId}
                  </span>
                  <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                    {count} مقال
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* نمطك القرائي */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center mb-4">
              <BookOpen className="w-6 h-6 text-green-500 ml-2" />
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">نمطك القرائي</h2>
            </div>
            
            <div className="text-center mb-4">
              <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">
                {insights.readerType}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                تقرأ غالباً {insights.readingTime}
              </div>
            </div>
            
            <div className="space-y-3">
              {Object.entries(insights.articleTypes).map(([type, percentage]) => (
                <div key={type}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-700 dark:text-gray-300">{type}</span>
                    <span className="text-gray-600 dark:text-gray-400">{percentage}%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* نشاطك هذا الأسبوع */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center mb-4">
              <Calendar className="w-6 h-6 text-orange-500 ml-2" />
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">نشاطك هذا الأسبوع</h2>
            </div>
            
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                  {insights.weeklyStats.reads}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">مقال مقروء</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {insights.savedCount}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">مقال محفوظ</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                  {insights.interactedCount}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">تفاعل</div>
              </div>
            </div>
            
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 text-center">
              <div className="text-3xl mb-1">{getReadingEmoji()}</div>
              <div className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                سلسلة القراءة: {insights.weeklyStats.streak} يوم
              </div>
              {insights.weeklyStats.streak >= 3 && (
                <div className="text-xs text-green-600 dark:text-green-400 mt-1">
                  أحسنت! حافظ على الاستمرارية
                </div>
              )}
            </div>
          </div>

          {/* إحصائياتك الشاملة */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center mb-4">
              <TrendingUp className="w-6 h-6 text-indigo-500 ml-2" />
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">إحصائياتك الشاملة</h2>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <BookOpen className="w-5 h-5 text-indigo-500 ml-2" />
                  <span className="text-gray-700 dark:text-gray-300">إجمالي المقالات المقروءة</span>
                </div>
                <span className="text-xl font-bold text-indigo-600 dark:text-indigo-400">
                  {insights.readCount}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Bookmark className="w-5 h-5 text-blue-500 ml-2" />
                  <span className="text-gray-700 dark:text-gray-300">المقالات المحفوظة</span>
                </div>
                <span className="text-xl font-bold text-blue-600 dark:text-blue-400">
                  {insights.savedCount}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Heart className="w-5 h-5 text-red-500 ml-2" />
                  <span className="text-gray-700 dark:text-gray-300">إجمالي التفاعلات</span>
                </div>
                <span className="text-xl font-bold text-red-600 dark:text-red-400">
                  {insights.interactedCount}
                </span>
              </div>
            </div>
          </div>

          {/* قراء مثلك اهتموا بـ */}
          {similarReads.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center mb-4">
                <Users className="w-6 h-6 text-teal-500 ml-2" />
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">قراء مثلك اهتموا بـ</h2>
              </div>
              
              <div className="space-y-3">
                {similarReads.slice(0, 3).map((article) => (
                  <a 
                    key={article.id}
                    href={article.url}
                    className="block p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition"
                  >
                    <h4 className="font-semibold text-sm text-gray-800 dark:text-gray-200 line-clamp-2 mb-1">
                      {article.title}
                    </h4>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-600 dark:text-gray-400">
                        {article.category}
                      </span>
                      <span className="text-xs text-teal-600 dark:text-teal-400">
                        {article.matchReason}
                      </span>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Call to Action */}
        <div className="text-center mt-12">
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-4">
            استمر في رحلتك المعرفية واكتشف المزيد من المحتوى المميز
          </p>
          <div className="flex justify-center gap-4">
            <a 
              href="/for-you"
              className="px-6 py-3 bg-gradient-to-r from-primary to-primary-dark text-white rounded-lg hover:shadow-lg transition"
            >
              اكتشف المزيد
            </a>
            <a 
              href="/profile/preferences"
              className="px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition"
            >
              تحديث اهتماماتك
            </a>
          </div>
        </div>
      </div>
    </div>
  );
} 