'use client';

import React from 'react';
import { EditorErrorBoundary } from '@/components/ErrorBoundary';
import SafeEditorLoader, { EditorType } from './SafeEditorLoader';

interface EditorWithErrorBoundaryProps {
  editorType: EditorType;
  onError?: (error: Error) => void;
  [key: string]: any;
}

/**
 * مكون محرر محمي بـ Error Boundary
 * يوفر طبقة حماية إضافية للمحررات
 */
const EditorWithErrorBoundary: React.FC<EditorWithErrorBoundaryProps> = ({
  editorType,
  onError,
  ...editorProps
}) => {
  const handleError = (error: Error, errorInfo: React.ErrorInfo) => {
    // تسجيل الخطأ مع معلومات إضافية
    console.error('Editor Error:', {
      editorType,
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack
    });

    // استدعاء callback إذا كان موجوداً
    onError?.(error);
  };

  return (
    <EditorErrorBoundary
      context={`Editor-${editorType}`}
      onError={handleError}
    >
      <SafeEditorLoader
        editorType={editorType}
        {...editorProps}
      />
    </EditorErrorBoundary>
  );
};

export default EditorWithErrorBoundary;