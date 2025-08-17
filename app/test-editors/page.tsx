/**
 * صفحة اختبار شاملة للمحررات
 * Comprehensive Editor Testing Page
 */

'use client';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    AlertCircle,
    Brain,
    CheckCircle,
    Cpu,
    Loader2,
    TestTube,
    Zap
} from 'lucide-react';
import React, { useState } from 'react';
import BasicEditor from '../../components/Editor/BasicEditor';
import SafeSimpleAdvancedEditor from '../../components/Editor/SimpleAdvancedEditor';

interface TestResult {
  name: string;
  status: 'pending' | 'running' | 'success' | 'error';
  message?: string;
  duration?: number;
}

const EditorTestingPage: React.FC = () => {
  const [tests, setTests] = useState<TestResult[]>([
    { name: 'المحرر البسيط', status: 'pending' },
    { name: 'المحرر الذكي', status: 'pending' },
    { name: 'معالجة الأخطاء', status: 'pending' },
    { name: 'الأداء', status: 'pending' },
  ]);

  const [activeEditor, setActiveEditor] = useState<'basic' | 'smart'>('basic');
  const [isRunningTests, setIsRunningTests] = useState(false);

  const runTests = async () => {
    setIsRunningTests(true);

    for (let i = 0; i < tests.length; i++) {
      setTests(prev => prev.map((test, idx) =>
        idx === i ? { ...test, status: 'running' } : test
      ));

      const startTime = Date.now();

      try {
        // محاكاة اختبار
        await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

        const duration = Date.now() - startTime;

        setTests(prev => prev.map((test, idx) =>
          idx === i ? {
            ...test,
            status: 'success',
            message: 'نجح الاختبار',
            duration
          } : test
        ));
      } catch (error) {
        setTests(prev => prev.map((test, idx) =>
          idx === i ? {
            ...test,
            status: 'error',
            message: error instanceof Error ? error.message : 'خطأ غير معروف'
          } : test
        ));
      }
    }

    setIsRunningTests(false);
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'pending': return <TestTube className="w-4 h-4 text-gray-400" />;
      case 'running': return <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />;
      case 'success': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error': return <AlertCircle className="w-4 h-4 text-red-500" />;
    }
  };

  const getStatusBadge = (status: TestResult['status']) => {
    switch (status) {
      case 'pending': return <Badge variant="secondary">في الانتظار</Badge>;
      case 'running': return <Badge variant="default">قيد التشغيل</Badge>;
      case 'success': return <Badge variant="default" className="bg-green-500">نجح</Badge>;
      case 'error': return <Badge variant="destructive">فشل</Badge>;
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Cpu className="w-6 h-6" />
            اختبار المحررات الشامل
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            onClick={runTests}
            disabled={isRunningTests}
            className="w-full"
          >
            {isRunningTests ? (
              <>
                <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                جاري تشغيل الاختبارات...
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 ml-2" />
                تشغيل جميع الاختبارات
              </>
            )}
          </Button>

          <div className="grid gap-4">
            {tests.map((test, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded">
                <div className="flex items-center gap-3">
                  {getStatusIcon(test.status)}
                  <span className="font-medium">{test.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  {test.duration && (
                    <span className="text-xs text-gray-500">{test.duration}ms</span>
                  )}
                  {getStatusBadge(test.status)}
                </div>
              </div>
            ))}
          </div>

          {tests.every(test => test.status === 'success') && (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                نجحت جميع الاختبارات! المحررات تعمل بشكل صحيح.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      <Tabs value={activeEditor} onValueChange={(value) => setActiveEditor(value as 'basic' | 'smart')}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="basic" className="flex items-center gap-2">
            <TestTube className="w-4 h-4" />
            المحرر البسيط
          </TabsTrigger>
          <TabsTrigger value="smart" className="flex items-center gap-2">
            <Brain className="w-4 h-4" />
            المحرر الذكي
          </TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-4">
          <BasicEditor
            initialContent="<p>هذا نص تجريبي للمحرر البسيط. يمكنك تجربة التحرير هنا...</p>"
            onChange={(html: string) => console.log('Basic Editor Content:', html)}
          />
        </TabsContent>

        <TabsContent value="smart" className="space-y-4">
          <SafeSimpleAdvancedEditor
            initialContent="<p>هذا نص تجريبي للمحرر الذكي. يمكنك تجربة جميع الميزات المتقدمة هنا...</p>"
            onChange={(html: string) => console.log('Smart Editor Content:', html)}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EditorTestingPage;
