"use client";

import { MuqtarabPageSkeleton } from "@/components/muqtarab/MuqtarabSkeletons";
import React, { Suspense } from "react";

// Safe wrapper لمعالجة خطأ React #130
export function SafeMuqtarabWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <React.StrictMode>
      <Suspense fallback={<MuqtarabPageSkeleton />}>
        <ErrorBoundary>{children}</ErrorBoundary>
      </Suspense>
    </React.StrictMode>
  );
}

// Error Boundary مبسط لمعالجة خطأ React #130
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; errorMessage?: string }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    // تحديث state لإظهار fallback UI
    console.warn("🔧 React Error intercepted:", error.message);
    return {
      hasError: true,
      errorMessage: error.message.includes("Minified React error #130")
        ? "React rendering error"
        : error.message,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // معالجة خاصة لخطأ React #130
    if (error.message.includes("Minified React error #130")) {
      console.warn("🔧 React #130 error intercepted and handled");

      // إعادة تعيين الحالة بعد فترة قصيرة
      setTimeout(() => {
        this.setState({ hasError: false, errorMessage: undefined });
      }, 100);

      return;
    }

    console.error("Component error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // Fallback UI للأخطاء
      return <MuqtarabPageSkeleton />;
    }

    return this.props.children;
  }
}
