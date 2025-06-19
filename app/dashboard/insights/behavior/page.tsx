'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, TrendingUp, Award, BookOpen, 
  Eye, Heart, Share2, MessageSquare, 
  Bookmark, Clock, Activity, PieChart,
  BarChart3, Calendar, Target, Zap,
  RefreshCw, Download, Filter
} from 'lucide-react';

interface BehaviorInsights {
  overview: {
    total_interactions: number;
    total_points_awarded: number;
    active_users: number;
    average_interactions_per_user: number;
    published_articles: number;
  };
  interaction_summary: {
    total_reads: number;
    total_likes: number;
    total_shares: number;
    total_comments: number;
    total_bookmarks: number;
  };
  top_users: Array<{
    id: string;
    name: string;
    email: string;
    avatar: string;
    interactions: number;
    points: number;
    level: string;
    favorite_category: string;
    last_activity: string;
  }>;
  top_categories: Array<{
    id: string;
    name: string;
    interaction_count: number;
  }>;
  time_period: {
    start: string;
    end: string;
    days: number;
  };
}

export default function BehaviorInsightsPage() {
  const [insights, setInsights] = useState<BehaviorInsights | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  // جلب البيانات
  const fetchInsights = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/dashboard/insights/behavior');
      
      if (!response.ok) {
        throw new Error('فشل في جلب البيانات');
      }
      
      const data = await response.json();
      
      if (data.success && data.data) {
        setInsights(data.data);
        setError(null);
        setLastUpdate(new Date());
      } else {
        throw new Error(data.error || 'خطأ في البيانات');
      }
    } catch (err) {
      console.error('Error fetching insights:', err);
      setError(err instanceof Error ? err.message : 'حدث خطأ');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInsights();
    
    // تحديث تلقائي كل 5 دقائق
    const interval = setInterval(fetchInsights, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // حساب النسب المئوية
  const getPercentage = (value: number, total: number) => {
    if (total === 0) return 0;
    return Math.round((value / total) * 100);
  };

  // الحصول على الأيقونة حسب نوع التفاعل
  const getInteractionIcon = (type: string) => {
    switch (type) {
      case 'reads': return <Eye className="w-4 h-4" />;
      case 'likes': return <Heart className="w-4 h-4" />;
      case 'shares': return <Share2 className="w-4 h-4" />;
      case 'comments': return <MessageSquare className="w-4 h-4" />;
      case 'bookmarks': return <Bookmark className="w-4 h-4" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  // الحصول على لون المستوى
  const getLevelColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'platinum': return 'bg-purple-500';
      case 'gold': return 'bg-yellow-500';
      case 'silver': return 'bg-gray-400';
      case 'bronze': return 'bg-orange-600';
      default: return 'bg-blue-500';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">جاري تحميل التحليلات...</p>
        </div>
      </div>
    );
  }

  if (error || !insights) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 text-red-500">
            <Activity className="w-full h-full" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">خطأ في تحميل البيانات</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{error || 'حدث خطأ غير متوقع'}</p>
          <button
            onClick={fetchInsights}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 mx-auto"
          >
            <RefreshCw className="w-4 h-4" />
            إعادة المحاولة
          </button>
        </div>
      </div>
    );
  }

  const totalInteractions = insights.interaction_summary.total_reads +
    insights.interaction_summary.total_likes +
    insights.interaction_summary.total_shares +
    insights.interaction_summary.total_comments +
    insights.interaction_summary.total_bookmarks;

  return (
    <div className="p-6 space-y-6">
      {/* الهيدر */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            تحليلات التفاعل وسلوك المستخدمين
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            رصد التفاعل وتحديث التفضيلات تلقائيًا لتعزيز تجربة التوصيات
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500 dark:text-gray-400">
            آخر تحديث: {lastUpdate.toLocaleTimeString('ar')}
          </span>
          <button
            onClick={fetchInsights}
            className="p-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            <RefreshCw className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
        </div>
      </div>

      {/* البطاقات الإحصائية */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white"
        >
          <div className="flex items-center justify-between mb-4">
            <Users className="w-8 h-8 opacity-80" />
            <span className="text-2xl font-bold">{insights.overview.active_users}</span>
          </div>
          <h3 className="font-semibold">المستخدمون النشطون</h3>
          <p className="text-sm opacity-80 mt-1">خلال آخر 7 أيام</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white"
        >
          <div className="flex items-center justify-between mb-4">
            <Activity className="w-8 h-8 opacity-80" />
            <span className="text-2xl font-bold">{totalInteractions}</span>
          </div>
          <h3 className="font-semibold">إجمالي التفاعلات</h3>
          <p className="text-sm opacity-80 mt-1">جميع أنواع التفاعل</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white"
        >
          <div className="flex items-center justify-between mb-4">
            <Award className="w-8 h-8 opacity-80" />
            <span className="text-2xl font-bold">{insights.overview.total_points_awarded}</span>
          </div>
          <h3 className="font-semibold">النقاط الممنوحة</h3>
          <p className="text-sm opacity-80 mt-1">نقاط الولاء المكتسبة</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-6 text-white"
        >
          <div className="flex items-center justify-between mb-4">
            <Target className="w-8 h-8 opacity-80" />
            <span className="text-2xl font-bold">{insights.overview.average_interactions_per_user}</span>
          </div>
          <h3 className="font-semibold">متوسط التفاعل</h3>
          <p className="text-sm opacity-80 mt-1">لكل مستخدم نشط</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-gradient-to-br from-pink-500 to-pink-600 rounded-2xl p-6 text-white"
        >
          <div className="flex items-center justify-between mb-4">
            <BookOpen className="w-8 h-8 opacity-80" />
            <span className="text-2xl font-bold">{insights.overview.published_articles}</span>
          </div>
          <h3 className="font-semibold">المقالات المنشورة</h3>
          <p className="text-sm opacity-80 mt-1">محتوى متاح للتفاعل</p>
        </motion.div>
      </div>

      {/* تفصيل التفاعلات والمستخدمون النشطون */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* تفصيل التفاعلات */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6"
        >
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <PieChart className="w-6 h-6 text-blue-600" />
            تفصيل التفاعلات
          </h2>
          
          <div className="space-y-4">
            {Object.entries({
              reads: insights.interaction_summary.total_reads,
              likes: insights.interaction_summary.total_likes,
              shares: insights.interaction_summary.total_shares,
              comments: insights.interaction_summary.total_comments,
              bookmarks: insights.interaction_summary.total_bookmarks
            }).map(([type, count]) => (
              <div key={type} className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                  {getInteractionIcon(type)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {type === 'reads' && 'القراءات'}
                      {type === 'likes' && 'الإعجابات'}
                      {type === 'shares' && 'المشاركات'}
                      {type === 'comments' && 'التعليقات'}
                      {type === 'bookmarks' && 'المحفوظات'}
                    </span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">{count}</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${getPercentage(count, totalInteractions)}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* التصنيفات النشطة */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6"
        >
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-purple-600" />
            التصنيفات النشطة
          </h2>
          
          <div className="space-y-4">
            {insights.top_categories.map((category, index) => (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                  <span className="text-purple-600 dark:text-purple-400 font-bold">
                    {index + 1}
                  </span>
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900 dark:text-white">{category.name}</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {category.interaction_count} تفاعل
                  </p>
                </div>
              </motion.div>
            ))}
            
            {insights.top_categories.length === 0 && (
              <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                لا توجد بيانات تصنيفات بعد
              </p>
            )}
          </div>
        </motion.div>
      </div>

      {/* جدول المستخدمين النشطين */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Zap className="w-6 h-6 text-orange-600" />
            المستخدمون الأكثر تفاعلاً
          </h2>
          
          <button className="px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 flex items-center gap-2 text-sm">
            <Download className="w-4 h-4" />
            تصدير البيانات
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-gray-200 dark:border-gray-700">
              <tr>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-900 dark:text-gray-300">المستخدم</th>
                <th className="text-center py-3 px-4 text-sm font-semibold text-gray-900 dark:text-gray-300">التفاعلات</th>
                <th className="text-center py-3 px-4 text-sm font-semibold text-gray-900 dark:text-gray-300">النقاط</th>
                <th className="text-center py-3 px-4 text-sm font-semibold text-gray-900 dark:text-gray-300">المستوى</th>
                <th className="text-center py-3 px-4 text-sm font-semibold text-gray-900 dark:text-gray-300">التصنيف المفضل</th>
                <th className="text-center py-3 px-4 text-sm font-semibold text-gray-900 dark:text-gray-300">آخر نشاط</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {insights.top_users.map((user, index) => (
                <motion.tr
                  key={user.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                >
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      {user.avatar ? (
                        <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full" />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
                          {user.name.charAt(0)}
                        </div>
                      )}
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{user.name}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-center">
                    <span className="font-semibold text-gray-900 dark:text-white">{user.interactions}</span>
                  </td>
                  <td className="py-4 px-4 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Award className="w-4 h-4 text-yellow-500" />
                      <span className="font-semibold text-gray-900 dark:text-white">{user.points}</span>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-center">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-white ${getLevelColor(user.level)}`}>
                      {user.level}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">{user.favorite_category}</span>
                  </td>
                  <td className="py-4 px-4 text-center">
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {new Date(user.last_activity).toLocaleDateString('ar')}
                    </span>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
          
          {insights.top_users.length === 0 && (
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">لا يوجد مستخدمون نشطون حالياً</p>
            </div>
          )}
        </div>
      </motion.div>

      {/* معلومات الفترة الزمنية */}
      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 flex items-center gap-3">
        <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />
        <p className="text-sm text-blue-800 dark:text-blue-300">
          هذه البيانات للفترة من {new Date(insights.time_period.start).toLocaleDateString('ar')} 
          {' '}إلى {new Date(insights.time_period.end).toLocaleDateString('ar')} 
          {' '}({insights.time_period.days} أيام)
        </p>
      </div>
    </div>
  );
} 