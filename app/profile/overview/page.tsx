'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { 
  Heart, 
  Bookmark, 
  User, 
  Settings, 
  TrendingUp, 
  Calendar,
  Award,
  Target,
  Activity,
  ChevronRight,
  ArrowLeft,
  Loader2,
  Crown,
  Star,
  Zap,
  BookOpen,
  Clock
} from 'lucide-react';
import { formatRelativeDate } from '@/lib/date-utils';

interface UserStats {
  totalLikes: number;
  totalSaves: number;
  totalViews: number;
  articlesRead: number;
  loyaltyPoints: number;
  joinedDate: string;
  thisMonthLikes: number;
  thisMonthSaves: number;
  favoriteCategory: string;
}

interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  created_at: string;
  loyalty_points: number;
}

export default function ProfileOverviewPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const userId = localStorage.getItem('user_id');
    const userData = localStorage.getItem('user');

    if (!userId || userId === 'anonymous' || !userData) {
      router.push('/login?redirect=/profile');
      return;
    }

    try {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      await fetchUserStats(userId);
    } catch (error) {
      console.error('Error parsing user data:', error);
      router.push('/login?redirect=/profile');
    }
  };

  const fetchUserStats = async (userId: string) => {
    try {
      // جلب إحصائيات الإعجاب
      const likesResponse = await fetch(`/api/interactions/liked-articles?userId=${userId}&limit=1`);
      const likesData = await likesResponse.json();
      
      // جلب إحصائيات المحفوظات
      const savedResponse = await fetch(`/api/interactions/saved-articles?userId=${userId}&limit=1`);
      const savedData = await savedResponse.json();

      // حساب الإحصائيات
      const thisMonthStart = new Date();
      thisMonthStart.setDate(1);
      thisMonthStart.setHours(0, 0, 0, 0);

      const userStats: UserStats = {
        totalLikes: likesData.success ? likesData.data.total : 0,
        totalSaves: savedData.success ? savedData.data.total : 0,
        totalViews: 0, // سيتم تحديثها لاحقاً
        articlesRead: 0, // سيتم تحديثها لاحقاً
        loyaltyPoints: user?.loyalty_points || 0,
        joinedDate: user?.created_at || '',
        thisMonthLikes: 0, // سيتم حسابها من البيانات
        thisMonthSaves: 0, // سيتم حسابها من البيانات
        favoriteCategory: 'غير محدد'
      };

      setStats(userStats);
    } catch (error) {
      console.error('Error fetching user stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const getMembershipLevel = (points: number) => {
    if (points < 100) return { name: 'مبتدئ', color: 'text-gray-500', bgColor: 'bg-gray-100', icon: User };
    if (points < 500) return { name: 'نشيط', color: 'text-blue-500', bgColor: 'bg-blue-100', icon: Star };
    if (points < 1000) return { name: 'خبير', color: 'text-purple-500', bgColor: 'bg-purple-100', icon: Award };
    if (points < 2000) return { name: 'نخبة', color: 'text-gold-500', bgColor: 'bg-yellow-100', icon: Crown };
    return { name: 'أسطورة', color: 'text-red-500', bgColor: 'bg-red-100', icon: Zap };
  };

  if (loading) {
    return (
      <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-blue-500 mx-auto mb-4" />
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              جاري تحميل الملف الشخصي...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!user || !stats) {
    return (
      <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <p className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              خطأ في تحميل البيانات
            </p>
            <button
              onClick={() => router.push('/login')}
              className="mt-4 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              تسجيل الدخول
            </button>
          </div>
        </div>
      </div>
    );
  }

  const membershipLevel = getMembershipLevel(stats.loyaltyPoints);
  const MembershipIcon = membershipLevel.icon;

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* رأس الصفحة */}
      <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} border-b ${
        darkMode ? 'border-gray-700' : 'border-gray-200'
      } shadow-sm`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => router.back()}
              className={`p-2 rounded-lg transition-colors ${
                darkMode 
                  ? 'hover:bg-gray-700 text-gray-400' 
                  : 'hover:bg-gray-100 text-gray-600'
              }`}
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            
            <Link
              href="/profile/settings"
              className={`p-2 rounded-lg transition-colors ${
                darkMode 
                  ? 'hover:bg-gray-700 text-gray-400' 
                  : 'hover:bg-gray-100 text-gray-600'
              }`}
            >
              <Settings className="w-5 h-5" />
            </Link>
          </div>

          <div className="flex items-start gap-6">
            {/* صورة المستخدم */}
            <div className="relative">
              <div className={`w-24 h-24 rounded-full overflow-hidden border-4 ${
                membershipLevel.bgColor
              } ${membershipLevel.color} border-opacity-20`}>
                {user.avatar ? (
                  <Image
                    src={user.avatar}
                    alt={user.name || 'المستخدم'}
                    width={96}
                    height={96}
                    className="object-cover"
                  />
                ) : (
                  <div className={`w-full h-full flex items-center justify-center ${
                    darkMode ? 'bg-gray-700' : 'bg-gray-200'
                  }`}>
                    <User className={`w-12 h-12 ${
                      darkMode ? 'text-gray-500' : 'text-gray-400'
                    }`} />
                  </div>
                )}
              </div>
              {/* شارة العضوية */}
              <div className={`absolute -bottom-2 -right-2 p-1.5 rounded-full ${
                membershipLevel.bgColor
              } border-2 ${darkMode ? 'border-gray-800' : 'border-white'}`}>
                <MembershipIcon className={`w-4 h-4 ${membershipLevel.color}`} />
              </div>
            </div>

            {/* معلومات المستخدم */}
            <div className="flex-1">
              <h1 className={`text-2xl font-bold ${
                darkMode ? 'text-white' : 'text-gray-900'
              } mb-1`}>
                {user.name || 'مستخدم سبق'}
              </h1>
              
              <p className={`text-sm ${
                darkMode ? 'text-gray-400' : 'text-gray-600'
              } mb-3`}>
                {user.email}
              </p>

              <div className="flex items-center gap-4 flex-wrap">
                <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${
                  membershipLevel.bgColor
                }`}>
                  <MembershipIcon className={`w-4 h-4 ${membershipLevel.color}`} />
                  <span className={`text-sm font-medium ${membershipLevel.color}`}>
                    {membershipLevel.name}
                  </span>
                </div>

                <div className={`flex items-center gap-1 text-sm ${
                  darkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  <Calendar className="w-4 h-4" />
                  انضم {formatRelativeDate(stats.joinedDate)}
                </div>

                <div className={`flex items-center gap-1 text-sm ${
                  darkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  <Star className="w-4 h-4" />
                  {stats.loyaltyPoints} نقطة
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* الإحصائيات السريعة */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className={`p-4 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-white'} border ${
            darkMode ? 'border-gray-700' : 'border-gray-200'
          }`}>
            <div className="flex items-center gap-3 mb-2">
              <Heart className="w-5 h-5 text-red-500" />
              <span className={`text-sm font-medium ${
                darkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>
                الإعجابات
              </span>
            </div>
            <p className={`text-2xl font-bold ${
              darkMode ? 'text-white' : 'text-gray-900'
            }`}>
              {stats.totalLikes}
            </p>
          </div>

          <div className={`p-4 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-white'} border ${
            darkMode ? 'border-gray-700' : 'border-gray-200'
          }`}>
            <div className="flex items-center gap-3 mb-2">
              <Bookmark className="w-5 h-5 text-blue-500" />
              <span className={`text-sm font-medium ${
                darkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>
                المحفوظات
              </span>
            </div>
            <p className={`text-2xl font-bold ${
              darkMode ? 'text-white' : 'text-gray-900'
            }`}>
              {stats.totalSaves}
            </p>
          </div>

          <div className={`p-4 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-white'} border ${
            darkMode ? 'border-gray-700' : 'border-gray-200'
          }`}>
            <div className="flex items-center gap-3 mb-2">
              <BookOpen className="w-5 h-5 text-green-500" />
              <span className={`text-sm font-medium ${
                darkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>
                مقالات مقروءة
              </span>
            </div>
            <p className={`text-2xl font-bold ${
              darkMode ? 'text-white' : 'text-gray-900'
            }`}>
              {stats.articlesRead}
            </p>
          </div>

          <div className={`p-4 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-white'} border ${
            darkMode ? 'border-gray-700' : 'border-gray-200'
          }`}>
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className="w-5 h-5 text-purple-500" />
              <span className={`text-sm font-medium ${
                darkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>
                النقاط
              </span>
            </div>
            <p className={`text-2xl font-bold ${
              darkMode ? 'text-white' : 'text-gray-900'
            }`}>
              {stats.loyaltyPoints}
            </p>
          </div>
        </div>

        {/* الإجراءات السريعة */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* المقالات المعجب بها */}
          <Link
            href="/profile/likes"
            className={`group p-6 rounded-xl transition-all hover:shadow-lg ${
              darkMode 
                ? 'bg-gray-800 border border-gray-700 hover:border-gray-600' 
                : 'bg-white border border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-lg bg-red-100 dark:bg-red-900/20">
                  <Heart className="w-6 h-6 text-red-500" />
                </div>
                <div>
                  <h3 className={`font-semibold ${
                    darkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    المقالات المعجب بها
                  </h3>
                  <p className={`text-sm ${
                    darkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    {stats.totalLikes} مقال
                  </p>
                </div>
              </div>
              <ChevronRight className={`w-5 h-5 transition-transform group-hover:translate-x-1 ${
                darkMode ? 'text-gray-400' : 'text-gray-600'
              }`} />
            </div>
            
            <div className={`text-xs ${
              darkMode ? 'text-gray-500' : 'text-gray-500'
            }`}>
              استعرض جميع المقالات التي أعجبت بها وإدارتها بسهولة
            </div>
          </Link>

          {/* المقالات المحفوظة */}
          <Link
            href="/profile/saved"
            className={`group p-6 rounded-xl transition-all hover:shadow-lg ${
              darkMode 
                ? 'bg-gray-800 border border-gray-700 hover:border-gray-600' 
                : 'bg-white border border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-900/20">
                  <Bookmark className="w-6 h-6 text-blue-500" />
                </div>
                <div>
                  <h3 className={`font-semibold ${
                    darkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    المقالات المحفوظة
                  </h3>
                  <p className={`text-sm ${
                    darkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    {stats.totalSaves} مقال
                  </p>
                </div>
              </div>
              <ChevronRight className={`w-5 h-5 transition-transform group-hover:translate-x-1 ${
                darkMode ? 'text-gray-400' : 'text-gray-600'
              }`} />
            </div>
            
            <div className={`text-xs ${
              darkMode ? 'text-gray-500' : 'text-gray-500'
            }`}>
              الوصول السريع للمقالات المحفوظة للقراءة لاحقاً
            </div>
          </Link>
        </div>

        {/* روابط إضافية */}
        <div className="mt-8 grid md:grid-cols-3 gap-4">
          <Link
            href="/profile/settings"
            className={`group p-4 rounded-xl transition-all hover:shadow-md ${
              darkMode 
                ? 'bg-gray-800 border border-gray-700 hover:border-gray-600' 
                : 'bg-white border border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center gap-3">
              <Settings className={`w-5 h-5 ${
                darkMode ? 'text-gray-400' : 'text-gray-600'
              }`} />
              <span className={`font-medium ${
                darkMode ? 'text-white' : 'text-gray-900'
              }`}>
                الإعدادات
              </span>
              <ChevronRight className={`w-4 h-4 transition-transform group-hover:translate-x-1 ${
                darkMode ? 'text-gray-400' : 'text-gray-600'
              } mr-auto`} />
            </div>
          </Link>

          <Link
            href="/profile/interactions"
            className={`group p-4 rounded-xl transition-all hover:shadow-md ${
              darkMode 
                ? 'bg-gray-800 border border-gray-700 hover:border-gray-600' 
                : 'bg-white border border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center gap-3">
              <Activity className={`w-5 h-5 ${
                darkMode ? 'text-gray-400' : 'text-gray-600'
              }`} />
              <span className={`font-medium ${
                darkMode ? 'text-white' : 'text-gray-900'
              }`}>
                النشاط
              </span>
              <ChevronRight className={`w-4 h-4 transition-transform group-hover:translate-x-1 ${
                darkMode ? 'text-gray-400' : 'text-gray-600'
              } mr-auto`} />
            </div>
          </Link>

          <Link
            href="/profile/edit"
            className={`group p-4 rounded-xl transition-all hover:shadow-md ${
              darkMode 
                ? 'bg-gray-800 border border-gray-700 hover:border-gray-600' 
                : 'bg-white border border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center gap-3">
              <User className={`w-5 h-5 ${
                darkMode ? 'text-gray-400' : 'text-gray-600'
              }`} />
              <span className={`font-medium ${
                darkMode ? 'text-white' : 'text-gray-900'
              }`}>
                تحرير الملف
              </span>
              <ChevronRight className={`w-4 h-4 transition-transform group-hover:translate-x-1 ${
                darkMode ? 'text-gray-400' : 'text-gray-600'
              } mr-auto`} />
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
