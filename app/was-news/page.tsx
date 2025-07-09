'use client';

import React, { useState, useEffect } from 'react';
import { useDarkModeContext } from '@/contexts/DarkModeContext';
import { 
  Newspaper, 
  Download, 
  RefreshCw, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  BarChart3,
  TrendingUp,
  Activity,
  Database,
  Wifi,
  WifiOff,
  Loader2,
  Eye,
  FileText,
  Calendar,
  Target,
  Zap,
  ArrowUpRight,
  ChevronRight,
  Plus,
  Filter,
  Search,
  Settings,
  Bell,
  Star,
  Bookmark,
  Share2,
  MessageSquare,
  Heart,
  Users,
  Award,
  BookOpen
} from 'lucide-react';
import WasNewsMonitor from '@/components/WasNewsMonitor';

interface WasNewsStats {
  total_news: number;
  today_news: number;
  imported_news: number;
  pending_news: number;
  success_rate: number;
  average_response_time: number;
  last_fetch: string;
  next_scheduled_fetch: string;
}

interface WasNewsItem {
  id: string;
  news_NUM: number;
  news_DT: string;
  title_TXT: string;
  story_TXT: string;
  news_priority_CD: number;
  is_Report: boolean;
  is_imported: boolean;
  created_at: string;
  basket_name?: string;
  category_name?: string;
}

