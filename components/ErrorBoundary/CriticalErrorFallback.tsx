'use client';

import React from 'react';
import { AlertTriangle, RefreshCcw, Home, Phone, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ErrorDiagnostics } from '@/lib/diagnostics/ErrorDetector';

interface CriticalErrorFallbackProps {
  error: Error;
  retry: () => void;
  diagnostics: ErrorDiagnostics;
}

const CriticalErrorFallback: React.FC<CriticalErrorFallbackProps> = ({
  error,
  retry,
  diagnostics
}) => {
  const handleReload = () => {
    // مسح جميع البيانات المحفوظة
    try {
      localStorage.clear();
      sessionStorage.clear();
    } catch (e) {
      console.warn('فشل في مسح التخزين:', e);
    }

    // إعادة تحميل الصفحة
    window.location.reload();
  };

  const handleGoHome = () => {
    window.location.href = '/';
  };

  const handleContactSupport = () => {
    const subject = encodeURIComponent(`خطأ حرج في التطبيق - ${diagnostics.errorType}`);
    const body = encodeURIComponent(`
تفاصيل الخطأ:
- النوع: ${diagnostics.errorType}
- الرسالة: ${error.message}
- الوقت: ${new Date(diagnostics.timestamp).toLocaleString('ar-SA')}
- الصفحة: ${diagnostics.pageUrl}
- المتصفح: ${diagnostics.userAgent}
- معرف الجلسة: ${diagnostics.sessionId}

يرجى المساعدة في حل هذه المشكلة.
    `);
    
    window.open(`mailto:support@sabq.org?subject=${subject}&body=${body}`);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 p-4">
      <div className="max-w-2xl w-full bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 border-2 border-red-200 dark:border-red-800">
        
        {/* رأس الخطأ */}
        <div className="text-center mb-8">
          <div className="mx-auto w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-6 animate-pulse">
            <AlertTriangle className="w-10 h-10 text-red-600 dark:text-red-400" />
          </div>
          
          <h1 className="text-2xl font-bold text-red-800 dark:text-red-200 mb-3">
            خطأ حرج في النظام
          </h1>
          
          <p className="text-red-600 dark:text-red-300 text-lg mb-4">
            نعتذر بشدة، حدث خطأ خطير يمنع تشغيل التطبيق بشكل طبيعي
          </p>

          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
            <p className="text-red-700 dark:text-red-300 text-sm">
              <strong>نوع الخطأ:</strong> {diagnostics.errorType === 'chunk_loading' ? 'فشل تحميل أجزاء التطبيق' :
                                        diagnostics.errorType === 'memory_error' ? 'نفاد ذاكرة المتصفح' :
                                        diagnostics.errorType === 'ssr_hydration' ? 'خطأ في عرض الصفحة' :
                                        'خطأ نظام حرج'}
            </p>
            <p className="text-red-600 dark:text-red-400 text-xs mt-2">
              معرف الخطأ: {diagnostics.sessionId}
            </p>
          </div>
        </div>

        {/* الإجراءات الموصى بها */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4 text-center">
            الإجراءات الموصى بها:
          </h3>
          
          <div className="grid gap-3">
            <Button
              onClick={handleReload}
              className="w-full bg-red-600 hover:bg-red-700 text-white py-3 text-base flex items-center justify-center gap-3"
            >
              <RefreshCcw className="w-5 h-5" />
              إعادة تحميل كاملة للتطبيق
            </Button>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Button
                onClick={handleGoHome}
                variant="outline"
                className="border-red-300 dark:border-red-700 text-red-700 dark:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 py-3 flex items-center justify-center gap-2"
              >
                <Home className="w-4 h-4" />
                العودة للرئيسية
              </Button>
              
              <Button
                onClick={retry}
                variant="outline"
                className="border-red-300 dark:border-red-700 text-red-700 dark:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 py-3"
              >
                إعادة المحاولة
              </Button>
            </div>
          </div>
        </div>

        {/* معلومات الدعم الفني */}
        <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-3 text-center">
            هل تحتاج مساعدة؟
          </h4>
          
          <p className="text-gray-600 dark:text-gray-400 text-sm text-center mb-4">
            إذا استمرت المشكلة، يرجى التواصل مع فريق الدعم الفني
          </p>
          
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              onClick={handleContactSupport}
              variant="outline"
              size="sm"
              className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center justify-center gap-2"
            >
              <Mail className="w-4 h-4" />
              إرسال تقرير الخطأ
            </Button>
            
            <Button
              onClick={() => window.open('tel:+966112345678')}
              variant="outline"
              size="sm"
              className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center justify-center gap-2"
            >
              <Phone className="w-4 h-4" />
              الاتصال بالدعم
            </Button>
          </div>
        </div>

        {/* نصائح للمستخدم */}
        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <h5 className="font-medium text-blue-800 dark:text-blue-200 mb-2">💡 نصائح سريعة:</h5>
          <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
            <li>• تأكد من استقرار اتصال الإنترنت</li>
            <li>• أغلق علامات التبويب الأخرى لتوفير الذاكرة</li>
            <li>• جرب استخدام متصفح آخر</li>
            <li>• امسح ذاكرة التخزين المؤقت للمتصفح</li>
          </ul>
        </div>

        {/* معلومات تقنية للمطورين */}
        {process.env.NODE_ENV === 'development' && (
          <details className="mt-6">
            <summary className="cursor-pointer text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300">
              معلومات تقنية (للمطورين)
            </summary>
            <div className="mt-3 p-4 bg-gray-100 dark:bg-gray-900 rounded-lg text-xs font-mono">
              <div className="space-y-2">
                <div><strong>Error Type:</strong> {diagnostics.errorType}</div>
                <div><strong>Severity:</strong> {diagnostics.severity}</div>
                <div><strong>Recoverable:</strong> {diagnostics.isRecoverable ? 'Yes' : 'No'}</div>
                <div><strong>Session ID:</strong> {diagnostics.sessionId}</div>
                <div><strong>Timestamp:</strong> {new Date(diagnostics.timestamp).toISOString()}</div>
                <div><strong>User Agent:</strong> {diagnostics.userAgent}</div>
                <div><strong>Page URL:</strong> {diagnostics.pageUrl}</div>
                {error.stack && (
                  <div>
                    <strong>Stack Trace:</strong>
                    <pre className="mt-1 text-xs overflow-auto max-h-32 bg-gray-200 dark:bg-gray-800 p-2 rounded whitespace-pre-wrap">
                      {error.stack}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          </details>
        )}
      </div>
    </div>
  );
};

export default CriticalErrorFallback;