"use client";

import Link from "next/link";
import { useState } from "react";

export type AlertType = "error" | "warning" | "info" | "success";

interface SystemAlertProps {
  type?: AlertType;
  title: string;
  message: string;
  dismissible?: boolean;
  autoClose?: number; // بالمللي ثانية، مثال: 5000 = 5 ثوان
  actionText?: string;
  actionLink?: string;
  onAction?: () => void;
  onClose?: () => void;
}

export default function SystemAlert({
  type = "info",
  title,
  message,
  dismissible = true,
  autoClose,
  actionText,
  actionLink,
  onAction,
  onClose,
}: SystemAlertProps) {
  const [isVisible, setIsVisible] = useState(true);

  // خصائص التنسيق حسب نوع التنبيه
  const alertStyles = {
    error: {
      bg: "bg-red-50 dark:bg-red-900/20",
      border: "border-red-400 dark:border-red-800",
      text: "text-red-800 dark:text-red-200",
      icon: (
        <svg
          className="w-5 h-5 text-red-500 dark:text-red-400"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
            clipRule="evenodd"
          />
        </svg>
      ),
      button: "bg-red-500 hover:bg-red-600 text-white",
    },
    warning: {
      bg: "bg-yellow-50 dark:bg-yellow-900/20",
      border: "border-yellow-400 dark:border-yellow-800",
      text: "text-yellow-800 dark:text-yellow-200",
      icon: (
        <svg
          className="w-5 h-5 text-yellow-500 dark:text-yellow-400"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
            clipRule="evenodd"
          />
        </svg>
      ),
      button: "bg-yellow-500 hover:bg-yellow-600 text-white",
    },
    info: {
      bg: "bg-blue-50 dark:bg-blue-900/20",
      border: "border-blue-400 dark:border-blue-800",
      text: "text-blue-800 dark:text-blue-200",
      icon: (
        <svg
          className="w-5 h-5 text-blue-500 dark:text-blue-400"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zm-1 4a1 1 0 00-1 1v3a1 1 0 102 0v-3a1 1 0 00-1-1z"
            clipRule="evenodd"
          />
        </svg>
      ),
      button: "bg-blue-500 hover:bg-blue-600 text-white",
    },
    success: {
      bg: "bg-green-50 dark:bg-green-900/20",
      border: "border-green-400 dark:border-green-800",
      text: "text-green-800 dark:text-green-200",
      icon: (
        <svg
          className="w-5 h-5 text-green-500 dark:text-green-400"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
            clipRule="evenodd"
          />
        </svg>
      ),
      button: "bg-green-500 hover:bg-green-600 text-white",
    },
  };

  // إعداد الإغلاق التلقائي
  if (autoClose && isVisible) {
    setTimeout(() => {
      handleClose();
    }, autoClose);
  }

  // وظيفة الإغلاق
  const handleClose = () => {
    setIsVisible(false);
    if (onClose) {
      onClose();
    }
  };

  // وظيفة النقر على زر الإجراء
  const handleAction = () => {
    if (onAction) {
      onAction();
    }
  };

  // إذا كان التنبيه مخفيًا، لا تعرض شيئًا
  if (!isVisible) {
    return null;
  }

  const style = alertStyles[type];

  return (
    <div className={`p-4 mb-4 border-r-4 ${style.bg} ${style.border}`}>
      <div className="flex items-start">
        <div className="flex-shrink-0">{style.icon}</div>
        <div className="mr-3 flex-1">
          <h3 className={`text-lg font-medium ${style.text}`}>{title}</h3>
          <div className={`mt-2 ${style.text}`}>
            <p>{message}</p>
          </div>

          {/* إذا كان هناك نص إجراء وإما رابط أو وظيفة إجراء */}
          {actionText && (actionLink || onAction) && (
            <div className="mt-4">
              {actionLink ? (
                <Link
                  href={actionLink}
                  className={`px-4 py-2 rounded text-sm font-medium ${style.button}`}
                >
                  {actionText}
                </Link>
              ) : (
                <button
                  onClick={handleAction}
                  className={`px-4 py-2 rounded text-sm font-medium ${style.button}`}
                >
                  {actionText}
                </button>
              )}
            </div>
          )}
        </div>

        {/* زر الإغلاق إذا كان قابل للإغلاق */}
        {dismissible && (
          <button
            onClick={handleClose}
            className={`mr-auto -mx-1.5 -my-1.5 ${style.bg} ${style.text} rounded-lg focus:ring-2 focus:ring-${type}-400 p-1.5 inline-flex h-8 w-8`}
          >
            <span className="sr-only">إغلاق</span>
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}
