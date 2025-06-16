'use client';

import React, { useState } from 'react';
import { 
  Search, 
  Filter,
  MoreHorizontal,
  Edit,
  Trash2,
  MessageCircle,
  Copy,
  Eye,
  Calendar,
  Star,
  Zap,
  Users,
  Award,
  TrendingUp,
  TrendingDown,
  Activity,
  MessageSquare,
  Refresh,
  Plus,
  BookOpen,
  BarChart3
} from 'lucide-react';

type NewsStatus = 'published' | 'draft' | 'pending';
type NewsItem = {
  id: string;
  title: string;
  author: string;
  category: string;
  publishTime: string;
  viewCount: number;
  lastModified: string;
  lastModifiedBy: string;
  isPinned: boolean;
  isBreaking: boolean;
  status: NewsStatus;
  rating: number;
};

const mockNewsData: NewsItem[] = [
  {
    id: 'A001',
    title: 'تطوير جديد في تقنيات الذكاء الاصطناعي يحدث نقلة في مجال الصحافة',
    author: 'محمد الأحمد',
    category: 'التكنولوجيا',
    publishTime: '2024-03-15 10:30',
    viewCount: 12500,
    lastModified: '2024-03-15 12:45',
    lastModifiedBy: 'فاطمة السعيد',
    isPinned: true,
    isBreaking: true,
    status: 'published',
    rating: 4.8
  },
  {
    id: 'A002',
    title: 'الاقتصاد السعودي يسجل نمواً قياسياً في الربع الأول من 2024',
    author: 'عبدالله الخالد',
    category: 'الاقتصاد',
    publishTime: '2024-03-14 16:20',
    viewCount: 8300,
    lastModified: '2024-03-15 08:15',
    lastModifiedBy: 'سارة النعيم',
    isPinned: false,
    isBreaking: false,
    status: 'published',
    rating: 4.2
  },
  {
    id: 'A003',
    title: 'رؤية 2030: إنجازات جديدة في مجال التحول الرقمي والاستدامة',
    author: 'نورا الزهراني',
    category: 'محليات',
    publishTime: '',
    viewCount: 0,
    lastModified: '2024-03-15 14:30',
    lastModifiedBy: 'أحمد الحربي',
    isPinned: false,
    isBreaking: false,
    status: 'draft',
    rating: 0
  },
  {
    id: 'A004',
    title: 'المملكة تستضيف قمة عالمية للذكاء الاصطناعي في الرياض',
    author: 'علي المالكي',
    category: 'سياسة',
    publishTime: '',
    viewCount: 0,
    lastModified: '2024-03-15 11:20',
    lastModifiedBy: 'ليلى الشمري',
    isPinned: false,
    isBreaking: false,
    status: 'pending',
    rating: 0
  },
  {
    id: 'A005',
    title: 'انطلاق موسم الرياض 2024 بفعاليات ثقافية وترفيهية متنوعة',
    author: 'رناد القحطاني',
    category: 'ترفيه',
    publishTime: '2024-03-13 20:15',
    viewCount: 15600,
    lastModified: '2024-03-14 09:45',
    lastModifiedBy: 'خالد الدوسري',
    isPinned: true,
    isBreaking: false,
    status: 'published',
    rating: 4.9
  }
];

// مكون بطاقة الإحصائيات مطابق للتصميم الأصلي
const SmartStatCard = ({ title, value, icon, color, subtitle, trend }: any) => (
  <div className="smart-stat-card smart-hover-lift">
    <div className="flex justify-between items-start">
      <div className="flex-1">
        <p className="text-gray-500 text-sm font-medium mb-2">{title}</p>
        <h3 className="text-3xl font-bold text-gray-800 mb-1">{value}</h3>
        {subtitle && (
          <p className="text-gray-400 text-xs">{subtitle}</p>
        )}
        {trend && (
          <div className="flex items-center gap-1 mt-2">
            {trend.type === 'up' ? (
              <TrendingUp className="w-4 h-4 text-green-500" />
            ) : (
              <TrendingDown className="w-4 h-4 text-red-500" />
            )}
            <span className={`text-sm font-semibold ${trend.type === 'up' ? 'text-green-500' : 'text-red-500'}`}>
              {trend.value}
            </span>
          </div>
        )}
      </div>
      <div 
        className="smart-stat-icon"
        style={{ background: `linear-gradient(135deg, ${color}, ${color}dd)` }}
      >
        {icon}
      </div>
    </div>
  </div>
);

