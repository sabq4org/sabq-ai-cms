"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import DatabaseStatusMonitor from "./database-status-monitor";
import SystemAlert from "./system-alert";

/**
 * مكون لمراقبة قاعدة البيانات وعرض تنبيه عند حدوث مشكلة
 */
export default function DatabaseMonitoringWidget() {
  const router = useRouter();
  const [showAlert, setShowAlert] = useState(false);
  const [hasCheckedInitially, setHasCheckedInitially] = useState(false);

  // التعامل مع تغييرات حالة قاعدة البيانات
  const handleStatusChange = (isConnected: boolean) => {
    if (hasCheckedInitially) {
      setShowAlert(!isConnected);
    }
  };

  // إعداد الفحص الأولي
  useEffect(() => {
    const checkInitialStatus = async () => {
      try {
        const response = await fetch("/api/db-status", { cache: "no-store" });
        const data = await response.json();

        if (!data.success) {
          setShowAlert(true);
        }
      } catch (error) {
        console.error("خطأ في التحقق الأولي من قاعدة البيانات:", error);
        setShowAlert(true);
      } finally {
        setHasCheckedInitially(true);
      }
    };

    checkInitialStatus();
  }, []);

  return (
    <>
      {/* مراقب حالة قاعدة البيانات */}
      <DatabaseStatusMonitor
        checkIntervalSeconds={30}
        onStatusChange={handleStatusChange}
        showIndicator={false}
      />

      {/* تنبيه عند وجود مشكلة */}
      {showAlert && (
        <div className="container mx-auto px-4 mt-4">
          <SystemAlert
            type="error"
            title="مشكلة في الاتصال بقاعدة البيانات"
            message="هناك مشكلة في الاتصال بقاعدة البيانات. بعض الميزات قد لا تعمل بشكل صحيح. يرجى التحقق من حالة الاتصال أو الرجوع لاحقًا."
            dismissible={true}
            actionText="الذهاب إلى صفحة الطوارئ"
            actionLink="/emergency"
            onClose={() => setShowAlert(false)}
          />
        </div>
      )}
    </>
  );
}
