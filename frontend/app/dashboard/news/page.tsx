'use client';

import React, { useState } from 'react';
import { 
  ChevronDown, 
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
  Activity,
  MessageSquare
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
    category: 'التكنولوجيا > ذكاء اصطناعي',
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
    category: 'الاقتصاد > أسواق محلية',
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
    category: 'محليات > رؤية 2030',
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
    category: 'سياسة > محلي',
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
    category: 'ترفيه > فعاليات',
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

export default function NewsManagementPage() {
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');


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
      published: { color: 'bg-green-100 text-green-700', text: 'منشور' },
      draft: { color: 'bg-yellow-100 text-yellow-700', text: 'مسودة' },
      pending: { color: 'bg-blue-100 text-blue-700', text: 'في الانتظار' }
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

  // مكون بطاقة الإحصائيات البسيطة
  const StatsCard = ({ title, value, subtitle, iconComponent }: {
    title: string;
    value: string;
    subtitle: string;
    iconComponent: React.ReactNode;
  }) => (
    <div className="bg-white rounded-2xl shadow-md border border-gray-100 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group">
      <div className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h3 className="text-gray-600 text-sm font-medium mb-2">{title}</h3>
            <div className="text-2xl font-bold text-gray-800 mb-1">{value}</div>
            <p className="text-gray-500 text-xs">{subtitle}</p>
          </div>
          <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center group-hover:bg-indigo-50 transition-colors duration-300">
            {iconComponent}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div 
      className="min-h-screen bg-gray-50/50 p-8"
      style={{
        fontFamily: 'system-ui, -apple-system, "Segoe UI", "Noto Sans Arabic", Arial, sans-serif'
      }}
    >
      {/* العنوان والمقدمة */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">إدارة الأخبار</h1>
            <p className="text-gray-600">إدارة ومراقبة محتوى الأخبار والمقالات الصحفية</p>
          </div>
          <div className="flex items-center space-x-4">
            <button className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-medium shadow-lg hover:bg-indigo-700 transition-all duration-200 flex items-center gap-2 hover:shadow-xl">
              <Edit className="w-4 h-4" />
              خبر جديد
            </button>
            <div className="flex items-center space-x-2 bg-gray-50 px-4 py-2.5 rounded-xl border border-gray-200">
              <Calendar className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-600">اليوم</span>
            </div>
          </div>
        </div>
      </div>

      {/* بطاقات الإحصائيات */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
        <StatsCard
          title="إجمالي الأخبار"
          value="245"
          subtitle="جميع المواضيع"
          iconComponent={<MessageSquare className="w-6 h-6 text-blue-600" />}
        />
        <StatsCard
          title="المنشورة"
          value="189"
          subtitle="متاحة للقراء"
          iconComponent={<TrendingUp className="w-6 h-6 text-green-600" />}
        />
        <StatsCard
          title="المسودات"
          value="32"
          subtitle="قيد التحرير"  
          iconComponent={<Edit className="w-6 h-6 text-yellow-600" />}
        />
        <StatsCard
          title="إجمالي المشاهدات"
          value="1.2M"
          subtitle="آخر 30 يوم"
          iconComponent={<Eye className="w-6 h-6 text-purple-600" />}
        />
        <StatsCard
          title="الكتّاب النشطون"
          value="12"
          subtitle="آخر 7 أيام"
          iconComponent={<Users className="w-6 h-6 text-cyan-600" />}
        />
        <StatsCard
          title="متوسط التقييم"
          value="4.6"
          subtitle="من 5 نجوم"
          iconComponent={<Award className="w-6 h-6 text-orange-600" />}
        />
      </div>

      {/* تبويبات راقية وهادئة */}
      <div className="mb-8">
        <div className="flex gap-2 p-1 bg-gray-50 rounded-2xl border border-gray-200/50">
          {statusTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`group relative flex items-center gap-3 px-5 py-3 rounded-xl transition-all duration-300 min-w-0 flex-1 ${
                activeTab === tab.id
                  ? 'bg-white shadow-md text-gray-800'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100/50'
              }`}
            >
              {/* الأيقونة */}
              <div className={`flex-shrink-0 transition-colors duration-300 ${
                activeTab === tab.id 
                  ? 'text-indigo-600' 
                  : 'text-gray-400 group-hover:text-gray-600'
              }`}>
                {tab.icon}
              </div>
              
              {/* محتوى التاب */}
              <div className="flex flex-col items-start min-w-0 flex-1">
                <span className={`text-sm font-medium truncate transition-colors duration-300 ${
                  activeTab === tab.id 
                    ? 'text-gray-900' 
                    : 'text-gray-700 group-hover:text-gray-900'
                }`}>
                  {tab.name}
                </span>
                
                {/* العداد */}
                <span className={`text-xs font-semibold transition-colors duration-300 ${
                  activeTab === tab.id 
                    ? 'text-indigo-600' 
                    : 'text-gray-500 group-hover:text-gray-700'
                }`}>
                  {tab.count} عنصر
                </span>
              </div>
              
              {/* مؤشر النشاط */}
              {activeTab === tab.id && (
                <div className="absolute bottom-0 left-3 right-3 h-0.5 bg-indigo-600 rounded-full"></div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* جدول إدارة الأخبار */}
      <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">

        {/* شريط البحث والفلاتر */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            <div className="flex items-center space-x-4 w-full lg:w-auto">
              <div className="relative flex-1 lg:w-96">
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="البحث بالعنوان أو معرف المقال..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pr-10 pl-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                />
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <select 
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
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
                className="px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
              >
                <option value="all">جميع الحالات</option>
                <option value="published">منشور</option>
                <option value="draft">مسودة</option>
                <option value="pending">في الانتظار</option>
              </select>
              
              <button className="p-2.5 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors duration-200">
                <Filter className="w-4 h-4 text-gray-500" />
              </button>
            </div>
          </div>
        </div>

        {/* رأس الجدول */}
        <div className="bg-gradient-to-r from-gray-50 to-gray-100/50 border-b border-gray-200/60">
          <div className="grid grid-cols-12 gap-4 px-6 py-4 text-sm font-semibold text-gray-700">
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

        {/* بيانات الجدول */}
        <div className="divide-y divide-gray-100">
          {mockNewsData.map((news, index) => (
            <div 
              key={news.id} 
              className={`grid grid-cols-12 gap-4 px-6 py-4 text-sm hover:bg-gray-50 transition-colors duration-200 ${
                news.isBreaking ? 'bg-red-50 border-r-4 border-red-500' : 
                news.isPinned ? 'bg-blue-50 border-r-4 border-blue-500' : ''
              }`}
            >
              {/* العنوان */}
              <div className="col-span-3">
                <div className="flex items-start space-x-2">
                  <div className="flex-1">
                    <button className="text-blue-600 hover:text-blue-800 font-medium text-right leading-tight">
                      {news.title}
                    </button>
                    <div className="flex items-center mt-1 space-x-2">
                      <span className="text-xs text-gray-500">#{news.id}</span>
                      {news.isPinned && (
                        <span className="text-blue-500 text-xs bg-blue-100 px-2 py-1 rounded-full">
                          مثبت
                        </span>
                      )}
                      {news.isBreaking && (
                        <span className="text-red-500 text-xs bg-red-100 px-2 py-1 rounded-full flex items-center">
                          <Zap className="w-3 h-3 mr-1" />
                          عاجل
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* الكاتب */}
              <div className="font-medium text-gray-900">
                {news.author}
              </div>

              {/* التصنيف */}
              <div className="text-gray-600 text-xs">
                {news.category}
              </div>

              {/* وقت النشر */}
              <div className="text-gray-500 text-xs">
                {news.publishTime || '-'}
              </div>

              {/* المشاهدات */}
              <div className="flex items-center">
                <Eye className="w-4 h-4 text-gray-400 ml-1" />
                <span className="text-gray-700 font-medium">
                  {news.viewCount.toLocaleString()}
                </span>
              </div>

              {/* آخر تعديل */}
              <div className="text-xs text-gray-500">
                <div>{news.lastModified}</div>
                <div className="text-gray-400">بواسطة {news.lastModifiedBy}</div>
              </div>

              {/* التقييم */}
              <div className="flex items-center">
                {news.status === 'published' ? (
                  <div className="flex items-center space-x-1">
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
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(news.status).color}`}>
                  {getStatusBadge(news.status).text}
                </span>
              </div>

              {/* العمليات */}
              <div className="flex items-center space-x-1">
                <button className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors duration-200">
                  <Edit className="w-4 h-4" />
                </button>
                <button className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors duration-200">
                  <Trash2 className="w-4 h-4" />
                </button>
                <button className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors duration-200">
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

        {/* تذييل الجدول */}
        <div className="px-6 py-4 bg-gray-50/50 border-t border-gray-100">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700">
              عرض 1-5 من {mockNewsData.length} خبر
            </div>
            <div className="flex items-center space-x-2">
              <button className="px-4 py-2 border border-gray-200 rounded-lg text-sm hover:bg-gray-50 transition-colors duration-200">
                السابق
              </button>
              <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm shadow-sm">
                1
              </button>
              <button className="px-4 py-2 border border-gray-200 rounded-lg text-sm hover:bg-gray-50 transition-colors duration-200">
                2
              </button>
              <button className="px-4 py-2 border border-gray-200 rounded-lg text-sm hover:bg-gray-50 transition-colors duration-200">
                التالي
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 