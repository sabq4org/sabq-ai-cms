"use client";

import React, { ComponentType, Suspense, lazy } from "react";
import { ComponentValidator } from "./ComponentValidator";
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
  name = "Component",
}: SafeComponentLoaderProps) {
  // إنشاء lazy component مع معالجة محسنة للأخطاء
  const LazyComponent = React.useMemo(() => {
    return lazy(async () => {
      try {
        console.log(`🔄 Loading component: ${name}`);
        const module = await component();

        // التحقق الشامل من صحة المكون
        if (!module) {
          throw new Error(`Component ${name} module is null or undefined`);
        }

        if (!module.default) {
          // محاولة البحث عن export آخر
          const exports = Object.keys(module);
          if (exports.length > 0) {
            console.warn(
              `⚠️ No default export in ${name}, trying named export: ${exports[0]}`
            );
            // محاولة استخدام أول named export
            const Component = module[exports[0]];
            if (typeof Component === "function") {
              return { default: Component };
            }
          }
          throw new Error(`Component ${name} does not have a valid export`);
        }

        // التحقق من نوع المكون
        const ComponentType = module.default;
        if (
          typeof ComponentType !== "function" &&
          typeof ComponentType !== "object"
        ) {
          throw new Error(
            `Component ${name} default export is not a valid React component`
          );
        }

        console.log(`✅ Component loaded successfully: ${name}`);
        return module;
      } catch (error) {
        console.error(`❌ Failed to load component ${name}:`, error);

        // تسجيل الخطأ للتشخيص
        if (typeof window !== "undefined") {
          window.dispatchEvent(
            new CustomEvent("component-load-error", {
              detail: { name, error: error?.toString() },
            })
          );
        }

        // إرجاع مكون fallback آمن
        return {
          default: React.memo(() => {
            React.useEffect(() => {
              console.warn(`🔧 Fallback component rendered for: ${name}`);
            }, []);

            return (
              <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                <p className="text-yellow-800 dark:text-yellow-200 text-sm">
                  ⚠️ تعذر تحميل المكون: {name}
                </p>
                <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">
                  {error instanceof Error ? error.message : "خطأ غير معروف"}
                </p>
              </div>
            );
          }),
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

  // إضافة معالج للأخطاء الخاصة بـ React #130
  React.useEffect(() => {
    const handleRecovery = (event: Event) => {
      if ((event as CustomEvent).detail?.errorType === "React130") {
        console.log(`🔄 Attempting recovery for component: ${name}`);
        // Force re-render by changing key
        setComponentKey((prev) => prev + 1);
      }
    };

    window.addEventListener("react-error-recovery", handleRecovery);
    window.addEventListener("component-error-recovery", handleRecovery);

    return () => {
      window.removeEventListener("react-error-recovery", handleRecovery);
      window.removeEventListener("component-error-recovery", handleRecovery);
    };
  }, [name]);

  const [componentKey, setComponentKey] = React.useState(0);

  return (
    <EnhancedErrorBoundary
      key={componentKey}
      fallback={errorFallback || defaultErrorFallback}
    >
      <ComponentValidator
        componentName={name}
        fallback={errorFallback || defaultErrorFallback}
      >
        <Suspense fallback={fallback || defaultFallback}>
          <LazyComponent {...props} />
        </Suspense>
      </ComponentValidator>
    </EnhancedErrorBoundary>
  );
}

// Hook مساعد لاستخدام Safe Component Loader
export function useSafeComponent(
  componentLoader: () => Promise<{ default: ComponentType<any> }>,
  name?: string
) {
  const [Component, setComponent] = React.useState<ComponentType<any> | null>(
    null
  );
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
            throw new Error(
              `Component ${name || "Unknown"} does not have a default export`
            );
          }
        }
      } catch (err) {
        if (mounted) {
          console.error(`Failed to load component ${name || "Unknown"}:`, err);
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
              width: skeletonProps?.width,
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
  },
};

export default SafeComponentLoader;
