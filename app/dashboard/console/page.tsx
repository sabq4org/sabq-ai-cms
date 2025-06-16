'use client';

import React, { useState, useEffect } from 'react';
import { 
  Activity,
  Users,
  FileText,
  AlertTriangle,
  Brain,
  Eye,
  Clock,
  TrendingUp,
  Search,
  Filter,
  Download,
  RefreshCw,
  Bell,
  Shield,
  Zap,
  BarChart3,
  Calendar,
  User,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Settings,
  Globe,
  MessageSquare,
  Hash,
  Play,
  Pause,
  MoreHorizontal,
  ChevronDown,
  ArrowUp,
  ArrowDown,
  Monitor,
  Server,
  Wifi,
  Database,
  Target,
  Flame
} from 'lucide-react';

interface ActivityLog {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  target: string;
  details: string;
  type: 'create' | 'edit' | 'delete' | 'publish' | 'login' | 'ai' | 'system';
  status: 'success' | 'warning' | 'error';
  ip?: string;
  location?: string;
}

interface AIInteraction {
  id: string;
  timestamp: string;
  user: string;
  type: 'title' | 'summary' | 'tags' | 'content' | 'seo';
  input: string;
  output: string;
  accepted: boolean;
  rating?: number;
}

interface SystemAlert {
  id: string;
  timestamp: string;
  level: 'info' | 'warning' | 'error' | 'critical';
  title: string;
  message: string;
  resolved: boolean;
}

