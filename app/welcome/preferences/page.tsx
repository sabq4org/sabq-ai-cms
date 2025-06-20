'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Heart, BookOpen, TrendingUp, Globe, Users, Zap, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const interests = [
  { id: 'tech', name: 'تقنية', icon: Zap, color: 'from-blue-500 to-cyan-500' },
  { id: 'business', name: 'اقتصاد', icon: TrendingUp, color: 'from-green-500 to-emerald-500' },
  { id: 'sports', name: 'رياضة', icon: Users, color: 'from-orange-500 to-red-500' },
  { id: 'culture', name: 'ثقافة', icon: BookOpen, color: 'from-purple-500 to-pink-500' },
  { id: 'health', name: 'صحة', icon: Heart, color: 'from-pink-500 to-rose-500' },
  { id: 'international', name: 'دولي', icon: Globe, color: 'from-indigo-500 to-blue-500' }
];

export default function PreferencesPage() {
  const router = useRouter();
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
  const [loadingPreferences, setLoadingPreferences] = useState(true);
  const [initialInterestsCount, setInitialInterestsCount] = useState(0);

    // تحميل الاهتمامات المحفوظة سابقاً
    useEffect(() => {
      const loadSavedInterests = () => {
        try {
          const userData = localStorage.getItem('user');
          if (userData) {
            const user = JSON.parse(userData);
            if (user.interests && Array.isArray(user.interests)) {
              setSelectedInterests(user.interests);
              setInitialInterestsCount(user.interests.length);
            }
          }
        } catch (error) {
          console.error('خطأ في تحميل الاهتمامات:', error);
        } finally {
          setLoadingPreferences(false);
        }
      };

      loadSavedInterests();
    }, []);

  const handleInterestToggle = (interestId: string) => {
    setSelectedInterests(prev => 
      prev.includes(interestId) 
        ? prev.filter(id => id !== interestId)
        : [...prev, interestId]
    );
  };

  const handleSubmit = async () => {
    if (selectedInterests.length === 0) {
      toast.error('اختر اهتماماً واحداً على الأقل');
      return;
    }

    setLoading(true);
    try {
      // حفظ الاهتمامات في localStorage مؤقتاً
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      const updatedUser = {
        ...currentUser,
        interests: selectedInterests,
        has_preferences: true,
        is_new: false
      };
      
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      // رسالة نجاح مختلفة بناءً على السياق
      const isUpdate = currentUser.interests && currentUser.interests.length > 0;
      toast.success(isUpdate ? 'تم تحديث اهتماماتك بنجاح! ✨' : 'تم حفظ اهتماماتك! 🎉');
      
      // التوجيه إلى الصفحة المناسبة
      router.push(isUpdate ? '/profile' : '/newspaper');
      
    } catch (error) {
      toast.error('حدث خطأ في حفظ اهتماماتك');
    } finally {
      setLoading(false);
    }
  };

  // عرض حالة التحميل أثناء جلب الاهتمامات المحفوظة
  if (loadingPreferences) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">جاري تحميل اهتماماتك...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4">
      {/* خلفية ديناميكية */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-300 dark:bg-blue-600 rounded-full blur-3xl opacity-30 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-300 dark:bg-purple-600 rounded-full blur-3xl opacity-30 animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto pt-20">
        {/* الترحيب */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full shadow-lg dark:shadow-gray-900/50 mb-6">
            <Heart className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-4">مرحباً بك في رحلتك الذكية! 🚀</h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            ساعدنا في تخصيص تجربتك عبر اختيار اهتماماتك. سنقوم بعرض المحتوى الأكثر ملاءمة لك.
          </p>
        </div>

        {/* بطاقة الاهتمامات */}
        <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-md rounded-3xl shadow-xl dark:shadow-gray-900/50 p-8 border border-white/50 dark:border-gray-700/50">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6 text-center">
            {initialInterestsCount > 0 ? 'تحديث اهتماماتك' : 'اختر اهتماماتك'}
          </h2>
          
          {/* رسالة توضيحية إذا كانت هناك اهتمامات محفوظة */}
          {initialInterestsCount > 0 && (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6 text-center">
              <p className="text-blue-800 dark:text-blue-200">
                لديك {initialInterestsCount} اهتمامات محفوظة. يمكنك تعديلها أو الإبقاء عليها.
              </p>
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {interests.map((interest) => {
              const Icon = interest.icon;
              const isSelected = selectedInterests.includes(interest.id);
              
              return (
                <button
                  key={interest.id}
                  onClick={() => handleInterestToggle(interest.id)}
                  className={`relative p-6 rounded-2xl border-2 transition-all duration-300 transform hover:scale-105 ${
                    isSelected 
                      ? 'border-blue-500 shadow-lg shadow-blue-500/25 dark:shadow-blue-500/10' 
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  {/* تأثير الخلفية المتحركة عند التحديد */}
                  {isSelected && (
                    <div className={`absolute inset-0 bg-gradient-to-r ${interest.color} opacity-10 rounded-2xl`}></div>
                  )}
                  
                  {/* محتوى البطاقة */}
                  <div className="relative z-10 flex flex-col items-center">
                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${interest.color} flex items-center justify-center mb-4 shadow-lg`}>
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    
                    <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-2">{interest.name}</h3>
                    
                    {/* مؤشر التحديد */}
                    {isSelected && (
                      <div className="absolute top-3 right-3">
                        <CheckCircle className="w-6 h-6 text-blue-500" />
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* ملخص الاختيارات */}
          {selectedInterests.length > 0 && (
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-6 mb-6">
              <h3 className="text-lg font-bold text-blue-900 dark:text-blue-200 mb-3">اهتماماتك المختارة:</h3>
              <div className="flex flex-wrap gap-2">
                {selectedInterests.map(id => {
                  const interest = interests.find(i => i.id === id);
                  return (
                    <span
                      key={id}
                      className={`px-4 py-2 bg-gradient-to-r ${interest?.color} text-white text-sm font-medium rounded-full shadow-md`}
                    >
                      {interest?.name}
                    </span>
                  );
                })}
              </div>
            </div>
          )}

          {/* أزرار الإجراءات */}
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => router.push(initialInterestsCount > 0 ? '/profile' : '/newspaper')}
              className="px-6 py-3 text-gray-600 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              {initialInterestsCount > 0 ? 'إلغاء' : 'تخطي الآن'}
            </button>
            
            <button
              onClick={handleSubmit}
              disabled={selectedInterests.length === 0 || loading}
              className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-medium hover:from-blue-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>جارٍ الحفظ...</span>
                </div>
              ) : (
                selectedInterests.length > 0 
                  ? `حفظ التحديثات (${selectedInterests.length})`
                  : `ابدأ رحلتي (${selectedInterests.length})`
              )}
            </button>
          </div>
        </div>

        {/* نصائح */}
        <div className="text-center mt-8">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            💡 يمكنك تعديل اهتماماتك في أي وقت من الإعدادات
          </p>
        </div>
      </div>
    </div>
  );
} 