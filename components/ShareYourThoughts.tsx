'use client';

import React, { useState, useEffect } from 'react';
import { useUser } from '@/hooks/useUser';
import EnhancedInteractionBar from './interactions/EnhancedInteractionBar';
import UserProfileDashboard from './user/UserProfileDashboard';
import { 
  MessageSquare, 
  TrendingUp, 
  Users, 
  Award,
  Target,
  Sparkles,
  Zap
} from 'lucide-react';
import { toast } from 'sonner';

interface ShareYourThoughtsProps {
  articleId: string;
  articleTitle: string;
  articleSlug: string;
  articleCategory?: string;
  initialStats?: {
    likes: number;
    comments: number;
    shares: number;
    views: number;
    bookmarks: number;
  };
}

export default function ShareYourThoughts({
  articleId,
  articleTitle,
  articleSlug,
  articleCategory,
  initialStats = {
    likes: 0,
    comments: 0,
    shares: 0,
    views: 0,
    bookmarks: 0
  }
}: ShareYourThoughtsProps) {
  const { user, isAuthenticated } = useUser();
  const [showProfileDashboard, setShowProfileDashboard] = useState(false);
  const [dailyGoals, setDailyGoals] = useState({
    commentsGoal: 3,
    readingGoal: 5,
    engagementGoal: 10,
    currentComments: 0,
    currentReading: 0,
    currentEngagement: 0
  });
  const [achievements, setAchievements] = useState([]);
  const [weeklyChallenge, setWeeklyChallenge] = useState(null);

  // جلب التقدم اليومي
  useEffect(() => {
    if (user) {
      fetchDailyProgress();
      fetchWeeklyChallenge();
    }
  }, [user]);

  const fetchDailyProgress = async () => {
    if (!user) return;

    try {
      const response = await fetch(`/api/users/${user.id}/daily-progress`);
      if (response.ok) {
        const data = await response.json();
        setDailyGoals(prev => ({
          ...prev,
          ...data.progress
        }));
      }
    } catch (error) {
      console.error('خطأ في جلب التقدم اليومي:', error);
    }
  };

  const fetchWeeklyChallenge = async () => {
    try {
      const response = await fetch('/api/challenges/weekly');
      if (response.ok) {
        const data = await response.json();
        setWeeklyChallenge(data.challenge);
      }
    } catch (error) {
      console.error('خطأ في جلب التحدي الأسبوعي:', error);
    }
  };

  const handleQuickAction = async (action: string) => {
    if (!isAuthenticated) {
      toast.error('سجل دخولك للمشاركة في التفاعل');
      return;
    }

    switch (action) {
      case 'start_discussion':
        // فتح نموذج بدء نقاش
        toast.success('ميزة بدء النقاش ستكون متاحة قريباً!', { icon: '🎯' });
        break;
      case 'share_insight':
        // فتح نموذج مشاركة رؤية
        toast.success('شارك رؤيتك في التعليقات أدناه', { icon: '💡' });
        break;
      case 'join_challenge':
        // الانضمام للتحدي الأسبوعي
        toast.success('تم انضمامك للتحدي الأسبوعي!', { icon: '🏆' });
        break;
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-2xl p-8 border border-blue-200 dark:border-blue-800">
        <div className="text-center max-w-md mx-auto">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <MessageSquare className="w-8 h-8 text-white" />
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            شارك رأيك وتفاعل مع المحتوى
          </h2>
          
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            انضم لمجتمعنا النشط وشارك آراءك، احصل على نقاط، وتفاعل مع القراء الآخرين
          </p>
          
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center mx-auto mb-2">
                <MessageSquare className="w-6 h-6 text-red-600" />
              </div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">تعليق ونقاش</p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg flex items-center justify-center mx-auto mb-2">
                <Award className="w-6 h-6 text-yellow-600" />
              </div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">نقاط وشارات</p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center mx-auto mb-2">
                <Users className="w-6 h-6 text-green-600" />
              </div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">مجتمع نشط</p>
            </div>
          </div>
          
          <button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-105">
            تسجيل الدخول للمشاركة
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* قسم المشاركة السريعة */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-1">
              شارك رأيك وتفاعل مع المحتوى
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              كن جزءاً من النقاش وشارك وجهة نظرك
            </p>
          </div>
          
          <button
            onClick={() => setShowProfileDashboard(!showProfileDashboard)}
            className="px-4 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
          >
            ملفي الشخصي
          </button>
        </div>

        {/* أهداف سريعة */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 p-4 rounded-xl border border-blue-200 dark:border-blue-800">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-blue-900 dark:text-blue-100">التعليقات اليوم</h3>
              <MessageSquare className="w-5 h-5 text-blue-600" />
            </div>
            <div className="flex items-end gap-2">
              <span className="text-2xl font-bold text-blue-600">{dailyGoals.currentComments}</span>
              <span className="text-blue-600/70">/{dailyGoals.commentsGoal}</span>
            </div>
            <div className="w-full bg-blue-200 dark:bg-blue-800 rounded-full h-2 mt-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all"
                style={{ width: `${Math.min(100, (dailyGoals.currentComments / dailyGoals.commentsGoal) * 100)}%` }}
              ></div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 p-4 rounded-xl border border-green-200 dark:border-green-800">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-green-900 dark:text-green-100">المقالات المقروءة</h3>
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <div className="flex items-end gap-2">
              <span className="text-2xl font-bold text-green-600">{dailyGoals.currentReading}</span>
              <span className="text-green-600/70">/{dailyGoals.readingGoal}</span>
            </div>
            <div className="w-full bg-green-200 dark:bg-green-800 rounded-full h-2 mt-2">
              <div 
                className="bg-green-600 h-2 rounded-full transition-all"
                style={{ width: `${Math.min(100, (dailyGoals.currentReading / dailyGoals.readingGoal) * 100)}%` }}
              ></div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 p-4 rounded-xl border border-purple-200 dark:border-purple-800">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-purple-900 dark:text-purple-100">نقاط التفاعل</h3>
              <Sparkles className="w-5 h-5 text-purple-600" />
            </div>
            <div className="flex items-end gap-2">
              <span className="text-2xl font-bold text-purple-600">{dailyGoals.currentEngagement}</span>
              <span className="text-purple-600/70">/{dailyGoals.engagementGoal}</span>
            </div>
            <div className="w-full bg-purple-200 dark:bg-purple-800 rounded-full h-2 mt-2">
              <div 
                className="bg-purple-600 h-2 rounded-full transition-all"
                style={{ width: `${Math.min(100, (dailyGoals.currentEngagement / dailyGoals.engagementGoal) * 100)}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* أزرار العمل السريع */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <button
            onClick={() => handleQuickAction('start_discussion')}
            className="flex items-center justify-center gap-3 p-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all transform hover:scale-105"
          >
            <MessageSquare className="w-5 h-5" />
            <span className="font-medium">ابدأ نقاش</span>
          </button>

          <button
            onClick={() => handleQuickAction('share_insight')}
            className="flex items-center justify-center gap-3 p-4 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 transition-all transform hover:scale-105"
          >
            <Zap className="w-5 h-5" />
            <span className="font-medium">شارك رؤيتك</span>
          </button>

          <button
            onClick={() => handleQuickAction('join_challenge')}
            className="flex items-center justify-center gap-3 p-4 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl hover:from-purple-600 hover:to-purple-700 transition-all transform hover:scale-105"
          >
            <Target className="w-5 h-5" />
            <span className="font-medium">تحدي الأسبوع</span>
          </button>
        </div>
      </div>

      {/* شريط التفاعل المتقدم */}
      <EnhancedInteractionBar
        articleId={articleId}
        articleTitle={articleTitle}
        articleSlug={articleSlug}
        initialStats={initialStats}
        showComments={true}
        enableRealtimeUpdates={true}
      />

      {/* لوحة الملف الشخصي */}
      {showProfileDashboard && (
        <div className="mt-8">
          <UserProfileDashboard />
        </div>
      )}
    </div>
  );
}
