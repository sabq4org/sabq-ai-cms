"use client";

import { useState, useEffect } from "react";
import { PerformanceOptimizer, PerformanceReport } from "@/lib/performance/PerformanceOptimizer";
import { 
  BarChart2, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  ChevronDown, 
  ChevronUp,
  Download,
  RefreshCw
} from "lucide-react";

interface PerformanceMonitorEnhancedProps {
  showInitially?: boolean;
  onlyForAdmins?: boolean;
  pageName?: string;
}

export default function PerformanceMonitorEnhanced({
  showInitially = false,
  onlyForAdmins = true,
  pageName = 'page'
}: PerformanceMonitorEnhancedProps) {
  const [isVisible, setIsVisible] = useState(showInitially);
  const [isExpanded, setIsExpanded] = useState(false);
  const [report, setReport] = useState<PerformanceReport | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  
  // التحقق من صلاحيات المستخدم
  useEffect(() => {
    // محاكاة التحقق من صلاحيات المستخدم
    // في التطبيق الحقيقي، يجب التحقق من صلاحيات المستخدم من الخادم
    const checkIfAdmin = () => {
      // للاختبار، نفترض أن المستخدم مدير
      setIsAdmin(true);
    };
    
    checkIfAdmin();
  }, []);
  
  // تحسين الصفحة عند التحميل
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // تطبيق تحسينات الأداء
      PerformanceOptimizer.optimizePage();
    }
  }, []);
  
  // إنشاء تقرير الأداء
  const generateReport = async () => {
    setIsLoading(true);
    
    try {
      // إعطاء وقت للصفحة لتحميل جميع الموارد
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newReport = PerformanceOptimizer.generatePerformanceReport();
      setReport(newReport);
    } catch (error) {
      console.error('فشل إنشاء تقرير الأداء:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // تصدير التقرير كملف JSON
  const exportReport = () => {
    if (!report) return;
    
    try {
      const dataStr = JSON.stringify(report, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
      
      const exportFileDefaultName = `performance-report-${pageName}-${new Date().toISOString().slice(0, 10)}.json`;
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
    } catch (error) {
      console.error('فشل تصدير التقرير:', error);
    }
  };
  
  // تحديد لون درجة الأداء
  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-500';
    if (score >= 70) return 'text-yellow-500';
    return 'text-red-500';
  };
  
  // إذا كان المكون مخصص للمدراء فقط ولم يكن المستخدم مديراً
  if (onlyForAdmins && !isAdmin) {
    return null;
  }
  
  // إذا كان في وضع الإنتاج وليس المستخدم مديراً
  if (process.env.NODE_ENV !== 'development' && !isAdmin) {
    return null;
  }
  
  return (
    <>
      {/* زر فتح مراقب الأداء */}
      {!isVisible && (
        <button
          onClick={() => setIsVisible(true)}
          className="fixed left-6 top-6 bg-gray-800 hover:bg-gray-700 text-white rounded-full p-2 shadow-lg z-50"
          aria-label="فتح مراقب الأداء"
        >
          <BarChart2 className="h-5 w-5" />
        </button>
      )}
      
      {/* مراقب الأداء */}
      {isVisible && (
        <div className={`fixed left-6 top-6 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-50 transition-all duration-300 ${
          isExpanded ? 'w-96' : 'w-64'
        }`}>
          {/* رأس مراقب الأداء */}
          <div className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              <BarChart2 className="h-5 w-5 text-blue-500" />
              <h3 className="font-bold text-gray-900 dark:text-white">
                مراقب الأداء المتقدم
              </h3>
            </div>
            <div className="flex items-center space-x-1 rtl:space-x-reverse">
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 transition-colors"
                aria-label={isExpanded ? 'تصغير' : 'توسيع'}
              >
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronUp className="h-4 w-4" />
                )}
              </button>
              <button
                onClick={() => setIsVisible(false)}
                className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 transition-colors"
                aria-label="إغلاق"
              >
                &times;
              </button>
            </div>
          </div>
          
          {/* محتوى مراقب الأداء */}
          <div className="p-4">
            {/* زر إنشاء التقرير */}
            <button
              onClick={generateReport}
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md mb-4 flex items-center justify-center space-x-2 rtl:space-x-reverse disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <BarChart2 className="h-4 w-4" />
              )}
              <span>{isLoading ? 'جاري التحليل...' : 'تحليل أداء الصفحة'}</span>
            </button>
            
            {/* نتائج التقرير */}
            {report && (
              <div className="space-y-4">
                {/* درجة الأداء */}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">درجة الأداء:</span>
                  <span className={`text-xl font-bold ${getScoreColor(report.score)}`}>
                    {report.score}/100
                  </span>
                </div>
                
                {/* مقاييس الأداء الرئيسية */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-600 dark:text-gray-400">وقت التحميل:</span>
                    <span className="text-sm font-medium">
                      {(report.metrics.ttl / 1000).toFixed(2)} ثانية
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-600 dark:text-gray-400">First Contentful Paint:</span>
                    <span className="text-sm font-medium">
                      {(report.metrics.fcp / 1000).toFixed(2)} ثانية
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-600 dark:text-gray-400">عناصر DOM:</span>
                    <span className="text-sm font-medium">
                      {report.metrics.domNodes}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-600 dark:text-gray-400">عدد الموارد:</span>
                    <span className="text-sm font-medium">
                      {report.metrics.resources.total}
                    </span>
                  </div>
                </div>
                
                {/* التوصيات */}
                {isExpanded && report.recommendations.length > 0 && (
                  <div className="mt-4">
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                      التوصيات:
                    </h4>
                    <ul className="space-y-1">
                      {report.recommendations.map((recommendation, index) => (
                        <li key={index} className="flex items-start space-x-2 rtl:space-x-reverse">
                          <AlertTriangle className="h-4 w-4 text-yellow-500 flex-shrink-0 mt-0.5" />
                          <span className="text-xs text-gray-600 dark:text-gray-400">
                            {recommendation}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {/* الموارد البطيئة */}
                {isExpanded && report.slowResources.length > 0 && (
                  <div className="mt-4">
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                      الموارد البطيئة:
                    </h4>
                    <ul className="space-y-1">
                      {report.slowResources.map((resource, index) => (
                        <li key={index} className="text-xs text-gray-600 dark:text-gray-400 truncate">
                          {resource.url.split('/').pop()} ({(resource.duration / 1000).toFixed(2)}s)
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {/* زر تصدير التقرير */}
                {isExpanded && (
                  <button
                    onClick={exportReport}
                    className="mt-4 w-full bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 py-1 px-3 rounded-md text-xs flex items-center justify-center space-x-1 rtl:space-x-reverse transition-colors"
                  >
                    <Download className="h-3 w-3" />
                    <span>تصدير التقرير</span>
                  </button>
                )}
              </div>
            )}
            
            {/* رسالة عند عدم وجود تقرير */}
            {!report && !isLoading && (
              <div className="text-center py-4 text-sm text-gray-500 dark:text-gray-400">
                اضغط على زر التحليل لإنشاء تقرير أداء للصفحة الحالية
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
