'use client';

import React, { useState, useEffect, Suspense } from 'react';
import dynamic from 'next/dynamic';
import { EditorErrorBoundary } from '@/components/ErrorBoundary';
import { Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

// مكونات التحميل المخصصة
const EditorLoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-[400px] bg-gray-50 dark:bg-gray-800 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600">
    <div className="text-center">
      <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-3" />
      <p className="text-gray-600 dark:text-gray-400 text-sm">جاري تحميل المحرر...</p>
      <div className="mt-2 text-xs text-gray-500 dark:text-gray-500">
        قد يستغرق هذا بضع ثوانٍ
      </div>
    </div>
  </div>
);

const EditorLoadingError = ({ error, retry }: { error: Error; retry: () => void }) => (
  <div className="flex items-center justify-center min-h-[400px] bg-red-50 dark:bg-red-900/20 rounded-lg border-2 border-red-200 dark:border-red-800">
    <div className="text-center max-w-md p-6">
      <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
      <h3 className="text-lg font-semibold text-red-800 dark:text-red-200 mb-2">
        فشل تحميل المحرر
      </h3>
      <p className="text-red-600 dark:text-red-300 text-sm mb-4">
        حدث خطأ أثناء تحميل مكونات المحرر. يرجى المحاولة مرة أخرى.
      </p>
      <Button
        onClick={retry}
        className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white"
      >
        <RefreshCw className="w-4 h-4" />
        إعادة المحاولة
      </Button>
      {process.env.NODE_ENV === 'development' && (
        <details className="mt-4 text-left">
          <summary className="cursor-pointer text-sm text-red-700 dark:text-red-300">
            تفاصيل الخطأ
          </summary>
          <pre className="mt-2 text-xs bg-red-100 dark:bg-red-900/40 p-2 rounded overflow-auto">
            {error.message}
          </pre>
        </details>
      )}
    </div>
  </div>
);

// التحميل الديناميكي المحسن للمحررات
const DynamicTiptapEditor = dynamic(
  () => import('./Editor').then(mod => ({ default: mod.default })),
  {
    ssr: false,
    loading: EditorLoadingSpinner
  }
);

const DynamicRealtimeEditor = dynamic(
  () => import('../ArticleEditor/RealtimeEditor').then(mod => ({ default: mod.default })),
  {
    ssr: false,
    loading: EditorLoadingSpinner
  }
);

const DynamicContentEditor = dynamic(
  () => import('../ContentEditor').then(mod => ({ default: mod.default })),
  {
    ssr: false,
    loading: EditorLoadingSpinner
  }
);

const DynamicContentEditorWithTiptap = dynamic(
  () => import('../ContentEditorWithTiptap').then(mod => ({ default: mod.default })),
  {
    ssr: false,
    loading: EditorLoadingSpinner
  }
);

export type EditorType = 'tiptap' | 'realtime' | 'content' | 'content-tiptap';

interface SafeEditorLoaderProps {
  editorType: EditorType;
  fallbackComponent?: React.ComponentType<{ error: Error; retry: () => void }>;
  loadingComponent?: React.ComponentType;
  retryAttempts?: number;
  onLoadError?: (error: Error) => void;
  onLoadSuccess?: () => void;
  [key: string]: any; // للسماح بتمرير props إضافية للمحرر
}

const SafeEditorLoader: React.FC<SafeEditorLoaderProps> = ({
  editorType,
  fallbackComponent = EditorLoadingError,
  loadingComponent = EditorLoadingSpinner,
  retryAttempts = 3,
  onLoadError,
  onLoadSuccess,
  ...editorProps
}) => {
  const [loadAttempt, setLoadAttempt] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<Error | null>(null);

  // إعادة تعيين الحالة عند تغيير نوع المحرر
  useEffect(() => {
    setLoadAttempt(0);
    setIsLoading(true);
    setLoadError(null);
  }, [editorType]);

  // معالج إعادة المحاولة
  const handleRetry = () => {
    if (loadAttempt < retryAttempts) {
      setLoadAttempt(prev => prev + 1);
      setLoadError(null);
      setIsLoading(true);
    }
  };

  // معالج نجاح التحميل
  const handleLoadSuccess = () => {
    setIsLoading(false);
    setLoadError(null);
    onLoadSuccess?.();
  };

  // معالج فشل التحميل
  const handleLoadError = (error: Error) => {
    setIsLoading(false);
    setLoadError(error);
    onLoadError?.(error);
    
    // تسجيل الخطأ
    console.error(`Failed to load ${editorType} editor (attempt ${loadAttempt + 1}):`, error);
  };

  // اختيار المحرر المناسب
  const getEditorComponent = () => {
    const commonProps = {
      ...editorProps,
      key: `${editorType}-${loadAttempt}` // إجبار إعادة التحميل عند إعادة المحاولة
    };

    switch (editorType) {
      case 'tiptap':
        return <DynamicTiptapEditor {...commonProps} />;
      case 'realtime':
        return <DynamicRealtimeEditor {...commonProps} />;
      case 'content':
        return <DynamicContentEditor {...commonProps} />;
      case 'content-tiptap':
        return <DynamicContentEditorWithTiptap {...commonProps} />;
      default:
        throw new Error(`Unknown editor type: ${editorType}`);
    }
  };

  // إذا كان هناك خطأ في التحميل وتم استنفاد المحاولات
  if (loadError && loadAttempt >= retryAttempts) {
    const FallbackComponent = fallbackComponent;
    return <FallbackComponent error={loadError} retry={handleRetry} />;
  }

  return (
    <EditorErrorBoundary
      context={`SafeEditorLoader-${editorType}`}
      onError={handleLoadError}
      fallback={fallbackComponent}
    >
      <Suspense fallback={<EditorLoadingSpinner />}>
        <div className="editor-container">
          {getEditorComponent()}
        </div>
      </Suspense>
    </EditorErrorBoundary>
  );
};

export default SafeEditorLoader;