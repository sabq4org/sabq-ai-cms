'use client';

import React, { useState, ReactNode, useEffect, useMemo, useCallback } from 'react';
import { ChevronRight, ChevronLeft, Check, Circle, Zap, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface Step {
  id: string;
  title: string;
  description: string;
  icon: ReactNode;
  isOptional?: boolean;
  validation?: () => { isValid: boolean; errors?: string[] };
}

interface ArticleWizardEnhancedProps {
  steps: Step[];
  children: (currentStep: number, goToStep: (step: number) => void) => ReactNode;
  onComplete?: () => void;
  className?: string;
  enableAutoSave?: boolean;
  onAutoSave?: (stepData: any) => Promise<void>;
  initialStep?: number;
  showProgressPercentage?: boolean;
  enableKeyboardNavigation?: boolean;
  minimalistMode?: boolean;
}

export function ArticleWizardEnhanced({ 
  steps, 
  children, 
  onComplete, 
  className,
  enableAutoSave = true,
  onAutoSave,
  initialStep = 0,
  showProgressPercentage = true,
  enableKeyboardNavigation = true,
  minimalistMode = true
}: ArticleWizardEnhancedProps) {
  const [currentStep, setCurrentStep] = useState(initialStep);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [stepErrors, setStepErrors] = useState<Map<number, string[]>>(new Map());
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [lastAutoSave, setLastAutoSave] = useState<Date | null>(null);

  // حساب نسبة التقدم
  const progressPercentage = useMemo(() => {
    return Math.round((completedSteps.size / steps.length) * 100);
  }, [completedSteps.size, steps.length]);

  // التحقق من صحة الخطوة الحالية
  const validateCurrentStep = useCallback(() => {
    const step = steps[currentStep];
    if (step.validation) {
      const validation = step.validation();
      if (!validation.isValid) {
        setStepErrors(prev => new Map(prev).set(currentStep, validation.errors || []));
        return false;
      }
    }
    setStepErrors(prev => {
      const newMap = new Map(prev);
      newMap.delete(currentStep);
      return newMap;
    });
    return true;
  }, [currentStep, steps]);

  // الانتقال إلى خطوة محددة
  const goToStep = useCallback((stepIndex: number) => {
    if (stepIndex >= 0 && stepIndex < steps.length && !isTransitioning) {
      // التحقق من صحة الخطوة الحالية قبل الانتقال
      if (stepIndex > currentStep && !validateCurrentStep()) {
        return;
      }

      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentStep(stepIndex);
        setIsTransitioning(false);
      }, 300);
    }
  }, [currentStep, steps.length, isTransitioning, validateCurrentStep]);

  // الخطوة التالية
  const nextStep = useCallback(() => {
    if (!validateCurrentStep()) return;

    if (currentStep < steps.length - 1) {
      setCompletedSteps(prev => new Set([...prev, currentStep]));
      goToStep(currentStep + 1);
    } else if (currentStep === steps.length - 1) {
      setCompletedSteps(prev => new Set([...prev, currentStep]));
      onComplete?.();
    }
  }, [currentStep, steps.length, validateCurrentStep, goToStep, onComplete]);

  // الخطوة السابقة
  const prevStep = useCallback(() => {
    if (currentStep > 0) {
      goToStep(currentStep - 1);
    }
  }, [currentStep, goToStep]);

  // التنقل بلوحة المفاتيح
  useEffect(() => {
    if (!enableKeyboardNavigation) return;

    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        if (e.key === 'ArrowRight') {
          e.preventDefault();
          nextStep();
        } else if (e.key === 'ArrowLeft') {
          e.preventDefault();
          prevStep();
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [enableKeyboardNavigation, nextStep, prevStep]);

  // الحفظ التلقائي
  useEffect(() => {
    if (!enableAutoSave || !onAutoSave) return;

    const autoSaveInterval = setInterval(async () => {
      try {
        await onAutoSave({ currentStep, completedSteps: Array.from(completedSteps) });
        setLastAutoSave(new Date());
      } catch (error) {
        console.error('Auto-save failed:', error);
      }
    }, 30000); // كل 30 ثانية

    return () => clearInterval(autoSaveInterval);
  }, [enableAutoSave, onAutoSave, currentStep, completedSteps]);

  const isStepCompleted = (stepIndex: number) => completedSteps.has(stepIndex);
  const hasStepErrors = (stepIndex: number) => stepErrors.has(stepIndex);

  return (
    <div className={cn("w-full", className)}>
      {/* شريط التقدم المبسط */}
      {!minimalistMode && (
        <div className="mb-8">
          <div className="flex items-center justify-between relative">
            {/* الخط الواصل */}
            <div className="absolute top-5 right-0 left-0 h-0.5 bg-gray-200 dark:bg-gray-700">
              <motion.div 
                className="h-full bg-gradient-to-l from-blue-600 to-blue-500"
                initial={{ width: 0 }}
                animate={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              />
            </div>

            {/* الخطوات */}
            {steps.map((step, index) => {
              const isActive = index === currentStep;
              const isCompleted = isStepCompleted(index);
              const hasErrors = hasStepErrors(index);

              return (
                <motion.div
                  key={step.id}
                  className="relative z-10 flex flex-col items-center cursor-pointer"
                  onClick={() => goToStep(index)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {/* دائرة الخطوة */}
                  <div
                    className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300",
                      isActive && "ring-4 ring-blue-100 dark:ring-blue-900",
                      isCompleted && !hasErrors && "bg-green-600 text-white",
                      hasErrors && "bg-red-600 text-white",
                      isActive && !isCompleted && "bg-blue-600 text-white",
                      !isActive && !isCompleted && !hasErrors && "bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600"
                    )}
                  >
                    {isCompleted && !hasErrors ? (
                      <Check className="w-5 h-5" />
                    ) : hasErrors ? (
                      <AlertCircle className="w-5 h-5" />
                    ) : (
                      <span className="text-sm font-medium">{index + 1}</span>
                    )}
                  </div>

                  {/* عنوان الخطوة - مخفي في الوضع البسيط على الموبايل */}
                  <div className={cn(
                    "absolute top-14 text-center transition-opacity duration-200",
                    isActive ? "opacity-100" : "opacity-70",
                    "hidden sm:block"
                  )}>
                    <p className="text-sm font-medium whitespace-nowrap">
                      {step.title}
                    </p>
                    {step.isOptional && (
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        اختياري
                      </p>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* شريط التقدم المبسط للوضع Minimalist */}
      {minimalistMode && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                الخطوة {currentStep + 1} من {steps.length}
              </span>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                • {steps[currentStep].title}
              </span>
            </div>
            {showProgressPercentage && (
              <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                {progressPercentage}%
              </span>
            )}
          </div>
          <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-l from-blue-600 to-blue-500"
              initial={{ width: 0 }}
              animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
          </div>
        </div>
      )}

      {/* محتوى الخطوة */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          className="mb-8"
        >
          {children(currentStep, goToStep)}
        </motion.div>
      </AnimatePresence>

      {/* عرض الأخطاء */}
      {stepErrors.get(currentStep) && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg"
        >
          <p className="text-sm font-medium text-red-800 dark:text-red-200 mb-2">
            يرجى تصحيح الأخطاء التالية:
          </p>
          <ul className="list-disc list-inside space-y-1">
            {stepErrors.get(currentStep)?.map((error, index) => (
              <li key={index} className="text-sm text-red-700 dark:text-red-300">
                {error}
              </li>
            ))}
          </ul>
        </motion.div>
      )}

      {/* أزرار التنقل */}
      <div className="flex items-center justify-between">
        <button
          onClick={prevStep}
          disabled={currentStep === 0}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200",
            currentStep === 0
              ? "bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed"
              : "bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200"
          )}
        >
          <ChevronRight className="w-4 h-4" />
          السابق
        </button>

        {/* معلومات الحفظ التلقائي */}
        {enableAutoSave && lastAutoSave && (
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <Zap className="w-4 h-4" />
            آخر حفظ تلقائي: {lastAutoSave.toLocaleTimeString('ar-SA')}
          </div>
        )}

        <button
          onClick={nextStep}
          className={cn(
            "flex items-center gap-2 px-6 py-2 rounded-lg transition-all duration-200",
            "bg-blue-600 hover:bg-blue-700 text-white font-medium",
            "transform hover:scale-105 active:scale-95"
          )}
        >
          {currentStep === steps.length - 1 ? 'إنهاء' : 'التالي'}
          <ChevronLeft className="w-4 h-4" />
        </button>
      </div>

      {/* تلميحات لوحة المفاتيح */}
      {enableKeyboardNavigation && (
        <div className="mt-4 text-center text-xs text-gray-500 dark:text-gray-400">
          تلميح: استخدم <kbd className="px-1 py-0.5 bg-gray-200 dark:bg-gray-700 rounded">Ctrl + →</kbd> للتالي 
          و <kbd className="px-1 py-0.5 bg-gray-200 dark:bg-gray-700 rounded">Ctrl + ←</kbd> للسابق
        </div>
      )}
    </div>
  );
} 