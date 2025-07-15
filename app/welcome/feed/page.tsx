'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { 
  Heart, Star, TrendingUp, 
  BookOpen, Zap, ArrowRight, Gift, Award, Target,
  Sparkles, Trophy, Calendar, Share2
} from 'lucide-react';
interface UserData {
  id: string;
  name: string;
  interests: string[];
  categoryIds?: string[];
}

interface Category {
  id: string;
  name_ar: string;
  name_en?: string;
  description: string;
  slug: string;
  color_hex: string;
  icon: string;
  position: number;
  is_active: boolean;
}
// ===== ملاحظة مهمة =====
// تم حذف قسم المقالات المخصصة نهائياً بناءً على طلب المستخدم
// الصفحة تعرض فقط: الترحيب + الاهتمامات + نقاط الولاء + النصائح
// لا توجد مقالات مقترحة أو مخصصة في هذه الصفحة
export default function WelcomeFeedPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [userCategories, setUserCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [loyaltyPoints, setLoyaltyPoints] = useState(5); // النقاط المكتسبة من الاهتمامات
  useEffect(() => {
    const loadUserData = async () => {
      try {
        const userData = localStorage.getItem('user');
        if (userData) {
          const parsedUser = JSON.parse(userData);
          setUser(parsedUser);
          
          // جلب التصنيفات من API
          await fetchCategories();
          
          // استخدام categoryIds إذا كانت متوفرة، وإلا استخدم interests
          const userCategoryIds = parsedUser.categoryIds || parsedUser.interests || [];
          // تم إلغاء جلب المقالات المقترحة حسب طلب المستخدم
          console.log('🚫 تم إلغاء جلب المقالات المقترحة');
        } else {
          // إذا لم توجد بيانات المستخدم، توجيه للصفحة الرئيسية
          router.push('/');
        }
      } catch (error) {
        console.error('خطأ في تحميل بيانات المستخدم:', error);
        router.push('/');
      }
    };
    loadUserData();
  }, [router]);

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories');
      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data) {
          setCategories(result.data);
          return result.data;
        }
      }
    } catch (error) {
      console.error('خطأ في جلب التصنيفات:', error);
    }
    return [];
  };

  // تحديث useEffect ليعيد ضبط userCategories بعد جلب التصنيفات
  useEffect(() => {
    if (categories.length > 0 && user?.categoryIds) {
      const matchedCategories = categories.filter(cat => 
        user.categoryIds?.includes(cat.id) || user.interests?.includes(cat.id)
      );
      setUserCategories(matchedCategories);
    }
  }, [categories, user]);

  // ===== تم حذف جميع دوال ومراجع المقالات المخصصة نهائياً =====
  
  const handleStartReading = () => {
    toast.success('مرحباً بك في صحيفة سبق! 🎉');
    router.push('/');
  };

  if (loading || !user) {
    return (
  <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">جاري تحضير تجربتك المخصصة...</p>
        </div>
      </div>
    );
  }
  return (
  <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* خلفية ديناميكية */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-300 dark:bg-blue-600 rounded-full blur-3xl opacity-30 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-300 dark:bg-purple-600 rounded-full blur-3xl opacity-30 animate-pulse delay-1000"></div>
      </div>
      <div className="relative z-10 max-w-6xl mx-auto p-4 pt-20">
        {/* ترحيب شخصي */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full shadow-lg dark:shadow-gray-900/50 mb-6">
            <Sparkles className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-4">
            أهلاً بك يا {user.name}! 🎉
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-6">
            تهانينا! لقد أكملت إعداد ملفك الشخصي وحصلت على أول نقاط الولاء. إليك تجربة مخصصة بناءً على اهتماماتك.
          </p>
          {/* بطاقة نقاط الولاء */}
          <div className="inline-flex items-center gap-4 bg-white/90 dark:bg-gray-800/90 backdrop-blur-md rounded-2xl p-6 shadow-lg border border-white/50 dark:border-gray-700/50 mb-8">
            <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full">
              <Gift className="w-6 h-6 text-white" />
            </div>
            <div className="text-left">
              <h3 className="text-lg font-bold text-gray-800 dark:text-white">+{loyaltyPoints} نقاط ولاء</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">مكافأة إتمام الاهتمامات</p>
            </div>
          </div>
        </div>
        {/* اهتمامات المستخدم */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6 text-center">اهتماماتك المختارة</h2>
          <p className="text-center text-gray-600 dark:text-gray-400 mb-6">
            التصنيفات التي اخترتها لعرض المحتوى الأنسب لك
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            {userCategories.length > 0 ? (
              userCategories.map((category) => (
                <div
                  key={category.id}
                  className="flex items-center gap-3 px-6 py-3 text-white rounded-full shadow-lg transform hover:scale-105 transition-all duration-300"
                  style={{ 
                    background: `linear-gradient(135deg, ${category.color_hex}, ${category.color_hex}dd)`
                  }}
                >
                  <span className="text-lg">{category.icon}</span>
                  <span className="font-medium">{category.name_ar}</span>
                </div>
              ))
            ) : (
              <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-md rounded-2xl p-6 shadow-lg border border-white/50 dark:border-gray-700/50 text-center">
                <p className="text-gray-600 dark:text-gray-400">
                  لم يتم اختيار اهتمامات بعد
                </p>
              </div>
            )}
          </div>
        </div>
        {/* تم حذف قسم المقالات المقترحة حسب طلب المستخدم */}
        {/* إحصائيات وتحفيز */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-md rounded-2xl p-6 shadow-lg border border-white/50 dark:border-gray-700/50 text-center">
            <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full mx-auto mb-4">
              <Star className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-2">مستوى مبتدئ</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">ابدأ رحلتك في القراءة</p>
          </div>
          <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-md rounded-2xl p-6 shadow-lg border border-white/50 dark:border-gray-700/50 text-center">
            <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full mx-auto mb-4">
              <Award className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-2">{loyaltyPoints} نقطة</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">نقاط الولاء الحالية</p>
          </div>
          <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-md rounded-2xl p-6 shadow-lg border border-white/50 dark:border-gray-700/50 text-center">
            <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mx-auto mb-4">
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-2">اليوم الأول</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">من رحلتك معنا</p>
          </div>
          <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-md rounded-2xl p-6 shadow-lg border border-white/50 dark:border-gray-700/50 text-center">
            <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-full mx-auto mb-4">
              <Share2 className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-2">شارك المحتوى</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">احصل على 5 نقاط</p>
          </div>
        </div>
        {/* نصائح سريعة */}
        <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-md rounded-2xl p-8 shadow-lg border border-white/50 dark:border-gray-700/50 mb-12">
          <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-6 text-center">نصائح لتحقيق أقصى استفادة</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-start gap-4">
              <div className="flex items-center justify-center w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex-shrink-0">
                <BookOpen className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h4 className="font-medium text-gray-800 dark:text-white mb-1">اقرأ يومياً</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">احصل على نقاط إضافية بقراءة مقال واحد يومياً</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="flex items-center justify-center w-8 h-8 bg-green-100 dark:bg-green-900 rounded-full flex-shrink-0">
                <Share2 className="w-4 h-4 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h4 className="font-medium text-gray-800 dark:text-white mb-1">شارك المحتوى</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">احصل على 5 نقاط عند مشاركة مقال</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="flex items-center justify-center w-8 h-8 bg-purple-100 dark:bg-purple-900 rounded-full flex-shrink-0">
                <Heart className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <h4 className="font-medium text-gray-800 dark:text-white mb-1">تفاعل مع المحتوى</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">أعجب واحفظ المقالات المفضلة</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="flex items-center justify-center w-8 h-8 bg-orange-100 dark:bg-orange-900 rounded-full flex-shrink-0">
                <Target className="w-4 h-4 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <h4 className="font-medium text-gray-800 dark:text-white mb-1">حدّث اهتماماتك</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">يمكنك تعديل اهتماماتك في أي وقت</p>
              </div>
            </div>
          </div>
        </div>
        {/* أزرار الإجراءات */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={handleStartReading}
            className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-medium hover:from-blue-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center justify-center gap-2"
          >
            <span>ابدأ القراءة الآن</span>
            <ArrowRight className="w-5 h-5" />
          </button>
          <Link
            href="/profile"
            className="px-8 py-4 text-gray-600 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-center"
          >
            عرض الملف الشخصي
          </Link>
        </div>
      </div>
    </div>
  );
}