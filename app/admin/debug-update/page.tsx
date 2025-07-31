'use client';

import { useState } from 'react';
import { ArticleUpdateDebugger, useArticleUpdateLogger } from '@/components/article/ArticleUpdateDebugger';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { AlertCircle, CheckCircle, Loader2 } from 'lucide-react';

export default function DebugUpdatePage() {
  const [articleId, setArticleId] = useState('article_1753871540813_vlvief9dk');
  const [updateData, setUpdateData] = useState('{\n  "title": "عنوان محدث"\n}');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const { logUpdateAttempt, getUpdateLogs, clearUpdateLogs } = useArticleUpdateLogger();

  const testUpdate = async () => {
    setLoading(true);
    setResult(null);

    try {
      // تحويل البيانات من JSON
      let data;
      try {
        data = JSON.parse(updateData);
      } catch (e) {
        setResult({
          error: true,
          message: 'خطأ في تنسيق JSON',
          details: e.message
        });
        setLoading(false);
        return;
      }

      console.group('🔍 اختبار تحديث المقال');
      console.log('🆔 معرف المقال:', articleId);
      console.log('📤 البيانات:', data);

      const response = await fetch(`/api/articles/${articleId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'X-Debug-Mode': 'true'
        },
        body: JSON.stringify(data)
      });

      const responseData = await response.json();
      
      console.log('📥 حالة الاستجابة:', response.status);
      console.log('📥 البيانات:', responseData);
      console.groupEnd();

      // تسجيل المحاولة
      logUpdateAttempt(articleId, data, responseData, !response.ok ? responseData : null);

      setResult({
        success: response.ok,
        status: response.status,
        data: responseData
      });

    } catch (error: any) {
      console.error('❌ خطأ في الاتصال:', error);
      setResult({
        error: true,
        message: 'خطأ في الاتصال',
        details: error.message
      });
      logUpdateAttempt(articleId, null, null, error);
    } finally {
      setLoading(false);
    }
  };

  const logs = getUpdateLogs();

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <ArticleUpdateDebugger />
      
      <h1 className="text-3xl font-bold mb-6">🔍 تشخيص تحديث المقالات</h1>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>اختبار تحديث مقال</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">معرف المقال</label>
            <Input
              value={articleId}
              onChange={(e) => setArticleId(e.target.value)}
              placeholder="article_xxx"
              dir="ltr"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">بيانات التحديث (JSON)</label>
            <Textarea
              value={updateData}
              onChange={(e) => setUpdateData(e.target.value)}
              rows={10}
              className="font-mono text-sm"
              dir="ltr"
            />
          </div>

          <Button 
            onClick={testUpdate} 
            disabled={loading}
            className="w-full"
          >
            {loading && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
            {loading ? 'جاري الاختبار...' : 'اختبار التحديث'}
          </Button>
        </CardContent>
      </Card>

      {result && (
        <Card className={`mb-6 ${result.success ? 'border-green-500' : 'border-red-500'}`}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {result.success ? (
                <>
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  نجح التحديث
                </>
              ) : (
                <>
                  <AlertCircle className="w-5 h-5 text-red-500" />
                  فشل التحديث
                </>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded overflow-auto text-sm" dir="ltr">
              {JSON.stringify(result, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>سجل المحاولات ({logs.length})</span>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => {
                clearUpdateLogs();
                window.location.reload();
              }}
            >
              مسح السجل
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {logs.length === 0 ? (
            <p className="text-gray-500">لا توجد محاولات مسجلة</p>
          ) : (
            <div className="space-y-4 max-h-96 overflow-auto">
              {logs.reverse().map((log: any, index: number) => (
                <div 
                  key={index} 
                  className={`p-4 rounded border ${log.error ? 'border-red-300 bg-red-50' : 'border-gray-300'}`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-sm font-medium">
                      {new Date(log.timestamp).toLocaleString('ar-SA')}
                    </span>
                    <span className={`text-xs px-2 py-1 rounded ${
                      log.error ? 'bg-red-200' : 'bg-green-200'
                    }`}>
                      {log.error ? 'فشل' : 'نجح'}
                    </span>
                  </div>
                  <details className="text-sm">
                    <summary className="cursor-pointer">عرض التفاصيل</summary>
                    <pre className="mt-2 bg-gray-100 p-2 rounded overflow-auto text-xs" dir="ltr">
                      {JSON.stringify(log, null, 2)}
                    </pre>
                  </details>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>🛠️ أدوات Console</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600 mb-4">
            افتح Console (F12) واستخدم الأوامر التالية:
          </p>
          <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded text-sm" dir="ltr">
{`// اختبار تحديث
debugArticleUpdate("${articleId}", { title: "عنوان جديد" })

// تشغيل اختبارات متعددة
testArticleUpdate("${articleId}")

// اعتراض النماذج
interceptFormSubmit()`}
          </pre>
        </CardContent>
      </Card>
    </div>
  );
}