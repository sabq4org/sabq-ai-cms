"use client";

import { editorNotificationManager } from "@/lib/services/EditorNotificationFilter";
import { useEffect } from "react";
import { toast, Toaster } from "react-hot-toast";

// احتفاظ بالـ toast الأصلي
const originalToast = {
  success: toast.success,
  error: toast.error,
  loading: toast.loading,
  custom: toast.custom,
  promise: toast.promise,
  dismiss: toast.dismiss,
  remove: toast.remove,
};

export default function FilteredToaster() {
  useEffect(() => {
    // تأكد من أن المدير جاهز قبل التعديل
    if (!editorNotificationManager) {
      return;
    }

    // تأكد من أن التعديل لم يحدث من قبل
    if (toast.success !== originalToast.success) {
      return;
    }

    // استبدال دوال الـ toast بنسخ مفلترة مع حماية
    toast.success = (message: any, options?: any) => {
      try {
        const messageStr =
          typeof message === "string" ? message : String(message);
        if (
          !editorNotificationManager.shouldShowMessage(messageStr, "success")
        ) {
          editorNotificationManager.logFilteredMessage(messageStr, "success");
          return "";
        }
        const transformedMessage =
          editorNotificationManager.transformMessage(messageStr);
        return originalToast.success(transformedMessage, options);
      } catch (error) {
        console.warn("خطأ في toast.success:", error);
        return originalToast.success(message, options);
      }
    };

    toast.error = (message: any, options?: any) => {
      try {
        const messageStr =
          typeof message === "string" ? message : String(message);
        if (!editorNotificationManager.shouldShowMessage(messageStr, "error")) {
          editorNotificationManager.logFilteredMessage(messageStr, "error");
          return "";
        }
        const transformedMessage =
          editorNotificationManager.transformMessage(messageStr);
        return originalToast.error(transformedMessage, options);
      } catch (error) {
        console.warn("خطأ في toast.error:", error);
        return originalToast.error(message, options);
      }
    };

    toast.loading = (message: any, options?: any) => {
      try {
        const messageStr =
          typeof message === "string" ? message : String(message);
        if (!editorNotificationManager.shouldShowMessage(messageStr, "info")) {
          editorNotificationManager.logFilteredMessage(messageStr, "info");
          return "";
        }
        const transformedMessage =
          editorNotificationManager.transformMessage(messageStr);
        return originalToast.loading(transformedMessage, options);
      } catch (error) {
        console.warn("خطأ في toast.loading:", error);
        return originalToast.loading(message, options);
      }
    };

    // استعادة الدوال الأصلية عند إلغاء التحميل
    return () => {
      toast.success = originalToast.success;
      toast.error = originalToast.error;
      toast.loading = originalToast.loading;
    };
  }, []);

  return (
    <Toaster
      position="top-center"
      reverseOrder={false}
      toastOptions={{
        duration: 4000,
        style: {
          direction: "rtl",
          fontFamily: "var(--font-ibm-plex-arabic), Arial, sans-serif",
        },
        success: {
          style: {
            background: "#10b981",
            color: "white",
          },
        },
        error: {
          style: {
            background: "#ef4444",
            color: "white",
          },
        },
      }}
    />
  );
}
