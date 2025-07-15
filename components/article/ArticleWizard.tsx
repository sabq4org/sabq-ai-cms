'use client';

import React, { useState, ReactNode } from 'react';
import { ChevronRight, ChevronLeft, Check, Circle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Step {
  id: string;
  title: string;
  description: string;
  icon: ReactNode;
}

interface ArticleWizardProps {
  steps: Step[];
  children: (currentStep: number, goToStep: (step: number) => void) => ReactNode;
  onComplete?: () => void;
  className?: string;
}

export function ArticleWizard({ steps, children, onComplete, className }: ArticleWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());

  const goToStep = (stepIndex: number) => {
    if (stepIndex >= 0 && stepIndex < steps.length) {
      setCurrentStep(stepIndex);
    }
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCompletedSteps(prev => new Set([...prev, currentStep]));
      setCurrentStep(currentStep + 1);
    } else if (currentStep === steps.length - 1) {
      setCompletedSteps(prev => new Set([...prev, currentStep]));
      onComplete?.();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const isStepCompleted = (stepIndex: number) => completedSteps.has(stepIndex);
  const canAccessStep = (stepIndex: number) => {
    // يمكن الوصول للخطوة إذا كانت الحالية أو سابقة أو تم إكمال كل الخطوات السابقة لها
    if (stepIndex === 0) return true;
    if (stepIndex <= currentStep) return true;
    
    // التحقق من إكمال كل الخطوات السابقة
    for (let i = 0; i < stepIndex; i++) {
      if (!isStepCompleted(i)) return false;
    }
    return true;
  };

  return (
    <div className={cn("w-full", className)}>
      {/* شريط التقدم */}
      <div className="mb-8">
        <div className="flex items-center justify-between relative">
          {/* الخط الواصل */}
          <div className="absolute top-5 right-0 left-0 h-0.5 bg-gray-200 dark:bg-gray-700">
            <div 
              className="h-full bg-blue-600 transition-all duration-300"
              style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
            />
          </div>

          {/* الخطوات */}
          {steps.map((step, index) => {
            const isActive = index === currentStep;
            const isCompleted = isStepCompleted(index);
            const canAccess = canAccessStep(index);

            return (
              <div
                key={step.id}
                className="relative z-10 flex flex-col items-center cursor-pointer"
                onClick={() => canAccess && goToStep(index)}
              >
                {/* دائرة الخطوة */}
                <div
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300",
                    isActive && "ring-4 ring-blue-100 dark:ring-blue-900",
                    isCompleted && "bg-green-600 text-white",
                    isActive && !isCompleted && "bg-blue-600 text-white",
                    !isActive && !isCompleted && canAccess && "bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 hover:border-blue-400",
                    !canAccess && "bg-gray-100 dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700 cursor-not-allowed"
                  )}
                >
                  {isCompleted ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <span className="text-sm font-medium">
                      {index + 1}
                    </span>
                  )}
                </div>

                {/* عنوان الخطوة */}
                <div className="mt-2 text-center">
                  <p className={cn(
                    "text-sm font-medium transition-colors duration-200",
                    isActive && "text-blue-600 dark:text-blue-400",
                    !isActive && canAccess && "text-gray-700 dark:text-gray-300",
                    !canAccess && "text-gray-400 dark:text-gray-600"
                  )}>
                    {step.title}
                  </p>
                  {isActive && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 max-w-[150px]">
                      {step.description}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* محتوى الخطوة */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 mb-6 min-h-[400px]">
        {children(currentStep, goToStep)}
      </div>

      {/* أزرار التنقل */}
      <div className="flex items-center justify-between">
        <button
          onClick={prevStep}
          disabled={currentStep === 0}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200",
            currentStep === 0
              ? "bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed"
              : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
          )}
        >
          <ChevronRight className="w-4 h-4" />
          <span>السابق</span>
        </button>

        <div className="flex items-center gap-2">
          {steps.map((_, index) => (
            <button
              key={index}
              onClick={() => canAccessStep(index) && goToStep(index)}
              className={cn(
                "w-2 h-2 rounded-full transition-all duration-200",
                index === currentStep
                  ? "w-8 bg-blue-600"
                  : canAccessStep(index)
                  ? "bg-gray-300 dark:bg-gray-600 hover:bg-gray-400"
                  : "bg-gray-200 dark:bg-gray-700 cursor-not-allowed"
              )}
            />
          ))}
        </div>

        <button
          onClick={nextStep}
          className={cn(
            "flex items-center gap-2 px-6 py-2 rounded-lg transition-all duration-200",
            "bg-blue-600 text-white hover:bg-blue-700",
            currentStep === steps.length - 1 && "bg-green-600 hover:bg-green-700"
          )}
        >
          <span>{currentStep === steps.length - 1 ? 'إكمال' : 'التالي'}</span>
          <ChevronLeft className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
} 