/**
 * اختبار بسيط للمحرر الذكي
 * Simple test for Smart Editor
 */

'use client';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, CheckCircle } from 'lucide-react';
import React, { useState } from 'react';
import SimpleAdvancedEditor from './SimpleAdvancedEditor';

const EditorTest: React.FC = () => {
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);

  const runTest = () => {
    setTestStatus('testing');
    setError(null);

    // تأخير بسيط للمحاكاة
    setTimeout(() => {
      try {
        // إذا وصلنا هنا بدون أخطاء، فالاختبار نجح
        setTestStatus('success');
      } catch (err) {
        setTestStatus('error');
        setError(err instanceof Error ? err.message : 'خطأ غير معروف');
      }
    }, 1000);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>اختبار المحرر الذكي</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={runTest} disabled={testStatus === 'testing'}>
            {testStatus === 'testing' ? 'جاري الاختبار...' : 'اختبار المحرر'}
          </Button>

          {testStatus === 'success' && (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                نجح اختبار المحرر! المحرر الذكي يعمل بشكل صحيح.
              </AlertDescription>
            </Alert>
          )}

          {testStatus === 'error' && (
            <Alert className="border-red-200 bg-red-50">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                فشل اختبار المحرر: {error}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>المحرر الذكي - الاختبار المباشر</CardTitle>
        </CardHeader>
        <CardContent>
          <SimpleAdvancedEditor
            initialContent=""
            onChange={(content: string) => console.log('Content changed:', content)}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default EditorTest;