export default function NewsManagementPage() {
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [timeFilter, setTimeFilter] = useState('7d');
  const [refreshing, setRefreshing] = useState(false);

  const statusTabs = [
    { 
      id: 'all', 
      name: 'جميع الأخبار', 
      count: mockNewsData.length,
      icon: <MessageSquare className="w-5 h-5" />
    },
    { 
      id: 'published', 
      name: 'منشور', 
      count: mockNewsData.filter(item => item.status === 'published').length,
      icon: <Eye className="w-5 h-5" />
    },
    { 
      id: 'draft', 
      name: 'مسودة', 
      count: mockNewsData.filter(item => item.status === 'draft').length,
      icon: <Edit className="w-5 h-5" />
    },
    { 
      id: 'breaking', 
      name: 'عاجل', 
      count: mockNewsData.filter(item => item.isBreaking).length,
      icon: <Zap className="w-5 h-5" />
    },
    { 
      id: 'pending', 
      name: 'في الانتظار', 
      count: mockNewsData.filter(item => item.status === 'pending').length,
      icon: <Calendar className="w-5 h-5" />
    }
  ];

  const getStatusBadge = (status: NewsStatus) => {
    const statusConfig = {
      published: { class: 'smart-badge smart-badge-green', text: 'منشور' },
      draft: { class: 'smart-badge smart-badge-yellow', text: 'مسودة' },
      pending: { class: 'smart-badge smart-badge-blue', text: 'في الانتظار' }
    };
    
    return statusConfig[status] || statusConfig.draft;
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < Math.floor(rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
      />
    ));
  };

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 2000);
  };

  return (
    <div 
      className="smart-gradient-bg min-h-screen p-8"
      style={{
        fontFamily: 'Tajawal, system-ui, -apple-system, "Segoe UI", "Noto Sans Arabic", Arial, sans-serif'
      }}
    >
      {/* Header - مطابق للتصميم الأصلي */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="smart-header-icon">
              <BookOpen className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold smart-gradient-text mb-2">
                لوحة تحكم إدارة الأخبار
              </h1>
              <p className="text-gray-600 text-lg">
                إدارة ومراقبة محتوى الأخبار والمقالات الصحفية الذكية
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <select 
              value={timeFilter}
              onChange={(e) => setTimeFilter(e.target.value)}
              className="smart-select"
            >
              <option value="1d">يوم واحد</option>
              <option value="7d">أسبوع</option>
              <option value="30d">شهر</option>
              <option value="90d">3 أشهر</option>
            </select>
            <button 
              onClick={handleRefresh}
              disabled={refreshing}
              className="smart-btn-primary"
            >
              <Refresh className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              تحديث البيانات
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards - مطابقة للتصميم الأصلي */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
        <SmartStatCard
          title="إجمالي الأخبار"
          value="245"
          icon={<MessageSquare className="w-6 h-6 text-white" />}
          color="#3b82f6"
          subtitle="جميع المواضيع"
          trend={{ type: 'up', value: '+12%' }}
        />
        <SmartStatCard
          title="المنشورة"
          value="189"
          icon={<TrendingUp className="w-6 h-6 text-white" />}
          color="#10b981"
          subtitle="متاحة للقراء"
          trend={{ type: 'up', value: '+8%' }}
        />
        <SmartStatCard
          title="المسودات"
          value="32"
          icon={<Edit className="w-6 h-6 text-white" />}
          color="#f59e0b"
          subtitle="قيد التحرير"
        />
        <SmartStatCard
          title="إجمالي المشاهدات"
          value="1.2M"
          icon={<Eye className="w-6 h-6 text-white" />}
          color="#ef4444"
          subtitle="آخر 30 يوم"
          trend={{ type: 'up', value: '+24%' }}
        />
        <SmartStatCard
          title="الكتّاب النشطون"
          value="12"
          icon={<Users className="w-6 h-6 text-white" />}
          color="#8b5cf6"
          subtitle="آخر 7 أيام"
        />
        <SmartStatCard
          title="متوسط التقييم"
          value="4.6"
          icon={<Award className="w-6 h-6 text-white" />}
          color="#06b6d4"
          subtitle="من 5 نجوم"
        />
      </div>

      {/* Tabs - مطابقة للتصميم الأصلي */}
      <div className="smart-content-card mb-0">
        <div className="smart-tabs-container">
          <div className="flex">
            {statusTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`smart-tab ${activeTab === tab.id ? 'active' : ''}`}
              >
                {tab.icon}
                <div className="flex flex-col items-start">
                  <span className="text-sm font-semibold">{tab.name}</span>
                  <span className="text-xs opacity-70">{tab.count} عنصر</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content Card */}
      <div className="smart-content-card">
        {/* Search and Filters */}
        <div className="flex flex-col lg:flex-row gap-4 items-center justify-between mb-6 p-4 bg-gray-50 rounded-xl">
          <div className="flex items-center gap-4 w-full lg:w-auto">
            <div className="relative flex-1 lg:w-96">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="البحث بالعنوان أو معرف المقال..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pr-10 pl-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
              />
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <select 
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="smart-select"
            >
              <option value="all">جميع التصنيفات</option>
              <option value="tech">التكنولوجيا</option>
              <option value="economy">الاقتصاد</option>
              <option value="politics">السياسة</option>
              <option value="sports">الرياضة</option>
            </select>
            
            <select 
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="smart-select"
            >
              <option value="all">جميع الحالات</option>
              <option value="published">منشور</option>
              <option value="draft">مسودة</option>
              <option value="pending">في الانتظار</option>
            </select>
            
            <button className="p-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors duration-200">
              <Filter className="w-4 h-4 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Table - مطابق للتصميم الأصلي */}
        <div className="smart-table-container">
          {/* Table Header */}
          <div className="smart-table-header">
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-3">العنوان</div>
              <div>الكاتب</div>
              <div>التصنيف</div>
              <div>وقت النشر</div>
              <div>المشاهدات</div>
              <div>آخر تعديل</div>
              <div>التقييم</div>
              <div>الحالة</div>
              <div>العمليات</div>
            </div>
          </div>

          {/* Table Body */}
          <div>
            {mockNewsData.map((news, index) => (
              <div 
                key={news.id} 
                className={`smart-table-row grid grid-cols-12 gap-4 smart-table-cell ${
                  news.isBreaking ? 'bg-red-50 border-r-4 border-red-500' : 
                  news.isPinned ? 'bg-blue-50 border-r-4 border-blue-500' : ''
                }`}
              >
                {/* العنوان */}
                <div className="col-span-3">
                  <div className="flex items-start">
                    <div className="flex-1">
                      <button className="text-blue-600 hover:text-blue-800 font-semibold text-right leading-tight">
                        {news.title}
                      </button>
                      <div className="flex items-center mt-2 gap-2">
                        <span className="text-xs text-gray-500">#{news.id}</span>
                        {news.isPinned && (
                          <span className="smart-badge smart-badge-blue text-xs">
                            مثبت
                          </span>
                        )}
                        {news.isBreaking && (
                          <span className="smart-badge smart-badge-red text-xs flex items-center gap-1">
                            <Zap className="w-3 h-3" />
                            عاجل
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* الكاتب */}
                <div className="font-semibold text-gray-900">
                  {news.author}
                </div>

                {/* التصنيف */}
                <div>
                  <span className="smart-badge smart-badge-blue">
                    {news.category}
                  </span>
                </div>

                {/* وقت النشر */}
                <div className="text-gray-500 text-sm">
                  {news.publishTime || '-'}
                </div>

                {/* المشاهدات */}
                <div className="flex items-center gap-1">
                  <Eye className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-700 font-semibold">
                    {news.viewCount.toLocaleString()}
                  </span>
                </div>

                {/* آخر تعديل */}
                <div className="text-sm text-gray-500">
                  <div>{news.lastModified}</div>
                  <div className="text-gray-400">بواسطة {news.lastModifiedBy}</div>
                </div>

                {/* التقييم */}
                <div className="flex items-center">
                  {news.status === 'published' ? (
                    <div className="flex items-center gap-1">
                      {renderStars(news.rating)}
                      <span className="text-xs text-gray-600 mr-1">
                        {news.rating}
                      </span>
                    </div>
                  ) : (
                    <span className="text-xs text-gray-400">-</span>
                  )}
                </div>

                {/* الحالة */}
                <div>
                  <span className={getStatusBadge(news.status).class}>
                    {getStatusBadge(news.status).text}
                  </span>
                </div>

                {/* العمليات */}
                <div className="flex items-center gap-1">
                  <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200">
                    <Edit className="w-4 h-4" />
                  </button>
                  <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200">
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <button className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors duration-200">
                    <MessageCircle className="w-4 h-4" />
                  </button>
                  <button className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors duration-200">
                    <Copy className="w-4 h-4" />
                  </button>
                  <button className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors duration-200">
                    <MoreHorizontal className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Table Footer */}
        <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-200">
          <div className="text-sm text-gray-700">
            عرض 1-5 من {mockNewsData.length} خبر
          </div>
          <div className="flex items-center gap-2">
            <button className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 transition-colors duration-200">
              السابق
            </button>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm shadow-sm">
              1
            </button>
            <button className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 transition-colors duration-200">
              2
            </button>
            <button className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 transition-colors duration-200">
              التالي
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 