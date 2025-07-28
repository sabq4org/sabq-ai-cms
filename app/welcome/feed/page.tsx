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
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadUserData = async () => {
      try {
        // آلية Timeout للحماية من التعليق (4 ثوانٍ)
        const timeoutId = setTimeout(() => {
          console.warn('⏰ انتهت مهلة التحميل - سيتم عرض المحتوى الافتراضي');
          setError('فشل في تحميل بعض البيانات. يمكنك المتابعة أو المحاولة لاحقاً.');
          setLoading(false);
        }, 4000);

        const userData = localStorage.getItem('user');
        if (userData) {
          const parsedUser = JSON.parse(userData);
          setUser(parsedUser);
          
          // جلب التصنيفات من API
          const loadedCategories = await fetchCategories();
          
          // استخدام categoryIds إذا كانت متوفرة، وإلا استخدم interests
          const userCategoryIds = parsedUser.categoryIds || parsedUser.interests || [];
          
          console.log('🔍 فحص اهتمامات المستخدم:', {
            categoryIds: parsedUser.categoryIds,
            interests: parsedUser.interests,
            finalUserCategoryIds: userCategoryIds,
            loadedCategoriesCount: loadedCategories.length
          });
          
          // تحديث التصنيفات المطابقة للمستخدم
          if (loadedCategories.length > 0 && userCategoryIds.length > 0) {
            const matchedCategories = loadedCategories.filter(cat => 
              userCategoryIds.includes(cat.id)
            );
            setUserCategories(matchedCategories);
            console.log('✅ تم تحديد اهتمامات المستخدم:', {
              matchedCount: matchedCategories.length,
              matchedCategories: matchedCategories.map(c => ({id: c.id, name: c.name_ar}))
            });
          } else {
            console.log('⚠️ لم يتم العثور على اهتمامات:', {
              loadedCategoriesCount: loadedCategories.length,
              userCategoryIdsCount: userCategoryIds.length
            });
          }
          
          // تم إلغاء جلب المقالات المقترحة حسب طلب المستخدم
          console.log('🚫 تم إلغاء جلب المقالات المقترحة');
          
        } else {
          // إذا لم توجد بيانات المستخدم، توجيه للصفحة الرئيسية
          console.log('⚠️ لا توجد بيانات مستخدم - التوجيه للصفحة الرئيسية');
          router.push('/');
          return;
        }

        // إلغاء Timeout إذا تم التحميل بنجاح
        clearTimeout(timeoutId);
        
      } catch (error) {
        console.error('خطأ في تحميل بيانات المستخدم:', error);
        setError('حدث خطأ في تحميل البيانات. سيتم توجيهك للصفحة الرئيسية...');
        
        // توجيه للصفحة الرئيسية بعد 3 ثوانٍ
        setTimeout(() => {
          router.push('/');
        }, 3000);
      } finally {
        // 🔥 الإصلاح الرئيسي: تأكد من إنهاء التحميل في جميع الحالات
        setLoading(false);
      }
    };

    loadUserData();
  }, [router]);

  const fetchCategories = async (): Promise<Category[]> => {
    try {
      console.log('📥 جلب التصنيفات من API...');
      const response = await fetch('/api/categories');
      if (response.ok) {
        const result = await response.json();
        if (result.success && result.categories) {
          console.log('✅ تم جلب التصنيفات بنجاح:', result.categories.length);
          setCategories(result.categories);
          return result.categories;
        }
      }
      
      console.warn('⚠️ فشل جلب التصنيفات من API');
      return [];
    } catch (error) {
      console.error('خطأ في جلب التصنيفات:', error);
      return [];
    }
  };

  // ===== تم حذف جميع دوال ومراجع المقالات المخصصة نهائياً =====
  
  const handleStartReading = () => {
    toast.success('مرحباً بك في صحيفة سبق! 🎉');
    router.push('/');
  };

  const handleRetry = () => {
    setLoading(true);
    setError(null);
    window.location.reload();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400 mb-4">جاري تحضير تجربتك المخصصة...</p>
          
          {/* مؤشر تقدم وهمي للراحة البصرية */}
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-4">
            <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{ width: '70%' }}></div>
          </div>
          
          <p className="text-sm text-gray-500 dark:text-gray-500">
            💡 نحضر لك المحتوى المناسب لاهتماماتك
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">⚠️</span>
          </div>
          <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-2">مشكلة في التحميل</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
          
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={handleRetry}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              إعادة المحاولة
            </button>
            <Link
              href="/welcome/preferences"
              className="px-6 py-3 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors text-center"
            >
              تعديل الاهتمامات
            </Link>
            <Link
              href="/"
              className="px-6 py-3 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-center"
            >
              الصفحة الرئيسية
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400 mb-4">جاري توجيهك للصفحة الرئيسية...</p>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
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
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  لم يتم اختيار اهتمامات بعد
                </p>
                <Link
                  href="/welcome/preferences"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                >
                  اختر اهتماماتك الآن
                  <ArrowRight className="w-4 h-4" />
                </Link>
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