'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Heart, Globe, CheckCircle, Trophy, Building2, MapPin, Palette, Edit3, Star,
  Monitor, DollarSign
} from 'lucide-react';
import toast from 'react-hot-toast';

// خريطة الأيقونات للتصنيفات
const categoryIcons: { [key: string]: any } = {
  'تقنية': Monitor,
  'رياضة': Trophy,
  'اقتصاد': DollarSign,
  'سياسة': Building2,
  'محليات': MapPin,
  'ثقافة ومجتمع': Palette,
  'مقالات رأي': Edit3,
  'منوعات': Star,
  // احتياطي
  'default': Globe
};

// خريطة الألوان للتصنيفات
const categoryColors: { [key: string]: string } = {
  'تقنية': 'from-purple-500 to-purple-700',
  'رياضة': 'from-orange-500 to-amber-600',
  'اقتصاد': 'from-green-500 to-emerald-600',
  'سياسة': 'from-red-500 to-red-700',
  'محليات': 'from-blue-500 to-blue-700',
  'ثقافة ومجتمع': 'from-pink-500 to-rose-600',
  'مقالات رأي': 'from-violet-500 to-purple-700',
  'منوعات': 'from-gray-500 to-gray-700',
  // احتياطي
  'default': 'from-indigo-500 to-blue-600'
};

