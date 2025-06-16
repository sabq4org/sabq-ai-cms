'use client';

import React, { useState } from 'react';
import { 
  Search, Moon, Sun, Bot, Sparkles, Activity, Flame, Lightbulb, 
  Target, Compass, Volume2, Calendar, Globe2, Star, AlertCircle, 
  TrendingUp, PlayCircle, Download, Clock, Users, Heart, Share2
} from 'lucide-react';

interface BlockConfig {
  enabled: boolean;
  order: number;
}

interface BlocksConfig {
  [key: string]: BlockConfig;
}

export default function SmartBlocksHomePage() {
  const [darkMode, setDarkMode] = useState(false);
  const [blocksConfig] = useState<BlocksConfig>({
    briefing: { enabled: true, order: 1 },
    trending: { enabled: true, order: 2 },
    analysis: { enabled: true, order: 3 },
    recommendation: { enabled: true, order: 4 },
    categories: { enabled: true, order: 5 },
    audio: { enabled: true, order: 6 },
    regions: { enabled: true, order: 7 }
  });

  const toggleDarkMode = () => setDarkMode(!darkMode);

  // بيانات البلوكات
  const briefingData = [
    { id: 1, title: "انطلاق مؤتمر الذكاء الاصطناعي في الرياض", time: "منذ 15 دقيقة", isNew: true },
    { id: 2, title: "صندوق الاستثمارات يعلن عن شراكة جديدة", time: "منذ 30 دقيقة", isNew: true },
    { id: 3, title: "نجاح عملية القمر الاصطناعي السعودي", time: "منذ ساعة", isNew: false },
    { id: 4, title: "افتتاح مدينة نيوم الطبية الذكية", time: "منذ ساعتين", isNew: false }
  ];

  const trendingData = [
    { id: 1, title: "اكتشاف أثري مهم في العلا", views: 24580, category: "تراث" },
    { id: 2, title: "إطلاق برنامج سكني جديد", views: 19230, category: "اقتصاد" },
    { id: 3, title: "فوز المنتخب السعودي بكأس آسيا", views: 45670, category: "رياضة" }
  ];

  const analysisData = {
    mainEvent: "المملكة تتقدم في مؤشر الابتكار العالمي",
    alert: "موجة حر متوقعة على المنطقة الشرقية",
    trend: "نمو في قطاع التقنية المالية بنسبة 34%"
  };

  const userRecommendation = {
    title: "تطوير الذكاء الاصطناعي في التعليم السعودي",
    category: "تقنية",
    image: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=800&q=60",
    time: "منذ 3 ساعات"
  };

  const categoriesData = [
    { name: "اقتصاد", articles: ["صعود البورصة السعودية", "انطلاق مشروع جديد", "تطوير القطاع المصرفي"], icon: "💼" },
    { name: "تقنية", articles: ["شراكة مع عمالقة التقنية", "ابتكار في الذكاء الاصطناعي", "تطوير المدن الذكية"], icon: "💻" },
    { name: "رياضة", articles: ["استعدادات كأس العالم", "بطولة الدوري السعودي", "انجازات رياضية"], icon: "⚽" }
  ];

  const audioData = {
    title: "نشرة أخبار سبق الصوتية - مساء اليوم",
    duration: "12:45",
    publishTime: "منذ 30 دقيقة"
  };

  const regionsData = [
    { name: "الرياض", newsCount: 15, lastUpdate: "منذ ساعة" },
    { name: "جدة", newsCount: 8, lastUpdate: "منذ ساعتين" },
    { name: "الدمام", newsCount: 5, lastUpdate: "منذ 3 ساعات" },
    { name: "أبها", newsCount: 3, lastUpdate: "منذ 4 ساعات" }
  ];

  // مكونات البلوكات
  const BriefingBlock = () => (
    <div className={`rounded-2xl p-6 shadow-sm border transition-colors duration-300 ${
      darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'
    }`}>
      <div className="flex items-center gap-3 mb-4">
        <Activity className="w-6 h-6 text-blue-500" />
        <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>ابدأ من هنا</h2>
      </div>
      <div className="space-y-3">
        {briefingData.map((item) => (
          <div key={item.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h4 className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>{item.title}</h4>
                {item.isNew && <span className="px-2 py-1 bg-red-500 text-white text-xs rounded-full">جديد</span>}
              </div>
              <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{item.time}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const TrendingBlock = () => (
    <div className={`rounded-2xl p-6 shadow-sm border transition-colors duration-300 ${
      darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'
    }`}>
      <div className="flex items-center gap-3 mb-4">
        <Flame className="w-6 h-6 text-orange-500" />
        <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>يتم قراءته الآن</h2>
      </div>
      <div className="space-y-3">
        {trendingData.map((item, index) => (
          <div key={item.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold ${
              index === 0 ? 'bg-red-500 text-white' : 
              index === 1 ? 'bg-orange-500 text-white' : 'bg-gray-500 text-white'
            }`}>{index + 1}</span>
            <div className="flex-1">
              <h4 className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>{item.title}</h4>
              <div className="flex items-center gap-2 mt-1">
                <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-md">{item.category}</span>
                <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{item.views.toLocaleString()} قراءة</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const AnalysisBlock = () => (
    <div className={`rounded-2xl p-6 shadow-sm border transition-colors duration-300 ${
      darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'
    }`}>
      <div className="flex items-center gap-3 mb-4">
        <Lightbulb className="w-6 h-6 text-yellow-500" />
        <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>موجز اليوم الذكي</h2>
        <div className="flex items-center gap-1 text-blue-500">
          <Sparkles className="w-4 h-4" />
          <span className="text-xs font-medium">AI</span>
        </div>
      </div>
      <div className="space-y-4">
        <div className="flex items-start gap-3">
          <Star className="w-5 h-5 text-blue-500 mt-1" />
          <div>
            <h4 className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>أبرز حدث</h4>
            <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>{analysisData.mainEvent}</p>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-orange-500 mt-1" />
          <div>
            <h4 className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>تنبيه مهم</h4>
            <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>{analysisData.alert}</p>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <TrendingUp className="w-5 h-5 text-green-500 mt-1" />
          <div>
            <h4 className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>توجه عام</h4>
            <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>{analysisData.trend}</p>
          </div>
        </div>
      </div>
    </div>
  );

  const RecommendationBlock = () => (
    <div className={`rounded-2xl p-6 shadow-sm border transition-colors duration-300 ${
      darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'
    }`}>
      <div className="flex items-center gap-3 mb-4">
        <Target className="w-6 h-6 text-purple-500" />
        <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>اقترحنا لك هذا</h2>
      </div>
      <div className="rounded-xl overflow-hidden">
        <img src={userRecommendation.image} alt={userRecommendation.title} className="w-full h-32 object-cover" />
        <div className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-md">{userRecommendation.category}</span>
            <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{userRecommendation.time}</span>
          </div>
          <h4 className={`text-sm font-medium mb-3 ${darkMode ? 'text-white' : 'text-gray-800'}`}>{userRecommendation.title}</h4>
          <button className="w-full px-4 py-2 bg-purple-500 text-white text-sm rounded-lg hover:bg-purple-600 transition-colors">
            عرض المزيد من هذا النوع
          </button>
        </div>
      </div>
    </div>
  );

  const CategoriesBlock = () => (
    <div className={`rounded-2xl p-6 shadow-sm border transition-colors duration-300 ${
      darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'
    }`}>
      <div className="flex items-center gap-3 mb-4">
        <Compass className="w-6 h-6 text-indigo-500" />
        <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>استكشف بحسب اهتماماتك</h2>
      </div>
      <div className="grid grid-cols-1 gap-4">
        {categoriesData.map((category, index) => (
          <div key={index} className={`p-4 rounded-xl border hover:shadow-md transition-all duration-300 ${
            darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
          }`}>
            <div className="flex items-center gap-3 mb-3">
              <span className="text-2xl">{category.icon}</span>
              <h4 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>{category.name}</h4>
            </div>
            <div className="space-y-1">
              {category.articles.map((article, i) => (
                <p key={i} className={`text-sm hover:text-blue-500 cursor-pointer ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  • {article}
                </p>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const AudioBlock = () => (
    <div className={`rounded-2xl p-6 shadow-sm border transition-colors duration-300 ${
      darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'
    }`}>
      <div className="flex items-center gap-3 mb-4">
        <Volume2 className="w-6 h-6 text-green-500" />
        <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>استمع لأبرز الأخبار</h2>
      </div>
      <div className={`p-4 rounded-xl ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
        <h4 className={`font-medium mb-2 ${darkMode ? 'text-white' : 'text-gray-800'}`}>{audioData.title}</h4>
        <div className="flex items-center justify-between mb-3">
          <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>{audioData.publishTime}</span>
          <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>{audioData.duration}</span>
        </div>
        <div className="flex items-center gap-3">
          <button className="p-2 bg-green-500 text-white rounded-full hover:bg-green-600 transition-colors">
            <PlayCircle className="w-6 h-6" />
          </button>
          <div className="flex-1 h-2 bg-gray-300 rounded-full">
            <div className="h-full w-1/3 bg-green-500 rounded-full"></div>
          </div>
          <button className="p-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors">
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );

  const RegionsBlock = () => (
    <div className={`rounded-2xl p-6 shadow-sm border transition-colors duration-300 ${
      darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'
    }`}>
      <div className="flex items-center gap-3 mb-4">
        <Globe2 className="w-6 h-6 text-teal-500" />
        <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>جغرافيا الأخبار</h2>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {regionsData.map((region, index) => (
          <div key={index} className={`p-4 rounded-xl border hover:shadow-md transition-all duration-300 cursor-pointer ${
            darkMode ? 'bg-gray-700 border-gray-600 hover:bg-gray-600' : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <h4 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>{region.name}</h4>
              <span className="px-2 py-1 bg-teal-100 text-teal-700 text-xs rounded-full">{region.newsCount}</span>
            </div>
            <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>آخر تحديث: {region.lastUpdate}</p>
          </div>
        ))}
      </div>
    </div>
  );

  // ترتيب البلوكات حسب الإعدادات
  const getOrderedBlocks = () => {
    const blocks = [
      { key: 'briefing', component: <BriefingBlock /> },
      { key: 'trending', component: <TrendingBlock /> },
      { key: 'analysis', component: <AnalysisBlock /> },
      { key: 'recommendation', component: <RecommendationBlock /> },
      { key: 'categories', component: <CategoriesBlock /> },
      { key: 'audio', component: <AudioBlock /> },
      { key: 'regions', component: <RegionsBlock /> }
    ];

    return blocks
      .filter(block => blocksConfig[block.key]?.enabled)
      .sort((a, b) => blocksConfig[a.key].order - blocksConfig[b.key].order);
  };

  return (
    <div 
      className={`min-h-screen transition-colors duration-300 ${
        darkMode ? 'bg-gray-900' : 'bg-gray-50'
      }`}
      style={{
        fontFamily: 'Tajawal, system-ui, -apple-system, "Segoe UI", "Noto Sans Arabic", Arial, sans-serif',
        direction: 'rtl'
      }}
    >
      {/* Header */}
      <header className={`sticky top-0 z-50 backdrop-blur-md border-b transition-colors duration-300 ${
        darkMode ? 'bg-gray-800/95 border-gray-700' : 'bg-white/95 border-gray-200'
      }`}>
        {/* Breaking News */}
        <div className={`py-2 px-6 border-b transition-colors duration-300 ${
          darkMode ? 'bg-blue-900 border-blue-800' : 'bg-blue-50 border-blue-100'
        }`}>
          <div className="flex items-center gap-4">
            <span className={`px-3 py-1 rounded-full text-xs font-bold ${
              darkMode ? 'bg-red-600 text-white' : 'bg-red-500 text-white'
            }`}>
              LIVE
            </span>
            <div className={`text-sm transition-colors duration-300 ${
              darkMode ? 'text-blue-200' : 'text-blue-800'
            }`}>
              أخبار عاجلة: تطورات مهمة في المنطقة • إعلانات حكومية جديدة • مؤتمر صحفي هام
            </div>
          </div>
        </div>

        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                darkMode ? 'bg-blue-600' : 'bg-blue-500'
              }`}>
                <span className="text-white font-bold text-xl">س</span>
              </div>
              <div>
                <h1 className={`text-2xl font-bold transition-colors duration-300 ${
                  darkMode ? 'text-white' : 'text-gray-800'
                }`}>
                  سبق الذكية
                </h1>
                <p className={`text-sm flex items-center gap-2 transition-colors duration-300 ${
                  darkMode ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  <Bot className="w-4 h-4" />
                  واجهة البلوكات الذكية
                </p>
              </div>
            </div>

            {/* Tools */}
            <div className="flex items-center gap-3">
              <div className="relative">
                <input
                  type="text"
                  placeholder="البحث الذكي..."
                  className={`w-64 px-4 py-2 pr-10 rounded-xl border transition-colors duration-300 ${
                    darkMode 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                      : 'bg-gray-50 border-gray-200 text-gray-800'
                  }`}
                />
                <Search className={`absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${
                  darkMode ? 'text-gray-400' : 'text-gray-500'
                }`} />
              </div>

              <button
                onClick={toggleDarkMode}
                className={`p-2 rounded-xl transition-colors duration-300 ${
                  darkMode 
                    ? 'bg-gray-700 text-yellow-400 hover:bg-gray-600' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>

              <div className={`flex items-center gap-3 px-3 py-2 rounded-xl ${
                darkMode ? 'bg-gray-700' : 'bg-gray-100'
              }`}>
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  darkMode ? 'bg-blue-600' : 'bg-blue-500'
                }`}>
                  <span className="text-white text-sm font-bold">ع</span>
                </div>
                <span className={`text-sm font-medium transition-colors duration-300 ${
                  darkMode ? 'text-gray-200' : 'text-gray-800'
                }`}>علي الحازمي</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        {/* Welcome Message */}
        <div className="text-center mb-8">
          <h1 className={`text-4xl font-bold mb-2 transition-colors duration-300 ${
            darkMode ? 'text-white' : 'text-gray-800'
          }`}>
            مرحباً بك في سبق الذكية
          </h1>
          <p className={`text-lg transition-colors duration-300 ${
            darkMode ? 'text-gray-300' : 'text-gray-600'
          }`}>
            واجهتك المخصصة مع البلوكات الذكية والمحتوى المدعوم بالذكاء الاصطناعي
          </p>
        </div>

        {/* Smart Blocks Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {getOrderedBlocks().map((block, index) => (
            <div key={`${block.key}-${index}`} className="animate-fade-in">
              {block.component}
            </div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className={`border-t transition-colors duration-300 mt-16 ${
        darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      }`}>
        <div className="container mx-auto px-6 py-8">
          <div className="text-center">
            <p className={`transition-colors duration-300 ${
              darkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>
              © صحيفة سبق الذكية – نظام البلوكات المخصصة 2025
            </p>
          </div>
        </div>
      </footer>

      {/* CSS */}
      <style jsx>{`
        .animate-fade-in {
          animation: fadeIn 0.5s ease-in-out;
        }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
} 