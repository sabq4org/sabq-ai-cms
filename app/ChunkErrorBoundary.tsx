'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCcw } from 'lucide-react';

interface ChunkErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

class ChunkErrorBoundary extends React.Component<
  { children: React.ReactNode },
  ChunkErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ChunkErrorBoundaryState {
    // تحديث الحالة عند حدوث خطأ
    if (error.message && error.message.includes('Loading chunk')) {
      return { hasError: true, error };
    }
    return { hasError: false };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // تسجيل الخطأ
    console.error('Chunk loading error:', error, errorInfo);
    
    // إذا كان خطأ chunk loading، حاول إعادة التحميل تلقائياً مرة واحدة
    if (error.message && error.message.includes('Loading chunk')) {
      const hasReloaded = sessionStorage.getItem('chunk_error_reloaded');
      
      if (!hasReloaded) {
        sessionStorage.setItem('chunk_error_reloaded', 'true');
        window.location.reload();
      }
    }
  }

  handleReload = () => {
    // مسح علامة إعادة التحميل
    sessionStorage.removeItem('chunk_error_reloaded');
    
    // تنظيف service workers
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then(registrations => {
        registrations.forEach(registration => {
          registration.unregister();
        });
      });
    }
    
    // تنظيف الكاش
    if ('caches' in window) {
      caches.keys().then(names => {
        names.forEach(name => {
          caches.delete(name);
        });
      });
    }
    
    // إعادة تحميل
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
          <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mb-4">
                <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
              </div>
              
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                حدث خطأ في تحميل الصفحة
              </h2>
              
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                نعتذر عن الإزعاج. حدث خطأ أثناء تحميل بعض موارد الصفحة.
              </p>
              
              <Button
                onClick={this.handleReload}
                className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2 mx-auto"
              >
                <RefreshCcw className="w-4 h-4" />
                إعادة تحميل الصفحة
              </Button>
              
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="mt-6 text-left">
                  <summary className="cursor-pointer text-sm text-gray-500 dark:text-gray-400">
                    تفاصيل الخطأ (للمطورين)
                  </summary>
                  <pre className="mt-2 p-4 bg-gray-100 dark:bg-gray-900 rounded text-xs overflow-auto">
                    {this.state.error.toString()}
                  </pre>
                </details>
              )}
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ChunkErrorBoundary; 