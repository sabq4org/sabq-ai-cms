'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Trophy, Gift, Users, TrendingUp, Crown, Award, Eye, MessageSquare, 
         Settings, Target, Plus, Search, MoreHorizontal, Share2, Heart } from 'lucide-react';

export default function LoyaltyPage() {
  const [darkMode, setDarkMode] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const savedDarkMode = localStorage.getItem('darkMode');
    if (savedDarkMode !== null) {
      setDarkMode(JSON.parse(savedDarkMode));
    }
  }, []);

  // TODO: استبدال بدوال جلب البيانات من قاعدة البيانات الحقيقية
  const fetchLoyaltyStats = async () => {
    // يجب تنفيذ استدعاء API لجلب إحصائيات نقاط الولاء
    // مثال: const response = await fetch('/api/loyalty/stats');
    return {
      totalUsers: 0,
      activeUsers: 0,
      totalPoints: 0,
      averagePoints: 0,
      newMembers: 0,
      ambassadors: 0
    };
  };

  const fetchTopUsers = async () => {
    // يجب تنفيذ استدعاء API لجلب أعلى المستخدمين
    // مثال: const response = await fetch('/api/loyalty/top-users');
    return [];
  };

  const fetchLoyaltyUsers = async () => {
    // يجب تنفيذ استدعاء API لجلب مستخدمي برنامج الولاء
    // مثال: const response = await fetch('/api/loyalty/users');
    return [];
  };

  const CircularStatsCard = ({ title, value, subtitle, icon: Icon, bgColor, iconColor }: {
    title: string;
    value: string | number;
    subtitle: string;
    icon: any;
    bgColor: string;
    iconColor: string;
  }) => (
    <div className={`rounded-2xl p-6 shadow-sm border transition-colors duration-300 hover:shadow-md ${
      darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'
    }`}>
      <div className="flex items-center gap-4">
        <div className={`w-12 h-12 ${bgColor} rounded-full flex items-center justify-center`}>
          <Icon className={`w-6 h-6 ${iconColor}`} />
        </div>
        <div className="flex-1">
          <p className={`text-sm mb-1 transition-colors duration-300 ${
            darkMode ? 'text-gray-400' : 'text-gray-500'
          }`}>{title}</p>
          <div className="flex items-baseline gap-2">
            <span className={`text-2xl font-bold transition-colors duration-300 ${
              darkMode ? 'text-white' : 'text-gray-800'
            }`}>{value.toLocaleString()}</span>
            <span className={`text-sm transition-colors duration-300 ${
              darkMode ? 'text-gray-400' : 'text-gray-500'
            }`}>{subtitle}</span>
          </div>
        </div>
      </div>
    </div>
  );

  const NavigationTabs = () => {
    const tabs = [
      { id: 'overview', name: 'نظرة عامة', icon: Trophy },
      { id: 'users', name: 'المستخدمون', icon: Users },
      { id: 'rewards', name: 'المكافآت', icon: Gift, href: '/dashboard/loyalty/rewards' },
      { id: 'campaigns', name: 'الحملات', icon: Target, href: '/dashboard/loyalty/campaigns' },
      { id: 'settings', name: 'الإعدادات', icon: Settings }
    ];

    return (
      <div className={`rounded-2xl p-2 shadow-sm border mb-8 transition-colors duration-300 ${
        darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'
      }`}>
        <div className="flex gap-2 justify-start">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            
            if (tab.href) {
              return (
                <Link
                  key={tab.id}
                  href={tab.href}
                  className={`w-32 flex flex-col items-center justify-center gap-2 py-4 pb-3 px-3 rounded-xl font-medium text-sm transition-all duration-300 ${
                    darkMode
                      ? 'text-gray-300 hover:bg-gray-700 border-b-4 border-transparent hover:border-gray-600'
                      : 'text-gray-600 hover:bg-gray-50 border-b-4 border-transparent hover:border-gray-200'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-center leading-tight">{tab.name}</span>
                </Link>
              );
            }
            
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-32 flex flex-col items-center justify-center gap-2 py-4 pb-3 px-3 rounded-xl font-medium text-sm transition-all duration-300 ${
                  activeTab === tab.id
                    ? 'bg-blue-500 text-white shadow-md border-b-4 border-blue-600'
                    : darkMode
                      ? 'text-gray-300 hover:bg-gray-700 border-b-4 border-transparent hover:border-gray-600'
                      : 'text-gray-600 hover:bg-gray-50 border-b-4 border-transparent hover:border-gray-200'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-center leading-tight">{tab.name}</span>
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-6 gap-6 mb-8">
              <CircularStatsCard
                title="إجمالي المستخدمين"
                value="0"
                subtitle="مشترك"
                icon={Users}
                bgColor="bg-blue-100"
                iconColor="text-blue-600"
              />
              <CircularStatsCard
                title="المستخدمون النشطون"
                value="0"
                subtitle="هذا الأسبوع"
                icon={TrendingUp}
                bgColor="bg-green-100"
                iconColor="text-green-600"
              />
              <CircularStatsCard
                title="النقاط الموزعة"
                value="0"
                subtitle="نقطة"
                icon={Trophy}
                bgColor="bg-yellow-100"
                iconColor="text-yellow-600"
              />
              <CircularStatsCard
                title="متوسط النقاط"
                value="0"
                subtitle="لكل مستخدم"
                icon={Award}
                bgColor="bg-purple-100"
                iconColor="text-purple-600"
              />
              <CircularStatsCard
                title="أعضاء جدد"
                value="0"
                subtitle="هذا الشهر"
                icon={Users}
                bgColor="bg-orange-100"
                iconColor="text-orange-600"
              />
              <CircularStatsCard
                title="سفراء سبق"
                value="0"
                subtitle="سفير"
                icon={Crown}
                bgColor="bg-red-100"
                iconColor="text-red-600"
              />
            </div>

            <div className="grid grid-cols-3 gap-6">
              <div className={`rounded-2xl p-6 border transition-colors duration-300 ${
                darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
              }`}>
                <h3 className={`text-lg font-bold mb-4 transition-colors duration-300 ${
                  darkMode ? 'text-white' : 'text-gray-800'
                }`}>🏆 أعلى المستخدمين</h3>
                <div className="space-y-3">
                  <div className={`text-center py-8 transition-colors duration-300 ${
                    darkMode ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    <p>لا توجد بيانات حالياً</p>
                    <p className="text-sm mt-1">سيتم عرض أعلى المستخدمين بعد ربط قاعدة البيانات</p>
                  </div>
                </div>
              </div>

              <div className={`rounded-2xl p-6 border transition-colors duration-300 ${
                darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
              }`}>
                <h3 className={`text-lg font-bold mb-4 transition-colors duration-300 ${
                  darkMode ? 'text-white' : 'text-gray-800'
                }`}>📊 آلية احتساب النقاط</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className={`text-sm transition-colors duration-300 ${
                      darkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>قراءة خبر</span>
                    <span className="text-blue-600 font-bold">+2</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className={`text-sm transition-colors duration-300 ${
                      darkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>مشاركة</span>
                    <span className="text-green-600 font-bold">+5</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className={`text-sm transition-colors duration-300 ${
                      darkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>تعليق</span>
                    <span className="text-purple-600 font-bold">+1</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className={`text-sm transition-colors duration-300 ${
                      darkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>إعجاب</span>
                    <span className="text-red-600 font-bold">+1</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className={`text-sm transition-colors duration-300 ${
                      darkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>5 أخبار متتالية</span>
                    <span className="text-yellow-600 font-bold">+10</span>
                  </div>
                </div>
              </div>

              <div className={`rounded-2xl p-6 border transition-colors duration-300 ${
                darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
              }`}>
                <h3 className={`text-lg font-bold mb-4 transition-colors duration-300 ${
                  darkMode ? 'text-white' : 'text-gray-800'
                }`}>🎯 فئات العضوية</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Eye className="w-4 h-4 text-gray-600" />
                    <span className={`text-sm transition-colors duration-300 ${
                      darkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>القارئ الجديد (0-100)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-blue-600" />
                    <span className={`text-sm transition-colors duration-300 ${
                      darkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>المتفاعل (101-500)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Award className="w-4 h-4 text-yellow-600" />
                    <span className={`text-sm transition-colors duration-300 ${
                      darkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>العضو الذهبي (501-2000)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Crown className="w-4 h-4 text-purple-600" />
                    <span className={`text-sm transition-colors duration-300 ${
                      darkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>سفير سبق (2001+)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'users':
        return (
          <div className={`rounded-2xl p-6 border transition-colors duration-300 ${
            darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          }`}>
            <div className="flex items-center justify-between mb-6">
              <h3 className={`text-lg font-bold transition-colors duration-300 ${
                darkMode ? 'text-white' : 'text-gray-800'
              }`}>إدارة مستخدمي برنامج الولاء</h3>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="البحث..."
                  className={`px-4 py-2 text-sm rounded-lg border transition-colors duration-300 ${
                    darkMode 
                      ? 'bg-gray-700 border-gray-600 text-gray-200 placeholder-gray-400' 
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  }`}
                />
                <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  منح نقاط
                </button>
              </div>
            </div>
            
            <div className="space-y-4">
              {/* TODO: استبدال بمستخدمين حقيقيين من قاعدة البيانات */}
              <div className={`text-center py-8 transition-colors duration-300 ${
                darkMode ? 'text-gray-400' : 'text-gray-500'
              }`}>
                <p>لا توجد مستخدمين حالياً</p>
                <p className="text-sm mt-1">سيتم عرض مستخدمي برنامج الولاء بعد ربط قاعدة البيانات</p>
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div className={`rounded-2xl p-6 border transition-colors duration-300 ${
            darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          }`}>
            <h3 className={`text-lg font-bold mb-4 transition-colors duration-300 ${
              darkMode ? 'text-white' : 'text-gray-800'
            }`}>🚧 قيد التطوير</h3>
            <p className={`text-center py-8 transition-colors duration-300 ${
              darkMode ? 'text-gray-400' : 'text-gray-500'
            }`}>
              هذا القسم قيد التطوير وسيكون متاحاً قريباً
            </p>
          </div>
        );
    }
  };

  return (
    <div className={`p-8 transition-colors duration-300 ${
      darkMode ? 'bg-gray-900' : ''
    }`}>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className={`text-3xl font-bold mb-2 transition-colors duration-300 ${
            darkMode ? 'text-white' : 'text-gray-800'
          }`}>برنامج الولاء الذكي 🏆</h1>
          <p className={`transition-colors duration-300 ${
            darkMode ? 'text-gray-300' : 'text-gray-600'
          }`}>إدارة نظام المكافآت والنقاط لتعزيز تفاعل القراء مع محتوى صحيفة سبق</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors duration-300">
            <Target className="w-4 h-4" />
            حملة جديدة
          </button>
          <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors duration-300">
            <Gift className="w-4 h-4" />
            مكافأة جديدة
          </button>
        </div>
      </div>

      <NavigationTabs />
      {renderTabContent()}
    </div>
  );
}