export default function PreferencesPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [loadingPreferences, setLoadingPreferences] = useState(true);
  const [initialCategoriesCount, setInitialCategoriesCount] = useState(0);

  // جلب التصنيفات من قاعدة البيانات
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/categories');
        const data = await response.json();
        
        if (data.success && data.categories) {
          // فلترة التصنيفات النشطة فقط والتأكد من وجود البيانات المطلوبة
          const activeCategories = data.categories.filter((cat: any) => 
            cat.is_active && cat.id && cat.name
          );
          setCategories(activeCategories);
        } else {
          console.error('لا توجد تصنيفات متاحة');
          toast.error('لا توجد تصنيفات متاحة حالياً');
        }
      } catch (error) {
        console.error('خطأ في جلب التصنيفات:', error);
        toast.error('حدث خطأ في تحميل التصنيفات');
      } finally {
        setLoadingCategories(false);
      }
    };

    fetchCategories();
  }, []);

  // تحميل الاهتمامات المحفوظة سابقاً
  useEffect(() => {
    const loadSavedPreferences = async () => {
      try {
        const userData = localStorage.getItem('user');
        if (userData) {
          const user = JSON.parse(userData);
          
          // جلب التفضيلات من قاعدة البيانات
          if (user.id) {
            const response = await fetch(`/api/user/preferences?userId=${user.id}`);
            const data = await response.json();
            
            if (data.success && data.data) {
              const categoryIds = data.data.map((pref: any) => pref.category_id);
              setSelectedCategoryIds(categoryIds);
              setInitialCategoriesCount(categoryIds.length);
            }
          }
        }
      } catch (error) {
        console.error('خطأ في تحميل الاهتمامات:', error);
      } finally {
        setLoadingPreferences(false);
      }
    };

    loadSavedPreferences();
  }, []);

  const handleCategoryToggle = (categoryId: string) => {
    setSelectedCategoryIds(prev => 
      prev.includes(categoryId) 
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handleSubmit = async () => {
    if (selectedCategoryIds.length === 0) {
      toast.error('اختر اهتماماً واحداً على الأقل');
      return;
    }

    setLoading(true);
    try {
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      
      // حفظ الاهتمامات في localStorage (للتوافق مع النظام الحالي)
      const selectedCategoryNames = categories
        .filter(cat => selectedCategoryIds.includes(cat.id))
        .map(cat => {
          if (cat.slug) return cat.slug;
          if (cat.name) return cat.name.toLowerCase().replace(/\s+/g, '-');
          return `category-${cat.id}`;
        });
      
      const updatedUser = {
        ...currentUser,
        interests: selectedCategoryNames,
        has_preferences: true,
        is_new: false
      };
      
      localStorage.setItem('user', JSON.stringify(updatedUser));

      // حفظ في قاعدة البيانات
      if (currentUser.id) {
        // حفظ التفضيلات
        const response = await fetch('/api/user/preferences', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: currentUser.id,
            categoryIds: selectedCategoryIds,
            source: initialCategoriesCount > 0 ? 'update' : 'welcome'
          }),
        });

        if (response.ok) {
          // حفظ في تنسيق user_preferences.json الصحيح
          const categoriesWeights: Record<string, number> = {};
          selectedCategoryIds.forEach(categoryId => {
            categoriesWeights[categoryId] = 10; // وزن افتراضي
          });

          await fetch('/api/user/preferences/update', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              userId: currentUser.id,
              preferences: {
                user_id: currentUser.id,
                categories: categoriesWeights,
                authors: {},
                topics: [],
                reading_time: {
                  preferred_hours: [],
                  average_duration: 0
                },
                last_updated: new Date().toISOString()
              }
            }),
          });

          // إضافة نقاط الولاء لإتمام الاهتمامات
          await fetch('/api/user/loyalty-points', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              userId: currentUser.id,
              points: 5,
              action: 'complete_preferences',
              description: 'إتمام اختيار الاهتمامات'
            }),
          });
        }
      }
      
      // إرسال حدث التحديث
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('preferences-updated'));
      }
      
      // التوجيه
      const isUpdate = initialCategoriesCount > 0;
      toast.success(isUpdate ? 'تم تحديث اهتماماتك بنجاح! ✨' : 'تم حفظ اهتماماتك! 🎉');
      
      if (isUpdate) {
        router.push('/profile');
      } else {
        router.push('/welcome/feed');
      }
      
    } catch (error) {
      console.error('خطأ في حفظ الاهتمامات:', error);
      toast.error('حدث خطأ في حفظ اهتماماتك');
    } finally {
      setLoading(false);
    }
  };

  // عرض حالة التحميل
  if (loadingCategories || loadingPreferences) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">جاري تحميل البيانات...</p>
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

      <div className="relative z-10 max-w-5xl mx-auto pt-20">
        {/* الترحيب */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full shadow-lg dark:shadow-gray-900/50 mb-6">
            <Heart className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-4">مرحباً بك في رحلتك الذكية! 🚀</h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            اختر التصنيفات التي تهمك لنقدم لك محتوى مخصص يناسب اهتماماتك
          </p>
        </div>

        {/* بطاقة الاهتمامات */}
        <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-md rounded-3xl shadow-xl dark:shadow-gray-900/50 p-8 border border-white/50 dark:border-gray-700/50">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6 text-center">
            {initialCategoriesCount > 0 ? 'تحديث اهتماماتك' : 'اختر اهتماماتك'}
          </h2>
          
          {/* رسالة توضيحية إذا كانت هناك اهتمامات محفوظة */}
          {initialCategoriesCount > 0 && (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6 text-center">
              <p className="text-blue-800 dark:text-blue-200">
                لديك {initialCategoriesCount} تصنيفات محفوظة. يمكنك تعديلها أو الإبقاء عليها.
              </p>
            </div>
          )}
          
          {/* شبكة التصنيفات */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {categories.length > 0 ? categories.map((category) => {
              if (!category || !category.name) return null;
              
              const Icon = categoryIcons[category.name] || categoryIcons['default'];
              const colorClass = categoryColors[category.name] || categoryColors['default'];
              const isSelected = selectedCategoryIds.includes(category.id);
              
              return (
                <button
                  key={category.id}
                  onClick={() => handleCategoryToggle(category.id)}
                  className={`relative p-6 rounded-2xl border-2 transition-all duration-300 transform hover:scale-105 ${
                    isSelected 
                      ? 'border-blue-500 shadow-lg shadow-blue-500/25 dark:shadow-blue-500/10' 
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  {/* تأثير الخلفية المتحركة عند التحديد */}
                  {isSelected && (
                    <div className={`absolute inset-0 bg-gradient-to-r ${colorClass} opacity-10 rounded-2xl`}></div>
                  )}
                  
                  {/* محتوى البطاقة */}
                  <div className="relative z-10 flex flex-col items-center">
                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${colorClass} flex items-center justify-center mb-4 shadow-lg`}>
                      {category.icon ? (
                        <span className="text-2xl">{category.icon}</span>
                      ) : (
                        <Icon className="w-8 h-8 text-white" />
                      )}
                    </div>
                    
                    <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-1">
                      {category.name}
                    </h3>
                    
                    {category.description && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-1">
                        {category.description}
                      </p>
                    )}
                    
                    {/* عدد المقالات */}
                    <span className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                      {category.articles_count || 0} مقال
                    </span>
                    
                    {/* مؤشر التحديد */}
                    {isSelected && (
                      <div className="absolute top-3 right-3">
                        <CheckCircle className="w-6 h-6 text-blue-500" />
                      </div>
                    )}
                  </div>
                </button>
              );
            }) : (
              <div className="col-span-full text-center py-8">
                <p className="text-gray-500 dark:text-gray-400">لا توجد تصنيفات متاحة حالياً</p>
              </div>
            )}
          </div>

          {/* ملخص الاختيارات */}
          {selectedCategoryIds.length > 0 && (
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-6 mb-6">
              <h3 className="text-lg font-bold text-blue-900 dark:text-blue-200 mb-3">التصنيفات المختارة:</h3>
              <div className="flex flex-wrap gap-2">
                {selectedCategoryIds.map(id => {
                  const category = categories.find(c => c.id === id);
                  if (!category) return null;
                  const colorClass = categoryColors[category.name] || categoryColors['default'];
                  
                  return (
                    <span
                      key={id}
                      className={`px-4 py-2 bg-gradient-to-r ${colorClass} text-white text-sm font-medium rounded-full shadow-md flex items-center gap-2`}
                    >
                      {category.icon && <span>{category.icon}</span>}
                      {category.name}
                    </span>
                  );
                })}
              </div>
            </div>
          )}

          {/* أزرار الإجراءات */}
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => router.push(initialCategoriesCount > 0 ? '/profile' : '/')}
              className="px-6 py-3 text-gray-600 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              {initialCategoriesCount > 0 ? 'إلغاء' : 'تخطي الآن'}
            </button>
            
            <button
              onClick={handleSubmit}
              disabled={selectedCategoryIds.length === 0 || loading}
              className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-medium hover:from-blue-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>جارٍ الحفظ...</span>
                </div>
              ) : (
                selectedCategoryIds.length > 0 
                  ? `حفظ التحديثات (${selectedCategoryIds.length})`
                  : `ابدأ رحلتي (${selectedCategoryIds.length})`
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