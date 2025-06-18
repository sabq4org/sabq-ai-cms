'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  User, Mail, Crown, Heart, Bell, LogOut, 
  Edit2, Check, X, Star, Award, TrendingUp,
  Calendar, Activity, BookOpen, Share2, Shield,
  Settings, ChevronRight, Zap, Gift, Eye,
  MessageCircle, Bookmark, Camera, Upload
} from 'lucide-react';
import toast from 'react-hot-toast';
import Header from '@/components/Header';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  created_at: string;
  avatar?: string;
}

interface LoyaltyData {
  total_points: number;
  level: string;
  next_level_points: number;
  recent_activities: Activity[];
}

interface Activity {
  id: string;
  action: string;
  points: number;
  created_at: string;
  description: string;
}

interface UserPreference {
  category_id: number;
  category_name: string;
  category_icon: string;
  category_color: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loyaltyData, setLoyaltyData] = useState<LoyaltyData | null>(null);
  const [preferences, setPreferences] = useState<UserPreference[]>([]);
  const [editingPreferences, setEditingPreferences] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userStats, setUserStats] = useState({
    articlesRead: 0,
    interactions: 0,
    shares: 0
  });
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  useEffect(() => {
    checkAuth();
    fetchUserData();
  }, []);

  const checkAuth = () => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.push('/login');
      return;
    }
    setUser(JSON.parse(userData));
  };

  const fetchUserData = async () => {
    try {
      const userData = localStorage.getItem('user');
      if (!userData) return;
      
      const user = JSON.parse(userData);
      
      // جلب نقاط الولاء
      const loyaltyResponse = await fetch(`/api/user/loyalty-points/${user.id}`);
      if (loyaltyResponse.ok) {
        const loyaltyData = await loyaltyResponse.json();
        setLoyaltyData(loyaltyData.data);
      }

      // جلب التفضيلات
      const prefsResponse = await fetch(`/api/user/preferences/${user.id}`);
      if (prefsResponse.ok) {
        const prefsData = await prefsResponse.json();
        setPreferences(prefsData.data);
      }

      // جلب إحصائيات المستخدم
      const interactionsResponse = await fetch(`/api/interactions/all`);
      if (interactionsResponse.ok) {
        const interactionsData = await interactionsResponse.json();
        const userInteractions = interactionsData.data.filter((interaction: any) => 
          interaction.user_id === user.id
        );
        
        // حساب الإحصائيات الحقيقية
        const stats = {
          articlesRead: userInteractions.filter((i: any) => i.interaction_type === 'read').length,
          interactions: userInteractions.filter((i: any) => 
            ['like', 'comment', 'save'].includes(i.interaction_type)
          ).length,
          shares: userInteractions.filter((i: any) => i.interaction_type === 'share').length
        };
        
        setUserStats(stats);
      }
    } catch (error) {
      console.error('خطأ في جلب البيانات:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    toast.success('تم تسجيل الخروج بنجاح');
    router.push('/login');
  };

  const getMembershipLevel = (points: number) => {
    if (points >= 1000) return { name: 'VIP', color: 'purple', icon: '👑', next: null };
    if (points >= 500) return { name: 'ذهبي', color: 'yellow', icon: '🏅', next: 1000 };
    if (points >= 200) return { name: 'مميز', color: 'blue', icon: '⭐', next: 500 };
    return { name: 'أساسي', color: 'gray', icon: '🌟', next: 200 };
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    // التحقق من نوع الملف
    if (!file.type.startsWith('image/')) {
      toast.error('يرجى اختيار ملف صورة صالح');
      return;
    }

    // التحقق من حجم الملف (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('حجم الصورة يجب أن يكون أقل من 5 ميجابايت');
      return;
    }

    setUploadingAvatar(true);

    try {
      const formData = new FormData();
      formData.append('avatar', file);
      formData.append('userId', user.id);

      const response = await fetch('/api/user/upload-avatar', {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        const data = await response.json();
        
        // تحديث بيانات المستخدم
        const updatedUser = { ...user, avatar: data.avatarUrl };
        setUser(updatedUser);
        
        // تحديث localStorage
        localStorage.setItem('user', JSON.stringify(updatedUser));
        
        toast.success('تم تحديث الصورة الشخصية بنجاح');
        
        // تحديث الهيدر
        window.location.reload();
      } else {
        toast.error('حدث خطأ في رفع الصورة');
      }
    } catch (error) {
      console.error('خطأ في رفع الصورة:', error);
      toast.error('حدث خطأ في رفع الصورة');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'read': 
      case 'read_article': 
        return <BookOpen className="w-4 h-4" />;
      case 'share':
      case 'share_article': 
        return <Share2 className="w-4 h-4" />;
      case 'like':
      case 'like_article': 
        return <Heart className="w-4 h-4" />;
      case 'view':
        return <Eye className="w-4 h-4" />;
      case 'comment':
        return <MessageCircle className="w-4 h-4" />;
      case 'save':
        return <Bookmark className="w-4 h-4" />;
      case 'select_preferences': 
        return <Activity className="w-4 h-4" />;
      default: 
        return <Star className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <>
        <Header />
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </>
    );
  }

  if (!user) return null;

  const membership = getMembershipLevel(loyaltyData?.total_points || 0);

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50">
        {/* رأس الصفحة بتصميم محسّن */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
          <div className="container mx-auto px-4 py-16">
            <div className="flex items-center justify-between mb-8">
              <h1 className="text-3xl font-bold">الملف الشخصي</h1>
              <Link 
                href="/profile/settings"
                className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors backdrop-blur"
              >
                <Settings className="w-5 h-5" />
                <span>الإعدادات</span>
              </Link>
            </div>

            {/* بطاقة المستخدم */}
            <div className="flex items-center gap-6">
              <div className="relative group">
                {user.avatar ? (
                  <img 
                    src={user.avatar} 
                    alt={user.name}
                    className="w-24 h-24 rounded-full object-cover shadow-xl border-4 border-white/20"
                  />
                ) : (
                  <div className="w-24 h-24 bg-white/20 backdrop-blur rounded-full flex items-center justify-center text-4xl font-bold shadow-xl">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                )}
                
                {/* زر تغيير الصورة */}
                <label className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    className="hidden"
                    disabled={uploadingAvatar}
                  />
                  {uploadingAvatar ? (
                    <div className="animate-spin rounded-full h-8 w-8 border-2 border-white border-t-transparent"></div>
                  ) : (
                    <Camera className="w-8 h-8 text-white" />
                  )}
                </label>
                
                <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-amber-500 rounded-full flex items-center justify-center shadow-lg">
                  <span className="text-xl">{membership.icon}</span>
                </div>
              </div>
              
              <div className="flex-1">
                <h2 className="text-2xl font-bold mb-1">{user.name}</h2>
                <p className="text-blue-100 mb-2">{user.email}</p>
                <div className="flex items-center gap-4 text-sm">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    عضو منذ {formatDate(user.created_at)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Crown className="w-4 h-4 text-amber-400" />
                    عضوية {membership.name}
                  </span>
                </div>
              </div>

              <button
                onClick={() => router.push('/profile/edit')}
                className="px-6 py-3 bg-white text-blue-600 rounded-lg hover:shadow-lg transition-all font-medium flex items-center gap-2"
              >
                <Edit2 className="w-5 h-5" />
                تعديل الملف
              </button>
            </div>
          </div>
        </div>

        {/* المحتوى الرئيسي */}
        <div className="container mx-auto px-4 -mt-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* العمود الأيسر - المعلومات الأساسية */}
            <div className="space-y-6">
              
              {/* بطاقة النقاط والمستوى */}
              <div className="bg-white rounded-xl shadow-md p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <Zap className="w-5 h-5 text-amber-500" />
                  نقاط الولاء
                </h3>
                
                <div className="text-center mb-6">
                  <div className="text-4xl font-bold text-amber-600 mb-2">
                    {loyaltyData?.total_points || 0}
                  </div>
                  <p className="text-gray-600">نقطة</p>
                </div>

                {/* شريط التقدم */}
                {membership.next && (
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>المستوى التالي</span>
                      <span>{membership.next - (loyaltyData?.total_points || 0)} نقطة</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-amber-400 to-amber-600 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${((loyaltyData?.total_points || 0) / membership.next) * 100}%` }}
                      />
                    </div>
                  </div>
                )}

                <div className="pt-4 border-t">
                  <Link 
                    href="/loyalty"
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center justify-center gap-1"
                  >
                    عرض تفاصيل النقاط
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>

              {/* بطاقة الإحصائيات */}
              <div className="bg-white rounded-xl shadow-md p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                  إحصائياتي
                </h3>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">مقالات مقروءة</span>
                    <span className="font-semibold text-gray-800">{userStats.articlesRead}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">تفاعلات</span>
                    <span className="font-semibold text-gray-800">{userStats.interactions}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">مشاركات</span>
                    <span className="font-semibold text-gray-800">{userStats.shares}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* العمود الأوسط - الاهتمامات والنشاطات */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* بطاقة الاهتمامات */}
              <div className="bg-white rounded-xl shadow-md p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                    <Heart className="w-5 h-5 text-red-500" />
                    اهتماماتي
                  </h3>
                  <Link
                    href="/welcome/preferences"
                    className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1 text-sm"
                  >
                    <Edit2 className="w-4 h-4" />
                    تعديل الاهتمامات
                  </Link>
                </div>

                {preferences.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {preferences.map((pref) => (
                      <div 
                        key={pref.category_id}
                        className="flex items-center gap-3 p-3 rounded-lg border-2 hover:shadow-md transition-shadow"
                        style={{ 
                          backgroundColor: pref.category_color + '10',
                          borderColor: pref.category_color + '30'
                        }}
                      >
                        <span className="text-2xl">{pref.category_icon}</span>
                        <span className="font-medium text-gray-700">
                          {pref.category_name}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Heart className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                    <p className="text-gray-500 mb-4">لم تختر اهتمامات بعد</p>
                    <Link
                      href="/welcome/preferences"
                      className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Heart className="w-5 h-5" />
                      اختر اهتماماتك الآن
                    </Link>
                  </div>
                )}
              </div>

              {/* بطاقة آخر النشاطات */}
              <div className="bg-white rounded-xl shadow-md p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-blue-600" />
                  آخر النشاطات
                </h3>

                <div className="space-y-4">
                  {loyaltyData?.recent_activities && loyaltyData.recent_activities.length > 0 ? (
                    loyaltyData.recent_activities.slice(0, 5).map((activity) => (
                      <div key={activity.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                            {getActionIcon(activity.action)}
                          </div>
                          <div>
                            <p className="font-medium text-gray-800">{activity.description}</p>
                            <p className="text-sm text-gray-500">{formatDate(activity.created_at)}</p>
                          </div>
                        </div>
                        {activity.points > 0 && (
                          <span className="font-bold text-green-600">
                            +{activity.points}
                          </span>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <Activity className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                      <p className="text-gray-500">لا توجد نشاطات حتى الآن</p>
                      <p className="text-sm text-gray-400 mt-1">ابدأ بقراءة المقالات لكسب النقاط!</p>
                    </div>
                  )}
                </div>

                {loyaltyData?.recent_activities && loyaltyData.recent_activities.length > 5 && (
                  <div className="mt-4 pt-4 border-t">
                    <Link 
                      href="/loyalty"
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center justify-center gap-1"
                    >
                      عرض جميع النشاطات
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
} 