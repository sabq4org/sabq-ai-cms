/**
 * Error Boundary للمحرر الذكي
 * Smart Editor Error Boundary
 */

'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, RefreshCw } from 'lucide-react';
import React, { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class EditorErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Editor Error Boundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-700">
              <AlertCircle className="w-5 h-5" />
              خطأ في المحرر
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center space-y-4">
              <p className="text-red-600">
                حدث خطأ غير متوقع في المحرر. هذا قد يكون بسبب:
              </p>
              <ul className="text-sm text-red-600 text-right space-y-1">
                <li>• مشكلة في تحميل إضافات المحرر</li>
                <li>• تعارض في حزم JavaScript</li>
                <li>• مشكلة في الشبكة</li>
              </ul>

              <div className="flex flex-col sm:flex-row gap-2 justify-center">
                <Button
                  onClick={() => {
                    this.setState({ hasError: false, error: undefined });
                  }}
                  variant="outline"
                  className="text-red-600 border-red-200 hover:bg-red-100"
                >
                  <RefreshCw className="w-4 h-4 ml-1" />
                  إعادة المحاولة
                </Button>

                <Button
                  onClick={() => window.location.reload()}
                  className="bg-red-600 hover:bg-red-700"
                >
                  تحديث الصفحة
                </Button>
              </div>

              {this.state.error && (
                <details className="mt-4 text-xs text-left bg-gray-100 p-3 rounded">
                  <summary className="cursor-pointer text-gray-600 mb-2">
                    تفاصيل الخطأ التقنية
                  </summary>
                  <pre className="whitespace-pre-wrap text-red-600">
                    {this.state.error.message}
                    {'\n'}
                    {this.state.error.stack}
                  </pre>
                </details>
              )}
            </div>
          </CardContent>
        </Card>
      );
    }

    return this.props.children;
  }
}

export default EditorErrorBoundary;
