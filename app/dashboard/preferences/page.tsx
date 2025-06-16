'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Brain, Users, TrendingUp, Eye, BarChart3, Settings, Target, 
  Heart, Share2, MessageSquare, Clock, Star, Zap, Filter,
  ChevronRight, TrendingDown, Activity, Cpu, Database
} from 'lucide-react';

const categoryData = [
  { name: 'سياسة', users: 125689, engagement: 78, growth: 12, color: 'bg-red-100 text-red-700', iconColor: 'text-red-600' },
  { name: 'اقتصاد', users: 98743, engagement: 82, growth: 18, color: 'bg-green-100 text-green-700', iconColor: 'text-green-600' },
  { name: 'رياضة', users: 156234, engagement: 91, growth: 8, color: 'bg-blue-100 text-blue-700', iconColor: 'text-blue-600' },
  { name: 'تقنية', users: 89567, engagement: 87, growth: 25, color: 'bg-purple-100 text-purple-700', iconColor: 'text-purple-600' },
  { name: 'صحة', users: 67890, engagement: 75, growth: 22, color: 'bg-pink-100 text-pink-700', iconColor: 'text-pink-600' },
  { name: 'محليات', users: 134567, engagement: 69, growth: 5, color: 'bg-yellow-100 text-yellow-700', iconColor: 'text-yellow-600' },
  { name: 'مقالات رأي', users: 45678, engagement: 95, growth: 15, color: 'bg-indigo-100 text-indigo-700', iconColor: 'text-indigo-600' },
  { name: 'قضايا مجتمعية', users: 78901, engagement: 73, growth: 10, color: 'bg-orange-100 text-orange-700', iconColor: 'text-orange-600' }
];

const userBehaviorData = [
  { 
    id: 'U001', 
    name: 'أحمد محمد الأحمد',
    topCategories: ['اقتصاد', 'تقنية', 'سياسة'],
    readingTime: 45, 
    articlesRead: 23,
    engagement: 89,
    lastActive: '2024-06-15T14:20:00Z',
    preferences: { اقتصاد: 4.8, تقنية: 4.5, سياسة: 3.2 }
  },
  { 
    id: 'U002', 
    name: 'فاطمة علي السعيد',
    topCategories: ['صحة', 'قضايا مجتمعية', 'مقالات رأي'],
    readingTime: 32, 
    articlesRead: 18,
    engagement: 76,
    lastActive: '2024-06-15T09:15:00Z',
    preferences: { صحة: 4.6, 'قضايا مجتمعية': 4.1, 'مقالات رأي': 3.8 }
  },
  { 
    id: 'U003', 
    name: 'عبدالله خالد المطيري',
    topCategories: ['رياضة', 'محليات'],
    readingTime: 28, 
    articlesRead: 15,
    engagement: 65,
    lastActive: '2024-06-14T19:30:00Z',
    preferences: { رياضة: 4.9, محليات: 3.4 }
  }
];

