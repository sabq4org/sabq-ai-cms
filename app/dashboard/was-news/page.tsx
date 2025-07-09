"use client";

import React, { useState, useEffect } from 'react';
import { 
  RefreshCw, 
  Download, 
  Eye, 
  FileText, 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  Newspaper, 
  Wifi, 
  WifiOff, 
  Loader2,
  Activity,
  BarChart3,
  Target,
  Zap,
  X,
  Settings,
  Database,
  TrendingUp
} from 'lucide-react';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import toast from 'react-hot-toast';
import { useDarkModeContext } from '@/contexts/DarkModeContext';

interface WasNews {
  id: string;
  news_NUM: number;
  news_DT: string;
  title_TXT: string;
  story_TXT: string;
  news_priority_CD: number;
  is_Report: boolean;
  is_imported: boolean;
  media?: any;
  keywords?: any;
  created_at: string;
}

interface Basket {
  news_basket_CD: number;
  news_basket_TXT: string;
  news_basket_TXT_AR: string;
}

interface ApiLog {
  id: string;
  timestamp: Date;
  duration: number | null;
  status: "success" | "error";
  error?: string;
  newsCount?: number;
  responseSize?: number;
}

export default function WasNewsPage() {
  const { darkMode } = useDarkModeContext();
  const [activeTab, setActiveTab] = useState('monitor');
  const [loading, setLoading] = useState(false);
  const [fetchingNew, setFetchingNew] = useState(false);
  const [savedNews, setSavedNews] = useState<WasNews[]>([]);
  const [baskets, setBaskets] = useState<Basket[]>([]);
  const [selectedBasket, setSelectedBasket] = useState<number | null>(null);
  const [selectedNews, setSelectedNews] = useState<WasNews | null>(null);
  const [importingId, setImportingId] = useState<string | null>(null);
  
  // حالات مراقبة API
  const [status, setStatus] = useState<null | "idle" | "connecting" | "sending" | "waiting" | "receiving" | "success" | "error">(null);
  const [start, setStart] = useState<Date | null>(null);
  const [end, setEnd] = useState<Date | null>(null);
  const [duration, setDuration] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [apiResult, setApiResult] = useState<any>(null);
  const [logs, setLogs] = useState<ApiLog[]>([]);
  const [retryCount, setRetryCount] = useState(0);

  // جلب الأخبار المحفوظة
  const fetchSavedNews = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/was-news?action=saved');
      const data = await res.json();
      if (data.success) {
        setSavedNews(data.data);
      } else {
        toast.error(data.error || 'فشل جلب الأخبار');
      }
    } catch (error) {
      toast.error('حدث خطأ في جلب الأخبار');
    } finally {
      setLoading(false);
    }
  };

  // جلب السلال المتاحة
  const fetchBaskets = async () => {
    try {
      const res = await fetch('/api/was-news?action=baskets');
      const data = await res.json();
      if (data.success) {
        setBaskets(data.baskets);
        if (data.baskets.length > 0 && !selectedBasket) {
          setSelectedBasket(data.baskets[0].news_basket_CD);
        }
      }
    } catch (error) {
      console.error('Error fetching baskets:', error);
    }
  };

  // مراقبة جلب أخبار جديدة من واس
  const fetchNewsWithMonitoring = async () => {
    const startTime = new Date();
    setStatus("connecting");
    setStart(startTime);
    setError(null);
    setApiResult(null);
    setEnd(null);
    setDuration(null);
    setFetchingNew(true);

    try {
      // محاكاة مراحل الاتصال
      setTimeout(() => setStatus("sending"), 100);
      
      const url = selectedBasket 
        ? `/api/was-news?basket_id=${selectedBasket}`
        : '/api/was-news';
      
      const res = await fetch(url);
      
      setStatus("waiting");
      
      const responseText = await res.text();
      const responseSize = new TextEncoder().encode(responseText).length;
      
      setStatus("receiving");
      
      const data = JSON.parse(responseText);
      const endTime = new Date();
      const elapsedTime = endTime.getTime() - startTime.getTime();
      
      setEnd(endTime);
      setDuration(elapsedTime);
      
      if (data.success) {
        setStatus("success");
        setApiResult(data);
        
        // إضافة إلى السجل
        const newLog: ApiLog = {
          id: Date.now().toString(),
          timestamp: startTime,
          duration: elapsedTime,
          status: "success",
          newsCount: data.data ? 1 : 0,
          responseSize: responseSize
        };
        setLogs(prev => [newLog, ...prev.slice(0, 19)]);
        
        if (data.data) {
          toast.success('تم جلب خبر جديد!');
          fetchSavedNews(); // تحديث القائمة
        } else {
          toast(data.message || 'لا توجد أخبار جديدة', {
            icon: '📰',
          });
        }
      } else {
        setStatus("error");
        setError(data.error || `خطأ HTTP: ${res.status}`);
        
        // إضافة إلى السجل
        const newLog: ApiLog = {
          id: Date.now().toString(),
          timestamp: startTime,
          duration: elapsedTime,
          status: "error",
          error: data.error || `خطأ HTTP: ${res.status}`
        };
        setLogs(prev => [newLog, ...prev.slice(0, 19)]);
        
        toast.error(data.error || 'فشل جلب الأخبار');
      }
    } catch (err: any) {
      const endTime = new Date();
      const elapsedTime = endTime.getTime() - startTime.getTime();
      
      setEnd(endTime);
      setDuration(elapsedTime);
      setStatus("error");
      setError(err.message || "حدث خطأ غير متوقع");
      
      // إضافة إلى السجل
      const newLog: ApiLog = {
        id: Date.now().toString(),
        timestamp: startTime,
        duration: elapsedTime,
        status: "error",
        error: err.message || "حدث خطأ غير متوقع"
      };
      setLogs(prev => [newLog, ...prev.slice(0, 19)]);
      
      toast.error('حدث خطأ في الاتصال بواس');
    } finally {
      setFetchingNew(false);
    }
  };

  // استيراد خبر إلى المقالات
  const importNews = async (newsId: string) => {
    setImportingId(newsId);
    try {
      const res = await fetch('/api/was-news', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newsId })
      });
      
      const data = await res.json();
      
      if (data.success) {
        toast.success('تم استيراد الخبر بنجاح!');
        fetchSavedNews(); // تحديث القائمة
      } else {
        toast.error(data.error || 'فشل استيراد الخبر');
      }
    } catch (error) {
      toast.error('حدث خطأ في استيراد الخبر');
    } finally {
      setImportingId(null);
    }
  };

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
    fetchNewsWithMonitoring();
  };

  useEffect(() => {
    fetchSavedNews();
    fetchBaskets();
  }, []);

  // مكونات التصميم
  const StatsCard = ({ 
    title, 
    value, 
    subtitle, 
    icon: Icon, 
    bgColor,
    iconColor
  }: {
    title: string;
    value: string | number;
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

  // أزرار التنقل
  const NavigationTabs = () => {
    const tabs = [
      { id: 'monitor', name: 'مراقبة الاتصال', icon: Activity, count: logs.length },
      { id: 'saved', name: 'الأخبار المحفوظة', icon: Database, count: savedNews.length },
      { id: 'fetch', name: 'جلب أخبار جديدة', icon: Download, count: baskets.length }
    ];

    return (
      <div className={`rounded-2xl p-4 shadow-sm border mb-8 w-full transition-colors duration-300 ${
        darkMode 
          ? 'bg-gray-800 border-gray-700' 
          : 'bg-white border-gray-100'
      }`}>
        <div className="flex gap-6 justify-start">
          {tabs.map((tab, index) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <div key={tab.id} className="flex-1">
                <button
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex flex-col items-center justify-center gap-3 py-6 px-6 rounded-xl font-medium text-sm transition-all duration-300 relative ${
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
                <span className="text-center">{tab.name}</span>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  isActive 
                    ? 'bg-white/20 text-white' 
                    : darkMode 
                      ? 'bg-gray-700 text-gray-300'
                      : 'bg-gray-100 text-gray-600'
                }`}>
                  {tab.count}
                </span>
              </button>
                </div>
            );
          })}
        </div>
      </div>
    );
  };

  const getStatusColor = () => {
    switch (status) {
      case "connecting":
      case "sending":
      case "waiting":
      case "receiving":
        return "text-blue-600";
      case "success":
        return "text-green-600";
      case "error":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case "connecting":
      case "sending":
      case "waiting":
      case "receiving":
        return <Loader2 className="inline-block w-4 h-4 animate-spin mr-2" />;
      case "success":
        return <CheckCircle className="inline-block w-4 h-4 mr-2" />;
      case "error":
        return <AlertCircle className="inline-block w-4 h-4 mr-2" />;
      default:
        return <Wifi className="inline-block w-4 h-4 mr-2" />;
    }
  };

  const getStatusText = () => {
    switch (status) {
      case null:
        return "في وضع الاستعداد";
      case "connecting":
        return "جارٍ الاتصال بالخادم...";
      case "sending":
        return "جارٍ إرسال الطلب...";
      case "waiting":
        return "بانتظار الاستجابة...";
      case "receiving":
        return "جارٍ استقبال البيانات...";
      case "success":
        return "تم الاستلام بنجاح";
      case "error":
        return "فشل الاتصال";
      default:
        return "غير معروف";
    }
  };

  const getPriorityBadge = (priority: number) => {
    switch(priority) {
      case 1:
        return <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800">عاجل</span>;
      case 2:
        return <span className="px-2 py-1 text-xs rounded-full bg-orange-100 text-orange-800">مهم</span>;
      default:
        return <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">عادي</span>;
    }
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      darkMode ? 'bg-gray-900' : 'bg-gray-50'
    }`}>
    <div className="container mx-auto p-6">
        {/* رأس الصفحة */}
      <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
              <Newspaper className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className={`text-3xl font-bold transition-colors duration-300 ${
                darkMode ? 'text-white' : 'text-gray-900'
              }`}>
                أخبار وكالة الأنباء السعودية (واس)
              </h1>
              <p className={`transition-colors duration-300 ${
                darkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>
                مراقبة وإدارة الأخبار من وكالة واس مع تتبع الأداء
              </p>
            </div>
          </div>

          {/* الإحصائيات الرئيسية */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatsCard
              title="إجمالي الأخبار"
              value={savedNews.length}
              subtitle="محفوظة"
              icon={Database}
              bgColor="bg-blue-100"
              iconColor="text-blue-600"
            />
            <StatsCard
              title="عمليات المراقبة"
              value={logs.length}
              subtitle="عملية"
              icon={Activity}
              bgColor="bg-green-100"
              iconColor="text-green-600"
            />
            <StatsCard
              title="متوسط الاستجابة"
              value={logs.length > 0 
                ? Math.round(logs.reduce((acc, log) => acc + (log.duration || 0), 0) / logs.length)
                : "--"
              }
              subtitle="مللي ثانية"
              icon={Zap}
              bgColor="bg-purple-100"
              iconColor="text-purple-600"
            />
            <StatsCard
              title="نسبة النجاح"
              value={logs.length > 0 
                ? Math.round((logs.filter(l => l.status === "success").length / logs.length) * 100)
                : "--"
              }
              subtitle="بالمئة"
              icon={Target}
              bgColor="bg-orange-100"
              iconColor="text-orange-600"
            />
          </div>
        </div>

        {/* أزرار التنقل */}
        <NavigationTabs />

        {/* محتوى التبويبات */}
        {activeTab === 'monitor' && (
          <div className="space-y-6">
            {/* لوحة المراقبة الرئيسية */}
            <div className={`rounded-2xl p-6 shadow-sm border transition-colors duration-300 ${
              darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'
            }`}>
              <div className="flex items-center justify-between mb-6">
                <h2 className={`text-xl font-bold transition-colors duration-300 ${
                  darkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  مراقبة الاتصال المباشر
                </h2>
                {retryCount > 0 && (
                  <span className={`text-sm transition-colors duration-300 ${
                    darkMode ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    عدد المحاولات: {retryCount}
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* زر الاتصال والحالة */}
                <div className="space-y-4">
                  <div className="flex gap-3">
                    <button
                      onClick={fetchNewsWithMonitoring}
                      className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center shadow-lg"
                      disabled={status === "connecting" || status === "sending" || status === "waiting" || status === "receiving"}
                    >
                      {(status === "connecting" || status === "sending" || status === "waiting" || status === "receiving") ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin mr-2" />
                          جارٍ المعالجة...
                        </>
                      ) : (
                        <>
                          <RefreshCw className="w-5 h-5 mr-2" />
                          سحب أخبار من واس
                        </>
                      )}
                    </button>
                    
                    {status === "error" && (
                      <button
                        onClick={handleRetry}
                        className="px-6 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:from-orange-600 hover:to-orange-700 transition-all duration-300 shadow-lg"
                      >
                        إعادة المحاولة
                      </button>
                    )}
                  </div>

                  {/* معلومات الحالة */}
                  <div className={`rounded-xl p-4 space-y-3 transition-colors duration-300 ${
                    darkMode ? 'bg-gray-700' : 'bg-gray-50'
                  }`}>
                    <div className="flex items-center">
                      <span className={`w-28 transition-colors duration-300 ${
                        darkMode ? 'text-gray-300' : 'text-gray-600'
                      }`}>الحالة:</span>
                      <span className={`font-bold ${getStatusColor()}`}>
                        {getStatusIcon()}
                        {getStatusText()}
                      </span>
                    </div>
                    
                    <div className="flex items-center">
                      <span className={`w-28 transition-colors duration-300 ${
                        darkMode ? 'text-gray-300' : 'text-gray-600'
                      }`}>وقت البدء:</span>
                      <span className="font-mono text-sm">
                        {start ? start.toLocaleTimeString('ar-SA') : "--:--:--"}
                      </span>
      </div>

                    <div className="flex items-center">
                      <span className={`w-28 transition-colors duration-300 ${
                        darkMode ? 'text-gray-300' : 'text-gray-600'
                      }`}>وقت الانتهاء:</span>
                      <span className="font-mono text-sm">
                        {end ? end.toLocaleTimeString('ar-SA') : "--:--:--"}
                      </span>
                    </div>
                    
                    <div className="flex items-center">
                      <span className={`w-28 transition-colors duration-300 ${
                        darkMode ? 'text-gray-300' : 'text-gray-600'
                      }`}>مدة الاستجابة:</span>
                      <span className="font-mono text-sm font-bold">
                        {duration ? (
                          <span className={duration < 1000 ? "text-green-600" : duration < 3000 ? "text-orange-600" : "text-red-600"}>
                            {duration}ms
                          </span>
                        ) : (
                          "--"
                        )}
                      </span>
                    </div>
                  </div>
                </div>

                {/* نتائج الاستجابة */}
                <div className="space-y-4">
                  {status === "success" && apiResult && (
                    <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                      <h3 className="text-green-800 font-bold mb-2">✅ تمت العملية بنجاح</h3>
                      <div className="space-y-1 text-sm">
                        {apiResult.data?.news_NUM && (
                          <p>رقم الخبر: <span className="font-bold">{apiResult.data.news_NUM}</span></p>
                        )}
                        {apiResult.data && (
                          <p>عدد الأخبار: <span className="font-bold">1</span></p>
                        )}
                        <p>حجم الاستجابة: <span className="font-bold">{(JSON.stringify(apiResult).length / 1024).toFixed(2)} KB</span></p>
                      </div>
                    </div>
                  )}

                  {status === "error" && error && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                      <h3 className="text-red-800 font-bold mb-2">❌ فشلت العملية</h3>
                      <p className="text-red-700 text-sm">{error}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* عرض البيانات الخام */}
              {apiResult && status === "success" && (
                <details className="mt-6">
                  <summary className={`cursor-pointer text-sm hover:text-blue-600 transition-colors duration-300 ${
                    darkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    عرض البيانات الخام (JSON)
                  </summary>
                  <pre className={`mt-2 p-4 rounded-xl overflow-x-auto text-xs transition-colors duration-300 ${
                    darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {JSON.stringify(apiResult, null, 2)}
                  </pre>
                </details>
              )}
            </div>

            {/* سجل العمليات */}
            {logs.length > 0 && (
              <div className={`rounded-2xl p-6 shadow-sm border transition-colors duration-300 ${
                darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'
              }`}>
                <h3 className={`text-xl font-bold mb-4 transition-colors duration-300 ${
                  darkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  📊 سجل العمليات
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className={`border-b transition-colors duration-300 ${
                        darkMode ? 'border-gray-700' : 'border-gray-200'
                      }`}>
                        <th className={`text-right pb-2 transition-colors duration-300 ${
                          darkMode ? 'text-gray-300' : 'text-gray-700'
                        }`}>الوقت</th>
                        <th className={`text-right pb-2 transition-colors duration-300 ${
                          darkMode ? 'text-gray-300' : 'text-gray-700'
                        }`}>الحالة</th>
                        <th className={`text-right pb-2 transition-colors duration-300 ${
                          darkMode ? 'text-gray-300' : 'text-gray-700'
                        }`}>المدة</th>
                        <th className={`text-right pb-2 transition-colors duration-300 ${
                          darkMode ? 'text-gray-300' : 'text-gray-700'
                        }`}>عدد الأخبار</th>
                        <th className={`text-right pb-2 transition-colors duration-300 ${
                          darkMode ? 'text-gray-300' : 'text-gray-700'
                        }`}>الحجم</th>
                        <th className={`text-right pb-2 transition-colors duration-300 ${
                          darkMode ? 'text-gray-300' : 'text-gray-700'
                        }`}>الخطأ</th>
                      </tr>
                    </thead>
                    <tbody>
                      {logs.map((log) => (
                        <tr key={log.id} className={`border-b hover:bg-opacity-50 transition-colors duration-300 ${
                          darkMode 
                            ? 'border-gray-700 hover:bg-gray-700' 
                            : 'border-gray-100 hover:bg-gray-50'
                        }`}>
                          <td className="py-2">{log.timestamp.toLocaleTimeString('ar-SA')}</td>
                          <td className="py-2">
                            {log.status === "success" ? (
                              <span className="text-green-600">✅ نجح</span>
                            ) : (
                              <span className="text-red-600">❌ فشل</span>
                            )}
                          </td>
                          <td className="py-2 font-mono">{log.duration}ms</td>
                          <td className="py-2">{log.newsCount || "--"}</td>
                          <td className="py-2">{log.responseSize ? `${(log.responseSize / 1024).toFixed(1)} KB` : "--"}</td>
                          <td className="py-2 text-red-600 text-xs">{log.error || "--"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'saved' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className={`text-xl font-semibold transition-colors duration-300 ${
                darkMode ? 'text-white' : 'text-gray-900'
              }`}>
                الأخبار المحفوظة ({savedNews.length})
              </h2>
              <button 
                onClick={fetchSavedNews} 
                disabled={loading}
                className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 transition-all duration-300 flex items-center gap-2"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                تحديث
              </button>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
          ) : savedNews.length === 0 ? (
              <div className={`rounded-2xl p-8 text-center transition-colors duration-300 ${
                darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'
              } border`}>
                <AlertCircle className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <h3 className={`text-lg font-medium mb-2 transition-colors duration-300 ${
                  darkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  لا توجد أخبار محفوظة
                </h3>
                <p className={`transition-colors duration-300 ${
                  darkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>
                قم بجلب أخبار جديدة من تبويب "جلب أخبار جديدة"
                </p>
              </div>
          ) : (
            <div className="grid gap-4">
              {savedNews.map((news) => (
                  <div key={news.id} className={`rounded-2xl p-6 shadow-sm border transition-all duration-300 hover:shadow-lg ${
                    darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'
                  }`}>
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <h3 className={`text-lg font-semibold mb-2 transition-colors duration-300 ${
                          darkMode ? 'text-white' : 'text-gray-900'
                        }`}>
                          {news.title_TXT}
                        </h3>
                        <div className={`flex gap-2 items-center text-sm transition-colors duration-300 ${
                          darkMode ? 'text-gray-400' : 'text-gray-600'
                        }`}>
                          <Clock className="h-4 w-4" />
                          {format(new Date(news.news_DT), 'PPpp', { locale: ar })}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {getPriorityBadge(news.news_priority_CD)}
                        {news.is_imported && (
                          <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                            مستورد
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <p className={`mb-4 line-clamp-3 transition-colors duration-300 ${
                      darkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      {news.story_TXT || 'لا يوجد محتوى'}
                    </p>
                    
                    <div className="flex gap-2">
                      <button
                        onClick={() => setSelectedNews(news)}
                        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-300 flex items-center gap-2"
                      >
                        <Eye className="h-4 w-4" />
                        عرض التفاصيل
                      </button>
                      
                      <button
                        onClick={() => importNews(news.id)}
                        disabled={news.is_imported || importingId === news.id}
                        className={`px-4 py-2 rounded-lg transition-colors duration-300 flex items-center gap-2 ${
                          news.is_imported 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-blue-600 text-white hover:bg-blue-700'
                        } disabled:opacity-50`}
                      >
                        {importingId === news.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <FileText className="h-4 w-4" />
                        )}
                        {news.is_imported ? 'تم الاستيراد' : 'استيراد كمقال'}
                      </button>
                    </div>
                  </div>
              ))}
            </div>
          )}
          </div>
        )}

        {activeTab === 'fetch' && (
          <div className={`rounded-2xl p-6 shadow-sm border transition-colors duration-300 ${
            darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'
          }`}>
            <div className="mb-6">
              <h2 className={`text-xl font-bold mb-2 transition-colors duration-300 ${
                darkMode ? 'text-white' : 'text-gray-900'
              }`}>
                جلب أخبار جديدة من واس
              </h2>
              <p className={`transition-colors duration-300 ${
                darkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>
                اختر السلة المطلوبة واضغط على زر الجلب لاستيراد آخر الأخبار
              </p>
            </div>

              {baskets.length > 0 && (
                <div className="mb-6">
                <label className={`block text-sm font-medium mb-2 transition-colors duration-300 ${
                  darkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  اختر السلة:
                </label>
                  <select
                  className={`w-full p-3 border rounded-xl transition-colors duration-300 ${
                    darkMode 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                    value={selectedBasket || ''}
                    onChange={(e) => setSelectedBasket(Number(e.target.value))}
                  >
                    {baskets.map((basket) => (
                      <option key={basket.news_basket_CD} value={basket.news_basket_CD}>
                        {basket.news_basket_TXT_AR || basket.news_basket_TXT}
                      </option>
                    ))}
                  </select>
                </div>
              )}

            <button
              onClick={fetchNewsWithMonitoring}
                disabled={fetchingNew}
              className="w-full px-6 py-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 transition-all duration-300 flex items-center justify-center gap-3 text-lg font-medium shadow-lg"
              >
                {fetchingNew ? (
                  <>
                  <Loader2 className="h-6 w-6 animate-spin" />
                    جاري جلب الأخبار...
                  </>
                ) : (
                  <>
                  <Download className="h-6 w-6" />
                    جلب أخبار جديدة
                  </>
                )}
            </button>

            <div className={`mt-6 rounded-xl p-4 flex items-start gap-3 transition-colors duration-300 ${
              darkMode ? 'bg-gray-700' : 'bg-blue-50'
            }`}>
              <Newspaper className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-medium text-blue-800 mb-1">ملاحظة</h4>
                <p className="text-blue-700 text-sm">
                  يتم جلب الأخبار الجديدة فقط. الأخبار المكررة لن يتم جلبها مرة أخرى.
                </p>
              </div>
            </div>
          </div>
        )}

      {/* نافذة عرض تفاصيل الخبر */}
      {selectedNews && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className={`max-w-4xl w-full max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl transition-colors duration-300 ${
              darkMode ? 'bg-gray-800' : 'bg-white'
            }`}>
              <div className="sticky top-0 bg-gradient-to-r from-blue-500 to-blue-600 p-6 text-white">
              <div className="flex justify-between items-start">
                  <h2 className="text-xl font-bold pr-8">{selectedNews.title_TXT}</h2>
                  <button
                  onClick={() => setSelectedNews(null)}
                    className="p-2 hover:bg-white/20 rounded-lg transition-colors duration-300"
                >
                    <X className="h-5 w-5" />
                  </button>
              </div>
                <div className="flex gap-2 items-center text-sm text-white/80 mt-2">
                <Clock className="h-4 w-4" />
                {format(new Date(selectedNews.news_DT), 'PPpp', { locale: ar })}
              </div>
              </div>
              
              <div className="p-6">
                <div className="prose max-w-none">
                  <p className={`whitespace-pre-wrap leading-relaxed transition-colors duration-300 ${
                    darkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    {selectedNews.story_TXT}
                  </p>
                </div>
                
              {selectedNews.media && selectedNews.media.length > 0 && (
                <div className="mt-6">
                    <h3 className={`font-semibold mb-2 transition-colors duration-300 ${
                      darkMode ? 'text-white' : 'text-gray-900'
                    }`}>
                      الوسائط المرفقة:
                    </h3>
                  <div className="grid grid-cols-2 gap-2">
                    {/* عرض الوسائط هنا */}
                  </div>
                </div>
              )}
              </div>
            </div>
        </div>
      )}
      </div>
    </div>
  );
} 