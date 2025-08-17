'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User,
  Calendar,
  Clock,
  BookOpen,
  Heart,
  MessageCircle,
  Share2,
  TrendingUp,
  Target,
  Award,
  Activity,
  BarChart3,
  PieChart,
  Settings,
  Camera,
  Edit,
  Download,
  Filter,
  ChevronDown,
  Eye,
  Bookmark,
  Star,
  Zap,
  Trophy,
  Medal,
  Crown,
  Flame
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useGlobalStore, useAuth, useAnalytics } from '@/stores/globalStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar, Line, Doughnut } from 'react-chartjs-2';
import { OptimizedImage } from '@/components/OptimizedImage';
import Link from 'next/link';
import { formatDistanceToNow, format, subDays, eachDayOfInterval } from 'date-fns';
import { ar } from 'date-fns/locale';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

// ===========================================
// Types
// ===========================================

interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  bio?: string;
  joinedAt: string;
  location?: string;
  website?: string;
  interests: string[];
  followers: number;
  following: number;
  verified: boolean;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  level: number;
  points: number;
  nextLevelPoints: number;
}

interface UserStats {
  totalReadingTime: number;
  articlesRead: number;
  articlesLiked: number;
  articlesSaved: number;
  articlesShared: number;
  commentsPosted: number;
  averageSessionTime: number;
  streakDays: number;
  categoriesExplored: string[];
  favoriteCategories: { name: string; count: number; percentage: number }[];
  readingPattern: { hour: number; count: number }[];
  weeklyActivity: { date: string; articles: number; time: number }[];
  engagementScore: number;
  achievements: Achievement[];
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  progress?: number;
  maxProgress?: number;
}

interface RecentActivity {
  id: string;
  type: 'read' | 'like' | 'comment' | 'share' | 'save';
  article: {
    id: string;
    title: string;
    slug: string;
    thumbnail?: string;
    category: string;
  };
  timestamp: string;
}

// ===========================================
// API Functions
// ===========================================

const fetchUserProfile = async (userId: string): Promise<UserProfile> => {
  const response = await fetch(`/api/users/${userId}/profile`, {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('auth-token')}`,
    },
  });

  if (!response.ok) {
    throw new Error('فشل في جلب بيانات الملف الشخصي');
  }

  return response.json();
};

const fetchUserStats = async (userId: string, period: string = '30d'): Promise<UserStats> => {
  const response = await fetch(`/api/users/${userId}/stats?period=${period}`, {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('auth-token')}`,
    },
  });

  if (!response.ok) {
    throw new Error('فشل في جلب إحصائيات المستخدم');
  }

  return response.json();
};