export default function PreferencesPage() {
  const [darkMode, setDarkMode] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const savedDarkMode = localStorage.getItem('darkMode');
    if (savedDarkMode !== null) {
      setDarkMode(JSON.parse(savedDarkMode));
    }
  }, []);

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
      { id: 'overview', name: 'نظرة عامة', icon: Brain },
      { id: 'categories', name: 'تحليل الاهتمامات', icon: BarChart3 },
      { id: 'behavior', name: 'تتبع السلوك', icon: Activity },
      { id: 'personalization', name: 'التخصيص الذكي', icon: Cpu, href: '/dashboard/personalization' },
      { id: 'analytics', name: 'تحليلات AI', icon: Database, href: '/dashboard/analytics' },
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

  const CategoryCard = ({ category }: { category: any }) => (
    <div className={`rounded-2xl p-6 border transition-colors duration-300 hover:shadow-md ${
      darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
    }`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${category.color.split(' ')[0]}`}>
            <Filter className={`w-5 h-5 ${category.iconColor}`} />
          </div>
          <div>
            <h3 className={`font-bold transition-colors duration-300 ${
              darkMode ? 'text-white' : 'text-gray-800'
            }`}>{category.name}</h3>
            <p className={`text-sm transition-colors duration-300 ${
              darkMode ? 'text-gray-400' : 'text-gray-500'
            }`}>{category.users.toLocaleString()} مستخدم</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {category.growth > 0 ? (
            <TrendingUp className="w-4 h-4 text-green-600" />
          ) : (
            <TrendingDown className="w-4 h-4 text-red-600" />
          )}
          <span className={`text-sm font-medium ${
            category.growth > 0 ? 'text-green-600' : 'text-red-600'
          }`}>
            {category.growth}%
          </span>
        </div>
      </div>

      <div className="space-y-3">
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className={`transition-colors duration-300 ${
              darkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>مستوى التفاعل</span>
            <span className={`font-medium transition-colors duration-300 ${
              darkMode ? 'text-white' : 'text-gray-800'
            }`}>{category.engagement}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full ${category.iconColor.replace('text', 'bg')}`}
              style={{ width: `${category.engagement}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );

  const UserBehaviorCard = ({ user }: { user: any }) => (
    <div className={`rounded-2xl p-6 border transition-colors duration-300 hover:shadow-md ${
      darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
    }`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <span className="text-white font-bold">
              {user.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
            </span>
          </div>
          <div>
            <h4 className={`font-bold transition-colors duration-300 ${
              darkMode ? 'text-white' : 'text-gray-800'
            }`}>{user.name}</h4>
            <p className={`text-sm transition-colors duration-300 ${
              darkMode ? 'text-gray-400' : 'text-gray-500'
            }`}>آخر نشاط: {new Date(user.lastActive).toLocaleDateString('ar-SA')}</p>
          </div>
        </div>
        <div className={`px-2 py-1 rounded-full text-xs font-medium ${
          user.engagement >= 80 ? 'bg-green-100 text-green-700' :
          user.engagement >= 60 ? 'bg-yellow-100 text-yellow-700' :
          'bg-red-100 text-red-700'
        }`}>
          تفاعل {user.engagement}%
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="text-center">
          <p className={`text-lg font-bold transition-colors duration-300 ${
            darkMode ? 'text-white' : 'text-gray-800'
          }`}>{user.articlesRead}</p>
          <p className={`text-xs transition-colors duration-300 ${
            darkMode ? 'text-gray-400' : 'text-gray-500'
          }`}>مقال مقروء</p>
        </div>
        <div className="text-center">
          <p className={`text-lg font-bold transition-colors duration-300 ${
            darkMode ? 'text-white' : 'text-gray-800'
          }`}>{user.readingTime}</p>
          <p className={`text-xs transition-colors duration-300 ${
            darkMode ? 'text-gray-400' : 'text-gray-500'
          }`}>دقيقة قراءة</p>
        </div>
        <div className="text-center">
          <p className={`text-lg font-bold transition-colors duration-300 ${
            darkMode ? 'text-white' : 'text-gray-800'
          }`}>{user.topCategories.length}</p>
          <p className={`text-xs transition-colors duration-300 ${
            darkMode ? 'text-gray-400' : 'text-gray-500'
          }`}>اهتمام رئيسي</p>
        </div>
      </div>

      <div>
        <p className={`text-sm font-medium mb-2 transition-colors duration-300 ${
          darkMode ? 'text-gray-300' : 'text-gray-700'
        }`}>الاهتمامات الرئيسية:</p>
        <div className="flex flex-wrap gap-2">
          {user.topCategories.map((category: string, index: number) => (
            <span key={index} className={`px-2 py-1 rounded-full text-xs font-medium ${
              categoryData.find(c => c.name === category)?.color || 'bg-gray-100 text-gray-700'
            }`}>
              {category}
            </span>
          ))}
        </div>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-6 gap-6 mb-8">
              <CircularStatsCard
                title="إجمالي المستخدمين"
                value="1,247,890"
                subtitle="مستخدم"
                icon={Users}
                bgColor="bg-blue-100"
                iconColor="text-blue-600"
              />
              <CircularStatsCard
                title="التفاعل النشط"
                value="892,456"
                subtitle="هذا الأسبوع"
                icon={Activity}
                bgColor="bg-green-100"
                iconColor="text-green-600"
              />
              <CircularStatsCard
                title="متوسط وقت القراءة"
                value="34"
                subtitle="دقيقة/جلسة"
                icon={Clock}
                bgColor="bg-purple-100"
                iconColor="text-purple-600"
              />
              <CircularStatsCard
                title="التفضيلات المحدثة"
                value="567,234"
                subtitle="هذا الشهر"
                icon={Brain}
                bgColor="bg-yellow-100"
                iconColor="text-yellow-600"
              />
              <CircularStatsCard
                title="دقة التخصيص"
                value="87.3"
                subtitle="نسبة مئوية"
                icon={Target}
                bgColor="bg-pink-100"
                iconColor="text-pink-600"
              />
              <CircularStatsCard
                title="تحليلات AI"
                value="6"
                subtitle="نموذج نشط"
                icon={BarChart3}
                bgColor="bg-indigo-100"
                iconColor="text-indigo-600"
              />
            </div>

            <div className="grid grid-cols-3 gap-6">
              <div className={`col-span-2 rounded-2xl p-6 border transition-colors duration-300 ${
                darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
              }`}>
                <h3 className={`text-lg font-bold mb-4 transition-colors duration-300 ${
                  darkMode ? 'text-white' : 'text-gray-800'
                }`}>📊 أكثر الاهتمامات شيوعاً</h3>
                <div className="space-y-4">
                  {categoryData.slice(0, 5).map((category, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 ${category.color.split(' ')[0]} rounded-full flex items-center justify-center text-sm font-bold`}>
                          {index + 1}
                        </div>
                        <span className={`font-medium transition-colors duration-300 ${
                          darkMode ? 'text-gray-300' : 'text-gray-700'
                        }`}>{category.name}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className={`text-sm transition-colors duration-300 ${
                          darkMode ? 'text-gray-400' : 'text-gray-500'
                        }`}>{category.users.toLocaleString()}</span>
                        <div className="flex items-center gap-1">
                          <TrendingUp className="w-4 h-4 text-green-600" />
                          <span className="text-sm font-medium text-green-600">
                            {category.growth}%
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className={`rounded-2xl p-6 border transition-colors duration-300 ${
                darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
              }`}>
                <h3 className={`text-lg font-bold mb-4 transition-colors duration-300 ${
                  darkMode ? 'text-white' : 'text-gray-800'
                }`}>🔥 الأنشطة اليومية</h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Eye className="w-4 h-4 text-blue-600" />
                    <span className={`text-sm transition-colors duration-300 ${
                      darkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>456,789 قراءة</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Heart className="w-4 h-4 text-red-600" />
                    <span className={`text-sm transition-colors duration-300 ${
                      darkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>89,234 إعجاب</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Share2 className="w-4 h-4 text-green-600" />
                    <span className={`text-sm transition-colors duration-300 ${
                      darkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>23,456 مشاركة</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-purple-600" />
                    <span className={`text-sm transition-colors duration-300 ${
                      darkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>12,789 تعليق</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'categories':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className={`text-xl font-bold transition-colors duration-300 ${
                darkMode ? 'text-white' : 'text-gray-800'
              }`}>تحليل اهتمامات القراء</h3>
            </div>
            <div className="grid grid-cols-4 gap-6">
              {categoryData.map((category, index) => (
                <CategoryCard key={index} category={category} />
              ))}
            </div>
          </div>
        );

      case 'behavior':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className={`text-xl font-bold transition-colors duration-300 ${
                darkMode ? 'text-white' : 'text-gray-800'
              }`}>تتبع سلوك المستخدمين</h3>
            </div>
            <div className="grid grid-cols-2 gap-6">
              {userBehaviorData.map((user, index) => (
                <UserBehaviorCard key={index} user={user} />
              ))}
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
          }`}>نظام التفضيلات الذكي 🧠</h1>
          <p className={`transition-colors duration-300 ${
            darkMode ? 'text-gray-300' : 'text-gray-600'
          }`}>تحليل اهتمامات القراء وتتبع سلوكهم لتقديم تجربة قراءة مخصصة</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors duration-300">
            <Brain className="w-4 h-4" />
            تحليل AI جديد
          </button>
          <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors duration-300">
            <Zap className="w-4 h-4" />
            تحديث النماذج
          </button>
        </div>
      </div>

      <NavigationTabs />
      {renderTabContent()}
    </div>
  );
} 