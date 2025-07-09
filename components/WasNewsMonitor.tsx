"use client";
import { useState } from "react";
import { RefreshCw, Wifi, WifiOff, Clock, CheckCircle, XCircle, Loader2 } from "lucide-react";

interface ApiLog {
  id: string;
  timestamp: Date;
  duration: number | null;
  status: "success" | "error";
  error?: string;
  newsCount?: number;
  responseSize?: number;
}

export default function WasNewsMonitor() {
  const [status, setStatus] = useState<null | "idle" | "connecting" | "sending" | "waiting" | "receiving" | "success" | "error">(null);
  const [start, setStart] = useState<Date | null>(null);
  const [end, setEnd] = useState<Date | null>(null);
  const [duration, setDuration] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [apiResult, setApiResult] = useState<any>(null);
  const [logs, setLogs] = useState<ApiLog[]>([]);
  const [retryCount, setRetryCount] = useState(0);

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
        return <XCircle className="inline-block w-4 h-4 mr-2" />;
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

  const fetchNews = async (isRetry = false) => {
    const startTime = new Date();
    setStatus("connecting");
    setStart(startTime);
    setError(null);
    setApiResult(null);
    setEnd(null);
    setDuration(null);

    if (!isRetry) {
      setRetryCount(0);
    }

    try {
      // محاكاة مراحل الاتصال
      setTimeout(() => setStatus("sending"), 100);
      
      const res = await fetch("/api/was-news");
      
      setStatus("waiting");
      
      const responseText = await res.text();
      const responseSize = new TextEncoder().encode(responseText).length;
      
      setStatus("receiving");
      
      const result = JSON.parse(responseText);
      const endTime = new Date();
      const elapsedTime = endTime.getTime() - startTime.getTime();
      
      setEnd(endTime);
      setDuration(elapsedTime);
      
      if (res.ok) {
        setStatus("success");
        setApiResult(result);
        
        // إضافة إلى السجل
        const newLog: ApiLog = {
          id: Date.now().toString(),
          timestamp: startTime,
          duration: elapsedTime,
          status: "success",
          newsCount: Array.isArray(result.news) ? result.news.length : 1,
          responseSize: responseSize
        };
        setLogs(prev => [newLog, ...prev.slice(0, 19)]);
        
        // TODO: إضافة إشعار صوتي للنجاح
        // const audio = new Audio("/sounds/success.mp3");
        // audio.play().catch(() => {});
        
      } else {
        setStatus("error");
        setError(result.error || `خطأ HTTP: ${res.status}`);
        
        // إضافة إلى السجل
        const newLog: ApiLog = {
          id: Date.now().toString(),
          timestamp: startTime,
          duration: elapsedTime,
          status: "error",
          error: result.error || `خطأ HTTP: ${res.status}`
        };
        setLogs(prev => [newLog, ...prev.slice(0, 19)]);
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
    }
  };

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
    fetchNews(true);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* لوحة المراقبة الرئيسية */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold flex items-center">
            <Wifi className="w-6 h-6 mr-2 text-blue-600" />
            مراقبة اتصال واس API
          </h2>
          {retryCount > 0 && (
            <span className="text-sm text-gray-500">
              عدد المحاولات: {retryCount}
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* زر الاتصال والحالة */}
          <div className="space-y-4">
            <div className="flex gap-3">
              <button
                onClick={() => fetchNews()}
                className="flex-1 px-6 py-3 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
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
                  className="px-6 py-3 rounded-lg bg-orange-600 text-white hover:bg-orange-700 transition-colors"
                >
                  إعادة المحاولة
                </button>
              )}
            </div>

            {/* معلومات الحالة */}
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <div className="flex items-center">
                <span className="text-gray-600 w-28">الحالة:</span>
                <span className={`font-bold ${getStatusColor()}`}>
                  {getStatusIcon()}
                  {getStatusText()}
                </span>
              </div>
              
              <div className="flex items-center">
                <span className="text-gray-600 w-28">وقت البدء:</span>
                <span className="font-mono text-sm">
                  {start ? start.toLocaleTimeString('ar-SA') : "--:--:--"}
                </span>
              </div>
              
              <div className="flex items-center">
                <span className="text-gray-600 w-28">وقت الانتهاء:</span>
                <span className="font-mono text-sm">
                  {end ? end.toLocaleTimeString('ar-SA') : "--:--:--"}
                </span>
              </div>
              
              <div className="flex items-center">
                <span className="text-gray-600 w-28">مدة الاستجابة:</span>
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
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="text-green-800 font-bold mb-2">✅ تمت العملية بنجاح</h3>
                <div className="space-y-1 text-sm">
                  {apiResult.news_NUM && (
                    <p>رقم الخبر: <span className="font-bold">{apiResult.news_NUM}</span></p>
                  )}
                  {apiResult.news?.length > 0 && (
                    <p>عدد الأخبار المستلمة: <span className="font-bold">{apiResult.news.length}</span></p>
                  )}
                  <p>حجم الاستجابة: <span className="font-bold">{(JSON.stringify(apiResult).length / 1024).toFixed(2)} KB</span></p>
                </div>
              </div>
            )}

            {status === "error" && error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h3 className="text-red-800 font-bold mb-2">❌ فشلت العملية</h3>
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            {/* مؤشرات الأداء */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-blue-50 rounded-lg p-3 text-center">
                <Clock className="w-8 h-8 mx-auto mb-1 text-blue-600" />
                <p className="text-xs text-gray-600">متوسط الزمن</p>
                <p className="font-bold text-lg">
                  {logs.length > 0 
                    ? Math.round(logs.reduce((acc, log) => acc + (log.duration || 0), 0) / logs.length)
                    : "--"
                  } ms
                </p>
              </div>
              
              <div className="bg-green-50 rounded-lg p-3 text-center">
                <CheckCircle className="w-8 h-8 mx-auto mb-1 text-green-600" />
                <p className="text-xs text-gray-600">نسبة النجاح</p>
                <p className="font-bold text-lg">
                  {logs.length > 0 
                    ? Math.round((logs.filter(l => l.status === "success").length / logs.length) * 100)
                    : "--"
                  }%
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* عرض البيانات الخام */}
        {apiResult && status === "success" && (
          <details className="mt-6">
            <summary className="cursor-pointer text-sm text-gray-600 hover:text-gray-800">
              عرض البيانات الخام (JSON)
            </summary>
            <pre className="mt-2 p-4 bg-gray-100 rounded-lg overflow-x-auto text-xs">
              {JSON.stringify(apiResult, null, 2)}
            </pre>
          </details>
        )}
      </div>

      {/* سجل العمليات */}
      {logs.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-bold mb-4">📊 سجل آخر العمليات</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-right pb-2">الوقت</th>
                  <th className="text-right pb-2">الحالة</th>
                  <th className="text-right pb-2">المدة</th>
                  <th className="text-right pb-2">عدد الأخبار</th>
                  <th className="text-right pb-2">الحجم</th>
                  <th className="text-right pb-2">الخطأ</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id} className="border-b hover:bg-gray-50">
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
  );
} 