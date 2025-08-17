'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

const ReporterStatusPageClient: React.FC = () => {
  const [diagnostics, setDiagnostics] = useState<any>({});
  const [isRunning, setIsRunning] = useState(false);

  const runDiagnostics = async () => {
    setIsRunning(true);
    
    try {
      // Test API endpoint
      const response = await fetch('/api/reporters/fatima-alzahrani');
      const data = await response.json();
      
      setDiagnostics({
        api: {
          status: response.ok ? 'success' : 'error',
          message: response.ok ? 'API يعمل بشكل صحيح' : 'خطأ في API',
          data: data
        }
      });
    } catch (error: any) {
      setDiagnostics({
        api: {
          status: 'error',
          message: `خطأ: ${error.message}`,
          data: null
        }
      });
    }
    
    setIsRunning(false);
  };

  useEffect(() => {
    runDiagnostics();
  }, []);

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          🔧 تشخيص حالة المراسل
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          أداة شاملة لفحص وتشخيص حالة نظام بروفايلات المراسلين
        </p>
        
        <Button 
          onClick={runDiagnostics}
          disabled={isRunning}
          className="mb-6"
        >
          <RefreshCw className={`mr-2 h-4 w-4 ${isRunning ? 'animate-spin' : ''}`} />
          {isRunning ? 'جاري الفحص...' : 'إعادة فحص'}
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border">
          <h3 className="text-xl font-semibold mb-4">حالة API</h3>
          {diagnostics.api && (
            <div>
              <p className={`font-medium ${diagnostics.api.status === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                {diagnostics.api.message}
              </p>
              {diagnostics.api.data && (
                <pre className="mt-4 p-4 bg-gray-100 dark:bg-gray-700 rounded text-sm overflow-auto">
                  {JSON.stringify(diagnostics.api.data, null, 2)}
                </pre>
              )}
            </div>
          )}
        </div>

        <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg border">
          <h3 className="text-xl font-semibold mb-4">معلومات مفيدة</h3>
          <div className="space-y-2 text-sm">
            <p><strong>المسار الحالي:</strong> {typeof window !== 'undefined' ? window.location.pathname : '/debug/reporter-status'}</p>
            <p><strong>النطاق:</strong> {typeof window !== 'undefined' ? window.location.origin : 'localhost:3002'}</p>
            <p><strong>وقت الفحص:</strong> {new Date().toLocaleString('ar-SA')}</p>
            
            {typeof window !== 'undefined' && (
              <p>
                <strong>رابط صفحة المراسل:</strong>{' '}
                <a 
                  href={`${window.location.origin}/reporter/fatima-alzahrani`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 underline"
                >
                  {window.location.origin}/reporter/fatima-alzahrani
                </a>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReporterStatusPageClient;