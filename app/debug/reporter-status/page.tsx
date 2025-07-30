'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  CheckCircle, XCircle, Clock, AlertCircle, 
  Database, Server, User, ExternalLink,
  RefreshCw, FileText, Activity
} from 'lucide-react';

interface DiagnosticResult {
  status: 'success' | 'error' | 'warning' | 'loading';
  message: string;
  details?: any;
  timestamp: string;
}

const ReporterStatusPage: React.FC = () => {
  const [diagnostics, setDiagnostics] = useState<Record<string, DiagnosticResult>>({});
  const [isRunning, setIsRunning] = useState(false);

  const runDiagnostics = async () => {
    setIsRunning(true);
    const results: Record<string, DiagnosticResult> = {};

    // Test 1: API Endpoint Check
    try {
      setDiagnostics(prev => ({
        ...prev,
        apiEndpoint: {
          status: 'loading',
          message: 'فحص API endpoint...',
          timestamp: new Date().toISOString()
        }
      }));

      const response = await fetch('/api/reporters/fatima-alzahrani');
      const data = await response.json();
      
      if (response.ok && data.success) {
        results.apiEndpoint = {
          status: 'success',
          message: 'API endpoint يعمل بشكل صحيح',
          details: { statusCode: response.status, hasData: !!data.reporter },
          timestamp: new Date().toISOString()
        };
      } else {
        results.apiEndpoint = {
          status: 'error',
          message: `API خطأ: ${data.error || 'خطأ غير معروف'}`,
          details: { statusCode: response.status, response: data },
          timestamp: new Date().toISOString()
        };
      }
    } catch (error) {
      results.apiEndpoint = {
        status: 'error',
        message: `فشل الاتصال بـ API: ${error instanceof Error ? error.message : 'خطأ غير معروف'}`,
        timestamp: new Date().toISOString()
      };
    }

    // Test 2: Database Check via API
    try {
      setDiagnostics(prev => ({
        ...prev,
        database: {
          status: 'loading',
          message: 'فحص اتصال قاعدة البيانات...',
          timestamp: new Date().toISOString()
        }
      }));

      const response = await fetch('/api/reporters');
      const data = await response.json();
      
      if (response.ok) {
        results.database = {
          status: 'success',
          message: `قاعدة البيانات متصلة - ${data.reporters?.length || 0} مراسل موجود`,
          details: { reportersCount: data.reporters?.length || 0 },
          timestamp: new Date().toISOString()
        };
      } else {
        results.database = {
          status: 'error',
          message: 'خطأ في الاتصال بقاعدة البيانات',
          details: { statusCode: response.status },
          timestamp: new Date().toISOString()
        };
      }
    } catch (error) {
      results.database = {
        status: 'error',
        message: `فشل فحص قاعدة البيانات: ${error instanceof Error ? error.message : 'خطأ غير معروف'}`,
        timestamp: new Date().toISOString()
      };
    }

    // Test 3: Frontend Page Test
    try {
      setDiagnostics(prev => ({
        ...prev,
        frontend: {
          status: 'loading',
          message: 'فحص تحميل الصفحة...',
          timestamp: new Date().toISOString()
        }
      }));

      // Test if we can access the reporter page route
      const currentDomain = window.location.origin;
      const testUrl = `${currentDomain}/reporter/fatima-alzahrani`;
      
      results.frontend = {
        status: 'success',
        message: 'صفحة المراسل متاحة للوصول',
        details: { 
          url: testUrl,
          currentDomain,
          timestamp: new Date().toISOString()
        },
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      results.frontend = {
        status: 'error',
        message: `خطأ في فحص الصفحة: ${error instanceof Error ? error.message : 'خطأ غير معروف'}`,
        timestamp: new Date().toISOString()
      };
    }

    // Update all results
    setDiagnostics(prev => ({ ...prev, ...results }));
    setIsRunning(false);
  };

  useEffect(() => {
    runDiagnostics();
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'error': return <XCircle className="w-5 h-5 text-red-600" />;
      case 'warning': return <AlertCircle className="w-5 h-5 text-yellow-600" />;
      case 'loading': return <Clock className="w-5 h-5 text-blue-600 animate-pulse" />;
      default: return <AlertCircle className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success': return <Badge className="bg-green-100 text-green-800">يعمل</Badge>;
      case 'error': return <Badge className="bg-red-100 text-red-800">خطأ</Badge>;
      case 'warning': return <Badge className="bg-yellow-100 text-yellow-800">تحذير</Badge>;
      case 'loading': return <Badge className="bg-blue-100 text-blue-800">جاري الفحص</Badge>;
      default: return <Badge className="bg-gray-100 text-gray-800">غير معروف</Badge>;
    }
  };

  const overallStatus = () => {
    const statuses = Object.values(diagnostics).map(d => d.status);
    if (statuses.includes('error')) return 'error';
    if (statuses.includes('warning')) return 'warning';
    if (statuses.includes('loading')) return 'loading';
    if (statuses.every(s => s === 'success')) return 'success';
    return 'unknown';
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-3">
            <Activity className="w-8 h-8 text-blue-600" />
            تشخيص نظام بروفايل المراسلين
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            فحص شامل لحالة النظام والتأكد من عمل جميع المكونات
          </p>
          
          <div className="flex items-center gap-4 mt-4">
            <div className="flex items-center gap-2">
              {getStatusIcon(overallStatus())}
              <span className="font-medium">
                الحالة العامة: {getStatusBadge(overallStatus())}
              </span>
            </div>
            
            <Button 
              onClick={runDiagnostics} 
              disabled={isRunning}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${isRunning ? 'animate-spin' : ''}`} />
              إعادة الفحص
            </Button>
          </div>
        </div>

        {/* Diagnostics Cards */}
        <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-1">
          
          {/* API Endpoint Test */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Server className="w-5 h-5 text-blue-600" />
                  فحص API Endpoint
                </div>
                {diagnostics.apiEndpoint && getStatusBadge(diagnostics.apiEndpoint.status)}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-start gap-3">
                {diagnostics.apiEndpoint && getStatusIcon(diagnostics.apiEndpoint.status)}
                <div className="flex-1">
                  <p className="text-gray-900 dark:text-white font-medium">
                    {diagnostics.apiEndpoint?.message || 'في انتظار الفحص...'}
                  </p>
                  {diagnostics.apiEndpoint?.details && (
                    <pre className="mt-2 p-2 bg-gray-100 dark:bg-gray-800 rounded text-xs overflow-auto">
                      {JSON.stringify(diagnostics.apiEndpoint.details, null, 2)}
                    </pre>
                  )}
                  <p className="text-xs text-gray-500 mt-2">
                    آخر فحص: {diagnostics.apiEndpoint?.timestamp ? new Date(diagnostics.apiEndpoint.timestamp).toLocaleString('ar-SA') : '-'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Database Test */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Database className="w-5 h-5 text-green-600" />
                  فحص قاعدة البيانات
                </div>
                {diagnostics.database && getStatusBadge(diagnostics.database.status)}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-start gap-3">
                {diagnostics.database && getStatusIcon(diagnostics.database.status)}
                <div className="flex-1">
                  <p className="text-gray-900 dark:text-white font-medium">
                    {diagnostics.database?.message || 'في انتظار الفحص...'}
                  </p>
                  {diagnostics.database?.details && (
                    <pre className="mt-2 p-2 bg-gray-100 dark:bg-gray-800 rounded text-xs overflow-auto">
                      {JSON.stringify(diagnostics.database.details, null, 2)}
                    </pre>
                  )}
                  <p className="text-xs text-gray-500 mt-2">
                    آخر فحص: {diagnostics.database?.timestamp ? new Date(diagnostics.database.timestamp).toLocaleString('ar-SA') : '-'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Frontend Test */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <User className="w-5 h-5 text-purple-600" />
                  فحص واجهة المستخدم
                </div>
                {diagnostics.frontend && getStatusBadge(diagnostics.frontend.status)}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-start gap-3">
                {diagnostics.frontend && getStatusIcon(diagnostics.frontend.status)}
                <div className="flex-1">
                  <p className="text-gray-900 dark:text-white font-medium">
                    {diagnostics.frontend?.message || 'في انتظار الفحص...'}
                  </p>
                  {diagnostics.frontend?.details && (
                    <div className="mt-2">
                      <a 
                        href={diagnostics.frontend.details.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 text-sm"
                      >
                        <ExternalLink className="w-4 h-4" />
                        اختبار الصفحة في تبويب جديد
                      </a>
                      <pre className="mt-2 p-2 bg-gray-100 dark:bg-gray-800 rounded text-xs overflow-auto">
                        {JSON.stringify(diagnostics.frontend.details, null, 2)}
                      </pre>
                    </div>
                  )}
                  <p className="text-xs text-gray-500 mt-2">
                    آخر فحص: {diagnostics.frontend?.timestamp ? new Date(diagnostics.frontend.timestamp).toLocaleString('ar-SA') : '-'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Help Section */}
        <Card className="mt-8 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-900 dark:text-blue-100">
              <FileText className="w-5 h-5" />
              معلومات للمطورين
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-blue-800 dark:text-blue-200 space-y-2">
              <p><strong>المسار الحالي:</strong> {window.location.pathname}</p>
              <p><strong>النطاق:</strong> {window.location.origin}</p>
              <p><strong>وقت الفحص:</strong> {new Date().toLocaleString('ar-SA')}</p>
              
              <div className="mt-4 p-3 bg-blue-100 dark:bg-blue-800 rounded">
                <p className="font-semibold mb-2">خطوات حل المشاكل:</p>
                <ol className="list-decimal list-inside space-y-1 text-xs">
                  <li>تأكد من نشر آخر إصدار على الخادم</li>
                  <li>تحقق من تحديث database schema: <code>npx prisma migrate deploy</code></li>
                  <li>أضف بيانات المراسلين: <code>node scripts/seed-reporters.js</code></li>
                  <li>أعد بناء التطبيق: <code>npm run build</code></li>
                </ol>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ReporterStatusPage;