"use client";

import React, { Suspense, lazy, ComponentType } from "react";
import EnhancedErrorBoundary from "./ErrorBoundary/EnhancedErrorBoundary";
import { Skeleton } from "./ui/skeleton";

interface SafeComponentLoaderProps {
  component: () => Promise<{ default: ComponentType<any> }>;
  fallback?: React.ReactNode;
  errorFallback?: React.ReactNode;
  props?: any;
  name?: string;
}

// Safe Component Loader لمعالجة dynamic imports بأمان
export function SafeComponentLoader({
  component,
  fallback,
  errorFallback,
  props,
  name = "Component"
}: SafeComponentLoaderProps) {
  // إنشاء lazy component مع معالجة الأخطاء
  const LazyComponent = React.useMemo(() => {
    return lazy(async () => {
      try {
        console.log(`🔄 Loading component: ${name}`);
        const module = await component();
        
        // التحقق من صحة المكون
        if (!module || !module.default) {
          throw new Error(`Component ${name} does not have a default export`);
        }
        
        console.log(`✅ Component loaded successfully: ${name}`);
        return module;
      } catch (error) {
        console.error(`❌ Failed to load component ${name}:`, error);
        
        // إرجاع مكون fallback بدلاً من الخطأ
        return {
          default: () => (
            <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
              <p className="text-yellow-800 dark:text-yellow-200 text-sm">
                ⚠️ تعذر تحميل المكون: {name}
              </p>
            </div>
          )
        };
      }
    });
  }, [component, name]);

  const defaultFallback = (
    <div className="animate-pulse">
      <Skeleton className="w-full h-32 rounded-lg" />
    </div>
  );

  const defaultErrorFallback = (
    <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
      <p className="text-red-800 dark:text-red-200 text-sm">
        ❌ خطأ في تحميل المكون: {name}
      </p>
    </div>
  );

  return (
    <EnhancedErrorBoundary fallback={errorFallback || defaultErrorFallback}>
      <Suspense fallback={fallback || defaultFallback}>
        <LazyComponent {...props} />
      </Suspense>
    </EnhancedErrorBoundary>
  );
}

// Hook مساعد لاستخدام Safe Component Loader
export function useSafeComponent(
  componentLoader: () => Promise<{ default: ComponentType<any> }>,
  name?: string
) {
  const [Component, setComponent] = React.useState<ComponentType<any> | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<Error | null>(null);

  React.useEffect(() => {
    let mounted = true;

    const loadComponent = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const module = await componentLoader();
        
        if (mounted) {
          if (module && module.default) {
            setComponent(() => module.default);
          } else {
            throw new Error(`Component ${name || 'Unknown'} does not have a default export`);
          }
        }
      } catch (err) {
        if (mounted) {
          console.error(`Failed to load component ${name || 'Unknown'}:`, err);
          setError(err as Error);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadComponent();

    return () => {
      mounted = false;
    };
  }, [componentLoader, name]);

  return { Component, loading, error };
}

// مكونات Safe Dynamic محسنة للاستخدام الشائع
export const SafeDynamicComponent = {
  // تحميل آمن للمكونات مع Skeleton
  withSkeleton: (
    componentLoader: () => Promise<{ default: ComponentType<any> }>,
    skeletonProps?: { className?: string; height?: string; width?: string }
  ) => {
    return React.memo((props: any) => (
      <SafeComponentLoader
        component={componentLoader}
        fallback={
          <Skeleton 
            className={skeletonProps?.className || "w-full h-32 rounded-lg"}
            style={{
              height: skeletonProps?.height,
              width: skeletonProps?.width
            }}
          />
        }
        props={props}
        name={componentLoader.name}
      />
    ));
  },

  // تحميل آمن للمكونات مع Loading spinner
  withSpinner: (
    componentLoader: () => Promise<{ default: ComponentType<any> }>
  ) => {
    return React.memo((props: any) => (
      <SafeComponentLoader
        component={componentLoader}
        fallback={
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        }
        props={props}
        name={componentLoader.name}
      />
    ));
  },

  // تحميل آمن مع Custom fallback
  withCustomFallback: (
    componentLoader: () => Promise<{ default: ComponentType<any> }>,
    fallback: React.ReactNode,
    errorFallback?: React.ReactNode
  ) => {
    return React.memo((props: any) => (
      <SafeComponentLoader
        component={componentLoader}
        fallback={fallback}
        errorFallback={errorFallback}
        props={props}
        name={componentLoader.name}
      />
    ));
  }
};

export default SafeComponentLoader;