export default function ConsolePage() {
  const [activeTab, setActiveTab] = useState('activities');
  const [darkMode, setDarkMode] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [isLive, setIsLive] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);

  // استرجاع حالة الوضع الليلي
  useEffect(() => {
    const savedDarkMode = localStorage.getItem('darkMode');
    if (savedDarkMode !== null) {
      setDarkMode(JSON.parse(savedDarkMode));
    }
  }, []);

  // بيانات تجريبية للنشاطات
  const mockActivityLogs: ActivityLog[] = [
    {
      id: '1',
      timestamp: '2024-06-15T14:32:15Z',
      user: 'عبدالله العتيبي',
      action: 'تعديل العنوان',
      target: 'مقال #185',
      details: 'تم تعديل العنوان من "خبر عاجل" إلى "المملكة تعلن عن مشروع جديد"',
      type: 'edit',
      status: 'success',
      ip: '192.168.1.100',
      location: 'الرياض'
    },
    {
      id: '2',
      timestamp: '2024-06-15T14:28:45Z',
      user: 'سعد التميمي',
      action: 'نشر خبر عاجل',
      target: 'مقال #186',
      details: 'تم نشر خبر عاجل عن الاقتصاد السعودي',
      type: 'publish',
      status: 'success',
      ip: '192.168.1.101',
      location: 'جدة'
    },
    {
      id: '3',
      timestamp: '2024-06-15T14:25:12Z',
      user: 'نظام الذكاء الاصطناعي',
      action: 'توليد عنوان',
      target: 'مقال #187',
      details: 'تم توليد 3 عناوين بديلة للمقال',
      type: 'ai',
      status: 'success'
    },
    {
      id: '4',
      timestamp: '2024-06-15T14:20:33Z',
      user: 'أحمد الحربي',
      action: 'رفض مقال',
      target: 'مقال #322',
      details: 'تم رفض المقال بسبب مخالفة المعايير التحريرية',
      type: 'delete',
      status: 'warning',
      ip: '192.168.1.102',
      location: 'الدمام'
    },
    {
      id: '5',
      timestamp: '2024-06-15T14:15:07Z',
      user: 'مريم القحطاني',
      action: 'تسجيل دخول',
      target: 'النظام',
      details: 'تم تسجيل الدخول بنجاح',
      type: 'login',
      status: 'success',
      ip: '192.168.1.103',
      location: 'مكة'
    }
  ];

  // بيانات تجريبية لتفاعلات الذكاء الاصطناعي
  const mockAIInteractions: AIInteraction[] = [
    {
      id: '1',
      timestamp: '2024-06-15T14:25:12Z',
      user: 'عبدالله العتيبي',
      type: 'title',
      input: 'مشروع جديد في المملكة',
      output: 'المملكة تطلق مشروعاً استراتيجياً بقيمة 50 مليار ريال',
      accepted: true,
      rating: 5
    },
    {
      id: '2',
      timestamp: '2024-06-15T14:20:33Z',
      user: 'سعد التميمي',
      type: 'summary',
      input: 'نص طويل عن الاقتصاد...',
      output: 'ملخص: الاقتصاد السعودي يشهد نمواً متواصلاً...',
      accepted: true,
      rating: 4
    },
    {
      id: '3',
      timestamp: '2024-06-15T14:18:15Z',
      user: 'أحمد الحربي',
      type: 'tags',
      input: 'مقال عن التكنولوجيا والذكاء الاصطناعي',
      output: 'تكنولوجيا، ذكاء اصطناعي، ابتكار، السعودية',
      accepted: false,
      rating: 2
    }
  ];

  // بيانات تجريبية للتنبيهات
  const mockAlerts: SystemAlert[] = [
    {
      id: '1',
      timestamp: '2024-06-15T14:30:00Z',
      level: 'warning',
      title: 'انخفاض في معدل النشر',
      message: 'تم نشر مقالين فقط في آخر ساعتين',
      resolved: false
    },
    {
      id: '2',
      timestamp: '2024-06-15T13:45:00Z',
      level: 'error',
      title: 'خطأ في API الذكاء الاصطناعي',
      message: 'فشل في الاتصال بخدمة توليد العناوين',
      resolved: true
    },
    {
      id: '3',
      timestamp: '2024-06-15T13:20:00Z',
      level: 'info',
      title: 'تحديث النظام',
      message: 'تم تحديث النظام إلى الإصدار 2.1.0',
      resolved: true
    }
  ];

  // مكون بطاقة الإحصائية الدائرية
  const CircularStatsCard = ({ 
    title, 
    value, 
    subtitle, 
    icon: Icon, 
    bgColor,
    iconColor
  }: {
    title: string;
    value: string;
    subtitle: string;
    icon: any;
    bgColor: string;
    iconColor: string;
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
            }`}>{value}</span>
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
      { id: 'activities', name: 'سجل النشاطات', icon: Activity },
      { id: 'users', name: 'حركة المستخدمين', icon: Users },
      { id: 'content', name: 'مراقبة المحتوى', icon: FileText },
      { id: 'ai', name: 'تفاعلات الذكاء الاصطناعي', icon: Brain },
      { id: 'alerts', name: 'تنبيهات النظام', icon: AlertTriangle },
      { id: 'analytics', name: 'التحليلات المتقدمة', icon: TrendingUp }
    ];

    return (
      <div className={`rounded-2xl p-2 shadow-sm border mb-8 w-full transition-colors duration-300 ${
        darkMode 
          ? 'bg-gray-800 border-gray-700' 
          : 'bg-white border-gray-100'
      }`}>
        <div className="flex gap-2 justify-start pr-8 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
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

  // مكون شريط الأدوات
  const ToolBar = () => (
    <div className={`rounded-2xl p-4 shadow-sm border mb-8 transition-colors duration-300 ${
      darkMode 
        ? 'bg-gray-800 border-gray-700' 
        : 'bg-white border-gray-100'
    }`}>
      <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
        <div className="flex items-center space-x-4 w-full lg:w-auto">
          <div className="relative flex-1 lg:w-96">
            <Search className={`absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 transition-colors duration-300 ${
              darkMode ? 'text-gray-500' : 'text-gray-400'
            }`} />
            <input
              type="text"
              placeholder="البحث في السجلات..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full px-4 py-2 pr-10 text-sm rounded-lg border transition-colors duration-300 ${
                darkMode 
                  ? 'bg-gray-700 border-gray-600 text-gray-200 placeholder-gray-400 focus:border-blue-500' 
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500'
              } focus:outline-none focus:ring-1 focus:ring-blue-500`}
            />
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <select 
            value={selectedFilter}
            onChange={(e) => setSelectedFilter(e.target.value)}
            className={`px-4 py-2 text-sm rounded-lg border transition-colors duration-300 ${
              darkMode 
                ? 'bg-gray-700 border-gray-600 text-gray-200 focus:border-blue-500' 
                : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
            } focus:outline-none focus:ring-1 focus:ring-blue-500`}
          >
            <option value="all">جميع الأنشطة</option>
            <option value="create">إنشاء</option>
            <option value="edit">تعديل</option>
            <option value="delete">حذف</option>
            <option value="publish">نشر</option>
            <option value="login">تسجيل دخول</option>
            <option value="ai">ذكاء اصطناعي</option>
            <option value="system">نظام</option>
          </select>
          
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`p-2 rounded-lg transition-colors duration-300 ${
              autoRefresh
                ? 'bg-green-500 text-white'
                : darkMode 
                  ? 'text-gray-400 hover:bg-gray-700' 
                  : 'text-gray-600 hover:bg-gray-50'
            }`}
            title={autoRefresh ? 'إيقاف التحديث التلقائي' : 'تفعيل التحديث التلقائي'}
          >
            {autoRefresh ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </button>
          
          <button
            className={`p-2 rounded-lg transition-colors duration-300 ${
              darkMode 
                ? 'text-gray-400 hover:bg-gray-700' 
                : 'text-gray-600 hover:bg-gray-50'
            }`}
            title="تحديث البيانات"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          
          <button
            className={`p-2 rounded-lg transition-colors duration-300 ${
              darkMode 
                ? 'text-gray-400 hover:bg-gray-700' 
                : 'text-gray-600 hover:bg-gray-50'
            }`}
            title="تصدير البيانات"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );

  // مكون عنصر في سجل النشاطات
  const ActivityLogItem = ({ log }: { log: ActivityLog }) => {
    const getStatusColor = (status: string) => {
      switch (status) {
        case 'success': return 'text-green-500';
        case 'warning': return 'text-yellow-500';
        case 'error': return 'text-red-500';
        default: return darkMode ? 'text-gray-400' : 'text-gray-500';
      }
    };

    const getTypeIcon = (type: string) => {
      switch (type) {
        case 'create': return <FileText className="w-4 h-4" />;
        case 'edit': return <Edit className="w-4 h-4" />;
        case 'delete': return <Trash2 className="w-4 h-4" />;
        case 'publish': return <Globe className="w-4 h-4" />;
        case 'login': return <User className="w-4 h-4" />;
        case 'ai': return <Brain className="w-4 h-4" />;
        case 'system': return <Settings className="w-4 h-4" />;
        default: return <Activity className="w-4 h-4" />;
      }
    };

    return (
      <tr className={`transition-colors duration-200 hover:bg-gray-50 border-b ${
        darkMode ? 'border-gray-700 hover:bg-gray-700' : 'border-gray-100 hover:bg-gray-50'
      }`}>
        <td className="px-6 py-4">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${getStatusColor(log.status)} bg-opacity-10`}>
              {getTypeIcon(log.type)}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className={`font-semibold transition-colors duration-300 ${
                  darkMode ? 'text-white' : 'text-gray-900'
                }`}>{log.user}</span>
                <span className={`text-sm transition-colors duration-300 ${
                  darkMode ? 'text-gray-400' : 'text-gray-500'
                }`}>{log.action}</span>
              </div>
              <p className={`text-sm transition-colors duration-300 ${
                darkMode ? 'text-gray-300' : 'text-gray-600'
              }`}>{log.details}</p>
            </div>
        </div>
        </td>
        <td className={`px-6 py-4 font-medium transition-colors duration-300 ${
          darkMode ? 'text-blue-400' : 'text-blue-600'
        }`}>
          {log.target}
        </td>
        <td className={`px-6 py-4 text-sm transition-colors duration-300 ${
          darkMode ? 'text-gray-400' : 'text-gray-500'
        }`}>
          {new Date(log.timestamp).toLocaleString('ar-SA')}
        </td>
        <td className="px-6 py-4">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            log.status === 'success' 
              ? 'bg-green-100 text-green-800' 
              : log.status === 'warning'
                ? 'bg-yellow-100 text-yellow-800'
                : 'bg-red-100 text-red-800'
          }`}>
            {log.status === 'success' ? 'نجح' : log.status === 'warning' ? 'تحذير' : 'خطأ'}
          </span>
        </td>
        <td className={`px-6 py-4 text-sm transition-colors duration-300 ${
          darkMode ? 'text-gray-400' : 'text-gray-500'
        }`}>
          {log.location}
        </td>
      </tr>
    );
  };

  // مكون التنبيه
  const AlertItem = ({ alert }: { alert: SystemAlert }) => {
    const getLevelColor = (level: string) => {
      switch (level) {
        case 'info': return 'bg-blue-100 text-blue-800';
        case 'warning': return 'bg-yellow-100 text-yellow-800';
        case 'error': return 'bg-red-100 text-red-800';
        case 'critical': return 'bg-purple-100 text-purple-800';
        default: return 'bg-gray-100 text-gray-800';
      }
    };

    return (
      <tr className={`transition-colors duration-200 hover:bg-gray-50 border-b ${
        darkMode ? 'border-gray-700 hover:bg-gray-700' : 'border-gray-100 hover:bg-gray-50'
      }`}>
        <td className="px-6 py-4">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getLevelColor(alert.level)}`}>
            {alert.level === 'info' ? 'معلومة' : alert.level === 'warning' ? 'تحذير' : alert.level === 'error' ? 'خطأ' : 'حرج'}
          </span>
        </td>
        <td className={`px-6 py-4 font-medium transition-colors duration-300 ${
          darkMode ? 'text-white' : 'text-gray-900'
        }`}>
          {alert.title}
        </td>
        <td className={`px-6 py-4 transition-colors duration-300 ${
          darkMode ? 'text-gray-300' : 'text-gray-600'
        }`}>
          {alert.message}
        </td>
        <td className={`px-6 py-4 text-sm transition-colors duration-300 ${
          darkMode ? 'text-gray-400' : 'text-gray-500'
        }`}>
          {new Date(alert.timestamp).toLocaleString('ar-SA')}
        </td>
        <td className="px-6 py-4">
          {alert.resolved ? (
            <CheckCircle className="w-5 h-5 text-green-500" />
          ) : (
            <XCircle className="w-5 h-5 text-red-500" />
          )}
        </td>
      </tr>
    );
  };

  // عرض محتوى التبويب
  const renderTabContent = () => {
    switch (activeTab) {
      case 'activities':
        return (
          <div className={`rounded-2xl shadow-sm border overflow-hidden transition-colors duration-300 ${
            darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'
          }`}>
            {/* شريط البحث والفلاتر */}
            <ToolBar />
            
            {/* جدول البيانات */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className={`transition-colors duration-300 ${
                  darkMode ? 'bg-gray-700' : 'bg-gray-50'
                }`}>
                  <tr>
                    <th className={`px-6 py-4 text-right text-sm font-medium transition-colors duration-300 ${
                      darkMode ? 'text-gray-200' : 'text-gray-700'
                    }`}>النشاط</th>
                    <th className={`px-6 py-4 text-right text-sm font-medium transition-colors duration-300 ${
                      darkMode ? 'text-gray-200' : 'text-gray-700'
                    }`}>الهدف</th>
                    <th className={`px-6 py-4 text-right text-sm font-medium transition-colors duration-300 ${
                      darkMode ? 'text-gray-200' : 'text-gray-700'
                    }`}>الوقت</th>
                    <th className={`px-6 py-4 text-right text-sm font-medium transition-colors duration-300 ${
                      darkMode ? 'text-gray-200' : 'text-gray-700'
                    }`}>الحالة</th>
                    <th className={`px-6 py-4 text-right text-sm font-medium transition-colors duration-300 ${
                      darkMode ? 'text-gray-200' : 'text-gray-700'
                    }`}>الموقع</th>
                  </tr>
                </thead>
                <tbody>
                  {mockActivityLogs.map((log) => (
                    <ActivityLogItem key={log.id} log={log} />
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );

      case 'ai':
        return (
          <div className={`rounded-2xl shadow-sm border transition-colors duration-300 ${
            darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'
          }`}>
            <div className="p-6">
              <h3 className={`text-lg font-bold mb-6 transition-colors duration-300 ${
                darkMode ? 'text-white' : 'text-gray-800'
              }`}>🤖 تفاعلات الذكاء الاصطناعي</h3>
              <div className="space-y-4">
                {mockAIInteractions.map((interaction) => (
                  <div key={interaction.id} className={`p-4 rounded-xl border transition-colors duration-200 ${
                    darkMode 
                      ? 'bg-gray-700 border-gray-600' 
                      : 'bg-white border-gray-200'
                  }`}>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Brain className="w-4 h-4 text-purple-500" />
                          <span className={`font-semibold transition-colors duration-300 ${
                            darkMode ? 'text-white' : 'text-gray-900'
                          }`}>{interaction.user}</span>
                          <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs">
                            {interaction.type}
                          </span>
                        </div>
                        <p className={`text-sm mb-2 transition-colors duration-300 ${
                          darkMode ? 'text-gray-300' : 'text-gray-600'
                        }`}>
                          <strong>المدخل:</strong> {interaction.input}
                        </p>
                        <p className={`text-sm mb-2 transition-colors duration-300 ${
                          darkMode ? 'text-gray-300' : 'text-gray-600'
                        }`}>
                          <strong>المخرج:</strong> {interaction.output}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span>{new Date(interaction.timestamp).toLocaleString('ar-SA')}</span>
                          <span className={interaction.accepted ? 'text-green-500' : 'text-red-500'}>
                            {interaction.accepted ? '✅ مقبول' : '❌ مرفوض'}
                          </span>
                          {interaction.rating && (
                            <span>⭐ {interaction.rating}/5</span>
                          )}
                        </div>
          </div>
        </div>
                </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'alerts':
        return (
          <div className={`rounded-2xl shadow-sm border overflow-hidden transition-colors duration-300 ${
            darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'
          }`}>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className={`transition-colors duration-300 ${
                  darkMode ? 'bg-gray-700' : 'bg-gray-50'
                }`}>
                  <tr>
                    <th className={`px-6 py-4 text-right text-sm font-medium transition-colors duration-300 ${
                      darkMode ? 'text-gray-200' : 'text-gray-700'
                    }`}>المستوى</th>
                    <th className={`px-6 py-4 text-right text-sm font-medium transition-colors duration-300 ${
                      darkMode ? 'text-gray-200' : 'text-gray-700'
                    }`}>العنوان</th>
                    <th className={`px-6 py-4 text-right text-sm font-medium transition-colors duration-300 ${
                      darkMode ? 'text-gray-200' : 'text-gray-700'
                    }`}>الرسالة</th>
                    <th className={`px-6 py-4 text-right text-sm font-medium transition-colors duration-300 ${
                      darkMode ? 'text-gray-200' : 'text-gray-700'
                    }`}>الوقت</th>
                    <th className={`px-6 py-4 text-right text-sm font-medium transition-colors duration-300 ${
                      darkMode ? 'text-gray-200' : 'text-gray-700'
                    }`}>الحالة</th>
                  </tr>
                </thead>
                <tbody>
                  {mockAlerts.map((alert) => (
                    <AlertItem key={alert.id} alert={alert} />
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );

      default:
        return (
          <div className={`rounded-2xl shadow-sm border transition-colors duration-300 ${
            darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'
          }`}>
            <div className="p-6">
              <h3 className={`text-lg font-bold mb-6 transition-colors duration-300 ${
                darkMode ? 'text-white' : 'text-gray-800'
              }`}>🚧 قيد التطوير</h3>
              <p className={`text-center py-8 transition-colors duration-300 ${
                darkMode ? 'text-gray-400' : 'text-gray-500'
              }`}>
                هذا القسم قيد التطوير وسيكون متاحاً قريباً
              </p>
        </div>
      </div>
    );
    }
  };

  return (
    <div className={`p-8 transition-colors duration-300 ${
      darkMode ? 'bg-gray-900' : ''
    }`}>
            {/* عنوان وتعريف الصفحة */}
      <div className="mb-8">
        <h1 className={`text-3xl font-bold mb-2 transition-colors duration-300 ${
          darkMode ? 'text-white' : 'text-gray-800'
        }`}>وحدة التحكم</h1>
        <p className={`transition-colors duration-300 ${
          darkMode ? 'text-gray-300' : 'text-gray-600'
        }`}>مراقبة وتحليل شامل لجميع أنشطة منصة صحيفة سبق الإلكترونية</p>
      </div>

      {/* مؤشرات الأداء اللحظي */}
      <div className="grid grid-cols-6 gap-6 mb-8">
        <CircularStatsCard
          title="المستخدمون الآن"
          value="47"
          subtitle="نشط"
          icon={Users}
          bgColor="bg-green-100"
          iconColor="text-green-600"
        />
        <CircularStatsCard
          title="المقالات اليوم"
          value="24"
          subtitle="منشور"
          icon={FileText}
          bgColor="bg-blue-100"
          iconColor="text-blue-600"
        />
        <CircularStatsCard
          title="طلبات الذكاء الاصطناعي"
          value="156"
          subtitle="طلب"
          icon={Brain}
          bgColor="bg-purple-100"
          iconColor="text-purple-600"
        />
        <CircularStatsCard
          title="التنبيهات النشطة"
          value="3"
          subtitle="تنبيه"
          icon={AlertTriangle}
          bgColor="bg-yellow-100"
          iconColor="text-yellow-600"
        />
        <CircularStatsCard
          title="معدل الاستجابة"
          value="2.3"
          subtitle="ثانية"
          icon={Zap}
          bgColor="bg-cyan-100"
          iconColor="text-cyan-600"
        />
        <CircularStatsCard
          title="المشاهدات اليوم"
          value="52.4K"
          subtitle="مشاهدة"
          icon={Eye}
          bgColor="bg-orange-100"
          iconColor="text-orange-600"
        />
      </div>

      {/* التبويبات */}
        <NavigationTabs />

      {/* محتوى التبويبات */}
      {renderTabContent()}
    </div>
  );
} 