const fetchRecentActivity = async (userId: string, limit: number = 20): Promise<RecentActivity[]> => {
  const response = await fetch(`/api/users/${userId}/activity?limit=${limit}`, {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('auth-token')}`,
    },
  });

  if (!response.ok) {
    throw new Error('فشل في جلب النشاط الأخير');
  }

  return response.json();
};

// ===========================================
// Utility Functions
// ===========================================

const getTierIcon = (tier: string) => {
  switch (tier) {
    case 'bronze':
      return <Medal className="w-5 h-5 text-amber-600" />;
    case 'silver':
      return <Medal className="w-5 h-5 text-gray-400" />;
    case 'gold':
      return <Trophy className="w-5 h-5 text-yellow-500" />;
    case 'platinum':
      return <Crown className="w-5 h-5 text-purple-500" />;
    default:
      return <Medal className="w-5 h-5 text-gray-400" />;
  }
};

const getTierColor = (tier: string) => {
  switch (tier) {
    case 'bronze':
      return 'border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50';
    case 'silver':
      return 'border-gray-200 bg-gradient-to-br from-gray-50 to-slate-50';
    case 'gold':
      return 'border-yellow-200 bg-gradient-to-br from-yellow-50 to-amber-50';
    case 'platinum':
      return 'border-purple-200 bg-gradient-to-br from-purple-50 to-indigo-50';
    default:
      return 'border-gray-200 bg-gray-50';
  }
};

const getActivityIcon = (type: string) => {
  const iconProps = { className: "w-4 h-4" };
  
  switch (type) {
    case 'read':
      return <BookOpen {...iconProps} className="text-blue-500" />;
    case 'like':
      return <Heart {...iconProps} className="text-red-500" />;
    case 'comment':
      return <MessageCircle {...iconProps} className="text-green-500" />;
    case 'share':
      return <Share2 {...iconProps} className="text-purple-500" />;
    case 'save':
      return <Bookmark {...iconProps} className="text-yellow-500" />;
    default:
      return <Activity {...iconProps} className="text-gray-500" />;
  }
};

const getActivityLabel = (type: string) => {
  switch (type) {
    case 'read':
      return 'قرأ';
    case 'like':
      return 'أعجب بـ';
    case 'comment':
      return 'علق على';
    case 'share':
      return 'شارك';
    case 'save':
      return 'حفظ';
    default:
      return 'تفاعل مع';
  }
};

const formatReadingTime = (minutes: number): string => {
  if (minutes < 60) {
    return `${minutes} دقيقة`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return `${hours} ساعة${remainingMinutes > 0 ? ` و ${remainingMinutes} دقيقة` : ''}`;
};

// ===========================================
// Components
// ===========================================

const ProfileHeader = ({ profile }: { profile: UserProfile }) => {
  const [isEditing, setIsEditing] = useState(false);
  
  return (
    <Card className={`${getTierColor(profile.tier)} border-2`}>
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Avatar and basic info */}
          <div className="flex flex-col items-center md:items-start">
            <div className="relative group">
              <Avatar className="w-24 h-24 border-4 border-white shadow-lg">
                <AvatarImage src={profile.avatar} alt={profile.name} />
                <AvatarFallback className="text-2xl font-bold">
                  {profile.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              
              <Button
                variant="ghost"
                size="sm"
                className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 text-white"
                onClick={() => setIsEditing(true)}
              >
                <Camera className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="text-center md:text-right mt-4">
              <div className="flex items-center gap-2 justify-center md:justify-start">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {profile.name}
                </h1>
                {profile.verified && (
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                    <Star className="w-3 h-3 mr-1" />
                    موثق
                  </Badge>
                )}
              </div>
              
              <p className="text-gray-600 dark:text-gray-300 mt-1">
                {profile.email}
              </p>
              
              {profile.bio && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 max-w-md">
                  {profile.bio}
                </p>
              )}
            </div>
          </div>
          
          {/* Stats */}
          <div className="flex-1">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {profile.followers.toLocaleString()}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">متابعين</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {profile.following.toLocaleString()}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">يتابع</div>
              </div>
              
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 text-2xl font-bold text-gray-900 dark:text-white">
                  {getTierIcon(profile.tier)}
                  {profile.level}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">المستوى</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {profile.points.toLocaleString()}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">نقطة</div>
              </div>
            </div>
            
            {/* Progress to next level */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">
                  التقدم للمستوى التالي
                </span>
                <span className="font-medium">
                  {profile.points} / {profile.nextLevelPoints}
                </span>
              </div>
              
              <Progress 
                value={(profile.points / profile.nextLevelPoints) * 100}
                className="h-2"
              />
            </div>
            
            {/* Action buttons */}
            <div className="flex gap-2 mt-4">
              <Button variant="outline" size="sm">
                <Edit className="w-4 h-4 mr-2" />
                تعديل الملف الشخصي
              </Button>
              
              <Button variant="outline" size="sm">
                <Settings className="w-4 h-4 mr-2" />
                الإعدادات
              </Button>
              
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                تصدير البيانات
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const StatsOverview = ({ stats }: { stats: UserStats }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <Card>
        <CardContent className="p-4 text-center">
          <div className="flex items-center justify-center mb-2">
            <BookOpen className="w-6 h-6 text-blue-500" />
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {stats.articlesRead.toLocaleString()}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            مقال مقروء
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4 text-center">
          <div className="flex items-center justify-center mb-2">
            <Clock className="w-6 h-6 text-green-500" />
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {Math.round(stats.totalReadingTime / 60)}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            ساعة قراءة
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4 text-center">
          <div className="flex items-center justify-center mb-2">
            <Flame className="w-6 h-6 text-orange-500" />
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {stats.streakDays}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            يوم متتالي
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4 text-center">
          <div className="flex items-center justify-center mb-2">
            <Zap className="w-6 h-6 text-purple-500" />
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {Math.round(stats.engagementScore * 100)}%
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            نشاط التفاعل
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const ReadingAnalytics = ({ stats }: { stats: UserStats }) => {
  // Prepare data for reading pattern chart
  const patternData = {
    labels: stats.readingPattern.map(p => `${p.hour}:00`),
    datasets: [
      {
        label: 'نشاط القراءة',
        data: stats.readingPattern.map(p => p.count),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
      },
    ],
  };

  // Prepare data for weekly activity chart
  const weeklyData = {
    labels: stats.weeklyActivity.map(w => format(new Date(w.date), 'dd/MM')),
    datasets: [
      {
        label: 'مقالات مقروءة',
        data: stats.weeklyActivity.map(w => w.articles),
        backgroundColor: 'rgba(34, 197, 94, 0.8)',
        yAxisID: 'y',
      },
      {
        label: 'وقت القراءة (دقائق)',
        data: stats.weeklyActivity.map(w => w.time),
        backgroundColor: 'rgba(168, 85, 247, 0.8)',
        yAxisID: 'y1',
      },
    ],
  };

  // Prepare data for categories chart
  const categoriesData = {
    labels: stats.favoriteCategories.map(c => c.name),
    datasets: [
      {
        data: stats.favoriteCategories.map(c => c.percentage),
        backgroundColor: [
          '#EF4444',
          '#F97316',
          '#EAB308',
          '#22C55E',
          '#3B82F6',
          '#8B5CF6',
          '#EC4899',
        ],
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
    },
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Reading pattern */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            نمط القراءة اليومي
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <Line data={patternData} options={chartOptions} />
          </div>
        </CardContent>
      </Card>

      {/* Weekly activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            النشاط الأسبوعي
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <Bar 
              data={weeklyData} 
              options={{
                ...chartOptions,
                scales: {
                  y: {
                    type: 'linear',
                    display: true,
                    position: 'left',
                  },
                  y1: {
                    type: 'linear',
                    display: true,
                    position: 'right',
                    grid: {
                      drawOnChartArea: false,
                    },
                  },
                },
              }} 
            />
          </div>
        </CardContent>
      </Card>

      {/* Favorite categories */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChart className="w-5 h-5" />
            الفئات المفضلة
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <Doughnut data={categoriesData} options={chartOptions} />
          </div>
        </CardContent>
      </Card>

      {/* Engagement metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            مقاييس التفاعل
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Heart className="w-4 h-4 text-red-500" />
              <span>إعجابات</span>
            </div>
            <span className="font-medium">{stats.articlesLiked.toLocaleString()}</span>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bookmark className="w-4 h-4 text-yellow-500" />
              <span>مقالات محفوظة</span>
            </div>
            <span className="font-medium">{stats.articlesSaved.toLocaleString()}</span>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Share2 className="w-4 h-4 text-blue-500" />
              <span>مشاركات</span>
            </div>
            <span className="font-medium">{stats.articlesShared.toLocaleString()}</span>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageCircle className="w-4 h-4 text-green-500" />
              <span>تعليقات</span>
            </div>
            <span className="font-medium">{stats.commentsPosted.toLocaleString()}</span>
          </div>

          <Separator />
          
          <div className="flex items-center justify-between">
            <span>متوسط وقت الجلسة</span>
            <span className="font-medium">
              {formatReadingTime(stats.averageSessionTime)}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const AchievementsList = ({ achievements }: { achievements: Achievement[] }) => {
  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common':
        return 'border-gray-300 bg-gray-50';
      case 'rare':
        return 'border-blue-300 bg-blue-50';
      case 'epic':
        return 'border-purple-300 bg-purple-50';
      case 'legendary':
        return 'border-yellow-300 bg-yellow-50';
      default:
        return 'border-gray-300 bg-gray-50';
    }
  };

  const getRarityLabel = (rarity: string) => {
    switch (rarity) {
      case 'common':
        return 'عادي';
      case 'rare':
        return 'نادر';
      case 'epic':
        return 'ملحمي';
      case 'legendary':
        return 'أسطوري';
      default:
        return 'عادي';
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {achievements.map((achievement) => (
        <motion.div
          key={achievement.id}
          whileHover={{ scale: 1.02 }}
          className={`p-4 rounded-lg border-2 ${getRarityColor(achievement.rarity)} transition-all duration-200`}
        >
          <div className="flex items-start gap-3">
            <div className="text-2xl">{achievement.icon}</div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  {achievement.title}
                </h3>
                <Badge variant="outline" className="text-xs">
                  {getRarityLabel(achievement.rarity)}
                </Badge>
              </div>
              
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                {achievement.description}
              </p>
              
              {achievement.progress !== undefined && achievement.maxProgress && (
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span>التقدم</span>
                    <span>{achievement.progress} / {achievement.maxProgress}</span>
                  </div>
                  <Progress 
                    value={(achievement.progress / achievement.maxProgress) * 100}
                    className="h-1"
                  />
                </div>
              )}
              
              <div className="text-xs text-gray-500 mt-2">
                {formatDistanceToNow(new Date(achievement.unlockedAt), {
                  addSuffix: true,
                  locale: ar
                })}
              </div>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

const RecentActivityList = ({ activities }: { activities: RecentActivity[] }) => {
  return (
    <ScrollArea className="h-96">
      <div className="space-y-3">
        {activities.map((activity) => (
          <motion.div
            key={activity.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <div className="flex-shrink-0">
              {getActivityIcon(activity.type)}
            </div>
            
            <div className="flex-1 min-w-0">
              <p className="text-sm">
                <span className="font-medium">{getActivityLabel(activity.type)}</span>
                <Link 
                  href={`/news/${activity.article.slug}`}
                  className="text-blue-600 hover:text-blue-800 mr-1"
                >
                  {activity.article.title}
                </Link>
              </p>
              
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className="text-xs">
                  {activity.article.category}
                </Badge>
                <span className="text-xs text-gray-500">
                  {formatDistanceToNow(new Date(activity.timestamp), {
                    addSuffix: true,
                    locale: ar
                  })}
                </span>
              </div>
            </div>
            
            {activity.article.thumbnail && (
              <div className="flex-shrink-0">
                <OptimizedImage
                  src={activity.article.thumbnail}
                  alt={activity.article.title}
                  width={40}
                  height={40}
                  className="w-10 h-10 rounded object-cover"
                />
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </ScrollArea>
  );
};

// ===========================================
// Main Component
// ===========================================

export const UserProfileDashboard: React.FC<{ userId?: string }> = ({ userId }) => {
  const { user } = useAuth();
  const { trackPageView } = useAnalytics();
  const [timePeriod, setTimePeriod] = useState('30d');
  
  const targetUserId = userId || user?.id;

  useEffect(() => {
    trackPageView('/profile');
  }, [trackPageView]);

  // Fetch user profile
  const {
    data: profile,
    isLoading: profileLoading,
    error: profileError
  } = useQuery({
    queryKey: ['user-profile', targetUserId],
    queryFn: () => fetchUserProfile(targetUserId!),
    enabled: !!targetUserId,
  });

  // Fetch user stats
  const {
    data: stats,
    isLoading: statsLoading,
    error: statsError
  } = useQuery({
    queryKey: ['user-stats', targetUserId, timePeriod],
    queryFn: () => fetchUserStats(targetUserId!, timePeriod),
    enabled: !!targetUserId,
  });

  // Fetch recent activity
  const {
    data: activities = [],
    isLoading: activitiesLoading,
    error: activitiesError
  } = useQuery({
    queryKey: ['user-activity', targetUserId],
    queryFn: () => fetchRecentActivity(targetUserId!),
    enabled: !!targetUserId,
  });

  if (!targetUserId) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">يجب تسجيل الدخول لعرض الملف الشخصي</p>
        </CardContent>
      </Card>
    );
  }

  if (profileError || statsError) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-red-500 mb-4">حدث خطأ في تحميل البيانات</p>
          <Button onClick={() => window.location.reload()}>
            إعادة المحاولة
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (profileLoading || !profile) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-6">
            <div className="animate-pulse flex flex-col md:flex-row gap-6">
              <div className="w-24 h-24 bg-gray-200 rounded-full"></div>
              <div className="flex-1 space-y-4">
                <div className="h-6 bg-gray-200 rounded w-1/3"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Profile header */}
      <ProfileHeader profile={profile} />

      {/* Stats overview */}
      {stats && <StatsOverview stats={stats} />}

      {/* Time period selector */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">التحليلات والإحصائيات</h2>
        <Select value={timePeriod} onValueChange={setTimePeriod}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">آخر 7 أيام</SelectItem>
            <SelectItem value="30d">آخر 30 يوم</SelectItem>
            <SelectItem value="90d">آخر 3 أشهر</SelectItem>
            <SelectItem value="1y">آخر سنة</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Main content tabs */}
      <Tabs defaultValue="analytics" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="analytics">التحليلات</TabsTrigger>
          <TabsTrigger value="achievements">الإنجازات</TabsTrigger>
          <TabsTrigger value="activity">النشاط الأخير</TabsTrigger>
        </TabsList>

        <TabsContent value="analytics" className="space-y-6">
          {statsLoading ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <Card key={i}>
                  <CardContent className="p-6">
                    <div className="animate-pulse">
                      <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
                      <div className="h-32 bg-gray-200 rounded"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : stats ? (
            <ReadingAnalytics stats={stats} />
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">لا توجد بيانات تحليلية متاحة</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="achievements" className="space-y-6">
          {stats?.achievements ? (
            <AchievementsList achievements={stats.achievements} />
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <Award className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">لا توجد إنجازات متاحة</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="activity" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5" />
                النشاط الأخير
              </CardTitle>
            </CardHeader>
            <CardContent>
              {activitiesLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="animate-pulse flex items-center gap-3 p-3">
                      <div className="w-4 h-4 bg-gray-200 rounded"></div>
                      <div className="flex-1">
                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      </div>
                      <div className="w-10 h-10 bg-gray-200 rounded"></div>
                    </div>
                  ))}
                </div>
              ) : activities.length > 0 ? (
                <RecentActivityList activities={activities} />
              ) : (
                <div className="text-center py-8">
                  <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">لا يوجد نشاط أخير</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default UserProfileDashboard;
