'use client';

import React from 'react';
import ServerErrorFallback from '@/components/ServerErrorFallback';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  React.useEffect(() => {
    // تسجيل الخطأ
    console.error('خطأ في التطبيق:', error);
  }, [error]);

  return <ServerErrorFallback />;
}