export default function WasNewsPage() {
  const { darkMode } = useDarkModeContext();
  const [stats, setStats] = useState<WasNewsStats | null>(null);
  const [news, setNews] = useState<WasNewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedNews, setSelectedNews] = useState<WasNewsItem | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPriority, setFilterPriority] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  // جلب البيانات
  const fetchData = async () => {
    try {
      setLoading(true);
      
      // جلب الإحصائيات
      const statsRes = await fetch('/api/was-news?action=stats');
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData.stats);
      }
      
      // جلب الأخبار
      const newsRes = await fetch('/api/was-news?action=saved');
      if (newsRes.ok) {
        const newsData = await newsRes.json();
        setNews(newsData.data || []);
      }
      
      setLastUpdate(new Date());
    } catch (error) {
      console.error('خطأ في جلب البيانات:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // تحديث تلقائي كل دقيقتين
    const interval = setInterval(fetchData, 2 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // مكون بطاقة الإحصائية
  const StatsCard = ({ 
    title, 
    value, 
    subtitle, 
    icon: Icon, 
    bgColor,
    iconColor,
    trend
  }: {
    title: string;
    value: string | number;
    subtitle: string;
    icon: any;
    bgColor: string;
    iconColor: string;
    trend?: 'up' | 'down' | 'neutral';
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
          {trend && (
            <div className={`flex items-center gap-1 mt-1 text-xs ${
              trend === 'up' ? 'text-green-600' : 
              trend === 'down' ? 'text-red-600' : 'text-gray-500'
            }`}>
              {trend === 'up' && <ArrowUpRight className="w-3 h-3" />}
              {trend === 'down' && <ArrowUpRight className="w-3 h-3 rotate-90" />}
              {trend === 'neutral' && <Activity className="w-3 h-3" />}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // مكون أزرار التنقل
  const NavigationTabs = () => {
    const tabs = [
      { id: 'overview', name: 'نظرة عامة', icon: BarChart3, count: stats?.total_news || 0 },
      { id: 'monitor', name: 'مراقبة الاتصال', icon: Activity, count: 0 },
      { id: 'news', name: 'الأخبار', icon: Newspaper, count: news.length },
      { id: 'analytics', name: 'التحليلات', icon: TrendingUp, count: 0 }
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
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-48 flex flex-col items-center justify-center gap-2 py-4 pb-3 px-3 rounded-xl font-medium text-sm transition-all duration-300 relative ${
                  isActive
                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg transform scale-105'
                    : darkMode
                      ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-700/50'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                {isActive && (
                  <div className="absolute bottom-0 left-6 right-6 h-1 bg-white/30 rounded-full" />
                )}
                <Icon className={`w-5 h-5 ${isActive ? 'text-white' : ''}`} />
                <span className={isActive ? 'text-white' : ''}>{tab.name}</span>
                {tab.count > 0 && (
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    isActive 
                      ? 'bg-white/20 text-white' 
                      : darkMode 
                        ? 'bg-gray-700 text-gray-300' 
                        : 'bg-gray-100 text-gray-600'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  // مكون بطاقة الخبر
  const NewsCard = ({ news }: { news: WasNewsItem }) => {
    const getPriorityBadge = (priority: number) => {
      switch(priority) {
        case 1:
          return <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">عاجل</span>;
        case 2:
          return <span className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full">مهم</span>;
        default:
          return <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-full">عادي</span>;
      }
    };

    const getStatusBadge = (isImported: boolean) => {
      return isImported ? (
        <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full flex items-center gap-1">
          <CheckCircle className="w-3 h-3" />
          مستورد
        </span>
      ) : (
        <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full flex items-center gap-1">
          <Clock className="w-3 h-3" />
          في الانتظار
        </span>
      );
    };

    return (
      <div className={`rounded-xl p-4 border transition-all duration-300 hover:shadow-md cursor-pointer ${
        darkMode 
          ? 'bg-gray-800 border-gray-700 hover:border-gray-600' 
          : 'bg-white border-gray-200 hover:border-gray-300'
      }`} onClick={() => setSelectedNews(news)}>
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            {getPriorityBadge(news.news_priority_CD)}
            {getStatusBadge(news.is_imported)}
          </div>
          <span className={`text-xs ${
            darkMode ? 'text-gray-400' : 'text-gray-500'
          }`}>
            #{news.news_NUM}
          </span>
        </div>
        
        <h3 className={`font-semibold mb-2 line-clamp-2 ${
          darkMode ? 'text-white' : 'text-gray-800'
        }`}>
          {news.title_TXT}
        </h3>
        
        <p className={`text-sm line-clamp-3 mb-3 ${
          darkMode ? 'text-gray-300' : 'text-gray-600'
        }`}>
          {news.story_TXT}
        </p>
        
        <div className="flex items-center justify-between text-xs">
          <span className={`${
            darkMode ? 'text-gray-400' : 'text-gray-500'
          }`}>
            {new Date(news.news_DT).toLocaleDateString('ar-SA')}
          </span>
          <div className="flex items-center gap-2">
            <Eye className="w-3 h-3" />
            <span className={`${
              darkMode ? 'text-gray-400' : 'text-gray-500'
            }`}>عرض</span>
          </div>
        </div>
      </div>
    );
  };

  // مكون البحث والفلترة
  const SearchAndFilter = () => (
    <div className={`rounded-2xl p-4 mb-6 shadow-sm border ${
      darkMode 
        ? 'bg-gray-800 border-gray-700' 
        : 'bg-white border-gray-100'
    }`}>
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className={`absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${
            darkMode ? 'text-gray-400' : 'text-gray-500'
          }`} />
          <input
            type="text"
            placeholder="البحث في الأخبار..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`w-full pr-10 pl-4 py-2 rounded-lg border transition-colors duration-300 ${
              darkMode 
                ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500' 
                : 'bg-white border-gray-300 text-gray-800 placeholder-gray-500 focus:border-blue-500'
            }`}
          />
        </div>
        
        <div className="flex gap-2">
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className={`px-3 py-2 rounded-lg border transition-colors duration-300 ${
              darkMode 
                ? 'bg-gray-700 border-gray-600 text-white' 
                : 'bg-white border-gray-300 text-gray-800'
            }`}
          >
            <option value="all">جميع الأولويات</option>
            <option value="1">عاجل</option>
            <option value="2">مهم</option>
            <option value="3">عادي</option>
          </select>
          
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className={`px-3 py-2 rounded-lg border transition-colors duration-300 ${
              darkMode 
                ? 'bg-gray-700 border-gray-600 text-white' 
                : 'bg-white border-gray-300 text-gray-800'
            }`}
          >
            <option value="all">جميع الحالات</option>
            <option value="imported">مستورد</option>
            <option value="pending">في الانتظار</option>
          </select>
        </div>
      </div>
    </div>
  );

  // تصفية الأخبار
  const filteredNews = news.filter(item => {
    const matchesSearch = item.title_TXT.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.story_TXT.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPriority = filterPriority === 'all' || item.news_priority_CD.toString() === filterPriority;
    const matchesStatus = filterStatus === 'all' || 
                         (filterStatus === 'imported' && item.is_imported) ||
                         (filterStatus === 'pending' && !item.is_imported);
    
    return matchesSearch && matchesPriority && matchesStatus;
  });

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'
    }`}>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
                <Newspaper className="w-8 h-8 text-blue-600" />
                أخبار وكالة الأنباء السعودية (واس)
              </h1>
              <p className={`text-lg ${
                darkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>
                إدارة ومراقبة الأخبار من وكالة واس
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={fetchData}
                disabled={loading}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors duration-300 ${
                  loading
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : darkMode
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <RefreshCw className="w-4 h-4" />
                )}
                تحديث
              </button>
              
              <div className={`text-xs ${
                darkMode ? 'text-gray-400' : 'text-gray-500'
              }`}>
                آخر تحديث: {lastUpdate.toLocaleTimeString('ar-SA')}
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <NavigationTabs />

        {/* Content based on active tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatsCard
                title="إجمالي الأخبار"
                value={stats?.total_news || 0}
                subtitle="خبر"
                icon={Newspaper}
                bgColor="bg-blue-100"
                iconColor="text-blue-600"
                trend="up"
              />
              <StatsCard
                title="أخبار اليوم"
                value={stats?.today_news || 0}
                subtitle="خبر"
                icon={Calendar}
                bgColor="bg-green-100"
                iconColor="text-green-600"
                trend="up"
              />
              <StatsCard
                title="الأخبار المستوردة"
                value={stats?.imported_news || 0}
                subtitle="خبر"
                icon={CheckCircle}
                bgColor="bg-purple-100"
                iconColor="text-purple-600"
                trend="neutral"
              />
              <StatsCard
                title="نسبة النجاح"
                value={`${stats?.success_rate || 0}%`}
                subtitle="نجح"
                icon={Target}
                bgColor="bg-orange-100"
                iconColor="text-orange-600"
                trend="up"
              />
            </div>

            {/* Recent News */}
            <div className={`rounded-2xl p-6 shadow-sm border ${
              darkMode 
                ? 'bg-gray-800 border-gray-700' 
                : 'bg-white border-gray-100'
            }`}>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold">أحدث الأخبار</h2>
                <button
                  onClick={() => setActiveTab('news')}
                  className="flex items-center gap-2 text-blue-600 hover:text-blue-700 transition-colors"
                >
                  عرض الكل
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {news.slice(0, 6).map((item) => (
                  <NewsCard key={item.id} news={item} />
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'monitor' && (
          <WasNewsMonitor />
        )}

        {activeTab === 'news' && (
          <div className="space-y-6">
            <SearchAndFilter />
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredNews.map((item) => (
                <NewsCard key={item.id} news={item} />
              ))}
            </div>
            
            {filteredNews.length === 0 && (
              <div className={`text-center py-12 ${
                darkMode ? 'text-gray-400' : 'text-gray-500'
              }`}>
                <Newspaper className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>لا توجد أخبار تطابق معايير البحث</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className={`rounded-2xl p-6 shadow-sm border ${
            darkMode 
              ? 'bg-gray-800 border-gray-700' 
              : 'bg-white border-gray-100'
          }`}>
            <h2 className="text-xl font-bold mb-4">تحليلات واس</h2>
            <p className={`${
              darkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>
              قريباً - تحليلات متقدمة لأداء جلب الأخبار
            </p>
          </div>
        )}
      </div>

      {/* News Detail Modal */}
      {selectedNews && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className={`max-w-4xl w-full max-h-[90vh] overflow-y-auto rounded-2xl ${
            darkMode ? 'bg-gray-800' : 'bg-white'
          }`}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">{selectedNews.title_TXT}</h2>
                <button
                  onClick={() => setSelectedNews(null)}
                  className={`p-2 rounded-lg transition-colors ${
                    darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                  }`}
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center gap-4 text-sm">
                  <span className={`${
                    darkMode ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    رقم الخبر: {selectedNews.news_NUM}
                  </span>
                  <span className={`${
                    darkMode ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    التاريخ: {new Date(selectedNews.news_DT).toLocaleDateString('ar-SA')}
                  </span>
                </div>
                
                <div className={`p-4 rounded-lg ${
                  darkMode ? 'bg-gray-700' : 'bg-gray-50'
                }`}>
                  <p className="whitespace-pre-wrap">{selectedNews.story_TXT}</p>
                </div>
                
                <div className="flex items-center gap-4">
                  <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    <FileText className="w-4 h-4" />
                    استيراد كمقال
                  </button>
                  <button className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors">
                    <Share2 className="w-4 h-4" />
                    مشاركة
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 