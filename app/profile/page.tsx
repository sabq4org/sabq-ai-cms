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
import { getMembershipLevel, getProgressToNextLevel, getPointsToNextLevel } from '@/lib/loyalty';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  created_at: string;
  avatar?: string;
  gender?: string;
  city?: string;
  loyaltyLevel?: string;
  loyaltyPoints?: number;
  role?: string;
  status?: string;
  isVerified?: boolean;
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
  const [showLoyaltyModal, setShowLoyaltyModal] = useState(false);

  useEffect(() => {
    checkAuth();
    fetchUserData();
  }, []);

  const checkAuth = async () => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.push('/login');
      return;
    }
    const localUser = JSON.parse(userData);
    
    // جلب البيانات المحدثة من API
    try {
      const response = await fetch('/api/users');
      if (response.ok) {
        const data = await response.json();
        const users = Array.isArray(data) ? data : data.users || [];
        const updatedUser = users.find((u: any) => u.id === localUser.id);
        
        if (updatedUser) {
          // دمج البيانات المحدثة مع البيانات المحلية
          const mergedUser = { ...localUser, ...updatedUser };
          setUser(mergedUser);
          localStorage.setItem('user', JSON.stringify(mergedUser));
        } else {
          setUser(localUser);
        }
      } else {
        setUser(localUser);
      }
    } catch (error) {
      console.error('Error fetching updated user data:', error);
      setUser(localUser);
    }
  };

  const fetchUserData = async () => {
    try {
      const userData = localStorage.getItem('user');
      if (!userData) return;
      
      const user = JSON.parse(userData);
      console.log('📱 بيانات المستخدم من localStorage:', user);
      setUser(user); // تحديث state بأحدث بيانات المستخدم
      
      // جلب نقاط الولاء
      const loyaltyResponse = await fetch(`/api/loyalty/points?user_id=${user.id}`);
      if (loyaltyResponse.ok) {
        const loyaltyData = await loyaltyResponse.json();
        if (loyaltyData.success) {
          const pointsData = loyaltyData.data || loyaltyData;
          setLoyaltyData({
            total_points: pointsData.total_points || 0,
            level: '', // لم نعد نحتاج المستوى، سيُحسب من النقاط
            next_level_points: 0,
            recent_activities: []
          });
        }
      }

      // جلب التفضيلات - جرب أولاً من API ثم من localStorage
      console.log('🔍 محاولة جلب التفضيلات من API للمستخدم:', user.id);
      try {
        const prefsResponse = await fetch(`/api/user/preferences/${user.id}`);
        console.log('📡 استجابة API التفضيلات:', prefsResponse.status);
        
        if (prefsResponse.ok) {
          const prefsData = await prefsResponse.json();
          console.log('✅ تم جلب التفضيلات من API:', prefsData);
          
          if (prefsData.success && prefsData.data && prefsData.data.length > 0) {
            setPreferences(prefsData.data);
          } else {
            console.log('⚠️ لا توجد تفضيلات في API، محاولة جلبها من localStorage');
            throw new Error('No preferences in API');
          }
        } else {
          console.log('❌ فشل API التفضيلات:', prefsResponse.status);
          throw new Error('API not available');
        }
      } catch (error) {
        console.log('🔄 محاولة جلب الاهتمامات من localStorage...');
        // إذا فشل API، احصل على الاهتمامات من localStorage
        const currentUserData = localStorage.getItem('user');
        if (currentUserData) {
          const currentUser = JSON.parse(currentUserData);
          const userInterests = currentUser.interests || [];
          console.log('🏠 اهتمامات المستخدم من localStorage:', userInterests);
          
          const interestMap: any = {
            'tech': { category_id: 1, category_name: 'تقنية', category_icon: '⚡', category_color: '#3B82F6' },
            'business': { category_id: 2, category_name: 'اقتصاد', category_icon: '📈', category_color: '#10B981' },
            'sports': { category_id: 3, category_name: 'رياضة', category_icon: '⚽', category_color: '#F97316' },
            'culture': { category_id: 4, category_name: 'ثقافة', category_icon: '📚', category_color: '#A855F7' },
            'health': { category_id: 5, category_name: 'صحة', category_icon: '❤️', category_color: '#EC4899' },
            'international': { category_id: 6, category_name: 'دولي', category_icon: '🌍', category_color: '#6366F1' }
          };
          
          const mappedPreferences = userInterests.map((interestId: string) => {
            return interestMap[interestId];
          }).filter(Boolean);
          
          console.log('🎯 التفضيلات المحولة:', mappedPreferences);
          setPreferences(mappedPreferences);
          
          // إذا كانت هناك اهتمامات في localStorage ولكن ليس في API، احفظها في API
          if (mappedPreferences.length > 0) {
            console.log('💾 حفظ التفضيلات في API...');
            try {
              const categoryIds = userInterests.map((interestId: string) => {
                const interest = Object.entries(interestMap).find(([key]) => key === interestId);
                return interest ? (interest[1] as any).category_id : null;
              }).filter(Boolean);

              const saveResponse = await fetch('/api/user/preferences', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  userId: user.id,
                  categoryIds: categoryIds,
                  source: 'sync_from_localstorage'
                }),
              });

              if (saveResponse.ok) {
                console.log('✅ تم حفظ التفضيلات في API بنجاح');
              } else {
                console.log('❌ فشل حفظ التفضيلات في API');
              }
            } catch (saveError) {
              console.error('❌ خطأ في حفظ التفضيلات:', saveError);
            }
          }
        }
      }

      // جلب إحصائيات المستخدم
      try {
        const interactionsResponse = await fetch(`/api/interactions/user/${user.id}`);
        if (interactionsResponse.ok) {
          const interactionsData = await interactionsResponse.json();
          setUserStats(interactionsData.stats || {
            articlesRead: 0,
            interactions: 0,
            shares: 0
          });
        }
      } catch (error) {
        console.error('Error fetching user interactions:', error);
        // استخدام قيم افتراضية
        setUserStats({
          articlesRead: 5,
          interactions: 12,
          shares: 3
        });
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
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('يرجى اختيار ملف صورة صالح (PNG أو JPG)');
      return;
    }

    // التحقق من حجم الملف (2MB max)
    if (file.size > 2 * 1024 * 1024) {
      toast.error('حجم الصورة يجب أن يكون أقل من 2 ميجابايت');
      return;
    }

    setUploadingAvatar(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', 'avatar');
      formData.append('userId', user.id);

      console.log('📤 رفع الصورة للمستخدم:', user.id);

      const uploadResponse = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });

      if (uploadResponse.ok) {
        const uploadData = await uploadResponse.json();
        console.log('✅ تم رفع الصورة:', uploadData);
        
        // تحديث في قاعدة البيانات
        console.log('💾 تحديث قاعدة البيانات...');
        const updateResponse = await fetch('/api/user/update-avatar', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            userId: user.id,
            avatarUrl: (uploadData.data || uploadData).url
          })
        });

        if (updateResponse.ok) {
          const updateData = await updateResponse.json();
          console.log('✅ تم تحديث قاعدة البيانات:', updateData);
          
          // تحديث بيانات المستخدم المحلية
          const avatarUrl = (uploadData.data || uploadData).url;
          const updatedUser = { ...user, avatar: avatarUrl };
          setUser(updatedUser);
          
          // تحديث localStorage
          localStorage.setItem('user', JSON.stringify(updatedUser));
          
          toast.success('تم تحديث الصورة الشخصية بنجاح');
          
          // تحديث الصفحة لضمان ظهور الصورة في جميع الأماكن
          setTimeout(() => {
            window.location.reload();
          }, 1000);
        } else {
          const updateError = await updateResponse.json() as { error?: string };
          console.error('❌ خطأ في تحديث قاعدة البيانات:', updateError);
          toast.error(updateError.error || 'حدث خطأ في تحديث قاعدة البيانات');
        }
      } else {
        const uploadError = await uploadResponse.json();
        console.error('❌ خطأ في رفع الصورة:', uploadError);
        toast.error(uploadError.error || 'حدث خطأ في رفع الصورة');
      }
    } catch (error) {
      console.error('💥 خطأ عام في رفع الصورة:', error);
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
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </>
    );
  }

  if (!user) return null;

  const userPoints = loyaltyData?.total_points || user.loyaltyPoints || 0;
  const membership = getMembershipLevel(userPoints);
  const pointsToNext = getPointsToNextLevel(userPoints);

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* رأس الصفحة بتصميم محسّن */}
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900">
          <div className="max-w-screen-xl mx-auto px-4 py-12">
            <div className="flex items-center justify-between mb-8">
              <h1 className="text-3xl font-bold text-gray-800 dark:text-white">الملف الشخصي</h1>
            </div>

            {/* بطاقة المستخدم */}
            <div className="flex items-center gap-6">
              <div className="relative group">
                {user.avatar ? (
                  <img 
                    src={user.avatar} 
                    alt={user.name}
                    className="w-24 h-24 rounded-full object-cover shadow-xl dark:shadow-gray-900/50 border-4 border-gray-200 dark:border-gray-700"
                  />
                ) : (
                  <div className="w-24 h-24 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center text-4xl font-bold shadow-xl dark:shadow-gray-900/50 text-gray-700 dark:text-gray-300">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                )}
                
                {/* زر تغيير الصورة */}
                <label className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/jpg"
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
                
                <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-amber-500 rounded-full flex items-center justify-center shadow-lg dark:shadow-gray-900/50">
                  <span className="text-xl">{membership.icon}</span>
                </div>
              </div>
              
              <div className="flex-1">
                <h2 className="text-2xl font-bold mb-1 text-gray-800 dark:text-gray-100">{user.name}</h2>
                <p className="text-gray-600 dark:text-gray-400 dark:text-gray-500 mb-2">{user.email}</p>
                <div className="flex items-center gap-4 text-sm text-gray-700 dark:text-gray-300">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    عضو منذ {formatDate(user.created_at)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Crown className="w-4 h-4 text-amber-500" />
                    عضوية {membership.name}
                  </span>
                </div>
              </div>

              <button
                onClick={() => router.push('/profile/edit')}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 hover:shadow-lg dark:shadow-gray-900/50 transition-all font-medium flex items-center gap-2"
              >
                <Edit2 className="w-5 h-5" />
                تعديل الملف
              </button>
            </div>
          </div>
        </div>

        {/* المحتوى الرئيسي */}
        <div className="max-w-screen-xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* العمود الأول - النقاط والإحصائيات */}
            <div className="space-y-6 lg:col-span-1">
              
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm dark:shadow-gray-900/50 hover:shadow-md dark:shadow-gray-900/50 transition-shadow p-6">
                <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-4 flex items-center gap-2">
                  <Zap className="w-5 h-5 text-amber-500" />
                  نقاط الولاء
                </h3>
                
                <div className="text-center mb-6">
                  <div className="text-4xl font-bold text-amber-600 mb-2">
                    {loyaltyData?.total_points || 0}
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 dark:text-gray-500">نقطة</p>
                </div>

                {/* شريط التقدم */}
                {membership.nextLevel && (
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 dark:text-gray-500">
                      <span>المستوى التالي</span>
                      <span>{pointsToNext} نقطة</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-amber-400 to-amber-600 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${getProgressToNextLevel(userPoints)}%` }}
                      />
                    </div>
                  </div>
                )}

                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <button 
                    onClick={() => setShowLoyaltyModal(true)}
                    className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm font-medium flex items-center justify-center gap-1 w-full"
                  >
                    عرض تفاصيل النقاط
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* بطاقة الإحصائيات */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm dark:shadow-gray-900/50 hover:shadow-md dark:shadow-gray-900/50 transition-shadow p-6">
                <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                  إحصائياتي
                </h3>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400 dark:text-gray-500">مقالات مقروءة</span>
                    <span className="font-semibold text-gray-800 dark:text-gray-100">{userStats.articlesRead}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400 dark:text-gray-500">تفاعلات</span>
                    <span className="font-semibold text-gray-800 dark:text-gray-100">{userStats.interactions}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400 dark:text-gray-500">مشاركات</span>
                    <span className="font-semibold text-gray-800 dark:text-gray-100">{userStats.shares}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* العمود الأوسط - الاهتمامات والنشاطات */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* بطاقة الاهتمامات */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm dark:shadow-gray-900/50 hover:shadow-md dark:shadow-gray-900/50 transition-shadow p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
                    <Heart className="w-5 h-5 text-red-500" />
                    اهتماماتي
                  </h3>
                  <Link
                    href="/welcome/preferences"
                    className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium flex items-center gap-1 text-sm"
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
                        className="flex items-center gap-3 p-3 rounded-lg border-2 hover:shadow-md dark:shadow-gray-900/50 transition-shadow"
                        style={{ 
                          backgroundColor: pref.category_color + '10',
                          borderColor: pref.category_color + '30'
                        }}
                      >
                        <span className="text-2xl">{pref.category_icon}</span>
                        <span className="font-medium text-gray-700 dark:text-gray-300">
                          {pref.category_name}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Heart className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                    <p className="text-gray-500 dark:text-gray-400 mb-4">لم تختر اهتمامات بعد</p>
                    <Link
                      href="/welcome/preferences"
                      className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 hover:shadow-lg dark:shadow-gray-900/50 transition-all"
                    >
                      <Heart className="w-5 h-5" />
                      اختر اهتماماتك الآن
                    </Link>
                  </div>
                )}
              </div>

              {/* بطاقة آخر النشاطات */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm dark:shadow-gray-900/50 hover:shadow-md dark:shadow-gray-900/50 transition-shadow p-6">
                <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-6 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-blue-600" />
                  آخر النشاطات
                </h3>

                <div className="space-y-4">
                  {loyaltyData?.recent_activities && loyaltyData.recent_activities.length > 0 ? (
                    loyaltyData.recent_activities.slice(0, 5).map((activity) => (
                      <div key={activity.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400">
                            {getActionIcon(activity.action)}
                          </div>
                          <div>
                            <p className="font-medium text-gray-800 dark:text-gray-100">{activity.description}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400 dark:text-gray-500">{formatDate(activity.created_at)}</p>
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
                      <Activity className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
                      <p className="text-gray-500 dark:text-gray-400">لا توجد نشاطات حتى الآن</p>
                      <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">ابدأ بقراءة المقالات لكسب النقاط!</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

                        {/* Modal تفاصيل النقاط */}
        {showLoyaltyModal && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
              <div className="p-6 border-b border-gray-100 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">تفاصيل نقاط الولاء</h3>
                  <button
                    onClick={() => setShowLoyaltyModal(false)}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 dark:bg-gray-800 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <div className="p-6 overflow-y-auto max-h-[60vh]">
                <div className="space-y-4">
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 mb-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-lg font-semibold text-blue-900 dark:text-blue-200">مستوى العضوية الحالي</p>
                        <p className="text-3xl font-bold flex items-center gap-2 mt-2">
                          <span>{membership.icon}</span>
                          <span style={{ color: membership.color }}>{membership.name}</span>
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-600 dark:text-gray-400 dark:text-gray-500">النقاط الحالية</p>
                        <p className="text-2xl font-bold text-amber-600">{userPoints}</p>
                      </div>
                    </div>
                    {membership.nextLevel && (
                      <div className="mt-4">
                        <p className="text-sm text-gray-600 dark:text-gray-400 dark:text-gray-500 mb-2">التقدم نحو المستوى التالي ({membership.nextLevel} نقطة)</p>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                          <div 
                            className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all duration-500"
                            style={{ width: `${getProgressToNextLevel(userPoints)}%` }}
                          />
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 dark:text-gray-500 mt-1">باقي {pointsToNext} نقطة للوصول إلى المستوى التالي</p>
                      </div>
                    )}
                  </div>
                  
                  <div className="border-t pt-4">
                    <h4 className="font-semibold text-gray-800 dark:text-gray-100 mb-3">كيفية كسب النقاط:</h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                        <span className="flex items-center gap-2">
                          <BookOpen className="w-4 h-4 text-blue-500" />
                          قراءة المقالات
                        </span>
                        <span className="text-sm font-medium text-blue-600">+10 نقاط</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                        <span className="flex items-center gap-2">
                          <Heart className="w-4 h-4 text-red-500" />
                          الإعجاب بالمقالات
                        </span>
                        <span className="text-sm font-medium text-red-600">+5 نقاط</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                        <span className="flex items-center gap-2">
                          <Share2 className="w-4 h-4 text-green-500" />
                          مشاركة المقالات
                        </span>
                        <span className="text-sm font-medium text-green-600">+15 نقاط</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                        <span className="flex items-center gap-2">
                          <Bookmark className="w-4 h-4 text-purple-500" />
                          حفظ المقالات
                        </span>
                        <span className="text-sm font-medium text-purple-600">+5 نقاط</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-4 mt-4">
                    <p className="text-sm text-amber-800 dark:text-amber-200">
                      <strong>ملاحظة:</strong> يتم تحديث النقاط تلقائياً عند كل تفاعل. 
                      احرص على القراءة والتفاعل مع المحتوى لكسب المزيد من النقاط والوصول لمستويات أعلى!
                    </p>
                  </div>
                </div>
              </div>
              <div className="p-6 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400 dark:text-gray-500">إجمالي النقاط</span>
                  <span className="text-2xl font-bold text-amber-600">
                    {userPoints} نقطة
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
} 