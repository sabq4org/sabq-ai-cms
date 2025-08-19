'use client';

import React, { useState, useEffect } from 'react';
import { useUser } from '@/hooks/useUser';
import { 
  User, 
  Award, 
  TrendingUp, 
  MessageSquare, 
  Heart, 
  BookOpen,
  Calendar,
  Target,
  Star,
  Trophy,
  Zap,
  Eye,
  Share2
} from 'lucide-react';
import { toast } from 'sonner';

interface UserStats {
  totalComments: number;
  totalLikes: number;
  totalShares: number;
  totalViews: number;
  articlesRead: number;
  currentStreak: number;
  totalPoints: number;
  reputation: number;
  engagementLevel: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  badges: string[];
  joinDate: string;
  lastActivity: string;
  interests: {
    categories: Record<string, number>;
    tags: Record<string, number>;
  };
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  type: 'streak' | 'engagement' | 'quality' | 'social';
  threshold: number;
  currentProgress: number;
  completed: boolean;
  reward: number; // نقاط المكافأة
}

export default function UserProfileDashboard() {
  const { user, isLoading } = useUser();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loadingStats, setLoadingStats] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'achievements' | 'activity'>('overview');

  useEffect(() => {
    if (user) {
      fetchUserStats();
      fetchAchievements();
    }
  }, [user]);

  const fetchUserStats = async () => {
    if (!user) return;

    try {
      const response = await fetch(`/api/users/${user.id}/stats`);
      if (response.ok) {
        const data = await response.json();
        setStats(data.stats);
      }
    } catch (error) {
      console.error('خطأ في جلب الإحصائيات:', error);
      toast.error('فشل في جلب الإحصائيات');
    } finally {
      setLoadingStats(false);
    }
  };

  const fetchAchievements = async () => {
    if (!user) return;

    try {
      const response = await fetch(`/api/users/${user.id}/achievements`);
      if (response.ok) {
        const data = await response.json();
        setAchievements(data.achievements);
      }
    } catch (error) {
      console.error('خطأ في جلب الإنجازات:', error);
    }
  };

  if (isLoading || loadingStats) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8 text-center">
        <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-600 mb-4">
          سجل دخولك لرؤية ملفك الشخصي
        </h2>
        <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          تسجيل الدخول
        </button>
      </div>
    );
  }

  const getLevelBadge = (level: string) => {
    const badges = {
      beginner: { color: 'bg-gray-100 text-gray-800', icon: '🌱', title: 'مبتدئ' },
      intermediate: { color: 'bg-blue-100 text-blue-800', icon: '📚', title: 'متوسط' },
      advanced: { color: 'bg-purple-100 text-purple-800', icon: '🎓', title: 'متقدم' },
      expert: { color: 'bg-yellow-100 text-yellow-800', icon: '👑', title: 'خبير' }
    };
    return badges[level as keyof typeof badges] || badges.beginner;
  };

  const StatCard = ({ 
    title, 
    value, 
    icon: Icon, 
    color, 
    trend 
  }: {
    title: string;
    value: string | number;
    icon: React.ComponentType<any>;
    color: string;
    trend?: { value: number; label: string };
  }) => (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-2">{value}</p>
          {trend && (
            <p className={`text-sm mt-1 flex items-center gap-1 ${
              trend > 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              <TrendingUp className="w-4 h-4" />
              {trend > 0 ? '+' : ''}{trend}% هذا الأسبوع
            </p>
          )}
        </div>
        <div className={`w-12 h-12 ${color} rounded-lg flex items-center justify-center`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* هيدر الملف الشخصي */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-8 mb-8 text-white">
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center text-2xl font-bold">
            {user.avatar ? (
              <img src={user.avatar} alt={user.name} className="w-full h-full rounded-full object-cover" />
            ) : (
              user.name.charAt(0).toUpperCase()
            )}
          </div>
          
          <div className="flex-1">
            <h1 className="text-3xl font-bold mb-2">{user.name}</h1>
            <p className="text-blue-100 mb-4">{user.email}</p>
            
            {stats && (
              <div className="flex items-center gap-4">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getLevelBadge(stats.engagementLevel).color}`}>
                  {getLevelBadge(stats.engagementLevel).icon} {getLevelBadge(stats.engagementLevel).title}
                </span>
                <span className="text-blue-100">
                  🔥 {stats.currentStreak} يوم متتالي
                </span>
                <span className="text-blue-100">
                  ⭐ {stats.totalPoints} نقطة
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* تبويبات التنقل */}
      <div className="flex gap-1 mb-8 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
        {[
          { id: 'overview', label: 'نظرة عامة', icon: TrendingUp },
          { id: 'achievements', label: 'الإنجازات', icon: Trophy },
          { id: 'activity', label: 'النشاط', icon: Calendar }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-md transition-all ${
              activeTab === tab.id
                ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* محتوى التبويب */}
      {activeTab === 'overview' && stats && (
        <div className="space-y-8">
          {/* إحصائيات سريعة */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title="التعليقات"
              value={stats.totalComments}
              icon={MessageSquare}
              color="bg-blue-500"
              trend={12}
            />
            <StatCard
              title="الإعجابات"
              value={stats.totalLikes}
              icon={Heart}
              color="bg-red-500"
              trend={8}
            />
            <StatCard
              title="المقالات المقروءة"
              value={stats.articlesRead}
              icon={BookOpen}
              color="bg-green-500"
              trend={15}
            />
            <StatCard
              title="المشاركات"
              value={stats.totalShares}
              icon={Share2}
              color="bg-purple-500"
              trend={-3}
            />
          </div>

          {/* التقدم والأهداف */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* أهداف الأسبوع */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Target className="w-5 h-5 text-blue-600" />
                أهداف هذا الأسبوع
              </h3>
              
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-gray-600">قراءة 10 مقالات</span>
                    <span className="text-sm font-medium">7/10</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: '70%' }}></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-gray-600">5 تعليقات جودة</span>
                    <span className="text-sm font-medium">3/5</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-600 h-2 rounded-full" style={{ width: '60%' }}></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-gray-600">7 أيام متتالية</span>
                    <span className="text-sm font-medium">{stats.currentStreak}/7</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-yellow-600 h-2 rounded-full" style={{ width: `${Math.min(100, (stats.currentStreak / 7) * 100)}%` }}></div>
                  </div>
                </div>
              </div>
            </div>

            {/* الاهتمامات */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-600" />
                اهتماماتك الرئيسية
              </h3>
              
              <div className="space-y-3">
                {stats.interests.categories && Object.entries(stats.interests.categories)
                  .sort(([,a], [,b]) => (b as number) - (a as number))
                  .slice(0, 5)
                  .map(([category, count]) => (
                    <div key={category} className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">{category}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${Math.min(100, ((count as number) / Math.max(...Object.values(stats.interests.categories))) * 100)}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium w-6">{count}</span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* تبويب الإنجازات */}
      {activeTab === 'achievements' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {achievements.map(achievement => (
            <div
              key={achievement.id}
              className={`p-6 rounded-xl border transition-all ${
                achievement.completed
                  ? 'bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200 shadow-md'
                  : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
              }`}
            >
              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-2xl ${
                  achievement.completed ? 'bg-yellow-100' : 'bg-gray-100'
                }`}>
                  {achievement.icon}
                </div>
                
                <div className="flex-1">
                  <h3 className={`font-semibold mb-1 ${
                    achievement.completed ? 'text-yellow-800' : 'text-gray-900 dark:text-gray-100'
                  }`}>
                    {achievement.title}
                  </h3>
                  <p className={`text-sm mb-3 ${
                    achievement.completed ? 'text-yellow-700' : 'text-gray-600 dark:text-gray-400'
                  }`}>
                    {achievement.description}
                  </p>
                  
                  {!achievement.completed && (
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span>التقدم</span>
                        <span>{achievement.currentProgress}/{achievement.threshold}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all"
                          style={{ width: `${Math.min(100, (achievement.currentProgress / achievement.threshold) * 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                  
                  {achievement.completed && (
                    <div className="flex items-center gap-2 text-sm font-medium text-yellow-700">
                      <Trophy className="w-4 h-4" />
                      مكتمل! +{achievement.reward} نقطة
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* تبويب النشاط */}
      {activeTab === 'activity' && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-600" />
            نشاطك الأخير
          </h3>
          
          <div className="space-y-4">
            {/* سيتم ملء هذا القسم بالنشاطات الفعلية */}
            <div className="text-center py-8 text-gray-500">
              <Eye className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>سيتم عرض نشاطك هنا قريباً</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
