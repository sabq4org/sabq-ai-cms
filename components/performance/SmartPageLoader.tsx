"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

interface SmartPageLoaderProps {
  minimumLoadingTime?: number;
  showLogo?: boolean;
  showProgressBar?: boolean;
  showSpinner?: boolean;
  onLoadComplete?: () => void;
}

export default function SmartPageLoader({
  minimumLoadingTime = 800,
  showLogo = true,
  showProgressBar = true,
  showSpinner = true,
  onLoadComplete
}: SmartPageLoaderProps) {
  const [progress, setProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  
  useEffect(() => {
    let startTime = Date.now();
    let progressInterval: NodeJS.Timeout;
    let completionTimeout: NodeJS.Timeout;
    
    // محاكاة تقدم التحميل
    progressInterval = setInterval(() => {
      setProgress(prevProgress => {
        // تسريع التقدم مع اقترابنا من 100%
        const remaining = 100 - prevProgress;
        const increment = Math.max(0.5, remaining / 10);
        
        // التأكد من عدم تجاوز 98% قبل اكتمال التحميل الفعلي
        return Math.min(98, prevProgress + increment);
      });
    }, 100);
    
    // التعامل مع اكتمال التحميل
    const handleLoadComplete = () => {
      clearInterval(progressInterval);
      
      // التأكد من مرور الحد الأدنى من الوقت
      const elapsedTime = Date.now() - startTime;
      const remainingTime = Math.max(0, minimumLoadingTime - elapsedTime);
      
      // إكمال التقدم إلى 100% بعد انتهاء الحد الأدنى من الوقت
      setTimeout(() => {
        setProgress(100);
        
        // إخفاء المكون بعد اكتمال التقدم
        setTimeout(() => {
          setIsVisible(false);
          if (onLoadComplete) {
            onLoadComplete();
          }
        }, 500);
      }, remainingTime);
    };
    
    // التعامل مع اكتمال تحميل الصفحة
    if (document.readyState === 'complete') {
      handleLoadComplete();
    } else {
      window.addEventListener('load', handleLoadComplete);
    }
    
    // تعيين مهلة قصوى للتحميل (10 ثوانٍ)
    completionTimeout = setTimeout(() => {
      handleLoadComplete();
    }, 10000);
    
    return () => {
      clearInterval(progressInterval);
      clearTimeout(completionTimeout);
      window.removeEventListener('load', handleLoadComplete);
    };
  }, [minimumLoadingTime, onLoadComplete]);
  
  // إخفاء المكون عند اكتمال التحميل
  if (!isVisible) {
    return null;
  }
  
  return (
    <motion.div
      initial={{ opacity: 1 }}
      animate={{ opacity: progress === 100 ? 0 : 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-white dark:bg-gray-900 z-50 flex flex-col items-center justify-center"
    >
      {showLogo && (
        <div className="mb-8 flex items-center">
          <Sparkles className="h-8 w-8 text-blue-600 dark:text-blue-400 mr-2" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            سبق الذكية
          </h1>
        </div>
      )}
      
      {showSpinner && (
        <div className="mb-6">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
            className="w-12 h-12 border-4 border-blue-200 dark:border-blue-900 border-t-blue-600 dark:border-t-blue-400 rounded-full"
          />
        </div>
      )}
      
      {showProgressBar && (
        <div className="w-64 bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-4">
          <motion.div
            className="bg-blue-600 dark:bg-blue-400 h-2 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      )}
      
      <p className="text-sm text-gray-500 dark:text-gray-400">
        جاري تحميل المحتوى... {Math.round(progress)}%
      </p>
    </motion.div>
  );
}
