"use client";

import React from "react";

interface ComponentValidatorProps {
  children: React.ReactNode;
  componentName?: string;
  fallback?: React.ReactNode;
}

// مكون للتحقق من صحة المكونات قبل الrender
export function ComponentValidator({ 
  children, 
  componentName = "Component",
  fallback 
}: ComponentValidatorProps) {
  const [isValid, setIsValid] = React.useState(true);
  const [validationError, setValidationError] = React.useState<string | null>(null);

  React.useEffect(() => {
    // التحقق من صحة المكون
    try {
      // فحص إذا كان children صالح للـ render
      if (children === null || children === undefined) {
        throw new Error(`${componentName} children is null or undefined`);
      }

      // فحص إذا كان المكون يحتوي على عناصر صالحة
      React.Children.forEach(children, (child) => {
        if (React.isValidElement(child)) {
          // فحص نوع العنصر
          if (typeof child.type === 'string') {
            // HTML element - صالح
            return;
          } else if (typeof child.type === 'function') {
            // React component - صالح
            return;
          } else if (child.type === undefined || child.type === null) {
            throw new Error(`Invalid element type in ${componentName}: ${child.type}`);
          }
        }
      });

      setIsValid(true);
      setValidationError(null);
      
    } catch (error) {
      console.error(`🔍 Component Validation Error in ${componentName}:`, error);
      setIsValid(false);
      setValidationError(error instanceof Error ? error.message : "Unknown validation error");
    }
  }, [children, componentName]);

  if (!isValid) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-yellow-600 dark:text-yellow-400">⚠️</span>
          <span className="font-medium text-yellow-800 dark:text-yellow-200">
            مشكلة في المكون: {componentName}
          </span>
        </div>
        {validationError && (
          <p className="text-sm text-yellow-700 dark:text-yellow-300">
            {validationError}
          </p>
        )}
      </div>
    );
  }

  return <>{children}</>;
}

// Hook للتحقق من صحة القيم
export function useComponentValidation(value: any, componentName: string) {
  const [isValid, setIsValid] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    try {
      // فحص القيم الأساسية
      if (value === undefined) {
        throw new Error(`${componentName} received undefined value`);
      }

      if (typeof value === 'object' && value !== null) {
        // فحص إذا كان object صالح
        if (React.isValidElement(value)) {
          if (!value.type) {
            throw new Error(`${componentName} received element with invalid type`);
          }
        }
      }

      setIsValid(true);
      setError(null);
    } catch (err) {
      setIsValid(false);
      setError(err instanceof Error ? err.message : "Validation error");
      console.warn(`🔍 Validation warning in ${componentName}:`, err);
    }
  }, [value, componentName]);

  return { isValid, error };
}

// Wrapper للمكونات الديناميكية
export function SafeComponent({ 
  component: Component, 
  props = {}, 
  componentName = "DynamicComponent",
  fallback 
}: {
  component: React.ComponentType<any>;
  props?: any;
  componentName?: string;
  fallback?: React.ReactNode;
}) {
  const [renderError, setRenderError] = React.useState<Error | null>(null);

  // Reset error عند تغيير المكون
  React.useEffect(() => {
    setRenderError(null);
  }, [Component]);

  try {
    // التحقق من صحة المكون
    if (!Component) {
      throw new Error(`${componentName} is null or undefined`);
    }

    if (typeof Component !== 'function') {
      throw new Error(`${componentName} is not a valid React component`);
    }

    // محاولة الrender
    return (
      <ComponentValidator componentName={componentName} fallback={fallback}>
        <Component {...props} />
      </ComponentValidator>
    );
    
  } catch (error) {
    console.error(`🚨 SafeComponent Error in ${componentName}:`, error);
    
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-red-600 dark:text-red-400">❌</span>
          <span className="font-medium text-red-800 dark:text-red-200">
            خطأ في تحميل المكون: {componentName}
          </span>
        </div>
        <p className="text-sm text-red-700 dark:text-red-300">
          {error instanceof Error ? error.message : "Unknown component error"}
        </p>
      </div>
    );
  }
}

export default ComponentValidator;