'use client';

import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Users, 
  Eye, 
  MessageSquare, 
  TrendingUp, 
  Activity,
  BarChart3,
  Star,
  UserCheck
} from 'lucide-react';

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState('behavior');
  const [darkMode, setDarkMode] = useState(false);
  const [stats, setStats] = useState({
    users: 0,
    points: 0,
    articles: 0,
    interactions: 0,
    categories: 0,
    activeUsers: 0,
    comments: 0,
    accuracy: 0,
    updates: 0
  });
  const [tableData, setTableData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // استرجاع حالة الوضع الليلي من localStorage
  useEffect(() => {
    const savedDarkMode = localStorage.getItem('darkMode');
    if (savedDarkMode !== null) {
      setDarkMode(JSON.parse(savedDarkMode));
    }
  }, []);

  // جلب البيانات الحقيقية
  useEffect(() => {
    const fetchRealData = async () => {
      try {
        setLoading(true);

        // جلب بيانات المستخدمين
        const usersRes = await fetch('/api/users');
        const usersData = await usersRes.json();
        const usersArray = usersData.users || usersData.data || usersData || [];
        const totalUsers = Array.isArray(usersArray) ? usersArray.length : 0;

        // جلب بيانات المقالات
        const articlesRes = await fetch('/api/articles');
        const articlesData = await articlesRes.json();
        const articlesArray = articlesData.articles || articlesData.data || articlesData || [];
        const totalArticles = Array.isArray(articlesArray) ? articlesArray.length : 0;

        // جلب بيانات التصنيفات
        const categoriesRes = await fetch('/api/categories');
        const categoriesData = await categoriesRes.json();
        // التعامل مع الهيكل الصحيح للبيانات المُرجعة من API
        const categoriesArray = categoriesData.data || categoriesData || [];
        const activeCategories = Array.isArray(categoriesArray) 
          ? categoriesArray.filter((cat: any) => cat.is_active).length 
          : 0;

        // جلب بيانات التفاعلات (إن وجدت)
        let totalInteractions = 0;
        let totalPoints = 0;
        try {
          const interactionsRes = await fetch('/api/user-interactions');
          if (interactionsRes.ok) {
            const interactionsData = await interactionsRes.json();
            totalInteractions = interactionsData.length || 0;
          }
        } catch (error) {
          // في حالة عدم وجود API للتفاعلات
        }

        // جلب بيانات النقاط (إن وجدت)
        try {
          const pointsRes = await fetch('/api/loyalty-points');
          if (pointsRes.ok) {
            const pointsData = await pointsRes.json();
            totalPoints = pointsData.totalPoints || 0;
          }
        } catch (error) {
          // في حالة عدم وجود API للنقاط
        }

        // تحديث الإحصائيات بالبيانات الحقيقية
        setStats({
          users: totalUsers,
          points: totalPoints,
          articles: totalArticles,
          interactions: totalInteractions,
          categories: activeCategories,
          activeUsers: 0, // سيتم حسابه من بيانات التفاعل الحقيقية
          comments: 0, // سيتم ربطه بنظام التعليقات الحقيقي
          accuracy: 0, // سيتم حسابه من التحليلات الحقيقية
          updates: 0 // سيتم حسابه من سجل التحديثات
        });

        // تصفير بيانات الجدول (سيتم ملؤها بالبيانات الحقيقية لاحقاً)
        setTableData([]);

      } catch (error) {
        console.error('خطأ في جلب البيانات:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRealData();
  }, []);

  // مكون بطاقة الإحصائية الدائرية
  const CircularStatsCard = ({ 
    title, 
    value, 
    subtitle, 
    icon: Icon, 
    bgColor,
    iconColor,
    textColor = 'text-gray-700'
  }: {
    title: string;
    value: string | number;
    subtitle: string;
    icon: any;
    bgColor: string;
    iconColor: string;
    textColor?: string;
  }) => (
    <div className={`rounded-2xl p-6 shadow-sm border transition-colors duration-300 hover:shadow-md ${
      darkMode 
        ? 'bg-gray-800 border-gray-700' 
        : 'bg-white border-gray-100'
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
            }`}>{loading ? '...' : value}</span>
            <span className={`text-sm transition-colors duration-300 ${
              darkMode ? 'text-gray-400' : 'text-gray-500'
            }`}>{subtitle}</span>
          </div>
        </div>
      </div>
    </div>
  );

  // مكون أزرار التنقل
  const NavigationTabs = () => {
    const tabs = [
      { id: 'behavior', name: 'سلوك المستخدمين', icon: Users },
      { id: 'analysis', name: 'تحليل التفاعلات', icon: TrendingUp },
      { id: 'preferences', name: 'تطوير التفضيلات', icon: Activity },
      { id: 'insights', name: 'رؤى الآراء', icon: BarChart3 }
    ];

    return (
      <div className={`rounded-2xl p-2 shadow-sm border mb-8 w-full transition-colors duration-300 ${
        darkMode 
          ? 'bg-gray-800 border-gray-700' 
          : 'bg-white border-gray-100'
      }`}>
        <div className="flex gap-2 justify-start pr-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-48 flex flex-col items-center justify-center gap-2 py-4 pb-3 px-3 rounded-xl font-medium text-sm transition-all duration-300 ${
                  activeTab === tab.id
                    ? 'bg-blue-500 text-white shadow-md border-b-4 border-blue-600'
                    : darkMode
                      ? 'text-gray-300 hover:bg-gray-700 border-b-4 border-transparent hover:border-gray-600'
                      : 'text-gray-600 hover:bg-gray-50 border-b-4 border-transparent hover:border-gray-200'
                }`}
              >
                <Icon className="w-5 h-5" />
                {tab.name}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  // مكون الجدول
  const DataTable = () => {
    // ألوان الجدول حسب الوضع
    const tableColors = {
      headerBg: darkMode ? '#1e3a5f' : '#f0fdff',
      headerBorder: darkMode ? '#2563eb' : '#dde9fc',
      cellBorder: darkMode ? '#374151' : '#f4f8fe',
      containerBg: darkMode ? 'bg-gray-800' : 'bg-white',
      containerBorder: darkMode ? 'border-gray-700' : 'border-gray-100',
      titleText: darkMode ? 'text-white' : 'text-gray-800',
      headerText: darkMode ? 'text-gray-200' : 'text-gray-700',
      bodyText: darkMode ? 'text-gray-300' : 'text-gray-900',
      subText: darkMode ? 'text-gray-400' : 'text-gray-600',
      hoverBg: darkMode ? 'hover:bg-gray-700' : 'hover:bg-slate-50'
    };

    return (
      <div className={`${tableColors.containerBg} rounded-2xl shadow-sm border ${tableColors.containerBorder} overflow-hidden transition-colors duration-300`}>
        <div className="px-6 py-4" style={{ borderBottom: `1px solid ${tableColors.cellBorder}` }}>
          <h3 className={`text-lg font-semibold ${tableColors.titleText} transition-colors duration-300`}>
            سلوك المستخدمين الأكثر نشاطاً
          </h3>
        </div>
        
        {/* رأس الجدول */}
        <div 
          style={{ 
            backgroundColor: tableColors.headerBg,
            borderBottom: `2px solid ${tableColors.headerBorder}`
          }}
        >
          <div className="grid grid-cols-7 gap-4 px-6 py-4">
            <div className={`text-sm font-medium ${tableColors.headerText} transition-colors duration-300`}>الفئات المفضلة</div>
            <div className={`text-sm font-medium ${tableColors.headerText} transition-colors duration-300`}>دقة التفضيلات</div>
            <div className={`text-sm font-medium ${tableColors.headerText} transition-colors duration-300`}>آخر نشاط</div>
            <div className={`text-sm font-medium ${tableColors.headerText} transition-colors duration-300`}>نقاط التفاعل</div>
            <div className={`text-sm font-medium ${tableColors.headerText} transition-colors duration-300`}>إجمالي التفاعلات</div>
            <div className={`text-sm font-medium ${tableColors.headerText} transition-colors duration-300`}>المستخدم</div>
            <div className={`text-sm font-medium ${tableColors.headerText} transition-colors duration-300`}>تصنيف العميق</div>
          </div>
        </div>

        {/* بيانات الجدول */}
        <div style={{ borderColor: tableColors.cellBorder }} className="divide-y">
          {loading ? (
            <div className="text-center py-8">
              <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                جارٍ تحميل البيانات...
              </p>
            </div>
          ) : tableData.length === 0 ? (
            <div className="text-center py-8">
              <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                لا توجد بيانات متاحة حالياً
              </p>
            </div>
          ) : (
            tableData.map((row, index) => (
              <div 
                key={index} 
                className={`grid grid-cols-7 gap-4 px-6 py-4 ${tableColors.hoverBg} transition-colors duration-300`}
                style={{ borderBottom: index < tableData.length - 1 ? `1px solid ${tableColors.cellBorder}` : 'none' }}
              >
                <div className={`text-sm font-medium ${tableColors.bodyText} transition-colors duration-300`}>{row.category}</div>
                <div className="text-sm font-semibold text-green-500">{row.accuracy}</div>
                <div className={`text-sm ${tableColors.subText} transition-colors duration-300`}>{row.activity}</div>
                <div className="flex items-center">
                  <div className={`w-16 rounded-full h-2 mr-2 ${darkMode ? 'bg-gray-600' : 'bg-gray-200'}`}>
                    <div
                      className="bg-blue-500 h-2 rounded-full"
                      style={{ width: `${row.engagement}%` }}
                    ></div>
                  </div>
                  <span className={`text-xs ${tableColors.subText} transition-colors duration-300`}>{row.engagement}</span>
                </div>
                <div className="text-sm font-medium text-blue-500">{row.total}</div>
                <div className={`text-sm font-medium ${tableColors.bodyText} transition-colors duration-300`}>{row.user}</div>
                <div className={`text-sm ${tableColors.subText} transition-colors duration-300`}>{row.classification}</div>
              </div>
            ))
          )}
        </div>
      </div>
    );
  };

  return (
    <div className={`p-8 transition-colors duration-300 ${
      darkMode ? 'bg-gray-900' : ''
    }`}>
            {/* عنوان وتعريف الصفحة */}
      <div className="mb-8">
        <h1 className={`text-3xl font-bold mb-2 transition-colors duration-300 ${
          darkMode ? 'text-white' : 'text-gray-800'
        }`}>لوحة سبق</h1>
        <p className={`transition-colors duration-300 ${
          darkMode ? 'text-gray-300' : 'text-gray-600'
        }`}>نظام إدارة المحتوى الذكي لصحيفة سبق - تحكم شامل في المحتوى والتفاعل</p>
      </div>

      {/* قسم النظام الذكي */}
      <div className="mb-8">
        <div className={`rounded-2xl p-6 border transition-colors duration-300 ${
          darkMode 
            ? 'bg-gradient-to-r from-purple-900/30 to-indigo-900/30 border-purple-700' 
            : 'bg-gradient-to-r from-purple-50 to-indigo-50 border-purple-100'
        }`}>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-xl">🤖</span>
            </div>
            <div>
              <h2 className={`text-xl font-bold transition-colors duration-300 ${
                darkMode ? 'text-white' : 'text-gray-800'
              }`}>النظام الذكي</h2>
              <p className={`text-sm transition-colors duration-300 ${
                darkMode ? 'text-gray-300' : 'text-gray-600'
              }`}>تحليل متقدم للمحتوى والتفاعل باستخدام الذكاء الاصطناعي</p>
            </div>
          </div>
          
          <div className="grid grid-cols-4 gap-4">
            <div className={`rounded-xl p-4 border transition-colors duration-300 ${
              darkMode 
                ? 'bg-gray-800 border-purple-600' 
                : 'bg-white border-purple-100'
            }`}>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className={`text-sm font-medium transition-colors duration-300 ${
                    darkMode ? 'text-gray-200' : 'text-gray-800'
                  }`}>تحليل المحتوى</p>
                  <p className={`text-xs transition-colors duration-300 ${
                    darkMode ? 'text-gray-400' : 'text-gray-500'
                  }`}>متوقف</p>
                </div>
              </div>
            </div>
            
            <div className={`rounded-xl p-4 border transition-colors duration-300 ${
              darkMode 
                ? 'bg-gray-800 border-purple-600' 
                : 'bg-white border-purple-100'
            }`}>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className={`text-sm font-medium transition-colors duration-300 ${
                    darkMode ? 'text-gray-200' : 'text-gray-800'
                  }`}>توقع الاتجاهات</p>
                  <p className={`text-xs transition-colors duration-300 ${
                    darkMode ? 'text-gray-400' : 'text-gray-500'
                  }`}>متوقف</p>
                </div>
              </div>
            </div>
            
            <div className={`rounded-xl p-4 border transition-colors duration-300 ${
              darkMode 
                ? 'bg-gray-800 border-purple-600' 
                : 'bg-white border-purple-100'
            }`}>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className={`text-sm font-medium transition-colors duration-300 ${
                    darkMode ? 'text-gray-200' : 'text-gray-800'
                  }`}>تحليل الجمهور</p>
                  <p className={`text-xs transition-colors duration-300 ${
                    darkMode ? 'text-gray-400' : 'text-gray-500'
                  }`}>متوقف</p>
                </div>
              </div>
            </div>
            
            <div className={`rounded-xl p-4 border transition-colors duration-300 ${
              darkMode 
                ? 'bg-gray-800 border-purple-600' 
                : 'bg-white border-purple-100'
            }`}>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                  <MessageSquare className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <p className={`text-sm font-medium transition-colors duration-300 ${
                    darkMode ? 'text-gray-200' : 'text-gray-800'
                  }`}>تصنيف التعليقات</p>
                  <p className={`text-xs transition-colors duration-300 ${
                    darkMode ? 'text-gray-400' : 'text-gray-500'
                  }`}>متوقف</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-6 gap-6 mb-8">
        <CircularStatsCard
          title="إجمالي المستخدمين"
          value={stats.users}
          subtitle="مستخدم مسجل"
          icon={UserCheck}
          bgColor="bg-blue-100"
          iconColor="text-blue-600"
        />
        <CircularStatsCard
          title="النقاط المكتسبة"
          value={stats.points}
          subtitle="نقطة ولاء"
          icon={Star}
          bgColor="bg-yellow-100"
          iconColor="text-yellow-600"
        />
        <CircularStatsCard
          title="المقالات المنشورة"
          value={stats.articles}
          subtitle="مقال"
          icon={FileText}
          bgColor="bg-green-100"
          iconColor="text-green-600"
        />
        <CircularStatsCard
          title="التفاعلات"
          value={stats.interactions}
          subtitle="تفاعل"
          icon={Activity}
          bgColor="bg-purple-100"
          iconColor="text-purple-600"
        />
        <CircularStatsCard
          title="التصنيفات النشطة"
          value={stats.categories}
          subtitle="تصنيف"
          icon={BarChart3}
          bgColor="bg-orange-100"
          iconColor="text-orange-600"
        />
        <CircularStatsCard
          title="المستخدمون النشطون"
          value={stats.activeUsers}
          subtitle="آخر 7 أيام"
          icon={Users}
          bgColor="bg-red-100"
          iconColor="text-red-600"
        />
      </div>

        {/* Navigation Tabs */}
        <NavigationTabs />

        {/* Data Table */}
        <DataTable />
    </div>
  );
} 