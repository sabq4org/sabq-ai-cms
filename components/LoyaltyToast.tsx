'use client';

import React from 'react';
import toast from 'react-hot-toast';
import { Trophy, Star, Zap } from 'lucide-react';

interface LoyaltyToastProps {
  points: number;
  action: string;
  totalPoints: number;
  level: string;
  isNewLevel?: boolean;
}

// إشعار نقاط الولاء
export const showLoyaltyToast = (data: LoyaltyToastProps) => {
  const { points, action, totalPoints, level, isNewLevel } = data;
  
  // ترجمة النشاطات
  const actionTranslations: { [key: string]: string } = {
    'read': 'قراءة مقال',
    'like': 'إعجاب بمقال', 
    'save': 'حفظ مقال',
    'comment': 'كتابة تعليق',
    'share': 'مشاركة مقال',
    'complete_interests': 'اختيار الاهتمامات'
  };

  const actionText = actionTranslations[action] || action;

  // إشعار عادي للنقاط
  toast.custom((t) => (
    <div
      className={`${
        t.visible ? 'animate-enter' : 'animate-leave'
      } max-w-sm w-full bg-white dark:bg-gray-800 shadow-lg rounded-xl pointer-events-auto flex ring-1 ring-black ring-opacity-5 border border-gray-200 dark:border-gray-700`}
    >
      <div className="flex-1 w-0 p-4">
        <div className="flex items-start">
          {/* أيقونة النقاط */}
          <div className="flex-shrink-0">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 flex items-center justify-center">
              <Star className="w-5 h-5 text-white" />
            </div>
          </div>
          
          {/* محتوى الإشعار */}
          <div className="ml-3 flex-1">
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
              +{points} نقطة جديدة! 🎉
            </p>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {actionText}
            </p>
            <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
              المجموع: {totalPoints} نقطة • {level}
            </p>
          </div>
        </div>
      </div>
      
      {/* زر الإغلاق */}
      <div className="flex border-l border-gray-200 dark:border-gray-700">
        <button
          onClick={() => toast.dismiss(t.id)}
          className="w-full border border-transparent rounded-none rounded-r-xl p-4 flex items-center justify-center text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 focus:outline-none"
        >
          ×
        </button>
      </div>
    </div>
  ), { 
    duration: 4000,
    position: 'bottom-right'
  });

  // إشعار خاص للمستوى الجديد
  if (isNewLevel) {
    setTimeout(() => {
      toast.custom((t) => (
        <div
          className={`${
            t.visible ? 'animate-enter' : 'animate-leave'
          } max-w-sm w-full bg-gradient-to-r from-purple-500 to-blue-600 shadow-lg rounded-xl pointer-events-auto flex ring-1 ring-white ring-opacity-20`}
        >
          <div className="flex-1 w-0 p-4">
            <div className="flex items-start">
              {/* أيقونة المستوى */}
              <div className="flex-shrink-0">
                <div className="w-12 h-12 rounded-full bg-white bg-opacity-20 flex items-center justify-center">
                  <Trophy className="w-6 h-6 text-white" />
                </div>
              </div>
              
              {/* محتوى الإشعار */}
              <div className="ml-3 flex-1">
                <p className="text-sm font-bold text-white">
                  🎊 تهانينا! مستوى جديد
                </p>
                <p className="mt-1 text-sm text-white text-opacity-90">
                  وصلت إلى مستوى {level}
                </p>
                <p className="mt-1 text-xs text-white text-opacity-75">
                  استمر في التفاعل لكسب المزيد!
                </p>
              </div>
            </div>
          </div>
          
          {/* زر الإغلاق */}
          <div className="flex">
            <button
              onClick={() => toast.dismiss(t.id)}
              className="w-full border border-transparent rounded-none rounded-r-xl p-4 flex items-center justify-center text-sm font-medium text-white text-opacity-70 hover:text-opacity-100 focus:outline-none"
            >
              ×
            </button>
          </div>
        </div>
      ), { 
        duration: 6000,
        position: 'bottom-right'
      });
    }, 1000);
  }
};

// إشعار مستوى جديد فقط
export const showLevelUpToast = (level: string, totalPoints: number) => {
  toast.custom((t) => (
    <div
      className={`${
        t.visible ? 'animate-enter' : 'animate-leave'
      } max-w-md w-full bg-gradient-to-r from-purple-600 via-blue-600 to-purple-600 shadow-2xl rounded-2xl pointer-events-auto ring-1 ring-white ring-opacity-25 border border-white border-opacity-20`}
    >
      <div className="p-6">
        <div className="flex items-center">
          {/* أيقونة متحركة */}
          <div className="flex-shrink-0 mr-4">
            <div className="w-16 h-16 rounded-full bg-white bg-opacity-20 flex items-center justify-center animate-pulse">
              <Trophy className="w-8 h-8 text-yellow-300" />
            </div>
          </div>
          
          {/* محتوى الإشعار */}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-lg font-bold text-white">مستوى جديد!</h3>
              <Zap className="w-5 h-5 text-yellow-300" />
            </div>
            <p className="text-white text-opacity-90 font-medium">
              🎊 مبروك! وصلت إلى مستوى {level}
            </p>
            <p className="text-white text-opacity-75 text-sm mt-1">
              {totalPoints} نقطة • استمر في التألق!
            </p>
          </div>
          
          {/* زر الإغلاق */}
          <button
            onClick={() => toast.dismiss(t.id)}
            className="text-white text-opacity-70 hover:text-opacity-100 text-xl font-bold ml-2"
          >
            ×
          </button>
        </div>
      </div>
    </div>
  ), { 
    duration: 8000,
    position: 'top-center'
  });
};

// دالة مساعدة لمنح النقاط وإظهار الإشعار
export const awardPoints = async (
  userId: string, 
  action: string, 
  articleId?: string,
  description?: string
) => {
  try {
    const response = await fetch('/api/loyalty', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId,
        action,
        articleId,
        description
      })
    });

    const result = await response.json();
    
    if (result.success) {
      // إظهار إشعار النقاط
      showLoyaltyToast({
        points: result.data.pointsAwarded,
        action,
        totalPoints: result.data.totalPoints,
        level: result.data.level,
        isNewLevel: false // يمكن تحسين هذا لاحقاً
      });
      
      return result.data;
    } else {
      console.error('فشل في منح النقاط:', result.error);
      return null;
    }
  } catch (error) {
    console.error('خطأ في منح النقاط:', error);
    return null;
  }
};

export default { showLoyaltyToast, showLevelUpToast, awardPoints }; 