"use client";

import dynamic from "next/dynamic";

// تحميل ديناميكي لمكون مراقبة قاعدة البيانات لتجنب مشاكل الهيدرو
const DatabaseMonitoringWidget = dynamic(
  () => import("../database-monitoring-widget"),
  {
    ssr: false,
    loading: () => null,
  }
);

export default function DatabaseMonitoringClient() {
  return <DatabaseMonitoringWidget />;
}
